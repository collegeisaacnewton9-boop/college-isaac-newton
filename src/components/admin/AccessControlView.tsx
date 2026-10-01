import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  ShieldCheck, 
  Users, 
  UserCheck, 
  BookOpen, 
  Mail, 
  Lock, 
  Unlock,
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Edit3, 
  Trash2, 
  HelpCircle, 
  Check, 
  Sparkles, 
  Sliders, 
  UserPlus, 
  Eye, 
  RefreshCw,
  KeyRound,
  ExternalLink,
  ChevronDown,
  Info,
  Calendar,
  Building,
  Power
} from 'lucide-react';
import { toast } from 'sonner';
import { User, Role } from '../../types';
import { apiService } from '../../services/api';
import { ROLE_PERMISSIONS } from '../../data/rolePermissions';
import { RoleHelperTooltip } from './RoleHelperTooltip';
import { RolePermissionsMatrix } from './RolePermissionsMatrix';

interface AccessControlViewProps {
  currentUser: User | null;
  onRoleSwitched?: (role: Role) => void;
}

export const AccessControlView: React.FC<AccessControlViewProps> = ({
  currentUser,
  onRoleSwitched,
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [showMatrix, setShowMatrix] = useState(false);

  // Modal: Add New User / Collaborator
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    department: 'Pôle Pédagogique',
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

  // Handle Granular Role Assignment
  const handleAssignRole = async (userId: string, newRole: Role) => {
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) return;

    // Protection: Prevent removing the last active Super-Admin
    if (targetUser.role === 'ADMIN' && newRole !== 'ADMIN') {
      const adminCount = users.filter(u => u.role === 'ADMIN' && u.status !== 'SUSPENDED').length;
      if (adminCount <= 1) {
        toast.error('Opération interdite', {
          description: 'Impossible de rétrograder le dernier Super-Administrateur actif de l’établissement.',
        });
        return;
      }
    }

    try {
      const updated = await apiService.updateUserRole(userId, newRole);
      if (updated) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
        
        const roleInfo = ROLE_PERMISSIONS[newRole];
        toast.success(`Rôle attribué avec succès`, {
          description: `${targetUser.fullName} est désormais assigné au rôle « ${roleInfo.badgeLabel} » (${roleInfo.name}).`,
        });
      }
    } catch {
      toast.error('Erreur lors de la modification du rôle');
    }
  };

  // Instant Account Enable / Disable Toggle Switch
  const handleToggleStatus = async (user: User) => {
    // Safety Guard: Cannot disable the only active Super-Admin
    if (user.role === 'ADMIN' && user.status !== 'SUSPENDED') {
      const activeAdminCount = users.filter(u => u.role === 'ADMIN' && u.status !== 'SUSPENDED').length;
      if (activeAdminCount <= 1) {
        toast.error('Désactivation impossible', {
          description: 'Vous ne pouvez pas désactiver le seul Super-Administrateur actif de la plateforme.',
        });
        return;
      }
    }

    const newStatus = user.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';

    // Optimistic UI update
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: newStatus } : u));

    try {
      await apiService.updateUserStatus(user.id, newStatus);
      if (newStatus === 'ACTIVE') {
        toast.success('Compte activé instantanément', {
          description: `L'accès pour ${user.fullName} est rétabli sans modification de ses privilèges.`,
        });
      } else {
        toast.warning('Compte désactivé instantanément', {
          description: `L'accès pour ${user.fullName} est bloqué immédiatement sans supprimer ses données.`,
        });
      }
    } catch {
      // Revert if error
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: user.status } : u));
      toast.error('Erreur lors de la mise à jour du statut');
    }
  };

  // Delete User
  const handleDeleteUser = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    if (user.role === 'ADMIN') {
      const adminCount = users.filter(u => u.role === 'ADMIN').length;
      if (adminCount <= 1) {
        toast.error('Suppression impossible', {
          description: 'Vous ne pouvez pas supprimer le seul Super-Administrateur de la plateforme.',
        });
        return;
      }
    }

    if (!window.confirm(`Confirmez-vous la suppression définitive de l’accès pour ${user.fullName} (${user.email}) ?`)) {
      return;
    }

    try {
      await apiService.deleteUser(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
      toast.success('Collaborateur retiré', {
        description: `L'accès de ${user.fullName} a été révoqué avec succès.`,
      });
    } catch {
      toast.error('Erreur lors de la suppression de l’utilisateur');
    }
  };

  // Create New User with Delegated Role
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserForm.fullName.trim() || !newUserForm.email.trim()) {
      toast.error('Veuillez renseigner le nom complet et l’e-mail');
      return;
    }

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
        department: 'Pôle Pédagogique',
        role: 'EDITOR',
      });

      const roleDetail = ROLE_PERMISSIONS[created.role];
      toast.success('Nouveau collaborateur ajouté !', {
        description: `${created.fullName} a été configuré avec le rôle ${roleDetail.badgeLabel}.`,
      });
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la création de l’utilisateur');
    }
  };

  // Filtered Users List
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

  // Calculate Delegation Stats
  const adminCount = users.filter(u => u.role === 'ADMIN').length;
  const editorCount = users.filter(u => u.role === 'EDITOR').length;
  const teacherCount = users.filter(u => u.role === 'TEACHER').length;
  const moderatorCount = users.filter(u => u.role === 'MODERATOR').length;
  const activeCount = users.filter(u => u.status !== 'SUSPENDED').length;
  const suspendedCount = users.filter(u => u.status === 'SUSPENDED').length;

  return (
    <div className="space-y-2 sm:space-y-2.5 animate-fade-in">

      {/* ------------------------------------------------------------------
          1. COMPACT HEADER & METRICS SUMMARY
      ------------------------------------------------------------------ */}
      <div className="bg-white rounded-xl p-2.5 sm:px-3 sm:py-2 border border-slate-200/90 shadow-2xs space-y-2">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-900 text-white flex items-center justify-center shadow-2xs shrink-0">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="font-sans font-bold text-slate-900 text-xs sm:text-sm tracking-tight">
                  Contrôle d’Accès & Attribution des Rôles (RBAC)
                </h2>
                <span className="px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-900 text-[9px] font-sans font-bold uppercase tracking-wider">
                  Super-Admin
                </span>
              </div>
              <p className="font-sans text-[10.5px] text-slate-500">
                Activez/désactivez instantanément les accès et déléguez la gestion aux membres du personnel.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={loadUsers}
              disabled={isLoading}
              className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
              title="Actualiser les utilisateurs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
            </button>

            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-900 hover:bg-blue-950 text-white font-sans font-semibold text-xs shadow-2xs transition-all active:scale-98 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5 text-amber-400" />
              <span>Nouveau Collaborateur</span>
            </button>
          </div>
        </div>

        {/* Dense KPI Grid: 4 Roles + Status Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-2.5">
          
          <div className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-200/80 space-y-0.5">
            <div className="flex items-center justify-between text-[10.5px] text-blue-900 font-sans font-semibold">
              <span>Super-Admins</span>
              <Shield className="w-3 h-3 text-blue-600" />
            </div>
            <div className="font-sans text-lg sm:text-xl font-black text-blue-950 tracking-tight">{adminCount}</div>
            <p className="font-sans text-[9.5px] text-blue-800">Direction Générale</p>
          </div>

          <div className="p-2.5 rounded-lg bg-purple-50/70 border border-purple-200/80 space-y-0.5">
            <div className="flex items-center justify-between text-[10.5px] text-purple-900 font-sans font-semibold">
              <span>Éditeurs</span>
              <BookOpen className="w-3 h-3 text-purple-600" />
            </div>
            <div className="font-sans text-lg sm:text-xl font-black text-purple-950 tracking-tight">{editorCount}</div>
            <p className="font-sans text-[9.5px] text-purple-800">Presse & CMS</p>
          </div>

          <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200/80 space-y-0.5">
            <div className="flex items-center justify-between text-[10.5px] text-emerald-900 font-sans font-semibold">
              <span>Enseignants</span>
              <UserCheck className="w-3 h-3 text-emerald-600" />
            </div>
            <div className="font-sans text-lg sm:text-xl font-black text-emerald-950 tracking-tight">{teacherCount}</div>
            <p className="font-sans text-[9.5px] text-emerald-800">Agenda Officiel</p>
          </div>

          <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200/80 space-y-0.5">
            <div className="flex items-center justify-between text-[10.5px] text-amber-900 font-sans font-semibold">
              <span>Modérateurs</span>
              <Mail className="w-3 h-3 text-amber-600" />
            </div>
            <div className="font-sans text-lg sm:text-xl font-black text-amber-950 tracking-tight">{moderatorCount}</div>
            <p className="font-sans text-[9.5px] text-amber-800">Accueil & Messages</p>
          </div>

          <div className="p-2.5 rounded-lg bg-teal-50/70 border border-teal-200/80 space-y-0.5">
            <div className="flex items-center justify-between text-[10.5px] text-teal-900 font-sans font-semibold">
              <span>Comptes Actifs</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="font-sans text-lg sm:text-xl font-black text-teal-950 tracking-tight">{activeCount}</div>
            <p className="font-sans text-[9.5px] text-teal-800">Accès autorisés</p>
          </div>

          <div className="p-2.5 rounded-lg bg-rose-50/70 border border-rose-200/80 space-y-0.5">
            <div className="flex items-center justify-between text-[10.5px] text-rose-900 font-sans font-semibold">
              <span>Suspendus</span>
              <Lock className="w-3 h-3 text-rose-600" />
            </div>
            <div className="font-sans text-lg sm:text-xl font-black text-rose-950 tracking-tight">{suspendedCount}</div>
            <p className="font-sans text-[9.5px] text-rose-800">Accès verrouillés</p>
          </div>

        </div>

      </div>

      {/* ------------------------------------------------------------------
          2. GRANULAR ROLE GUIDE & VISUALIZATION MATRIX (READ / WRITE / DELETE)
      ------------------------------------------------------------------ */}
      <div className="bg-white rounded-xl p-2.5 sm:px-3 sm:py-2 border border-slate-200/90 shadow-2xs space-y-2.5">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-400/20 text-amber-800 flex items-center justify-center shrink-0">
              <KeyRound className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="font-sans font-bold text-slate-900 text-xs sm:text-sm tracking-tight">
                Guide des Rôles & Périmètres d’Accès Délégués
              </h3>
              <p className="font-sans text-[10.5px] text-slate-500">
                Périmètres de gestion attribués aux Éditeurs, Enseignants et Modérateurs.
              </p>
            </div>
          </div>
        </div>

        {/* Compact Grid of 3 Cards: EDITOR, TEACHER, MODERATOR */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-2.5">
          <RoleHelperTooltip role="EDITOR" variant="card" />
          <RoleHelperTooltip role="TEACHER" variant="card" />
          <RoleHelperTooltip role="MODERATOR" variant="card" />
        </div>
      </div>

      {/* ------------------------------------------------------------------
          2.B FULL VISUALIZATION MATRIX GRID (ALL SITE FEATURES VS ROLES R/W/D)
      ------------------------------------------------------------------ */}
      <RolePermissionsMatrix defaultExpanded={showMatrix} />

      {/* ------------------------------------------------------------------
          3. DENSE ERGONOMIC USER MANAGEMENT TABLE WITH TOGGLE SWITCH
      ------------------------------------------------------------------ */}
      <div className="bg-white rounded-xl p-2.5 sm:px-3 sm:py-2 border border-slate-200/90 shadow-2xs space-y-2">
        
        {/* Search, Status & Role Filters Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-sans font-bold text-slate-900 text-xs sm:text-sm tracking-tight">
              Gestion des Collaborateurs & Accès Instantané
            </h3>
            <p className="text-[10.5px] text-slate-500">
              Basculez le bouton toggle switch pour suspendre ou réactiver l'accès d'un compte sans le supprimer.
            </p>
          </div>

          <div className="text-[11px] text-slate-500 shrink-0">
            <strong>{filteredUsers.length}</strong> utilisateur(s) listé(s)
          </div>
        </div>

        {/* Compact Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100">
          <div className="relative sm:col-span-2">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
            <input
              type="text"
              placeholder="Rechercher par nom, email, département..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 focus:outline-hidden"
            />
          </div>

          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-2 py-1.5 text-xs rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 focus:outline-hidden"
            >
              <option value="ALL">Tous les rôles</option>
              <option value="ADMIN">Super-Admin (Direction)</option>
              <option value="EDITOR">Éditeur (Presse & News)</option>
              <option value="TEACHER">Enseignant (Agenda & Pédagogie)</option>
              <option value="MODERATOR">Modérateur (Secrétariat & Messages)</option>
              <option value="PARENT">Parent d'Élève</option>
              <option value="STUDENT">Élève</option>
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-2 py-1.5 text-xs rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 focus:outline-hidden font-medium"
            >
              <option value="ALL">Tous les statuts</option>
              <option value="ACTIVE">Actifs uniquement</option>
              <option value="SUSPENDED">Suspendus uniquement</option>
            </select>
          </div>
        </div>

        {/* High-Density Users Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-2xs">
          <table className="w-full text-left text-xs min-w-[650px]">
            <thead className="bg-slate-50/95 text-slate-600 font-semibold border-b border-slate-200 text-[10.5px]">
              <tr>
                <th className="py-2 px-2.5">Collaborateur</th>
                <th className="py-2 px-2.5">Département / Affectation</th>
                <th className="py-2 px-2.5">Rôle & Scope Granulaire</th>
                <th className="py-2 px-2.5 text-center">Accès Actif (Toggle)</th>
                <th className="py-2 px-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    Aucun collaborateur trouvé pour ces critères de recherche.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((usr) => {
                  const roleDetail = ROLE_PERMISSIONS[usr.role] || ROLE_PERMISSIONS.EDITOR;
                  const isCurrentSuperAdmin = usr.id === currentUser?.id;
                  const isSuspended = usr.status === 'SUSPENDED';

                  return (
                    <tr 
                      key={usr.id} 
                      className={`transition-colors ${
                        isSuspended 
                          ? 'bg-slate-50/80 text-slate-400 hover:bg-slate-100/70' 
                          : 'hover:bg-blue-50/30'
                      }`}
                    >
                      
                      {/* Name & Email */}
                      <td className="py-2 px-2.5">
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-2xs shrink-0 ${
                            isSuspended ? 'bg-slate-400' :
                            usr.role === 'ADMIN' ? 'bg-blue-900' :
                            usr.role === 'EDITOR' ? 'bg-purple-800' :
                            usr.role === 'TEACHER' ? 'bg-emerald-700' :
                            usr.role === 'MODERATOR' ? 'bg-amber-700' :
                            'bg-slate-700'
                          }`}>
                            {usr.fullName.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`font-bold text-xs ${isSuspended ? 'text-slate-500 line-through decoration-slate-400' : 'text-slate-900'}`}>
                                {usr.fullName}
                              </span>
                              {isCurrentSuperAdmin && (
                                <span className="px-1.5 py-0.2 rounded-md bg-blue-100 text-blue-900 text-[9px] font-bold">
                                  Vous
                                </span>
                              )}
                              {isSuspended && (
                                <span className="px-1.5 py-0.2 rounded-md bg-rose-100 text-rose-700 text-[8.5px] font-bold flex items-center gap-0.5">
                                  <Lock className="w-2.5 h-2.5" />
                                  <span>Suspendu</span>
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono block leading-tight">{usr.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Department */}
                      <td className="py-2 px-2.5">
                        <span className="font-semibold text-slate-800 block text-[11px] leading-tight">{usr.department || 'Pôle Général'}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{usr.phone || '+509 ---'}</span>
                      </td>

                      {/* Role Selector & Helper Text Trigger */}
                      <td className="py-2 px-2.5">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            {/* Granular Role Selector Dropdown */}
                            <select
                              value={usr.role}
                              disabled={isSuspended}
                              onChange={(e) => handleAssignRole(usr.id, e.target.value as Role)}
                              className={`text-[11px] font-bold py-0.5 px-2 rounded-lg border focus:outline-hidden cursor-pointer transition-all ${
                                isSuspended
                                  ? 'bg-slate-100 border-slate-300 text-slate-400 cursor-not-allowed'
                                  : usr.role === 'ADMIN' ? 'bg-blue-50 border-blue-300 text-blue-900' :
                                    usr.role === 'EDITOR' ? 'bg-purple-50 border-purple-300 text-purple-900' :
                                    usr.role === 'TEACHER' ? 'bg-emerald-50 border-emerald-300 text-emerald-900' :
                                    usr.role === 'MODERATOR' ? 'bg-amber-50 border-amber-300 text-amber-900' :
                                    'bg-slate-50 border-slate-300 text-slate-700'
                              }`}
                            >
                              <option value="ADMIN">Super-Admin (Direction)</option>
                              <option value="EDITOR">Éditeur (Presse & News)</option>
                              <option value="TEACHER">Enseignant (Agenda & Pédagogie)</option>
                              <option value="MODERATOR">Modérateur (Secrétariat & Messages)</option>
                              <option value="PARENT">Parent d'Élève (Portail)</option>
                              <option value="STUDENT">Élève (Portail)</option>
                            </select>

                            {/* Tooltip & Helper Text Component */}
                            <RoleHelperTooltip role={usr.role} variant="compact" />
                          </div>

                          <p className="text-[10px] text-slate-500 leading-tight truncate max-w-xs">
                            {roleDetail.summary}
                          </p>
                        </div>
                      </td>

                      {/* INSTANT ACCESS TOGGLE SWITCH */}
                      <td className="py-2 px-2.5">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            role="switch"
                            aria-checked={!isSuspended}
                            disabled={isCurrentSuperAdmin && adminCount <= 1}
                            onClick={() => handleToggleStatus(usr)}
                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:ring-offset-1 ${
                              isCurrentSuperAdmin && adminCount <= 1
                                ? 'cursor-not-allowed opacity-50 bg-slate-300'
                                : isSuspended
                                ? 'bg-slate-300 hover:bg-slate-400'
                                : 'bg-emerald-500 hover:bg-emerald-600'
                            }`}
                            title={
                              isCurrentSuperAdmin && adminCount <= 1
                                ? 'Le dernier Super-Administrateur ne peut pas être désactivé'
                                : isSuspended
                                ? 'Compte suspendu - Basculer pour réactiver l\'accès immédiatement'
                                : 'Compte actif - Basculer pour suspendre l\'accès immédiatement'
                            }
                          >
                            <span className="sr-only">Activer ou désactiver l'accès</span>
                            <span
                              aria-hidden="true"
                              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                                isSuspended ? 'translate-x-0' : 'translate-x-4'
                              }`}
                            />
                          </button>
                          
                          <span className={`text-[10px] font-bold select-none min-w-14 ${
                            isSuspended ? 'text-rose-600' : 'text-emerald-700'
                          }`}>
                            {isSuspended ? 'Suspendu' : 'Actif'}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-2 px-2.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(usr.id)}
                            disabled={isCurrentSuperAdmin && adminCount <= 1}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              isCurrentSuperAdmin && adminCount <= 1
                                ? 'text-slate-300 cursor-not-allowed'
                                : 'text-rose-700 hover:bg-rose-100'
                            }`}
                            title="Révoquer définitivement l'accès"
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

      {/* ------------------------------------------------------------------
          4. MODAL: ADD NEW COLLABORATOR / USER
      ------------------------------------------------------------------ */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-3 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-3 sm:px-4 sm:py-3.5 space-y-2.5 shadow-2xl border border-slate-200 animate-scale-in">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-900 flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-sans font-bold text-slate-900 text-sm tracking-tight">
                    Ajouter un Collaborateur
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    Attribuez un rôle granulaire avec permissions déléguées.
                  </p>
                </div>
              </div>
              
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nom Complet du Collaborateur
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: Prof. Jean Baptiste / Mme Marie Estimé"
                  value={newUserForm.fullName}
                  onChange={(e) => setNewUserForm({ ...newUserForm, fullName: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 focus:outline-hidden text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Adresse Courriel
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="collaborateur@collegeisaacnewton.com"
                    value={newUserForm.email}
                    onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 focus:outline-hidden text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Téléphone Direct
                  </label>
                  <input
                    type="tel"
                    placeholder="+509 3xxx-xxxx"
                    value={newUserForm.phone}
                    onChange={(e) => setNewUserForm({ ...newUserForm, phone: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 focus:outline-hidden text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Département / Affectation
                </label>
                <input
                  type="text"
                  placeholder="ex: Département des Sciences / Secrétariat Général"
                  value={newUserForm.department}
                  onChange={(e) => setNewUserForm({ ...newUserForm, department: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 focus:outline-hidden text-xs"
                />
              </div>

              {/* Role Selection with Helper Preview */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Rôle & Niveau de Responsabilité
                </label>
                <select
                  value={newUserForm.role}
                  onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value as Role })}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 focus:outline-hidden text-xs font-bold"
                >
                  <option value="EDITOR">Éditeur (Presse, Actualités & Blog)</option>
                  <option value="TEACHER">Enseignant (Agenda Officiel & Pédagogie)</option>
                  <option value="MODERATOR">Modérateur (Secrétariat & Messages Familles)</option>
                  <option value="ADMIN">Super-Administrateur (Direction Générale)</option>
                </select>

                {/* Helper text preview for the chosen role */}
                <div className="mt-2 p-2.5 rounded-lg bg-blue-50/70 border border-blue-200 text-slate-700 space-y-0.5">
                  <div className="flex items-center gap-1 font-bold text-blue-900 text-[10.5px]">
                    <Info className="w-3 h-3 text-blue-600" />
                    <span>Périmètre ({ROLE_PERMISSIONS[newUserForm.role].badgeLabel}) :</span>
                  </div>
                  <p className="text-[10px] leading-tight">
                    {ROLE_PERMISSIONS[newUserForm.role].summary}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer text-xs"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-blue-900 hover:bg-blue-950 text-white font-bold shadow-xs cursor-pointer flex items-center gap-1 text-xs"
                >
                  <Check className="w-3.5 h-3.5 text-amber-400" />
                  <span>Enregistrer</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
