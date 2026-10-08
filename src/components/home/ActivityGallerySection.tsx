import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  ArrowRight, 
  X, 
  ZoomIn,
  Plus,
  Edit2,
  Trash2,
  Download
} from 'lucide-react';
import { toast } from 'sonner';
import { apiService } from '../../services/api';
import { GalleryItem, User } from '../../types';
import { INITIAL_GALLERY } from '../../data/mockData';
import { GalleryItemModal } from '../gallery/GalleryItemModal';
import { getGalleryImageUrl } from '../../utils/cacheBuster';
import { ImageLightboxModal } from '../common/ImageLightboxModal';

interface ActivityGallerySectionProps {
  onNavigate: (page: string, subSection?: string) => void;
  currentUser?: User | null;
}

export const ActivityGallerySection: React.FC<ActivityGallerySectionProps> = ({ onNavigate, currentUser }) => {
  const canManageGallery = Boolean(currentUser && ['ADMIN', 'EDITOR'].includes(currentUser.role));
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(INITIAL_GALLERY);
  const [activePhoto, setActivePhoto] = useState<GalleryItem | null>(null);

  // CRUD Modal State
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
    if (!window.confirm('Supprimer cette photo de la galerie des activités ?')) return;

    try {
      await apiService.deleteGalleryItem(id);
      setGalleryItems((prev) => prev.filter((item) => item.id !== id));
      if (activePhoto?.id === id) setActivePhoto(null);
      toast.success('Photo retirée de la galerie');
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleSaved = (item: GalleryItem) => {
    fetchItems();
    if (activePhoto?.id === item.id) {
      setActivePhoto(item);
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6" aria-label="Galerie des activités scolaires">
      
      {/* Section Header - Clean, Visual & Modern with direct CRUD action */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-4 sm:mb-5 gap-3 border-b border-slate-100 pb-3">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-900 mb-1">
            <Camera className="w-4 h-4 text-amber-500" />
            <span>Vie Scolaire & Campus</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
            Galerie des Activités Scolaires
          </h2>
        </div>

        {/* Action Controls: Add photo (staff only) + View full album */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {canManageGallery && (
            <button
              type="button"
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95 shrink-0"
              title="Ajouter une photo à la galerie"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter une photo</span>
            </button>
          )}

          <button
            onClick={() => onNavigate('gallery')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors cursor-pointer group shrink-0"
          >
            <span>Toute la photothèque ({galleryItems.length})</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* MODERN VISUAL GRID - Clean, no activity categories, no excessive texts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {galleryItems.slice(0, 6).map((item) => (
          <div
            key={item.id}
            onClick={() => setActivePhoto(item)}
            className="group relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-200/90 shadow-2xs hover:shadow-xl transition-all duration-300 aspect-video w-full cursor-pointer"
          >
            <img
              src={getGalleryImageUrl(item.imageUrl, item)}
              alt={item.altText || item.title}
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-106 transition-transform duration-500 ease-out"
              loading="lazy"
              decoding="async"
              onError={(e) => {
                const target = e.currentTarget;
                if (!target.dataset.triedFallback) {
                  target.dataset.triedFallback = '1';
                  if (target.src.includes('/src/assets/images/')) {
                    target.src = target.src.replace('/src/assets/images/', '/images/');
                  } else {
                    target.src = '/images/campus_courtyard_building_1790531780046.jpg';
                  }
                }
              }}
            />

            {/* Gradient Overlay for high readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent opacity-85 group-hover:opacity-90 transition-opacity" />

            {/* Quick Action Buttons (Edit, Delete, Zoom) on Hover */}
            <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity z-10">
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

            {/* Clean Title at Bottom */}
            <div className="absolute bottom-0 inset-x-0 p-3.5 sm:p-4 text-white">
              <h3 className="font-serif font-bold text-sm sm:text-base text-white group-hover:text-amber-300 transition-colors leading-snug line-clamp-1">
                {item.title}
              </h3>
              {item.caption && (
                <p className="text-[11px] text-slate-300 line-clamp-1 font-light mt-0.5 opacity-90">
                  {item.caption}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* FULL-SCREEN ZOOMABLE LIGHTBOX MODAL */}
      <ImageLightboxModal
        isOpen={Boolean(activePhoto)}
        onClose={() => setActivePhoto(null)}
        items={galleryItems}
        currentIndex={activePhoto ? galleryItems.findIndex((i) => i.id === activePhoto.id) : 0}
        onIndexChange={(idx) => setActivePhoto(galleryItems[idx])}
        onEditItem={(item) => {
          setActivePhoto(null);
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
            if (activePhoto?.id === id) setActivePhoto(null);
          }}
        />
      )}

    </section>
  );
};
