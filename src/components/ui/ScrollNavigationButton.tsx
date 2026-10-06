import React, { useState, useEffect } from 'react';
import { ChevronDown, ArrowDown } from 'lucide-react';

export const ScrollNavigationButton: React.FC = () => {
  const [scrollY, setScrollY] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isNearBottom, setIsNearBottom] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      
      setScrollY(currentScrollY);
      setShowButton(currentScrollY > 150);

      if (totalHeight > 0) {
        const progress = Math.min(100, Math.max(0, (currentScrollY / totalHeight) * 100));
        setScrollProgress(Math.round(progress));
        setIsNearBottom(currentScrollY + window.innerHeight >= document.documentElement.scrollHeight - 200);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth',
    });
  };

  if (!showButton) return null;

  return (
    <div 
      className="fixed bottom-20 right-5 sm:bottom-22 sm:right-6 z-40 flex flex-col items-end select-none animate-in fade-in slide-in-from-bottom-3 duration-200"
      onMouseEnter={() => setShowOptions(true)}
      onMouseLeave={() => setShowOptions(false)}
    >
      {/* EXPANDABLE QUICK ACTION TOOLTIP / MENU */}
      {showOptions && (
        <div className="mb-2 p-1.5 rounded-2xl bg-slate-950/90 backdrop-blur-md border border-slate-800 shadow-2xl flex flex-col gap-1 text-[11px] text-white animate-in fade-in duration-150">
          <button
            type="button"
            onClick={scrollToTop}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-white/10 transition-colors text-left cursor-pointer whitespace-nowrap"
            title="Remonter au tout début de la page"
          >
            <span className="w-5 h-5 rounded-full bg-red-800 text-white flex items-center justify-center text-xs font-bold">
              ↑
            </span>
            <span>Haut de page</span>
          </button>

          <button
            type="button"
            onClick={scrollToBottom}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-white/10 transition-colors text-left cursor-pointer whitespace-nowrap"
            title="Descendre jusqu'au pied de page"
          >
            <span className="w-5 h-5 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-bold">
              ↓
            </span>
            <span>Bas de page (Footer)</span>
          </button>
        </div>
      )}

      {/* DUAL ACTION OR SMART CIRCLE BUTTON (MATCHING USER SCREENSHOT) */}
      <div className="relative group">
        
        {/* PROGRESS RING */}
        <svg 
          className="w-13 h-13 -rotate-90 pointer-events-none absolute -inset-0.5" 
          viewBox="0 0 52 52"
        >
          <circle
            cx="26"
            cy="26"
            r="23"
            stroke="currentColor"
            strokeWidth="2.5"
            className="text-slate-900/10"
            fill="none"
          />
          <circle
            cx="26"
            cy="26"
            r="23"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeDasharray={144.5}
            strokeDashoffset={144.5 - (144.5 * scrollProgress) / 100}
            strokeLinecap="round"
            className="text-red-600 transition-all duration-150"
            fill="none"
          />
        </svg>

        {/* MAIN CIRCULAR BUTTON (EXACT RED DESIGN FROM USER IMAGE) */}
        <button
          type="button"
          onClick={isNearBottom ? scrollToTop : scrollToTop}
          className="w-12 h-12 rounded-full bg-[#a82020] hover:bg-[#8f1b1b] active:scale-95 text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all cursor-pointer border border-white/20 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
          aria-label="Remonter au début de la page"
          title={`Remonter au début de la page (${scrollProgress}%)`}
        >
          {/* Custom SVG Icon matching exact uploaded image: upward arrow + curved cradle */}
          <svg 
            viewBox="0 0 24 24" 
            className="w-6 h-6" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            {/* Arrow Stem & Head */}
            <path d="M12 15V4" />
            <path d="M7 9l5-5 5 5" />
            {/* Curved Cradle Arc underneath */}
            <path d="M6 14.5c0 3.3 2.7 6 6 6s6-2.7 6-6" />
          </svg>
        </button>

        {/* QUICK DOWNWARD ARROW MINI-PILL ON HOVER OR LONG SCROLL */}
        {!isNearBottom && (
          <button
            type="button"
            onClick={scrollToBottom}
            className="absolute -top-7 right-1/2 translate-x-1/2 bg-slate-900/90 hover:bg-slate-950 text-white p-1 rounded-full text-xs shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer"
            title="Descendre directement au bas de la page"
            aria-label="Descendre au bas de page"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
