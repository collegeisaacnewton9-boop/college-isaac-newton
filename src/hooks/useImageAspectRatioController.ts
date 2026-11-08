import { useState, useCallback } from 'react';
import { 
  ImageCompressor, 
  CompressedImageResult, 
  CompressionOptions 
} from '../utils/imageCompressor';

export interface ImageAspectRatioOptions extends Partial<CompressionOptions> {
  /** Target aspect ratio: defaults to 16 / 9 (1.7777...) */
  targetRatio?: number;
  /**
   * Focal point for cropping when aspect ratio does not match:
   * x: 0 (left) to 1 (right) - default 0.5 (center)
   * y: 0 (top) to 1 (bottom) - default 0.35 (optimal for campus architecture, people and classroom faces)
   */
  focalPoint?: { x: number; y: number };
}

export interface AspectCropMetadata {
  isCropped: boolean;
  originalWidth: number;
  originalHeight: number;
  originalRatio: number;
  targetRatio: number;
  cropX: number;
  cropY: number;
  cropWidth: number;
  cropHeight: number;
}

export interface CarouselImageProcessResult extends CompressedImageResult {
  cropMetadata: AspectCropMetadata;
}

/** Default 16:9 aspect ratio */
export const CAROUSEL_TARGET_RATIO = 16 / 9;
export const CAROUSEL_RATIO_LABEL = '16:9';

/**
 * Core utility function:
 * Analyzes an image File, center-crops it to an exact 16:9 aspect ratio if necessary
 * using the HTML5 Canvas API, and compresses it using the existing ImageCompressor utility.
 * 
 * @param file The input File object
 * @param options Aspect ratio and compression options (maxWidth: 1200, quality: 0.8, WebP)
 * @returns Promise<CarouselImageProcessResult>
 */
