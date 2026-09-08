// Background removal & White background generator for portrait & 3x4 photos
// High-performance session-based segmentation with real-time contour adjustment

declare global {
  interface Window {
    SelfieSegmentation?: any;
  }
}

export interface SegmentationSession {
  img: HTMLImageElement;
  width: number;
  height: number;
  rawMask: Uint8Array; // 0 to 255 probability of person/foreground for every pixel
  method: 'neural_mediapipe' | 'contour_adaptive';
}

export interface RenderCutoutOptions {
  sensitivity?: number; // 10 to 90, default 50 (higher = captures more hair/details, lower = cuts stricter)
  feather?: number; // 0 to 8px, default 3 (softness of edge transition)
  edgeShift?: number; // -3 to +3px, default 0 (negative = shrink mask inwards to eat background halos, positive = expand)
  backgroundColor?: string; // default '#FFFFFF'
}

export interface BackgroundRemovalResult {
  dataUrl: string;
  session: SegmentationSession;
  method: 'neural_mediapipe' | 'contour_adaptive';
}

let selfieSegmentationInstance: any = null;
let isInitializing = false;

/**
 * Dynamically ensures the MediaPipe SelfieSegmentation model is loaded
 */
async function getSelfieSegmentationModel(): Promise<any> {
  if (selfieSegmentationInstance) {
    return selfieSegmentationInstance;
  }

  if (typeof window !== 'undefined' && window.SelfieSegmentation) {
    try {
      const model = new window.SelfieSegmentation({
        locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`,
      });
      model.setOptions({
        modelSelection: 1, // 1 = landscape/accurate portrait model
        selfieMode: false,
      });
      await model.initialize();
      selfieSegmentationInstance = model;
      return model;
    } catch (e) {
      console.warn('Failed to initialize SelfieSegmentation from window:', e);
    }
  }

  if (typeof window !== 'undefined' && !window.SelfieSegmentation && !isInitializing) {
    isInitializing = true;
    try {
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/selfie_segmentation.js';
        script.crossOrigin = 'anonymous';
        script.onload = () => resolve();
        script.onerror = (err) => reject(err);
        document.head.appendChild(script);
      });

      if (window.SelfieSegmentation) {
        const model = new window.SelfieSegmentation({
          locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`,
        });
        model.setOptions({
          modelSelection: 1,
          selfieMode: false,
        });
        await model.initialize();
        selfieSegmentationInstance = model;
        return model;
      }
    } catch (err) {
      console.warn('Could not dynamically load MediaPipe script, using fallback contour algorithm:', err);
    } finally {
      isInitializing = false;
    }
  }

  return null;
}

/**
 * Creates or retrieves a segmentation session with raw probability mask
 */
export async function createSegmentationSession(imageDataUrl: string): Promise<SegmentationSession> {
  const img = await loadImage(imageDataUrl);
  const width = img.naturalWidth || 900;
  const height = img.naturalHeight || 1200;

  // 1. Try MediaPipe Neural segmentation
  try {
    const model = await getSelfieSegmentationModel();
    if (model) {
      const rawMask = await extractMediaPipeMask(model, img, width, height);
      if (rawMask) {
        return {
          img,
          width,
          height,
          rawMask,
          method: 'neural_mediapipe',
        };
      }
    }
  } catch (err) {
    console.warn('MediaPipe segmentation error, falling back to adaptive contour detection:', err);
  }

  // 2. Fallback: Adaptive contour detection
  const rawMask = extractAdaptiveContourMask(img, width, height);
  return {
    img,
    width,
    height,
    rawMask,
    method: 'contour_adaptive',
  };
}

/**
 * Extracts raw 0-255 probability mask from MediaPipe SelfieSegmentation.
 * Accurately senses whether the confidence is in the Red or Alpha channel.
 */
