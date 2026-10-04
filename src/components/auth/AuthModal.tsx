import React, { useState } from 'react';
import { 
  X, 
  Shield, 
  Lock, 
  UserCheck, 
  LogOut, 
  CheckCircle2, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Sparkles, 
  KeyRound, 
  HelpCircle,
  Building,
  GraduationCap,
  Users,
  Compass,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';
import { User, Role } from '../../types';
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

// 6 Official RBAC Team Profiles matching Image 2 exactly
const RBAC_TEAM_PROFILES = [
  {
    initials: 'DP',
    fullName: 'Direction Pédagogique (Admin)',
    email: 'admin@collegeisaacnewton.com',
    role: 'ADMIN' as Role,
    roleLabel: 'ADMIN',
    department: 'Direction Générale & Rectorat',
    badgeClass: 'bg-slate-900 text-white border-slate-700',
    avatarBg: 'bg-slate-950 text-amber-400 border border-amber-400/40',
    summary: 'Contrôle complet, gestion RBAC, CMS et configuration',
  },
  {
    initials: 'S&',
    fullName: 'Secrétariat & Communication (Éditeur)',
    email: 'redaction@collegeisaacnewton.com',
    role: 'EDITOR' as Role,
    roleLabel: 'ÉDITEUR',
    department: 'Pôle Presse, Rédaction & Multimédia',
    badgeClass: 'bg-purple-100 text-purple-900 border-purple-300',
    avatarBg: 'bg-purple-900 text-purple-200 border border-purple-400/40',
    summary: 'Gestion éditoriale du blog, des actualités et galeries',
  },
  {
    initials: 'PE',
    fullName: 'Prof. Emmanuel Célestin (Enseignant SVT)',
    email: 'prof.sciences@collegeisaacnewton.com',
    role: 'TEACHER' as Role,
    roleLabel: 'ENSEIGNANT',
    department: 'Département des Sciences & Informatique',
    badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    avatarBg: 'bg-emerald-900 text-emerald-200 border border-emerald-400/40',
    summary: 'Planification des devoirs, agenda et cours de sciences',
  },
  {
    initials: 'ML',
    fullName: 'M. Lucner Bernard (Modérateur)',
    email: 'mod.vie.scolaire@collegeisaacnewton.com',
    role: 'MODERATOR' as Role,
    roleLabel: 'MODÉRATEUR',
    department: 'Vie Scolaire & Relations Familles',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
    avatarBg: 'bg-amber-900 text-amber-200 border border-amber-400/40',
    summary: 'Boîte de réception, suivi des messages et vie étudiante',
  },
  {
    initials: 'MM',
    fullName: 'Mme Marie-Claire Joseph (Parent)',
    email: 'parent.demo@collegeisaacnewton.com',
    role: 'PARENT' as Role,
    roleLabel: 'PARENT',
    department: 'Association des Parents d’Élèves (APE)',
    badgeClass: 'bg-blue-100 text-blue-900 border-blue-300',
    avatarBg: 'bg-blue-900 text-blue-200 border border-blue-400/40',
    summary: 'Consultation des dossiers, suivi scolaire et circulaires',
  },
  {
    initials: 'JM',
    fullName: 'Jean-Marc Augustin (Élève NS4)',
    email: 'eleve.ns4@collegeisaacnewton.com',
    role: 'STUDENT' as Role,
    roleLabel: 'ÉLÈVE',
    department: 'Promotion Terminale / Baccalauréat',
    badgeClass: 'bg-cyan-100 text-cyan-900 border-cyan-300',
    avatarBg: 'bg-cyan-900 text-cyan-200 border border-cyan-400/40',
    summary: 'Espace cours, devoirs et calendrier des épreuves officielles',
  },
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserChange,
  onNavigateToAdmin,
  onNavigate,
}) => {
  // Mode selection: 'credentials' (Formulaire) vs 'rbac' (Profils en 1-clic)
  const [activeTab, setActiveTab] = useState<'credentials' | 'rbac'>('credentials');
  
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
      if (['ADMIN', 'EDITOR'].includes(user.role)) {
        onNavigateToAdmin();
      } else if (user.role === 'TEACHER' || user.role === 'MODERATOR') {
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

  // Handle 1-Click Role Login from RBAC Profiles
  const handleSelectProfile = async (profile: typeof RBAC_TEAM_PROFILES[0]) => {
    setLoading(true);
    setError(null);
    try {
      const user = await apiService.login(profile.email, 'Newton2026!');
      onUserChange(user);
      toast.success(`Connecté : ${profile.fullName}`, {
        description: `Profil ${profile.roleLabel} activé avec succès.`,
      });
      onClose();

      if (['ADMIN', 'EDITOR', 'TEACHER', 'MODERATOR'].includes(user.role)) {
        onNavigateToAdmin();
      } else if (onNavigate) {
        onNavigate(user.role === 'PARENT' ? 'admissions' : 'school-life');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Impossible de se connecter avec ce profil.');
    } finally {
      setLoading(false);
    }
  };

  // Fast pre-fill credentials in the form
  const handlePreFill = (userEmail: string) => {
    setEmail(userEmail);
    setPassword('Newton2026!');
    setActiveTab('credentials');
    setError(null);
  };

  const handleLogout = () => {
    apiService.logout();
    onUserChange(null);
    toast.info('Vous êtes maintenant déconnecté du portail.');
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200/90 flex flex-col max-h-[92vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
      >
        
        {/* COMPACT & MODERN HEADER */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 text-white p-3.5 sm:p-4.5 relative border-b border-blue-900/40 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Fermer la boîte de dialogue"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-lg bg-amber-400/20 text-amber-400 border border-amber-400/30">
              <Shield className="w-3.5 h-3.5" />
            </span>
            <span className="text-[10.5px] font-mono font-bold uppercase tracking-wider text-amber-300">
              Portail Officiel Sécurisé · RBAC
            </span>
          </div>

          <h2 id="auth-modal-title" className="text-base sm:text-lg font-serif font-bold text-white tracking-tight">
            {currentUser ? 'Session Utilisateur Active' : 'Espace Membres & Administration'}
          </h2>
          <p className="text-[11px] text-slate-300 font-light truncate">
            Collège Isaac Newton · Authentification centralisée & contrôle d'accès
          </p>
        </div>

        {/* MODAL BODY (SCROLLABLE & COMPACT) */}
        <div className="p-3.5 sm:p-5 overflow-y-auto space-y-3.5 text-xs">
          
          {currentUser ? (
            /* =========================================================
               LOGGED IN STATE : USER PROFILE & SHORTCUTS
            ========================================================= */
            <div className="space-y-3.5">
              
              {/* User Profile Card */}
              <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-50/80 to-slate-50 border border-blue-200/80 flex items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-900 text-amber-400 font-bold flex items-center justify-center font-mono text-xs shadow-xs shrink-0">
                    {currentUser.fullName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                        {currentUser.fullName}
                      </p>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-900 text-white font-mono">
                        {currentUser.role}
                      </span>
                    </div>
                    <p className="text-slate-500 text-[11px] truncate">{currentUser.email}</p>
                    <span className="inline-flex items-center gap-1 text-[10.5px] text-emerald-700 font-medium mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                      En ligne maintenant
                    </span>
                  </div>
                </div>
              </div>

              {/* Direct Portal Actions */}
              <div className="space-y-2">
                {['ADMIN', 'EDITOR', 'TEACHER', 'MODERATOR'].includes(currentUser.role) && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onNavigateToAdmin();
                    }}
                    className="w-full py-2.5 px-3.5 rounded-xl bg-blue-900 text-white font-bold text-xs hover:bg-blue-950 transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                  >
                    <Shield className="w-4 h-4 text-amber-400" />
                    <span>Accéder au Tableau de Bord Admin ({ROLE_PERMISSIONS[currentUser.role]?.badgeLabel || currentUser.role})</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-auto text-blue-200" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full py-2 px-3.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Se déconnecter de cette session</span>
                </button>
              </div>

              {/* Fast Role Switcher in 1 Click */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                    Changer de profil d'équipe (Test RBAC) :
                  </span>
                  <span className="text-[9.5px] text-slate-400 font-mono">6 comptes</span>
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  {RBAC_TEAM_PROFILES.map((p) => {
                    const isCurrent = currentUser.email.toLowerCase() === p.email.toLowerCase();
                    return (
                      <button
                        key={p.role}
                        type="button"
                        onClick={() => handleSelectProfile(p)}
                        className={`p-2 rounded-xl border text-left transition-all flex items-center gap-2 cursor-pointer ${
                          isCurrent
                            ? 'border-blue-900 bg-blue-50/80 font-bold text-blue-900 shadow-2xs'
                            : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-white text-slate-700'
                        }`}
                      >
                        <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono text-[10px] font-bold shrink-0 ${p.avatarBg}`}>
                          {p.initials}
                        </span>
                        <div className="min-w-0 flex-1 leading-tight">
                          <span className="block text-[11px] font-semibold truncate">{p.fullName.split(' ')[0]}</span>
                          <span className="block text-[9.5px] text-slate-400 uppercase font-mono">{p.roleLabel}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          ) : (
            /* =========================================================
               LOGIN FORM : SEGMENTED TAB (CREDENTIALS VS 6 RBAC PROFILES)
            ========================================================= */
            <div className="space-y-3">
              
              {/* Segmented Tab Bar */}
              <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveTab('credentials')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'credentials'
                      ? 'bg-white text-slate-900 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5 text-blue-900" />
                  <span>Saisie Identifiants</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('rbac')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'rbac'
                      ? 'bg-white text-slate-900 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Users className="w-3.5 h-3.5 text-amber-600" />
                  <span>Profils Équipe (6 Rôles)</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 text-[9px] font-bold font-mono">
                    1-Clic
                  </span>
                </button>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
                  <span className="font-bold text-rose-800 shrink-0">Erreur :</span>
                  <span>{error}</span>
                </div>
              )}

              {/* TAB 1: FORMULAIRE IDENTIFIANTS */}
              {activeTab === 'credentials' ? (
                <form onSubmit={handleLogin} className="space-y-2.5">
                  
                  {/* Email Input */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Adresse e-mail institutionnelle *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@collegeisaacnewton.com"
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:border-blue-900 focus:ring-1 focus:ring-blue-900 outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Password Input with Show/Hide Toggle */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Mot de passe confidentiel *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-9 pr-9 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:border-blue-900 focus:ring-1 focus:ring-blue-900 outline-none transition-all font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                        title={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Options row : Remember Me & Forgot Password */}
                  <div className="flex items-center justify-between text-[11px] pt-0.5">
                    <label className="flex items-center gap-1.5 text-slate-600 cursor-pointer">
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
                      className="text-blue-900 hover:underline font-semibold cursor-pointer"
                    >
                      Aide / Identifiants ?
                    </button>
                  </div>

                  {/* Forgot Help Accordion */}
                  {showForgotHelp && (
                    <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/70 text-[11px] text-amber-950 space-y-1 animate-fade-in">
                      <p className="font-bold flex items-center gap-1 text-amber-900">
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>Accès rapide de démonstration :</span>
                      </p>
                      <p>
                        Vous pouvez utiliser le mot de passe par défaut <code className="font-mono bg-white px-1 py-0.5 rounded border border-amber-300 font-bold">Newton2026!</code> ou basculer sur l'onglet <strong>« Profils Équipe »</strong> ci-dessus pour un accès immédiat en 1 clic.
                      </p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-1 active:scale-98"
                  >
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span>{loading ? 'Authentification sécurisée...' : 'Se connecter au Portail'}</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-auto text-blue-200" />
                  </button>

                  {/* Fast Shortcuts Chips (Inline below button) */}
                  <div className="pt-2 border-t border-slate-100">
                    <p className="text-[10px] text-slate-400 uppercase font-mono font-bold mb-1.5">
                      Préremplir en 1 clic :
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {RBAC_TEAM_PROFILES.map((p) => (
                        <button
                          key={p.role}
                          type="button"
                          onClick={() => handlePreFill(p.email)}
                          className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10.5px] font-medium transition-colors cursor-pointer border border-slate-200/60"
                        >
                          {p.roleLabel}
                        </button>
                      ))}
                    </div>
                  </div>

                </form>
              ) : (
                /* TAB 2: RBAC 6 OFFICIAL TEAM PROFILES (MATCHING IMAGE 2) */
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                      Sélectionnez un compte pour tester ses droits réels :
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {RBAC_TEAM_PROFILES.map((p) => (
                      <button
                        key={p.role}
                        type="button"
                        onClick={() => handleSelectProfile(p)}
                        className="w-full text-left p-2 rounded-xl border border-slate-200 hover:border-blue-900 bg-slate-50/60 hover:bg-blue-50/30 transition-all flex items-start gap-2.5 cursor-pointer group shadow-2xs"
                      >
                        {/* Avatar Initials Circle */}
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono text-[11px] font-bold shrink-0 mt-0.5 ${p.avatarBg}`}>
                          {p.initials}
                        </div>

                        {/* Details */}
                        <div className="min-w-0 flex-1 leading-tight space-y-0.5">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-slate-900 text-xs truncate group-hover:text-blue-950">
                              {p.fullName}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded-md font-bold border ${p.badgeClass}`}>
                              {p.roleLabel}
                            </span>
                            <span className="text-[9.5px] text-slate-500 truncate">
                              {p.department}
                            </span>
                          </div>

                          <p className="text-[9.5px] text-slate-400 line-clamp-1 font-light pt-0.5">
                            {p.summary}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>

                  <p className="text-[10px] text-slate-400 text-center pt-1 font-mono">
                    Droits et restrictions synchronisés avec la matrice RBAC officielle.
                  </p>
                </div>
              )}

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
