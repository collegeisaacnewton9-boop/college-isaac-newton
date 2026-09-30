import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  ShieldCheck, 
  Users, 
  UserCheck, 
  BookOpen, 
  Mail, 
  Lock, 
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
  Building
} from 'lucide-react';
import { toast } from 'sonner';
import { User, Role } from '../../types';
import { apiService } from '../../services/api';
import { ROLE_PERMISSIONS } from '../../data/rolePermissions';
import { RoleHelperTooltip } from './RoleHelperTooltip';

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
  const [selectedRoleGuide, setSelectedRoleGuide] = useState<Role | null>(null);
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

    // Protection: Prevent removing the last Super-Admin
    if (targetUser.role === 'ADMIN' && newRole !== 'ADMIN') {
      const adminCount = users.filter(u => u.role === 'ADMIN').length;
      if (adminCount <= 1) {
        toast.error('Opération interdite', {
          description: 'Impossible de rétrograder le dernier Super-Administrateur de l’établissement.',
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

  // Toggle User Active / Suspended Status
  const handleToggleStatus = async (user: User) => {
    const newStatus = user.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
    try {
      await apiService.updateUserStatus(user.id, newStatus);
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
      toast.success(`Statut mis à jour`, {
        description: `Le compte de ${user.fullName} est maintenant ${newStatus === 'ACTIVE' ? 'Actif' : 'Suspendu'}.`,
      });
    } catch {
      toast.error('Erreur lors de la modification du statut');
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

    if (!window.confirm(`Confirmez-vous la suppression de l’accès pour ${user.fullName} (${user.email}) ?`)) {
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
    return matchesSearch && matchesRole;
  });

  // Calculate Delegation Stats
  const adminCount = users.filter(u => u.role === 'ADMIN').length;
  const editorCount = users.filter(u => u.role === 'EDITOR').length;
  const teacherCount = users.filter(u => u.role === 'TEACHER').length;
  const moderatorCount = users.filter(u => u.role === 'MODERATOR').length;

  return (
    <div className="space-y-8 animate-fade-in">

      {/* ------------------------------------------------------------------
          1. HEADER & SUPER-ADMIN BANNER
      ------------------------------------------------------------------ */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-900 text-white flex items-center justify-center shadow-md shrink-0">
              <ShieldCheck className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif font-bold text-slate-900 text-lg sm:text-xl">
                  Contrôle d’Accès & Attribution des Rôles (RBAC)
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 text-[10px] font-bold uppercase tracking-wider">
                  Direction Générale
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Déléguez la gestion du site aux membres du personnel en leur attribuant des permissions granulaires adaptées à leurs responsabilités.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={loadUsers}
              disabled={isLoading}
              className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
              title="Actualiser les utilisateurs"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
            </button>

            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-semibold text-xs shadow-md transition-all active:scale-98 cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-amber-400" />
              <span>Nouveau Collaborateur</span>
            </button>
          </div>
        </div>

        {/* 4 Role Metrics Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          
          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 space-y-1">
            <div className="flex items-center justify-between text-xs text-blue-900 font-semibold">
              <span>Super-Admins</span>
              <Shield className="w-4 h-4 text-blue-600" />
            </div>
            <div className="font-serif text-2xl font-black text-blue-950">{adminCount}</div>
            <p className="text-[10px] text-blue-800">Direction & Rectorat</p>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200/80 space-y-1">
            <div className="flex items-center justify-between text-xs text-purple-900 font-semibold">
              <span>Éditeurs Contenu</span>
              <BookOpen className="w-4 h-4 text-purple-600" />
            </div>
            <div className="font-serif text-2xl font-black text-purple-950">{editorCount}</div>
            <p className="text-[10px] text-purple-800">Presse & Publications</p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-1">
            <div className="flex items-center justify-between text-xs text-emerald-900 font-semibold">
              <span>Enseignants</span>
              <UserCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="font-serif text-2xl font-black text-emerald-950">{teacherCount}</div>
            <p className="text-[10px] text-emerald-800">Agenda & Pédagogie</p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-1">
            <div className="flex items-center justify-between text-xs text-amber-900 font-semibold">
              <span>Modérateurs</span>
              <Mail className="w-4 h-4 text-amber-600" />
            </div>
            <div className="font-serif text-2xl font-black text-amber-950">{moderatorCount}</div>
            <p className="text-[10px] text-amber-800">Boîte de Réception & Accueil</p>
          </div>

        </div>

      </div>

      {/* ------------------------------------------------------------------
          2. HELPER TEXT & ROLE DEFINITIONS GUIDE (EDITOR, TEACHER, MODERATOR)
      ------------------------------------------------------------------ */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-5">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400/20 text-amber-800 flex items-center justify-center shrink-0">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-slate-900 text-base">
                Guide des Rôles & Périmètres d'Accès Détaillés
              </h3>
              <p className="text-xs text-slate-500">
                Consultez les privilèges précis alloués à chaque type de profil pour déléguer les tâches en toute sécurité.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowMatrix(!showMatrix)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Sliders className="w-3.5 h-3.5 text-blue-600" />
            <span>{showMatrix ? 'Masquer la Matrice des Permissions' : 'Voir la Matrice Comparative des Permissions'}</span>
          </button>
        </div>

        {/* 3 Dedicated Role Cards: EDITOR, TEACHER, MODERATOR */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <RoleHelperTooltip role="EDITOR" variant="card" />
          <RoleHelperTooltip role="TEACHER" variant="card" />
          <RoleHelperTooltip role="MODERATOR" variant="card" />
        </div>

        {/* Optional Collapsible Permissions Comparison Matrix */}
        {showMatrix && (
          <div className="bg-slate-50/80 rounded-2xl p-4 sm:p-5 border border-slate-200 space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <h4 className="font-serif font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-600" />
                <span>Matrice des Permissions Comparatives par Module</span>
              </h4>
              <span className="text-[11px] text-slate-400">Périmètres Back-Office Collège Isaac Newton</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs bg-white rounded-xl border border-slate-200 overflow-hidden">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200 text-[11px]">
                  <tr>
                    <th className="p-3">Module Système</th>
                    <th className="p-3 text-center">Super-Admin</th>
                    <th className="p-3 text-center">Éditeur (Editor)</th>
                    <th className="p-3 text-center">Enseignant (Teacher)</th>
                    <th className="p-3 text-center">Modérateur (Moderator)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 text-[11px]">
                  <tr>
                    <td className="p-3 font-semibold text-slate-900">Admissions & Préinscriptions</td>
                    <td className="p-3 text-center font-bold text-emerald-600">Complet (Validation/Rejet)</td>
                    <td className="p-3 text-center text-slate-500">Lecture Seule</td>
                    <td className="p-3 text-center text-slate-500">Consultation Listes</td>
                    <td className="p-3 text-center text-slate-400">Non Autorisé</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-900">Publications & Actualités (CMS)</td>
                    <td className="p-3 text-center font-bold text-emerald-600">Complet</td>
                    <td className="p-3 text-center font-bold text-purple-700">Complet (Édition/Publier)</td>
                    <td className="p-3 text-center text-slate-500">Lecture Seule</td>
                    <td className="p-3 text-center text-slate-400">Non Autorisé</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-900">Calendrier & Agenda Officiel</td>
                    <td className="p-3 text-center font-bold text-emerald-600">Complet</td>
                    <td className="p-3 text-center text-slate-500">Lecture Seule</td>
                    <td className="p-3 text-center font-bold text-emerald-700">Complet (Planifier cours/examens)</td>
                    <td className="p-3 text-center text-slate-500">Lecture Seule</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-900">Secrétariat & Messages Contact</td>
                    <td className="p-3 text-center font-bold text-emerald-600">Complet</td>
                    <td className="p-3 text-center text-slate-400">Non Autorisé</td>
                    <td className="p-3 text-center text-slate-400">Non Autorisé</td>
                    <td className="p-3 text-center font-bold text-amber-700">Complet (Répondre/Archiver)</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-900">Contrôle d'Accès & Attribution Rôles</td>
                    <td className="p-3 text-center font-bold text-emerald-600">Super-Admin Exclusif</td>
                    <td className="p-3 text-center text-rose-500 font-bold">Bloqué</td>
                    <td className="p-3 text-center text-rose-500 font-bold">Bloqué</td>
                    <td className="p-3 text-center text-rose-500 font-bold">Bloqué</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-900">Synchronisation GitHub & Paramètres</td>
                    <td className="p-3 text-center font-bold text-emerald-600">Super-Admin Exclusif</td>
                    <td className="p-3 text-center text-rose-500 font-bold">Bloqué</td>
                    <td className="p-3 text-center text-rose-500 font-bold">Bloqué</td>
                    <td className="p-3 text-center text-rose-500 font-bold">Bloqué</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* ------------------------------------------------------------------
          3. USER MANAGEMENT & GRANULAR ROLE ASSIGNMENT TABLE
      ------------------------------------------------------------------ */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-5">
        
        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-serif font-bold text-slate-900 text-base">
              Gestion des Collaborateurs & Affectation des Rôles
            </h3>
            <p className="text-xs text-slate-500">
              Modifiez instantanément les rôles des utilisateurs pour leur ouvrir ou restreindre les accès correspondants.
            </p>
          </div>

          <div className="text-xs text-slate-500">
            <strong>{filteredUsers.length}</strong> utilisateur(s) trouvé(s)
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Rechercher par nom, email, département..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 focus:outline-hidden"
            />
          </div>

          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 focus:outline-hidden"
            >
              <option value="ALL">Tous les rôles</option>
              <option value="ADMIN">Super-Admin (Direction)</option>
              <option value="EDITOR">Éditeur (Presse & Actualités)</option>
              <option value="TEACHER">Enseignant (Agenda & Pédagogie)</option>
              <option value="MODERATOR">Modérateur (Secrétariat & Messages)</option>
              <option value="PARENT">Parent d'Élève</option>
              <option value="STUDENT">Élève</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Rôle Simulé :</span>
            {onRoleSwitched && (
              <select
                onChange={(e) => onRoleSwitched(e.target.value as Role)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-amber-50 border border-amber-300 text-amber-950 font-bold focus:outline-hidden cursor-pointer"
                defaultValue={currentUser?.role || 'ADMIN'}
                title="Tester l'interface avec ce profil"
              >
                <option value="ADMIN">Simuler Super-Admin</option>
                <option value="EDITOR">Simuler Éditeur</option>
                <option value="TEACHER">Simuler Enseignant</option>
                <option value="MODERATOR">Simuler Modérateur</option>
              </select>
            )}
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/90 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3.5">Collaborateur</th>
                <th className="p-3.5">Département / Affectation</th>
                <th className="p-3.5">Rôle & Scope de Permissions</th>
                <th className="p-3.5">Statut</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400">
                    Aucun collaborateur trouvé pour ces critères de recherche.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((usr) => {
                  const roleDetail = ROLE_PERMISSIONS[usr.role] || ROLE_PERMISSIONS.EDITOR;
                  const isCurrentSuperAdmin = usr.id === currentUser?.id;

                  return (
                    <tr key={usr.id} className="hover:bg-slate-50/80 transition-colors">
                      
                      {/* Name & Email */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-2xs ${
                            usr.role === 'ADMIN' ? 'bg-blue-900' :
                            usr.role === 'EDITOR' ? 'bg-purple-800' :
                            usr.role === 'TEACHER' ? 'bg-emerald-700' :
                            usr.role === 'MODERATOR' ? 'bg-amber-700' :
                            'bg-slate-700'
                          }`}>
                            {usr.fullName.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900">{usr.fullName}</span>
                              {isCurrentSuperAdmin && (
                                <span className="px-1.5 py-0.2 rounded-md bg-blue-100 text-blue-900 text-[9px] font-bold">
                                  Vous
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-400 font-mono block">{usr.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Department */}
                      <td className="p-3.5">
                        <span className="font-medium text-slate-800 block">{usr.department || 'Pôle Général'}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{usr.phone || '+509 ---'}</span>
                      </td>

                      {/* Role Selector & Helper Text Trigger */}
                      <td className="p-3.5">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            {/* Granular Role Selector Dropdown */}
                            <select
                              value={usr.role}
                              onChange={(e) => handleAssignRole(usr.id, e.target.value as Role)}
                              className={`text-xs font-bold py-1.5 px-2.5 rounded-xl border focus:outline-hidden cursor-pointer transition-all ${
                                usr.role === 'ADMIN' ? 'bg-blue-50 border-blue-300 text-blue-900' :
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

                          <p className="text-[10px] text-slate-500 leading-tight">
                            {roleDetail.summary}
                          </p>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-3.5">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(usr)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                            usr.status === 'SUSPENDED'
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}
                          title="Cliquer pour basculer Actif / Suspendu"
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${usr.status === 'SUSPENDED' ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                          <span>{usr.status === 'SUSPENDED' ? 'Suspendu' : 'Actif'}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right">
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
                            title="Révoquer l'accès de ce collaborateur"
                          >
                            <Trash2 className="w-4 h-4" />
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
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-200 animate-scale-in">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-slate-900 text-base">
                    Ajouter un Collaborateur
                  </h3>
                  <p className="text-xs text-slate-500">
                    Attribuez un rôle granulaire avec permissions déléguées.
                  </p>
                </div>
              </div>
              
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              
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
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 focus:outline-hidden text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Adresse Courriel
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="collaborateur@collegeisaacnewton.edu"
                    value={newUserForm.email}
                    onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 focus:outline-hidden text-xs"
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
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 focus:outline-hidden text-xs font-mono"
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
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 focus:outline-hidden text-xs"
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
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-600 focus:outline-hidden text-xs font-bold"
                >
                  <option value="EDITOR">Éditeur (Presse, Actualités & Blog)</option>
                  <option value="TEACHER">Enseignant (Agenda Officiel & Pédagogie)</option>
                  <option value="MODERATOR">Modérateur (Secrétariat & Messages Familles)</option>
                  <option value="ADMIN">Super-Administrateur (Direction Générale)</option>
                </select>

                {/* Helper text preview for the chosen role */}
                <div className="mt-2.5 p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-slate-700 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-blue-900 text-[11px]">
                    <Info className="w-3.5 h-3.5 text-blue-600" />
                    <span>Périmètre du rôle sélectionné ({ROLE_PERMISSIONS[newUserForm.role].badgeLabel}) :</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    {ROLE_PERMISSIONS[newUserForm.role].summary}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4 text-amber-400" />
                  <span>Enregistrer le Collaborateur</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
