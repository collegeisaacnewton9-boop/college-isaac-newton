import React, { useState, useEffect } from 'react';
import { 
  X, 
  Download, 
  Printer, 
  FileText, 
  CheckCircle2, 
  Calendar, 
  ShieldCheck, 
  Sparkles,
  Loader2,
  ExternalLink,
  BookOpen,
  Info
} from 'lucide-react';
import { DocumentFile, SchoolEvent } from '../../types';
import { officialDocumentsPdfService } from '../../services/officialDocumentsPdfService';
import { toast } from 'sonner';

interface OfficialDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: DocumentFile | null;
  events?: SchoolEvent[];
  onNavigateToEvents?: () => void;
}

export const OfficialDocumentModal: React.FC<OfficialDocumentModalProps> = ({
  isOpen,
  onClose,
  document: doc,
  events = [],
  onNavigateToEvents,
}) => {
  const [paperFormat, setPaperFormat] = useState<'A4' | 'Letter'>('A4');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('cin-doc-modal-open');
    } else {
      document.body.classList.remove('cin-doc-modal-open');
    }
    return () => {
      document.body.classList.remove('cin-doc-modal-open');
    };
  }, [isOpen]);

  if (!isOpen || !doc) return null;

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const result = await officialDocumentsPdfService.downloadDocumentPdf(doc, events, {
        paperFormat,
        academicYear: doc.schoolYear || '2026-2027',
      });
      toast.success(`Document PDF téléchargé avec succès !`, {
        description: `${result.filename} (${result.pageCount} pages, format ${paperFormat})`,
      });
    } catch (err: any) {
      toast.error('Erreur lors de la génération du document PDF', {
        description: err.message,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const isCalendar = doc.category === 'calendrier' || doc.id.includes('calendrier') || doc.title.toLowerCase().includes('calendrier');

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-xs cin-doc-modal-overlay"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Controls Bar */}
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-blue-900 text-amber-400 font-bold shadow-xs">
              <FileText className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-900">
                  {doc.fileType || 'PDF'} · {doc.fileSize}
                </span>
                <span className="text-2xs text-slate-500 font-medium">
                  Session {doc.schoolYear || '2026-2027'}
                </span>
              </div>
              <h3 className="font-serif font-bold text-slate-900 text-sm sm:text-base line-clamp-1">
                {doc.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Format Selector */}
            <div className="inline-flex rounded-xl p-0.5 bg-slate-200/70 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setPaperFormat('A4')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  paperFormat === 'A4'
                    ? 'bg-white text-blue-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                A4
              </button>
              <button
                type="button"
                onClick={() => setPaperFormat('Letter')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  paperFormat === 'Letter'
                    ? 'bg-white text-blue-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Letter
              </button>
            </div>

            {/* Print Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              title="Imprimer ce document"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden sm:inline">Imprimer</span>
            </button>

            {/* Download PDF Button */}
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

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded-xl transition-colors cursor-pointer"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Preview Container */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 bg-slate-100/70">
          <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-md border border-slate-200 p-8 sm:p-12 space-y-8 font-sans">
            
            {/* Document Institutional Header */}
            <div className="border-b-2 border-blue-900 pb-5 space-y-2">
              <div className="flex items-center justify-between text-2xs text-slate-500 font-bold tracking-wider uppercase">
                <span>RÉPUBLIQUE D'HAÏTI · MENFP</span>
                <span className="text-amber-600 font-bold">Année Académique {doc.schoolYear || '2026-2027'}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-blue-900 tracking-tight">
                  COLLÈGE ISAAC NEWTON
                </h1>
                <span className="text-xs italic text-slate-500">
                  Savoir aujourd'hui, réussir demain
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Campus Delmas 50, rue Dominique #2 bis, Port-au-Prince · Tél : +509 3316-0934 / 3721-1818 · www.collegeisaacnewton.com
              </p>
            </div>

            {/* Document Title Banner */}
            <div className="bg-blue-50/70 border border-blue-900/20 rounded-xl p-4 sm:p-5 space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-900">
                Document Officiel Certifié
              </span>
              <h2 className="font-serif text-lg sm:text-xl font-bold text-slate-900">
                {doc.title}
              </h2>
              {doc.description && (
                <p className="text-xs text-slate-600 leading-relaxed pt-1">
                  {doc.description}
                </p>
              )}
            </div>

            {/* Document Detailed Preview Body */}
            {isCalendar ? (
              <div className="space-y-6 text-xs text-slate-700">
                <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold text-slate-900">Calendrier officiel vectoriel complet</p>
                    <p className="text-slate-600">
                      Ce calendrier regroupe les 4 périodes officielles de contrôles MENFP, les congés d'État, les examens du Baccalauréat Unique NS4 et de 9e AF.
                    </p>
                    {onNavigateToEvents && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onNavigateToEvents();
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-900 hover:text-blue-700 pt-1 cursor-pointer"
                      >
                        <span>Consulter l'Agenda Interactif complet</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-1">
                    Repères Périodiques MENFP 2026–2027
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <span className="font-bold text-blue-900">1er Contrôle (49 jours)</span>
                      <p className="text-2xs text-slate-500">Du 7 sept. au 13 nov. 2026</p>
                      <p className="text-2xs text-slate-600">Examens : 9 au 13 nov. · Bulletins : 27 nov.</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <span className="font-bold text-blue-900">2e Contrôle (44 jours)</span>
                      <p className="text-2xs text-slate-500">Du 16 nov. 2026 au 29 janv. 2027</p>
                      <p className="text-2xs text-slate-600">Examens : 25 au 29 janv. · Bulletins : 19 fév.</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <span className="font-bold text-blue-900">3e Contrôle (51 jours)</span>
                      <p className="text-2xs text-slate-500">Du 2 mars au 30 avril 2027</p>
                      <p className="text-2xs text-slate-600">Examens : 12 au 16 avril · Bulletins : 30 avril</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <span className="font-bold text-blue-900">4e Contrôle (35 jours)</span>
                      <p className="text-2xs text-slate-500">Du 19 avril au 4 juin 2027</p>
                      <p className="text-2xs text-slate-600">Examens : 31 mai au 4 juin · Vacances : 11 juin</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6 text-xs text-slate-700 leading-relaxed">
                <div className="space-y-3">
                  <h4 className="font-serif font-bold text-sm text-blue-900 border-b border-amber-500 pb-1">
                    Article 1 · Champ d'application & Statut de l'Établissement
                  </h4>
                  <p>
                    Le Collège Isaac Newton dispense un enseignement rigoureux et structuré conformément aux directives pédagogiques du Ministère de l'Éducation Nationale et de la Formation Professionnelle (MENFP). Les dispositions de ce document s'appliquent à tous les élèves inscrits, à leurs représentants légaux ainsi qu'aux personnels de la communauté éducative.
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-serif font-bold text-sm text-blue-900 border-b border-amber-500 pb-1">
                    Article 2 · Rigueur et Respect des Procédures
                  </h4>
                  <p>
                    Chaque apprenant est tenu d'honorer la devise de l'institution : « Savoir aujourd'hui, réussir demain ». Le respect de la ponctualité (07h30), de l'uniforme officiel, la probité lors des épreuves et le soin apporté au matériel didactique et aux laboratoires constituent des exigences fondamentales non négociables.
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-serif font-bold text-sm text-blue-900 border-b border-amber-500 pb-1">
                    Article 3 · Validation & Téléchargement Vectoriel
                  </h4>
                  <p>
                    Ce document est disponible au format PDF vectoriel haute définition (ISO 32000-1), optimisé pour l'impression en format A4 ou Letter avec typographie nette, encadrés administratifs et espace réservé aux signatures parentales et sceaux d'établissement.
                  </p>
                </div>
              </div>
            )}

            {/* Official Seal and Certification Stamp */}
            <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-2xs text-slate-500">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Document officiel certifié · Collège Isaac Newton Direction des Études</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={isGenerating}
                  className="px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center gap-2"
                >
                  <Download className="w-4 h-4 text-amber-400" />
                  <span>Télécharger le PDF officiel certifié</span>
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
