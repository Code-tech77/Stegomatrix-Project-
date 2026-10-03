import { computeCRC32, decryptPayload, encryptPayload } from './crypto';

export interface FilePayloadInfo {
  name: string;
  mimeType: string;
  data: Uint8Array;
}

export interface EmbedOptions {
  message?: string;
  file?: FilePayloadInfo;
  password?: string;
  bitDepth?: number; // 1 to 4 bits per channel
}

export interface EmbedResult {
  stegoImageData: ImageData;
  stegoDataUrl: string;
  capacityBytes: number;
  usedBytes: number;
  usagePercentage: number;
  crc32: number;
  isEncrypted: boolean;
  bitDepth: number;
  payloadType: 'text' | 'file';
}

export interface ExtractResult {
  message?: string;
  fileInfo?: {
    name: string;
    mimeType: string;
    data: Uint8Array;
    dataUrl: string;
    sizeBytes: number;
  };
  payloadType: 'text' | 'file';
  isEncrypted: boolean;
  crc32: number;
  crcVerified: boolean;
  bitDepth: number;
  timestamp: string;
}

const MAGIC_BYTES = new Uint8Array([0x53, 0x54, 0x45, 0x47]); // 'STEG'
const MIN_HEADER_SIZE = 13; // 4 magic + 1 flags + 4 length + 4 crc

/**
 * Calculates max storage capacity of an image in bytes
 */
export function calculateCapacity(width: number, height: number, bitDepth: number = 1, isEncrypted: boolean = false): number {
  const totalPixels = width * height;
  const totalChannels = totalPixels * 3; // RGB channels
  const totalBits = totalChannels * bitDepth;
  const totalBytes = Math.floor(totalBits / 8);
  const overhead = MIN_HEADER_SIZE + (isEncrypted ? 28 : 0); // 16 salt + 12 iv
  return Math.max(0, totalBytes - overhead);
}

/**
 * Serializes file metadata + file binary data into a single Uint8Array
 */
export function serializeFilePayload(file: FilePayloadInfo): Uint8Array {
  const encoder = new TextEncoder();
  const nameBytes = encoder.encode(file.name);
  const mimeBytes = encoder.encode(file.mimeType || 'application/octet-stream');

  const metaHeader = new Uint8Array(2 + nameBytes.length + 2 + mimeBytes.length);
  const view = new DataView(metaHeader.buffer);
  
  view.setUint16(0, nameBytes.length, false);
  metaHeader.set(nameBytes, 2);

  const offsetMime = 2 + nameBytes.length;
  view.setUint16(offsetMime, mimeBytes.length, false);
  metaHeader.set(mimeBytes, offsetMime + 2);

  const totalLength = metaHeader.length + file.data.length;
  const result = new Uint8Array(totalLength);
  result.set(metaHeader, 0);
  result.set(file.data, metaHeader.length);

  return result;
}

/**
 * Deserializes payload back into file metadata and binary content
 */
export function deserializeFilePayload(payload: Uint8Array): { file: FilePayloadInfo } {
  const view = new DataView(payload.buffer, payload.byteOffset, payload.byteLength);
  const nameLen = view.getUint16(0, false);
  const nameBytes = payload.slice(2, 2 + nameLen);
  const decoder = new TextDecoder();
  const name = decoder.decode(nameBytes);

  const offsetMime = 2 + nameLen;
  const mimeLen = view.getUint16(offsetMime, false);
  const mimeBytes = payload.slice(offsetMime + 2, offsetMime + 2 + mimeLen);
  const mimeType = decoder.decode(mimeBytes);

  const dataOffset = offsetMime + 2 + mimeLen;
  const fileData = payload.slice(dataOffset);

  return {
    file: {
      name,
      mimeType,
      data: fileData,
    },
  };
}

/**
 * Embeds text or file into ImageData using LSB steganography
 */
