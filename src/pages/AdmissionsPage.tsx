import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  ArrowRight, 
  FileCheck, 
  ChevronDown, 
  FileText,
  Search,
  Clock,
  Phone,
  Mail,
  ShieldCheck,
  GraduationCap,
  Sparkles,
  HelpCircle,
  Calendar,
  AlertCircle,
  Send,
  Building,
  Check,
  Layers,
  Info,
  X,
  UserCheck,
  ExternalLink,
  Download,
  Award
} from 'lucide-react';
import { toast } from 'sonner';
import { FAQS, SCHOOL_INFO } from '../data/mockData';
import { ContentEditable } from '../components/common/ContentEditable';
import { User, AdmissionApplication } from '../types';
import { apiService } from '../services/api';
import { formatPhoneNumber, validatePhone, validateEmail } from '../utils/validation';

interface AdmissionsPageProps {
  onNavigate: (page: string, subSection?: string) => void;
  subSection?: string;
  currentUser?: User | null;
}

type CycleTabKey = 'prescolaire' | 'fondamental_1_2' | 'fondamental_3' | 'secondaire';

interface CycleDetail {
  id: CycleTabKey;
  label: string;
  shortLabel: string;
  age: string;
  badge: string;
  classes: string[];
  schedule: string;
  conditions: string[];
  documents: string[];
  targetSubSection: string;
}

const CYCLE_DETAILS: Record<CycleTabKey, CycleDetail> = {
  prescolaire: {
    id: 'prescolaire',
    label: 'Préscolaire & Maternelle',
    shortLabel: 'Préscolaire',
    age: '2 ans et demi à 5 ans',
    badge: 'Éveil, Langues & Motricité',
    classes: ['Toute Petite Section (TPS)', 'Petite Section (PS)', 'Moyenne Section (MS)', 'Grande Section (GS)'],
    schedule: '07h30 — 13h00 (Lundi au Vendredi)',
    conditions: [
      'Âge requis atteint au 31 décembre de l’année scolaire',
      'Propreté acquise et autonomie de base pour la vie en groupe',
      'Entretien d’accueil et d’observation avec l’éducatrice'
    ],
    documents: [
      'Extrait d’acte de naissance (original ou copie certifiée)',
      'Carnet de vaccination à jour et certificat médical',
      '4 photos d’identité récentes de l’enfant',
      'Copie de la pièce d’identité des parents ou tuteur légal'
    ],
    targetSubSection: 'prescolaire'
  },
  fondamental_1_2: {
    id: 'fondamental_1_2',
    label: 'Cycle Fondamental 1 & 2',
    shortLabel: 'Fondamental 1-6e AF',
    age: '6 à 11 ans',
    badge: 'Fondations, Lecture & Calcul',
    classes: ['1ère Année (1e AF)', '2ème Année (2e AF)', '3ème Année (3e AF)', '4ème Année (4e AF)', '5ème Année (5e AF)', '6ème Année (6e AF)'],
    schedule: '07h30 — 14h00 (Lundi au Vendredi)',
    conditions: [
      'Maîtrise de la lecture, de l’écriture et du calcul de base',
      'Bulletins scolaires complets de l’année précédente',
      'Test diagnostique d’évaluation en Français et Mathématiques'
    ],
    documents: [
      'Extrait d’acte de naissance certifié conforme',
      'Bulletins de notes originaux des 2 dernières années',
      'Certificat de passage officiel délivré par la direction précédente',
      '4 photos d’identité récentes'
    ],
    targetSubSection: 'fondamental'
  },
  fondamental_3: {
    id: 'fondamental_3',
    label: '3ème Cycle Fondamental (7e à 9e AF)',
    shortLabel: '3e Cycle (7e-9e AF)',
    age: '12 à 15 ans',
    badge: 'Préparation Examens d’État',
    classes: ['7ème Année Fondamentale (7e AF)', '8ème Année Fondamentale (8e AF)', '9ème Année Fondamentale (9e AF)'],
    schedule: '07h30 — 14h30 (Travaux dirigés inclus)',
    conditions: [
      'Moyenne minimale d’admission aux épreuves antérieures',
      'Respect formel de la charte de discipline et d’assiduité',
      'Test d’admission diagnostique pour les nouveaux élèves'
    ],
    documents: [
      'Extrait d’acte de naissance officiel',
      'Bulletins scolaires officiels des deux dernières années',
      'Certificat de passage timbré par l’inspection scolaire',
      '4 photos d’identité récentes'
    ],
    targetSubSection: 'fondamental'
  },
  secondaire: {
    id: 'secondaire',
    label: 'Nouveau Secondaire (NS1 à NS4)',
    shortLabel: 'Secondaire (NS1-NS4)',
    age: '15 à 19 ans',
    badge: 'Excellence & Filières Scientifiques',
    classes: ['Nouveau Secondaire 1 (NS1)', 'Nouveau Secondaire 2 (NS2)', 'Nouveau Secondaire 3 (NS3)', 'NS4 (Terminale / Baccalauréat)'],
    schedule: '07h30 — 15h30 (Laboratoires & Cours magistraux)',
    conditions: [
      'Attestation officielle de réussite de la 9e AF (pour admission en NS1)',
      'Relevés officiels certifiés pour tout transfert en NS2, NS3 ou NS4',
      'Évaluation diagnostique en Sciences & Mathématiques'
    ],
    documents: [
      'Attestation de réussite officielle de la 9e AF (originale + copies)',
      'Bulletins de notes originaux certifiés',
      'Extrait d’acte de naissance légalisé',
      '4 photos d’identité récentes et engagement parental'
    ],
    targetSubSection: 'secondaire'
  }
};

