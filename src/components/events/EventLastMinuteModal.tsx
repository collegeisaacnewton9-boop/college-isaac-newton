import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Clock, 
  Calendar, 
  MapPin, 
  X, 
  Send, 
  Copy, 
  Check, 
  Sparkles, 
  MessageSquare, 
  Edit3, 
  Save, 
  Loader2 
} from 'lucide-react';
import { toast } from 'sonner';
import { SchoolEvent } from '../../types';
import { apiService } from '../../services/api';

interface EventLastMinuteModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: SchoolEvent | null;
  onEventUpdated?: (updated: SchoolEvent) => void;
  isAdmin?: boolean;
  defaultTab?: 'reminder' | 'edit';
}

export const EventLastMinuteModal: React.FC<EventLastMinuteModalProps> = ({
  isOpen,
  onClose,
  event,
  onEventUpdated,
  isAdmin = false,
  defaultTab = 'reminder',
}) => {
  const [activeTab, setActiveTab] = useState<'reminder' | 'edit'>(defaultTab);
  const [isCopied, setIsCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Edit form state
  const [title, setTitle] = useState(event?.title || '');
  const [startDate, setStartDate] = useState(event?.startDate || '');
  const [location, setLocation] = useState(event?.location || '');
  const [lastMinuteNotice, setLastMinuteNotice] = useState('');

  // Update local form state when event or defaultTab changes
  React.useEffect(() => {
    if (event) {
      setTitle(event.title);
      setStartDate(event.startDate);
      setLocation(event.location);
    }
  }, [event]);

  React.useEffect(() => {
    if (isOpen && defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [isOpen, defaultTab]);

  if (!isOpen || !event) return null;

  const eventDateObj = new Date(event.startDate);
  const formattedDate = !isNaN(eventDateObj.getTime())
    ? eventDateObj.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : event.startDate;

  const formattedTime = !isNaN(eventDateObj.getTime())
    ? eventDateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    : '';

  // Calculate remaining hours
  const now = new Date();
  const diffMs = new Date(event.startDate).getTime() - now.getTime();
  const hoursLeft = Math.max(0, Math.round(diffMs / (1000 * 60 * 60)));

  // Pre-formatted reminder message for WhatsApp / Email / SMS
  const reminderMessage = `🔔 *RAPPEL IMPORTANT · COLLÈGE ISAAC NEWTON*\n\n` +
    `L'événement officiel suivant a lieu dans moins de 48 heures :\n` +
    `📅 *${event.title}*\n` +
    `🗓 Date : ${formattedDate} à ${formattedTime}\n` +
    `📍 Lieu : ${event.location || 'Campus Delmas 50'}\n` +
    (lastMinuteNotice ? `⚠️ *Note importante* : ${lastMinuteNotice}\n` : '') +
    `\nPour toute information : Direction Collège Isaac Newton (+509 3316-0934).`;

  const handleCopyReminder = async () => {
    try {
      await navigator.clipboard.writeText(reminderMessage);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
      toast.success('Texte du rappel copié dans le presse-papiers !');
    } catch {
      toast.error('Impossible de copier le texte.');
    }
  };

  const handleShareWhatsApp = () => {
    const encoded = encodeURIComponent(reminderMessage);
    const url = `https://wa.me/?text=${encoded}`;
    window.open(url, '_blank');
  };

  const handleSaveQuickUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !startDate) return;

    setIsSaving(true);
    try {
      const updatedPayload: Partial<SchoolEvent> = {
        title,
        startDate,
        location,
        description: lastMinuteNotice 
          ? `${event.description}\n\n[Mise à jour dernière minute] : ${lastMinuteNotice}` 
          : event.description,
      };

      const result = await apiService.updateEvent(event.id, updatedPayload);
      if (result) {
        toast.success('Mise à jour de dernière minute enregistrée avec succès !');
        if (onEventUpdated) {
          onEventUpdated(result);
        }
        window.dispatchEvent(new CustomEvent('cin:events-updated', { detail: result }));
        onClose();
      }
    } catch (err: any) {
      toast.error('Erreur lors de la mise à jour', { description: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in font-sans">
      <div 
        className="relative w-full max-w-xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950 text-white p-4 sm:p-5 flex items-start justify-between relative overflow-hidden">
          <div className="space-y-1 relative z-10">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-400" />
                <span>Échéance Imminente (&lt; 48H)</span>
              </span>
              <span className="text-[11px] font-mono text-slate-300">
                {hoursLeft > 0 ? `Dans ${hoursLeft}h` : 'En cours'}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-white tracking-tight line-clamp-1">
              {event.title}
            </h3>
            <p className="text-xs text-slate-300 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{formattedDate} à {formattedTime}</span>
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer relative z-10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* TABS SELECTOR (RAPPEL VS MODIFICATION) */}
        {isAdmin && (
          <div className="flex border-b border-slate-100 bg-slate-50 p-1.5 gap-1 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('reminder')}
              className={`flex-1 py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'reminder'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Send className="w-3.5 h-3.5 text-amber-600" />
              <span>Envoyer un Rappel Rapide</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('edit')}
              className={`flex-1 py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'edit'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5 text-blue-600" />
              <span>Ajustement Dernière Minute</span>
            </button>
          </div>
        )}

        {/* MODAL CONTENT */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'reminder' ? (
            <div className="space-y-4">
              <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-3.5 text-xs text-amber-950 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-amber-900">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Rappel automatique prêt à être diffusé</span>
                </div>
                <p className="text-[11.5px] text-amber-800 leading-relaxed">
                  Cet événement a lieu dans moins de 48 heures. Utilisez ce modèle pour informer immédiatement les familles d'élèves ou vos groupes WhatsApp.
                </p>
              </div>

              {/* MESSAGE PREVIEW BOX */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Aperçu du message de rappel :
                </label>
                <div className="p-3.5 rounded-2xl bg-slate-900 text-slate-100 font-mono text-[11px] leading-relaxed whitespace-pre-wrap border border-slate-800 shadow-inner">
                  {reminderMessage}
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Diffuser sur WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyReminder}
                  className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer border border-slate-200"
                >
                  {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{isCopied ? 'Copié !' : 'Copier le texte'}</span>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSaveQuickUpdate} className="space-y-3.5">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-800">
                  Titre de l'événement
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800">
                    Date & Heure de début
                  </label>
                  <input
                    type="datetime-local"
                    value={startDate ? startDate.slice(0, 16) : ''}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800">
                    Lieu
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                    placeholder="Ex: Auditorium, Cour..."
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-800">
                  Consigne spéciale de dernière minute (optionnel)
                </label>
                <textarea
                  value={lastMinuteNotice}
                  onChange={(e) => setLastMinuteNotice(e.target.value)}
                  rows={2}
                  placeholder="Ex: Entrée par la barrière #2 bis, port de l'uniforme requis..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>Enregistrer la mise à jour</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>Système d'Alerte Imminente &middot; Collège Isaac Newton</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
