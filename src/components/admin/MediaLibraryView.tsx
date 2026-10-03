import React, { useState, useEffect } from 'react';
import { 
  Image as ImageIcon, 
  Upload, 
  Trash2, 
  Copy, 
  Check, 
  Sparkles, 
  SlidersHorizontal, 
  Layers, 
  Plus, 
  Edit3, 
  Eye, 
  RefreshCw, 
  CheckCircle2, 
  ArrowRight, 
  X, 
  Loader2, 
  FolderPlus, 
  ExternalLink,
  Zap,
  Tag,
  Camera
} from 'lucide-react';
import { toast } from 'sonner';
import { MediaItem, HeroSlide, GalleryItem } from '../../types';
import { apiService } from '../../services/api';
import { ImageUploadCompressor } from '../common/ImageUploadCompressor';
import { SCHOOL_IMAGES } from '../../assets/images';

interface MediaLibraryViewProps {
  onSelectImageForTarget?: (url: string) => void;
}

export const MediaLibraryView: React.FC<MediaLibraryViewProps> = ({
  onSelectImageForTarget
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'slideshow' | 'gallery' | 'media'>('slideshow');
  
  // Media items state
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchMedia, setSearchMedia] = useState('');
  
  // Slideshow state
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [isLoadingSlides, setIsLoadingSlides] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [isSlideModalOpen, setIsSlideModalOpen] = useState(false);
  const [isSavingSlide, setIsSavingSlide] = useState(false);

  // Gallery items state (Form for adding, editing, deleting items)
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [isLoadingGallery, setIsLoadingGallery] = useState(false);
  const [editingGalleryItem, setEditingGalleryItem] = useState<GalleryItem | null>(null);
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [isSavingGallery, setIsSavingGallery] = useState(false);
  const [galleryForm, setGalleryForm] = useState({
    title: '',
    imageUrl: '',
    caption: '',
    altText: '',
  });

  // Media Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState<'CAMPUS' | 'SLIDESHOW' | 'EVENTS' | 'NEWS' | 'LAB'>('CAMPUS');
  const [uploadedUrl, setUploadedUrl] = useState('');

  // Load media, slides and gallery
  const loadData = async () => {
    setIsLoadingMedia(true);
    setIsLoadingSlides(true);
    setIsLoadingGallery(true);
    try {
      const [mediaData, slidesData, galleryData] = await Promise.all([
        apiService.getMedia(),
        apiService.getHeroSlides(),
        apiService.getGallery(),
      ]);
      setMediaItems(mediaData);
      setSlides(slidesData);
      setGalleryItems(galleryData);
    } catch {
      toast.error('Erreur lors du chargement des données multimédias');
    } finally {
      setIsLoadingMedia(false);
      setIsLoadingSlides(false);
      setIsLoadingGallery(false);
    }
  };

  useEffect(() => {
    loadData();

    const onMediaUpdate = () => {
      apiService.getMedia().then(setMediaItems).catch(() => {});
    };
    const onSlidesUpdate = (e: any) => {
      if (e.detail) setSlides(e.detail);
    };
    const onGalleryUpdate = () => {
      apiService.getGallery().then(setGalleryItems).catch(() => {});
    };

    window.addEventListener('cin:media-updated', onMediaUpdate);
    window.addEventListener('cin:slides-updated', onSlidesUpdate);
    window.addEventListener('cin:gallery-updated', onGalleryUpdate);
    return () => {
      window.removeEventListener('cin:media-updated', onMediaUpdate);
      window.removeEventListener('cin:slides-updated', onSlidesUpdate);
      window.removeEventListener('cin:gallery-updated', onGalleryUpdate);
    };
  }, []);

  // Filter media
  const filteredMedia = mediaItems.filter(item => {
    const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchMedia.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Handle Upload Media
  const handleUploadMediaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadedUrl) {
      toast.error('Veuillez sélectionner ou compresser une image');
      return;
    }

    try {
      const saved = await apiService.uploadMedia({
        url: uploadedUrl,
        title: uploadTitle.trim() || 'Photo Collège Isaac Newton',
        category: uploadCategory,
        dimensions: '1280x850',
      });
      setMediaItems(prev => [saved, ...prev]);
      setShowUploadModal(false);
      setUploadTitle('');
      setUploadedUrl('');
      toast.success('Image enregistrée dans la médiathèque !');
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de l’ajout du média');
    }
  };

  // Handle Delete Media
  const handleDeleteMedia = async (id: string) => {
    if (!window.confirm('Supprimer cette image de la médiathèque ?')) return;
    try {
      await apiService.deleteMedia(id);
      setMediaItems(prev => prev.filter(m => m.id !== id));
      toast.success('Média supprimé avec succès');
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  // Copy Image URL to clipboard
  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('URL de l’image copiée dans le presse-papier !');
  };

  // --- SLIDESHOW HANDLERS ---
  const handleOpenEditSlide = (slide: HeroSlide) => {
    setEditingSlide({ ...slide });
    setIsSlideModalOpen(true);
  };

  const handleOpenNewSlide = () => {
    const newSlide: HeroSlide = {
      id: `slide-${Date.now()}`,
      image: SCHOOL_IMAGES.entranceFacade,
      badge: 'Campus Principal · Delmas 50',
      title: 'Excellence Académique & Innovation',
      subtitle: 'Formation rigoureuse de la maternelle au Nouveau Secondaire.',
      objectPosition: 'center 35%',
      ctaText: 'Formulaire de Préinscription',
      ctaTarget: 'pre-registration',
      secondaryCtaText: 'Nous Contacter',
      secondaryCtaTarget: 'contact',
      isActive: true,
      order: slides.length + 1,
    };
    setEditingSlide(newSlide);
    setIsSlideModalOpen(true);
  };

  const handleToggleSlideActive = async (slideId: string) => {
    const updated = slides.map(s => s.id === slideId ? { ...s, isActive: !s.isActive } : s);
    setSlides(updated);
    await apiService.saveHeroSlides(updated);
    toast.success('Statut de la diapositive mis à jour');
  };

  const handleDeleteSlide = async (slideId: string) => {
    if (slides.length <= 1) {
      toast.error('Vous devez conserver au moins une diapositive pour l’entête.');
      return;
    }
    if (!window.confirm('Supprimer cette diapositive du diaporama d’accueil ?')) return;
    const updated = slides.filter(s => s.id !== slideId);
    setSlides(updated);
    await apiService.saveHeroSlides(updated);
    toast.success('Diapositive retirée du carrousel');
  };

  const handleSaveSlideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlide) return;

    setIsSavingSlide(true);
    try {
      let updated: HeroSlide[];
      const exists = slides.some(s => s.id === editingSlide.id);
      if (exists) {
        updated = slides.map(s => s.id === editingSlide.id ? editingSlide : s);
      } else {
        updated = [...slides, editingSlide];
      }

      setSlides(updated);
      await apiService.saveHeroSlides(updated);
      setIsSlideModalOpen(false);
      setEditingSlide(null);
      toast.success('Diaporama d’accueil mis à jour avec succès !', {
        description: 'La page d’accueil reflète immédiatement ces modifications.',
      });
    } catch {
      toast.error('Erreur lors de l’enregistrement du diaporama');
    } finally {
      setIsSavingSlide(false);
    }
  };

  // --- GALLERY ITEMS CRUD HANDLERS ---
  const handleOpenNewGalleryItem = () => {
    setEditingGalleryItem(null);
    setGalleryForm({
      title: '',
      imageUrl: '',
      caption: '',
      altText: '',
    });
    setIsGalleryModalOpen(true);
  };

  const handleOpenEditGalleryItem = (item: GalleryItem) => {
    setEditingGalleryItem(item);
    setGalleryForm({
      title: item.title,
      imageUrl: item.imageUrl,
      caption: item.caption || '',
      altText: item.altText || '',
    });
    setIsGalleryModalOpen(true);
  };

  const handleSaveGallerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!galleryForm.title.trim() || !galleryForm.imageUrl) {
      toast.error('Veuillez renseigner un titre et sélectionner une image');
      return;
    }

    setIsSavingGallery(true);
    try {
      if (editingGalleryItem) {
        const updated = await apiService.updateGalleryItem(editingGalleryItem.id, galleryForm);
        if (updated) {
          setGalleryItems(prev => prev.map(g => g.id === editingGalleryItem.id ? updated : g));
          toast.success('Photo de la galerie mise à jour !');
        }
      } else {
        const created = await apiService.createGalleryItem(galleryForm);
        setGalleryItems(prev => [created, ...prev]);
        toast.success('Nouvelle photo ajoutée à la galerie !');
      }
      setIsGalleryModalOpen(false);
      setEditingGalleryItem(null);
    } catch {
      toast.error('Erreur lors de l’enregistrement dans la galerie');
    } finally {
      setIsSavingGallery(false);
    }
  };

  const handleDeleteGalleryItem = async (id: string) => {
    if (!window.confirm('Supprimer cette photo de la galerie des activités ?')) return;
    try {
      await apiService.deleteGalleryItem(id);
      setGalleryItems(prev => prev.filter(g => g.id !== id));
      toast.success('Photo retirée de la galerie');
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  return (
    <div className="space-y-4 font-sans text-slate-800">
      
      {/* HEADER SECTION WITH 3 SUB-TABS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:px-4 sm:py-3 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-blue-900" />
            <span>Médiathèque, Diaporama & Galerie d'Activités</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Photos réelles du campus, compression automatique et gestion des visuels de la page d'accueil
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Sub-tab switcher */}
          <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs shadow-2xs overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveSubTab('slideshow')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeSubTab === 'slideshow'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Diaporama d'Entête ({slides.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('gallery')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeSubTab === 'gallery'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Galerie d'Activités ({galleryItems.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('media')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeSubTab === 'media'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Médiathèque ({mediaItems.length})
            </button>
          </div>

          <button
            type="button"
            onClick={loadData}
            className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 cursor-pointer shrink-0"
            title="Rafraîchir les données"
          >
            <RefreshCw className={`w-4 h-4 ${(isLoadingMedia || isLoadingSlides || isLoadingGallery) ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* =========================================================================
          SUB-TAB 1 : SLIDESHOW (DIAPORAMA D'ENTÊTE HOMEPAGE)
      ========================================================================= */}
      {activeSubTab === 'slideshow' && (
        <div className="space-y-4">
          
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-3.5 sm:px-4 sm:py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Carrousel d'Entête de la Page d'Accueil
              </h3>
              <p className="text-xs text-slate-500">
                Personnalisez les photos réelles de notre établissement, les slogans et les boutons de contact
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenNewSlide}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer shrink-0 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              <span>Ajouter une Diapositive</span>
            </button>
          </div>

          {/* Slides List Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {slides.map((slide, index) => (
              <div 
                key={slide.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col justify-between group hover:border-slate-300 transition-all"
              >
                <div>
                  <div className="relative aspect-[16/8] bg-slate-950 overflow-hidden">
                    <img 
                      src={slide.image} 
                      alt={slide.title}
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                      style={{ objectPosition: slide.objectPosition || 'center 35%' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                    
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      <span className="bg-amber-400 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                        #{index + 1}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        slide.isActive 
                          ? 'bg-emerald-500/90 text-white border-emerald-400/40' 
                          : 'bg-slate-700/90 text-slate-300 border-white/20'
                      }`}>
                        {slide.isActive ? 'En ligne' : 'Masquée'}
                      </span>
                    </div>

                    <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
                      <span className="text-[10px] font-bold text-amber-300 tracking-wide uppercase block truncate">
                        {slide.badge}
                      </span>
                      <h4 className="font-bold text-sm sm:text-base leading-snug truncate">
                        {slide.title}
                      </h4>
                    </div>
                  </div>

                  <div className="p-3.5 space-y-2">
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {slide.subtitle}
                    </p>

                    <div className="flex items-center gap-2 pt-1 border-t border-slate-100 text-[11px] text-slate-500 flex-wrap">
                      <span className="font-bold text-slate-700">CTA:</span>
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-blue-900 font-medium">{slide.ctaText}</span>
                      {slide.secondaryCtaText && (
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700">{slide.secondaryCtaText}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => handleToggleSlideActive(slide.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      slide.isActive 
                        ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' 
                        : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                    }`}
                  >
                    {slide.isActive ? 'Désactiver' : 'Activer'}
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenEditSlide(slide)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-blue-900 hover:border-blue-900 font-bold text-xs transition-colors cursor-pointer shadow-2xs"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Modifier</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteSlide(slide.id)}
                      className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>

        </div>
      )}

      {/* =========================================================================
          SUB-TAB 2 : GALERIE D'ACTIVITÉS SCOLAIRES (FORM CRUD COMPLET)
      ========================================================================= */}
      {activeSubTab === 'gallery' && (
        <div className="space-y-4">
          
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-3.5 sm:px-4 sm:py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Camera className="w-4 h-4 text-amber-500" />
                <span>Photos de la Galerie d'Activités Scolaires ({galleryItems.length})</span>
              </h3>
              <p className="text-xs text-slate-500">
                Gestion des photos des élèves, du laboratoire, des sports et des cérémonies affichées sur le site
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenNewGalleryItem}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer shrink-0 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              <span>Ajouter une Photo à la Galerie</span>
            </button>
          </div>

          {/* Gallery Items Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {galleryItems.map((item) => (
              <div 
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden group hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-[16/10] bg-slate-950 overflow-hidden">
                    <img 
                      src={item.imageUrl} 
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-80" />
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
                      <h4 className="font-bold text-xs sm:text-sm line-clamp-1 text-white">
                        {item.title}
                      </h4>
                    </div>
                  </div>

                  <div className="p-3 space-y-1">
                    {item.caption ? (
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {item.caption}
                      </p>
                    ) : (
                      <p className="text-xs text-slate-400 italic">Aucune légende descriptive</p>
                    )}
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => handleCopyUrl(item.imageUrl)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200 text-xs flex items-center gap-1 transition-colors cursor-pointer"
                    title="Copier l'URL de la photo"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span className="text-[10.5px]">Copier URL</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenEditGalleryItem(item)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-blue-900 hover:border-blue-900 font-bold text-xs transition-colors cursor-pointer shadow-2xs"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Modifier</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteGalleryItem(item.id)}
                      className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Supprimer cette photo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>

        </div>
      )}

      {/* =========================================================================
          SUB-TAB 3 : MEDIA LIBRARY (STOCKAGE MÉDIAS BRUTS)
      ========================================================================= */}
      {activeSubTab === 'media' && (
        <div className="space-y-4">
          
          {/* Controls Bar: Search, Category, Upload */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            
            <div className="flex flex-wrap items-center gap-2">
              {['ALL', 'CAMPUS', 'SLIDESHOW', 'LAB', 'EVENTS'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {cat === 'ALL' ? 'Toutes les photos' : cat === 'LAB' ? 'Laboratoire Tech' : cat}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-950 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer shrink-0 self-start sm:self-auto"
            >
              <Upload className="w-4 h-4 text-amber-400" />
              <span>Téléverser & Compresser une Photo</span>
            </button>
          </div>

          {/* Media Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
            {filteredMedia.map((media) => (
              <div 
                key={media.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden group hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-[16/10] bg-slate-950 overflow-hidden">
                    <img 
                      src={media.url} 
                      alt={media.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2">
                      <span className="bg-slate-950/80 text-white text-[9px] font-bold px-2 py-0.5 rounded-full border border-white/20 backdrop-blur-xs">
                        {media.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 space-y-1">
                    <h4 className="font-bold text-xs text-slate-900 truncate" title={media.title}>
                      {media.title}
                    </h4>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>{media.dimensions || '1280x850'}</span>
                      <span>{media.createdAt ? media.createdAt.split('T')[0] : '2026-09'}</span>
                    </div>
                  </div>
                </div>

                <div className="p-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => handleCopyUrl(media.url)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200 text-xs flex items-center gap-1 transition-colors cursor-pointer"
                    title="Copier l'URL"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span className="text-[10px]">Copier</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {onSelectImageForTarget && (
                      <button
                        type="button"
                        onClick={() => onSelectImageForTarget(media.url)}
                        className="px-2 py-1 rounded-md bg-blue-900 text-white text-[10px] font-bold hover:bg-blue-950 cursor-pointer"
                      >
                        Sélectionner
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDeleteMedia(media.id)}
                      className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Supprimer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>

        </div>
      )}

      {/* =========================================================================
          MODAL: AJOUTER / MODIFIER UNE PHOTO DE LA GALERIE (FORMULAIRE CRUD)
      ========================================================================= */}
      {isGalleryModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-4 sm:p-5 space-y-4 animate-scale-in my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-blue-900" />
                <h3 className="font-black text-slate-900 text-base">
                  {editingGalleryItem ? 'Modifier la Photo de la Galerie' : 'Ajouter une Photo à la Galerie'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsGalleryModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGallerySubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1 text-[11px] uppercase tracking-wide">
                  Titre de la Photo *
                </label>
                <input
                  type="text"
                  required
                  value={galleryForm.title}
                  onChange={(e) => setGalleryForm({ ...galleryForm, title: e.target.value })}
                  placeholder="ex: Travaux pratiques en laboratoire informatique"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 font-bold focus:border-slate-900 outline-none"
                />
              </div>

              {/* COMPRESSED IMAGE SELECTOR */}
              <div>
                <ImageUploadCompressor
                  currentImageUrl={galleryForm.imageUrl}
                  onImageReady={(url) => setGalleryForm({ ...galleryForm, imageUrl: url })}
                  label="Photo de l'Activité (Compression WebP automatique)"
                  recommendedAspect="Format 16:9 ou 4:3 recommandé"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 text-[11px] uppercase tracking-wide">
                  Légende descriptive (Optionnelle)
                </label>
                <input
                  type="text"
                  value={galleryForm.caption}
                  onChange={(e) => setGalleryForm({ ...galleryForm, caption: e.target.value })}
                  placeholder="ex: Postes connectés sous onduleurs et encadrement pédagogique..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-800 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsGalleryModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSavingGallery || !galleryForm.imageUrl}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-bold transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {isSavingGallery ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                  ) : (
                    <Check className="w-3.5 h-3.5 text-amber-400" />
                  )}
                  <span>{editingGalleryItem ? 'Mettre à jour' : 'Ajouter à la Galerie'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: TÉLÉVERSER & COMPRESSER UNE IMAGE DANS LA MÉDIATHÈQUE
      ========================================================================= */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-4 sm:p-5 space-y-4 animate-scale-in my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-blue-900" />
                <h3 className="font-black text-slate-900 text-base">
                  Ajouter une Photo à la Médiathèque
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadMediaSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1 text-[11px] uppercase tracking-wide">
                  Titre du média *
                </label>
                <input
                  type="text"
                  required
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="ex: Bâtiment principal Delmas 50"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 font-bold focus:border-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 text-[11px] uppercase tracking-wide">
                  Catégorie d'affichage
                </label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 font-semibold focus:border-slate-900 outline-none"
                >
                  <option value="CAMPUS">Campus & Bâtiments</option>
                  <option value="SLIDESHOW">Diaporama d'Entête</option>
                  <option value="LAB">Laboratoire Tech</option>
                  <option value="EVENTS">Événements & Cérémonies</option>
                  <option value="NEWS">Actualités du Collège</option>
                </select>
              </div>

              <div>
                <ImageUploadCompressor
                  currentImageUrl={uploadedUrl}
                  onImageReady={(url) => setUploadedUrl(url)}
                  label="Sélectionner & Compresser la Photo (WebP Auto)"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={!uploadedUrl}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-950 text-white font-bold transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5 text-amber-400" />
                  <span>Enregistrer dans la Médiathèque</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: ÉDITION COMPLÈTE D'UNE DIAPOSITIVE DU DIAPORAMA
      ========================================================================= */}
      {isSlideModalOpen && editingSlide && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full p-4 sm:p-5 space-y-4 animate-scale-in my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-blue-900" />
                <h3 className="font-black text-slate-900 text-base">
                  Configuration de la Diapositive d'Entête
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSlideModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSlideSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1 text-[11px] uppercase tracking-wide">
                  Titre Principal *
                </label>
                <input
                  type="text"
                  required
                  value={editingSlide.title}
                  onChange={(e) => setEditingSlide({ ...editingSlide, title: e.target.value })}
                  placeholder="ex: Collège Isaac Newton"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 font-bold focus:border-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 text-[11px] uppercase tracking-wide">
                  Badge Supérieur (Ex : Campus Principal, Laboratoire Tech...) *
                </label>
                <input
                  type="text"
                  required
                  value={editingSlide.badge}
                  onChange={(e) => setEditingSlide({ ...editingSlide, badge: e.target.value })}
                  placeholder="ex: Campus Principal · Delmas 50, rue Dominique #2 bis"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 font-medium focus:border-slate-900 outline-none"
                />
              </div>

              {/* COMPRESSED IMAGE SELECTOR */}
              <div>
                <ImageUploadCompressor
                  currentImageUrl={editingSlide.image}
                  onImageReady={(url) => setEditingSlide({ ...editingSlide, image: url })}
                  label="Image Réelle de la Diapositive (Compression WebP 1280px)"
                  recommendedAspect="Format 16:9 panoramique d'entête"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 text-[11px] uppercase tracking-wide">
                  Sous-titre Explicatif *
                </label>
                <textarea
                  rows={2}
                  required
                  value={editingSlide.subtitle}
                  onChange={(e) => setEditingSlide({ ...editingSlide, subtitle: e.target.value })}
                  placeholder="Description percutante affichée sur la diapositive..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-800 leading-relaxed outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 text-[11px] uppercase tracking-wide">
                    Texte Bouton Principal
                  </label>
                  <input
                    type="text"
                    value={editingSlide.ctaText}
                    onChange={(e) => setEditingSlide({ ...editingSlide, ctaText: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 text-[11px] uppercase tracking-wide">
                    Destination Bouton Principal
                  </label>
                  <select
                    value={editingSlide.ctaTarget}
                    onChange={(e) => setEditingSlide({ ...editingSlide, ctaTarget: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 font-medium"
                  >
                    <option value="pre-registration">Préinscription en ligne</option>
                    <option value="programs">Programmes & Cursus</option>
                    <option value="college">Le Collège</option>
                    <option value="contact">Contact & Secrétariat</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 text-[11px] uppercase tracking-wide">
                    Texte Bouton Secondaire
                  </label>
                  <input
                    type="text"
                    value={editingSlide.secondaryCtaText || ''}
                    onChange={(e) => setEditingSlide({ ...editingSlide, secondaryCtaText: e.target.value })}
                    placeholder="Secrétariat (+509 3316-0934)"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 text-[11px] uppercase tracking-wide">
                    Destination Secondaire
                  </label>
                  <select
                    value={editingSlide.secondaryCtaTarget || 'contact'}
                    onChange={(e) => setEditingSlide({ ...editingSlide, secondaryCtaTarget: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 font-medium"
                  >
                    <option value="contact">Contact & Secrétariat</option>
                    <option value="pre-registration">Préinscription en ligne</option>
                    <option value="college">Le Collège</option>
                    <option value="resources">Palmarès & Résultats</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingSlide.isActive}
                    onChange={(e) => setEditingSlide({ ...editingSlide, isActive: e.target.checked })}
                    className="w-4 h-4 text-blue-900 rounded-sm"
                  />
                  <span className="font-bold text-slate-900 text-xs">Diapositive active en ligne</span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsSlideModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingSlide}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-950 text-white font-bold transition-colors cursor-pointer shadow-xs"
                  >
                    {isSavingSlide ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                    ) : (
                      <Check className="w-3.5 h-3.5 text-amber-400" />
                    )}
                    <span>Enregistrer la Diapositive</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
