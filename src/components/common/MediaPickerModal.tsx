import React, { useState, useEffect } from 'react';
import { 
  X, 
  Search, 
  Check, 
  Image as ImageIcon, 
  Upload, 
  Sparkles, 
  Layers, 
  Download, 
  Loader2, 
  Plus, 
  CheckCircle2,
  Calendar,
  Filter
} from 'lucide-react';
import { MediaItem } from '../../types';
import { mediaLibraryService, MediaCategory } from '../../services/mediaLibraryService';
import { compressImage, formatBytes } from '../../utils/imageCompressor';
import { downloadImageFile } from '../../utils/downloadHelper';
import { toast } from 'sonner';

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (imageUrl: string, mediaItem?: MediaItem) => void;
  currentSelectedUrl?: string;
  title?: string;
  description?: string;
  categoryFilter?: MediaCategory;
}

const CATEGORIES: { label: string; value: string }[] = [
  { label: 'Toutes les photos', value: 'ALL' },
  { label: 'Campus & Bâtiment', value: 'CAMPUS' },
  { label: 'Diaporama (Hero)', value: 'SLIDESHOW' },
  { label: 'Informatique & Labo', value: 'LAB' },
  { label: 'Vie Scolaire & Civique', value: 'EVENTS' },
  { label: 'Actualités & Articles', value: 'NEWS' },
];

