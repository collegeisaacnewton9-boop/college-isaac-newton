import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Image as ImageIcon, 
  Check, 
  Trash2, 
  Zap, 
  Loader2, 
  ArrowDownRight,
  Sparkles,
  ExternalLink,
  SlidersHorizontal
} from 'lucide-react';
import { toast } from 'sonner';
import { compressImage, formatBytes, CompressedImageResult } from '../../utils/imageCompressor';
import { enforce169AspectRatio } from '../../hooks/useImageAspectRatioController';
import { SCHOOL_IMAGES } from '../../assets/images';

interface ImageUploadCompressorProps {
  currentImageUrl?: string;
  onImageReady: (dataUrl: string, info?: { originalSize: number; compressedSize: number; reduction: number }) => void;
  label?: string;
  recommendedAspect?: string;
  compact?: boolean;
  enforce169AspectRatio?: boolean;
}

const PRESET_IMAGES = [
  { id: 'campus', title: 'Façade Campus', url: SCHOOL_IMAGES.campusRealFacade },
  { id: 'courtyard', title: 'Cour d’Honneur', url: SCHOOL_IMAGES.campusCourtyard },
  { id: 'lab', title: 'Salle Informatique', url: SCHOOL_IMAGES.computerLab },
  { id: 'assembly', title: 'Rassemblement', url: SCHOOL_IMAGES.studentsAssembly },
  { id: 'grad', title: 'Graduation', url: SCHOOL_IMAGES.graduationPromo },
];

