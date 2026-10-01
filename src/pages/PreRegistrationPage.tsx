import React, { useState, useMemo } from 'react';
import { 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  FileText, 
  User, 
  GraduationCap, 
  Printer, 
  Copy, 
  Clock, 
  Phone, 
  Calendar, 
  AlertCircle,
  Mail,
  MapPin,
  Briefcase,
  BookOpen,
  Sparkles
} from 'lucide-react';
import { AdmissionFormData, AcademicCycle } from '../types';
import { apiService } from '../services/api';
import { SCHOOL_INFO } from '../data/mockData';

interface PreRegistrationPageProps {
  onNavigate: (page: string) => void;
}

export const PreRegistrationPage: React.FC<PreRegistrationPageProps> = ({ onNavigate }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submittedNumber, setSubmittedNumber] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Form State
  const [formData, setFormData] = useState<AdmissionFormData>({
    parentFullName: '',
    parentRelationship: 'Père',
    parentPhone: '',
    parentEmail: '',
    parentAddress: '',
    parentOccupation: '',
    studentLastName: '',
    studentFirstName: '',
    studentBirthDate: '',
    studentGender: 'M',
    previousSchool: '',
    schoolYear: '2026-2027',
    targetLevel: '7ème Année Fondamentale (7e AF)',
    cycle: 'FONDAMENTAL_CYCLE_3',
    hasBirthCert: true,
    hasReportCards: true,
    hasPassCert: false,
    hasIdPhotos: true,
    specialNotes: '',
    consentGiven: false,
  });

  // Real-time validation state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Field validation logic
  const validateSingleField = (field: keyof AdmissionFormData, value: any): string => {
    switch (field) {
      case 'parentFullName': {
        const trimmed = String(value || '').trim();
        if (!trimmed) return 'Nom et prénom du responsable requis';
        if (trimmed.length < 3) return 'Veuillez saisir un nom complet (minimum 3 caractères)';
        return '';
      }
      case 'parentPhone': {
        const trimmed = String(value || '').trim();
        if (!trimmed) return 'Numéro de téléphone joignable requis';
        const digits = trimmed.replace(/\D/g, '');
        if (digits.length < 8) return 'Numéro de téléphone incomplet (au moins 8 chiffres, ex: +509 3700-0000)';
        return '';
      }
      case 'parentEmail': {
        const trimmed = String(value || '').trim();
        if (!trimmed) return 'Adresse email requise pour les notifications';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmed)) return 'Format d\'email invalide (ex: contact@exemple.com)';
        return '';
      }
      case 'parentAddress': {
        const trimmed = String(value || '').trim();
        if (!trimmed) return 'Adresse de résidence requise';
        if (trimmed.length < 4) return 'Veuillez préciser la zone de résidence (ex: Delmas 50)';
        return '';
      }
      case 'studentLastName': {
        const trimmed = String(value || '').trim();
        if (!trimmed) return 'Nom de famille de l\'élève requis';
        if (trimmed.length < 2) return 'Le nom doit comporter au moins 2 lettres';
        return '';
      }
      case 'studentFirstName': {
        const trimmed = String(value || '').trim();
        if (!trimmed) return 'Prénom(s) de l\'élève requis';
        if (trimmed.length < 2) return 'Le prénom doit comporter au moins 2 lettres';
        return '';
      }
      case 'studentBirthDate': {
        const trimmed = String(value || '').trim();
        if (!trimmed) return 'Date de naissance de l\'élève requise';
        const birth = new Date(trimmed);
        if (isNaN(birth.getTime())) return 'Date de naissance non valide';
        const now = new Date();
        const age = now.getFullYear() - birth.getFullYear();
        if (age < 2 || age > 25) return 'Veuillez vérifier l\'année de naissance (âge attendu entre 2 et 25 ans)';
        return '';
      }
      case 'targetLevel': {
        const trimmed = String(value || '').trim();
        if (!trimmed) return 'Veuillez sélectionner une classe visée';
        return '';
      }
      case 'consentGiven': {
        if (!value) return 'Vous devez certifier l\'exactitude des renseignements et autoriser le traitement';
        return '';
      }
      default:
        return '';
    }
  };

  // Real-time update handler
  const handleFieldChange = (field: keyof AdmissionFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));

    const errorMsg = validateSingleField(field, value);
    setErrors(prev => {
      const updated = { ...prev };
      if (errorMsg) {
        updated[field] = errorMsg;
      } else {
        delete updated[field];
      }
      return updated;
    });
  };

  // OnBlur touch handler
  const handleFieldBlur = (field: keyof AdmissionFormData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const errorMsg = validateSingleField(field, formData[field]);
    setErrors(prev => {
      const updated = { ...prev };
      if (errorMsg) {
        updated[field] = errorMsg;
      } else {
        delete updated[field];
      }
      return updated;
    });
  };

  // Academic cycle handler
  const handleCycleChange = (level: string) => {
    let cycle: AcademicCycle = 'FONDAMENTAL_CYCLE_1';
    if (level.includes('Préscolaire') || level.includes('Maternelle') || level.includes('Section')) {
      cycle = 'PRESCOLAIRE';
    } else if (level.includes('1ère') || level.includes('2ème') || level.includes('3ème') || level.includes('4ème')) {
      cycle = 'FONDAMENTAL_CYCLE_1';
    } else if (level.includes('5ème') || level.includes('6ème')) {
      cycle = 'FONDAMENTAL_CYCLE_2';
    } else if (level.includes('7ème') || level.includes('8ème') || level.includes('9ème')) {
      cycle = 'FONDAMENTAL_CYCLE_3';
    } else if (level.includes('Secondaire') || level.includes('NS')) {
      cycle = 'SECONDAIRE';
    }
    handleFieldChange('targetLevel', level);
    setFormData(prev => ({ ...prev, cycle }));
  };

  // Step validation
  const validateStep = (step: number): boolean => {
    const stepErrors: Record<string, string> = {};
    const stepTouched: Record<string, boolean> = {};

    if (step === 1) {
      // Step 1: Responsable Légal
      const fields: (keyof AdmissionFormData)[] = ['parentFullName', 'parentPhone', 'parentEmail', 'parentAddress'];
      fields.forEach(f => {
        stepTouched[f] = true;
        const err = validateSingleField(f, formData[f]);
        if (err) stepErrors[f] = err;
      });
    } else if (step === 2) {
      // Step 2: Informations de l'Élève
      const fields: (keyof AdmissionFormData)[] = ['studentLastName', 'studentFirstName', 'studentBirthDate'];
      fields.forEach(f => {
        stepTouched[f] = true;
        const err = validateSingleField(f, formData[f]);
        if (err) stepErrors[f] = err;
      });
    } else if (step === 3) {
      // Step 3: Niveau Scolaire & Classe
      stepTouched.targetLevel = true;
      const err = validateSingleField('targetLevel', formData.targetLevel);
      if (err) stepErrors.targetLevel = err;
    } else if (step === 4) {
      // Step 4: Consentement & Pièces
      stepTouched.consentGiven = true;
      const err = validateSingleField('consentGiven', formData.consentGiven);
      if (err) stepErrors.consentGiven = err;
    }

    setTouched(prev => ({ ...prev, ...stepTouched }));
    setErrors(prev => ({ ...prev, ...stepErrors }));

    return Object.keys(stepErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 60, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => prev - 1);
    window.scrollTo({ top: 60, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(4)) return;

    setSubmitting(true);
    try {
      const created = await apiService.submitAdmission(formData);
      setSubmittedNumber(created.applicationNumber);
    } catch {
      alert("Une erreur est survenue lors de l'enregistrement. Vos données locales ont été préservées.");
    } finally {
      setSubmitting(false);
    }
  };

  const copyToClipboard = () => {
    if (submittedNumber) {
      navigator.clipboard.writeText(submittedNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Helper for input styling with real-time feedback
  const getInputClasses = (field: keyof AdmissionFormData) => {
    const hasError = touched[field] && errors[field];
    const isValid = touched[field] && !errors[field] && Boolean(formData[field]);

    return `w-full px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg border text-xs sm:text-sm outline-none transition-all ${
      hasError 
        ? 'border-rose-400 bg-rose-50/30 text-rose-950 focus:border-rose-600 focus:ring-1 focus:ring-rose-400' 
        : isValid
        ? 'border-emerald-300 bg-emerald-50/15 text-slate-900 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-400'
        : 'border-slate-300 bg-slate-50/60 text-slate-900 focus:bg-white focus:border-blue-900 focus:ring-1 focus:ring-blue-900'
    }`;
  };

  // Configuration détaillée des 4 étapes du formulaire de préinscription
  const STEPS_CONFIG = [
    { 
      step: 1, 
      label: '1. Responsable Légal', 
      shortLabel: 'Parent', 
      title: 'Coordonnées du Responsable Légal',
      description: 'Le parent ou tuteur officiel qui recevra la convocation et le suivi',
      icon: User,
      fields: ['parentFullName', 'parentPhone', 'parentEmail', 'parentAddress'] as (keyof AdmissionFormData)[]
    },
    { 
      step: 2, 
      label: '2. Élève Candidat', 
      shortLabel: 'Élève', 
      title: 'Identité de l\'Élève Candidat',
      description: 'Nom, prénom et date de naissance d\'état civil de l\'enfant',
      icon: GraduationCap,
      fields: ['studentLastName', 'studentFirstName', 'studentBirthDate'] as (keyof AdmissionFormData)[]
    },
    { 
      step: 3, 
      label: '3. Niveau & Classe', 
      shortLabel: 'Classe', 
      title: 'Niveau Scolaire & Classe Visée',
      description: 'Choix de la classe pour l\'année académique 2026-2027',
      icon: FileText,
      fields: ['targetLevel'] as (keyof AdmissionFormData)[]
    },
    { 
      step: 4, 
      label: '4. Pièces & Accord', 
      shortLabel: 'Accord', 
      title: 'Pièces Justificatives & Certification',
      description: 'Vérification du dossier et engagement sur l\'honneur',
      icon: ShieldCheck,
      fields: ['consentGiven'] as (keyof AdmissionFormData)[]
    },
  ];

  // Calcul dynamique de la progression en temps réel
  const currentStepData = STEPS_CONFIG[currentStep - 1] || STEPS_CONFIG[0];

  const currentStepFieldsStatus = useMemo(() => {
    const fields = currentStepData.fields;
    const filled = fields.filter(f => {
      const val = formData[f];
      if (typeof val === 'boolean') return val === true;
      return Boolean(val) && !errors[f];
    }).length;
    return { filled, total: fields.length, isComplete: filled === fields.length };
  }, [currentStepData, formData, errors]);

  // Pourcentage linéaire global pour la jauge visuelle
  const globalProgressPercent = useMemo(() => {
    const base = (currentStep - 1) * 25;
    const intra = currentStepFieldsStatus.total > 0 
      ? (currentStepFieldsStatus.filled / currentStepFieldsStatus.total) * 25 
      : 0;
    return Math.min(100, Math.max(10, Math.round(base + intra)));
  }, [currentStep, currentStepFieldsStatus]);

  // SUCCESS CONFIRMATION SCREEN
  if (submittedNumber) {
    return (
      <div className="max-w-2xl mx-auto px-3 sm:px-4 py-6 sm:py-10 animate-fade-in">
        <div className="bg-white rounded-2xl p-4 sm:p-7 shadow-lg border border-slate-200/90 text-center space-y-4">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Dossier enregistré avec succès
            </span>
            <h1 className="font-serif text-xl sm:text-2xl font-bold text-slate-900 mt-1.5">
              Demande de Préinscription Transmise
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-600 max-w-md mx-auto">
              Le dossier pour <strong className="text-slate-900">{formData.studentFirstName} {formData.studentLastName}</strong> ({formData.targetLevel}) a bien été réceptionné par le secrétariat.
            </p>
          </div>

          {/* Dossier Code Box */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900 text-white max-w-sm mx-auto">
            <p className="text-[9.5px] text-slate-400 uppercase tracking-wider font-semibold">Référence unique de dossier</p>
            <div className="font-mono text-xl sm:text-2xl font-bold tracking-wider text-amber-400 mt-0.5">
              {submittedNumber}
            </div>
            <button
              onClick={copyToClipboard}
              className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-slate-200 transition-colors cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? 'Copié !' : 'Copier la référence'}</span>
            </button>
          </div>

          {/* Next steps card */}
          <div className="text-left bg-slate-50 rounded-xl p-3 sm:p-4 border border-slate-200/80 space-y-1.5 text-xs text-slate-700">
            <h3 className="font-serif font-bold text-xs text-slate-900 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-900" />
              <span>Étapes suivantes de l'admission :</span>
            </h3>
            <ol className="list-decimal pl-4 space-y-1 leading-relaxed text-slate-600 text-[11px] sm:text-xs">
              <li>
                <strong>Étude sous 48-72h :</strong> Examen de l'admissibilité administrative.
              </li>
              <li>
                <strong>Test diagnostique :</strong> Convocation de l'élève pour le test d'aptitude.
              </li>
              <li>
                <strong>Entretien final :</strong> Dépôt des pièces physiques et confirmation de la place.
              </li>
            </ol>
            <div className="pt-2 flex items-center gap-1.5 text-slate-500 font-mono text-[10px] sm:text-[11px] border-t border-slate-200/60">
              <Phone className="w-3 h-3 text-slate-400" />
              <span>Secrétariat général : {SCHOOL_INFO.phone}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-1 flex flex-col sm:flex-row items-center justify-center gap-2">
            <button
              onClick={() => window.print()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimer le récépissé</span>
            </button>

            <button
              onClick={() => onNavigate('home')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-950 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              <span>Retour à l'accueil</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // WIZARD FORM - Clean mobile layout with reduced margins & natural hierarchy
  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-2.5 sm:py-4 space-y-2 sm:space-y-3">
      
      {/* Header - Compact */}
      <div className="text-center max-w-xl mx-auto space-y-0.5">
        <span className="text-[9.5px] sm:text-[10px] font-bold uppercase tracking-widest text-blue-900 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
          Admissions Officielles {SCHOOL_INFO.currentYear}
        </span>
        <h1 className="font-serif text-lg sm:text-2xl font-bold text-slate-900 leading-tight">
          Préinscription en Ligne
        </h1>
        <p className="text-[10.5px] sm:text-xs text-slate-600">
          Formulaire officiel en 4 étapes pour réserver la place de votre enfant.
        </p>
      </div>

      {/* =========================================================================
          BARRE DE PROGRESSION VISUELLE DYNAMIQUE & ÉTAPES DU FORMULAIRE
      ========================================================================= */}
      <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-2xs border border-slate-200/90 space-y-2.5 sm:space-y-3">
        
        {/* En-tête de progression : Titre de l'étape active, statut des champs et pourcentage */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-blue-900 text-amber-400 font-mono text-xs font-bold flex items-center justify-center shrink-0 shadow-2xs">
              {currentStep}
            </span>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-sans font-bold text-slate-900 text-xs sm:text-sm">
                  {currentStepData.title}
                </span>
                <span className="text-[10px] sm:text-[10.5px] font-mono font-medium text-slate-500">
                  ({currentStepFieldsStatus.filled}/{currentStepFieldsStatus.total} champ{currentStepFieldsStatus.total > 1 ? 's' : ''} validé{currentStepFieldsStatus.filled > 1 ? 's' : ''})
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 hidden sm:block">
                {currentStepData.description}
              </p>
            </div>
          </div>

          {/* Pourcentage global & badge d'état */}
          <div className="flex items-center gap-2 ml-auto">
            <div className="text-right">
              <div className="flex items-center justify-end gap-1 font-mono font-bold text-xs sm:text-sm text-blue-900">
                <span>{globalProgressPercent}%</span>
              </div>
              <span className="text-[9px] sm:text-[10px] text-slate-400 block font-sans">
                Étape {currentStep} sur 4
              </span>
            </div>
          </div>
        </div>

        {/* Jauge linéaire horizontale fluide avec dégradé et reflet */}
        <div className="space-y-1">
          <div className="w-full bg-slate-100 rounded-full h-2 sm:h-2.5 overflow-hidden p-0.5 border border-slate-200/70 shadow-inner">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-blue-950 via-blue-700 to-amber-500 transition-all duration-500 ease-out shadow-xs"
              style={{ width: `${globalProgressPercent}%` }}
              role="progressbar"
              aria-valuenow={globalProgressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>

        {/* Stepper avec jalons interactifs et connecteurs d'avancement */}
        <div className="relative pt-0.5 sm:pt-1">
          {/* Ligne connecteur d'arrière-plan visible sur desktop */}
          <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-200 -z-0 hidden sm:block" />
          
          <div className="grid grid-cols-4 gap-1 text-center relative z-10">
            {STEPS_CONFIG.map((item) => {
              const isCompleted = currentStep > item.step;
              const isCurrent = currentStep === item.step;
              const canClick = isCompleted;
              const Icon = item.icon;

              return (
                <button
                  key={item.step}
                  type="button"
                  onClick={() => canClick && setCurrentStep(item.step)}
                  disabled={!canClick}
                  className={`flex flex-col items-center py-0.5 transition-all text-left group ${
                    canClick ? 'cursor-pointer' : 'cursor-default'
                  }`}
                  title={canClick ? `Revenir à l'étape ${item.step} (${item.shortLabel})` : undefined}
                >
                  <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[10px] sm:text-[11px] font-bold transition-all shadow-2xs ${
                    isCompleted 
                      ? 'bg-emerald-600 text-white group-hover:bg-emerald-700 group-hover:scale-105' 
                      : isCurrent 
                      ? 'bg-blue-900 text-white ring-3 ring-blue-100 scale-105' 
                      : 'bg-slate-100 text-slate-400'
                  }`}>
                    {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Icon className="w-3 h-3" />}
                  </div>

                  <span className={`mt-1 text-[9px] sm:text-[10.5px] font-semibold truncate max-w-full px-0.5 transition-colors ${
                    isCurrent 
                      ? 'text-blue-900 font-bold' 
                      : isCompleted
                      ? 'text-emerald-700 group-hover:text-emerald-800'
                      : 'text-slate-400'
                  }`}>
                    <span className="hidden sm:inline">{item.label}</span>
                    <span className="sm:hidden">{item.shortLabel}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* Form Card - Dense, Ergonomic Spacing */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-3 sm:p-4.5 shadow-2xs border border-slate-200/90">
        
        {/* =========================================================================
            SECTION 1 : INFORMATIONS DU RESPONSABLE LÉGAL (PARENT / TUTEUR)
        ========================================================================= */}
        {currentStep === 1 && (
          <div className="space-y-2.5 sm:space-y-3 animate-fade-in">
            <div className="border-b border-slate-100 pb-2">
              <div className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-900 text-[11px] font-bold flex items-center justify-center">1</span>
                <h2 className="font-serif text-sm sm:text-base font-bold text-slate-900">
                  Responsable Légal (Parent / Tuteur)
                </h2>
              </div>
              <p className="text-[10.5px] sm:text-[11px] text-slate-500 mt-0.5">
                Coordonnées du souscripteur légal qui recevra la convocation et les notifications.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-2.5">
              
              {/* Nom complet du responsable */}
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-0.5">
                  <label className="text-[11px] sm:text-xs font-bold text-slate-700 flex items-center gap-1">
                    <User className="w-3 h-3 text-blue-900" />
                    <span>Nom et prénom du responsable *</span>
                  </label>
                  {touched.parentFullName && !errors.parentFullName && formData.parentFullName && (
                    <span className="text-[10px] text-emerald-600 flex items-center gap-0.5 font-medium">
                      <CheckCircle2 className="w-3 h-3" /> Validé
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={formData.parentFullName}
                  onChange={(e) => handleFieldChange('parentFullName', e.target.value)}
                  onBlur={() => handleFieldBlur('parentFullName')}
                  placeholder="Ex : Jean-Claude Baptiste"
                  className={getInputClasses('parentFullName')}
                />
                {touched.parentFullName && errors.parentFullName && (
                  <p className="text-[10.5px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.parentFullName}</span>
                  </p>
                )}
              </div>

              {/* Lien de parenté */}
              <div>
                <label className="block text-[11px] sm:text-xs font-bold text-slate-700 mb-0.5">
                  Lien de parenté *
                </label>
                <select
                  value={formData.parentRelationship}
                  onChange={(e) => handleFieldChange('parentRelationship', e.target.value)}
                  className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg border border-slate-300 text-xs sm:text-sm focus:border-blue-900 focus:ring-1 focus:ring-blue-900 outline-none bg-white cursor-pointer"
                >
                  <option value="Père">Père</option>
                  <option value="Mère">Mère</option>
                  <option value="Tuteur légal">Tuteur légal</option>
                  <option value="Autre proche">Autre proche / Mandataire</option>
                </select>
              </div>

              {/* Téléphone joignable */}
              <div>
                <div className="flex items-center justify-between mb-0.5">
                  <label className="text-[11px] sm:text-xs font-bold text-slate-700 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-blue-900" />
                    <span>Téléphone joignable *</span>
                  </label>
                  {touched.parentPhone && !errors.parentPhone && formData.parentPhone && (
                    <span className="text-[10px] text-emerald-600 flex items-center gap-0.5 font-medium">
                      <CheckCircle2 className="w-3 h-3" /> Validé
                    </span>
                  )}
                </div>
                <input
                  type="tel"
                  value={formData.parentPhone}
                  onChange={(e) => handleFieldChange('parentPhone', e.target.value)}
                  onBlur={() => handleFieldBlur('parentPhone')}
                  placeholder="+509 3700-0000"
                  className={getInputClasses('parentPhone')}
                />
                {touched.parentPhone && errors.parentPhone && (
                  <p className="text-[10.5px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.parentPhone}</span>
                  </p>
                )}
              </div>

              {/* Adresse e-mail */}
              <div>
                <div className="flex items-center justify-between mb-0.5">
                  <label className="text-[11px] sm:text-xs font-bold text-slate-700 flex items-center gap-1">
                    <Mail className="w-3 h-3 text-blue-900" />
                    <span>Adresse e-mail valide *</span>
                  </label>
                  {touched.parentEmail && !errors.parentEmail && formData.parentEmail && (
                    <span className="text-[10px] text-emerald-600 flex items-center gap-0.5 font-medium">
                      <CheckCircle2 className="w-3 h-3" /> Validé
                    </span>
                  )}
                </div>
                <input
                  type="email"
                  value={formData.parentEmail}
                  onChange={(e) => handleFieldChange('parentEmail', e.target.value)}
                  onBlur={() => handleFieldBlur('parentEmail')}
                  placeholder="parent@exemple.com"
                  className={getInputClasses('parentEmail')}
                />
                {touched.parentEmail && errors.parentEmail && (
                  <p className="text-[10.5px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.parentEmail}</span>
                  </p>
                )}
              </div>

              {/* Profession du responsable */}
              <div>
                <label className="block text-[11px] sm:text-xs font-bold text-slate-700 mb-0.5 flex items-center gap-1">
                  <Briefcase className="w-3 h-3 text-slate-400" />
                  <span>Profession (facultatif)</span>
                </label>
                <input
                  type="text"
                  value={formData.parentOccupation}
                  onChange={(e) => handleFieldChange('parentOccupation', e.target.value)}
                  placeholder="Ex : Enseignant, Cadre, Artisan..."
                  className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg border border-slate-300 bg-slate-50/60 text-xs sm:text-sm focus:bg-white focus:border-blue-900 outline-none"
                />
              </div>

              {/* Adresse de résidence */}
              <div className="sm:col-span-2 lg:col-span-3">
                <div className="flex items-center justify-between mb-0.5">
                  <label className="text-[11px] sm:text-xs font-bold text-slate-700 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-blue-900" />
                    <span>Adresse de résidence *</span>
                  </label>
                  {touched.parentAddress && !errors.parentAddress && formData.parentAddress && (
                    <span className="text-[10px] text-emerald-600 flex items-center gap-0.5 font-medium">
                      <CheckCircle2 className="w-3 h-3" /> Validé
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={formData.parentAddress}
                  onChange={(e) => handleFieldChange('parentAddress', e.target.value)}
                  onBlur={() => handleFieldBlur('parentAddress')}
                  placeholder="Numéro, rue, quartier, commune (Ex : Delmas 50, Delmas 33, Tabarre...)"
                  className={getInputClasses('parentAddress')}
                />
                {touched.parentAddress && errors.parentAddress && (
                  <p className="text-[10.5px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.parentAddress}</span>
                  </p>
                )}
              </div>

            </div>
          </div>
        )}

        {/* =========================================================================
            SECTION 2 : INFORMATIONS DE L'ÉLÈVE CANDIDAT
        ========================================================================= */}
        {currentStep === 2 && (
          <div className="space-y-2.5 sm:space-y-3 animate-fade-in">
            <div className="border-b border-slate-100 pb-2">
              <div className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-900 text-[11px] font-bold flex items-center justify-center">2</span>
                <h2 className="font-serif text-sm sm:text-base font-bold text-slate-900">
                  Informations de l’Élève Candidat
                </h2>
              </div>
              <p className="text-[10.5px] sm:text-[11px] text-slate-500 mt-0.5">
                Identité officielle et état civil de l'enfant à inscrire.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-2.5">
              
              {/* Nom de famille */}
              <div>
                <div className="flex items-center justify-between mb-0.5">
                  <label className="text-[11px] sm:text-xs font-bold text-slate-700">
                    Nom de famille *
                  </label>
                  {touched.studentLastName && !errors.studentLastName && formData.studentLastName && (
                    <span className="text-[10px] text-emerald-600 flex items-center gap-0.5 font-medium">
                      <CheckCircle2 className="w-3 h-3" /> Validé
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={formData.studentLastName}
                  onChange={(e) => handleFieldChange('studentLastName', e.target.value)}
                  onBlur={() => handleFieldBlur('studentLastName')}
                  placeholder="Ex : Baptiste"
                  className={getInputClasses('studentLastName')}
                />
                {touched.studentLastName && errors.studentLastName && (
                  <p className="text-[10.5px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.studentLastName}</span>
                  </p>
                )}
              </div>

              {/* Prénom(s) */}
              <div>
                <div className="flex items-center justify-between mb-0.5">
                  <label className="text-[11px] sm:text-xs font-bold text-slate-700">
                    Prénom(s) *
                  </label>
                  {touched.studentFirstName && !errors.studentFirstName && formData.studentFirstName && (
                    <span className="text-[10px] text-emerald-600 flex items-center gap-0.5 font-medium">
                      <CheckCircle2 className="w-3 h-3" /> Validé
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={formData.studentFirstName}
                  onChange={(e) => handleFieldChange('studentFirstName', e.target.value)}
                  onBlur={() => handleFieldBlur('studentFirstName')}
                  placeholder="Ex : Alexandre"
                  className={getInputClasses('studentFirstName')}
                />
                {touched.studentFirstName && errors.studentFirstName && (
                  <p className="text-[10.5px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.studentFirstName}</span>
                  </p>
                )}
              </div>

              {/* Date de naissance */}
              <div>
                <div className="flex items-center justify-between mb-0.5">
                  <label className="text-[11px] sm:text-xs font-bold text-slate-700 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-blue-900" />
                    <span>Date de naissance *</span>
                  </label>
                  {touched.studentBirthDate && !errors.studentBirthDate && formData.studentBirthDate && (
                    <span className="text-[10px] text-emerald-600 flex items-center gap-0.5 font-medium">
                      <CheckCircle2 className="w-3 h-3" /> Validé
                    </span>
                  )}
                </div>
                <input
                  type="date"
                  value={formData.studentBirthDate}
                  onChange={(e) => handleFieldChange('studentBirthDate', e.target.value)}
                  onBlur={() => handleFieldBlur('studentBirthDate')}
                  className={getInputClasses('studentBirthDate')}
                />
                {touched.studentBirthDate && errors.studentBirthDate && (
                  <p className="text-[10.5px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.studentBirthDate}</span>
                  </p>
                )}
              </div>

              {/* Sexe */}
              <div>
                <label className="block text-[11px] sm:text-xs font-bold text-slate-700 mb-0.5">
                  Sexe *
                </label>
                <div className="grid grid-cols-2 gap-1.5 mt-0.5">
                  <button
                    type="button"
                    onClick={() => handleFieldChange('studentGender', 'M')}
                    className={`py-1.5 px-2.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                      formData.studentGender === 'M' 
                        ? 'border-blue-900 bg-blue-900 text-white shadow-2xs' 
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50 bg-white'
                    }`}
                  >
                    Masculin (Garçon)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFieldChange('studentGender', 'F')}
                    className={`py-1.5 px-2.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                      formData.studentGender === 'F' 
                        ? 'border-blue-900 bg-blue-900 text-white shadow-2xs' 
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50 bg-white'
                    }`}
                  >
                    Féminin (Fille)
                  </button>
                </div>
              </div>

              {/* Établissement précédent */}
              <div className="sm:col-span-2">
                <label className="block text-[11px] sm:text-xs font-bold text-slate-700 mb-0.5 flex items-center gap-1">
                  <BookOpen className="w-3 h-3 text-slate-400" />
                  <span>Établissement scolaire précédent (si applicable)</span>
                </label>
                <input
                  type="text"
                  value={formData.previousSchool}
                  onChange={(e) => handleFieldChange('previousSchool', e.target.value)}
                  placeholder="Nom de l'école précédente (ex : Institution Saint-Louis...)"
                  className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg border border-slate-300 bg-slate-50/60 text-xs sm:text-sm focus:bg-white focus:border-blue-900 outline-none"
                />
              </div>

            </div>
          </div>
        )}

        {/* =========================================================================
            SECTION 3 : NIVEAU SCOLAIRE & CLASSE VISÉE
        ========================================================================= */}
        {currentStep === 3 && (
          <div className="space-y-2.5 sm:space-y-3 animate-fade-in">
            <div className="border-b border-slate-100 pb-2">
              <div className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-900 text-[11px] font-bold flex items-center justify-center">3</span>
                <h2 className="font-serif text-sm sm:text-base font-bold text-slate-900">
                  Niveau Scolaire & Classe Souhaitée
                </h2>
              </div>
              <p className="text-[10.5px] sm:text-[11px] text-slate-500 mt-0.5">
                Sélectionnez le cycle et la classe pour l'année académique {formData.schoolYear}.
              </p>
            </div>

            <div className="space-y-2 sm:space-y-2.5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-2.5">
                {[
                  { 
                    group: 'Préscolaire (3-5 ans)', 
                    levels: ['Petite Section Préscolaire', 'Moyenne Section', 'Grande Section'] 
                  },
                  { 
                    group: 'Fondamental 1 & 2 (6-11 ans)', 
                    levels: ['1ère Année Fondamentale (1e AF)', '2ème AF', '3ème AF', '4ème AF', '5ème AF', '6ème AF'] 
                  },
                  { 
                    group: 'Fondamental 3 & Secondaire', 
                    levels: ['7ème Année Fondamentale (7e AF)', '8ème AF', '9ème AF (Examens d’État)', 'Secondaire 1 (NS1)', 'Secondaire 2 (NS2)', 'Secondaire 3 (NS3)', 'Secondaire 4 (NS4 Bac)'] 
                  },
                ].map((cat, idx) => (
                  <div key={idx} className="p-2 sm:p-2.5 rounded-xl bg-slate-50 border border-slate-200/90 space-y-1">
                    <p className="text-[10.5px] font-bold text-blue-900 uppercase tracking-wider">{cat.group}</p>
                    <div className="space-y-0.5">
                      {cat.levels.map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => handleCycleChange(lvl)}
                          className={`w-full text-left px-2 py-1 sm:py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                            formData.targetLevel === lvl
                              ? 'bg-blue-900 text-white font-bold shadow-2xs'
                              : 'text-slate-700 hover:bg-white bg-white/70'
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Selected summary pill */}
              <div className="p-2.5 rounded-xl bg-blue-50/80 border border-blue-200/80 flex items-center justify-between text-xs flex-wrap gap-1.5">
                <div>
                  <span className="text-slate-500 font-medium">Classe sélectionnée : </span>
                  <span className="font-bold text-blue-950">{formData.targetLevel}</span>
                </div>
                <span className="text-[10.5px] font-mono text-blue-900 bg-white px-2 py-0.5 rounded border border-blue-200 font-semibold">
                  Cycle : {formData.cycle}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            SECTION 4 : PIÈCES JUSTIFICATIVES & ENGAGEMENT
        ========================================================================= */}
        {currentStep === 4 && (
          <div className="space-y-2.5 sm:space-y-3 animate-fade-in">
            <div className="border-b border-slate-100 pb-2">
              <div className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-900 text-[11px] font-bold flex items-center justify-center">4</span>
                <h2 className="font-serif text-sm sm:text-base font-bold text-slate-900">
                  Pièces Justificatives & Engagement
                </h2>
              </div>
              <p className="text-[10.5px] sm:text-[11px] text-slate-500 mt-0.5">
                Cochez les pièces physiques que vous apporterez lors du rendez-vous d'admission.
              </p>
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2 text-xs">
                <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200/90 hover:bg-slate-50 bg-white cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.hasBirthCert}
                    onChange={(e) => handleFieldChange('hasBirthCert', e.target.checked)}
                    className="w-4 h-4 text-blue-900 rounded cursor-pointer"
                  />
                  <span className="text-[11px] sm:text-xs text-slate-800">Extrait d'acte de naissance original ou copie conforme</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200/90 hover:bg-slate-50 bg-white cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.hasReportCards}
                    onChange={(e) => handleFieldChange('hasReportCards', e.target.checked)}
                    className="w-4 h-4 text-blue-900 rounded cursor-pointer"
                  />
                  <span className="text-[11px] sm:text-xs text-slate-800">Bulletins scolaires des 2 dernières années</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200/90 hover:bg-slate-50 bg-white cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.hasPassCert}
                    onChange={(e) => handleFieldChange('hasPassCert', e.target.checked)}
                    className="w-4 h-4 text-blue-900 rounded cursor-pointer"
                  />
                  <span className="text-[11px] sm:text-xs text-slate-800">Certificat de passage officiel (si classe supérieure)</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200/90 hover:bg-slate-50 bg-white cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.hasIdPhotos}
                    onChange={(e) => handleFieldChange('hasIdPhotos', e.target.checked)}
                    className="w-4 h-4 text-blue-900 rounded cursor-pointer"
                  />
                  <span className="text-[11px] sm:text-xs text-slate-800">4 photos d'identité récentes</span>
                </label>
              </div>

              {/* Remarques particulières */}
              <div>
                <label className="block text-[11px] sm:text-xs font-bold text-slate-700 mb-0.5">
                  Observations particulières ou besoins spécifiques (facultatif)
                </label>
                <textarea
                  rows={2}
                  value={formData.specialNotes}
                  onChange={(e) => handleFieldChange('specialNotes', e.target.value)}
                  placeholder="Remarques éventuelles pour l'équipe pédagogique (centres d'intérêt, particularités médicales...)"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-slate-50/60 text-xs sm:text-sm focus:bg-white focus:border-blue-900 outline-none"
                />
              </div>

              {/* Consent Box with Real-time Error Display */}
              <div className={`p-2.5 rounded-xl border transition-all ${
                touched.consentGiven && errors.consentGiven 
                  ? 'bg-rose-50/60 border-rose-300' 
                  : 'bg-amber-50/60 border-amber-200/90'
              }`}>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.consentGiven}
                    onChange={(e) => handleFieldChange('consentGiven', e.target.checked)}
                    className="w-4 h-4 text-blue-900 rounded mt-0.5 cursor-pointer"
                  />
                  <span className="text-[10.5px] sm:text-[11px] text-slate-800 leading-tight">
                    Je certifie sur l'honneur l'exactitude des renseignements fournis ci-dessus et j'autorise la direction du <strong>Collège Isaac Newton</strong> à traiter ces données pour le suivi du dossier d'admission. *
                  </span>
                </label>
                {touched.consentGiven && errors.consentGiven && (
                  <p className="text-[10.5px] text-rose-600 font-semibold pl-6 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.consentGiven}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* WIZARD NAVIGATION CONTROLS - Compact with reduced mobile margins */}
        <div className="pt-2.5 mt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handlePrev}
              className="inline-flex items-center gap-1 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Précédent</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 sm:px-5 sm:py-2 rounded-lg bg-blue-900 hover:bg-blue-950 text-white text-xs font-bold transition-all shadow-2xs hover:shadow-xs active:scale-98 cursor-pointer"
            >
              <span>Continuer</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 sm:px-6 sm:py-2.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm shadow-xs transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-slate-950" />
              <span>{submitting ? 'Enregistrement en cours...' : 'Valider ma préinscription'}</span>
            </button>
          )}
        </div>

      </form>
    </div>
  );
};