export async function embedMessage(
  coverImageData: ImageData,
  options: EmbedOptions
): Promise<EmbedResult> {
  const { message = '', file, password = '', bitDepth = 1 } = options;
  const isEncrypted = password.trim().length > 0;
  const clampBitDepth = Math.max(1, Math.min(4, bitDepth));
  const isFilePayload = Boolean(file);

  let rawPayload: Uint8Array;
  if (isFilePayload && file) {
    rawPayload = serializeFilePayload(file);
  } else {
    const textEncoder = new TextEncoder();
    rawPayload = textEncoder.encode(message);
  }

  const crc32 = computeCRC32(rawPayload);

  let finalPayload: Uint8Array = rawPayload;
  let salt: Uint8Array = new Uint8Array(0);
  let iv: Uint8Array = new Uint8Array(0);

  if (isEncrypted) {
    const encrypted = await encryptPayload(rawPayload, password);
    finalPayload = encrypted.ciphertext;
    salt = encrypted.salt;
    iv = encrypted.iv;
  }

  // Construct binary packet:
  // [4 magic][1 flag][4 len][4 crc][16 salt?][12 iv?][payload...]
  const headerSize = MIN_HEADER_SIZE + (isEncrypted ? 28 : 0);
  const packetSize = headerSize + finalPayload.length;
  const capacityBytes = calculateCapacity(coverImageData.width, coverImageData.height, clampBitDepth, isEncrypted);

  if (finalPayload.length > capacityBytes) {
    throw new Error(`Payload exceeds image capacity (${finalPayload.length} bytes required, ${capacityBytes} bytes max).`);
  }

  const packet = new Uint8Array(packetSize);
  packet.set(MAGIC_BYTES, 0);

  // Flags: Bit 7 = Encrypted, Bits 4-6 = bitDepth, Bit 3 = isFilePayload, Bits 0-2 = version (1)
  const flags =
    (isEncrypted ? 0x80 : 0x00) |
    ((clampBitDepth & 0x07) << 4) |
    (isFilePayload ? 0x08 : 0x00) |
    0x01;
  packet[4] = flags;

  // Length (32-bit uint)
  const view = new DataView(packet.buffer);
  view.setUint32(5, finalPayload.length, false);
  view.setUint32(9, crc32, false);

  let offset = 13;
  if (isEncrypted) {
    packet.set(salt, offset);
    offset += 16;
    packet.set(iv, offset);
    offset += 12;
  }
  packet.set(finalPayload, offset);

  // Create a copy of original image data
  const stegoData = new ImageData(
    new Uint8ClampedArray(coverImageData.data),
    coverImageData.width,
    coverImageData.height
  );
  const pixels = stegoData.data;

  // Convert packet into bit stream
  let bitPos = 0;
  const totalBitsToEmbed = packet.length * 8;
  const bitMask = (1 << clampBitDepth) - 1;
  const clearMask = ~bitMask & 0xff;

  for (let i = 0; i < pixels.length; i += 4) {
    // Modify R, G, B channels
    for (let c = 0; c < 3; c++) {
      if (bitPos >= totalBitsToEmbed) break;

      // Extract next clampBitDepth bits from packet
      let bitsToEmbed = 0;
      for (let b = 0; b < clampBitDepth; b++) {
        if (bitPos < totalBitsToEmbed) {
          const byteIdx = Math.floor(bitPos / 8);
          const bitIdx = 7 - (bitPos % 8);
          const bitVal = (packet[byteIdx] >> bitIdx) & 1;
          bitsToEmbed = (bitsToEmbed << 1) | bitVal;
          bitPos++;
        }
      }

      // Apply bits into channel LSBs
      const channelIdx = i + c;
      pixels[channelIdx] = (pixels[channelIdx] & clearMask) | bitsToEmbed;
    }
    if (bitPos >= totalBitsToEmbed) break;
  }

  // Convert ImageData to Data URL
  const canvas = document.createElement('canvas');
  canvas.width = coverImageData.width;
  canvas.height = coverImageData.height;
  const ctx = canvas.getContext('2d')!;
  ctx.putImageData(stegoData, 0, 0);
  const stegoDataUrl = canvas.toDataURL('image/png');

  return {
    stegoImageData: stegoData,
    stegoDataUrl,
    capacityBytes,
    usedBytes: finalPayload.length,
    usagePercentage: Math.min(100, Math.round((finalPayload.length / (capacityBytes || 1)) * 100)),
    crc32,
    isEncrypted,
    bitDepth: clampBitDepth,
    payloadType: isFilePayload ? 'file' : 'text',
  };
}

