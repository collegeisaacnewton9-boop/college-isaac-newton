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
  Eye,
  Sparkles,
  Loader2,
  FileDown,
  Trophy,
  X,
  Send,
  Building2,
  GraduationCap,
  Clock,
  Copy,
  Check,
  HelpCircle,
  Laptop
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

type TabType = 'documents' | 'palmares' | 'portails' | 'demande';

export const ResourcesPage: React.FC<ResourcesPageProps> = ({ 
  onOpenAuth, 
  onNavigate,
  currentUser,
  initialSubSection
}) => {
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    if (initialSubSection === 'resultats' || initialSubSection === 'palmares') return 'palmares';
    if (initialSubSection === 'portails') return 'portails';
    if (initialSubSection === 'demande') return 'demande';
    return 'documents';
  });

  useEffect(() => {
    if (initialSubSection === 'resultats' || initialSubSection === 'palmares') {
      setActiveTab('palmares');
    } else if (initialSubSection === 'documents') {
      setActiveTab('documents');
    } else if (initialSubSection === 'portails') {
      setActiveTab('portails');
    } else if (initialSubSection === 'demande') {
      setActiveTab('demande');
    }
  }, [initialSubSection]);

  const [documents, setDocuments] = useState<DocumentFile[]>(INITIAL_DOCUMENTS);
  const [events, setEvents] = useState<SchoolEvent[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Modal d'aperçu officiel
  const [previewDoc, setPreviewDoc] = useState<DocumentFile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Formulaire de demande de document
  const [formData, setFormData] = useState({
    studentName: '',
    classLevel: '9ème Année Fondamentale',
    studentId: '',
    documentType: 'Attestation de fréquentation scolaire (24h)',
    parentName: '',
    phone: '',
    email: '',
    deliveryMode: 'Email (PDF Certifié)',
    purpose: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestSubmitted, setRequestSubmitted] = useState<{
    reference: string;
    studentName: string;
    documentType: string;
    email: string;
  } | null>(null);
  const [copiedRef, setCopiedRef] = useState(false);

  // Charger les documents & les événements officiels
  const loadData = async () => {
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

  // Soumission du formulaire de demande
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentName.trim() || !formData.parentName.trim() || !formData.email.trim() || !formData.phone.trim()) {
      toast.error('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    setIsSubmitting(true);
    const refCode = `CIN-DOC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      await apiService.sendContactMessage({
        fullName: formData.parentName,
        email: formData.email,
        phone: formData.phone,
        subject: `[DEMANDE_DOC_OFFICIEL] ${formData.documentType} - ${formData.studentName} (${formData.classLevel}) [Réf: ${refCode}]`,
        message: `DEMANDE OFFICIELLE DE DOCUMENT SCOLAIRE :
--------------------------------------------------
Numéro de Référence : ${refCode}
Élève : ${formData.studentName}
Matricule / Identifiant : ${formData.studentId || 'Non spécifié'}
Classe / Niveau : ${formData.classLevel}
Type de Document : ${formData.documentType}
Parent / Responsable : ${formData.parentName}
Téléphone / WhatsApp : ${formData.phone}
Courriel : ${formData.email}
Mode de Livraison : ${formData.deliveryMode}
Motif / Destinataire : ${formData.purpose || 'Usage administratif général'}
Date : ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`,
      });

      setRequestSubmitted({
        reference: refCode,
        studentName: formData.studentName,
        documentType: formData.documentType,
        email: formData.email,
      });

      toast.success('Demande enregistrée avec succès !', {
        description: `Référence ${refCode} transmise au Secrétariat Général.`,
      });
    } catch (err: any) {
      toast.error('Erreur lors de l’envoi de la demande', {
        description: err.message || 'Veuillez réessayer ou contacter le secrétariat par WhatsApp.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyReference = () => {
    if (!requestSubmitted) return;
    navigator.clipboard.writeText(requestSubmitted.reference);
    setCopiedRef(true);
    toast.success('Numéro de référence copié dans le presse-papiers');
    setTimeout(() => setCopiedRef(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-5 space-y-3.5 sm:space-y-4.5">
      
      {/* Header Compact & Fluide */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-100 text-blue-900 text-2xs font-bold tracking-wide uppercase">
            <ShieldCheck className="w-3 h-3 text-blue-900" />
            <span>Documentation Officielle & Espaces Connectés</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Ressources & Espace Numérique
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-light max-w-2xl leading-relaxed">
            Règlements certifiés, fournitures par cycle, calendrier scolaire, tableau d'honneur et démarches administratives.
          </p>
        </div>

        {/* Onglets Principaux : Segmented Control Compact */}
        <div className="inline-flex rounded-xl p-1 bg-slate-100 border border-slate-200/80 text-xs font-semibold shrink-0 overflow-x-auto max-w-full">
          <button
            type="button"
            onClick={() => setActiveTab('documents')}
            className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap text-2xs sm:text-xs ${
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
            className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap text-2xs sm:text-xs ${
              activeTab === 'palmares'
                ? 'bg-amber-400 text-slate-950 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-600" />
            <span>Tableau d'Honneur</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('portails')}
            className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap text-2xs sm:text-xs ${
              activeTab === 'portails'
                ? 'bg-blue-900 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Laptop className="w-3.5 h-3.5" />
            <span>Portails Numériques</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('demande')}
            className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap text-2xs sm:text-xs ${
              activeTab === 'demande'
                ? 'bg-emerald-600 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Demande d'Attestation</span>
          </button>
        </div>
      </div>

      {/* Download notice */}
      {downloadSuccess && (
        <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between gap-3 animate-in fade-in shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Le document <strong>« {downloadSuccess} »</strong> a été téléchargé au format PDF certifié.</span>
          </div>
          <span className="text-2xs font-mono font-bold text-emerald-700 uppercase bg-emerald-100 px-1.5 py-0.5 rounded">
            ISO 32000-1
          </span>
        </div>
      )}

      {/* VUE 1 : TABLEAU D'HONNEUR */}
      {activeTab === 'palmares' && (
        <HonorRollView
          onOpenAuth={onOpenAuth}
          onNavigateToCalendar={() => onNavigate('events')}
        />
      )}

      {/* VUE 2 : DOCUMENTS OFFICIELS */}
      {activeTab === 'documents' && (
        <div className="space-y-3.5 sm:space-y-4">
          {/* EN-TÊTE COMPACT : CALENDRIER ACADÉMIQUE OFFICIEL */}
          {calendarDoc && (
            <section className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-2xl p-3.5 sm:p-5 text-white shadow-sm border border-blue-900/40 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-2 flex-wrap text-2xs">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 font-extrabold uppercase">
                      <Sparkles className="w-3 h-3 text-slate-950" />
                      <span>Calendrier Officiel</span>
                    </span>
                    <span className="font-mono text-slate-300">
                      Session {calendarDoc.schoolYear || SCHOOL_INFO.currentYear}
                    </span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>4 Contrôles Académiques</span>
                    </span>
                  </div>

                  <h2 className="font-serif text-lg sm:text-xl font-bold text-white tracking-tight">
                    {calendarDoc.title}
                  </h2>
                  <p className="text-xs text-slate-300 font-light leading-relaxed">
                    {calendarDoc.description || "Dates clés, trimestres, contrôles périodiques et congés officiels de l'établissement."}
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
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-md shadow-amber-400/20 transition-all cursor-pointer disabled:opacity-60"
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
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-amber-300" />
                    <span>Aperçu & Impression</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigate('events')}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-xl text-slate-300 hover:text-white text-2xs font-medium transition-colors cursor-pointer"
                  >
                    <Calendar className="w-3 h-3 text-blue-400" />
                    <span>Consulter l'Agenda Interactif</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* BARRE DE RECHERCHE & FILTRAGE COMPACTE */}
          <section className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="relative flex-1 max-w-md">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher un document officiel, règlement, classe..."
                  className="w-full pl-8.5 pr-8 py-1.5 sm:py-2 text-xs bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition-all placeholder:text-slate-400"
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

            {/* Filtres par Catégorie */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none pt-1 border-t border-slate-100">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-lg text-2xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
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
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 text-center space-y-2">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-3.5">
              {filteredDocuments.map((doc) => {
                const isBusy = downloadingId === doc.id;
                return (
                  <div
                    key={doc.id}
                    className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200 shadow-2xs hover:border-blue-900/40 hover:shadow-sm transition-all flex flex-col justify-between space-y-2.5 group"
                  >
                    <div className="space-y-1.5">
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

                      <h3 className="font-serif font-bold text-sm text-slate-900 leading-snug group-hover:text-blue-900 transition-colors">
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
                        className="inline-flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-2xs font-semibold shadow-2xs transition-all cursor-pointer disabled:opacity-60"
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
                        className="inline-flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-2xs font-medium border border-slate-200 transition-colors cursor-pointer"
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
        </div>
      )}

      {/* VUE 3 : PORTAILS SÉCURISÉS PARENTS & ÉLÈVES */}
      {activeTab === 'portails' && (
        <section className="space-y-4">
          <div className="bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 rounded-2xl p-4 sm:p-5 text-white shadow-sm border border-blue-900/40">
            <div className="max-w-2xl space-y-1.5">
              <span className="text-2xs font-bold uppercase tracking-wider text-amber-400">
                Infrastructures Numériques Connectées
              </span>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-white">
                Portails Sécurisés Collège Isaac Newton
              </h2>
              <p className="text-2xs sm:text-xs text-slate-300 leading-relaxed font-light">
                Plateforme numérique centralisant la scolarité, la communication pédagogique et le suivi administratif en temps réel.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {/* Espace Parents */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs hover:border-blue-900/40 hover:shadow-sm transition-all flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center border border-blue-100">
                  <UserCircle className="w-5 h-5 text-blue-900" />
                </div>
                <h3 className="font-serif font-bold text-base text-slate-900">Espace Parents & Tuteurs</h3>
                <p className="text-2xs text-slate-600 leading-relaxed">
                  Accès instantané aux bulletins des 4 contrôles, suivi des retards, relevés d'écolage et messagerie avec la Direction.
                </p>
                <ul className="text-2xs text-slate-600 space-y-1 pt-1">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Téléchargement des bulletins certifiés</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Historique des paiements & quittances</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Convocations aux réunions pédagogiques</span>
                  </li>
                </ul>
              </div>

              <button
                type="button"
                onClick={onOpenAuth}
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                <span>Connexion Espace Parents</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Espace Élèves */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs hover:border-blue-900/40 hover:shadow-sm transition-all flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-900 flex items-center justify-center border border-amber-100">
                  <GraduationCap className="w-5 h-5 text-amber-600" />
                </div>
                <h3 className="font-serif font-bold text-base text-slate-900">Espace Apprenants</h3>
                <p className="text-2xs text-slate-600 leading-relaxed">
                  Cahier de devoirs, supports de cours numériques, emplois du temps hebdomadaires et calendrier des épreuves.
                </p>
                <ul className="text-2xs text-slate-600 space-y-1 pt-1">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Cahier de textes & devoirs à rendre</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Banque d'exercices & annales d'examens</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Consignes des laboratoires scientifiques</span>
                  </li>
                </ul>
              </div>

              <button
                type="button"
                onClick={onOpenAuth}
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                <span>Accès Espace Élève</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Espace Équipe Pédagogique */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs hover:border-blue-900/40 hover:shadow-sm transition-all flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-900 flex items-center justify-center border border-emerald-100">
                  <Building2 className="w-5 h-5 text-emerald-700" />
                </div>
                <h3 className="font-serif font-bold text-base text-slate-900">Corps Professoral & Admin</h3>
                <p className="text-2xs text-slate-600 leading-relaxed">
                  Saisie des notes des 4 contrôles, calcul automatique des moyennes pondérées et délibérations du Conseil.
                </p>
                <ul className="text-2xs text-slate-600 space-y-1 pt-1">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Saisie des notes sécurisée par discipline</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Validation du Tableau d'Honneur</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Gestion des présences et assiduité</span>
                  </li>
                </ul>
              </div>

              <button
                type="button"
                onClick={onOpenAuth}
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer border border-slate-300/80"
              >
                <span>Portail Enseignants</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* VUE 4 : FORMULAIRE MODERNE DE DEMANDE DE DOCUMENT OFFICIEL */}
      {activeTab === 'demande' && (
        <section className="space-y-4">
          <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-2xl p-4 sm:p-5 text-white shadow-sm border border-emerald-500/30 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="space-y-1 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-2xs font-bold uppercase tracking-wider border border-emerald-400/30">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>Secrétariat Général en Ligne</span>
              </div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-white">
                Demande d'Attestation & Document Scolaire
              </h2>
              <p className="text-2xs sm:text-xs text-slate-300 font-light leading-relaxed">
                Formulaire officiel de transmission au secrétariat. Délivrance numérique en 24h ouvrées sous sceau certifié de l'établissement.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-white/10 rounded-xl p-2.5 border border-white/10 text-2xs shrink-0">
              <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <div className="font-bold text-emerald-300">Délai : 24 à 48h ouvrées</div>
                <div className="text-slate-300 text-[10px]">Gratuit pour élèves inscrits</div>
              </div>
            </div>
          </div>

          {requestSubmitted ? (
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-emerald-200 shadow-sm text-center max-w-xl mx-auto space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-lg sm:text-xl font-bold text-slate-900">
                  Demande Enregistrée avec Succès !
                </h3>
                <p className="text-xs text-slate-600">
                  Votre demande a été transmise au Secrétariat Général du Collège Isaac Newton.
                </p>
              </div>

              {/* Numéro de référence */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-2 max-w-sm mx-auto">
                <div className="text-left">
                  <div className="text-[10px] text-slate-500 uppercase font-mono">Référence officielle</div>
                  <div className="font-mono text-sm font-bold text-blue-900">{requestSubmitted.reference}</div>
                </div>
                <button
                  type="button"
                  onClick={copyReference}
                  className="p-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                >
                  {copiedRef ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedRef ? 'Copié' : 'Copier'}</span>
                </button>
              </div>

              <div className="text-2xs text-slate-500 bg-blue-50/60 p-3 rounded-xl border border-blue-100 text-left space-y-1">
                <div className="font-semibold text-blue-900">Prochaines étapes :</div>
                <div>• Vérification du dossier scolaire pour <strong>{requestSubmitted.studentName}</strong>.</div>
                <div>• Signature numérique par la Direction et envoi du PDF certifié à <strong>{requestSubmitted.email}</strong>.</div>
              </div>

              <div className="pt-2 flex justify-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setRequestSubmitted(null);
                    setFormData({
                      studentName: '',
                      classLevel: '9ème Année Fondamentale',
                      studentId: '',
                      documentType: 'Attestation de fréquentation scolaire (24h)',
                      parentName: '',
                      phone: '',
                      email: '',
                      deliveryMode: 'Email (PDF Certifié)',
                      purpose: '',
                    });
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-900 text-white text-xs font-semibold hover:bg-blue-800 transition-all cursor-pointer"
                >
                  Faire une autre demande
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {/* Nom de l'élève */}
                <div className="space-y-1">
                  <label className="block text-2xs font-bold text-slate-700 uppercase tracking-wide">
                    Nom & Prénom de l'Élève <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.studentName}
                    onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                    placeholder="Ex: Jean-Baptiste Pierre"
                    className="w-full px-3 py-1.5 sm:py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition-all"
                  />
                </div>

                {/* Classe */}
                <div className="space-y-1">
                  <label className="block text-2xs font-bold text-slate-700 uppercase tracking-wide">
                    Classe / Niveau Actuel <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.classLevel}
                    onChange={(e) => setFormData({ ...formData, classLevel: e.target.value })}
                    className="w-full px-3 py-1.5 sm:py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition-all cursor-pointer font-medium"
                  >
                    <optgroup label="Cycle Fondamental">
                      <option value="1ère Année Fondamentale">1ère Année Fondamentale (1ère AF)</option>
                      <option value="2ème Année Fondamentale">2ème Année Fondamentale (2ème AF)</option>
                      <option value="3ème Année Fondamentale">3ème Année Fondamentale (3ème AF)</option>
                      <option value="4ème Année Fondamentale">4ème Année Fondamentale (4ème AF)</option>
                      <option value="5ème Année Fondamentale">5ème Année Fondamentale (5ème AF)</option>
                      <option value="6ème Année Fondamentale">6ème Année Fondamentale (6ème AF)</option>
                      <option value="7ème Année Fondamentale">7ème Année Fondamentale (7ème AF)</option>
                      <option value="8ème Année Fondamentale">8ème Année Fondamentale (8ème AF)</option>
                      <option value="9ème Année Fondamentale">9ème Année Fondamentale (Examen d'État)</option>
                    </optgroup>
                    <optgroup label="Cycle Secondaire">
                      <option value="Nouveau Secondaire 1 (NS1)">Nouveau Secondaire 1 (NS1)</option>
                      <option value="Nouveau Secondaire 2 (NS2)">Nouveau Secondaire 2 (NS2)</option>
                      <option value="Nouveau Secondaire 3 (NS3 - LLA/SMP)">Nouveau Secondaire 3 (NS3)</option>
                      <option value="Nouveau Secondaire 4 (NS4 - Terminale)">Nouveau Secondaire 4 (Terminale Bac)</option>
                    </optgroup>
                  </select>
                </div>

                {/* Type de Document */}
                <div className="space-y-1">
                  <label className="block text-2xs font-bold text-slate-700 uppercase tracking-wide">
                    Document Souhaité <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.documentType}
                    onChange={(e) => setFormData({ ...formData, documentType: e.target.value })}
                    className="w-full px-3 py-1.5 sm:py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition-all cursor-pointer font-semibold text-blue-950"
                  >
                    <option value="Attestation de fréquentation scolaire (24h)">Attestation de fréquentation scolaire (24h)</option>
                    <option value="Certificat de scolarité officiel certifié">Certificat de scolarité officiel certifié</option>
                    <option value="Duplicata de bulletin / Relevé de notes officiel">Duplicata de bulletin / Relevé officiel</option>
                    <option value="Certificat de fin d'études fondamentales (9e AF)">Certificat de fin de cycle fondamental</option>
                    <option value="Certificat de radiation / Transfert scolaire">Certificat de radiation / Transfert</option>
                    <option value="Attestation de bonne conduite & civisme">Attestation de bonne conduite & civisme</option>
                  </select>
                </div>

                {/* Nom du Responsable */}
                <div className="space-y-1">
                  <label className="block text-2xs font-bold text-slate-700 uppercase tracking-wide">
                    Parent / Responsable Légal <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.parentName}
                    onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                    placeholder="Ex: Marie Pierre (Mère)"
                    className="w-full px-3 py-1.5 sm:py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition-all"
                  />
                </div>

                {/* Téléphone / WhatsApp */}
                <div className="space-y-1">
                  <label className="block text-2xs font-bold text-slate-700 uppercase tracking-wide">
                    Téléphone / WhatsApp <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+509 3316-0934"
                    className="w-full px-3 py-1.5 sm:py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition-all"
                  />
                </div>

                {/* Email de réception */}
                <div className="space-y-1">
                  <label className="block text-2xs font-bold text-slate-700 uppercase tracking-wide">
                    Adresse Email de Réception <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="famille.pierre@example.com"
                    className="w-full px-3 py-1.5 sm:py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition-all"
                  />
                </div>

                {/* Mode de délivrance */}
                <div className="space-y-1">
                  <label className="block text-2xs font-bold text-slate-700 uppercase tracking-wide">
                    Mode de Délivrance
                  </label>
                  <select
                    value={formData.deliveryMode}
                    onChange={(e) => setFormData({ ...formData, deliveryMode: e.target.value })}
                    className="w-full px-3 py-1.5 sm:py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition-all cursor-pointer font-medium"
                  >
                    <option value="Email (PDF Certifié)">Format Numérique PDF Certifié (Email)</option>
                    <option value="Retrait au Secrétariat">Retrait Physique au Secrétariat (Signé & Scellé)</option>
                    <option value="Les deux (PDF + Retrait physique)">Les deux (PDF par mail + Original au guichet)</option>
                  </select>
                </div>

                {/* Matricule optionnel */}
                <div className="space-y-1">
                  <label className="block text-2xs font-bold text-slate-700 uppercase tracking-wide">
                    Matricule Élève <span className="text-slate-400 font-normal">(Optionnel)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                    placeholder="Ex: CIN-2024-884"
                    className="w-full px-3 py-1.5 sm:py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition-all"
                  />
                </div>

                {/* Motif / Destinataire */}
                <div className="space-y-1 sm:col-span-2 lg:col-span-1">
                  <label className="block text-2xs font-bold text-slate-700 uppercase tracking-wide">
                    Motif / Organisme Destinataire <span className="text-slate-400 font-normal">(Optionnel)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                    placeholder="Ex: Ambassade, Mutation, Assurance..."
                    className="w-full px-3 py-1.5 sm:py-2 text-xs bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition-all"
                  />
                </div>
              </div>

              {/* Bouton de soumission */}
              <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 text-2xs text-slate-500">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Document certifié conforme selon les archives officielles du Collège.</span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold shadow-md shadow-blue-900/20 transition-all cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Transmission en cours...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5 text-amber-400" />
                      <span>Transmettre la Demande au Secrétariat</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </section>
      )}

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
