import React, { useState, useEffect, useCallback } from 'react';
import { 
  MessageCircle, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Loader2, 
  ShieldCheck, 
  Phone, 
  User, 
  Sparkles, 
  Copy, 
  ExternalLink, 
  Info, 
  HelpCircle, 
  Clock, 
  Trash2, 
  Check, 
  AlertCircle,
  FileCheck,
  Shield,
  Zap,
  Globe,
  Radio,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  SiteSettings, 
  WhatsAppNotificationLog, 
  WhatsAppDiagnosticSummary, 
  WhatsAppLogType, 
  WhatsAppDeliveryStatus 
} from '../../types';
import { apiService } from '../../services/api';

interface WhatsAppDiagnosticViewProps {
  settings?: SiteSettings | null;
  onNavigateToSettings?: () => void;
  className?: string;
}

export const WhatsAppDiagnosticView: React.FC<WhatsAppDiagnosticViewProps> = ({
  settings,
  onNavigateToSettings,
  className = '',
}) => {
  // Configured line from settings or fallback
  const plannedPhone = settings?.whatsappConfig?.directionPhone || '+509 3316-0934';
  const holderName = settings?.whatsappConfig?.holderName || 'Orphe Jean Marie · Directeur fondateur';
  const isConfigVerified = Boolean(settings?.whatsappConfig?.isVerified);

  // Test console form state
  const [testPhone, setTestPhone] = useState(plannedPhone);
  const [testNote, setTestNote] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [lastTestResult, setLastTestResult] = useState<{
    token: string;
    url: string;
    operator?: string;
  } | null>(null);

  // Popup test state
  const [popupTestStatus, setPopupTestStatus] = useState<'idle' | 'allowed' | 'blocked'>('idle');

  // Logs & Summary state
  const [summary, setSummary] = useState<WhatsAppDiagnosticSummary | null>(null);
  const [logs, setLogs] = useState<WhatsAppNotificationLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);
  const [logFilter, setLogFilter] = useState<'ALL' | 'PRE_REGISTRATION_ALERT' | 'TEST_DISPATCH' | 'WAITING'>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Sync testPhone with settings if changed
  useEffect(() => {
    if (settings?.whatsappConfig?.directionPhone) {
      setTestPhone(settings.whatsappConfig.directionPhone);
    }
  }, [settings?.whatsappConfig?.directionPhone]);

  // Load WhatsApp logs and summary
  const fetchLogs = useCallback(async () => {
    setIsLoadingLogs(true);
    try {
      const data = await apiService.getWhatsAppLogs();
      setSummary(data.summary);
      setLogs(data.logs);
    } catch {
      toast.error('Impossible de charger les logs WhatsApp');
    } finally {
      setIsLoadingLogs(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Handle Send Test Message to configured phone
  const handleTriggerTestMessage = async () => {
    setIsTesting(true);
    try {
      const cleanDigits = testPhone.replace(/[^0-9]/g, '');
      if (cleanDigits.length < 8) {
        toast.error('Veuillez renseigner un numéro de téléphone valide');
        setIsTesting(false);
        return;
      }

      const res = await apiService.sendWhatsAppTestMessage(testPhone, testNote || undefined);
      setLastTestResult({
        token: res.testToken,
        url: res.deepLinkUrl,
        operator: res.diagnostic?.operator,
      });

      // Attempt to open WhatsApp deep link
      const win = window.open(res.deepLinkUrl, '_blank');
      if (!win || win.closed || typeof win.closed === 'undefined') {
        toast.warning('Fenêtre WhatsApp bloquée par le navigateur', {
          description: 'Votre navigateur a restreint l\'ouverture automatique. Cliquez sur le lien généré ci-dessous.',
        });
      } else {
        toast.success(`Message test déclenché vers ${testPhone} !`, {
          description: `Token de certification : ${res.testToken}`,
        });
      }

      await fetchLogs();
    } catch (err: any) {
      toast.error('Échec du test de notification', {
        description: err.message || 'Erreur serveur',
      });
    } finally {
      setIsTesting(false);
    }
  };

  // Simulate an admission alert dispatch
  const handleSimulateAdmission = async () => {
    setIsTesting(true);
    try {
      const sampleNum = `CIN-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const cleanDigits = testPhone.replace(/[^0-9]/g, '');
      const cleanPhone = cleanDigits.startsWith('509') ? cleanDigits : `509${cleanDigits}`;

      const waText = 
        `*SIMULATION DIAGNOSTIC — PRÉINSCRIPTION COLLÈGE ISAAC NEWTON*\n\n` +
        `📋 *Dossier :* ${sampleNum}\n` +
        `👤 *Élève :* PIERRE-LOUIS Marie-France\n` +
        `🎯 *Classe :* 3ème Année Fondamentale (1er Cycle)\n` +
        `🎂 *Date de Naissance :* 14/05/2018\n` +
        `👨‍👩‍👧 *Parent :* Pierre-Louis Ronald (Père)\n` +
        `📞 *Téléphone Parent :* +509 3712-3456\n` +
        `📧 *E-mail :* ronald.plouis@gmail.com\n` +
        `🏫 *École précédente :* Institution Saint-Louis de Gonzague\n\n` +
        `ℹ️ Ce message simule le format exact généré après la soumission du formulaire de préinscription.`;

      const deepLinkUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waText)}`;

      await apiService.logWhatsAppEvent({
        type: 'TEST_DISPATCH',
        recipientRole: 'DIRECTOR_EXPERT',
        recipientPhone: testPhone,
        applicationNumber: sampleNum,
        studentName: 'PIERRE-LOUIS Marie-France',
        status: 'TEST_CONFIRMED',
        details: `Simulation d'une alerte d'admission transmise au numéro planifié ${testPhone}.`,
        diagnosticNotes: `Test d'acheminement réussi. Message pré-rempli prêt pour expédition WhatsApp.`,
        messagePreview: waText.slice(0, 160) + '...',
      });

      window.open(deepLinkUrl, '_blank');
      toast.success('Simulation d\'alerte ouverte dans WhatsApp !', {
        description: `Dossier ${sampleNum} transmis vers le ${testPhone}.`,
      });

      await fetchLogs();
    } catch (err: any) {
      toast.error('Erreur simulation', { description: err.message });
    } finally {
      setIsTesting(false);
    }
  };

  // Test browser popup behavior
  const handleTestPopupBlocker = () => {
    try {
      const testWin = window.open('about:blank', '_blank', 'width=100,height=100');
      if (!testWin || testWin.closed || typeof testWin.closed === 'undefined') {
        setPopupTestStatus('blocked');
        toast.warning('Blocage détecté !', {
          description: 'Votre navigateur bloque les popups automatiques. C\'est la raison principale pour laquelle WhatsApp ne s\'ouvre pas tout seul après la préinscription.',
        });
      } else {
        testWin.close();
        setPopupTestStatus('allowed');
        toast.info('Popups autorisés dans ce navigateur', {
          description: 'Les popups directs fonctionnent, mais les popups différés après une requête réseau peuvent quand même être bloqués.',
        });
      }
    } catch {
      setPopupTestStatus('blocked');
    }
  };

  // Clear logs
  const handleClearLogs = async () => {
    if (confirm('Voulez-vous réinitialiser le journal des notifications WhatsApp ?')) {
      await apiService.clearWhatsAppLogs();
      toast.success('Journal WhatsApp réinitialisé');
      await fetchLogs();
    }
  };

  // Copy text helper
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
    toast.success('Texte copié dans le presse-papier');
  };

  // Filtered logs
  const filteredLogs = logs.filter(item => {
    if (logFilter === 'ALL') return true;
    if (logFilter === 'WAITING') return item.status === 'WAITING_USER_DISPATCH';
    return item.type === logFilter;
  });

  return (
    <div className={`space-y-4 animate-fade-in ${className}`}>
      
      {/* Header Banner */}
      <div className="bg-linear-to-r from-slate-900 via-blue-950 to-slate-900 rounded-2xl p-4 sm:p-6 text-white border border-slate-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10.5px] font-mono font-bold flex items-center gap-1.5">
                <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                Passerelle WhatsApp & Diagnostic
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                Ligne : {plannedPhone}
              </span>
            </div>
            <h1 className="font-serif text-lg sm:text-2xl font-bold tracking-tight">
              Centre de Diagnostic & Test des Notifications WhatsApp
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Outil officiel pour vérifier la délivrance des alertes de préinscription, diagnostiquer les blocages de navigateurs et déclencher des messages de test vers la ligne de la Direction.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              type="button"
              onClick={fetchLogs}
              disabled={isLoadingLogs}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingLogs ? 'animate-spin text-amber-400' : ''}`} />
              <span>Actualiser les Logs</span>
            </button>

            {onNavigateToSettings && (
              <button
                type="button"
                onClick={onNavigateToSettings}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Modifier le Numéro dans les Paramètres</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick KPI stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5 pt-4 border-t border-slate-800 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Numéro Officiel Planifié</span>
            <span className="font-mono font-bold text-emerald-400 text-sm mt-0.5 block truncate">{plannedPhone}</span>
            <span className="text-[10px] text-slate-400 block truncate">{holderName}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Statut Certification BDD</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <ShieldCheck className={`w-4 h-4 ${isConfigVerified ? 'text-emerald-400' : 'text-amber-400'}`} />
              <span className={`font-bold text-sm ${isConfigVerified ? 'text-emerald-300' : 'text-amber-300'}`}>
                {isConfigVerified ? 'Certifié Actif' : 'Non Vérifié'}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block">Sauvegardé dans PostgreSQL</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Alertes Traitées</span>
            <span className="font-mono font-bold text-white text-sm mt-0.5 block">
              {summary?.totalAlertsAttempted ?? logs.length}
            </span>
            <span className="text-[10px] text-slate-400 block">Historique complet des envois</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Diagnostic Navigateur</span>
            <span className="font-bold text-amber-400 text-xs mt-0.5 block flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>Action Parent Requise</span>
            </span>
            <span className="text-[10px] text-slate-400 block">Contrainte anti-popups web</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 1 : DIAGNOSTIC TECHNIQUE DÉTAILLÉ
          POURQUOI LES NOTIFICATIONS NE PARVIENNENT PAS APRÈS UNE PRÉINSCRIPTION ?
      ========================================================================= */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-start gap-3 border-b border-slate-100 pb-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200 shadow-2xs">
            <HelpCircle className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h2 className="font-serif text-sm sm:text-base font-bold text-slate-900">
              Diagnostic Technique : Pourquoi le message WhatsApp n'arrive-t-il pas automatiquement sur le téléphone ?
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Analyse complète du comportement des navigateurs et des protocoles WhatsApp Web.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs leading-relaxed">
          
          {/* Raison 1 */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-rose-700 font-bold">
              <span className="w-5 h-5 rounded-full bg-rose-100 flex items-center justify-center text-[10px]">1</span>
              <span>Blocage Anti-Popups Navigateur</span>
            </div>
            <p className="text-slate-600 text-[11.5px]">
              Lorsqu'un parent valide sa préinscription, le site enregistre le dossier sur le serveur via une requête asynchrone (<code>await api.submitAdmission</code>).
            </p>
            <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 text-[10.5px]">
              <strong>Conséquence :</strong> Les navigateurs modernes (Chrome Android, Safari iOS) bloquent l'ouverture automatique de WhatsApp car ils considèrent toute ouverture post-requête comme un popup non consenti.
            </div>
          </div>

          {/* Raison 2 */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-blue-900 font-bold">
              <span className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-[10px]">2</span>
              <span>WhatsApp sans API Payante</span>
            </div>
            <p className="text-slate-600 text-[11.5px]">
              WhatsApp n'autorise aucun site web public à expédier des messages en arrière-plan sans passer par l'application WhatsApp du téléphone de l'utilisateur.
            </p>
            <div className="p-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-950 text-[10.5px]">
              <strong>Fonctionnement normal :</strong> Le site prépare le lien universel <code>wa.me/509...</code> avec le texte officiel pré-rempli. L'utilisateur doit appuyer sur « Envoyer ».
            </div>
          </div>

          {/* Raison 3 */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-emerald-800 font-bold">
              <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-[10px]">3</span>
              <span>Action Requise sur le Récépissé</span>
            </div>
            <p className="text-slate-600 text-[11.5px]">
              Dès la fin de la préinscription, un écran vert de succès apparaît avec la référence du dossier et un bouton direct vers le Directeur.
            </p>
            <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-950 text-[10.5px]">
              <strong>Solution immédiate :</strong> Le parent ou l'administrateur clique sur <strong>« Ouvrir WhatsApp & Envoyer à la Direction »</strong> pour transmettre le dossier en 1 clic.
            </div>
          </div>

        </div>

        {/* Interactive Popup Blocker Test */}
        <div className="p-3 rounded-xl bg-linear-to-r from-amber-50 to-orange-50 border border-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
            <div>
              <strong className="text-slate-900 block font-semibold">
                Testez la politique de popup de votre navigateur actuel
              </strong>
              <span className="text-[11px] text-slate-600">
                Vérifiez si Chrome ou Safari autorise l'ouverture de fenêtres externes sur votre appareil.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {popupTestStatus === 'blocked' && (
              <span className="px-2 py-1 rounded-md bg-rose-100 text-rose-800 text-[11px] font-bold border border-rose-300">
                ⚠️ Bloqué par votre navigateur
              </span>
            )}
            {popupTestStatus === 'allowed' && (
              <span className="px-2 py-1 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-300">
                ✓ Fenêtres autorisées
              </span>
            )}
            <button
              type="button"
              onClick={handleTestPopupBlocker}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-950 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              Lancer le test de popup
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 2 : CONSOLE DE TEST DE NOTIFICATION EN TEMPS RÉEL
      ========================================================================= */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200 shadow-2xs">
              <Send className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="font-serif text-sm sm:text-base font-bold text-slate-900">
                Console de Test : Déclencher un Message vers le Numéro Configuré
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Simulez l'envoi d'une notification WhatsApp et vérifiez que votre application WhatsApp la réceptionne.
              </p>
            </div>
          </div>

          <span className="text-[11px] font-mono font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
            Numéro cible : {testPhone}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          
          {/* Target Phone input */}
          <div>
            <label className="font-bold text-slate-700 block mb-1 uppercase tracking-wide text-[11px] flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              <span>Numéro WhatsApp à Tester *</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder="+509 3316-0934"
                className="w-full py-2.5 px-3 rounded-xl border border-slate-300 font-mono font-bold text-xs sm:text-sm text-slate-900 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none bg-slate-50/50"
              />
              <span className="absolute right-3 top-2.5 text-[10px] text-slate-400 font-mono">
                Haïti (+509)
              </span>
            </div>
            <p className="text-[10.5px] text-slate-500 mt-1">
              Numéro officiel configuré pour la Direction : <strong>{plannedPhone}</strong> ({holderName}).
            </p>
          </div>

          {/* Optional custom note */}
          <div>
            <label className="font-bold text-slate-700 block mb-1 uppercase tracking-wide text-[11px] flex items-center gap-1.5">
              <MessageCircle className="w-3.5 h-3.5 text-blue-900" />
              <span>Texte Complémentaire (Facultatif)</span>
            </label>
            <input
              type="text"
              value={testNote}
              onChange={(e) => setTestNote(e.target.value)}
              placeholder="Ex : Test de liaison par l'Expert technique du Collège"
              className="w-full py-2.5 px-3 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 focus:border-blue-900 focus:ring-1 focus:ring-blue-900 outline-none bg-slate-50/50"
            />
            <p className="text-[10.5px] text-slate-500 mt-1">
              Sera inclus avec le token unique de certification dans le message.
            </p>
          </div>

        </div>

        {/* Action Trigger Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <button
            type="button"
            onClick={handleTriggerTestMessage}
            disabled={isTesting}
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            {isTesting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Génération du message de test...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Déclencher le Message de Test WhatsApp vers {testPhone}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleSimulateAdmission}
            disabled={isTesting}
            className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-950 text-white font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
            title="Génère une alerte identique à celle d'une vraie préinscription"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Simuler une Vraie Préinscription</span>
          </button>
        </div>

        {/* Test Result Box if tested */}
        {lastTestResult && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-950 space-y-2 animate-fade-in">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="font-bold flex items-center gap-1.5 text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Lien de Test Officiel Généré : Token {lastTestResult.token}
              </span>
              {lastTestResult.operator && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 font-mono text-[10px] font-bold">
                  {lastTestResult.operator}
                </span>
              )}
            </div>

            <p className="text-[11px] text-slate-700">
              Si votre navigateur a bloqué l'ouverture automatique, cliquez ci-dessous pour ouvrir directement WhatsApp :
            </p>

            <div className="flex items-center gap-2 pt-1 flex-wrap">
              <a
                href={lastTestResult.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Ouvrir dans WhatsApp Web / Mobile</span>
              </a>

              <button
                type="button"
                onClick={() => handleCopy(lastTestResult.url, 'last-url')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-emerald-300 text-emerald-900 hover:bg-emerald-100/50 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedId === 'last-url' ? 'Lien Copié !' : 'Copier le Lien Direct'}</span>
              </button>
            </div>
          </div>
        )}

      </div>

      {/* =========================================================================
          SECTION 3 : JOURNAL DES NOTIFICATIONS WHATSAPP & AUDIT TECHNIQUE
      ========================================================================= */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center shrink-0 border border-slate-200 shadow-2xs">
              <Clock className="w-5 h-5 text-slate-700" />
            </div>
            <div>
              <h2 className="font-serif text-sm sm:text-base font-bold text-slate-900">
                Journal des Notifications WhatsApp & Diagnostics
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Historique chronologique des alertes générées, des tests et des tentatives d'expédition.
              </p>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 text-xs flex-wrap">
            <button
              type="button"
              onClick={() => setLogFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                logFilter === 'ALL' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Tous ({logs.length})
            </button>
            <button
              type="button"
              onClick={() => setLogFilter('PRE_REGISTRATION_ALERT')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                logFilter === 'PRE_REGISTRATION_ALERT' ? 'bg-blue-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Préinscriptions
            </button>
            <button
              type="button"
              onClick={() => setLogFilter('TEST_DISPATCH')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                logFilter === 'TEST_DISPATCH' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Tests
            </button>
            <button
              type="button"
              onClick={() => setLogFilter('WAITING')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                logFilter === 'WAITING' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              En attente
            </button>

            <button
              type="button"
              onClick={handleClearLogs}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors ml-1 cursor-pointer"
              title="Vider les tests"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Logs Table */}
        {isLoadingLogs ? (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-amber-500" />
            <p className="text-xs">Chargement du journal des notifications...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <MessageCircle className="w-8 h-8 mx-auto text-slate-300 stroke-1" />
            <p className="text-xs font-semibold text-slate-600">Aucun log dans cette catégorie</p>
            <p className="text-[11px] text-slate-400">Déclenchez un test ci-dessus pour observer l'enregistrement en temps réel.</p>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
            {filteredLogs.map((log) => {
              const isTest = log.type === 'TEST_DISPATCH' || log.type === 'DIAGNOSTIC_CHECK';
              const isWaiting = log.status === 'WAITING_USER_DISPATCH';
              const isSuccess = log.status === 'SUCCESS_DEEP_LINK' || log.status === 'TEST_CONFIRMED';

              return (
                <div 
                  key={log.id}
                  className="p-3 sm:p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/60 hover:bg-white transition-all space-y-2 text-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-slate-200/60 pb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold font-mono ${
                        isTest 
                          ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                          : 'bg-blue-100 text-blue-900 border border-blue-200'
                      }`}>
                        {log.type}
                      </span>

                      {log.applicationNumber && (
                        <span className="font-mono font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md text-[10px]">
                          {log.applicationNumber}
                        </span>
                      )}

                      {log.studentName && (
                        <span className="font-bold text-slate-800">
                          {log.studentName}
                        </span>
                      )}

                      <span className={`px-2 py-0.5 rounded-full text-[9.5px] font-bold ${
                        isSuccess
                          ? 'bg-emerald-100 text-emerald-800'
                          : isWaiting
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {isSuccess ? '✓ Validé / Expédié' : isWaiting ? '⚡ Action Parent Requise' : log.status}
                      </span>
                    </div>

                    <span className="text-[10px] font-mono text-slate-400">
                      {new Date(log.timestamp).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                  </div>

                  <div className="space-y-1 text-slate-600">
                    <p className="text-[11.5px] font-medium text-slate-800">
                      {log.details}
                    </p>
                    <p className="text-[11px] text-slate-500 italic bg-amber-50/50 p-2 rounded-lg border border-amber-100">
                      ℹ️ {log.diagnosticNotes}
                    </p>
                    {log.messagePreview && (
                      <div className="p-2 rounded-lg bg-slate-100 font-mono text-[10px] text-slate-700 truncate">
                        "{log.messagePreview}"
                      </div>
                    )}
                  </div>

                  {/* Log Action Bar */}
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/50 text-[11px] flex-wrap">
                    <span className="text-slate-500 font-mono">
                      Destinataire : <strong>{log.recipientPhone}</strong> ({log.recipientRole})
                    </span>

                    <div className="flex items-center gap-1.5">
                      <a
                        href={`https://wa.me/${log.recipientPhoneClean}?text=${encodeURIComponent(log.messagePreview || '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[10.5px] transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Ouvrir sur WhatsApp</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => handleCopy(log.messagePreview || '', log.id)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-[10.5px] cursor-pointer"
                      >
                        <Copy className="w-3 h-3 text-slate-500" />
                        <span>{copiedId === log.id ? 'Copié' : 'Copier'}</span>
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* =========================================================================
          SECTION 4 : RAPPEL DES PIÈCES PHYSIQUES OBLIGATOIRES POUR L'INSCRIPTION
      ========================================================================= */}
      <div className="bg-gradient-to-br from-amber-50 via-amber-100/30 to-amber-50 rounded-2xl p-4 sm:p-5 border-2 border-amber-300 shadow-xs space-y-3 text-xs text-amber-950">
        <div className="flex items-center justify-between gap-2 flex-wrap border-b border-amber-200 pb-2">
          <div className="flex items-center gap-2 font-bold text-amber-950">
            <FileCheck className="w-4 h-4 text-amber-700 shrink-0" />
            <span>Rappel Officiel : Pièces physiques obligatoires pour finaliser l'admission</span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-amber-300 text-amber-950 text-[10px] font-bold font-mono">
            Dépôt physique à Delmas 50
          </span>
        </div>

        <p className="text-[11.5px] text-amber-900 leading-relaxed font-medium">
          Même si le parent a préinscrit son enfant en ligne et que la référence a été générée, <strong>l'inscription définitive ne sera validée qu'après le dépôt en main propre de l'ensemble des pièces obligatoires</strong> au secrétariat :
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-slate-800">
          <div className="p-2 rounded-lg bg-white border border-amber-200 flex items-start gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
            <span><strong>1. Extrait d'acte de naissance</strong> (original ou extrait légalisé).</span>
          </div>
          <div className="p-2 rounded-lg bg-white border border-amber-200 flex items-start gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
            <span><strong>2. 4 photos d'identité récentes</strong> identiques format passeport.</span>
          </div>
          <div className="p-2 rounded-lg bg-white border border-amber-200 flex items-start gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
            <span><strong>3. Bulletins des 2 dernières années</strong> (obligatoires dès la 1ère AF).</span>
          </div>
          <div className="p-2 rounded-lg bg-white border border-amber-200 flex items-start gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
            <span><strong>4. Certificat de passage officiel</strong> (si admission en classe supérieure).</span>
          </div>
          <div className="p-2 rounded-lg bg-white border border-amber-200 flex items-start gap-2 sm:col-span-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
            <span><strong>5. Fiche vaccinale / médicale & Pièce d'identité</strong> du tuteur légal (CIN ou Passeport).</span>
          </div>
        </div>

        <div className="p-2 rounded-lg bg-amber-200/60 border border-amber-300 text-[11px] text-amber-950 flex items-center justify-between flex-wrap gap-2">
          <span>Secrétariat : <strong>Delmas 50, rue Dominique #2 bis, Port-au-Prince</strong></span>
          <span className="font-mono font-bold">Ligne WhatsApp officielle : {plannedPhone}</span>
        </div>
      </div>

    </div>
  );
};
