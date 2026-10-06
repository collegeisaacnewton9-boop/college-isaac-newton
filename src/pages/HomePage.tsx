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
  MapPin, 
  Flame,
  Edit3
} from 'lucide-react';
import { SCHOOL_IMAGES } from '../assets/images';
import { SCHOOL_INFO, SCHOOL_VALUES, INITIAL_NEWS, INITIAL_EVENTS, DEFAULT_EDUCATIONAL_CYCLES } from '../data/mockData';
import { HeroCarousel } from '../components/layout/HeroCarousel';
import { EventCountdownWidget } from '../components/home/EventCountdownWidget';
import { InfrastructureCarousel } from '../components/home/InfrastructureCarousel';
import { ActivityGallerySection } from '../components/home/ActivityGallerySection';
import { TestimonialSection } from '../components/home/TestimonialsSection';
import { apiService } from '../services/api';
import { NewsArticle, SchoolEvent, User, SiteSettings } from '../types';
import { ContentEditable } from '../components/common/ContentEditable';

interface HomePageProps {
  onNavigate: (page: string, subSection?: string) => void;
  onSelectArticle: (articleId: string) => void;
  currentUser?: User | null;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onSelectArticle, currentUser }) => {
  // Interactive cycle explorer tab
  const [activeCycleTab, setActiveCycleTab] = useState<'prescolaire' | 'fondamental' | 'secondaire' | 'numerique'>('fondamental');
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  // Dynamic news articles & events state
  const [newsList, setNewsList] = useState<NewsArticle[]>(INITIAL_NEWS);
  const [eventsList, setEventsList] = useState<SchoolEvent[]>(INITIAL_EVENTS);

  useEffect(() => {
    apiService.getSettings().then(setSettings).catch(() => {});
    apiService.getNews().then(setNewsList).catch(() => {});
    apiService.getEvents().then(setEventsList).catch(() => {});

    const onSettingsUpdate = () => {
      apiService.getSettings().then(setSettings).catch(() => {});
    };
    const onNewsUpdate = () => {
      apiService.getNews().then(setNewsList).catch(() => {});
    };
    const onEventsUpdate = () => {
      apiService.getEvents().then(setEventsList).catch(() => {});
    };

    window.addEventListener('cin:settings-updated', onSettingsUpdate);
    window.addEventListener('cin:news-updated', onNewsUpdate);
    window.addEventListener('cin:events-updated', onEventsUpdate);
    return () => {
      window.removeEventListener('cin:settings-updated', onSettingsUpdate);
      window.removeEventListener('cin:news-updated', onNewsUpdate);
      window.removeEventListener('cin:events-updated', onEventsUpdate);
    };
  }, []);

  const cycleDetails = settings?.educationalCycles || DEFAULT_EDUCATIONAL_CYCLES;
  const selectedCycle = cycleDetails[activeCycleTab] || DEFAULT_EDUCATIONAL_CYCLES[activeCycleTab];


  const publishedNews = newsList.filter(n => n.status === 'PUBLISHED');
  const featuredArticle = publishedNews.find(n => n.featured) || publishedNews[0] || INITIAL_NEWS[0];
  const secondaryArticles = publishedNews.filter(n => n.id !== featuredArticle.id).slice(0, 2);
  const upcomingEvents = eventsList.filter(e => e.isPublic !== false).slice(0, 4); // Calendrier à venir dynamique

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-7">
      
      {/* 1. HERO CAROUSEL - Framer Motion, campus building & lab photos, uncluttered layout */}
      <HeroCarousel onNavigate={onNavigate} />

      {/* 2. COMPTE À REBOURS ÉVÉNEMENTS IMPORTANTS - Live countdown synchronized with DB */}
      <EventCountdownWidget onNavigate={onNavigate} currentUser={currentUser} />

      {/* 3. SECTION 'ACTUALITÉS ET ÉVÉNEMENTS' - Responsive 3 Columns Desktop, 1 Column Mobile */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Actualités et Événements du Collège">
        {/* Section Header - Compact & Clean */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-4 sm:mb-5 gap-2 border-b border-slate-100 pb-2.5">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-900 mb-0.5">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <ContentEditable
                contentKey="home.news.badge"
                defaultContent="Vie Scolaire & Dates Clés"
                as="span"
                currentUser={currentUser}
                multiline={false}
              />
            </div>
            <ContentEditable
              contentKey="home.news.title"
              defaultContent="Actualités & Événements"
              as="h2"
              className="font-serif text-2xl sm:text-3xl font-bold text-slate-900"
              currentUser={currentUser}
              multiline={false}
            />
          </div>
          <ContentEditable
            contentKey="home.news.subtitle"
            defaultContent="Les dernières nouvelles de l’établissement et l'agenda officiel des activités du campus à Delmas 50."
            as="p"
            className="text-xs sm:text-sm text-slate-600 max-w-md"
            currentUser={currentUser}
          />
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
                <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
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

      {/* 4. LES PILIERS D'EXCELLENCE - Compact & Ergonomic Layout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-3.5 sm:mb-4 gap-2">
          <div>
            <ContentEditable
              contentKey="home.pillars.badge"
              defaultContent="Pédagogie d’Excellence"
              as="span"
              className="text-xs font-bold uppercase tracking-wider text-blue-900"
              currentUser={currentUser}
              multiline={false}
            />
            <ContentEditable
              contentKey="home.pillars.title"
              defaultContent="Les 4 Piliers du Collège Isaac Newton"
              as="h2"
              className="font-serif text-2xl sm:text-3xl font-bold text-slate-900"
              currentUser={currentUser}
              multiline={false}
            />
          </div>
          <ContentEditable
            contentKey="home.pillars.desc"
            defaultContent="Un équilibre mesuré entre savoirs académiques traditionnels et compétences modernes du XXIe siècle."
            as="p"
            className="text-xs sm:text-sm text-slate-600 max-w-md"
            currentUser={currentUser}
          />
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
                  <ContentEditable
                    contentKey={`home.pillar.${idx}.title`}
                    defaultContent={val.title}
                    as="h3"
                    className="font-serif font-bold text-sm sm:text-base text-slate-900 mb-1"
                    currentUser={currentUser}
                    multiline={false}
                  />
                  <ContentEditable
                    contentKey={`home.pillar.${idx}.desc`}
                    defaultContent={val.desc}
                    as="p"
                    className="text-xs text-slate-600 leading-relaxed"
                    currentUser={currentUser}
                  />
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
      <TestimonialSection onNavigate={onNavigate} currentUser={currentUser} />

      {/* 4.5. GALERIE DES ACTIVITÉS SCOLAIRES & PÉRISCOLAIRES */}
      <ActivityGallerySection onNavigate={onNavigate} currentUser={currentUser} />

      {/* 5. INTERACTIVE PEDAGOGICAL CYCLES HUB - Modern, Fluid, Compact Ergonomics */}
      <section className="bg-slate-50/80 py-4 sm:py-6 border-y border-slate-200/70" aria-label="Cycles d'enseignement">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3 sm:space-y-4">
          
          {/* Section Header & Tabs Switcher */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3 sm:gap-4">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-1">
                <ContentEditable
                  contentKey="home.cycles.badge"
                  defaultContent="Parcours d’Apprentissage"
                  as="span"
                  className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-blue-900"
                  currentUser={currentUser}
                  multiline={false}
                />
                {currentUser && ['ADMIN', 'EDITOR'].includes(currentUser.role) && (
                  <button
                    type="button"
                    onClick={() => onNavigate('admin', 'cms')}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-900 font-semibold text-[10px] border border-amber-300 transition-colors cursor-pointer shadow-2xs"
                    title="Gérer les cycles d'enseignement dans l'administration"
                  >
                    <Edit3 className="w-3 h-3 text-amber-700" />
                    <span>Modifier les cycles</span>
                  </button>
                )}
              </div>
              <ContentEditable
                contentKey="home.cycles.title"
                defaultContent="Nos Cycles d’Enseignement"
                as="h2"
                className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight"
                currentUser={currentUser}
                multiline={false}
              />
              <ContentEditable
                contentKey="home.cycles.desc"
                defaultContent="Un accompagnement continu de la Petite Enfance jusqu'au Baccalauréat d'État. Cliquez sur un cycle pour visualiser ses spécificités."
                as="p"
                className="text-xs sm:text-sm text-slate-600 mt-0.5 leading-relaxed"
                currentUser={currentUser}
              />
            </div>

            {/* Modern Tab Bar - Clean, Fluid, Zero Ugly Scrollbar, Responsive */}
            <div className="shrink-0 w-full lg:w-auto">
              <div 
                role="tablist"
                aria-label="Sélection des cycles d'enseignement"
                className="flex items-center gap-1 sm:gap-1.5 p-1 bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
              >
                {[
                  { id: 'prescolaire', num: '1', label: 'Préscolaire', icon: Sparkles },
                  { id: 'fondamental', num: '2', label: 'Fondamental', icon: BookOpen },
                  { id: 'secondaire', num: '3', label: 'Secondaire', icon: GraduationCap },
                  { id: 'numerique', num: '4', label: 'Lab Tech', icon: Cpu },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeCycleTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setActiveCycleTab(tab.id as any)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-[12.5px] font-bold transition-all whitespace-nowrap cursor-pointer select-none ${
                        isActive
                          ? 'bg-blue-900 text-white shadow-sm ring-1 ring-blue-950/20'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {tab.num}
                      </span>
                      <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-300' : 'text-slate-400'}`} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Active Cycle Card - Compact, Ergonomic 2-Column Responsive Layout */}
          <div 
            key={activeCycleTab}
            className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md transition-shadow animate-fade-in"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 items-stretch">
              
              {/* Text Info Column */}
              <div className="lg:col-span-7 p-4 sm:p-6 lg:p-7 flex flex-col justify-between space-y-3 sm:space-y-3.5">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10.5px] sm:text-[11px] font-bold border ${selectedCycle.badgeColor || 'bg-blue-100 text-blue-900 border-blue-200'}`}>
                      {selectedCycle.subtitle}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Inscriptions 2026-2027 Ouvertes
                    </span>
                  </div>

                  <h3 className="font-serif text-xl sm:text-2xl lg:text-[26px] font-bold text-slate-900 tracking-tight leading-snug">
                    {selectedCycle.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
                    {selectedCycle.description}
                  </p>

                  <div className="pt-2 sm:pt-2.5 border-t border-slate-100">
                    <h4 className="text-[10.5px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-800 mb-2 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-900" />
                      <span>Points Forts & Spécificités</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11.5px] sm:text-xs">
                      {selectedCycle.highlights?.map((h, i) => (
                        <div 
                          key={i} 
                          className="flex items-start gap-2 p-2 sm:p-2.5 rounded-xl bg-slate-50/80 hover:bg-emerald-50/40 border border-slate-100 hover:border-emerald-200 transition-colors"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span className="text-slate-700 leading-snug font-medium">{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap items-center gap-2 sm:gap-2.5">
                  <button
                    type="button"
                    onClick={() => onNavigate('pre-registration', activeCycleTab)}
                    className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs shadow-2xs hover:shadow transition-all hover:-translate-y-0.5 cursor-pointer"
                  >
                    <span>Préinscrire pour ce cycle</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigate(selectedCycle.targetPage || 'programs')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 sm:py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-colors cursor-pointer border border-slate-200"
                  >
                    <span>Programme détaillé</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Visual Banner Column */}
              <div className="lg:col-span-5 relative h-[240px] sm:h-[280px] lg:h-auto min-h-[240px] sm:min-h-[280px] lg:min-h-full bg-slate-950 group overflow-hidden shrink-0">
                <img
                  src={selectedCycle.image}
                  alt={selectedCycle.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700 ease-out"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (!target.dataset.triedFallback) {
                      target.dataset.triedFallback = '1';
                      if (target.src.includes('/src/assets/images/')) {
                        target.src = target.src.replace('/src/assets/images/', '/images/');
                      } else {
                        target.src = '/images/campus_courtyard_building_1790531780046.jpg';
                      }
                    }
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent flex items-end p-3 sm:p-4">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/75 backdrop-blur-md border border-white/15 text-white shadow-lg max-w-full">
                    <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                    <span className="text-[11px] font-serif italic truncate">
                      Collège Isaac Newton · Cadre d'excellence et de rigueur à Delmas 50
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 5. GALERIE PHOTO DES INFRASTRUCTURES - Dynamic photo carousel with DB persistence */}
      <InfrastructureCarousel onNavigate={onNavigate} currentUser={currentUser} />

    </div>
  );
};
