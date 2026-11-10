import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Mail, 
  Smartphone, 
  CheckCircle2, 
  Sparkles, 
  X, 
  Send, 
  Loader2, 
  ShieldCheck, 
  Calendar, 
  Clock, 
  AlertCircle,
  MessageSquare,
  Trash2,
  Edit3
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  ExamReminderSubscription, 
  SubscriberRole, 
  ReminderChannel 
} from '../../types';
import { apiService } from '../../services/api';
import { eventNotificationService } from '../../services/eventNotificationService';

interface ExamReminderSubscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultLevel?: string;
  defaultControlId?: number;
  onViewSchedule?: () => void;
}

export const ExamReminderSubscribeModal: React.FC<ExamReminderSubscribeModalProps> = ({
  isOpen,
  onClose,
  defaultLevel = 'ALL',
  defaultControlId = 1,
  onViewSchedule,
}) => {
  const [existingSub, setExistingSub] = useState<ExamReminderSubscription | null>(null);
  const [isEditingExisting, setIsEditingExisting] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<SubscriberRole>('PARENT');
  const [level, setLevel] = useState(defaultLevel || 'ALL');
  const [channels, setChannels] = useState<ReminderChannel[]>(['EMAIL', 'PUSH']);

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [devicePermission, setDevicePermission] = useState<NotificationPermission>('default');

  // Load existing subscription from local cache or props
  useEffect(() => {
    if (isOpen) {
      const saved = eventNotificationService.getLocalExamSubscription();
      if (saved) {
        setExistingSub(saved);
        setFullName(saved.fullName || '');
        setEmail(saved.email || '');
        setPhone(saved.phone || '');
        setRole(saved.role || 'PARENT');
        setLevel(saved.level || defaultLevel || 'ALL');
        setChannels(saved.channels || ['EMAIL', 'PUSH']);
        setIsEditingExisting(false);
      } else {
        setIsEditingExisting(true);
      }

      if (eventNotificationService.isNotificationSupported()) {
        setDevicePermission(eventNotificationService.getNotificationPermission());
      }
    }
  }, [isOpen, defaultLevel]);

  if (!isOpen) return null;

  const toggleChannel = (channel: ReminderChannel) => {
    setChannels((prev) => {
      if (prev.includes(channel)) {
        if (prev.length === 1) {
          toast.warning('Veuillez conserver au moins un moyen de rappel.');
          return prev;
        }
        return prev.filter((c) => c !== channel);
      }
      return [...prev, channel];
    });
  };

  const handleRequestDevicePermission = async () => {
    const res = await eventNotificationService.requestNotificationPermission();
    setDevicePermission(res);
    if (res === 'granted') {
      toast.success('Alertes activées sur cet appareil.');
      if (!channels.includes('PUSH')) {
        setChannels((prev) => [...prev, 'PUSH']);
      }
    } else if (res === 'denied') {
      toast.error('Les alertes sont bloquées dans les paramètres de votre navigateur.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      toast.warning('Veuillez indiquer votre nom et prénom.');
      return;
    }

    if (channels.includes('EMAIL')) {
      if (!email.trim() || !email.includes('@') || !email.includes('.')) {
        toast.warning('Veuillez saisir une adresse e-mail valide pour recevoir vos rappels.');
        return;
      }
    }

    // Auto-request device permission if device alert selected and not yet granted
    if (channels.includes('PUSH') && devicePermission !== 'granted') {
      const perm = await eventNotificationService.requestNotificationPermission();
      setDevicePermission(perm);
    }

    setIsLoading(true);

    try {
      const payload: Partial<ExamReminderSubscription> = {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        role,
        level,
        channels,
        controlIds: [1, 2, 3, 4], // Active across all 4 controls automatically
        notifyTiming: 'ALL',       // Automated 48h and 24h reminders
      };

      const result = await apiService.subscribeExamReminders(payload);

      if (result.success && result.subscription) {
        eventNotificationService.saveLocalExamSubscription(result.subscription);
        setExistingSub(result.subscription);
        setIsSuccess(true);
        setIsEditingExisting(false);
        toast.success('Rappels d’épreuves activés avec succès !', {
          description: channels.includes('EMAIL')
            ? `Un e-mail de confirmation officiel a été envoyé à ${email}.`
            : 'Vos alertes sont enregistrées.',
        });
      } else {
        toast.error('Erreur', { description: result.message || 'Impossible d’enregistrer vos rappels.' });
      }
    } catch (err: any) {
      toast.error('Erreur', { description: err.message || 'Une erreur est survenue lors de l\'enregistrement.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    if (!existingSub) return;
    if (!confirm('Confirmez-vous la désactivation de vos rappels d’épreuves ?')) return;

    setIsLoading(true);
    try {
      await apiService.unsubscribeExamReminders({ id: existingSub.id, email: existingSub.email });
      eventNotificationService.removeLocalExamSubscription();
      setExistingSub(null);
      setIsSuccess(false);
      setIsEditingExisting(true);
      toast.info('Vos rappels d’épreuves ont été désactivés.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in font-sans"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 text-white p-4 sm:p-5 flex items-start justify-between relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="space-y-1 relative z-10 pr-6">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-xs font-mono">
                <Sparkles className="w-3 h-3" />
                Collège Isaac Newton
              </span>
              <span className="text-[11px] font-mono text-amber-300 font-semibold">
                Contrôles 2026–2027
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-serif font-bold text-white tracking-tight flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Rappels des Examens & Contrôles</span>
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed font-light">
              Recevez les horaires détaillés et les avis de la direction directement avant chaque épreuve officielle.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer relative z-10 shrink-0"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">

          {/* ACTIVE SUBSCRIPTION OVERVIEW (IF ALREADY SUBSCRIBED AND NOT CURRENTLY EDITING OR IN SUCCESS) */}
          {existingSub && !isSuccess && !isEditingExisting && (
            <div className="space-y-4">
              <div className="bg-emerald-50/90 border border-emerald-200 rounded-2xl p-4 sm:p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-emerald-950">
                        Vos rappels d'épreuves sont actifs
                      </h4>
                      <p className="text-xs text-emerald-800">
                        Inscrit sous le nom : <strong>{existingSub.fullName}</strong>
                      </p>
                    </div>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-200/80 text-emerald-950 text-[10px] font-bold font-mono shrink-0">
                    ACTIF
                  </span>
                </div>

                <div className="bg-white/80 rounded-xl p-3 border border-emerald-100 space-y-1.5 text-xs text-slate-700">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Profil :</span>
                    <span className="font-semibold text-slate-900">
                      {existingSub.role === 'PARENT' ? 'Parent d\'élève' : existingSub.role === 'STUDENT' ? 'Élève' : 'Enseignant'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Niveau suivi :</span>
                    <span className="font-semibold text-slate-900">{existingSub.level}</span>
                  </div>
                  {existingSub.email && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Adresse e-mail :</span>
                      <span className="font-mono font-semibold text-blue-900">{existingSub.email}</span>
                    </div>
                  )}
                  {existingSub.phone && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Téléphone / WhatsApp :</span>
                      <span className="font-mono font-semibold text-slate-900">{existingSub.phone}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-1 border-t border-emerald-100/80">
                    <span className="text-slate-500">Rappels prévus :</span>
                    <span className="font-semibold text-emerald-900">48h et 24h avant chaque examen</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-emerald-200/60">
                  <button
                    type="button"
                    onClick={() => setIsEditingExisting(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-200 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-blue-900" />
                    <span>Modifier mes informations</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleUnsubscribe}
                    disabled={isLoading}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-rose-700 font-medium text-xs border border-rose-200 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    <span>Désactiver mes rappels</span>
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  Fermer
                </button>
              </div>
            </div>
          )}

          {/* SUCCESS VIEW (NO TEST BUTTONS, SIMPLE & CLEAR) */}
          {isSuccess && (
            <div className="py-5 px-3 text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-md">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h4 className="font-serif font-bold text-lg text-slate-900">
                  Rappels d'épreuves bien enregistrés !
                </h4>
                <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                  Merci <strong>{fullName}</strong>. Vous recevrez automatiquement les horaires et les consignes officielles avant le début des épreuves du <strong>1er Contrôle (9 au 13 Novembre 2026)</strong> et des contrôles suivants.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left max-w-md mx-auto space-y-2 text-xs text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500">Bénéficiaire :</span>
                  <span className="font-semibold text-slate-900">{fullName}</span>
                </div>
                {email && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Adresse de notification :</span>
                    <span className="font-mono font-semibold text-blue-900">{email}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Niveau sélectionné :</span>
                  <span className="font-semibold text-slate-900">{level}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Période concernée :</span>
                  <span className="font-semibold text-slate-900">Année académique 2026–2027</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
                {onViewSchedule && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onViewSchedule();
                    }}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-xs transition-colors cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5 text-slate-950" />
                    <span>Consulter les horaires d'épreuves</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  Fermer
                </button>
              </div>
            </div>
          )}

          {/* SUBSCRIPTION FORM (STREAMLINED, HUMAN, ZERO TECHNICAL JARGON) */}
          {(!existingSub || isEditingExisting) && !isSuccess && (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* 1. ROLE SELECTION */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
                  1. Vous êtes :
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'PARENT' as SubscriberRole, label: 'Parent d’élève' },
                    { id: 'STUDENT' as SubscriberRole, label: 'Élève' },
                    { id: 'TEACHER' as SubscriberRole, label: 'Enseignant' },
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRole(r.id)}
                      className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border text-center ${
                        role === r.id
                          ? 'bg-blue-900 text-white border-blue-900 shadow-xs'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. IDENTITY & CLASS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800">
                    Nom & Prénom <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ex: M. Jean Baptiste"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800">
                    Classe ou Cycle concerné
                  </label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600 bg-white"
                  >
                    <option value="ALL">Tous les cycles (Fondamental & Secondaire)</option>
                    <option value="CYCLE_3">3e Cycle Fondamental (7e, 8e, 9e AF)</option>
                    <option value="SECONDAIRE">Nouveau Secondaire (NS1 à NS4)</option>
                    <option value="7e AF">7ème Année Fondamentale (7e AF)</option>
                    <option value="8e AF">8ème Année Fondamentale (8e AF)</option>
                    <option value="9e AF">9ème Année Fondamentale (9e AF)</option>
                    <option value="NS1">Nouveau Secondaire 1 (NS1)</option>
                    <option value="NS2">Nouveau Secondaire 2 (NS2)</option>
                    <option value="NS3">Nouveau Secondaire 3 (NS3)</option>
                    <option value="NS4">Nouveau Secondaire 4 (Terminale / NS4)</option>
                  </select>
                </div>
              </div>

              {/* 3. RECEIVE CHANNELS */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
                  2. Où souhaitez-vous recevoir les rappels ?
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Channel: Email */}
                  <div
                    onClick={() => toggleChannel('EMAIL')}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                      channels.includes('EMAIL')
                        ? 'bg-blue-50/80 border-blue-400 text-blue-950 ring-1 ring-blue-400'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-900 flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs">Par E-mail</span>
                        <input
                          type="checkbox"
                          checked={channels.includes('EMAIL')}
                          onChange={() => {}}
                          className="rounded text-blue-900"
                        />
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Horaires officiels, consignes et fiches par matière.
                      </p>
                    </div>
                  </div>

                  {/* Channel: Device Alert */}
                  <div
                    onClick={() => toggleChannel('PUSH')}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                      channels.includes('PUSH')
                        ? 'bg-amber-50/80 border-amber-400 text-amber-950 ring-1 ring-amber-400'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center shrink-0">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs">Alerte sur cet appareil</span>
                        <input
                          type="checkbox"
                          checked={channels.includes('PUSH')}
                          onChange={() => {}}
                          className="rounded text-amber-500"
                        />
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Notification directe sur votre téléphone ou écran.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Conditional Email Field */}
                {channels.includes('EMAIL') && (
                  <div className="space-y-1 pt-1 animate-fade-in">
                    <label className="block text-xs font-bold text-slate-800">
                      Adresse e-mail <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nom.famille@gmail.com"
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                )}

                {/* Optional Phone / WhatsApp */}
                <div className="space-y-1 pt-1">
                  <label className="block text-xs font-bold text-slate-800">
                    Numéro de contact / WhatsApp <span className="text-slate-400 font-normal">(Optionnel)</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ex: +509 3700-0000"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                {/* Device Notification Permission Notice */}
                {channels.includes('PUSH') && devicePermission !== 'granted' && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center justify-between gap-2 text-xs text-amber-900 animate-fade-in">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                      <span>Autorisez le navigateur pour recevoir les alertes sur cet appareil.</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRequestDevicePermission}
                      className="shrink-0 px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-[11px] transition-colors cursor-pointer"
                    >
                      Autoriser
                    </button>
                  </div>
                )}
              </div>

              {/* REMINDER AUTOMATION EXPLANATION (CLEAR, NATURAL, HUMAN) */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-blue-900 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Fonctionnement automatique :</strong> Vous recevrez un rappel <strong>48h à l'avance</strong> et un récapitulatif <strong>la veille au soir</strong> de chaque contrôle académique officiel.
                </p>
              </div>

              {/* SUBMIT ACTIONS */}
              <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2">
                {isEditingExisting && (
                  <button
                    type="button"
                    onClick={() => setIsEditingExisting(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Annuler
                  </button>
                )}

                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Fermer
                </button>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  ) : (
                    <Send className="w-4 h-4 text-slate-950" />
                  )}
                  <span>
                    {existingSub ? 'Mettre à jour mes rappels' : 'Activer mes rappels d\'épreuves'}
                  </span>
                </button>
              </div>

            </form>
          )}

        </div>

        {/* FOOTER - HUMAN, PROFESSIONAL, ZERO JARGON */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-900" />
            <span>Collège Isaac Newton · Service Officiel de Rappels Pédagogiques</span>
          </span>
          <span className="font-mono text-slate-400 hidden sm:inline">Delmas 50</span>
        </div>

      </div>
    </div>
  );
};
