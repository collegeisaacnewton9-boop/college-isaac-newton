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
  Phone
} from 'lucide-react';
import { SCHOOL_IMAGES } from '../../assets/images';

export interface HeroCarouselProps {
  onNavigate: (page: string, subSection?: string) => void;
}

interface SlideItem {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  badge: string;
  badgeIcon: React.ElementType;
  objectPosition: string;
  ctaText: string;
  ctaAction: () => void;
  secondaryCtaText?: string;
  secondaryCtaAction?: () => void;
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({ onNavigate }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Real campus imagery curated in optimal order:
  // 1. Official campus facade & entrance (Delmas 50) - Real Image 1
  // 2. High-tech computer science & multimedia lab - Real Image
  // 3. Official graduation ceremony on stage in royal blue gowns - Real Image 2
  // 4. Campus courtyard & sports infrastructure
  const slides: SlideItem[] = [
    {
      id: 'campus-facade-real',
      image: SCHOOL_IMAGES.entranceFacade,
      badge: 'Campus Principal · Delmas 50, rue Dominique #2 bis',
      badgeIcon: ShieldCheck,
      title: 'Collège Isaac Newton',
      subtitle: '« Savoir aujourd’hui, réussir demain » — Notre campus moderne et sécurisé à Delmas 50, rue Dominique #2 bis, dédié à l’excellence intellectuelle et civique de vos enfants.',
      objectPosition: 'center 35%',
      ctaText: 'Formulaire de Préinscription',
      ctaAction: () => onNavigate('pre-registration'),
      secondaryCtaText: 'Secrétariat (+509 3316-0934 / 3721-1818)',
      secondaryCtaAction: () => onNavigate('contact'),
    },
    {
      id: 'computer-lab-real',
      image: SCHOOL_IMAGES.computerLab,
      badge: 'Laboratoire Informatique & Multimédia',
      badgeIcon: Cpu,
      title: 'La Technologie au Service de Votre Avenir',
      subtitle: 'Postes informatiques récents sous onduleurs, initiation au code, bureautique structurée et culture numérique dès le cycle fondamental.',
      objectPosition: 'center 45%',
      ctaText: 'Découvrir le Pôle Numérique',
      ctaAction: () => onNavigate('programs', 'numerique'),
      secondaryCtaText: 'Préinscrire un élève',
      secondaryCtaAction: () => onNavigate('pre-registration'),
    },
    {
      id: 'graduation-promo-real',
      image: SCHOOL_IMAGES.graduationPromo,
      badge: 'Promotion des Diplômés · Cérémonie de Graduation',
      badgeIcon: Award,
      title: 'Former les Bâtisseurs de Demain',
      subtitle: '100% de réussite aux examens d’État (9e AF et Baccalauréat Nouveau Secondaire). Nos bacheliers en toges académiques prêts pour l’université.',
      objectPosition: 'center 22%',
      ctaText: 'Cursus Nouveau Secondaire',
      ctaAction: () => onNavigate('programs', 'secondaire'),
      secondaryCtaText: 'Résultats & Palmarès',
      secondaryCtaAction: () => onNavigate('resources', 'resultats'),
    },
    {
      id: 'campus-courtyard',
      image: SCHOOL_IMAGES.campusCourtyard,
      badge: 'Campus Principal · Delmas 50',
      badgeIcon: Building,
      title: 'Un Environnement Propice à l’Excellence',
      subtitle: 'Bâtiment aéré à galeries bleues, cour spacieuse, terrain multisports et encadrement pédagogique rigoureux.',
      objectPosition: 'center 28%',
      ctaText: 'Visiter le Campus',
      ctaAction: () => onNavigate('college', 'infrastructures'),
      secondaryCtaText: 'Préinscription 2026-2027',
      secondaryCtaAction: () => onNavigate('pre-registration'),
    },
  ];

  const totalSlides = slides.length;

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

  // Autoplay handler: smooth automatic transition
  useEffect(() => {
    if (!isHovered) {
      timerRef.current = setInterval(() => {
        nextSlide();
      }, 6000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isHovered, nextSlide]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide]);

  const activeSlide = slides[currentIndex];
  const BadgeIcon = activeSlide.badgeIcon;

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
      {/* Full-width responsive hero height */}
      <div className="relative h-[480px] sm:h-[540px] md:h-[600px] lg:h-[660px] xl:h-[700px] w-full overflow-hidden">
        
        {/* Framer-motion image slides */}
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={activeSlide.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0 w-full h-full"
          >
            <img
              src={activeSlide.image}
              alt={activeSlide.title}
              style={{ objectPosition: activeSlide.objectPosition }}
              className="w-full h-full object-cover select-none"
              loading="eager"
            />

            {/* Subtle top vignette for contrast without darkening the campus architecture */}
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-slate-950/45 to-transparent pointer-events-none" />

            {/* Balanced gradient: clear, bright visibility of the real photos while ensuring high text contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-transparent sm:bg-gradient-to-r sm:from-slate-950/80 sm:via-slate-950/20 sm:to-transparent pointer-events-none" />
          </motion.div>
        </AnimatePresence>

        {/* Content Overlay: Aligned to container, full bleed backdrop */}
        <div className="absolute inset-x-0 bottom-0 z-20 pointer-events-none">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12 lg:pb-16 flex flex-col justify-end pointer-events-auto">
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
              <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight drop-shadow-md leading-tight">
                {activeSlide.title}
              </h1>

              {/* Short, clear subtitle */}
              <p className="mt-2 sm:mt-3 text-xs sm:text-sm md:text-base lg:text-lg text-slate-200 line-clamp-2 max-w-xl font-sans drop-shadow leading-relaxed">
                {activeSlide.subtitle}
              </p>

              {/* Action Buttons */}
              <div className="mt-4 sm:mt-6 flex flex-wrap items-center gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={activeSlide.ctaAction}
                  className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-400/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <span>{activeSlide.ctaText}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {activeSlide.secondaryCtaText && (
                  <button
                    type="button"
                    onClick={activeSlide.secondaryCtaAction}
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
