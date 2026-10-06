import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Edit3, 
  Trash2, 
  ZoomIn, 
  Play, 
  Pause, 
  Sparkles, 
  ArrowRight,
  ShieldCheck,
  Cpu,
  Layers,
  CheckCircle2,
  X,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import { GalleryItem, User } from '../../types';
import { apiService } from '../../services/api';
import { INITIAL_GALLERY } from '../../data/mockData';
import { GalleryItemModal } from '../gallery/GalleryItemModal';

interface InfrastructureCarouselProps {
  onNavigate: (page: string, subSection?: string) => void;
  currentUser?: User | null;
}

export const InfrastructureCarousel: React.FC<InfrastructureCarouselProps> = ({ 
  onNavigate, 
  currentUser 
}) => {
  const [items, setItems] = useState<GalleryItem[]>(INITIAL_GALLERY);
  const [activeCategory, setActiveCategory] = useState<string>('TOUS');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [lightboxItem, setLightboxItem] = useState<GalleryItem | null>(null);

  // Edit / Add Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);

  // Section Header Editable State
  const [sectionHeader, setSectionHeader] = useState(() => {
    try {
      const saved = localStorage.getItem('cin:infra_header');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      badge: 'Campus Principal · Delmas 50, rue Dominique #2 bis',
      title: 'Infrastructures du Collège',
      description: 'Découvrez nos installations modernes : laboratoire informatique climatisé, cour d’honneur sécurisée, terrain multisports et salles pédagogiques aérées.'
    };
  });
  const [isEditingHeader, setIsEditingHeader] = useState(false);
  const [headerDraft, setHeaderDraft] = useState(sectionHeader);

  const canManage = Boolean(currentUser && ['ADMIN', 'EDITOR', 'MODERATOR'].includes(currentUser.role));

  const loadGallery = useCallback(() => {
    apiService.getGallery().then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        setItems(data);
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    loadGallery();
    const handleUpdate = () => loadGallery();
    window.addEventListener('cin:gallery-updated', handleUpdate);
    return () => window.removeEventListener('cin:gallery-updated', handleUpdate);
  }, [loadGallery]);

  // Categories list
  const categories = ['TOUS', ...Array.from(new Set(items.map(i => i.category || 'Infrastructure')))];

  const filteredItems = activeCategory === 'TOUS' 
    ? items 
    : items.filter(i => (i.category || 'Infrastructure') === activeCategory);

  const total = filteredItems.length;

  // Auto-play timer
  useEffect(() => {
    if (!isAutoPlay || isHovered || total <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % total);
    }, 4500);
    return () => clearInterval(interval);
  }, [isAutoPlay, isHovered, total]);

  // Reset index when category changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [activeCategory]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % total);
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: GalleryItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`Supprimer la photo « ${title} » des infrastructures ?`)) return;

    try {
      await apiService.deleteGalleryItem(id);
      setItems((prev) => prev.filter(i => i.id !== id));
      if (lightboxItem?.id === id) setLightboxItem(null);
      toast.success('Infrastructure retirée de la galerie');
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxItem) return;
      if (e.key === 'Escape') setLightboxItem(null);
      if (e.key === 'ArrowRight') {
        const idx = filteredItems.findIndex(i => i.id === lightboxItem.id);
        if (idx !== -1) setLightboxItem(filteredItems[(idx + 1) % filteredItems.length]);
      }
      if (e.key === 'ArrowLeft') {
        const idx = filteredItems.findIndex(i => i.id === lightboxItem.id);
        if (idx !== -1) setLightboxItem(filteredItems[(idx - 1 + filteredItems.length) % filteredItems.length]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxItem, filteredItems]);

  const currentItem = filteredItems[currentIndex] || items[0];

  return (
    <section 
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6" 
      aria-label="Infrastructures et Campus du Collège Isaac Newton"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* SECTION HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-4 sm:mb-6 gap-3 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-900">
              <Building2 className="w-4 h-4 text-amber-500" />
              <span>{sectionHeader.badge}</span>
            </div>
            {canManage && (
              <button
                type="button"
                onClick={() => { setHeaderDraft(sectionHeader); setIsEditingHeader(true); }}
                className="text-[10px] font-bold text-slate-600 hover:text-blue-900 flex items-center gap-1 cursor-pointer bg-slate-100 hover:bg-blue-50 px-2 py-0.5 rounded-md border border-slate-200 transition-colors"
                title="Modifier les textes du titre et du paragraphe"
              >
                <Edit3 className="w-2.5 h-2.5 text-blue-900" />
                <span>Modifier l'en-tête</span>
              </button>
            )}
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
            <span>{sectionHeader.title}</span>
            <span className="text-xs font-sans font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
              {items.length} espaces
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mt-0.5">
            {sectionHeader.description}
          </p>
        </div>

        {/* CONTROLS & STAFF ACTIONS */}
        <div className="flex items-center gap-2 flex-wrap self-start md:self-auto">
          {canManage && (
            <button
              type="button"
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
              title="Ajouter un nouvel équipement ou espace"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter une photo</span>
            </button>
          )}

          <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200/80">
            <button
              type="button"
              onClick={() => setIsAutoPlay(!isAutoPlay)}
              className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
                isAutoPlay ? 'bg-white text-blue-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title={isAutoPlay ? 'Mettre en pause le défilement automatique' : 'Activer le défilement automatique'}
            >
              {isAutoPlay ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
            <div className="w-px h-4 bg-slate-200 mx-1" />
            <button
              type="button"
              onClick={handlePrev}
              className="p-1.5 rounded-lg text-slate-600 hover:text-blue-900 hover:bg-white transition-colors"
              title="Précédent"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-mono px-2 text-slate-600 font-medium">
              {total > 0 ? currentIndex + 1 : 0}/{total}
            </span>
            <button
              type="button"
              onClick={handleNext}
              className="p-1.5 rounded-lg text-slate-600 hover:text-blue-900 hover:bg-white transition-colors"
              title="Suivant"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('gallery')}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            <span>Toute la galerie</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* CATEGORY FILTER PILLS */}
      {categories.length > 2 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === cat
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {cat === 'TOUS' ? 'Tous les Espaces' : cat}
            </button>
          ))}
        </div>
      )}

      {/* CAROUSEL PRESENTATION CONTAINER - STRICT UNIFORM LOCKED HEIGHT ACROSS ALL SLIDES */}
      <div className="relative bg-slate-950 rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-800 shadow-xl h-[560px] sm:h-[580px] lg:h-[480px] xl:h-[500px] max-h-[560px] sm:max-h-[580px] lg:max-h-[480px] xl:max-h-[500px]">
        {currentItem ? (
          <div className="flex flex-col lg:grid lg:grid-cols-12 h-full items-stretch overflow-hidden">
            
            {/* MAIN IMAGE DISPLAY (Strict uniform locked height on all viewports, zero layout shift) */}
            <div 
              className="lg:col-span-7 xl:col-span-7 h-[260px] sm:h-[300px] lg:h-full w-full relative overflow-hidden bg-slate-900 cursor-pointer group shrink-0"
              onClick={() => setLightboxItem(currentItem)}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={currentItem.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                  className="absolute inset-0 w-full h-full"
                >
                  <img
                    src={currentItem.imageUrl}
                    alt={currentItem.altText || currentItem.title}
                    className="w-full h-full object-cover select-none transition-transform duration-700 ease-out group-hover:scale-105"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (!target.dataset.triedFallback) {
                        target.dataset.triedFallback = '1';
                        target.src = '/images/campus_courtyard_building_1790531780046.jpg';
                      }
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent lg:hidden" />
                </motion.div>
              </AnimatePresence>
              
              {/* Zoom pill badge */}
              <div className="absolute top-3 left-3 bg-slate-950/70 backdrop-blur-md text-white text-[11px] font-medium px-2.5 py-1 rounded-full flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity border border-white/10 z-10 pointer-events-none">
                <ZoomIn className="w-3.5 h-3.5 text-amber-400" />
                <span>Cliquer pour agrandir</span>
              </div>

              {/* Staff edit controls on photo */}
              {canManage && (
                <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                  <button
                    type="button"
                    onClick={(e) => handleOpenEdit(currentItem, e)}
                    className="p-2 rounded-full bg-slate-900/85 hover:bg-blue-800 text-white backdrop-blur-md shadow-md transition-colors cursor-pointer"
                    title="Modifier cette photo"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleDelete(currentItem.id, currentItem.title, e)}
                    className="p-2 rounded-full bg-slate-900/85 hover:bg-rose-600 text-white backdrop-blur-md shadow-md transition-colors cursor-pointer"
                    title="Supprimer cette photo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Mobile overlay caption */}
              <div className="absolute bottom-0 inset-x-0 p-3 sm:p-4 text-white lg:hidden z-10 pointer-events-none">
                <span className="text-[10px] uppercase font-bold text-amber-300 tracking-wider">
                  {currentItem.category || 'Infrastructure'}
                </span>
                <h3 className="font-serif text-base sm:text-lg font-bold text-white leading-tight truncate">
                  {currentItem.title}
                </h3>
              </div>
            </div>

            {/* DETAILS PANEL (Uniform locked height - fills remaining height with clean internal scroll) */}
            <div className="lg:col-span-5 xl:col-span-5 flex-1 min-h-0 bg-slate-900/95 p-4 sm:p-5 lg:p-6 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-800 text-white h-full overflow-hidden">
              <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={currentItem.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-md border border-amber-400/20">
                        <Sparkles className="w-3 h-3" />
                        <span>{currentItem.category || 'Infrastructure CIN'}</span>
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        {currentIndex + 1} / {total}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-serif text-lg sm:text-xl lg:text-2xl font-bold text-white leading-snug">
                        {currentItem.title}
                      </h3>
                      {canManage && (
                        <button
                          type="button"
                          onClick={(e) => handleOpenEdit(currentItem, e)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition-all shadow-xs cursor-pointer shrink-0"
                          title="Modifier les textes, les atouts et la photo"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Modifier</span>
                        </button>
                      )}
                    </div>

                    <p className="text-xs sm:text-[13px] text-slate-300 leading-relaxed font-light">
                      {currentItem.caption || 'Infrastructure moderne conforme aux normes du Ministère de l’Éducation Nationale pour offrir aux élèves un environnement sain et sécurisé.'}
                    </p>

                    {/* Key Infrastructure Highlights (Dynamiques & Éditables) */}
                    <div className="space-y-1.5 py-2 border-t border-slate-800/80 text-xs text-slate-300">
                      {((currentItem.highlights && currentItem.highlights.length > 0)
                        ? currentItem.highlights
                        : [
                            'Sécurité permanente & surveillance continue à Delmas 50',
                            'Énergie solaire & onduleurs pour continuité pédagogique',
                            'Accessibilité rapide depuis l\'axe principal de Delmas'
                          ]
                      ).map((hl, i) => (
                        <div key={i} className="flex items-center gap-2">
                          {i === 0 ? (
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          ) : i === 1 ? (
                            <Cpu className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          )}
                          <span className="leading-snug">{hl}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Bottom Carousel Navigation & CTA (Permanently anchored at bottom) */}
              <div className="pt-2.5 sm:pt-3 border-t border-slate-800 shrink-0 mt-auto">
                {/* Thumbnails preview strip */}
                <div className="flex items-center gap-1.5 mb-2.5 sm:mb-3 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                  {filteredItems.map((item, idx) => (
                    <button
                      key={item.id}
                      onClick={() => setCurrentIndex(idx)}
                      className={`relative w-9 h-9 sm:w-10 sm:h-10 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                        currentIndex === idx 
                          ? 'border-amber-400 scale-105 shadow-md shadow-amber-400/20' 
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                      title={item.title}
                    >
                      <img 
                        src={item.imageUrl} 
                        alt="" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/images/campus_courtyard_building_1790531780046.jpg';
                        }}
                      />
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between gap-2.5">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handlePrev}
                      className="p-1.5 sm:p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-colors cursor-pointer"
                      aria-label="Photo précédente"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      className="p-1.5 sm:p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-colors cursor-pointer"
                      aria-label="Photo suivante"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => onNavigate('contact')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition-all shadow-sm cursor-pointer"
                  >
                    <span>Planifier une Visite</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>

          </div>
        ) : (
          <div className="p-8 text-center text-slate-400 h-full flex items-center justify-center">
            Aucun espace configuré dans cette catégorie.
          </div>
        )}
      </div>

      {/* FULLSCREEN LIGHTBOX MODAL */}
      {lightboxItem && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
          onClick={() => setLightboxItem(null)}
          role="dialog"
          aria-modal="true"
        >
          <div 
            className="relative max-w-4xl w-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-slate-950/80 border-b border-slate-800 text-white">
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                  {lightboxItem.category || 'Infrastructure'}
                </span>
                <h4 className="font-serif font-bold text-base sm:text-lg text-white">
                  {lightboxItem.title}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setLightboxItem(null)}
                className="p-2 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
                aria-label="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Image with fixed aspect-video */}
            <div className="relative aspect-video w-full bg-slate-950 flex items-center justify-center overflow-hidden">
              <img
                src={lightboxItem.imageUrl}
                alt={lightboxItem.altText || lightboxItem.title}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Caption & Navigation Footer */}
            <div className="p-4 bg-slate-950/90 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-white">
              <p className="text-xs sm:text-sm text-slate-300">
                {lightboxItem.caption || 'Vue officielle du campus du Collège Isaac Newton.'}
              </p>
              
              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    const idx = filteredItems.findIndex(i => i.id === lightboxItem.id);
                    if (idx !== -1) setLightboxItem(filteredItems[(idx - 1 + filteredItems.length) % filteredItems.length]);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-white transition-colors"
                >
                  Précédent
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const idx = filteredItems.findIndex(i => i.id === lightboxItem.id);
                    if (idx !== -1) setLightboxItem(filteredItems[(idx + 1) % filteredItems.length]);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-white transition-colors"
                >
                  Suivant
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION HEADER EDIT MODAL */}
      {isEditingHeader && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-5 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-blue-900" />
                <span>Modifier l'En-tête de la Section Infrastructures</span>
              </h3>
              <button 
                type="button" 
                onClick={() => setIsEditingHeader(false)} 
                className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Badge de localisation</label>
                <input
                  type="text"
                  value={headerDraft.badge}
                  onChange={(e) => setHeaderDraft({ ...headerDraft, badge: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Titre de la section</label>
                <input
                  type="text"
                  value={headerDraft.title}
                  onChange={(e) => setHeaderDraft({ ...headerDraft, title: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Texte de présentation / description</label>
                <textarea
                  rows={3}
                  value={headerDraft.description}
                  onChange={(e) => setHeaderDraft({ ...headerDraft, description: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 leading-relaxed resize-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsEditingHeader(false)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => {
                  setSectionHeader(headerDraft);
                  try {
                    localStorage.setItem('cin:infra_header', JSON.stringify(headerDraft));
                  } catch {}
                  setIsEditingHeader(false);
                  toast.success('En-tête de la section mis à jour avec succès !');
                }}
                className="px-4 py-1.5 rounded-lg bg-blue-900 text-white text-xs font-bold hover:bg-blue-950 cursor-pointer shadow-xs"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT / ADD MODAL */}
      <GalleryItemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingItem={editingItem}
        onSaved={(item) => {
          loadGallery();
          if (editingItem?.id === item.id) {
            setLightboxItem(item);
          }
        }}
        onDeleted={(id) => {
          setItems(prev => prev.filter(i => i.id !== id));
          loadGallery();
        }}
      />
    </section>
  );
};