/**
 * Extracts hidden steganography text or file payload from ImageData
 */
export async function extractMessage(
  stegoImageData: ImageData,
  password: string = ''
): Promise<ExtractResult> {
  const pixels = stegoImageData.data;

  // Step 1: Probe header with 1 LSB to 4 LSBs to detect magic header
  let detectedBitDepth = 1;
  let headerPacket: Uint8Array | null = null;
  let isEncrypted = false;
  let isFilePayload = false;
  let payloadLength = 0;
  let expectedCrc32 = 0;

  for (let testDepth = 1; testDepth <= 4; testDepth++) {
    const bitMask = (1 << testDepth) - 1;
    const extractedBytes: number[] = [];
    let currentByte = 0;
    let bitsCollected = 0;

    for (let i = 0; i < pixels.length && extractedBytes.length < MIN_HEADER_SIZE; i += 4) {
      for (let c = 0; c < 3 && extractedBytes.length < MIN_HEADER_SIZE; c++) {
        const val = pixels[i + c] & bitMask;
        for (let b = testDepth - 1; b >= 0; b--) {
          const bitVal = (val >> b) & 1;
          currentByte = (currentByte << 1) | bitVal;
          bitsCollected++;
          if (bitsCollected === 8) {
            extractedBytes.push(currentByte);
            currentByte = 0;
            bitsCollected = 0;
            if (extractedBytes.length >= MIN_HEADER_SIZE) break;
          }
        }
      }
    }

    if (extractedBytes.length >= 4) {
      if (
        extractedBytes[0] === MAGIC_BYTES[0] &&
        extractedBytes[1] === MAGIC_BYTES[1] &&
        extractedBytes[2] === MAGIC_BYTES[2] &&
        extractedBytes[3] === MAGIC_BYTES[3]
      ) {
        detectedBitDepth = testDepth;
        headerPacket = new Uint8Array(extractedBytes);
        break;
      }
    }
  }

  if (!headerPacket) {
    throw new Error('No valid steganography signature found. Image may not contain a hidden message or was saved in a lossy format (JPEG).');
  }

  const flags = headerPacket[4];
  isEncrypted = (flags & 0x80) !== 0;
  isFilePayload = (flags & 0x08) !== 0;

  const view = new DataView(headerPacket.buffer);
  payloadLength = view.getUint32(5, false);
  expectedCrc32 = view.getUint32(9, false);

  if (payloadLength <= 0 || payloadLength > 5000000) {
    throw new Error('Corrupted header data detected.');
  }

  const headerSize = MIN_HEADER_SIZE + (isEncrypted ? 28 : 0);
  const totalPacketSize = headerSize + payloadLength;

  // Extract total packet bits using detectedBitDepth
  const fullPacket = new Uint8Array(totalPacketSize);
  let currentByte = 0;
  let bitsCollected = 0;
  let byteIdx = 0;

  const bitMask = (1 << detectedBitDepth) - 1;

  for (let i = 0; i < pixels.length && byteIdx < totalPacketSize; i += 4) {
    for (let c = 0; c < 3 && byteIdx < totalPacketSize; c++) {
      const val = pixels[i + c] & bitMask;
      for (let b = detectedBitDepth - 1; b >= 0; b--) {
        const bitVal = (val >> b) & 1;
        currentByte = (currentByte << 1) | bitVal;
        bitsCollected++;
        if (bitsCollected === 8) {
          fullPacket[byteIdx++] = currentByte;
          currentByte = 0;
          bitsCollected = 0;
          if (byteIdx >= totalPacketSize) break;
        }
      }
    }
  }

  let offset = MIN_HEADER_SIZE;
  let salt = new Uint8Array(0);
  let iv = new Uint8Array(0);

  if (isEncrypted) {
    salt = fullPacket.slice(offset, offset + 16);
    offset += 16;
    iv = fullPacket.slice(offset, offset + 12);
    offset += 12;
  }

  const payload = fullPacket.slice(offset, offset + payloadLength);
  let rawPayloadBytes: Uint8Array = payload;

  if (isEncrypted) {
    if (!password) {
      throw new Error('This message/file is encrypted with AES-256. Password is required.');
    }
    try {
      rawPayloadBytes = await decryptPayload(payload, password, salt, iv);
    } catch {
      throw new Error('Decryption failed. Invalid password or corrupted payload.');
    }
  }

  const actualCrc32 = computeCRC32(rawPayloadBytes);

  if (isFilePayload) {
    const { file } = deserializeFilePayload(rawPayloadBytes);
    // Create Blob Data URL for download / preview
    const blob = new Blob([file.data], { type: file.mimeType || 'application/octet-stream' });
    const dataUrl = URL.createObjectURL(blob);

    return {
      payloadType: 'file',
      fileInfo: {
        name: file.name,
        mimeType: file.mimeType,
        data: file.data,
        dataUrl,
        sizeBytes: file.data.length,
      },
      isEncrypted,
      crc32: actualCrc32,
      crcVerified: actualCrc32 === expectedCrc32,
      bitDepth: detectedBitDepth,
      timestamp: new Date().toLocaleTimeString(),
    };
  }

  const decoder = new TextDecoder();
  const message = decoder.decode(rawPayloadBytes);

  return {
    payloadType: 'text',
    message,
    isEncrypted,
    crc32: actualCrc32,
    crcVerified: actualCrc32 === expectedCrc32,
    bitDepth: detectedBitDepth,
    timestamp: new Date().toLocaleTimeString(),
  };
}

