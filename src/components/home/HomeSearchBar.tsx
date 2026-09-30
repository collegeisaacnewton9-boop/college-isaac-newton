import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Search, 
  X, 
  ArrowRight, 
  Sparkles, 
  BookOpen, 
  Flame, 
  Calendar, 
  FileText, 
  GraduationCap, 
  MapPin, 
  ChevronRight, 
  Cpu, 
  CheckCircle2, 
  ShieldCheck,
  Compass,
  CornerDownLeft
} from 'lucide-react';
import { INITIAL_NEWS, INITIAL_EVENTS, INITIAL_DOCUMENTS, SCHOOL_INFO } from '../../data/mockData';

interface HomeSearchBarProps {
  onNavigate: (page: string, subSection?: string) => void;
  onSelectArticle: (articleId: string) => void;
}

interface SearchEntry {
  id: string;
  type: 'admission' | 'programmes' | 'actualites' | 'agenda' | 'general' | 'document';
  title: string;
  category: string;
  badge: string;
  badgeColor: string;
  description: string;
  page: string;
  subSection?: string;
  articleId?: string;
  keywords: string[];
}

export const HomeSearchBar: React.FC<HomeSearchBarProps> = ({ onNavigate, onSelectArticle }) => {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'admissions' | 'programmes' | 'actualites' | 'agenda'>('all');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Quick suggestions tags
  const trendingTags = [
    { label: 'Préinscription 2026-2027', query: 'préinscription' },
    { label: 'Nouveau Secondaire (NS1-NS4)', query: 'secondaire' },
    { label: 'Laboratoire Informatique', query: 'laboratoire' },
    { label: 'Examens d’État 9e AF', query: 'examens' },
    { label: 'Critères & Inscription', query: 'admission' },
    { label: 'Campus Delmas 50', query: 'delmas' },
  ];

  // Comprehensive index
  const searchIndex: SearchEntry[] = useMemo(() => [
    {
      id: 'pre-reg',
      type: 'admission',
      title: 'Formulaire de Préinscription en Ligne',
      category: 'Admissions 2026-2027',
      badge: 'Candidature',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
      description: 'Réservez la place de votre enfant en 4 étapes simples. Session d’admission ouverte pour tous les cycles.',
      page: 'pre-registration',
      keywords: ['préinscription', 'inscription', 'dossier', 'admission', 'candidature', 'place', 'rentrée', 'formulaire'],
    },
    {
      id: 'adm-conditions',
      type: 'admission',
      title: 'Conditions d’Admission & Pièces à Fournir',
      category: 'Admissions',
      badge: 'Dossier',
      badgeColor: 'bg-blue-100 text-blue-900 border-blue-300',
      description: 'Acte de naissance, carnet de notes des 2 dernières années, certificat de passage et 4 photos d’identité.',
      page: 'admissions',
      subSection: 'conditions',
      keywords: ['pièces', 'documents', 'fournitures', 'critères', 'conditions', 'test', 'dossier', 'admission'],
    },
    {
      id: 'adm-faq',
      type: 'admission',
      title: 'Foire Aux Questions des Parents (FAQ)',
      category: 'Admissions',
      badge: 'Renseignements',
      badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      description: 'Modalités de paiement des frais, horaires d’ouverture, accès sécurisé et transport scolaire.',
      page: 'admissions',
      subSection: 'faq',
      keywords: ['faq', 'frais', 'tarifs', 'horaires', 'paiement', 'uniformes', 'scolarité', 'prix', 'coût'],
    },
    {
      id: 'prog-prescolaire',
      type: 'programmes',
      title: 'Cycle Préscolaire (TPS, PS, MS, GS)',
      category: 'Programmes d’Enseignement',
      badge: 'Petite Enfance',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
      description: 'Éveil sensoriel, motricité fine, socialisation harmonieuse et initiation au bilingue créole/français dès 3 ans.',
      page: 'programs',
      subSection: 'prescolaire',
      keywords: ['maternelle', 'préscolaire', 'petite section', 'moyenne section', 'grande section', '3 ans', '4 ans', '5 ans', 'enfant'],
    },
    {
      id: 'prog-fondamental',
      type: 'programmes',
      title: 'Enseignement Fondamental (1ère à 9ème AF)',
      category: 'Programmes d’Enseignement',
      badge: '1er, 2e & 3e Cycles',
      badgeColor: 'bg-blue-100 text-blue-900 border-blue-300',
      description: 'Maîtrise approfondie des fondamentaux : mathématiques, français, sciences et préparation intensive à la 9e AF.',
      page: 'programs',
      subSection: 'fondamental',
      keywords: ['fondamental', 'primaire', '1ère', '6ème', '7ème', '8ème', '9ème af', 'examen d’état', 'brevet'],
    },
    {
      id: 'prog-secondaire',
      type: 'programmes',
      title: 'Nouveau Secondaire (NS1 à NS4 Baccalauréat)',
      category: 'Programmes d’Enseignement',
      badge: 'Secondaire & Bac',
      badgeColor: 'bg-purple-100 text-purple-900 border-purple-300',
      description: 'Filières Scientifiques (SVT/SMP) et Économiques. Encadrement méthodologique d’excellence pour le Baccalauréat.',
      page: 'programs',
      subSection: 'secondaire',
      keywords: ['secondaire', 'bac', 'baccalauréat', 'ns1', 'ns2', 'ns3', 'ns4', 'sciences', 'université', 'philo'],
    },
    {
      id: 'prog-labo',
      type: 'programmes',
      title: 'Pôle Numérique & Laboratoire Informatique',
      category: 'Installations & Pédagogie',
      badge: 'Technologie',
      badgeColor: 'bg-sky-100 text-sky-900 border-sky-300',
      description: 'Postes modernes connectés avec onduleurs et générateur. Pratique bureautique, algorithmique et codage.',
      page: 'programs',
      subSection: 'numerique',
      keywords: ['laboratoire', 'informatique', 'ordinateurs', 'technologie', 'numérique', 'codage', 'labo', 'pc', 'internet'],
    },
    {
      id: 'gen-college-histoire',
      type: 'general',
      title: 'Le Collège : Fondation, Vision & Équipe',
      category: 'Institution',
      badge: 'Delmas 50',
      badgeColor: 'bg-slate-100 text-slate-900 border-slate-300',
      description: 'Fondé en 2014, le Collège Isaac Newton forme les esprits libres et responsables dans un cadre serein.',
      page: 'college',
      subSection: 'histoire',
      keywords: ['histoire', 'direction', 'équipe', 'mission', 'valeurs', 'fondation', 'professeurs', 'campus', 'delmas 50'],
    },
    {
      id: 'gen-contact',
      type: 'general',
      title: 'Secrétariat & Contact Direct (Delmas 50)',
      category: 'Secrétariat',
      badge: '+509 3721-1818',
      badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      description: 'Accueil du public à Delmas 50. Réception des dossiers et assistance téléphonique du lundi au vendredi.',
      page: 'contact',
      keywords: ['contact', 'téléphone', 'adresse', 'delmas 50', 'secrétariat', 'courriel', 'email', 'localisation'],
    },
    // News articles mapping
    ...INITIAL_NEWS.map((art) => ({
      id: `news-${art.id}`,
      type: 'actualites' as const,
      title: art.title,
      category: `Actualité · ${art.category}`,
      badge: 'Article',
      badgeColor: 'bg-rose-100 text-rose-900 border-rose-300',
      description: art.excerpt,
      page: 'news',
      articleId: art.id,
      keywords: [art.title, art.category, 'actualité', 'nouvelle', 'article', 'journal', 'résultat'],
    })),
    // Events mapping
    ...INITIAL_EVENTS.map((evt) => ({
      id: `evt-${evt.id}`,
      type: 'agenda' as const,
      title: evt.title,
      category: `Agenda · ${new Date(evt.startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}`,
      badge: 'Événement',
      badgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-300',
      description: evt.description,
      page: 'events',
      keywords: [evt.title, evt.category, evt.location, 'calendrier', 'événement', 'date', 'agenda', 'activité'],
    })),
  ], []);

  // Normalize string for accent-insensitive search
  const normalize = (str: string) =>
    str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

  // Filtered results
  const filteredResults = useMemo(() => {
    const normalized = normalize(query);

    let list = searchIndex;

    // Filter by tab if selected
    if (activeCategory === 'admissions') {
      list = list.filter((i) => i.type === 'admission');
    } else if (activeCategory === 'programmes') {
      list = list.filter((i) => i.type === 'programmes');
    } else if (activeCategory === 'actualites') {
      list = list.filter((i) => i.type === 'actualites');
    } else if (activeCategory === 'agenda') {
      list = list.filter((i) => i.type === 'agenda');
    }

    if (!normalized) {
      // Default recommended results (Curated highlights)
      return list.slice(0, 6);
    }

    return list.filter((item) => {
      const titleMatch = normalize(item.title).includes(normalized);
      const descMatch = normalize(item.description).includes(normalized);
      const catMatch = normalize(item.category).includes(normalized);
      const kwMatch = item.keywords.some((kw) => normalize(kw).includes(normalized));
      return titleMatch || descMatch || catMatch || kwMatch;
    }).slice(0, 8);
  }, [query, activeCategory, searchIndex]);

  const handleSelect = (item: SearchEntry) => {
    if (item.type === 'actualites' && item.articleId) {
      onSelectArticle(item.articleId);
    } else {
      onNavigate(item.page, item.subSection);
    }
    setIsOpen(false);
  };

  const handleTagClick = (tagQuery: string) => {
    setQuery(tagQuery);
    setIsOpen(true);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredResults.length > 0) {
        handleSelect(filteredResults[0]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <section 
      id="home-search-section" 
      ref={containerRef}
      className="relative z-30 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-2 sm:-mt-3"
      aria-label="Barre de recherche interactive de l'établissement"
    >
      {/* Horizontal Search Card with Shadow & Border */}
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg border border-slate-200/90 p-3.5 sm:p-4.5 transition-all hover:border-blue-900/30">
        
        {/* Main Search Input Form */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          
          {/* Input field with icon */}
          <div className="relative flex-1 flex items-center bg-slate-50/90 hover:bg-slate-50 focus-within:bg-white rounded-xl border border-slate-200 focus-within:border-blue-900 focus-within:ring-2 focus-within:ring-blue-900/15 transition-all px-3 py-1.5 sm:py-2">
            <Search className="w-5 h-5 text-blue-900 shrink-0 mr-2.5" />
            
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              onKeyDown={handleKeyDown}
              placeholder="Rechercher une formation, les admissions, un bulletin, le calendrier..."
              className="w-full bg-transparent text-xs sm:text-sm md:text-base text-slate-900 placeholder:text-slate-400 outline-none font-medium"
            />

            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  inputRef.current?.focus();
                }}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors mr-1 cursor-pointer"
                title="Effacer la recherche"
                aria-label="Effacer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Filter Pills (Horizontal buttons inside the bar) */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5">
            {[
              { id: 'all', label: 'Tout explorer' },
              { id: 'admissions', label: 'Admissions' },
              { id: 'programmes', label: 'Programmes' },
              { id: 'actualites', label: 'Actualités' },
              { id: 'agenda', label: 'Agenda' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setActiveCategory(cat.id as any);
                  setIsOpen(true);
                  inputRef.current?.focus();
                }}
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-blue-900 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Action Button */}
          <button
            type="button"
            onClick={() => {
              if (filteredResults.length > 0) {
                handleSelect(filteredResults[0]);
              } else {
                setIsOpen(true);
              }
            }}
            className="sm:shrink-0 inline-flex items-center justify-center gap-1.5 px-4 py-2 sm:py-2.5 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer active:scale-98"
          >
            <Search className="w-4 h-4 text-amber-400" />
            <span className="whitespace-nowrap">Rechercher</span>
          </button>
        </div>

        {/* Quick Trending Tags (Horizontal clickable pills under the input) */}
        <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1 shrink-0">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>Accès rapides :</span>
          </span>
          {trendingTags.map((tag) => (
            <button
              key={tag.label}
              type="button"
              onClick={() => handleTagClick(tag.query)}
              className="text-[11px] font-medium text-slate-600 hover:text-blue-900 bg-slate-100 hover:bg-blue-50 px-2.5 py-1 rounded-lg border border-slate-200/60 transition-colors cursor-pointer"
            >
              {tag.label}
            </button>
          ))}
        </div>

        {/* INLINE FLUID LIVE DROPDOWN RESULTS (Appears smoothly below the horizontal bar) */}
        {isOpen && (
          <div className="mt-3.5 pt-3.5 border-t border-slate-200 animate-in fade-in slide-in-from-top-2 duration-150">
            
            <div className="flex items-center justify-between px-1 pb-2.5 text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
              <span>
                {query 
                  ? `Résultats pour « ${query} » (${filteredResults.length})` 
                  : `Suggestions & Rubriques Populaires (${filteredResults.length})`}
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-xs normal-case font-medium flex items-center gap-1 cursor-pointer"
              >
                <span>Fermer</span>
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {filteredResults.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-2.5 max-h-[380px] overflow-y-auto pr-1">
                {filteredResults.map((item) => {
                  let Icon = BookOpen;
                  if (item.type === 'admission') Icon = CheckCircle2;
                  if (item.type === 'actualites') Icon = Flame;
                  if (item.type === 'agenda') Icon = Calendar;
                  if (item.type === 'general') Icon = Compass;

                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelect(item)}
                      className="p-3 rounded-xl bg-slate-50/80 hover:bg-blue-50/70 border border-slate-200/70 hover:border-blue-900/30 transition-all cursor-pointer group flex items-start justify-between gap-2.5 shadow-2xs"
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-white group-hover:bg-blue-900 text-blue-900 group-hover:text-white flex items-center justify-center shrink-0 border border-slate-200 group-hover:border-blue-900 transition-colors mt-0.5">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded border ${item.badgeColor}`}>
                              {item.badge}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              · {item.category}
                            </span>
                          </div>
                          <h4 className="text-xs sm:text-sm font-semibold text-slate-900 group-hover:text-blue-900 transition-colors mt-0.5 truncate">
                            {item.title}
                          </h4>
                          <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                            {item.description}
                          </p>
                        </div>
                      </div>

                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-900 group-hover:translate-x-0.5 transition-all shrink-0 mt-2" />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center space-y-2 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <Search className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs sm:text-sm font-semibold text-slate-700">
                  Aucun résultat ne correspond à votre recherche « {query} »
                </p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Consultez notre secrétariat à Delmas 50 ou appelez le <strong>{SCHOOL_INFO.phone}</strong>.
                </p>
              </div>
            )}

            {/* Bottom quick callout */}
            <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-500 px-1">
              <span>Appuyez sur <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded font-mono text-[10px]">Entrée ↵</kbd> pour ouvrir le 1er résultat</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onNavigate('contact')}
                  className="font-medium text-blue-900 hover:underline cursor-pointer"
                >
                  Contacter le secrétariat →
                </button>
              </div>
            </div>

          </div>
        )}

      </div>
    </section>
  );
};
