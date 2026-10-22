import React, { useState, useEffect } from 'react';
import { 
  MessageCircle, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  Save, 
  Loader2, 
  Sparkles, 
  Phone, 
  User, 
  ShieldCheck, 
  Radio, 
  RefreshCw,
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import { SiteSettings } from '../../types';
import { apiService } from '../../services/api';

interface WhatsAppGatewaySettingsProps {
  settings?: SiteSettings | null;
  onSettingsUpdated?: (settings: SiteSettings) => void;
  className?: string;
}

export const WhatsAppGatewaySettings: React.FC<WhatsAppGatewaySettingsProps> = ({
  settings,
  onSettingsUpdated,
  className = '',
}) => {
  // Config state
  const initialPhone = settings?.whatsappConfig?.directionPhone || settings?.contactInfo?.phone || '+509 3316-0934';
  const [directionPhone, setDirectionPhone] = useState(initialPhone);
  const [holderName, setHolderName] = useState(
    settings?.whatsappConfig?.holderName || 'Orphe Jean Marie · Directeur fondateur'
  );
  const [enabled, setEnabled] = useState(settings?.whatsappConfig?.enabled !== false);
  const [notifyAdmissions, setNotifyAdmissions] = useState(settings?.whatsappConfig?.notifyAdmissions !== false);
  const [notifyMessages, setNotifyMessages] = useState(settings?.whatsappConfig?.notifyMessages !== false);
  const [notifyDeadlines, setNotifyDeadlines] = useState(settings?.whatsappConfig?.notifyDeadlines !== false);

  // Verification & Database Save states
  const [isVerified, setIsVerified] = useState(Boolean(settings?.whatsappConfig?.isVerified));
  const [verifiedAt, setVerifiedAt] = useState<string | null>(
    settings?.whatsappConfig?.verifiedAt || '2026-10-12T14:30:00.000Z'
  );
  const [hasTestedPing, setHasTestedPing] = useState(false);
  const [lastTestToken, setLastTestToken] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync when settings prop updates
  useEffect(() => {
    if (settings?.whatsappConfig) {
      setDirectionPhone(settings.whatsappConfig.directionPhone || initialPhone);
      setHolderName(settings.whatsappConfig.holderName || 'Orphe Jean Marie · Directeur fondateur');
      setEnabled(settings.whatsappConfig.enabled !== false);
      setIsVerified(Boolean(settings.whatsappConfig.isVerified));
      setVerifiedAt(settings.whatsappConfig.verifiedAt || null);
      setNotifyAdmissions(settings.whatsappConfig.notifyAdmissions !== false);
      setNotifyMessages(settings.whatsappConfig.notifyMessages !== false);
      setNotifyDeadlines(settings.whatsappConfig.notifyDeadlines !== false);
    }
  }, [settings]);

  // Track if phone has changed from verified state
  const isPhoneModified = settings?.whatsappConfig?.directionPhone !== directionPhone && Boolean(settings?.whatsappConfig?.directionPhone);

  // Haiti phone validation helper (+509 followed by 8 digits, beginning with 3 or 4)
  const validateHaitiPhone = (phoneStr: string) => {
    const digits = phoneStr.replace(/[^0-9]/g, '');
    if (digits.length === 11 && digits.startsWith('509')) {
      const local = digits.slice(3);
      const isValidOperator = /^[34]\d{7}$/.test(local);
      return { 
        valid: isValidOperator, 
        clean: digits, 
        formatted: `+509 ${local.slice(0, 4)}-${local.slice(4)}`,
        operator: local.startsWith('3') ? 'Digicel Haïti' : 'Natcom Haïti',
        error: isValidOperator ? null : 'Le numéro local doit débuter par 3 (Digicel) ou 4 (Natcom).'
      };
    } else if (digits.length === 8) {
      const isValidOperator = /^[34]\d{7}$/.test(digits);
      return { 
        valid: isValidOperator, 
        clean: `509${digits}`, 
        formatted: `+509 ${digits.slice(0, 4)}-${digits.slice(4)}`,
        operator: digits.startsWith('3') ? 'Digicel Haïti' : 'Natcom Haïti',
        error: isValidOperator ? null : 'Le numéro local doit débuter par 3 (Digicel) ou 4 (Natcom).'
      };
    }
    return { 
      valid: false, 
      clean: digits, 
      formatted: phoneStr, 
      operator: null,
      error: 'Numéro invalide pour Haïti. Format requis : +509 suivi de 8 chiffres (ex : +509 3316-0934).' 
    };
  };

  const validationResult = validateHaitiPhone(directionPhone);

  // When user modifies phone, invalidate verification unless confirmed again
  const handlePhoneChange = (newVal: string) => {
    setDirectionPhone(newVal);
    if (newVal !== settings?.whatsappConfig?.directionPhone) {
      setIsVerified(false);
      setHasTestedPing(false);
    }
    setSaveSuccess(false);
  };

  // Launch live verification test on WhatsApp
  const handleLaunchVerificationTest = () => {
    if (!validationResult.valid) {
      toast.error('Format de numéro invalide', {
        description: validationResult.error || 'Veuillez saisir un numéro valide avant de tester.',
      });
      return;
    }

    const testToken = `CIN-WA-VERIF-${Math.floor(1000 + Math.random() * 9000)}`;
    const nowStr = new Date().toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });
    setLastTestToken(testToken);

    const message = encodeURIComponent(
      `*TEST OFFICIEL DE VÉRIFICATION — COLLÈGE ISAAC NEWTON*\n\n` +
      `✅ *Ligne de la Direction :* ${validationResult.formatted}\n` +
      `👤 *Titulaire :* ${holderName}\n` +
      `🏢 *Établissement :* Collège Isaac Newton (Delmas 50)\n` +
      `🕒 *Horodatage :* ${nowStr}\n` +
      `🔑 *Code de certification :* ${testToken}\n\n` +
      `Ce message confirme la liaison directe entre le portail web du Collège Isaac Newton et le WhatsApp officiel de la Direction pour les alertes d'inscriptions.`
    );

    window.open(`https://wa.me/${validationResult.clean}?text=${message}`, '_blank');
    setHasTestedPing(true);
    toast.info('Lien WhatsApp ouvert', {
      description: `Vérifiez que le message s'affiche correctement sur votre application WhatsApp vers le ${validationResult.formatted}.`,
    });
  };

  // Confirm that Director received the WhatsApp message
  const handleConfirmVerification = () => {
    setIsVerified(true);
    const dateStr = new Date().toISOString();
    setVerifiedAt(dateStr);
    toast.success('Ligne WhatsApp certifiée avec succès !', {
      description: 'Vous pouvez maintenant enregistrer cette configuration dans la base de données.',
    });
  };

  // Save to PostgreSQL and local disk cache
  const handleSaveToDatabase = async () => {
    if (!validationResult.valid) {
      toast.error('Impossible d’enregistrer : Numéro invalide', {
        description: validationResult.error || 'Veuillez corriger le format avant de sauvegarder.',
      });
      return;
    }

    if (!isVerified) {
      toast.warning('Vérification recommandée avant enregistrement', {
        description: 'Veuillez tester la ligne sur WhatsApp ou cocher la confirmation de validité.',
      });
      return;
    }

    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const updatedConfig = {
        enabled,
        directionPhone: validationResult.formatted,
        directionPhoneClean: validationResult.clean,
        holderName,
        isVerified: true,
        verifiedAt: verifiedAt || new Date().toISOString(),
        notifyAdmissions,
        notifyMessages,
        notifyDeadlines,
        updatedAt: new Date().toISOString(),
      };

      const updatedSettings: SiteSettings = {
        ...(settings || {} as SiteSettings),
        whatsappConfig: updatedConfig,
      };

      const result = await apiService.updateSettings(updatedSettings);

      // Persist also to localStorage for instant client-side retrieval
      localStorage.setItem('cin_direction_wa_phone', validationResult.formatted);
      localStorage.setItem('cin_direction_wa_verified', 'true');
      if (verifiedAt) localStorage.setItem('cin_direction_wa_verified_at', verifiedAt);

      if (onSettingsUpdated) {
        onSettingsUpdated(result);
      }

      // Notify other components
      window.dispatchEvent(new CustomEvent('cin:settings-updated', { detail: result }));

      setSaveSuccess(true);
      toast.success('Configuration WhatsApp enregistrée dans la BDD !', {
        description: `Ligne active : ${validationResult.formatted} (${holderName})`,
      });
    } catch (err: any) {
      toast.error('Erreur lors de l’enregistrement dans la base de données', {
        description: err.message || 'Une erreur de communication est survenue.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Simulate admission alert
  const handleSimulateAdmissionAlert = () => {
    if (!validationResult.valid) {
      toast.error('Veuillez saisir un numéro valide d’abord');
      return;
    }

    const sampleNum = `CIN-ADM-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const msg = encodeURIComponent(
      `*SIMULATION : ALERTE NOUVELLE PRÉINSCRIPTION*\n\n` +
      `📋 *Dossier :* ${sampleNum}\n` +
      `👤 *Élève :* SAINT-FORT Jean-Baptiste\n` +
      `🎯 *Niveau sollicité :* 3ème Année Fondamentale (1er Cycle)\n` +
      `👨‍👩‍👧 *Parent :* Saint-Fort Marjorie (Mère)\n` +
      `📞 *Téléphone Parent :* +509 3744-8899\n` +
      `📧 *E-mail :* marjorie.stfort@gmail.com\n` +
      `🏫 *École précédente :* Institution Sainte-Rose de Lima\n\n` +
      `Notification automatique générée par le portail officiel du Collège Isaac Newton.`
    );

    window.open(`https://wa.me/${validationResult.clean}?text=${msg}`, '_blank');
    toast.info('Aperçu ouvert dans WhatsApp', {
      description: 'Voici le format exact des alertes que la Direction recevra lors des inscriptions.',
    });
  };

  return (
    <div className={`bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-6 space-y-5 ${className}`}>
      
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-600 flex items-center justify-center shrink-0 shadow-2xs">
            <MessageCircle className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-base sm:text-lg text-slate-900 tracking-tight">
                Ligne WhatsApp Officielle de la Direction
              </h3>
              {isVerified ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300">
                  <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                  <span>Vérifié & Prêt BDD</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold border border-amber-300">
                  <AlertTriangle className="w-3 h-3 text-amber-700" />
                  <span>Vérification Requise</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              Réception des alertes de préinscription, messages de contact et urgences administratives directement sur smartphone.
            </p>
          </div>
        </div>

        {/* Global Active Toggle */}
        <label className="flex items-center gap-2 cursor-pointer self-start sm:self-auto bg-slate-50 py-1.5 px-3 rounded-xl border border-slate-200">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500"
          />
          <span className="text-xs font-bold text-slate-800">
            {enabled ? 'Passerelle Active' : 'Passerelle Désactivée'}
          </span>
        </label>
      </div>

      {/* Main Input Form */}
      <div className="space-y-4 text-xs sm:text-sm">
        
        {/* Row 1: WhatsApp Phone & Holder Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Phone input with real-time feedback */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-bold text-slate-700 text-xs uppercase tracking-wide flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>Numéro WhatsApp de la Direction : *</span>
              </label>
              {validationResult.operator && (
                <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded-full border border-emerald-200">
                  {validationResult.operator}
                </span>
              )}
            </div>
            
            <div className="relative">
              <input
                type="text"
                required
                value={directionPhone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="+509 3316-0934"
                className={`w-full py-2.5 px-3.5 rounded-xl border font-mono font-bold text-xs sm:text-sm transition-all outline-none ${
                  validationResult.valid 
                    ? 'border-emerald-300 bg-emerald-50/20 text-slate-900 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20' 
                    : 'border-slate-300 bg-slate-50 text-slate-900 focus:border-blue-900 focus:bg-white'
                }`}
              />
              <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-mono">
                Haïti (+509)
              </span>
            </div>

            {validationResult.error && (
              <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 shrink-0" />
                <span>{validationResult.error}</span>
              </p>
            )}
            {!validationResult.error && (
              <p className="text-[10.5px] text-slate-500 mt-1">
                Numéro standard recommandé pour la Direction : <strong>+509 3316-0934</strong>
              </p>
            )}
          </div>

          {/* Holder Name */}
          <div>
            <label className="font-bold text-slate-700 text-xs uppercase tracking-wide block mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-900" />
              <span>Titulaire / Destinataire Officiel : *</span>
            </label>
            <input
              type="text"
              required
              value={holderName}
              onChange={(e) => setHolderName(e.target.value)}
              placeholder="Orphe Jean Marie · Directeur fondateur"
              className="w-full py-2.5 px-3.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-blue-900 text-slate-900 font-semibold text-xs sm:text-sm transition-all outline-none"
            />
            <p className="text-[10.5px] text-slate-500 mt-1">
              Affiché dans les bordereaux et mentions d'accusé de réception.
            </p>
          </div>

        </div>

        {/* Step-by-Step Verification Banner (Pre-Save Requirement) */}
        <div className={`p-4 rounded-2xl border transition-all ${
          isVerified 
            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950' 
            : 'bg-amber-50/70 border-amber-200 text-amber-950'
        }`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ShieldCheck className={`w-4 h-4 ${isVerified ? 'text-emerald-700' : 'text-amber-700'}`} />
                <h4 className="font-bold text-xs sm:text-sm">
                  {isVerified 
                    ? 'Ligne Certifiée & Vérifiée pour la Base de Données' 
                    : 'Étape Obligatoire : Vérification de la Ligne avant Enregistrement'}
                </h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
                {isVerified
                  ? `La ligne ${validationResult.formatted} a été testée avec succès et certifiée le ${verifiedAt ? new Date(verifiedAt).toLocaleDateString('fr-FR') : 'récemment'}.`
                  : `Pour éviter d'enregistrer un numéro erroné ou non connecté à WhatsApp, vous devez déclencher un test de vérification et confirmer sa réception.`}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <button
                type="button"
                onClick={handleLaunchVerificationTest}
                disabled={!validationResult.valid}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs transition-colors shadow-2xs cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Tester la Ligne sur WhatsApp</span>
              </button>

              {!isVerified && hasTestedPing && (
                <button
                  type="button"
                  onClick={handleConfirmVerification}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs transition-colors shadow-2xs cursor-pointer animate-pulse"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>J'ai reçu le message (Confirmer)</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick simulation link */}
          <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-between gap-2 text-xs flex-wrap">
            <span className="text-slate-500 text-[11px]">
              Voulez-vous vérifier le rendu réel d'une alerte d'inscription ?
            </span>
            <button
              type="button"
              onClick={handleSimulateAdmissionAlert}
              disabled={!validationResult.valid}
              className="text-[11px] font-bold text-blue-900 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Simuler le message d'une nouvelle inscription</span>
            </button>
          </div>
        </div>

        {/* Notification triggers toggles */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2.5">
          <span className="font-bold text-xs uppercase tracking-wider text-slate-700 block">
            Déclencheurs automatiques des alertes vers la Direction :
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            
            <label className="flex items-start gap-2.5 p-2 rounded-lg bg-white border border-slate-200 shadow-2xs cursor-pointer hover:border-slate-300 transition-colors">
              <input
                type="checkbox"
                checked={notifyAdmissions}
                onChange={(e) => setNotifyAdmissions(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded-sm mt-0.5"
              />
              <div>
                <strong className="block text-slate-900 font-semibold text-xs">Nouvelles Inscriptions</strong>
                <span className="text-[10px] text-slate-500">Alerte avec N° dossier, élève, classe et parent</span>
              </div>
            </label>

            <label className="flex items-start gap-2.5 p-2 rounded-lg bg-white border border-slate-200 shadow-2xs cursor-pointer hover:border-slate-300 transition-colors">
              <input
                type="checkbox"
                checked={notifyMessages}
                onChange={(e) => setNotifyMessages(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded-sm mt-0.5"
              />
              <div>
                <strong className="block text-slate-900 font-semibold text-xs">Messages de Contact</strong>
                <span className="text-[10px] text-slate-500">Demandes d'information et rendez-vous campus</span>
              </div>
            </label>

            <label className="flex items-start gap-2.5 p-2 rounded-lg bg-white border border-slate-200 shadow-2xs cursor-pointer hover:border-slate-300 transition-colors">
              <input
                type="checkbox"
                checked={notifyDeadlines}
                onChange={(e) => setNotifyDeadlines(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded-sm mt-0.5"
              />
              <div>
                <strong className="block text-slate-900 font-semibold text-xs">Échéances &lt; 48h</strong>
                <span className="text-[10px] text-slate-500">Rappels urgents, examens d'État et réunions</span>
              </div>
            </label>

          </div>
        </div>

      </div>

      {/* Action Footer: Save to Database */}
      <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Info className="w-4 h-4 text-slate-400 shrink-0" />
          <span>
            {isVerified 
              ? 'Ligne certifiée prête pour persistance dans PostgreSQL.' 
              : 'Cliquez sur "Tester la Ligne" pour débloquer l’enregistrement sécurisé.'}
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleSaveToDatabase}
            disabled={isSaving || !validationResult.valid || !isVerified}
            className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-sm cursor-pointer ${
              isVerified && validationResult.valid
                ? 'bg-slate-900 hover:bg-slate-950 text-white shadow-md hover:shadow-lg'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                <span>Enregistrement en BDD...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-amber-400" />
                <span>Enregistrer dans la Base de Données</span>
              </>
            )}
          </button>
        </div>
      </div>

    </div>
  );
};
