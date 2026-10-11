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
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    size: number;
    formattedSize: string;
    isOver500Ko: boolean;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isOver = file.size > 500 * 1024;
    setSelectedFile({
      name: file.name,
      size: file.size,
      formattedSize: formatBytes(file.size),
      isOver500Ko: isOver,
    });

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

      {/* Dynamic Weight Badge & 500KB Alert directly under file input */}
      {selectedFile && (
        <div
          className={`mt-2 p-2 rounded-xl text-xs flex items-center justify-between gap-2 border shadow-xs animate-in fade-in ${
            selectedFile.isOver500Ko
              ? 'bg-amber-50/95 border-amber-300 text-amber-950'
              : 'bg-emerald-50/95 border-emerald-300 text-emerald-950'
          }`}
        >
          <div className="flex items-center gap-1.5 min-w-0">
            {selectedFile.isOver500Ko ? (
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            )}
            <span className="font-semibold truncate max-w-[140px]">{selectedFile.name}</span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[11px] text-slate-600 font-medium">Poids :</span>
            <span
              className={`font-mono font-bold px-1.5 py-0.5 rounded text-[11px] border ${
                selectedFile.isOver500Ko
                  ? 'bg-amber-200 border-amber-400 text-amber-950 font-black'
                  : 'bg-emerald-200 border-emerald-300 text-emerald-950'
              }`}
            >
              {selectedFile.formattedSize}
            </span>
            {selectedFile.isOver500Ko ? (
              <span className="text-[10px] font-bold text-amber-900 bg-amber-200/80 px-1.5 py-0.5 rounded-full border border-amber-400">
                ⚠️ &gt; 500 Ko
              </span>
            ) : (
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded-full border border-emerald-300">
                ✓ ≤ 500 Ko
              </span>
            )}
          </div>
        </div>
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
