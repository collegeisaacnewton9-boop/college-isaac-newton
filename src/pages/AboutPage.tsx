import React, { useEffect, useState } from 'react';
import { 
  Building, 
  Target, 
  Users, 
  Award, 
  ShieldCheck, 
  Cpu, 
  BookOpen, 
  Compass,
  ArrowRight,
  Sparkles,
  Camera,
  GraduationCap,
  Image as ImageIcon,
  CheckCircle2,
  ExternalLink
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

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate, subSection, currentUser }) => {
  const [activeTab, setActiveTab] = useState<'histoire-mission' | 'equipe' | 'infrastructures'>('histoire-mission');

  // Smooth scroll to targeted anchor when subSection prop changes
  useEffect(() => {
    if (!subSection) return;

    const timeout = setTimeout(() => {
      if (subSection === 'histoire-mission' || subSection === 'histoire') {
        setActiveTab('histoire-mission');
        document.getElementById('histoire-fondation')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (subSection === 'mission') {
        setActiveTab('histoire-mission');
        document.getElementById('mission-vision')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (subSection === 'equipe') {
        setActiveTab('equipe');
        document.getElementById('direction-equipe')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (subSection === 'infrastructures') {
        setActiveTab('infrastructures');
        document.getElementById('infrastructures-campus')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);

    return () => clearTimeout(timeout);
  }, [subSection]);

  const scrollToAnchor = (id: string, tab: 'histoire-mission' | 'equipe' | 'infrastructures') => {
    setActiveTab(tab);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="space-y-8 sm:space-y-12 py-5 sm:py-8 font-sans">
      
      {/* 1. Header Banner & Identity */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-blue-900 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <ContentEditable
              contentKey="about.hero.badge"
              defaultContent="Le Collège · Histoire, Vocation & Infrastructures"
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
            defaultContent="Une communauté d'apprentissage d'excellence où la recherche du savoir, la rigueur intellectuelle, la discipline civique et les technologies modernes se conjuguent au quotidien."
            as="p"
            className="text-base sm:text-lg text-slate-600 leading-relaxed font-light"
            currentUser={currentUser}
            multiline={true}
          />
        </div>

        {/* Fluid In-Page Pills Navigation (Fast section jumping) */}
        <div className="mt-6 sm:mt-8 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200">
          <button
            type="button"
            onClick={() => scrollToAnchor('histoire-fondation', 'histoire-mission')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'histoire-mission'
                ? 'bg-blue-900 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Compass className="w-4 h-4 text-amber-400" />
            <span>Histoire, Mission & Vision</span>
          </button>

          <button
            type="button"
            onClick={() => scrollToAnchor('direction-equipe', 'equipe')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'equipe'
                ? 'bg-blue-900 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Users className="w-4 h-4 text-amber-400" />
            <span>Direction & Corps Professoral</span>
          </button>

          <button
            type="button"
            onClick={() => scrollToAnchor('infrastructures-campus', 'infrastructures')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'infrastructures'
                ? 'bg-blue-900 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Building className="w-4 h-4 text-amber-400" />
            <span>Infrastructures & Campus</span>
          </button>
        </div>
      </section>

      {/* 2. Notre Histoire & Philosophie (avec Photo Réelle et Éditrice d'Image) */}
      <section id="histoire-fondation" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-600">
              <Compass className="w-4 h-4" />
              <ContentEditable
                contentKey="about.history.badge"
                defaultContent="Origine & Vocation Fondatrice"
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
                  defaultContent="Engagement & Encadrement Pédagogique"
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
                  defaultContent="Postes informatiques individuels par élève"
                  as="p"
                  className="text-xs text-slate-600 mt-1"
                  currentUser={currentUser}
                  multiline={false}
                />
              </div>
            </div>
          </div>

          {/* Real Campus Facade Photo with In-Page Customizer & Camera Uploader */}
          <div className="lg:col-span-6">
            <div className="relative rounded-3xl overflow-hidden shadow-xl border border-slate-200 bg-slate-950">
              <ImageEditable
                contentKey="about.campus.image"
                defaultImage={SCHOOL_IMAGES.entranceFacade}
                alt="Façade Principale et Entrée du Collège Isaac Newton"
                label="Photo de la Façade Principale (Delmas 50)"
                currentUser={currentUser}
                containerClassName="relative aspect-video w-full overflow-hidden bg-slate-900"
              />
              <div className="p-4 bg-slate-900 text-white text-xs border-t border-slate-800 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-amber-300">Campus Principal du Collège Isaac Newton (Delmas 50, Haïti)</p>
                  <p className="text-slate-300 text-[11px]">Un cadre d'étude moderne, sécurisé et aéré propice à la sérénité des apprentissages</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 3. Mission & Vision Pédagogique */}
      <section id="mission-vision" className="bg-slate-100/70 py-10 sm:py-14 border-y border-slate-200/60 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-block text-xs font-semibold uppercase tracking-wider text-blue-900">
              <ContentEditable
                contentKey="about.mission.badge"
                defaultContent="Cadre Pédagogique & Valeurs"
                as="span"
                currentUser={currentUser}
                multiline={false}
              />
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
              Notre Mission & Notre Vision
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Former l’esprit critique, cultiver la curiosité scientifique et inculquer la citoyenneté responsable.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-2xs space-y-3">
              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center">
                <Target className="w-6 h-6" />
              </div>
              <ContentEditable
                contentKey="about.mission.title"
                defaultContent="Notre Mission"
                as="h3"
                className="font-serif text-xl sm:text-2xl font-bold text-slate-900"
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

            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-2xs space-y-3">
              <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
              <ContentEditable
                contentKey="about.vision.title"
                defaultContent="Notre Vision"
                as="h3"
                className="font-serif text-xl sm:text-2xl font-bold text-slate-900"
                currentUser={currentUser}
                multiline={false}
              />
              <ContentEditable
                contentKey="about.vision.desc"
                defaultContent="Être un pôle de référence éducative reconnu pour l'excellence de ses résultats académiques, la qualité humaine de son encadrement et son avant-gardisme dans l'intégration des technologies numériques au service de la formation des bâtisseurs de demain."
                as="p"
                className="text-xs sm:text-sm text-slate-600 leading-relaxed"
                currentUser={currentUser}
                multiline={true}
              />
            </div>

          </div>

          {/* Students Flag Assembly & Civic Spirit Photo with Uploader */}
          <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 shadow-md">
            <ImageEditable
              contentKey="about.assembly.image"
              defaultImage="/images/slide_students_flag_assembly.webp"
              alt="Rassemblement civique et esprit de corps des élèves du Collège Isaac Newton"
              label="Photo du Rassemblement Civique & Élèves"
              currentUser={currentUser}
              containerClassName="relative aspect-[21/9] sm:aspect-[24/9] w-full overflow-hidden bg-slate-900"
            />
            <div className="p-3 sm:p-4 bg-slate-900 text-white text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="font-semibold text-amber-300">Rassemblement civique hebdomadaire :</span>
                <span className="text-slate-300">Discipline, rigueur civique et fierté d'appartenance au Collège</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 4. Direction & Corps Professoral */}
      <section id="direction-equipe" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24 space-y-6">
        <div className="max-w-2xl mx-auto text-center space-y-2">
          <div className="inline-block text-[11px] font-semibold uppercase tracking-wider text-blue-900 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
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
            className="font-serif text-2xl sm:text-3xl font-bold text-slate-900"
            currentUser={currentUser}
            multiline={false}
          />
          <ContentEditable
            contentKey="about.team.subtitle"
            defaultContent="Sous la direction d'Orphe Jean Marie, une équipe d'éducateurs expérimentés et dévoués à la réussite académique et à l'épanouissement de chaque élève."
            as="p"
            className="text-xs sm:text-sm text-slate-600"
            currentUser={currentUser}
            multiline={true}
          />
        </div>

        {/* Founder Director Focus Card */}
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900 text-white rounded-3xl p-6 sm:p-8 border border-blue-800 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            
            <div className="md:col-span-4 text-center">
              <div className="relative inline-block">
                <ImageEditable
                  contentKey="about.director.image"
                  defaultImage="/images/portrait_coasmin_maxy_1792232767777.jpg"
                  alt="M. Orphe Jean Marie, Directeur Fondateur"
                  label="Photo de la Direction Générale"
                  currentUser={currentUser}
                  containerClassName="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden mx-auto shadow-2xl border-2 border-amber-400/60 bg-slate-800"
                />
              </div>
              <h3 className="font-serif font-bold text-lg text-white mt-3">Orphe Jean Marie</h3>
              <p className="text-xs text-amber-300 font-semibold">Directeur fondateur</p>
              <p className="text-[11px] text-slate-300 mt-0.5 font-light">Professeur de Mathématiques & Sciences Physiques</p>
            </div>

            <div className="md:col-span-8 space-y-4 text-xs sm:text-sm text-slate-200">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                <p className="font-serif italic text-sm text-slate-100 leading-relaxed">
                  « Bienvenue au Collège Isaac Newton. Notre mission est de forger les bâtisseurs de demain par la rigueur scientifique, la maîtrise des mathématiques, la discipline civique et l'ouverture aux technologies numériques. »
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-900/60 border border-white/10 flex items-start gap-2.5">
                  <GraduationCap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block">Excellence Académique</span>
                    <span className="text-slate-300 text-[11px]">Préparation rigoureuse aux examens officiels et aux facultés</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-900/60 border border-white/10 flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block">Encadrement Bienveillant</span>
                    <span className="text-slate-300 text-[11px]">Suivi individuel continu et dialogue permanent avec les familles</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => onNavigate('faculty')}
                  className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <Users className="w-4 h-4" />
                  <span>Consulter l'Organigramme & le Corps Professoral Complet</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 5. Infrastructures & Installations Modernes */}
      <section id="infrastructures-campus" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="rounded-3xl bg-slate-950 text-white p-6 sm:p-10 border border-slate-800 shadow-xl space-y-8">
          
          <div className="max-w-2xl space-y-2">
            <div className="inline-block text-xs font-semibold uppercase tracking-wider text-amber-400 font-mono">
              <ContentEditable
                contentKey="about.infra.badge"
                defaultContent="Campus Sécurisé & Cadre Pédagogique · Delmas 50"
                as="span"
                currentUser={currentUser}
                multiline={false}
              />
            </div>
            <ContentEditable
              contentKey="about.infra.title"
              defaultContent="Des infrastructures pensées pour réussir"
              as="h2"
              className="font-serif text-2xl sm:text-3xl font-bold text-white"
              currentUser={currentUser}
              multiline={false}
            />
            <ContentEditable
              contentKey="about.infra.subtitle"
              defaultContent="Découvrez nos installations réelles : laboratoire technologique équipé, cour d’honneur sécurisée et salles de classe aérées à Delmas 50."
              as="p"
              className="text-xs sm:text-sm text-slate-300 leading-relaxed"
              currentUser={currentUser}
              multiline={true}
            />
          </div>

          {/* 3 Real Infrastructure Photo Cards with In-Page Modifiers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            
            {/* Card 1: Computer Lab with Students */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-lg flex flex-col justify-between">
              <div>
                <ImageEditable
                  contentKey="about.infra.lab.image"
                  defaultImage="/images/slide_computer_lab_students.webp"
                  alt="Laboratoire informatique du Collège Isaac Newton avec élèves"
                  label="Photo du Laboratoire Informatique"
                  currentUser={currentUser}
                  containerClassName="relative aspect-video w-full overflow-hidden bg-slate-900"
                />
                <div className="p-4 space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-bold">
                    <Cpu className="w-4 h-4" />
                    <h3 className="font-serif text-sm text-white">Laboratoire informatique multimédia</h3>
                  </div>
                  <p className="text-slate-300 text-[11.5px] leading-relaxed">
                    25+ postes récents équipés sous onduleurs et serveurs dédiés. Initiation hebdomadaire à la bureautique, à la programmation et à l’éthique numérique.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 2: Campus Courtyard & Sports Area */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-lg flex flex-col justify-between">
              <div>
                <ImageEditable
                  contentKey="about.infra.courtyard.image"
                  defaultImage="/images/slide_campus_courtyard_facade.webp"
                  alt="Cour d’Honneur et Galeries Sécurisées du Campus"
                  label="Photo de la Cour d'Honneur & Terrains"
                  currentUser={currentUser}
                  containerClassName="relative aspect-video w-full overflow-hidden bg-slate-900"
                />
                <div className="p-4 space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-bold">
                    <ShieldCheck className="w-4 h-4" />
                    <h3 className="font-serif text-sm text-white">Cour d’Honneur & Terrain Multisports</h3>
                  </div>
                  <p className="text-slate-300 text-[11.5px] leading-relaxed">
                    Espace extérieur clôturé et surveillé pour les rassemblements civiques solennels, la récréation des élèves et la pratique du sport scolaire.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 3: Classrooms & Architecture */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-lg flex flex-col justify-between">
              <div>
                <ImageEditable
                  contentKey="about.infra.building.image"
                  defaultImage="/images/campus_courtyard_building_1790531780046.jpg"
                  alt="Bâtiments et salles de classe aérées"
                  label="Photo des Bâtiments & Salles de cours"
                  currentUser={currentUser}
                  containerClassName="relative aspect-video w-full overflow-hidden bg-slate-900"
                />
                <div className="p-4 space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-bold">
                    <Building className="w-4 h-4" />
                    <h3 className="font-serif text-sm text-white">Salles pédagogiques aérées</h3>
                  </div>
                  <p className="text-slate-300 text-[11.5px] leading-relaxed">
                    Salles de classe lumineuses, ventilation étudiée, mobilier individuel ergonomique garantissant confort et concentration continue.
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Action Row */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('gallery')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-colors cursor-pointer"
            >
              <ImageIcon className="w-4 h-4 text-amber-400" />
              <span>Consulter la Galerie Photos complète du Collège</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('pre-registration')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs hover:bg-amber-300 transition-colors cursor-pointer shadow-md"
            >
              <span>Préinscrire votre enfant pour 2026-2027</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </section>

    </div>
  );
};
