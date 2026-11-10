/**
 * Client-Side Image Compression & Resizing Utility (Canvas API)
 * 
 * Provides production-grade client-side image optimization:
 * - High-efficiency modern formats (WebP with automatic JPEG fallback)
 * - Multi-step bilinear downsampling to eliminate aliasing and preserve crisp text/details
 * - Configurable dimensions, aspect ratio bounding, and quality presets
 * - Iterative target file size optimization (optional `targetMaxSizeBytes`)
 * - Batch processing and URL-to-compressed image conversions
 * - Zero external dependencies, pure native browser Canvas API
 */

export type ImageOutputFormat = 'image/webp' | 'image/jpeg' | 'auto';
export type CompressionPreset = 'ultra' | 'balanced' | 'speed';

export interface CompressionOptions {
  /** Maximum width in pixels (default: 1600) */
  maxWidth?: number;
  /** Maximum height in pixels (default: 1000) */
  maxHeight?: number;
  /** Quality from 0.1 to 1.0 (default: 0.82) */
  quality?: number;
  /** Output MIME type ('image/webp', 'image/jpeg', or 'auto') */
  mimeType?: ImageOutputFormat;
  /** Pre-configured optimization presets */
  preset?: CompressionPreset;
  /** Optional target max file size in bytes (e.g. 300 * 1024 for 300KB) */
  targetMaxSizeBytes?: number;
  /** Minimum acceptable quality if targetMaxSizeBytes is used (default: 0.55) */
  minQuality?: number;
  /** Whether to retain transparency for PNG/WebP (default: false, replaces alpha with white if JPEG) */
  preserveAlpha?: boolean;
}

export interface CompressedImageResult {
  /** The optimized File object ready for FormData upload */
  file: File;
  /** The optimized Blob */
  blob: Blob;
  /** Base64 Data URL for immediate local preview without network roundtrip */
  dataUrl: string;
  /** Original file size in bytes */
  originalSize: number;
  /** Optimized file size in bytes */
  compressedSize: number;
  /** Percentage of size reduction (0 - 100) */
  reductionPercent: number;
  /** Output image width in pixels */
  width: number;
  /** Output image height in pixels */
  height: number;
  /** Output MIME type (e.g. 'image/webp') */
  mimeType: string;
  /** Clean generated file name */
  fileName: string;
}

/**
 * Human-readable byte formatting (e.g. 1.2 Mo, 340 Ko)
 */
export function formatBytes(bytes: number, decimals: number = 1): string {
  if (bytes === 0) return '0 Octet';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Octets', 'Ko', 'Mo', 'Go'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Calculates new dimensions that fit within maxWidth and maxHeight
 * while strictly preserving the original aspect ratio.
 */
export function calculateAspectRatioFit(
  srcWidth: number,
  srcHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  if (srcWidth <= maxWidth && srcHeight <= maxHeight) {
    return { width: Math.round(srcWidth), height: Math.round(srcHeight) };
  }

  const ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
  return {
    width: Math.max(1, Math.round(srcWidth * ratio)),
    height: Math.max(1, Math.round(srcHeight * ratio)),
  };
}

/**
 * Tests whether the current browser supports WebP canvas encoding.
 */
export function isWebPSupported(): boolean {
  if (typeof document === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  } catch {
    return false;
  }
}

/**
 * Multi-step stepped downsampling:
 * Resizing directly from 4000px down to 1000px in one pass can cause aliasing/shimmering.
 * Stepping down in halves produces smooth, studio-quality anti-aliasing.
 */
function drawWithSteppedDownsampling(
  source: CanvasImageSource,
  sourceWidth: number,
  sourceHeight: number,
  targetWidth: number,
  targetHeight: number
): HTMLCanvasElement {
  let curWidth = sourceWidth;
  let curHeight = sourceHeight;

  let canvas = document.createElement('canvas');
  canvas.width = curWidth;
  canvas.height = curHeight;

  let ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Impossible d’initialiser le contexte Canvas 2D');

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(source, 0, 0, curWidth, curHeight);

  // Halve dimensions in steps until reaching ~target dimensions
  while (curWidth * 0.5 > targetWidth && curHeight * 0.5 > targetHeight) {
    curWidth = Math.round(curWidth * 0.5);
    curHeight = Math.round(curHeight * 0.5);

    const stepCanvas = document.createElement('canvas');
    stepCanvas.width = curWidth;
    stepCanvas.height = curHeight;

    const stepCtx = stepCanvas.getContext('2d');
    if (!stepCtx) break;

    stepCtx.imageSmoothingEnabled = true;
    stepCtx.imageSmoothingQuality = 'high';
    stepCtx.drawImage(canvas, 0, 0, curWidth, curHeight);

    canvas = stepCanvas;
  }

  // Final draw to exact target dimensions
  if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = targetWidth;
    finalCanvas.height = targetHeight;

    const finalCtx = finalCanvas.getContext('2d');
    if (finalCtx) {
      finalCtx.imageSmoothingEnabled = true;
      finalCtx.imageSmoothingQuality = 'high';
      finalCtx.drawImage(canvas, 0, 0, targetWidth, targetHeight);
      return finalCanvas;
    }
  }

  return canvas;
}

