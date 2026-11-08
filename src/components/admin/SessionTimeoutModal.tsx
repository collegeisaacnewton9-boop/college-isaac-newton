import React, { useEffect } from 'react';
import { Clock, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

interface SessionTimeoutModalProps {
  isOpen: boolean;
  secondsRemaining: number;
  totalAlertSeconds?: number;
  onExtend: () => void;
  onLogout: () => void;
}

export const SessionTimeoutModal: React.FC<SessionTimeoutModalProps> = ({
  isOpen,
  secondsRemaining,
  totalAlertSeconds = 60,
  onExtend,
  onLogout,
}) => {
  // If not open, render nothing
  if (!isOpen) return null;

  // Format seconds into MM:SS (e.g. 27 -> "00:27")
  const mins = Math.floor(secondsRemaining / 60);
  const secs = secondsRemaining % 60;
  const formattedTime = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  // Progress percentage (from 100% down to 0%)
  const progressPercent = Math.min(100, Math.max(0, (secondsRemaining / totalAlertSeconds) * 100));

  const handleExplicitLogout = () => {
    // Explicit rule: Dismiss all active notifications to avoid leftover banners
    toast.dismiss();
    onLogout();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/65 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div 
        className="bg-white rounded-3xl max-w-sm sm:max-w-md w-full p-5 sm:p-7 shadow-2xl border border-slate-200/90 text-center space-y-5 animate-scale-in"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="session-timeout-title"
      >
        
        {/* Top Floating Glowing Hourglass Icon (exact match with image.png) */}
        <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-amber-50 border border-amber-200/80 flex items-center justify-center mx-auto shadow-inner">
          <span className="text-2xl sm:text-3xl select-none" role="img" aria-label="Sablier">
            ⏳
          </span>
        </div>

        {/* Title and Subtitle */}
        <div className="space-y-1.5">
          <h2 id="session-timeout-title" className="font-sans text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
            Expiration imminente de la session
          </h2>
          <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed max-w-xs mx-auto">
            Pour des raisons de sécurité, votre session sera automatiquement fermée suite à une inactivité prolongée.
          </p>
        </div>

        {/* Central Countdown Box (exact match with image.png) */}
        <div className="bg-slate-50/75 rounded-2xl p-4 sm:p-5 border border-slate-100 space-y-3.5">
          
          {/* Header indicator */}
          <div className="flex items-center justify-center gap-1.5 text-amber-700 font-bold text-[10.5px] uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Temps restant avant déconnexion</span>
          </div>

          {/* Yellow pill with big countdown */}
          <div className="inline-block bg-amber-50/80 border-2 border-amber-300/80 rounded-2xl py-2 px-6 shadow-2xs">
            <div className="font-mono text-3xl sm:text-4xl font-extrabold text-amber-600 tracking-wider">
              {formattedTime}
            </div>
          </div>

          {/* Subtext explanation */}
          <p className="text-[11px] font-mono text-slate-500">
            Indicateur décompte : <span className="font-semibold text-slate-700">(minutes:secondes)</span>
          </p>

          {/* Progress bar */}
          <div className="space-y-1 pt-1">
            <div className="w-full h-2.5 bg-slate-200/70 rounded-full overflow-hidden">
              <div 
                className="h-full bg-amber-500 rounded-full transition-all duration-1000 ease-linear shadow-xs"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Scale legend */}
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-0.5">
              <span>00:00 (Fermeture)</span>
              <span className="font-bold text-slate-700">{secondsRemaining}s restantes</span>
              <span>01:00 (Alerte)</span>
            </div>
          </div>

        </div>

        {/* Bottom Actions (exact match with image.png) */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={handleExplicitLogout}
            className="py-2.5 sm:py-3 px-3 rounded-2xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm transition-colors cursor-pointer shadow-2xs"
          >
            Me déconnecter
          </button>

          <button
            type="button"
            onClick={onExtend}
            className="py-2.5 sm:py-3 px-3 rounded-2xl bg-[#4f46e5] hover:bg-[#4338ca] text-white font-bold text-xs sm:text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 shrink-0" />
            <span>Rester connecté</span>
          </button>
        </div>

      </div>
    </div>
  );
};
