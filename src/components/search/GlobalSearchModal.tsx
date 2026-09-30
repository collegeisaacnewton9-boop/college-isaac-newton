import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Search, 
  X, 
  ArrowRight, 
  Calendar, 
  FileText, 
  GraduationCap, 
  BookOpen, 
  MapPin, 
  Clock, 
  Flame, 
  Compass, 
  CornerDownLeft, 
  Sparkles, 
  ChevronRight,
  ShieldCheck,
  Phone
} from 'lucide-react';
import { INITIAL_NEWS, INITIAL_EVENTS, INITIAL_DOCUMENTS, SCHOOL_INFO } from '../../data/mockData';

export interface SearchResultItem {
  id: string;
  type: 'page' | 'news' | 'event' | 'document';
  title: string;
  subtitle: string;
  description?: string;
  category?: string;
  date?: string;
  meta?: string;
  page: string;
  subSection?: string;
  articleId?: string;
  badgeColor?: string;
}

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: string, subSection?: string) => void;
  onSelectArticle?: (articleId: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onSelectArticle,
}) => {
  const [query, setQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'page' | 'news' | 'event' | 'document'>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Focus input on open & disable background scroll
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setQuery('');
      setSelectedIndex(0);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Global static pages index
  const sitePages: SearchResultItem[] = useMemo(() => [
    {
      id: 'page-home',
      type: 'page',
      title: 'Accueil - Collège Isaac Newton',
      subtitle: 'Portail officiel du campus de Delmas 50',
      description: 'Découvrez notre projet éducatif, nos 4 piliers, les actualités et le calendrier des activités.',
      page: 'home',
      category: 'Général',
    },
    {
      id: 'page-college-histoire',
      type: 'page',
      title: 'Notre Histoire & Fondation',
      subtitle: 'Le Collège · Fondé en 2014 à Delmas 50',
      description: 'L’histoire, les valeurs républicaines et l’héritage académique du Collège Isaac Newton.',
      page: 'college',
      subSection: 'histoire',
      category: 'Institution',
    },
    {
      id: 'page-college-mission',
      type: 'page',
      title: 'Mission & Vision Pédagogique',
      subtitle: 'Le Collège · Savoir aujourd’hui, réussir demain',
      description: 'Former des citoyens intègres, critiques et préparés aux enjeux scientifiques contemporains.',
      page: 'college',
      subSection: 'mission',
      category: 'Institution',
    },
    {
      id: 'page-college-equipe',
      type: 'page',
      title: 'Direction & Corps Professoral',
      subtitle: 'Le Collège · Équipe pédagogique qualifiée',
      description: 'Encadrement attentif, professeurs chevronnés et direction générale accessible aux familles.',
      page: 'college',
      subSection: 'equipe',
      category: 'Institution',
    },
    {
      id: 'page-college-infra',
      type: 'page',
      title: 'Infrastructures & Campus Delmas 50',
      subtitle: 'Le Collège · Sécurité et installations à Delmas 50',
      description: 'Salles climatisées, cour récréative, terrain multisports et laboratoire informatique.',
      page: 'college',
      subSection: 'infrastructures',
      category: 'Campus',
    },
    {
      id: 'page-prescolaire',
      type: 'page',
      title: 'Cycle Préscolaire (TPS, PS, MS, GS)',
      subtitle: 'Programmes · De 3 à 5 ans',
      description: 'Éveil sensoriel, socialisation, développement du langage bilingue et pré-lecture en milieu sécurisé.',
      page: 'programs',
      subSection: 'prescolaire',
      category: 'Cycles',
    },
    {
      id: 'page-fondamental',
      type: 'page',
      title: 'Enseignement Fondamental (1e à 9e AF)',
      subtitle: 'Programmes · 1er, 2e et 3e Cycles Fondamentaux',
      description: 'Socles fondamentaux en maths, français, sciences et préparation rigoureuse aux examens d’État de 9e AF.',
      page: 'programs',
      subSection: 'fondamental',
      category: 'Cycles',
    },
    {
      id: 'page-secondaire',
      type: 'page',
      title: 'Nouveau Secondaire (NS1 à NS4 Baccalauréat)',
      subtitle: 'Programmes · Filières Scientifiques & Économiques',
      description: 'Préparation académique exigeante au baccalauréat et accès aux grandes facultés et universités.',
      page: 'programs',
      subSection: 'secondaire',
      category: 'Cycles',
    },
    {
      id: 'page-numerique',
      type: 'page',
      title: 'Pôle Numérique & Laboratoire Informatique',
      subtitle: 'Programmes · Équipements récents sous onduleurs',
      description: 'Bureautique, logique algorithmique, initiation au code et recherche documentaire sécurisée.',
      page: 'programs',
      subSection: 'numerique',
      category: 'Technologie',
    },
    {
      id: 'page-pre-registration',
      type: 'page',
      title: 'Formulaire de Préinscription en Ligne',
      subtitle: 'Admissions · Année Académique 2026-2027',
      description: 'Dépôt de candidature rapide en 4 étapes pour réserver la place de votre enfant.',
      page: 'pre-registration',
      category: 'Admissions',
    },
    {
      id: 'page-admissions-conditions',
      type: 'page',
      title: 'Conditions d’Admission & Pièces à Fournir',
      subtitle: 'Admissions · Critères et dossier requis',
      description: 'Actes de naissance, bulletins scolaires antérieurs, certificats officiels et tests diagnostiques.',
      page: 'admissions',
      subSection: 'conditions',
      category: 'Admissions',
    },
    {
      id: 'page-admissions-faq',
      type: 'page',
      title: 'Questions Fréquentes des Parents (FAQ)',
      subtitle: 'Admissions · Réponses aux interrogations régulières',
      description: 'Frais, horaires de cours, uniformes, transport et modalités d’inscription.',
      page: 'admissions',
      subSection: 'faq',
      category: 'Admissions',
    },
    {
      id: 'page-events',
      type: 'page',
      title: 'Calendrier Scolaire & Agenda Officiel',
      subtitle: 'Vie Scolaire · Dates d’examens, réunions et activités',
      description: 'Consultez l’ensemble des événements scolaires, foires scientifiques et examens blancs prévus.',
      page: 'events',
      category: 'Vie Scolaire',
    },
    {
      id: 'page-news',
      type: 'page',
      title: 'Journal & Actualités du Collège',
      subtitle: 'Vie Scolaire · Communiqués officiels et palmarès',
      description: 'Articles récents, résultats aux examens officiels et annonces de la direction.',
      page: 'news',
      category: 'Vie Scolaire',
    },
    {
      id: 'page-gallery',
      type: 'page',
      title: 'Galerie Photos du Campus',
      subtitle: 'Vie Scolaire · Immersion visuelle à Delmas 50',
      description: 'Photographies de la cour, des salles de cours, du laboratoire multimédia et des élèves en uniforme.',
      page: 'gallery',
      category: 'Vie Scolaire',
    },
    {
      id: 'page-school-life-clubs',
      type: 'page',
      title: 'Activités Périscolaires & Clubs',
      subtitle: 'Vie Scolaire · Sport, débat, théâtre & sciences',
      description: 'Épanouissement personnel, tournois de basket interclasses et ateliers créatifs.',
      page: 'school-life',
      subSection: 'activites',
      category: 'Vie Scolaire',
    },
    {
      id: 'page-contact',
      type: 'page',
      title: 'Contact Direct & Secrétariat',
      subtitle: 'Delmas 50 · +509 3721-1818',
      description: 'Plan d’accès au campus, horaires de réception et formulaire de correspondance administrative.',
      page: 'contact',
      category: 'Contact',
    },
    {
      id: 'page-resources-docs',
      type: 'page',
      title: 'Documents Officiels à Télécharger',
      subtitle: 'Ressources · Règlement intérieur, listes de fournitures',
      description: 'Fichiers PDF téléchargeables pour les familles et élèves.',
      page: 'resources',
      subSection: 'documents',
      category: 'Ressources',
    },
    {
      id: 'page-legal',
      type: 'page',
      title: 'Mentions Légales & Agréments',
      subtitle: 'Informations juridiques · Reconnaissance MENFP',
      description: 'Statut de l’établissement et conformité aux normes éducatives nationales.',
      page: 'legal',
      category: 'Légal',
    },
    {
      id: 'page-privacy',
      type: 'page',
      title: 'Politique de Confidentialité & Protection des Données',
      subtitle: 'Confidentialité · Gestion sécurisée des dossiers',
      description: 'Règles de traitement des dossiers scolaires et respect de la vie privée des familles.',
      page: 'privacy',
      category: 'Légal',
    },
  ], []);

  // News items transformed
  const newsItems: SearchResultItem[] = useMemo(() => {
    return INITIAL_NEWS.map((art) => ({
      id: art.id,
      type: 'news' as const,
      title: art.title,
      subtitle: `Article · ${art.category} (${new Date(art.publishedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })})`,
      description: art.excerpt,
      category: art.category,
      date: art.publishedAt,
      page: 'news',
      articleId: art.id,
    }));
  }, []);

  // Events items transformed
  const eventItems: SearchResultItem[] = useMemo(() => {
    return INITIAL_EVENTS.map((evt) => {
      const d = new Date(evt.startDate);
      const dateStr = d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
      return {
        id: evt.id,
        type: 'event' as const,
        title: evt.title,
        subtitle: `Événement · ${dateStr} (${evt.category})`,
        description: evt.description,
        category: evt.category,
        meta: evt.location,
        page: 'events',
      };
    });
  }, []);

  // Document items transformed
  const documentItems: SearchResultItem[] = useMemo(() => {
    return INITIAL_DOCUMENTS.map((doc) => ({
      id: doc.id,
      type: 'document' as const,
      title: doc.title,
      subtitle: `Document ${doc.fileType} (${doc.fileSize}) · Année ${doc.schoolYear}`,
      description: doc.description,
      category: doc.category,
      page: 'resources',
      subSection: 'documents',
    }));
  }, []);

  // Combined and filtered search results
  const searchResults = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    
    // Normalize string without accents
    const normalize = (str: string) =>
      str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

    const normalizedQuery = normalize(trimmed);

    let allItems: SearchResultItem[] = [
      ...sitePages,
      ...newsItems,
      ...eventItems,
      ...documentItems,
    ];

    if (selectedFilter !== 'all') {
      allItems = allItems.filter((item) => item.type === selectedFilter);
    }

    if (!normalizedQuery) {
      // Default recommended / curated quick links
      return allItems.slice(0, 7);
    }

    return allItems.filter((item) => {
      const titleMatch = normalize(item.title).includes(normalizedQuery);
      const subMatch = normalize(item.subtitle).includes(normalizedQuery);
      const descMatch = item.description ? normalize(item.description).includes(normalizedQuery) : false;
      const catMatch = item.category ? normalize(item.category).includes(normalizedQuery) : false;
      const metaMatch = item.meta ? normalize(item.meta).includes(normalizedQuery) : false;
      return titleMatch || subMatch || descMatch || catMatch || metaMatch;
    }).slice(0, 15);
  }, [query, selectedFilter, sitePages, newsItems, eventItems, documentItems]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchResults]);

  // Keyboard navigation within the modal
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < searchResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : searchResults.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (searchResults[selectedIndex]) {
        handleSelectItem(searchResults[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  const handleSelectItem = (item: SearchResultItem) => {
    if (item.type === 'news' && item.articleId && onSelectArticle) {
      onSelectArticle(item.articleId);
    } else {
      onNavigate(item.page, item.subSection);
    }
    onClose();
  };

  // Quick chips search
  const quickSearches = [
    'Préinscription',
    'Nouveau Secondaire',
    'Laboratoire Informatique',
    'Conditions d’admission',
    'Examens d’État 9e AF',
    'Delmas 50',
    'Règlement intérieur',
    'Calendrier',
  ];

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-start justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-150"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-label="Recherche globale sur le site du Collège Isaac Newton"
    >
      <div 
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-4 sm:my-8 flex flex-col max-h-[88vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="relative flex items-center px-4 py-3 sm:py-3.5 border-b border-slate-200 bg-white">
          <Search className="w-5 h-5 text-blue-900 shrink-0 mr-3" />
          
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher une page, un article, un examen, un événement..."
            className="w-full text-sm sm:text-base text-slate-900 placeholder:text-slate-400 bg-transparent outline-none font-medium"
            autoComplete="off"
            spellCheck="false"
          />

          {query && (
            <button
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors mr-2 cursor-pointer"
              title="Effacer la recherche"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={onClose}
            className="hidden sm:inline-flex items-center px-2 py-0.5 rounded border border-slate-200 text-[11px] font-mono font-medium text-slate-500 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Fermer la recherche (Échap)"
          >
            ÉCHAP
          </button>

          <button
            onClick={onClose}
            className="sm:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-700"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Filters Bar */}
        <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-50/80 border-b border-slate-100 overflow-x-auto text-xs scrollbar-none">
          <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider pl-1 pr-1 shrink-0">
            Filtres :
          </span>
          {[
            { id: 'all', label: 'Tous les résultats' },
            { id: 'page', label: 'Pages & Rubriques' },
            { id: 'news', label: 'Actualités' },
            { id: 'event', label: 'Événements' },
            { id: 'document', label: 'Documents' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setSelectedFilter(f.id as any)}
              className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedFilter === f.id
                  ? 'bg-blue-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Results Body */}
        <div 
          ref={listRef}
          className="flex-1 overflow-y-auto p-2 sm:p-3 divide-y divide-slate-100"
        >
          {searchResults.length > 0 ? (
            <div className="space-y-1">
              {!query && (
                <div className="px-2 pt-1 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Accès rapides recommandés</span>
                  <span className="font-normal lowercase font-sans text-slate-400">suggestions</span>
                </div>
              )}

              {searchResults.map((item, index) => {
                const isSelected = index === selectedIndex;

                // Icons by type
                let Icon = Compass;
                let badgeClass = 'bg-blue-50 text-blue-900 border-blue-200';
                let typeLabel = 'Page';

                if (item.type === 'news') {
                  Icon = Flame;
                  badgeClass = 'bg-amber-50 text-amber-900 border-amber-200';
                  typeLabel = 'Actualité';
                } else if (item.type === 'event') {
                  Icon = Calendar;
                  badgeClass = 'bg-emerald-50 text-emerald-900 border-emerald-200';
                  typeLabel = 'Événement';
                } else if (item.type === 'document') {
                  Icon = FileText;
                  badgeClass = 'bg-purple-50 text-purple-900 border-purple-200';
                  typeLabel = 'Document';
                }

                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectItem(item)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`p-2.5 sm:p-3 rounded-xl transition-all flex items-start gap-3 cursor-pointer group ${
                      isSelected
                        ? 'bg-blue-50/80 border border-blue-200/80 shadow-2xs'
                        : 'hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    {/* Leading Icon Badge */}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                      isSelected ? 'bg-blue-900 text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-blue-900 group-hover:text-white'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${badgeClass}`}>
                          {typeLabel}
                        </span>
                        {item.category && (
                          <span className="text-[10px] text-slate-500 font-medium">
                            · {item.category}
                          </span>
                        )}
                        {item.meta && (
                          <span className="text-[10px] text-slate-400 font-mono flex items-center gap-0.5">
                            <MapPin className="w-2.5 h-2.5 text-amber-600" />
                            <span>{item.meta}</span>
                          </span>
                        )}
                      </div>

                      <h4 className="font-semibold text-xs sm:text-sm text-slate-900 mt-1 group-hover:text-blue-900 transition-colors leading-snug">
                        {item.title}
                      </h4>

                      <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 line-clamp-1">
                        {item.description || item.subtitle}
                      </p>
                    </div>

                    {/* Select indicator */}
                    <div className="shrink-0 flex items-center mt-2.5">
                      <ChevronRight className={`w-4 h-4 transition-transform ${
                        isSelected ? 'text-blue-900 translate-x-0.5' : 'text-slate-300'
                      }`} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-10 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <Search className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold text-sm text-slate-800">
                  Aucun résultat pour « {query} »
                </p>
                <p className="text-xs text-slate-500 mt-0.5 max-w-sm mx-auto">
                  Vérifiez l’orthographe ou essayez des mots-clés plus larges comme <em>préinscription</em>, <em>secondaire</em> ou <em>contact</em>.
                </p>
              </div>
            </div>
          )}

          {/* Quick Suggestions below when empty or few results */}
          {!query && (
            <div className="p-3 pt-4 border-t border-slate-100">
              <p className="text-[11px] font-semibold text-slate-500 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Recherches fréquentes des parents & élèves :</span>
              </p>
              <div className="flex flex-wrap gap-1.5">
                {quickSearches.map((term) => (
                  <button
                    key={term}
                    onClick={() => {
                      setQuery(term);
                      inputRef.current?.focus();
                    }}
                    className="px-2.5 py-1 rounded-lg text-xs bg-slate-100 hover:bg-blue-50 hover:text-blue-900 text-slate-700 transition-colors cursor-pointer"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Keyboard Shortcuts */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono text-[10px] text-slate-600 shadow-2xs">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono text-[10px] text-slate-600 shadow-2xs">↓</kbd>
              <span>Naviguer</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono text-[10px] text-slate-600 shadow-2xs">↵</kbd>
              <span>Ouvrir</span>
            </span>
            <span className="inline-flex items-center gap-1 hidden sm:inline-flex">
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono text-[10px] text-slate-600 shadow-2xs">Échap</kbd>
              <span>Fermer</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-600">
            <Phone className="w-3 h-3 text-amber-600" />
            <span className="font-mono">{SCHOOL_INFO.phone}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