/**
 * Converts a Canvas to a Blob using Promise.
 * Falls back to JPEG if WebP blob generation fails.
 */
function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality: number
): Promise<{ blob: Blob; finalMimeType: string }> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve({ blob, finalMimeType: mimeType });
        } else if (mimeType === 'image/webp') {
          // Fallback to JPEG if WebP failed
          canvas.toBlob(
            (fallbackBlob) => {
              if (fallbackBlob) {
                resolve({ blob: fallbackBlob, finalMimeType: 'image/jpeg' });
              } else {
                reject(new Error('Échec de la génération du Blob JPEG/WebP'));
              }
            },
            'image/jpeg',
            quality
          );
        } else {
          reject(new Error('Échec de la compression de l’image'));
        }
      },
      mimeType,
      quality
    );
  });
}

/**
 * Main Client-Side Image Compression function:
 * Resizes and compresses an image File using the HTML5 Canvas API.
 * 
 * @param file The input File object (from file input or drag-and-drop)
 * @param options Compression and resizing configuration
 * @returns CompressedImageResult containing the optimized File, preview URL, and metrics
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<CompressedImageResult> {
  let {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.8,
    mimeType = 'image/webp',
    preset,
    targetMaxSizeBytes,
    minQuality = 0.55,
  } = options;

  // Apply predefined preset configurations if explicitly provided
  if (preset === 'ultra') {
    maxWidth = 1920;
    maxHeight = 1200;
    quality = 0.88;
  } else if (preset === 'speed') {
    maxWidth = 960;
    maxHeight = 640;
    quality = 0.75;
  } else if (preset === 'balanced') {
    maxWidth = 1200;
    maxHeight = 1200;
    quality = 0.8;
  }

  // Resolve 'auto' MIME type: prefer WebP if supported, otherwise JPEG
  let targetMimeType: string = mimeType;
  if (mimeType === 'auto') {
    targetMimeType = isWebPSupported() ? 'image/webp' : 'image/jpeg';
  } else if (mimeType === 'image/webp' && !isWebPSupported()) {
    targetMimeType = 'image/jpeg';
  }

  return new Promise((resolve, reject) => {
    const originalSize = file.size;
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('Erreur de lecture du fichier image'));
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Format d’image non supporté ou fichier corrompu'));
      img.onload = async () => {
        try {
          const { width: targetWidth, height: targetHeight } = calculateAspectRatioFit(
            img.naturalWidth || img.width,
            img.naturalHeight || img.height,
            maxWidth,
            maxHeight
          );

          // Draw image through stepped downsampling canvas
          const canvas = drawWithSteppedDownsampling(
            img,
            img.naturalWidth || img.width,
            img.naturalHeight || img.height,
            targetWidth,
            targetHeight
          );

          // Initial compression
          let { blob, finalMimeType } = await canvasToBlob(canvas, targetMimeType, quality);

          // Iterative size bounding if targetMaxSizeBytes was specified
          if (targetMaxSizeBytes && blob.size > targetMaxSizeBytes) {
            let low = minQuality;
            let high = quality;
            let bestBlob = blob;

            for (let step = 0; step < 3; step++) {
              const midQuality = (low + high) / 2;
              const test = await canvasToBlob(canvas, finalMimeType, midQuality);
              if (test.blob.size <= targetMaxSizeBytes) {
                bestBlob = test.blob;
                low = midQuality; // Try to get higher quality that still fits
              } else {
                high = midQuality;
                bestBlob = test.blob;
              }
            }
            blob = bestBlob;
          }

          const compressedSize = blob.size;
          const reductionPercent = Math.max(
            0,
            Math.round(((originalSize - compressedSize) / originalSize) * 100)
          );

          // Generate clean file extension
          const ext = finalMimeType === 'image/webp' ? 'webp' : 'jpg';
          const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || 'image';
          const newFileName = `${baseName}_optimized.${ext}`;

          const compressedFile = new File([blob], newFileName, {
            type: finalMimeType,
            lastModified: Date.now(),
          });

          const dataUrl = canvas.toDataURL(finalMimeType, quality);

          resolve({
            file: compressedFile,
            blob,
            dataUrl,
            originalSize,
            compressedSize,
            reductionPercent,
            width: targetWidth,
            height: targetHeight,
            mimeType: finalMimeType,
            fileName: newFileName,
          });
        } catch (error) {
          reject(error);
        }
      };

      if (typeof readerEvent.target?.result === 'string') {
        img.src = readerEvent.target.result;
      } else {
        reject(new Error('Erreur de conversion de l’image'));
      }
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Compresses an image fetched from a remote or local URL.
 */