export async function enforce169AspectRatio(
  file: File,
  options: ImageAspectRatioOptions = {}
): Promise<CarouselImageProcessResult> {
  const {
    targetRatio = CAROUSEL_TARGET_RATIO,
    focalPoint = { x: 0.5, y: 0.35 },
    maxWidth = 1200,
    quality = 0.8,
    mimeType = 'image/webp',
    ...compressionOverrides
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Erreur de lecture du fichier image'));
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Format d’image non supporté ou corrompu'));
      img.onload = async () => {
        try {
          const originalWidth = img.naturalWidth || img.width;
          const originalHeight = img.naturalHeight || img.height;
          const originalRatio = originalWidth / originalHeight;

          // Check if crop to 16:9 is required (tolerance of 0.005)
          const ratioDiff = Math.abs(originalRatio - targetRatio);
          const needsCropping = ratioDiff > 0.005;

          let cropX = 0;
          let cropY = 0;
          let cropWidth = originalWidth;
          let cropHeight = originalHeight;

          if (needsCropping) {
            if (originalRatio > targetRatio) {
              // Image is wider than 16:9 (e.g. 21:9 ultra-wide or panoramic)
              // Keep full height, trim excess width
              cropHeight = originalHeight;
              cropWidth = Math.round(originalHeight * targetRatio);
              const excessWidth = originalWidth - cropWidth;
              cropX = Math.max(0, Math.min(originalWidth - cropWidth, Math.round(excessWidth * focalPoint.x)));
              cropY = 0;
            } else {
              // Image is taller than 16:9 (e.g. 4:3, 1:1 square, or 9:16 portrait)
              // Keep full width, trim excess height
              cropWidth = originalWidth;
              cropHeight = Math.round(originalWidth / targetRatio);
              const excessHeight = originalHeight - cropHeight;
              cropX = 0;
              cropY = Math.max(0, Math.min(originalHeight - cropHeight, Math.round(excessHeight * focalPoint.y)));
            }
          }

          // Create Canvas to extract the exact 16:9 region
          const canvas = document.createElement('canvas');
          canvas.width = cropWidth;
          canvas.height = cropHeight;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Impossible d’initialiser le contexte Canvas 2D'));
            return;
          }

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // Draw the 16:9 cropped sub-rectangle
          ctx.drawImage(
            img,
            cropX,
            cropY,
            cropWidth,
            cropHeight,
            0,
            0,
            cropWidth,
            cropHeight
          );

          // Convert cropped canvas into a temporary Blob / File
          const croppedBlob = await new Promise<Blob>((resBlob, rejBlob) => {
            canvas.toBlob(
              (b) => {
                if (b) resBlob(b);
                else rejBlob(new Error('Erreur d’exportation du canevas 16:9'));
              },
              file.type || 'image/jpeg',
              0.95
            );
          });

          const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || 'carousel_image';
          const croppedFile = new File([croppedBlob], `${baseName}_16x9.jpg`, {
            type: file.type || 'image/jpeg',
            lastModified: Date.now(),
          });

          // Pass the 16:9 cropped File into ImageCompressor (resizing to max 1200px, 0.8 quality WebP)
          const compressionResult = await ImageCompressor.compressImage(croppedFile, {
            maxWidth,
            quality,
            mimeType,
            ...compressionOverrides,
          });

          const cropMetadata: AspectCropMetadata = {
            isCropped: needsCropping,
            originalWidth,
            originalHeight,
            originalRatio,
            targetRatio,
            cropX,
            cropY,
            cropWidth,
            cropHeight,
          };

          resolve({
            ...compressionResult,
            cropMetadata,
          });
        } catch (err) {
          reject(err);
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
 * ImageAspectRatioController
 * 
 * Reusable React Hook that automatically enforces a consistent 16:9 aspect ratio
 * on all images uploaded to the carousel using the existing ImageCompressor utility.
 */
export function useImageAspectRatioController(defaultOptions?: ImageAspectRatioOptions) {
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [focalPoint, setFocalPoint] = useState<{ x: number; y: number }>(
    defaultOptions?.focalPoint || { x: 0.5, y: 0.35 }
  );
  const [lastResult, setLastResult] = useState<CarouselImageProcessResult | null>(null);

  /**
   * Processes a carousel image File:
   * - Crops to 16:9 aspect ratio
   * - Compresses via ImageCompressor (max 1200px width, 0.8 quality, WebP)
   */
  const processCarouselImage = useCallback(
    async (file: File, overrides?: ImageAspectRatioOptions): Promise<CarouselImageProcessResult> => {
      setIsProcessing(true);
      setError(null);
      try {
        const result = await enforce169AspectRatio(file, {
          focalPoint,
          ...defaultOptions,
          ...overrides,
        });
        setLastResult(result);
        return result;
      } catch (err: any) {
        const errorObj = err instanceof Error ? err : new Error(String(err));
        setError(errorObj);
        throw errorObj;
      } finally {
        setIsProcessing(false);
      }
    },
    [defaultOptions, focalPoint]
  );

  const reset = useCallback(() => {
    setLastResult(null);
    setError(null);
    setIsProcessing(false);
  }, []);

  return {
    /** Main method: enforces 16:9 and compresses with ImageCompressor */
    processCarouselImage,
    /** Alias for processCarouselImage */
    enforce169AspectRatio: processCarouselImage,
    /** Whether processing is in progress */
    isProcessing,
    /** Any error that occurred */
    error,
    /** The latest processed result */
    lastResult,
    /** Current focal point used for cropping */
    focalPoint,
    /** Update focal point for framing */
    setFocalPoint,
    /** Target aspect ratio numeric value (1.7777...) */
    targetRatio: CAROUSEL_TARGET_RATIO,
    /** Target aspect ratio label ("16:9") */
    targetRatioLabel: CAROUSEL_RATIO_LABEL,
    /** Reset state */
    reset,
  };
}

/**
 * Class / Object interface for direct non-hook usage
 */
export const ImageAspectRatioController = {
  enforce169AspectRatio,
  processCarouselImage: enforce169AspectRatio,
  useImageAspectRatioController,
  TARGET_RATIO: CAROUSEL_TARGET_RATIO,
  RATIO_LABEL: CAROUSEL_RATIO_LABEL,
};

export default useImageAspectRatioController;
