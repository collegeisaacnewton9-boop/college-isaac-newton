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
  ChevronDown, 
  ChevronUp, 
  Users, 
  Globe, 
  Award,
  Lock,
  Loader2,
  RefreshCw,
  Check,
  Copy
} from 'lucide-react';
import { SCHOOL_INFO } from '../data/mockData';
import { apiService } from '../services/api';
import { validateEmail, validatePhone, formatPhoneNumber } from '../utils/validation';
import { toast } from 'sonner';
import { ContentEditable } from '../components/common/ContentEditable';
import { User } from '../types';

interface SupportPageProps {
  onNavigate: (page: string, subSection?: string) => void;
  currentUser?: User | null;
}

export const SupportPage: React.FC<SupportPageProps> = ({ onNavigate, currentUser }) => {
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

  // Field validation evaluations
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
      ? 'Votre message doit contenir au moins 15 caractères.'
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

  // FAQ state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    setTouched({
      fullName: true,
      organization: true,
      email: true,
      phone: true,
      message: true,
      consent: true,
    });

    const activeErrors = [
      errors.fullName,
      errors.email,
      errors.phone,
      errors.message,
      errors.consent,
    ].filter(Boolean);

    if (activeErrors.length > 0) {
      const firstError = activeErrors[0];
      setSubmitError(firstError || 'Veuillez corriger les informations signalées.');
      toast.error('Formulaire incomplet', {
        description: firstError || 'Veuillez vérifier les champs obligatoires.',
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
        description: `Référence ${refCode} enregistrée. L'administration vous répondra sous 48h.`,
      });
    } catch (err: unknown) {
      const errMsg = (err instanceof Error) ? err.message : 'Une interruption réseau est survenue. Veuillez joindre directement le secrétariat.';
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

  // FAQ synthétique
  const faqs = [
    {
      q: 'Comment s’organise le versement ou la remise d’un soutien ?',
      a: 'Pour une traçabilité totale, aucun paiement direct en ligne n’est sollicité sur le site. Tout soutien financier ou matériel s’effectue exclusivement après validation directe avec la direction générale et émission des coordonnées institutionnelles officielles.',
    },
    {
      q: 'Puis-je parrainer la scolarité d’un ou plusieurs élèves ?',
      a: 'Oui. Le parrainage couvre partiellement ou totalement les frais d’écolage d’élèves méritants. Afin de protéger scrupuleusement l’intimité et la dignité des enfants, aucun contact direct ni transmission de coordonnées privées n’a lieu entre donateurs et élèves.',
    },
    {
      q: 'Le Collège accepte-t-il les dons en nature (ordinateurs, manuels, sciences) ?',
      a: 'Absolument. Les équipements informatiques (PC, onduleurs, projecteurs), instruments de laboratoire et manuels scolaires conformes aux programmes officiels haïtiens sont accueillis avec reconnaissance après vérification technique.',
    },
    {
      q: 'Un don donne-t-il droit à un reçu officiel ou une attestation ?',
      a: 'L’établissement délivre une attestation institutionnelle officielle de réception de don ou de mécénat, avec mention des montants ou inventaire des équipements remis sous sceau officiel du Collège.',
    },
    {
      q: 'Est-il possible de contribuer de façon anonyme ?',
      a: 'Oui. Sur simple demande dans votre message ou lors de l’entretien avec la direction, votre identité sera préservée dans l’ensemble de nos publications et rapports.',
    },
    {
      q: 'Quel suivi est transmis aux partenaires et mécènes ?',
      a: 'L’école transmet un compte rendu consolidé d’impact pédagogique (progression collective des promotions, nouveaux ateliers équipés) garantissant une transparence absolue.',
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-5 lg:space-y-6 py-3.5 sm:py-5">
      
      {/* 1. HERO BANNER : SOBRE, COMPACT & INSPIRANT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl overflow-hidden bg-slate-950 text-white border border-slate-800 shadow-md">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-950/95 via-slate-900/90 to-slate-950/95 z-0" />
          
          <div className="relative z-10 p-4 sm:p-6 lg:p-7 space-y-3 sm:space-y-3.5 max-w-4xl">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-400/20 text-amber-300 text-2xs font-bold uppercase tracking-wider border border-amber-400/30">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <ContentEditable
                  contentKey="support.hero.badge"
                  defaultContent="Engagement Communautaire & Avenir des Jeunes · Delmas 50"
                  as="span"
                  currentUser={currentUser}
                  multiline={false}
                />
              </div>
              <ContentEditable
                contentKey="support.hero.title"
                defaultContent="Soutenir l’éducation, bâtir l’excellence de demain."
                as="h1"
                className="font-serif text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white leading-tight"
                currentUser={currentUser}
                multiline={false}
              />
            </div>

            <ContentEditable
              contentKey="support.hero.desc"
              defaultContent="Au Collège Isaac Newton, chaque contribution d'anciens élèves, de la diaspora, d'entreprises ou de particuliers aide concrètement à offrir un cadre d'études digne, stimulant et tourné vers les sciences à Delmas 50."
              as="p"
              className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light"
              currentUser={currentUser}
              multiline={true}
            />

            {/* Devise & Cadre de confiance */}
            <div className="p-2.5 sm:p-3 rounded-xl bg-white/5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-2xs">
              <div className="flex items-center gap-1.5 text-amber-300 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Devise : « {SCHOOL_INFO.founderMotto} »</span>
              </div>
              <span className="text-slate-300 font-medium">
                Gestion rigoureuse, transparence et protection absolue des élèves.
              </span>
            </div>

            {/* Actions rapides */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-0.5">
              <button
                type="button"
                onClick={scrollToForm}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-xs transition-all cursor-pointer"
              >
                <HeartHandshake className="w-3.5 h-3.5 text-slate-950" />
                <span>Proposer un partenariat / don</span>
              </button>

              <a
                href="tel:+50937211818"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs transition-all cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <span>Ligne directe (+509 3721-1818)</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 2. DOMAINES D'INTERVENTION PRIORITAIRES : 6 CARTES COMPACTES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3.5">
        <div className="max-w-2xl space-y-1">
          <div className="inline-block text-2xs font-bold uppercase tracking-wider text-blue-900">
            <ContentEditable
              contentKey="support.priorities.badge"
              defaultContent="Priorités Éducatives"
              as="span"
              currentUser={currentUser}
              multiline={false}
            />
          </div>
          <ContentEditable
            contentKey="support.priorities.title"
            defaultContent="Des besoins concrets au service de la réussite scolaire"
            as="h2"
            className="font-serif text-lg sm:text-xl font-bold text-slate-900"
            currentUser={currentUser}
            multiline={false}
          />
          <ContentEditable
            contentKey="support.priorities.desc"
            defaultContent="Choisissez l'axe de solidarité correspondant à votre sensibilité citoyenne."
            as="p"
            className="text-xs text-slate-600 font-light"
            currentUser={currentUser}
            multiline={true}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-3.5">
          {/* Carte 1 */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-blue-900/40 hover:shadow-xs transition-all flex flex-col justify-between space-y-2.5">
            <div className="space-y-1.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-900 flex items-center justify-center font-bold">
                <GraduationCap className="w-4 h-4 text-blue-900" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Bourses & Frais de scolarité
              </h3>
              <p className="text-2xs text-slate-600 leading-relaxed font-light">
                Prise en charge partielle ou totale d'écolages pour maintenir des élèves méritants en classe sans rupture d'apprentissage.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-900 shrink-0" />
              <span>Attribution par comité pédagogique</span>
            </div>
          </div>

          {/* Carte 2 */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-blue-900/40 hover:shadow-xs transition-all flex flex-col justify-between space-y-2.5">
            <div className="space-y-1.5">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center font-bold">
                <BookOpen className="w-4 h-4 text-amber-700" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Livres & Fournitures scolaires
              </h3>
              <p className="text-2xs text-slate-600 leading-relaxed font-light">
                Dotation en manuels officiels, dictionnaires, cahiers et calculatrices scientifiques pour les familles vulnérables.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Remise directe sous contrôle du secrétariat</span>
            </div>
          </div>

          {/* Carte 3 */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-blue-900/40 hover:shadow-xs transition-all flex flex-col justify-between space-y-2.5">
            <div className="space-y-1.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
                <Shirt className="w-4 h-4 text-emerald-700" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Uniformes, Repas & Transport
              </h3>
              <p className="text-2xs text-slate-600 leading-relaxed font-light">
                Aide aux besoins essentiels favorisant l'assiduité : uniformes réglementaires bleu et blanc, collations saines et transport.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-900 shrink-0" />
              <span>Discrétion et dignité préservées</span>
            </div>
          </div>

          {/* Carte 4 */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-blue-900/40 hover:shadow-xs transition-all flex flex-col justify-between space-y-2.5">
            <div className="space-y-1.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-800 flex items-center justify-center font-bold">
                <Cpu className="w-4 h-4 text-indigo-700" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Laboratoire informatique & Outils numériques
              </h3>
              <p className="text-2xs text-slate-600 leading-relaxed font-light">
                Modernisation de la salle multimédia de Delmas 50 : ordinateurs, onduleurs, logiciels éducatifs et initiation au code.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Bénéficie à l'ensemble des promotions</span>
            </div>
          </div>

          {/* Carte 5 */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-blue-900/40 hover:shadow-xs transition-all flex flex-col justify-between space-y-2.5">
            <div className="space-y-1.5">
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-800 flex items-center justify-center font-bold">
                <Award className="w-4 h-4 text-rose-700" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Bibliothèque, Sciences & Clubs
              </h3>
              <p className="text-2xs text-slate-600 leading-relaxed font-light">
                Ouvrages scientifiques, kits de physique-chimie et financement des clubs extrascolaires (échecs, génie, éloquence).
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Curiosité scientifique et esprit critique</span>
            </div>
          </div>

          {/* Carte 6 */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-blue-900/40 hover:shadow-xs transition-all flex flex-col justify-between space-y-2.5">
            <div className="space-y-1.5">
              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center font-bold">
                <Building className="w-4 h-4 text-slate-800" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Infrastructures & Fonctionnement
              </h3>
              <p className="text-2xs text-slate-600 leading-relaxed font-light">
                Maintenance des salles, sécurisation des accès, sanitaires et autonomie énergétique pour des cours dans un climat serein.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-900 shrink-0" />
              <span>Stabilité opérationnelle du campus</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. PROCESSUS DE PARRAINAGE : 4 ÉTAPES DENSES & RÈGLE DE PROTECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-50 rounded-2xl border border-slate-200/90 p-4 sm:p-5 space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div>
              <span className="text-2xs font-bold uppercase tracking-wider text-blue-900 block">
                Gouvernance Pédagogique
              </span>
              <h2 className="font-serif text-base sm:text-lg font-bold text-slate-900">
                Comment fonctionne le parrainage au Collège ?
              </h2>
            </div>
            <span className="text-2xs text-slate-500 font-medium">
              4 étapes transparentes sous supervision de la direction
            </span>
          </div>

          {/* 4 Étapes horizontales fluides */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs space-y-1.5">
              <div className="w-6 h-6 rounded-md bg-blue-900 text-white flex items-center justify-center font-bold text-2xs">
                1
              </div>
              <h3 className="font-bold text-xs text-slate-900">
                Prise de contact
              </h3>
              <p className="text-2xs text-slate-600 leading-relaxed font-light">
                Manifestez votre intérêt par notre formulaire officiel ou par téléphone au secrétariat.
              </p>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs space-y-1.5">
              <div className="w-6 h-6 rounded-md bg-blue-900 text-white flex items-center justify-center font-bold text-2xs">
                2
              </div>
              <h3 className="font-bold text-xs text-slate-900">
                Échange de cadrage
              </h3>
              <p className="text-2xs text-slate-600 leading-relaxed font-light">
                Entretien avec l'administration pour évaluer les priorités immédiates des élèves.
              </p>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs space-y-1.5">
              <div className="w-6 h-6 rounded-md bg-blue-900 text-white flex items-center justify-center font-bold text-2xs">
                3
              </div>
              <h3 className="font-bold text-xs text-slate-900">
                Validation du projet
              </h3>
              <p className="text-2xs text-slate-600 leading-relaxed font-light">
                Affectation à un projet précis (bourse, dotation tech) avec engagement mutuel écrit.
              </p>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs space-y-1.5">
              <div className="w-6 h-6 rounded-md bg-blue-900 text-white flex items-center justify-center font-bold text-2xs">
                4
              </div>
              <h3 className="font-bold text-xs text-slate-900">
                Bilan d'impact
              </h3>
              <p className="text-2xs text-slate-600 leading-relaxed font-light">
                Transmission d'un compte rendu régulier sur les avancées scolaires obtenues.
              </p>
            </div>
          </div>

          {/* Règle de protection éthique */}
          <div className="p-3 rounded-xl bg-amber-50/90 border border-amber-200 flex items-start gap-2.5 text-2xs text-amber-950">
            <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <p className="text-slate-700 leading-relaxed">
              <strong>Protection de la vie privée :</strong> Afin de préserver la dignité et la sécurité des mineurs, <strong>aucun contact privé direct ni échange de coordonnées personnelles d'élève</strong> n'est autorisé. Les bilans sont consolidés par le corps enseignant.
            </p>
          </div>
        </div>
      </section>

      {/* 4. PROFILES PARTENAIRES : 4 BLOCS COMPACTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3.5">
        <div className="max-w-2xl space-y-1">
          <span className="text-2xs font-bold uppercase tracking-wider text-blue-900 block">
            Synergies & Réseau
          </span>
          <h2 className="font-serif text-lg sm:text-xl font-bold text-slate-900">
            Devenir partenaire du Collège Isaac Newton
          </h2>
          <p className="text-xs text-slate-600 font-light">
            Une collaboration ouverte aux acteurs engagés pour la jeunesse haïtienne.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1.5">
            <Building className="w-5 h-5 text-blue-900" />
            <h3 className="font-bold text-xs text-slate-900">Entreprises</h3>
            <p className="text-2xs text-slate-600 leading-relaxed font-light">
              Mécénat, ateliers technologiques et immersions pour les lycéens du secondaire.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1.5">
            <Users className="w-5 h-5 text-amber-700" />
            <h3 className="font-bold text-xs text-slate-900">Anciens Élèves (Alumni)</h3>
            <p className="text-2xs text-slate-600 leading-relaxed font-light">
              Mentorat, fonds de solidarité entre promotions et partage d'expérience professionnelle.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1.5">
            <Award className="w-5 h-5 text-emerald-700" />
            <h3 className="font-bold text-xs text-slate-900">Fondations & ONG</h3>
            <p className="text-2xs text-slate-600 leading-relaxed font-light">
              Co-financement de projets durables, inclusion scolaire et développement de la bibliothèque.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1.5">
            <Globe className="w-5 h-5 text-indigo-700" />
            <h3 className="font-bold text-xs text-slate-900">Diaspora Haïtienne</h3>
            <p className="text-2xs text-slate-600 leading-relaxed font-light">
              Parrainage à distance et appui direct aux investissements scientifiques de l'établissement.
            </p>
          </div>
        </div>
      </section>

      {/* 5. FAQ RAPIDE & SYNTHÉTIQUE */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
        <div className="text-center space-y-0.5">
          <span className="text-2xs font-bold uppercase tracking-wider text-blue-900 block">
            Foire Aux Questions
          </span>
          <h2 className="font-serif text-base sm:text-lg font-bold text-slate-900">
            Questions fréquentes sur le soutien au Collège
          </h2>
        </div>

        <div className="space-y-2">
          {faqs.map((item, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div 
                key={index}
                className="rounded-xl border border-slate-200 bg-white overflow-hidden transition-all shadow-2xs"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  className="w-full p-3 sm:p-3.5 text-left flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <HelpCircle className="w-4 h-4 text-blue-900 shrink-0" />
                    <span className="font-bold text-xs text-slate-900">
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
                  <div className="px-3.5 pb-3.5 pt-1 text-2xs text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                    <p>{item.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. FORMULAIRE DE PRISE DE CONTACT OFFICIEL & COORDONNÉES */}
      <section id="formulaire-soutien" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-start">
          
          {/* Colonne Gauche : Formulaire Fonctionnel */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-4">
            <div className="space-y-1 border-b border-slate-100 pb-3">
              <span className="text-2xs font-bold uppercase tracking-wider text-blue-900 block">
                Formulaire Officiel de Prise de Contact
              </span>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-slate-900">
                Proposer un partenariat ou un soutien
              </h3>
              <p className="text-2xs text-slate-600 leading-relaxed font-light">
                Transmettez votre proposition à la direction. Aucune transaction bancaire directe en ligne n'est demandée.
              </p>
            </div>

            {submitSuccess && submissionMeta ? (
              <div 
                role="status" 
                aria-live="polite"
                className="p-4 sm:p-5 rounded-2xl bg-emerald-50/90 border border-emerald-200 space-y-4 animate-in fade-in"
              >
                <div className="flex items-center gap-3 border-b border-emerald-200/70 pb-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                      Transmission Réussie
                    </span>
                    <h4 className="font-serif text-base sm:text-lg font-bold text-slate-900">
                      Votre démarche a été enregistrée
                    </h4>
                  </div>
                </div>

                {/* Reference Code Card */}
                <div className="p-3 rounded-xl bg-white border border-emerald-200 shadow-2xs flex items-center justify-between gap-2">
                  <div>
                    <div className="text-[10px] text-slate-500 font-medium">Référence de dossier :</div>
                    <div className="font-mono text-sm sm:text-base font-bold text-blue-950">{submissionMeta.refCode}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyRef(submissionMeta.refCode)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-2xs font-semibold bg-emerald-100 hover:bg-emerald-200 text-emerald-900 transition-colors cursor-pointer"
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

                <div className="text-2xs text-slate-600 space-y-1 bg-white/70 p-3 rounded-xl border border-emerald-100">
                  <p>• Message transmis à la Direction de M. Orphe Jean Marie.</p>
                  <p>• Un responsable vous contactera sous <strong>48 heures ouvrées</strong> à l'adresse <strong>{submissionMeta.email}</strong>.</p>
                </div>

                <div className="pt-1 flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-2xs font-bold transition-all cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Nouvelle demande</span>
                  </button>
                  <a
                    href="tel:+50937211818"
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-emerald-200 text-slate-800 text-2xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Joindre le secrétariat (+509 3721-1818)</span>
                  </a>
                </div>
              </div>
            ) : (
              <form 
                onSubmit={handleFormSubmit} 
                noValidate 
                className="space-y-3 text-2xs"
              >
                {submitError && (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-950 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <span className="font-bold block text-rose-900">Veuillez vérifier les informations</span>
                      <p className="text-rose-800">{submitError}</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label htmlFor="support-fullName" className="font-bold text-slate-700 uppercase tracking-wide block text-[11px]">
                      Votre nom complet <span className="text-rose-600">*</span>
                    </label>
                    <input
                      id="support-fullName"
                      name="fullName"
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => {
                        setFormData({ ...formData, fullName: e.target.value });
                        setSubmitError(null);
                      }}
                      onBlur={() => handleBlur('fullName')}
                      placeholder="Ex: Jean-Marc Voltaire"
                      className={`w-full py-1.5 px-2.5 rounded-xl border text-xs text-slate-900 transition-all ${
                        touched.fullName && errors.fullName
                          ? 'border-rose-400 bg-rose-50/30'
                          : 'border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-900 focus:ring-1 focus:ring-blue-900/20'
                      }`}
                    />
                    {touched.fullName && errors.fullName && (
                      <p className="text-[10px] text-rose-600 font-medium">{errors.fullName}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="support-organization" className="font-bold text-slate-700 uppercase tracking-wide block text-[11px]">
                      Organisation ou Entreprise <span className="text-slate-400 font-normal">(optionnel)</span>
                    </label>
                    <input
                      id="support-organization"
                      name="organization"
                      type="text"
                      value={formData.organization}
                      onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                      placeholder="Ex: Fondation / Entreprise S.A."
                      className="w-full py-1.5 px-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-xs text-slate-900 focus:border-blue-900 focus:ring-1 focus:ring-blue-900/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label htmlFor="support-email" className="font-bold text-slate-700 uppercase tracking-wide block text-[11px]">
                      Adresse e-mail <span className="text-rose-600">*</span>
                    </label>
                    <input
                      id="support-email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        setSubmitError(null);
                      }}
                      onBlur={() => handleBlur('email')}
                      placeholder="votre.email@domaine.com"
                      className={`w-full py-1.5 px-2.5 rounded-xl border text-xs text-slate-900 transition-all ${
                        touched.email && errors.email
                          ? 'border-rose-400 bg-rose-50/30'
                          : 'border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-900 focus:ring-1 focus:ring-blue-900/20'
                      }`}
                    />
                    {touched.email && errors.email && (
                      <p className="text-[10px] text-rose-600 font-medium">{errors.email}</p>
                    )}
                    {emailValidation?.suggestion && (
                      <div className="p-1 rounded-md bg-amber-50 border border-amber-200 text-[10px] text-amber-900 flex items-center justify-between gap-1">
                        <span>Suggestion : <strong>{emailValidation.suggestion}</strong></span>
                        <button
                          type="button"
                          onClick={() => applyEmailSuggestion(emailValidation.suggestion!)}
                          className="px-1.5 py-0.2 rounded bg-amber-200 font-bold text-[9px] cursor-pointer"
                        >
                          Corriger
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="support-phone" className="font-bold text-slate-700 uppercase tracking-wide block text-[11px]">
                      Téléphone / WhatsApp <span className="text-slate-400 font-normal">(recommandé)</span>
                    </label>
                    <input
                      id="support-phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handlePhoneChange}
                      onBlur={() => handleBlur('phone')}
                      placeholder="+509 .... ou 8 chiffres"
                      className="w-full py-1.5 px-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-xs text-slate-900 focus:border-blue-900 focus:ring-1 focus:ring-blue-900/20"
                    />
                    {touched.phone && errors.phone && (
                      <p className="text-[10px] text-rose-600 font-medium">{errors.phone}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="support-type" className="font-bold text-slate-700 uppercase tracking-wide block text-[11px]">
                    Type de soutien envisagé <span className="text-rose-600">*</span>
                  </label>
                  <select
                    id="support-type"
                    name="supportType"
                    value={formData.supportType}
                    onChange={(e) => setFormData({ ...formData, supportType: e.target.value })}
                    className="w-full py-1.5 px-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-xs text-slate-900 font-medium focus:border-blue-900 focus:ring-1 focus:ring-blue-900/20 cursor-pointer"
                  >
                    <option value="bourse">Parrainage / Bourse de scolarité pour un élève</option>
                    <option value="fournitures">Dotation en livres et fournitures scolaires</option>
                    <option value="equipement">Équipement du laboratoire informatique & sciences</option>
                    <option value="nature">Don en nature (matériel, mobilier, instruments)</option>
                    <option value="partenariat">Partenariat institutionnel ou mécénat d’entreprise</option>
                    <option value="autre">Autre forme de contribution citoyenne</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label htmlFor="support-message" className="font-bold text-slate-700 uppercase tracking-wide block text-[11px]">
                    Votre message ou proposition <span className="text-rose-600">*</span>
                  </label>
                  <textarea
                    id="support-message"
                    name="message"
                    required
                    rows={3}
                    value={formData.message}
                    onChange={(e) => {
                      setFormData({ ...formData, message: e.target.value });
                      setSubmitError(null);
                    }}
                    onBlur={() => handleBlur('message')}
                    placeholder="Précisez votre projet, questions ou disponibilités pour un entretien avec la direction..."
                    className={`w-full py-1.5 px-2.5 rounded-xl border text-xs text-slate-900 resize-y transition-all ${
                      touched.message && errors.message
                        ? 'border-rose-400 bg-rose-50/30'
                        : 'border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-900 focus:ring-1 focus:ring-blue-900/20'
                    }`}
                  />
                  {touched.message && errors.message && (
                    <p className="text-[10px] text-rose-600 font-medium">{errors.message}</p>
                  )}
                </div>

                <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/60">
                  <label htmlFor="consent-support" className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      id="consent-support"
                      name="consent"
                      required
                      checked={formData.consent}
                      onChange={(e) => {
                        setFormData({ ...formData, consent: e.target.checked });
                        setSubmitError(null);
                      }}
                      onBlur={() => handleBlur('consent')}
                      className="w-3.5 h-3.5 text-blue-900 rounded border-slate-300 mt-0.5 cursor-pointer shrink-0"
                    />
                    <span className="text-[11px] text-slate-700 leading-snug">
                      J’autorise l’administration du <strong>Collège Isaac Newton</strong> à me contacter par e-mail ou téléphone pour donner suite à cette proposition. Données strictement confidentielles.
                    </span>
                  </label>
                  {touched.consent && errors.consent && (
                    <p className="text-[10px] text-rose-600 font-medium pt-1 pl-5">{errors.consent}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2 px-4 rounded-xl bg-blue-900 hover:bg-blue-800 disabled:opacity-60 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                      <span>Transmission en cours...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5 text-amber-400" />
                      <span>Transmettre ma demande à la direction</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Colonne Droite : Coordonnées Officielles & Précautions */}
          <div className="lg:col-span-5 space-y-3.5">
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 text-white border border-slate-800 space-y-3.5 shadow-sm">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase tracking-wider text-amber-400 font-bold block">
                  Secrétariat Officiel
                </span>
                <h4 className="font-serif text-base sm:text-lg font-bold text-white">
                  Collège Isaac Newton
                </h4>
                <p className="text-2xs text-slate-300">
                  Établissement scolaire privé · Delmas 50, Port-au-Prince, Haïti
                </p>
              </div>

              <div className="space-y-2.5 text-2xs text-slate-200 pt-2 border-t border-slate-800">
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-400/10 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      Lignes téléphoniques directes
                    </span>
                    <a href="tel:+50937211818" className="font-mono text-xs font-bold text-amber-300 hover:underline block">
                      +509 3721-1818
                    </a>
                    <a href="tel:+50933160934" className="font-mono text-[11px] text-slate-300 hover:underline block">
                      +509 3316-0934
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      Campus Principal
                    </span>
                    <span className="text-xs text-white block">
                      Delmas 50, rue Dominique #2 bis
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      Courriel officiel de l'établissement
                    </span>
                    <a 
                      href="mailto:collegeisaacnewton9@gmail.com" 
                      className="text-xs text-white hover:text-amber-300 font-mono underline block"
                    >
                      collegeisaacnewton9@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Users className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      Direction Générale
                    </span>
                    <span className="text-xs font-semibold text-white block">
                      M. Orphe Jean Marie
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      Directeur fondateur · Mathématiques & Sciences
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-2xs text-amber-900 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-950">
                <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span>Sécurité des contributions & Prévention</span>
              </div>
              <p className="text-slate-700 leading-relaxed font-light">
                Le Collège n’utilise aucun compte intermédiaire non vérifié. Les modalités de virement et réceptions matérielles sont communiquées uniquement par nos canaux officiels après confirmation directe.
              </p>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
};
