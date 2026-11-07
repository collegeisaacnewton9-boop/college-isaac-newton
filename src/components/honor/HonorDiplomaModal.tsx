import React from 'react';
import { 
  X, 
  Download, 
  Printer, 
  Award, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  Loader2,
  Calendar,
  GraduationCap
} from 'lucide-react';
import { HonorRollStudent } from '../../types';
import { officialDocumentsPdfService } from '../../services/officialDocumentsPdfService';
import { toast } from 'sonner';

interface HonorDiplomaModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: HonorRollStudent | null;
}

export const HonorDiplomaModal: React.FC<HonorDiplomaModalProps> = ({
  isOpen,
  onClose,
  student,
}) => {
  const [isGenerating, setIsGenerating] = React.useState(false);

  if (!isOpen || !student) return null;

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const result = await officialDocumentsPdfService.generateHonorCertificatePdf(student);
      result.downloadBlob();
      toast.success(`Diplôme officiel téléchargé avec succès !`, {
        description: result.filename,
      });
    } catch (err: any) {
      toast.error('Erreur lors du téléchargement du diplôme', {
        description: err.message,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getDistinctionLabel = (type: string) => {
    switch (type) {
      case 'FELICITATIONS':
        return 'Félicitations du Conseil des Professeurs';
      case 'TABLEAU_HONNEUR':
        return 'Inscription au Tableau d’Honneur';
      case 'ENCOURAGEMENTS':
        return 'Encouragements pour Progrès Remarquables';
      case 'PRIX_SCIENCES':
        return 'Prix d’Excellence Isaac Newton en Sciences';
      case 'PRIX_HUMANITES':
        return 'Prix d’Éloquence & Humanités';
      case 'PRIX_CIVISME':
        return 'Prix du Civisme & Camaraderie';
      default:
        return 'Tableau d’Honneur';
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-xs cin-doc-modal-overlay"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Controls Bar */}
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-amber-400 text-slate-950 font-bold shadow-xs">
              <Award className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-serif font-bold text-slate-900 text-sm sm:text-base">
                Diplôme Officiel du Tableau d’Honneur
              </h3>
              <p className="text-2xs text-slate-500">
                Certificat solennel d’excellence académique décerné par le Conseil des Professeurs.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">Imprimer</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              disabled={isGenerating}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-60"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Génération...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  <span>Télécharger PDF</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Display */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 bg-slate-100/70 flex items-center justify-center">
          <div className="max-w-3xl w-full bg-white rounded-2xl shadow-xl border-4 border-amber-400 p-8 sm:p-12 space-y-6 text-center relative overflow-hidden font-serif">
            
            {/* Background watermarked seal */}
            <div className="absolute inset-0 flex items-center justify-center opacity-4 pointer-events-none">
              <GraduationCap className="w-96 h-96 text-blue-950" />
            </div>

            {/* Inner frame */}
            <div className="border border-blue-900 p-6 sm:p-8 space-y-6 relative z-10">
              
              {/* Header */}
              <div className="space-y-1">
                <span className="text-[10px] tracking-widest text-slate-500 font-sans font-bold uppercase block">
                  RÉPUBLIQUE D'HAÏTI · MENFP
                </span>
                <h1 className="text-2xl sm:text-3xl font-bold text-blue-900 tracking-wide">
                  COLLÈGE ISAAC NEWTON
                </h1>
                <p className="text-xs italic text-amber-600 font-sans">
                  « Savoir aujourd'hui, réussir demain » · Campus Delmas 50
                </p>
                <div className="w-32 h-0.5 bg-amber-400 mx-auto mt-2" />
              </div>

              {/* Title */}
              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl font-extrabold text-blue-950 uppercase tracking-wider">
                  DIPLÔME DU TABLEAU D'HONNEUR
                </h2>
                <p className="text-xs text-amber-700 font-sans font-bold tracking-wide uppercase">
                  {getDistinctionLabel(student.distinction)}
                </p>
              </div>

              {/* Recipient */}
              <div className="space-y-2 py-2">
                <p className="text-xs text-slate-600 font-sans">
                  Le Conseil des Professeurs et la Direction Pédagogique décernent solennellement ce titre à :
                </p>
                <div className="text-2xl sm:text-3xl font-bold text-blue-900 border-b-2 border-blue-900/30 pb-2 inline-block px-6">
                  {student.studentName}
                </div>
                <p className="text-xs text-slate-700 font-sans font-semibold">
                  Classe : {student.classLevel} · Rang : {student.rankInClass}{student.rankInClass === 1 ? 'er' : 'e'} sur {student.totalStudentsInClass} élèves
                </p>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-900 font-sans text-xs font-bold">
                  <span>Moyenne Générale : {student.average} / {student.maxScale}</span>
                  {student.specialty && <span>· {student.specialty}</span>}
                </div>
              </div>

              {/* Citation */}
              <div className="max-w-xl mx-auto py-2">
                <p className="text-xs sm:text-sm italic text-slate-700 leading-relaxed bg-amber-50/50 p-3 rounded-xl border border-amber-200/50">
                  « {student.citation} »
                </p>
              </div>

              {/* Signatures & Seal */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200 text-2xs font-sans">
                <div className="space-y-6 text-left">
                  <span className="font-bold text-slate-800 block">Le Professeur Principal</span>
                  <span className="text-slate-400 italic block">[Visa du Conseil]</span>
                </div>
                <div className="space-y-1 flex flex-col items-center">
                  <div className="w-14 h-14 rounded-full border-2 border-amber-400 bg-amber-50 flex items-center justify-center text-amber-600 font-bold text-[9px] uppercase tracking-wider text-center p-1">
                    Sceau Officiel
                  </div>
                  <span className="text-[9px] text-slate-400 font-mono">CIN-{student.id.toUpperCase()}</span>
                </div>
                <div className="space-y-6 text-right">
                  <span className="font-bold text-blue-900 block">La Direction des Études</span>
                  <span className="text-slate-500 font-semibold block">Orphe Jean Marie</span>
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
