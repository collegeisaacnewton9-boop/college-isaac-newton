import React, { useState } from 'react';
import { 
  HeartHandshake, 
  GraduationCap, 
  BookOpen, 
  Cpu, 
  Building, 
  Shirt, 
  Sparkles, 
  ShieldCheck, 
  HelpCircle, 
  Phone, 
  Mail, 
  MapPin, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ChevronDown, 
  ChevronUp, 
  Users, 
  Globe, 
  Award,
  Lock
} from 'lucide-react';
import { SCHOOL_IMAGES } from '../assets/images';
import { SCHOOL_INFO } from '../data/mockData';
import { apiService } from '../services/api';
import { toast } from 'sonner';

interface SupportPageProps {
  onNavigate: (page: string, subSection?: string) => void;
}

export const SupportPage: React.FC<SupportPageProps> = ({ onNavigate }) => {
  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    organization: '',
    email: '',
    phone: '',
    supportType: 'bourse',
    message: '',
    consent: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // FAQ open/close state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast.error('Champs obligatoires manquants', {
        description: 'Veuillez renseigner votre nom, votre e-mail et votre message.',
      });
      return;
    }

    if (!formData.consent) {
      toast.error('Consentement requis', {
        description: 'Veuillez accepter d’être recontacté(e) par l’administration du Collège.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const typeLabels: Record<string, string> = {
        bourse: 'Parrainage / Bourse de scolarité',
        fournitures: 'Livres et fournitures scolaires',
        equipement: 'Laboratoire informatique et équipement',
        nature: 'Don en nature (matériel, mobilier, ouvrages)',
        partenariat: 'Partenariat institutionnel ou d’entreprise',
        autre: 'Autre forme d’appui',
      };

      const formattedSubject = `[Soutien / Partenariat] ${typeLabels[formData.supportType] || 'Prise de contact'} - ${formData.organization ? `${formData.organization} (${formData.fullName})` : formData.fullName}`;

      const formattedMessage = [
        `=== DEMANDE D'INFORMATION & SOUTIEN SCOLAIRE ===`,
        `Demandeur : ${formData.fullName}`,
        formData.organization ? `Organisation / Entreprise : ${formData.organization}` : null,
        `E-mail : ${formData.email}`,
        formData.phone ? `Téléphone : ${formData.phone}` : null,
        `Type de soutien envisagé : ${typeLabels[formData.supportType] || formData.supportType}`,
        ``,
        `--- Message du contributeur ---`,
        formData.message,
        ``,
        `Consentement de contact accordé : Oui`,
        `Origine : Formulaire officiel « Soutenir le Collège » (collegeisaacnewton.com)`,
      ].filter(Boolean).join('\n');

      await apiService.sendContactMessage({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        subject: formattedSubject,
        message: formattedMessage,
      });

      setSubmitSuccess(true);
      toast.success('Demande transmise avec succès !', {
        description: 'La direction examinera votre message avec attention et vous recontactera directement.',
      });

      // Reset form fields
      setFormData({
        fullName: '',
        organization: '',
        email: '',
        phone: '',
        supportType: 'bourse',
        message: '',
        consent: false,
      });
    } catch {
      toast.error('Erreur lors de la transmission', {
        description: 'Veuillez vérifier votre connexion ou nous contacter directement au +509 3721-1818.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToForm = () => {
    const el = document.getElementById('formulaire-soutien');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // FAQ items with cautionary notices
  const faqs = [
    {
      q: 'Comment s’organise le versement ou la prise en charge d’un soutien ?',
      a: 'Pour garantir une sécurité et une traçabilité totales, aucun paiement direct en ligne n’est sollicité sur notre site internet. Toute contribution financière ou dotation matérielle s’effectue exclusivement après un premier échange avec la direction et la transmission des coordonnées officielles de l’établissement [modalités de versement à confirmer par la direction].',
    },
    {
      q: 'Puis-je parrainer la scolarité d’un ou plusieurs élèves ?',
      a: 'Oui, le parrainage peut cibler la prise en charge partielle ou intégrale des frais de scolarité d’élèves méritants ou issus de familles vulnérables. Afin de protéger scrupuleusement l’intimité, la dignité et la sécurité des enfants, le parrainage est strictement encadré par l’école. Aucun contact direct ou privé n’est organisé entre donateur et élève [règles et critères d’attribution à confirmer par la direction].',
    },
    {
      q: 'Le Collège accepte-t-il les dons en nature (ordinateurs, manuels, matériel scientifique) ?',
      a: 'Absolument. Les dons d’équipements fonctionnels (ordinateurs portables ou fixes, onduleurs, matériel de laboratoire de sciences, manuels scolaires conformes aux programmes officiels du MENFP) sont très précieux pour enrichir l’environnement éducatif des enfants. L’équipe technique valide au préalable la compatibilité du matériel [critères de conformité à confirmer par la direction].',
    },
    {
      q: 'Un don donne-t-il droit à un reçu fiscal ou une déduction d’impôt ?',
      a: 'L’établissement délivre une attestation institutionnelle officielle de réception de don ou de mécénat. Toutefois, la déductibilité fiscale dépend du statut légal de la structure donatrice et des conventions fiscales en vigueur en Haïti ou dans le pays de résidence du mécène. Ces modalités spécifiques doivent faire l’objet d’un échange préalable [statut fiscal officiel à confirmer par la direction].',
    },
    {
      q: 'Est-il possible de contribuer de façon totalement anonyme ?',
      a: 'Oui. Si vous souhaitez soutenir le Collège en conservant l’anonymat auprès du grand public, votre choix sera scrupuleusement respecté dans l’ensemble de nos publications et rapports [protocole d’anonymat à confirmer par la direction].',
    },
    {
      q: 'Quel type de suivi et de compte rendu l’école transmet-elle aux mécènes ?',
      a: 'Le Collège s’engage à fournir un bilan périodique d’impact pédagogique (affectation concrète des dotations, progrès académiques collectifs, modernisation des ateliers) tout en veillant à la préservation de la vie privée des élèves [forme et périodicité du rapport à confirmer par la direction].',
    },
  ];

  return (
    <div className="space-y-12 sm:space-y-16 py-6 sm:py-10">
      
      {/* 1. HERO BANNER: Chaleureuse, sobre, inspirante */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-slate-950 text-white border border-slate-800 shadow-xl">
          {/* Subtle gradient pattern backdrop */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-950/95 via-slate-900/90 to-slate-950/95 z-0" />
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 p-6 sm:p-10 lg:p-14 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="space-y-2">
                <span className="text-xs uppercase tracking-widest text-amber-400 font-bold block">
                  Engagement Communautaire & Avenir des Jeunes · Delmas 50
                </span>
                <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
                  Soutenir l’éducation, bâtir l’excellence de demain.
                </h1>
              </div>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-light">
                Au <strong>Collège Isaac Newton</strong>, nous croyons que chaque enfant d’Haïti porte en lui un potentiel scientifique, intellectuel et humain inestimable. Particuliers, anciens élèves, membres de la diaspora, entreprises et fondations : votre engagement contribue concrètement à offrir un cadre d'études digne, stimulant et tourné vers l'avenir.
              </p>

              {/* Devise & Cadre de confiance */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Devise de l'établissement : « {SCHOOL_INFO.founderMotto} »</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Toutes les démarches de don, de parrainage et de partenariat sont encadrées avec rigueur par la direction afin de garantir la transparence, le respect des familles et la protection de la vie privée des élèves.
                </p>
              </div>

              {/* Boutons d'Action Principaux */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={scrollToForm}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
                >
                  <HeartHandshake className="w-4 h-4" />
                  <span>Proposer un partenariat</span>
                </button>

                <a
                  href="tel:+50937211818"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs sm:text-sm transition-all cursor-pointer"
                >
                  <Phone className="w-4 h-4 text-amber-400" />
                  <span>Parler à l’administration (+509 3721-1818)</span>
                </a>
              </div>

            </div>

            {/* Right Media Illustration */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 group">
                <img
                  src={SCHOOL_IMAGES.graduationPromo}
                  alt="Élèves et lauréats du Collège Isaac Newton"
                  className="w-full h-72 sm:h-84 object-cover object-center group-hover:scale-102 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 p-3 rounded-xl bg-slate-950/80 backdrop-blur-xs border border-white/10 text-xs text-slate-200">
                  <span className="font-bold text-white block">Investir dans les bâtisseurs de demain</span>
                  <span className="text-[11px] text-slate-400">Campus Delmas 50 · Formation d'excellence</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. FORMES DE SOUTIEN : CATÉGORIES DE PROJETS À VALIDER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        <div className="max-w-3xl space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-900 block">
            Domaines d'intervention prioritaires
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
            Des besoins concrets au service de la réussite scolaire
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Chaque donateur ou partenaire peut orienter son appui vers les priorités éducatives qui lui tiennent à cœur. Les besoins sont présentés ci-dessous à titre indicatif et restent sujets à validation directe avec la direction pédagogique.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          
          {/* Forme 1 : Bourses & Scolarité */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-shadow space-y-3.5 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center font-bold">
                <GraduationCap className="w-5 h-5 text-blue-900" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Bourses & Frais de scolarité
                </h3>
                <span className="text-[11px] text-amber-700 font-medium block mt-0.5">
                  [Critères d’attribution à valider par la direction]
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Prise en charge partielle ou complète des frais de scolarité annuels pour permettre à des élèves méritants ou confrontés à des difficultés économiques temporaires de poursuivre leurs études sans interruption.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-900 shrink-0" />
              <span>Attribution par comité pédagogique interne</span>
            </div>
          </div>

          {/* Forme 2 : Livres & Fournitures */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-shadow space-y-3.5 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center font-bold">
                <BookOpen className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Livres & Fournitures scolaires
                </h3>
                <span className="text-[11px] text-amber-700 font-medium block mt-0.5">
                  [Listes officielles MENFP à confirmer]
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Financement ou don de manuels scolaires officiels, cahiers de cours, dictionnaires, calculatrices scientifiques et fournitures de géométrie indispensables aux apprentissages quotidiens.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Remise directe aux élèves sous contrôle du secrétariat</span>
            </div>
          </div>

          {/* Forme 3 : Uniformes, Repas & Transport */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-shadow space-y-3.5 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
                <Shirt className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Uniformes, Repas ou Transport
                </h3>
                <span className="text-[11px] text-amber-700 font-medium block mt-0.5">
                  [Dispositif d'aide sociale à confirmer]
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Accompagnement des besoins de base favorisant la dignité et l'assiduité scolaire : confection des tenues réglementaires bleu et blanc, collations saines ou appui aux frais de déplacement.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-900 shrink-0" />
              <span>Préservation absolue de la discrétion des familles</span>
            </div>
          </div>

          {/* Forme 4 : Laboratoire informatique & Technologies */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-shadow space-y-3.5 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-800 flex items-center justify-center font-bold">
                <Cpu className="w-5 h-5 text-indigo-700" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Laboratoire informatique & Outils numériques
                </h3>
                <span className="text-[11px] text-amber-700 font-medium block mt-0.5">
                  [Spécifications techniques à valider]
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Soutien à la modernisation continue de la salle informatique de Delmas 50 : ordinateurs, onduleurs et batteries d'appoint, logiciels éducatifs, matériel de projection et initiation au code.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Bénéficie à l'ensemble des promotions de l'école</span>
            </div>
          </div>

          {/* Forme 5 : Bibliothèque & Sciences */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-shadow space-y-3.5 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-800 flex items-center justify-center font-bold">
                <Award className="w-5 h-5 text-rose-700" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Bibliothèque, Sciences & Clubs
                </h3>
                <span className="text-[11px] text-amber-700 font-medium block mt-0.5">
                  [Programme d'activités à confirmer]
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Acquisition d'ouvrages scientifiques et littéraires francophones, kits d'expérimentation en physique-chimie, et soutien aux clubs scolaires (échecs, génie, éloquence et débats).
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Développement de l'esprit critique et de la curiosité</span>
            </div>
          </div>

          {/* Forme 6 : Fonctionnement général */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-shadow space-y-3.5 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center font-bold">
                <Building className="w-5 h-5 text-slate-800" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Infrastructures & Fonctionnement
                </h3>
                <span className="text-[11px] text-amber-700 font-medium block mt-0.5">
                  [Besoins logistiques à confirmer par la direction]
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Appui général à la maintenance des salles de classe, à la sécurisation des accès, aux sanitaires et à l'autonomie énergétique pour assurer la continuité des cours dans un climat serein.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-900 shrink-0" />
              <span>Garantit la stabilité opérationnelle de l'établissement</span>
            </div>
          </div>

        </div>
      </section>

      {/* 3. PROCESSUS DE PARRAINAGE : TRANSPARENCE & PROTECTION DES ÉLÈVES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-50 rounded-3xl border border-slate-200/90 p-6 sm:p-10 lg:p-12 space-y-8">
          
          <div className="max-w-3xl space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-900 block">
              Gouvernance Pédagogique
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
              Comment fonctionne le parrainage ?
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Un processus transparent, méthodique et sécurisé, conçu pour s'assurer que chaque soutien atteigne directement sa vocation éducative, sous la responsabilité institutionnelle du Collège.
            </p>
          </div>

          {/* 4 Étapes progressives */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
              <div className="w-8 h-8 rounded-lg bg-blue-900 text-white flex items-center justify-center font-bold text-xs">
                1
              </div>
              <h3 className="font-bold text-sm text-slate-900">
                Prise de contact initiale
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Manifestez votre intérêt par notre formulaire officiel, par e-mail ou par téléphone auprès de notre secrétariat à Delmas 50.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
              <div className="w-8 h-8 rounded-lg bg-blue-900 text-white flex items-center justify-center font-bold text-xs">
                2
              </div>
              <h3 className="font-bold text-sm text-slate-900">
                Échange avec la direction
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Entretien avec l'administration pour étudier ensemble les priorités actuelles de l'école et définir le cadre du soutien.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
              <div className="w-8 h-8 rounded-lg bg-blue-900 text-white flex items-center justify-center font-bold text-xs">
                3
              </div>
              <h3 className="font-bold text-sm text-slate-900">
                Choix du projet de soutien
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Validation d'un projet ciblé (bourse de scolarité, dotation technologique, équipement) avec accord formel mutuel.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
              <div className="w-8 h-8 rounded-lg bg-blue-900 text-white flex items-center justify-center font-bold text-xs">
                4
              </div>
              <h3 className="font-bold text-sm text-slate-900">
                Suivi périodique & Bilan
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                L'établissement transmet périodiquement un compte rendu pédagogique consolidé sur l'utilisation et l'impact du soutien.
              </p>
            </div>

          </div>

          {/* RÈGLE D'OR : PROTECTION DE LA VIE PRIVÉE DES ÉLÈVES */}
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-start gap-3.5 text-xs text-amber-950">
            <Lock className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-slate-900 block text-sm">
                Protection de la vie privée et cadre éthique des élèves
              </span>
              <p className="text-slate-700 leading-relaxed">
                Le parrainage s'effectue exclusivement par le canal institutionnel du Collège Isaac Newton. Afin de préserver la dignité, l'égalité de traitement et la sécurité absolue des mineurs, <strong>aucun contact direct privé, échange de coordonnées personnelles ou dossier individuel d'élève n'est communiqué aux tiers</strong>. Les bilans sont transmis de manière anonymisée ou consolidée sous la responsabilité du corps enseignant.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* 4. DEVENIR PARTENAIRE : PROSPECTS & SECTIONS EMPLACEMENTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="max-w-3xl space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-900 block">
            Synergies & Réseaux
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
            Devenir partenaire du Collège Isaac Newton
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Nous bâtissons des ponts durables avec les acteurs engagés pour la formation scientifique et civique de la jeunesse. Les profils ci-dessous constituent nos interlocuteurs privilégiés pour construire des partenariats à fort impact.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2.5">
            <Building className="w-6 h-6 text-blue-900" />
            <h3 className="font-bold text-sm text-slate-900">
              Entreprises & Secteur Privé
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Mécénat de compétences, équipement des ateliers numériques, soutien aux filières scientifiques et opportunités d'observation pour nos lycéens.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2.5">
            <Users className="w-6 h-6 text-amber-700" />
            <h3 className="font-bold text-sm text-slate-900">
              Anciens Élèves (Alumni)
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Partage d'expériences, mentorat pour les élèves du secondaire, constitution d'un fonds de solidarité entre promotions.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2.5">
            <Award className="w-6 h-6 text-emerald-700" />
            <h3 className="font-bold text-sm text-slate-900">
              Fondations & ONG Éducatives
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Co-financement de projets pédagogiques durables, appui à l'inclusion scolaire et développement de la bibliothèque du campus.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2.5">
            <Globe className="w-6 h-6 text-indigo-700" />
            <h3 className="font-bold text-sm text-slate-900">
              Membres de la Diaspora
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Lien fraternel avec Haïti : parrainage de bourses d'études et appui ciblé aux investissements technologiques du collège.
            </p>
          </div>

        </div>

        {/* SECTION « NOS PARTENAIRES » - EMPLACEMENTS D'ATTENTE CONFORMES */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Nos Partenaires & Organisations Associées
              </h3>
              <p className="text-xs text-slate-400">
                La liste des partenariats officiels est en cours de formalisation par la direction de l'établissement.
              </p>
            </div>
            <span className="text-[11px] font-mono text-amber-400 px-3 py-1 rounded-lg bg-amber-400/10 border border-amber-400/20 self-start sm:self-auto">
              [LISTE EN COURS DE VALIDATION]
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Par souci de rigueur légale et éthique, aucun nom ni logo d’entreprise, d’association ou de fondation n’est affiché sans convention formelle préalable et autorisation écrite expresse de la direction du Collège Isaac Newton.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl border border-dashed border-slate-700 bg-slate-800/40 text-center space-y-1.5">
              <span className="text-xs font-mono text-slate-300 block font-semibold">
                [NOM DU PARTENAIRE — À CONFIRMER]
              </span>
              <span className="text-[10px] text-slate-500 block">
                Partenaire Institutionnel / Entreprise
              </span>
            </div>

            <div className="p-4 rounded-xl border border-dashed border-slate-700 bg-slate-800/40 text-center space-y-1.5">
              <span className="text-xs font-mono text-slate-300 block font-semibold">
                [NOM DU PARTENAIRE — À CONFIRMER]
              </span>
              <span className="text-[10px] text-slate-500 block">
                Fondation & Mécénat Éducatif
              </span>
            </div>

            <div className="p-4 rounded-xl border border-dashed border-slate-700 bg-slate-800/40 text-center space-y-1.5">
              <span className="text-xs font-mono text-slate-300 block font-semibold">
                [NOM DU PARTENAIRE — À CONFIRMER]
              </span>
              <span className="text-[10px] text-slate-500 block">
                Organisation Communautaire / Diaspora
              </span>
            </div>
          </div>
        </div>

      </section>

      {/* 5. TRANSPARENCE ET CONFIANCE : GOUVERNANCE ADMINISTRATIVE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 space-y-6">
          
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center font-bold shrink-0">
              <ShieldCheck className="w-5 h-5 text-blue-900" />
            </div>
            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-slate-900">
                Transparence & Gestion Responsable des Fonds
              </h2>
              <p className="text-xs text-slate-500">
                Principes déontologiques garantis par la Direction Générale
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-600 leading-relaxed">
            
            <div className="space-y-2 p-4 rounded-xl bg-slate-50 border border-slate-200/70">
              <h3 className="font-bold text-slate-900 text-sm">
                1. Affectation Rigoureuse
              </h3>
              <p>
                Chaque soutien versé est affecté à l'objet convenu (bourse, matériel, livres). L'école veille à ce qu'aucune contribution ne soit détournée de sa finalité éducative [critères de gestion à confirmer par la direction].
              </p>
            </div>

            <div className="space-y-2 p-4 rounded-xl bg-slate-50 border border-slate-200/70">
              <h3 className="font-bold text-slate-900 text-sm">
                2. Attestations & Justificatifs
              </h3>
              <p>
                Un reçu d’établissement officiel est émis pour toute contribution reçue. Les conditions précises d'attestation fiscale dépendent des réglementations applicables [modalités juridiques à confirmer par la direction].
              </p>
            </div>

            <div className="space-y-2 p-4 rounded-xl bg-slate-50 border border-slate-200/70">
              <h3 className="font-bold text-slate-900 text-sm">
                3. Informations Sécurisées
              </h3>
              <p>
                Les coordonnées bancaires de l’établissement et les protocoles de virement sont transmis exclusivement par courrier ou messagerie officielle vérifiée, pour éviter tout risque de fraude ou d'intermédiation douteuse.
              </p>
            </div>

          </div>

          <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 text-xs">
            <span className="font-semibold text-slate-800">Note administrative : </span>
            Le Collège Isaac Newton n’habilite aucun individu non identifié à solliciter des fonds en son nom. Seules les personnes mandatées par la Direction Générale (M. Orphe Jean Marie, Directeur fondateur) sont habilitées à émettre des conventions de partenariat.
          </div>

        </div>
      </section>

      {/* 6. FAQ SUR LES DONS ET LE PARRAINAGE */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-900 block">
            Foire Aux Questions
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
            Questions fréquentes sur le soutien au Collège
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Des réponses claires et prudentes pour vous guider dans votre démarche citoyenne.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((item, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div 
                key={index}
                className="rounded-2xl border border-slate-200 bg-white overflow-hidden transition-all shadow-2xs"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <HelpCircle className="w-4 h-4 text-blue-900 shrink-0" />
                    <span className="font-bold text-sm text-slate-900">
                      {item.q}
                    </span>
                  </div>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/40">
                    <p>{item.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </section>

      {/* 7. FORMULAIRE DE DEMANDE D'INFORMATION & COORDONNÉES OFFICIELLES */}
      <section id="formulaire-soutien" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Formulaire Fonctionnel */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            
            <div className="space-y-2 border-b border-slate-100 pb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-900 block">
                Formulaire officiel de prise de contact
              </span>
              <h3 className="font-serif text-2xl font-bold text-slate-900">
                Manifester votre intérêt ou proposer un appui
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Ce formulaire s'adresse aux particuliers, alumni, entreprises et institutions souhaitant échanger avec la direction. Aucune donnée confidentielle d'élève n'est collectée.
              </p>
            </div>

            {submitSuccess ? (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-4 animate-in fade-in">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">
                      Votre message a été transmis avec succès !
                    </h4>
                    <p className="text-xs text-slate-600">
                      Un membre de l'équipe administrative examinera votre proposition et vous contactera rapidement.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-emerald-200 text-xs text-slate-700 space-y-1">
                  <span className="font-bold text-slate-900 block">Prochaines étapes :</span>
                  <p>1. Examen de votre demande par le secrétariat de l'école.</p>
                  <p>2. Prise de contact par e-mail ou par téléphone pour échanger sur le projet.</p>
                  <p>3. Envoi des modalités pratiques et coordonnées officielles si l'accord est mutuel.</p>
                </div>

                <button
                  type="button"
                  onClick={() => setSubmitSuccess(false)}
                  className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  Envoyer un autre message
                </button>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
                
                {/* Nom et Prénom */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-800 block">
                    Votre nom complet <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="ex: Jean-Marc Voltaire"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 font-medium focus:border-blue-900 focus:outline-none transition-colors"
                  />
                </div>

                {/* Organisation / Entreprise */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-800 block">
                    Organisation, Entreprise ou Association <span className="text-slate-400 font-normal">(facultatif)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    placeholder="ex: Fondation Éducative / Entreprise S.A. / Association d'Alumni"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 font-medium focus:border-blue-900 focus:outline-none transition-colors"
                  />
                </div>

                {/* Grille Email & Téléphone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  <div className="space-y-1">
                    <label className="font-bold text-slate-800 block">
                      Adresse e-mail <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="votre.email@domaine.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 font-medium focus:border-blue-900 focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-800 block">
                      Numéro de téléphone <span className="text-slate-400 font-normal">(recommandé)</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+509 .... ou indicatif pays"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 font-medium focus:border-blue-900 focus:outline-none transition-colors"
                    />
                  </div>

                </div>

                {/* Domaine d'intérêt / Type de soutien */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-800 block">
                    Type de soutien ou d’échange envisagé <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={formData.supportType}
                    onChange={(e) => setFormData({ ...formData, supportType: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 font-semibold focus:border-blue-900 focus:outline-none transition-colors"
                  >
                    <option value="bourse">Parrainage / Bourse de scolarité pour un élève</option>
                    <option value="fournitures">Dotation en livres et fournitures scolaires</option>
                    <option value="equipement">Équipement du laboratoire informatique & sciences</option>
                    <option value="nature">Don en nature (matériel, mobilier, instruments)</option>
                    <option value="partenariat">Partenariat institutionnel ou mécénat d’entreprise</option>
                    <option value="autre">Autre forme de contribution citoyenne</option>
                  </select>
                </div>

                {/* Message */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-800 block">
                    Votre message ou proposition <span className="text-rose-600">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Décrivez brièvement votre projet, vos questions ou votre disponibilité pour échanger..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 font-medium focus:border-blue-900 focus:outline-none transition-colors resize-y"
                  />
                </div>

                {/* Consentement */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="consent-support"
                    required
                    checked={formData.consent}
                    onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
                    className="w-4 h-4 text-blue-900 rounded-sm mt-0.5 cursor-pointer"
                  />
                  <label htmlFor="consent-support" className="text-[11px] text-slate-600 leading-snug cursor-pointer">
                    J’autorise l’administration du Collège Isaac Newton à me contacter par e-mail ou téléphone pour donner suite à cette démarche. Mes données restent confidentielles et ne seront jamais cédées à des tiers.
                  </label>
                </div>

                {/* Bouton de soumission */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-5 rounded-xl bg-blue-900 hover:bg-blue-950 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <span>Transmission en cours...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4 text-amber-400" />
                      <span>Transmettre ma demande à la direction</span>
                    </>
                  )}
                </button>

              </form>
            )}

          </div>

          {/* Right Column: Informations de Contact Officielles & Précautions */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 space-y-5 shadow-lg">
              
              <div className="space-y-1">
                <span className="text-[11px] uppercase tracking-wider text-amber-400 font-bold block">
                  Secrétariat Officiel
                </span>
                <h4 className="font-serif text-xl font-bold text-white">
                  Collège Isaac Newton
                </h4>
                <p className="text-xs text-slate-300">
                  Établissement scolaire privé d'excellence · Port-au-Prince, Haïti
                </p>
              </div>

              <div className="space-y-3.5 text-xs text-slate-200 pt-2 border-t border-slate-800">
                
                {/* Téléphone */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-400/10 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      Téléphone & Ligne directe
                    </span>
                    <a href="tel:+50937211818" className="font-mono text-sm font-bold text-amber-300 hover:underline block">
                      +509 3721-1818
                    </a>
                    <a href="tel:+50933160934" className="font-mono text-xs text-slate-300 hover:underline block">
                      +509 3316-0934
                    </a>
                  </div>
                </div>

                {/* Adresse */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      Campus Principal
                    </span>
                    <span className="text-xs text-white block">
                      Delmas 50, rue Dominique #2 bis
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      Port-au-Prince, Haïti
                    </span>
                  </div>
                </div>

                {/* Email institutionnel */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      Courriel institutionnel
                    </span>
                    <a 
                      href="mailto:contact@collegeisaacnewton.com" 
                      className="text-xs text-white hover:text-amber-300 font-mono underline block"
                    >
                      contact@collegeisaacnewton.com
                    </a>
                    <span className="text-[10px] text-slate-400 block">
                      [Adresse de contact souhaitée — à confirmer avec la direction]
                    </span>
                  </div>
                </div>

                {/* Direction */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      Direction Générale
                    </span>
                    <span className="text-xs font-semibold text-white block">
                      M. Orphe Jean Marie
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      Directeur fondateur · Professeur de Mathématiques & Sciences
                    </span>
                  </div>
                </div>

              </div>

            </div>

            {/* Note de mise en garde contre la fraude */}
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 text-xs text-amber-900 space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-950">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Sécurité des contributions & Prévention</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Le Collège Isaac Newton n’utilise aucun compte intermédiaire non vérifié. Les modalités de virement et réceptions matérielles sont communiquées uniquement par nos canaux officiels après confirmation directe.
              </p>
            </div>

          </div>

        </div>
      </section>

    </div>
  );
};
