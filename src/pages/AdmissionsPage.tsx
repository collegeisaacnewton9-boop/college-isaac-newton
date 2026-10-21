import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  ArrowRight, 
  FileCheck, 
  ChevronDown, 
  FileText,
  Printer,
  Clock,
  AlertCircle,
  MapPin,
  Phone,
  DollarSign,
  GraduationCap,
  BookOpen,
  ShieldCheck,
  HelpCircle,
  Sparkles,
  Download,
  Calendar,
  Check,
  LayoutGrid,
  Info
} from 'lucide-react';
import { FAQS, SCHOOL_INFO, DEFAULT_ADMISSION_REQUIREMENTS } from '../data/mockData';
import { ContentEditable } from '../components/common/ContentEditable';
import { User, AdmissionRequirementsConfig } from '../types';
import { apiService } from '../services/api';

interface AdmissionsPageProps {
  onNavigate: (page: string, subSection?: string) => void;
  subSection?: string;
  currentUser?: User | null;
}

type AdmissionsTab = 'conditions' | 'procedure' | 'pourquoi' | 'faq' | 'all';

export const AdmissionsPage: React.FC<AdmissionsPageProps> = ({ onNavigate, subSection, currentUser }) => {
  const [activeTab, setActiveTab] = useState<AdmissionsTab>('conditions');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [requirements, setRequirements] = useState<AdmissionRequirementsConfig>(DEFAULT_ADMISSION_REQUIREMENTS);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  // Sync incoming subSection navigation prop from Header / Dropdown menu
  useEffect(() => {
    if (subSection === 'conditions' || subSection === 'procedure' || subSection === 'pourquoi' || subSection === 'faq' || subSection === 'all') {
      setActiveTab(subSection as AdmissionsTab);
    } else if (!subSection) {
      setActiveTab('conditions');
    }
  }, [subSection]);

  // Load dynamic settings from CMS if updated by admin
  useEffect(() => {
    let isMounted = true;
    apiService.getSettings().then(settings => {
      if (isMounted && settings?.admissionRequirements) {
        setRequirements(settings.admissionRequirements);
      }
    }).catch(err => {
      console.warn('[AdmissionsPage] Using default requirements:', err);
    });
    return () => { isMounted = false; };
  }, []);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const toggleCheck = (id: string) => {
    setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handlePrint = () => {
    window.print();
  };

  const tabsConfig = [
    { 
      id: 'conditions' as AdmissionsTab, 
      label: 'Conditions & Pièces à fournir', 
      badge: 'Fiche Officielle', 
      icon: FileText 
    },
    { 
      id: 'procedure' as AdmissionsTab, 
      label: 'Procédure & Frais de scolarité', 
      badge: '4 Étapes & Tarifs', 
      icon: ShieldCheck 
    },
    { 
      id: 'pourquoi' as AdmissionsTab, 
      label: 'Pourquoi choisir notre école', 
      badge: 'Atouts & Rigueur', 
      icon: CheckCircle2 
    },
    { 
      id: 'faq' as AdmissionsTab, 
      label: 'Questions fréquentes (FAQ)', 
      badge: 'Assistance', 
      icon: HelpCircle 
    },
    { 
      id: 'all' as AdmissionsTab, 
      label: 'Vue d’ensemble', 
      badge: 'Complet', 
      icon: LayoutGrid 
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-10 lg:space-y-12 py-5 sm:py-7 lg:py-8 font-sans">
      
      {/* 1. Header & Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl space-y-3.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-900 text-xs font-semibold uppercase tracking-wider shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <ContentEditable
              contentKey="admissions.hero.badge"
              defaultContent="Admissions Officielles · Année Académique 2026-2027"
              as="span"
              currentUser={currentUser}
              multiline={false}
            />
          </div>
          
          <ContentEditable
            contentKey="admissions.hero.title"
            defaultContent={`Inscriptions en cours · ${requirements.academicYear || SCHOOL_INFO.currentYear}`}
            as="h1"
            className="font-serif text-2xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight"
            currentUser={currentUser}
            multiline={false}
          />
          
          <ContentEditable
            contentKey="admissions.hero.subtitle"
            defaultContent="Retrouvez ci-dessous la liste officielle des pièces exigibles, les conditions d'admission par cycle (Préscolaire, Fondamental, Secondaire), les frais d'inscription et les horaires de réception des familles au secrétariat du Collège Isaac Newton (Delmas 50)."
            as="p"
            className="text-sm sm:text-base text-slate-600 leading-relaxed font-light max-w-3xl"
            currentUser={currentUser}
            multiline={true}
          />

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('pre-registration')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-semibold text-xs sm:text-sm shadow-md transition-all active:scale-98 cursor-pointer"
            >
              <FileCheck className="w-4 h-4 text-amber-400" />
              <span>Accéder au formulaire de préinscription en ligne</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 font-medium text-xs sm:text-sm border border-slate-300 shadow-2xs transition-all cursor-pointer"
              title="Imprimer ou enregistrer en PDF la fiche officielle des pièces à fournir"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>Imprimer la Fiche Officielle</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. Interactive Navigation Tabs (Synchronized with SubMenus) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200">
          {tabsConfig.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer ${
                  isSelected 
                    ? 'bg-blue-900 text-white shadow-sm font-semibold' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-amber-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                  isSelected ? 'bg-blue-800 text-amber-300' : 'bg-slate-200/80 text-slate-600'
                }`}>
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          SECTION 1 : CONDITIONS & PIÈCES À FOURNIR (DOCUMENT OFFICIEL D'INSCRIPTION)
          Fidèle à la fiche originale transmise par le Collège Isaac Newton (Delmas 50)
         ========================================================================= */}
      {(activeTab === 'conditions' || activeTab === 'all') && (
        <section id="conditions" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          
          {/* Institutional Document Container (Styled for screen & print) */}
          <div className="bg-white rounded-3xl border-2 border-blue-900/15 shadow-md overflow-hidden print:border-none print:shadow-none">
            
            {/* Header Banner - Institutional Letterhead */}
            <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white p-6 sm:p-8 border-b-4 border-amber-400">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400 text-xs font-bold tracking-widest uppercase font-mono">
                      Fiche Officielle d'Admission
                    </span>
                    <span className="text-slate-300 text-xs font-mono">·</span>
                    <span className="text-slate-200 text-xs font-medium">
                      Année Académique {requirements.academicYear || '2026-2027'}
                    </span>
                  </div>
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white uppercase">
                    Collège Isaac Newton
                  </h2>
                  <p className="text-amber-300 text-xs sm:text-sm font-medium italic">
                    « {SCHOOL_INFO.founderMotto} »
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-3.5 border border-white/15 text-xs space-y-1.5 shrink-0 max-w-sm">
                  <div className="flex items-center gap-2 text-slate-200">
                    <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Delmas 50 no 2 bis, Port-au-Prince, Haïti</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-200">
                    <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="font-mono font-medium">Téls : 3721-1818 / 3316-0934</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-200">
                    <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Horaire d'inscription : Du lundi au vendredi de 8h à 3h (15h)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Crucial Imperative Rules Banner */}
            <div className="bg-amber-500/10 border-b border-amber-200/80 px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm">
                
                {/* Rule 1: Presence */}
                <div className="flex items-start gap-3 bg-white p-3 rounded-xl border border-amber-200 shadow-2xs">
                  <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold shrink-0">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider text-amber-900">
                      Règle Impérative
                    </h4>
                    <p className="font-semibold text-slate-800 text-xs sm:text-sm mt-0.5">
                      L'enfant doit obligatoirement être présent lors de l'inscription.
                    </p>
                  </div>
                </div>

                {/* Rule 2: Registration Fee */}
                <div className="flex items-start gap-3 bg-white p-3 rounded-xl border border-blue-200 shadow-2xs">
                  <div className="w-8 h-8 rounded-lg bg-blue-900 text-amber-400 flex items-center justify-center font-bold shrink-0">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-blue-950 uppercase text-[11px] tracking-wider">
                      Frais d'inscription
                    </h4>
                    <p className="font-bold text-blue-900 text-xs sm:text-sm mt-0.5">
                      {requirements.registrationFee || '3 000 gourdes'} (3 000 gdes)
                    </p>
                    <span className="text-[10px] text-slate-500">Règlement au secrétariat avec reçu officiel</span>
                  </div>
                </div>

                {/* Rule 3: Levels open */}
                <div className="flex items-start gap-3 bg-white p-3 rounded-xl border border-emerald-200 shadow-2xs">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-emerald-950 uppercase text-[11px] tracking-wider">
                      Inscriptions en cours : Niveaux
                    </h4>
                    <p className="text-slate-800 text-xs font-medium mt-0.5">
                      Préscolaire · Fondamental (1er, 2e, 3e Cycles) · Secondaire
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* Document Core Content : Section Fondamentale vs Section Secondaire */}
            <div className="p-6 sm:p-8 space-y-8">
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                
                {/* 1. SECTION FONDAMENTALE */}
                <div className="bg-slate-50/70 rounded-2xl p-5 sm:p-6 border border-slate-200 space-y-4 relative flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-blue-900" />
                        <h3 className="font-serif text-lg sm:text-xl font-bold text-slate-900">
                          Section Fondamentale
                        </h3>
                      </div>
                      <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-200">
                        1er, 2e & 3e Cycles
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 font-medium">
                      Pièces requises pour l'admission au cycle fondamental (de la 1ère à la 9ème Année Fondamentale) :
                    </p>

                    <div className="space-y-2.5 pt-1">
                      {[
                        { id: 'f-1', num: '1', label: 'Acte de naissance ou extrait des archives', detail: 'Original et copie conforme' },
                        { id: 'f-2', num: '2', label: 'Carnet scolaire du dernier établissement', detail: 'Original avec attestations des notes' },
                        { id: 'f-3', num: '3', label: 'Deux (2) Photos d\'identité', detail: 'Format récent, tenue correcte' },
                        { id: 'f-4', num: '4', label: 'Frais d\'inscription : 3 000 gdes', detail: '3 000 gourdes payables au secrétariat' },
                        { id: 'f-5', num: '5', label: 'Pièces d\'identité de la personne responsable', detail: 'CIN (Carte d\'Identification Nationale) ou NIF' },
                      ].map((doc) => {
                        const isDone = !!checkedItems[doc.id];
                        return (
                          <div 
                            key={doc.id}
                            onClick={() => toggleCheck(doc.id)}
                            className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                              isDone ? 'bg-emerald-50/70 border-emerald-300' : 'bg-white border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <span className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${
                              isDone ? 'bg-emerald-600 text-white' : 'bg-blue-900/10 text-blue-950'
                            }`}>
                              {isDone ? <Check className="w-3.5 h-3.5" /> : doc.num}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs sm:text-sm font-semibold ${isDone ? 'text-emerald-950 line-through' : 'text-slate-900'}`}>
                                {doc.label}
                              </p>
                              <p className="text-[11px] text-slate-500">
                                {doc.detail}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200/80 text-[11px] text-slate-500 flex items-center justify-between">
                    <span>Cochez les pièces prêtes pour votre dossier</span>
                    <span className="font-mono text-blue-900 font-bold">5 pièces obligatoires</span>
                  </div>
                </div>

                {/* 2. SECTION SECONDAIRE */}
                <div className="bg-slate-50/70 rounded-2xl p-5 sm:p-6 border border-slate-200 space-y-4 relative flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-indigo-900" />
                        <h3 className="font-serif text-lg sm:text-xl font-bold text-slate-900">
                          Section Secondaire
                        </h3>
                      </div>
                      <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-900 border border-indigo-200">
                        Nouveau Secondaire 1 à 4
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 font-medium">
                      Pièces requises pour l'admission au Nouveau Secondaire (NS1, NS2, NS3, NS4) :
                    </p>

                    <div className="space-y-2.5 pt-1">
                      {[
                        { id: 's-1', num: '1', label: 'Acte de naissance ou extrait des archives', detail: 'Original et copie' },
                        { id: 's-2', num: '2', label: 'Carnet scolaire du dernier établissement', detail: 'Original complet' },
                        { id: 's-3', num: '3', label: 'Deux (2) Photos d\'identité', detail: 'Date récente' },
                        { id: 's-4', num: '4', label: 'Frais d\'inscription : 3 000 gdes', detail: '3 000 gourdes au secrétariat' },
                        { id: 's-5', num: '5', label: 'Pièces d\'identité de la personne responsable', detail: 'CIN ou NIF du parent/tuteur' },
                      ].map((doc) => {
                        const isDone = !!checkedItems[doc.id];
                        return (
                          <div 
                            key={doc.id}
                            onClick={() => toggleCheck(doc.id)}
                            className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                              isDone ? 'bg-emerald-50/70 border-emerald-300' : 'bg-white border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <span className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${
                              isDone ? 'bg-emerald-600 text-white' : 'bg-indigo-900/10 text-indigo-950'
                            }`}>
                              {isDone ? <Check className="w-3.5 h-3.5" /> : doc.num}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs sm:text-sm font-semibold ${isDone ? 'text-emerald-950 line-through' : 'text-slate-900'}`}>
                                {doc.label}
                              </p>
                              <p className="text-[11px] text-slate-500">
                                {doc.detail}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* ENCADRÉ N.B. : PIÈCES ADDITIONNELLES EXIGIBLES (SECONDAIRE) */}
                    <div className="mt-4 p-4 rounded-xl bg-amber-50 border-2 border-amber-300/80 space-y-2">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                        <h4 className="text-xs sm:text-sm font-bold text-amber-950 uppercase tracking-wide">
                          N.B. : Pièces additionnelles exigibles
                        </h4>
                      </div>
                      <p className="text-[11px] text-amber-900 leading-relaxed">
                        Conformément aux normes du MENFP pour les classes du Nouveau Secondaire, les pièces officielles suivantes sont obligatoires :
                      </p>
                      <ul className="space-y-1.5 text-xs text-slate-800 font-medium pt-1">
                        {[
                          { id: 'nb-1', label: 'Relevé de Notes NS2 et NS3 (classes supérieures)' },
                          { id: 'nb-2', label: 'Fiche 9ème A.F.' },
                          { id: 'nb-3', label: 'Attestation 9ème A.F. (réussite officielle aux examens d’État)' },
                          { id: 'nb-4', label: 'NISU (Numéro d’Identification Scolaire Unique) et le code de l’école d’origine' },
                        ].map((item) => (
                          <li key={item.id} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0 mt-1.5"></span>
                            <span>{item.label}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                  </div>

                  <div className="pt-3 border-t border-slate-200/80 text-[11px] text-slate-500 flex items-center justify-between">
                    <span>Cycle secondaire rigoureux & scientifique</span>
                    <span className="font-mono text-indigo-900 font-bold">Dossier académique complet</span>
                  </div>
                </div>

              </div>

              {/* Bottom Institutional Sign-off & Notice */}
              <div className="p-4 sm:p-5 rounded-2xl bg-blue-50 border border-blue-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-950">
                    <Info className="w-4 h-4 text-blue-900 shrink-0" />
                    <span>Accueil des familles & Dépôt des dossiers à Delmas 50</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Les inscriptions se font physiquement au secrétariat : <strong>du lundi au vendredi, de 8h à 15h (8h à 3h)</strong>. Rappel : la présence de l'enfant est requise.
                  </p>
                </div>
                
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onNavigate('pre-registration')}
                    className="px-4 py-2 rounded-xl bg-blue-900 text-white font-semibold text-xs hover:bg-blue-950 transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Préinscription en ligne</span>
                    <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                  </button>
                  <button
                    onClick={handlePrint}
                    className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 font-medium text-xs hover:bg-slate-50 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Imprimer</span>
                  </button>
                </div>
              </div>

            </div>
          </div>

        </section>
      )}

      {/* =========================================================================
          SECTION 2 : PROCÉDURE & FRAIS DE SCOLARITÉ
         ========================================================================= */}
      {(activeTab === 'procedure' || activeTab === 'all') && (
        <section id="procedure" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="text-center max-w-2xl mx-auto space-y-1.5">
            <div className="inline-block text-xs font-semibold uppercase tracking-wider text-blue-900">
              <ContentEditable
                contentKey="admissions.procedure.badge"
                defaultContent="Simplicité, Rigueur & Transparence"
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
              defaultContent="Un accompagnement clair et structuré pour accueillir votre enfant au sein de notre établissement."
              as="p"
              className="text-xs sm:text-sm text-slate-600"
              currentUser={currentUser}
              multiline={true}
            />
          </div>

          {/* 4 Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-5">
            {[
              {
                step: '01',
                title: 'Préinscription en ligne',
                badge: 'Numérique',
                desc: 'Remplissez le formulaire en ligne sur ce portail pour réserver une place et obtenir votre numéro officiel de candidature.',
                actionText: 'Remplir le formulaire',
                actionPage: 'pre-registration'
              },
              {
                step: '02',
                title: 'Dépôt des pièces & Frais',
                badge: 'Présentiel',
                desc: 'Dépôt du dossier physique au secrétariat (Delmas 50) avec l’enfant présent. Règlement des frais d\'inscription de 3 000 gdes.',
                actionText: 'Voir la liste des pièces',
                actionPage: 'admissions',
                actionSubSection: 'conditions'
              },
              {
                step: '03',
                title: 'Test d’aptitude & Entretien',
                badge: 'Pédagogique',
                desc: 'Passation d’un test diagnostique bienveillant (Mathématiques & Français) et rencontre d’orientation avec la direction pédagogique.',
              },
              {
                step: '04',
                title: 'Confirmation & Inscription',
                badge: 'Validation',
                desc: 'Officialisation de l’inscription, remise de l\'uniforme réglementaire, du livret d’accueil et intégration de la classe.',
              },
            ].map((item, idx) => (
              <div 
                key={idx} 
                className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs relative flex flex-col justify-between hover:border-blue-900/30 transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-2xl font-bold text-blue-900/40 group-hover:text-blue-900 transition-colors">
                      {item.step}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {item.badge}
                    </span>
                  </div>
                  <h3 className="font-serif font-bold text-sm sm:text-base text-slate-900 mb-1.5">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                {item.actionText && (
                  <div className="pt-3 mt-3 border-t border-slate-100">
                    <button
                      onClick={() => onNavigate(item.actionPage!, item.actionSubSection)}
                      className="text-xs font-semibold text-blue-900 hover:text-blue-950 flex items-center gap-1 cursor-pointer"
                    >
                      <span>{item.actionText}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Tarification & Échéancier Transparent */}
          <div className="bg-slate-50 rounded-3xl p-6 sm:p-8 border border-slate-200 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-900">
                  Transparence Financière
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
                  Frais d'Inscription & Échéancier de Scolarité
                </h3>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-100 text-amber-950 border border-amber-300 font-medium text-xs">
                <DollarSign className="w-4 h-4 text-amber-800" />
                <span>Frais d'inscription uniques : <strong>3 000 Gourdes</strong></span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-2">
                <h4 className="font-serif font-bold text-sm text-slate-900">
                  1. Frais d'ouverture de dossier
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Fixés à <strong>3 000 gourdes</strong> pour l'ensemble des sections (Préscolaire, Fondamentale et Secondaire). Ils couvrent la constitution du dossier, le test d'aptitude et l'enregistrement officiel.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-2">
                <h4 className="font-serif font-bold text-sm text-slate-900">
                  2. Modalités d'échelonnement
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Pour alléger l'effort des familles, les frais de scolarité annuels sont répartis en versements périodiques (trimestriels) selon un échéancier clair communiqué lors de l'admission définitive.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-2">
                <h4 className="font-serif font-bold text-sm text-slate-900">
                  3. Modes de paiement sécurisés
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Règlement direct à la caisse du secrétariat contre quittance numérotée et sécurisée, ou par virement bancaire autorisé. Aucun intermédiaire non mandaté.
                </p>
              </div>
            </div>
          </div>

        </section>
      )}

      {/* =========================================================================
          SECTION 3 : POURQUOI CHOISIR NOTRE ÉCOLE
         ========================================================================= */}
      {(activeTab === 'pourquoi' || activeTab === 'all') && (
        <section id="pourquoi" className="bg-slate-100/70 py-8 sm:py-10 border-y border-slate-200/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <div className="inline-block text-xs font-semibold uppercase tracking-wider text-blue-900">
                <ContentEditable
                  contentKey="admissions.pourquoi.badge"
                  defaultContent="Excellence & Réussite"
                  as="span"
                  currentUser={currentUser}
                  multiline={false}
                />
              </div>
              <ContentEditable
                contentKey="admissions.pourquoi.title"
                defaultContent="Pourquoi Choisir le Collège Isaac Newton ?"
                as="h2"
                className="font-serif text-2xl sm:text-3xl font-bold text-slate-900"
                currentUser={currentUser}
                multiline={false}
              />
              <ContentEditable
                contentKey="admissions.pourquoi.subtitle"
                defaultContent="Un cadre rigoureux où chaque élève est guidé pour développer son plein potentiel intellectuel, humain et civique."
                as="p"
                className="text-xs sm:text-sm text-slate-600"
                currentUser={currentUser}
                multiline={true}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-900 text-amber-400 flex items-center justify-center font-bold">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-base text-slate-900">
                  Rigueur Scientifique & Mathématique
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Fondé par le professeur Orphe Jean Marie, notre programme met un accent particulier sur la rigueur logique, les sciences physiques et les mathématiques pour forger des esprits d'excellence.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-900 text-amber-400 flex items-center justify-center font-bold">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-base text-slate-900">
                  Laboratoire Informatique & Technologie
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Dès le cycle fondamental, nos élèves bénéficient d'ateliers numériques pratiques sur ordinateurs individuels pour acquérir les compétences technologiques indispensables du 21e siècle.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-base text-slate-900">
                  Discipline Civique & Suivi Personnalisé
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Un encadrement bienveillant et ferme, le respect des valeurs républicaines, et des effectifs maîtrisés favorisant une relation de proximité avec chaque famille.
                </p>
              </div>

            </div>

          </div>
        </section>
      )}

      {/* =========================================================================
          SECTION 4 : QUESTIONS FRÉQUENTES (FAQ)
         ========================================================================= */}
      {(activeTab === 'faq' || activeTab === 'all') && (
        <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
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
              defaultContent="Questions Fréquentes sur les Inscriptions"
              as="h2"
              className="font-serif text-2xl sm:text-3xl font-bold text-slate-900"
              currentUser={currentUser}
              multiline={false}
            />
            <ContentEditable
              contentKey="admissions.faq.subtitle"
              defaultContent="Retrouvez toutes les précisions sur les pièces justificatives, les frais et la vie scolaire."
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

          {/* Institutional Contact CTA */}
          <div className="mt-10 p-8 rounded-3xl bg-blue-900 text-white text-center space-y-4 shadow-xl">
            <ContentEditable
              contentKey="admissions.cta.title"
              defaultContent="Vous souhaitez inscrire votre enfant pour 2026-2027 ?"
              as="h3"
              className="font-serif text-xl sm:text-2xl font-bold"
              currentUser={currentUser}
              multiline={false}
            />
            <ContentEditable
              contentKey="admissions.cta.subtitle"
              defaultContent="Notre secrétariat d'admission à Delmas 50 no 2 bis vous accueille du lundi au vendredi de 8h à 15h. Notre équipe est à votre entière disposition."
              as="p"
              className="text-xs sm:text-sm text-slate-200 max-w-lg mx-auto"
              currentUser={currentUser}
              multiline={true}
            />
            <div className="pt-2 flex flex-wrap justify-center gap-3">
              <a
                href="tel:+50937211818"
                className="px-5 py-2.5 rounded-xl bg-white text-blue-950 font-semibold text-xs hover:bg-slate-100 transition-colors inline-flex items-center gap-2 shadow-sm"
              >
                <Phone className="w-3.5 h-3.5 text-blue-900" />
                <span>Appeler : 3721-1818 / 3316-0934</span>
              </a>
              <button
                onClick={() => onNavigate('pre-registration')}
                className="px-5 py-2.5 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs hover:bg-amber-300 transition-colors shadow-sm cursor-pointer inline-flex items-center gap-2"
              >
                <FileCheck className="w-4 h-4" />
                <span>Remplir la préinscription en ligne</span>
              </button>
            </div>
          </div>
        </section>
      )}

    </div>
  );
};
