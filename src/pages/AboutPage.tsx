import React from 'react';
import { 
  Building, 
  Target, 
  Users, 
  Award, 
  ShieldCheck, 
  Cpu, 
  BookOpen, 
  Compass,
  ArrowRight
} from 'lucide-react';
import { SCHOOL_IMAGES } from '../assets/images';
import { SCHOOL_INFO } from '../data/mockData';

interface AboutPageProps {
  onNavigate: (page: string, subSection?: string) => void;
  subSection?: string;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-8 sm:space-y-12 py-5 sm:py-8">
      
      {/* 1. Header Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl space-y-4">
          <span className="text-xs font-semibold uppercase tracking-widest text-blue-900">
            Institution & Histoire
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-slate-900 tracking-tight">
            Le Collège Isaac Newton
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-light">
            Une communauté d'apprentissage où la recherche du savoir, la rigueur intellectuelle et l'épanouissement humain se conjuguent au quotidien.
          </p>
        </div>
      </section>

      {/* 2. Notre Histoire & Philosophie */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-600">
              <Compass className="w-4 h-4" />
              <span>Origine & Vocation</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
              Inspiré par le génie scientifique, tourné vers l'avenir
            </h2>
            <p className="text-sm text-slate-700 leading-relaxed">
              Fondé avec la conviction profonde que l'éducation est le socle de toute transformation durable, le <strong>Collège Isaac Newton</strong> porte le nom de l'illustre physicien et mathématicien afin d'insuffler à chaque élève la passion de la découverte, la démarche scientifique rigoureuse et le courage de penser par soi-même.
            </p>
            <p className="text-sm text-slate-700 leading-relaxed">
              Nos devises emblématiques, <em className="font-serif text-blue-900 font-semibold">« Apprendre aujourd'hui pour bâtir demain »</em> et <em className="font-serif text-blue-900 font-semibold">« Savoir aujourd'hui, réussir demain »</em>, résument notre engagement : transmettre les compétences fondamentales et technologiques indispensables pour former des citoyens intègres, compétents et prêts à contribuer positivement à la société.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-2xl font-serif font-bold text-blue-900">100%</p>
                <p className="text-xs text-slate-600 mt-1">Engagement de l'équipe pédagogique</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-2xl font-serif font-bold text-blue-900">1:1</p>
                <p className="text-xs text-slate-600 mt-1">Postes informatiques en laboratoire</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative rounded-3xl overflow-hidden shadow-xl border border-slate-200">
              <img
                src={SCHOOL_IMAGES.heroCampus}
                alt="Bâtiment principal du Collège Isaac Newton"
                referrerPolicy="no-referrer"
                className="w-full h-80 sm:h-96 object-cover"
              />
              <div className="p-4 bg-slate-900 text-white text-xs">
                <p className="font-semibold text-amber-300">Campus Principal du Collège Isaac Newton (Delmas 50, rue Dominique #2 bis, Port-au-Prince)</p>
                <p className="text-slate-300 text-[11px]">Un cadre d'étude moderne, sécurisé et aéré propice à la sérénité des apprentissages</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 3. Mission & Vision */}
      <section className="bg-slate-100/70 py-8 sm:py-10 border-y border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            
            <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200 shadow-2xs space-y-2.5">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-900 flex items-center justify-center">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-xl font-bold text-slate-900">Notre Mission</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Offrir à chaque jeune, dès le plus jeune âge, un enseignement pluridisciplinaire exigeant fondé sur l'amour de la connaissance, la discipline personnelle et l'apprentissage méthodique. Nous nous attachons à développer la pensée critique, l'esprit d'initiative et le sens du devoir civique.
              </p>
            </div>

            <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200 shadow-2xs space-y-2.5">
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-xl font-bold text-slate-900">Notre Vision</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Être un pôle de référence éducative reconnu pour l'excellence de ses résultats académiques, la qualité humaine de son encadrement et son avant-gardisme dans l'intégration des technologies numériques au service de la formation des leaders de demain.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 4. Direction & Encadrement Pédagogique */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="max-w-2xl mx-auto text-center space-y-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-900">
            Une gouvernance engagée
          </span>
          <h2 className="font-serif text-xl sm:text-3xl font-bold text-slate-900">
            Direction et Corps Professoral
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Une équipe d'éducateurs chevronnés sous l'impulsion d'une direction fondatrice attachée à l'excellence scientifique et morale.
          </p>
        </div>

        {/* Carte Spéciale : Directeur Fondateur */}
        <div className="relative rounded-2xl bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white p-6 sm:p-8 border border-slate-800 shadow-xl overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-3 text-center sm:text-left flex flex-col sm:flex-row lg:flex-col items-center gap-4">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center font-serif text-3xl font-bold shadow-lg ring-4 ring-white/10 shrink-0">
                OJM
              </div>
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-bold uppercase tracking-wider mb-1">
                  Direction Générale
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-white">
                  Orphe Jean Marie
                </h3>
                <p className="text-xs text-amber-400 font-medium">
                  Directeur fondateur
                </p>
                <p className="text-[11px] text-slate-300 font-light mt-0.5">
                  Professeur de Mathématiques & Sciences Physiques
                </p>
              </div>
            </div>

            <div className="lg:col-span-9 space-y-3.5 border-t lg:border-t-0 lg:border-l border-slate-800 pt-4 lg:pt-0 lg:pl-8 text-xs sm:text-sm text-slate-200">
              <blockquote className="font-serif italic text-sm sm:text-base text-slate-100 leading-relaxed border-l-2 border-amber-400 pl-3">
                « Notre ambition pour chaque enfant confié au Collège Isaac Newton est d'ériger les sciences exactes, la rigueur de l'esprit d'analyse et les valeurs humanistes en véritables moteurs d'émancipation personnelle et de contribution citoyenne. »
              </blockquote>
              <p className="text-xs text-slate-300 leading-relaxed">
                Fort d'une solide expérience professorale en mathématiques et en sciences physiques, le Directeur fondateur veille personnellement à l'élévation continue du niveau d'exigence, à l'encadrement scrupuleux des cycles fondamental et secondaire, ainsi qu'au dialogue transparent avec chaque famille haïtienne.
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-1 text-[11px] text-slate-300">
                <span className="flex items-center gap-1.5 text-amber-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  Campus Delmas 50, rue Dominique #2 bis, Port-au-Prince
                </span>
                <span className="text-slate-500">|</span>
                <span className="font-mono text-slate-200">
                  Lignes directes : +509 3316-0934 / +509 3721-1818
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm text-center space-y-3">
            <div className="w-20 h-20 rounded-full bg-blue-900 text-white flex items-center justify-center font-serif text-2xl font-bold mx-auto shadow-md">
              DP
            </div>
            <div>
              <h4 className="font-serif font-bold text-slate-900 text-base">Direction Pédagogique</h4>
              <p className="text-xs text-blue-900 font-medium mt-0.5">Supervision des cursus & examens</p>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Garante de la conformité des programmes officiels et de l'exigence méthodologique dans chaque discipline.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm text-center space-y-3">
            <div className="w-20 h-20 rounded-full bg-amber-500 text-white flex items-center justify-center font-serif text-2xl font-bold mx-auto shadow-md">
              VS
            </div>
            <div>
              <h4 className="font-serif font-bold text-slate-900 text-base">Direction de la Vie Scolaire</h4>
              <p className="text-xs text-amber-700 font-medium mt-0.5">Discipline & Accompagnement</p>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Veille à la sécurité, à l'assiduité, au respect du règlement et à l'ambiance bienveillante du campus.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm text-center space-y-3">
            <div className="w-20 h-20 rounded-full bg-emerald-700 text-white flex items-center justify-center font-serif text-2xl font-bold mx-auto shadow-md">
              PT
            </div>
            <div>
              <h4 className="font-serif font-bold text-slate-900 text-base">Pôle Numérique & STEM</h4>
              <p className="text-xs text-emerald-700 font-medium mt-0.5">Laboratoire informatique</p>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Conçoit les ateliers technologiques, l'initiation au codage et l'utilisation pédagogique des ordinateurs.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Infrastructures */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-slate-900 text-white p-8 sm:p-12 space-y-8">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
              Environnement matériel
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
              Des infrastructures pensées pour apprendre
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Le cadre matériel d'un établissement joue un rôle déterminant dans le confort et la concentration des enfants.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <Building className="w-6 h-6 text-amber-400" />
              <h3 className="font-serif font-bold text-base text-white">Salles de classe spacieuses</h3>
              <p className="text-slate-300 leading-relaxed">
                Salles bien aérées et lumineuses, équipées de mobilier ergonomique pour favoriser l'attention continue des élèves.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <Cpu className="w-6 h-6 text-amber-400" />
              <h3 className="font-serif font-bold text-base text-white">Laboratoire informatique moderne</h3>
              <p className="text-slate-300 leading-relaxed">
                Postes individuels récents avec système d'exploitation stable, connexion sécurisée et vidéoprojecteur pour les démonstrations.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <ShieldCheck className="w-6 h-6 text-amber-400" />
              <h3 className="font-serif font-bold text-base text-white">Cour et esplanade sécurisées</h3>
              <p className="text-slate-300 leading-relaxed">
                Espace extérieur aménagé pour les rassemblements civiques solennels, la récréation surveillée et la pratique sportive.
              </p>
            </div>
          </div>

          <div className="pt-2 text-center">
            <button
              onClick={() => onNavigate('pre-registration')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs hover:bg-amber-300 transition-colors"
            >
              <span>Rejoindre le Collège Isaac Newton</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
