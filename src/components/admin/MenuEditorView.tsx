import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  Plus, 
  Trash2, 
  Edit3, 
  ArrowUp, 
  ArrowDown, 
  Check, 
  X, 
  Save, 
  RotateCcw, 
  Eye, 
  EyeOff, 
  ExternalLink, 
  Sparkles, 
  Layers, 
  ChevronRight, 
  Target, 
  Users, 
  Building, 
  HeartHandshake, 
  MapPin, 
  BookOpen, 
  GraduationCap, 
  Cpu, 
  CheckCircle2, 
  FileText, 
  ShieldCheck, 
  FileCheck, 
  HelpCircle, 
  Calendar, 
  Newspaper, 
  Image, 
  Trophy, 
  Download, 
  Award, 
  Phone, 
  Mail, 
  Compass, 
  Lightbulb, 
  Laptop, 
  Globe, 
  Bookmark, 
  Star, 
  Flame, 
  Info,
  Link as LinkIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { NavigationMenuItem, NavigationSubItem, SiteSettings } from '../../types';
import { 
  DEFAULT_NAVIGATION_MENU, 
  AVAILABLE_TARGET_PAGES, 
  AVAILABLE_SUBSECTIONS, 
  AVAILABLE_ICONS 
} from '../../data/navigationData';
import { apiService } from '../../services/api';

// Icon mapping dictionary
export const ICON_COMPONENTS: Record<string, React.ElementType> = {
  Target,
  Sparkles,
  Users,
  Building,
  HeartHandshake,
  MapPin,
  BookOpen,
  GraduationCap,
  Cpu,
  CheckCircle2,
  FileText,
  ShieldCheck,
  FileCheck,
  HelpCircle,
  Calendar,
  Newspaper,
  Image,
  Trophy,
  Download,
  Award,
  Phone,
  Mail,
  Compass,
  Lightbulb,
  Laptop,
  Globe,
  Bookmark,
  Star,
  Flame,
  Info,
};

