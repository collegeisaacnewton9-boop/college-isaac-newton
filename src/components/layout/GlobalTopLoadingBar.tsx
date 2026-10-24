import React, { useEffect, useState } from 'react';
import { loadingService } from '../../services/loadingService';

export const GlobalTopLoadingBar: React.FC = () => {
  const [state, setState] = useState({ isLoading: false, progress: 0 });

  useEffect(() => {
    const unsubscribe = loadingService.subscribe((newState) => {
      setState(newState);
    });

    return unsubscribe;
  }, []);

  if (state.progress === 0 && !state.isLoading) {
    return null;
  }

  const isComplete = state.progress >= 100;

  return (
    <div
      aria-hidden="true"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={state.progress}
      className={`fixed top-0 left-0 right-0 h-[3px] z-[9999] pointer-events-none transition-opacity duration-300 ${
        isComplete ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Background track */}
      <div className="absolute inset-0 bg-transparent" />

      {/* Primary progress bar */}
      <div
        className="h-full bg-gradient-to-r from-amber-400 via-blue-600 to-amber-300 transition-[width] duration-200 ease-out shadow-[0_0_12px_rgba(251,191,36,0.9),0_0_6px_rgba(37,99,235,0.8)] relative"
        style={{ width: `${Math.min(state.progress, 100)}%` }}
      >
        {/* Glowing tip at the leading edge */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-20 h-4 bg-white/40 blur-xs rounded-full pointer-events-none" />
        <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white shadow-[0_0_8px_#ffffff,0_0_14px_#f59e0b]" />
      </div>
    </div>
  );
};
