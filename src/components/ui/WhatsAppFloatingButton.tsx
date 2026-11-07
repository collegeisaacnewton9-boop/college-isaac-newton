import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Send, 
  MessageCircle, 
  Clock, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles,
  ChevronDown
} from 'lucide-react';
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
  
  // Scroll Navigation State
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showScroll, setShowScroll] = useState(false);
  const [isNearBottom, setIsNearBottom] = useState(false);
  const [showScrollOptions, setShowScrollOptions] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);

  // Monitor Scroll Progress & Position
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;

      setShowScroll(currentY > 180);

      if (totalHeight > 0) {
        const progress = Math.min(100, Math.max(0, Math.round((currentY / totalHeight) * 100)));
        setScrollProgress(progress);
        setIsNearBottom(currentY + window.innerHeight >= document.documentElement.scrollHeight - 200);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth',
    });
  };

  return (
    <div 
      ref={cardRef} 
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end select-none"
      aria-label="Actions rapides d'assistance et de navigation"
    >
      
      {/* 1. DYNAMIC EXPANDABLE CHAT CARD (OPENS CLEANLY ABOVE THE DOCK) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.94 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="mb-3 w-[300px] xs:w-[320px] sm:w-[360px] max-w-[calc(100vw-2rem)] bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col ring-1 ring-slate-900/10"
            role="dialog"
            aria-label="Fenêtre de discussion WhatsApp"
          >
            {/* Header: WhatsApp Green with College identity */}
            <div className="bg-[#075E54] text-white p-3.5 sm:p-4 flex items-center justify-between relative overflow-hidden">
              <div className="flex items-center gap-2.5 sm:gap-3 relative z-10">
                {/* College Avatar with Online Badge */}
                <div className="relative">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white flex items-center justify-center shadow-md p-1">
                    <div className="w-full h-full rounded-full bg-blue-900 flex items-center justify-center text-white font-serif font-bold text-xs tracking-wider">
                      CIN
                    </div>
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#25D366] ring-2 ring-white" />
                </div>

                <div>
                  <h3 className="font-bold text-xs sm:text-sm leading-tight flex items-center gap-1.5">
                    <span>Collège Isaac Newton</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                  </h3>
                  <div className="flex items-center gap-1 text-[10.5px] sm:text-[11px] text-emerald-100 font-light mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse" />
                    <span>En ligne · Delmas 50, Port-au-Prince</span>
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
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Subtle background graphic */}
              <div className="absolute -right-4 -bottom-6 text-white/5 pointer-events-none">
                <MessageCircle className="w-28 h-28 sm:w-32 sm:h-32" />
              </div>
            </div>

            {/* Chat Body & Quick Prompts */}
            <div className="p-3.5 sm:p-4 bg-stone-50/70 space-y-3 max-h-[340px] overflow-y-auto text-xs">
              
              {/* Institution Greeting Bubble */}
              <div className="flex items-start gap-2">
                <div className="bg-white p-3 rounded-2xl rounded-tl-xs shadow-xs border border-slate-100 text-slate-700 leading-relaxed max-w-[90%]">
                  <p className="font-semibold text-slate-900 text-xs flex items-center gap-1">
                    <span>Bienvenue sur l'assistance directe !</span>
                    <Sparkles className="w-3 h-3 text-amber-500" />
                  </p>
                  <p className="mt-1 text-[11.5px] text-slate-600">
                    Comment le secrétariat ou la direction du Collège Isaac Newton peuvent-ils vous aider aujourd'hui ?
                  </p>
                  <span className="text-[10px] text-slate-400 mt-1 block flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Réponse habituelle en quelques minutes
                  </span>
                </div>
              </div>

              {/* Fast FAQ Preset Buttons */}
              <div className="space-y-1.5 pt-1">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider px-1">
                  Questions fréquentes :
                </p>
                <div className="grid grid-cols-1 gap-1.5">
                  {QUICK_QUESTIONS.map((q) => (
                    <a
                      key={q.id}
                      href={getWhatsAppUrl(q.message)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-2 rounded-xl bg-white hover:bg-emerald-50 border border-slate-200/80 hover:border-emerald-300 text-slate-700 hover:text-emerald-900 transition-all group text-left shadow-2xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm shrink-0">{q.icon}</span>
                        <span className="font-semibold text-[11px] truncate">{q.label}</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                    </a>
                  ))}
                </div>
              </div>

              {/* Custom Input Message Form */}
              <div className="pt-2">
                <div className="relative">
                  <textarea
                    rows={2}
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="Écrivez votre message personnalisé..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 resize-none shadow-2xs"
                  />
                  <a
                    href={getWhatsAppUrl(customMessage)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute right-2 bottom-2.5 p-1.5 rounded-lg bg-[#25D366] hover:bg-[#20ba59] text-white shadow-xs transition-colors flex items-center justify-center cursor-pointer"
                    aria-label="Envoyer sur WhatsApp"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

            </div>

            {/* Footer Notice */}
            <div className="bg-slate-50 border-t border-slate-100 px-3 py-2 text-center text-[10px] text-slate-500 font-mono">
              Numéro officiel : {WHATSAPP_DISPLAY_PHONE}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 
        2. UNIFIED COHESIVE FLOATING ACTION DOCK:
        Both buttons share the EXACT same flex column container with strict gap.
        Zero overlap mathematically possible. Perfectly centered.
      */}
      <div className="flex flex-col items-center gap-2.5 sm:gap-3">
        
        {/* BUTTON A: SMART SCROLL-TO-TOP / SCROLL-TO-BOTTOM (RED CIRCLE) */}
        <AnimatePresence>
          {showScroll && !isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.6, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.6, y: 8 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="relative group"
              onMouseEnter={() => setShowScrollOptions(true)}
              onMouseLeave={() => setShowScrollOptions(false)}
            >
              {/* Optional Quick Tooltip Pill on Hover */}
              {showScrollOptions && (
                <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 flex items-center gap-1 p-1 bg-slate-950/90 backdrop-blur-md rounded-xl border border-slate-800 shadow-xl whitespace-nowrap text-[11px] text-white animate-in fade-in duration-150">
                  <button
                    type="button"
                    onClick={scrollToTop}
                    className="px-2 py-1 rounded-lg hover:bg-white/15 transition-colors cursor-pointer font-medium"
                    title="Remonter au début de la page"
                  >
                    Haut de page
                  </button>
                  <span className="text-slate-600">|</span>
                  <button
                    type="button"
                    onClick={scrollToBottom}
                    className="px-2 py-1 rounded-lg hover:bg-white/15 transition-colors cursor-pointer text-slate-300 hover:text-white"
                    title="Descendre au bas de la page"
                  >
                    Bas de page
                  </button>
                </div>
              )}

              {/* Progress Ring around the Red Circle */}
              <svg 
                className="w-12 h-12 sm:w-13 sm:h-13 -rotate-90 pointer-events-none absolute -inset-0.5" 
                viewBox="0 0 52 52"
              >
                <circle
                  cx="26"
                  cy="26"
                  r="23"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-slate-950/15"
                  fill="none"
                />
                <circle
                  cx="26"
                  cy="26"
                  r="23"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeDasharray={144.5}
                  strokeDashoffset={144.5 - (144.5 * scrollProgress) / 100}
                  strokeLinecap="round"
                  className="text-red-500 transition-all duration-150"
                  fill="none"
                />
              </svg>

              {/* Main Red Circular Scroll Button (Matching User Uploaded Icon Design) */}
              <motion.button
                type="button"
                onClick={scrollToTop}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#a82020] hover:bg-[#8f1b1b] active:bg-[#7a1717] text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all cursor-pointer border border-white/20 focus:outline-none focus:ring-2 focus:ring-red-400"
                aria-label="Remonter au début de la page"
                title={`Remonter au début (${scrollProgress}%)`}
              >
                {/* Exact SVG Icon: upward arrow standing in curved cradle */}
                <svg 
                  viewBox="0 0 24 24" 
                  className="w-5 h-5 sm:w-5.5 sm:h-5.5" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M12 15V4" />
                  <path d="M7 9l5-5 5 5" />
                  <path d="M6 14.5c0 3.3 2.7 6 6 6s6-2.7 6-6" />
                </svg>
              </motion.button>

              {/* Mini Down Arrow Pill if not at page bottom */}
              {!isNearBottom && (
                <button
                  type="button"
                  onClick={scrollToBottom}
                  className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-900/90 hover:bg-slate-950 text-white p-0.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all duration-150 cursor-pointer"
                  title="Descendre directement au bas de la page"
                  aria-label="Descendre au bas de page"
                >
                  <ChevronDown className="w-3 h-3" />
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* BUTTON B: WHATSAPP DIRECT ACTION (GREEN CIRCLE) */}
        <div 
          className="relative"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          {/* Tooltip on Desktop hover */}
          <AnimatePresence>
            {showTooltip && !isOpen && (
              <motion.div
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.15 }}
                className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/95 backdrop-blur-md text-white text-xs font-semibold shadow-lg border border-slate-700/60 whitespace-nowrap pointer-events-none absolute right-full mr-3 top-1/2 -translate-y-1/2"
              >
                <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
                <span>WhatsApp : {WHATSAPP_DISPLAY_PHONE}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* The WhatsApp Action Button */}
          <motion.button
            type="button"
            onClick={handleOpenChat}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-white shadow-xl transition-all cursor-pointer ${
              isOpen
                ? 'bg-slate-800 hover:bg-slate-900 ring-3 ring-slate-800/20'
                : 'bg-[#25D366] hover:bg-[#20ba59] ring-3 ring-[#25D366]/25 shadow-emerald-500/30'
            }`}
            aria-label={isOpen ? 'Fermer WhatsApp' : 'Ouvrir la discussion WhatsApp avec le Collège Isaac Newton'}
          >
            {isOpen ? (
              <X className="w-6 h-6 sm:w-7 sm:h-7" />
            ) : (
              <>
                {/* Authentic WhatsApp Vector Icon */}
                <svg 
                  className="w-6 h-6 sm:w-7 sm:h-7 fill-current drop-shadow-xs" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2zm.01 1.67c2.2 0 4.26.86 5.82 2.42a8.21 8.21 0 012.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.42 0-2.82-.37-4.04-1.07l-.29-.17-3.11.82.83-3.03-.19-.3A8.196 8.196 0 013.8 11.91c0-4.54 3.7-8.24 8.25-8.24zm4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.26-1.5-1.41-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.38-.44.13-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.78 2.72 4.31 3.81.6.26 1.07.41 1.44.53.61.19 1.16.17 1.6.1.49-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.22-.17-.47-.3z"/>
                </svg>

                {/* Notification Ping Badge when Unread - Cleanly placed with zero overlap */}
                {hasUnread && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500 text-[10px] font-bold text-white items-center justify-center leading-none shadow-xs">
                      1
                    </span>
                  </span>
                )}
              </>
            )}
          </motion.button>
        </div>

      </div>

    </div>
  );
};
