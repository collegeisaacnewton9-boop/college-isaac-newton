import React, { useState, useEffect, useMemo } from 'react';
import { 
  Award, 
  Sparkles, 
  GraduationCap, 
  Trophy, 
  Star, 
  Download, 
  Eye, 
  Search, 
  Filter, 
  ShieldCheck, 
  TrendingUp, 
  BookOpen, 
  HeartHandshake, 
  Loader2,
  Calendar,
  Layers,
  ChevronRight,
  Info
} from 'lucide-react';
import { HonorRollStudent, HonorDistinctionType } from '../../types';
import { apiService } from '../../services/api';
import { INITIAL_HONOR_ROLL } from '../../data/mockData';
import { officialDocumentsPdfService } from '../../services/officialDocumentsPdfService';
import { HonorDiplomaModal } from './HonorDiplomaModal';
import { toast } from 'sonner';

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
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Modal d'aperçu de diplôme
  const [previewStudent, setPreviewStudent] = useState<HonorRollStudent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleDownloadDiploma = async (student: HonorRollStudent) => {
    setDownloadingId(student.id);
    try {
      const result = await officialDocumentsPdfService.generateHonorCertificatePdf(student);
      result.downloadBlob();
      toast.success(`Diplôme d'Honneur officiel téléchargé !`, {
        description: `${result.filename} pour ${student.studentName}`,
      });
    } catch (err: any) {
      toast.error('Erreur lors de la génération du diplôme', {
        description: err.message,
      });
    } finally {
      setDownloadingId(null);
    }
  };

  const handleOpenPreview = (student: HonorRollStudent) => {
    setPreviewStudent(student);
    setIsModalOpen(true);
  };

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
    { id: 'FELICITATIONS', label: 'Félicitations du Conseil', icon: Star },
    { id: 'TABLEAU_HONNEUR', label: 'Tableau d’Honneur', icon: Trophy },
    { id: 'PRIX_SCIENCES', label: 'Prix Isaac Newton des Sciences', icon: Sparkles },
    { id: 'PRIX_HUMANITES', label: 'Prix des Humanités & Éloquence', icon: BookOpen },
    { id: 'PRIX_CIVISME', label: 'Prix du Civisme & Dévouement', icon: HeartHandshake },
    { id: 'ENCOURAGEMENTS', label: 'Tableau des Encouragements', icon: TrendingUp },
  ];

  const getDistinctionBadge = (distinction: HonorDistinctionType) => {
    switch (distinction) {
      case 'FELICITATIONS':
        return {
          bg: 'bg-amber-100 text-amber-900 border-amber-300',
          label: 'Félicitations du Conseil',
          icon: Star,
          iconColor: 'text-amber-600',
        };
      case 'TABLEAU_HONNEUR':
        return {
          bg: 'bg-blue-100 text-blue-900 border-blue-300',
          label: 'Tableau d’Honneur',
          icon: Trophy,
          iconColor: 'text-blue-700',
        };
      case 'PRIX_SCIENCES':
        return {
          bg: 'bg-indigo-100 text-indigo-900 border-indigo-300',
          label: 'Prix Isaac Newton des Sciences',
          icon: Sparkles,
          iconColor: 'text-indigo-600',
        };
      case 'PRIX_HUMANITES':
        return {
          bg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          label: 'Prix d’Éloquence & Humanités',
          icon: BookOpen,
          iconColor: 'text-emerald-700',
        };
      case 'PRIX_CIVISME':
        return {
          bg: 'bg-rose-100 text-rose-900 border-rose-300',
          label: 'Prix du Civisme & Camaraderie',
          icon: HeartHandshake,
          iconColor: 'text-rose-600',
        };
      case 'ENCOURAGEMENTS':
        return {
          bg: 'bg-teal-100 text-teal-900 border-teal-300',
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

  return (
    <div className="space-y-8 sm:space-y-12">
      
      {/* HERO BANNER PALMARÈS */}
      <section className="bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl border border-amber-400/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-2xs font-extrabold tracking-wider uppercase border border-amber-400/40">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Palmarès d’Excellence & Distinction Académique</span>
            </div>
            
            <h2 className="font-serif text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Tableau d'Honneur des Élèves
            </h2>
            
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
              Le Collège Isaac Newton valorise le labeur assidu, l'émulation positive et la persévérance. Découvrez les lauréats certifiés ayant brillé par leurs résultats, leur civisme et leur amour des sciences.
            </p>

            {/* Micro stats strip */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 text-2xs">
              <div className="bg-white/10 rounded-xl p-2.5 border border-white/10">
                <div className="font-bold text-amber-400 text-sm">{students.length} Élèves Primés</div>
                <div className="text-slate-300 text-[10px]">Session 2026–2027</div>
              </div>
              <div className="bg-white/10 rounded-xl p-2.5 border border-white/10">
                <div className="font-bold text-amber-400 text-sm">9.45 / 10 · 91.8 %</div>
                <div className="text-slate-300 text-[10px]">Meilleures Moyennes</div>
              </div>
              <div className="bg-white/10 rounded-xl p-2.5 border border-white/10 col-span-2 sm:col-span-1">
                <div className="font-bold text-emerald-400 text-sm">100% de Réussite</div>
                <div className="text-slate-300 text-[10px]">Examens d’État MENFP</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs space-y-2">
              <span className="font-bold text-amber-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Diplômes d'Honneur Certifiés</span>
              </span>
              <p className="text-2xs text-slate-300 leading-relaxed">
                Chaque distinction donne droit à un diplôme officiel vectoriel avec sceau de l’établissement, imprimable pour les familles.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FILTRES & RECHERCHE */}
      <section className="space-y-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Cycle Pills */}
          <div className="inline-flex rounded-xl p-1 bg-slate-100 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setSelectedCycle('ALL')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                selectedCycle === 'ALL'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tous les cycles
            </button>
            <button
              type="button"
              onClick={() => setSelectedCycle('FONDAMENTAL')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                selectedCycle === 'FONDAMENTAL'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cycle Fondamental (7e–9e AF)
            </button>
            <button
              type="button"
              onClick={() => setSelectedCycle('SECONDAIRE')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                selectedCycle === 'SECONDAIRE'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Nouveau Secondaire (NS1–NS4)
            </button>
          </div>

          {/* Recherche */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un élève, classe..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-900/20 focus:border-blue-900 transition-all"
            />
          </div>
        </div>

        {/* Distinction Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-1">
          {distinctionsFilterList.map((df) => {
            const Icon = df.icon;
            const isSelected = selectedDistinction === df.id;
            return (
              <button
                key={df.id}
                type="button"
                onClick={() => setSelectedDistinction(df.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{df.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* GRILLE DES ÉLÈVES PRIMÉS */}
      {filteredStudents.length === 0 ? (
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-10 text-center space-y-2">
          <Award className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">Aucun élève trouvé pour ces critères</h3>
          <p className="text-xs text-slate-500">Modifiez le cycle ou réinitialisez les filtres pour afficher les lauréats.</p>
          <button
            type="button"
            onClick={() => { setSelectedCycle('ALL'); setSelectedDistinction('ALL'); setSearchQuery(''); }}
            className="text-xs font-bold text-blue-900 hover:underline pt-2 inline-block cursor-pointer"
          >
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student) => {
            const badge = getDistinctionBadge(student.distinction);
            const BadgeIcon = badge.icon;
            const isBusy = downloadingId === student.id;

            return (
              <div
                key={student.id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:border-amber-400 hover:shadow-md transition-all flex flex-col justify-between space-y-4 group relative overflow-hidden"
              >
                {/* Accent ribbon at top */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-900 via-amber-400 to-blue-900" />

                <div className="space-y-4 pt-1">
                  
                  {/* Top row: Rank & Average */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
                      <Trophy className="w-3 h-3 text-amber-600" />
                      <span>{student.rankInClass === 1 ? '1er de la classe' : `${student.rankInClass}e de la classe`}</span>
                    </span>

                    <div className="text-right">
                      <span className="text-xs font-mono font-extrabold text-blue-900 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">
                        {student.average} / {student.maxScale}
                      </span>
                    </div>
                  </div>

                  {/* Student Identity */}
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-900 to-slate-900 text-amber-400 font-serif font-bold text-lg flex items-center justify-center shrink-0 shadow-xs border border-amber-400/40">
                      {student.studentName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-base text-slate-900 group-hover:text-blue-900 transition-colors leading-tight">
                        {student.studentName}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        {student.classLevel}
                      </p>
                      <span className="text-[10px] font-mono text-slate-400">
                        {student.period}
                      </span>
                    </div>
                  </div>

                  {/* Distinction Pill */}
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-2xs font-bold border ${badge.bg}`}>
                    <BadgeIcon className={`w-3.5 h-3.5 ${badge.iconColor}`} />
                    <span>{badge.label}</span>
                  </div>

                  {/* Citation du Conseil */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 italic leading-relaxed">
                    « {student.citation} »
                  </div>

                  {/* Specialty tag if present */}
                  {student.specialty && (
                    <div className="flex items-center gap-1.5 text-2xs text-slate-500">
                      <span className="font-semibold text-slate-700">Point fort :</span>
                      <span>{student.specialty}</span>
                    </div>
                  )}

                </div>

                {/* Actions */}
                <div className="space-y-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => handleDownloadDiploma(student)}
                    disabled={isBusy}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer disabled:opacity-60"
                  >
                    {isBusy ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Génération du diplôme...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5 text-amber-400" />
                        <span>Télécharger le Diplôme (PDF)</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenPreview(student)}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                    <span>Voir le Certificat & Imprimer</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* CADRE PÉDAGOGIQUE & VALEURS D'ÉMULATION */}
      <section className="bg-slate-50 rounded-3xl p-6 sm:p-8 border border-slate-200 space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-blue-900" />
          <h3 className="font-serif font-bold text-base text-slate-900">
            Charte & Critères d'Attribution du Tableau d'Honneur (Session 2026–2027)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600 leading-relaxed">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
            <div className="font-bold text-blue-900 flex items-center gap-1.5">
              <Star className="w-4 h-4 text-amber-500" />
              <span>1. Félicitations du Conseil</span>
            </div>
            <p>
              Attribuées aux élèves obtenant une moyenne générale ≥ 8.5/10 (Fondamental) ou ≥ 85/100 (Secondaire), avec une assiduité et un comportement irréprochables tout au long du contrôle.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
            <div className="font-bold text-blue-900 flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-blue-600" />
              <span>2. Tableau d'Honneur</span>
            </div>
            <p>
              Réservé aux apprenants affichant une moyenne ≥ 7.5/10 ou ≥ 75/100, sans aucune note éliminatoire dans les matières fondamentales et respectant la discipline républicaine.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
            <div className="font-bold text-blue-900 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>3. Tableau des Encouragements</span>
            </div>
            <p>
              Dédié aux élèves ayant accompli des progrès spectaculaires (gain net supérieur à +2.5 points) et faisant preuve d'une persévérance exemplaire dans l'effort quotidien.
            </p>
          </div>
        </div>
      </section>

      {/* MODAL CERTIFICAT */}
      <HonorDiplomaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        student={previewStudent}
      />

    </div>
  );
};
