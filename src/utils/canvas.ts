import { AspectRatioType, FilterPreset, PlacedSticker } from '../types';
import { getCssFilterString } from '../data/filters';

export interface CropRect {
  sx: number;
  sy: number;
  sw: number;
  sh: number;
  targetWidth: number;
  targetHeight: number;
}

export function calculateCropRect(
  videoWidth: number,
  videoHeight: number,
  aspectRatio: AspectRatioType
): CropRect {
  let targetRatio: number;

  switch (aspectRatio) {
    case '3x4':
      targetRatio = 3 / 4; // 0.75
      break;
    case '1x1':
      targetRatio = 1;
      break;
    case '4x3':
      targetRatio = 4 / 3;
      break;
    case '16x9':
      targetRatio = 16 / 9;
      break;
    case 'strip':
      targetRatio = 1 / 3; // tall strip
      break;
    default:
      targetRatio = 3 / 4;
  }

  const currentRatio = videoWidth / videoHeight;
  let sw: number;
  let sh: number;
  let sx: number;
  let sy: number;

  if (currentRatio > targetRatio) {
    // Video is wider than target ratio: crop horizontally
    sh = videoHeight;
    sw = videoHeight * targetRatio;
    sx = (videoWidth - sw) / 2;
    sy = 0;
  } else {
    // Video is taller than target ratio: crop vertically
    sw = videoWidth;
    sh = videoWidth / targetRatio;
    sx = 0;
    sy = (videoHeight - sh) / 2;
  }

  // Set high quality target dimension
  let targetWidth = 900;
  let targetHeight = Math.round(targetWidth / targetRatio);

  if (aspectRatio === '3x4') {
    targetWidth = 900;
    targetHeight = 1200; // standard crisp 300dpi 3x4 portrait
  } else if (aspectRatio === 'strip') {
    targetWidth = 600;
    targetHeight = 1800;
  }

  return { sx, sy, sw, sh, targetWidth, targetHeight };
}

export function captureFrameToDataUrl(
  video: HTMLVideoElement | HTMLImageElement,
  aspectRatio: AspectRatioType,
  filter: FilterPreset,
  manualBrightness: number,
  manualContrast: number,
  stickers: PlacedSticker[],
  isMirrored: boolean = true
): string {
  const isVideo = video instanceof HTMLVideoElement;
  const sourceWidth = isVideo ? video.videoWidth : (video as HTMLImageElement).naturalWidth;
  const sourceHeight = isVideo ? video.videoHeight : (video as HTMLImageElement).naturalHeight;

  if (!sourceWidth || !sourceHeight) {
    return '';
  }

  const crop = calculateCropRect(sourceWidth, sourceHeight, aspectRatio);
  const canvas = document.createElement('canvas');
  canvas.width = crop.targetWidth;
  canvas.height = crop.targetHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // 1. Draw background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 2. Setup mirror & filters
  ctx.save();
  if (isMirrored) {
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
  }

  // Apply filter
  const filterString = getCssFilterString(filter, manualBrightness, manualContrast);
  try {
    ctx.filter = filterString;
  } catch {
    // fallback if ctx.filter is unsupported
  }

  // Draw cropped frame
  ctx.drawImage(
    video,
    crop.sx,
    crop.sy,
    crop.sw,
    crop.sh,
    0,
    0,
    canvas.width,
    canvas.height
  );
  ctx.restore();

  // Reset filter for stickers and overlays
  ctx.filter = 'none';

  // 3. Render Stickers
  for (const sticker of stickers) {
    const posX = (sticker.x / 100) * canvas.width;
    const posY = (sticker.y / 100) * canvas.height;
    const baseSize = (canvas.width * 0.18) * (sticker.scale || 1);

    ctx.save();
    ctx.translate(posX, posY);
    ctx.rotate((sticker.rotation * Math.PI) / 180);

    if (sticker.type === 'stamp') {
      // Draw authentic rubber stamp / badge box
      ctx.font = `bold ${Math.round(baseSize * 0.4)}px 'Plus Jakarta Sans', monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const text = sticker.content;
      const metrics = ctx.measureText(text);
      const padX = baseSize * 0.3;
      const padY = baseSize * 0.18;
      const boxW = metrics.width + padX * 2;
      const boxH = baseSize * 0.6;

      ctx.strokeStyle = sticker.color || '#059669';
      ctx.lineWidth = Math.max(3, baseSize * 0.05);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fillRect(-boxW / 2, -boxH / 2, boxW, boxH);
      ctx.strokeRect(-boxW / 2, -boxH / 2, boxW, boxH);

      ctx.fillStyle = sticker.color || '#059669';
      ctx.fillText(text, 0, 0);
    } else {
      // Draw Emoji
      ctx.font = `${Math.round(baseSize)}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(sticker.content, 0, 0);
    }

    ctx.restore();
  }

  return canvas.toDataURL('image/jpeg', 0.95);
}

// Generates a standard printable sheet with 6 or 8 copies of the 3x4 photo with crop lines
export function generatePrintableSheet3x4(photoDataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // 10x15 cm sheet at 300 DPI = 1200 x 1800 px
      const sheet = document.createElement('canvas');
      sheet.width = 1800;
      sheet.height = 1200;
      const ctx = sheet.getContext('2d');
      if (!ctx) {
        resolve(photoDataUrl);
        return;
      }

      // White photo paper background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, sheet.width, sheet.height);

      // Header title
      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('autophoto • Cartela 3x4 para Documentos (Papel 10x15cm)', 80, 50);

      // We fit 6 photos (2 rows of 3, or 2 rows of 4)
      // 3x4 proportion: width = 360, height = 480
      const photoW = 420;
      const photoH = 560;
      const startX = 140;
      const startY = 80;
      const gapX = 120;
      const gapY = 40;

      for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 3; col++) {
          const x = startX + col * (photoW + gapX);
          const y = startY + row * (photoH + gapY);

          // Draw photo
          ctx.drawImage(img, x, y, photoW, photoH);

          // Thin cutting guide lines
          ctx.strokeStyle = '#cbd5e1';
          ctx.lineWidth = 1;
          ctx.strokeRect(x, y, photoW, photoH);

          // Corner crop crosshairs
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 1.5;
          const markLen = 14;
          // top-left
          ctx.beginPath();
          ctx.moveTo(x - 8, y);
          ctx.lineTo(x - 8 - markLen, y);
          ctx.moveTo(x, y - 8);
          ctx.lineTo(x, y - 8 - markLen);
          // bottom-right
          ctx.moveTo(x + photoW + 8, y + photoH);
          ctx.lineTo(x + photoW + 8 + markLen, y + photoH);
          ctx.moveTo(x + photoW, y + photoH + 8);
          ctx.lineTo(x + photoW, y + photoH + 8 + markLen);
          ctx.stroke();
        }
      }

      resolve(sheet.toDataURL('image/jpeg', 0.96));
    };
    img.src = photoDataUrl;
  });
}
