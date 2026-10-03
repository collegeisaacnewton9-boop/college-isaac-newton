import React, { useState, useEffect } from 'react';
import { 
  X, 
  ZoomIn, 
  Camera, 
  Plus, 
  Edit2, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  Download
} from 'lucide-react';
import { toast } from 'sonner';
import { apiService } from '../services/api';
import { INITIAL_GALLERY } from '../data/mockData';
import { GalleryItem } from '../types';
import { GalleryItemModal } from '../components/gallery/GalleryItemModal';

export const GalleryPage: React.FC = () => {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(INITIAL_GALLERY);
  const [activeItem, setActiveItem] = useState<GalleryItem | null>(null);

  // Form Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);

  const fetchItems = () => {
    apiService.getGallery().then((items) => {
      if (items && items.length > 0) setGalleryItems(items);
    }).catch(() => {});
  };

  useEffect(() => {
    fetchItems();

    const onGalleryUpdate = () => {
      fetchItems();
    };

    window.addEventListener('cin:gallery-updated', onGalleryUpdate);
    return () => window.removeEventListener('cin:gallery-updated', onGalleryUpdate);
  }, []);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: GalleryItem, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDeleteItem = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!window.confirm('Supprimer cette photo de la galerie ?')) return;

    try {
      await apiService.deleteGalleryItem(id);
      setGalleryItems((prev) => prev.filter((item) => item.id !== id));
      if (activeItem?.id === id) setActiveItem(null);
      toast.success('Photo retirée de la galerie');
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleSaved = (item: GalleryItem) => {
    fetchItems();
    if (activeItem?.id === item.id) {
      setActiveItem(item);
    }
  };

  const activeIndex = activeItem ? galleryItems.findIndex((g) => g.id === activeItem.id) : -1;
  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeIndex > 0) {
      setActiveItem(galleryItems[activeIndex - 1]);
    } else {
      setActiveItem(galleryItems[galleryItems.length - 1]);
    }
  };
  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeIndex >= 0 && activeIndex < galleryItems.length - 1) {
      setActiveItem(galleryItems[activeIndex + 1]);
    } else {
      setActiveItem(galleryItems[0]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6 sm:space-y-8 font-sans">
      
      {/* Header - Modern, Clean, No verbose paragraphs */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="max-w-2xl space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-900">
            <Camera className="w-4 h-4 text-amber-500" />
            <span>Photothèque Officielle ({galleryItems.length} photos)</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900">
            Galerie des Activités Scolaires
          </h1>
        </div>

        {/* Action Button: Add Photo */}
        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-950 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95 shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-amber-400" />
          <span>Ajouter une photo</span>
        </button>
      </div>

      {/* Modern Visual Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {galleryItems.map((item) => (
          <div
            key={item.id}
            onClick={() => setActiveItem(item)}
            className="group relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-200/90 shadow-2xs aspect-[4/3] cursor-pointer hover:shadow-xl transition-all duration-300"
          >
            {/* Image with zoom on hover */}
            <img
              src={item.imageUrl}
              alt={item.altText || item.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-106 duration-500 ease-out"
              loading="lazy"
            />

            {/* Gradient Overlay for high contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent opacity-85 group-hover:opacity-90 transition-opacity" />

            {/* Action Buttons Overlay on Hover / Tap */}
            <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity z-10">
              <button
                type="button"
                onClick={(e) => handleOpenEdit(item, e)}
                className="w-8 h-8 rounded-full bg-slate-900/80 hover:bg-blue-900 text-white flex items-center justify-center transition-colors shadow-md backdrop-blur-xs cursor-pointer"
                title="Modifier cette photo"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={(e) => handleDeleteItem(item.id, e)}
                className="w-8 h-8 rounded-full bg-slate-900/80 hover:bg-rose-600 text-white flex items-center justify-center transition-colors shadow-md backdrop-blur-xs cursor-pointer"
                title="Supprimer cette photo"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              <div className="w-8 h-8 rounded-full bg-slate-900/80 text-amber-300 flex items-center justify-center shadow-md backdrop-blur-xs">
                <ZoomIn className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Title & Caption */}
            <div className="absolute bottom-0 inset-x-0 p-4 text-white">
              <h3 className="font-serif font-bold text-sm sm:text-base text-white group-hover:text-amber-300 transition-colors leading-snug line-clamp-1">
                {item.title}
              </h3>
              {item.caption && (
                <p className="text-xs text-slate-300 line-clamp-1 mt-0.5 opacity-90">
                  {item.caption}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal with Full Controls */}
      {activeItem && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-150"
          onClick={() => setActiveItem(null)}
          role="dialog"
          aria-modal="true"
        >
          <div 
            className="relative max-w-4xl w-full bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar with actions */}
            <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const target = activeItem;
                  setActiveItem(null);
                  handleOpenEdit(target);
                }}
                className="p-2 rounded-full bg-slate-950/80 hover:bg-blue-900 text-white transition-colors cursor-pointer shadow-md"
                title="Modifier"
              >
                <Edit2 className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  const id = activeItem.id;
                  handleDeleteItem(id);
                }}
                className="p-2 rounded-full bg-slate-950/80 hover:bg-rose-600 text-white transition-colors cursor-pointer shadow-md"
                title="Supprimer"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <button
                onClick={() => setActiveItem(null)}
                className="p-2 rounded-full bg-slate-950/80 hover:bg-slate-950 text-white transition-colors cursor-pointer shadow-md"
                aria-label="Fermer la vue agrandie"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Left & Right navigation arrows */}
            {galleryItems.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-10 p-2.5 rounded-full bg-slate-950/70 hover:bg-slate-950 text-white transition-colors cursor-pointer shadow-md"
                  aria-label="Photo précédente"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-10 p-2.5 rounded-full bg-slate-950/70 hover:bg-slate-950 text-white transition-colors cursor-pointer shadow-md"
                  aria-label="Photo suivante"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Full Image */}
            <div className="max-h-[70vh] bg-black flex items-center justify-center">
              <img
                src={activeItem.imageUrl}
                alt={activeItem.altText || activeItem.title}
                referrerPolicy="no-referrer"
                className="max-h-[70vh] w-auto object-contain mx-auto"
              />
            </div>

            {/* Bottom Bar: Title, Caption, Edit Button */}
            <div className="p-4 sm:p-5 bg-slate-900 text-white border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-serif font-bold text-base sm:text-lg text-white">
                  {activeItem.title}
                </h2>
                {activeItem.caption && (
                  <p className="text-xs text-slate-300 mt-0.5">{activeItem.caption}</p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => {
                    const target = activeItem;
                    setActiveItem(null);
                    handleOpenEdit(target);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Modifier</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FORM MODAL FOR ADDING & EDITING GALLERY ITEMS */}
      <GalleryItemModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }}
        editingItem={editingItem}
        onSaved={handleSaved}
        onDeleted={(id) => {
          setGalleryItems((prev) => prev.filter((item) => item.id !== id));
          if (activeItem?.id === id) setActiveItem(null);
        }}
      />

    </div>
  );
};
