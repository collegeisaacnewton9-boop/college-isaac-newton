import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  UserPlus, 
  RefreshCw,
  Power,
  X,
  Mail,
  Phone,
  Building,
  Check,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { User, Role } from '../../types';
import { apiService } from '../../services/api';
import { ROLE_PERMISSIONS } from '../../data/rolePermissions';

interface AccessControlViewProps {
  currentUser?: User | null;
  onRoleSwitched?: (role: Role) => void;
  hideHeader?: boolean;
}

export const AccessControlView: React.FC<AccessControlViewProps> = ({
  currentUser,
  hideHeader = false,
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modal: Add New User / Team Member
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    department: 'Direction Pédagogique',
    role: 'EDITOR' as Role,
  });

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const data = await apiService.getUsers();
      setUsers(data);
    } catch {
      toast.error('Erreur lors du chargement des utilisateurs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Handle Role Assignment
  const handleAssignRole = async (userId: string, newRole: Role) => {
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) return;

    if (targetUser.role === 'ADMIN' && newRole !== 'ADMIN') {
      const adminCount = users.filter(u => u.role === 'ADMIN' && u.status !== 'SUSPENDED').length;
      if (adminCount <= 1) {
        toast.error('Opération interdite', {
          description: 'Impossible de rétrograder le dernier Administrateur actif.',
        });
        return;
      }
    }

    try {
      const updated = await apiService.updateUserRole(userId, newRole);
      if (updated) {
        setUsers(prev => prev.map(u => (u.id === userId ? { ...u, role: updated.role } : u)));
      }
      toast.success('Rôle mis à jour', {
        description: `${targetUser.fullName} est désormais ${newRole}.`,
      });
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la modification du rôle');
    }
  };

  // Handle Account Status (Active / Suspended)
  const handleToggleStatus = async (user: User) => {
    const nextStatus = user.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';

    if (user.role === 'ADMIN' && nextStatus === 'SUSPENDED') {
      const activeAdmins = users.filter(u => u.role === 'ADMIN' && u.status !== 'SUSPENDED').length;
      if (activeAdmins <= 1) {
        toast.error('Action refusée', {
          description: 'Impossible de désactiver le seul Administrateur actif.',
        });
        return;
      }
    }

    try {
      const updated = await apiService.updateUserStatus(user.id, nextStatus);
      if (updated) {
        setUsers(prev => prev.map(u => (u.id === user.id ? { ...u, status: updated.status } : u)));
      }
      toast.success(nextStatus === 'ACTIVE' ? 'Compte activé' : 'Compte suspendu', {
        description: `L'accès pour ${user.fullName} est désormais ${nextStatus === 'ACTIVE' ? 'autorisé' : 'verrouillé'}.`,
      });
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la mise à jour du statut');
    }
  };

  // Delete User
  const handleDeleteUser = async (user: User) => {
    if (user.role === 'ADMIN') {
      const adminCount = users.filter(u => u.role === 'ADMIN').length;
      if (adminCount <= 1) {
        toast.error('Suppression impossible', {
          description: 'Vous devez conserver au moins un Administrateur.',
        });
        return;
      }
    }

    if (!window.confirm(`Confirmer la suppression du compte de ${user.fullName} (${user.email}) ?`)) {
      return;
    }

    try {
      await apiService.deleteUser(user.id);
      setUsers(prev => prev.filter(u => u.id !== user.id));
      toast.success('Compte supprimé avec succès');
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la suppression');
    }
  };

  // Create User
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserForm.fullName.trim() || !newUserForm.email.trim()) {
      toast.error('Le nom complet et l’e-mail sont requis');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await apiService.createUser({
        fullName: newUserForm.fullName.trim(),
        email: newUserForm.email.trim().toLowerCase(),
        phone: newUserForm.phone.trim(),
        department: newUserForm.department.trim(),
        role: newUserForm.role,
        status: 'ACTIVE',
      });

      setUsers(prev => [...prev, created]);
      setShowAddModal(false);
      setNewUserForm({
        fullName: '',
        email: '',
        phone: '',
        department: 'Direction Pédagogique',
        role: 'EDITOR',
      });

      toast.success('Utilisateur créé avec succès !', {
        description: `${created.fullName} (${created.email})`,
      });
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la création');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered Users
  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.department && u.department.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || 
      (statusFilter === 'ACTIVE' && u.status !== 'SUSPENDED') ||
      (statusFilter === 'SUSPENDED' && u.status === 'SUSPENDED');

    return matchesSearch && matchesRole && matchesStatus;
  });

  const totalCount = users.length;
  const adminCount = users.filter(u => u.role === 'ADMIN').length;
  const activeCount = users.filter(u => u.status !== 'SUSPENDED').length;
  const suspendedCount = users.filter(u => u.status === 'SUSPENDED').length;

  return (
    <div className="space-y-4 font-sans text-slate-800">
      
      {/* HEADER SECTION (Standard SaaS Title + KPI Metrics) */}
      {!hideHeader && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:px-4 sm:py-3 rounded-2xl border border-slate-200/80 shadow-xs">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-900" />
              <span>Contrôle d’Accès & Équipe (RBAC)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Gestion centralisée des collaborateurs, attribution des rôles et sécurité
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={loadUsers}
              disabled={isLoading}
              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
              title="Rafraîchir"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
            </button>

            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-950 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-amber-400" />
              <span>Inviter un Utilisateur</span>
            </button>
          </div>
        </div>
      )}

      {/* METRIC TILES */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-slate-500 text-[11px] font-semibold uppercase tracking-wider block">Total Comptes</span>
          <span className="text-xl font-black text-slate-900 font-mono mt-1 block">{totalCount}</span>
        </div>
        <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-slate-500 text-[11px] font-semibold uppercase tracking-wider block">Administrateurs</span>
          <span className="text-xl font-black text-blue-900 font-mono mt-1 block">{adminCount}</span>
        </div>
        <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-slate-500 text-[11px] font-semibold uppercase tracking-wider block">Actifs</span>
          <span className="text-xl font-black text-emerald-600 font-mono mt-1 block">{activeCount}</span>
        </div>
        <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-slate-500 text-[11px] font-semibold uppercase tracking-wider block">Suspendus</span>
          <span className="text-xl font-black text-slate-400 font-mono mt-1 block">{suspendedCount}</span>
        </div>
      </div>

      {/* SEARCH & FILTERS BAR */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-3 sm:p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Rechercher par nom, e-mail, département..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-900 outline-none"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white text-slate-800 font-medium outline-none"
            >
              <option value="ALL">Tous les rôles</option>
              <option value="ADMIN">Administrateur</option>
              <option value="EDITOR">Secrétariat / Éditeur</option>
              <option value="TEACHER">Enseignant</option>
              <option value="MODERATOR">Modérateur</option>
              <option value="PARENT">Parent d'Élève</option>
              <option value="STUDENT">Élève</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white text-slate-800 font-medium outline-none"
            >
              <option value="ALL">Tous statuts</option>
              <option value="ACTIVE">Actifs</option>
              <option value="SUSPENDED">Suspendus</option>
            </select>

            {hideHeader && (
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-950 text-white font-bold text-xs shadow-xs cursor-pointer shrink-0"
              >
                <UserPlus className="w-3.5 h-3.5 text-amber-400" />
                <span>Ajouter</span>
              </button>
            )}
          </div>

        </div>

        {/* INTERNATIONAL STANDARD DATA TABLE */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs min-w-[700px]">
            <thead className="bg-slate-50/90 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-3.5">Utilisateur</th>
                <th className="py-3 px-3">Rôle Système</th>
                <th className="py-3 px-3">Département</th>
                <th className="py-3 px-3">Statut</th>
                <th className="py-3 px-3">Dernière Activité</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                    Aucun utilisateur trouvé pour ces critères.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isSuspended = user.status === 'SUSPENDED';
                  const initials = user.fullName
                    .split(' ')
                    .map(n => n[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase();

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Name & Email */}
                      <td className="py-2.5 px-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black text-white shrink-0 ${
                            user.role === 'ADMIN' ? 'bg-slate-900' : 'bg-blue-900'
                          }`}>
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-slate-900 block truncate">{user.fullName}</span>
                            <span className="text-[11px] text-slate-500 font-mono block truncate">{user.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Role selection dropdown */}
                      <td className="py-2.5 px-3">
                        <select
                          value={user.role}
                          onChange={(e) => handleAssignRole(user.id, e.target.value as Role)}
                          className={`text-xs font-bold px-2 py-1 rounded-lg border outline-none cursor-pointer transition-colors ${
                            user.role === 'ADMIN' 
                              ? 'bg-slate-900 text-white border-slate-900'
                              : user.role === 'EDITOR'
                              ? 'bg-purple-50 text-purple-900 border-purple-200'
                              : user.role === 'TEACHER'
                              ? 'bg-blue-50 text-blue-900 border-blue-200'
                              : 'bg-slate-100 text-slate-800 border-slate-200'
                          }`}
                        >
                          <option value="ADMIN">ADMIN</option>
                          <option value="EDITOR">ÉDITEUR</option>
                          <option value="TEACHER">ENSEIGNANT</option>
                          <option value="MODERATOR">MODÉRATEUR</option>
                          <option value="PARENT">PARENT</option>
                          <option value="STUDENT">ÉLÈVE</option>
                        </select>
                      </td>

                      {/* Department */}
                      <td className="py-2.5 px-3 text-slate-600 font-medium">
                        {user.department || 'Pédagogique'}
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-3">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isSuspended 
                            ? 'bg-red-50 text-red-700 border border-red-200' 
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isSuspended ? 'bg-red-500' : 'bg-emerald-500'}`} />
                          <span>{isSuspended ? 'Suspendu' : 'Actif'}</span>
                        </span>
                      </td>

                      {/* Last Active */}
                      <td className="py-2.5 px-3 text-slate-500 text-[11px] font-mono">
                        {user.lastActive || 'En ligne'}
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Toggle Status */}
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(user)}
                            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                              isSuspended
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                            title={isSuspended ? 'Réactiver le compte' : 'Suspendre le compte'}
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(user)}
                            className="p-1.5 rounded-lg bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-700 border border-slate-200 hover:border-red-200 transition-colors cursor-pointer"
                            title="Supprimer le compte"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL : INVITER UN UTILISATEUR */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-5 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
                  <UserPlus className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">
                    Nouveau Collaborateur
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Création d’un compte avec accès sécurisé
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1 text-[11px] uppercase">Nom Complet</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Jean Baptiste Estimé"
                  value={newUserForm.fullName}
                  onChange={(e) => setNewUserForm({ ...newUserForm, fullName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-medium focus:bg-white focus:border-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 text-[11px] uppercase">Adresse E-mail</label>
                <input
                  type="email"
                  required
                  placeholder="nom@collegeisaacnewton.com"
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-medium focus:bg-white focus:border-slate-900 outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 text-[11px] uppercase">Téléphone</label>
                  <input
                    type="text"
                    placeholder="+509 ..."
                    value={newUserForm.phone}
                    onChange={(e) => setNewUserForm({ ...newUserForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-medium focus:bg-white focus:border-slate-900 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1 text-[11px] uppercase">Rôle</label>
                  <select
                    value={newUserForm.role}
                    onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value as Role })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold focus:bg-white focus:border-slate-900 outline-none"
                  >
                    <option value="ADMIN">ADMIN</option>
                    <option value="EDITOR">ÉDITEUR</option>
                    <option value="TEACHER">ENSEIGNANT</option>
                    <option value="MODERATOR">MODÉRATEUR</option>
                    <option value="PARENT">PARENT</option>
                    <option value="STUDENT">ÉLÈVE</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 text-[11px] uppercase">Département</label>
                <input
                  type="text"
                  placeholder="ex: Pôle Sciences & Informatique"
                  value={newUserForm.department}
                  onChange={(e) => setNewUserForm({ ...newUserForm, department: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-medium focus:bg-white focus:border-slate-900 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-950 text-white font-bold transition-colors cursor-pointer shadow-xs"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                  ) : (
                    <Check className="w-3.5 h-3.5 text-amber-400" />
                  )}
                  <span>Enregistrer l'Utilisateur</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