function extractMediaPipeMask(
  model: any,
  img: HTMLImageElement,
  width: number,
  height: number
): Promise<Uint8Array | null> {
  return new Promise((resolve) => {
    let settled = false;
    let timeout = setTimeout(() => {
      if (!settled) {
        settled = true;
        resolve(null);
      }
    }, 4500);

    model.onResults((results: any) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);

      if (!results || !results.segmentationMask) {
        resolve(null);
        return;
      }

      try {
        const maskCanvas = document.createElement('canvas');
        maskCanvas.width = width;
        maskCanvas.height = height;
        const mCtx = maskCanvas.getContext('2d', { willReadFrequently: true });
        if (!mCtx) {
          resolve(null);
          return;
        }

        mCtx.drawImage(results.segmentationMask, 0, 0, width, height);
        const maskImgData = mCtx.getImageData(0, 0, width, height);
        const data = maskImgData.data;
        const totalPixels = width * height;
        const rawMask = new Uint8Array(totalPixels);

        // Detect whether confidence varies in Red or Alpha channel
        let minR = 255, maxR = 0;
        let minA = 255, maxA = 0;
        const checkCount = Math.min(totalPixels, 4000);
        for (let i = 0; i < checkCount; i++) {
          const r = data[i * 4];
          const a = data[i * 4 + 3];
          if (r < minR) minR = r;
          if (r > maxR) maxR = r;
          if (a < minA) minA = a;
          if (a > maxA) maxA = a;
        }

        const rRange = maxR - minR;
        const aRange = maxA - minA;
        // If alpha varies and red doesn't, use alpha; otherwise use red channel
        const useAlpha = aRange > 20 && aRange > rRange;

        for (let i = 0; i < totalPixels; i++) {
          rawMask[i] = useAlpha ? data[i * 4 + 3] : data[i * 4];
        }

        resolve(rawMask);
      } catch (e) {
        console.error('Error reading MediaPipe segmentation mask pixels:', e);
        resolve(null);
      }
    });

    try {
      model.send({ image: img });
    } catch (e) {
      if (!settled) {
        settled = true;
        clearTimeout(timeout);
        resolve(null);
      }
    }
  });
}

/**
 * Adaptive contour & border-distance segmentation for portrait photos.
 * Populates raw probability mask (0 to 255).
 */
function extractAdaptiveContourMask(
  img: HTMLImageElement,
  width: number,
  height: number
): Uint8Array {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const rawMask = new Uint8Array(width * height);
  if (!ctx) return rawMask.fill(255);

  ctx.drawImage(img, 0, 0, width, height);
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  // Sample border corners to establish background color model
  const samples: [number, number, number][] = [];
  const sampleSteps = 30;

  for (let i = 0; i < sampleSteps; i++) {
    const x = Math.floor((i / sampleSteps) * width);
    // Top border
    const idxTop = x * 4;
    samples.push([data[idxTop], data[idxTop + 1], data[idxTop + 2]]);

    // Left border upper section (top 45%)
    const ySide = Math.floor((i / sampleSteps) * (height * 0.45));
    const idxLeft = (ySide * width) * 4;
    samples.push([data[idxLeft], data[idxLeft + 1], data[idxLeft + 2]]);

    // Right border upper section
    const idxRight = (ySide * width + (width - 1)) * 4;
    samples.push([data[idxRight], data[idxRight + 1], data[idxRight + 2]]);
  }

  let sumR = 0, sumG = 0, sumB = 0;
  for (const s of samples) {
    sumR += s[0];
    sumG += s[1];
    sumB += s[2];
  }
  const avgR = sumR / samples.length;
  const avgG = sumG / samples.length;
  const avgB = sumB / samples.length;

  const baseThreshold = 42;

  // Portrait center protection zone
  const centerX = width / 2;
  const centerY = height * 0.52;
  const radiusX = width * 0.36;
  const radiusY = height * 0.44;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      const idx = i * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      const colorDist = Math.sqrt(
        Math.pow(r - avgR, 2) +
        Math.pow(g - avgG, 2) +
        Math.pow(b - avgB, 2)
      );

      const normalizedDist =
        Math.pow((x - centerX) / radiusX, 2) +
        Math.pow((y - centerY) / radiusY, 2);

      const borderFactor = Math.max(0, 1 - Math.min(x, width - x, y) / (width * 0.22));

      let confidence = 0;
      if (normalizedDist < 0.55) {
        // Face center is firmly person
        confidence = 255;
      } else if (borderFactor > 0.6 && colorDist < baseThreshold * 1.5 && y < height * 0.4) {
        // Top corners matching background color = background
        confidence = 0;
      } else if (colorDist < baseThreshold && normalizedDist > 1.1) {
        confidence = 0;
      } else {
        const colorFactor = Math.min(1, colorDist / (baseThreshold * 1.8));
        const posFactor = Math.min(1, Math.max(0, 1.4 - normalizedDist));
        confidence = Math.round(Math.min(255, Math.max(0, (colorFactor * 0.65 + posFactor * 0.35) * 255)));
      }

      rawMask[i] = confidence;
    }
  }

  return rawMask;
}

