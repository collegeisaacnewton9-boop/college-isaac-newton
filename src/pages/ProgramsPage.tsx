import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Cpu, 
  BookOpen, 
  GraduationCap, 
  Sparkles, 
  Clock, 
  ArrowRight,
  ShieldCheck,
  FileCheck
} from 'lucide-react';
import { SCHOOL_IMAGES } from '../assets/images';
import { ContentEditable } from '../components/common/ContentEditable';
import { User } from '../types';

interface ProgramsPageProps {
  subSection?: string;
  onNavigate: (page: string) => void;
  currentUser?: User | null;
}

export const ProgramsPage: React.FC<ProgramsPageProps> = ({ subSection, onNavigate, currentUser }) => {
  const [activeTab, setActiveTab] = useState<'prescolaire' | 'fondamental' | 'secondaire' | 'numerique'>('fondamental');

  useEffect(() => {
    if (subSection === 'prescolaire' || subSection === 'fondamental' || subSection === 'secondaire' || subSection === 'numerique') {
      setActiveTab(subSection);
    }
  }, [subSection]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-8 sm:space-y-10 font-sans">
      
      {/* Page Header */}
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
          defaultContent="Un cheminement continu d'excellence académique, de l'éveil de la petite enfance jusqu'aux épreuves du baccalauréat et à la préparation aux études supérieures."
          as="p"
          className="text-sm sm:text-base text-slate-600 leading-relaxed font-light"
          currentUser={currentUser}
          multiline={true}
        />
      </div>

      {/* Program Selector Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200/80 max-w-2xl">
        {[
          { id: 'prescolaire', label: '1. Préscolaire (3-5 ans)', icon: Sparkles },
          { id: 'fondamental', label: '2. Fondamental (1e-9e AF)', icon: BookOpen },
          { id: 'secondaire', label: '3. Secondaire (NS1-NS4)', icon: GraduationCap },
          { id: 'numerique', label: '4. Pôle Numérique', icon: Cpu },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                isActive 
                  ? 'bg-blue-900 text-white shadow-md' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT: PRÉSCOLAIRE */}
      {activeTab === 'prescolaire' && (
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200/80 space-y-8 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-block text-xs font-mono font-medium text-amber-600 bg-amber-50 px-2.5 py-1 rounded">
                <ContentEditable
                  contentKey="programs.prescolaire.badge"
                  defaultContent="Petite Section · Moyenne Section · Grande Section"
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

            <div className="lg:col-span-4 bg-slate-50 rounded-2xl p-6 border border-slate-100 space-y-4 text-xs">
              <h3 className="font-serif font-bold text-sm text-slate-900">Points Clés du Préscolaire :</h3>
              <ul className="space-y-2 text-slate-600">
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
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Horaires : 07h30 - 13h00</span>
                </li>
              </ul>
              <button
                onClick={() => onNavigate('pre-registration')}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-900 text-white font-semibold text-xs hover:bg-blue-950 transition-colors shadow-sm cursor-pointer"
              >
                Préinscrire en préscolaire
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: FONDAMENTAL */}
      {activeTab === 'fondamental' && (
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200/80 space-y-8 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-block text-xs font-mono font-medium text-blue-700 bg-blue-50 px-2.5 py-1 rounded">
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
                  <span className="text-[11px] font-bold uppercase text-amber-700">3ème Cycle (7ème à 9ème AF)</span>
                  <h4 className="font-serif font-bold text-sm text-slate-900">Préparation aux Épreuves Officielles de la 9ème AF</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Algèbre, physique, chimie, biologie, rédaction structurée de dissertations, langue vivante et modules d'informatique. Séances régulières de devoirs surveillés et simulations d'examens d'État.
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 bg-slate-50 rounded-2xl p-6 border border-slate-100 space-y-4 text-xs">
              <h3 className="font-serif font-bold text-sm text-slate-900">Atouts du Fondamental :</h3>
              <ul className="space-y-2 text-slate-600">
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
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Excellents taux de réussite aux examens d'État</span>
                </li>
              </ul>
              <button
                onClick={() => onNavigate('pre-registration')}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-900 text-white font-semibold text-xs hover:bg-blue-950 transition-colors shadow-sm cursor-pointer"
              >
                Préinscrire au fondamental
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: SECONDAIRE */}
      {activeTab === 'secondaire' && (
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200/80 space-y-8 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-block text-xs font-mono font-medium text-purple-700 bg-purple-50 px-2.5 py-1 rounded">
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

            <div className="lg:col-span-4 bg-slate-50 rounded-2xl p-6 border border-slate-100 space-y-4 text-xs">
              <h3 className="font-serif font-bold text-sm text-slate-900">Spécificités du Secondaire :</h3>
              <ul className="space-y-2 text-slate-600">
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
              </ul>
              <button
                onClick={() => onNavigate('pre-registration')}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-900 text-white font-semibold text-xs hover:bg-blue-950 transition-colors shadow-sm cursor-pointer"
              >
                Préinscrire au secondaire
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: PÔLE NUMÉRIQUE */}
      {activeTab === 'numerique' && (
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200/80 space-y-8 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-6 space-y-4">
              <div className="inline-block text-xs font-mono font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded">
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
                defaultContent="Le Collège Isaac Newton se distingue par son laboratoire informatique moderne climatisé, doté d'ordinateurs récents et d'une infrastructure conçue pour donner à chaque élève les outils de son autonomie technologique."
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
              <div className="rounded-2xl overflow-hidden shadow-lg border border-slate-200">
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
                  onClick={() => onNavigate('pre-registration')}
                  className="px-3 py-1.5 rounded-lg bg-amber-400 text-slate-950 font-bold text-[11px] hover:bg-amber-300 transition-colors whitespace-nowrap cursor-pointer"
                >
                  S'inscrire
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
