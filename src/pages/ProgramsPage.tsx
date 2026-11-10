import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Cpu, 
  BookOpen, 
  GraduationCap, 
  Sparkles, 
  ArrowRight,
  ShieldCheck,
  LayoutGrid,
  Clock,
  Users,
  Award,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Send,
  Loader2,
  Phone,
  Mail,
  Check,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { SCHOOL_IMAGES } from '../assets/images';
import { ContentEditable } from '../components/common/ContentEditable';
import { User } from '../types';
import { SCHOOL_INFO } from '../data/mockData';
import { apiService } from '../services/api';
import { validateEmail, validatePhone } from '../utils/validation';
import { toast } from 'sonner';

interface ProgramsPageProps {
  subSection?: string;
  onNavigate: (page: string, subSection?: string) => void;
  currentUser?: User | null;
}

type ProgramFilterTab = 'all' | 'prescolaire' | 'fondamental' | 'secondaire' | 'numerique' | 'orientation';

export const ProgramsPage: React.FC<ProgramsPageProps> = ({ subSection, onNavigate, currentUser }) => {
  const [activeTab, setActiveTab] = useState<ProgramFilterTab>('all');

  // Formulaire d'orientation pédagogique
  const [orientData, setOrientData] = useState({
    parentName: '',
    studentName: '',
    studentAge: '',
    cycle: 'secondaire',
    phone: '',
    email: '',
    question: ''
  });
  const [orientLoading, setOrientLoading] = useState(false);
  const [orientSuccess, setOrientSuccess] = useState(false);
  const [orientError, setOrientError] = useState<string | null>(null);

  // Synchronisation fluide avec les sous-sections venant de la navigation
  useEffect(() => {
    if (subSection === 'prescolaire' || subSection === 'fondamental' || subSection === 'secondaire' || subSection === 'numerique' || subSection === 'orientation') {
      setActiveTab(subSection);
    } else if (subSection === 'all' || !subSection) {
      setActiveTab('all');
    }
  }, [subSection]);

  const tabsConfig = [
    { 
      id: 'all' as ProgramFilterTab, 
      label: 'Tous les Cycles', 
      badge: 'Vue globale', 
      icon: LayoutGrid 
    },
    { 
      id: 'prescolaire' as ProgramFilterTab, 
      label: '1. Préscolaire', 
      badge: '3 - 5 ans', 
      icon: Sparkles 
    },
    { 
      id: 'fondamental' as ProgramFilterTab, 
      label: '2. Fondamental', 
      badge: '1e - 9e AF', 
      icon: BookOpen 
    },
    { 
      id: 'secondaire' as ProgramFilterTab, 
      label: '3. Secondaire', 
      badge: 'NS1 - NS4', 
      icon: GraduationCap 
    },
    { 
      id: 'numerique' as ProgramFilterTab, 
      label: '4. Numérique', 
      badge: 'Lab Tech', 
      icon: Cpu 
    },
    { 
      id: 'orientation' as ProgramFilterTab, 
      label: 'Orientation & Aide', 
      badge: 'Conseil', 
      icon: HelpCircle 
    },
  ];

  const handleTabChange = (tabId: ProgramFilterTab) => {
    setActiveTab(tabId);
  };

  const handleOrientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrientError(null);

    if (!orientData.parentName.trim() || !orientData.email.trim() || !orientData.phone.trim()) {
      setOrientError('Veuillez renseigner votre nom, téléphone et e-mail.');
      return;
    }

    const emailCheck = validateEmail(orientData.email);
    if (!emailCheck.isValid) {
      setOrientError(emailCheck.error || 'Adresse e-mail non valide.');
      return;
    }

    const phoneCheck = validatePhone(orientData.phone);
    if (!phoneCheck.isValid) {
      setOrientError(phoneCheck.error || 'Numéro de téléphone non valide.');
      return;
    }

    setOrientLoading(true);
    try {
      const cycleLabels: Record<string, string> = {
        prescolaire: 'Cycle Préscolaire (TPS - GS)',
        fondamental: 'Cycle Fondamental (1ère - 9ème AF)',
        secondaire: 'Nouveau Secondaire (NS1 - NS4)',
        numerique: 'Pôle Numérique & Informatique'
      };

      await apiService.sendContactMessage({
        fullName: orientData.parentName.trim(),
        email: orientData.email.trim(),
        phone: orientData.phone.trim(),
        subject: `[Orientation Cursus] ${cycleLabels[orientData.cycle] || orientData.cycle} - Candidat: ${orientData.studentName || 'Non précisé'}`,
        message: `Demande d'orientation pédagogique.
- Élève : ${orientData.studentName || 'Non précisé'} (${orientData.studentAge ? `${orientData.studentAge} ans` : 'Âge non spécifié'})
- Cursus d'intérêt : ${cycleLabels[orientData.cycle] || orientData.cycle}
- Questions du parent : ${orientData.question.trim() || 'Demande de contact pour choix de classe'}`
      });

      setOrientSuccess(true);
      toast.success('Demande d’orientation transmise. Un conseiller vous contactera sous 24h.');
    } catch {
      setOrientError('Une erreur est survenue lors de l’envoi. Veuillez réessayer.');
    } finally {
      setOrientLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-5 sm:space-y-6 font-sans">
      
      {/* 1. Page Header Compact & Épuré */}
      <section className="space-y-2.5 sm:space-y-3">
        {/* Kicker unboxed sans pill decorative */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-medium">
          <span className="text-blue-900 font-bold uppercase tracking-wider">Cursus & Offre Pédagogique</span>
          <span aria-hidden="true" className="text-slate-300">/</span>
          <ContentEditable
            contentKey="programs.hero.badge"
            defaultContent="Du Préscolaire au Nouveau Secondaire & Pôle Numérique"
            as="span"
            currentUser={currentUser}
            multiline={false}
          />
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span>Delmas 50</span>
        </div>

        {/* Titre et sous-titre allégés */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-6 items-baseline">
          <div className="lg:col-span-7">
            <ContentEditable
              contentKey="programs.hero.title"
              defaultContent="Nos Programmes Scolaires"
              as="h1"
              className="font-serif text-2xl sm:text-4xl font-bold text-slate-900 tracking-tight text-balance"
              currentUser={currentUser}
              multiline={false}
            />
          </div>
          <div className="lg:col-span-5">
            <ContentEditable
              contentKey="programs.hero.subtitle"
              defaultContent="Un cheminement continu d'excellence académique, de l'éveil bienveillant jusqu'au Baccalauréat et aux concours universitaires."
              as="p"
              className="text-xs sm:text-sm text-slate-600 leading-snug"
              currentUser={currentUser}
              multiline={true}
            />
          </div>
        </div>

        {/* 2. Barre d'onglets segmentée, fluide et ergonomique */}
        <div className="pt-1">
          <nav 
            className="flex items-center gap-1 p-1 bg-slate-100/90 rounded-xl border border-slate-200/80 overflow-x-auto scrollbar-none"
            aria-label="Sélection des cycles d'enseignement"
          >
            {tabsConfig.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabChange(tab.id)}
                  aria-pressed={isActive}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer ${
                    isActive 
                      ? 'bg-white text-blue-950 shadow-xs border border-slate-200/70 font-bold' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-blue-900' : 'text-slate-500'}`} />
                  <span>{tab.label}</span>
                  <span className={`hidden md:inline-block text-[10px] px-1 py-0.2 rounded font-mono ${
                    isActive ? 'bg-blue-50 text-blue-900' : 'text-slate-400'
                  }`}>
                    {tab.badge}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      </section>

      {/* 3. VUE D'ENSEMBLE (PANORAMIQUE : 4 CYCLES COMPARÉS) */}
      {activeTab === 'all' && (
        <div className="space-y-5 animate-in fade-in duration-150">
          
          {/* Grille dense 4 cartes (Responsive: 1 col mobile, 2 col tablette, 4 col desktop) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3.5">
            
            {/* Carte 1 : Préscolaire */}
            <div 
              onClick={() => handleTabChange('prescolaire')}
              className="bg-white rounded-xl p-3.5 sm:p-4 border border-slate-200/80 hover:border-amber-400 hover:shadow-xs transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <span className="text-[10.5px] font-mono text-slate-500">3 - 5 ans</span>
                </div>
                <h3 className="font-serif font-bold text-sm text-slate-900 group-hover:text-amber-800 transition-colors">
                  1. Cycle Préscolaire
                </h3>
                <p className="text-[11.5px] text-slate-600 leading-snug line-clamp-2">
                  Éveil sensoriel, enrichissement du vocabulaire, socialisation douce et motricité fine.
                </p>
                <div className="pt-2 border-t border-slate-100 space-y-1 text-[11px] text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>TPS, MS & Grande Section</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="font-mono">07h30 - 13h00</span>
                  </div>
                </div>
              </div>
              <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between text-[11.5px] font-semibold text-amber-700">
                <span>Détails cursus</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>

            {/* Carte 2 : Fondamental */}
            <div 
              onClick={() => handleTabChange('fondamental')}
              className="bg-white rounded-xl p-3.5 sm:p-4 border border-slate-200/80 hover:border-blue-500 hover:shadow-xs transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-900 flex items-center justify-center">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <span className="text-[10.5px] font-mono text-slate-500">1e - 9e AF</span>
                </div>
                <h3 className="font-serif font-bold text-sm text-slate-900 group-hover:text-blue-900 transition-colors">
                  2. Cycle Fondamental
                </h3>
                <p className="text-[11.5px] text-slate-600 leading-snug line-clamp-2">
                  Socles académiques rigoureux, raisonnement mathématique et préparation au diplôme 9e AF.
                </p>
                <div className="pt-2 border-t border-slate-100 space-y-1 text-[11px] text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>1er, 2e et 3e Cycles</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="font-mono">07h30 - 13h30</span>
                  </div>
                </div>
              </div>
              <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between text-[11.5px] font-semibold text-blue-900">
                <span>Détails cursus</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>

            {/* Carte 3 : Secondaire */}
            <div 
              onClick={() => handleTabChange('secondaire')}
              className="bg-white rounded-xl p-3.5 sm:p-4 border border-slate-200/80 hover:border-purple-500 hover:shadow-xs transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <span className="text-[10.5px] font-mono text-slate-500">NS1 - NS4</span>
                </div>
                <h3 className="font-serif font-bold text-sm text-slate-900 group-hover:text-purple-900 transition-colors">
                  3. Nouveau Secondaire
                </h3>
                <p className="text-[11.5px] text-slate-600 leading-snug line-clamp-2">
                  Séries Scientifiques (SVT, SMP) et Économiques (SES). Méthode pour le Baccalauréat d'État.
                </p>
                <div className="pt-2 border-t border-slate-100 space-y-1 text-[11px] text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>Coaching facultés & bourses</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="font-mono">07h30 - 14h00</span>
                  </div>
                </div>
              </div>
              <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between text-[11.5px] font-semibold text-purple-700">
                <span>Détails cursus</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>

            {/* Carte 4 : Pôle Numérique */}
            <div 
              onClick={() => handleTabChange('numerique')}
              className="bg-white rounded-xl p-3.5 sm:p-4 border border-slate-200/80 hover:border-emerald-500 hover:shadow-xs transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <span className="text-[10.5px] font-mono text-slate-500">Lab Tech</span>
                </div>
                <h3 className="font-serif font-bold text-sm text-slate-900 group-hover:text-emerald-900 transition-colors">
                  4. Pôle Numérique
                </h3>
                <p className="text-[11.5px] text-slate-600 leading-snug line-clamp-2">
                  25+ postes récents sous onduleurs. Dactylographie, bureautique, initiation Python et web éthique.
                </p>
                <div className="pt-2 border-t border-slate-100 space-y-1 text-[11px] text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>Postes individuels 1:1</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="font-mono">Pratique hebdomadaire</span>
                  </div>
                </div>
              </div>
              <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between text-[11.5px] font-semibold text-emerald-700">
                <span>Détails laboratoire</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>

          </div>

          {/* Bandeau d'Action Rapide Compact */}
          <div className="bg-slate-900 rounded-2xl p-4 sm:p-5 text-white flex flex-col sm:flex-row items-center justify-between gap-3 border border-slate-800 shadow-xs">
            <div className="space-y-0.5 text-center sm:text-left">
              <span className="text-[11px] font-mono uppercase tracking-wider text-amber-300">
                Inscriptions ouvertes {SCHOOL_INFO.currentYear}
              </span>
              <p className="text-xs sm:text-sm text-slate-200">
                Besoin d'un conseil pour orienter votre enfant ? Consultez nos spécialistes ou remplissez la préinscription.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleTabChange('orientation')}
                className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
              >
                Aide à l'orientation
              </button>
              <button
                type="button"
                onClick={() => onNavigate('pre-registration')}
                className="px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>Préinscrire</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>
      )}

      {/* 4. CONTENU : PRÉSCOLAIRE */}
      {(activeTab === 'prescolaire' || activeTab === 'all') && (
        <div id="section-prescolaire" className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-4 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            <div className="lg:col-span-8 space-y-3">
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-amber-700">
                <Sparkles className="w-3.5 h-3.5" />
                <ContentEditable
                  contentKey="programs.prescolaire.badge"
                  defaultContent="Petite, Moyenne & Grande Section (3 à 5 ans)"
                  as="span"
                  currentUser={currentUser}
                  multiline={false}
                />
              </div>

              <ContentEditable
                contentKey="programs.prescolaire.title"
                defaultContent="Cycle Préscolaire : L'Éveil Heureux et Structuré"
                as="h2"
                className="font-serif text-lg sm:text-xl font-bold text-slate-900"
                currentUser={currentUser}
                multiline={false}
              />

              <ContentEditable
                contentKey="programs.prescolaire.desc"
                defaultContent="Un cadre sécurisé et bienveillant où le jeu éducatif, la motricité et l'éveil au langage construisent la confiance en soi et le goût d'apprendre."
                as="p"
                className="text-xs sm:text-sm text-slate-600 leading-relaxed"
                currentUser={currentUser}
                multiline={true}
              />

              {/* 4 blocs de compétences concis */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/70 space-y-1">
                  <h4 className="font-semibold text-slate-900 text-xs">Langage & Bilinguisme</h4>
                  <p className="text-[11.5px] text-slate-600">Vocabulaire usuel, contes créoles et français, articulation et chant.</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/70 space-y-1">
                  <h4 className="font-semibold text-slate-900 text-xs">Découverte Mathématique</h4>
                  <p className="text-[11.5px] text-slate-600">Formes, tri logique, grandeurs et comptage concret par le jeu.</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/70 space-y-1">
                  <h4 className="font-semibold text-slate-900 text-xs">Motricité & Écriture</h4>
                  <p className="text-[11.5px] text-slate-600">Tenue du crayon, découpage, modelage et gestes graphiques préparatoires.</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/70 space-y-1">
                  <h4 className="font-semibold text-slate-900 text-xs">Socialisation & Politesse</h4>
                  <p className="text-[11.5px] text-slate-600">Partage, autonomie, respect des camarades et discipline bienveillante.</p>
                </div>
              </div>
            </div>

            {/* Fiche synthétique latérale */}
            <div className="lg:col-span-4 bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-3 text-xs">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                <h3 className="font-serif font-bold text-xs text-slate-900">Synthèse Préscolaire</h3>
                <span className="font-mono text-[10.5px] text-amber-800 font-bold">3 - 5 ans</span>
              </div>
              <ul className="space-y-2 text-[11.5px] text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Effectifs encadrés avec éducatrices formées</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Matériel didactique moderne et coloré</span>
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-blue-900 shrink-0" />
                  <span>Horaires : <strong>07h30 - 13h00</strong></span>
                </li>
              </ul>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onNavigate('pre-registration', 'prescolaire')}
                  className="w-full py-2 px-3 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>Préinscrire en préscolaire</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. CONTENU : FONDAMENTAL */}
      {(activeTab === 'fondamental' || activeTab === 'all') && (
        <div id="section-fondamental" className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-4 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            <div className="lg:col-span-8 space-y-3">
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-blue-900">
                <BookOpen className="w-3.5 h-3.5" />
                <ContentEditable
                  contentKey="programs.fondamental.badge"
                  defaultContent="1ère à 9ème Année Fondamentale (1e, 2e & 3e Cycles)"
                  as="span"
                  currentUser={currentUser}
                  multiline={false}
                />
              </div>

              <ContentEditable
                contentKey="programs.fondamental.title"
                defaultContent="Cycle Fondamental : Le Socle des Savoirs et de la Rigueur"
                as="h2"
                className="font-serif text-lg sm:text-xl font-bold text-slate-900"
                currentUser={currentUser}
                multiline={false}
              />

              <ContentEditable
                contentKey="programs.fondamental.desc"
                defaultContent="Acquisition solide des compétences en lecture, rédaction, mathématiques appliquées et sciences expérimentales pour garantir la réussite au diplôme officiel de 9e AF."
                as="p"
                className="text-xs sm:text-sm text-slate-600 leading-relaxed"
                currentUser={currentUser}
                multiline={true}
              />

              {/* 3 cycles fondamentaux en blocs compacts */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/70 space-y-1">
                  <span className="text-[10px] font-mono font-bold uppercase text-blue-900">1er Cycle (1e-2e AF)</span>
                  <h4 className="font-serif font-bold text-xs text-slate-900">Lecture & 4 Opérations</h4>
                  <p className="text-[11px] text-slate-600 leading-snug">Déchiffrage fluide, écriture soignée, addition/soustraction et calcul mental.</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/70 space-y-1">
                  <span className="text-[10px] font-mono font-bold uppercase text-blue-900">2e Cycle (3e-6e AF)</span>
                  <h4 className="font-serif font-bold text-xs text-slate-900">Sciences & Grammaire</h4>
                  <p className="text-[11px] text-slate-600 leading-snug">Géométrie pratique, sciences d'observation, histoire-géographie et lab informatique.</p>
                </div>
                <div className="p-3 rounded-lg bg-blue-50/50 border border-blue-200/80 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase text-amber-700">3e Cycle (7e-9e AF)</span>
                    <span className="text-[9.5px] font-bold text-blue-900 bg-blue-100 px-1 rounded">Diplôme d'État</span>
                  </div>
                  <h4 className="font-serif font-bold text-xs text-slate-900">Préparation 9e AF</h4>
                  <p className="text-[11px] text-slate-600 leading-snug">Physique, chimie, algèbre, dissertations et examens blancs avec 100% de réussite.</p>
                </div>
              </div>
            </div>

            {/* Fiche synthétique latérale */}
            <div className="lg:col-span-4 bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-3 text-xs">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                <h3 className="font-serif font-bold text-xs text-slate-900">Synthèse Fondamental</h3>
                <span className="font-mono text-[10.5px] text-blue-900 font-bold">1e à 9e AF</span>
              </div>
              <ul className="space-y-2 text-[11.5px] text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Séance informatique hebdomadaire intégrée</span>
                </li>
                <li className="flex items-center gap-2">
                  <Award className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>100% de réussite aux épreuves officielles</span>
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-blue-900 shrink-0" />
                  <span>Horaires : <strong>07h30 - 13h30</strong></span>
                </li>
              </ul>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onNavigate('pre-registration', 'fondamental')}
                  className="w-full py-2 px-3 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>Préinscrire au fondamental</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. CONTENU : SECONDAIRE */}
      {(activeTab === 'secondaire' || activeTab === 'all') && (
        <div id="section-secondaire" className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-4 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            <div className="lg:col-span-8 space-y-3">
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-purple-900">
                <GraduationCap className="w-3.5 h-3.5 text-purple-700" />
                <ContentEditable
                  contentKey="programs.secondaire.badge"
                  defaultContent="Nouveau Secondaire 1 à 4 (NS1, NS2, NS3, NS4)"
                  as="span"
                  currentUser={currentUser}
                  multiline={false}
                />
              </div>

              <ContentEditable
                contentKey="programs.secondaire.title"
                defaultContent="Le Nouveau Secondaire : Préparer l'Excellence Universitaire"
                as="h2"
                className="font-serif text-lg sm:text-xl font-bold text-slate-900"
                currentUser={currentUser}
                multiline={false}
              />

              <ContentEditable
                contentKey="programs.secondaire.desc"
                defaultContent="Filières spécialisées exigeantes pour former l'esprit d'analyse, la méthode de recherche et garantir le succès au Baccalauréat d'État et aux concours des grandes facultés."
                as="p"
                className="text-xs sm:text-sm text-slate-600 leading-relaxed"
                currentUser={currentUser}
                multiline={true}
              />

              {/* Séries et orientation en 2 blocs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/70 space-y-1">
                  <h4 className="font-serif font-bold text-xs text-slate-900">Séries Scientifiques (SVT & SMP)</h4>
                  <p className="text-[11.5px] text-slate-600 leading-snug">
                    Mathématiques avancées, physique-chimie expérimentale, biologie cellulaire et travaux dirigés soutenus.
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/70 space-y-1">
                  <h4 className="font-serif font-bold text-xs text-slate-900">Séries Économiques (SES) & Lettres</h4>
                  <p className="text-[11.5px] text-slate-600 leading-snug">
                    Économie générale, sociologie, comptabilité, géopolitique et expression écrite structurée.
                  </p>
                </div>
              </div>
            </div>

            {/* Fiche synthétique latérale */}
            <div className="lg:col-span-4 bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-3 text-xs">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                <h3 className="font-serif font-bold text-xs text-slate-900">Synthèse Secondaire</h3>
                <span className="font-mono text-[10.5px] text-purple-900 font-bold">NS1 à NS4</span>
              </div>
              <ul className="space-y-2 text-[11.5px] text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Professeurs spécialistes chevronnés</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Baccalauréats blancs réguliers & coaching</span>
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-blue-900 shrink-0" />
                  <span>Horaires : <strong>07h30 - 14h00</strong></span>
                </li>
              </ul>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onNavigate('pre-registration', 'secondaire')}
                  className="w-full py-2 px-3 rounded-lg bg-purple-900 hover:bg-purple-800 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>Préinscrire au secondaire</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. CONTENU : PÔLE NUMÉRIQUE */}
      {(activeTab === 'numerique' || activeTab === 'all') && (
        <div id="section-numerique" className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-4 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
            
            <div className="lg:col-span-7 space-y-3">
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                <Cpu className="w-3.5 h-3.5 text-emerald-700" />
                <ContentEditable
                  contentKey="programs.numerique.badge"
                  defaultContent="Laboratoire Informatique & Compétences Technologiques"
                  as="span"
                  currentUser={currentUser}
                  multiline={false}
                />
              </div>

              <ContentEditable
                contentKey="programs.numerique.title"
                defaultContent="Un Pôle Informatique Conçu pour Bâtir l'Avenir"
                as="h2"
                className="font-serif text-lg sm:text-xl font-bold text-slate-900"
                currentUser={currentUser}
                multiline={false}
              />

              <ContentEditable
                contentKey="programs.numerique.desc"
                defaultContent="Dès le cycle fondamental, chaque élève bénéficie de séances hebdomadaires en salle informatique climatisée, équipée de machines récentes sous onduleurs et serveurs sécurisés."
                as="p"
                className="text-xs sm:text-sm text-slate-600 leading-relaxed"
                currentUser={currentUser}
                multiline={true}
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70 space-y-1">
                  <span className="font-mono text-xs font-bold text-blue-900">1. Bureautique</span>
                  <p className="text-[11px] text-slate-600">Dactylographie dix doigts, rédaction de rapports et tableurs.</p>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70 space-y-1">
                  <span className="font-mono text-xs font-bold text-blue-900">2. Algorithmique</span>
                  <p className="text-[11px] text-slate-600">Logique de programmation, variables et premiers scripts Python.</p>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70 space-y-1">
                  <span className="font-mono text-xs font-bold text-blue-900">3. Éthique Web</span>
                  <p className="text-[11px] text-slate-600">Recherche documentaire critique, vérification des sources et cybersécurité.</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-2">
              <div className="rounded-xl overflow-hidden border border-slate-200 aspect-[16/10] w-full bg-slate-900 relative">
                <img
                  src={SCHOOL_IMAGES.computerLab}
                  alt="Laboratoire informatique du Collège Isaac Newton"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 text-white text-[11px] flex items-center justify-between">
                <span>25+ postes individuels récents</span>
                <button
                  type="button"
                  onClick={() => onNavigate('pre-registration', 'numerique')}
                  className="px-2.5 py-1 rounded bg-amber-400 text-slate-950 font-bold hover:bg-amber-300 transition-colors cursor-pointer"
                >
                  S'inscrire
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 8. NOUVEAU FORMULAIRE MODERNE : ORIENTATION PÉDAGOGIQUE & CONSEIL */}
      {(activeTab === 'orientation' || activeTab === 'all') && (
        <section id="section-orientation" className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-1.5 text-blue-900 text-xs font-bold uppercase tracking-wider">
                <HelpCircle className="w-3.5 h-3.5 text-blue-700" />
                <span>Conseil & Orientation Pédagogique</span>
              </div>
              <h2 className="font-serif text-lg font-bold text-slate-900 mt-0.5">
                Quel cursus choisir pour votre enfant ?
              </h2>
              <p className="text-xs text-slate-600">
                Remplissez ce formulaire express pour recevoir une recommandation personnalisée de la Direction des Études sous 24h.
              </p>
            </div>
            <a
              href={`tel:${SCHOOL_INFO.phone1}`}
              className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-blue-950 font-semibold text-xs border border-slate-200 transition-colors flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Phone className="w-3.5 h-3.5 text-blue-700" />
              <span>{SCHOOL_INFO.phone1}</span>
            </a>
          </div>

          {orientSuccess ? (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
              <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
                <Check className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-sm text-emerald-950">Demande d'orientation enregistrée</h3>
              <p className="text-xs text-emerald-800 max-w-md mx-auto">
                Un conseiller pédagogique du Collège Isaac Newton vous appellera au numéro renseigné pour faire le point sur le niveau et le dossier de l'élève.
              </p>
              <button
                type="button"
                onClick={() => {
                  setOrientSuccess(false);
                  setOrientData({ parentName: '', studentName: '', studentAge: '', cycle: 'secondaire', phone: '', email: '', question: '' });
                }}
                className="text-xs font-bold text-emerald-900 underline cursor-pointer mt-1"
              >
                Poser une autre question
              </button>
            </div>
          ) : (
            <form onSubmit={handleOrientSubmit} className="space-y-3 text-xs">
              {orientError && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 flex items-center gap-2 text-xs">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{orientError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block text-[11px]">
                    Nom du parent / tuteur <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={orientData.parentName}
                    onChange={(e) => setOrientData({ ...orientData, parentName: e.target.value })}
                    placeholder="ex: Jean Pierre"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:border-blue-900 text-xs bg-white outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block text-[11px]">
                    Téléphone de contact <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={orientData.phone}
                    onChange={(e) => setOrientData({ ...orientData, phone: e.target.value })}
                    placeholder="+509 3700-0000"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:border-blue-900 text-xs bg-white outline-none font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block text-[11px]">
                    Adresse e-mail <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={orientData.email}
                    onChange={(e) => setOrientData({ ...orientData, email: e.target.value })}
                    placeholder="parent@exemple.com"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:border-blue-900 text-xs bg-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block text-[11px]">
                    Nom & prénom de l'enfant
                  </label>
                  <input
                    type="text"
                    value={orientData.studentName}
                    onChange={(e) => setOrientData({ ...orientData, studentName: e.target.value })}
                    placeholder="ex: Alexandre Pierre"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:border-blue-900 text-xs bg-white outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block text-[11px]">
                    Âge de l'enfant
                  </label>
                  <input
                    type="text"
                    value={orientData.studentAge}
                    onChange={(e) => setOrientData({ ...orientData, studentAge: e.target.value })}
                    placeholder="ex: 14 ans"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:border-blue-900 text-xs bg-white outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block text-[11px]">
                    Cycle d'intérêt envisagé
                  </label>
                  <select
                    value={orientData.cycle}
                    onChange={(e) => setOrientData({ ...orientData, cycle: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:border-blue-900 text-xs bg-white outline-none cursor-pointer"
                  >
                    <option value="prescolaire">Préscolaire (TPS - GS)</option>
                    <option value="fondamental">Fondamental (1e - 9e AF)</option>
                    <option value="secondaire">Nouveau Secondaire (NS1 - NS4)</option>
                    <option value="numerique">Pôle Numérique</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block text-[11px]">
                  Vos questions ou dossier scolaire actuel (facultatif)
                </label>
                <textarea
                  rows={2}
                  value={orientData.question}
                  onChange={(e) => setOrientData({ ...orientData, question: e.target.value })}
                  placeholder="Précisez la dernière classe suivie, vos interrogations sur les séries ou les pièces à fournir..."
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:border-blue-900 text-xs bg-white outline-none resize-none"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-1">
                <span className="text-[10.5px] text-slate-500">
                  Secrétariat pédagogique du Collège Isaac Newton · Delmas 50.
                </span>

                <button
                  type="submit"
                  disabled={orientLoading}
                  className="w-full sm:w-auto px-5 py-2 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60 shadow-xs"
                >
                  {orientLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Transmission en cours...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Envoyer ma demande d'orientation</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </section>
      )}

      {/* 9. Contrôle de bascule bas de page quand un cycle individuel est sélectionné */}
      {activeTab !== 'all' && (
        <div className="flex items-center justify-between pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={() => {
              const order: ProgramFilterTab[] = ['prescolaire', 'fondamental', 'secondaire', 'numerique'];
              const curIdx = order.indexOf(activeTab);
              const prevTab = curIdx > 0 ? order[curIdx - 1] : order[order.length - 1];
              handleTabChange(prevTab);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Cycle Précédent</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('all')}
            className="px-3 py-1.5 rounded-lg text-blue-900 hover:bg-blue-50 text-xs font-semibold transition-colors cursor-pointer"
          >
            Vue d'ensemble
          </button>

          <button
            type="button"
            onClick={() => {
              const order: ProgramFilterTab[] = ['prescolaire', 'fondamental', 'secondaire', 'numerique'];
              const curIdx = order.indexOf(activeTab);
              const nextTab = curIdx < order.length - 1 ? order[curIdx + 1] : order[0];
              handleTabChange(nextTab);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            <span>Cycle Suivant</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

    </div>
  );
};
