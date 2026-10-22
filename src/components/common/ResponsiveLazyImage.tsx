import React, { useState } from 'react';
import { ImageIcon } from 'lucide-react';

export type ImageSizePreset = 'gallery' | 'news' | 'hero' | 'thumbnail' | 'card' | 'custom';

export interface ResponsiveLazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  preset?: ImageSizePreset;
  sizes?: string;
  aspectRatio?: 'video' | 'square' | '4/3' | '16/9' | '21/9' | 'auto';
  containerClassName?: string;
  imgClassName?: string;
  fallbackSrc?: string;
  darkPlaceholder?: boolean;
}

const PRESET_SIZES: Record<ImageSizePreset, string> = {
  gallery: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  news: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  hero: '(max-width: 1024px) 100vw, 1200px',
  thumbnail: '(max-width: 640px) 80px, 96px',
  card: '(max-width: 640px) 100vw, 400px',
  custom: '',
};

const ASPECT_RATIO_CLASSES = {
  video: 'aspect-video',
  square: 'aspect-square',
  '4/3': 'aspect-[4/3]',
  '16/9': 'aspect-[16/9]',
  '21/9': 'aspect-[21/9]',
  auto: '',
};

export const ResponsiveLazyImage: React.FC<ResponsiveLazyImageProps> = ({
  src,
  alt,
  preset = 'custom',
  sizes,
  aspectRatio = 'auto',
  containerClassName = '',
  imgClassName = '',
  fallbackSrc = '/images/campus_courtyard_building_1790531780046.jpg',
  darkPlaceholder = false,
  loading = 'lazy',
  decoding = 'async',
  fetchPriority = 'auto',
  className = '',
  onLoad,
  onError,
  ...restProps
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  // Sync if src prop changes
  React.useEffect(() => {
    setCurrentSrc(src);
    setIsLoaded(false);
    setHasError(false);
  }, [src]);

  const computedSizes = sizes || (preset !== 'custom' ? PRESET_SIZES[preset] : undefined);
  const aspectClass = ASPECT_RATIO_CLASSES[aspectRatio];

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setIsLoaded(true);
    onLoad?.(e);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (!hasError && fallbackSrc && currentSrc !== fallbackSrc) {
      setHasError(true);
      setCurrentSrc(fallbackSrc);
    }
    onError?.(e);
  };

  return (
    <div
      className={`relative overflow-hidden ${aspectClass} ${containerClassName}`}
    >
      {/* Shimmer skeleton placeholder displayed while loading */}
      {!isLoaded && (
        <div
          className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 pointer-events-none ${
            darkPlaceholder
              ? 'bg-slate-900 animate-pulse text-slate-700'
              : 'bg-slate-100 animate-pulse text-slate-300'
          }`}
          aria-hidden="true"
        >
          <div className="flex flex-col items-center justify-center gap-1.5 opacity-40">
            <ImageIcon className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>
      )}

      {/* Main Image */}
      <img
        src={currentSrc}
        alt={alt}
        sizes={computedSizes}
        loading={loading}
        decoding={decoding}
        fetchPriority={fetchPriority}
        referrerPolicy="no-referrer"
        onLoad={handleImageLoad}
        onError={handleImageError}
        className={`w-full h-full object-cover transition-opacity duration-300 ease-out ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } ${imgClassName} ${className}`}
        {...restProps}
      />
    </div>
  );
};