const FAQ_CATEGORIES = [
  { id: 'all', label: 'Toutes les questions' },
  { id: 'frais', label: 'Frais & Scolarité' },
  { id: 'dossier', label: 'Dossier & Pièces' },
  { id: 'calendrier', label: 'Calendrier & Horaires' }
];

export const AdmissionsPage: React.FC<AdmissionsPageProps> = ({ 
  onNavigate, 
  subSection,
  currentUser 
}) => {
  const [selectedCycle, setSelectedCycle] = useState<CycleTabKey>('prescolaire');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [faqSearch, setFaqSearch] = useState('');
  const [activeFaqCategory, setActiveFaqCategory] = useState<string>('all');

  // Quick Tracker State
  const [trackingQuery, setTrackingQuery] = useState('');
  const [trackingResult, setTrackingResult] = useState<AdmissionApplication | null | 'NOT_FOUND'>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Quick Callback / Inquiry Form State
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactLevel, setContactLevel] = useState('7ème Année Fondamentale (7e AF)');
  const [preferredCallbackTime, setPreferredCallbackTime] = useState<'matin' | 'aprem'>('matin');
  const [contactMessage, setContactMessage] = useState('');
  const [isSendingInquiry, setIsSendingInquiry] = useState(false);
  const [inquirySent, setInquirySent] = useState(false);

  // Sync cycle tab if subSection prop is provided
  useEffect(() => {
    if (subSection === 'prescolaire') {
      setSelectedCycle('prescolaire');
    } else if (subSection === 'fondamental') {
      setSelectedCycle('fondamental_1_2');
    } else if (subSection === 'secondaire') {
      setSelectedCycle('secondaire');
    }
  }, [subSection]);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  // Search admission dossier
  const handleSearchDossier = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = trackingQuery.trim().toLowerCase();
    if (!query) {
      toast.error('Veuillez entrer un numéro de dossier (ex: CIN-2026-0042) ou votre numéro de téléphone.');
      return;
    }

    setIsSearching(true);
    try {
      const allAdmissions = await apiService.getAdmissions();
      const match = allAdmissions.find((item) => {
        const numMatch = item.applicationNumber?.toLowerCase().includes(query);
        const nameMatch = `${item.studentFirstName} ${item.studentLastName}`.toLowerCase().includes(query);
        const phoneMatch = item.parentPhone?.replace(/\D/g, '').includes(query.replace(/\D/g, ''));
        return numMatch || nameMatch || phoneMatch;
      });

      if (match) {
        setTrackingResult(match);
        toast.success(`Dossier ${match.applicationNumber} localisé avec succès !`);
      } else {
        setTrackingResult('NOT_FOUND');
        toast.error('Aucun dossier trouvé pour cette référence.');
      }
    } catch {
      setTrackingResult('NOT_FOUND');
    } finally {
      setIsSearching(false);
    }
  };

  // Submit Quick Callback / Inquiry
  const handleSendInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim()) {
      toast.error('Veuillez saisir votre nom complet.');
      return;
    }
    const phoneRes = validatePhone(contactPhone);
    if (!phoneRes.isValid) {
      toast.error(phoneRes.error || 'Numéro de téléphone valide requis.');
      return;
    }

    setIsSendingInquiry(true);
    try {
      const timeLabel = preferredCallbackTime === 'matin' ? 'Matinée (08h00 - 12h00)' : 'Après-midi (13h00 - 15h30)';
      await apiService.sendContactMessage({
        fullName: contactName.trim(),
        email: 'admission-demande@collegeisaacnewton.com',
        phone: contactPhone.trim(),
        subject: `[Admissions 2026-2027] Demande d'information pour : ${contactLevel}`,
        message: contactMessage.trim() || `Demande de rappel pour le niveau ${contactLevel}. Créneau souhaité: ${timeLabel}. Parent joignable au ${contactPhone}.`,
      });

      setInquirySent(true);
      toast.success('Demande enregistrée ! Un conseiller vous appellera sous 24h ouvrées.');
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de l’envoi. Veuillez réessayer.');
    } finally {
      setIsSendingInquiry(false);
    }
  };

  // Filter FAQs
  const filteredFaqs = FAQS.filter(faq => {
    const q = faqSearch.toLowerCase().trim();
    const matchesSearch = !q || faq.question.toLowerCase().includes(q) || faq.answer.toLowerCase().includes(q);
    if (!matchesSearch) return false;

    if (activeFaqCategory === 'frais') {
      return faq.question.toLowerCase().includes('frais') || faq.answer.toLowerCase().includes('frais') || faq.answer.toLowerCase().includes('scolarité') || faq.answer.toLowerCase().includes('paiement');
    }
    if (activeFaqCategory === 'dossier') {
      return faq.question.toLowerCase().includes('pièce') || faq.question.toLowerCase().includes('document') || faq.answer.toLowerCase().includes('bulletin') || faq.answer.toLowerCase().includes('acte');
    }
    if (activeFaqCategory === 'calendrier') {
      return faq.question.toLowerCase().includes('quand') || faq.question.toLowerCase().includes('heure') || faq.question.toLowerCase().includes('horaire') || faq.question.toLowerCase().includes('date') || faq.question.toLowerCase().includes('rentrée');
    }
    return true;
  });

  const activeCycleData = CYCLE_DETAILS[selectedCycle];

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-5 py-2 sm:py-3.5 max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 font-sans">
      
      {/* =========================================================================
          1. HERO BANNER - Ultra-Modern, Dense & Fluid Compact Layout
      ========================================================================= */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white border border-slate-800/80 shadow-md p-3.5 sm:p-5 lg:p-6">
        
        {/* Subtle Ambient Glows */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-3.5 lg:gap-6 items-center">
          
          {/* Left Column: Heading, Metrics & Identity (7 cols) */}
          <div className="lg:col-span-7 space-y-2.5">
            
            {/* Status Chips */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-semibold backdrop-blur-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <ContentEditable
                  contentKey="admissions.hero.badge"
                  defaultContent="Campagne d'Admissions 2026-2027 Ouverte"
                  as="span"
                  currentUser={currentUser}
                  multiline={false}
                />
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/15 border border-blue-400/25 text-blue-300 text-[10.5px] font-mono">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>Places Limitées</span>
              </span>
            </div>

            {/* Page Title */}
            <div>
              <ContentEditable
                contentKey="admissions.hero.title"
                defaultContent={`Admissions & Inscriptions ${SCHOOL_INFO.currentYear}`}
                as="h1"
                className="font-serif text-lg sm:text-2xl md:text-3xl font-bold text-white tracking-tight leading-tight"
                currentUser={currentUser}
                multiline={false}
              />
              <ContentEditable
                contentKey="admissions.hero.subtitle"
                defaultContent="Offrez à votre enfant un parcours d'excellence humaine et académique au Collège Isaac Newton. Procédure simple, claire et suivie pas à pas."
                as="p"
                className="mt-1 text-xs sm:text-sm text-slate-300 leading-relaxed font-light max-w-xl"
                currentUser={currentUser}
                multiline={true}
              />
            </div>

            {/* Compact Key Metric Badges */}
            <div className="grid grid-cols-3 gap-2 pt-1 max-w-lg">
              <div className="bg-white/5 border border-white/10 rounded-xl px-2 py-1.5 backdrop-blur-xs">
                <span className="block font-mono text-xs sm:text-sm font-bold text-amber-300">100%</span>
                <span className="block text-[10px] text-slate-300 leading-tight">Réussite Examens</span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl px-2 py-1.5 backdrop-blur-xs">
                <span className="block font-mono text-xs sm:text-sm font-bold text-blue-300">Effectifs</span>
                <span className="block text-[10px] text-slate-300 leading-tight">Classes Maîtrisées</span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl px-2 py-1.5 backdrop-blur-xs">
                <span className="block font-mono text-xs sm:text-sm font-bold text-emerald-300">Bilingue</span>
                <span className="block text-[10px] text-slate-300 leading-tight">Sciences & Langues</span>
              </div>
            </div>

            {/* Hotlines */}
            <div className="flex items-center gap-3 text-[11px] text-slate-300 pt-0.5 flex-wrap">
              <a href={`tel:${SCHOOL_INFO.phone}`} className="inline-flex items-center gap-1 text-amber-300 hover:text-amber-200 transition-colors font-mono">
                <Phone className="w-3 h-3" />
                <span>{SCHOOL_INFO.phone}</span>
              </a>
              <span className="text-slate-600 hidden sm:inline">·</span>
              <span className="inline-flex items-center gap-1 text-slate-300">
                <Building className="w-3 h-3 text-blue-400" />
                <span>Delmas 50, rue Dominique #2 bis</span>
              </span>
            </div>

          </div>

          {/* Right Column: High-Priority Action Card (5 cols) */}
          <div className="lg:col-span-5 bg-white/10 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-white/15 shadow-md flex flex-col justify-between gap-2.5">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 font-mono">
                  Démarche Prioritaire
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-medium">
                  Guichet 2026-2027
                </span>
              </div>
              <h3 className="font-serif text-sm sm:text-base font-bold text-white">
                Inscription Officielle en Ligne
              </h3>
              <p className="text-[11.5px] text-slate-300 leading-snug">
                Complétez le dossier numérique en quelques minutes. Récépissé officiel et numéro CIN immédiats.
              </p>
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() => onNavigate('pre-registration')}
                className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all active:scale-[0.98] cursor-pointer group"
              >
                <FileCheck className="w-4 h-4 text-slate-950" />
                <span>Lancer la préinscription 2026-2027</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('suivi-dossier-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-2 py-1.5 text-center text-slate-200 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors cursor-pointer truncate"
                >
                  🔍 Suivre un dossier
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('contact-admissions-form');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-2 py-1.5 text-center text-slate-200 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors cursor-pointer truncate"
                >
                  📞 Être rappelé
                </button>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          2. SUIVI EXPRESS DE DOSSIER (Ergonomic, Dense & Fast Live Lookup)
      ========================================================================= */}
      <section id="suivi-dossier-section" className="bg-white/95 rounded-2xl border border-slate-200/90 shadow-2xs p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-900 flex items-center justify-center font-bold text-xs shrink-0">
              <Search className="w-3.5 h-3.5" />
            </span>
            <div>
              <h2 className="font-serif text-sm sm:text-base font-bold text-slate-900 leading-tight">
                Suivi Express de Dossier d'Admission
              </h2>
              <p className="text-[11px] text-slate-500">
                Consultez instantanément l'état de votre dossier avec votre référence CIN ou votre numéro de téléphone.
              </p>
            </div>
          </div>

          {/* Quick sample chips */}
          <div className="flex items-center gap-1.5 text-[10.5px] text-slate-500 flex-wrap">
            <span className="font-medium text-slate-400">Exemples :</span>
            <button
              type="button"
              onClick={() => { setTrackingQuery('CIN-2026-0042'); }}
              className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-blue-950 font-mono transition-colors cursor-pointer"
            >
              CIN-2026-0042
            </button>
            <button
              type="button"
              onClick={() => { setTrackingQuery('3316-0934'); }}
              className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-blue-950 font-mono transition-colors cursor-pointer"
            >
              3316-0934
            </button>
          </div>
        </div>

        {/* Compact Search Form */}
        <form onSubmit={handleSearchDossier} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={trackingQuery}
              onChange={(e) => setTrackingQuery(e.target.value)}
              placeholder="Numéro de dossier (ex: CIN-2026-0042) ou téléphone parent..."
              className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900 bg-slate-50/50"
            />
            {trackingQuery && (
              <button
                type="button"
                onClick={() => { setTrackingQuery(''); setTrackingResult(null); }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                title="Effacer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-semibold text-xs sm:text-sm shadow-xs transition-all disabled:opacity-50 cursor-pointer shrink-0"
          >
            {isSearching ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Vérification...</span>
              </>
            ) : (
              <>
                <Search className="w-3.5 h-3.5" />
                <span>Vérifier le statut</span>
              </>
            )}
          </button>
        </form>

        {/* Tracking Result Card */}
        {trackingResult && trackingResult !== 'NOT_FOUND' && (
          <div className="mt-2.5 p-3 sm:p-3.5 rounded-xl bg-blue-50/80 border border-blue-200/90 animate-in fade-in duration-150">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-100 pb-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs sm:text-sm font-bold text-blue-950">
                    {trackingResult.applicationNumber}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    trackingResult.status === 'ACCEPTED' 
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : trackingResult.status === 'REJECTED'
                      ? 'bg-rose-100 text-rose-800 border border-rose-300'
                      : trackingResult.status === 'INTERVIEW_SCHEDULED'
                      ? 'bg-purple-100 text-purple-800 border border-purple-300'
                      : 'bg-amber-100 text-amber-900 border border-amber-300'
                  }`}>
                    {trackingResult.status === 'ACCEPTED' ? '✓ Admis Définitivement' :
                     trackingResult.status === 'REJECTED' ? '✕ Dossier Non Retenu' :
                     trackingResult.status === 'INTERVIEW_SCHEDULED' ? '📅 Entretien & Test Planifiés' :
                     '⏳ En cours d’examen & pièces'}
                  </span>
                </div>
                <h4 className="font-serif font-bold text-xs sm:text-sm text-slate-900 mt-0.5">
                  Élève : {trackingResult.studentFirstName} {trackingResult.studentLastName}
                </h4>
              </div>
              <div className="text-left sm:text-right text-[11px]">
                <span className="text-slate-600 block">
                  Niveau visé : <strong className="text-blue-950">{trackingResult.targetLevel}</strong>
                </span>
                <span className="text-slate-500 font-mono text-[10px]">
                  Session : {trackingResult.schoolYear || '2026-2027'}
                </span>
              </div>
            </div>

            {/* Micro-Progress Stages */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2 text-[10.5px]">
              <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-white border border-blue-100">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="font-medium text-slate-700">Préinscription enregistrée</span>
              </div>
              <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-white border border-blue-100">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="font-medium text-slate-700">Dossier en traitement</span>
              </div>
              <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-white border border-blue-100">
                <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span className="font-medium text-slate-700">Dépôt des pièces au campus</span>
              </div>
            </div>
          </div>
        )}

        {trackingResult === 'NOT_FOUND' && (
          <div className="mt-2.5 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-xs flex items-center justify-between gap-2 animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Aucun dossier trouvé pour cette référence. Vérifiez le numéro ou contactez l'accueil.</span>
            </div>
            <a href={`tel:${SCHOOL_INFO.phone}`} className="font-bold underline text-blue-950 text-[11px] shrink-0">
              Appeler l'accueil
            </a>
          </div>
        )}
      </section>

      {/* =========================================================================
          3. LA PROCÉDURE D'ADMISSION EN 4 ÉTAPES - Compact, Linked Flow
      ========================================================================= */}
      <section className="bg-white/95 rounded-2xl border border-slate-200/90 shadow-2xs p-3 sm:p-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-3 pb-2 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-900 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                <ContentEditable
                  contentKey="admissions.procedure.badge"
                  defaultContent="Simplicité & Rigueur"
                  as="span"
                  currentUser={currentUser}
                  multiline={false}
                />
              </span>
              <ContentEditable
                contentKey="admissions.procedure.title"
                defaultContent="La Procédure d'Admission en 4 Étapes"
                as="h2"
                className="font-serif text-sm sm:text-base font-bold text-slate-900"
                currentUser={currentUser}
                multiline={false}
              />
            </div>
            <ContentEditable
              contentKey="admissions.procedure.subtitle"
              defaultContent="Un parcours clair, rigoureux et transparent pour accueillir votre enfant au campus."
              as="p"
              className="text-[11px] text-slate-500 mt-0.5"
              currentUser={currentUser}
              multiline={true}
            />
          </div>

          <button
            type="button"
            onClick={() => onNavigate('pre-registration')}
            className="text-xs text-blue-900 font-semibold hover:underline inline-flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            <span>Démarrer étape 1</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 4 Cards Grid - Responsive, Compact Pipeline */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {[
            {
              step: '01',
              title: 'Préinscription en ligne',
              desc: 'Formulaire rapide pour réserver une place et générer le numéro officiel de dossier CIN.',
              badge: '100% Numérique',
              badgeColor: 'bg-blue-50 text-blue-900 border-blue-200',
              cta: 'Remplir en ligne',
              target: 'pre-registration'
            },
            {
              step: '02',
              title: 'Dépôt des Pièces',
              desc: 'Présentez l’extrait d’acte de naissance et les bulletins scolaires au secrétariat (Delmas 50).',
              badge: 'Dépôt Physique',
              badgeColor: 'bg-amber-50 text-amber-900 border-amber-200',
              cta: 'Voir pièces requises',
              target: null
            },
            {
              step: '03',
              title: 'Test & Entretien',
              desc: 'Convocation bienveillante pour un test diagnostique et échange d’orientation pédagogique.',
              badge: 'Évaluation',
              badgeColor: 'bg-purple-50 text-purple-900 border-purple-200',
              cta: 'Calendrier des tests',
              target: null
            },
            {
              step: '04',
              title: 'Validation & Accueil',
              desc: 'Attribution de la place, remise du livret d’accueil et finalisation de l’inscription officielle.',
              badge: 'Confirmation',
              badgeColor: 'bg-emerald-50 text-emerald-900 border-emerald-200',
              cta: 'Finalisation',
              target: null
            },
          ].map((item, idx) => (
            <div 
              key={idx} 
              className="bg-slate-50/70 hover:bg-white rounded-xl p-2.5 sm:p-3 border border-slate-200/80 hover:border-blue-900/30 hover:shadow-2xs transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-base font-black text-blue-900/40 group-hover:text-blue-900 transition-colors">
                    {item.step}
                  </span>
                  <span className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded-full border ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                </div>
                <h3 className="font-serif font-bold text-xs sm:text-sm text-slate-900 mb-0.5 leading-snug">
                  {item.title}
                </h3>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {item.desc}
                </p>
              </div>

              {item.target && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => onNavigate(item.target)}
                    className="w-full text-center text-[11px] font-semibold text-blue-900 hover:text-blue-950 py-1 rounded-lg bg-blue-50/70 hover:bg-blue-100 transition-colors cursor-pointer"
                  >
                    {item.cta} →
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

      </section>

      {/* =========================================================================
          4. EXPLORATEUR INTERACTIF DES CYCLES & CONDITIONS D'ADMISSION
      ========================================================================= */}
      <section className="bg-white/95 rounded-2xl border border-slate-200/90 shadow-2xs p-3 sm:p-4 space-y-2.5">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-100 pb-2">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-blue-900">
              <Layers className="w-3.5 h-3.5 text-amber-500" />
              <span>Simulateur & Critères Pédagogiques</span>
            </div>
            <h2 className="font-serif text-sm sm:text-base font-bold text-slate-900 mt-0.5">
              Conditions Spécifiques par Cycle Académique
            </h2>
          </div>

          {/* Segmented Pill Tabs for Cycles */}
          <div className="flex items-center gap-1 overflow-x-auto pb-0.5 sm:pb-0 scrollbar-none">
            {(Object.keys(CYCLE_DETAILS) as CycleTabKey[]).map((cycleKey) => {
              const c = CYCLE_DETAILS[cycleKey];
              const isSelected = selectedCycle === cycleKey;
              return (
                <button
                  key={cycleKey}
                  type="button"
                  onClick={() => setSelectedCycle(cycleKey)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-900 text-white shadow-2xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {c.shortLabel}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3-Column Dense Dashboard Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 bg-slate-50/70 rounded-xl p-2.5 sm:p-3 border border-slate-200/80">
          
          {/* Column 1: Identity & Classes (4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-xl p-2.5 sm:p-3 border border-slate-200/90 shadow-2xs space-y-2 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-blue-900 bg-blue-100 px-2 py-0.5 rounded-full">
                  {activeCycleData.badge}
                </span>
                <span className="text-[11px] font-mono text-slate-600 font-semibold">
                  Âge : {activeCycleData.age}
                </span>
              </div>

              <h3 className="font-serif font-bold text-sm sm:text-base text-slate-900">
                {activeCycleData.label}
              </h3>

              <div className="text-[11.5px] text-slate-700 space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 font-mono block">
                  Horaires officiels :
                </span>
                <p className="font-medium text-slate-800 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-900 shrink-0" />
                  <span>{activeCycleData.schedule}</span>
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 font-mono block">
                  Classes concernées :
                </span>
                <div className="flex flex-wrap gap-1">
                  {activeCycleData.classes.map((cls, idx) => (
                    <span 
                      key={idx} 
                      className="px-2 py-0.5 rounded-lg bg-slate-50 text-slate-700 text-[10.5px] font-medium border border-slate-200 shadow-2xs"
                    >
                      {cls}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('pre-registration', activeCycleData.targetSubSection)}
              className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-semibold text-xs shadow-xs transition-all cursor-pointer mt-2"
            >
              <FileCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Inscrire en {activeCycleData.shortLabel}</span>
            </button>
          </div>

          {/* Column 2: Conditions requises (4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-xl p-2.5 sm:p-3 border border-slate-200/90 shadow-2xs space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 pb-1 border-b border-slate-100">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Critères Pédagogiques & Entrée</span>
            </div>
            <ul className="space-y-1.5 text-[11px] sm:text-xs text-slate-700">
              {activeCycleData.conditions.map((cond, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-900 mt-1.5 shrink-0" />
                  <span className="leading-snug">{cond}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Pièces à fournir (4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-xl p-2.5 sm:p-3 border border-slate-200/90 shadow-2xs space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-900 pb-1 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-amber-600" />
                <span>Pièces Officielles à Fournir</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono font-normal">4 pièces</span>
            </div>
            <ul className="space-y-1.5 text-[11px] sm:text-xs text-slate-700">
              {activeCycleData.documents.map((doc, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-amber-50 text-amber-800 text-[10px] font-bold flex items-center justify-center shrink-0 border border-amber-200">
                    {idx + 1}
                  </span>
                  <span className="leading-snug">{doc}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>

      </section>

      {/* =========================================================================
          5. FORMULAIRE DE RAPPEL & CONTACT ADMISSIONS - Optimisé, Dense & Ergonomique
      ========================================================================= */}
      <section id="contact-admissions-form" className="bg-white/95 rounded-2xl border border-slate-200/90 shadow-2xs p-3 sm:p-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
          
          {/* Info Side (4 cols) */}
          <div className="lg:col-span-4 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-900 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
              Secrétariat des Admissions
            </span>
            <h2 className="font-serif text-sm sm:text-base font-bold text-slate-900 leading-tight">
              Demande de Rappel Téléphonique
            </h2>
            <p className="text-[11.5px] text-slate-600 leading-relaxed">
              Une question sur les frais, le programme ou les dossiers ? Laissez vos coordonnées et un conseiller d'admission vous rappelle sous 24h ouvrées.
            </p>
            
            <div className="pt-1 space-y-1.5 text-xs text-slate-700 bg-slate-50/70 p-2.5 rounded-xl border border-slate-200/70">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="font-mono text-[11px]"><strong>+509 3316-0934</strong> / <strong>+509 3721-1818</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-blue-900 shrink-0" />
                <span className="text-[11px]">Permanence : Lun — Ven (07h30 — 15h30)</span>
              </div>
              <div className="flex items-center gap-2">
                <Building className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span className="text-[11px]">Campus Delmas 50, rue Dominique #2 bis</span>
              </div>
            </div>
          </div>

          {/* Form Side (8 cols) - 2x2 Clean Dense Grid */}
          <div className="lg:col-span-8 bg-slate-50/80 rounded-xl p-3 sm:p-3.5 border border-slate-200/80">
            {inquirySent ? (
              <div className="p-4 text-center space-y-2 animate-in fade-in">
                <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <Check className="w-5 h-5" />
                </div>
                <h4 className="font-serif font-bold text-sm text-slate-900">
                  Demande transmise avec succès !
                </h4>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  Votre demande pour la classe de <strong>{contactLevel}</strong> a été enregistrée. Le secrétariat vous contactera par téléphone.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setContactName('');
                    setContactPhone('');
                    setContactMessage('');
                    setInquirySent(false);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-blue-900 text-white text-xs font-semibold hover:bg-blue-950 transition-colors cursor-pointer"
                >
                  Envoyer une autre demande
                </button>
              </div>
            ) : (
              <form onSubmit={handleSendInquiry} className="space-y-2.5">
                
                {/* Row 1: Name and Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                      Nom complet du parent / tuteur <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="Ex: Jean-Baptiste Pierre"
                      className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-blue-900 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                      Numéro de téléphone joignable <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={contactPhone}
                      onChange={(e) => setContactPhone(formatPhoneNumber(e.target.value))}
                      placeholder="+509 3800-0000"
                      className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-blue-900 bg-white font-mono"
                    />
                  </div>
                </div>

                {/* Row 2: Level Selection & Time Preference */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                      Niveau scolaire visé
                    </label>
                    <select
                      value={contactLevel}
                      onChange={(e) => setContactLevel(e.target.value)}
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
                      Créneau d'appel préféré
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setPreferredCallbackTime('matin')}
                        className={`py-1.5 px-2 rounded-xl text-xs font-semibold text-center transition-all cursor-pointer border ${
                          preferredCallbackTime === 'matin'
                            ? 'bg-blue-900 text-white border-blue-900 shadow-2xs'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        ☀️ Matin (08h-12h)
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreferredCallbackTime('aprem')}
                        className={`py-1.5 px-2 rounded-xl text-xs font-semibold text-center transition-all cursor-pointer border ${
                          preferredCallbackTime === 'aprem'
                            ? 'bg-blue-900 text-white border-blue-900 shadow-2xs'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        ⛅ Après-midi (13h-15h30)
                      </button>
                    </div>
                  </div>
                </div>

                {/* Row 3: Optional message */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                    Précision éventuelle (frais, fratrie, transport...)
                  </label>
                  <input
                    type="text"
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="Ex: Demande sur les modalités de versement ou fratrie de 2 enfants..."
                    className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-blue-900 bg-white"
                  />
                </div>

                {/* Submit Row */}
                <div className="pt-0.5 flex flex-col sm:flex-row items-center justify-between gap-2">
                  <span className="text-[10px] text-slate-500">
                    Vos coordonnées restent strictement confidentielles au secrétariat.
                  </span>
                  <button
                    type="submit"
                    disabled={isSendingInquiry}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-semibold text-xs shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isSendingInquiry ? (
                      <>
                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Envoi...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Envoyer ma demande de rappel</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

        </div>
      </section>

      {/* =========================================================================
          6. FOIRE AUX QUESTIONS (FAQ) - Accordéon Dense, Filtrable & Compact
      ========================================================================= */}
      <section className="bg-white/95 rounded-2xl border border-slate-200/90 shadow-2xs p-3 sm:p-4 space-y-2.5">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-900 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                <ContentEditable
                  contentKey="admissions.faq.badge"
                  defaultContent="Réponses & Éclaircissements"
                  as="span"
                  currentUser={currentUser}
                  multiline={false}
                />
              </span>
              <ContentEditable
                contentKey="admissions.faq.title"
                defaultContent="Questions Fréquentes sur les Admissions"
                as="h2"
                className="font-serif text-sm sm:text-base font-bold text-slate-900"
                currentUser={currentUser}
                multiline={false}
              />
            </div>
            <ContentEditable
              contentKey="admissions.faq.subtitle"
              defaultContent="Consultez les réponses directes aux questions courantes des parents."
              as="p"
              className="text-[11px] text-slate-500 mt-0.5"
              currentUser={currentUser}
              multiline={true}
            />
          </div>

          {/* Quick FAQ Search Bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={faqSearch}
              onChange={(e) => setFaqSearch(e.target.value)}
              placeholder="Filtrer une question..."
              className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-blue-900 bg-white"
            />
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none">
          {FAQ_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveFaqCategory(cat.id)}
              className={`px-2 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-colors cursor-pointer ${
                activeFaqCategory === cat.id
                  ? 'bg-blue-900 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Compact Accordion List */}
        <div className="space-y-1.5">
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-4 text-xs text-slate-500">
              Aucune question ne correspond à votre recherche.
            </div>
          ) : (
            filteredFaqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="bg-slate-50/60 hover:bg-slate-50 rounded-xl border border-slate-200/80 overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full text-left px-3 py-2 sm:py-2.5 flex items-center justify-between gap-2.5 font-serif font-bold text-xs sm:text-[13px] text-slate-900 hover:text-blue-900 cursor-pointer"
                    aria-expanded={isOpen}
                  >
                    <span className="leading-snug">{faq.question}</span>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${
                      isOpen ? 'rotate-180 text-blue-900' : ''
                    }`} />
                  </button>
                  {isOpen && (
                    <div className="px-3 pb-2.5 pt-0 text-[11.5px] text-slate-600 leading-relaxed border-t border-slate-100 bg-white/70">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Call to Action Card */}
        <div className="mt-2.5 p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md border border-blue-900/60">
          <div className="space-y-0.5">
            <ContentEditable
              contentKey="admissions.cta.title"
              defaultContent="Prêt à inscrire votre enfant pour l'année 2026-2027 ?"
              as="h3"
              className="font-serif text-xs sm:text-sm font-bold text-white"
              currentUser={currentUser}
              multiline={false}
            />
            <ContentEditable
              contentKey="admissions.cta.subtitle"
              defaultContent="Nos équipes sont à votre disposition pour vous accompagner dans votre démarche d'inscription."
              as="p"
              className="text-[11px] text-slate-200"
              currentUser={currentUser}
              multiline={true}
            />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('contact')}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-colors cursor-pointer"
            >
              Contact
            </button>
            <button
              type="button"
              onClick={() => onNavigate('pre-registration')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <FileCheck className="w-3.5 h-3.5 text-slate-950" />
              <span>Préinscription en ligne</span>
            </button>
          </div>
        </div>

      </section>

    </div>
  );
};
