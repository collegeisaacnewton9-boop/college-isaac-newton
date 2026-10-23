import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Eye, 
  EyeOff, 
  ArrowUp, 
  ArrowDown, 
  Upload, 
  Check, 
  AlertTriangle, 
  X, 
  Image as ImageIcon, 
  GraduationCap, 
  BookOpen, 
  Briefcase, 
  Sparkles, 
  CheckCircle2, 
  RefreshCw,
  SlidersHorizontal,
  Mail,
  Phone,
  HelpCircle,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { FacultyMember, FacultyCategory, User } from '../../types';
import { apiService } from '../../services/api';
import { compressImage } from '../../utils/imageCompressor';
import { MediaPickerModal } from '../common/MediaPickerModal';
import { toast } from 'sonner';

interface FacultyManagerViewProps {
  currentUser: User | null;
}

export const FacultyManagerView: React.FC<FacultyManagerViewProps> = ({ currentUser }) => {
  const [members, setMembers] = useState<FacultyMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | FacultyCategory>('ALL');
  const [visibilityFilter, setVisibilityFilter] = useState<'ALL' | 'VISIBLE' | 'HIDDEN'>('ALL');

  // Modal d'ajout / modification
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<FacultyMember | null>(null);

  // Modal de confirmation de suppression
  const [memberToDelete, setMemberToDelete] = useState<FacultyMember | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Media Picker Modal
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState<{
    id?: string;
    name: string;
    rolesInput: string;
    subjectsInput: string;
    categories: FacultyCategory[];
    photoUrl: string;
    displayOrder: number;
    isVisible: boolean;
    biography: string;
    email: string;
    phone: string;
  }>({
    name: '',
    rolesInput: '',
    subjectsInput: '',
    categories: ['enseignant'],
    photoUrl: '',
    displayOrder: 1,
    isVisible: true,
    biography: '',
    email: '',
    phone: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadMembers = async () => {
    setIsLoading(true);
    try {
      const data = await apiService.getFacultyMembers(true);
      setMembers(data);
    } catch (e: any) {
      toast.error('Erreur lors du chargement des membres : ' + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
    const handleUpdated = () => loadMembers();
    window.addEventListener('cin:faculty-updated', handleUpdated);
    return () => window.removeEventListener('cin:faculty-updated', handleUpdated);
  }, []);

  // Filtrage
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      if (categoryFilter !== 'ALL' && !m.categories?.includes(categoryFilter)) {
        return false;
      }
      if (visibilityFilter === 'VISIBLE' && m.isVisible === false) {
        return false;
      }
      if (visibilityFilter === 'HIDDEN' && m.isVisible !== false) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inName = m.name?.toLowerCase().includes(q);
        const inRoles = m.roles?.some((r) => r.toLowerCase().includes(q));
        const inSubjects = m.subjects?.some((s) => s.toLowerCase().includes(q));
        if (!inName && !inRoles && !inSubjects) return false;
      }
      return true;
    });
  }, [members, categoryFilter, visibilityFilter, searchQuery]);

  // Ouverture du formulaire pour créer un membre
  const handleOpenCreate = () => {
    setEditingMember(null);
    setFormData({
      name: '',
      rolesInput: '',
      subjectsInput: '',
      categories: ['enseignant'],
      photoUrl: '',
      displayOrder: members.length + 1,
      isVisible: true,
      biography: '',
      email: '',
      phone: '',
    });
    setFormErrors({});
    setIsEditModalOpen(true);
  };

  // Ouverture du formulaire pour éditer
  const handleOpenEdit = (m: FacultyMember) => {
    setEditingMember(m);
    setFormData({
      id: m.id,
      name: m.name,
      rolesInput: m.roles?.join(', ') || '',
      subjectsInput: m.subjects?.join(', ') || '',
      categories: m.categories || ['enseignant'],
      photoUrl: m.photoUrl || '',
      displayOrder: m.displayOrder ?? 1,
      isVisible: m.isVisible !== false,
      biography: m.biography || '',
      email: m.email || '',
      phone: m.phone || '',
    });
    setFormErrors({});
    setIsEditModalOpen(true);
  };

  // Bascule rapide de visibilité
  const handleToggleVisibility = async (m: FacultyMember) => {
    const nextVal = !m.isVisible;
    try {
      await apiService.updateFacultyVisibility(m.id, nextVal);
      setMembers((prev) =>
        prev.map((item) => (item.id === m.id ? { ...item, isVisible: nextVal } : item))
      );
      toast.success(
        nextVal
          ? `Le profil de ${m.name} est maintenant visible sur le site public.`
          : `Le profil de ${m.name} a été masqué du site public.`
      );
    } catch {
      toast.error('Impossible de modifier le statut de visibilité.');
    }
  };

  // Déplacement dans l'ordre (Up / Down)
  const handleMoveOrder = async (m: FacultyMember, direction: 'up' | 'down') => {
    const sorted = [...members].sort((a, b) => (a.displayOrder ?? 1) - (b.displayOrder ?? 1));
    const currentIndex = sorted.findIndex((item) => item.id === m.id);
    if (currentIndex === -1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= sorted.length) return;

    const currentItem = sorted[currentIndex];
    const targetItem = sorted[targetIndex];

    const currentOrder = currentItem.displayOrder ?? 1;
    const targetOrder = targetItem.displayOrder ?? 2;

    const newCurrentOrder = currentOrder === targetOrder ? (direction === 'up' ? targetOrder - 1 : targetOrder + 1) : targetOrder;
    const newTargetOrder = currentOrder;

    try {
      await Promise.all([
        apiService.saveFacultyMember({ ...currentItem, displayOrder: newCurrentOrder }),
        apiService.saveFacultyMember({ ...targetItem, displayOrder: newTargetOrder }),
      ]);
      loadMembers();
      toast.success(`Ordre d'affichage mis à jour pour ${currentItem.name}.`);
    } catch {
      toast.error("Erreur lors de la mise à jour de l'ordre d'affichage.");
    }
  };

  // Suppression
  const handleConfirmDelete = async () => {
    if (!memberToDelete) return;
    setIsDeleting(true);
    try {
      await apiService.deleteFacultyMember(memberToDelete.id);
      setMembers((prev) => prev.filter((m) => m.id !== memberToDelete.id));
      toast.success(`Le profil de ${memberToDelete.name} a été supprimé.`);
      setMemberToDelete(null);
    } catch (e: any) {
      toast.error('Erreur lors de la suppression : ' + e.message);
    } finally {
      setIsDeleting(false);
    }
  };

  // Téléversement d'image avec compression
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation du type MIME
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type)) {
      toast.error('Format de fichier non supporté. Veuillez choisir une image JPEG, PNG ou WebP.');
      return;
    }

    try {
      toast.info('Optimisation et compression de la photo en cours...');
      const compressed = await compressImage(file, {
        maxWidth: 800,
        maxHeight: 800,
        quality: 0.82,
        mimeType: 'image/webp',
        targetMaxSizeBytes: 400 * 1024, // 400 Ko max
      });

      setFormData((prev) => ({ ...prev, photoUrl: compressed.dataUrl }));
      toast.success(`Photo prête (${Math.round(compressed.file.size / 1024)} Ko optimisée).`);
    } catch (err: any) {
      toast.error('Échec de la compression de la photo : ' + err.message);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Validation et enregistrement
  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'Le nom affiché est obligatoire.';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Le nom doit comporter au moins 2 caractères.';
    }

    if (!formData.categories || formData.categories.length === 0) {
      errors.categories = 'Sélectionnez au moins une catégorie d’affectation.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error('Veuillez corriger les erreurs signalées dans le formulaire.');
      return;
    }

    // Traitement des rôles et des matières
    const roles = formData.rolesInput
      .split(',')
      .map((r) => r.trim())
      .filter(Boolean);

    const subjects = formData.subjectsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    setIsSaving(true);
    try {
      const payload: Partial<FacultyMember> = {
        id: formData.id,
        name: formData.name.trim(),
        roles,
        subjects,
        categories: formData.categories,
        photoUrl: formData.photoUrl || '',
        displayOrder: Number(formData.displayOrder) || 1,
        isVisible: formData.isVisible,
        biography: formData.biography.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
      };

      await apiService.saveFacultyMember(payload);
      toast.success(
        editingMember
          ? `Le profil de ${payload.name} a été mis à jour avec succès.`
          : `Le profil de ${payload.name} a été créé avec succès.`
      );
      setIsEditModalOpen(false);
      loadMembers();
    } catch (err: any) {
      toast.error('Erreur lors de l’enregistrement : ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = (name: string): string => {
    if (!name) return 'CIN';
    const clean = name.replace(/^(Mde|M\.|Dr\.)\s+/i, '');
    const parts = clean.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className="space-y-6">
      
      {/* 1. EN-TÊTE DU MODULE */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-slate-900">
              Direction & Corps professoral
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 text-xs font-bold">
              {members.length} profil{members.length > 1 ? 's' : ''}
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
            Modifiez en temps réel les noms, rôles, matières enseignées, photos et ordre d’affichage sans aucune modification de code. Les données sont automatiquement sauvegardées de manière persistante.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={loadMembers}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
            title="Rafraîchir la liste"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          
          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-4 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-semibold text-xs transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter un membre</span>
          </button>
        </div>
      </div>

      {/* 2. RECHERCHE & FILTRES */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Recherche */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par nom, matière, fonction..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-900/20"
          />
        </div>

        {/* Filtres de catégorie */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 cursor-pointer"
          >
            <option value="ALL">Toutes les catégories</option>
            <option value="direction">Direction & Conseil</option>
            <option value="administration">Administration</option>
            <option value="enseignant">Enseignants</option>
            <option value="conseil_pedagogique">Conseil pédagogique</option>
          </select>

          <select
            value={visibilityFilter}
            onChange={(e) => setVisibilityFilter(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 cursor-pointer"
          >
            <option value="ALL">Tous les statuts</option>
            <option value="VISIBLE">Visibles uniquement</option>
            <option value="HIDDEN">Masqués uniquement</option>
          </select>
        </div>
      </div>

      {/* 3. TABLEAU DES MEMBRES */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center space-y-2">
            <div className="inline-block w-8 h-8 border-3 border-blue-900 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-500">Chargement de l’équipe...</p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Users className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">Aucun membre ne correspond aux critères.</p>
            <p className="text-xs text-slate-500">Modifiez vos filtres ou ajoutez un nouveau profil.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4 w-16 text-center">Ordre</th>
                  <th className="py-3 px-4">Membre & Photo</th>
                  <th className="py-3 px-4">Affectations & Rôles</th>
                  <th className="py-3 px-4">Matières</th>
                  <th className="py-3 px-4 text-center">Statut</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMembers.map((m, idx) => (
                  <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                    
                    {/* Colonne Ordre d'affichage */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <span className="font-mono font-bold text-slate-700 w-6">
                          {m.displayOrder ?? idx + 1}
                        </span>
                        <div className="flex flex-col">
                          <button
                            type="button"
                            onClick={() => handleMoveOrder(m, 'up')}
                            className="p-0.5 text-slate-400 hover:text-blue-900 cursor-pointer"
                            title="Monter"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveOrder(m, 'down')}
                            className="p-0.5 text-slate-400 hover:text-blue-900 cursor-pointer"
                            title="Descendre"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </td>

                    {/* Colonne Photo et Nom */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {m.photoUrl ? (
                          <img
                            src={m.photoUrl}
                            alt={m.name}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-blue-900 text-white flex items-center justify-center font-serif font-bold text-xs shrink-0">
                            {getInitials(m.name)}
                          </div>
                        )}
                        <div>
                          <p className="font-serif font-bold text-slate-900 text-sm">
                            {m.name}
                          </p>
                          {m.biography && (
                            <p className="text-[11px] text-slate-500 line-clamp-1 max-w-xs">
                              {m.biography}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Colonne Rôles et Catégories */}
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-1">
                          {m.categories?.map((cat) => (
                            <span
                              key={cat}
                              className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                                cat === 'direction'
                                  ? 'bg-blue-100 text-blue-900'
                                  : cat === 'administration'
                                  ? 'bg-purple-100 text-purple-900'
                                  : cat === 'conseil_pedagogique'
                                  ? 'bg-amber-100 text-amber-900'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {cat === 'direction'
                                ? 'Direction'
                                : cat === 'administration'
                                ? 'Administration'
                                : cat === 'conseil_pedagogique'
                                ? 'Conseil pédagogique'
                                : 'Enseignant'}
                            </span>
                          ))}
                        </div>
                        {m.roles && m.roles.length > 0 && (
                          <p className="text-xs text-slate-800 font-medium">
                            {m.roles.join(' · ')}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Colonne Matières */}
                    <td className="py-3 px-4">
                      {m.subjects && m.subjects.length > 0 ? (
                        <div className="flex flex-wrap items-center gap-1">
                          {m.subjects.map((sub, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[11px] font-medium border border-emerald-200/60"
                            >
                              {sub}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">—</span>
                      )}
                    </td>

                    {/* Colonne Statut */}
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleVisibility(m)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors cursor-pointer ${
                          m.isVisible !== false
                            ? 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                        title={m.isVisible !== false ? 'Cliquez pour masquer' : 'Cliquez pour afficher'}
                      >
                        {m.isVisible !== false ? (
                          <>
                            <Eye className="w-3 h-3 text-emerald-700" />
                            <span>Visible</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3 text-slate-500" />
                            <span>Masqué</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Colonne Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(m)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-blue-900 hover:bg-blue-50 transition-colors cursor-pointer"
                          title="Modifier"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setMemberToDelete(m)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. MODAL AJOUT / MODIFICATION AVEC PRÉVISUALISATION DIRECTE */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-6 animate-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-serif text-xl font-bold text-slate-900">
                  {editingMember ? 'Modifier le profil' : 'Ajouter un membre'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Direction & Corps professoral · Collège Isaac Newton
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-5">
              
              {/* Nom affiché */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Nom affiché <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Salomon Jhonny Frantz, Augustmat Onés..."
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 ${
                    formErrors.name
                      ? 'border-red-400 focus:ring-red-200'
                      : 'border-slate-200 focus:ring-blue-900/20'
                  }`}
                />
                {formErrors.name && (
                  <p className="text-[11px] text-red-600 font-semibold">{formErrors.name}</p>
                )}
              </div>

              {/* Catégories d'affectation multiples */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Catégories d'affectation <span className="text-red-600">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {[
                    { id: 'direction', label: 'Direction' },
                    { id: 'administration', label: 'Administration' },
                    { id: 'conseil_pedagogique', label: 'Conseil Péd.' },
                    { id: 'enseignant', label: 'Enseignant' },
                  ].map((cat) => {
                    const checked = formData.categories.includes(cat.id as FacultyCategory);
                    return (
                      <label
                        key={cat.id}
                        className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-colors text-xs select-none ${
                          checked
                            ? 'bg-blue-50/80 border-blue-900 text-blue-900 font-bold'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            const val = cat.id as FacultyCategory;
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                categories: [...formData.categories, val],
                              });
                            } else {
                              setFormData({
                                ...formData,
                                categories: formData.categories.filter((c) => c !== val),
                              });
                            }
                          }}
                          className="rounded text-blue-900 focus:ring-0"
                        />
                        <span>{cat.label}</span>
                      </label>
                    );
                  })}
                </div>
                {formErrors.categories && (
                  <p className="text-[11px] text-red-600 font-semibold">{formErrors.categories}</p>
                )}
                <p className="text-[11px] text-slate-500">
                  Astuce : Vous pouvez cocher à la fois « Direction » et « Enseignant » pour représenter une personne ayant deux responsabilités sans dupliquer son profil.
                </p>
              </div>

              {/* Fonctions / Responsabilités */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Fonctions / Titres officiels (séparés par une virgule)
                </label>
                <input
                  type="text"
                  value={formData.rolesInput}
                  onChange={(e) => setFormData({ ...formData, rolesInput: e.target.value })}
                  placeholder="Ex: Responsable de discipline et des Études, Conseil pédagogique..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-900/20"
                />
              </div>

              {/* Matières enseignées */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Matière(s) enseignée(s) (séparées par une virgule si plusieurs)
                </label>
                <input
                  type="text"
                  value={formData.subjectsInput}
                  onChange={(e) => setFormData({ ...formData, subjectsInput: e.target.value })}
                  placeholder="Ex: Mathématiques, Économie, Sciences expérimentales, Français..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-900/20"
                />
              </div>

              {/* Gestion de la Photo */}
              <div className="space-y-2 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <label className="block text-xs font-bold text-slate-700">
                  Photo officielle
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Aperçu photo ou avatar */}
                  <div className="shrink-0">
                    {formData.photoUrl ? (
                      <img
                        src={formData.photoUrl}
                        alt="Aperçu"
                        className="w-16 h-16 rounded-2xl object-cover border border-slate-300 shadow-sm"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-blue-900 text-white flex items-center justify-center font-serif font-bold text-base shadow-sm">
                        {getInitials(formData.name)}
                      </div>
                    )}
                  </div>

                  {/* Actions photo */}
                  <div className="space-y-2 flex-1 w-full text-center sm:text-left">
                    <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <Upload className="w-3.5 h-3.5 text-blue-900" />
                        <span>Téléverser</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsMediaPickerOpen(true)}
                        className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-amber-600" />
                        <span>Médiathèque</span>
                      </button>

                      {formData.photoUrl && (
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, photoUrl: '' })}
                          className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Retirer</span>
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Formats autorisés : JPEG, WebP, PNG (compression automatique). Sans photo, les initiales officielles seront affichées élégamment.
                    </p>
                  </div>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageFileChange}
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                />
              </div>

              {/* Ordre et Visibilité */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Ordre d'affichage
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value, 10) || 1 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-900/20"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Statut de visibilité
                  </label>
                  <label className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between cursor-pointer">
                    <span className="text-xs font-medium text-slate-700">
                      {formData.isVisible ? 'Visible sur la page publique' : 'Masqué (Brouillon)'}
                    </span>
                    <input
                      type="checkbox"
                      checked={formData.isVisible}
                      onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
                      className="rounded text-blue-900 focus:ring-0"
                    />
                  </label>
                </div>
              </div>

              {/* Biographie / Notes */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Notice biographique / Rôle pédagogique (facultatif)
                </label>
                <textarea
                  rows={2}
                  value={formData.biography}
                  onChange={(e) => setFormData({ ...formData, biography: e.target.value })}
                  placeholder="Courte description de l'engagement auprès des élèves..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-900/20"
                />
              </div>

              {/* Coordonnées facultatives */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    E-mail institutionnel (facultatif)
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="prenom.nom@collegeisaacnewton.com"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Téléphone (facultatif)
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+509 XXXX-XXXX"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>
              </div>

              {/* PRÉVISUALISATION EN DIRECT DE LA CARTE */}
              <div className="pt-2 border-t border-slate-200 space-y-2">
                <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
                  Prévisualisation en direct
                </span>
                <div className="p-4 rounded-2xl bg-stone-50 border border-slate-200">
                  <div className="flex items-start gap-3">
                    <div className="shrink-0">
                      {formData.photoUrl ? (
                        <img
                          src={formData.photoUrl}
                          alt="Prévisualisation"
                          className="w-14 h-14 rounded-xl object-cover border border-slate-200"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-blue-900 text-white flex items-center justify-center font-serif font-bold text-sm">
                          {getInitials(formData.name)}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="font-serif font-bold text-slate-900 text-base">
                        {formData.name || 'Nom du membre'}
                      </p>
                      {formData.rolesInput && (
                        <p className="text-xs font-semibold text-blue-900">
                          {formData.rolesInput}
                        </p>
                      )}
                      {formData.subjectsInput && (
                        <p className="text-xs text-emerald-800 font-medium">
                          Matières : {formData.subjectsInput}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold transition-colors shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSaving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingMember ? 'Enregistrer les modifications' : 'Créer le profil'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* 5. MODAL DE CONFIRMATION DE SUPPRESSION */}
      {memberToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="font-serif text-lg font-bold text-slate-900">
                Confirmer la suppression
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Êtes-vous sûr de vouloir supprimer définitivement le profil de <strong className="text-slate-900">{memberToDelete.name}</strong> ? Cette action est irréversible.
              </p>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMemberToDelete(null)}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isDeleting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Supprimer</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. MEDIA PICKER MODAL INTÉGRÉ */}
      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelectImage={(url) => {
          setFormData((prev) => ({ ...prev, photoUrl: url }));
          setIsMediaPickerOpen(false);
          toast.success('Photo sélectionnée depuis la médiathèque.');
        }}
        currentSelectedUrl={formData.photoUrl}
        title="Médiathèque — Photo pour Direction & Corps professoral"
        description="Sélectionnez une photo officielle d’un membre du personnel déjà présente dans la médiathèque."
      />

    </div>
  );
};
