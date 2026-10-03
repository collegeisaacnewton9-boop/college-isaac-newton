import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  GraduationCap, 
  Cpu, 
  ShieldCheck, 
  Users, 
  Calendar, 
  FileText, 
  CheckCircle2, 
  ChevronRight, 
  Sparkles, 
  BookOpen, 
  Award, 
  Phone, 
  Clock, 
  MapPin, 
  HelpCircle, 
  Flame,
  ExternalLink 
} from 'lucide-react';
import { SCHOOL_IMAGES } from '../assets/images';
import { SCHOOL_INFO, SCHOOL_VALUES, INITIAL_NEWS, INITIAL_EVENTS } from '../data/mockData';
import { HeroCarousel } from '../components/layout/HeroCarousel';
import { ActivityGallerySection } from '../components/home/ActivityGallerySection';
import { TestimonialSection } from '../components/home/TestimonialsSection';
import { apiService } from '../services/api';
import { NewsArticle, SchoolEvent, User } from '../types';

interface HomePageProps {
  onNavigate: (page: string, subSection?: string) => void;
  onSelectArticle: (articleId: string) => void;
  currentUser?: User | null;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onSelectArticle, currentUser }) => {
  // Interactive cycle explorer tab
  const [activeCycleTab, setActiveCycleTab] = useState<'prescolaire' | 'fondamental' | 'secondaire' | 'numerique'>('fondamental');

  // Interactive quick pre-registration simulator
  const [simulatorAge, setSimulatorAge] = useState<string>('7');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Helper for simulator recommendation
  const getRecommendation = (ageStr: string) => {
    const age = parseInt(ageStr, 10);
    if (age <= 3) return { cycle: 'Préscolaire', class: 'Petite Section (TPS/PS)', focus: 'Éveil sensoriel & motricité', docs: 'Acte de naissance + Carnet de vaccination' };
    if (age === 4) return { cycle: 'Préscolaire', class: 'Moyenne Section (MS)', focus: 'Langage oral & sociabilité', docs: 'Acte de naissance + Photos d’identité' };
    if (age === 5) return { cycle: 'Préscolaire', class: 'Grande Section (GS)', focus: 'Prélecture & calcul préparatoire', docs: 'Acte de naissance + Certificat médical' };
    if (age === 6) return { cycle: 'Fondamental 1er Cycle', class: '1ère Année Fondamentale (1ère AF)', focus: 'Lecture, écriture & calcul', docs: 'Acte de naissance + Fiche de passage GS' };
    if (age <= 9) return { cycle: 'Fondamental 1er/2e Cycle', class: '2ème à 4ème AF', focus: 'Bases consolidées & initiation informatique', docs: 'Bulletins scolaires récents + Acte de naissance' };
    if (age <= 12) return { cycle: 'Fondamental 2e/3e Cycle', class: '5ème à 7ème AF', focus: 'Sciences, logique & expression écrite', docs: 'Certificat de passage officiel + Bulletins' };
    if (age <= 14) return { cycle: 'Fondamental 3e Cycle', class: '8ème ou 9ème AF (Examens d’État)', focus: 'Préparation intensive aux épreuves officielles', docs: 'Fiche d’examen + Bulletins certifiés' };
    return { cycle: 'Nouveau Secondaire', class: 'Secondaire 1 à 4 (NS1-NS4)', focus: 'Filières Scientifiques, Éco & orientation universitaire', docs: 'Dossier complet + Attestation 9e AF' };
  };

  const currentRec = getRecommendation(simulatorAge);

  const cycleDetails = {
    prescolaire: {
      title: 'Cycle Préscolaire',
      subtitle: 'De 3 à 5 ans · Petite, Moyenne et Grande Section',
      description: 'Un espace protecteur, stimulant et chaleureux dédié à l’éveil sensoriel, à l’apprentissage précoce des langues et à la socialisation positive de votre enfant.',
      highlights: [
        'Enseignantes qualifiées en petite enfance',
        'Ateliers de motricité fine et créativité',
        'Initiation bilingue (Créole / Français)',
        'Espace récréatif sécurisé et adapté'
      ],
      targetPage: 'prescolaire',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-200',
      image: SCHOOL_IMAGES.campusCourtyard,
    },
    fondamental: {
      title: 'Cycle Fondamental (1er, 2e et 3e Cycles)',
      subtitle: 'De la 1ère à la 9ème Année Fondamentale (AF)',
      description: 'Acquisition des socles fondamentaux : lecture courante, calcul mathématique, sciences expérimentales et préparation aux examens officiels d’État de 9e AF.',
      highlights: [
        'Curriculum national enrichi par nos référentiels',
        'Initiation pratique au laboratoire informatique dès le 2e cycle',
        'Évaluations continues et bulletins périodiques transparents',
        'Préparation rigoureuse et examens blancs pour la 9e AF'
      ],
      targetPage: 'fondamental',
      badgeColor: 'bg-blue-100 text-blue-900 border-blue-200',
      image: SCHOOL_IMAGES.studentsAssembly,
    },
    secondaire: {
      title: 'Nouveau Secondaire (NS1 à NS4)',
      subtitle: 'Filières Scientifiques (SVT/SMP) et Économiques',
      description: 'Formation intellectuelle de haut niveau menant au Baccalauréat d’État, préparant les lauréats aux facultés et universités réputées.',
      highlights: [
        'Corps professoral spécialisé de haut niveau académique',
        'Laboratoire scientifique et informatique en libre accès tutoré',
        'Coaching d’orientation post-bac et méthode universitaire',
        '100% de présentation aux épreuves officielles'
      ],
      targetPage: 'secondaire',
      badgeColor: 'bg-purple-100 text-purple-900 border-purple-200',
      image: SCHOOL_IMAGES.graduationPromo,
    },
    numerique: {
      title: 'Pôle Numérique & Informatique',
      subtitle: 'Laboratoire Technologique pour tous les cycles',
      description: 'Formation pratique hebdomadaire sur ordinateurs récents, de la bureautique essentielle à la logique algorithmique et la cybersécurité.',
      highlights: [
        '25+ postes informatiques équipés sous onduleurs',
        'Initiation aux suites bureautiques et au traitement de texte',
        'Fondements de la logique algorithmique et codage',
        'Éthique numérique et recherche documentaire sécurisée'
      ],
      targetPage: 'numerique',
      badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-200',
      image: SCHOOL_IMAGES.computerLab,
    }
  };

  const selectedCycle = cycleDetails[activeCycleTab];

  // Dynamic news articles & events state
  const [newsList, setNewsList] = useState<NewsArticle[]>(INITIAL_NEWS);
  const [eventsList, setEventsList] = useState<SchoolEvent[]>(INITIAL_EVENTS);

  useEffect(() => {
    apiService.getNews().then(setNewsList).catch(() => {});
    apiService.getEvents().then(setEventsList).catch(() => {});

    const onNewsUpdate = () => {
      apiService.getNews().then(setNewsList).catch(() => {});
    };
    const onEventsUpdate = () => {
      apiService.getEvents().then(setEventsList).catch(() => {});
    };

    window.addEventListener('cin:news-updated', onNewsUpdate);
    window.addEventListener('cin:events-updated', onEventsUpdate);
    return () => {
      window.removeEventListener('cin:news-updated', onNewsUpdate);
      window.removeEventListener('cin:events-updated', onEventsUpdate);
    };
  }, []);

  const publishedNews = newsList.filter(n => n.status === 'PUBLISHED');
  const featuredArticle = publishedNews.find(n => n.featured) || publishedNews[0] || INITIAL_NEWS[0];
  const secondaryArticles = publishedNews.filter(n => n.id !== featuredArticle.id).slice(0, 2);
  const upcomingEvents = eventsList.filter(e => e.isPublic !== false).slice(0, 4); // Calendrier à venir dynamique

  return (
    <div className="space-y-6 sm:space-y-8 lg:space-y-10">
      
      {/* 1. HERO CAROUSEL - Framer Motion, campus building & lab photos, uncluttered layout */}
      <HeroCarousel onNavigate={onNavigate} />

      {/* 2. SECTION 'ACTUALITÉS ET ÉVÉNEMENTS' - Responsive 3 Columns Desktop, 1 Column Mobile */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Actualités et Événements du Collège">
        {/* Section Header - Compact & Clean */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-4 sm:mb-5 gap-2 border-b border-slate-100 pb-2.5">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-900 mb-0.5">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>Vie Scolaire & Dates Clés</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
              Actualités & Événements
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md">
            Les dernières nouvelles de l’établissement et l'agenda officiel des activités du campus à Delmas 50.
          </p>
        </div>

        {/* 3-Column Responsive Grid (1 col on mobile, 3 cols on desktop) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5 items-stretch">
          
          {/* COLONNE 1 : Article à la Une (Featured) */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              <span className="flex items-center gap-1.5 text-blue-900">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>À la Une</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono font-normal">Publication récente</span>
            </div>

            <article 
              onClick={() => onSelectArticle(featuredArticle.id)}
              className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between h-full group hover:border-blue-900/40"
            >
              <div>
                <div className="relative h-44 sm:h-48 overflow-hidden bg-slate-950">
                  <img
                    src={featuredArticle.coverImage}
                    alt={featuredArticle.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                  <div className="absolute top-2.5 left-2.5 bg-blue-900/90 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-blue-400/30 shadow-xs">
                    {featuredArticle.category}
                  </div>
                  <div className="absolute bottom-2.5 left-3 right-3 text-white">
                    <span className="text-[11px] font-mono text-amber-300">
                      {new Date(featuredArticle.publishedAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <h3 className="font-serif font-bold text-base sm:text-lg text-slate-900 group-hover:text-blue-900 transition-colors leading-snug">
                    {featuredArticle.title}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {featuredArticle.excerpt}
                  </p>
                </div>
              </div>

              <div className="p-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-900">
                <span className="group-hover:underline">Lire le communiqué complet</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </article>
          </div>

          {/* COLONNE 2 : Dernières Publications du Collège */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              <span className="flex items-center gap-1.5 text-blue-900">
                <BookOpen className="w-3.5 h-3.5 text-blue-900" />
                <span>Derniers Articles</span>
              </span>
              <button 
                onClick={() => onNavigate('news')}
                className="text-[11px] text-blue-900 hover:underline font-semibold cursor-pointer lowercase first-letter:uppercase"
              >
                tout voir
              </button>
            </div>

            <div className="flex flex-col justify-between h-full space-y-3">
              {secondaryArticles.map((art) => (
                <article
                  key={art.id}
                  onClick={() => onSelectArticle(art.id)}
                  className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer flex gap-3 group hover:border-blue-900/30 flex-1 items-center"
                >
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-slate-950 shrink-0 relative">
                    <img
                      src={art.coverImage}
                      alt={art.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[8px] font-bold px-1.5 py-0.5 rounded">
                      {art.category}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(art.publishedAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                    <h4 className="font-serif font-bold text-xs sm:text-sm text-slate-900 group-hover:text-blue-900 transition-colors line-clamp-2 leading-snug">
                      {art.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 line-clamp-1 leading-normal">
                      {art.excerpt}
                    </p>
                  </div>
                </article>
              ))}

              {/* Quick Link Card to All Articles */}
              <button
                onClick={() => onNavigate('news')}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-blue-900 font-semibold text-xs border border-slate-200/80 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs mt-auto"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Accéder au journal du collège ({publishedNews.length} articles)</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* COLONNE 3 : Calendrier & Activités à Venir */}
          <div className="flex flex-col md:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              <span className="flex items-center gap-1.5 text-blue-900">
                <Calendar className="w-3.5 h-3.5 text-blue-900" />
                <span>Agenda du Collège</span>
              </span>
              <button 
                onClick={() => onNavigate('events')}
                className="text-[11px] text-blue-900 hover:underline font-semibold cursor-pointer lowercase first-letter:uppercase"
              >
                tout voir
              </button>
            </div>

            <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/80 shadow-xs flex flex-col justify-between h-full space-y-2.5">
              <div className="space-y-2">
                {upcomingEvents.map((evt) => {
                  const dateObj = new Date(evt.startDate);
                  const day = dateObj.getDate();
                  const month = dateObj.toLocaleDateString('fr-FR', { month: 'short' });
                  const time = dateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

                  return (
                    <div
                      key={evt.id}
                      onClick={() => onNavigate('events')}
                      className="p-2.5 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-3 cursor-pointer group border border-transparent hover:border-slate-200/70"
                    >
                      {/* Compact Date Badge or Image */}
                      {evt.image ? (
                        <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 relative border border-slate-200 shadow-2xs">
                          <img src={evt.image} alt={evt.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          <span className="absolute bottom-0 inset-x-0 bg-blue-950/80 text-amber-300 text-[8px] font-bold text-center py-0.5 leading-none font-mono">
                            {day} {month}
                          </span>
                        </div>
                      ) : (
                        <div className="w-11 h-11 rounded-xl bg-blue-900 text-white flex flex-col items-center justify-center shrink-0 group-hover:bg-amber-500 transition-colors shadow-2xs">
                          <span className="text-sm font-bold font-mono leading-none">{day}</span>
                          <span className="text-[9px] uppercase font-semibold text-amber-300 group-hover:text-slate-950 mt-0.5">{month}</span>
                        </div>
                      )}

                      {/* Event Details */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-semibold uppercase tracking-wider text-blue-900 bg-blue-50 px-1.5 py-0.5 rounded">
                            {evt.category}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {time}
                          </span>
                        </div>
                        <h4 className="font-semibold text-xs text-slate-900 truncate mt-0.5 group-hover:text-blue-900 transition-colors">
                          {evt.title}
                        </h4>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5 font-mono">
                          <MapPin className="w-3 h-3 text-amber-600 shrink-0" />
                          <span className="truncate">{evt.location}</span>
                        </div>
                      </div>

                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-900 group-hover:translate-x-0.5 transition-all shrink-0" />
                    </div>
                  );
                })}
              </div>

              {/* View Full Agenda Button */}
              <button
                onClick={() => onNavigate('events')}
                className="w-full py-2.5 px-3 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs mt-1"
              >
                <Calendar className="w-3.5 h-3.5 text-amber-300" />
                <span>Voir le calendrier complet ({eventsList.length} dates)</span>
                <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* 3. LES PILIERS D'EXCELLENCE - Compact & Ergonomic Layout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-3.5 sm:mb-4 gap-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-900">
              Pédagogie d’Excellence
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
              Les 4 Piliers du Collège Isaac Newton
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md">
            Un équilibre mesuré entre savoirs académiques traditionnels et compétences modernes du XXIe siècle.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          {SCHOOL_VALUES.map((val, idx) => {
            const icons = [GraduationCap, ShieldCheck, Cpu, Users];
            const Icon = icons[idx] || Award;
            return (
              <div 
                key={idx}
                className="bg-white rounded-xl p-4 border border-slate-200/80 hover:border-blue-900/30 hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  <div className="w-9 h-9 rounded-lg bg-slate-50 text-blue-900 group-hover:bg-blue-900 group-hover:text-white flex items-center justify-center transition-colors mb-2.5">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="font-serif font-bold text-sm sm:text-base text-slate-900 mb-1">
                    {val.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {val.desc}
                  </p>
                </div>
                <div 
                  onClick={() => onNavigate('college')}
                  className="pt-2.5 mt-2.5 border-t border-slate-100 flex items-center text-[11px] font-bold text-blue-900 group-hover:translate-x-0.5 transition-transform cursor-pointer"
                >
                  <span>En savoir plus</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. TÉMOIGNAGES DE NOTRE COMMUNAUTÉ (Slideshow Parents, Lauréats, Enseignants) */}
      <TestimonialSection onNavigate={onNavigate} />

      {/* 4.5. GALERIE DES ACTIVITÉS SCOLAIRES & PÉRISCOLAIRES */}
      <ActivityGallerySection onNavigate={onNavigate} currentUser={currentUser} />

      {/* 5. INTERACTIVE PEDAGOGICAL CYCLES HUB (Compact & Dense) */}
      <section className="bg-slate-50/80 py-5 sm:py-7 border-y border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 sm:space-y-5">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-2.5">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-900">
                Parcours d’Apprentissage
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
                Nos Cycles d’Enseignement
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                Cliquez sur un cycle pour visualiser ses caractéristiques pédagogiques et préinscrire votre enfant.
              </p>
            </div>

            {/* Quick tab switcher buttons */}
            <div className="inline-flex p-1 bg-white rounded-xl border border-slate-200 text-xs shadow-2xs overflow-x-auto max-w-full">
              {[
                { id: 'prescolaire', label: '1. Préscolaire' },
                { id: 'fondamental', label: '2. Fondamental' },
                { id: 'secondaire', label: '3. Secondaire' },
                { id: 'numerique', label: '4. Lab Tech' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveCycleTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap cursor-pointer ${
                    activeCycleTab === tab.id
                      ? 'bg-blue-900 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Active Cycle Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
              
              {/* Text Info */}
              <div className="lg:col-span-7 p-5 sm:p-7 flex flex-col justify-between space-y-3.5">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] sm:text-[11px] font-bold border ${selectedCycle.badgeColor}`}>
                      {selectedCycle.subtitle}
                    </span>
                  </div>

                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-slate-900">
                    {selectedCycle.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-1.5">
                    {selectedCycle.description}
                  </p>

                  <div className="mt-3.5 pt-3.5 border-t border-slate-100">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 mb-2">
                      Points Forts & Spécificités
                    </h4>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                      {selectedCycle.highlights.map((h, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap items-center gap-2.5">
                  <button
                    onClick={() => onNavigate('pre-registration')}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-semibold text-xs shadow-2xs transition-all cursor-pointer"
                  >
                    <span>Préinscrire pour ce cycle</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onNavigate(selectedCycle.targetPage)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-xs transition-colors cursor-pointer"
                  >
                    <span>Programme détaillé</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Visual Banner */}
              <div className="lg:col-span-5 relative min-h-[200px] lg:min-h-full bg-slate-900">
                <img
                  src={selectedCycle.image}
                  alt={selectedCycle.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-4">
                  <p className="text-white text-xs font-serif italic drop-shadow">
                    Collège Isaac Newton · Cadre d'excellence et de rigueur à Delmas 50
                  </p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 6. INTERACTIVE PRE-REGISTRATION SIMULATOR & ELIGIBILITY CHECKER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-blue-900 via-blue-950 to-slate-900 rounded-2xl p-4 sm:p-6 text-white shadow-md border border-blue-800/50">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
            
            <div className="lg:col-span-5 space-y-2.5">
              <span className="text-xs font-mono uppercase tracking-wider text-amber-400">
                Simulateur d’Admission {SCHOOL_INFO.currentYear}
              </span>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-white">
                Quel niveau pour votre enfant ?
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
                Sélectionnez l’âge de votre enfant pour connaître immédiatement le cycle recommandé et les pièces justificatives à rassembler.
              </p>

              {/* Age Slider / Selector */}
              <div className="pt-1">
                <label className="block text-xs font-semibold text-amber-300 mb-1.5">
                  Âge de l’élève : <span className="text-white text-sm font-bold font-mono">{simulatorAge} ans</span>
                </label>
                <input
                  type="range"
                  min="3"
                  max="17"
                  value={simulatorAge}
                  onChange={(e) => setSimulatorAge(e.target.value)}
                  className="w-full accent-amber-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                  <span>3 ans (Préscolaire)</span>
                  <span>9 ans (Fondamental)</span>
                  <span>17 ans (Secondaire)</span>
                </div>
              </div>
            </div>

            {/* Recommendation Result Box */}
            <div className="lg:col-span-7 bg-white/10 backdrop-blur-md rounded-xl p-3.5 sm:p-4 border border-white/15 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2">
                <div>
                  <span className="text-[10px] font-mono uppercase text-amber-300">Orientation suggérée</span>
                  <h4 className="font-serif font-bold text-base text-white">
                    {currentRec.class}
                  </h4>
                </div>
                <span className="px-2.5 py-0.5 rounded bg-amber-400 text-slate-950 text-xs font-bold">
                  {currentRec.cycle}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-slate-400 font-medium text-[11px]">Axe prioritaire :</p>
                  <p className="text-slate-100 font-semibold mt-0.5">{currentRec.focus}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium text-[11px]">Pièces requises :</p>
                  <p className="text-slate-100 font-semibold mt-0.5">{currentRec.docs}</p>
                </div>
              </div>

              <div className="pt-1.5 flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => onNavigate('pre-registration')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-xs transition-all cursor-pointer"
                >
                  <GraduationCap className="w-3.5 h-3.5 text-slate-950" />
                  <span>Lancer la préinscription</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
                <span className="text-[11px] text-slate-300">Dossier examiné sous 48-72h</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 8. FAQ ACCORDION (Dense & Instant Answers) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-50/80 rounded-2xl p-4 sm:p-5 border border-slate-200/80">
          <div className="max-w-2xl mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-900">Questions Fréquentes</span>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
              Renseignements Utiles pour les Parents
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
            {[
              {
                q: "Où se situe exactement le campus du Collège Isaac Newton ?",
                a: "Notre campus principal est situé à Delmas 50, rue Dominique #2 bis, Port-au-Prince, Haïti. L'accès est sécurisé avec un poste de contrôle et un parking intérieur pour les déposes d'élèves."
              },
              {
                q: "Qui assure la direction de l'établissement ?",
                a: "L'établissement est dirigé par son Directeur fondateur, M. Orphe Jean Marie, Professeur de Mathématiques & Sciences Physiques, épaulé par une équipe pédagogique d'excellence."
              },
              {
                q: "Quelles sont les heures d'ouverture du secrétariat ?",
                a: "Les cours ont lieu du lundi au vendredi de 7h30 à 14h00 (7:30 AM - 2:00 PM). Le secrétariat reste ouvert jusqu'à 15h30 (3:30 PM) pour l'accueil des familles et le dépôt de dossiers."
              },
              {
                q: "Quelles sont les pièces obligatoires pour la préinscription ?",
                a: "L'extrait d'acte de naissance (ou copie certifiée), les bulletins des deux dernières années scolaires, 4 photos d'identité et le certificat de passage si applicable."
              },
              {
                q: "Comment joindre l'administration directement ?",
                a: "Vous pouvez joindre le secrétariat par téléphone au +509 3316-0934 / +509 3721-1818 ou par e-mail à contact@collegeisaacnewton.com. Notre équipe répond avec diligence sous 24 à 48 heures."
              }
            ].map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div 
                  key={idx}
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="bg-white rounded-xl p-3 border border-slate-200/80 cursor-pointer hover:border-blue-900/30 transition-all"
                >
                  <div className="flex items-center justify-between gap-2 font-semibold text-slate-900">
                    <span className="flex items-center gap-2">
                      <HelpCircle className="w-3.5 h-3.5 text-blue-900 shrink-0" />
                      <span>{faq.q}</span>
                    </span>
                    <ChevronRight className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                  </div>
                  {isOpen && (
                    <p className="mt-2 text-slate-600 leading-relaxed pl-5 text-[11px] border-t border-slate-100 pt-2 animate-in fade-in">
                      {faq.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 10. FINAL CALL TO ACTION (Compact, High-Converting, With Official Phone & Address) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-gradient-to-r from-blue-900 via-blue-950 to-slate-950 text-white p-5 sm:p-7 relative overflow-hidden shadow-lg">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="max-w-xl space-y-1.5">
              <span className="text-xs font-mono uppercase tracking-widest text-amber-400">
                Année Académique {SCHOOL_INFO.currentYear} · Delmas 50
              </span>
              <h2 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-white leading-tight">
                Assurez l'avenir scolaire de votre enfant
              </h2>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-light">
                Effectifs réduits et suivi rigoureux à Delmas 50 : préinscrivez votre enfant en ligne ou joignez notre secrétariat au <strong className="text-amber-400 font-mono font-semibold">{SCHOOL_INFO.phone}</strong>.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
              <button
                onClick={() => onNavigate('pre-registration')}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow transition-all active:scale-98 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-slate-950" />
                <span>Formulaire de préinscription</span>
              </button>

              <button
                onClick={() => onNavigate('contact')}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-colors cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Contacter l'école</span>
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