export const ImageUploadCompressor: React.FC<ImageUploadCompressorProps> = ({
  currentImageUrl,
  onImageReady,
  label = 'Image de Couverture (Optimisation & Compression Automatique)',
  recommendedAspect = 'Format recommandé : 16:9 ou 16:10 (Max 1600px)',
  compact = false,
  enforce169AspectRatio: shouldEnforce169 = false,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string>(currentImageUrl || '');
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [showPresets, setShowPresets] = useState<boolean>(!currentImageUrl);
  const [selectedPreset, setSelectedPreset] = useState<'ultra' | 'balanced' | 'speed'>('balanced');
  const [compressionStats, setCompressionStats] = useState<{
    originalSize: number;
    compressedSize: number;
    reductionPercent: number;
    dimensions: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const is169Locked = shouldEnforce169 || recommendedAspect.includes('16:9');

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if it is an image
    if (!file.type.startsWith('image/')) {
      toast.error('Format invalide', {
        description: 'Veuillez sélectionner un fichier image (JPG, PNG, WebP, etc.).',
      });
      return;
    }

    setIsCompressing(true);
    try {
      let result: CompressedImageResult;

      if (is169Locked) {
        // Automatically enforce 16:9 aspect ratio and compress via ImageCompressor
        result = await enforce169AspectRatio(file, {
          preset: selectedPreset,
          maxWidth: 1200,
          quality: selectedPreset === 'ultra' ? 0.88 : selectedPreset === 'speed' ? 0.75 : 0.8,
          mimeType: 'image/webp',
        });
      } else {
        // Compress client-side with chosen preset to guarantee sharp quality and lightweight payload
        result = await compressImage(file, {
          preset: selectedPreset,
          mimeType: 'image/webp',
        });
      }

      setPreviewUrl(result.dataUrl);
      setCompressionStats({
        originalSize: result.originalSize,
        compressedSize: result.compressedSize,
        reductionPercent: result.reductionPercent,
        dimensions: `${result.width} × ${result.height} px`,
      });

      onImageReady(result.dataUrl, {
        originalSize: result.originalSize,
        compressedSize: result.compressedSize,
        reduction: result.reductionPercent,
      });

      toast.success('Image optimisée & compressée en WebP !', {
        description: `${formatBytes(result.originalSize)} ➔ ${formatBytes(result.compressedSize)} (-${result.reductionPercent}%) · Vitesse PageSpeed garantie`,
      });
    } catch (err: any) {
      toast.error('Erreur de compression', {
        description: err.message || 'Impossible de traiter cette image.',
      });
    } finally {
      setIsCompressing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSelectPreset = (url: string) => {
    setPreviewUrl(url);
    setCompressionStats(null);
    onImageReady(url);
    toast.info('Image prédéfinie du campus sélectionnée');
  };

  const handleClear = () => {
    setPreviewUrl('');
    setCompressionStats(null);
    onImageReady('');
  };

  return (
    <div className="space-y-2 text-xs">
      {/* Label, Hint and PageSpeed Preset Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
        <label className="font-bold text-slate-800 text-[11px] uppercase tracking-wide flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span>{label}</span>
        </label>

        {/* Compression Profile Selector */}
        <div className="inline-flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
          <button
            type="button"
            onClick={() => setSelectedPreset('balanced')}
            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
              selectedPreset === 'balanced'
                ? 'bg-blue-900 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Optimisé pour PageSpeed (WebP 82% - Qualité haute & vitesse max)"
          >
            ⚡ Équilibré
          </button>
          <button
            type="button"
            onClick={() => setSelectedPreset('ultra')}
            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
              selectedPreset === 'ultra'
                ? 'bg-blue-900 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Ultra HD (WebP 88% - Netteté maximale Retina)"
          >
            💎 Ultra HD
          </button>
          <button
            type="button"
            onClick={() => setSelectedPreset('speed')}
            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
              selectedPreset === 'speed'
                ? 'bg-blue-900 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Ultra léger (WebP 75% - Chargement ultra rapide)"
          >
            🚀 Vitesse Max
          </button>
        </div>
      </div>

      {is169Locked && (
        <div className="flex items-center justify-between text-[10px] text-blue-900 bg-blue-50/80 px-2.5 py-1 rounded-lg border border-blue-200/80">
          <span className="font-bold flex items-center gap-1">
            <span>📐 Ratio 16:9 Verrouillé</span>
          </span>
          <span className="text-slate-600 font-mono text-[9.5px]">Recadrage & centrage carrousel automatiques</span>
        </div>
      )}

      {/* Main Dropzone / Preview Area */}
      <div className={`relative border-2 border-dashed border-slate-200 hover:border-slate-400 rounded-2xl bg-slate-50/70 ${compact ? 'p-2.5 sm:p-3' : 'p-3 sm:p-4'} transition-all`}>
        
        {previewUrl ? (
          <div className="space-y-2.5">
            {/* Image Preview Container */}
            <div className={`relative rounded-xl overflow-hidden bg-slate-950 aspect-video ${compact ? 'max-h-36 sm:max-h-44' : 'max-h-48 sm:max-h-56'} w-full border border-slate-200 shadow-xs flex items-center justify-center`}>
              <img
                src={previewUrl}
                alt="Aperçu de la couverture"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent flex items-end p-2 sm:p-2.5">
                <span className="text-[10px] font-mono text-white/90 bg-black/60 px-2 py-0.5 rounded backdrop-blur-xs">
                  {compressionStats ? compressionStats.dimensions : 'Image prête'}
                </span>
              </div>
            </div>

            {/* Live Compression Metrics Badge */}
            {compressionStats && (
              <div className="flex flex-wrap items-center justify-between gap-1.5 p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-bold">Optimisé :</span>
                  <span className="font-mono line-through text-slate-400 text-[10px]">{formatBytes(compressionStats.originalSize)}</span>
                  <ArrowDownRight className="w-3 h-3 text-emerald-600 inline" />
                  <span className="font-mono font-black text-emerald-700 bg-white px-1.5 py-0.2 rounded border border-emerald-200">
                    {formatBytes(compressionStats.compressedSize)}
                  </span>
                </div>
                <div className="px-1.5 py-0.2 rounded-full bg-emerald-600 text-white font-mono font-bold text-[9.5px]">
                  -{compressionStats.reductionPercent}%
                </div>
              </div>
            )}

            {/* Actions: Replace / Clear */}
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isCompressing}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold border border-slate-200 transition-colors cursor-pointer text-xs shadow-2xs"
              >
                <Upload className="w-3.5 h-3.5 text-blue-900" />
                <span>Remplacer</span>
              </button>

              <button
                type="button"
                onClick={handleClear}
                className="inline-flex items-center gap-1 px-2 py-1.5 rounded-xl text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors cursor-pointer text-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Effacer</span>
              </button>
            </div>

          </div>
        ) : (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`flex flex-col items-center justify-center ${compact ? 'py-4' : 'py-6'} text-center cursor-pointer group`}
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-center text-slate-500 group-hover:scale-105 group-hover:border-slate-900 group-hover:text-slate-900 transition-all mb-2">
              {isCompressing ? (
                <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
              ) : (
                <Upload className="w-5 h-5 text-slate-700" />
              )}
            </div>

            <p className="font-bold text-slate-800 text-xs">
              {isCompressing ? 'Compression en cours...' : 'Cliquez ou glissez une photo ici'}
            </p>
            <p className="text-[10.5px] text-slate-500 mt-0.5">
              Compression WebP 1280px automatique
            </p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelected}
          className="hidden"
        />
      </div>

      {/* Preset Campus Photos Picker */}
      <div className="space-y-1.5 pt-0.5">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowPresets(!showPresets)}
            className="text-[10px] font-bold text-slate-600 hover:text-slate-900 uppercase tracking-wide flex items-center gap-1 cursor-pointer"
          >
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>Photos certifiées du campus ({PRESET_IMAGES.length})</span>
            <span className="text-[9px] text-blue-900 font-mono font-semibold ml-1">
              {showPresets ? '▲ Masquer' : '▼ Choisir'}
            </span>
          </button>
        </div>

        {showPresets && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 animate-in fade-in duration-150">
            {PRESET_IMAGES.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset.url)}
                className={`p-1 sm:p-1.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-1.5 group ${
                  previewUrl === preset.url
                    ? 'bg-blue-900 text-white border-blue-900 shadow-xs font-bold'
                    : 'bg-white hover:bg-slate-100/80 text-slate-700 border-slate-200'
                }`}
              >
                <img
                  src={preset.url}
                  alt={preset.title}
                  className="w-6 h-6 rounded-md object-cover shrink-0"
                />
                <span className="truncate text-[10px]">{preset.title}</span>
              </button>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
