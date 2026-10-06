import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, MessageCircle, Clock, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import { SCHOOL_INFO } from '../../data/mockData';

// Sanitized international phone number for WhatsApp API (no spaces, dashes or plus sign)
const WHATSAPP_PHONE_CLEAN = '50937211818';
const WHATSAPP_DISPLAY_PHONE = '+509 3721-1818';

interface QuickQuestion {
  id: string;
  icon: string;
  label: string;
  message: string;
}

const QUICK_QUESTIONS: QuickQuestion[] = [
  {
    id: 'admissions',
    icon: '🎓',
    label: 'Admissions 2026-2027',
    message: 'Bonjour Collège Isaac Newton, je souhaite obtenir des informations concernant les admissions et la préinscription pour l\'année scolaire 2026-2027.',
  },
  {
    id: 'tarifs',
    icon: '📋',
    label: 'Frais & Pièces requises',
    message: 'Bonjour, pouvez-vous me communiquer les frais de scolarité ainsi que la liste des pièces requises pour l\'inscription ?',
  },
  {
    id: 'visite',
    icon: '🏫',
    label: 'Visiter le campus',
    message: 'Bonjour, j\'aimerais visiter vos installations scolaires et le laboratoire informatique au campus de Delmas 50.',
  },
  {
    id: 'examens',
    icon: '⭐',
    label: 'Cycles 9e AF & NS4',
    message: 'Bonjour, je souhaiterais des renseignements sur la préparation aux examens d\'État (9e AF / Nouveau Secondaire 4).',
  },
];

