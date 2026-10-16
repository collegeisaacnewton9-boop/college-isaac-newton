import React, { useState, useEffect } from 'react';
import { 
  Download, 
  FileText, 
  CheckCircle2, 
  Lock, 
  UserCircle, 
  ShieldCheck, 
  Bell, 
  FileDown,
  ArrowRight,
  Eye
} from 'lucide-react';
import { INITIAL_DOCUMENTS, SCHOOL_INFO } from '../data/mockData';
import { User, DocumentFile } from '../types';
import { apiService } from '../services/api';
import { generateValidOfficialPdf, triggerPdfDownload } from '../utils/pdfGenerator';

interface ResourcesPageProps {
  onOpenAuth: () => void;
  onNavigate: (page: string) => void;
  currentUser?: User | null;
}

export const ResourcesPage: React.FC<ResourcesPageProps> = ({ onOpenAuth, onNavigate }) => {
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const [documents, setDocuments] = useState<DocumentFile[]>(INITIAL_DOCUMENTS);

  useEffect(() => {
    apiService.getDocuments()
      .then((docs) => {
        if (docs && Array.isArray(docs) && docs.length > 0) {
          setDocuments(docs);
        }
      })
      .catch(() => {});
  }, []);

  const handleDownload = async (doc: DocumentFile) => {
    setDownloadSuccess(doc.title);
    setTimeout(() => setDownloadSuccess(null), 4000);

    try {
      await apiService.recordDocumentDownload(doc.id);
    } catch {}

    const cleanFileName = `${doc.title.replace(/[^a-zA-Z0-9_\u00C0-\u017F-]/g, '_')}.pdf`;

    if (doc.fileUrl && !doc.fileUrl.startsWith('#')) {
      const link = document.createElement('a');
      link.href = doc.fileUrl;
      link.download = cleanFileName;
      link.target = '_blank';
      link.rel = 'noreferrer';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        try {
          document.body.removeChild(link);
        } catch {}
      }, 300);
      return;
    }

    // Official compliant PDF generation fallback
    const pdfBytes = generateValidOfficialPdf({
      title: doc.title,
      subtitle: doc.description || 'Collège Isaac Newton - Document Officiel',
      category: doc.category,
      cycle: doc.targetCycle || 'Tous les cycles',
      schoolYear: doc.schoolYear,
    });
    triggerPdfDownload(pdfBytes, cleanFileName);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-8 sm:space-y-10">
      
      {/* Header */}
      <div className="max-w-3xl space-y-3">
        <span className="text-xs font-semibold uppercase tracking-widest text-blue-900">
          Centre de Documentation Officielle
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-slate-900">
          Ressources & Espace Numérique
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-light">
          Téléchargez les règlements intérieurs, les listes de fournitures réglementaires, le calendrier officiel et accédez à vos portails personnalisés.
        </p>
      </div>

      {/* Download notice */}
      {downloadSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Le document <strong>« {downloadSuccess} »</strong> est prêt pour le téléchargement administratif.</span>
        </div>
      )}

      {/* 1. Documents à Télécharger */}
      <section className="space-y-6">
        <div className="border-b border-slate-200 pb-3">
          <h2 className="font-serif text-2xl font-bold text-slate-900">
            Documents Pédagogiques & Règlements
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Fichiers officiels certifiés pour l'année académique {SCHOOL_INFO.currentYear}.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:border-blue-900/30 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-900">
                    {doc.fileType} · {doc.fileSize}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {doc.schoolYear}
                  </span>
                </div>

                <h3 className="font-serif font-bold text-base text-slate-900 leading-snug">
                  {doc.title}
                </h3>

                {doc.description && (
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                    {doc.description}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 pt-1">
                {doc.fileUrl && !doc.fileUrl.startsWith('#') && (
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-blue-900 hover:bg-blue-50 transition-colors"
                    title="Ouvrir / Prévisualiser le document"
                  >
                    <Eye className="w-4 h-4" />
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => handleDownload(doc)}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-blue-900 hover:text-white text-slate-700 text-xs font-semibold transition-colors border border-slate-200 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Télécharger</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Espace Parents & Élèves */}
      <section className="bg-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl space-y-8">
        <div className="max-w-2xl space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
            Portail Dédié
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
            Espace Sécurisé Parents & Élèves
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
            Suivi des notes, relevés d'absences, circulaires de la direction et attestations scolaires centralisées.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3">
            <UserCircle className="w-8 h-8 text-amber-400" />
            <h3 className="font-serif font-bold text-base text-white">Espace Responsables / Parents</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Consultez l'assiduité, les convocations pédagogiques et téléchargez les relevés trimestriels de vos enfants.
            </p>
            <button
              onClick={onOpenAuth}
              className="inline-flex items-center gap-2 text-xs font-semibold text-amber-300 hover:text-white pt-2"
            >
              <span>Accéder à mon espace parent</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3">
            <FileText className="w-8 h-8 text-amber-400" />
            <h3 className="font-serif font-bold text-base text-white">Espace Élèves & Cursus</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Consultez vos emplois du temps de classe, les devoirs à préparer et les supports de cours numériques.
            </p>
            <button
              onClick={onOpenAuth}
              className="inline-flex items-center gap-2 text-xs font-semibold text-amber-300 hover:text-white pt-2"
            >
              <span>Accéder à mon espace élève</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
