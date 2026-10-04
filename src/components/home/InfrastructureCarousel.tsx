import React, { useState, useEffect, useRef, useCallback } from 'react';
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
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-900 mb-1">
            <Building2 className="w-4 h-4 text-amber-500" />
            <span>Campus Principal · Delmas 50, rue Dominique #2 bis</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
            <span>Infrastructures du Collège</span>
            <span className="text-xs font-sans font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
              {items.length} espaces
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mt-0.5">
            Découvrez nos installations modernes : laboratoire informatique climatisé, cour d’honneur sécurisée, terrain multisports et salles pédagogiques aérées.
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

      {/* CAROUSEL PRESENTATION CONTAINER */}
      <div className="relative bg-slate-950 rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-800 shadow-xl">
        {currentItem ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[380px] sm:min-h-[440px] items-stretch">
            
            {/* MAIN IMAGE DISPLAY (7 Cols on desktop) */}
            <div 
              className="lg:col-span-8 relative overflow-hidden bg-slate-900 cursor-pointer group min-h-[260px] sm:min-h-[360px]"
              onClick={() => setLightboxItem(currentItem)}
            >
              <img
                src={currentItem.imageUrl}
                alt={currentItem.altText || currentItem.title}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.dataset.triedFallback) {
                    target.dataset.triedFallback = '1';
                    target.src = '/images/campus_courtyard_building_1790531780046.jpg';
                  }
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent lg:hidden" />
              
              {/* Zoom pill badge */}
              <div className="absolute top-3 left-3 bg-slate-950/70 backdrop-blur-md text-white text-[11px] font-medium px-2.5 py-1 rounded-full flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity border border-white/10">
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
              <div className="absolute bottom-0 inset-x-0 p-4 text-white lg:hidden">
                <span className="text-[10px] uppercase font-bold text-amber-300 tracking-wider">
                  {currentItem.category || 'Infrastructure'}
                </span>
                <h3 className="font-serif text-lg font-bold text-white leading-tight">
                  {currentItem.title}
                </h3>
              </div>
            </div>

            {/* DETAILS PANEL (4 Cols on desktop) */}
            <div className="lg:col-span-4 bg-slate-900/95 p-5 sm:p-6 lg:p-7 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-800 text-white">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-md border border-amber-400/20">
                    <Sparkles className="w-3 h-3" />
                    <span>{currentItem.category || 'Infrastructure CIN'}</span>
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    {currentIndex + 1} / {total}
                  </span>
                </div>

                <h3 className="font-serif text-xl sm:text-2xl font-bold text-white mb-2 leading-snug">
                  {currentItem.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light mb-4">
                  {currentItem.caption || 'Infrastructure moderne conforme aux normes du Ministère de l’Éducation Nationale pour offrir aux élèves un environnement sain et sécurisé.'}
                </p>

                {/* Key Infrastructure Highlights */}
                <div className="space-y-2 py-3 border-t border-slate-800/80 my-2 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Sécurité permanente & surveillance continue à Delmas 50</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Énergie solaire & onduleurs pour continuité pédagogique</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Accessibilité rapide depuis l'axe principal de Delmas</span>
                  </div>
                </div>
              </div>

              {/* Bottom Carousel Navigation & CTA */}
              <div className="pt-4 border-t border-slate-800">
                {/* Thumbnails preview strip */}
                <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 scrollbar-none">
                  {filteredItems.map((item, idx) => (
                    <button
                      key={item.id}
                      onClick={() => setCurrentIndex(idx)}
                      className={`relative w-12 h-12 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
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

                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handlePrev}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-colors cursor-pointer"
                      aria-label="Photo précédente"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-colors cursor-pointer"
                      aria-label="Photo suivante"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => onNavigate('contact')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition-all shadow-sm cursor-pointer"
                  >
                    <span>Planifier une Visite</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>

          </div>
        ) : (
          <div className="p-8 text-center text-slate-400">
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

            {/* Image */}
            <div className="relative aspect-[16/10] sm:aspect-[16/9] bg-slate-950 flex items-center justify-center overflow-hidden">
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
