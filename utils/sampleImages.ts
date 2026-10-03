import { embedMessage } from './stegoEngine';

/**
 * Creates a synthetic cover canvas image with rich cyberpunk gradients and shapes.
 * Returns ImageData and DataUrl.
 */
export function createSyntheticCoverImage(width: number = 400, height: number = 400): {
  imageData: ImageData;
  dataUrl: string;
} {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Background gradient
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, '#0a0d1d');
  bgGrad.addColorStop(0.5, '#161b36');
  bgGrad.addColorStop(1, '#050711');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Geometric glowing circles & shapes
  const circleGrad = ctx.createRadialGradient(width * 0.4, height * 0.4, 10, width * 0.4, height * 0.4, width * 0.4);
  circleGrad.addColorStop(0, 'rgba(0, 240, 255, 0.8)');
  circleGrad.addColorStop(0.5, 'rgba(138, 43, 226, 0.4)');
  circleGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = circleGrad;
  ctx.beginPath();
  ctx.arc(width * 0.4, height * 0.4, width * 0.35, 0, Math.PI * 2);
  ctx.fill();

  const magentaGrad = ctx.createRadialGradient(width * 0.7, height * 0.7, 5, width * 0.7, height * 0.7, width * 0.3);
  magentaGrad.addColorStop(0, 'rgba(255, 0, 127, 0.7)');
  magentaGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = magentaGrad;
  ctx.beginPath();
  ctx.arc(width * 0.7, height * 0.7, width * 0.25, 0, Math.PI * 2);
  ctx.fill();

  // Grid pattern
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.15)';
  ctx.lineWidth = 1;
  const step = 20;
  for (let x = 0; x < width; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Text watermark branding
  ctx.font = 'bold 22px Inter, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.fillText('ARITHMATRIX STEGO', width / 2, height / 2 - 10);

  ctx.font = '13px monospace';
  ctx.fillStyle = 'rgba(0, 240, 255, 0.9)';
  ctx.fillText('SECURITY TEST COVER IMAGE', width / 2, height / 2 + 16);

  const imageData = ctx.getImageData(0, 0, width, height);
  const dataUrl = canvas.toDataURL('image/png');

  return { imageData, dataUrl };
}

/**
 * Pre-generates sample Cover & Stego image pair for 1-click proof testing
 */
export async function getSampleStegoPair(): Promise<{
  coverImageData: ImageData;
  coverDataUrl: string;
  stegoImageData: ImageData;
  stegoDataUrl: string;
  sampleMessage: string;
  bitDepth: number;
}> {
  const sampleMessage = "Arithmatrix Internship Challenge 2026: Steganography LSB Payload Successfully Embedded and Extracted!";
  const { imageData: coverImageData, dataUrl: coverDataUrl } = createSyntheticCoverImage(360, 360);

  const embedRes = await embedMessage(coverImageData, {
    message: sampleMessage,
    bitDepth: 1,
  });

  return {
    coverImageData,
    coverDataUrl,
    stegoImageData: embedRes.stegoImageData,
    stegoDataUrl: embedRes.stegoDataUrl,
    sampleMessage,
    bitDepth: 1,
  };
}
