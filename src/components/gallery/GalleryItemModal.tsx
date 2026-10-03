import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Check, 
  Trash2, 
  Camera, 
  Loader2,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { GalleryItem } from '../../types';
import { apiService } from '../../services/api';
import { ImageUploadCompressor } from '../common/ImageUploadCompressor';

interface GalleryItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingItem?: GalleryItem | null;
  onSaved?: (item: GalleryItem) => void;
  onDeleted?: (id: string) => void;
}

export const GalleryItemModal: React.FC<GalleryItemModalProps> = ({
  isOpen,
  onClose,
  editingItem,
  onSaved,
  onDeleted,
}) => {
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (editingItem) {
      setTitle(editingItem.title || '');
      setImageUrl(editingItem.imageUrl || '');
      setCaption(editingItem.caption || '');
    } else {
      setTitle('');
      setImageUrl('');
      setCaption('');
    }
    setShowDeleteConfirm(false);
  }, [editingItem, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Titre requis', { description: 'Veuillez saisir un titre pour cette photo.' });
      return;
    }
    if (!imageUrl.trim()) {
      toast.error('Image requise', { description: 'Veuillez télécharger ou saisir une URL d\'image.' });
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingItem) {
        const updated = await apiService.updateGalleryItem(editingItem.id, {
          title: title.trim(),
          imageUrl: imageUrl.trim(),
          caption: caption.trim() || undefined,
        });
        if (updated) {
          toast.success('Photo mise à jour !');
          onSaved?.(updated);
        }
      } else {
        const created = await apiService.createGalleryItem({
          title: title.trim(),
          imageUrl: imageUrl.trim(),
          caption: caption.trim() || undefined,
        });
        toast.success('Nouvelle photo ajoutée à la galerie !');
        onSaved?.(created);
      }
      onClose();
    } catch {
      toast.error('Une erreur est survenue lors de l’enregistrement.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!editingItem) return;
    setIsSubmitting(true);
    try {
      await apiService.deleteGalleryItem(editingItem.id);
      toast.success('Photo retirée de la galerie');
      onDeleted?.(editingItem.id);
      onClose();
    } catch {
      toast.error('Impossible de supprimer cette photo');
    } finally {
      setIsSubmitting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200"
        role="dialog"
        aria-modal="true"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/70 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-900/10 text-blue-900">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-slate-900">
                  {editingItem ? 'Modifier la Photo' : 'Ajouter une Photo'}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Galerie des activités scolaires et périscolaires
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Titre de l'activité ou de la photo *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="ex: Tournoi de basketball interscolaire"
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all"
              />
            </div>

            {/* Image Upload with Compression */}
            <div>
              <ImageUploadCompressor
                currentImageUrl={imageUrl}
                onImageReady={(url) => setImageUrl(url)}
                label="Photo (compression automatique ou choix d'une vue)"
                recommendedAspect="Format paysage 16:9 recommandé"
              />
            </div>

            {/* Optional Short Caption */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Légende courte <span className="font-normal text-slate-400 text-[11px]">(optionnelle)</span>
              </label>
              <textarea
                rows={2}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Brève description visible lors de l'agrandissement..."
                className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all resize-none"
              />
            </div>

            {/* Delete Confirmation Box if triggered */}
            {showDeleteConfirm && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-900 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold">Confirmer la suppression ?</p>
                  <p className="text-[11px] text-rose-700 mt-0.5">Cette photo sera définitivement retirée de la galerie.</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={handleDelete}
                      className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer"
                    >
                      {isSubmitting ? 'Suppression...' : 'Oui, supprimer'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-2.5 py-1 rounded-lg bg-white border border-rose-200 text-rose-900 hover:bg-rose-100 text-xs font-medium cursor-pointer"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <div>
                {editingItem && !showDeleteConfirm && (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Supprimer</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || !title.trim() || !imageUrl.trim()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-950 disabled:bg-slate-200 text-white disabled:text-slate-400 text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Enregistrement...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{editingItem ? 'Mettre à jour' : 'Ajouter à la Galerie'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
