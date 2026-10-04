import React, { useState, useEffect } from 'react';
import { 
  SlidersHorizontal, 
  Layers, 
  Plus, 
  Trash2, 
  Check, 
  Eye, 
  Image as ImageIcon, 
  ArrowRight, 
  CheckCircle2, 
  Save, 
  RotateCcw, 
  Laptop, 
  Smartphone, 
  Upload, 
  Sparkles, 
  ExternalLink,
  Phone,
  ShieldCheck,
  Cpu,
  Award,
  ChevronLeft,
  ChevronRight,
  Database,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { HeroSlide, MediaItem, Role } from '../../types';
import { apiService } from '../../services/api';
import { SCHOOL_IMAGES } from '../../assets/images';
import { ImageUploadCompressor } from '../common/ImageUploadCompressor';

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
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  
  // Media picker modal state
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [showUploader, setShowUploader] = useState(false);

  // Active working slide (local draft in form)
  const [formDraft, setFormDraft] = useState<HeroSlide | null>(null);

  // Load slides on mount
  useEffect(() => {
    loadSlides();
    loadMedia();
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
  const handleToggleActive = async (index: number) => {
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
  const handleDeleteSlide = async (index: number) => {
    if (slides.length <= 1) {
      toast.error('Vous devez conserver au moins une diapositive pour l’entête.');
      return;
    }

    if (!window.confirm(`Supprimer définitivement la diapositive #${index + 1} ?`)) return;

    const updated = slides.filter((_, idx) => idx !== index);
    setSlides(updated);
    const nextIndex = Math.max(0, index - 1);
    setSelectedSlideIndex(nextIndex);
    setFormDraft(updated[nextIndex] ? { ...updated[nextIndex] } : null);
    await apiService.saveHeroSlides(updated);
    toast.success('Diapositive retirée du carrousel');
  };

  // Move slide up or down
  const handleMoveSlide = async (index: number, direction: 'up' | 'down') => {
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
  const handleResetToDefault = async () => {
    if (!window.confirm('Rétablir les 4 diapositives officielles d’origine du Collège Isaac Newton ?')) return;

    const defaultSlides: HeroSlide[] = [
      {
        id: 'slide-1',
        image: '/images/campus_facade_real_1790679454540.jpg',
        badge: 'Campus Principal · Delmas 50, rue Dominique #2 bis',
        title: 'Collège Isaac Newton',
        subtitle: '« Savoir aujourd’hui, réussir demain » — Notre campus moderne et sécurisé à Delmas 50, dédié à l’excellence intellectuelle et civique de vos enfants.',
        objectPosition: 'center 35%',
        ctaText: 'Formulaire de Préinscription',
        ctaTarget: 'pre-registration',
        secondaryCtaText: 'Secrétariat (+509 3316-0934)',
        secondaryCtaTarget: 'contact',
        isActive: true,
        order: 1,
      },
      {
        id: 'slide-2',
        image: '/images/computer_lab_real_1790679476180.jpg',
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
        id: 'slide-3',
        image: '/images/graduation_promo_real_1790679465649.jpg',
        badge: 'Promotion des Diplômés · Cérémonie de Graduation',
        title: 'Former les Bâtisseurs de Demain',
        subtitle: '100% de réussite aux examens d’État (9e AF et Baccalauréat Nouveau Secondaire). Nos bacheliers en toges académiques prêts pour l’université.',
        objectPosition: 'center 22%',
        ctaText: 'Cursus Nouveau Secondaire',
        ctaTarget: 'programs',
        secondaryCtaText: 'Palmarès d’Excellence',
        secondaryCtaTarget: 'college',
        isActive: true,
        order: 3,
      },
      {
        id: 'slide-4',
        image: '/images/campus_courtyard_building_1790531780046.jpg',
        badge: 'Campus Principal · Delmas 50',
        title: 'Un Environnement Propice à l’Excellence',
        subtitle: 'Salles climatisées, sécurité renforcée, bibliothèque et suivi pédagogique individualisé pour chaque élève.',
        objectPosition: 'center 40%',
        ctaText: 'Visiter le Campus',
        ctaTarget: 'contact',
        secondaryCtaText: 'Préinscription 2026-2027',
        secondaryCtaTarget: 'pre-registration',
        isActive: true,
        order: 4,
      },
    ];

    setSlides(defaultSlides);
    setSelectedSlideIndex(0);
    setFormDraft({ ...defaultSlides[0] });
    await apiService.saveHeroSlides(defaultSlides);
    toast.success('Diapositives réinitialisées avec succès');
  };

  return (
    <div className="space-y-6">
      {/* =========================================================================
          TOP BANNER: HERO SLIDESHOW EDITORIAL WORKSPACE
      ========================================================================= */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900 rounded-3xl p-5 sm:p-6 text-white shadow-xl border border-blue-800/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Éditeur Officiel du Diaporama d'Accueil (Carrousel)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <span>Gestion du Diaporama Principal</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Mettez à jour en direct les photos de la façade, les slogans officiels, les textes d’excellence et les boutons d’inscription visibles par les visiteurs sur la page d’accueil.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <div className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-white/10 text-xs text-slate-300 font-mono">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>PostgreSQL Synchronisé ({slides.filter(s => s.isActive).length}/{slides.length} actives)</span>
          </div>

          <button
            type="button"
            onClick={handleAddNewSlide}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter une diapositive</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          SLIDE SELECTOR STRIP (CAROUSEL THUMBNAILS)
      ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-3">
        <div className="flex items-center justify-between mb-2.5 px-1">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-blue-900" />
            <span>Sélectionner la Diapositive à Modifier ({slides.length})</span>
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetToDefault}
              className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
              title="Restaurer les valeurs d'origine de l'école"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Valeurs officielles</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
          {slides.map((slide, idx) => {
            const isSelected = idx === selectedSlideIndex;
            return (
              <div
                key={slide.id || idx}
                onClick={() => handleSelectSlide(idx)}
                className={`relative rounded-xl border-2 overflow-hidden cursor-pointer transition-all flex flex-col group ${
                  isSelected
                    ? 'border-blue-900 ring-2 ring-blue-900/20 shadow-md bg-blue-50/30'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="relative aspect-[16/9] bg-slate-900 overflow-hidden">
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    style={{ objectPosition: slide.objectPosition || 'center 35%' }}
                  />
                  <div className="absolute top-1.5 left-1.5 flex items-center gap-1">
                    <span className="bg-blue-950/90 text-amber-400 text-[10px] font-black px-1.5 py-0.5 rounded shadow-xs">
                      #{idx + 1}
                    </span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                      slide.isActive ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300'
                    }`}>
                      {slide.isActive ? 'En ligne' : 'Masquée'}
                    </span>
                  </div>
                </div>

                <div className="p-2 space-y-1">
                  <h4 className="font-bold text-xs text-slate-900 truncate" title={slide.title}>
                    {slide.title || 'Sans titre'}
                  </h4>
                  <p className="text-[10px] text-slate-500 truncate" title={slide.badge}>
                    {slide.badge || 'Campus Principal'}
                  </p>
                </div>

                {/* Ordering & delete controls */}
                <div className="px-2 py-1 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={(e) => { e.stopPropagation(); handleMoveSlide(idx, 'up'); }}
                      className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                      title="Déplacer vers la gauche"
                    >
                      <ChevronLeft className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === slides.length - 1}
                      onClick={(e) => { e.stopPropagation(); handleMoveSlide(idx, 'down'); }}
                      className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                      title="Déplacer vers la droite"
                    >
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleToggleActive(idx); }}
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded cursor-pointer ${
                        slide.isActive ? 'text-amber-800 hover:bg-amber-100' : 'text-emerald-700 hover:bg-emerald-100'
                      }`}
                    >
                      {slide.isActive ? 'Désactiver' : 'Activer'}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleDeleteSlide(idx); }}
                      className="p-1 rounded text-rose-500 hover:bg-rose-100 cursor-pointer"
                      title="Supprimer la diapositive"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Add Slide Quick Button */}
          <button
            type="button"
            onClick={handleAddNewSlide}
            className="aspect-[16/9] min-h-[120px] rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-900 bg-slate-50 hover:bg-blue-50/50 flex flex-col items-center justify-center gap-2 text-slate-500 hover:text-blue-900 transition-all cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-2xs">
              <Plus className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold">+ Nouvelle Diapo</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          MAIN EDITING SECTION: SIMPLE FORM + LIVE RESPONSIVE PREVIEW
      ========================================================================= */}
      {formDraft && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT: THE SIMPLE FORM (7 COLS ON LARGE SCREEN) */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  #{selectedSlideIndex + 1}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Formulaire de Modification de la Diapositive
                  </h3>
                  <p className="text-xs text-slate-500">
                    Modifiez les textes et l'image ci-dessous. Les changements s'affichent en temps réel dans l'aperçu.
                  </p>
                </div>
              </div>

              {/* Status Switch */}
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formDraft.isActive}
                  onChange={(e) => handleFieldChange('isActive', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                <span className="text-xs font-bold text-slate-700">
                  {formDraft.isActive ? 'Active' : 'Masquée'}
                </span>
              </label>
            </div>

            <form onSubmit={handleSaveCurrentSlide} className="space-y-4">
              
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
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-blue-900 focus:ring-2 focus:ring-blue-900/10 font-bold text-slate-900"
                />
              </div>

              {/* 3. Sous-titre / Slogan / Devise */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Sous-titre, Devise ou Slogan Pédagogique
                </label>
                <textarea
                  rows={3}
                  value={formDraft.subtitle || ''}
                  onChange={(e) => handleFieldChange('subtitle', e.target.value)}
                  placeholder="Ex : « Savoir aujourd’hui, réussir demain » — Notre campus moderne et sécurisé à Delmas 50..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-900 focus:ring-2 focus:ring-blue-900/10 text-slate-700 leading-relaxed resize-none"
                />
              </div>

              {/* 4. Image de Fond & Cadrage */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-blue-900" />
                    <span>Photo d'Arrière-Plan du Diaporama</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowMediaPicker(true)}
                      className="px-2.5 py-1 rounded-lg bg-blue-900 text-white text-[11px] font-bold hover:bg-blue-950 transition-colors cursor-pointer"
                    >
                      Choisir dans la Médiathèque
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowUploader(!showUploader)}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 text-[11px] font-bold hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      {showUploader ? 'Fermer Uploader' : 'Téléverser photo'}
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
                    />
                  </div>
                )}

                {/* Direct Image URL input */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    URL ou Chemin de l'image
                  </label>
                  <input
                    type="text"
                    value={formDraft.image || ''}
                    onChange={(e) => handleFieldChange('image', e.target.value)}
                    placeholder="https://... ou /images/..."
                    className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-blue-900 text-slate-700"
                  />
                </div>

                {/* Image Position Selector (Object Position) */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Centrage & Cadrage Visuel (Object Position)
                  </label>
                  <div className="grid grid-cols-4 gap-2">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                {/* CTA 1 */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-700">
                    Bouton Principal (Bleu Or)
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
                    <option value="pre-registration">Page : Formulaire de Préinscription</option>
                    <option value="programs">Page : Formations & Pôles</option>
                    <option value="college">Page : Le Collège & Philosophie</option>
                    <option value="contact">Page : Contact & Secrétariat</option>
                  </select>
                </div>

                {/* CTA 2 */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-700">
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
                    <option value="pre-registration">Page : Formulaire de Préinscription</option>
                    <option value="programs">Page : Formations & Pôles</option>
                    <option value="college">Page : Le Collège & Philosophie</option>
                  </select>
                </div>
              </div>

              {/* SAVE ACTION BUTTON */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setFormDraft({ ...slides[selectedSlideIndex] })}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs transition-colors cursor-pointer"
                >
                  Annuler modifications
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Enregistrement dans PostgreSQL...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 text-amber-400" />
                      <span>Enregistrer dans PostgreSQL & Publier</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>

          {/* RIGHT: LIVE INTERACTIVE PREVIEW (5 COLS ON LARGE SCREEN) */}
          <div className="lg:col-span-5 space-y-3 sticky top-4">
            <div className="bg-slate-900 text-white rounded-2xl p-3 flex items-center justify-between shadow-xs">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-amber-400" />
                <span>Aperçu en Direct sur la Page d'Accueil</span>
              </span>

              {/* Device switcher */}
              <div className="flex items-center gap-1 p-0.5 bg-slate-800 rounded-lg text-xs">
                <button
                  type="button"
                  onClick={() => setPreviewDevice('desktop')}
                  className={`p-1 px-2 rounded-md font-semibold text-[10px] flex items-center gap-1 cursor-pointer transition-colors ${
                    previewDevice === 'desktop' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Laptop className="w-3 h-3" />
                  <span>PC</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('mobile')}
                  className={`p-1 px-2 rounded-md font-semibold text-[10px] flex items-center gap-1 cursor-pointer transition-colors ${
                    previewDevice === 'mobile' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-3 h-3" />
                  <span>Mobile</span>
                </button>
              </div>
            </div>

            {/* LIVE PREVIEW CONTAINER */}
            <div className={`mx-auto transition-all duration-300 ${
              previewDevice === 'mobile' ? 'max-w-[340px]' : 'w-full'
            }`}>
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-900 aspect-[16/10] bg-slate-950 flex flex-col justify-end">
                
                {/* Background Image with objectPosition */}
                <img
                  src={formDraft.image}
                  alt={formDraft.title}
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ objectPosition: formDraft.objectPosition || 'center 35%' }}
                />

                {/* Dark Gradient Overlay for readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

                {/* Live Content Overlay */}
                <div className="relative z-10 p-4 sm:p-5 space-y-2 text-white">
                  
                  {/* Badge */}
                  {formDraft.badge && (
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-950/80 border border-blue-400/30 text-amber-300 text-[9.5px] font-bold">
                      <ShieldCheck className="w-2.5 h-2.5" />
                      <span className="truncate max-w-[240px]">{formDraft.badge}</span>
                    </div>
                  )}

                  {/* Title */}
                  <h3 className="text-sm sm:text-base font-black text-white leading-tight drop-shadow-sm">
                    {formDraft.title || 'Titre de la Diapositive'}
                  </h3>

                  {/* Subtitle */}
                  <p className="text-[11px] sm:text-xs text-slate-200 line-clamp-2 leading-relaxed drop-shadow-xs">
                    {formDraft.subtitle || 'Sous-titre et devise de l’établissement scolaire...'}
                  </p>

                  {/* Buttons Preview */}
                  <div className="flex items-center gap-2 pt-1 flex-wrap">
                    {formDraft.ctaText && (
                      <span className="px-2.5 py-1 rounded-lg bg-blue-900 border border-blue-700 text-white font-bold text-[10px] shadow-xs">
                        {formDraft.ctaText}
                      </span>
                    )}
                    {formDraft.secondaryCtaText && (
                      <span className="px-2 py-1 rounded-lg bg-white/20 backdrop-blur-xs text-white text-[10px] font-medium border border-white/20">
                        {formDraft.secondaryCtaText}
                      </span>
                    )}
                  </div>
                </div>

                {/* Status Indicator */}
                <div className="absolute top-2.5 right-2.5 z-20">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                    formDraft.isActive ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {formDraft.isActive ? 'En ligne' : 'Masquée'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick helper tip */}
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 text-[11px] text-blue-900 space-y-1">
              <p className="font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-900" />
                <span>Synchronisation Immédiate</span>
              </p>
              <p className="text-blue-800/80 leading-relaxed">
                Lorsque vous cliquez sur « Enregistrer », la table PostgreSQL <code className="bg-white px-1 py-0.5 rounded font-mono text-[10px]">hero_slides</code> est mise à jour instantanément sans redémarrage de serveur.
              </p>
            </div>
          </div>

        </div>
      )}

      {/* =========================================================================
          MEDIA PICKER MODAL (POUR SÉLECTIONNER RAPIDEMENT UNE IMAGE DE LA MÉDIATHÈQUE)
      ========================================================================= */}
      {showMediaPicker && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl p-5 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-blue-900" />
                <span>Sélectionner une Image pour la Diapositive</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowMediaPicker(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-1">
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
                  <div className="p-2">
                    <p className="text-[11px] font-bold text-slate-800 truncate">{media.title}</p>
                    <span className="text-[9px] font-semibold text-slate-400">{media.category}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setShowMediaPicker(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
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
