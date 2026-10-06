import React, { useState, useEffect } from 'react';
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
import { validateEmail, validatePhone, formatPhoneNumber } from '../utils/validation';

interface PreRegistrationPageProps {
  onNavigate: (page: string, subSection?: string) => void;
  subSection?: string;
}

export const PreRegistrationPage: React.FC<PreRegistrationPageProps> = ({ onNavigate, subSection }) => {
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
    targetLevel: subSection === 'prescolaire' ? 'Grande Section (GS)' : subSection === 'secondaire' ? 'Nouveau Secondaire 1 (NS1)' : '7ème Année Fondamentale (7e AF)',
    cycle: subSection === 'prescolaire' ? 'PRESCOLAIRE' : subSection === 'secondaire' ? 'SECONDAIRE' : 'FONDAMENTAL_CYCLE_3',
    hasBirthCert: true,
    hasReportCards: true,
    hasPassCert: false,
    hasIdPhotos: true,
    specialNotes: '',
    consentGiven: false,
  });

  // Pre-select target level based on incoming cycle navigation
  useEffect(() => {
    if (subSection === 'prescolaire') {
      setFormData(prev => ({ ...prev, cycle: 'PRESCOLAIRE', targetLevel: 'Grande Section (GS)' }));
    } else if (subSection === 'secondaire') {
      setFormData(prev => ({ ...prev, cycle: 'SECONDAIRE', targetLevel: 'Nouveau Secondaire 1 (NS1)' }));
    } else if (subSection === 'fondamental') {
      setFormData(prev => ({ ...prev, cycle: 'FONDAMENTAL_CYCLE_3', targetLevel: '7ème Année Fondamentale (7e AF)' }));
    }
  }, [subSection]);

  // Real-time validation state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [phoneCarrier, setPhoneCarrier] = useState<string | null>(null);
  const [emailSuggestion, setEmailSuggestion] = useState<string | null>(null);

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
        const res = validatePhone(String(value || ''));
        if (res.carrier) {
          setPhoneCarrier(res.carrier);
        }
        return res.isValid ? '' : (res.error || 'Numéro de téléphone invalide');
      }
      case 'parentEmail': {
        const res = validateEmail(String(value || ''));
        setEmailSuggestion(res.suggestion || null);
        return res.isValid ? '' : (res.error || 'Format d\'e-mail invalide');
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

  // Real-time update handler with smart auto-formatting
  const handleFieldChange = (field: keyof AdmissionFormData, value: any) => {
    let finalValue = value;
    if (field === 'parentPhone') {
      finalValue = formatPhoneNumber(String(value || ''));
    }

    setFormData(prev => ({ ...prev, [field]: finalValue }));
    setTouched(prev => ({ ...prev, [field]: true }));

    const errorMsg = validateSingleField(field, finalValue);
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

  // 1-Click Email Suggestion Fixer
  const applyEmailSuggestion = (suggestion: string) => {
    handleFieldChange('parentEmail', suggestion);
    setEmailSuggestion(null);
  };

  // 1-Click Phone Country Code Helper
  const applyPhonePrefix = (prefix: string) => {
    handleFieldChange('parentPhone', prefix);
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
      // Step 1: Informations de l'Élève Candidat
      const fields: (keyof AdmissionFormData)[] = ['studentLastName', 'studentFirstName', 'studentBirthDate'];
      fields.forEach(f => {
        stepTouched[f] = true;
        const err = validateSingleField(f, formData[f]);
        if (err) stepErrors[f] = err;
      });
    } else if (step === 2) {
      // Step 2: Responsable Légal (Parent / Tuteur)
      const fields: (keyof AdmissionFormData)[] = ['parentFullName', 'parentPhone', 'parentEmail', 'parentAddress'];
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
    const isStep1Valid = validateStep(1);
    const isStep2Valid = validateStep(2);
    const isStep3Valid = validateStep(3);
    const isStep4Valid = validateStep(4);

    if (!isStep1Valid) { setCurrentStep(1); window.scrollTo({ top: 60, behavior: 'smooth' }); return; }
    if (!isStep2Valid) { setCurrentStep(2); window.scrollTo({ top: 60, behavior: 'smooth' }); return; }
    if (!isStep3Valid) { setCurrentStep(3); window.scrollTo({ top: 60, behavior: 'smooth' }); return; }
    if (!isStep4Valid) { setCurrentStep(4); window.scrollTo({ top: 60, behavior: 'smooth' }); return; }

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

      {/* International-Standard Modern Stepper Progress Bar */}
      <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3 sm:p-4 shadow-2xs border border-slate-200/90 space-y-2.5">
        {/* Top Header: Step Counter & Progress Percentage Badge */}
        <div className="flex items-center justify-between gap-2 px-0.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-blue-900 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
              Étape {currentStep} sur 4
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-900 hidden xs:inline">
              {currentStep === 1 && '1. Identité de l’Élève Candidat'}
              {currentStep === 2 && '2. Responsable Légal (Parent / Tuteur)'}
              {currentStep === 3 && '3. Niveau Scolaire & Classe Souhaitée'}
              {currentStep === 4 && '4. Pièces Justificatives & Accord'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] sm:text-xs font-mono font-bold text-blue-900">
              {currentStep === 1 && '25%'}
              {currentStep === 2 && '50%'}
              {currentStep === 3 && '75%'}
              {currentStep === 4 && '100%'}
            </span>
            <div className="w-16 sm:w-28 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-900 via-indigo-800 to-blue-700 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(currentStep / 4) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Stepper Node Track with Interconnecting Line */}
        <div className="relative pt-1">
          {/* Continuous connecting track */}
          <div className="absolute top-4 sm:top-5 left-7 right-7 h-0.5 bg-slate-200 -z-0 hidden sm:block" />
          
          <div className="grid grid-cols-4 gap-1 sm:gap-2 relative z-10">
            {[
              { step: 1, label: 'Élève Candidat', sublabel: 'Identité & état civil', icon: GraduationCap },
              { step: 2, label: 'Responsable Légal', sublabel: 'Parent ou tuteur', icon: User },
              { step: 3, label: 'Niveau & Classe', sublabel: 'Cycle académique', icon: FileText },
              { step: 4, label: 'Pièces & Accord', sublabel: 'Validation finale', icon: ShieldCheck },
            ].map((item) => {
              const isCompleted = currentStep > item.step;
              const isCurrent = currentStep === item.step;
              const Icon = item.icon;

              return (
                <button
                  key={item.step}
                  type="button"
                  disabled={!isCompleted && !isCurrent}
                  onClick={() => {
                    if (isCompleted) {
                      setCurrentStep(item.step);
                    }
                  }}
                  className={`flex flex-col items-center text-center p-1 sm:p-1.5 rounded-xl transition-all ${
                    isCompleted ? 'hover:bg-slate-50 cursor-pointer' : isCurrent ? 'cursor-default' : 'cursor-not-allowed opacity-60'
                  }`}
                >
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isCompleted
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : isCurrent
                      ? 'bg-blue-900 text-white ring-4 ring-blue-100 shadow-sm scale-105'
                      : 'bg-slate-100 text-slate-400 border border-slate-200'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    ) : (
                      <Icon className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <span className={`mt-1 text-[10px] sm:text-xs font-bold truncate max-w-full ${
                    isCurrent ? 'text-blue-900' : isCompleted ? 'text-slate-700' : 'text-slate-400'
                  }`}>
                    {item.step}. {item.label}
                  </span>
                  <span className="hidden md:block text-[9.5px] text-slate-400 truncate max-w-full">
                    {item.sublabel}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Form Card - Dense, Ergonomic Spacing */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 lg:p-6 shadow-2xs border border-slate-200/90">
        
        {/* =========================================================================
            SECTION 1 : INFORMATIONS DE L'ÉLÈVE CANDIDAT (EN PREMIER)
        ========================================================================= */}
        {currentStep === 1 && (
          <div className="space-y-2.5 sm:space-y-3.5 animate-fade-in">
            <div className="border-b border-slate-100 pb-2 flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-900 text-[11px] font-bold flex items-center justify-center">1</span>
                  <h2 className="font-serif text-sm sm:text-base font-bold text-slate-900">
                    Informations de l’Élève Candidat
                  </h2>
                </div>
                <p className="text-[10.5px] sm:text-[11px] text-slate-500 mt-0.5">
                  Identité officielle et état civil de l'enfant à inscrire au Collège Isaac Newton.
                </p>
              </div>
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-900 text-[10.5px] font-bold border border-blue-200">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Candidat Principal</span>
              </span>
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

              {/* Sexe */}
              <div>
                <label className="block text-[11px] sm:text-xs font-bold text-slate-700 mb-0.5">
                  Sexe *
                </label>
                <div className="grid grid-cols-2 gap-1.5 mt-0.5">
                  <button
                    type="button"
                    onClick={() => handleFieldChange('studentGender', 'M')}
                    className={`py-1.5 px-2.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer text-center ${
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
                    className={`py-1.5 px-2.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer text-center ${
                      formData.studentGender === 'F' 
                        ? 'border-blue-900 bg-blue-900 text-white shadow-2xs' 
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50 bg-white'
                    }`}
                  >
                    Féminin (Fille)
                  </button>
                </div>
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
                  placeholder="Nom de l'école précédente (ex : Institution Saint-Louis, ou Première scolarisation...)"
                  className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg border border-slate-300 bg-slate-50/60 text-xs sm:text-sm focus:bg-white focus:border-blue-900 outline-none"
                />
              </div>

            </div>
          </div>
        )}

        {/* =========================================================================
            SECTION 2 : INFORMATIONS DU RESPONSABLE LÉGAL (PARENT / TUTEUR)
        ========================================================================= */}
        {currentStep === 2 && (
          <div className="space-y-2.5 sm:space-y-3.5 animate-fade-in">
            <div className="border-b border-slate-100 pb-2 flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-900 text-[11px] font-bold flex items-center justify-center">2</span>
                  <h2 className="font-serif text-sm sm:text-base font-bold text-slate-900">
                    Responsable Légal (Parent / Tuteur)
                  </h2>
                </div>
                <p className="text-[10.5px] sm:text-[11px] text-slate-500 mt-0.5">
                  Coordonnées du souscripteur légal qui recevra la convocation et le suivi d'admission.
                </p>
              </div>
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10.5px] font-bold border border-slate-200">
                <User className="w-3.5 h-3.5 text-blue-900" />
                <span>Souscripteur</span>
              </span>
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
                    <span className="text-[10px] text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full flex items-center gap-0.5 font-bold border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {phoneCarrier || 'Format Valide'}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="tel"
                    value={formData.parentPhone}
                    onChange={(e) => handleFieldChange('parentPhone', e.target.value)}
                    onBlur={() => handleFieldBlur('parentPhone')}
                    placeholder="+509 3700-0000"
                    className={`${getInputClasses('parentPhone')} font-mono`}
                  />
                </div>

                {/* Quick Prefix buttons */}
                <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-500">
                  <span className="text-[9.5px]">Préfixes :</span>
                  <button
                    type="button"
                    onClick={() => applyPhonePrefix('+509 ')}
                    className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 font-mono text-slate-700 cursor-pointer"
                  >
                    +509 (Haïti)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPhonePrefix('+1 ')}
                    className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 font-mono text-slate-700 cursor-pointer"
                  >
                    +1 (Diaspora)
                  </button>
                </div>

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
                    <span className="text-[10px] text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full flex items-center gap-0.5 font-bold border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> E-mail Vérifié
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

                {/* Real-time Typo Suggestion Helper */}
                {emailSuggestion && (
                  <div className="mt-1 p-2 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-between text-[11px] text-amber-900 animate-fade-in shadow-2xs">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>Vouliez-vous dire <strong>{emailSuggestion}</strong> ?</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => applyEmailSuggestion(emailSuggestion)}
                      className="px-2 py-0.5 rounded-md bg-amber-200 hover:bg-amber-300 font-bold text-[10px] text-amber-950 transition-colors cursor-pointer"
                    >
                      Corriger
                    </button>
                  </div>
                )}

                {touched.parentEmail && errors.parentEmail && (
                  <p className="text-[10.5px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.parentEmail}</span>
                  </p>
                )}
                {!errors.parentEmail && (
                  <p className="text-[9.5px] text-slate-400 mt-0.5">
                    La convocation et le récapitulatif PDF seront envoyés ici.
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
