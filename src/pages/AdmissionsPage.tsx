import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  ArrowRight, 
  FileCheck, 
  ChevronDown, 
  Clock, 
  Phone, 
  MapPin, 
  Printer, 
  ShieldCheck, 
  GraduationCap, 
  BookOpen, 
  UserCheck, 
  Check,
  Calendar,
  Sparkles,
  MessageCircle,
  HelpCircle,
  FileSpreadsheet
} from 'lucide-react';
import { FAQS, SCHOOL_INFO } from '../data/mockData';
import { ContentEditable } from '../components/common/ContentEditable';
import { User, AdmissionRequirementsConfig } from '../types';
import { apiService } from '../services/api';
import { getCurrentAcademicYear } from '../utils/academicYear';

interface AdmissionsPageProps {
  onNavigate: (page: string, subSection?: string) => void;
  subSection?: string;
  currentUser?: User | null;
}

const DEFAULT_OFFICIAL_REQUIREMENTS: AdmissionRequirementsConfig = {
  academicYear: getCurrentAcademicYear(),
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
  updatedAt: new Date().toISOString()
};

export const AdmissionsPage: React.FC<AdmissionsPageProps> = ({ 
  onNavigate, 
  subSection, 
  currentUser 
}) => {
  const dynamicYear = getCurrentAcademicYear();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [requirements, setRequirements] = useState<AdmissionRequirementsConfig>(DEFAULT_OFFICIAL_REQUIREMENTS);
  const [activeTab, setActiveTab] = useState<'all' | 'fondamentale' | 'secondaire'>('all');

  const academicYear = requirements.academicYear || dynamicYear;
  const phone1 = SCHOOL_INFO.phone1 || '+509 3316-0934';
  const phone2 = SCHOOL_INFO.phone2 || '+509 3721-1818';

  useEffect(() => {
    apiService.getSettings().then(settings => {
      if (settings?.admissionRequirements) {
        setRequirements({
          ...settings.admissionRequirements,
          academicYear: settings.admissionRequirements.academicYear || dynamicYear
        });
      }
    }).catch(() => {});

    const handleSettingsUpdate = (e: any) => {
      if (e.detail?.admissionRequirements) {
        setRequirements({
          ...e.detail.admissionRequirements,
          academicYear: e.detail.admissionRequirements.academicYear || dynamicYear
        });
      }
    };
    window.addEventListener('cin:settings-updated', handleSettingsUpdate);
    return () => window.removeEventListener('cin:settings-updated', handleSettingsUpdate);
  }, [dynamicYear]);

  // Défilement fluide vers la section ciblée
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
    <div className="space-y-4 sm:space-y-5 lg:space-y-6 py-2.5 sm:py-3.5 lg:py-4 font-sans text-slate-900 max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">
      
      {/* 1. Header Moderne, Fluide & Compact avec Sélecteur Rapide */}
      <section className="bg-gradient-to-br from-blue-950 via-slate-900 to-blue-900 text-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 lg:p-6 shadow-md border border-slate-800 relative overflow-hidden">
        {/* Glow décoratif discret */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-2 max-w-3xl">
            {/* Badge dynamique d'année académique */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-amber-300 bg-amber-400/15 px-3 py-1 rounded-full border border-amber-400/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
                <span>Session Académique {academicYear}</span>
              </span>
              <span className="text-[11px] sm:text-xs text-slate-300 font-medium bg-white/10 px-2.5 py-0.5 rounded-full border border-white/15">
                Inscriptions Ouvertes
              </span>
            </div>

            {/* Titre & Sous-titre */}
            <h1 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight">
              Admissions & Inscriptions {academicYear}
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-light max-w-2xl">
              Dossier administratif officiel, pièces requises pour la <strong>Section Fondamentale</strong> et la <strong>Section Secondaire</strong>, procédure en 4 étapes et préinscription en ligne.
            </p>

            {/* Contacts rapides du secrétariat */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-300 pt-0.5">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Delmas 50, rue Dominique #2 bis</span>
              </span>
              <span className="hidden sm:inline text-slate-500">·</span>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Secrétariat :</span>
                <a href={`tel:${phone1.replace(/[^0-9+]/g, '')}`} className="font-mono font-bold text-amber-300 hover:underline">
                  {phone1}
                </a>
                <span className="text-slate-400">/</span>
                <a href={`tel:${phone2.replace(/[^0-9+]/g, '')}`} className="font-mono font-bold text-amber-300 hover:underline">
                  {phone2}
                </a>
              </div>
            </div>
          </div>

          {/* Boutons d'Action Principaux */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2 w-full lg:w-auto shrink-0 pt-2 lg:pt-0">
            <button
              type="button"
              onClick={() => onNavigate('pre-registration')}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all active:scale-98 cursor-pointer"
            >
              <FileCheck className="w-4 h-4 text-slate-950" />
              <span>Préinscription en Ligne {academicYear}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs sm:text-sm border border-white/20 transition-colors cursor-pointer"
              title="Imprimer ou enregistrer en PDF la fiche des pièces exigibles"
            >
              <Printer className="w-3.5 h-3.5 text-amber-300" />
              <span>Imprimer la Fiche des Pièces</span>
            </button>
          </div>
        </div>

        {/* Barre de navigation rapide en bas du Hero */}
        <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Réception des dossiers : <strong>Lundi au Vendredi de 8h00 à 15h00</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="#official-requirements"
              className="text-slate-200 hover:text-amber-300 transition-colors underline-offset-4 hover:underline"
            >
              Pièces requises
            </a>
            <span className="text-slate-500">·</span>
            <a
              href="#admission-procedure"
              className="text-slate-200 hover:text-amber-300 transition-colors underline-offset-4 hover:underline"
            >
              Procédure
            </a>
            <span className="text-slate-500">·</span>
            <a
              href="#admission-faq"
              className="text-slate-200 hover:text-amber-300 transition-colors underline-offset-4 hover:underline"
            >
              FAQ
            </a>
          </div>
        </div>
      </section>

      {/* 2. LE DOSSIER OFFICIEL D'INSCRIPTION & PIÈCES EXIGIBLES */}
      <section id="official-requirements" className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Bandeau d'en-tête du document officiel */}
        <div className="bg-slate-900 text-white px-4 sm:px-6 py-3.5 sm:py-4 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
              CIN
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-bold text-[10px] uppercase tracking-wider border border-amber-400/30">
                  Document Officiel
                </span>
                <span className="text-xs text-slate-300 font-mono font-medium">
                  Réf : Année Académique {academicYear}
                </span>
              </div>
              <h2 className="font-serif text-base sm:text-lg font-bold text-white uppercase tracking-tight">
                Dossier d'Admission & Pièces à Fournir
              </h2>
            </div>
          </div>

          {/* Filtres par Niveau (Segmented Control fluide) */}
          <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700/80 text-xs font-semibold self-start md:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-amber-400 text-slate-950 shadow-xs font-bold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Tous les Niveaux
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('fondamentale')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                activeTab === 'fondamentale'
                  ? 'bg-amber-400 text-slate-950 shadow-xs font-bold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Fondamentale
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('secondaire')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                activeTab === 'secondaire'
                  ? 'bg-amber-400 text-slate-950 shadow-xs font-bold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Secondaire
            </button>
          </div>
        </div>

        {/* Corps des documents : Grille 2 colonnes dense et ergonomique */}
        <div className="p-3.5 sm:p-5 lg:p-6 space-y-4 sm:space-y-5 bg-slate-50/40">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 sm:gap-4 items-stretch">
            
            {/* SECTION FONDAMENTALE */}
            {(activeTab === 'all' || activeTab === 'fondamentale') && (
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-3.5 flex flex-col justify-between hover:border-blue-900/40 transition-colors">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="p-2 rounded-xl bg-blue-50 text-blue-900 font-bold shrink-0">
                        <BookOpen className="w-4 h-4 text-blue-900" />
                      </span>
                      <div>
                        <span className="text-[10px] font-mono font-bold text-blue-900 uppercase tracking-wider block">
                          1er Cycle · 2ème Cycle · 3ème Cycle
                        </span>
                        <h3 className="font-serif text-base sm:text-lg font-bold text-slate-900 leading-tight">
                          Section Fondamentale & Préscolaire
                        </h3>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold shrink-0">
                      5 Pièces requises
                    </span>
                  </div>

                  <ol className="space-y-2 text-xs sm:text-sm text-slate-800">
                    <li className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50/80 border border-slate-100">
                      <span className="w-5 h-5 rounded-full bg-blue-900 text-white font-mono font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                        1
                      </span>
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-900">
                          Acte de naissance ou extrait des archives
                        </span>
                        <p className="text-[11px] text-slate-500 leading-tight">
                          Présenter l'<strong>Original et une copie</strong> nette et lisible.
                        </p>
                      </div>
                    </li>

                    <li className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50/80 border border-slate-100">
                      <span className="w-5 h-5 rounded-full bg-blue-900 text-white font-mono font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                        2
                      </span>
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-900">
                          Carnet scolaire du dernier établissement
                        </span>
                        <p className="text-[11px] text-slate-500 leading-tight">
                          Document <strong>Original</strong> attestant des résultats et de la décision de passage.
                        </p>
                      </div>
                    </li>

                    <li className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50/80 border border-slate-100">
                      <span className="w-5 h-5 rounded-full bg-blue-900 text-white font-mono font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                        3
                      </span>
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-900">
                          Deux (2) Photos d'identité
                        </span>
                        <p className="text-[11px] text-slate-500 leading-tight">
                          Photos de <strong>date récente</strong> en tenue soignée.
                        </p>
                      </div>
                    </li>

                    <li className="flex items-start gap-2.5 p-2 rounded-xl bg-amber-50 border border-amber-200">
                      <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-mono font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                        4
                      </span>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-amber-950">
                            Frais d'inscription :
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-mono font-extrabold text-xs">
                            3 000 Gourdes
                          </span>
                        </div>
                        <p className="text-[11px] text-amber-900 leading-tight">
                          Règlement effectué au secrétariat lors du dépôt physique.
                        </p>
                      </div>
                    </li>

                    <li className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50/80 border border-slate-100">
                      <span className="w-5 h-5 rounded-full bg-blue-900 text-white font-mono font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                        5
                      </span>
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-900">
                          Pièce d'identité de la personne responsable
                        </span>
                        <p className="text-[11px] text-slate-500 leading-tight">
                          Carte d'Identification Nationale (<strong>CIN</strong>) ou <strong>NIF</strong> du parent ou tuteur légal.
                        </p>
                      </div>
                    </li>
                  </ol>
                </div>

                <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                  <span>Cycles : Préscolaire, 1er, 2e et 3e Cycle</span>
                  <span className="font-medium text-blue-900">Admissions {academicYear}</span>
                </div>
              </div>
            )}

            {/* SECTION SECONDAIRE */}
            {(activeTab === 'all' || activeTab === 'secondaire') && (
              <div className="bg-white rounded-2xl p-4 sm:p-5 border-2 border-blue-900/30 shadow-2xs space-y-3 flex flex-col justify-between hover:border-blue-900 transition-colors">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="p-2 rounded-xl bg-blue-900 text-amber-400 font-bold shrink-0">
                        <GraduationCap className="w-4 h-4 text-amber-400" />
                      </span>
                      <div>
                        <span className="text-[10px] font-mono font-bold text-blue-900 uppercase tracking-wider block">
                          Nouveau Secondaire · NS1 à NS4
                        </span>
                        <h3 className="font-serif text-base sm:text-lg font-bold text-slate-900 leading-tight">
                          Section Secondaire
                        </h3>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-900 border border-blue-200 text-[11px] font-bold shrink-0">
                      Secondaire Général
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Pièces requises de base :
                    </div>
                    
                    <ol className="space-y-1.5 text-xs sm:text-sm text-slate-800">
                      <li className="flex items-start gap-2.5 p-1.5 rounded-lg bg-slate-50/80 border border-slate-100">
                        <span className="w-4 h-4 rounded-full bg-blue-900 text-white font-mono font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                          1
                        </span>
                        <span><strong>Acte de naissance ou extrait des archives</strong> (Original et copie)</span>
                      </li>
                      <li className="flex items-start gap-2.5 p-1.5 rounded-lg bg-slate-50/80 border border-slate-100">
                        <span className="w-4 h-4 rounded-full bg-blue-900 text-white font-mono font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                          2
                        </span>
                        <span><strong>Carnet scolaire du dernier établissement</strong> (Original)</span>
                      </li>
                      <li className="flex items-start gap-2.5 p-1.5 rounded-lg bg-slate-50/80 border border-slate-100">
                        <span className="w-4 h-4 rounded-full bg-blue-900 text-white font-mono font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                          3
                        </span>
                        <span><strong>Deux (2) Photos d'identité</strong> (date récente)</span>
                      </li>
                      <li className="flex items-start gap-2.5 p-1.5 rounded-lg bg-amber-50 border border-amber-200">
                        <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 font-mono font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                          4
                        </span>
                        <span><strong>Frais d'inscription :</strong> <strong className="text-amber-950 font-mono font-bold">3 000 Gourdes</strong></span>
                      </li>
                      <li className="flex items-start gap-2.5 p-1.5 rounded-lg bg-slate-50/80 border border-slate-100">
                        <span className="w-4 h-4 rounded-full bg-blue-900 text-white font-mono font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                          5
                        </span>
                        <span><strong>Pièces d'identité de la personne responsable</strong> (CIN / NIF)</span>
                      </li>
                    </ol>

                    {/* ENCADRÉ COMPACT : PIÈCES ADDITIONNELLES EXIGIBLES */}
                    <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-300 shadow-2xs space-y-2">
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
                        <h4 className="font-serif font-bold text-xs text-slate-950 uppercase tracking-wide">
                          N.B : Pièces additionnelles exigibles (Secondaire)
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-600">
                        Obligatoires pour la conformité académique de l'élève au Nouveau Secondaire :
                      </p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                        <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-white border border-amber-200/90 text-slate-900 font-semibold text-[11px]">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Relevé de Notes NS2 et NS3</span>
                        </div>
                        <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-white border border-amber-200/90 text-slate-900 font-semibold text-[11px]">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Fiche 9ème A.F</span>
                        </div>
                        <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-white border border-amber-200/90 text-slate-900 font-semibold text-[11px]">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Attestation 9ème A.F</span>
                        </div>
                        <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-white border border-amber-200/90 text-slate-900 font-semibold text-[11px]">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>NISU et le code de l'école</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                  <span>Secondaire : NS1, NS2, NS3, NS4</span>
                  <span className="font-medium text-blue-900">Classes Terminales & Pré-universitaires</span>
                </div>
              </div>
            )}

          </div>

          {/* Bandeaux d'information complémentaires (Horaires + Présence de l'enfant) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            
            {/* Horaire du Secrétariat */}
            <div className="p-3.5 rounded-xl bg-blue-950 text-white flex items-center gap-3 border border-slate-800 shadow-2xs">
              <span className="p-2 rounded-lg bg-white/10 text-amber-300 shrink-0">
                <Clock className="w-4 h-4" />
              </span>
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-amber-300 block">
                  Permanence Secrétariat
                </span>
                <div className="font-serif font-bold text-xs sm:text-sm">
                  Lundi au Vendredi : 8h00 à 15h00 (8h à 3h)
                </div>
                <p className="text-[11px] text-slate-300 font-light">
                  Campus principal : Delmas 50, rue Dominique #2 bis
                </p>
              </div>
            </div>

            {/* Règle Solennelle Présence de l'Enfant */}
            <div className="p-3.5 rounded-xl bg-amber-400 text-slate-950 flex items-center gap-3 shadow-2xs border border-amber-500/40">
              <span className="p-2 rounded-lg bg-slate-950 text-amber-400 shrink-0">
                <UserCheck className="w-4 h-4" />
              </span>
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-slate-900 block">
                  Consigne Pédagogique
                </span>
                <div className="font-serif font-extrabold text-xs sm:text-sm">
                  L'enfant doit être présent lors de l'inscription
                </div>
                <p className="text-[11px] text-slate-900/90 font-medium">
                  Prise de contact et entretien personnalisé indispensables.
                </p>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 3. LA PROCÉDURE D'ADMISSION EN 4 ÉTAPES (Agencement compact & fluide) */}
      <section id="admission-procedure" className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 lg:p-6 border border-slate-200/90 shadow-2xs space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-900">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Processus d'Admission {academicYear}</span>
            </div>
            <h2 className="font-serif text-lg sm:text-xl font-bold text-slate-900 mt-0.5">
              La Procédure en 4 Étapes Simples
            </h2>
          </div>
          <p className="text-xs text-slate-500 font-light max-w-sm">
            Un cheminement transparent conçu pour faciliter l'intégration de chaque nouvel élève newtonien.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              step: '01',
              title: 'Préinscription en ligne',
              desc: 'Remplissez le formulaire numérique sur ce site pour réserver la place et générer le code de dossier.',
              badge: 'Numérique'
            },
            {
              step: '02',
              title: 'Dépôt physique des pièces',
              desc: 'Présentez-vous avec l’enfant au secrétariat (Delmas 50) de 8h à 15h avec les pièces requises et les 3 000 Gourdes.',
              badge: 'Sur Place'
            },
            {
              step: '03',
              title: 'Entretien & Diagnostic',
              desc: 'Entretien bienveillant avec la direction pédagogique et évaluation du niveau académique du candidat.',
              badge: 'Pédagogique'
            },
            {
              step: '04',
              title: 'Confirmation & Livret',
              desc: 'Validation définitive, remise du livret d’accueil newtonien et délivrance de la fiche d\'immatriculation.',
              badge: 'Officiel'
            },
          ].map((item, idx) => (
            <div 
              key={idx} 
              className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-200/80 flex flex-col justify-between hover:border-blue-900/30 hover:bg-white transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-xl font-bold text-blue-900/40 group-hover:text-blue-900 transition-colors">
                    {item.step}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600">
                    {item.badge}
                  </span>
                </div>
                <h3 className="font-serif font-bold text-xs sm:text-sm text-slate-900 mb-1">
                  {item.title}
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed font-light">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. QUESTIONS FRÉQUENTES (FAQ Ergonomique & Compacte) */}
      <section id="admission-faq" className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 lg:p-6 border border-slate-200/90 shadow-2xs space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <HelpCircle className="w-4 h-4" />
            </span>
            <div>
              <h2 className="font-serif text-base sm:text-lg font-bold text-slate-900">
                Foire aux Questions sur les Admissions {academicYear}
              </h2>
              <p className="text-xs text-slate-500 font-light">
                Réponses aux interrogations les plus fréquentes des parents d'élèves.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('contact')}
            className="text-xs font-semibold text-blue-900 hover:text-blue-700 inline-flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            <span>Poser une autre question</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-xl border border-slate-200/80 overflow-hidden transition-all bg-slate-50/50 hover:bg-white"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full text-left p-3 sm:p-3.5 flex items-center justify-between gap-3 font-serif font-bold text-xs sm:text-sm text-slate-900 hover:text-blue-900 cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span>{faq.question}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${
                    isOpen ? 'rotate-180 text-blue-900' : ''
                  }`} />
                </button>
                {isOpen && (
                  <div className="px-3 sm:px-3.5 pb-3 pt-0.5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100/90 bg-white">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. BANDEAU DE FINALISATION & APPELS À L'ACTION */}
      <section className="rounded-2xl sm:rounded-3xl bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 text-white p-4 sm:p-5 lg:p-6 shadow-md border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 text-amber-400 font-bold text-xs uppercase tracking-wider">
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Inscriptions en Cours · Session {academicYear}</span>
          </div>
          <h3 className="font-serif text-base sm:text-lg font-bold text-white">
            Prêt à inscrire votre enfant pour l'année {academicYear} ?
          </h3>
          <p className="text-xs text-slate-300 max-w-xl font-light">
            Déposez le dossier de préinscription en quelques clics ou présentez-vous au secrétariat muni des pièces officielles exigibles.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2.5 shrink-0 w-full md:w-auto">
          <a
            href={`https://wa.me/50937211818?text=${encodeURIComponent(`Bonjour Collège Isaac Newton, je souhaite obtenir des renseignements pour l'inscription pour l'année scolaire ${academicYear}.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-xs"
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp Secrétariat</span>
          </a>

          <button
            type="button"
            onClick={() => onNavigate('pre-registration')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-xs transition-colors cursor-pointer"
          >
            <FileCheck className="w-4 h-4" />
            <span>Préinscription en Ligne</span>
          </button>
        </div>
      </section>

    </div>
  );
};
