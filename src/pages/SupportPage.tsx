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
  Lock,
  Loader2,
  RefreshCw,
  User,
  Building2,
  Check,
  Copy
} from 'lucide-react';
import { SCHOOL_INFO } from '../data/mockData';
import { apiService } from '../services/api';
import { validateEmail, validatePhone, formatPhoneNumber } from '../utils/validation';
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

  const [touched, setTouched] = useState<Record<string, boolean>>({
    fullName: false,
    organization: false,
    email: false,
    phone: false,
    message: false,
    consent: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [copiedRef, setCopiedRef] = useState(false);
  const [submissionMeta, setSubmissionMeta] = useState<{
    refCode: string;
    submittedAt: string;
    supportLabel: string;
    fullName: string;
    email: string;
    phone?: string;
  } | null>(null);

  // Field validation evaluations using official utilities
  const emailValidation = formData.email.trim() ? validateEmail(formData.email) : null;
  const phoneValidation = formData.phone.trim() ? validatePhone(formData.phone) : null;

  const errors = {
    fullName: !formData.fullName.trim()
      ? 'Veuillez renseigner votre nom complet.'
      : formData.fullName.trim().length < 3
      ? 'Le nom doit comporter au moins 3 caractères.'
      : null,
    email: !formData.email.trim()
      ? 'Adresse e-mail requise pour le suivi.'
      : emailValidation && !emailValidation.isValid
      ? emailValidation.error
      : null,
    phone:
      formData.phone.trim() && phoneValidation && !phoneValidation.isValid
        ? phoneValidation.error
        : null,
    message: !formData.message.trim()
      ? 'Veuillez rédiger votre proposition ou vos questions.'
      : formData.message.trim().length < 15
      ? 'Votre message doit contenir au moins 15 caractères pour être exploitable.'
      : null,
    consent: !formData.consent
      ? 'Votre accord de contact est indispensable pour vous répondre.'
      : null,
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setFormData((prev) => ({ ...prev, phone: formatted }));
    setSubmitError(null);
  };

  const applyEmailSuggestion = (suggestion: string) => {
    setFormData((prev) => ({ ...prev, email: suggestion }));
    setTouched((prev) => ({ ...prev, email: true }));
  };

  const handleCopyRef = (refCode: string) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(refCode).then(() => {
        setCopiedRef(true);
        toast.success('Référence copiée dans le presse-papier !');
        setTimeout(() => setCopiedRef(false), 3000);
      }).catch(() => {});
    }
  };

  const handleResetForm = () => {
    setSubmitSuccess(false);
    setSubmitError(null);
    setSubmissionMeta(null);
    setFormData({
      fullName: '',
      organization: '',
      email: '',
      phone: '',
      supportType: 'bourse',
      message: '',
      consent: false,
    });
    setTouched({
      fullName: false,
      organization: false,
      email: false,
      phone: false,
      message: false,
      consent: false,
    });
  };

  // FAQ open/close state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    // Mark all required fields as touched
    setTouched({
      fullName: true,
      organization: true,
      email: true,
      phone: true,
      message: true,
      consent: true,
    });

    // Check for blocking errors
    const activeErrors = [
      errors.fullName,
      errors.email,
      errors.phone,
      errors.message,
      errors.consent,
    ].filter(Boolean);

    if (activeErrors.length > 0) {
      const firstError = activeErrors[0];
      setSubmitError(firstError || 'Veuillez corriger les informations signalées ci-dessous.');
      toast.error('Formulaire incomplet', {
        description: firstError || 'Veuillez vérifier les champs du formulaire.',
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

      const selectedLabel = typeLabels[formData.supportType] || formData.supportType;
      const refCode = `CIN-SPT-2026-${Math.floor(1000 + Math.random() * 9000)}`;

      const formattedSubject = `[Soutien / Partenariat #${refCode}] ${selectedLabel} - ${formData.organization ? `${formData.organization} (${formData.fullName})` : formData.fullName}`;

      const formattedMessage = [
        `=== DEMANDE D'INFORMATION & SOUTIEN SCOLAIRE ===`,
        `Numéro de référence : ${refCode}`,
        `Date : ${new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`,
        `Demandeur : ${formData.fullName.trim()}`,
        formData.organization ? `Organisation / Entreprise : ${formData.organization.trim()}` : null,
        `E-mail : ${formData.email.trim()}`,
        formData.phone ? `Téléphone : ${formData.phone.trim()}` : null,
        `Type de soutien envisagé : ${selectedLabel}`,
        ``,
        `--- Message du contributeur ---`,
        formData.message.trim(),
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

      setSubmissionMeta({
        refCode,
        submittedAt: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        supportLabel: selectedLabel,
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
      });

      setSubmitSuccess(true);
      toast.success('Demande transmise avec succès !', {
        description: `Référence ${refCode} enregistrée. L'administration examinera votre démarche sous 48h.`,
      });
    } catch (err: unknown) {
      const errMsg = (err instanceof Error) ? err.message : 'Une interruption réseau est survenue. Veuillez vérifier votre connexion ou joindre directement le secrétariat.';
      setSubmitError(errMsg);
      toast.error('Erreur lors de la transmission', {
        description: 'Veuillez vérifier vos informations ou utiliser la ligne directe +509 3721-1818.',
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
    <div className="space-y-6 sm:space-y-8 lg:space-y-10 py-4 sm:py-6">
      
      {/* 1. HERO BANNER: Chaleureuse, sobre, inspirante & compacte (Sans image intrusive) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-slate-950 text-white border border-slate-800 shadow-xl">
          {/* Subtle gradient pattern backdrop */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-950/95 via-slate-900/90 to-slate-950/95 z-0" />
          
          <div className="relative z-10 max-w-4xl p-5 sm:p-8 lg:p-10 space-y-4 sm:space-y-5">
            
            <div className="space-y-1.5">
              <span className="text-[11px] uppercase tracking-widest text-amber-400 font-bold font-mono block">
                Engagement Communautaire & Avenir des Jeunes · Delmas 50
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-tight">
                Soutenir l’éducation, bâtir l’excellence de demain.
              </h1>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
              Au <strong>Collège Isaac Newton</strong>, nous croyons que chaque enfant d’Haïti porte en lui un potentiel scientifique, intellectuel et humain inestimable. Particuliers, anciens élèves, membres de la diaspora, entreprises et fondations : votre engagement contribue concrètement à offrir un cadre d'études digne, stimulant et tourné vers l'avenir.
            </p>

            {/* Devise & Cadre de confiance */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Devise de l'établissement : « {SCHOOL_INFO.founderMotto} »</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Toutes les démarches de don, de parrainage et de partenariat sont encadrées avec rigueur par la direction afin de garantir la transparence, le respect des familles et la protection de la vie privée des élèves.
              </p>
            </div>

            {/* Boutons d'Action Principaux */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={scrollToForm}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
              >
                <HeartHandshake className="w-4 h-4" />
                <span>Proposer un partenariat / don</span>
              </button>

              <a
                href="tel:+50937211818"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs sm:text-sm transition-all cursor-pointer"
              >
                <Phone className="w-4 h-4 text-amber-400" />
                <span>Parler à l’administration (+509 3721-1818)</span>
              </a>
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

      </section>

      {/* 4. FAQ SUR LES DONS ET LE PARRAINAGE */}
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

      {/* 8. FORMULAIRE DE DEMANDE D'INFORMATION & COORDONNÉES OFFICIELLES */}
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

            {submitSuccess && submissionMeta ? (
              <div 
                role="status" 
                aria-live="polite"
                className="p-6 sm:p-8 rounded-3xl bg-emerald-50/90 border border-emerald-200/90 space-y-6 animate-in fade-in zoom-in-95 duration-300"
              >
                {/* Header with success icon and badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-200/70 pb-5">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shrink-0">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 block">
                        Transmission Réussie
                      </span>
                      <h4 className="font-serif text-xl sm:text-2xl font-bold text-slate-900">
                        Votre démarche a été enregistrée
                      </h4>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-emerald-200/60 text-emerald-900 border border-emerald-300/60 self-start sm:self-auto">
                    Dossier en traitement
                  </span>
                </div>

                {/* Reference Code Card */}
                <div className="p-4 rounded-2xl bg-white border border-emerald-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-slate-600 font-medium">
                      Numéro de référence administratif :
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyRef(submissionMeta.refCode)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-100 hover:bg-emerald-200 text-emerald-900 transition-colors cursor-pointer"
                      title="Copier le numéro de référence"
                      aria-label="Copier la référence de dossier"
                    >
                      {copiedRef ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Copié</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copier</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="font-mono text-lg sm:text-xl font-bold text-slate-900 tracking-wider">
                    {submissionMeta.refCode}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Conservez ce numéro pour tout échange ultérieur avec le secrétariat administratif.
                  </p>
                </div>

                {/* Summary Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-white/80 border border-emerald-100 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">
                      Demandeur
                    </span>
                    <span className="font-semibold text-slate-900 block">
                      {submissionMeta.fullName}
                    </span>
                    <span className="text-slate-600 block text-[11px]">
                      {submissionMeta.email}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/80 border border-emerald-100 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">
                      Type de soutien envisagé
                    </span>
                    <span className="font-semibold text-slate-900 block">
                      {submissionMeta.supportLabel}
                    </span>
                    <span className="text-slate-500 block text-[11px]">
                      Reçu le {submissionMeta.submittedAt}
                    </span>
                  </div>
                </div>

                {/* Next Steps Roadmap */}
                <div className="p-4 rounded-2xl bg-white border border-emerald-200 space-y-3">
                  <h5 className="font-bold text-xs uppercase tracking-wider text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-700" />
                    <span>Engagements de l'école & Prochaines étapes :</span>
                  </h5>
                  <ol className="text-xs text-slate-600 space-y-2 list-decimal list-inside leading-relaxed">
                    <li>
                      <strong className="text-slate-800">Accusé de réception & Archivage :</strong> Votre message a été notifié en temps réel à la direction.
                    </li>
                    <li>
                      <strong className="text-slate-800">Examen pédagogique & administratif :</strong> L'équipe de M. Orphe Jean Marie étudie votre proposition selon les priorités du campus.
                    </li>
                    <li>
                      <strong className="text-slate-800">Prise de contact officielle :</strong> Un membre autorisé de l'équipe vous recontactera sous 48h ouvrées.
                    </li>
                  </ol>
                </div>

                {/* Reset button */}
                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="w-full sm:w-auto px-5 py-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[48px]"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Transmettre une autre demande</span>
                  </button>
                  <a
                    href="tel:+50937211818"
                    className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs border border-emerald-200 transition-colors flex items-center justify-center gap-2 cursor-pointer min-h-[48px]"
                  >
                    <Phone className="w-4 h-4 text-emerald-700" />
                    <span>Joindre la permanence (+509 3721-1818)</span>
                  </a>
                </div>
              </div>
            ) : (
              <form 
                onSubmit={handleFormSubmit} 
                noValidate 
                className="space-y-3 sm:space-y-3.5 text-xs"
                aria-label="Formulaire de demande de soutien scolaire et partenariat"
              >
                {/* Global Error Banner if submission fails */}
                {submitError && (
                  <div 
                    role="alert" 
                    aria-live="assertive"
                    className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-950 space-y-1.5 animate-in fade-in"
                  >
                    <div className="flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <strong className="font-bold text-xs text-rose-900 block">
                          Attention : vérifiez vos informations
                        </strong>
                        <p className="text-xs text-rose-800 leading-relaxed">
                          {submitError}
                        </p>
                      </div>
                    </div>
                    <div className="pt-0.5 flex items-center gap-2 text-[11px]">
                      <span className="text-slate-600">Besoin d'aide immédiate ?</span>
                      <a href="tel:+50937211818" className="font-bold text-rose-900 underline">
                        Ligne directe : +509 3721-1818
                      </a>
                    </div>
                  </div>
                )}

                {/* Nom et Organisation en Grille 2 Colonnes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Nom et Prénom */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label htmlFor="support-fullName" className="font-bold text-slate-800 block text-[11.5px]">
                        Votre nom complet <span className="text-rose-600" aria-hidden="true">*</span>
                      </label>
                      {touched.fullName && !errors.fullName && (
                        <span className="text-[10.5px] text-emerald-700 font-medium inline-flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3" /> Valide
                        </span>
                      )}
                    </div>
                    <input
                      id="support-fullName"
                      name="fullName"
                      type="text"
                      required
                      autoComplete="name"
                      autoCapitalize="words"
                      disabled={isSubmitting}
                      value={formData.fullName}
                      onChange={(e) => {
                        setFormData({ ...formData, fullName: e.target.value });
                        setSubmitError(null);
                      }}
                      onBlur={() => handleBlur('fullName')}
                      placeholder="ex: Jean-Marc Voltaire"
                      aria-required="true"
                      aria-invalid={touched.fullName && !!errors.fullName}
                      aria-describedby={touched.fullName && errors.fullName ? "fullName-error" : undefined}
                      className={`w-full py-2 px-3 rounded-xl border text-xs sm:text-sm text-slate-900 font-medium transition-all ${
                        touched.fullName && errors.fullName
                          ? 'border-rose-400 bg-rose-50/30 focus:border-rose-600 focus:ring-1 focus:ring-rose-500/20'
                          : touched.fullName && !errors.fullName
                          ? 'border-emerald-300 bg-emerald-50/20 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500/20'
                          : 'border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-900 focus:ring-1 focus:ring-blue-900/20'
                      } focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed`}
                    />
                    {touched.fullName && errors.fullName && (
                      <p id="fullName-error" role="alert" className="text-[10.5px] text-rose-600 font-medium flex items-center gap-1 pt-0.5">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{errors.fullName}</span>
                      </p>
                    )}
                  </div>

                  {/* Organisation / Entreprise */}
                  <div className="space-y-1">
                    <label htmlFor="support-organization" className="font-bold text-slate-800 block text-[11.5px]">
                      Organisation ou Entreprise <span className="text-slate-400 font-normal">(facultatif)</span>
                    </label>
                    <input
                      id="support-organization"
                      name="organization"
                      type="text"
                      autoComplete="organization"
                      disabled={isSubmitting}
                      value={formData.organization}
                      onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                      placeholder="ex: Fondation Éducative / Entreprise S.A."
                      className="w-full py-2 px-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-xs sm:text-sm text-slate-900 font-medium focus:border-blue-900 focus:ring-1 focus:ring-blue-900/20 focus:outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Grille Email & Téléphone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  
                  {/* Email */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label htmlFor="support-email" className="font-bold text-slate-800 block text-[11.5px]">
                        Adresse e-mail <span className="text-rose-600" aria-hidden="true">*</span>
                      </label>
                      {touched.email && !errors.email && (
                        <span className="text-[10.5px] text-emerald-700 font-medium inline-flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3" /> Valide
                        </span>
                      )}
                    </div>
                    <input
                      id="support-email"
                      name="email"
                      type="email"
                      required
                      inputMode="email"
                      autoComplete="email"
                      autoCapitalize="none"
                      spellCheck={false}
                      disabled={isSubmitting}
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        setSubmitError(null);
                      }}
                      onBlur={() => handleBlur('email')}
                      placeholder="votre.email@domaine.com"
                      aria-required="true"
                      aria-invalid={touched.email && !!errors.email}
                      className={`w-full py-2 px-3 rounded-xl border text-xs sm:text-sm text-slate-900 font-medium transition-all ${
                        touched.email && errors.email
                          ? 'border-rose-400 bg-rose-50/30 focus:border-rose-600 focus:ring-1 focus:ring-rose-500/20'
                          : touched.email && !errors.email
                          ? 'border-emerald-300 bg-emerald-50/20 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500/20'
                          : 'border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-900 focus:ring-1 focus:ring-blue-900/20'
                      } focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed`}
                    />
                    {touched.email && errors.email && (
                      <p id="email-error" role="alert" className="text-[10.5px] text-rose-600 font-medium flex items-center gap-1 pt-0.5">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{errors.email}</span>
                      </p>
                    )}
                    {emailValidation?.suggestion && (
                      <div id="email-suggestion" className="p-1.5 rounded-lg bg-amber-50 border border-amber-200 text-[10.5px] text-amber-900 flex items-center justify-between gap-1.5 animate-in fade-in">
                        <span>Suggestion : <strong>{emailValidation.suggestion}</strong></span>
                        <button
                          type="button"
                          onClick={() => applyEmailSuggestion(emailValidation.suggestion!)}
                          className="px-1.5 py-0.5 rounded bg-amber-200 hover:bg-amber-300 font-bold text-amber-950 transition-colors cursor-pointer shrink-0 text-[10px]"
                        >
                          Corriger
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Téléphone */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label htmlFor="support-phone" className="font-bold text-slate-800 block text-[11.5px]">
                        Numéro de téléphone <span className="text-slate-400 font-normal">(recommandé)</span>
                      </label>
                      {phoneValidation?.carrier && (
                        <span className="text-[9.5px] font-semibold text-blue-900 px-1.5 py-0.2 rounded-full bg-blue-50 border border-blue-200">
                          {phoneValidation.carrier}
                        </span>
                      )}
                    </div>
                    <input
                      id="support-phone"
                      name="phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      disabled={isSubmitting}
                      value={formData.phone}
                      onChange={handlePhoneChange}
                      onBlur={() => handleBlur('phone')}
                      placeholder="+509 .... ou 8 chiffres"
                      aria-invalid={touched.phone && !!errors.phone}
                      className={`w-full py-2 px-3 rounded-xl border text-xs sm:text-sm text-slate-900 font-medium transition-all ${
                        touched.phone && errors.phone
                          ? 'border-rose-400 bg-rose-50/30 focus:border-rose-600 focus:ring-1 focus:ring-rose-500/20'
                          : touched.phone && formData.phone && !errors.phone
                          ? 'border-emerald-300 bg-emerald-50/20 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500/20'
                          : 'border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-900 focus:ring-1 focus:ring-blue-900/20'
                      } focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed`}
                    />
                    {touched.phone && errors.phone && (
                      <p id="phone-error" role="alert" className="text-[10.5px] text-rose-600 font-medium flex items-center gap-1 pt-0.5">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{errors.phone}</span>
                      </p>
                    )}
                  </div>

                </div>

                {/* Type de soutien */}
                <div className="space-y-1">
                  <label htmlFor="support-type" className="font-bold text-slate-800 block text-[11.5px]">
                    Type de soutien ou d’échange envisagé <span className="text-rose-600" aria-hidden="true">*</span>
                  </label>
                  <select
                    id="support-type"
                    name="supportType"
                    disabled={isSubmitting}
                    value={formData.supportType}
                    onChange={(e) => {
                      setFormData({ ...formData, supportType: e.target.value });
                      setSubmitError(null);
                    }}
                    className="w-full py-2 px-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-xs sm:text-sm text-slate-900 font-semibold focus:border-blue-900 focus:ring-1 focus:ring-blue-900/20 focus:outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
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
                  <div className="flex items-center justify-between">
                    <label htmlFor="support-message" className="font-bold text-slate-800 block text-[11.5px]">
                      Votre message ou proposition <span className="text-rose-600" aria-hidden="true">*</span>
                    </label>
                    <span className={`text-[10.5px] font-mono ${
                      formData.message.trim().length >= 15 ? 'text-emerald-700' : 'text-slate-400'
                    }`}>
                      {formData.message.trim().length} / min. 15 caract.
                    </span>
                  </div>
                  <textarea
                    id="support-message"
                    name="message"
                    required
                    rows={3}
                    disabled={isSubmitting}
                    value={formData.message}
                    onChange={(e) => {
                      setFormData({ ...formData, message: e.target.value });
                      setSubmitError(null);
                    }}
                    onBlur={() => handleBlur('message')}
                    placeholder="Décrivez brièvement votre projet, vos questions ou votre disponibilité pour échanger avec la direction..."
                    aria-required="true"
                    aria-invalid={touched.message && !!errors.message}
                    className={`w-full min-h-[75px] py-2 px-3 rounded-xl border text-xs sm:text-sm text-slate-900 font-medium transition-all resize-y ${
                      touched.message && errors.message
                        ? 'border-rose-400 bg-rose-50/30 focus:border-rose-600 focus:ring-1 focus:ring-rose-500/20'
                        : touched.message && !errors.message
                        ? 'border-emerald-300 bg-emerald-50/20 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500/20'
                        : 'border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-900 focus:ring-1 focus:ring-blue-900/20'
                    } focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed`}
                  />
                  {touched.message && errors.message && (
                    <p id="message-error" role="alert" className="text-[10.5px] text-rose-600 font-medium flex items-center gap-1 pt-0.5">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{errors.message}</span>
                    </p>
                  )}
                </div>

                {/* Consentement Mobile Friendly Touch Target */}
                <div className={`p-3 rounded-xl border transition-all ${
                  touched.consent && errors.consent 
                    ? 'border-rose-300 bg-rose-50/40' 
                    : 'border-slate-200 bg-slate-50/70 hover:bg-slate-50'
                }`}>
                  <label htmlFor="consent-support" className="flex items-start gap-2.5 cursor-pointer min-h-[22px]">
                    <input
                      type="checkbox"
                      id="consent-support"
                      name="consent"
                      required
                      disabled={isSubmitting}
                      checked={formData.consent}
                      onChange={(e) => {
                        setFormData({ ...formData, consent: e.target.checked });
                        setSubmitError(null);
                      }}
                      onBlur={() => handleBlur('consent')}
                      aria-required="true"
                      aria-invalid={touched.consent && !!errors.consent}
                      className="w-4 h-4 text-blue-900 rounded border-slate-300 focus:ring-1 focus:ring-blue-900/20 mt-0.5 cursor-pointer shrink-0 disabled:opacity-50"
                    />
                    <span className="text-[11.5px] text-slate-700 leading-snug select-none">
                      J’autorise expressément l’administration du <strong>Collège Isaac Newton</strong> à me contacter par e-mail ou téléphone pour donner suite à cette proposition. Mes coordonnées restent strictement confidentielles.
                    </span>
                  </label>
                  {touched.consent && errors.consent && (
                    <p role="alert" className="text-[10.5px] text-rose-600 font-medium flex items-center gap-1 pt-1.5 pl-6">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{errors.consent}</span>
                    </p>
                  )}
                </div>

                {/* Bouton de soumission avec état de chargement */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  aria-busy={isSubmitting}
                  className="w-full py-2.5 px-5 rounded-xl bg-blue-900 hover:bg-blue-950 disabled:bg-blue-900/60 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-900"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                      <span>Transmission sécurisée en cours...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5 text-amber-400" />
                      <span>Transmettre ma demande à la direction</span>
                    </>
                  )}
                </button>

                <p className="text-[10.5px] text-center text-slate-500 font-medium">
                  Réponse officielle garantie sous 48 heures ouvrées · Accompagnement direct par le secrétariat
                </p>

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