/**
 * Ultra-fast direct memory ImageData compositor.
 * Recalculates and blends person over pure white in ~8ms with zero compositing glitches.
 */
export function renderSegmentedCutout(
  session: SegmentationSession,
  options: RenderCutoutOptions = {}
): string {
  const {
    sensitivity = 50,
    feather = 3,
    edgeShift = 0,
    backgroundColor = '#FFFFFF',
  } = options;

  const { img, width, height, rawMask } = session;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return img.src;

  // Extract source image pixels
  const srcCanvas = document.createElement('canvas');
  srcCanvas.width = width;
  srcCanvas.height = height;
  const srcCtx = srcCanvas.getContext('2d');
  if (!srcCtx) return img.src;
  srcCtx.drawImage(img, 0, 0, width, height);
  const srcImgData = srcCtx.getImageData(0, 0, width, height);
  const srcData = srcImgData.data;

  // Parse target background color (default #FFFFFF)
  let bgR = 255, bgG = 255, bgB = 255;
  if (backgroundColor && backgroundColor.startsWith('#') && backgroundColor.length === 7) {
    bgR = parseInt(backgroundColor.slice(1, 3), 16);
    bgG = parseInt(backgroundColor.slice(3, 5), 16);
    bgB = parseInt(backgroundColor.slice(5, 7), 16);
  }

  // Create output buffer
  const outImgData = ctx.createImageData(width, height);
  const outData = outImgData.data;

  // Calculate dynamic threshold cutoff
  // sensitivity: 10 (strict cutoff = ~230) -> 90 (lenient cutoff = ~25)
  const baseCutoff = (100 - sensitivity) * 2.55;
  // edgeShift: -3 to +3 (negative shrinks mask inwards, positive expands)
  const cutoff = Math.max(5, Math.min(250, baseCutoff - edgeShift * 22));

  // Transition smoothness ramp based on feather radius
  const ramp = Math.max(4, feather * 5.5 + 4);

  const totalPixels = width * height;
  for (let i = 0; i < totalPixels; i++) {
    const val = rawMask[i];
    const diff = val - cutoff;
    let personAlpha = 0;

    if (diff >= ramp) {
      personAlpha = 1;
    } else if (diff <= -ramp) {
      personAlpha = 0;
    } else {
      personAlpha = (diff + ramp) / (ramp * 2);
    }

    const idx = i * 4;
    if (personAlpha >= 0.99) {
      outData[idx] = srcData[idx];
      outData[idx + 1] = srcData[idx + 1];
      outData[idx + 2] = srcData[idx + 2];
      outData[idx + 3] = 255;
    } else if (personAlpha <= 0.01) {
      outData[idx] = bgR;
      outData[idx + 1] = bgG;
      outData[idx + 2] = bgB;
      outData[idx + 3] = 255;
    } else {
      // Smooth alpha blend between person pixel and pure white
      const inv = 1 - personAlpha;
      outData[idx] = Math.round(srcData[idx] * personAlpha + bgR * inv);
      outData[idx + 1] = Math.round(srcData[idx + 1] * personAlpha + bgG * inv);
      outData[idx + 2] = Math.round(srcData[idx + 2] * personAlpha + bgB * inv);
      outData[idx + 3] = 255;
    }
  }

  ctx.putImageData(outImgData, 0, 0);
  return canvas.toDataURL('image/jpeg', 0.95);
}

/**
 * Convenience wrapper: creates session and returns initial rendered white-background photo
 */
export async function removeBackgroundToWhite(
  imageDataUrl: string,
  options: RenderCutoutOptions = {}
): Promise<BackgroundRemovalResult> {
  const session = await createSegmentationSession(imageDataUrl);
  const dataUrl = renderSegmentedCutout(session, options);

  return {
    dataUrl,
    session,
    method: session.method,
  };
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}
