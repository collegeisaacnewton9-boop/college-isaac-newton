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
import { GalleryItem, User } from '../types';
import { getGalleryImageUrl } from '../utils/cacheBuster';
import { GalleryItemModal } from '../components/gallery/GalleryItemModal';
import { ImageLightboxModal } from '../components/common/ImageLightboxModal';

interface GalleryPageProps {
  currentUser?: User | null;
}

export const GalleryPage: React.FC<GalleryPageProps> = ({ currentUser }) => {
  const canManageGallery = Boolean(currentUser && ['ADMIN', 'EDITOR'].includes(currentUser.role));
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

        {/* Action Button: Add Photo (Staff only) */}
        {canManageGallery && (
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-950 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95 shrink-0 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Ajouter une photo</span>
          </button>
        )}
      </div>

      {/* Modern Visual Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {galleryItems.map((item) => (
          <div
            key={item.id}
            onClick={() => setActiveItem(item)}
            className="group relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-200/90 shadow-2xs aspect-video w-full cursor-pointer hover:shadow-xl transition-all duration-300"
          >
            {/* Image with fixed aspect-video and object-cover */}
            <img
              src={getGalleryImageUrl(item.imageUrl, item)}
              alt={item.altText || item.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-106 duration-500 ease-out"
              loading="lazy"
            />

            {/* Gradient Overlay for high contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent opacity-85 group-hover:opacity-90 transition-opacity" />

            {/* Action Buttons Overlay on Hover / Tap */}
            <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity z-10">
              {canManageGallery && (
                <>
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
                </>
              )}

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

      {/* Full-Screen Zoomable Lightbox Modal */}
      <ImageLightboxModal
        isOpen={Boolean(activeItem)}
        onClose={() => setActiveItem(null)}
        items={galleryItems}
        currentIndex={activeIndex >= 0 ? activeIndex : 0}
        onIndexChange={(idx) => setActiveItem(galleryItems[idx])}
        onEditItem={(item) => {
          setActiveItem(null);
          handleOpenEdit(item);
        }}
        canEdit={canManageGallery}
      />

      {/* FORM MODAL FOR ADDING & EDITING GALLERY ITEMS (STAFF ONLY) */}
      {canManageGallery && (
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
      )}

    </div>
  );
};
