import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  ArrowRight, 
  Building, 
  Cpu, 
  Award, 
  ShieldCheck,
  Phone,
  Sparkles
} from 'lucide-react';
import { SCHOOL_IMAGES } from '../../assets/images';
import { apiService } from '../../services/api';
import { HeroSlide } from '../../types';
import { getHeroSlideImageUrl } from '../../utils/cacheBuster';

export interface HeroCarouselProps {
  onNavigate: (page: string, subSection?: string) => void;
}

const DEFAULT_SLIDES: HeroSlide[] = [
  {
    id: 'slide-1',
    image: '/images/slide_campus_orange_entrance.webp',
    badge: 'Campus Principal · Delmas 50, rue Dominique #2 bis',
    title: 'Collège Isaac Newton',
    subtitle: '« Savoir aujourd’hui, réussir demain » — Notre campus moderne et sécurisé à Delmas 50, dédié à l’excellence intellectuelle et civique de vos enfants.',
    objectPosition: 'center 35%',
    ctaText: 'Formulaire de Préinscription',
    ctaTarget: 'pre-registration',
    secondaryCtaText: 'Secrétariat (+509 3316-0934 / 3721-1818)',
    secondaryCtaTarget: 'contact',
    isActive: true,
    order: 1,
  },
  {
    id: 'slide-2',
    image: '/images/slide_computer_lab_students.webp',
    badge: 'Laboratoire Informatique & Multimédia',
    title: 'La Technologie au Service de Votre Avenir',
    subtitle: 'Postes informatiques récents sous onduleurs, initiation au code, bureautique structurée et culture numérique dès le cycle fondamental.',
    objectPosition: 'center 45%',
    ctaText: 'Découvrir le Pôle Numérique',
    ctaTarget: 'programs',
    secondaryCtaText: 'Préinscrire un élève',
    secondaryCtaTarget: 'pre-registration',
    isActive: true,
    order: 2,
  },
  {
    id: 'slide-1791209316735',
    image: '/images/slide_students_flag_assembly.webp',
    badge: 'Campus Principal · Delmas 50, rue Dominique #2 bis',
    title: "L'entrée en classe",
    subtitle: "« Savoir aujourd’hui, réussir demain » — Un moment fort de la journée, empreint d'ordre, de discipline et de motivation pour commencer les cours.",
    objectPosition: 'center 35%',
    ctaText: 'Formulaire de Préinscription',
    ctaTarget: 'pre-registration',
    secondaryCtaText: 'Secrétariat (+509 3316-0934)',
    secondaryCtaTarget: 'contact',
    isActive: true,
    order: 3,
  },
  {
    id: 'slide-1791154454162',
    image: '/images/slide_campus_courtyard_facade.webp',
    badge: 'Campus Principal · Delmas 50, rue Dominique #2 bis',
    title: 'Nouvelle Diapositive d’Excellence',
    subtitle: 'Cadre moderne, discipline bienveillante et infrastructures conçues pour l’épanouissement complet de chaque élève.',
    objectPosition: 'center 35%',
    ctaText: 'Formulaire de Préinscription',
    ctaTarget: 'pre-registration',
    secondaryCtaText: 'Secrétariat (+509 3316-0934)',
    secondaryCtaTarget: 'contact',
    isActive: true,
    order: 4,
  },
  {
    id: 'slide-1791150195757',
    image: '/images/slide_royalty_elite_promo.webp',
    badge: 'Campus Principal · Delmas 50, rue Dominique #2 bis',
    title: 'Promotion : Royalty Élite 2025-2026',
    subtitle: '100% de réussite aux examens officiels d’État. Nos promotions d’excellence prêtes pour les plus grandes filières universitaires.',
    objectPosition: 'center 35%',
    ctaText: 'Formulaire de Préinscription',
    ctaTarget: 'pre-registration',
    secondaryCtaText: 'Secrétariat (+509 3316-0934)',
    secondaryCtaTarget: 'contact',
    isActive: true,
    order: 5,
  },
  {
    id: 'slide-1791154052006',
    image: '/images/slide_graduation_invictus_ns4.webp',
    badge: 'Promotion : Invictus 2024 - 2025',
    title: 'Graduation des élèves de la classe NS4',
    subtitle: 'Célébration officielle des lauréats du Nouveau Secondaire, couronnant des années d’efforts, de rigueur et d’ambition académique.',
    objectPosition: 'center 35%',
    ctaText: 'Formulaire de Préinscription',
    ctaTarget: 'pre-registration',
    secondaryCtaText: 'Secrétariat (+509 3316-0934)',
    secondaryCtaTarget: 'contact',
    isActive: true,
    order: 6,
  },
];

