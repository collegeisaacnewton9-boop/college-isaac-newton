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
  FileCheck,
  Calendar,
  Sparkle
} from 'lucide-react';
import { SCHOOL_IMAGES } from '../assets/images';
import { ContentEditable } from '../components/common/ContentEditable';
import { User } from '../types';

interface ProgramsPageProps {
  subSection?: string;
  onNavigate: (page: string, subSection?: string) => void;
  currentUser?: User | null;
}

type ProgramFilterTab = 'all' | 'prescolaire' | 'fondamental' | 'secondaire' | 'numerique';

export const ProgramsPage: React.FC<ProgramsPageProps> = ({ subSection, onNavigate, currentUser }) => {
  const [activeTab, setActiveTab] = useState<ProgramFilterTab>('all');

  // Synchronisation avec les sous-sections provenant du menu de navigation
  useEffect(() => {
    if (subSection === 'prescolaire' || subSection === 'fondamental' || subSection === 'secondaire' || subSection === 'numerique') {
      setActiveTab(subSection);
    } else if (subSection === 'all' || !subSection) {
      setActiveTab('all');
    }
  }, [subSection]);

  const tabsConfig = [
    { 
      id: 'all' as ProgramFilterTab, 
      label: 'Tous les Cycles', 
      subtitle: 'Vue d’ensemble',
      badge: '4 Cursus', 
      icon: LayoutGrid 
    },
    { 
      id: 'prescolaire' as ProgramFilterTab, 
      label: '1. Préscolaire', 
      subtitle: '3 - 5 ans',
      badge: 'TPS à GS', 
      icon: Sparkles 
    },
    { 
      id: 'fondamental' as ProgramFilterTab, 
      label: '2. Fondamental', 
      subtitle: '6 - 15 ans',
      badge: '1e à 9e AF', 
      icon: BookOpen 
    },
    { 
      id: 'secondaire' as ProgramFilterTab, 
      label: '3. Secondaire', 
      subtitle: '15 - 19 ans',
      badge: 'NS1 à NS4', 
      icon: GraduationCap 
    },
    { 
      id: 'numerique' as ProgramFilterTab, 
      label: '4. Pôle Numérique', 
      subtitle: 'Tous niveaux',
      badge: 'Lab Tech', 
      icon: Cpu 
    },
  ];

  // Helper pour changer d'onglet et remonter légèrement si nécessaire
  const handleTabChange = (tabId: ProgramFilterTab) => {
    setActiveTab(tabId);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-8 font-sans">
      
      {/* 1. Page Header */}
      <div className="max-w-3xl space-y-3">
        <div className="inline-block text-xs font-semibold uppercase tracking-widest text-blue-900">
          <ContentEditable
            contentKey="programs.hero.badge"
            defaultContent="Cursus & Offre Pédagogique"
            as="span"
            currentUser={currentUser}
            multiline={false}
          />
        </div>
        <ContentEditable
          contentKey="programs.hero.title"
          defaultContent="Nos Programmes Scolaires"
          as="h1"
          className="font-serif text-3xl sm:text-5xl font-bold text-slate-900"
          currentUser={currentUser}
          multiline={false}
        />
        <ContentEditable
          contentKey="programs.hero.subtitle"
          defaultContent="Un cheminement continu d'excellence académique, de l'éveil de la petite enfance jusqu'aux épreuves du baccalauréat et à la préparation aux concours universitaires."
          as="p"
          className="text-sm sm:text-base text-slate-600 leading-relaxed font-light"
          currentUser={currentUser}
          multiline={true}
        />
      </div>

      {/* 2. Filtres Interactifs de Navigation (Sticky Tab Filter Bar) */}
      <div className="sticky top-16 md:top-20 z-20 -mx-4 px-4 sm:mx-0 sm:px-0 py-2.5 bg-slate-50/95 backdrop-blur-md border-y sm:border sm:rounded-2xl border-slate-200/80 shadow-2xs">
        <div className="flex items-center justify-between gap-3 overflow-x-auto no-scrollbar scroll-smooth">
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {tabsConfig.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  aria-pressed={isActive}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap min-h-[42px] ${
                    isActive 
                      ? 'bg-blue-900 text-white shadow-sm ring-1 ring-blue-950' 
                      : 'bg-white/80 hover:bg-white text-slate-700 hover:text-blue-900 border border-slate-200/70 hover:border-slate-300'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-300' : 'text-slate-500'}`} />
                  <span>{tab.label}</span>
                  <span className={`hidden md:inline-block text-[10px] px-1.5 py-0.5 rounded font-mono ${
                    isActive ? 'bg-blue-800 text-amber-200' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {tab.badge}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500 shrink-0 pr-2">
            <span className="font-mono text-[11px] bg-slate-200/70 px-2 py-1 rounded-md text-slate-700">
              {activeTab === 'all' ? 'Vue : Tous les programmes' : `Cycle sélectionné : ${tabsConfig.find(t => t.id === activeTab)?.label}`}
            </span>
          </div>
        </div>
      </div>

      {/* 3. VUE : TOUS LES CYCLES (Mode Vue Panoramique) */}
      {activeTab === 'all' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          
          {/* Quick Summary Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Carte 1 : Préscolaire */}
            <div 
              onClick={() => handleTabChange('prescolaire')}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 hover:border-amber-400 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                    3 - 5 ans
                  </span>
                </div>
                <h3 className="font-serif font-bold text-lg text-slate-900 group-hover:text-amber-800 transition-colors">
                  1. Cycle Préscolaire
                </h3>
                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  Éveil sensoriel, enrichissement du langage, socialisation bienveillante et motricité fine pour donner le goût d'apprendre.
                </p>
                <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Petite, Moyenne & Grande Section</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>07h30 - 13h00</span>
                  </div>
                </div>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-amber-700">
                <span>Consulter le programme</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Carte 2 : Fondamental */}
            <div 
              onClick={() => handleTabChange('fondamental')}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-900 border border-blue-200">
                    1e - 9e AF
                  </span>
                </div>
                <h3 className="font-serif font-bold text-lg text-slate-900 group-hover:text-blue-900 transition-colors">
                  2. Cycle Fondamental
                </h3>
                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  Apprentissages fondamentaux, raisonnement mathématique, sciences pratiques et préparation intense aux examens officiels de 9e AF.
                </p>
                <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>1er, 2e et 3e Cycles Fondamentaux</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>07h30 - 13h30</span>
                  </div>
                </div>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-900">
                <span>Consulter le programme</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Carte 3 : Secondaire */}
            <div 
              onClick={() => handleTabChange('secondaire')}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 hover:border-purple-500 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-purple-50 text-purple-900 border border-purple-200">
                    NS1 - NS4
                  </span>
                </div>
                <h3 className="font-serif font-bold text-lg text-slate-900 group-hover:text-purple-900 transition-colors">
                  3. Nouveau Secondaire
                </h3>
                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  Filières Scientifiques (SVT, SMP) et Économiques (SES). Rigueur méthodologique, dissertations et réussite au Baccalauréat d'État.
                </p>
                <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Préparation facultés & bourses</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>07h30 - 14h00</span>
                  </div>
                </div>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-purple-700">
                <span>Consulter le programme</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Carte 4 : Pôle Numérique */}
            <div 
              onClick={() => handleTabChange('numerique')}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-900 border border-emerald-200">
                    Lab Informatique
                  </span>
                </div>
                <h3 className="font-serif font-bold text-lg text-slate-900 group-hover:text-emerald-900 transition-colors">
                  4. Pôle Numérique
                </h3>
                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  Postes informatiques récents sous onduleurs. Dactylographie, bureautique, initiation au code Python et culture technologique.
                </p>
                <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>25+ postes informatiques dédiés</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Séances hebdomadaires</span>
                  </div>
                </div>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-emerald-700">
                <span>Découvrir le laboratoire</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

          </div>

          {/* Bandeau d'Action Rapide */}
          <div className="bg-linear-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-5 shadow-lg">
            <div className="space-y-1.5 text-center sm:text-left">
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-amber-300">
                Campagne des Admissions 2026-2027 Ouverte
              </h3>
              <p className="text-xs sm:text-sm text-slate-200 max-w-xl">
                Nos conseillers pédagogiques vous orientent vers le cycle le plus adapté aux besoins de votre enfant.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
              <button
                onClick={() => onNavigate('pre-registration')}
                className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-md cursor-pointer flex items-center gap-2"
              >
                <span>Formulaire de Préinscription</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onNavigate('admissions')}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm transition-colors border border-white/20 cursor-pointer"
              >
                Pièces & Tarifs
              </button>
            </div>
          </div>

        </div>
      )}

      {/* 4. TAB CONTENT: PRÉSCOLAIRE */}
      {(activeTab === 'prescolaire' || activeTab === 'all') && (
        <div id="section-prescolaire" className="bg-white rounded-3xl p-6 sm:p-10 shadow-xs border border-slate-200/80 space-y-8 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-mono font-medium text-amber-700 bg-amber-50 px-2.5 py-1 rounded border border-amber-200">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <ContentEditable
                  contentKey="programs.prescolaire.badge"
                  defaultContent="Petite Section · Moyenne Section · Grande Section (3 à 5 ans)"
                  as="span"
                  currentUser={currentUser}
                  multiline={false}
                />
              </div>
              <ContentEditable
                contentKey="programs.prescolaire.title"
                defaultContent="Cycle Préscolaire : L'Éveil Heureux et Structuré"
                as="h2"
                className="font-serif text-2xl sm:text-3xl font-bold text-slate-900"
                currentUser={currentUser}
                multiline={false}
              />
              <ContentEditable
                contentKey="programs.prescolaire.desc"
                defaultContent="Le cycle préscolaire du Collège Isaac Newton accueille les enfants dans un environnement rassurant, coloré et stimulant. Notre objectif premier est de développer la confiance en soi, la curiosité naturelle et les habiletés motrices et langagières."
                as="p"
                className="text-sm text-slate-600 leading-relaxed"
                currentUser={currentUser}
                multiline={true}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <h4 className="font-semibold text-slate-900 text-xs sm:text-sm">Langage & Bilinguisme</h4>
                  <p className="text-xs text-slate-600">Enrichissement du vocabulaire, articulation soignée, comptines et contes illustrés.</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <h4 className="font-semibold text-slate-900 text-xs sm:text-sm">Initiation Mathématique</h4>
                  <p className="text-xs text-slate-600">Repérage spatial, tri d'objets, comptage concret et notions de grandeurs.</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <h4 className="font-semibold text-slate-900 text-xs sm:text-sm">Motricité Fine & Écriture</h4>
                  <p className="text-xs text-slate-600">Tenue correcte du crayon, découpage, modelage et gestes graphiques préparatoires.</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <h4 className="font-semibold text-slate-900 text-xs sm:text-sm">Vivre Ensemble & Politesse</h4>
                  <p className="text-xs text-slate-600">Partage, écoute active, respect des camarades et autonomie dans les gestes quotidiens.</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 bg-slate-50 rounded-2xl p-6 border border-slate-200/80 space-y-4 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <h3 className="font-serif font-bold text-sm text-slate-900">Fiche Préscolaire</h3>
                <span className="font-mono text-[11px] text-amber-800 bg-amber-100 px-2 py-0.5 rounded font-semibold">3-5 ans</span>
              </div>
              <ul className="space-y-2.5 text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Effectifs limités pour un encadrement attentionné</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Espace de jeux et matériel pédagogique moderne</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Communication quotidienne avec les familles</span>
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-blue-900 shrink-0" />
                  <span>Horaires de classe : <strong>07h30 - 13h00</strong></span>
                </li>
              </ul>
              <div className="pt-2 space-y-2">
                <button
                  onClick={() => onNavigate('pre-registration', 'prescolaire')}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-900 text-white font-semibold text-xs hover:bg-blue-950 transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Préinscrire en préscolaire</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                {activeTab !== 'all' && (
                  <button
                    onClick={() => handleTabChange('all')}
                    className="w-full py-2 px-3 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 text-[11px] font-medium transition-colors cursor-pointer"
                  >
                    Voir tous les cycles
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. TAB CONTENT: FONDAMENTAL */}
      {(activeTab === 'fondamental' || activeTab === 'all') && (
        <div id="section-fondamental" className="bg-white rounded-3xl p-6 sm:p-10 shadow-xs border border-slate-200/80 space-y-8 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-mono font-medium text-blue-800 bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
                <BookOpen className="w-3.5 h-3.5 text-blue-800" />
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
                defaultContent="L'Enseignement Fondamental : Les Socles de la Réussite"
                as="h2"
                className="font-serif text-2xl sm:text-3xl font-bold text-slate-900"
                currentUser={currentUser}
                multiline={false}
              />
              <ContentEditable
                contentKey="programs.fondamental.desc"
                defaultContent="Le cycle fondamental constitue le cœur de la formation académique. Il structure la pensée logique, consolide l'expression orale et écrite, et installe des habitudes de travail rigoureuses et régulières."
                as="p"
                className="text-sm text-slate-600 leading-relaxed"
                currentUser={currentUser}
                multiline={true}
              />

              {/* Cycle breakdown */}
              <div className="space-y-4 pt-2">
                <div className="p-4 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[11px] font-bold uppercase text-blue-900">1er Cycle (1ère & 2ème AF)</span>
                  <h4 className="font-serif font-bold text-sm text-slate-900">Maîtrise de la Lecture & des 4 Opérations</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Apprentissage intensif du français parlé et écrit, déchiffrage fluide, compréhension de textes courts, addition, soustraction et résolution guidée de petits problèmes concrets.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[11px] font-bold uppercase text-blue-900">2ème Cycle (3ème à 6ème AF)</span>
                  <h4 className="font-serif font-bold text-sm text-slate-900">Sciences Expérimentales & Raisonnement</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Grammaire et conjugaison approfondies, multiplication, division, géométrie pratique, histoire et géographie, éducation civique et initiation aux sciences d'observation en laboratoire.
                  </p>
                </div>

                <div className="p-4 rounded-xl border-2 border-blue-900 bg-blue-50/30 p-4 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase text-amber-700">3ème Cycle (7ème à 9ème AF)</span>
                    <span className="text-[10px] font-mono bg-amber-100 text-amber-900 font-bold px-1.5 py-0.5 rounded">Examen d'État 9e AF</span>
                  </div>
                  <h4 className="font-serif font-bold text-sm text-slate-900">Préparation aux Épreuves Officielles de la 9ème AF</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Algèbre, physique, chimie, biologie, rédaction structurée de dissertations, langue vivante et modules d'informatique. Séances régulières de devoirs surveillés et simulations d'examens d'État avec 100% de réussite.
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 bg-slate-50 rounded-2xl p-6 border border-slate-200/80 space-y-4 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <h3 className="font-serif font-bold text-sm text-slate-900">Fiche Fondamental</h3>
                <span className="font-mono text-[11px] text-blue-900 bg-blue-100 px-2 py-0.5 rounded font-semibold">1e à 9e AF</span>
              </div>
              <ul className="space-y-2.5 text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Séance hebdomadaire au laboratoire informatique</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Devoirs surveillés et relevés de notes réguliers</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Aide aux devoirs et études dirigées l'après-midi</span>
                </li>
                <li className="flex items-center gap-2">
                  <Award className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>100% de réussite aux examens officiels d'État</span>
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-blue-900 shrink-0" />
                  <span>Horaires : <strong>07h30 - 13h30</strong></span>
                </li>
              </ul>
              <div className="pt-2 space-y-2">
                <button
                  onClick={() => onNavigate('pre-registration', 'fondamental')}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-900 text-white font-semibold text-xs hover:bg-blue-950 transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Préinscrire au fondamental</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                {activeTab !== 'all' && (
                  <button
                    onClick={() => handleTabChange('all')}
                    className="w-full py-2 px-3 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 text-[11px] font-medium transition-colors cursor-pointer"
                  >
                    Voir tous les cycles
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. TAB CONTENT: SECONDAIRE */}
      {(activeTab === 'secondaire' || activeTab === 'all') && (
        <div id="section-secondaire" className="bg-white rounded-3xl p-6 sm:p-10 shadow-xs border border-slate-200/80 space-y-8 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-mono font-medium text-purple-800 bg-purple-50 px-2.5 py-1 rounded border border-purple-200">
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
                className="font-serif text-2xl sm:text-3xl font-bold text-slate-900"
                currentUser={currentUser}
                multiline={false}
              />
              <ContentEditable
                contentKey="programs.secondaire.desc"
                defaultContent="Conforme à la réforme du Nouveau Secondaire, le programme du Collège Isaac Newton forme les esprits à l'abstraction, à l'analyse critique et à la recherche personnelle. Les élèves y acquièrent les méthodes rigoureuses attendues dans l'enseignement supérieur."
                as="p"
                className="text-sm text-slate-600 leading-relaxed"
                currentUser={currentUser}
                multiline={true}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                  <h4 className="font-serif font-bold text-sm text-slate-900">Séries Scientifiques (SVT & SMP)</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Mathématiques avancées, physique théorique et appliquée, chimie minérale et organique, sciences de la vie et de la terre. Travaux pratiques réguliers et résolution de problèmes complexes.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                  <h4 className="font-serif font-bold text-sm text-slate-900">Séries Économiques & Sociales (SES)</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Économie politique, sociologie, comptabilité générale, géopolitique et mathématiques appliquées aux sciences sociales.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 text-xs text-slate-700 space-y-1">
                <p className="font-bold text-blue-950">Orientation & Préparation aux Concours :</p>
                <p>
                  Dès la classe de NS3, nos enseignants dispensent des ateliers méthodologiques pour les concours d'entrée aux facultés d'ingénierie, de médecine, de droit et de gestion, ainsi que pour les bourses d'études internationales.
                </p>
              </div>
            </div>

            <div className="lg:col-span-4 bg-slate-50 rounded-2xl p-6 border border-slate-200/80 space-y-4 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <h3 className="font-serif font-bold text-sm text-slate-900">Fiche Secondaire</h3>
                <span className="font-mono text-[11px] text-purple-900 bg-purple-100 px-2 py-0.5 rounded font-semibold">NS1 à NS4</span>
              </div>
              <ul className="space-y-2.5 text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Professeurs spécialistes diplômés et chevronnés</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Accès au laboratoire informatique pour projets</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Baccalauréats blanc et séances de révision intensive</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Clubs scientifiques et d'art oratoire</span>
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-blue-900 shrink-0" />
                  <span>Horaires : <strong>07h30 - 14h00</strong></span>
                </li>
              </ul>
              <div className="pt-2 space-y-2">
                <button
                  onClick={() => onNavigate('pre-registration', 'secondaire')}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-900 text-white font-semibold text-xs hover:bg-blue-950 transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Préinscrire au secondaire</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                {activeTab !== 'all' && (
                  <button
                    onClick={() => handleTabChange('all')}
                    className="w-full py-2 px-3 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 text-[11px] font-medium transition-colors cursor-pointer"
                  >
                    Voir tous les cycles
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. TAB CONTENT: PÔLE NUMÉRIQUE */}
      {(activeTab === 'numerique' || activeTab === 'all') && (
        <div id="section-numerique" className="bg-white rounded-3xl p-6 sm:p-10 shadow-xs border border-slate-200/80 space-y-8 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-6 space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-mono font-medium text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
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
                className="font-serif text-2xl sm:text-3xl font-bold text-slate-900"
                currentUser={currentUser}
                multiline={false}
              />
              <ContentEditable
                contentKey="programs.numerique.desc"
                defaultContent="Le Collège Isaac Newton se distingue par son laboratoire informatique moderne climatisé, doté d'ordinateurs récents et d'une infrastructure sécurisée conçue pour donner à chaque élève les outils de son autonomie technologique dès le fondamental."
                as="p"
                className="text-sm text-slate-600 leading-relaxed"
                currentUser={currentUser}
                multiline={true}
              />

              <div className="space-y-3 pt-2 text-xs">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-900 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Dactylographie & Bureautique Essentielle</h4>
                    <p className="text-slate-600">Vitesse de frappe à dix doigts, mise en page de documents académiques, manipulation de tableurs pour calculs et graphiques.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-900 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Initiation à l'Algorithmie & au Code</h4>
                    <p className="text-slate-600">Compréhension des variables, boucles et conditions à travers des interfaces visuelles puis vers des scripts textuels (Python).</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-900 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Recherche Documentaire & Culture Web</h4>
                    <p className="text-slate-600">Méthodes pour croiser les sources, repérer les fausses informations et citer honnêtement les travaux d'autrui.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 space-y-4">
              <div className="rounded-2xl overflow-hidden shadow-md border border-slate-200">
                <img
                  src={SCHOOL_IMAGES.computerLab}
                  alt="Laboratoire informatique du Collège Isaac Newton"
                  referrerPolicy="no-referrer"
                  className="w-full h-72 sm:h-80 object-cover"
                />
              </div>
              <div className="p-4 rounded-xl bg-slate-900 text-white text-xs flex items-center justify-between">
                <div>
                  <p className="font-semibold text-amber-400">Postes informatiques individuels</p>
                  <p className="text-slate-300 text-[11px]">Chaque élève dispose de sa propre machine durant les travaux dirigés</p>
                </div>
                <button
                  onClick={() => onNavigate('pre-registration', 'numerique')}
                  className="px-3.5 py-1.5 rounded-lg bg-amber-400 text-slate-950 font-bold text-xs hover:bg-amber-300 transition-colors whitespace-nowrap cursor-pointer"
                >
                  S'inscrire
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 8. Contrôle de bascule bas de page quand un cycle individuel est sélectionné */}
      {activeTab !== 'all' && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <button
            onClick={() => {
              const order: ProgramFilterTab[] = ['prescolaire', 'fondamental', 'secondaire', 'numerique'];
              const curIdx = order.indexOf(activeTab);
              const prevTab = curIdx > 0 ? order[curIdx - 1] : order[order.length - 1];
              handleTabChange(prevTab);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Cycle Précédent</span>
          </button>

          <button
            onClick={() => handleTabChange('all')}
            className="px-4 py-2 rounded-xl text-blue-900 hover:bg-blue-50 text-xs font-semibold transition-colors cursor-pointer"
          >
            Afficher Tous les Cycles
          </button>

          <button
            onClick={() => {
              const order: ProgramFilterTab[] = ['prescolaire', 'fondamental', 'secondaire', 'numerique'];
              const curIdx = order.indexOf(activeTab);
              const nextTab = curIdx < order.length - 1 ? order[curIdx + 1] : order[0];
              handleTabChange(nextTab);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            <span>Cycle Suivant</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
};