export const WhatsAppFloatingButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  const [hasUnread, setHasUnread] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Build WhatsApp URL with encoded message
  const getWhatsAppUrl = (text: string) => {
    const encoded = encodeURIComponent(text.trim() || 'Bonjour Collège Isaac Newton, j\'aimerais des renseignements.');
    return `https://wa.me/${WHATSAPP_PHONE_CLEAN}?text=${encoded}`;
  };

  const handleOpenChat = () => {
    setIsOpen(!isOpen);
    setHasUnread(false);
  };

  return (
    <div 
      ref={cardRef} 
      className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end select-none"
      aria-label="Assistance WhatsApp directe"
    >
      
      {/* 1. DYNAMIC EXPANDABLE CHAT CARD */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.94 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="mb-3.5 w-[320px] sm:w-[360px] max-w-[calc(100vw-2.5rem)] bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col ring-1 ring-slate-900/10"
            role="dialog"
            aria-label="Fenêtre de discussion WhatsApp"
          >
            {/* Header: WhatsApp Green with College identity */}
            <div className="bg-[#075E54] text-white p-4 flex items-center justify-between relative overflow-hidden">
              <div className="flex items-center gap-3 relative z-10">
                {/* College Avatar with Online Badge */}
                <div className="relative">
                  <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center shadow-md p-1">
                    <div className="w-full h-full rounded-full bg-blue-900 flex items-center justify-center text-white font-serif font-bold text-xs tracking-wider">
                      CIN
                    </div>
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#25D366] ring-2 ring-white" />
                </div>

                <div>
                  <h3 className="font-bold text-sm leading-tight flex items-center gap-1.5">
                    <span>Collège Isaac Newton</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                  </h3>
                  <div className="flex items-center gap-1 text-[11px] text-emerald-100 font-light mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse" />
                    <span>En ligne · Delmas 50, rue Dominique #2 bis</span>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full text-emerald-100 hover:text-white hover:bg-white/10 transition-colors cursor-pointer relative z-10"
                aria-label="Fermer le dialogue WhatsApp"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Subtle background graphic */}
              <div className="absolute -right-4 -bottom-6 text-white/5 pointer-events-none">
                <MessageCircle className="w-32 h-32" />
              </div>
            </div>

            {/* Chat Body with Authentic Background */}
            <div className="bg-[#ECE5DD]/40 p-4 space-y-3 max-h-[360px] overflow-y-auto">
              
              {/* Automated Welcome Bubble */}
              <div className="flex items-start gap-2">
                <div className="bg-white rounded-2xl rounded-tl-xs p-3.5 shadow-xs max-w-[85%] border border-slate-200/60 space-y-1.5">
                  <span className="text-[11px] font-bold text-[#075E54] block">
                    Secrétariat du Collège Isaac Newton
                  </span>
                  <p className="text-xs text-slate-800 leading-relaxed font-sans">
                    Bonjour et bienvenue ! 👋<br />
                    Comment pouvons-nous vous renseigner aujourd'hui concernant notre campus ou nos programmes ?
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                    <span className="font-mono text-slate-500 font-medium">{WHATSAPP_DISPLAY_PHONE}</span>
                    <span>Direct WhatsApp</span>
                  </div>
                </div>
              </div>

              {/* Quick Preset Questions */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block px-1">
                  Questions fréquentes (en un clic) :
                </span>

                <div className="grid grid-cols-1 gap-1.5">
                  {QUICK_QUESTIONS.map((q) => (
                    <a
                      key={q.id}
                      href={getWhatsAppUrl(q.message)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full text-left p-2.5 rounded-xl bg-white hover:bg-emerald-50 text-slate-700 hover:text-[#075E54] border border-slate-200/80 hover:border-emerald-300 transition-all flex items-center justify-between gap-2 shadow-2xs group cursor-pointer"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm shrink-0">{q.icon}</span>
                        <span className="text-xs font-semibold truncate text-slate-800 group-hover:text-[#075E54]">
                          {q.label}
                        </span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#075E54] shrink-0 group-hover:translate-x-0.5 transition-transform" />
                    </a>
                  ))}
                </div>
              </div>

            </div>

            {/* Custom Message Input Footer */}
            <div className="p-3 bg-white border-t border-slate-100">
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (customMessage.trim()) {
                    window.location.href = getWhatsAppUrl(customMessage);
                  }
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Écrivez votre message..."
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#25D366] focus:bg-white transition-all"
                />
                
                <a
                  href={getWhatsAppUrl(customMessage || 'Bonjour, je souhaite contacter le secrétariat du Collège Isaac Newton.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white flex items-center justify-center shrink-0 shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  title="Envoyer sur WhatsApp"
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </a>
              </form>

              <div className="mt-2 text-center text-[10px] text-slate-500 space-y-0.5">
                <div>
                  Lignes directes : <strong className="text-slate-700 font-mono">+509 3316-0934</strong> / <strong className="text-slate-700 font-mono">+509 3721-1818</strong>
                </div>
                <div className="text-slate-400">
                  WhatsApp officiel : <strong className="text-emerald-700 font-mono">{WHATSAPP_DISPLAY_PHONE}</strong>
                </div>
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. DYNAMIC FLOATING WHATSAPP BUTTON (Main Trigger) */}
      <div 
        className="relative flex items-center gap-2"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        
        {/* Floating Tooltip Pill (Desktop only) */}
        <AnimatePresence>
          {showTooltip && !isOpen && (
            <motion.div
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.15 }}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 backdrop-blur-md text-white text-xs font-semibold shadow-lg border border-slate-700/60 whitespace-nowrap pointer-events-none"
            >
              <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
              <span>Besoin d'aide ? WhatsApp : {WHATSAPP_DISPLAY_PHONE}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* The Action Button */}
        <motion.button
          type="button"
          onClick={handleOpenChat}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-white shadow-xl transition-all cursor-pointer ${
            isOpen
              ? 'bg-slate-800 hover:bg-slate-900 ring-4 ring-slate-800/20'
              : 'bg-[#25D366] hover:bg-[#20ba59] ring-4 ring-[#25D366]/25 shadow-emerald-500/30'
          }`}
          aria-label={isOpen ? 'Fermer WhatsApp' : 'Ouvrir la discussion WhatsApp avec le Collège Isaac Newton'}
        >
          {isOpen ? (
            <X className="w-7 h-7 sm:w-8 sm:h-8" />
          ) : (
            <>
              {/* Authentic WhatsApp Vector Icon */}
              <svg 
                className="w-7 h-7 sm:w-8 sm:h-8 fill-current drop-shadow-xs" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm.01 1.67c2.2 0 4.26.86 5.82 2.42a8.21 8.21 0 012.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.42 0-2.82-.37-4.04-1.07l-.29-.17-3.11.82.83-3.03-.19-.3A8.196 8.196 0 013.8 11.91c0-4.54 3.7-8.24 8.25-8.24zm4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.26-1.5-1.41-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.38-.44.13-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.78 2.72 4.31 3.81.6.26 1.07.41 1.44.53.61.19 1.16.17 1.6.1.49-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.22-.17-.47-.3z"/>
              </svg>

              {/* Notification Ping Badge when Unread */}
              {hasUnread && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500 text-[10px] font-bold text-white items-center justify-center leading-none">
                    1
                  </span>
                </span>
              )}
            </>
          )}
        </motion.button>

      </div>

    </div>
  );
};