export const HeroCarousel: React.FC<HeroCarouselProps> = ({ onNavigate }) => {
  const [slides, setSlides] = useState<HeroSlide[]>(() => {
    const cached = apiService.getCachedHeroSlides();
    const activeCached = cached.filter((s: HeroSlide) => s.isActive);
    if (activeCached.length > 0) return activeCached;
    return DEFAULT_SLIDES.filter((s: HeroSlide) => s.isActive);
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Dynamic slides loader & event listener
  useEffect(() => {
    apiService.getHeroSlides().then((data) => {
      const active = data.filter(s => s.isActive);
      if (active.length > 0) setSlides(active);
    }).catch(() => {});

    const onSlidesUpdated = (e: any) => {
      if (e.detail && Array.isArray(e.detail)) {
        const active = e.detail.filter((s: HeroSlide) => s.isActive);
        if (active.length > 0) {
          setSlides(active);
          setCurrentIndex(0);
        }
      }
    };
    window.addEventListener('cin:slides-updated', onSlidesUpdated);
    return () => window.removeEventListener('cin:slides-updated', onSlidesUpdated);
  }, []);

  const totalSlides = slides.length || 1;

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  const goToSlide = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  // Preload all slide images for instant, zero-shift rotation (LiteSpeed optimization)
  useEffect(() => {
    slides.forEach((s) => {
      if (s.image) {
        const preloadImg = new Image();
        preloadImg.src = s.image;
      }
    });
  }, [slides]);

  // Autoplay handler: smooth automatic transition
  useEffect(() => {
    if (!isHovered && totalSlides > 1) {
      timerRef.current = setInterval(() => {
        nextSlide();
      }, 6000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isHovered, nextSlide, totalSlides]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide]);

  const activeSlide = slides[currentIndex] || DEFAULT_SLIDES[0];

  const getBadgeIcon = (badge: string) => {
    if (badge.toLowerCase().includes('technologie') || badge.toLowerCase().includes('lab')) return Cpu;
    if (badge.toLowerCase().includes('diplôm') || badge.toLowerCase().includes('graduation')) return Award;
    if (badge.toLowerCase().includes('cour') || badge.toLowerCase().includes('bâtiment')) return Building;
    return ShieldCheck;
  };

  const BadgeIcon = getBadgeIcon(activeSlide.badge || '');

  // Slide transition variants
  const slideVariants = {
    enter: (dir: number) => ({
      opacity: 0,
      scale: 1.04,
      x: dir > 0 ? 30 : -30,
    }),
    center: {
      opacity: 1,
      scale: 1,
      x: 0,
      transition: {
        opacity: { duration: 0.7, ease: 'easeOut' as const },
        scale: { duration: 1.2, ease: 'easeOut' as const },
        x: { duration: 0.7, ease: 'easeOut' as const },
      },
    },
    exit: (dir: number) => ({
      opacity: 0,
      scale: 0.98,
      x: dir > 0 ? -30 : 30,
      transition: {
        opacity: { duration: 0.5, ease: 'easeIn' as const },
        x: { duration: 0.5, ease: 'easeIn' as const },
      },
    }),
  };

  return (
    <section 
      className="relative w-full overflow-hidden bg-slate-950"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label="Diaporama officiel du campus et des laboratoires du Collège Isaac Newton"
    >
      {/* Strict uniform locked height across all viewports (zero layout shift, zero footer jump) */}
      <div className="relative h-[440px] sm:h-[480px] md:h-[520px] lg:h-[560px] xl:h-[600px] max-h-[440px] sm:max-h-[480px] md:max-h-[520px] lg:max-h-[560px] xl:max-h-[600px] w-full overflow-hidden">
        
        {/* Uniform image slides with continuous crossfade (never unmounts during transition) */}
        {slides.map((s, idx) => {
          const isActive = idx === currentIndex;
          return (
            <div
              key={s.id}
              className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <img
                src={getHeroSlideImageUrl(s.image, s)}
                alt={s.title}
                loading={idx === 0 ? 'eager' : 'lazy'}
                decoding="async"
                fetchPriority={idx === 0 ? 'high' : 'auto'}
                style={{ objectPosition: s.objectPosition || 'center 35%' }}
                className={`w-full h-full object-cover select-none transition-transform duration-[6000ms] ease-out ${
                  isActive ? 'scale-103' : 'scale-100'
                }`}
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.dataset.triedFallback) {
                    target.dataset.triedFallback = '1';
                    if (target.src.includes('/src/assets/images/')) {
                      target.src = target.src.replace('/src/assets/images/', '/images/');
                    } else {
                      target.src = SCHOOL_IMAGES.entranceFacade;
                    }
                  }
                }}
              />

              {/* Subtle top vignette for contrast without darkening the campus architecture */}
              <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-slate-950/45 to-transparent pointer-events-none" />

              {/* Balanced gradient: clear, bright visibility of the real photos while ensuring high text contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent sm:bg-gradient-to-r sm:from-slate-950/85 sm:via-slate-950/25 sm:to-transparent pointer-events-none" />
            </div>
          );
        })}

        {/* Content Overlay: Aligned to container, full bleed backdrop */}
        <div className="absolute inset-x-0 bottom-0 z-20 pointer-events-none">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8 lg:pb-10 flex flex-col justify-end pointer-events-auto">
            <motion.div
              key={`text-${activeSlide.id}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="max-w-2xl text-left"
            >
              {/* Category Pill */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600/90 backdrop-blur-md text-white text-xs sm:text-sm font-medium mb-2.5 sm:mb-3.5 shadow-sm border border-blue-400/30">
                <BadgeIcon className="w-3.5 h-3.5 text-amber-300" />
                <span>{activeSlide.badge}</span>
              </div>

              {/* Slide Title */}
              <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight drop-shadow-md leading-tight line-clamp-2">
                {activeSlide.title}
              </h1>

              {/* Short, clear subtitle with stabilized min-height */}
              <p className="mt-2 sm:mt-3 text-xs sm:text-sm md:text-base lg:text-lg text-slate-200 line-clamp-2 max-w-xl font-sans drop-shadow leading-relaxed min-h-[2.5rem] sm:min-h-[3.25rem]">
                {activeSlide.subtitle}
              </p>

              {/* Action Buttons */}
              <div className="mt-4 sm:mt-6 flex flex-wrap items-center gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={() => onNavigate(activeSlide.ctaTarget || 'pre-registration')}
                  className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-400/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <span>{activeSlide.ctaText}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {activeSlide.secondaryCtaText && (
                  <button
                    type="button"
                    onClick={() => onNavigate(activeSlide.secondaryCtaTarget || 'contact')}
                    className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-slate-900/70 hover:bg-slate-900 text-white font-medium text-xs sm:text-sm backdrop-blur-md border border-white/20 transition-all hover:border-white/40 cursor-pointer"
                  >
                    <span>{activeSlide.secondaryCtaText}</span>
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Previous / Next Arrow Controls */}
        <button
          type="button"
          onClick={prevSlide}
          aria-label="Image précédente"
          className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-900/50 hover:bg-slate-900/85 text-white/90 hover:text-white backdrop-blur-md border border-white/15 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-md cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        <button
          type="button"
          onClick={nextSlide}
          aria-label="Image suivante"
          className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-900/50 hover:bg-slate-900/85 text-white/90 hover:text-white backdrop-blur-md border border-white/15 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-md cursor-pointer"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Bottom Pagination Dots */}
        <div className="absolute bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 sm:gap-2">
          {slides.map((s, idx) => (
            <button
              key={s.id}
              type="button"
              onClick={() => goToSlide(idx)}
              aria-label={`Afficher la diapositive ${idx + 1}`}
              className={`h-2 sm:h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                idx === currentIndex
                  ? 'w-7 sm:w-9 bg-amber-400 shadow-md shadow-amber-400/50'
                  : 'w-2 sm:w-2.5 bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>

      </div>
    </section>
  );
};
