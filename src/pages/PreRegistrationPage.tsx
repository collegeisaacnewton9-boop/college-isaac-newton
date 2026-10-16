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
  Sparkles,
  MessageCircle,
  Share2,
  ExternalLink,
  Send,
  Check,
  X
} from 'lucide-react';
import { AdmissionFormData, AcademicCycle, AdmissionApplication } from '../types';
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

  // Dynamic Direction WhatsApp Configuration from Settings / Database
  const [directionPhone, setDirectionPhone] = useState<string>(() => {
    return localStorage.getItem('cin_direction_wa_phone') || '+509 3316-0934';
  });
  const [directionPhoneClean, setDirectionPhoneClean] = useState<string>(() => {
    const raw = (localStorage.getItem('cin_direction_wa_phone') || '50933160934').replace(/[^0-9]/g, '');
    return raw.startsWith('509') ? raw : `509${raw}`;
  });
  const [directionHolderName, setDirectionHolderName] = useState<string>('Orphe Jean Marie · Directeur fondateur');
  const [createdAdmission, setCreatedAdmission] = useState<AdmissionApplication | null>(null);
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [isAlertTransmitted, setIsAlertTransmitted] = useState(false);
  const [popupBlocked, setPopupBlocked] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState(false);

  // Synchronize planned Direction WhatsApp configuration from API / Database
  useEffect(() => {
    apiService.getSettings().then(setts => {
      if (setts?.whatsappConfig) {
        const phone = setts.whatsappConfig.directionPhone || '+509 3316-0934';
        const rawClean = setts.whatsappConfig.directionPhoneClean || phone.replace(/[^0-9]/g, '');
        const clean = rawClean.startsWith('509') ? rawClean : `509${rawClean}`;
        setDirectionPhone(phone);
        setDirectionPhoneClean(clean);
        if (setts.whatsappConfig.holderName) {
          setDirectionHolderName(setts.whatsappConfig.holderName);
        }
        localStorage.setItem('cin_direction_wa_phone', phone);
      }
    }).catch(() => {});
  }, []);

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
      // Step 4: Consentement & Pièces obligatoires
      stepTouched.consentGiven = true;
      stepTouched.hasBirthCert = true;
      stepTouched.hasIdPhotos = true;
      const err = validateSingleField('consentGiven', formData.consentGiven);
      if (err) stepErrors.consentGiven = err;

      if (!formData.hasBirthCert) {
        stepErrors.hasBirthCert = "L'extrait d'acte de naissance est obligatoire pour finaliser l'inscription définitive";
      }
      if (!formData.hasIdPhotos) {
        stepErrors.hasIdPhotos = "Les 4 photos d'identité sont obligatoires pour finaliser l'inscription définitive";
      }
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
      setCreatedAdmission(created);
      setShowDispatchModal(true);

      // Auto-trigger WhatsApp dispatch to the planned Direction number
      handleLaunchWhatsApp(created.applicationNumber, formData, created.id);
    } catch {
      alert("Une erreur est survenue lors de l'enregistrement. Vos données locales ont été préservées.");
    } finally {
      setSubmitting(false);
    }
  };

  const buildWhatsAppMessageText = (appNum: string, data: AdmissionFormData) => {
    return (
      `*NOUVELLE PRÉINSCRIPTION — COLLÈGE ISAAC NEWTON*\n\n` +
      `📋 *Dossier :* ${appNum}\n` +
      `👤 *Élève :* ${data.studentLastName.toUpperCase()} ${data.studentFirstName}\n` +
      `🎯 *Classe demandée :* ${data.targetLevel} (${data.cycle})\n` +
      `🎂 *Date de Naissance :* ${data.studentBirthDate}\n` +
      `👨‍👩‍👧 *Parent / Responsable :* ${data.parentFullName} (${data.parentRelationship})\n` +
      `📞 *Téléphone Parent :* ${data.parentPhone}\n` +
      `📧 *E-mail :* ${data.parentEmail || 'Non renseigné'}\n` +
      `🏫 *École précédente :* ${data.previousSchool || 'Non renseignée'}\n\n` +
      `Bonjour Direction, je viens d'enregistrer la préinscription de mon enfant sur le portail officiel du Collège Isaac Newton. Je vous transmets ma référence pour l'ouverture du dossier et la convocation au test. Merci !`
    );
  };

  const handleLaunchWhatsApp = (appNum: string, data: AdmissionFormData, recordId?: string) => {
    const text = buildWhatsAppMessageText(appNum, data);
    const targetClean = directionPhoneClean || '50933160934';
    const url = `https://wa.me/${targetClean}?text=${encodeURIComponent(text)}`;
    let isBlocked = false;
    try {
      const win = window.open(url, '_blank');
      if (!win || win.closed || typeof win.closed === 'undefined') {
        setPopupBlocked(true);
        isBlocked = true;
      } else {
        setPopupBlocked(false);
      }
    } catch {
      setPopupBlocked(true);
      isBlocked = true;
    }
    setIsAlertTransmitted(true);

    // Enregistrer l'événement technique dans le journal WhatsApp
    apiService.logWhatsAppEvent({
      type: 'PRE_REGISTRATION_ALERT',
      recipientRole: 'DIRECTION',
      recipientPhone: directionPhone || '+509 3316-0934',
      applicationNumber: appNum,
      studentName: `${data.studentLastName.toUpperCase()} ${data.studentFirstName}`,
      status: isBlocked ? 'BLOCKED_POPUP' : 'SUCCESS_DEEP_LINK',
      details: isBlocked 
        ? `L'ouverture automatique vers le Directeur (${targetClean}) a été bloquée par le navigateur. Clic direct requis sur le bouton.`
        : `Lien WhatsApp ouvert avec succès vers le Directeur (${targetClean}).`,
      diagnosticNotes: isBlocked 
        ? `Contrainte de sécurité du navigateur client (popup bloqué post-requête asynchrone).`
        : `L'application WhatsApp a été lancée avec le message pré-rempli.`,
      messagePreview: text.slice(0, 160) + '...',
    }).catch(() => {});

    if (recordId) {
      apiService.notifyAdmissionWhatsApp(recordId).catch(() => {});
    }
  };

  const handleSendReceiptToParentWhatsApp = () => {
    if (!submittedNumber) return;
    const parentDigits = (formData.parentPhone || '').replace(/[^0-9]/g, '');
    const parentClean = parentDigits.startsWith('509') ? parentDigits : (parentDigits.length === 8 ? `509${parentDigits}` : parentDigits);

    const parentReceiptText = 
      `*RÉCÉPISSÉ DE PRÉINSCRIPTION — COLLÈGE ISAAC NEWTON*\n\n` +
      `📋 *N° de Dossier :* ${submittedNumber}\n` +
      `👤 *Élève :* ${formData.studentLastName.toUpperCase()} ${formData.studentFirstName}\n` +
      `🎯 *Classe demandée :* ${formData.targetLevel} (${formData.cycle})\n` +
      `👨‍👩‍👧 *Responsable légal :* ${formData.parentFullName} (${formData.parentRelationship})\n` +
      `📞 *Contact :* ${formData.parentPhone}\n\n` +
      `⚠️ *RAPPEL FORMEL — PIÈCES PHYSIQUES OBLIGATOIRES POUR FINALISER L'INSCRIPTION :*\n` +
      `1. Extrait d'acte de naissance (Original ou extrait légalisé conforme) [OBLIGATOIRE]\n` +
      `2. 4 photos d'identité récentes identiques format passeport [OBLIGATOIRE]\n` +
      `3. Bulletins scolaires des 2 dernières années [OBLIGATOIRE dès 1e AF]\n` +
      `4. Certificat de passage officiel (si classe supérieure)\n` +
      `5. Fiche vaccinale/médicale & Pièce d'identité du tuteur [OBLIGATOIRE]\n\n` +
      `📍 *Dépôt physique :* Secrétariat Collège Isaac Newton, Delmas 50, rue Dominique #2 bis, Port-au-Prince.\n` +
      `📞 *Direction :* ${directionPhone} · *Secrétariat :* ${SCHOOL_INFO.phone}\n` +
      `La préinscription en ligne bloque votre place temporairement. L'inscription définitive sera officialisée lors du dépôt de ces pièces.`;

    const parentUrl = `https://wa.me/${parentClean}?text=${encodeURIComponent(parentReceiptText)}`;
    window.open(parentUrl, '_blank');

    apiService.logWhatsAppEvent({
      type: 'PARENT_RECEIPT',
      recipientRole: 'PARENT',
      recipientPhone: formData.parentPhone,
      applicationNumber: submittedNumber,
      studentName: `${formData.studentLastName.toUpperCase()} ${formData.studentFirstName}`,
      status: 'SUCCESS_DEEP_LINK',
      details: `Récépissé et liste des pièces obligatoires expédiés vers le WhatsApp du parent (${formData.parentPhone}).`,
      diagnosticNotes: `Transmission directe au tuteur légal avec le rappel des 5 pièces physiques requises.`,
      messagePreview: parentReceiptText.slice(0, 160) + '...',
    }).catch(() => {});
  };

  const copyWhatsAppMessage = () => {
    if (!submittedNumber) return;
    const text = buildWhatsAppMessageText(submittedNumber, formData);
    navigator.clipboard.writeText(text);
    setCopiedMsg(true);
    setTimeout(() => setCopiedMsg(false), 2500);
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
    const plannedText = buildWhatsAppMessageText(submittedNumber, formData);

    return (
      <div className="max-w-2xl mx-auto px-3 sm:px-4 py-6 sm:py-10 animate-fade-in relative">
        
        {/* =========================================================================
            MODAL D'ALERTE IMMÉDIATE WHATSAPP À LA DIRECTION (DISPATCH INSTANTANÉ)
        ========================================================================= */}
        {showDispatchModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-lg w-full p-4 sm:p-6 shadow-2xl border-2 border-emerald-400/90 text-left space-y-4 animate-in fade-in zoom-in-95 duration-200">
              
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-serif text-base sm:text-lg font-bold text-slate-900 leading-snug">
                      Transmission WhatsApp à la Direction
                    </h2>
                    <p className="text-[11px] text-emerald-800 font-medium">
                      Ligne officielle planifiée : <strong>{directionPhone}</strong>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDispatchModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Fermer et consulter le récépissé"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Dossier recap badge */}
              <div className="p-3 rounded-xl bg-slate-900 text-white flex items-center justify-between text-xs">
                <div>
                  <span className="text-[9.5px] uppercase font-mono text-slate-400 block">Dossier créé</span>
                  <span className="font-mono text-base font-bold text-amber-400">{submittedNumber}</span>
                </div>
                <div className="text-right">
                  <span className="text-[9.5px] uppercase text-slate-400 block">Candidat</span>
                  <span className="font-bold text-slate-100">{formData.studentLastName.toUpperCase()} {formData.studentFirstName}</span>
                </div>
              </div>

              {/* Explanation of Web WhatsApp behavior */}
              <div className="text-[11px] sm:text-xs text-slate-600 space-y-1.5 leading-relaxed bg-emerald-50/70 p-3 rounded-xl border border-emerald-200/80">
                <p>
                  <strong>ℹ️ Information importante :</strong> Les navigateurs web ne peuvent pas envoyer de message de manière invisible depuis votre appareil sans votre validation.
                </p>
                <p>
                  Pour que le <strong>Directeur ({directionHolderName})</strong> reçoive immédiatement l'alerte sur son numéro planifié, <strong>cliquez sur le bouton vert ci-dessous pour ouvrir WhatsApp avec le message officiel pré-rempli</strong>, puis appuyez sur « Envoyer ».
                </p>
              </div>

              {popupBlocked && (
                <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-300 text-[11px] text-amber-900 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    Votre navigateur a bloqué l'ouverture automatique. Cliquez sur le bouton vert ci-dessous pour ouvrir WhatsApp directement vers le {directionPhone}.
                  </span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleLaunchWhatsApp(submittedNumber, formData, createdAdmission?.id)}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 shrink-0" />
                  <span>Ouvrir WhatsApp & Envoyer à la Direction ({directionPhone})</span>
                </button>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={copyWhatsAppMessage}
                    className="py-2 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>{copiedMsg ? 'Texte Copié !' : 'Copier le texte'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowDispatchModal(false)}
                    className="py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Voir le récépissé</span>
                  </button>
                </div>

                {formData.parentPhone && (
                  <button
                    type="button"
                    onClick={handleSendReceiptToParentWhatsApp}
                    className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-950 text-white font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Recevoir aussi le récépissé & pièces obligatoires sur mon WhatsApp ({formData.parentPhone})</span>
                  </button>
                )}
              </div>

            </div>
          </div>
        )}

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

          {/* =========================================================================
              NOTIFICATION WHATSAPP AU NUMÉRO PLANIFIÉ DE LA DIRECTION
          ========================================================================= */}
          <div className="text-left bg-gradient-to-r from-emerald-50 via-teal-50/70 to-emerald-50 rounded-2xl p-4 sm:p-5 border-2 border-emerald-400/90 shadow-sm space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                    Ligne WhatsApp Officielle de la Direction : {directionPhone}
                  </h3>
                  <span className={`px-2 py-0.5 rounded-full text-[9.5px] font-bold border ${
                    isAlertTransmitted
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-amber-100 text-amber-800 border-amber-300'
                  }`}>
                    {isAlertTransmitted ? '✓ Alerte WhatsApp envoyée' : '⚡ Action immédiate requise'}
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-600 mt-1 leading-relaxed">
                  Numéro certifié de la Direction : <strong>{directionPhone}</strong> ({directionHolderName}). 
                  Sur le web, vous devez ouvrir WhatsApp pour délivrer le message directement au Directeur et obtenir une date d'entretien en priorité.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleLaunchWhatsApp(submittedNumber, formData, createdAdmission?.id)}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all hover:scale-[1.01] cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 shrink-0" />
                <span>{isAlertTransmitted ? 'Renvoyer le Dossier à la Direction' : 'Envoyer mon Dossier à la Direction'}</span>
              </button>

              <button
                type="button"
                onClick={copyWhatsAppMessage}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-200 transition-colors cursor-pointer"
                title="Copier le texte pour coller sur WhatsApp"
              >
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>{copiedMsg ? 'Copié !' : 'Copier Message'}</span>
              </button>

              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  `*RÉCÉPISSÉ DE PRÉINSCRIPTION — COLLÈGE ISAAC NEWTON*\n\n` +
                  `📋 *N° de Dossier :* ${submittedNumber}\n` +
                  `👤 *Élève :* ${formData.studentFirstName} ${formData.studentLastName}\n` +
                  `🎯 *Classe :* ${formData.targetLevel}\n` +
                  `📍 *Secrétariat :* Delmas 50, rue Dominique #2 bis, Port-au-Prince\n` +
                  `📞 *Secrétariat Général :* ${directionPhone} / +509 3721-1818\n\n` +
                  `Dossier préinscrit avec succès. Présenter les pièces physiques requises pour finaliser l'admission.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-200 transition-colors cursor-pointer"
                title="Partager à un proche ou tuteur"
              >
                <Share2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Partager</span>
              </a>

              {formData.parentPhone && (
                <button
                  type="button"
                  onClick={handleSendReceiptToParentWhatsApp}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-950 text-white font-semibold text-xs transition-colors cursor-pointer"
                  title="Recevoir le récépissé et les pièces requises sur votre WhatsApp"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Recevoir sur mon WhatsApp ({formData.parentPhone})</span>
                </button>
              )}
            </div>
          </div>

          {/* =========================================================================
              RAPPEL FORMEL & SOLENNEL : PIÈCES PHYSIQUES OBLIGATOIRES POUR FINALISER L'INSCRIPTION
          ========================================================================= */}
          <div className="text-left bg-gradient-to-br from-amber-50 via-amber-100/40 to-amber-50 rounded-2xl p-4 sm:p-5 border-2 border-amber-400 shadow-sm space-y-3 text-xs text-amber-950">
            <div className="flex items-center justify-between gap-2 flex-wrap border-b border-amber-200 pb-2.5">
              <div className="flex items-center gap-2 text-amber-950 font-bold text-xs sm:text-sm">
                <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0" />
                <span>RAPPEL FORMEL : PIÈCES PHYSIQUES OBLIGATOIRES POUR FINALISER L'INSCRIPTION</span>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-amber-300 text-amber-950 border border-amber-400 font-mono">
                DÉPÔT OBLIGATOIRE
              </span>
            </div>

            <p className="text-[11.5px] sm:text-xs text-amber-950 leading-relaxed font-medium">
              La préinscription en ligne réserve temporairement une priorité. <strong>L'inscription définitive sera officialisée et la place attribuée exclusivement sur présentation physique de l'ensemble des pièces obligatoires</strong> au secrétariat du Collège Isaac Newton (Delmas 50, rue Dominique #2 bis, Port-au-Prince) :
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-slate-800">
              
              {/* 1. Acte de naissance */}
              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white border border-amber-200 shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <strong className="text-xs text-slate-900 font-bold">1. Extrait d'acte de naissance</strong>
                    <span className="text-[9px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-300 uppercase">
                      Obligatoire
                    </span>
                  </div>
                  <p className="text-[10.5px] text-slate-500 mt-0.5">
                    Original ou extrait légalisé conforme (immatriculation MENFP).
                  </p>
                </div>
              </div>

              {/* 2. Photos d'identité */}
              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white border border-amber-200 shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <strong className="text-xs text-slate-900 font-bold">2. 4 photos d'identité récentes</strong>
                    <span className="text-[9px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-300 uppercase">
                      Obligatoire
                    </span>
                  </div>
                  <p className="text-[10.5px] text-slate-500 mt-0.5">
                    Format passeport identiques (fond clair pour carte d'élève et registre).
                  </p>
                </div>
              </div>

              {/* 3. Bulletins scolaires */}
              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white border border-amber-200 shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <strong className="text-xs text-slate-900 font-bold">3. Bulletins des 2 dernières années</strong>
                    <span className="text-[9px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-300 uppercase">
                      Obligatoire (dès 1e AF)
                    </span>
                  </div>
                  <p className="text-[10.5px] text-slate-500 mt-0.5">
                    Relevés de notes originaux pour orientation et vérification académique.
                  </p>
                </div>
              </div>

              {/* 4. Certificat de passage */}
              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white border border-amber-200 shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <strong className="text-xs text-slate-900 font-bold">4. Certificat de passage officiel</strong>
                    <span className="text-[9px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-300 uppercase">
                      Si classe supérieure
                    </span>
                  </div>
                  <p className="text-[10.5px] text-slate-500 mt-0.5">
                    Signé et timbré par la direction de l'école de provenance.
                  </p>
                </div>
              </div>

              {/* 5. Carnet de santé et pièce du tuteur */}
              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white border border-amber-200 shadow-2xs sm:col-span-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <strong className="text-xs text-slate-900 font-bold">5. Fiche vaccinale / médicale & Pièce d'identité du tuteur</strong>
                    <span className="text-[9px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-300 uppercase">
                      Obligatoire
                    </span>
                  </div>
                  <p className="text-[10.5px] text-slate-500 mt-0.5">
                    Carnet de vaccination à jour et photocopie de la pièce d'identité (CIN ou passeport) du responsable légal.
                  </p>
                </div>
              </div>

            </div>

            <div className="p-2.5 rounded-xl bg-amber-200/60 border border-amber-300 text-[11px] text-amber-950 font-medium flex items-center justify-between flex-wrap gap-2">
              <span>📍 Lieu de dépôt : <strong>Secrétariat Collège Isaac Newton · Delmas 50, rue Dominique #2 bis</strong></span>
              <span className="font-mono font-bold text-slate-900">Horaires : Lun - Ven · 08h00 - 14h00</span>
            </div>
          </div>

          {/* Next steps card */}
          <div className="text-left bg-slate-50 rounded-xl p-3 sm:p-4 border border-slate-200/80 space-y-1.5 text-xs text-slate-700">
            <h3 className="font-serif font-bold text-xs text-slate-900 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-900" />
              <span>Étapes suivantes de l'admission :</span>
            </h3>
            <ol className="list-decimal pl-4 space-y-1 leading-relaxed text-slate-600 text-[11px] sm:text-xs">
              <li>
                <strong>Étude sous 48-72h :</strong> Examen de l'admissibilité administrative par la direction.
              </li>
              <li>
                <strong>Test diagnostique :</strong> Convocation de l'élève pour le test d'aptitude.
              </li>
              <li>
                <strong>Dépôt des pièces obligatoires :</strong> Validation physique au secrétariat et remise du kit scolaire.
              </li>
            </ol>
            <div className="pt-2 flex items-center gap-1.5 text-slate-500 font-mono text-[10px] sm:text-[11px] border-t border-slate-200/60">
              <Phone className="w-3 h-3 text-slate-400" />
              <span>Ligne officielle : {directionPhone} · Secrétariat : {SCHOOL_INFO.phone}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-1 flex flex-col sm:flex-row items-center justify-center gap-2">
            <button
              onClick={() => window.print()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimer le récépissé & Liste des pièces</span>
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
              {currentStep === 4 && '4. Pièces Obligatoires & Engagement'}
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
              { step: 4, label: 'Pièces Requises', sublabel: 'Dépôt obligatoire', icon: ShieldCheck },
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
          <div className="space-y-3 sm:space-y-3.5 animate-fade-in">
            <div className="border-b border-slate-100 pb-2">
              <div className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-900 text-[11px] font-bold flex items-center justify-center">4</span>
                <h2 className="font-serif text-sm sm:text-base font-bold text-slate-900">
                  Pièces Justificatives & Engagement
                </h2>
              </div>
              <p className="text-[10.5px] sm:text-[11px] text-slate-500 mt-0.5">
                Confirmation des documents physiques obligatoires requis pour valider et finaliser l'inscription définitive.
              </p>
            </div>

            {/* Avertissement solennel : Dépôt obligatoire pour finaliser l'inscription */}
            <div className="p-3 rounded-xl bg-amber-50/90 border border-amber-300 shadow-2xs flex items-start gap-2.5 text-xs">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div className="space-y-1 text-amber-950">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-xs text-amber-950">
                    Dépôt physique obligatoire au secrétariat (Delmas 50)
                  </span>
                  <span className="text-[9.5px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-200 text-amber-950 border border-amber-300">
                    Finalisation requise
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-amber-900 leading-relaxed">
                  La préinscription en ligne bloque temporairement une place pour votre enfant. <strong>L'inscription définitive sera officiellement validée uniquement après le dépôt physique obligatoire de ces pièces justificatives</strong> au secrétariat du Collège Isaac Newton lors de votre entretien d'admission.
                </p>
              </div>
            </div>

            {/* Grille des pièces justificatives avec statut obligatoire */}
            <div className="space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                
                {/* 1. Acte de naissance */}
                <label className={`flex flex-col justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                  formData.hasBirthCert 
                    ? 'border-emerald-300 bg-emerald-50/15 shadow-2xs' 
                    : 'border-rose-300 bg-rose-50/30 ring-1 ring-rose-200'
                }`}>
                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      checked={formData.hasBirthCert}
                      onChange={(e) => handleFieldChange('hasBirthCert', e.target.checked)}
                      className="w-4 h-4 text-blue-900 rounded mt-0.5 cursor-pointer shrink-0"
                    />
                    <div className="space-y-0.5 flex-1">
                      <div className="flex items-center justify-between gap-1 flex-wrap">
                        <span className="font-bold text-slate-900 text-[11px] sm:text-xs">
                          Extrait d'acte de naissance
                        </span>
                        <span className="text-[9.5px] font-bold px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 border border-rose-300">
                          Obligatoire
                        </span>
                      </div>
                      <p className="text-[10px] sm:text-[10.5px] text-slate-500">
                        Original ou copie légalisée conforme (immatriculation MENFP).
                      </p>
                    </div>
                  </div>
                  {!formData.hasBirthCert ? (
                    <p className="text-[10px] text-rose-600 font-semibold mt-1.5 pl-6 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>Pièce obligatoire pour finaliser l'inscription définitive</span>
                    </p>
                  ) : (
                    <p className="text-[10px] text-emerald-700 font-medium mt-1.5 pl-6 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>Je confirme apporter cette pièce lors du rendez-vous</span>
                    </p>
                  )}
                </label>

                {/* 2. Bulletins scolaires */}
                <label className={`flex flex-col justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                  formData.hasReportCards 
                    ? 'border-emerald-300 bg-emerald-50/15 shadow-2xs' 
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}>
                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      checked={formData.hasReportCards}
                      onChange={(e) => handleFieldChange('hasReportCards', e.target.checked)}
                      className="w-4 h-4 text-blue-900 rounded mt-0.5 cursor-pointer shrink-0"
                    />
                    <div className="space-y-0.5 flex-1">
                      <div className="flex items-center justify-between gap-1 flex-wrap">
                        <span className="font-bold text-slate-900 text-[11px] sm:text-xs">
                          Bulletins scolaires des 2 dernières années
                        </span>
                        <span className="text-[9.5px] font-bold px-1.5 py-0.2 rounded bg-blue-100 text-blue-900 border border-blue-200">
                          Obligatoire (dès 1e AF)
                        </span>
                      </div>
                      <p className="text-[10px] sm:text-[10.5px] text-slate-500">
                        Relevés originaux pour étude du niveau et orientation pédagogique.
                      </p>
                    </div>
                  </div>
                  {formData.hasReportCards ? (
                    <p className="text-[10px] text-emerald-700 font-medium mt-1.5 pl-6 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>Je confirme apporter ces bulletins scolaires</span>
                    </p>
                  ) : (
                    <p className="text-[10px] text-slate-500 mt-1.5 pl-6">
                      (Non requis pour une première rentrée en Maternelle/Préscolaire)
                    </p>
                  )}
                </label>

                {/* 3. Certificat de passage */}
                <label className={`flex flex-col justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                  formData.hasPassCert 
                    ? 'border-emerald-300 bg-emerald-50/15 shadow-2xs' 
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}>
                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      checked={formData.hasPassCert}
                      onChange={(e) => handleFieldChange('hasPassCert', e.target.checked)}
                      className="w-4 h-4 text-blue-900 rounded mt-0.5 cursor-pointer shrink-0"
                    />
                    <div className="space-y-0.5 flex-1">
                      <div className="flex items-center justify-between gap-1 flex-wrap">
                        <span className="font-bold text-slate-900 text-[11px] sm:text-xs">
                          Certificat de passage officiel
                        </span>
                        <span className="text-[9.5px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-300">
                          Requis si classe sup.
                        </span>
                      </div>
                      <p className="text-[10px] sm:text-[10.5px] text-slate-500">
                        Signé et timbré par la direction de l'école de provenance.
                      </p>
                    </div>
                  </div>
                  {formData.hasPassCert ? (
                    <p className="text-[10px] text-emerald-700 font-medium mt-1.5 pl-6 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>Certificat de passage prêt à être déposé</span>
                    </p>
                  ) : (
                    <p className="text-[10px] text-slate-500 mt-1.5 pl-6">
                      À fournir pour toute admission en classe supérieure
                    </p>
                  )}
                </label>

                {/* 4. Photos d'identité */}
                <label className={`flex flex-col justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                  formData.hasIdPhotos 
                    ? 'border-emerald-300 bg-emerald-50/15 shadow-2xs' 
                    : 'border-rose-300 bg-rose-50/30 ring-1 ring-rose-200'
                }`}>
                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      checked={formData.hasIdPhotos}
                      onChange={(e) => handleFieldChange('hasIdPhotos', e.target.checked)}
                      className="w-4 h-4 text-blue-900 rounded mt-0.5 cursor-pointer shrink-0"
                    />
                    <div className="space-y-0.5 flex-1">
                      <div className="flex items-center justify-between gap-1 flex-wrap">
                        <span className="font-bold text-slate-900 text-[11px] sm:text-xs">
                          4 photos d'identité récentes
                        </span>
                        <span className="text-[9.5px] font-bold px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 border border-rose-300">
                          Obligatoire
                        </span>
                      </div>
                      <p className="text-[10px] sm:text-[10.5px] text-slate-500">
                        Format passeport (destinées à la fiche officielle et à la carte scolaire).
                      </p>
                    </div>
                  </div>
                  {!formData.hasIdPhotos ? (
                    <p className="text-[10px] text-rose-600 font-semibold mt-1.5 pl-6 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>Photos obligatoires pour créer le dossier et la carte d'élève</span>
                    </p>
                  ) : (
                    <p className="text-[10px] text-emerald-700 font-medium mt-1.5 pl-6 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>Je confirme apporter les 4 photos d'identité</span>
                    </p>
                  )}
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

              {/* Consent Box with Real-time Error Display & Formal Commitment to Bring Documents */}
              <div className={`p-3 rounded-xl border transition-all ${
                touched.consentGiven && errors.consentGiven 
                  ? 'bg-rose-50/60 border-rose-300 ring-1 ring-rose-200' 
                  : 'bg-amber-50/60 border-amber-200/90'
              }`}>
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.consentGiven}
                    onChange={(e) => handleFieldChange('consentGiven', e.target.checked)}
                    className="w-4 h-4 text-blue-900 rounded mt-0.5 cursor-pointer shrink-0"
                  />
                  <div className="space-y-0.5">
                    <span className="text-[10.5px] sm:text-[11px] text-slate-900 font-medium leading-relaxed block">
                      Je certifie sur l'honneur l'exactitude des renseignements fournis ci-dessus et <strong>je confirme mon engagement solennel à apporter l'ensemble des pièces physiques obligatoires</strong> au secrétariat du <strong>Collège Isaac Newton (Delmas 50)</strong> pour finaliser et valider l'inscription définitive de l'élève. *
                    </span>
                    <span className="text-[9.5px] text-slate-500 block">
                      La finalisation physique au secrétariat confirme la place et déclenche la remise du dossier de rentrée.
                    </span>
                  </div>
                </label>
                {touched.consentGiven && errors.consentGiven && (
                  <p className="text-[10.5px] text-rose-600 font-semibold pl-6 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.consentGiven}</span>
                  </p>
                )}
                {touched.hasBirthCert && errors.hasBirthCert && (
                  <p className="text-[10.5px] text-rose-600 font-semibold pl-6 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.hasBirthCert}</span>
                  </p>
                )}
                {touched.hasIdPhotos && errors.hasIdPhotos && (
                  <p className="text-[10.5px] text-rose-600 font-semibold pl-6 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.hasIdPhotos}</span>
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
