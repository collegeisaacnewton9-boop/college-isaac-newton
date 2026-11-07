import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  ArrowRight, 
  FileCheck, 
  ChevronDown, 
  FileText,
  Clock,
  AlertCircle,
  Phone,
  MapPin,
  Printer,
  ShieldCheck,
  GraduationCap,
  BookOpen,
  DollarSign,
  UserCheck,
  Check
} from 'lucide-react';
import { FAQS, SCHOOL_INFO } from '../data/mockData';
import { ContentEditable } from '../components/common/ContentEditable';
import { User, AdmissionRequirementsConfig } from '../types';
import { apiService } from '../services/api';

interface AdmissionsPageProps {
  onNavigate: (page: string, subSection?: string) => void;
  subSection?: string;
  currentUser?: User | null;
}

const DEFAULT_OFFICIAL_REQUIREMENTS: AdmissionRequirementsConfig = {
  academicYear: '2026-2027',
  registrationFee: '3 000 Gourdes',
  openingHours: 'Du lundi au vendredi de 8h à 15h (8h à 3h)',
  presenceRequiredNotice: "L'enfant doit être présent lors de l'inscription.",
  levelsConcerned: [
    'Préscolaire',
    'Fondamental (1er Cycle - 2ème Cycle - 3ème Cycle)',
    'Section Secondaire (Nouveau Secondaire NS1 à NS4)'
  ],
  fondamentaleDocuments: [
    'Acte de naissance ou extrait des archives (Original et copie)',
    'Carnet scolaire du dernier établissement (Original)',
    'Deux (2) Photos d\'identité (date récente)',
    'Frais d\'inscription : 3 000 Gourdes',
    'Pièces d\'identité de la personne responsable (CIN / NIF)'
  ],
  secondaireDocuments: [
    'Acte de naissance ou extrait des archives (Original et copie)',
    'Carnet scolaire du dernier établissement (Original)',
    'Deux (2) Photos d\'identité (date récente)',
    'Frais d\'inscription : 3 000 Gourdes',
    'Pièces d\'identité de la personne responsable (CIN / NIF)'
  ],
  additionalDocuments: [
    'Relevé de Notes NS2 et NS3',
    'Fiche 9ème A.F',
    'Attestation 9ème A.F',
    'NISU et le code de l\'école'
  ],
  updatedAt: '2026-10-22T08:00:00.000Z'
};

