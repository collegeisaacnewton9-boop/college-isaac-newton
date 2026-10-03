import React from 'react';
import { 
  Users, 
  Sparkles, 
  Calendar, 
  ShieldCheck, 
  Trophy, 
  Music, 
  Code, 
  MessageSquare,
  ArrowRight
} from 'lucide-react';
import { SCHOOL_IMAGES } from '../assets/images';

interface SchoolLifePageProps {
  onNavigate: (page: string) => void;
}

export const SchoolLifePage: React.FC<SchoolLifePageProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-8 sm:space-y-12 py-5 sm:py-8">
      
      {/* Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl space-y-4">
          <span className="text-xs font-semibold uppercase tracking-widest text-blue-900">
            Épanouissement & Citoyenneté
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-slate-900">
            La Vie Scolaire au Quotidien
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-light">
            Une école vivante où chaque élève grandit dans le respect des règles, le goût de l'effort, la camaraderie et la pratique d'activités culturelles et scientifiques.
          </p>
        </div>
      </section>

      {/* 1. Cérémonie civique & Esprit de corps */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          <div className="lg:col-span-6 space-y-5">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-600">
              <ShieldCheck className="w-4 h-4" />
              <span>Valeurs Républicaines & Discipline</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
              Le Rassemblement Civique : Fierté et Cohésion
            </h2>
            <p className="text-sm text-slate-700 leading-relaxed">
              Chaque semaine débute par le salut solennel aux couleurs nationales sur l'esplanade du collège. Ce moment fédérateur réunit l'ensemble des élèves en uniforme réglementaire, le corps professoral et la direction.
            </p>
            <p className="text-sm text-slate-700 leading-relaxed">
              C'est l'occasion de rappeler les valeurs d'assiduité, de solidarité et d'amour de la patrie, tout en félicitant publiquement les élèves qui se sont distingués par leurs mérites scolaires ou leur comportement exemplaire.
            </p>
            <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 text-xs text-blue-950 font-medium">
              « Le respect des autres et la fierté de son établissement constituent les fondations solides de tout futur citoyen éclairé. »
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="rounded-3xl overflow-hidden shadow-xl border border-slate-200">
              <img
                src={SCHOOL_IMAGES.studentsAssembly}
                alt="Rassemblement des élèves du Collège Isaac Newton"
                referrerPolicy="no-referrer"
                className="w-full h-80 sm:h-96 object-cover"
              />
              <div className="p-4 bg-slate-900 text-white text-xs">
                <p className="font-semibold text-amber-300">Rassemblement civique des élèves</p>
                <p className="text-slate-300 text-[11px]">Discipline, élégance et dignité lors de la cérémonie de début de semaine</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. Les Clubs & Activités Périscolaires */}
      <section className="bg-slate-100/70 py-8 sm:py-10 border-y border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-6 space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-900">
              Talents & Passions
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
              Clubs Pédagogiques & Activités Périscolaires
            </h2>
            <p className="text-sm text-slate-600">
              Des ateliers hebdomadaires pour approfondir les compétences et révéler les vocations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center">
                <Code className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-base text-slate-900">Club Codage & Robotique</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Initiation aux langages informatiques, programmation d'animations interactives et montage de projets technologiques concrets au laboratoire.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-base text-slate-900">Club Débat & Éloquence</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Apprentissage de la prise de parole en public, techniques de rhétorique, argumentation structurée et joutes oratoires en français et anglais.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Trophy className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-base text-slate-900">Club d'Échecs & Stratégie</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Développement de la concentration, de la vision prospective et de la patience à travers le noble jeu d'échecs et des tournois internes.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                <Music className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-bold text-base text-slate-900">Chorale & Arts Plastiques</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Sensibilité artistique, chant choral polyphonique et réalisation d'expositions pour les grandes célébrations annuelles de l'école.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 3. Code Vestimentaire & Règles de Vie */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-900">
            <ShieldCheck className="w-4 h-4" />
            <span>Cadre de Vie Réglementé</span>
          </div>
          <h3 className="font-serif text-2xl font-bold text-slate-900">
            Uniforme et Discipline
          </h3>
          <p className="text-sm text-slate-700 leading-relaxed">
            Le Collège Isaac Newton attache une importance primordiale à la propreté, à la ponctualité et à la dignité de la tenue. L'uniforme officiel (haut blanc et bas bleu institutionnel avec écusson brodé) garantit l'égalité entre tous les élèves et renforce le sentiment d'appartenance collective.
          </p>
          <div className="pt-2 flex flex-wrap gap-4 text-xs font-medium text-slate-700">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-900" />
              <span>Ponctualité rigoureuse dès 07h15</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-900" />
              <span>Téléphones portables strictement éteints en classe</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-900" />
              <span>Carnet de correspondance obligatoire</span>
            </span>
          </div>
        </div>

        <div className="text-center pt-4">
          <button
            onClick={() => onNavigate('pre-registration')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-semibold text-xs shadow-md transition-all"
          >
            <span>Inscrire votre enfant au Collège Isaac Newton</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

    </div>
  );
};
