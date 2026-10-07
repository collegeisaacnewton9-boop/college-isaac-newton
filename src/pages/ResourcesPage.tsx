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
  Search,
  Check,
  X,
  Clock,
  Sparkles,
  BookOpen,
  Calendar,
  Layers,
  Phone,
  Send,
  Building,
  AlertCircle,
  ExternalLink,
  Eye,
  GraduationCap
} from 'lucide-react';
import { toast } from 'sonner';
import { DocumentFile, User } from '../types';
import { apiService } from '../services/api';
import { SCHOOL_INFO } from '../data/mockData';
import { formatPhoneNumber, validatePhone } from '../utils/validation';

interface ResourcesPageProps {
  onOpenAuth: () => void;
  onNavigate: (page: string, subSection?: string) => void;
  currentUser?: User | null;
}

const CATEGORIES: { id: string; label: string; key?: DocumentFile['category'] }[] = [
  { id: 'ALL', label: 'Tous les documents' },
  { id: 'reglement', label: 'Règlements & Chartes', key: 'reglement' },
  { id: 'calendrier', label: 'Calendriers & Horaires', key: 'calendrier' },
  { id: 'fournitures', label: 'Listes de Fournitures', key: 'fournitures' },
  { id: 'formulaires', label: 'Formulaires & Fiches', key: 'formulaires' },
];