export async function compressImageFromUrl(
  url: string,
  options: CompressionOptions = {}
): Promise<CompressedImageResult> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Échec du chargement de l'image (${response.status})`);
  const blob = await response.blob();
  const file = new File([blob], 'remote_image.jpg', { type: blob.type });
  return compressImage(file, options);
}

/**
 * Batch-compresses multiple files concurrently.
 */
export async function batchCompressImages(
  files: File[],
  options: CompressionOptions = {}
): Promise<CompressedImageResult[]> {
  return Promise.all(files.map((file) => compressImage(file, options)));
}

/**
 * ImageCompressor Utility Component / Class
 * Exposes the compressImage method that accepts a File object,
 * uses the HTML5 Canvas API to resize it to a maximum width of 1200px
 * while maintaining the aspect ratio, and converts the output to WebP
 * format with 0.8 quality before uploading to the server.
 */
export class ImageCompressor {
  /**
   * Resizes an image File using the HTML5 Canvas API to a maximum width of 1200px
   * while maintaining the aspect ratio, and converts the output to WebP format with 0.8 quality.
   * 
   * @param file The original image File object
   * @param options Optional overrides (defaults to maxWidth: 1200, quality: 0.8, mimeType: 'image/webp')
   * @returns Promise<CompressedImageResult>
   */
  static async compressImage(
    file: File,
    options?: Partial<CompressionOptions>
  ): Promise<CompressedImageResult> {
    return compressImage(file, {
      maxWidth: 1200,
      quality: 0.8,
      mimeType: 'image/webp',
      ...options,
    });
  }

  static async compressImageFromUrl(
    url: string,
    options?: Partial<CompressionOptions>
  ): Promise<CompressedImageResult> {
    return compressImageFromUrl(url, {
      maxWidth: 1200,
      quality: 0.8,
      mimeType: 'image/webp',
      ...options,
    });
  }

  static async batchCompressImages(
    files: File[],
    options?: Partial<CompressionOptions>
  ): Promise<CompressedImageResult[]> {
    return batchCompressImages(files, {
      maxWidth: 1200,
      quality: 0.8,
      mimeType: 'image/webp',
      ...options,
    });
  }

  static calculateAspectRatioFit(
    srcWidth: number,
    srcHeight: number,
    maxWidth: number,
    maxHeight: number
  ) {
    return calculateAspectRatioFit(srcWidth, srcHeight, maxWidth, maxHeight);
  }

  static formatBytes(bytes: number, decimals?: number): string {
    return formatBytes(bytes, decimals);
  }

  static isWebPSupported(): boolean {
    return isWebPSupported();
  }
}

export default ImageCompressor;