export const AdmissionsPage: React.FC<AdmissionsPageProps> = ({ 
  onNavigate, 
  subSection, 
  currentUser 
}) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [requirements, setRequirements] = useState<AdmissionRequirementsConfig>(DEFAULT_OFFICIAL_REQUIREMENTS);
  const [activeTab, setActiveTab] = useState<'all' | 'fondamentale' | 'secondaire'>('all');

  useEffect(() => {
    apiService.getSettings().then(settings => {
      if (settings?.admissionRequirements) {
        setRequirements(settings.admissionRequirements);
      }
    }).catch(() => {});

    const handleSettingsUpdate = (e: any) => {
      if (e.detail?.admissionRequirements) {
        setRequirements(e.detail.admissionRequirements);
      }
    };
    window.addEventListener('cin:settings-updated', handleSettingsUpdate);
    return () => window.removeEventListener('cin:settings-updated', handleSettingsUpdate);
  }, []);

  // Handle smooth scroll when navigating with subSection
  useEffect(() => {
    if (subSection === 'conditions') {
      const el = document.getElementById('official-requirements');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (subSection === 'procedure') {
      const el = document.getElementById('admission-procedure');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (subSection === 'faq') {
      const el = document.getElementById('admission-faq');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  }, [subSection]);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 sm:space-y-10 lg:space-y-12 py-5 sm:py-7 lg:py-8 font-sans">
      
      {/* 1. Header & Academic Welcome */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-900 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            <GraduationCap className="w-3.5 h-3.5 text-amber-500" />
            <ContentEditable
              contentKey="admissions.hero.badge"
              defaultContent={`Inscriptions en cours · Année ${requirements.academicYear || '2026-2027'}`}
              as="span"
              currentUser={currentUser}
              multiline={false}
            />
          </div>
          <ContentEditable
            contentKey="admissions.hero.title"
            defaultContent={`Admissions & Inscriptions ${requirements.academicYear || SCHOOL_INFO.currentYear}`}
            as="h1"
            className="font-serif text-2xl sm:text-4xl font-bold text-slate-900"
            currentUser={currentUser}
            multiline={false}
          />
          <ContentEditable
            contentKey="admissions.hero.subtitle"
            defaultContent="Retrouvez l'ensemble des pièces officielles exigibles pour la Section Fondamentale et la Section Secondaire, les modalités de dépôt et le formulaire de préinscription."
            as="p"
            className="text-sm sm:text-base text-slate-600 leading-relaxed font-light"
            currentUser={currentUser}
            multiline={true}
          />
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('pre-registration')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-semibold text-xs sm:text-sm shadow-md transition-all active:scale-98 cursor-pointer"
            >
              <FileCheck className="w-4 h-4 text-amber-400" />
              <span>Accéder au formulaire de préinscription en ligne</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs sm:text-sm border border-slate-300 transition-colors cursor-pointer"
              title="Imprimer la fiche officielle des pièces"
            >
              <Printer className="w-4 h-4 text-slate-700" />
              <span>Imprimer la fiche des pièces</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. LE DOCUMENT OFFICIEL OFFICIELLEMENT ATTRIBUÉ (Pièces requises, sections, horaires, 3000gdes) */}
      <section id="official-requirements" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border-2 border-blue-900/30 shadow-xl overflow-hidden">
          
          {/* En-tête certifié du document officiel Collège Isaac Newton */}
          <div className="bg-gradient-to-r from-slate-950 via-blue-950 to-slate-900 text-white p-6 sm:p-8 border-b border-slate-800 relative">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-bold text-[11px] uppercase tracking-wider">
                    Document Officiel du Secrétariat
                  </span>
                  <span className="text-xs text-amber-300 font-mono font-semibold">
                    Réf : Année {requirements.academicYear}
                  </span>
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl font-extrabold tracking-tight uppercase">
                  COLLÈGE ISAAC NEWTON
                </h2>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300 font-light">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    <span>Delmas 50 no 2 bis, Port-au-Prince, Haïti</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-amber-400" />
                    <span className="font-mono">Téls : 3721-1818 / 3316-0934</span>
                  </span>
                </div>
              </div>

              {/* Niveaux Concernés Badge */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 max-w-sm space-y-1">
                <div className="text-[11px] font-mono text-amber-300 font-bold uppercase tracking-wider">
                  Inscriptions en cours : Niveaux
                </div>
                <div className="text-xs sm:text-sm font-semibold text-white leading-snug">
                  Préscolaire · Fondamental (1er Cycle, 2ème Cycle, 3ème Cycle) · Secondaire
                </div>
              </div>
            </div>
          </div>

          {/* Corps du Document : Section Fondamentale vs Section Secondaire */}
          <div className="p-6 sm:p-8 lg:p-10 space-y-8 bg-slate-50/50">
            
            {/* Onglets rapides sur petit écran */}
            <div className="flex items-center justify-between flex-wrap gap-3 border-b border-slate-200 pb-4">
              <div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-slate-900">
                  Dossier d'Inscription & Pièces Requises
                </h3>
                <p className="text-xs sm:text-sm text-slate-600">
                  Pièces indispensables à fournir lors du dépôt physique au secrétariat de l'école.
                </p>
              </div>

              <div className="inline-flex rounded-xl bg-slate-200/80 p-1 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setActiveTab('all')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    activeTab === 'all' ? 'bg-white text-blue-950 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Tous les Niveaux
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('fondamentale')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    activeTab === 'fondamentale' ? 'bg-white text-blue-950 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Section Fondamentale
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('secondaire')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    activeTab === 'secondaire' ? 'bg-white text-blue-950 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Section Secondaire
                </button>
              </div>
            </div>

            {/* Grille des Deux Pôles */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-start">
              
              {/* SECTION FONDAMENTALE */}
              {(activeTab === 'all' || activeTab === 'fondamentale') && (
                <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-5 hover:border-blue-900/40 transition-all">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="p-2 rounded-xl bg-blue-50 text-blue-900 font-bold">
                        <BookOpen className="w-5 h-5 text-blue-900" />
                      </span>
                      <div>
                        <span className="text-[10px] font-mono font-bold text-blue-900 uppercase tracking-wider">
                          1er Cycle · 2ème Cycle · 3ème Cycle
                        </span>
                        <h4 className="font-serif text-lg sm:text-xl font-bold text-slate-900">
                          Section Fondamentale
                        </h4>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                      Préscolaire & Fondamental
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Pièces requises :
                    </div>
                    
                    <ol className="space-y-3 text-xs sm:text-sm text-slate-800">
                      <li className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="w-6 h-6 rounded-full bg-blue-900 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0">
                          1
                        </span>
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-900">
                            Acte de naissance ou extrait des archives
                          </span>
                          <p className="text-[11px] text-slate-500">
                            Fournir l'<strong>Original et une copie</strong> claire et lisible.
                          </p>
                        </div>
                      </li>

                      <li className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="w-6 h-6 rounded-full bg-blue-900 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0">
                          2
                        </span>
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-900">
                            Carnet scolaire du dernier établissement
                          </span>
                          <p className="text-[11px] text-slate-500">
                            Document <strong>Original</strong> certifiant les résultats et la décision de passage.
                          </p>
                        </div>
                      </li>

                      <li className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="w-6 h-6 rounded-full bg-blue-900 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0">
                          3
                        </span>
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-900">
                            Deux (2) Photos d'identité
                          </span>
                          <p className="text-[11px] text-slate-500">
                            Photos de <strong>date récente</strong> en tenue correcte.
                          </p>
                        </div>
                      </li>

                      <li className="flex items-start gap-3 p-2.5 rounded-xl bg-amber-50/70 border border-amber-200">
                        <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                          4
                        </span>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-amber-950">
                              Frais d'inscription :
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-mono font-extrabold text-xs">
                              3 000 Gourdes
                            </span>
                          </div>
                          <p className="text-[11px] text-amber-900">
                            À régler lors du dépôt du dossier physique au secrétariat.
                          </p>
                        </div>
                      </li>

                      <li className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="w-6 h-6 rounded-full bg-blue-900 text-white font-mono font-bold text-xs flex items-center justify-center shrink-0">
                          5
                        </span>
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-900">
                            Pièces d'identité de la personne responsable
                          </span>
                          <p className="text-[11px] text-slate-500">
                            Carte d'Identification Nationale (<strong>CIN</strong>) ou Numéro d'Immatriculation Fiscale (<strong>NIF</strong>) du parent/tuteur.
                          </p>
                        </div>
                      </li>
                    </ol>
                  </div>
                </div>
              )}

              {/* SECTION SECONDAIRE */}
              {(activeTab === 'all' || activeTab === 'secondaire') && (
                <div className="bg-white rounded-2xl p-6 sm:p-7 border-2 border-blue-900/30 shadow-md space-y-5 hover:border-blue-900 transition-all">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="p-2 rounded-xl bg-blue-900 text-amber-400 font-bold">
                        <GraduationCap className="w-5 h-5 text-amber-400" />
                      </span>
                      <div>
                        <span className="text-[10px] font-mono font-bold text-blue-900 uppercase tracking-wider">
                          Nouveau Secondaire · NS1 à NS4
                        </span>
                        <h4 className="font-serif text-lg sm:text-xl font-bold text-slate-900">
                          Section Secondaire
                        </h4>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-900 border border-blue-200 text-xs font-bold">
                      Secondaire Unique
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Pièces requises de base :
                    </div>
                    
                    <ol className="space-y-2.5 text-xs sm:text-sm text-slate-800">
                      <li className="flex items-start gap-3 p-2 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="w-5 h-5 rounded-full bg-blue-900 text-white font-mono font-bold text-[11px] flex items-center justify-center shrink-0">
                          1
                        </span>
                        <span><strong>Acte de naissance ou extrait des archives</strong> (Original et copie)</span>
                      </li>
                      <li className="flex items-start gap-3 p-2 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="w-5 h-5 rounded-full bg-blue-900 text-white font-mono font-bold text-[11px] flex items-center justify-center shrink-0">
                          2
                        </span>
                        <span><strong>Carnet scolaire du dernier établissement</strong> (Original)</span>
                      </li>
                      <li className="flex items-start gap-3 p-2 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="w-5 h-5 rounded-full bg-blue-900 text-white font-mono font-bold text-[11px] flex items-center justify-center shrink-0">
                          3
                        </span>
                        <span><strong>Deux (2) Photos d'identité</strong> (date récente)</span>
                      </li>
                      <li className="flex items-start gap-3 p-2 rounded-xl bg-amber-50/70 border border-amber-200">
                        <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-mono font-bold text-[11px] flex items-center justify-center shrink-0">
                          4
                        </span>
                        <span><strong>Frais d'inscription :</strong> <strong className="text-blue-950 font-mono font-bold">3 000 Gourdes</strong></span>
                      </li>
                      <li className="flex items-start gap-3 p-2 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="w-5 h-5 rounded-full bg-blue-900 text-white font-mono font-bold text-[11px] flex items-center justify-center shrink-0">
                          5
                        </span>
                        <span><strong>Pièces d'identité de la personne responsable</strong> (CIN / NIF)</span>
                      </li>
                    </ol>

                    {/* ENCADRÉ SPÉCIAL : PIÈCES ADDITIONNELLES EXIGIBLES (CONFORME PHOTO) */}
                    <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-blue-900/10 border-2 border-amber-400/80 shadow-xs space-y-2.5">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                        <h5 className="font-serif font-bold text-sm text-slate-950 uppercase tracking-wide">
                          N.B : Pièces additionnelles exigibles
                        </h5>
                      </div>
                      <p className="text-[11px] text-slate-600">
                        Obligatoires pour la conformité du dossier académique auprès du Ministère (MENFP) :
                      </p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-white border border-amber-200 text-slate-900 font-semibold shadow-2xs">
                          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Relevé de Notes NS2 et NS3</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-white border border-amber-200 text-slate-900 font-semibold shadow-2xs">
                          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Fiche 9ème A.F</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-white border border-amber-200 text-slate-900 font-semibold shadow-2xs">
                          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Attestation 9ème A.F</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-white border border-amber-200 text-slate-900 font-semibold shadow-2xs">
                          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>NISU et le code de l'école</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}

            </div>

            {/* 3. Bandeaux Officiels Conformes : Horaires & Présence Obligatoire de l'Enfant */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              
              {/* Horaire du Secrétariat */}
              <div className="p-4 sm:p-5 rounded-2xl bg-blue-900 text-white flex items-start gap-3.5 shadow-md">
                <span className="p-2.5 rounded-xl bg-white/10 text-amber-400 shrink-0">
                  <Clock className="w-5 h-5" />
                </span>
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-amber-300">
                    Permanence du Secrétariat
                  </span>
                  <h4 className="font-serif font-bold text-sm sm:text-base">
                    Horaire : du lundi au Vendredi de : 8h à 3h (15h)
                  </h4>
                  <p className="text-xs text-slate-200 font-light">
                    Accueil personnalisé des familles au campus principal, Delmas 50 no 2 bis.
                  </p>
                </div>
              </div>

              {/* Règle Solennelle Présence de l'Enfant */}
              <div className="p-4 sm:p-5 rounded-2xl bg-amber-400 text-slate-950 flex items-start gap-3.5 shadow-md">
                <span className="p-2.5 rounded-xl bg-slate-950 text-amber-400 shrink-0">
                  <UserCheck className="w-5 h-5" />
                </span>
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-slate-900">
                    Consigne Impérative d'Admission
                  </span>
                  <h4 className="font-serif font-extrabold text-sm sm:text-base">
                    L'enfant doit être présent lors de l'inscription
                  </h4>
                  <p className="text-xs text-slate-900/90 font-medium">
                    L'entretien pédagogique d'évaluation et de prise de contact nécessite impérativement la présence de l'élève.
                  </p>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* 3. Procédure étape par étape */}
      <section id="admission-procedure" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8 space-y-1.5">
          <div className="inline-block text-xs font-semibold uppercase tracking-wider text-blue-900">
            <ContentEditable
              contentKey="admissions.procedure.badge"
              defaultContent="Simplicité & Rigueur"
              as="span"
              currentUser={currentUser}
              multiline={false}
            />
          </div>
          <ContentEditable
            contentKey="admissions.procedure.title"
            defaultContent="La Procédure d'Admission en 4 Étapes"
            as="h2"
            className="font-serif text-2xl sm:text-3xl font-bold text-slate-900"
            currentUser={currentUser}
            multiline={false}
          />
          <ContentEditable
            contentKey="admissions.procedure.subtitle"
            defaultContent="Un processus clair et transparent pour accueillir au mieux votre enfant au Collège Isaac Newton."
            as="p"
            className="text-xs sm:text-sm text-slate-600"
            currentUser={currentUser}
            multiline={true}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-5 relative">
          {[
            {
              step: '01',
              title: 'Préinscription en ligne',
              desc: 'Remplissez le formulaire numérique sur ce site pour bloquer temporairement la place et obtenir votre code de dossier.',
            },
            {
              step: '02',
              title: 'Dépôt physique des pièces',
              desc: 'Présentez-vous avec l’enfant au secrétariat (Delmas 50) de 8h à 15h muni des 5 pièces requises et des 3 000 Gourdes.',
            },
            {
              step: '03',
              title: 'Entretien & Test diagnostique',
              desc: 'Entretien bienveillant avec la direction pédagogique et évaluation du niveau académique du candidat.',
            },
            {
              step: '04',
              title: 'Confirmation & Inscription',
              desc: 'Remise du livret d’accueil newtonien, confirmation définitive et remise de la fiche d\'immatriculation.',
            },
          ].map((item, idx) => (
            <div 
              key={idx} 
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs relative flex flex-col justify-between hover:border-blue-900/30 transition-colors"
            >
              <div>
                <span className="font-mono text-2xl font-bold text-blue-900/30 block mb-1.5">
                  {item.step}
                </span>
                <h3 className="font-serif font-bold text-sm sm:text-base text-slate-900 mb-1.5">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Foire aux Questions (FAQ) */}
      <section id="admission-faq" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-block text-xs font-semibold uppercase tracking-wider text-blue-900">
            <ContentEditable
              contentKey="admissions.faq.badge"
              defaultContent="Réponses & Éclaircissements"
              as="span"
              currentUser={currentUser}
              multiline={false}
            />
          </div>
          <ContentEditable
            contentKey="admissions.faq.title"
            defaultContent="Questions Fréquentes sur l'Admission"
            as="h2"
            className="font-serif text-2xl sm:text-3xl font-bold text-slate-900"
            currentUser={currentUser}
            multiline={false}
          />
          <ContentEditable
            contentKey="admissions.faq.subtitle"
            defaultContent="Retrouvez les réponses aux interrogations courantes des futurs parents."
            as="p"
            className="text-xs sm:text-sm text-slate-600"
            currentUser={currentUser}
            multiline={true}
          />
        </div>

        <div className="space-y-3 pt-4">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm transition-all"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full text-left p-5 flex items-center justify-between gap-4 font-serif font-bold text-sm sm:text-base text-slate-900 hover:text-blue-900 cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span>{faq.question}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${
                    isOpen ? 'rotate-180 text-blue-900' : ''
                  }`} />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* CTA Banner Final */}
        <div className="mt-10 p-8 rounded-3xl bg-blue-900 text-white text-center space-y-4 shadow-xl">
          <ContentEditable
            contentKey="admissions.cta.title"
            defaultContent="Prêt à inscrire votre enfant pour l'année 2026-2027 ?"
            as="h3"
            className="font-serif text-xl sm:text-2xl font-bold"
            currentUser={currentUser}
            multiline={false}
          />
          <ContentEditable
            contentKey="admissions.cta.subtitle"
            defaultContent="Remplissez la préinscription en quelques clics ou présentez-vous au campus Delmas 50 no 2 bis avec les pièces requises."
            as="p"
            className="text-xs sm:text-sm text-slate-200 max-w-lg mx-auto"
            currentUser={currentUser}
            multiline={true}
          />
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('contact')}
              className="px-5 py-2.5 rounded-xl bg-white text-blue-950 font-semibold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Secrétariat : +509 3721-1818
            </button>
            <button
              type="button"
              onClick={() => onNavigate('pre-registration')}
              className="px-5 py-2.5 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs hover:bg-amber-300 transition-colors cursor-pointer shadow-md"
            >
              Remplir la préinscription en ligne
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
