import React, { useState } from 'react';
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
  Sparkles,
  Info
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
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const updateField = (field: keyof AdmissionFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

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
    setFormData(prev => ({ ...prev, targetLevel: level, cycle }));
  };

  const validateStep = (step: number): boolean => {
    const errs: Record<string, string> = {};

    if (step === 1) {
      if (!formData.parentFullName.trim()) errs.parentFullName = 'Nom complet requis';
      if (!formData.parentPhone.trim()) errs.parentPhone = 'Téléphone joignable requis';
      if (!formData.parentEmail.trim() || !formData.parentEmail.includes('@')) {
        errs.parentEmail = 'Email valide requis';
      }
      if (!formData.parentAddress.trim()) errs.parentAddress = 'Adresse requise';
    } else if (step === 2) {
      if (!formData.studentLastName.trim()) errs.studentLastName = 'Nom de famille requis';
      if (!formData.studentFirstName.trim()) errs.studentFirstName = 'Prénom requis';
      if (!formData.studentBirthDate.trim()) errs.studentBirthDate = 'Date de naissance requise';
    } else if (step === 3) {
      if (!formData.targetLevel.trim()) errs.targetLevel = 'Sélectionnez un niveau';
    } else if (step === 4) {
      if (!formData.consentGiven) {
        errs.consentGiven = 'Veuillez certifier l’exactitude et accepter la politique de confidentialité';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 80, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => prev - 1);
    window.scrollTo({ top: 80, behavior: 'smooth' });
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

  // SUCCESS CONFIRMATION SCREEN - Compact & Clear
  if (submittedNumber) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-10 animate-in fade-in duration-200">
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-slate-200/80 text-center space-y-5">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-0.5 rounded-full border border-emerald-200">
              Dossier enregistré avec succès
            </span>
            <h1 className="font-serif text-2xl font-bold text-slate-900 mt-2">
              Demande de Préinscription Transmise
            </h1>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              Le dossier pour <strong className="text-slate-800">{formData.studentFirstName} {formData.studentLastName}</strong> ({formData.targetLevel}) a bien été réceptionné par le secrétariat.
            </p>
          </div>

          {/* Dossier Code Box */}
          <div className="p-4 sm:p-5 rounded-xl bg-slate-900 text-white max-w-sm mx-auto">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">Référence unique de dossier</p>
            <div className="font-mono text-2xl font-bold tracking-wider text-amber-400 mt-0.5">
              {submittedNumber}
            </div>
            <button
              onClick={copyToClipboard}
              className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-slate-200 transition-colors cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? 'Copié !' : 'Copier la référence'}</span>
            </button>
          </div>

          {/* Next steps card */}
          <div className="text-left bg-slate-50 rounded-xl p-4 border border-slate-200/70 space-y-2 text-xs text-slate-700">
            <h3 className="font-serif font-bold text-xs text-slate-900 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-900" />
              <span>Étapes suivantes :</span>
            </h3>
            <ol className="list-decimal pl-4 space-y-1 leading-relaxed text-slate-600">
              <li>
                <strong>Étude sous 48-72h :</strong> Le secrétariat examine les informations fournies.
              </li>
              <li>
                <strong>Convocation :</strong> Rendez-vous pour le test diagnostique (français & mathématiques).
              </li>
              <li>
                <strong>Entretien final :</strong> Dépôt des pièces physiques et validation d'inscription.
              </li>
            </ol>
            <div className="pt-2 flex items-center gap-2 text-slate-500 font-mono text-[11px] border-t border-slate-200/60">
              <Phone className="w-3 h-3 text-slate-400" />
              <span>Ligne directe secrétariat : {SCHOOL_INFO.phone}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
            <button
              onClick={() => window.print()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimer le récépissé</span>
            </button>

            <button
              onClick={() => onNavigate('home')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-xl bg-blue-900 hover:bg-blue-950 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              <span>Retour à l'accueil</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // WIZARD FORM - Compact, Dense & Ergonomic Rhythm
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3.5 sm:py-5 space-y-3 sm:space-y-3.5">
      
      {/* Header - Compact */}
      <div className="text-center max-w-xl mx-auto space-y-0.5">
        <span className="text-[10px] font-bold uppercase tracking-widest text-blue-900 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
          Admissions Officielles {SCHOOL_INFO.currentYear}
        </span>
        <h1 className="font-serif text-xl sm:text-2xl font-bold text-slate-900">
          Préinscription en Ligne
        </h1>
        <p className="text-[11px] sm:text-xs text-slate-600">
          Processus rapide en 4 étapes pour réserver la place de votre enfant.
        </p>
      </div>

      {/* Stepper Progress Bar - Compact & Responsive */}
      <div className="bg-white rounded-xl p-2 sm:p-2.5 shadow-2xs border border-slate-200/80">
        <div className="grid grid-cols-4 gap-1 text-center text-xs">
          {[
            { step: 1, label: 'Parent / Tuteur', icon: User },
            { step: 2, label: 'Élève', icon: GraduationCap },
            { step: 3, label: 'Niveau & Classe', icon: FileText },
            { step: 4, label: 'Pièces & Accord', icon: ShieldCheck },
          ].map((item) => {
            const isCompleted = currentStep > item.step;
            const isCurrent = currentStep === item.step;
            const Icon = item.icon;

            return (
              <div key={item.step} className="flex flex-col items-center">
                <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${
                  isCompleted 
                    ? 'bg-emerald-600 text-white' 
                    : isCurrent 
                    ? 'bg-blue-900 text-white ring-2 ring-blue-100' 
                    : 'bg-slate-100 text-slate-400'
                }`}>
                  {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Icon className="w-3 h-3" />}
                </div>
                <span className={`mt-0.5 hidden sm:block text-[10px] sm:text-[11px] font-semibold truncate ${
                  isCurrent ? 'text-blue-900' : 'text-slate-500'
                }`}>
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Card - Dense, Ergonomic Spacing */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-3.5 sm:p-5 shadow-xs border border-slate-200/80">
        
        {/* STEP 1: PARENT / TUTEUR */}
        {currentStep === 1 && (
          <div className="space-y-3">
            <div className="border-b border-slate-100 pb-2">
              <h2 className="font-serif text-base font-bold text-slate-900">
                1. Responsable Légal
              </h2>
              <p className="text-[11px] text-slate-500">
                Coordonnées du tuteur qui recevra les notifications administratives.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
              <div className="sm:col-span-2 lg:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nom et prénom du responsable *
                </label>
                <input
                  type="text"
                  value={formData.parentFullName}
                  onChange={(e) => updateField('parentFullName', e.target.value)}
                  placeholder="Ex : Jean-Claude Baptiste"
                  className={`w-full px-3 py-2 rounded-lg border text-xs sm:text-sm outline-none transition-all ${
                    errors.parentFullName ? 'border-red-400 bg-red-50/30' : 'border-slate-300 focus:border-blue-900 focus:ring-1 focus:ring-blue-900'
                  }`}
                />
                {errors.parentFullName && (
                  <p className="text-[10px] text-red-600 mt-0.5">{errors.parentFullName}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Lien de parenté *
                </label>
                <select
                  value={formData.parentRelationship}
                  onChange={(e) => updateField('parentRelationship', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm focus:border-blue-900 focus:ring-1 focus:ring-blue-900 outline-none bg-white cursor-pointer"
                >
                  <option value="Père">Père</option>
                  <option value="Mère">Mère</option>
                  <option value="Tuteur légal">Tuteur légal</option>
                  <option value="Autre proche">Autre proche</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Téléphone joignable *
                </label>
                <input
                  type="tel"
                  value={formData.parentPhone}
                  onChange={(e) => updateField('parentPhone', e.target.value)}
                  placeholder="+509 3700-0000"
                  className={`w-full px-3 py-2 rounded-lg border text-xs sm:text-sm outline-none transition-all ${
                    errors.parentPhone ? 'border-red-400 bg-red-50/30' : 'border-slate-300 focus:border-blue-900 focus:ring-1 focus:ring-blue-900'
                  }`}
                />
                {errors.parentPhone && (
                  <p className="text-[10px] text-red-600 mt-0.5">{errors.parentPhone}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Adresse e-mail valide *
                </label>
                <input
                  type="email"
                  value={formData.parentEmail}
                  onChange={(e) => updateField('parentEmail', e.target.value)}
                  placeholder="parent@example.com"
                  className={`w-full px-3 py-2 rounded-lg border text-xs sm:text-sm outline-none transition-all ${
                    errors.parentEmail ? 'border-red-400 bg-red-50/30' : 'border-slate-300 focus:border-blue-900 focus:ring-1 focus:ring-blue-900'
                  }`}
                />
                {errors.parentEmail && (
                  <p className="text-[10px] text-red-600 mt-0.5">{errors.parentEmail}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Profession du responsable
                </label>
                <input
                  type="text"
                  value={formData.parentOccupation}
                  onChange={(e) => updateField('parentOccupation', e.target.value)}
                  placeholder="Ex : Enseignant, Cadre, Artisan"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm focus:border-blue-900 outline-none"
                />
              </div>

              <div className="sm:col-span-2 lg:col-span-3">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Adresse de résidence *
                </label>
                <input
                  type="text"
                  value={formData.parentAddress}
                  onChange={(e) => updateField('parentAddress', e.target.value)}
                  placeholder="Numéro, rue, quartier, commune (Ex : Delmas 50, Delmas 33...)"
                  className={`w-full px-3 py-2 rounded-lg border text-xs sm:text-sm outline-none transition-all ${
                    errors.parentAddress ? 'border-red-400 bg-red-50/30' : 'border-slate-300 focus:border-blue-900 focus:ring-1 focus:ring-blue-900'
                  }`}
                />
                {errors.parentAddress && (
                  <p className="text-[10px] text-red-600 mt-0.5">{errors.parentAddress}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: ÉLÈVE */}
        {currentStep === 2 && (
          <div className="space-y-3">
            <div className="border-b border-slate-100 pb-2">
              <h2 className="font-serif text-base font-bold text-slate-900">
                2. Informations de l’Élève
              </h2>
              <p className="text-[11px] text-slate-500">
                État civil officiel de l'enfant candidat à l'admission.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nom de famille de l'élève *
                </label>
                <input
                  type="text"
                  value={formData.studentLastName}
                  onChange={(e) => updateField('studentLastName', e.target.value)}
                  placeholder="Ex : Baptiste"
                  className={`w-full px-3 py-1.5 rounded-lg border text-xs sm:text-sm outline-none transition-all ${
                    errors.studentLastName ? 'border-red-400 bg-red-50/30' : 'border-slate-300 focus:border-blue-900 focus:ring-1 focus:ring-blue-900'
                  }`}
                />
                {errors.studentLastName && (
                  <p className="text-[10px] text-red-600 mt-0.5">{errors.studentLastName}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Prénom(s) de l'élève *
                </label>
                <input
                  type="text"
                  value={formData.studentFirstName}
                  onChange={(e) => updateField('studentFirstName', e.target.value)}
                  placeholder="Ex : Alexandre"
                  className={`w-full px-3 py-1.5 rounded-lg border text-xs sm:text-sm outline-none transition-all ${
                    errors.studentFirstName ? 'border-red-400 bg-red-50/30' : 'border-slate-300 focus:border-blue-900 focus:ring-1 focus:ring-blue-900'
                  }`}
                />
                {errors.studentFirstName && (
                  <p className="text-[10px] text-red-600 mt-0.5">{errors.studentFirstName}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Date de naissance *
                </label>
                <input
                  type="date"
                  value={formData.studentBirthDate}
                  onChange={(e) => updateField('studentBirthDate', e.target.value)}
                  className={`w-full px-3 py-1.5 rounded-lg border text-xs sm:text-sm outline-none transition-all ${
                    errors.studentBirthDate ? 'border-red-400 bg-red-50/30' : 'border-slate-300 focus:border-blue-900 focus:ring-1 focus:ring-blue-900'
                  }`}
                />
                {errors.studentBirthDate && (
                  <p className="text-[10px] text-red-600 mt-0.5">{errors.studentBirthDate}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Sexe *
                </label>
                <div className="grid grid-cols-2 gap-2 mt-0.5">
                  <button
                    type="button"
                    onClick={() => updateField('studentGender', 'M')}
                    className={`py-1.5 px-3 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                      formData.studentGender === 'M' 
                        ? 'border-blue-900 bg-blue-900 text-white' 
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Masculin (Garçon)
                  </button>
                  <button
                    type="button"
                    onClick={() => updateField('studentGender', 'F')}
                    className={`py-1.5 px-3 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                      formData.studentGender === 'F' 
                        ? 'border-blue-900 bg-blue-900 text-white' 
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Féminin (Fille)
                  </button>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Établissement scolaire précédent (si applicable)
                </label>
                <input
                  type="text"
                  value={formData.previousSchool}
                  onChange={(e) => updateField('previousSchool', e.target.value)}
                  placeholder="Nom de la précédente école fréquentée"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs sm:text-sm focus:border-blue-900 outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: NIVEAU & CLASSE - Compact Responsive Selector */}
        {currentStep === 3 && (
          <div className="space-y-3">
            <div className="border-b border-slate-100 pb-2">
              <h2 className="font-serif text-base font-bold text-slate-900">
                3. Niveau Scolaire Souhaité
              </h2>
              <p className="text-[11px] text-slate-500">
                Sélectionnez la classe visée pour l'année {formData.schoolYear}.
              </p>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                    <p className="text-[11px] font-bold text-blue-900 uppercase tracking-wider">{cat.group}</p>
                    <div className="space-y-1">
                      {cat.levels.map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => handleCycleChange(lvl)}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                            formData.targetLevel === lvl
                              ? 'bg-blue-900 text-white font-bold shadow-xs'
                              : 'text-slate-700 hover:bg-white bg-white/60'
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
              <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-200/80 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500 font-medium">Classe sélectionnée : </span>
                  <span className="font-bold text-blue-950">{formData.targetLevel}</span>
                </div>
                <span className="text-[11px] font-mono text-blue-800 bg-white px-2 py-0.5 rounded border border-blue-200 font-semibold">
                  Cycle : {formData.cycle}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: PIÈCES & ACCORD */}
        {currentStep === 4 && (
          <div className="space-y-3">
            <div className="border-b border-slate-100 pb-2">
              <h2 className="font-serif text-base font-bold text-slate-900">
                4. Pièces Justificatives & Engagement
              </h2>
              <p className="text-[11px] text-slate-500">
                Vérifiez les pièces à fournir lors du dépôt physique au secrétariat.
              </p>
            </div>

            <div className="space-y-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <label className="flex items-center gap-2.5 p-2 rounded-lg border border-slate-200/80 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.hasBirthCert}
                    onChange={(e) => updateField('hasBirthCert', e.target.checked)}
                    className="w-4 h-4 text-blue-900 rounded"
                  />
                  <span className="text-[11px] sm:text-xs">Extrait d'acte de naissance original ou copie légalisée</span>
                </label>

                <label className="flex items-center gap-2.5 p-2 rounded-lg border border-slate-200/80 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.hasReportCards}
                    onChange={(e) => updateField('hasReportCards', e.target.checked)}
                    className="w-4 h-4 text-blue-900 rounded"
                  />
                  <span className="text-[11px] sm:text-xs">Bulletins scolaires des 2 dernières années</span>
                </label>

                <label className="flex items-center gap-2.5 p-2 rounded-lg border border-slate-200/80 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.hasPassCert}
                    onChange={(e) => updateField('hasPassCert', e.target.checked)}
                    className="w-4 h-4 text-blue-900 rounded"
                  />
                  <span className="text-[11px] sm:text-xs">Certificat de passage officiel (si classe supérieure)</span>
                </label>

                <label className="flex items-center gap-2.5 p-2 rounded-lg border border-slate-200/80 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.hasIdPhotos}
                    onChange={(e) => updateField('hasIdPhotos', e.target.checked)}
                    className="w-4 h-4 text-blue-900 rounded"
                  />
                  <span className="text-[11px] sm:text-xs">4 photos d'identité récentes</span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Observations particulières (facultatif)
                </label>
                <textarea
                  rows={2}
                  value={formData.specialNotes}
                  onChange={(e) => updateField('specialNotes', e.target.value)}
                  placeholder="Besoins spécifiques, centres d'intérêt, remarques pour l'équipe pédagogique..."
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs sm:text-sm focus:border-blue-900 outline-none"
                />
              </div>

              {/* Consent Box */}
              <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.consentGiven}
                    onChange={(e) => updateField('consentGiven', e.target.checked)}
                    className="w-4 h-4 text-blue-900 rounded mt-0.5"
                  />
                  <span className="text-[11px] text-slate-800 leading-tight">
                    Je certifie l'exactitude des renseignements et j'autorise le Collège Isaac Newton à traiter ces données pour le suivi du dossier d'admission. *
                  </span>
                </label>
                {errors.consentGiven && (
                  <p className="text-[10px] text-red-600 font-semibold pl-6 mt-1">{errors.consentGiven}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* WIZARD NAVIGATION CONTROLS - Compact */}
        <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handlePrev}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
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
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-blue-900 hover:bg-blue-950 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
            >
              <span>Continuer</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm shadow transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
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
