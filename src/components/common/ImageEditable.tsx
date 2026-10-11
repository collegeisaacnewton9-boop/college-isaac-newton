import React, { useState } from 'react';
import { Camera, Upload, Trash2, X, Check, Image as ImageIcon, Sparkles } from 'lucide-react';
import { useContentBlocks } from '../../context/ContentBlockContext';
import { User } from '../../types';
import { ImageUploadCompressor } from './ImageUploadCompressor';
import { toast } from 'sonner';

export interface ImageEditableProps {
  contentKey: string;
  defaultImage: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  currentUser?: User | null;
  label?: string;
  recommendedAspect?: string;
  enforce169?: boolean;
}

export const ImageEditable: React.FC<ImageEditableProps> = ({
  contentKey,
  defaultImage,
  alt,
  className = 'w-full h-full object-cover',
  containerClassName = 'relative aspect-video w-full overflow-hidden bg-slate-900',
  currentUser,
  label = 'Remplacer cette image',
  recommendedAspect = 'Format 16:9 recommandé',
  enforce169 = true,
}) => {
  const { getBlock, saveBlock, resetBlock, isEditModeActive } = useContentBlocks();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempImage, setTempImage] = useState<string | null>(null);

  const canEdit = Boolean(currentUser && ['ADMIN', 'EDITOR', 'MODERATOR'].includes(currentUser.role));
  const isEditableNow = canEdit && isEditModeActive;

  // Retrieve current image (customized from PostgreSQL or default)
  const currentImageUrl = getBlock(contentKey, defaultImage);
  const isCustomized = currentImageUrl !== defaultImage;

  const handleOpenModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTempImage(currentImageUrl);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (tempImage && tempImage !== currentImageUrl) {
      await saveBlock(contentKey, tempImage);
      toast.success('Image enregistrée avec succès !', {
        description: `La nouvelle photo est désormais visible sur le site officiel.`,
      });
    }
    setIsModalOpen(false);
  };

  const handleResetToDefault = async () => {
    if (window.confirm('Voulez-vous rétablir l’image d’origine du collège ?')) {
      await saveBlock(contentKey, defaultImage);
      toast.info('Image réinitialisée avec la photo certifiée d’origine.');
      setIsModalOpen(false);
    }
  };

  return (
    <div className={`group relative ${containerClassName}`}>
      <img
        src={currentImageUrl}
        alt={alt}
        referrerPolicy="no-referrer"
        className={className}
      />

      {/* Admin Live Edit Overlay & Action Button */}
      {isEditableNow && (
        <>
          <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-3 pointer-events-none">
            <span className="px-3 py-1.5 rounded-xl bg-white/95 text-slate-900 font-bold text-xs shadow-lg backdrop-blur-xs flex items-center gap-1.5 transform scale-95 group-hover:scale-100 transition-transform">
              <Camera className="w-3.5 h-3.5 text-blue-900" />
              <span>Cliquer pour modifier la photo</span>
            </span>
          </div>

          <button
            type="button"
            onClick={handleOpenModal}
            className="absolute top-2.5 right-2.5 z-20 px-2.5 py-1.5 rounded-xl bg-slate-950/85 hover:bg-slate-950 text-white font-bold text-[11px] shadow-lg border border-white/20 backdrop-blur-xs flex items-center gap-1.5 transition-all cursor-pointer hover:scale-105"
            title="Modifier ou téléverser votre photo réelle"
          >
            <Camera className="w-3.5 h-3.5 text-amber-400" />
            <span>Changer la photo</span>
            {isCustomized && (
              <span className="w-2 h-2 rounded-full bg-emerald-400" title="Photo personnalisée active" />
            )}
          </button>
        </>
      )}

      {/* Modal for Image Upload & Compression */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="bg-white rounded-2xl max-w-lg w-full p-4 sm:p-5 shadow-2xl border border-slate-200 animate-scale-in space-y-3.5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center">
                  <ImageIcon className="w-4 h-4 text-blue-900" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{label}</h3>
                  <p className="text-[10px] text-slate-500">
                    Téléversez la photo authentique de votre établissement (compression automatique 16:9).
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Compressor / Dropzone Component */}
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <ImageUploadCompressor
                currentImageUrl={tempImage || currentImageUrl}
                onImageReady={(url) => setTempImage(url)}
                label="Sélectionnez votre fichier photo"
                recommendedAspect={recommendedAspect}
                compact={true}
                enforce169AspectRatio={enforce169}
              />
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              {isCustomized ? (
                <button
                  type="button"
                  onClick={handleResetToDefault}
                  className="inline-flex items-center gap-1 text-[11px] text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Rétablir l’image par défaut</span>
                </button>
              ) : (
                <span className="text-[10px] text-slate-400">Photo d’origine active</span>
              )}

              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs cursor-pointer shadow-xs"
                >
                  <Check className="w-3.5 h-3.5 text-amber-400" />
                  <span>Valider & Enregistrer</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
