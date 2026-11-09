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
  GraduationCap,
  Image as ImageIcon,
  CheckCircle2,
  Phone,
  Mail,
  Clock,
  Calendar,
  Send,
  Loader2,
  MapPin,
  Check,
  AlertCircle
} from 'lucide-react';
import { SCHOOL_IMAGES } from '../assets/images';
import { SCHOOL_INFO } from '../data/mockData';
import { ContentEditable } from '../components/common/ContentEditable';
import { ImageEditable } from '../components/common/ImageEditable';
import { User } from '../types';
import { apiService } from '../services/api';
import { validateEmail, validatePhone } from '../utils/validation';
import { toast } from 'sonner';

interface AboutPageProps {
  onNavigate: (page: string, subSection?: string) => void;
  subSection?: string;
  currentUser?: User | null;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate, subSection, currentUser }) => {
  const [activeTab, setActiveTab] = useState<'histoire-mission' | 'equipe' | 'infrastructures' | 'visite-contact'>('histoire-mission');

  // Formulaire Express de Visite / Contact
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    interest: 'visite',
    level: 'secondaire',
    message: ''
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

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
      } else if (subSection === 'visite' || subSection === 'contact') {
        setActiveTab('visite-contact');
        document.getElementById('visite-contact')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 80);

    return () => clearTimeout(timeout);
  }, [subSection]);

  const scrollToAnchor = (id: string, tab: 'histoire-mission' | 'equipe' | 'infrastructures' | 'visite-contact') => {
    setActiveTab(tab);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.fullName.trim() || !formData.email.trim()) {
      setFormError('Veuillez renseigner votre nom complet et une adresse e-mail.');
      return;
    }

    const emailCheck = validateEmail(formData.email);
    if (!emailCheck.isValid) {
      setFormError(emailCheck.error || 'Adresse e-mail non valide.');
      return;
    }

    if (formData.phone.trim()) {
      const phoneCheck = validatePhone(formData.phone);
      if (!phoneCheck.isValid) {
        setFormError(phoneCheck.error || 'Numéro de téléphone non valide.');
        return;
      }
    }

    setFormLoading(true);
    try {
      const interestLabels: Record<string, string> = {
        visite: 'Visite guidée des infrastructures',
        inscription: 'Préinscription & Admission',
        direction: 'Rendez-vous Direction pédagogique',
        renseignement: 'Renseignements généraux'
      };

      const levelLabels: Record<string, string> = {
        prescolaire: 'Cycle Préscolaire (TPS - GS)',
        fondamental: 'Cycle Fondamental (1ère - 9ème AF)',
        secondaire: 'Nouveau Secondaire (NS1 - NS4)'
      };

      await apiService.sendContactMessage({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        subject: `[Le Collège] ${interestLabels[formData.interest] || 'Visite'} - ${levelLabels[formData.level] || ''}`,
        message: formData.message.trim() || `Demande de visite / contact initiée depuis la page Le Collège. Intérêt: ${interestLabels[formData.interest]} - Niveau: ${levelLabels[formData.level]}`
      });

      setFormSubmitted(true);
      toast.success('Demande enregistrée avec succès. Le secrétariat vous contactera sous 24h.');
    } catch {
      setFormError('Une erreur est survenue lors de la transmission. Veuillez réessayer ou joindre le secrétariat par téléphone.');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-6 sm:space-y-8 font-sans">
      
      {/* 1. En-tête Compact & Navigation Interne Segmentée */}
      <section className="space-y-3 sm:space-y-4">
        {/* Breadcrumb / Kicker unboxed */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-medium">
          <span className="text-blue-900 font-bold uppercase tracking-wider">Institution</span>
          <span aria-hidden="true" className="text-slate-300">/</span>
          <ContentEditable
            contentKey="about.hero.badge"
            defaultContent="Le Collège · Histoire, Vocation & Infrastructures"
            as="span"
            currentUser={currentUser}
            multiline={false}
          />
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span>Delmas 50, Haïti</span>
        </div>

        {/* Titre et accroche synthétique (textes réduits et denses) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-6 items-baseline">
          <div className="lg:col-span-7">
            <ContentEditable
              contentKey="about.hero.title"
              defaultContent="Le Collège Isaac Newton"
              as="h1"
              className="font-serif text-2xl sm:text-4xl lg:text-4.5xl font-bold text-slate-900 tracking-tight text-balance"
              currentUser={currentUser}
              multiline={false}
            />
          </div>
          <div className="lg:col-span-5">
            <ContentEditable
              contentKey="about.hero.subtitle"
              defaultContent="Établissement d'excellence fondé sur la rigueur scientifique, la citoyenneté responsable et l'intégration des technologies numériques."
              as="p"
              className="text-xs sm:text-sm text-slate-600 leading-snug"
              currentUser={currentUser}
              multiline={true}
            />
          </div>
        </div>

        {/* Sélecteur d'onglets segmenté, fluide et responsive */}
        <div className="pt-1">
          <nav 
            className="flex items-center gap-1 p-1 bg-slate-100/90 rounded-xl border border-slate-200/80 overflow-x-auto scrollbar-none"
            aria-label="Sections du Collège"
          >
            <button
              type="button"
              onClick={() => scrollToAnchor('histoire-fondation', 'histoire-mission')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'histoire-mission'
                  ? 'bg-white text-blue-950 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-blue-700" />
              <span>Histoire & Vocation</span>
            </button>

            <button
              type="button"
              onClick={() => scrollToAnchor('direction-equipe', 'equipe')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'equipe'
                  ? 'bg-white text-blue-950 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-blue-700" />
              <span>Direction & Corps Professoral</span>
            </button>

            <button
              type="button"
              onClick={() => scrollToAnchor('infrastructures-campus', 'infrastructures')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'infrastructures'
                  ? 'bg-white text-blue-950 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building className="w-3.5 h-3.5 text-blue-700" />
              <span>Infrastructures & Campus</span>
            </button>

            <button
              type="button"
              onClick={() => scrollToAnchor('visite-contact', 'visite-contact')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'visite-contact'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'text-blue-900 hover:bg-blue-50 font-bold'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>Visiter le Campus</span>
            </button>
          </nav>
        </div>
      </section>

      {/* 2. Notre Histoire & Philosophie (Rythme compact, dense & direct) */}
      <section id="histoire-fondation" className="scroll-mt-16 pt-2">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-7 items-center">
          
          <div className="lg:col-span-6 space-y-3.5">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-amber-700">
              <Compass className="w-3.5 h-3.5" />
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
              className="font-serif text-xl sm:text-2xl font-bold text-slate-900 tracking-tight"
              currentUser={currentUser}
              multiline={false}
            />

            {/* Paragraphes concis et percutants */}
            <div className="space-y-2 text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
              <ContentEditable
                contentKey="about.history.p1"
                defaultContent="Fondé sur la conviction que l'éducation est le socle de toute élévation durable, le Collège Isaac Newton porte le nom de l'illustre savant pour insuffler le goût de la démarche expérimentale, la curiosité et l'autonomie de pensée."
                as="p"
                currentUser={currentUser}
                multiline={true}
              />
              <ContentEditable
                contentKey="about.history.p2"
                defaultContent="Nos devises « Savoir aujourd'hui, réussir demain » et « Apprendre aujourd'hui pour bâtir demain » traduisent notre engagement quotidien : allier savoirs fondamentaux, culture numérique et civisme exemplaire."
                as="p"
                currentUser={currentUser}
                multiline={true}
              />
            </div>

            {/* Ruban d'indicateurs chiffrés compact */}
            <div className="grid grid-cols-3 gap-2.5 pt-1">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
                <span className="font-mono text-lg font-bold text-blue-950 tabular-nums">100%</span>
                <p className="text-[10.5px] text-slate-600 font-medium leading-tight mt-0.5">Réussite examens d'État</p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
                <span className="font-mono text-lg font-bold text-blue-950 tabular-nums">1:1</span>
                <p className="text-[10.5px] text-slate-600 font-medium leading-tight mt-0.5">Poste PC par élève</p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80">
                <span className="font-mono text-lg font-bold text-blue-950 tabular-nums">25+</span>
                <p className="text-[10.5px] text-slate-600 font-medium leading-tight mt-0.5">Années d'excellence</p>
              </div>
            </div>
          </div>

          {/* Image Réelle Façade Campus (Optimisée, cadrage net) */}
          <div className="lg:col-span-6">
            <div className="rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm bg-slate-900">
              <ImageEditable
                contentKey="about.campus.image"
                defaultImage={SCHOOL_IMAGES.entranceFacade}
                alt="Façade Principale et Entrée du Collège Isaac Newton"
                label="Photo Façade Principale"
                currentUser={currentUser}
                containerClassName="relative aspect-video w-full overflow-hidden bg-slate-900"
              />
              <div className="px-3.5 py-2.5 bg-slate-900 text-white text-[11px] border-t border-slate-800 flex items-center justify-between gap-2">
                <div className="truncate">
                  <span className="font-semibold text-amber-300">Campus Principal Delmas 50</span>
                  <span className="text-slate-400 mx-1.5">·</span>
                  <span className="text-slate-300">Cadre sécurisé & aéré</span>
                </div>
                <button
                  type="button"
                  onClick={() => scrollToAnchor('infrastructures-campus', 'infrastructures')}
                  className="text-amber-400 hover:text-amber-300 font-medium whitespace-nowrap flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <span>Détails</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 3. Mission & Vision Pédagogique (Surface épurée, 2 colonnes équilibrées) */}
      <section id="mission-vision" className="scroll-mt-16 bg-slate-50/90 rounded-2xl border border-slate-200/80 p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-slate-200/70">
          <div>
            <h2 className="font-serif text-lg sm:text-xl font-bold text-slate-900">Mission & Vision Éducative</h2>
            <p className="text-xs text-slate-600">Former l’esprit critique, la curiosité scientifique et la responsabilité civique.</p>
          </div>
          <span className="text-[11px] text-slate-500 font-mono self-start sm:self-auto">Excellence · Discipline · Avenir</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <div className="bg-white rounded-xl p-4 border border-slate-200/80 space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-900 flex items-center justify-center shrink-0">
                <Target className="w-4 h-4" />
              </div>
              <ContentEditable
                contentKey="about.mission.title"
                defaultContent="Notre Mission"
                as="h3"
                className="font-serif text-base font-bold text-slate-900"
                currentUser={currentUser}
                multiline={false}
              />
            </div>
            <ContentEditable
              contentKey="about.mission.desc"
              defaultContent="Fournir un enseignement pluridisciplinaire exigeant fondé sur l'amour de la connaissance, la discipline personnelle et l'apprentissage méthodique, du préscolaire au baccalauréat."
              as="p"
              className="text-xs text-slate-600 leading-relaxed"
              currentUser={currentUser}
              multiline={true}
            />
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-200/80 space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                <Award className="w-4 h-4" />
              </div>
              <ContentEditable
                contentKey="about.vision.title"
                defaultContent="Notre Vision"
                as="h3"
                className="font-serif text-base font-bold text-slate-900"
                currentUser={currentUser}
                multiline={false}
              />
            </div>
            <ContentEditable
              contentKey="about.vision.desc"
              defaultContent="Demeurer un pôle éducatif de référence en Haïti, reconnu pour la qualité de son encadrement humain, l'excellence de ses résultats officiels et son avant-gardisme numérique."
              as="p"
              className="text-xs text-slate-600 leading-relaxed"
              currentUser={currentUser}
              multiline={true}
            />
          </div>
        </div>

        {/* Bannière civique d'esprit de corps (Format compact) */}
        <div className="rounded-xl overflow-hidden border border-slate-200/80 bg-slate-900">
          <ImageEditable
            contentKey="about.assembly.image"
            defaultImage="/images/slide_students_flag_assembly.webp"
            alt="Rassemblement civique des élèves du Collège Isaac Newton"
            label="Photo Rassemblement Civique"
            currentUser={currentUser}
            containerClassName="relative aspect-[24/7] sm:aspect-[28/7] w-full overflow-hidden bg-slate-900"
          />
          <div className="px-3.5 py-2 bg-slate-900 text-white text-[11px] flex items-center justify-between border-t border-slate-800">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="font-medium text-slate-200">Rassemblement civique hebdomadaire : respect des symboles républicains et discipline collective.</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Direction & Corps Professoral (Carte moderne et compacte) */}
      <section id="direction-equipe" className="scroll-mt-16 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-lg sm:text-xl font-bold text-slate-900">Direction & Gouvernance</h2>
            <p className="text-xs text-slate-600">Sous la conduite d'Orphe Jean Marie et d'éducateurs chevronnés.</p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('faculty')}
            className="text-xs font-bold text-blue-900 hover:text-blue-700 flex items-center gap-1 cursor-pointer whitespace-nowrap"
          >
            <span>Organigramme complet</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            
            {/* Portrait Directeur */}
            <div className="md:col-span-4 flex flex-col items-center text-center">
              <div className="relative">
                <ImageEditable
                  contentKey="about.director.image"
                  defaultImage="/images/portrait_coasmin_maxy_1792232767777.jpg"
                  alt="M. Orphe Jean Marie, Directeur Fondateur"
                  label="Portrait Direction"
                  currentUser={currentUser}
                  containerClassName="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden mx-auto shadow-md border-2 border-amber-400/80 bg-slate-800"
                />
              </div>
              <h3 className="font-serif font-bold text-sm text-white mt-2">Orphe Jean Marie</h3>
              <p className="text-[11px] text-amber-300 font-medium">Directeur fondateur</p>
              <p className="text-[10.5px] text-slate-400">Mathématiques & Sciences Physiques</p>
            </div>

            {/* Message & Engagements */}
            <div className="md:col-span-8 space-y-3 text-xs text-slate-200">
              <p className="font-serif italic text-xs sm:text-[13px] text-slate-100 leading-relaxed border-l-2 border-amber-400/70 pl-3 py-0.5">
                « Notre mission est de forger les bâtisseurs de demain par la rigueur scientifique, la maîtrise des mathématiques, la discipline civique et l'ouverture aux technologies modernes. »
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11.5px]">
                <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <span className="font-bold text-white block">Excellence continue</span>
                    <span className="text-slate-400 text-[10.5px]">Préparation ciblée aux examens officiels</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-bold text-white block">Encadrement personnalisé</span>
                    <span className="text-slate-400 text-[10.5px]">Dialogue permanent avec les familles</span>
                  </div>
                </div>
              </div>

              <div className="pt-1 flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => onNavigate('faculty')}
                  className="px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Voir tout le corps enseignant</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
                <a
                  href={`tel:${SCHOOL_INFO.phone1}`}
                  className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors inline-flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5 text-amber-400" />
                  <span>Secrétariat : {SCHOOL_INFO.phone1}</span>
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 5. Infrastructures du Campus (Grille dense 3 cartes & actions rapides) */}
      <section id="infrastructures-campus" className="scroll-mt-16 space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
          <div>
            <h2 className="font-serif text-lg sm:text-xl font-bold text-slate-900">Infrastructures & Installations</h2>
            <p className="text-xs text-slate-600">Un environnement moderne, sécurisé et aéré propice aux apprentissages.</p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('gallery')}
            className="text-xs font-semibold text-blue-900 hover:text-blue-700 flex items-center gap-1 cursor-pointer self-start sm:self-auto"
          >
            <ImageIcon className="w-3.5 h-3.5 text-amber-500" />
            <span>Galerie photos complète</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          
          {/* Carte 1: Laboratoire Informatique */}
          <div className="rounded-xl bg-white border border-slate-200/90 overflow-hidden shadow-2xs flex flex-col justify-between">
            <div>
              <ImageEditable
                contentKey="about.infra.lab.image"
                defaultImage="/images/slide_computer_lab_students.webp"
                alt="Laboratoire informatique du Collège Isaac Newton"
                label="Photo Lab Informatique"
                currentUser={currentUser}
                containerClassName="relative aspect-[16/10] w-full overflow-hidden bg-slate-900"
              />
              <div className="p-3.5 space-y-1.5">
                <div className="flex items-center gap-1.5 text-blue-900 font-bold">
                  <Cpu className="w-3.5 h-3.5 text-amber-600" />
                  <h3 className="font-serif text-xs sm:text-sm font-bold text-slate-900">Laboratoire Informatique</h3>
                </div>
                <p className="text-slate-600 text-[11.5px] leading-relaxed">
                  25+ postes récents équipés sous onduleurs et serveurs dédiés. Pratique hebdomadaire de la programmation, bureautique et recherche assistée.
                </p>
              </div>
            </div>
            <div className="px-3.5 pb-3 pt-1 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Postes 1:1 individuels</span>
              <span className="font-medium text-blue-900">Fibre & Onduleurs</span>
            </div>
          </div>

          {/* Carte 2: Cour d'Honneur & Terrains */}
          <div className="rounded-xl bg-white border border-slate-200/90 overflow-hidden shadow-2xs flex flex-col justify-between">
            <div>
              <ImageEditable
                contentKey="about.infra.courtyard.image"
                defaultImage="/images/slide_campus_courtyard_facade.webp"
                alt="Cour d’Honneur et Galeries Sécurisées"
                label="Photo Cour d'Honneur"
                currentUser={currentUser}
                containerClassName="relative aspect-[16/10] w-full overflow-hidden bg-slate-900"
              />
              <div className="p-3.5 space-y-1.5">
                <div className="flex items-center gap-1.5 text-blue-900 font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <h3 className="font-serif text-xs sm:text-sm font-bold text-slate-900">Cour d’Honneur & Sport</h3>
                </div>
                <p className="text-slate-600 text-[11.5px] leading-relaxed">
                  Espace extérieur clos et surveillé pour les cérémonies républicaines, les récréations sereines et la pratique des disciplines sportives scolaires.
                </p>
              </div>
            </div>
            <div className="px-3.5 pb-3 pt-1 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Campus clos Delmas 50</span>
              <span className="font-medium text-emerald-700">Surveillance continue</span>
            </div>
          </div>

          {/* Carte 3: Bâtiments & Salles de classe */}
          <div className="rounded-xl bg-white border border-slate-200/90 overflow-hidden shadow-2xs flex flex-col justify-between sm:col-span-2 lg:col-span-1">
            <div>
              <ImageEditable
                contentKey="about.infra.building.image"
                defaultImage="/images/campus_courtyard_building_1790531780046.jpg"
                alt="Salles de cours aérées et lumineuses"
                label="Photo Salles de cours"
                currentUser={currentUser}
                containerClassName="relative aspect-[16/10] w-full overflow-hidden bg-slate-900"
              />
              <div className="p-3.5 space-y-1.5">
                <div className="flex items-center gap-1.5 text-blue-900 font-bold">
                  <Building className="w-3.5 h-3.5 text-blue-600" />
                  <h3 className="font-serif text-xs sm:text-sm font-bold text-slate-900">Salles Pédagogiques Aérées</h3>
                </div>
                <p className="text-slate-600 text-[11.5px] leading-relaxed">
                  Salles lumineuses, ventilation naturelle optimisée et mobilier ergonomique conçu pour favoriser une concentration continue tout au long de la journée.
                </p>
              </div>
            </div>
            <div className="px-3.5 pb-3 pt-1 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Du Préscolaire au NS4</span>
              <span className="font-medium text-blue-900">Normes MENFP</span>
            </div>
          </div>

        </div>
      </section>

      {/* 6. Formulaire Moderne & Compact : Visite du Campus & Échange Direction */}
      <section id="visite-contact" className="scroll-mt-16 bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-1.5 text-blue-900 text-xs font-bold uppercase tracking-wider">
              <Calendar className="w-3.5 h-3.5 text-amber-500" />
              <span>Visite du Campus & Renseignements</span>
            </div>
            <h2 className="font-serif text-lg sm:text-xl font-bold text-slate-900 mt-0.5">
              Planifier une visite ou échanger avec l'administration
            </h2>
            <p className="text-xs text-slate-600">
              Nos portes sont ouvertes aux familles du lundi au vendredi de 7h30 à 15h30. Réponse sous 24h.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-600">
            <a
              href={`tel:${SCHOOL_INFO.phone1}`}
              className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-blue-950 font-semibold border border-slate-200 transition-colors flex items-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5 text-blue-700" />
              <span>{SCHOOL_INFO.phone1}</span>
            </a>
          </div>
        </div>

        {formSubmitted ? (
          <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
              <Check className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-base text-emerald-950">Demande transmise avec succès</h3>
            <p className="text-xs text-emerald-800 max-w-md mx-auto">
              Merci, notre équipe administrative a bien reçu votre demande et vous contactera au numéro indiqué sous 24 heures ouvrées.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setFormSubmitted(false);
                  setFormData({ fullName: '', phone: '', email: '', interest: 'visite', level: 'secondaire', message: '' });
                }}
                className="text-xs font-bold text-emerald-900 underline cursor-pointer"
              >
                Envoyer une autre demande
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleFormSubmit} className="space-y-3.5 text-xs">
            {formError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-2 text-xs">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* Nom Complet */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block text-[11.5px]">
                  Nom et prénom <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="ex: Marie Jean-Baptiste"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-blue-900 focus:ring-1 focus:ring-blue-900/20 text-xs text-slate-900 bg-white transition-all outline-none"
                />
              </div>

              {/* Téléphone */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block text-[11.5px]">
                  Téléphone de contact <span className="text-rose-600">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="ex: +509 3700-0000"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-blue-900 focus:ring-1 focus:ring-blue-900/20 text-xs text-slate-900 bg-white transition-all outline-none font-mono"
                />
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block text-[11.5px]">
                  Adresse e-mail <span className="text-rose-600">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="votre.email@exemple.com"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-blue-900 focus:ring-1 focus:ring-blue-900/20 text-xs text-slate-900 bg-white transition-all outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Objet / Intérêt */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block text-[11.5px]">
                  Objet de la démarche
                </label>
                <select
                  value={formData.interest}
                  onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-blue-900 focus:ring-1 focus:ring-blue-900/20 text-xs text-slate-900 bg-white transition-all outline-none cursor-pointer"
                >
                  <option value="visite">Visite guidée des infrastructures & campus</option>
                  <option value="inscription">Informations sur les inscriptions {SCHOOL_INFO.currentYear}</option>
                  <option value="direction">Rendez-vous avec la Direction pédagogique</option>
                  <option value="renseignement">Renseignement général / Tarifs</option>
                </select>
              </div>

              {/* Niveau visé */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block text-[11.5px]">
                  Niveau d'étude de l'élève
                </label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-blue-900 focus:ring-1 focus:ring-blue-900/20 text-xs text-slate-900 bg-white transition-all outline-none cursor-pointer"
                >
                  <option value="prescolaire">Cycle Préscolaire (TPS - GS)</option>
                  <option value="fondamental">Cycle Fondamental (1ère - 9ème AF)</option>
                  <option value="secondaire">Nouveau Secondaire (NS1 - NS4)</option>
                </select>
              </div>
            </div>

            {/* Message facultatif */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block text-[11.5px]">
                Précisions ou disponibilités souhaitées (facultatif)
              </label>
              <textarea
                rows={2}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Indiquez vos jours préférés pour la visite ou vos questions particulières..."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-blue-900 focus:ring-1 focus:ring-blue-900/20 text-xs text-slate-900 bg-white transition-all outline-none resize-none"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
              <span className="text-[11px] text-slate-500">
                Localisation : Delmas 50, rue Dominique #2 bis, Port-au-Prince.
              </span>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => onNavigate('pre-registration')}
                  className="w-full sm:w-auto px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Dossier d'inscription complet
                </button>

                <button
                  type="submit"
                  disabled={formLoading}
                  className="w-full sm:w-auto px-5 py-2 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60 shadow-xs"
                >
                  {formLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Envoi en cours...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Confirmer ma demande de visite</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}

      </section>

    </div>
  );
};