export const MediaPickerModal: React.FC<MediaPickerModalProps> = ({
  isOpen,
  onClose,
  onSelectImage,
  currentSelectedUrl = '',
  title = 'Médiathèque Centrale — Réutilisation d’Images',
  description = 'Sélectionnez une photo déjà enregistrée sur le serveur pour l’utiliser immédiatement, sans avoir à la retéléverser.',
  categoryFilter = 'ALL',
}) => {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryFilter);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUrl, setSelectedUrl] = useState<string>(currentSelectedUrl);
  const [showDirectUpload, setShowDirectUpload] = useState(false);

  const loadMedia = async () => {
    setIsLoading(true);
    try {
      const data = await mediaLibraryService.getMedia({
        category: selectedCategory,
        search: searchQuery,
      });
      setItems(data);
    } catch {
      toast.error('Erreur lors du chargement des médias');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setSelectedUrl(currentSelectedUrl);
      setShowDirectUpload(false);
      loadMedia();
    }
  }, [isOpen, selectedCategory, searchQuery]);

  useEffect(() => {
    const handleUpdate = () => {
      loadMedia();
    };
    window.addEventListener('cin:media-updated', handleUpdate);
    return () => window.removeEventListener('cin:media-updated', handleUpdate);
  }, [selectedCategory, searchQuery]);

  if (!isOpen) return null;

  const handleConfirmSelection = () => {
    if (!selectedUrl) {
      toast.error('Veuillez sélectionner une image dans la médiathèque');
      return;
    }
    const matchedItem = items.find((m) => m.url === selectedUrl);
    onSelectImage(selectedUrl, matchedItem);
    toast.success('Image réutilisée depuis la médiathèque !');
    onClose();
  };

  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const result = await compressImage(file, {
        preset: 'balanced',
        mimeType: 'image/webp',
        targetMaxSizeBytes: 600 * 1024,
      });
      const registered = await mediaLibraryService.registerMedia({
        url: result.dataUrl,
        title: file.name.replace(/\.[^/.]+$/, ''),
        dimensions: `${result.width} × ${result.height} px`,
        sizeBytes: result.compressedSize,
        category: (selectedCategory !== 'ALL' ? selectedCategory : 'CAMPUS') as MediaCategory,
      });
      setSelectedUrl(registered.url);
      setShowDirectUpload(false);
      await loadMedia();
      toast.success('Nouvelle image compressée en WebP et indexée dans la médiathèque !', {
        description: `${formatBytes(result.originalSize)} ➔ ${formatBytes(result.compressedSize)} (-${result.reductionPercent}%)`,
      });
    } catch (err: any) {
      toast.error('Erreur lors de la compression ou de l’enregistrement');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto animate-fade-in font-sans"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-2xl max-w-4xl w-full my-auto flex flex-col max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-3rem)] overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className="px-4 py-3 sm:px-6 sm:py-3.5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-blue-900 text-white flex items-center justify-center shadow-xs shrink-0">
              <Layers className="w-5 h-5 text-amber-400" />
            </div>
            <div className="min-w-0">
              <h3 className="font-serif font-black text-slate-900 text-sm sm:text-base truncate">
                {title}
              </h3>
              <p className="text-[11px] text-slate-500 truncate hidden sm:block">
                {description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowDirectUpload(!showDirectUpload)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ajouter une Nouvelle Photo</span>
              <span className="sm:hidden">Ajouter</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* DIRECT UPLOADER EXPANDABLE DRAWER */}
        {showDirectUpload && (
          <div className="p-3 sm:p-4 bg-slate-50 border-b border-slate-200 animate-fade-in shrink-0">
            <div className="max-w-xl mx-auto space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-blue-900" />
                  <span>Importer un nouveau fichier vers la médiathèque</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowDirectUpload(false)}
                  className="text-[11px] text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  Fermer
                </button>
              </div>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-blue-900 rounded-xl p-4 bg-white text-center cursor-pointer transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-900 mx-auto flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                  {isUploading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-blue-900" />
                  ) : (
                    <Upload className="w-5 h-5" />
                  )}
                </div>
                <p className="font-bold text-xs text-slate-800">
                  {isUploading ? 'Compression WebP & Indexation en cours...' : 'Cliquez pour sélectionner une photo à indexer'}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Compression WebP Canvas HTML5 automatique · Fichiers JPEG, PNG, WEBP acceptés
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>
          </div>
        )}

        {/* FILTERS & SEARCH TOOLBAR */}
        <div className="p-3 sm:px-6 sm:py-3 bg-slate-50/80 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shrink-0">
          {/* Category Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat.value
                    ? 'bg-blue-900 text-white shadow-2xs font-bold'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher une photo..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900 transition-colors"
            />
          </div>
        </div>

        {/* MEDIA GRID SCROLLABLE AREA */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6">
          {isLoading ? (
            <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-blue-900" />
              <span className="text-xs">Chargement de la médiathèque...</span>
            </div>
          ) : items.length === 0 ? (
            <div className="py-16 text-center text-slate-500 space-y-2">
              <ImageIcon className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="font-semibold text-sm">Aucune photo trouvée dans cette catégorie</p>
              <p className="text-xs text-slate-400">
                Vous pouvez en ajouter une nouvelle via le bouton doré ci-dessus.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {items.map((item) => {
                const isSelected = selectedUrl === item.url;

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedUrl(item.url)}
                    className={`group relative rounded-xl sm:rounded-2xl border overflow-hidden cursor-pointer transition-all flex flex-col bg-white shadow-2xs hover:shadow-md ${
                      isSelected
                        ? 'border-blue-600 ring-2 ring-blue-600/40 shadow-blue-100'
                        : 'border-slate-200 hover:border-blue-900/40'
                    }`}
                  >
                    {/* 16:9 Thumbnail Preview */}
                    <div className="relative aspect-video w-full bg-slate-950 overflow-hidden">
                      <img
                        src={item.url}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />

                      {/* Selection Checkmark */}
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md animate-scale-in">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}

                      {/* Category Badge */}
                      <div className="absolute bottom-1.5 left-1.5">
                        <span className="px-1.5 py-0.5 rounded-md bg-black/70 backdrop-blur-xs text-white text-[9px] font-bold uppercase tracking-wider">
                          {item.category}
                        </span>
                      </div>
                    </div>

                    {/* Metadata Card Footer */}
                    <div className="p-2 sm:p-2.5 flex flex-col justify-between flex-1 gap-1">
                      <h4
                        className="font-bold text-[11px] text-slate-900 line-clamp-1 leading-snug"
                        title={item.title}
                      >
                        {item.title}
                      </h4>

                      <div className="flex items-center justify-between text-[9.5px] text-slate-400 pt-1 border-t border-slate-100">
                        <span className="font-mono">{item.dimensions || '16:9'}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadImageFile(item.url, `${item.id}.jpg`);
                          }}
                          className="hover:text-blue-900 p-0.5"
                          title="Télécharger sur mon poste local"
                        >
                          <Download className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* MODAL FOOTER ACTIONS */}
        <div className="px-4 py-3 sm:px-6 sm:py-3.5 border-t border-slate-100 flex items-center justify-between gap-3 bg-white shrink-0">
          <div className="text-xs text-slate-500">
            {selectedUrl ? (
              <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>1 photo sélectionnée pour cette page</span>
              </span>
            ) : (
              <span>Cliquez sur une image ci-dessus pour la sélectionner</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold cursor-pointer transition-colors"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleConfirmSelection}
              disabled={!selectedUrl}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check className="w-3.5 h-3.5 text-amber-400" />
              <span>Utiliser cette image</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
