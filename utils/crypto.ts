/**
 * Cryptographic helper module using browser native Web Crypto API and CRC32 algorithm.
 */

// CRC32 Table lookup for fast calculation
const CRC32_TABLE = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let j = 0; j < 8; j++) {
    c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
  }
  CRC32_TABLE[i] = c;
}

export function computeCRC32(data: Uint8Array): number {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < data.length; i++) {
    crc = (crc >>> 8) ^ CRC32_TABLE[(crc ^ data[i]) & 0xFF];
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

/**
 * Derives AES-256 key from passphrase using PBKDF2
 */
async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt.buffer as ArrayBuffer,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts raw payload bytes using AES-256-GCM with PBKDF2 derived key.
 * Returns { ciphertext, salt, iv }
 */
export async function encryptPayload(
  payloadBytes: Uint8Array,
  passphrase: string
): Promise<{ ciphertext: Uint8Array; salt: Uint8Array; iv: Uint8Array }> {
  const salt = new Uint8Array(crypto.getRandomValues(new Uint8Array(16)));
  const iv = new Uint8Array(crypto.getRandomValues(new Uint8Array(12)));
  const key = await deriveKey(passphrase, salt);

  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv.buffer as ArrayBuffer },
    key,
    payloadBytes.buffer as ArrayBuffer
  );

  return {
    ciphertext: new Uint8Array(encryptedBuffer),
    salt,
    iv,
  };
}

/**
 * Decrypts AES-256-GCM ciphertext.
 * Throws error if key is invalid or data corrupted.
 */
export async function decryptPayload(
  ciphertext: Uint8Array,
  passphrase: string,
  salt: Uint8Array,
  iv: Uint8Array
): Promise<Uint8Array> {
  const key = await deriveKey(passphrase, salt);
  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv.buffer as ArrayBuffer },
    key,
    ciphertext.buffer as ArrayBuffer
  );

  return new Uint8Array(decryptedBuffer);
}
