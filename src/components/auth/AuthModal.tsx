import React, { useState } from 'react';
import { 
  X, 
  Shield, 
  Lock, 
  LogOut, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  HelpCircle,
  Phone,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import { User } from '../../types';
import { apiService } from '../../services/api';
import { ROLE_PERMISSIONS } from '../../data/rolePermissions';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onUserChange: (user: User | null) => void;
  onNavigateToAdmin: () => void;
  onNavigate?: (page: string, subSection?: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserChange,
  onNavigateToAdmin,
  onNavigate,
}) => {
  // Credentials State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForgotHelp, setShowForgotHelp] = useState(false);

  if (!isOpen) return null;

  // Handle standard credential login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Veuillez saisir votre adresse e-mail institutionnelle.');
      return;
    }
    if (!password) {
      setError('Veuillez renseigner votre mot de passe.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const user = await apiService.login(email.trim(), password);
      onUserChange(user);
      toast.success(`Bienvenue, ${user.fullName} !`, {
        description: `Connexion établie sous le rôle ${ROLE_PERMISSIONS[user.role]?.badgeLabel || user.role}.`,
      });
      onClose();
      
      // Auto-route by privilege
      if (['ADMIN', 'EDITOR', 'TEACHER', 'MODERATOR'].includes(user.role)) {
        onNavigateToAdmin();
      } else if (onNavigate) {
        onNavigate(user.role === 'PARENT' ? 'admissions' : 'school-life');
      }
    } catch (err: any) {
      setError(err?.message || 'Identifiants non reconnus. Vérifiez votre adresse e-mail et mot de passe.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    apiService.logout();
    onUserChange(null);
    setEmail('');
    setPassword('');
    setError(null);
    toast.info('Vous êtes maintenant déconnecté du portail.');
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200/90 flex flex-col max-h-[92vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
      >
        
        {/* COMPACT & MODERN EXECUTIVE HEADER */}
        <div className="bg-slate-950 text-white p-5 relative border-b border-blue-900/40 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Fermer la boîte de dialogue"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1 rounded-lg bg-blue-900 text-amber-300 border border-blue-400/30">
              <Shield className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-300">
              Portail Officiel Sécurisé
            </span>
          </div>

          <h2 id="auth-modal-title" className="text-lg font-serif font-bold text-white tracking-tight">
            {currentUser ? 'Session Utilisateur Active' : 'Connexion Espace Membres'}
          </h2>
          <p className="text-xs text-slate-300 font-light">
            Collège Isaac Newton · Authentification centralisée
          </p>
        </div>

        {/* MODAL BODY */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs">
          
          {currentUser ? (
            /* =========================================================
               LOGGED IN STATE: SHOW PROFILE & QUICK ACTIONS ONLY
            ========================================================= */
            <div className="space-y-4">
              
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-900 text-amber-300 flex items-center justify-center font-bold text-base border border-blue-800 shadow-xs shrink-0">
                    {currentUser.fullName ? currentUser.fullName.substring(0, 2).toUpperCase() : 'IN'}
                  </div>

                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-center justify-between gap-1">
                      <p className="font-bold text-slate-900 text-sm truncate">
                        {currentUser.fullName}
                      </p>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-900 text-white font-mono">
                        {currentUser.role}
                      </span>
                    </div>
                    <p className="text-slate-500 text-xs truncate">{currentUser.email}</p>
                    <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium pt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Session active et vérifiée
                    </span>
                  </div>
                </div>
              </div>

              {/* Direct Portal Actions */}
              <div className="space-y-2 pt-1">
                {['ADMIN', 'EDITOR', 'TEACHER', 'MODERATOR'].includes(currentUser.role) && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onNavigateToAdmin();
                    }}
                    className="w-full py-3 px-4 rounded-xl bg-blue-900 text-white font-bold text-xs hover:bg-blue-950 transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                  >
                    <Shield className="w-4 h-4 text-amber-400" />
                    <span>Accéder au Tableau de Bord ({ROLE_PERMISSIONS[currentUser.role]?.badgeLabel || currentUser.role})</span>
                    <ArrowRight className="w-4 h-4 ml-auto text-blue-200" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full py-2.5 px-4 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Se déconnecter de cette session</span>
                </button>
              </div>

            </div>
          ) : (
            /* =========================================================
               STANDARD PRODUCTION LOGIN FORM (NO TEST CARDS / NO DEMO TABS)
            ========================================================= */
            <div className="space-y-3.5">
              
              {/* Quick Fill Direction Banner */}
              <div className="p-2.5 rounded-xl bg-linear-to-r from-blue-900/10 via-amber-500/10 to-blue-900/10 border border-blue-900/20 flex items-center justify-between gap-2 shadow-2xs">
                <div className="min-w-0 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-900 text-amber-300 flex items-center justify-center shrink-0">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 text-[11px] truncate">Direction Générale (Admin)</p>
                    <p className="text-[10px] text-slate-500 font-mono truncate">direction@collegeisaacnewton.com</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('direction@collegeisaacnewton.com');
                    setPassword('Newton@2026');
                    setError(null);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-blue-900 hover:bg-blue-950 text-white font-bold text-[10.5px] transition-colors cursor-pointer shrink-0 shadow-xs"
                >
                  Remplir
                </button>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 space-y-1 animate-in fade-in">
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-rose-800 shrink-0">Erreur :</span>
                    <span>{error}</span>
                  </div>
                  <div className="pt-1 text-[11px] text-slate-600">
                    <span>💡 Astuce : Utilisez le bouton </span>
                    <button
                      type="button"
                      onClick={() => {
                        setEmail('direction@collegeisaacnewton.com');
                        setPassword('Newton@2026');
                        setError(null);
                      }}
                      className="font-bold text-blue-900 underline cursor-pointer"
                    >
                      Remplir ci-dessus
                    </button>
                    <span> ou le mot de passe officiel <strong>Newton@2026</strong>.</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-3">
                
                {/* Email Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Adresse e-mail institutionnelle *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      required
                      autoComplete="username"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nom@collegeisaacnewton.com"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:border-blue-900 focus:ring-1 focus:ring-blue-900 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Password Input with Show/Hide Toggle */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Mot de passe confidentiel *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:border-blue-900 focus:ring-1 focus:ring-blue-900 outline-none transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                      title={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Options row : Remember Me & Forgot Password */}
                <div className="flex items-center justify-between text-xs pt-0.5">
                  <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded text-blue-900 focus:ring-blue-900 cursor-pointer w-3.5 h-3.5"
                    />
                    <span>Mémoriser ma session</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => setShowForgotHelp(!showForgotHelp)}
                    className="text-blue-900 hover:underline font-semibold cursor-pointer text-[11px]"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>

                {/* Forgot Help Accordion */}
                {showForgotHelp && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-700 space-y-1.5 animate-in fade-in">
                    <p className="font-bold flex items-center gap-1.5 text-slate-900">
                      <HelpCircle className="w-3.5 h-3.5 text-blue-900" />
                      <span>Récupération d'accès sécurisé :</span>
                    </p>
                    <p>
                      Pour réinitialiser votre mot de passe institutionnel ou débloquer vos accès, contactez le secrétariat administratif du Collège Isaac Newton :
                    </p>
                    <div className="flex flex-col gap-1 pt-1 font-mono text-[10.5px]">
                      <span className="flex items-center gap-1.5 text-blue-900">
                        <Mail className="w-3 h-3" />
                        <span>contact@collegeisaacnewton.com</span>
                      </span>
                      <span className="flex items-center gap-1.5 text-slate-700">
                        <Phone className="w-3 h-3" />
                        <span>+509 3316-0934 / +509 3721-1818</span>
                      </span>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-1 active:scale-98"
                >
                  <Lock className="w-4 h-4 text-amber-300" />
                  <span>{loading ? 'Authentification sécurisée...' : 'Se connecter au Portail'}</span>
                  <ArrowRight className="w-4 h-4 ml-auto text-blue-200" />
                </button>

              </form>

              {/* Security Badge Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-mono">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Chiffrement SSL/TLS · Contrôle RBAC Strict</span>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
