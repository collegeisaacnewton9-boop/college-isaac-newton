import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  X, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Maximize2, 
  Minimize2, 
  ChevronLeft, 
  ChevronRight, 
  Download,
  Info,
  Calendar,
  Sparkles
} from 'lucide-react';
import { GalleryItem } from '../../types';
import { getGalleryImageUrl } from '../../utils/cacheBuster';

export interface ImageLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: GalleryItem[];
  currentIndex: number;
  onIndexChange?: (index: number) => void;
  onEditItem?: (item: GalleryItem) => void;
  canEdit?: boolean;
}

export const ImageLightboxModal: React.FC<ImageLightboxModalProps> = ({
  isOpen,
  onClose,
  items,
  currentIndex,
  onIndexChange,
  onEditItem,
  canEdit = false,
}) => {
  const [scale, setScale] = useState<number>(1);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showInfo, setShowInfo] = useState<boolean>(true);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const currentItem = items[currentIndex];

  // Reset zoom & pan when slide changes or modal opens
  const resetZoom = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    resetZoom();
  }, [currentIndex, isOpen, resetZoom]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Keyboard controls
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (scale > 1) {
          resetZoom();
        } else {
          onClose();
        }
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === '+' || e.key === '=') {
        handleZoomIn();
      } else if (e.key === '-' || e.key === '_') {
        handleZoomOut();
      } else if (e.key === '0' || e.key.toLowerCase() === 'r') {
        resetZoom();
      } else if (e.key.toLowerCase() === 'f') {
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, scale, currentIndex, items.length]);

  if (!isOpen || !currentItem) return null;

  const total = items.length;

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (total <= 1) return;
    const nextIdx = (currentIndex - 1 + total) % total;
    onIndexChange?.(nextIdx);
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (total <= 1) return;
    const nextIdx = (currentIndex + 1) % total;
    onIndexChange?.(nextIdx);
  };

  const handleZoomIn = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setScale((prev) => Math.min(prev + 0.5, 4));
  };

  const handleZoomOut = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setScale((prev) => {
      const next = Math.max(prev - 0.5, 1);
      if (next === 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (scale > 1) {
      resetZoom();
    } else {
      setScale(2);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      // Zoom In
      setScale((prev) => Math.min(prev + 0.25, 4));
    } else {
      // Zoom Out
      setScale((prev) => {
        const next = Math.max(prev - 0.25, 1);
        if (next === 1) setPosition({ x: 0, y: 0 });
        return next;
      });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || scale <= 1) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        if (containerRef.current?.requestFullscreen) {
          await containerRef.current.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch {}
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = currentItem.imageUrl;
    link.download = `${currentItem.title.replace(/\s+/g, '_')}_IsaacNewton.jpg`;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] flex flex-col bg-slate-950/95 backdrop-blur-xl select-none animate-in fade-in duration-200"
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
      role="dialog"
      aria-modal="true"
    >
      {/* 1. TOP HEADER TOOLBAR */}
      <div className="relative z-20 flex items-center justify-between px-3 sm:px-6 py-3 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
        
        {/* Counter & Category Pill */}
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="px-2.5 py-1 rounded-full bg-blue-900/90 text-amber-300 border border-blue-700/60 font-mono text-xs font-bold shrink-0">
            {currentIndex + 1} / {total}
          </span>
          {currentItem.category && (
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-medium truncate">
              <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
              <span>{currentItem.category}</span>
            </span>
          )}
          <span className="text-white text-xs sm:text-sm font-semibold truncate hidden md:inline-block max-w-sm">
            {currentItem.title}
          </span>
        </div>

        {/* Toolbar Controls (Zoom, Reset, Fullscreen, Info, Download, Close) */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Zoom Out */}
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={scale <= 1}
            className={`p-2 rounded-xl transition-colors ${
              scale <= 1 
                ? 'text-slate-600 cursor-not-allowed' 
                : 'text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer'
            }`}
            title="Zoom arrière (-)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          {/* Zoom Indicator / Reset */}
          <button
            type="button"
            onClick={resetZoom}
            className={`px-2 py-1 rounded-lg text-xs font-mono font-semibold transition-colors ${
              scale > 1
                ? 'bg-amber-400 text-slate-950 hover:bg-amber-300 cursor-pointer shadow-xs'
                : 'text-slate-400 hover:text-slate-200 cursor-pointer'
            }`}
            title="Réinitialiser le zoom (100%)"
          >
            {Math.round(scale * 100)}%
          </button>

          {/* Zoom In */}
          <button
            type="button"
            onClick={handleZoomIn}
            disabled={scale >= 4}
            className={`p-2 rounded-xl transition-colors ${
              scale >= 4 
                ? 'text-slate-600 cursor-not-allowed' 
                : 'text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer'
            }`}
            title="Zoom avant (+)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-slate-800 mx-1 hidden sm:block" />

          {/* Toggle Fullscreen */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer hidden sm:flex"
            title={isFullscreen ? 'Quitter le plein écran (F)' : 'Plein écran (F)'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Toggle Info Overlay */}
          <button
            type="button"
            onClick={() => setShowInfo(!showInfo)}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              showInfo ? 'text-amber-400 bg-slate-800' : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            title="Afficher/Masquer la légende"
          >
            <Info className="w-4 h-4" />
          </button>

          {/* Download Original Image */}
          <button
            type="button"
            onClick={handleDownload}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Télécharger l'image"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Edit Button (if staff authorized) */}
          {canEdit && onEditItem && (
            <button
              type="button"
              onClick={() => onEditItem(currentItem)}
              className="px-2.5 py-1 rounded-xl bg-blue-900 hover:bg-blue-800 text-amber-300 border border-blue-700/60 text-xs font-bold transition-colors cursor-pointer"
              title="Modifier les détails de cette photo"
            >
              Modifier
            </button>
          )}

          <div className="w-px h-5 bg-slate-800 mx-1" />

          {/* Close Modal */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 hover:bg-rose-600 text-slate-300 hover:text-white transition-colors cursor-pointer shadow-xs"
            title="Fermer (Échap)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. MAIN VIEWPORT & ZOOMABLE IMAGE CONTAINER */}
      <div 
        className="relative flex-1 flex items-center justify-center overflow-hidden cursor-default"
        onClick={() => {
          if (scale === 1) onClose();
        }}
      >
        {/* Navigation Arrows */}
        {total > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-3 sm:left-6 z-20 p-3 sm:p-3.5 rounded-full bg-slate-950/70 hover:bg-slate-900 text-white hover:text-amber-300 transition-all cursor-pointer shadow-2xl border border-white/10 active:scale-95"
              aria-label="Photo précédente (←)"
              title="Précédent (Flèche gauche)"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="absolute right-3 sm:right-6 z-20 p-3 sm:p-3.5 rounded-full bg-slate-950/70 hover:bg-slate-900 text-white hover:text-amber-300 transition-all cursor-pointer shadow-2xl border border-white/10 active:scale-95"
              aria-label="Photo suivante (→)"
              title="Suivant (Flèche droite)"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </>
        )}

        {/* Zoomable / Draggable Image Area */}
        <div
          className="relative max-w-full max-h-full flex items-center justify-center select-none"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onDoubleClick={handleDoubleClick}
          style={{
            cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in',
          }}
        >
          <img
            ref={imageRef}
            src={getGalleryImageUrl(currentItem.imageUrl, currentItem)}
            alt={currentItem.altText || currentItem.title}
            className="max-w-[92vw] max-h-[76vh] object-contain rounded-lg transition-transform duration-100 ease-out pointer-events-none drop-shadow-2xl"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            }}
            loading="lazy"
            decoding="async"
            draggable={false}
          />
        </div>

        {/* Double-Click Hint (appears momentarily when scale is 1) */}
        {scale === 1 && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-900/70 backdrop-blur-md border border-white/10 text-slate-300 text-[11px] font-medium px-3 py-1 rounded-full pointer-events-none opacity-70">
            Double-cliquer ou molette pour zoomer
          </div>
        )}
      </div>

      {/* 3. BOTTOM INFO OVERLAY & THUMBNAIL STRIP */}
      {showInfo && (
        <div className="relative z-20 bg-slate-950/90 border-t border-slate-800/80 px-4 sm:px-6 py-3 space-y-2 backdrop-blur-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 max-w-7xl mx-auto">
            <div className="min-w-0">
              <h2 className="text-white font-serif font-bold text-sm sm:text-base leading-snug">
                {currentItem.title}
              </h2>
              {currentItem.caption && (
                <p className="text-xs text-slate-300 font-light mt-0.5 line-clamp-2">
                  {currentItem.caption}
                </p>
              )}
            </div>

            {/* Thumbnail Strip */}
            {total > 1 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full sm:max-w-md shrink-0 scrollbar-none">
                {items.map((item, idx) => (
                  <button
                    key={item.id || idx}
                    type="button"
                    onClick={() => onIndexChange?.(idx)}
                    className={`relative w-11 h-11 sm:w-12 sm:h-12 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer aspect-video ${
                      currentIndex === idx
                        ? 'border-amber-400 scale-105 shadow-md shadow-amber-400/20 opacity-100'
                        : 'border-transparent opacity-50 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={getGalleryImageUrl(item.imageUrl, item)}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
