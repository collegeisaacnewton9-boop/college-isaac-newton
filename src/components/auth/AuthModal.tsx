import React, { useState } from 'react';
import { X, Shield, Lock, UserCheck, LogOut, CheckCircle2 } from 'lucide-react';
import { User, Role } from '../../types';
import { apiService } from '../../services/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onUserChange: (user: User | null) => void;
  onNavigateToAdmin: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserChange,
  onNavigateToAdmin,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Veuillez renseigner votre identifiant et mot de passe.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const user = await apiService.login(email, password);
      onUserChange(user);
      onClose();
      if (['ADMIN', 'EDITOR', 'TEACHER', 'MODERATOR'].includes(user.role)) {
        onNavigateToAdmin();
      }
    } catch {
      setError('Identifiants incorrects.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickRole = async (role: Role) => {
    setLoading(true);
    try {
      const user = await apiService.switchRole(role);
      onUserChange(user);
      onClose();
      if (['ADMIN', 'EDITOR', 'TEACHER', 'MODERATOR'].includes(role)) {
        onNavigateToAdmin();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    apiService.logout();
    onUserChange(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-slate-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
      >
        {/* Header - Compact */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 relative">
          <button
            onClick={onClose}
            className="absolute top-3.5 right-3.5 p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Fermer la boîte de dialogue"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-2 mb-1 text-amber-400">
            <Shield className="w-4 h-4" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Portail Sécurisé</span>
          </div>
          <h2 id="auth-modal-title" className="text-lg sm:text-xl font-serif font-bold text-white">
            {currentUser ? 'Session Utilisateur' : 'Espace Membres & Administration'}
          </h2>
          <p className="text-[11px] text-slate-300 mt-0.5">
            Collège Isaac Newton · Accès contrôlé par rôle
          </p>
        </div>

        {/* Content - Compact */}
        <div className="p-4 sm:p-5">
          {currentUser ? (
            /* Logged in state */
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-200/80 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-900 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-bold text-slate-900">{currentUser.fullName}</p>
                  <p className="text-slate-600 text-[11px]">{currentUser.email}</p>
                  <span className="inline-block mt-1.5 px-2 py-0.5 rounded bg-blue-900 text-white text-[10px] font-bold uppercase tracking-wider">
                    Rôle : {currentUser.role}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                {(currentUser.role === 'ADMIN' || currentUser.role === 'EDITOR') && (
                  <button
                    onClick={() => {
                      onClose();
                      onNavigateToAdmin();
                    }}
                    className="w-full py-2 px-3 rounded-lg bg-blue-900 text-white text-xs font-bold hover:bg-blue-950 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Shield className="w-3.5 h-3.5 text-amber-400" />
                    <span>Accéder au Tableau de Bord Admin</span>
                  </button>
                )}

                <button
                  onClick={handleLogout}
                  className="w-full py-2 px-3 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Se déconnecter</span>
                </button>
              </div>

              {/* Role switcher */}
              <div className="pt-3 border-t border-slate-100">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Changer de rôle (démonstration) :
                </p>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  <button
                    onClick={() => handleQuickRole('ADMIN')}
                    className={`p-1.5 rounded-lg border text-left transition-colors cursor-pointer text-xs ${
                      currentUser.role === 'ADMIN' ? 'border-blue-900 bg-blue-50 font-bold text-blue-900' : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    👑 Admin
                  </button>
                  <button
                    onClick={() => handleQuickRole('EDITOR')}
                    className={`p-1.5 rounded-lg border text-left transition-colors cursor-pointer text-xs ${
                      currentUser.role === 'EDITOR' ? 'border-blue-900 bg-blue-50 font-bold text-blue-900' : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    ✏️ Éditeur
                  </button>
                  <button
                    onClick={() => handleQuickRole('PARENT')}
                    className={`p-1.5 rounded-lg border text-left transition-colors cursor-pointer text-xs ${
                      currentUser.role === 'PARENT' ? 'border-blue-900 bg-blue-50 font-bold text-blue-900' : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    👨‍👩‍👧 Parent
                  </button>
                  <button
                    onClick={() => handleQuickRole('STUDENT')}
                    className={`p-1.5 rounded-lg border text-left transition-colors cursor-pointer text-xs ${
                      currentUser.role === 'STUDENT' ? 'border-blue-900 bg-blue-50 font-bold text-blue-900' : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    🎓 Élève
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Login Form */
            <div className="space-y-4">
              {error && (
                <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Adresse e-mail
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@collegeisaacnewton.com"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs sm:text-sm focus:border-blue-900 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mot de passe
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs sm:text-sm focus:border-blue-900 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 px-3 rounded-lg bg-blue-900 text-white text-xs font-bold hover:bg-blue-950 transition-colors shadow-xs disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer mt-1"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>{loading ? 'Connexion...' : 'Se connecter'}</span>
                </button>
              </form>

              {/* Quick demo 1-click logins */}
              <div className="pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                    Comptes de démonstration (1-clic)
                  </span>
                  <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-bold">
                    Test
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-1">
                  <button
                    onClick={() => handleQuickRole('ADMIN')}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-blue-900 hover:bg-blue-50/50 text-xs flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div>
                      <p className="font-bold text-slate-800 text-xs">Direction Générale (Super-Admin)</p>
                      <p className="text-[10px] text-slate-500">Gouvernance totale, contrôle d'accès & GitHub</p>
                    </div>
                    <UserCheck className="w-3.5 h-3.5 text-blue-900 shrink-0" />
                  </button>

                  <button
                    onClick={() => handleQuickRole('EDITOR')}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-purple-900 hover:bg-purple-50/50 text-xs flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div>
                      <p className="font-bold text-slate-800 text-xs">Secrétariat & Communication (Éditeur)</p>
                      <p className="text-[10px] text-slate-500">Gestion éditoriale du blog et des actualités</p>
                    </div>
                    <UserCheck className="w-3.5 h-3.5 text-purple-900 shrink-0" />
                  </button>

                  <button
                    onClick={() => handleQuickRole('TEACHER')}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-emerald-900 hover:bg-emerald-50/50 text-xs flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div>
                      <p className="font-bold text-slate-800 text-xs">Professeur SVT & Sciences (Enseignant)</p>
                      <p className="text-[10px] text-slate-500">Planification des devoirs et événements scolaires</p>
                    </div>
                    <UserCheck className="w-3.5 h-3.5 text-emerald-800 shrink-0" />
                  </button>

                  <button
                    onClick={() => handleQuickRole('MODERATOR')}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-amber-900 hover:bg-amber-50/50 text-xs flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div>
                      <p className="font-bold text-slate-800 text-xs">Accueil & Vie Scolaire (Modérateur)</p>
                      <p className="text-[10px] text-slate-500">Boîte de réception, suivi des messages familles</p>
                    </div>
                    <UserCheck className="w-3.5 h-3.5 text-amber-800 shrink-0" />
                  </button>

                  <button
                    onClick={() => handleQuickRole('PARENT')}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-blue-900 hover:bg-blue-50/50 text-xs flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div>
                      <p className="font-bold text-slate-800 text-xs">Espace Parent d'Élève</p>
                      <p className="text-[10px] text-slate-500">Consultation des dossiers et circulaires</p>
                    </div>
                    <UserCheck className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                  </button>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};
