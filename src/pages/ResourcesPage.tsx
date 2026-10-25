import React, { useState, useEffect, useMemo } from 'react';
import { 
  Download, 
  FileText, 
  CheckCircle2, 
  UserCircle, 
  ShieldCheck, 
  ArrowRight,
  Calendar,
  Search,
  Filter,
  Eye,
  Sparkles,
  Loader2,
  Printer,
  BookOpen,
  FileDown,
  Clock,
  Layers,
  GraduationCap,
  Trophy,
  Award
} from 'lucide-react';
import { INITIAL_DOCUMENTS, SCHOOL_INFO } from '../data/mockData';
import { DocumentFile, SchoolEvent, User } from '../types';
import { apiService } from '../services/api';
import { officialDocumentsPdfService } from '../services/officialDocumentsPdfService';
import { OfficialDocumentModal } from '../components/documents/OfficialDocumentModal';
import { HonorRollView } from '../components/honor/HonorRollView';
import { toast } from 'sonner';

interface ResourcesPageProps {
  onOpenAuth: () => void;
  onNavigate: (page: string) => void;
  currentUser?: User | null;
  initialSubSection?: string;
}

export const ResourcesPage: React.FC<ResourcesPageProps> = ({ 
  onOpenAuth, 
  onNavigate,
  currentUser,
  initialSubSection
}) => {
  const [activeTab, setActiveTab] = useState<'documents' | 'palmares'>(() => {
    if (initialSubSection === 'resultats' || initialSubSection === 'palmares') return 'palmares';
    return 'documents';
  });

  useEffect(() => {
    if (initialSubSection === 'resultats' || initialSubSection === 'palmares') {
      setActiveTab('palmares');
    } else if (initialSubSection === 'documents') {
      setActiveTab('documents');
    }
  }, [initialSubSection]);
  const [documents, setDocuments] = useState<DocumentFile[]>(INITIAL_DOCUMENTS);
  const [events, setEvents] = useState<SchoolEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Modal d'aperçu officiel
  const [previewDoc, setPreviewDoc] = useState<DocumentFile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Charger les documents & les événements officiels
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [docsData, eventsData] = await Promise.all([
        apiService.getDocuments(),
        apiService.getEvents().catch(() => [])
      ]);

      if (Array.isArray(docsData) && docsData.length > 0) {
        setDocuments(docsData);
      }
      if (Array.isArray(eventsData)) {
        setEvents(eventsData);
      }
    } catch {
      // Garder les documents initiaux en fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleDocsUpdate = () => {
      loadData();
    };

    window.addEventListener('cin:documents-updated', handleDocsUpdate);
    return () => window.removeEventListener('cin:documents-updated', handleDocsUpdate);
  }, []);

  // Téléchargement réel d'un document vectoriel certifié
  const handleDownload = async (doc: DocumentFile) => {
    setDownloadingId(doc.id);
    try {
      const result = await officialDocumentsPdfService.downloadDocumentPdf(doc, events, {
        paperFormat: 'A4',
        academicYear: doc.schoolYear || SCHOOL_INFO.currentYear,
      });

      setDownloadSuccess(doc.title);
      toast.success(`Téléchargement lancé avec succès !`, {
        description: `${result.filename} (${result.pageCount} pages, format A4 certifié)`,
      });

      // Mettre à jour le compteur localement
      setDocuments(prev => prev.map(d => d.id === doc.id ? { ...d, downloadCount: (d.downloadCount || 0) + 1 } : d));

      setTimeout(() => setDownloadSuccess(null), 4000);
    } catch (err: any) {
      toast.error('Erreur lors du téléchargement du document officiel', {
        description: err.message,
      });
    } finally {
      setDownloadingId(null);
    }
  };

  const handleOpenPreview = (doc: DocumentFile) => {
    setPreviewDoc(doc);
    setIsModalOpen(true);
  };

  // Filtrage des documents
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const matchesCategory = 
        selectedCategory === 'ALL' || 
        doc.category === selectedCategory ||
        (selectedCategory === 'reglement' && doc.category === 'reglement') ||
        (selectedCategory === 'calendrier' && (doc.category === 'calendrier' || doc.id.includes('calendrier'))) ||
        (selectedCategory === 'fournitures' && doc.category === 'fournitures') ||
        (selectedCategory === 'formulaires' && doc.category === 'formulaires') ||
        (selectedCategory === 'admissions' && (doc.category === 'admissions' || doc.id.includes('admission')));

      const matchesSearch = 
        !searchQuery.trim() || 
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (doc.description && doc.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (doc.targetCycle && doc.targetCycle.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCategory && matchesSearch;
    });
  }, [documents, selectedCategory, searchQuery]);

  // Document calendrier spécifique pour mise en valeur
  const calendarDoc = documents.find(d => d.category === 'calendrier' || d.id === 'doc-2' || d.title.toLowerCase().includes('calendrier'));

  const categories = [
    { id: 'ALL', label: 'Tous les documents' },
    { id: 'calendrier', label: 'Calendrier Académique' },
    { id: 'reglement', label: 'Règlements & Chartes' },
    { id: 'fournitures', label: 'Fournitures Scolaires' },
    { id: 'formulaires', label: 'Formulaires & Santé' },
    { id: 'admissions', label: 'Admissions & Écolage' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 sm:space-y-12">
      
      {/* Header */}
      <div className="max-w-4xl space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-900 text-xs font-bold tracking-wide uppercase">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-900" />
          <span>Documentation Officielle & Règlements Pédagogiques</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Ressources & Espace Numérique
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-light">
          Téléchargez les règlements intérieurs certifiés, les listes officielles de fournitures par cycle, le calendrier académique validé MENFP et accédez à vos portails personnalisés.
        </p>
      </div>

      {/* Onglets Principaux : Documents vs Tableau d'Honneur & Palmarès */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('documents')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'documents'
              ? 'bg-blue-900 text-white shadow-xs'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Documents Pédagogiques & Règlements</span>
          <span className={`text-2xs px-2 py-0.5 rounded-full font-mono ${activeTab === 'documents' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
            {documents.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('palmares')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'palmares'
              ? 'bg-amber-400 text-slate-950 shadow-xs'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
          }`}
        >
          <Trophy className="w-4 h-4 text-amber-600" />
          <span>Tableau d'Honneur & Palmarès des Lauréats</span>
          <span className="text-2xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-950 font-mono font-bold">
            Excellence
          </span>
        </button>
      </div>

      {/* Download notice */}
      {downloadSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center justify-between gap-3 animate-in fade-in shadow-xs">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Le document officiel <strong>« {downloadSuccess} »</strong> a été généré et téléchargé au format PDF certifié.</span>
          </div>
          <span className="text-2xs font-mono font-bold text-emerald-700 uppercase bg-emerald-100 px-2 py-0.5 rounded">
            ISO 32000-1
          </span>
        </div>
      )}

      {activeTab === 'palmares' ? (
        <HonorRollView
          onOpenAuth={onOpenAuth}
          onNavigateToCalendar={() => onNavigate('events')}
        />
      ) : (
        <>
          {/* EN-TÊTE SPÉCIAL : CALENDRIER ACADÉMIQUE OFFICIEL 2026-2027 */}
          {calendarDoc && (
            <section className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-blue-900/40 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-3 max-w-2xl">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-400 text-slate-950 text-2xs font-extrabold tracking-wider uppercase">
                  <Sparkles className="w-3 h-3 text-slate-950" />
                  <span>Calendrier Officiel Validé</span>
                </span>
                <span className="text-2xs font-mono text-slate-300">
                  MENFP · Session {calendarDoc.schoolYear || SCHOOL_INFO.currentYear}
                </span>
                <span className="text-2xs text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>4 Périodes de Contrôles Intégrées</span>
                </span>
              </div>

              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {calendarDoc.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
                {calendarDoc.description || "Dates de rentrée, trimestres, congés officiels d'État, périodes d'examens MENFP 9e AF & Baccalauréat NS4, et remises de bulletins."}
              </p>

              {/* Repères des 4 contrôles */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-2xs">
                <div className="bg-white/10 rounded-xl p-2.5 border border-white/10">
                  <div className="font-bold text-amber-300">1er Contrôle</div>
                  <div className="text-slate-300">7 sept. - 13 nov.</div>
                  <div className="text-slate-400 text-[10px]">Bulletins : 27 nov.</div>
                </div>
                <div className="bg-white/10 rounded-xl p-2.5 border border-white/10">
                  <div className="font-bold text-amber-300">2e Contrôle</div>
                  <div className="text-slate-300">16 nov. - 29 janv.</div>
                  <div className="text-slate-400 text-[10px]">Bulletins : 19 fév.</div>
                </div>
                <div className="bg-white/10 rounded-xl p-2.5 border border-white/10">
                  <div className="font-bold text-amber-300">3e Contrôle</div>
                  <div className="text-slate-300">2 mars - 30 avril</div>
                  <div className="text-slate-400 text-[10px]">Bulletins : 30 avril</div>
                </div>
                <div className="bg-white/10 rounded-xl p-2.5 border border-white/10">
                  <div className="font-bold text-amber-300">4e Contrôle</div>
                  <div className="text-slate-300">19 avril - 4 juin</div>
                  <div className="text-slate-400 text-[10px]">Vacances : 11 juin</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
              <button
                type="button"
                onClick={() => handleDownload(calendarDoc)}
                disabled={downloadingId === calendarDoc.id}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-400/20 transition-all cursor-pointer disabled:opacity-60"
              >
                {downloadingId === calendarDoc.id ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Génération du PDF...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 text-slate-950" />
                    <span>Télécharger le Calendrier (PDF)</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleOpenPreview(calendarDoc)}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-colors cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-amber-300" />
                <span>Aperçu & Impression du Calendrier</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('events')}
                className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-2xl text-slate-300 hover:text-white text-xs font-medium transition-colors cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                <span>Consulter l'Agenda Interactif</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* SECTION DOCUMENTS À TÉLÉCHARGER */}
      <section className="space-y-6">
        <div className="border-b border-slate-200 pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
              Documents Pédagogiques & Règlements
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Fichiers officiels certifiés pour l'année académique {SCHOOL_INFO.currentYear} au format PDF téléchargeable et imprimable.
            </p>
          </div>

          {/* Recherche */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un document..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition-all"
            />
          </div>
        </div>

        {/* Filtres par Catégorie */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Grille des documents officiels */}
        {filteredDocuments.length === 0 ? (
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-8 text-center space-y-2">
            <FileText className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">Aucun document ne correspond à votre recherche</p>
            <p className="text-xs text-slate-500">Essayez de réinitialiser le filtre ou votre terme de recherche.</p>
            <button
              type="button"
              onClick={() => { setSelectedCategory('ALL'); setSearchQuery(''); }}
              className="text-xs font-bold text-blue-900 hover:underline pt-2 inline-block cursor-pointer"
            >
              Voir tous les documents
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocuments.map((doc) => {
              const isBusy = downloadingId === doc.id;
              return (
                <div
                  key={doc.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs hover:border-blue-900/30 hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-900 border border-blue-200/50">
                        {doc.fileType || 'PDF'} · {doc.fileSize}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {doc.schoolYear || SCHOOL_INFO.currentYear}
                      </span>
                    </div>

                    {doc.targetCycle && (
                      <span className="inline-block text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        {doc.targetCycle}
                      </span>
                    )}

                    <h3 className="font-serif font-bold text-base text-slate-900 leading-snug group-hover:text-blue-900 transition-colors">
                      {doc.title}
                    </h3>

                    {doc.description && (
                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 font-light">
                        {doc.description}
                      </p>
                    )}

                    <div className="flex items-center gap-1.5 text-2xs text-slate-400 font-mono pt-1">
                      <FileDown className="w-3.5 h-3.5 text-slate-400" />
                      <span>{doc.downloadCount || 0} téléchargements certifiés</span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => handleDownload(doc)}
                      disabled={isBusy}
                      className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer disabled:opacity-60"
                    >
                      {isBusy ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Génération du PDF...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-3.5 h-3.5 text-amber-400" />
                          <span>Télécharger le document</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenPreview(doc)}
                      className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-500" />
                      <span>Aperçu & Lecture</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
      </>
      )}

      {/* 2. ESPACE SÉCURISÉ PARENTS & ÉLÈVES */}
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
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3 hover:border-amber-400/40 transition-all">
            <UserCircle className="w-8 h-8 text-amber-400" />
            <h3 className="font-serif font-bold text-base text-white">Espace Responsables / Parents</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Consultez l'assiduité, les convocations pédagogiques et téléchargez les relevés trimestriels de vos enfants.
            </p>
            <button
              onClick={onOpenAuth}
              className="inline-flex items-center gap-2 text-xs font-semibold text-amber-300 hover:text-white pt-2 cursor-pointer"
            >
              <span>Accéder à mon espace parent</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3 hover:border-amber-400/40 transition-all">
            <FileText className="w-8 h-8 text-amber-400" />
            <h3 className="font-serif font-bold text-base text-white">Espace Élèves & Cursus</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Consultez vos emplois du temps de classe, les devoirs à préparer et les supports de cours numériques.
            </p>
            <button
              onClick={onOpenAuth}
              className="inline-flex items-center gap-2 text-xs font-semibold text-amber-300 hover:text-white pt-2 cursor-pointer"
            >
              <span>Accéder à mon espace élève</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Modal d'aperçu officiel */}
      <OfficialDocumentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        document={previewDoc}
        events={events}
        onNavigateToEvents={() => onNavigate('events')}
      />

    </div>
  );
};
