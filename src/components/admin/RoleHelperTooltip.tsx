import React, { useState } from 'react';
import { 
  Info, 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  Shield, 
  UserCheck, 
  BookOpen, 
  Mail, 
  Lock,
  ChevronDown,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { Role } from '../../types';
import { ROLE_PERMISSIONS } from '../../data/rolePermissions';

interface RoleHelperTooltipProps {
  role: Role;
  variant?: 'compact' | 'badge' | 'card' | 'inline-button';
  className?: string;
}

export const RoleHelperTooltip: React.FC<RoleHelperTooltipProps> = ({
  role,
  variant = 'compact',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const detail = ROLE_PERMISSIONS[role];

  if (!detail) return null;

  // Icon corresponding to role
  const getRoleIcon = () => {
    switch (role) {
      case 'ADMIN':
        return <Shield className="w-3.5 h-3.5 text-blue-700 shrink-0" />;
      case 'EDITOR':
        return <BookOpen className="w-3.5 h-3.5 text-purple-700 shrink-0" />;
      case 'TEACHER':
        return <UserCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />;
      case 'MODERATOR':
        return <Mail className="w-3.5 h-3.5 text-amber-700 shrink-0" />;
      default:
        return <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" />;
    }
  };

  // Card view variant for detailed role guide
  if (variant === 'card') {
    return (
      <div className={`p-3 sm:p-3.5 rounded-xl border transition-all hover:shadow-xs ${detail.badgeBg}/35 ${detail.badgeBorder} ${className}`}>
        <div className="flex items-start justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${detail.badgeBg} ${detail.badgeText} shadow-2xs shrink-0`}>
              {getRoleIcon()}
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h4 className="font-serif font-bold text-slate-900 text-xs sm:text-sm">
                  {detail.name}
                </h4>
                <span className={`px-1.5 py-0.2 rounded-md text-[9.5px] font-bold ${detail.badgeBg} ${detail.badgeText} border ${detail.badgeBorder}`}>
                  {detail.badgeLabel}
                </span>
              </div>
              <p className="text-[10.5px] text-slate-600 mt-0.5 leading-snug line-clamp-2">
                {detail.summary}
              </p>
            </div>
          </div>
        </div>

        <p className="text-[11px] text-slate-600 mt-2 pt-2 border-t border-slate-200/60 leading-relaxed">
          {detail.detailedScope}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-200/60 text-[10.5px]">
          {/* Permissions autorisées */}
          <div className="space-y-1">
            <span className="font-bold text-emerald-800 flex items-center gap-1 uppercase tracking-wider text-[9.5px]">
              <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
              <span>Périmètres Autorisés</span>
            </span>
            <ul className="space-y-0.5 pl-0.5">
              {detail.allowedActions.map((act, i) => (
                <li key={i} className="text-slate-700 flex items-start gap-1 leading-tight text-[10.5px]">
                  <span className="text-emerald-600 font-bold shrink-0">✓</span>
                  <span>{act}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Restrictions */}
          {detail.restrictedActions.length > 0 && (
            <div className="space-y-1">
              <span className="font-bold text-rose-800 flex items-center gap-1 uppercase tracking-wider text-[9.5px]">
                <XCircle className="w-3 h-3 text-rose-600 shrink-0" />
                <span>Accès Restreints / Bloqués</span>
              </span>
              <ul className="space-y-0.5 pl-0.5">
                {detail.restrictedActions.map((res, i) => (
                  <li key={i} className="text-slate-600 flex items-start gap-1 leading-tight text-[10.5px]">
                    <span className="text-rose-500 font-bold shrink-0">✗</span>
                    <span>{res}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Interactive Inline Helper Button & Floating Popover Tooltip
  return (
    <div className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10.5px] font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
        title="Voir les permissions et le périmètre d'accès de ce rôle"
      >
        <HelpCircle className="w-3 h-3 text-blue-600 shrink-0" />
        <span className="underline decoration-dotted decoration-slate-400 underline-offset-2">
          Périmètre
        </span>
      </button>

      {/* Floating Tooltip Box */}
      {isOpen && (
        <div 
          className="absolute z-50 bottom-full left-0 sm:left-1/2 sm:-translate-x-1/2 mb-2 w-72 sm:w-88 max-w-[calc(100vw-2rem)] p-3 sm:p-3.5 rounded-xl bg-slate-950 text-white shadow-xl border border-slate-700 text-xs animate-scale-in"
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
        >
          {/* Tooltip Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-md bg-blue-600/30 flex items-center justify-center text-amber-400 shrink-0">
                {getRoleIcon()}
              </div>
              <div>
                <span className="font-bold text-white text-xs block leading-tight">{detail.name}</span>
                <span className="text-[9.5px] text-slate-400 font-mono">Rôle : {detail.role}</span>
              </div>
            </div>
            <span className={`px-1.5 py-0.2 rounded-full text-[8.5px] font-bold ${
              detail.accessLevel === 'SUPER_ADMIN' ? 'bg-blue-900 text-blue-200' :
              detail.accessLevel === 'DELEGATED_MANAGER' ? 'bg-amber-900/80 text-amber-200' :
              'bg-slate-800 text-slate-300'
            }`}>
              {detail.accessLevel === 'SUPER_ADMIN' ? 'Super-Admin' :
               detail.accessLevel === 'DELEGATED_MANAGER' ? 'Délégué' : 'Public'}
            </span>
          </div>

          {/* Description Scope */}
          <p className="text-[10.5px] text-slate-300 mb-2 leading-relaxed">
            {detail.detailedScope}
          </p>

          {/* Actions Allowed */}
          <div className="space-y-0.5 pt-1.5 border-t border-slate-800/80">
            <span className="text-[9.5px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
              <span>Droits & Actions Autorisées</span>
            </span>
            <ul className="space-y-0.5 pl-0.5">
              {detail.allowedActions.slice(0, 3).map((act, i) => (
                <li key={i} className="text-[10px] text-slate-300 flex items-start gap-1 leading-tight">
                  <span className="text-emerald-400 font-bold shrink-0">✓</span>
                  <span>{act}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Actions Restricted */}
          {detail.restrictedActions.length > 0 && (
            <div className="space-y-0.5 pt-1.5 mt-1.5 border-t border-slate-800/80">
              <span className="text-[9.5px] font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1">
                <XCircle className="w-2.5 h-2.5 text-rose-400" />
                <span>Périmètres Bloqués</span>
              </span>
              <ul className="space-y-0.5 pl-0.5">
                {detail.restrictedActions.slice(0, 2).map((res, i) => (
                  <li key={i} className="text-[10px] text-slate-400 flex items-start gap-1 leading-tight">
                    <span className="text-rose-400 font-bold shrink-0">✗</span>
                    <span>{res}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Pointer triangle */}
          <div className="hidden sm:block absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-950" />
        </div>
      )}
    </div>
  );
};