export const MenuEditorView: React.FC = () => {
  const [menus, setMenus] = useState<NavigationMenuItem[]>(DEFAULT_NAVIGATION_MENU);
  const [selectedParentId, setSelectedParentId] = useState<string>('college');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  
  // Modal for adding / editing a sub-menu
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubItem, setEditingSubItem] = useState<NavigationSubItem | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Form State
  const [formLabel, setFormLabel] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formTargetPage, setFormTargetPage] = useState('college');
  const [formSubSection, setFormSubSection] = useState('');
  const [formIconName, setFormIconName] = useState('Target');
  const [formExternalUrl, setFormExternalUrl] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);

  // Load existing menu from database settings on mount
  useEffect(() => {
    loadNavigation();
  }, []);

  const loadNavigation = async () => {
    setIsLoading(true);
    try {
      const settings = await apiService.getSettings();
      if (settings?.navigationMenu && Array.isArray(settings.navigationMenu) && settings.navigationMenu.length > 0) {
        setMenus(settings.navigationMenu);
      } else {
        setMenus(DEFAULT_NAVIGATION_MENU);
      }
    } catch {
      setMenus(DEFAULT_NAVIGATION_MENU);
    } finally {
      setIsLoading(false);
    }
  };

  // Find currently selected parent menu
  const activeParent = menus.find((m) => m.id === selectedParentId) || menus[1];
  const activeSubItems = activeParent?.children || [];

  // Open modal to add a new sub-menu
  const handleOpenAddModal = () => {
    setEditingSubItem(null);
    setEditingIndex(null);
    setFormLabel('');
    setFormDesc('');
    setFormTargetPage(selectedParentId);
    setFormSubSection('');
    setFormIconName('Sparkles');
    setFormExternalUrl('');
    setFormIsActive(true);
    setIsModalOpen(true);
  };

  // Open modal to edit existing sub-menu
  const handleOpenEditModal = (item: NavigationSubItem, index: number) => {
    setEditingSubItem(item);
    setEditingIndex(index);
    setFormLabel(item.label);
    setFormDesc(item.description || '');
    setFormTargetPage(item.id || selectedParentId);
    setFormSubSection(item.subSection || '');
    setFormIconName(item.iconName || 'Target');
    setFormExternalUrl(item.externalUrl || '');
    setFormIsActive(item.isActive !== false);
    setIsModalOpen(true);
  };

  // Move sub-item up/down
  const handleMoveSubItem = (index: number, direction: 'up' | 'down') => {
    const items = [...activeSubItems];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const [moved] = items.splice(index, 1);
    items.splice(targetIndex, 0, moved);

    // Update menus state
    const updatedMenus = menus.map((m) => 
      m.id === selectedParentId ? { ...m, children: items } : m
    );
    setMenus(updatedMenus);
  };

  // Toggle sub-item visibility
  const handleToggleSubItemVisibility = (index: number) => {
    const items = activeSubItems.map((item, idx) => 
      idx === index ? { ...item, isActive: item.isActive === false ? true : false } : item
    );
    const updatedMenus = menus.map((m) => 
      m.id === selectedParentId ? { ...m, children: items } : m
    );
    setMenus(updatedMenus);
  };

  // Delete sub-item
  const handleDeleteSubItem = (index: number) => {
    if (!window.confirm('Voulez-vous vraiment retirer ce sous-menu ?')) return;

    const items = activeSubItems.filter((_, idx) => idx !== index);
    const updatedMenus = menus.map((m) => 
      m.id === selectedParentId ? { ...m, children: items } : m
    );
    setMenus(updatedMenus);
    toast.success('Sous-menu supprimé');
  };

  // Save form modal
  const handleSaveSubItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formLabel.trim()) {
      toast.error('Le titre du sous-menu est requis');
      return;
    }

    const newItem: NavigationSubItem = {
      id: formTargetPage,
      label: formLabel.trim(),
      description: formDesc.trim() || undefined,
      subSection: formSubSection.trim() || undefined,
      iconName: formIconName,
      externalUrl: formExternalUrl.trim() || undefined,
      isActive: formIsActive,
      order: editingIndex !== null ? editingIndex + 1 : activeSubItems.length + 1,
    };

    let updatedSubItems: NavigationSubItem[];
    if (editingIndex !== null) {
      updatedSubItems = activeSubItems.map((item, idx) => 
        idx === editingIndex ? newItem : item
      );
    } else {
      updatedSubItems = [...activeSubItems, newItem];
    }

    const updatedMenus = menus.map((m) => 
      m.id === selectedParentId ? { ...m, children: updatedSubItems } : m
    );

    setMenus(updatedMenus);
    setIsModalOpen(false);
    toast.success(editingIndex !== null ? 'Sous-menu mis à jour !' : 'Nouveau sous-menu ajouté !');
  };

  // Persist all navigation changes to PostgreSQL database via API
  const handleSaveToDatabase = async () => {
    setIsSaving(true);
    try {
      const currentSettings = await apiService.getSettings();
      const updatedSettings: SiteSettings = {
        ...currentSettings,
        navigationMenu: menus,
      };

      await apiService.updateSettings(updatedSettings);

      // Trigger instant event for Header to reload without refresh
      window.dispatchEvent(new CustomEvent('cin:navigation-updated', { detail: { navigationMenu: menus } }));

      toast.success('Navigation et sous-menus enregistrés avec succès !', {
        description: 'La barre de navigation a été actualisée instantanément sur tout le site.',
      });
    } catch {
      toast.error('Erreur lors de la sauvegarde dans la base de données');
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to default
  const handleResetDefaults = async () => {
    if (!window.confirm('Voulez-vous réinitialiser tous les menus et sous-menus à leur configuration officielle d’origine ?')) {
      return;
    }

    setIsSaving(true);
    try {
      const currentSettings = await apiService.getSettings();
      const updatedSettings: SiteSettings = {
        ...currentSettings,
        navigationMenu: DEFAULT_NAVIGATION_MENU,
      };

      await apiService.updateSettings(updatedSettings);
      setMenus(DEFAULT_NAVIGATION_MENU);

      window.dispatchEvent(new CustomEvent('cin:navigation-updated', { detail: { navigationMenu: DEFAULT_NAVIGATION_MENU } }));

      toast.success('Menus réinitialisés avec succès aux valeurs officielles.');
    } catch {
      toast.error('Impossible de réinitialiser la navigation');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-slate-950 rounded-2xl p-5 sm:p-6 text-white border border-blue-900/50 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/30">
            <Menu className="w-3.5 h-3.5 text-amber-400" />
            <span>Gestion de la Navigation & Sous-Menus</span>
          </div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-white">
            Éditeur des Menus & Rubriques
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl font-light">
            Gérez directement chaque sous-menu de l'en-tête : modifier les titres, descriptions, pages cibles, ancres de section et icônes.
          </p>
        </div>

        {/* Global Save / Reset buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleResetDefaults}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
            title="Rétablir les sous-menus par défaut"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Réinitialiser</span>
          </button>

          <button
            type="button"
            onClick={handleSaveToDatabase}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            <Save className="w-4 h-4 text-slate-950" />
            <span>{isSaving ? 'Enregistrement...' : 'Enregistrer les Sous-Menus'}</span>
          </button>
        </div>
      </div>

      {/* Main Parent Menu Tabs Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
        {menus.filter(m => m.id !== 'home').map((parent) => {
          const isSelected = parent.id === selectedParentId;
          const subCount = parent.children?.length || 0;
          return (
            <button
              key={parent.id}
              onClick={() => setSelectedParentId(parent.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer ${
                isSelected
                  ? 'bg-blue-900 text-white font-bold shadow-sm'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              <span>{parent.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10.5px] font-mono font-bold ${
                isSelected ? 'bg-amber-400 text-slate-950' : 'bg-slate-200 text-slate-700'
              }`}>
                {subCount}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Category Details & Sub-Items List */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-4 shadow-2xs">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-serif font-bold text-base sm:text-lg text-slate-900">
              Rubrique : {activeParent?.label}
            </h3>
            <p className="text-xs text-slate-500">
              {activeParent?.description || 'Gestion des sous-menus pour cette section'}
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 text-blue-900 hover:bg-blue-100 text-xs font-bold border border-blue-200 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 text-blue-900" />
            <span>Ajouter un sous-menu</span>
          </button>
        </div>

        {/* Sub-Items List */}
        {activeSubItems.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
            Aucun sous-menu configuré pour cette rubrique. Cliquez sur « Ajouter un sous-menu » pour en créer un.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2.5">
            {activeSubItems.map((item, index) => {
              const IconComp = (item.iconName && ICON_COMPONENTS[item.iconName]) || Target;
              const isItemActive = item.isActive !== false;

              return (
                <div
                  key={`${item.id}-${index}`}
                  className={`p-3.5 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                    isItemActive
                      ? 'bg-slate-50/70 border-slate-200 hover:border-blue-900/40'
                      : 'bg-slate-100/50 border-dashed border-slate-300 opacity-60'
                  }`}
                >
                  
                  {/* Left: Icon, Title & Description */}
                  <div className="flex items-start sm:items-center gap-3">
                    
                    {/* Icon container */}
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
                      <IconComp className="w-5 h-5 text-blue-900" />
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-xs sm:text-sm text-slate-900">
                          {item.label}
                        </span>
                        
                        {/* Target badge */}
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-blue-50 text-blue-900 border border-blue-100 font-semibold">
                          Page: {item.id}
                        </span>

                        {item.subSection && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200 font-semibold">
                            #{item.subSection}
                          </span>
                        )}

                        {!isItemActive && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-100 text-rose-800">
                            Masqué
                          </span>
                        )}
                      </div>

                      {item.description && (
                        <p className="text-xs text-slate-500 line-clamp-1">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Actions: Reorder, Visibility, Edit, Delete */}
                  <div className="flex items-center gap-1.5 self-end md:self-auto shrink-0">
                    
                    {/* Up / Down Reorder */}
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMoveSubItem(index, 'up')}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                      title="Monter"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      disabled={index === activeSubItems.length - 1}
                      onClick={() => handleMoveSubItem(index, 'down')}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                      title="Descendre"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>

                    {/* Visibility Toggle */}
                    <button
                      type="button"
                      onClick={() => handleToggleSubItemVisibility(index)}
                      className={`p-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        isItemActive
                          ? 'text-emerald-700 hover:bg-emerald-50'
                          : 'text-slate-400 hover:bg-slate-200'
                      }`}
                      title={isItemActive ? 'Masquer ce sous-menu' : 'Afficher ce sous-menu'}
                    >
                      {isItemActive ? <Eye className="w-4 h-4 text-emerald-600" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
                    </button>

                    {/* Edit Button */}
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(item, index)}
                      className="p-1.5 rounded-lg bg-white border border-slate-200 text-blue-900 hover:bg-blue-50 transition-colors cursor-pointer"
                      title="Modifier ce sous-menu"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={() => handleDeleteSubItem(index)}
                      className="p-1.5 rounded-lg bg-white border border-slate-200 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Supprimer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* MODAL: ADD / EDIT SUB-MENU */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-blue-900" />
                <h4 className="font-bold text-sm sm:text-base text-slate-900">
                  {editingIndex !== null ? 'Modifier le sous-menu' : 'Ajouter un sous-menu'}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSubItem} className="space-y-3.5 text-xs">
              
              {/* Label */}
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Titre du sous-menu *
                </label>
                <input
                  type="text"
                  required
                  value={formLabel}
                  onChange={(e) => setFormLabel(e.target.value)}
                  placeholder="ex: Direction & Corps professoral"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold focus:border-blue-900 outline-none"
                />
              </div>

              {/* Description */}
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Sous-titre / Description courte (optionnelle)
                </label>
                <input
                  type="text"
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="ex: Dirigé par M. Orphe Jean Marie, Directeur fondateur"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-blue-900 outline-none"
                />
              </div>

              {/* Target Page */}
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Page cible (Destination) *
                </label>
                <select
                  value={formTargetPage}
                  onChange={(e) => {
                    setFormTargetPage(e.target.value);
                    setFormSubSection(''); // reset subsection if page changes
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium focus:border-blue-900 outline-none"
                >
                  {AVAILABLE_TARGET_PAGES.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sub-Section (Anchor / Tab inside target page) */}
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Section interne / Onglet <span className="font-normal text-slate-400 text-[11px]">(optionnel)</span>
                </label>
                {AVAILABLE_SUBSECTIONS[formTargetPage] ? (
                  <select
                    value={formSubSection}
                    onChange={(e) => setFormSubSection(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium focus:border-blue-900 outline-none"
                  >
                    <option value="">-- Haut de page standard --</option>
                    {AVAILABLE_SUBSECTIONS[formTargetPage].map((s) => (
                      <option key={s.id} value={s.id}>
                        #{s.id} · {s.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={formSubSection}
                    onChange={(e) => setFormSubSection(e.target.value)}
                    placeholder="ex: histoire ou mission (sans le #)"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-blue-900 outline-none"
                  />
                )}
              </div>

              {/* Icon Picker Grid */}
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Icône du sous-menu : <span className="font-mono text-blue-900">{formIconName}</span>
                </label>
                <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5 p-2 rounded-xl border border-slate-200 bg-slate-50/50 max-h-36 overflow-y-auto">
                  {AVAILABLE_ICONS.map((iconName) => {
                    const Comp = ICON_COMPONENTS[iconName] || Target;
                    const isSelected = formIconName === iconName;
                    return (
                      <button
                        key={iconName}
                        type="button"
                        onClick={() => setFormIconName(iconName)}
                        className={`p-2 rounded-lg flex flex-col items-center justify-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-900 text-white shadow-xs'
                            : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200'
                        }`}
                        title={iconName}
                      >
                        <Comp className="w-4 h-4" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Visibility Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="subItemActive"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="rounded text-blue-900 focus:ring-blue-900 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="subItemActive" className="font-semibold text-slate-800 cursor-pointer">
                  Afficher ce sous-menu dans l’en-tête (actif)
                </label>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-bold cursor-pointer"
                >
                  <Check className="w-4 h-4 text-amber-400" />
                  <span>Valider le sous-menu</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
