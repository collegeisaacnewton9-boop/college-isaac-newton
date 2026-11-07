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
  Volume2,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  ExamReminderSubscription, 
  SubscriberRole, 
  ReminderChannel, 
  ReminderTiming 
} from '../../types';
import { apiService } from '../../services/api';
import { eventNotificationService } from '../../services/eventNotificationService';

interface ExamReminderSubscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultLevel?: string;
  defaultControlId?: number;
}

export const ExamReminderSubscribeModal: React.FC<ExamReminderSubscribeModalProps> = ({
  isOpen,
  onClose,
  defaultLevel = 'ALL',
  defaultControlId = 1,
}) => {
  const [existingSub, setExistingSub] = useState<ExamReminderSubscription | null>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<SubscriberRole>('PARENT');
  const [level, setLevel] = useState(defaultLevel || 'ALL');
  const [channels, setChannels] = useState<ReminderChannel[]>(['EMAIL', 'PUSH']);
  const [selectedControls, setSelectedControls] = useState<number[]>([1, 2, 3, 4]);
  const [notifyTiming, setNotifyTiming] = useState<ReminderTiming>('ALL');

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [pushStatus, setPushStatus] = useState<NotificationPermission>('default');
  const [isTestingPush, setIsTestingPush] = useState(false);

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
        setLevel(saved.level || 'ALL');
        setChannels(saved.channels || ['EMAIL', 'PUSH']);
        setSelectedControls(saved.controlIds || [1, 2, 3, 4]);
        setNotifyTiming(saved.notifyTiming || 'ALL');
      }
      if (eventNotificationService.isNotificationSupported()) {
        setPushStatus(eventNotificationService.getNotificationPermission());
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleChannel = (channel: ReminderChannel) => {
    setChannels((prev) => {
      if (prev.includes(channel)) {
        if (prev.length === 1) {
          toast.warning('Veuillez conserver au moins un canal de notification.');
          return prev;
        }
        return prev.filter((c) => c !== channel);
      }
      return [...prev, channel];
    });
  };

  const toggleControl = (ctrlId: number) => {
    setSelectedControls((prev) => {
      if (prev.includes(ctrlId)) {
        if (prev.length === 1) {
          toast.warning('Veuillez sélectionner au moins une période de contrôle.');
          return prev;
        }
        return prev.filter((id) => id !== ctrlId);
      }
      return [...prev, ctrlId].sort();
    });
  };

  const handleRequestPushPermission = async () => {
    const res = await eventNotificationService.requestNotificationPermission();
    setPushStatus(res);
    if (res === 'granted') {
      toast.success('Autorisation accordée ! Les notifications push sont désormais activées.');
      if (!channels.includes('PUSH')) {
        setChannels((prev) => [...prev, 'PUSH']);
      }
    } else if (res === 'denied') {
      toast.error('Notifications bloquées dans les paramètres de votre navigateur.');
    }
  };

  const handleSendTestPush = async () => {
    setIsTestingPush(true);
    try {
      if (pushStatus !== 'granted') {
        const res = await eventNotificationService.requestNotificationPermission();
        setPushStatus(res);
        if (res !== 'granted') {
          toast.warning('Autorisation refusée ou non accordée.');
          setIsTestingPush(false);
          return;
        }
      }

      const delivered = await eventNotificationService.triggerBrowserNotification(
        '🔔 Collège Isaac Newton · Test de Rappel Réussi',
        {
          body: 'Vos alertes sont actives ! Vous recevrez des notifications directes avant chaque épreuve officielle (1er Contrôle : 9-13 nov. 2026).',
          tag: 'cin-test-reminder',
        }
      );

      if (delivered) {
        toast.success('Notification test envoyée avec succès sur votre appareil !');
      } else {
        toast.info('Notification affichée (vérifiez le centre de notifications de votre système).');
      }
    } finally {
      setIsTestingPush(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      toast.warning('Veuillez indiquer votre nom complet.');
      return;
    }

    if (channels.includes('EMAIL')) {
      if (!email.trim() || !email.includes('@')) {
        toast.warning('Veuillez saisir une adresse e-mail valide pour recevoir les alertes.');
        return;
      }
    }

    // Auto-request push permission if push is selected and not granted
    if (channels.includes('PUSH') && pushStatus !== 'granted') {
      const perm = await eventNotificationService.requestNotificationPermission();
      setPushStatus(perm);
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
        controlIds: selectedControls,
        notifyTiming,
      };

      const result = await apiService.subscribeExamReminders(payload);

      if (result.success && result.subscription) {
        eventNotificationService.saveLocalExamSubscription(result.subscription);
        setExistingSub(result.subscription);
        setIsSuccess(true);
        toast.success('Abonnement validé !', {
          description: channels.includes('EMAIL')
            ? `Un courriel officiel récapitulatif a été envoyé à ${email}.`
            : 'Vos alertes push sont configurées.',
        });

        // Trigger welcome notification if push active
        if (channels.includes('PUSH') && (pushStatus === 'granted' || Notification.permission === 'granted')) {
          eventNotificationService.triggerBrowserNotification(
            '🔔 Abonnement Confirmé · Collège Isaac Newton',
            {
              body: `Bonjour ${fullName}, vous recevrez des alertes avant les épreuves du 1er Contrôle (9 au 13 nov. 2026).`,
            }
          );
        }
      } else {
        toast.error('Erreur', { description: result.message || 'Impossible d’enregistrer l’abonnement.' });
      }
    } catch (err: any) {
      toast.error('Erreur technique', { description: err.message });
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
      toast.info('Vos rappels d’épreuves ont été désactivés.');
      onClose();
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
        className="relative w-full max-w-xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 text-white p-4 sm:p-5 flex items-start justify-between relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="space-y-1 relative z-10 pr-6">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-xs">
                <Sparkles className="w-3 h-3" />
                Service d'Alerte Officiel
              </span>
              <span className="text-[11px] font-mono text-amber-300 font-semibold">
                Contrôles 2026–2027
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-serif font-bold text-white tracking-tight flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Abonnement aux Rappels d'Épreuves</span>
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed font-light">
              Recevez les horaires détaillés et les avis de la direction par e-mail ou notification push avant chaque session d'examens.
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
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">

          {/* ACTIVE SUBSCRIPTION CARD (IF ALREADY SUBSCRIBED) */}
          {existingSub && !isSuccess && (
            <div className="bg-emerald-50/90 border border-emerald-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-emerald-950">
                      Abonnement Actif · {existingSub.fullName}
                    </h4>
                    <p className="text-[11.5px] text-emerald-800">
                      Alertes programmées pour : <strong>{existingSub.level}</strong>
                    </p>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded-full bg-emerald-200/60 text-emerald-900 text-[10px] font-bold font-mono shrink-0">
                  CONFIRMÉ
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-emerald-200/60">
                <button
                  type="button"
                  onClick={handleSendTestPush}
                  disabled={isTestingPush}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                >
                  {isTestingPush ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Volume2 className="w-3.5 h-3.5" />
                  )}
                  <span>Tester une alerte push</span>
                </button>

                <button
                  type="button"
                  onClick={handleUnsubscribe}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-rose-700 font-medium text-xs border border-rose-200 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>Désactiver mes rappels</span>
                </button>
              </div>
            </div>
          )}

          {/* SUCCESS VIEW */}
          {isSuccess ? (
            <div className="py-6 px-4 text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-md">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h4 className="font-serif font-bold text-lg text-slate-900">
                  Abonnement Confirmé avec Succès !
                </h4>
                <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                  Merci <strong>{fullName}</strong>. Vous recevrez automatiquement les horaires et consignes officielles avant le début des épreuves du <strong>1er Contrôle (9 au 13 Novembre 2026)</strong>.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left max-w-md mx-auto space-y-2 text-xs text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500">Canaux activés :</span>
                  <span className="font-semibold text-slate-900">{channels.join(' & ')}</span>
                </div>
                {email && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Courriel officiel :</span>
                    <span className="font-mono font-semibold text-blue-900">{email}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Cycle suivi :</span>
                  <span className="font-semibold text-slate-900">{level}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Rappels programmés :</span>
                  <span className="font-semibold text-slate-900">48h avant + Veille + Matin</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={handleSendTestPush}
                  disabled={isTestingPush}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-xs transition-colors cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Tester une alerte push</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  Terminer
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* 1. ROLE SELECTOR */}
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

              {/* 2. IDENTITY FIELDS */}
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
                    placeholder="Ex: Marc-Aurèle Pierre"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800">
                    Classe ou Cycle suivi
                  </label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600 bg-white"
                  >
                    <option value="ALL">Tous les cycles (3e Cycle & Secondaire)</option>
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

              {/* 3. CHANNELS SELECTOR */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
                  2. Canaux de rappel souhaités :
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
                        Grille complète, fiches matière et horaires en pièce jointe.
                      </p>
                    </div>
                  </div>

                  {/* Channel: Push Notification */}
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
                        <span className="font-bold text-xs">Notification Push</span>
                        <input
                          type="checkbox"
                          checked={channels.includes('PUSH')}
                          onChange={() => {}}
                          className="rounded text-amber-500"
                        />
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Alerte directe sur mobile & ordinateur (PWA).
                      </p>
                    </div>
                  </div>
                </div>

                {/* Conditional Email Field */}
                {channels.includes('EMAIL') && (
                  <div className="space-y-1 pt-1 animate-fade-in">
                    <label className="block text-xs font-bold text-slate-800">
                      Adresse e-mail de réception <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="votre.email@domaine.com"
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                    />
                    <p className="text-[10px] text-slate-500">
                      Votre adresse est strictement confidentielle et réservée aux alertes pédagogiques.
                    </p>
                  </div>
                )}

                {/* Push Notification Permission Notice & Action */}
                {channels.includes('PUSH') && pushStatus !== 'granted' && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center justify-between gap-2 text-xs text-amber-900 animate-fade-in">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                      <span>Autorisez le navigateur pour recevoir les alertes sur cet appareil.</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRequestPushPermission}
                      className="shrink-0 px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-[11px] transition-colors cursor-pointer"
                    >
                      Autoriser
                    </button>
                  </div>
                )}
              </div>

              {/* 4. NOTIFICATION TIMING */}
              <div className="space-y-1.5 pt-1">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
                  3. Fréquence des alertes :
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'ALL' as ReminderTiming, label: 'Toutes les alertes', hint: 'Recommandé' },
                    { id: '48H' as ReminderTiming, label: '48h avant', hint: 'J-2' },
                    { id: '24H' as ReminderTiming, label: 'La veille', hint: 'Soir (J-1)' },
                    { id: 'SAME_DAY' as ReminderTiming, label: 'Le matin', hint: '06h45' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setNotifyTiming(t.id)}
                      className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                        notifyTiming === t.id
                          ? 'bg-blue-900 text-white border-blue-900 shadow-2xs'
                          : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      <div className="font-bold text-[11px] leading-tight">{t.label}</div>
                      <div className={`text-[10px] ${notifyTiming === t.id ? 'text-amber-300' : 'text-slate-400'}`}>
                        {t.hint}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 5. CONTROLS COVERED */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 uppercase tracking-wider font-mono">
                    4. Sessions concernées :
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {selectedControls.length}/4 sélectionnées
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 1, label: '1er Contrôle', date: '9-13 Nov 2026' },
                    { id: 2, label: '2e Contrôle', date: '25-29 Jan 2027' },
                    { id: 3, label: '3e Contrôle', date: '12-16 Avr 2027' },
                    { id: 4, label: '4e Contrôle', date: '31 Mai-4 Juin' },
                  ].map((ctrl) => {
                    const isChecked = selectedControls.includes(ctrl.id);
                    return (
                      <button
                        key={ctrl.id}
                        type="button"
                        onClick={() => toggleControl(ctrl.id)}
                        className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                          isChecked
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-slate-50 text-slate-400 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[11px]">{ctrl.label}</span>
                          <span className={`w-2 h-2 rounded-full ${isChecked ? 'bg-amber-400' : 'bg-slate-300'}`} />
                        </div>
                        <div className="text-[10px] opacity-75 mt-0.5">{ctrl.date}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ACTION SUBMIT BUTTON */}
              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Annuler
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

        {/* FOOTER */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-900" />
            <span>Infrastructure Sécurisée SMTP & Web Push · Collège Isaac Newton</span>
          </span>
          <span className="font-mono text-slate-400 hidden sm:inline">Delmas 50</span>
        </div>

      </div>
    </div>
  );
};
