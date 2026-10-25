import React, { useState, useEffect, useMemo } from 'react';
import { 
  Award, 
  Sparkles, 
  Trophy, 
  Star, 
  Search, 
  Filter, 
  ShieldCheck, 
  TrendingUp, 
  BookOpen, 
  HeartHandshake, 
  GraduationCap,
  Calendar,
  Layers,
  ChevronRight,
  X
} from 'lucide-react';
import { HonorRollStudent, HonorDistinctionType } from '../../types';
import { apiService } from '../../services/api';
import { INITIAL_HONOR_ROLL } from '../../data/mockData';

interface HonorRollViewProps {
  onOpenAuth?: () => void;
  onNavigateToCalendar?: () => void;
}

export const HonorRollView: React.FC<HonorRollViewProps> = ({
  onOpenAuth,
  onNavigateToCalendar,
}) => {
  const [students, setStudents] = useState<HonorRollStudent[]>(INITIAL_HONOR_ROLL);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCycle, setSelectedCycle] = useState<'ALL' | 'FONDAMENTAL' | 'SECONDAIRE'>('ALL');
  const [selectedDistinction, setSelectedDistinction] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('ALL');

  const loadHonorRoll = async () => {
    setIsLoading(true);
    try {
      const data = await apiService.getHonorRoll();
      if (Array.isArray(data) && data.length > 0) {
        setStudents(data);
      }
    } catch {
      // Conserver le mock en fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHonorRoll();

    const handleUpdate = () => {
      loadHonorRoll();
    };

    window.addEventListener('cin:honor-roll-updated', handleUpdate);
    return () => window.removeEventListener('cin:honor-roll-updated', handleUpdate);
  }, []);

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      if (!s.isPublic) return false;

      const matchesCycle = selectedCycle === 'ALL' || s.cycle === selectedCycle;
      const matchesDistinction = selectedDistinction === 'ALL' || s.distinction === selectedDistinction;
      const matchesPeriod = selectedPeriod === 'ALL' || s.period === selectedPeriod;

      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = !query || 
        s.studentName.toLowerCase().includes(query) ||
        s.classLevel.toLowerCase().includes(query) ||
        (s.specialty && s.specialty.toLowerCase().includes(query)) ||
        s.citation.toLowerCase().includes(query);

      return matchesCycle && matchesDistinction && matchesPeriod && matchesSearch;
    });
  }, [students, selectedCycle, selectedDistinction, selectedPeriod, searchQuery]);

  const distinctionsFilterList: { id: string; label: string; icon: any }[] = [
    { id: 'ALL', label: 'Toutes les distinctions', icon: Award },
    { id: 'FELICITATIONS', label: 'Félicitations', icon: Star },
    { id: 'TABLEAU_HONNEUR', label: 'Tableau d’Honneur', icon: Trophy },
    { id: 'PRIX_SCIENCES', label: 'Prix Sciences', icon: Sparkles },
    { id: 'PRIX_HUMANITES', label: 'Prix Humanités', icon: BookOpen },
    { id: 'PRIX_CIVISME', label: 'Prix Civisme', icon: HeartHandshake },
    { id: 'ENCOURAGEMENTS', label: 'Encouragements', icon: TrendingUp },
  ];

  const getDistinctionBadge = (distinction: HonorDistinctionType) => {
    switch (distinction) {
      case 'FELICITATIONS':
        return {
          bg: 'bg-amber-50 text-amber-900 border-amber-300',
          label: 'Félicitations du Conseil',
          icon: Star,
          iconColor: 'text-amber-600',
        };
      case 'TABLEAU_HONNEUR':
        return {
          bg: 'bg-blue-50 text-blue-900 border-blue-300',
          label: 'Tableau d’Honneur',
          icon: Trophy,
          iconColor: 'text-blue-700',
        };
      case 'PRIX_SCIENCES':
        return {
          bg: 'bg-indigo-50 text-indigo-900 border-indigo-300',
          label: 'Prix des Sciences',
          icon: Sparkles,
          iconColor: 'text-indigo-600',
        };
      case 'PRIX_HUMANITES':
        return {
          bg: 'bg-emerald-50 text-emerald-900 border-emerald-300',
          label: 'Prix Humanités & Éloquence',
          icon: BookOpen,
          iconColor: 'text-emerald-700',
        };
      case 'PRIX_CIVISME':
        return {
          bg: 'bg-rose-50 text-rose-900 border-rose-300',
          label: 'Prix du Civisme & Dévouement',
          icon: HeartHandshake,
          iconColor: 'text-rose-600',
        };
      case 'ENCOURAGEMENTS':
        return {
          bg: 'bg-teal-50 text-teal-900 border-teal-300',
          label: 'Encouragements & Progrès',
          icon: TrendingUp,
          iconColor: 'text-teal-700',
        };
      default:
        return {
          bg: 'bg-slate-100 text-slate-800 border-slate-300',
          label: 'Mention d’Honneur',
          icon: Award,
          iconColor: 'text-slate-600',
        };
    }
  };

  const hasActiveFilters = selectedCycle !== 'ALL' || selectedDistinction !== 'ALL' || selectedPeriod !== 'ALL' || searchQuery.trim() !== '';

  const resetFilters = () => {
    setSelectedCycle('ALL');
    setSelectedDistinction('ALL');
    setSelectedPeriod('ALL');
    setSearchQuery('');
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      
      {/* HERO BANNER PALMARÈS - COMPACT & ERGONOMIQUE */}
      <section className="bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 rounded-2xl p-4 sm:p-6 text-white shadow-md border border-amber-400/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-2xs font-extrabold tracking-wide uppercase border border-amber-400/40">
              <Trophy className="w-3 h-3 text-amber-400" />
              <span>Palmarès d’Excellence Académique</span>
            </div>
            
            <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              Tableau d'Honneur des Élèves
            </h2>
            
            <p className="text-xs text-slate-300 leading-relaxed font-light">
              Publication officielle du Conseil Pédagogique valorisant le labeur assidu, la rigueur intellectuelle et l'engagement citoyen de nos apprenants.
            </p>
          </div>

          {/* Micro stats strip - Compact */}
          <div className="grid grid-cols-3 gap-2 shrink-0 text-2xs">
            <div className="bg-white/10 rounded-xl p-2.5 border border-white/10 text-center">
              <div className="font-bold text-amber-400 text-sm leading-tight">{students.length}</div>
              <div className="text-slate-300 text-[10px] mt-0.5">Élèves Primés</div>
            </div>
            <div className="bg-white/10 rounded-xl p-2.5 border border-white/10 text-center">
              <div className="font-bold text-amber-400 text-sm leading-tight">9.45 / 10</div>
              <div className="text-slate-300 text-[10px] mt-0.5">Meilleure Note</div>
            </div>
            <div className="bg-white/10 rounded-xl p-2.5 border border-white/10 text-center">
              <div className="font-bold text-emerald-400 text-sm leading-tight">100%</div>
              <div className="text-slate-300 text-[10px] mt-0.5">Réussite MENFP</div>
            </div>
          </div>
        </div>
      </section>

      {/* FORMULAIRE DE RECHERCHE & FILTRES OPTIMISÉ - COMPACT & FLUIDE */}
      <section className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
        {/* Ligne 1: Recherche + Sélecteurs Cycle & Trimestre */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5 items-center">
          
          {/* Recherche */}
          <div className="sm:col-span-2 lg:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par élève, classe, mot-clé..."
              className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition-all placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 rounded-md cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filtre Cycle */}
          <div className="lg:col-span-4">
            <div className="flex items-center rounded-xl p-0.5 bg-slate-100 border border-slate-200/70 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setSelectedCycle('ALL')}
                className={`flex-1 py-1.5 px-2 rounded-lg text-center text-2xs sm:text-xs transition-all cursor-pointer truncate ${
                  selectedCycle === 'ALL'
                    ? 'bg-blue-900 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tous cycles
              </button>
              <button
                type="button"
                onClick={() => setSelectedCycle('FONDAMENTAL')}
                className={`flex-1 py-1.5 px-2 rounded-lg text-center text-2xs sm:text-xs transition-all cursor-pointer truncate ${
                  selectedCycle === 'FONDAMENTAL'
                    ? 'bg-blue-900 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Fondamental
              </button>
              <button
                type="button"
                onClick={() => setSelectedCycle('SECONDAIRE')}
                className={`flex-1 py-1.5 px-2 rounded-lg text-center text-2xs sm:text-xs transition-all cursor-pointer truncate ${
                  selectedCycle === 'SECONDAIRE'
                    ? 'bg-blue-900 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Secondaire
              </button>
            </div>
          </div>

          {/* Filtre Période */}
          <div className="lg:col-span-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition-all font-medium text-slate-700 cursor-pointer"
            >
              <option value="ALL">Tous les trimestres</option>
              <option value="1er Contrôle Officiel">1er Contrôle</option>
              <option value="2e Contrôle Officiel">2e Contrôle</option>
              <option value="3e Contrôle Officiel">3e Contrôle</option>
              <option value="4e Contrôle / Bilan Annuel">4e Contrôle / Bilan</option>
            </select>
          </div>

        </div>

        {/* Ligne 2: Distinction Chips + Compteur & Reset */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 flex-wrap">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none py-0.5 max-w-full">
            {distinctionsFilterList.map((df) => {
              const Icon = df.icon;
              const isSelected = selectedDistinction === df.id;
              return (
                <button
                  key={df.id}
                  type="button"
                  onClick={() => setSelectedDistinction(df.id)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-2xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-400 text-slate-950 font-bold shadow-2xs'
                      : 'bg-slate-100/80 hover:bg-slate-200/80 text-slate-600'
                  }`}
                >
                  <Icon className="w-3 h-3 shrink-0" />
                  <span>{df.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 shrink-0 text-2xs text-slate-500 font-medium">
            <span className="font-bold text-slate-700">
              {filteredStudents.length} {filteredStudents.length > 1 ? 'élèves primés' : 'élève primé'}
            </span>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-blue-900 hover:underline font-bold cursor-pointer"
              >
                Réinitialiser
              </button>
            )}
          </div>
        </div>
      </section>

      {/* GRILLE DES ÉLÈVES PRIMÉS - SANS BOUTONS CERTIFICATS, ERGONOMIE DENSE */}
      {filteredStudents.length === 0 ? (
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-8 text-center space-y-2">
          <Award className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="font-bold text-slate-800 text-xs sm:text-sm">Aucun élève trouvé pour ces critères</h3>
          <p className="text-2xs sm:text-xs text-slate-500">Modifiez le cycle ou réinitialisez les filtres pour afficher les lauréats.</p>
          <button
            type="button"
            onClick={resetFilters}
            className="text-xs font-bold text-blue-900 hover:underline pt-1 inline-block cursor-pointer"
          >
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {filteredStudents.map((student) => {
            const badge = getDistinctionBadge(student.distinction);
            const BadgeIcon = badge.icon;

            return (
              <div
                key={student.id}
                className="bg-white rounded-2xl p-4 sm:p-4.5 border border-slate-200 shadow-2xs hover:border-amber-400/80 hover:shadow-sm transition-all flex flex-col justify-between space-y-3 group relative overflow-hidden"
              >
                {/* Accent ribbon at top */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-900 via-amber-400 to-blue-900" />

                <div className="space-y-2.5 pt-0.5">
                  {/* Top row: Rank & Average */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200/70">
                      <Trophy className="w-3 h-3 text-amber-600" />
                      <span>{student.rankInClass === 1 ? '1er de la classe' : `${student.rankInClass}e de la classe`}</span>
                    </span>

                    <span className="text-xs font-mono font-extrabold text-blue-900 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/70">
                      {student.average} / {student.maxScale}
                    </span>
                  </div>

                  {/* Student Identity */}
                  <div className="flex items-start gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-900 to-slate-900 text-amber-400 font-serif font-bold text-sm flex items-center justify-center shrink-0 shadow-2xs border border-amber-400/30">
                      {student.studentName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-serif font-bold text-sm sm:text-base text-slate-900 group-hover:text-blue-900 transition-colors leading-snug truncate">
                        {student.studentName}
                      </h3>
                      <div className="flex items-center gap-1.5 flex-wrap text-2xs text-slate-500 font-medium">
                        <span>{student.classLevel}</span>
                        <span className="text-slate-300">·</span>
                        <span className="font-mono text-slate-400">{student.period}</span>
                      </div>
                    </div>
                  </div>

                  {/* Distinction Tag */}
                  <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-2xs font-bold border ${badge.bg}`}>
                    <BadgeIcon className={`w-3 h-3 ${badge.iconColor} shrink-0`} />
                    <span className="truncate">{badge.label}</span>
                  </div>

                  {/* Citation du Conseil */}
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-2xs text-slate-700 italic leading-relaxed">
                    « {student.citation} »
                  </div>

                  {/* Specialty tag if present */}
                  {student.specialty && (
                    <div className="flex items-center gap-1.5 text-2xs text-slate-500 pt-0.5">
                      <span className="font-semibold text-slate-700">Point fort :</span>
                      <span className="truncate">{student.specialty}</span>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* CADRE PÉDAGOGIQUE & CRITÈRES D'ATTRIBUTION - COMPACT */}
      <section className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200/80 space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-900" />
          <h3 className="font-serif font-bold text-xs sm:text-sm text-slate-900">
            Charte & Critères d'Attribution du Tableau d'Honneur (Session 2026–2027)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-2xs text-slate-600 leading-relaxed">
          <div className="p-3 rounded-xl bg-white border border-slate-200/80 space-y-1">
            <div className="font-bold text-blue-900 flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-500" />
              <span>1. Félicitations du Conseil</span>
            </div>
            <p>
              Moyenne générale ≥ 8.5/10 (Fondamental) ou ≥ 85/100 (Secondaire), avec assiduité et comportement exemplaires.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-white border border-slate-200/80 space-y-1">
            <div className="font-bold text-blue-900 flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-blue-600" />
              <span>2. Tableau d'Honneur</span>
            </div>
            <p>
              Moyenne ≥ 7.5/10 ou ≥ 75/100, sans note éliminatoire dans les matières fondamentales et respect de la discipline.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-white border border-slate-200/80 space-y-1">
            <div className="font-bold text-blue-900 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span>3. Encouragements & Progrès</span>
            </div>
            <p>
              Progrès notables (&gt; +2.5 points) et engagement constant dans le travail scolaire au cours du trimestre.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
};