export const ResourcesPage: React.FC<ResourcesPageProps> = ({ 
  onOpenAuth, 
  onNavigate,
  currentUser 
}) => {
  const [documents, setDocuments] = useState<DocumentFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedCycle, setSelectedCycle] = useState<string>('ALL');
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  // Administrative Request Form State
  const [reqDocType, setReqDocType] = useState('Attestation de scolarité officielle');
  const [reqStudentName, setReqStudentName] = useState('');
  const [reqStudentClass, setReqStudentClass] = useState('7ème Année Fondamentale (7e AF)');
  const [reqParentName, setReqParentName] = useState('');
  const [reqParentPhone, setReqParentPhone] = useState('');
  const [reqDeliveryMode, setReqDeliveryMode] = useState<'NUMERIQUE' | 'CAMPUS'>('NUMERIQUE');
  const [isSubmittingReq, setIsSubmittingReq] = useState(false);
  const [reqSent, setReqSent] = useState(false);

  // Preview Document Modal
  const [previewDoc, setPreviewDoc] = useState<DocumentFile | null>(null);

  const loadDocuments = async () => {
    setIsLoading(true);
    try {
      const data = await apiService.getDocuments();
      setDocuments(data);
    } catch {
      toast.error('Erreur lors du chargement des documents');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();

    const handleUpdate = () => loadDocuments();
    window.addEventListener('cin:documents-updated', handleUpdate);
    return () => window.removeEventListener('cin:documents-updated', handleUpdate);
  }, []);

  const handleDownload = async (doc: DocumentFile) => {
    try {
      await apiService.recordDocumentDownload(doc.id);
      
      // Real download trigger
      if (doc.fileUrl && (doc.fileUrl.startsWith('data:') || doc.fileUrl.startsWith('http') || doc.fileUrl.startsWith('/'))) {
        const link = document.createElement('a');
        link.href = doc.fileUrl;
        link.download = `${doc.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // Certified PDF text fallback blob
        const pdfContent = `%PDF-1.4\n%Collège Isaac Newton - Document Officiel\n%Titre: ${doc.title}\n%Année Scolaire: ${doc.schoolYear}\n%Direction Pédagogique - Delmas 50\n1 0 obj\n<< /Title (${doc.title}) /Author (College Isaac Newton) >>\nendobj\n%%EOF`;
        const blob = new Blob([pdfContent], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${doc.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }

      setDownloadSuccess(doc.title);
      toast.success(`Téléchargement de « ${doc.title} » en cours !`);
      setTimeout(() => setDownloadSuccess(null), 4000);
      loadDocuments();
    } catch {
      toast.error('Erreur lors du téléchargement');
    }
  };

  const handleDocumentRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqStudentName.trim() || !reqParentName.trim()) {
      toast.error('Veuillez renseigner le nom de l’élève et du parent');
      return;
    }
    const phoneRes = validatePhone(reqParentPhone);
    if (!phoneRes.isValid) {
      toast.error(phoneRes.error || 'Numéro de téléphone requis');
      return;
    }

    setIsSubmittingReq(true);
    try {
      const modeText = reqDeliveryMode === 'NUMERIQUE' ? 'Envoi numérique par e-mail / WhatsApp' : 'Retrait physique au secrétariat (Delmas 50)';
      await apiService.sendContactMessage({
        fullName: reqParentName.trim(),
        email: 'secretariat-documents@collegeisaacnewton.com',
        phone: reqParentPhone.trim(),
        subject: `[Demande de Document] ${reqDocType} pour ${reqStudentName} (${reqStudentClass})`,
        message: `Demande de ${reqDocType}.\nÉlève: ${reqStudentName.trim()}\nClasse: ${reqStudentClass}\nParent: ${reqParentName.trim()}\nTéléphone: ${reqParentPhone.trim()}\nMode de retrait souhaité: ${modeText}`,
      });

      setReqSent(true);
      toast.success('Votre demande de document a été transmise au secrétariat général !');
      setTimeout(() => {
        setReqStudentName('');
        setReqParentName('');
        setReqParentPhone('');
        setReqSent(false);
      }, 5000);
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la transmission');
    } finally {
      setIsSubmittingReq(false);
    }
  };

  // Filtered documents
  const filteredDocuments = documents.filter((doc) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = 
      !q ||
      doc.title.toLowerCase().includes(q) ||
      (doc.description && doc.description.toLowerCase().includes(q)) ||
      (doc.schoolYear && doc.schoolYear.toLowerCase().includes(q));

    const matchesCategory = selectedCategory === 'ALL' || doc.category === selectedCategory;
    const matchesCycle = selectedCycle === 'ALL' || !doc.targetCycle || doc.targetCycle === 'Tous les cycles' || doc.targetCycle.includes(selectedCycle);

    return matchesSearch && matchesCategory && matchesCycle;
  });

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-5 py-2 sm:py-3.5 max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 font-sans">
      
      {/* =========================================================================
          1. HERO BANNER - Compact, Modern & Fluid Layout
      ========================================================================= */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white border border-slate-800/80 shadow-md p-3.5 sm:p-5 lg:p-6">
        
        {/* Subtle Ambient Glows */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-3.5 lg:gap-6 items-center">
          
          {/* Left Column: Heading & Context (7 cols) */}
          <div className="lg:col-span-7 space-y-2">
            
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-[11px] font-semibold backdrop-blur-xs font-mono">
                <BookOpen className="w-3 h-3 text-amber-300" />
                <span>Centre de Documentation & Numérique</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10.5px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Session {SCHOOL_INFO.currentYear}</span>
              </span>
            </div>

            <h1 className="font-serif text-lg sm:text-2xl md:text-3xl font-bold text-white tracking-tight leading-tight">
              Ressources & Espace Numérique
            </h1>
            
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light max-w-xl">
              Téléchargez les règlements intérieurs officiels, calendriers académiques, listes de fournitures scolaires et accédez à vos portails sécurisés.
            </p>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-2 pt-1 max-w-lg">
              <div className="bg-white/5 border border-white/10 rounded-xl px-2 py-1.5 backdrop-blur-xs">
                <span className="block font-mono text-xs sm:text-sm font-bold text-amber-300">{documents.length} Docs</span>
                <span className="block text-[10px] text-slate-300">Fichiers Certifiés</span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl px-2 py-1.5 backdrop-blur-xs">
                <span className="block font-mono text-xs sm:text-sm font-bold text-blue-300">Format PDF</span>
                <span className="block text-[10px] text-slate-300">Prêt à Imprimer</span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl px-2 py-1.5 backdrop-blur-xs">
                <span className="block font-mono text-xs sm:text-sm font-bold text-emerald-300">100% Libre</span>
                <span className="block text-[10px] text-slate-300">Accès Parents & Élèves</span>
              </div>
            </div>

            {/* Support Hotline */}
            <div className="flex items-center gap-3 text-[11px] text-slate-300 pt-0.5 flex-wrap">
              <a href={`tel:${SCHOOL_INFO.phone}`} className="inline-flex items-center gap-1 text-amber-300 hover:text-amber-200 font-mono">
                <Phone className="w-3 h-3" />
                <span>Secrétariat : {SCHOOL_INFO.phone}</span>
              </a>
              <span className="text-slate-600 hidden sm:inline">·</span>
              <span className="inline-flex items-center gap-1 text-slate-300">
                <Building className="w-3 h-3 text-blue-400" />
                <span>Campus Delmas 50</span>
              </span>
            </div>

          </div>

          {/* Right Column: Portal Shortcuts Card (5 cols) */}
          <div className="lg:col-span-5 bg-white/10 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-white/15 shadow-md flex flex-col justify-between gap-2.5">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 font-mono">
                  Portails Personnalisés
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-medium">
                  Accès Sécurisé
                </span>
              </div>
              <h3 className="font-serif text-sm sm:text-base font-bold text-white">
                Espaces Parents & Élèves
              </h3>
              <p className="text-[11.5px] text-slate-300 leading-snug">
                Connectez-vous pour consulter les bulletins de notes, relevés d’assiduité et circulaires pédagogiques.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={onOpenAuth}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-xs transition-all active:scale-[0.98] cursor-pointer"
              >
                <UserCircle className="w-3.5 h-3.5 text-slate-950" />
                <span>Espace Parent</span>
              </button>

              <button
                type="button"
                onClick={onOpenAuth}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs border border-white/20 transition-all cursor-pointer"
              >
                <GraduationCap className="w-3.5 h-3.5 text-blue-300" />
                <span>Espace Élève</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('demande-document-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-center text-[11px] text-slate-300 hover:text-white underline underline-offset-4 cursor-pointer pt-0.5"
            >
              Besoin d'un certificat scolaire ou duplicata ? Faire une demande en ligne
            </button>
          </div>

        </div>
      </section>

      {/* Download Alert Notification */}
      {downloadSuccess && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between gap-2 shadow-2xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Le fichier <strong>« {downloadSuccess} »</strong> a été téléchargé avec succès sur votre appareil.</span>
          </div>
          <button
            type="button"
            onClick={() => setDownloadSuccess(null)}
            className="text-emerald-700 hover:text-emerald-900 p-0.5 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* =========================================================================
          2. DOCUMENTS OFFICIELS & RECHERCHE INSTANTANÉE (RYTHME COMPACT)
      ========================================================================= */}
      <section className="bg-white/95 rounded-2xl border border-slate-200/90 shadow-2xs p-3 sm:p-4 space-y-3">
        
        {/* Section Header & Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-900 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                Documentation Officielle
              </span>
              <h2 className="font-serif text-sm sm:text-base font-bold text-slate-900">
                Documents Pédagogiques & Règlements
              </h2>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Consultez et téléchargez les fichiers certifiés pour l'année académique {SCHOOL_INFO.currentYear}.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher (règlement, fournitures, calendrier)..."
              className="w-full pl-8 pr-7 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-blue-900 bg-slate-50/50"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Chips Bar */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-blue-900 text-white shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Cycle filter pills */}
          <div className="flex items-center gap-1 text-[11px]">
            <span className="text-slate-400 font-mono text-[10px]">Cycle :</span>
            <select
              value={selectedCycle}
              onChange={(e) => setSelectedCycle(e.target.value)}
              className="px-2 py-1 text-[11px] rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-blue-900"
            >
              <option value="ALL">Tous les cycles</option>
              <option value="Préscolaire">Préscolaire</option>
              <option value="Fondamental">Fondamental</option>
              <option value="Secondaire">Secondaire</option>
            </select>
          </div>
        </div>

        {/* Documents Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
          {isLoading ? (
            <div className="col-span-full py-8 text-center text-xs text-slate-500">
              Chargement des documents officiels...
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="col-span-full py-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 space-y-1">
              <FileText className="w-6 h-6 text-slate-400 mx-auto" />
              <p>Aucun document ne correspond à votre recherche.</p>
              <button
                type="button"
                onClick={() => { setSearchQuery(''); setSelectedCategory('ALL'); setSelectedCycle('ALL'); }}
                className="text-blue-900 font-semibold underline cursor-pointer"
              >
                Réinitialiser les filtres
              </button>
            </div>
          ) : (
            filteredDocuments.map((doc) => (
              <div
                key={doc.id}
                className="bg-slate-50/70 hover:bg-white rounded-xl p-3 border border-slate-200/80 hover:border-blue-900/40 hover:shadow-2xs transition-all flex flex-col justify-between space-y-2 group"
              >
                <div className="space-y-1.5">
                  {/* Top Bar with Badge & Year */}
                  <div className="flex items-center justify-between text-[10.5px]">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-red-100 text-red-800 border border-red-200/80">
                        {doc.fileType || 'PDF'} · {doc.fileSize}
                      </span>
                      {doc.targetCycle && (
                        <span className="bg-slate-200/80 text-slate-700 px-1.5 py-0.5 rounded font-medium truncate max-w-[120px]">
                          {doc.targetCycle}
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-slate-500 text-[10px] font-semibold">
                      {doc.schoolYear}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-serif font-bold text-xs sm:text-sm text-slate-900 leading-snug group-hover:text-blue-950 transition-colors">
                    {doc.title}
                  </h3>

                  {/* Description */}
                  {doc.description && (
                    <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2">
                      {doc.description}
                    </p>
                  )}
                </div>

                {/* Card Bottom: Stats & Download Button */}
                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                    <Download className="w-3 h-3 text-emerald-600" />
                    <span>{doc.downloadCount || 0} dl</span>
                  </span>

                  <button
                    type="button"
                    onClick={() => handleDownload(doc)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-blue-900 hover:text-white text-slate-800 text-xs font-semibold transition-all border border-slate-300 hover:border-blue-900 shadow-2xs cursor-pointer active:scale-98"
                  >
                    <Download className="w-3 h-3 text-blue-900 group-hover:text-white" />
                    <span>Télécharger</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </section>

      {/* =========================================================================
          3. ESPACES SÉCURISÉS PARENTS & ÉLÈVES (COMPACT DENSE CARDS)
      ========================================================================= */}
      <section className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-2xl p-3.5 sm:p-5 text-white shadow-md space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-2 border-b border-white/10">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 font-mono">
              Portails Dédiés
            </span>
            <h2 className="font-serif text-sm sm:text-base md:text-lg font-bold text-white">
              Espace Numérique Sécurisé des Familles
            </h2>
          </div>
          <p className="text-[11px] text-slate-300 max-w-sm">
            Centralisation des bulletins de notes, relevés d’absences, emplois du temps et circulaires officielles.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          
          {/* Card Parents */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 sm:p-3.5 space-y-2 flex flex-col justify-between hover:bg-white/10 transition-colors">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center font-bold">
                  <UserCircle className="w-4 h-4" />
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-amber-400/10 text-amber-300 border border-amber-400/20">
                  Accès Parents
                </span>
              </div>
              <h3 className="font-serif font-bold text-xs sm:text-sm text-white">
                Portail Responsables & Parents d'Élèves
              </h3>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Consultez l'assiduité, les convocations pédagogiques, les reçus de scolarité et téléchargez les relevés trimestriels certifiés.
              </p>
            </div>

            <button
              type="button"
              onClick={onOpenAuth}
              className="inline-flex items-center justify-between w-full px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
            >
              <span>Accéder à mon espace parent</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card Students */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 sm:p-3.5 space-y-2 flex flex-col justify-between hover:bg-white/10 transition-colors">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 rounded-lg bg-blue-400/20 text-blue-400 flex items-center justify-center font-bold">
                  <GraduationCap className="w-4 h-4" />
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-blue-400/10 text-blue-300 border border-blue-400/20">
                  Accès Élèves
                </span>
              </div>
              <h3 className="font-serif font-bold text-xs sm:text-sm text-white">
                Portail Cursus & Travaux Élèves
              </h3>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Retrouvez vos emplois du temps de classe, les devoirs à préparer, les plannings d'examens et supports de cours numériques.
              </p>
            </div>

            <button
              type="button"
              onClick={onOpenAuth}
              className="inline-flex items-center justify-between w-full px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              <span>Accéder à mon espace élève</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </section>

      {/* =========================================================================
          4. FORMULAIRE COMPACT DE DEMANDE DE DOCUMENT ADMINISTRATIF
      ========================================================================= */}
      <section id="demande-document-section" className="bg-white/95 rounded-2xl border border-slate-200/90 shadow-2xs p-3 sm:p-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
          
          {/* Info Side (4 cols) */}
          <div className="lg:col-span-4 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-900 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
              Guichet Numérique Administratif
            </span>
            <h2 className="font-serif text-sm sm:text-base font-bold text-slate-900 leading-tight">
              Demande de Certificat ou Attestation
            </h2>
            <p className="text-[11.5px] text-slate-600 leading-relaxed">
              Besoin d'une attestation de scolarité timbrée, d'un certificat de fréquentation ou d'un duplicata de bulletin officiel ? Remplissez ce formulaire express pour traitement prioritaire sous 48h ouvrées.
            </p>
            
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs text-slate-700">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-blue-900 shrink-0" />
                <span className="text-[11px]">Délai moyen de délivrance : <strong>24h à 48h</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="text-[11px]">Tampon & Signature officielle de la direction</span>
              </div>
              <div className="flex items-center gap-2">
                <Building className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span className="text-[11px]">Retrait à Delmas 50 ou envoi numérique</span>
              </div>
            </div>
          </div>

          {/* Form Side (8 cols) - 2x2 Dense Grid */}
          <div className="lg:col-span-8 bg-slate-50/80 rounded-xl p-3 sm:p-3.5 border border-slate-200/80">
            {reqSent ? (
              <div className="p-4 text-center space-y-2 animate-in fade-in">
                <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <Check className="w-5 h-5" />
                </div>
                <h4 className="font-serif font-bold text-sm text-slate-900">
                  Demande de document transmise avec succès !
                </h4>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  Le secrétariat prépare votre <strong>{reqDocType}</strong>. Vous recevrez une notification par téléphone dès qu'il sera prêt.
                </p>
                <button
                  type="button"
                  onClick={() => setReqSent(false)}
                  className="px-3 py-1.5 rounded-lg bg-blue-900 text-white text-xs font-semibold hover:bg-blue-950 transition-colors cursor-pointer"
                >
                  Faire une autre demande
                </button>
              </div>
            ) : (
              <form onSubmit={handleDocumentRequest} className="space-y-2.5">
                
                {/* Row 1: Document type & Student name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                      Nature de la pièce sollicitée <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={reqDocType}
                      onChange={(e) => setReqDocType(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-blue-900 bg-white"
                    >
                      <option value="Attestation de scolarité officielle">Attestation de scolarité officielle</option>
                      <option value="Certificat de fréquentation">Certificat de fréquentation</option>
                      <option value="Duplicata officiel de bulletin de notes">Duplicata officiel de bulletin de notes</option>
                      <option value="Certificat de bonne conduite & mœurs">Certificat de bonne conduite & mœurs</option>
                      <option value="Relevé de notes officiel certifié">Relevé de notes officiel certifié</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                      Nom & Prénom de l’élève <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={reqStudentName}
                      onChange={(e) => setReqStudentName(e.target.value)}
                      placeholder="Ex: Alexandre Pierre"
                      className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-blue-900 bg-white"
                    />
                  </div>
                </div>

                {/* Row 2: Student class & Parent name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                      Classe / Niveau de l’élève <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={reqStudentClass}
                      onChange={(e) => setReqStudentClass(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-blue-900 bg-white"
                    >
                      <option value="Maternelle / Préscolaire (TPS/PS/MS/GS)">Maternelle / Préscolaire (TPS/PS/MS/GS)</option>
                      <option value="1ère à 4ème Année Fondamentale">1ère à 4ème Année Fondamentale (1e-4e AF)</option>
                      <option value="5ème ou 6ème Année Fondamentale">5ème ou 6ème Année Fondamentale (5e-6e AF)</option>
                      <option value="7ème Année Fondamentale (7e AF)">7ème Année Fondamentale (7e AF)</option>
                      <option value="8ème Année Fondamentale (8e AF)">8ème Année Fondamentale (8e AF)</option>
                      <option value="9ème Année Fondamentale (9e AF)">9ème Année Fondamentale (9e AF)</option>
                      <option value="Nouveau Secondaire 1 (NS1)">Nouveau Secondaire 1 (NS1)</option>
                      <option value="Nouveau Secondaire 2 (NS2)">Nouveau Secondaire 2 (NS2)</option>
                      <option value="Nouveau Secondaire 3 (NS3)">Nouveau Secondaire 3 (NS3)</option>
                      <option value="Nouveau Secondaire 4 (NS4 Baccalauréat)">Nouveau Secondaire 4 (NS4 Baccalauréat)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                      Nom complet du parent / tuteur <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={reqParentName}
                      onChange={(e) => setReqParentName(e.target.value)}
                      placeholder="Ex: Marc-Aurèle Pierre"
                      className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-blue-900 bg-white"
                    />
                  </div>
                </div>

                {/* Row 3: Phone & Delivery Mode */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                      Téléphone joignable <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={reqParentPhone}
                      onChange={(e) => setReqParentPhone(formatPhoneNumber(e.target.value))}
                      placeholder="+509 3800-0000"
                      className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-blue-900 bg-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                      Mode de délivrance souhaité
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setReqDeliveryMode('NUMERIQUE')}
                        className={`py-1.5 px-2 rounded-xl text-xs font-semibold text-center transition-all cursor-pointer border ${
                          reqDeliveryMode === 'NUMERIQUE'
                            ? 'bg-blue-900 text-white border-blue-900 shadow-2xs'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        📱 Envoi Numérique
                      </button>
                      <button
                        type="button"
                        onClick={() => setReqDeliveryMode('CAMPUS')}
                        className={`py-1.5 px-2 rounded-xl text-xs font-semibold text-center transition-all cursor-pointer border ${
                          reqDeliveryMode === 'CAMPUS'
                            ? 'bg-blue-900 text-white border-blue-900 shadow-2xs'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        🏛️ Retrait Campus
                      </button>
                    </div>
                  </div>
                </div>

                {/* Submit Row */}
                <div className="pt-0.5 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-slate-200/60">
                  <span className="text-[10px] text-slate-500">
                    Pièce préparée sous la supervision du secrétariat général du Collège.
                  </span>
                  <button
                    type="submit"
                    disabled={isSubmittingReq}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-semibold text-xs shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmittingReq ? (
                      <>
                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Transmission...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5 text-amber-400" />
                        <span>Envoyer ma demande de document</span>
                      </>
                    )}
                  </button>
                </div>

              </form>
            )}
          </div>

        </div>
      </section>

    </div>
  );
};
