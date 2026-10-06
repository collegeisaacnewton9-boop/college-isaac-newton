import React, { useRef, useState } from 'react';
import { 
  compressImage, 
  ImageCompressor as ImageCompressorUtil,
  CompressedImageResult, 
  CompressionOptions,
  formatBytes 
} from '../../utils/imageCompressor';
import { Upload, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export { compressImage, formatBytes };
export type { CompressedImageResult, CompressionOptions };

export interface ImageCompressorProps {
  /** Callback fired once image is compressed and ready to upload */
  onCompressed: (result: CompressedImageResult) => void;
  /** Callback fired if an error occurs */
  onError?: (error: Error) => void;
  /** Maximum width in pixels (defaults to 1200px) */
  maxWidth?: number;
  /** Quality between 0.1 and 1.0 (defaults to 0.8) */
  quality?: number;
  /** Output format (defaults to 'image/webp') */
  mimeType?: 'image/webp' | 'image/jpeg' | 'auto';
  /** Optional custom button label */
  buttonLabel?: string;
  /** Optional accepted file extensions (defaults to 'image/*') */
  accept?: string;
  /** Custom CSS classes */
  className?: string;
  /** Children render prop or standard children */
  children?: React.ReactNode | ((props: { 
    isCompressing: boolean; 
    openFileDialog: () => void;
    lastResult: CompressedImageResult | null;
  }) => React.ReactNode);
}

/**
 * Reusable ImageCompressor Utility Component
 * 
 * Provides an easy-to-use React component that exposes the compressImage method,
 * automatically resizing images to a maximum width of 1200px maintaining aspect ratio
 * and converting to WebP at 0.8 quality before uploading to the server.
 */
export const ImageCompressor: React.FC<ImageCompressorProps> & {
  compressImage: typeof ImageCompressorUtil.compressImage;
  formatBytes: typeof formatBytes;
} = ({
  onCompressed,
  onError,
  maxWidth = 1200,
  quality = 0.8,
  mimeType = 'image/webp',
  buttonLabel = 'Choisir & compresser une image',
  accept = 'image/*',
  className = '',
  children,
}) => {
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [lastResult, setLastResult] = useState<CompressedImageResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);
    try {
      // Use the Canvas-based compression with default 1200px max width and 0.8 WebP quality
      const result = await ImageCompressorUtil.compressImage(file, {
        maxWidth,
        quality,
        mimeType,
      });

      setLastResult(result);
      onCompressed(result);
    } catch (err: any) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      onError?.(errorObj);
    } finally {
      setIsCompressing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className={`inline-block ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        aria-hidden="true"
      />

      {typeof children === 'function' ? (
        children({ isCompressing, openFileDialog, lastResult })
      ) : children ? (
        <div onClick={openFileDialog}>{children}</div>
      ) : (
        <button
          type="button"
          onClick={openFileDialog}
          disabled={isCompressing}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-900 hover:bg-blue-950 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95 disabled:opacity-60"
        >
          {isCompressing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
              <span>Compression en cours...</span>
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 text-amber-400" />
              <span>{buttonLabel}</span>
            </>
          )}
        </button>
      )}
    </div>
  );
};

// Attach static utility methods for direct non-JSX usage: ImageCompressor.compressImage(file)
ImageCompressor.compressImage = ImageCompressorUtil.compressImage;
ImageCompressor.formatBytes = formatBytes;

/**
 * React Hook for image compression
 */
export function useImageCompressor(defaultOptions?: Partial<CompressionOptions>) {
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const compress = async (file: File, options?: Partial<CompressionOptions>) => {
    setIsCompressing(true);
    setError(null);
    try {
      const result = await ImageCompressorUtil.compressImage(file, {
        maxWidth: 1200,
        quality: 0.8,
        mimeType: 'image/webp',
        ...defaultOptions,
        ...options,
      });
      return result;
    } catch (err: any) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      setError(errorObj);
      throw errorObj;
    } finally {
      setIsCompressing(false);
    }
  };

  return { compress, isCompressing, error };
}

export default ImageCompressor;
