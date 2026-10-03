import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, 
  Quote, 
  CheckCircle2,
  ChevronLeft, 
  ChevronRight, 
  Award
} from 'lucide-react';
import { INITIAL_TESTIMONIALS } from '../../data/mockData';
import { Testimonial } from '../../types';

interface TestimonialSectionProps {
  onNavigate?: (page: string, subSection?: string) => void;
}

export const TestimonialSection: React.FC<TestimonialSectionProps> = () => {
  const [testimonials] = useState<Testimonial[]>(INITIAL_TESTIMONIALS);
  const [currentIndex, setCurrentIndex] = useState(0);

  const total = testimonials.length;

  // Fluid smooth auto-play slideshow (no pause button)
  useEffect(() => {
    if (total <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % total);
    }, 5500);

    return () => clearInterval(timer);
  }, [total, currentIndex]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % total);
  };

  const currentItem = testimonials[currentIndex] || testimonials[0];
  const nextItem = testimonials[(currentIndex + 1) % total] || currentItem;

  return (
    <section 
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6" 
      aria-label="Témoignages et avis de la communauté scolaire"
    >
      {/* 1. Header - Streamlined & Modern */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-4 gap-3 border-b border-slate-100 pb-3">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-900 mb-1">
            <Award className="w-4 h-4 text-amber-500" />
            <span>Communauté & Réussite</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
            Témoignages & Paroles de notre Communauté
          </h2>
        </div>
      </div>

      {/* 2. MAIN PRESTIGE CAROUSEL CONTAINER - Fluid & Modern */}
      <div className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 rounded-2xl sm:rounded-3xl p-5 sm:p-7 lg:p-8 text-white shadow-xl overflow-hidden border border-slate-800">
        
        {/* Subtle Decorative Background Quotation Icon */}
        <div className="absolute right-4 bottom-2 text-white/5 pointer-events-none select-none">
          <Quote className="w-56 h-56 sm:w-72 sm:h-72" />
        </div>

        {/* Carousel Header Bar: Counter, Category badge & Nav Arrows */}
        <div className="flex items-center justify-between gap-3 pb-3 mb-4 border-b border-white/10 relative z-10">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-xs font-bold font-mono">
              {currentIndex + 1} / {total}
            </span>
            <span className="text-xs text-amber-300 font-medium">
              {currentItem?.relationship}
            </span>
            {currentItem?.year && (
              <span className="hidden sm:inline-block text-[11px] text-slate-400">
                · Promotion / Année {currentItem.year}
              </span>
            )}
          </div>

          {/* Smooth Carousel Arrows */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handlePrev}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer active:scale-95 shadow-xs"
              aria-label="Témoignage précédent"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer active:scale-95 shadow-xs"
              aria-label="Témoignage suivant"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Animated Carousel Body (Framer Motion Slide & Fade) */}
        <AnimatePresence mode="wait">
          {currentItem && (
            <motion.div
              key={currentItem.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center min-h-[190px]"
            >
              {/* Primary Testimonial Text & Author */}
              <div className="lg:col-span-8 space-y-3.5">
                
                {/* Rating & Verified Tag */}
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center gap-0.5">
                    {[...Array(currentItem.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-amber-300 text-xs font-semibold font-mono">5.0 / 5.0</span>
                  {currentItem.verified && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium ml-1.5 bg-emerald-950/70 border border-emerald-800/80 px-2.5 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>Certifié</span>
                    </span>
                  )}
                </div>

                {/* Evocative quote */}
                <blockquote className="font-serif text-base sm:text-xl lg:text-2xl text-slate-100 italic leading-relaxed font-normal">
                  « {currentItem.comment} »
                </blockquote>

                {/* Author Avatar, Name & Academic details */}
                <div className="flex items-center gap-3 pt-1">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-400 via-amber-300 to-amber-200 text-slate-950 font-bold text-sm flex items-center justify-center shadow-md shadow-amber-400/20 shrink-0 select-none">
                    {currentItem.avatarInitials}
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-base text-white">
                      {currentItem.authorName}
                    </h4>
                    <p className="text-xs text-slate-300">
                      {currentItem.role}
                    </p>
                    {currentItem.cycleOrClass && (
                      <span className="inline-block mt-0.5 text-[11px] font-mono font-medium text-amber-300 bg-white/10 px-2 py-0.5 rounded border border-white/15">
                        {currentItem.cycleOrClass}
                      </span>
                    )}
                  </div>
                </div>

              </div>

              {/* Side Teaser: Upcoming Testimonial Preview on Desktop (Fluid magazine style) */}
              <div className="hidden lg:flex lg:col-span-4 flex-col justify-between bg-white/5 rounded-2xl p-4 sm:p-5 border border-white/10 backdrop-blur-xs min-h-[190px]">
                <div>
                  <div className="flex items-center justify-between text-[11px] font-mono uppercase text-amber-400 font-bold tracking-wider">
                    <span>Avis suivant</span>
                    <span className="text-slate-400 font-normal">({(currentIndex + 1) % total + 1}/{total})</span>
                  </div>
                  <p className="text-xs text-slate-300 italic line-clamp-3 mt-2 font-light leading-relaxed">
                    « {nextItem.comment} »
                  </p>
                </div>

                <div className="pt-2.5 mt-2.5 border-t border-white/10 flex items-center justify-between text-xs">
                  <div className="truncate mr-2">
                    <p className="font-semibold text-slate-200 truncate text-xs">{nextItem.authorName}</p>
                    <p className="text-[10px] text-slate-400 truncate">{nextItem.role}</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="text-amber-300 hover:text-white font-medium flex items-center gap-1 cursor-pointer text-xs shrink-0 bg-white/10 px-2 py-1 rounded-lg hover:bg-white/20 transition-colors"
                  >
                    <span>Suivant</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

        {/* Carousel Progress Dots */}
        <div className="flex items-center justify-center gap-1.5 pt-4 mt-3 border-t border-white/10 relative z-10">
          {testimonials.map((_, idx: number) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                idx === currentIndex 
                  ? 'w-7 bg-amber-400 shadow-xs shadow-amber-400/50' 
                  : 'w-2 bg-white/30 hover:bg-white/60'
              }`}
              title={`Aller à l'avis ${idx + 1}`}
              aria-label={`Aller au témoignage ${idx + 1}`}
            />
          ))}
        </div>

      </div>
    </section>
  );
};

export const TestimonialsSection = TestimonialSection;
