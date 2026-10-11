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
  Camera,
  Laptop,
  Smartphone,
  Monitor
} from 'lucide-react';
import { toast } from 'sonner';
import { MediaItem, HeroSlide, GalleryItem } from '../../types';
import { getHeroSlideImageUrl, getGalleryImageUrl, getCacheBustedImageUrl } from '../../utils/cacheBuster';
import { apiService } from '../../services/api';
import { ImageUploadCompressor } from '../common/ImageUploadCompressor';
import { SCHOOL_IMAGES } from '../../assets/images';
import { DocumentManagerView } from './DocumentManagerView';

interface MediaLibraryViewProps {
  onSelectImageForTarget?: (url: string) => void;
  initialSubTab?: 'documents' | 'slideshow' | 'gallery' | 'media';
}

export const MediaLibraryView: React.FC<MediaLibraryViewProps> = ({
  onSelectImageForTarget,
  initialSubTab = 'documents'
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'documents' | 'slideshow' | 'gallery' | 'media'>(initialSubTab);
  
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
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

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

  // Media Edit modal state (Images Médiathèque entièrement éditables)
  const [editingMedia, setEditingMedia] = useState<MediaItem | null>(null);
  const [isMediaEditModalOpen, setIsMediaEditModalOpen] = useState(false);
  const [isSavingMedia, setIsSavingMedia] = useState(false);
  const [showEditMediaUploader, setShowEditMediaUploader] = useState(false);

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

  // Handle Open Edit Media
  const handleOpenEditMedia = (item: MediaItem) => {
    setEditingMedia({ ...item });
    setShowEditMediaUploader(false);
    setIsMediaEditModalOpen(true);
  };

  // Handle Save Edited Media
  const handleSaveMediaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMedia) return;
    if (!editingMedia.title.trim()) {
      toast.error('Le titre de l’image est obligatoire');
      return;
    }
    setIsSavingMedia(true);
    try {
      const updated = await apiService.updateMedia(editingMedia.id, editingMedia);
      setMediaItems(prev => prev.map(m => m.id === editingMedia.id ? updated : m));
      toast.success('Image de la médiathèque mise à jour avec succès dans PostgreSQL !');
      setIsMediaEditModalOpen(false);
    } catch (err: any) {
      toast.error('Erreur lors de la mise à jour de l’image : ' + (err.message || ''));
    } finally {
      setIsSavingMedia(false);
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
    updated.forEach((s, idx) => { s.order = idx + 1; });
    setSlides(updated);
    await apiService.saveHeroSlides(updated);
    await apiService.deleteHeroSlide(slideId);
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
              onClick={() => setActiveSubTab('documents')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeSubTab === 'documents'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Documents PDF
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('slideshow')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeSubTab === 'slideshow'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Diaporama ({slides.length})
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
              Galerie ({galleryItems.length})
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
          SUB-TAB 0 : DOCUMENTS PDF & RESSOURCES TÉLÉCHARGEABLES (ÉLÈVES & PARENTS)
      ========================================================================= */}
      {activeSubTab === 'documents' && (
        <DocumentManagerView />
      )}

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

          {/* Slides List Grid - Fluid Responsive on Mobile, Tablet & PC 14" */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-4">
            {slides.map((slide, index) => (
              <div 
                key={slide.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col justify-between group hover:border-blue-900/40 hover:shadow-xs transition-all"
              >
                <div>
                  <div className="relative aspect-[16/9] bg-slate-950 overflow-hidden">
                    <img 
                      src={getHeroSlideImageUrl(slide.image, slide)} 
                      alt={slide.title}
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                      style={{ objectPosition: slide.objectPosition || 'center 35%' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/25 to-transparent" />
                    
                    <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="bg-amber-400 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono shadow-xs">
                          #{index + 1}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-2xs ${
                          slide.isActive 
                            ? 'bg-emerald-500/95 text-white border-emerald-400/50' 
                            : 'bg-slate-800/90 text-slate-300 border-white/20'
                        }`}>
                          {slide.isActive ? 'En ligne' : 'Masquée'}
                        </span>
                      </div>
                      
                      <span className="bg-black/60 backdrop-blur-xs text-white text-[9.5px] font-mono px-2 py-0.5 rounded-full border border-white/10">
                        16:9 WebP
                      </span>
                    </div>

                    <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
                      <span className="text-[10px] font-bold text-amber-300 tracking-wide uppercase block truncate mb-0.5">
                        {slide.badge}
                      </span>
                      <h4 className="font-bold text-xs sm:text-sm leading-snug line-clamp-1">
                        {slide.title}
                      </h4>
                    </div>
                  </div>

                  <div className="p-3 sm:p-3.5 space-y-2">
                    <p className="text-[11.5px] sm:text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {slide.subtitle}
                    </p>

                    <div className="flex items-center gap-1.5 pt-1.5 border-t border-slate-100 text-[10.5px] text-slate-500 flex-wrap">
                      <span className="font-bold text-slate-700">Actions :</span>
                      <span className="bg-blue-50 text-blue-900 border border-blue-100 px-2 py-0.5 rounded font-semibold truncate max-w-[120px]">
                        {slide.ctaText}
                      </span>
                      {slide.secondaryCtaText && (
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded truncate max-w-[120px]">
                          {slide.secondaryCtaText}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-2.5 sm:p-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleSlideActive(slide.id)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      slide.isActive 
                        ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' 
                        : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 shadow-2xs'
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
                      <Edit3 className="w-3.5 h-3.5 text-blue-900" />
                      <span>Modifier</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteSlide(slide.id)}
                      className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Supprimer la diapositive"
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
                  <div className="relative aspect-video bg-slate-950 overflow-hidden">
                    <img 
                      src={getGalleryImageUrl(item.imageUrl, item)} 
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      decoding="async"
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
                  <div className="relative aspect-video bg-slate-950 overflow-hidden">
                    <img 
                      src={media.url} 
                      alt={media.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      decoding="async"
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
                    <button
                      type="button"
                      onClick={() => handleOpenEditMedia(media)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-blue-900 hover:border-blue-900 font-bold text-[10.5px] transition-colors cursor-pointer shadow-2xs"
                      title="Modifier les informations de cette photo"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-blue-900" />
                      <span>Modifier</span>
                    </button>
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
        <div 
          className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-2xl max-w-lg w-full my-auto flex flex-col max-h-[calc(100dvh-1rem)] sm:max-h-[calc(100dvh-2.5rem)] overflow-hidden animate-scale-in">
            <div className="px-4 py-3 sm:px-5 sm:py-3.5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white rounded-t-2xl sm:rounded-t-3xl">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-900 text-white flex items-center justify-center shadow-xs shrink-0">
                  <Camera className="w-4 h-4 text-amber-400" />
                </div>
                <h3 className="font-black text-slate-900 text-sm sm:text-base">
                  {editingGalleryItem ? 'Modifier la Photo de la Galerie' : 'Ajouter une Photo à la Galerie'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsGalleryModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                title="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGallerySubmit} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 text-xs overscroll-contain">
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
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 font-bold focus:border-blue-900 outline-none"
                />
              </div>

              {/* COMPRESSED IMAGE SELECTOR */}
              <div>
                <ImageUploadCompressor
                  currentImageUrl={galleryForm.imageUrl}
                  onImageReady={(url) => setGalleryForm({ ...galleryForm, imageUrl: url })}
                  label="Photo de l'Activité (Compression WebP automatique)"
                  recommendedAspect="Format 16:9 ou 4:3 recommandé"
                  compact={true}
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
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-800 outline-none"
                />
              </div>

              <div className="sticky bottom-0 -mx-4 -mb-4 sm:-mx-5 sm:-mb-5 mt-4 px-4 py-3 sm:px-5 sm:py-3.5 border-t border-slate-200 bg-white/95 backdrop-blur-md flex items-center justify-end gap-2 shrink-0 rounded-b-2xl sm:rounded-b-3xl shadow-sm z-10">
                <button
                  type="button"
                  onClick={() => setIsGalleryModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer text-xs"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSavingGallery || !galleryForm.imageUrl}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-bold transition-colors cursor-pointer shadow-xs disabled:opacity-50 text-xs"
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
          MODAL: MODIFIER UNE PHOTO DE LA MÉDIATHÈQUE (FORMULAIRE COMPLET ÉDITABLE)
      ========================================================================= */}
      {isMediaEditModalOpen && editingMedia && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden animate-scale-in">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-900 text-white flex items-center justify-center shadow-xs">
                  <Edit3 className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                    Modifier l'Image de la Médiathèque
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Modifiez le titre, la catégorie, ou remplacez le fichier photo.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMediaEditModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveMediaSubmit} className="p-5 sm:p-6 space-y-4">
              {/* Image Preview & Replacement Section */}
              <div className="space-y-3">
                <div className="relative aspect-[16/9] max-h-[220px] rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 flex items-center justify-center group">
                  <img
                    src={editingMedia.url}
                    alt={editingMedia.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2">
                    <span className="bg-slate-950/80 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/20">
                      {editingMedia.category}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-mono">
                    ID : {editingMedia.id}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowEditMediaUploader(!showEditMediaUploader)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-blue-900" />
                    <span>{showEditMediaUploader ? 'Annuler le téléversement' : 'Remplacer par une autre photo'}</span>
                  </button>
                </div>

                {showEditMediaUploader && (
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <p className="text-xs font-bold text-slate-700 mb-2">
                      Téléversez un nouveau fichier pour remplacer cette image :
                    </p>
                    <ImageUploadCompressor
                      onImageReady={(dataUrl: string) => {
                        setEditingMedia({ ...editingMedia, url: dataUrl });
                        setShowEditMediaUploader(false);
                        toast.success('Nouvelle photo chargée ! Cliquez sur Enregistrer pour valider.');
                      }}
                      recommendedAspect="16:9"
                      compact
                    />
                  </div>
                )}
              </div>

              {/* Title input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Titre de l'Image <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editingMedia.title}
                  onChange={(e) => setEditingMedia({ ...editingMedia, title: e.target.value })}
                  placeholder="Ex : Laboratoire Numérique & Ordinateurs"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-900 focus:ring-2 focus:ring-blue-900/10 font-medium text-slate-900"
                />
              </div>

              {/* Category & Dimensions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Catégorie
                  </label>
                  <select
                    value={editingMedia.category}
                    onChange={(e) => setEditingMedia({ ...editingMedia, category: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-900 text-slate-800 bg-white"
                  >
                    <option value="CAMPUS">Campus & Bâtiment</option>
                    <option value="SLIDESHOW">Diaporama d'Entête</option>
                    <option value="LAB">Laboratoire Tech</option>
                    <option value="EVENTS">Événements & Cérémonies</option>
                    <option value="NEWS">Actualités</option>
                    <option value="OTHER">Autre</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Dimensions estimées
                  </label>
                  <input
                    type="text"
                    value={editingMedia.dimensions || '1280x850'}
                    onChange={(e) => setEditingMedia({ ...editingMedia, dimensions: e.target.value })}
                    placeholder="Ex : 1920x1080"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-900 text-slate-800 bg-white font-mono"
                  />
                </div>
              </div>

              {/* URL Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  URL / Chemin direct de l'image
                </label>
                <input
                  type="text"
                  value={editingMedia.url}
                  onChange={(e) => setEditingMedia({ ...editingMedia, url: e.target.value })}
                  placeholder="https://... ou /images/..."
                  className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 focus:outline-none focus:border-blue-900 text-slate-700 bg-slate-50"
                />
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsMediaEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-xs transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSavingMedia}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSavingMedia ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Enregistrement...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5 text-amber-400" />
                      <span>Enregistrer les modifications</span>
                    </>
                  )}
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
        <div 
          className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-2xl max-w-lg w-full my-auto flex flex-col max-h-[calc(100dvh-1rem)] sm:max-h-[calc(100dvh-2.5rem)] overflow-hidden animate-scale-in">
            <div className="px-4 py-3 sm:px-5 sm:py-3.5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white rounded-t-2xl sm:rounded-t-3xl">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-900 text-white flex items-center justify-center shadow-xs shrink-0">
                  <Upload className="w-4 h-4 text-amber-400" />
                </div>
                <h3 className="font-black text-slate-900 text-sm sm:text-base">
                  Ajouter une Photo à la Médiathèque
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                title="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadMediaSubmit} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 text-xs overscroll-contain">
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
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 font-bold focus:border-blue-900 outline-none text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 text-[11px] uppercase tracking-wide">
                  Catégorie d'affichage
                </label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 font-semibold focus:border-blue-900 outline-none text-xs"
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
                  compact={true}
                />
              </div>

              <div className="sticky bottom-0 -mx-4 -mb-4 sm:-mx-5 sm:-mb-5 mt-4 px-4 py-3 sm:px-5 sm:py-3.5 border-t border-slate-200 bg-white/95 backdrop-blur-md flex items-center justify-end gap-2 shrink-0 rounded-b-2xl sm:rounded-b-3xl shadow-sm z-10">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer text-xs"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={!uploadedUrl}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-950 text-white font-bold transition-colors cursor-pointer shadow-xs disabled:opacity-50 text-xs"
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
          MODAL: ÉDITION COMPLÈTE D'UNE DIAPOSITIVE DU DIAPORAMA (RESPONSIVE PC 14", TABLETTE & MOBILE)
      ========================================================================= */}
      {isSlideModalOpen && editingSlide && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 lg:p-6 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-2xl w-full max-w-5xl my-auto flex flex-col max-h-[calc(100dvh-1rem)] sm:max-h-[calc(100dvh-2.5rem)] overflow-hidden animate-scale-in">
            
            {/* STICKY HEADER */}
            <div className="px-4 py-3 sm:px-6 sm:py-3.5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white rounded-t-2xl sm:rounded-t-3xl gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-blue-900 text-white flex items-center justify-center shadow-xs shrink-0">
                  <SlidersHorizontal className="w-4 h-4 text-amber-400" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-slate-900 text-sm sm:text-base truncate">
                      Configuration de la Diapositive d'Entête
                    </h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                      editingSlide.isActive 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                      {editingSlide.isActive ? 'Active en ligne' : 'Masquée'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 hidden sm:block truncate">
                    Mise en page dynamique responsive pour mobile, tablette et écran 14 pouces
                  </p>
                </div>
              </div>

              {/* Responsive Device Preview Switcher (Desktop 14" / Mobile) */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="hidden sm:inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs">
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('desktop')}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                      previewDevice === 'desktop'
                        ? 'bg-white text-blue-950 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Laptop className="w-3.5 h-3.5 text-blue-900" />
                    <span>PC 14" / Bureau</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice('mobile')}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                      previewDevice === 'mobile'
                        ? 'bg-white text-blue-950 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5 text-amber-600" />
                    <span>Mobile</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setIsSlideModalOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Fermer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* SCROLLABLE BODY FORM */}
            <form onSubmit={handleSaveSlideSubmit} className="flex-1 overflow-y-auto p-3.5 sm:p-5 lg:p-6 text-xs space-y-4 overscroll-contain">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-start">
                
                {/* LEFT COLUMN: TEXTS & CTAS (7 cols on Desktop/14" PC) */}
                <div className="lg:col-span-7 space-y-3.5">
                  
                  {/* Card 1: Main Texts */}
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-blue-900" />
                        <span>Titres & Accroches Institutionnelles</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">Champs obligatoires *</span>
                    </div>

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
                        className="w-full px-3 py-2 sm:py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 font-bold focus:border-blue-900 focus:ring-1 focus:ring-blue-900 outline-none text-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1 text-[11px] uppercase tracking-wide">
                        Badge Supérieur (Ex : Campus Principal, Pôle Technologies...) *
                      </label>
                      <input
                        type="text"
                        required
                        value={editingSlide.badge}
                        onChange={(e) => setEditingSlide({ ...editingSlide, badge: e.target.value })}
                        placeholder="ex: Campus Principal · Delmas 50, rue Dominique #2 bis"
                        className="w-full px-3 py-2 sm:py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 font-medium focus:border-blue-900 focus:ring-1 focus:ring-blue-900 outline-none text-xs"
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
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 leading-relaxed outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900 resize-y min-h-[54px] text-xs"
                      />
                    </div>
                  </div>

                  {/* Card 2: Action Buttons */}
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3">
                    <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <ArrowRight className="w-3.5 h-3.5 text-blue-900" />
                      <span>Boutons d'Appel à l'Action (CTA)</span>
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1 text-[11px] uppercase tracking-wide">
                          Texte Bouton Principal
                        </label>
                        <input
                          type="text"
                          value={editingSlide.ctaText}
                          onChange={(e) => setEditingSlide({ ...editingSlide, ctaText: e.target.value })}
                          placeholder="ex: Préinscription en ligne"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 font-semibold focus:border-blue-900 outline-none text-xs"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1 text-[11px] uppercase tracking-wide">
                          Destination Bouton Principal
                        </label>
                        <select
                          value={editingSlide.ctaTarget}
                          onChange={(e) => setEditingSlide({ ...editingSlide, ctaTarget: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 font-medium focus:border-blue-900 outline-none text-xs"
                        >
                          <option value="pre-registration">Formulaire de Préinscription</option>
                          <option value="programs">Programmes & Cursus</option>
                          <option value="college">Le Collège</option>
                          <option value="contact">Contact & Secrétariat</option>
                          <option value="gallery">Galerie Photos</option>
                          <option value="news">Actualités</option>
                          <option value="events">Agenda Officiel</option>
                          <option value="resources">Palmarès & Règlement</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1 text-[11px] uppercase tracking-wide">
                          Texte Bouton Secondaire (Optionnel)
                        </label>
                        <input
                          type="text"
                          value={editingSlide.secondaryCtaText || ''}
                          onChange={(e) => setEditingSlide({ ...editingSlide, secondaryCtaText: e.target.value })}
                          placeholder="ex: Secrétariat (+509 3316-0934)"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 focus:border-blue-900 outline-none text-xs"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1 text-[11px] uppercase tracking-wide">
                          Destination Secondaire
                        </label>
                        <select
                          value={editingSlide.secondaryCtaTarget || 'contact'}
                          onChange={(e) => setEditingSlide({ ...editingSlide, secondaryCtaTarget: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 font-medium focus:border-blue-900 outline-none text-xs"
                        >
                          <option value="contact">Contact & Secrétariat</option>
                          <option value="pre-registration">Préinscription en ligne</option>
                          <option value="college">Le Collège</option>
                          <option value="programs">Programmes & Cursus</option>
                          <option value="resources">Palmarès & Règlement</option>
                          <option value="gallery">Galerie Photos</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Cadrage & Alignement vertical (objectPosition) */}
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-blue-900" />
                        <span>Cadrage & Alignement de la Photo</span>
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {editingSlide.objectPosition || 'center 35%'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      {[
                        { label: 'Haut (Enseigne)', pos: 'center 20%' },
                        { label: 'Équilibré (14")', pos: 'center 35%' },
                        { label: 'Centré (Standard)', pos: 'center center' },
                        { label: 'Bas (Cour/Élèves)', pos: 'center 65%' },
                      ].map((preset) => (
                        <button
                          key={preset.pos}
                          type="button"
                          onClick={() => setEditingSlide({ ...editingSlide, objectPosition: preset.pos })}
                          className={`px-2.5 py-1.5 rounded-lg border text-center transition-all cursor-pointer text-[11px] font-semibold ${
                            (editingSlide.objectPosition || 'center 35%') === preset.pos
                              ? 'bg-blue-900 text-white border-blue-900 shadow-2xs font-bold'
                              : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>

                {/* RIGHT COLUMN: IMAGE COMPRESSOR & LIVE SIMULATOR (5 cols on Desktop/14" PC) */}
                <div className="lg:col-span-5 space-y-3.5">
                  
                  {/* Card 4: Compressed Image Selector */}
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80">
                    <ImageUploadCompressor
                      currentImageUrl={editingSlide.image}
                      onImageReady={(url) => setEditingSlide({ ...editingSlide, image: url })}
                      label="Photo Réelle de la Diapositive (WebP)"
                      recommendedAspect="Panoramique 16:9 (1280px)"
                      compact={true}
                      enforce169AspectRatio={true}
                    />
                  </div>

                  {/* Card 5: Real-time Responsive Preview Simulator */}
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900 text-white space-y-3 shadow-md">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span className="font-bold text-xs">Simulateur en Direct</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                        <span>{previewDevice === 'desktop' ? 'Format PC 14"' : 'Format Mobile'}</span>
                      </div>
                    </div>

                    {/* LIVE CARD PREVIEW */}
                    {previewDevice === 'desktop' ? (
                      <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden bg-slate-950 border border-white/10 shadow-xs flex flex-col justify-end p-3 text-left">
                        <img
                          src={editingSlide.image}
                          alt="Aperçu diapositive"
                          className="absolute inset-0 w-full h-full object-cover"
                          style={{ objectPosition: editingSlide.objectPosition || 'center 35%' }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />
                        
                        <div className="relative z-10 space-y-1">
                          <span className="bg-amber-400 text-slate-950 text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase tracking-wider inline-block">
                            {editingSlide.badge || 'Campus Principal'}
                          </span>
                          <h4 className="font-bold text-xs sm:text-sm text-white leading-tight truncate">
                            {editingSlide.title || 'Titre de la Diapositive'}
                          </h4>
                          <p className="text-[10px] text-slate-300 line-clamp-1 leading-snug">
                            {editingSlide.subtitle || 'Sous-titre descriptif...'}
                          </p>
                          <div className="flex items-center gap-1.5 pt-1">
                            <span className="px-2 py-0.5 rounded bg-blue-600 text-white font-bold text-[9px]">
                              {editingSlide.ctaText || 'Bouton'}
                            </span>
                            {editingSlide.secondaryCtaText && (
                              <span className="px-2 py-0.5 rounded bg-white/20 text-white text-[9px]">
                                {editingSlide.secondaryCtaText}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="max-w-[220px] mx-auto rounded-xl overflow-hidden bg-slate-950 border-2 border-slate-700 aspect-[9/13] relative p-2.5 flex flex-col justify-end text-left shadow-lg">
                        <img
                          src={editingSlide.image}
                          alt="Aperçu smartphone"
                          className="absolute inset-0 w-full h-full object-cover"
                          style={{ objectPosition: editingSlide.objectPosition || 'center 35%' }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/50 to-transparent" />
                        
                        <div className="relative z-10 space-y-1">
                          <span className="bg-amber-400 text-slate-950 text-[8px] font-bold px-1 py-0.2 rounded-full uppercase tracking-wider inline-block truncate max-w-full">
                            {editingSlide.badge || 'Campus'}
                          </span>
                          <h4 className="font-bold text-xs text-white leading-tight line-clamp-2">
                            {editingSlide.title || 'Titre Diapositive'}
                          </h4>
                          <p className="text-[9.5px] text-slate-300 line-clamp-2 leading-tight">
                            {editingSlide.subtitle || 'Description sur smartphone...'}
                          </p>
                          <div className="pt-0.5">
                            <span className="block text-center w-full px-2 py-1 rounded bg-amber-400 text-slate-950 font-bold text-[9px]">
                              {editingSlide.ctaText || 'Action'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                </div>

              </div>

              {/* STICKY FOOTER ACTIONS */}
              <div className="sticky bottom-0 -mx-3.5 -mb-3.5 sm:-mx-5 sm:-mb-5 lg:-mx-6 lg:-mb-6 mt-4 px-4 py-3 sm:px-6 sm:py-3.5 border-t border-slate-200 bg-white/95 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 shrink-0 rounded-b-2xl sm:rounded-b-3xl shadow-sm z-10">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={editingSlide.isActive}
                    onChange={(e) => setEditingSlide({ ...editingSlide, isActive: e.target.checked })}
                    className="w-4 h-4 text-blue-900 rounded-sm focus:ring-blue-900 cursor-pointer"
                  />
                  <span className="font-bold text-slate-900 text-xs">
                    Diapositive active en ligne sur le site
                  </span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsSlideModalOpen(false)}
                    className="px-3.5 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer text-xs transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingSlide}
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-bold transition-all cursor-pointer shadow-xs text-xs"
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
