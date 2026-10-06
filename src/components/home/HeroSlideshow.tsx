import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause, 
  Maximize2, 
  X, 
  Phone, 
  MapPin, 
  Clock, 
  ArrowRight, 
  GraduationCap, 
  ShieldCheck, 
  Sparkles,
  Building,
  Award,
  Cpu,
  Calendar
} from 'lucide-react';
import { SCHOOL_IMAGES } from '../../assets/images';
import { SCHOOL_INFO } from '../../data/mockData';
import { ImageLightboxModal } from '../common/ImageLightboxModal';
import { GalleryItem } from '../../types';

interface HeroSlideshowProps {
  onNavigate: (page: string, subSection?: string) => void;
}

export interface SlideData {
  id: string;
  image: string;
  objectPosition: string; // Tailored specifically so the building, signage, and heads are never awkwardly clipped
  tag: string;
  tagIcon: any;
  title: string;
  motto: string;
  description: string;
  metrics: { label: string; value: string }[];
  primaryCtaText: string;
  primaryCtaAction: () => void;
  fullCaption: string;
}

export const HeroSlideshow: React.FC<HeroSlideshowProps> = ({ onNavigate }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const slides: SlideData[] = [
    {
      id: 'entrance-facade',
      image: SCHOOL_IMAGES.entranceFacade,
      // Adjusted so the pediment with "COLLÈGE ISAAC NEWTON", the cursive text, and entrance are fully visible (Image 1)
      objectPosition: 'center 35%',
      tag: 'Façade Principale · Delmas 50, rue Dominique #2 bis',
      tagIcon: ShieldCheck,
      title: 'Collège Isaac Newton',
      motto: '« Savoir aujourd’hui, réussir demain »',
      description: 'Campus moderne et sécurisé à Delmas 50, rue Dominique #2 bis. Une formation académique d’excellence du préscolaire au baccalauréat d’État pour l’avenir de chaque enfant.',
      metrics: [
        { label: 'Secrétariat ouvert', value: 'Jusqu’à 15h30' },
        { label: 'Encadrement civique', value: '100% Dédié' },
        { label: 'Accès sécurisé', value: 'Delmas 50' },
      ],
      primaryCtaText: 'Formulaire de Préinscription',
      primaryCtaAction: () => onNavigate('pre-registration'),
      fullCaption: 'Entrée principale du Collège Isaac Newton (Delmas 50, rue Dominique #2 bis). Architecture soignée arborant la devise officielle « Savoir aujourd’hui, réussir demain ».'
    },
    {
      id: 'computer-lab',
      image: SCHOOL_IMAGES.computerLab,
      // Adjusted so the classroom computers and workstations are well positioned
      objectPosition: 'center 38%',
      tag: 'Pôle Technologies & Innovation',
      tagIcon: Cpu,
      title: 'Laboratoire Numérique Moderne',
      motto: 'Initiation pratique dès le fondamental',
      description: 'Postes connectés individuels sous alimentation électrique continue : bureautique, logique algorithmique, codage et éthique du web.',
      metrics: [
        { label: 'Postes connectés', value: 'Individuels' },
        { label: 'Énergie secourue', value: '24/7' },
        { label: 'Pratique dès la', value: '1ère AF' },
      ],
      primaryCtaText: 'Voir le pôle technologique',
      primaryCtaAction: () => onNavigate('programs', 'numerique'),
      fullCaption: 'Laboratoire informatique climatisé et sécurisé équipé d’ordinateurs connectés pour la maîtrise pratique des outils numériques.'
    },
    {
      id: 'graduation-promo',
      image: SCHOOL_IMAGES.graduationPromo,
      // Adjusted for the graduates in royal blue robes and mortarboard caps on the ceremonial stage (Image 2)
      objectPosition: 'center 22%',
      tag: 'Promotion des Diplômés · Cérémonie de Graduation',
      tagIcon: Award,
      title: 'Former les Bâtisseurs de Demain',
      motto: '100% de réussite aux examens officiels d’État',
      description: 'Une préparation d’élite aux examens officiels d’État (9e AF et Baccalauréat NS4) ouvrant les portes des meilleures universités en Haïti et à l’international.',
      metrics: [
        { label: 'Examens officiels', value: '100% Réussite' },
        { label: 'Orientation études', value: 'Personnalisée' },
        { label: 'Taux de passage', value: 'Excellence' },
      ],
      primaryCtaText: 'Découvrir nos programmes',
      primaryCtaAction: () => onNavigate('programs'),
      fullCaption: 'Cérémonie solennelle de collation des diplômes des finissants du Collège Isaac Newton, vêtus des toges et toques académiques bleues et blanches.'
    },
    {
      id: 'campus-courtyard',
      image: SCHOOL_IMAGES.campusCourtyard,
      objectPosition: 'center 28%',
      tag: 'Campus Principal · Delmas 50',
      tagIcon: Building,
      title: 'Un Campus d’Excellence à Delmas 50',
      motto: '« Apprendre aujourd’hui pour bâtir demain »',
      description: 'Bâtiment moderne multi-niveaux, salles spacieuses et aérées, terrain multisports et environnement sécurisé avec contrôle d’accès permanent.',
      metrics: [
        { label: 'Classes spacieuses', value: '3 Cycles' },
        { label: 'Terrain multisports', value: 'Sécurisé' },
        { label: 'Campus moderne', value: 'Delmas 50' },
      ],
      primaryCtaText: 'Visiter le campus',
      primaryCtaAction: () => onNavigate('college', 'infrastructures'),
      fullCaption: 'Vue d’ensemble du campus principal du Collège Isaac Newton à Delmas 50 avec ses galeries aérées et sa cour sécurisée.'
    }
  ];

  const totalSlides = slides.length;

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const goToSlide = (idx: number) => {
    setCurrentSlide(idx);
  };

  // Auto-play interval
  useEffect(() => {
    if (isPlaying && !isHovered && !isZoomOpen) {
      timerRef.current = setInterval(() => {
        nextSlide();
      }, 6500);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, isHovered, isZoomOpen, currentSlide]);

  const active = slides[currentSlide];
  const TagIcon = active.tagIcon;

  return (
    <div 
      className="relative overflow-hidden bg-slate-950 text-white select-none group/slideshow"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Visual Container with tailored height */}
      <div className="relative min-h-[520px] sm:min-h-[580px] lg:min-h-[620px] w-full flex items-center">
        
        {/* Background Images Cross-Fade */}
        {slides.map((s, idx) => {
          const isActive = idx === currentSlide;
          return (
            <div
              key={s.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <img
                src={s.image}
                alt={s.title}
                referrerPolicy="no-referrer"
                loading={idx === 0 ? 'eager' : 'lazy'}
                decoding="async"
                fetchPriority={idx === 0 ? 'high' : 'auto'}
                style={{ objectPosition: s.objectPosition }}
                className={`w-full h-full object-cover transition-transform duration-[7000ms] ease-out ${
                  isActive ? 'scale-103' : 'scale-100'
                }`}
              />
              {/* Controlled gradient overlays designed to keep the building facade and signs crisp & bright */}
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/75 to-blue-950/30" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/35" />
            </div>
          );
        })}

        {/* Slideshow Top Floating Meta Strip - Exact Contact Info from user card */}
        <div className="absolute top-3 sm:top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-2 max-w-7xl mx-auto pointer-events-none">
          {/* Delmas 50 & Phone Quick Tag */}
          <div className="pointer-events-auto inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/15 text-xs text-slate-200 shadow-md">
            <span className="flex items-center gap-1 text-amber-400 font-semibold">
              <MapPin className="w-3.5 h-3.5" />
              <span>Delmas 50, rue Dominique #2 bis</span>
            </span>
            <span className="text-slate-500">|</span>
            <div className="flex items-center gap-1 font-mono text-white text-[11px]">
              <Phone className="w-3 h-3 text-amber-400 shrink-0" />
              <a href="tel:+50933160934" className="hover:text-amber-300 transition-colors">+509 3316-0934</a>
              <span className="text-white/40">/</span>
              <a href="tel:+50937211818" className="hover:text-amber-300 transition-colors">+509 3721-1818</a>
            </div>
          </div>

          {/* Quick controls: Play/Pause & Fullscreen preview */}
          <div className="pointer-events-auto flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md px-2 py-1 rounded-full border border-white/15 text-xs">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title={isPlaying ? 'Mettre en pause' : 'Lancer le diaporama'}
              aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
            <span className="text-slate-600">|</span>
            <button
              onClick={() => setIsZoomOpen(true)}
              className="p-1 rounded-full text-slate-300 hover:text-amber-300 hover:bg-white/10 transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
              title="Agrandir la photo actuelle"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Agrandir</span>
            </button>
          </div>
        </div>

        {/* Main Slide Content - Institutional Editorial */}
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 w-full">
          <div className="max-w-2xl sm:max-w-3xl space-y-4 sm:space-y-5">
            
            {/* Tag Badge */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-bold shadow-sm tracking-wide">
                <TagIcon className="w-3.5 h-3.5 text-slate-950" />
                <span>{active.tag}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-slate-200 text-xs font-medium border border-white/20">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Admissions {SCHOOL_INFO.currentYear} en cours</span>
              </span>
            </div>

            {/* Slide Title */}
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
              {active.title}
            </h1>

            {/* Official Motto Callout */}
            <div className="inline-block px-3.5 py-1.5 rounded-lg bg-blue-900/60 border border-blue-400/30 backdrop-blur-sm">
              <p className="font-serif italic text-amber-300 text-sm sm:text-base font-semibold">
                {active.motto}
              </p>
            </div>

            {/* Narrative description */}
            <p className="text-xs sm:text-sm lg:text-base text-slate-200 leading-relaxed font-light max-w-2xl">
              {active.description}
            </p>

            {/* Metrics Chips */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-1 max-w-lg">
              {active.metrics.map((m, i) => (
                <div key={i} className="p-2 sm:p-2.5 rounded-xl bg-slate-900/60 backdrop-blur-md border border-white/10">
                  <p className="font-serif font-bold text-sm sm:text-base text-amber-400">{m.value}</p>
                  <p className="text-[10px] sm:text-[11px] text-slate-300 font-medium truncate">{m.label}</p>
                </div>
              ))}
            </div>

            {/* Action Buttons Row */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
              <button
                onClick={active.primaryCtaAction}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all active:scale-98 cursor-pointer"
              >
                <GraduationCap className="w-4 h-4 text-slate-950" />
                <span>{active.primaryCtaText}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white/10 text-white font-mono text-xs sm:text-sm backdrop-blur-md border border-white/20">
                <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <a href="tel:+50933160934" className="hover:text-amber-300 transition-colors">+509 3316-0934</a>
                <span className="text-white/40 font-sans">/</span>
                <a href="tel:+50937211818" className="hover:text-amber-300 transition-colors">+509 3721-1818</a>
              </div>

              <button
                onClick={() => onNavigate('contact')}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 text-xs font-medium transition-colors cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>Delmas 50, rue Dominique #2 bis</span>
              </button>
            </div>

          </div>
        </div>

        {/* Previous / Next Arrow Controls */}
        <button
          onClick={prevSlide}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-slate-900/70 hover:bg-slate-900/90 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-md"
          aria-label="Diapositive précédente"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-slate-900/70 hover:bg-slate-900/90 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-md"
          aria-label="Diapositive suivante"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Bottom Slideshow Navigation Strip with Indicators and Thumbnails */}
        <div className="absolute bottom-3 sm:bottom-4 left-0 right-0 z-30 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
            
            {/* Interactive Thumbnail / Dot Pills */}
            <div className="flex items-center gap-2 overflow-x-auto py-1 max-w-full">
              {slides.map((s, idx) => {
                const isActive = idx === currentSlide;
                return (
                  <button
                    key={s.id}
                    onClick={() => goToSlide(idx)}
                    className={`group relative flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all text-xs cursor-pointer ${
                      isActive 
                        ? 'bg-blue-900/90 border-amber-400 text-white shadow-md' 
                        : 'bg-slate-900/70 border-white/10 text-slate-300 hover:bg-slate-900 hover:text-white'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-amber-400' : 'bg-slate-500'}`} />
                    <span className="font-mono text-[10px] text-amber-300">0{idx + 1}</span>
                    <span className="font-medium text-[11px] hidden md:inline truncate max-w-[130px]">
                      {s.tag.split('·')[0].trim()}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Progress / Timing Indicator */}
            <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono text-slate-400 bg-slate-900/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
              <span className="text-amber-400 font-bold">{currentSlide + 1}</span>
              <span>/</span>
              <span>{totalSlides}</span>
              <span className="text-slate-600">·</span>
              <span className="text-[10px] text-slate-300">{active.tag.split('·')[0].trim()}</span>
            </div>

          </div>
        </div>

      </div>

      {/* FULLSCREEN LIGHTBOX MODAL FOR HIGH-RES VIEW OF BUILDING / CEREMONY */}
      <ImageLightboxModal
        isOpen={isZoomOpen}
        onClose={() => setIsZoomOpen(false)}
        items={slides.map((s) => ({
          id: s.id,
          title: s.title,
          caption: s.fullCaption || s.description,
          category: s.tag ? s.tag.split('·')[0].trim() : 'Campus Principal',
          imageUrl: s.image,
          altText: s.title,
        }))}
        currentIndex={currentSlide}
        onIndexChange={(idx) => setCurrentSlide(idx)}
      />

    </div>
  );
};