/**
 * Generates an exaggerated RGB difference heatmap image
 */
export function generateDifferenceHeatmap(
  originalData: ImageData,
  stegoData: ImageData
): ImageData {
  const width = originalData.width;
  const height = originalData.height;
  const heatmap = new ImageData(width, height);

  const orig = originalData.data;
  const stego = stegoData.data;
  const out = heatmap.data;

  for (let i = 0; i < orig.length; i += 4) {
    const diffR = Math.abs(orig[i] - stego[i]);
    const diffG = Math.abs(orig[i + 1] - stego[i + 1]);
    const diffB = Math.abs(orig[i + 2] - stego[i + 2]);
    const totalDiff = diffR + diffG + diffB;

    if (totalDiff > 0) {
      // Highlight pixel modifications in bright neon cyan/magenta
      out[i] = 255;     // R
      out[i + 1] = 0;   // G
      out[i + 2] = 127; // B
      out[i + 3] = 255; // Alpha
    } else {
      // Darkened background for non-modified pixels
      out[i] = Math.floor(orig[i] * 0.15);
      out[i + 1] = Math.floor(orig[i + 1] * 0.15);
      out[i + 2] = Math.floor(orig[i + 2] * 0.15);
      out[i + 3] = 255;
    }
  }

  return heatmap;
}

/**
 * Extracts a specific bit plane (0 to 7) for analysis
 */
export function extractBitPlane(
  imageData: ImageData,
  channel: 'red' | 'green' | 'blue' | 'gray',
  bitIndex: number
): ImageData {
  const width = imageData.width;
  const height = imageData.height;
  const bitImageData = new ImageData(width, height);

  const src = imageData.data;
  const dst = bitImageData.data;

  for (let i = 0; i < src.length; i += 4) {
    let val = 0;
    if (channel === 'red') val = src[i];
    else if (channel === 'green') val = src[i + 1];
    else if (channel === 'blue') val = src[i + 2];
    else val = Math.round(src[i] * 0.299 + src[i + 1] * 0.587 + src[i + 2] * 0.114);

    const bit = (val >> bitIndex) & 1;
    const pixelVal = bit ? 255 : 0;

    dst[i] = pixelVal;
    dst[i + 1] = pixelVal;
    dst[i + 2] = pixelVal;
    dst[i + 3] = 255;
  }

  return bitImageData;
}
