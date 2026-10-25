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
  FileDown,
  Trophy,
  X
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
    { id: 'calendrier', label: 'Calendrier' },
    { id: 'reglement', label: 'Règlements & Chartes' },
    { id: 'fournitures', label: 'Fournitures Scolaires' },
    { id: 'formulaires', label: 'Formulaires & Santé' },
    { id: 'admissions', label: 'Admissions & Écolage' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
      
      {/* Header Compact & Fluide */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 text-2xs font-bold tracking-wide uppercase">
            <ShieldCheck className="w-3 h-3 text-blue-900" />
            <span>Documentation Officielle & Règlements Pédagogiques</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Ressources & Espace Numérique
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-light max-w-2xl">
            Règlements intérieurs certifiés, listes de fournitures par cycle, calendrier officiel MENFP et accès aux portails numériques.
          </p>
        </div>

        {/* Onglets Principaux : Segmented Control Compact */}
        <div className="inline-flex rounded-xl p-1 bg-slate-100 border border-slate-200/80 text-xs font-semibold shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('documents')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'documents'
                ? 'bg-blue-900 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Documents Officiels</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${activeTab === 'documents' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
              {documents.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('palmares')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'palmares'
                ? 'bg-amber-400 text-slate-950 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-600" />
            <span>Tableau d'Honneur</span>
          </button>
        </div>
      </div>

      {/* Download notice */}
      {downloadSuccess && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between gap-3 animate-in fade-in shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Le document <strong>« {downloadSuccess} »</strong> a été téléchargé au format PDF certifié.</span>
          </div>
          <span className="text-2xs font-mono font-bold text-emerald-700 uppercase bg-emerald-100 px-1.5 py-0.5 rounded">
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
          {/* EN-TÊTE COMPACT : CALENDRIER ACADÉMIQUE OFFICIEL */}
          {calendarDoc && (
            <section className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-2xl p-4 sm:p-5 text-white shadow-md border border-blue-900/40 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-2 flex-wrap text-2xs">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 font-extrabold uppercase">
                      <Sparkles className="w-3 h-3 text-slate-950" />
                      <span>Calendrier Officiel</span>
                    </span>
                    <span className="font-mono text-slate-300">
                      MENFP · Session {calendarDoc.schoolYear || SCHOOL_INFO.currentYear}
                    </span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>4 Contrôles Intégrés</span>
                    </span>
                  </div>

                  <h2 className="font-serif text-lg sm:text-xl font-bold text-white tracking-tight">
                    {calendarDoc.title}
                  </h2>
                  <p className="text-xs text-slate-300 font-light leading-relaxed">
                    {calendarDoc.description || "Dates clés, trimestres, congés officiels d'État et examens officiels MENFP 9e AF & NS4."}
                  </p>

                  {/* Repères des 4 contrôles - Compact */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1 text-2xs">
                    <div className="bg-white/10 rounded-lg p-2 border border-white/10">
                      <div className="font-bold text-amber-300">1er Contrôle</div>
                      <div className="text-slate-300 text-[11px]">7 sept. - 13 nov.</div>
                      <div className="text-slate-400 text-[10px]">Bulletins : 27 nov.</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-2 border border-white/10">
                      <div className="font-bold text-amber-300">2e Contrôle</div>
                      <div className="text-slate-300 text-[11px]">16 nov. - 29 janv.</div>
                      <div className="text-slate-400 text-[10px]">Bulletins : 19 fév.</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-2 border border-white/10">
                      <div className="font-bold text-amber-300">3e Contrôle</div>
                      <div className="text-slate-300 text-[11px]">2 mars - 30 avril</div>
                      <div className="text-slate-400 text-[10px]">Bulletins : 30 avril</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-2 border border-white/10">
                      <div className="font-bold text-amber-300">4e Contrôle</div>
                      <div className="text-slate-300 text-[11px]">19 avril - 4 juin</div>
                      <div className="text-slate-400 text-[10px]">Vacances : 11 juin</div>
                    </div>
                  </div>
                </div>

                {/* Actions Calendrier */}
                <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleDownload(calendarDoc)}
                    disabled={downloadingId === calendarDoc.id}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-md shadow-amber-400/20 transition-all cursor-pointer disabled:opacity-60"
                  >
                    {downloadingId === calendarDoc.id ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Génération du PDF...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5 text-slate-950" />
                        <span>Télécharger le Calendrier (PDF)</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenPreview(calendarDoc)}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-amber-300" />
                    <span>Aperçu & Impression</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigate('events')}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-300 hover:text-white text-2xs font-medium transition-colors cursor-pointer"
                  >
                    <Calendar className="w-3 h-3 text-blue-400" />
                    <span>Consulter l'Agenda Interactif</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* FORMULAIRE DE RECHERCHE & FILTRAGE COMPACT & ERGONOMIQUE */}
          <section className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              
              {/* Barre de recherche */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher un document officiel, règlement, classe..."
                  className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition-all placeholder:text-slate-400"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 rounded-md cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Compteur & Réinitialisation */}
              <div className="flex items-center gap-2 text-2xs text-slate-500 font-medium shrink-0">
                <span className="font-bold text-slate-700">
                  {filteredDocuments.length} {filteredDocuments.length > 1 ? 'documents trouvés' : 'document trouvé'}
                </span>
                {(selectedCategory !== 'ALL' || searchQuery.trim() !== '') && (
                  <button
                    type="button"
                    onClick={() => { setSelectedCategory('ALL'); setSearchQuery(''); }}
                    className="text-blue-900 hover:underline font-bold cursor-pointer"
                  >
                    Réinitialiser
                  </button>
                )}
              </div>
            </div>

            {/* Filtres par Catégorie - Défilement fluide / flex wrap */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none pt-1 border-t border-slate-100">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1 rounded-lg text-2xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-blue-900 text-white shadow-2xs font-bold'
                      : 'bg-slate-100 hover:bg-slate-200/80 text-slate-600'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </section>

          {/* GRILLE DES DOCUMENTS OFFICIELS - DENSE & RESPONSIVE */}
          {filteredDocuments.length === 0 ? (
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-8 text-center space-y-2">
              <FileText className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs sm:text-sm font-semibold text-slate-700">Aucun document ne correspond à votre recherche</p>
              <p className="text-2xs text-slate-500">Essayez de réinitialiser le filtre ou votre terme de recherche.</p>
              <button
                type="button"
                onClick={() => { setSelectedCategory('ALL'); setSearchQuery(''); }}
                className="text-xs font-bold text-blue-900 hover:underline pt-1 inline-block cursor-pointer"
              >
                Voir tous les documents
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
              {filteredDocuments.map((doc) => {
                const isBusy = downloadingId === doc.id;
                return (
                  <div
                    key={doc.id}
                    className="bg-white rounded-2xl p-4 sm:p-4.5 border border-slate-200 shadow-2xs hover:border-blue-900/40 hover:shadow-sm transition-all flex flex-col justify-between space-y-3 group"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-900 border border-blue-200/50">
                          {doc.fileType || 'PDF'} · {doc.fileSize}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {doc.schoolYear || SCHOOL_INFO.currentYear}
                        </span>
                      </div>

                      {doc.targetCycle && (
                        <span className="inline-block text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                          {doc.targetCycle}
                        </span>
                      )}

                      <h3 className="font-serif font-bold text-sm sm:text-base text-slate-900 leading-snug group-hover:text-blue-900 transition-colors">
                        {doc.title}
                      </h3>

                      {doc.description && (
                        <p className="text-2xs text-slate-600 leading-relaxed line-clamp-2 font-light">
                          {doc.description}
                        </p>
                      )}

                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono pt-0.5">
                        <FileDown className="w-3 h-3 text-slate-400" />
                        <span>{doc.downloadCount || 0} téléchargements certifiés</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => handleDownload(doc)}
                        disabled={isBusy}
                        className="inline-flex items-center justify-center gap-1 py-2 px-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-2xs font-semibold shadow-2xs transition-all cursor-pointer disabled:opacity-60"
                      >
                        {isBusy ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>Génération...</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-3 h-3 text-amber-400" />
                            <span>Télécharger</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenPreview(doc)}
                        className="inline-flex items-center justify-center gap-1 py-2 px-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-2xs font-medium border border-slate-200 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3 h-3 text-slate-500" />
                        <span>Aperçu</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* PORTAILS SÉCURISÉS PARENTS & ÉLÈVES - COMPACT & ERGONOMIQUE */}
      <section className="bg-slate-900 rounded-2xl p-4 sm:p-6 text-white shadow-md space-y-4">
        <div className="max-w-2xl space-y-1">
          <span className="text-2xs font-semibold uppercase tracking-wider text-amber-400">
            Portail Numérique Dédié
          </span>
          <h2 className="font-serif text-lg sm:text-xl font-bold text-white">
            Espace Sécurisé Parents & Élèves
          </h2>
          <p className="text-2xs sm:text-xs text-slate-300 leading-relaxed font-light">
            Suivi des notes, relevés d'absences, circulaires de la direction et attestations scolaires centralisées.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2 hover:border-amber-400/40 transition-all flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <UserCircle className="w-5 h-5 text-amber-400" />
                <h3 className="font-serif font-bold text-sm text-white">Espace Responsables / Parents</h3>
              </div>
              <p className="text-2xs text-slate-300 leading-relaxed">
                Consultez l'assiduité, les convocations pédagogiques et téléchargez les relevés trimestriels.
              </p>
            </div>
            <button
              onClick={onOpenAuth}
              className="inline-flex items-center gap-1.5 text-2xs font-semibold text-amber-300 hover:text-white pt-1 cursor-pointer"
            >
              <span>Accéder à mon espace parent</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2 hover:border-amber-400/40 transition-all flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                <h3 className="font-serif font-bold text-sm text-white">Espace Élèves & Cursus</h3>
              </div>
              <p className="text-2xs text-slate-300 leading-relaxed">
                Consultez vos emplois du temps de classe, les devoirs à préparer et les supports de cours.
              </p>
            </div>
            <button
              onClick={onOpenAuth}
              className="inline-flex items-center gap-1.5 text-2xs font-semibold text-amber-300 hover:text-white pt-1 cursor-pointer"
            >
              <span>Accéder à mon espace élève</span>
              <ArrowRight className="w-3 h-3" />
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
