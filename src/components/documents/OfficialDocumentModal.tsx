import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  Download, 
  Printer, 
  ExternalLink, 
  CheckCircle2, 
  ShieldCheck, 
  Calendar, 
  Phone, 
  Loader2 
} from 'lucide-react';
import { DocumentFile, SchoolEvent } from '../../types';
import { officialDocumentsPdfService } from '../../services/officialDocumentsPdfService';
import { SCHOOL_INFO } from '../../data/mockData';
import { toast } from 'sonner';

export interface OfficialDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: DocumentFile | null;
  events?: SchoolEvent[];
  onNavigateToEvents?: () => void;
  onDownload?: (doc: DocumentFile) => void;
}

export const OfficialDocumentModal: React.FC<OfficialDocumentModalProps> = ({
  isOpen,
  onClose,
  document: doc,
  events = [],
  onNavigateToEvents,
  onDownload,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen || !doc) return null;

  const phone1 = SCHOOL_INFO.phone1 || '+509 3316-0934';
  const phone2 = SCHOOL_INFO.phone2 || '+509 3721-1818';

  const handleDownload = async () => {
    if (onDownload) {
      onDownload(doc);
      return;
    }
    setIsGenerating(true);
    try {
      const res = await officialDocumentsPdfService.generateDocumentPdf(doc, events);
      res.downloadBlob();
      toast.success(`Document téléchargé : ${res.filename}`);
    } catch {
      toast.error('Erreur lors de la génération du document PDF.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-5 flex items-start justify-between gap-4 border-b border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-bold">
                {doc.category?.toUpperCase() || 'DOCUMENT OFFICIEL'}
              </span>
              <span className="text-xs text-slate-300 font-mono">
                {doc.schoolYear || '2026-2027'}
              </span>
            </div>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-white">
              {doc.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
          <p>
            {doc.description || 'Document administratif et pédagogique certifié émis par la Direction du Collège Isaac Newton.'}
          </p>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-500">
              <span>Émetteur :</span>
              <span className="font-semibold text-slate-900">Collège Isaac Newton · Direction Pédagogique</span>
            </div>
            <div className="flex items-center justify-between text-slate-500">
              <span>Campus :</span>
              <span className="font-semibold text-slate-900">Delmas 50, rue Dominique #2 bis</span>
            </div>
            <div className="flex items-center justify-between text-slate-500">
              <span>Format :</span>
              <span className="font-semibold text-slate-900">PDF 1.4 Vectoriel Certifié ISO 32000-1</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 flex items-center justify-between text-xs text-blue-950 font-medium">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-blue-900 shrink-0" />
              <span>Assistance Secrétariat :</span>
              <span className="font-mono font-bold">{phone1} / {phone2}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Fermer
          </button>

          <button
            type="button"
            onClick={handleDownload}
            disabled={isGenerating}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-semibold text-xs shadow-md transition-colors cursor-pointer disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Génération...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Télécharger le Document (PDF)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
