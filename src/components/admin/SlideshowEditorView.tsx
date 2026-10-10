import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  Plus, 
  Trash2, 
  Eye, 
  Image as ImageIcon, 
  CheckCircle2, 
  Save, 
  RotateCcw, 
  Laptop, 
  Smartphone, 
  Tablet, 
  Sparkles, 
  ShieldCheck, 
  ChevronLeft, 
  ChevronRight, 
  Database, 
  Columns, 
  FileText, 
  Maximize2,
  X,
  CloudDownload
} from 'lucide-react';
import { toast } from 'sonner';
import { HeroSlide, MediaItem, Role } from '../../types';
import { apiService } from '../../services/api';
import { SCHOOL_IMAGES } from '../../assets/images';
import { ImageUploadCompressor } from '../common/ImageUploadCompressor';
import { getHeroSlideImageUrl } from '../../utils/cacheBuster';

interface SlideshowEditorViewProps {
  currentUserRole?: Role;
  onNavigate?: (page: string, subSection?: string) => void;
}

export const SlideshowEditorView: React.FC<SlideshowEditorViewProps> = ({
  currentUserRole = 'ADMIN',
  onNavigate
}) => {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [selectedSlideIndex, setSelectedSlideIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Device simulation for live preview
  const [previewDevice, setPreviewDevice] = useState<'desktop-14' | 'tablet' | 'mobile'>('desktop-14');
  
  // Workspace view mode (especially useful on 14" laptops with limited vertical/horizontal room)
  // 'split': side-by-side form & preview
  // 'form': full-width form for maximum typing comfort
  // 'preview': large preview with minimal sidebar
  const [workspaceMode, setWorkspaceMode] = useState<'split' | 'form' | 'preview'>('split');

  // Media picker modal state
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [showUploader, setShowUploader] = useState(false);

  // Active working slide (local draft in form)
  const [formDraft, setFormDraft] = useState<HeroSlide | null>(null);

  // Load slides on mount and listen to updates
  useEffect(() => {
    loadSlides();
    loadMedia();

    const onSlidesUpdate = (e: any) => {
      if (e.detail && Array.isArray(e.detail)) {
        setSlides(e.detail);
      }
    };
    window.addEventListener('cin:slides-updated', onSlidesUpdate);
    return () => window.removeEventListener('cin:slides-updated', onSlidesUpdate);
  }, []);

  const loadSlides = async () => {
    setIsLoading(true);
    try {
      const data = await apiService.getHeroSlides();
      setSlides(data);
      if (data.length > 0) {
        setSelectedSlideIndex(0);
        setFormDraft({ ...data[0] });
      }
    } catch {
      toast.error('Erreur lors du chargement des diapositives');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMedia = async () => {
    try {
      const items = await apiService.getMedia();
      setMediaItems(items);
    } catch {
      // Ignore
    }
  };

  // Switch selected slide
  const handleSelectSlide = (index: number) => {
    if (index >= 0 && index < slides.length) {
      setSelectedSlideIndex(index);
      setFormDraft({ ...slides[index] });
    }
  };

  // Field change in form
  const handleFieldChange = (field: keyof HeroSlide, value: any) => {
    if (!formDraft) return;
    setFormDraft({
      ...formDraft,
      [field]: value
    });
  };

  // Save changes to current slide and sync to DB
  const handleSaveCurrentSlide = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formDraft) return;

    if (!formDraft.title.trim()) {
      toast.error('Le titre principal de la diapositive est requis');
      return;
    }

    setIsSaving(true);
    try {
      const updatedSlides = slides.map((s, idx) => 
        idx === selectedSlideIndex ? formDraft : s
      );
      
      setSlides(updatedSlides);
      const success = await apiService.saveHeroSlides(updatedSlides);
      
      if (success) {
        toast.success('Diapositive d’accueil enregistrée avec succès dans PostgreSQL !');
      } else {
        toast.success('Diapositive mise à jour localement');
      }
    } catch (err: any) {
      toast.error('Erreur lors de la sauvegarde : ' + (err.message || 'Erreur réseau'));
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle slide active status
  const handleToggleActive = async (index: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const updated = slides.map((s, idx) => 
      idx === index ? { ...s, isActive: !s.isActive } : s
    );
    setSlides(updated);
    if (index === selectedSlideIndex && formDraft) {
      setFormDraft({ ...formDraft, isActive: !formDraft.isActive });
    }
    await apiService.saveHeroSlides(updated);
    toast.success(`Diapositive #${index + 1} ${updated[index].isActive ? 'activée' : 'masquée'}`);
  };

  // Add a new slide
  const handleAddNewSlide = async () => {
    const newSlide: HeroSlide = {
      id: `slide-${Date.now()}`,
      image: SCHOOL_IMAGES.entranceFacade,
      badge: 'Campus Principal · Delmas 50, rue Dominique #2 bis',
      title: 'Nouvelle Diapositive d’Excellence',
      subtitle: '« Savoir aujourd’hui, réussir demain » — Présentation du projet éducatif et des infrastructures.',
      objectPosition: 'center 35%',
      ctaText: 'Formulaire de Préinscription',
      ctaTarget: 'pre-registration',
      secondaryCtaText: 'Secrétariat (+509 3316-0934)',
      secondaryCtaTarget: 'contact',
      isActive: true,
      order: slides.length + 1,
    };

    const updated = [...slides, newSlide];
    setSlides(updated);
    const newIndex = updated.length - 1;
    setSelectedSlideIndex(newIndex);
    setFormDraft({ ...newSlide });
    await apiService.saveHeroSlides(updated);
    toast.success('Nouvelle diapositive ajoutée au carrousel !');
  };

  // Delete a slide
  const handleDeleteSlide = async (index: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (slides.length <= 1) {
      toast.error('Vous devez conserver au moins une diapositive pour l’entête.');
      return;
    }

    if (!window.confirm(`Supprimer définitivement la diapositive #${index + 1} ?`)) return;

    const slideToDelete = slides[index];
    const updated = slides.filter((_, idx) => idx !== index);
    updated.forEach((s, idx) => { s.order = idx + 1; });
    setSlides(updated);
    const nextIndex = Math.max(0, index - 1);
    setSelectedSlideIndex(nextIndex);
    setFormDraft(updated[nextIndex] ? { ...updated[nextIndex] } : null);
    await apiService.saveHeroSlides(updated);
    if (slideToDelete?.id) {
      await apiService.deleteHeroSlide(slideToDelete.id);
    }
    toast.success('Diapositive retirée du carrousel');
  };

  // Move slide up or down
  const handleMoveSlide = async (index: number, direction: 'up' | 'down', e?: React.MouseEvent) => {
    e?.stopPropagation();
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= slides.length) return;

    const newSlides = [...slides];
    const temp = newSlides[index];
    newSlides[index] = newSlides[targetIndex];
    newSlides[targetIndex] = temp;

    // reindex order
    newSlides.forEach((s, idx) => s.order = idx + 1);

    setSlides(newSlides);
    setSelectedSlideIndex(targetIndex);
    setFormDraft({ ...newSlides[targetIndex] });
    await apiService.saveHeroSlides(newSlides);
    toast.success('Ordre des diapositives mis à jour');
  };

  // Reset to school default slides
  // Reset to authentic school default slides
  const handleResetToDefault = async () => {
    if (!window.confirm('Rétablir les 6 diapositives officielles d’origine du Collège Isaac Newton ?')) return;

    const defaultSlides: HeroSlide[] = [
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

    setSlides(defaultSlides);
    setSelectedSlideIndex(0);
    setFormDraft({ ...defaultSlides[0] });
    await apiService.saveHeroSlides(defaultSlides);
    toast.success('Diapositives réinitialisées avec succès');
  };

  // One-click live production sync
  const handleSyncFromLiveServer = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('https://collegeisaacnewton.com/api/slides?_t=' + Date.now());
      if (!res.ok) throw new Error('Impossible de contacter le serveur Live (HTTP ' + res.status + ')');
      const liveSlides = await res.json();
      if (!Array.isArray(liveSlides) || liveSlides.length === 0) {
        throw new Error('Aucune diapositive renvoyée par le serveur Live');
      }

      await apiService.saveHeroSlides(liveSlides);
      setSlides(liveSlides);
      setSelectedSlideIndex(0);
      setFormDraft({ ...liveSlides[0] });
      toast.success(`${liveSlides.length} diapositives synchronisées depuis collegeisaacnewton.com !`);
    } catch (err: any) {
      toast.error(`Échec de la synchronisation Live: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const activeCount = slides.filter(s => s.isActive).length;

  return (
    <div className="space-y-4 font-sans text-slate-900">
      
      {/* =========================================================================
          1. COMPACT RESPONSIVE HEADER (OPTIMIZED FOR 14" LAPTOP, TABLET & MOBILE)
      ========================================================================= */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900 rounded-2xl p-3.5 sm:p-4 text-white shadow-md border border-blue-800/40 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-[11px] font-bold">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Diaporama d'Entête (Carrousel Principal)</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800/90 text-slate-300 text-[10px] font-mono border border-white/10">
              <Database className="w-2.5 h-2.5 text-emerald-400" />
              <span>{activeCount}/{slides.length} actives</span>
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
            Configuration de la Diapositive d'Entête
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-300 line-clamp-1 max-w-xl">
            Modifiez en direct les photos réelles, devises et boutons affichés en haut de la page d’accueil.
          </p>
        </div>

        {/* View Mode Controls (Partagé / Formulaire seul / Aperçu seul) */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Workspace mode selector */}
          <div className="inline-flex p-1 bg-slate-900/90 rounded-xl border border-white/15 text-xs shadow-inner">
            <button
              type="button"
              onClick={() => setWorkspaceMode('split')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                workspaceMode === 'split'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
              title="Affichage partagé Formulaire + Aperçu"
            >
              <Columns className="w-3 h-3" />
              <span className="hidden sm:inline">Partagé</span>
            </button>
            <button
              type="button"
              onClick={() => setWorkspaceMode('form')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                workspaceMode === 'form'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
              title="Formulaire plein écran pour confort de saisie sur PC 14 pouces"
            >
              <FileText className="w-3 h-3" />
              <span>Formulaire</span>
            </button>
            <button
              type="button"
              onClick={() => setWorkspaceMode('preview')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                workspaceMode === 'preview'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
              title="Aperçu direct grand format"
            >
              <Maximize2 className="w-3 h-3" />
              <span>Aperçu</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleAddNewSlide}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition-colors shadow-xs cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Diapositive</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          2. COMPACT, FLUID SLIDE SELECTOR RIBBON (LOW VERTICAL PROFILE)
      ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-2.5 sm:p-3">
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-900" />
              <span>Diapositives du Carrousel ({slides.length})</span>
            </span>
            <span className="text-[10px] text-slate-500 hidden md:inline">
              (Cliquez pour sélectionner et éditer)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSyncFromLiveServer}
              disabled={isLoading}
              className="text-[10.5px] font-semibold text-blue-900 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer border border-blue-200"
              title="Importer en 1 clic les photos et diapositives réelles depuis collegeisaacnewton.com"
            >
              <CloudDownload className="w-3.5 h-3.5 text-blue-700" />
              <span>Synchroniser depuis le Live</span>
            </button>

            <button
              type="button"
              onClick={handleResetToDefault}
              className="text-[10.5px] font-semibold text-slate-500 hover:text-blue-900 transition-colors flex items-center gap-1 cursor-pointer"
              title="Restaurer les 6 diapositives officielles d'origine"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Valeurs d'origine</span>
            </button>
          </div>
        </div>

        {/* Scrollable Thumbnails Strip - Ergonomic on 14" PC & mobile */}
        <div className="flex items-stretch gap-2.5 overflow-x-auto pb-1.5 pt-0.5 no-scrollbar scroll-smooth">
          {slides.map((slide, idx) => {
            const isSelected = idx === selectedSlideIndex;
            return (
              <div
                key={slide.id || idx}
                onClick={() => handleSelectSlide(idx)}
                className={`relative shrink-0 w-44 sm:w-52 rounded-xl border-2 overflow-hidden cursor-pointer transition-all flex flex-col justify-between group ${
                  isSelected
                    ? 'border-blue-900 ring-2 ring-blue-900/20 shadow-md bg-blue-50/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white opacity-85 hover:opacity-100'
                }`}
              >
                <div className="relative aspect-[16/9] bg-slate-950 overflow-hidden">
                  <img
                    src={getHeroSlideImageUrl(slide.image, slide)}
                    alt={slide.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    style={{ objectPosition: slide.objectPosition || 'center 35%' }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                  
                  {/* Slide number and active badge */}
                  <div className="absolute top-1 left-1 flex items-center gap-1">
                    <span className="bg-blue-950/90 text-amber-400 text-[9px] font-black px-1.5 py-0.2 rounded shadow-xs">
                      #{idx + 1}
                    </span>
                    <span className={`text-[8.5px] font-bold px-1.5 py-0.2 rounded-full ${
                      slide.isActive ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300'
                    }`}>
                      {slide.isActive ? 'En ligne' : 'Off'}
                    </span>
                  </div>

                  <div className="absolute bottom-1 left-1.5 right-1.5 text-white">
                    <h4 className="font-bold text-[11px] leading-tight truncate text-white">
                      {slide.title || 'Sans titre'}
                    </h4>
                  </div>
                </div>

                {/* Compact Slide Controls Bar */}
                <div className="p-1 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-0.5">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={(e) => handleMoveSlide(idx, 'up', e)}
                      className="p-1 rounded text-slate-400 hover:text-slate-800 disabled:opacity-20 cursor-pointer"
                      title="Déplacer vers la gauche"
                    >
                      <ChevronLeft className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === slides.length - 1}
                      onClick={(e) => handleMoveSlide(idx, 'down', e)}
                      className="p-1 rounded text-slate-400 hover:text-slate-800 disabled:opacity-20 cursor-pointer"
                      title="Déplacer vers la droite"
                    >
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => handleToggleActive(idx, e)}
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded cursor-pointer ${
                        slide.isActive ? 'text-amber-800 hover:bg-amber-100' : 'text-emerald-700 hover:bg-emerald-100'
                      }`}
                    >
                      {slide.isActive ? 'Masquer' : 'Activer'}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteSlide(idx, e)}
                      className="p-1 rounded text-rose-500 hover:bg-rose-100 cursor-pointer"
                      title="Supprimer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Quick Add Slide Card */}
          <button
            type="button"
            onClick={handleAddNewSlide}
            className="shrink-0 w-32 rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-900 bg-slate-50 hover:bg-blue-50/40 flex flex-col items-center justify-center gap-1 text-slate-500 hover:text-blue-900 transition-all cursor-pointer p-2"
          >
            <div className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-2xs">
              <Plus className="w-3.5 h-3.5" />
            </div>
            <span className="text-[11px] font-bold">+ Ajouter</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          3. MAIN ADAPTIVE WORKSPACE (FORM & PREVIEW WITH WORKSPACE MODES)
      ========================================================================= */}
      {formDraft && (
        <div className={`grid gap-4 items-start ${
          workspaceMode === 'split' 
            ? 'grid-cols-1 xl:grid-cols-12' 
            : 'grid-cols-1'
        }`}>
          
          {/* =====================================================================
              FORM SECTION (Full width in 'form' mode, 7 cols in 'split' mode)
          ===================================================================== */}
          {(workspaceMode === 'split' || workspaceMode === 'form') && (
            <div className={`${
              workspaceMode === 'split' ? 'xl:col-span-7' : 'w-full max-w-4xl mx-auto'
            } bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-5 space-y-4`}>
              
              {/* Form Title & Active Toggle */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-blue-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    #{selectedSlideIndex + 1}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-tight">
                      Modifier la Diapositive #{selectedSlideIndex + 1}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Les modifications s'affichent instantanément dans l'aperçu dynamique.
                    </p>
                  </div>
                </div>

                {/* Status Switch */}
                <label className="inline-flex items-center gap-2 cursor-pointer bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200">
                  <input
                    type="checkbox"
                    checked={formDraft.isActive}
                    onChange={(e) => handleFieldChange('isActive', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4.5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-emerald-600"></div>
                  <span className="text-[11px] font-bold text-slate-700">
                    {formDraft.isActive ? 'En ligne' : 'Masquée'}
                  </span>
                </label>
              </div>

              <form onSubmit={handleSaveCurrentSlide} className="space-y-3.5">
                
                {/* 1. Surtitre / Badge de localisation */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Surtitre / Badge de localisation
                  </label>
                  <input
                    type="text"
                    value={formDraft.badge || ''}
                    onChange={(e) => handleFieldChange('badge', e.target.value)}
                    placeholder="Ex : Campus Principal · Delmas 50, rue Dominique #2 bis"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-900 focus:ring-2 focus:ring-blue-900/10 font-semibold text-slate-800"
                  />
                </div>

                {/* 2. Titre Principal */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Titre Principal <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formDraft.title || ''}
                    onChange={(e) => handleFieldChange('title', e.target.value)}
                    placeholder="Ex : Collège Isaac Newton"
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-blue-900 focus:ring-2 focus:ring-blue-900/10 font-bold text-slate-900"
                  />
                </div>

                {/* 3. Sous-titre / Slogan / Devise */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Sous-titre, Devise ou Slogan Pédagogique
                  </label>
                  <textarea
                    rows={2}
                    value={formDraft.subtitle || ''}
                    onChange={(e) => handleFieldChange('subtitle', e.target.value)}
                    placeholder="Ex : « Savoir aujourd’hui, réussir demain » — Notre campus moderne et sécurisé à Delmas 50..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-900 focus:ring-2 focus:ring-blue-900/10 text-slate-700 leading-relaxed resize-none"
                  />
                </div>

                {/* 4. Image de Fond & Cadrage (Adaptive for small & 14" screens) */}
                <div className="p-3 sm:p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-blue-900" />
                      <span>Photo d'Arrière-Plan du Diaporama</span>
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setShowMediaPicker(true)}
                        className="px-2.5 py-1 rounded-lg bg-blue-900 text-white text-[10.5px] font-bold hover:bg-blue-950 transition-colors cursor-pointer"
                      >
                        Médiathèque
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowUploader(!showUploader)}
                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 text-[10.5px] font-bold hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        {showUploader ? 'Fermer' : 'Téléverser'}
                      </button>
                    </div>
                  </div>

                  {showUploader && (
                    <div className="p-3 bg-white rounded-xl border border-slate-200">
                      <ImageUploadCompressor
                        onImageReady={(dataUrl: string) => {
                          handleFieldChange('image', dataUrl);
                          setShowUploader(false);
                          toast.success('Nouvelle image importée et sélectionnée !');
                        }}
                        recommendedAspect="16:9"
                        compact
                        enforce169AspectRatio={true}
                      />
                    </div>
                  )}

                  {/* Direct Image URL input */}
                  <div>
                    <label className="block text-[10.5px] font-semibold text-slate-600 mb-1">
                      Chemin / URL de la photo
                    </label>
                    <input
                      type="text"
                      value={formDraft.image || ''}
                      onChange={(e) => handleFieldChange('image', e.target.value)}
                      placeholder="https://... ou /images/..."
                      className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-blue-900 text-slate-700"
                    />
                  </div>

                  {/* Preset Campus Images for 1-Click Fast Setup */}
                  <div className="space-y-1">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Vues authentiques recommandées (Collège Isaac Newton)
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      {[
                        { title: 'Façade Principale', url: '/images/campus_facade_real_1790679454540.jpg' },
                        { title: 'Laboratoire Tech', url: '/images/computer_lab_real_1790679476180.jpg' },
                        { title: 'Graduation', url: '/images/graduation_promo_real_1790679465649.jpg' },
                        { title: 'Cour Intérieure', url: '/images/campus_courtyard_building_1790531780046.jpg' },
                      ].map((preset) => (
                        <button
                          key={preset.url}
                          type="button"
                          onClick={() => {
                            handleFieldChange('image', preset.url);
                            toast.success(`${preset.title} sélectionnée !`);
                          }}
                          className={`px-2 py-1 rounded-lg text-[10.5px] font-semibold truncate transition-colors cursor-pointer text-left ${
                            formDraft.image === preset.url
                              ? 'bg-blue-900 text-white font-bold'
                              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                          title={preset.title}
                        >
                          {preset.title}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Image Position Selector (Object Position) */}
                  <div>
                    <label className="block text-[10.5px] font-semibold text-slate-600 mb-1">
                      Cadrage Vertical (Object Position)
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      {[
                        { label: 'Haut (25%)', val: 'center 25%' },
                        { label: 'Façade (35%)', val: 'center 35%' },
                        { label: 'Centré (50%)', val: 'center 50%' },
                        { label: 'Bas (65%)', val: 'center 65%' },
                      ].map((pos) => (
                        <button
                          key={pos.val}
                          type="button"
                          onClick={() => handleFieldChange('objectPosition', pos.val)}
                          className={`py-1.5 px-2 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer ${
                            formDraft.objectPosition === pos.val
                              ? 'bg-blue-900 text-white shadow-2xs'
                              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {pos.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 5. Boutons d'Action (CTA 1 & CTA 2) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 sm:p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  {/* CTA 1 */}
                  <div className="space-y-1">
                    <label className="block text-[10.5px] font-bold text-slate-700">
                      Bouton Principal (Bleu & Or)
                    </label>
                    <input
                      type="text"
                      value={formDraft.ctaText || ''}
                      onChange={(e) => handleFieldChange('ctaText', e.target.value)}
                      placeholder="Texte : Formulaire de Préinscription"
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-semibold text-slate-800"
                    />
                    <select
                      value={formDraft.ctaTarget || 'pre-registration'}
                      onChange={(e) => handleFieldChange('ctaTarget', e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700"
                    >
                      <option value="pre-registration">Page : Préinscription</option>
                      <option value="programs">Page : Formations & Pôles</option>
                      <option value="college">Page : Le Collège</option>
                      <option value="contact">Page : Contact</option>
                    </select>
                  </div>

                  {/* CTA 2 */}
                  <div className="space-y-1">
                    <label className="block text-[10.5px] font-bold text-slate-700">
                      Bouton Secondaire (Transparent)
                    </label>
                    <input
                      type="text"
                      value={formDraft.secondaryCtaText || ''}
                      onChange={(e) => handleFieldChange('secondaryCtaText', e.target.value)}
                      placeholder="Texte : Secrétariat (+509 3316-0934)"
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-800"
                    />
                    <select
                      value={formDraft.secondaryCtaTarget || 'contact'}
                      onChange={(e) => handleFieldChange('secondaryCtaTarget', e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700"
                    >
                      <option value="contact">Page : Contact & Secrétariat</option>
                      <option value="pre-registration">Page : Préinscription</option>
                      <option value="programs">Page : Formations & Pôles</option>
                      <option value="college">Page : Le Collège</option>
                    </select>
                  </div>
                </div>

                {/* SAVE ACTION BUTTON - Always visible and comfortable */}
                <div className="pt-2 flex items-center justify-between gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setFormDraft({ ...slides[selectedSlideIndex] })}
                    className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs transition-colors cursor-pointer"
                  >
                    Réinitialiser formulaire
                  </button>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Enregistrement...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 text-amber-400" />
                        <span>Enregistrer & Publier</span>
                      </>
                    )}
                  </button>
                </div>

              </form>
            </div>
          )}

          {/* =====================================================================
              PREVIEW SECTION (Live Simulation for PC 14", Tablet, & Mobile)
          ===================================================================== */}
          {(workspaceMode === 'split' || workspaceMode === 'preview') && (
            <div className={`${
              workspaceMode === 'split' ? 'xl:col-span-5' : 'w-full max-w-4xl mx-auto'
            } space-y-3 xl:sticky xl:top-4`}>
              
              <div className="bg-slate-900 text-white rounded-2xl p-2.5 sm:p-3 flex items-center justify-between shadow-xs gap-2 flex-wrap">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-amber-400" />
                  <span>Aperçu en Direct sur la Page d'Accueil</span>
                </span>

                {/* Multi-Device Switcher with PC 14" Support */}
                <div className="flex items-center gap-1 p-0.5 bg-slate-800 rounded-lg text-xs">
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('desktop-14')}
                    className={`p-1 px-2 rounded-md font-semibold text-[10px] flex items-center gap-1 cursor-pointer transition-colors ${
                      previewDevice === 'desktop-14' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                    title="Simulation Ordinateur / PC 14 pouces"
                  >
                    <Laptop className="w-3 h-3" />
                    <span>PC 14"</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('tablet')}
                    className={`p-1 px-2 rounded-md font-semibold text-[10px] flex items-center gap-1 cursor-pointer transition-colors ${
                      previewDevice === 'tablet' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                    title="Simulation Tablette iPad"
                  >
                    <Tablet className="w-3 h-3" />
                    <span>Tablette</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('mobile')}
                    className={`p-1 px-2 rounded-md font-semibold text-[10px] flex items-center gap-1 cursor-pointer transition-colors ${
                      previewDevice === 'mobile' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                    title="Simulation Mobile Smartphone"
                  >
                    <Smartphone className="w-3 h-3" />
                    <span>Mobile</span>
                  </button>
                </div>
              </div>

              {/* LIVE PREVIEW CONTAINER WITH DYNAMIC ASPECT RATIOS */}
              <div className={`mx-auto transition-all duration-300 ${
                previewDevice === 'mobile' 
                  ? 'max-w-[320px]' 
                  : previewDevice === 'tablet' 
                  ? 'max-w-[500px]' 
                  : 'w-full'
              }`}>
                <div className={`relative rounded-2xl overflow-hidden shadow-xl border-2 border-slate-900 bg-slate-950 flex flex-col justify-end ${
                  previewDevice === 'mobile' 
                    ? 'aspect-[9/14]' 
                    : previewDevice === 'tablet'
                    ? 'aspect-[4/3]'
                    : 'aspect-[16/10]'
                }`}>
                  
                  {/* Background Image with objectPosition */}
                  <img
                    src={getHeroSlideImageUrl(formDraft.image, formDraft)}
                    alt={formDraft.title}
                    className="absolute inset-0 w-full h-full object-cover select-none"
                    style={{ objectPosition: formDraft.objectPosition || 'center 35%' }}
                  />

                  {/* Dark Gradient Overlay for high readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

                  {/* Live Content Overlay */}
                  <div className="relative z-10 p-3.5 sm:p-4 space-y-1.5 text-white">
                    
                    {/* Badge */}
                    {formDraft.badge && (
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-950/80 border border-blue-400/30 text-amber-300 text-[9px] font-bold">
                        <ShieldCheck className="w-2.5 h-2.5" />
                        <span className="truncate max-w-[220px]">{formDraft.badge}</span>
                      </div>
                    )}

                    {/* Title */}
                    <h3 className="text-sm sm:text-base font-black text-white leading-tight drop-shadow-sm">
                      {formDraft.title || 'Titre de la Diapositive'}
                    </h3>

                    {/* Subtitle */}
                    <p className="text-[10.5px] sm:text-xs text-slate-200 line-clamp-2 leading-relaxed drop-shadow-xs">
                      {formDraft.subtitle || 'Sous-titre et devise de l’établissement scolaire...'}
                    </p>

                    {/* Buttons Preview */}
                    <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
                      {formDraft.ctaText && (
                        <span className="px-2 py-0.5 rounded-lg bg-blue-900 border border-blue-700 text-white font-bold text-[9.5px] shadow-xs">
                          {formDraft.ctaText}
                        </span>
                      )}
                      {formDraft.secondaryCtaText && (
                        <span className="px-2 py-0.5 rounded-lg bg-white/20 backdrop-blur-xs text-white text-[9.5px] font-medium border border-white/20">
                          {formDraft.secondaryCtaText}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status Indicator & Live Tag */}
                  <div className="absolute top-2 right-2 z-20 flex items-center gap-1">
                    <span className="px-2 py-0.5 rounded-full text-[8.5px] font-bold bg-blue-950/90 text-amber-300 border border-amber-400/30">
                      {previewDevice === 'desktop-14' ? 'PC 14"' : previewDevice === 'tablet' ? 'Tablette' : 'Mobile'}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[8.5px] font-black uppercase ${
                      formDraft.isActive ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {formDraft.isActive ? 'En ligne' : 'Masquée'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Helper Tips */}
              <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-100 text-[11px] text-blue-950 space-y-1">
                <p className="font-bold flex items-center gap-1 text-blue-900">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-900" />
                  <span>Synchronisation Dynamique</span>
                </p>
                <p className="text-blue-900/80 leading-relaxed text-[10.5px]">
                  Enregistrer met à jour directement PostgreSQL et le carrousel de la page d'accueil avec adaptation responsive automatique.
                </p>
              </div>

            </div>
          )}

        </div>
      )}

      {/* =========================================================================
          4. MEDIA PICKER MODAL (RESPONSIVE FOR ALL SCREEN SIZES)
      ========================================================================= */}
      {showMediaPicker && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-3xl p-4 sm:p-5 space-y-3 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-blue-900" />
                <span>Sélectionner une Image pour la Diapositive</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowMediaPicker(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 p-1 max-h-[60vh]">
              {mediaItems.map((media) => (
                <div
                  key={media.id}
                  onClick={() => {
                    handleFieldChange('image', media.url);
                    setShowMediaPicker(false);
                    toast.success('Image appliquée à la diapositive !');
                  }}
                  className="rounded-xl border border-slate-200 overflow-hidden cursor-pointer hover:border-blue-900 hover:shadow-md transition-all group flex flex-col justify-between"
                >
                  <div className="aspect-[16/10] bg-slate-900 overflow-hidden">
                    <img
                      src={media.url}
                      alt={media.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="p-1.5">
                    <p className="text-[10.5px] font-bold text-slate-800 truncate">{media.title}</p>
                    <span className="text-[9px] font-semibold text-slate-400">{media.category}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setShowMediaPicker(false)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
