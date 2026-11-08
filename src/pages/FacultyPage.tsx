import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  GraduationCap, 
  BookOpen, 
  ShieldCheck, 
  UserCheck, 
  Briefcase, 
  Building, 
  Compass, 
  Sparkles, 
  Layers, 
  ChevronRight, 
  ArrowRight, 
  Lock, 
  SlidersHorizontal,
  X,
  Mail,
  Phone,
  Laptop
} from 'lucide-react';
import { FacultyMember, FacultyCategory, User } from '../types';
import { apiService } from '../services/api';
import { INITIAL_FACULTY_MEMBERS } from '../data/facultyData';
import { ContentEditable } from '../components/common/ContentEditable';

interface FacultyPageProps {
  onNavigate: (page: string, subSection?: string) => void;
  currentUser?: User | null;
  onOpenAdminManager?: () => void;
}

export const FacultyPage: React.FC<FacultyPageProps> = ({ 
  onNavigate, 
  currentUser,
  onOpenAdminManager
}) => {
  const [members, setMembers] = useState<FacultyMember[]>(INITIAL_FACULTY_MEMBERS);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'direction' | 'administration' | 'enseignant'>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'organigramme'>('grid');

  const isAdmin = currentUser?.role === 'ADMIN' || (currentUser?.role as string) === 'SUPER_ADMIN';

  const loadMembers = async () => {
    try {
      setLoading(true);
      const data = await apiService.getFacultyMembers(false);
      if (Array.isArray(data) && data.length >= 10) {
        setMembers(data);
      } else if (Array.isArray(data) && data.length > 0) {
        const merged = [...INITIAL_FACULTY_MEMBERS];
        data.forEach(m => {
          const idx = merged.findIndex(x => x.id === m.id);
          if (idx >= 0) merged[idx] = m;
          else merged.push(m);
        });
        setMembers(merged);
      } else {
        setMembers(INITIAL_FACULTY_MEMBERS);
      }
    } catch (e) {
      console.error('Erreur chargement corps professoral:', e);
      setMembers(INITIAL_FACULTY_MEMBERS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();

    const handleUpdated = () => {
      loadMembers();
    };

    window.addEventListener('cin:faculty-updated', handleUpdated);
    return () => window.removeEventListener('cin:faculty-updated', handleUpdated);
  }, []);

  // Extraction unique des matières pour le filtre
  const allSubjects = useMemo(() => {
    const set = new Set<string>();
    members.forEach(m => {
      m.subjects?.forEach(s => {
        if (s && s.trim()) set.add(s.trim());
      });
    });
    return Array.from(set).sort();
  }, [members]);

  // Filtrage combiné (Recherche + Catégorie + Matière)
  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      // 1. Catégorie
      if (selectedCategory !== 'all') {
        const matchesCat = m.categories?.includes(selectedCategory as FacultyCategory);
        if (!matchesCat) return false;
      }

      // 2. Matière
      if (selectedSubject !== 'all') {
        const hasSubject = m.subjects?.some(s => s.toLowerCase() === selectedSubject.toLowerCase());
        if (!hasSubject) return false;
      }

      // 3. Recherche texte
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inName = m.name?.toLowerCase().includes(q);
        const inRoles = m.roles?.some(r => r.toLowerCase().includes(q));
        const inSubjects = m.subjects?.some(s => s.toLowerCase().includes(q));
        const inBio = m.biography?.toLowerCase().includes(q);
        if (!inName && !inRoles && !inSubjects && !inBio) return false;
      }

      return true;
    });
  }, [members, selectedCategory, selectedSubject, searchQuery]);

  // Regroupements et décomptes précis par pôle institutionnel
  const directionCount = useMemo(() => {
    return members.filter(m => m.categories?.includes('direction') || m.categories?.includes('conseil_pedagogique')).length;
  }, [members]);

  const adminCount = useMemo(() => {
    return members.filter(m => m.categories?.includes('administration')).length;
  }, [members]);

  const teachersCount = useMemo(() => {
    return members.filter(m => m.categories?.includes('enseignant')).length;
  }, [members]);

  const directionTeam = useMemo(() => {
    return members.filter(m => m.categories?.includes('direction') || m.categories?.includes('administration') || m.categories?.includes('conseil_pedagogique'));
  }, [members]);

  const teachersTeam = useMemo(() => {
    return members.filter(m => m.categories?.includes('enseignant'));
  }, [members]);

  // Helper pour générer les initiales
  const getInitials = (name: string): string => {
    if (!name) return 'CIN';
    const clean = name.replace(/^(Mde|M\.|Dr\.)\s+/i, '');
    const parts = clean.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-stone-50 text-slate-800 font-sans pb-16">
      
      {/* 1. HERO INSTITUTIONNEL */}
      <section className="bg-gradient-to-b from-blue-950 via-slate-900 to-blue-900 text-white pt-12 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden border-b border-amber-400/20">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-amber-300 text-xs font-semibold tracking-wider uppercase border border-amber-300/20">
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              <span>Gouvernance & Excellence Pédagogique</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
              Direction & Corps professoral
            </h1>

            <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-light">
              L’équipe de direction, d’administration et l’ensemble des enseignants du Collège Isaac Newton unissent leur expertise pour offrir un encadrement académique rigoureux, bienveillant et résolument tourné vers l’éveil intellectuel, la méthode scientifique et la réussite de chaque élève.
            </p>

            {isAdmin && (
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => onNavigate('admin', 'faculty')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs hover:bg-amber-300 transition-colors shadow-sm cursor-pointer"
                >
                  <SlidersHorizontal className="w-4 h-4 text-slate-950" />
                  <span>Gérer l’équipe dans le tableau d’administration</span>
                </button>
                <span className="text-xs text-amber-200/90 italic">
                  (Mode Administrateur actif : modifications immédiates sans toucher au code)
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. BARRE D'ACTION & RECHERCHE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-3 sm:p-4">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 sm:gap-4">
            
            {/* Recherche textuelle */}
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher par nom, matière, responsabilité..."
                className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  aria-label="Effacer la recherche"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filtres par Catégorie */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Tous ({members.length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory('direction')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === 'direction'
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Direction & Conseil ({directionCount})
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory('administration')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === 'administration'
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Administration ({adminCount})
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory('enseignant')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === 'enseignant'
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Enseignants ({teachersCount})
              </button>
            </div>

            {/* Sélecteur de Matière */}
            {allSubjects.length > 0 && (
              <div className="flex items-center gap-2 shrink-0">
                <label htmlFor="subject-filter" className="sr-only">Filtrer par matière</label>
                <select
                  id="subject-filter"
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-900/20 cursor-pointer"
                >
                  <option value="all">Toutes les matières ({allSubjects.length})</option>
                  {allSubjects.map((sub) => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Bascule de Mode d'Affichage (Grille / Organigramme) */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0 self-end lg:self-auto">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white text-blue-950 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Affichage par cartes d'équipe"
              >
                <Users className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Portraits</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('organigramme')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'organigramme'
                    ? 'bg-white text-blue-950 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Affichage organigramme des pôles"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Organigramme</span>
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* 3. VUE ORGANIGRAMME RESPONSIVE (PÔLES SANS HIÉRARCHIE INVENTÉE) */}
      {viewMode === 'organigramme' && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-8 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-8">
            
            <div className="max-w-2xl space-y-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-blue-900">
                <Layers className="w-4 h-4 text-amber-500" />
                <span>Structure Institutionnelle</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
                Organigramme des Fonctions & Pôles
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Présentation des pôles de responsabilité et des coordinations disciplinaires du Collège Isaac Newton. Chaque pôle concourt à la réussite académique, à l'émulation intellectuelle et à la sécurité des élèves.
              </p>
            </div>

            {/* PÔLE 1 : DIRECTION DES ÉTUDES ET CONSEIL PÉDAGOGIQUE */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-900" />
                <h3 className="font-serif font-bold text-slate-900 text-lg sm:text-xl">
                  Pôle Direction, Discipline & Conseil Pédagogique
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Corasmin Josué Maxy C. */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50/70 to-slate-50 border border-blue-200/80 shadow-2xs space-y-3">
                  <div className="flex items-center gap-3">
                    {members.find(m => m.id === 'fac-coasmin-josue-maxy' || m.name.toLowerCase().includes('corasmin'))?.photoUrl ? (
                      <img
                        src={members.find(m => m.id === 'fac-coasmin-josue-maxy' || m.name.toLowerCase().includes('corasmin'))?.photoUrl}
                        alt="Photo de Corasmin Josué Maxy C."
                        className="w-12 h-12 rounded-full object-cover border border-blue-900/30 shadow-xs shrink-0"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-blue-900 text-white flex items-center justify-center font-serif font-bold text-base shadow-sm shrink-0">
                        CJM
                      </div>
                    )}
                    <div className="min-w-0">
                      <h4 className="font-serif font-bold text-slate-900 text-base">Corasmin Josué Maxy C.</h4>
                      <p className="text-xs font-semibold text-blue-900">Directeur Pédagogique & Prof. Informatique</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Direction pédagogique, coordination des équipes d'enseignement et formation pratique aux technologies informatiques et numériques au collège.
                  </p>
                  <div className="pt-1 flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                    <span className="px-2 py-0.5 rounded-md bg-blue-100/80 text-blue-900 font-semibold">Direction & Enseignement</span>
                    <span>·</span>
                    <span className="text-blue-950 font-bold">Informatique</span>
                  </div>
                </div>

                {/* Salomon Jhonny Frantz */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50/70 to-slate-50 border border-amber-200/80 shadow-2xs space-y-3">
                  <div className="flex items-center gap-3">
                    {members.find(m => m.id === 'fac-salomon-jhonny-frantz')?.photoUrl ? (
                      <img
                        src={members.find(m => m.id === 'fac-salomon-jhonny-frantz')?.photoUrl}
                        alt="Photo de Salomon Jhonny Frantz"
                        className="w-12 h-12 rounded-full object-cover border border-amber-600/30 shadow-xs shrink-0"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-amber-600 text-white flex items-center justify-center font-serif font-bold text-base shadow-sm shrink-0">
                        SJF
                      </div>
                    )}
                    <div className="min-w-0">
                      <h4 className="font-serif font-bold text-slate-900 text-base">Salomon Jhonny Frantz</h4>
                      <p className="text-xs font-semibold text-amber-800">Conseil pédagogique</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Animation de la réflexion pédagogique transversale, coordination didactique et enseignant de Mathématiques au sein du collège.
                  </p>
                  <div className="pt-1 flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                    <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-semibold">Conseil Pédagogique</span>
                    <span>·</span>
                    <span className="text-slate-600">Mathématiques</span>
                  </div>
                </div>

                {/* Orphée Jean Dumel */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/40 border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-center gap-3">
                    {members.find(m => m.id === 'fac-orphee-jean-dumel')?.photoUrl ? (
                      <img
                        src={members.find(m => m.id === 'fac-orphee-jean-dumel')?.photoUrl}
                        alt="Photo d'Orphée Jean Dumel"
                        className="w-12 h-12 rounded-full object-cover border border-slate-300 shadow-xs shrink-0"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-slate-800 text-white flex items-center justify-center font-serif font-bold text-base shadow-sm shrink-0">
                        OJD
                      </div>
                    )}
                    <div className="min-w-0">
                      <h4 className="font-serif font-bold text-slate-900 text-base">Orphée Jean Dumel</h4>
                      <p className="text-xs font-semibold text-blue-900">Discipline & Études</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Veille à la conformité des apprentissages, à l'application du règlement intérieur, à l'assiduité scolaire et à l'harmonie de la vie communautaire.
                  </p>
                  <div className="pt-1 flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                    <span className="px-2 py-0.5 rounded-md bg-slate-200/80 text-slate-800 font-semibold">Direction des Études</span>
                    <span>·</span>
                    <span>Discipline</span>
                  </div>
                </div>
              </div>
            </div>

            {/* PÔLE 2 : SECRÉTARIAT DE DIRECTION & ADMINISTRATION */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <div className="w-2.5 h-2.5 rounded-full bg-purple-700" />
                <h3 className="font-serif font-bold text-slate-900 text-lg sm:text-xl">
                  Pôle Secrétariat & Administration
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-50/50 to-slate-50 border border-purple-200/70 shadow-2xs space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-purple-800 text-white flex items-center justify-center font-serif font-bold text-base shadow-sm shrink-0">
                      UR
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-serif font-bold text-slate-900 text-base">Ulysse Rosenie</h4>
                      <p className="text-xs font-semibold text-purple-900">Secrétaire de direction</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Accueil des parents, gestion des admissions, tenue des dossiers administratifs des élèves et correspondance officielle.
                  </p>
                  <div className="pt-1 flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                    <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-900 font-semibold">Secrétariat Général</span>
                    <span>·</span>
                    <span>Service aux familles</span>
                  </div>
                </div>
              </div>
            </div>

            {/* PÔLE 3 : DÉPARTEMENTS D'ENSEIGNEMENT ACADÉMIQUE */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-700" />
                <h3 className="font-serif font-bold text-slate-900 text-lg sm:text-xl">
                  Pôle Enseignement & Départements Académiques
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                
                {/* Mathématiques & Économie */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
                    <GraduationCap className="w-4 h-4 text-amber-500" />
                    <span>Département Mathématiques & Économie</span>
                  </div>
                  <ul className="text-xs text-slate-700 space-y-1.5 pl-2 border-l-2 border-blue-900/40">
                    <li><strong className="text-slate-900">Augustmat Onés</strong> — Économie et Mathématiques</li>
                    <li><strong className="text-slate-900">Salomon Jhonny Frantz</strong> — Mathématiques</li>
                    <li><strong className="text-slate-900">Exan Mackenson</strong> — Mathématiques</li>
                  </ul>
                </div>

                {/* Sciences Expérimentales */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>Département Sciences Expérimentales</span>
                  </div>
                  <ul className="text-xs text-slate-700 space-y-1.5 pl-2 border-l-2 border-emerald-700/40">
                    <li><strong className="text-slate-900">Mde Pierre Kattiana</strong> — Sciences expérimentales</li>
                    <li><strong className="text-slate-900">Pierre Mario</strong> — Sciences expérimentales</li>
                  </ul>
                </div>

                {/* Lettres & Français */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-purple-900">
                    <BookOpen className="w-4 h-4 text-purple-600" />
                    <span>Département Langue Française & Lettres</span>
                  </div>
                  <ul className="text-xs text-slate-700 space-y-1.5 pl-2 border-l-2 border-purple-700/40">
                    <li><strong className="text-slate-900">Mde Jean Baptiste / Erika Médé</strong> — Français</li>
                    <li><strong className="text-slate-900">Romélus Job</strong> — Français</li>
                  </ul>
                </div>

                {/* Sciences Sociales */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                    <Compass className="w-4 h-4 text-blue-700" />
                    <span>Département Sciences Sociales</span>
                  </div>
                  <ul className="text-xs text-slate-700 space-y-1.5 pl-2 border-l-2 border-slate-700/40">
                    <li><strong className="text-slate-900">Jean François Hélabre Lévy</strong> — Sciences sociales</li>
                  </ul>
                </div>

                {/* Philosophie */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    <span>Département Philosophie</span>
                  </div>
                  <ul className="text-xs text-slate-700 space-y-1.5 pl-2 border-l-2 border-amber-600/40">
                    <li><strong className="text-slate-900">Dr Pierre Maurice</strong> — Philosophie</li>
                  </ul>
                </div>

                {/* Informatique & Technologies Numériques */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-cyan-900">
                    <Laptop className="w-4 h-4 text-cyan-600" />
                    <span>Département Informatique & Numérique</span>
                  </div>
                  <ul className="text-xs text-slate-700 space-y-1.5 pl-2 border-l-2 border-cyan-700/40">
                    <li><strong className="text-slate-900">Corasmin Josué Maxy C.</strong> — Informatique</li>
                  </ul>
                </div>

              </div>
            </div>

          </div>
        </section>
      )}

      {/* 4. VUE CARTES DE MEMBRES (PORTRAITS ET DÉTAILS) */}
      {viewMode === 'grid' && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-12 animate-in fade-in duration-200">
          
          {/* Section A : Direction & Administration */}
          {(selectedCategory === 'all' || selectedCategory === 'direction' || selectedCategory === 'administration') && directionTeam.length > 0 && !selectedSubject && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-slate-900">
                    Direction & Administration
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Gouvernance, encadrement disciplinaire et secrétariat de l'établissement
                  </p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-100 text-blue-900">
                  {directionTeam.length} profil{directionTeam.length > 1 ? 's' : ''}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {directionTeam.map((member) => (
                  <FacultyCard 
                    key={member.id} 
                    member={member} 
                    isAdmin={isAdmin}
                    onNavigateAdmin={() => onNavigate('admin', 'faculty')}
                    getInitials={getInitials}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Section B : Corps professoral (Enseignants) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-slate-900">
                  Corps Professoral
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Professeurs spécialistes engagés dans l'apprentissage disciplinaire
                </p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900">
                {filteredMembers.filter(m => m.categories?.includes('enseignant')).length} enseignant{filteredMembers.filter(m => m.categories?.includes('enseignant')).length > 1 ? 's' : ''}
              </span>
            </div>

            {loading ? (
              <div className="py-16 text-center space-y-3">
                <div className="inline-block w-8 h-8 border-3 border-blue-900 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-slate-500">Chargement du corps professoral...</p>
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
                <Users className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="font-serif text-lg font-bold text-slate-900">Aucun profil ne correspond à vos critères</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Essayez de réinitialiser vos filtres ou de modifier les termes de votre recherche.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setSelectedSubject('all');
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-900 text-white text-xs font-semibold hover:bg-blue-800 transition-colors cursor-pointer"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMembers.map((member) => (
                  <FacultyCard 
                    key={member.id} 
                    member={member} 
                    isAdmin={isAdmin}
                    onNavigateAdmin={() => onNavigate('admin', 'faculty')}
                    getInitials={getInitials}
                  />
                ))}
              </div>
            )}
          </div>

        </section>
      )}

      {/* 5. BANDEAU DE CONTACT & INSCRIPTIONS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="rounded-3xl bg-slate-900 text-white p-8 sm:p-12 relative overflow-hidden shadow-lg border border-slate-800">
          <div className="max-w-2xl space-y-3">
            <span className="text-xs uppercase font-bold tracking-widest text-amber-400">
              Échange & Accompagnement
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
              Une question pédagogique pour la Direction ?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
              Le secrétariat et l’équipe de direction reçoivent les parents sur rendez-vous au campus de Delmas 50 pour faire le point sur le suivi scolaire et les perspectives d'orientation.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => onNavigate('contact')}
                className="px-5 py-2.5 rounded-xl bg-amber-400 text-slate-950 text-xs font-bold hover:bg-amber-300 transition-colors cursor-pointer shadow-sm"
              >
                Prendre contact avec le Secrétariat
              </button>
              <button
                type="button"
                onClick={() => onNavigate('pre-registration')}
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors cursor-pointer border border-white/20"
              >
                Préinscription en ligne 2026-2027
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

// COMPOSANT CARTE DE MEMBRE
interface FacultyCardProps {
  member: FacultyMember;
  isAdmin: boolean;
  onNavigateAdmin: () => void;
  getInitials: (name: string) => string;
}

const FacultyCard: React.FC<FacultyCardProps> = ({ 
  member, 
  isAdmin, 
  onNavigateAdmin,
  getInitials 
}) => {
  const isDualRole = member.categories?.includes('direction') && member.categories?.includes('enseignant');

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-200 p-5 flex flex-col justify-between group">
      
      <div className="space-y-4">
        {/* En-tête : Avatar neutre élégant ou Photo réelle */}
        <div className="flex items-start gap-4">
          
          <div className="relative shrink-0">
            {member.photoUrl ? (
              <img
                src={member.photoUrl}
                alt={`Photo officielle de ${member.name}`}
                className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl object-cover border border-slate-200 shadow-xs"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  // Fallback avatar en cas de lien cassé
                  (e.target as HTMLElement).style.display = 'none';
                  const fallback = (e.target as HTMLElement).nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
            ) : null}

            {/* Avatar neutre institutionnel avec initiales */}
            <div 
              style={{ display: member.photoUrl ? 'none' : 'flex' }}
              className={`w-16 h-16 sm:w-18 sm:h-18 rounded-2xl flex items-center justify-center font-serif text-lg sm:text-xl font-bold shadow-xs select-none border ${
                member.categories?.includes('direction')
                  ? 'bg-gradient-to-br from-blue-900 to-slate-900 text-amber-300 border-amber-400/30'
                  : member.categories?.includes('administration')
                  ? 'bg-gradient-to-br from-purple-800 to-slate-900 text-white border-purple-300/30'
                  : 'bg-gradient-to-br from-slate-800 to-blue-950 text-white border-slate-300'
              }`}
              aria-label={`Avatar de ${member.name}`}
            >
              {getInitials(member.name)}
            </div>
          </div>

          <div className="min-w-0 flex-1 space-y-1">
            <h3 className="font-serif font-bold text-slate-900 text-base sm:text-lg group-hover:text-blue-900 transition-colors leading-snug">
              {member.name}
            </h3>

            {/* Fonctions & Rôles */}
            {member.roles && member.roles.length > 0 && (
              <div className="space-y-0.5">
                {member.roles.map((role, idx) => (
                  <p key={idx} className="text-xs font-semibold text-blue-900 leading-tight">
                    {role}
                  </p>
                ))}
              </div>
            )}

            {/* Badges discrets et élégants sans pills criardes */}
            {isDualRole && (
              <div className="inline-block text-[10px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/80 mt-1">
                Double affectation : Conseil & Enseignement
              </div>
            )}
          </div>
        </div>

        {/* Matières enseignées */}
        {member.subjects && member.subjects.length > 0 && (
          <div className="pt-2 border-t border-slate-100 space-y-1.5">
            <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
              Matière{member.subjects.length > 1 ? 's' : ''} enseignée{member.subjects.length > 1 ? 's' : ''}
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {member.subjects.map((subj, idx) => (
                <span 
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-medium border border-slate-200/60"
                >
                  {subj}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Notice / Biographie courte si présente */}
        {member.biography && (
          <p className="text-xs text-slate-600 leading-relaxed font-light line-clamp-3 pt-1">
            {member.biography}
          </p>
        )}
      </div>

      {/* Pied de carte : Coordonnées ou Bouton admin */}
      <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2">
          {member.email && (
            <a 
              href={`mailto:${member.email}`}
              className="text-slate-500 hover:text-blue-900 p-1"
              title={`Écrire à ${member.name}`}
            >
              <Mail className="w-3.5 h-3.5" />
            </a>
          )}
          {member.phone && (
            <a 
              href={`tel:${member.phone}`}
              className="text-slate-500 hover:text-blue-900 p-1"
              title={`Appeler ${member.name}`}
            >
              <Phone className="w-3.5 h-3.5" />
            </a>
          )}
          <span className="text-[11px] text-slate-400">
            Collège Isaac Newton
          </span>
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={onNavigateAdmin}
            className="text-[11px] font-semibold text-amber-700 hover:text-amber-900 inline-flex items-center gap-1 cursor-pointer"
            title="Modifier ce profil dans l'espace administrateur"
          >
            <span>Éditer</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>

    </div>
  );
};
