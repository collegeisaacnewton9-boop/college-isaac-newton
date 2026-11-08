import React, { useState, useEffect } from 'react';
import { 
  Printer, 
  Download, 
  X, 
  FileText, 
  Check, 
  Calendar, 
  Clock, 
  MapPin, 
  Sparkles,
  Loader2,
  FileCheck,
  Info
} from 'lucide-react';
import { SchoolEvent } from '../../types';
import { 
  calendarPdfService, 
  OFFICIAL_CONTROLS_2026_2027, 
  OFFICIAL_STATE_EXAMS_AND_FEASTS,
  OFFICIAL_PRACTICAL_GUIDELINES
} from '../../services/calendarPdfService';
import { toast } from 'sonner';

interface OfficialCalendarPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: SchoolEvent[];
  academicYear?: string;
}

export const OfficialCalendarPrintModal: React.FC<OfficialCalendarPrintModalProps> = ({
  isOpen,
  onClose,
  events,
  academicYear = '2026-2027',
}) => {
  const [paperFormat, setPaperFormat] = useState<'A4' | 'Letter'>('A4');
  const [isGenerating, setIsGenerating] = useState(false);

  // Manage body print class to isolate the document during window.print()
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('cin-print-modal-open');
    } else {
      document.body.classList.remove('cin-print-modal-open');
    }
    return () => {
      document.body.classList.remove('cin-print-modal-open');
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Filter events for the selected academic year
  const publicEvents = events
    .filter(e => {
      const year = e.academicYear || '2026-2027';
      if (year !== academicYear) return false;
      if (e.status === 'DRAFT' || e.isPublic === false) return false;
      return true;
    })
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  // Trigger real PDF download using pdf-lib
  const handleDownloadPdf = async () => {
    setIsGenerating(true);
    try {
      const result = await calendarPdfService.generateCalendarPdf(events, {
        paperFormat,
        academicYear,
      });
      result.downloadBlob();
      toast.success(`Fichier PDF généré avec succès (${result.pageCount} pages, format ${paperFormat}) !`, {
        description: result.filename,
      });
    } catch (err: any) {
      toast.error('Erreur lors de la génération du PDF officiel', {
        description: err.message,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Trigger browser print dialog for paper or "Save to PDF"
  const handleBrowserPrint = () => {
    window.print();
  };

  const editionDate = new Date().toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-xs cin-print-modal-root cin-print-modal-overlay">
      
      {/* Modal Dialog Window */}
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-300 overflow-hidden cin-print-modal-container">
        
        {/* Controls Bar (Always hidden in print) */}
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 print:hidden">
          
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-blue-900 text-amber-400 font-bold shadow-xs">
              <Printer className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-serif font-bold text-slate-900 text-base sm:text-lg">
                Édition & Impression du Calendrier Officiel
              </h3>
              <p className="text-xs text-slate-500">
                Document certifié indépendant de la mise en page écran (2 à 3 pages optimisées).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            
            {/* Paper format selector (A4 vs Letter) */}
            <div className="inline-flex p-0.5 rounded-lg bg-slate-200 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setPaperFormat('A4')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  paperFormat === 'A4' ? 'bg-white text-blue-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Format standard international A4 (210 × 297 mm)"
              >
                Format A4
              </button>
              <button
                type="button"
                onClick={() => setPaperFormat('Letter')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  paperFormat === 'Letter' ? 'bg-white text-blue-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Format standard nord-américain US Letter (8.5 × 11 po)"
              >
                Format Letter
              </button>
            </div>

            {/* Direct PDF Download Button */}
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGenerating}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              title="Télécharger le document vectoriel officiel en PDF"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
              ) : (
                <Download className="w-4 h-4 text-slate-950" />
              )}
              <span>Télécharger le PDF</span>
            </button>

            {/* Browser Print Button */}
            <button
              type="button"
              onClick={handleBrowserPrint}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
              title="Lancer l'impression directe (ou Enregistrer au format PDF via le navigateur)"
            >
              <Printer className="w-4 h-4 text-amber-300" />
              <span>Imprimer</span>
            </button>

            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
              title="Fermer la prévisualisation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

        </div>

        {/* Scrollable Printable Document Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100 cin-print-modal-scroll">
          
          <div 
            id="cin-official-print-document"
            className={`mx-auto bg-white p-6 sm:p-10 shadow-lg border border-slate-300 rounded-sm text-slate-900 font-sans space-y-6 ${
              paperFormat === 'Letter' ? 'max-w-[792px]' : 'max-w-[800px]'
            }`}
          >
            
            {/* 1. DOCUMENT HEADER */}
            <div className="pb-4 border-b-2 border-blue-900 space-y-2">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="font-serif font-black text-xl sm:text-2xl text-blue-950 tracking-tight uppercase">
                    Collège Isaac Newton
                  </h1>
                  <p className="text-xs text-slate-600 font-serif italic">
                    Institution d'Excellence Pédagogique & Rigueur Scientifique
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Campus : Delmas 50, rue Dominique #2 bis, Port-au-Prince, Haïti · Tél : +509 3316-0934 / 3721-1818
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="inline-block px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-950 font-bold font-mono text-xs">
                    SESSION {academicYear}
                  </span>
                  <p className="text-[10px] text-slate-400 font-mono mt-1">
                    Document officiel certifié
                  </p>
                </div>
              </div>

              <div className="pt-2 text-center">
                <h2 className="font-serif font-extrabold text-base sm:text-lg text-slate-900 uppercase tracking-wide">
                  Calendrier Scolaire & Agenda Officiel des Activités
                </h2>
              </div>
            </div>

            {/* 2. SECTION A : STRUCTURE DES 4 CONTRÔLES ACADÉMIQUES */}
            <div className="space-y-2.5">
              <h3 className="font-serif font-bold text-xs sm:text-sm text-blue-950 uppercase tracking-wider border-b border-slate-200 pb-1">
                A. Structure des 4 Contrôles Académiques ({academicYear})
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-300 divide-y divide-slate-300">
                  <thead className="bg-slate-100 text-slate-900 font-bold">
                    <tr>
                      <th className="p-2 border-r border-slate-300 w-1/6">Contrôle</th>
                      <th className="p-2 border-r border-slate-300 w-1/4">Période Officielle</th>
                      <th className="p-2 border-r border-slate-300 text-center w-16">Durée</th>
                      <th className="p-2 border-r border-slate-300 w-1/5">Semaine d'Examens</th>
                      <th className="p-2">Remise des Bulletins & Congés</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-[11.5px]">
                    {OFFICIAL_CONTROLS_2026_2027.map((ctrl, idx) => (
                      <tr key={idx} className={idx % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'}>
                        <td className="p-2 font-bold text-blue-950 border-r border-slate-300">
                          {ctrl.name}
                        </td>
                        <td className="p-2 border-r border-slate-300 text-slate-800">
                          {ctrl.period}
                        </td>
                        <td className="p-2 border-r border-slate-300 text-center font-mono font-bold text-amber-800">
                          {ctrl.duration}
                        </td>
                        <td className="p-2 border-r border-slate-300 font-semibold text-slate-900">
                          {ctrl.exams}
                        </td>
                        <td className="p-2 text-slate-700">
                          <div><strong className="text-blue-950">Carnets :</strong> {ctrl.reports}</div>
                          <div className="text-[10.5px] text-slate-500 mt-0.5">{ctrl.holidays}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 3. SECTION B : DATES IMPORTANTES ET EXAMENS D'ÉTAT MENFP */}
            <div className="space-y-2.5">
              <h3 className="font-serif font-bold text-xs sm:text-sm text-blue-950 uppercase tracking-wider border-b border-slate-200 pb-1">
                B. Événements Majeurs, Fêtes Institutionnelles & Examens d’État (MENFP)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {OFFICIAL_STATE_EXAMS_AND_FEASTS.map((item, idx) => {
                  const isStateExam = item.title.includes('9e A.F.') || item.title.includes('NS4');
                  return (
                    <div 
                      key={idx} 
                      className={`p-2.5 rounded border flex flex-col justify-between ${
                        isStateExam ? 'bg-rose-50/60 border-rose-300' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className={`font-mono text-[11px] font-bold ${
                          isStateExam ? 'text-rose-900' : 'text-blue-950'
                        }`}>
                          {item.date}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          {item.category}
                        </span>
                      </div>
                      <div className="font-bold text-slate-900 text-xs mt-1">
                        {item.title}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 4. SECTION C : AGENDA CHRONOLOGIQUE COMPLET */}
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                <h3 className="font-serif font-bold text-xs sm:text-sm text-blue-950 uppercase tracking-wider">
                  C. Agenda Chronologique des Événements & Activités ({publicEvents.length} dates)
                </h3>
                <span className="text-[10px] text-slate-500 font-mono">
                  Édition du {editionDate}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-300 divide-y divide-slate-300">
                  <thead className="bg-slate-100 text-slate-900 font-bold">
                    <tr>
                      <th className="p-2 border-r border-slate-300 w-1/4">Date & Période</th>
                      <th className="p-2 border-r border-slate-300 w-2/5">Intitulé & Description</th>
                      <th className="p-2 border-r border-slate-300 w-1/6">Catégorie</th>
                      <th className="p-2">Lieu & Public</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-[11.5px]">
                    {publicEvents.map((evt, idx) => {
                      const start = new Date(evt.startDate);
                      const formattedDate = start.toLocaleDateString('fr-FR', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      });

                      return (
                        <tr key={evt.id || idx} className={idx % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'}>
                          <td className="p-2 font-mono font-semibold text-slate-900 border-r border-slate-300 align-top">
                            {formattedDate}
                          </td>
                          <td className="p-2 border-r border-slate-300 align-top">
                            <span className="font-bold text-slate-900 block">{evt.title}</span>
                            {evt.description && (
                              <span className="text-[10.5px] text-slate-600 block mt-0.5 font-light">
                                {evt.description}
                              </span>
                            )}
                          </td>
                          <td className="p-2 border-r border-slate-300 align-top">
                            <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold ${
                              evt.category === 'Examen'
                                ? 'bg-rose-100 text-rose-900'
                                : evt.category === 'Férié' || evt.category === 'Vacances'
                                ? 'bg-amber-100 text-amber-950'
                                : 'bg-slate-100 text-slate-800'
                            }`}>
                              {evt.category}
                            </span>
                          </td>
                          <td className="p-2 text-slate-600 text-[11px] align-top">
                            <div>{evt.location || 'Campus Delmas 50'}</div>
                            <div className="text-[10px] text-slate-400">
                              Public : {evt.audience === 'PARENTS' ? 'Parents' : evt.audience === 'STUDENTS' ? 'Élèves' : 'Tous'}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 5. SECTION D : INFORMATIONS PRATIQUES DE L'ÉTABLISSEMENT */}
            <div className="pt-2 border-t border-slate-200 space-y-1 text-[11px] text-slate-600">
              <h4 className="font-bold text-slate-900 text-xs">
                D. Informations Pratiques & Fonctionnement
              </h4>
              <ul className="list-disc list-inside space-y-0.5">
                {OFFICIAL_PRACTICAL_GUIDELINES.map((item, idx) => (
                  <li key={idx}>
                    <strong className="text-slate-800">{item.label} :</strong> {item.text}
                  </li>
                ))}
              </ul>
            </div>

            {/* 6. DOCUMENT FOOTER STAMP */}
            <div className="pt-4 border-t-2 border-slate-900 text-[10px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
              <span>Collège Isaac Newton · Excellence Pédagogique & Rigueur Scientifique</span>
              <span>Document officiel imprimé le {editionDate}</span>
              <span className="font-mono font-bold text-blue-950">
                Format : {paperFormat}
              </span>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
