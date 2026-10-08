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
import { ContentEditable } from '../components/common/ContentEditable';
import { ImageEditable } from '../components/common/ImageEditable';
import { User } from '../types';

interface AboutPageProps {
  onNavigate: (page: string, subSection?: string) => void;
  subSection?: string;
  currentUser?: User | null;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate, currentUser }) => {
  return (
    <div className="space-y-8 sm:space-y-12 py-5 sm:py-8 font-sans">
      
      {/* 1. Header Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-blue-900">
            <ContentEditable
              contentKey="about.hero.badge"
              defaultContent="Institution & Histoire"
              as="span"
              currentUser={currentUser}
              multiline={false}
            />
          </div>
          <ContentEditable
            contentKey="about.hero.title"
            defaultContent="Le Collège Isaac Newton"
            as="h1"
            className="font-serif text-3xl sm:text-5xl font-bold text-slate-900 tracking-tight"
            currentUser={currentUser}
            multiline={false}
          />
          <ContentEditable
            contentKey="about.hero.subtitle"
            defaultContent="Une communauté d'apprentissage où la recherche du savoir, la rigueur intellectuelle et l'épanouissement humain se conjuguent au quotidien."
            as="p"
            className="text-base sm:text-lg text-slate-600 leading-relaxed font-light"
            currentUser={currentUser}
            multiline={true}
          />
        </div>
      </section>

      {/* 2. Notre Histoire & Philosophie */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-600">
              <Compass className="w-4 h-4" />
              <ContentEditable
                contentKey="about.history.badge"
                defaultContent="Origine & Vocation"
                as="span"
                currentUser={currentUser}
                multiline={false}
              />
            </div>

            <ContentEditable
              contentKey="about.history.title"
              defaultContent="Inspiré par le génie scientifique, tourné vers l'avenir"
              as="h2"
              className="font-serif text-2xl sm:text-3xl font-bold text-slate-900"
              currentUser={currentUser}
              multiline={false}
            />

            <ContentEditable
              contentKey="about.history.p1"
              defaultContent="Fondé avec la conviction profonde que l'éducation est le socle de toute transformation durable, le Collège Isaac Newton porte le nom de l'illustre physicien et mathématicien afin d'insuffler à chaque élève la passion de la découverte, la démarche scientifique rigoureuse et le courage de penser par soi-même."
              as="p"
              className="text-sm text-slate-700 leading-relaxed"
              currentUser={currentUser}
              multiline={true}
            />

            <ContentEditable
              contentKey="about.history.p2"
              defaultContent="Nos devises emblématiques, « Apprendre aujourd'hui pour bâtir demain » et « Savoir aujourd'hui, réussir demain », résument notre engagement : transmettre les compétences fondamentales et technologiques indispensables pour former des citoyens intègres, compétents et prêts à contribuer positivement à la société."
              as="p"
              className="text-sm text-slate-700 leading-relaxed"
              currentUser={currentUser}
              multiline={true}
            />

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-2xl font-serif font-bold text-blue-900">100%</p>
                <ContentEditable
                  contentKey="about.stat1.desc"
                  defaultContent="Engagement de l'équipe pédagogique"
                  as="p"
                  className="text-xs text-slate-600 mt-1"
                  currentUser={currentUser}
                  multiline={false}
                />
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-2xl font-serif font-bold text-blue-900">1:1</p>
                <ContentEditable
                  contentKey="about.stat2.desc"
                  defaultContent="Postes informatiques en laboratoire"
                  as="p"
                  className="text-xs text-slate-600 mt-1"
                  currentUser={currentUser}
                  multiline={false}
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative rounded-3xl overflow-hidden shadow-xl border border-slate-200">
              <ImageEditable
                contentKey="about.campus.image"
                defaultImage={SCHOOL_IMAGES.heroCampus}
                alt="Bâtiment principal du Collège Isaac Newton"
                currentUser={currentUser}
                label="Photo du Campus Principal (À Propos)"
                recommendedAspect="Format 16:9 recommandé"
              />
              <div className="p-4 bg-slate-900 text-white text-xs space-y-1">
                <ContentEditable
                  contentKey="about.campus.caption"
                  defaultContent="Campus Principal du Collège Isaac Newton (Delmas 50, Haïti)"
                  as="p"
                  className="font-semibold text-amber-300"
                  currentUser={currentUser}
                  multiline={false}
                />
                <ContentEditable
                  contentKey="about.campus.subcaption"
                  defaultContent="Un cadre d'étude moderne, sécurisé et aéré propice à la sérénité des apprentissages"
                  as="p"
                  className="text-slate-300 text-[11px]"
                  currentUser={currentUser}
                  multiline={false}
                />
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
              <ContentEditable
                contentKey="about.mission.title"
                defaultContent="Notre Mission"
                as="h3"
                className="font-serif text-xl font-bold text-slate-900"
                currentUser={currentUser}
                multiline={false}
              />
              <ContentEditable
                contentKey="about.mission.desc"
                defaultContent="Offrir à chaque jeune, dès le plus jeune âge, un enseignement pluridisciplinaire exigeant fondé sur l'amour de la connaissance, la discipline personnelle et l'apprentissage méthodique. Nous nous attachons à développer la pensée critique, l'esprit d'initiative et le sens du devoir civique."
                as="p"
                className="text-xs sm:text-sm text-slate-600 leading-relaxed"
                currentUser={currentUser}
                multiline={true}
              />
            </div>

            <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200 shadow-2xs space-y-2.5">
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <ContentEditable
                contentKey="about.vision.title"
                defaultContent="Notre Vision"
                as="h3"
                className="font-serif text-xl font-bold text-slate-900"
                currentUser={currentUser}
                multiline={false}
              />
              <ContentEditable
                contentKey="about.vision.desc"
                defaultContent="Être un pôle de référence éducative reconnu pour l'excellence de ses résultats académiques, la qualité humaine de son encadrement et son avant-gardisme dans l'intégration des technologies numériques au service de la formation des leaders de demain."
                as="p"
                className="text-xs sm:text-sm text-slate-600 leading-relaxed"
                currentUser={currentUser}
                multiline={true}
              />
            </div>

          </div>
        </div>
      </section>

      {/* 4. Direction & Encadrement Pédagogique */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center mb-6 space-y-1.5">
          <div className="inline-block text-[11px] font-semibold uppercase tracking-wider text-blue-900">
            <ContentEditable
              contentKey="about.team.badge"
              defaultContent="Une gouvernance engagée"
              as="span"
              currentUser={currentUser}
              multiline={false}
            />
          </div>
          <ContentEditable
            contentKey="about.team.title"
            defaultContent="Direction et Corps Professoral"
            as="h2"
            className="font-serif text-xl sm:text-3xl font-bold text-slate-900"
            currentUser={currentUser}
            multiline={false}
          />
          <ContentEditable
            contentKey="about.team.subtitle"
            defaultContent="Une équipe d'éducateurs expérimentés et dévoués à la réussite et à l'épanouissement de chaque élève."
            as="p"
            className="text-xs sm:text-sm text-slate-600"
            currentUser={currentUser}
            multiline={true}
          />
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
            <div className="inline-block text-xs font-semibold uppercase tracking-wider text-amber-400">
              <ContentEditable
                contentKey="about.infra.badge"
                defaultContent="Environnement matériel"
                as="span"
                currentUser={currentUser}
                multiline={false}
              />
            </div>
            <ContentEditable
              contentKey="about.infra.title"
              defaultContent="Des infrastructures pensées pour apprendre"
              as="h2"
              className="font-serif text-2xl sm:text-3xl font-bold text-white"
              currentUser={currentUser}
              multiline={false}
            />
            <ContentEditable
              contentKey="about.infra.subtitle"
              defaultContent="Le cadre matériel d'un établissement joue un rôle déterminant dans le confort et la concentration des enfants."
              as="p"
              className="text-xs sm:text-sm text-slate-300 leading-relaxed"
              currentUser={currentUser}
              multiline={true}
            />
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
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs hover:bg-amber-300 transition-colors cursor-pointer"
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
