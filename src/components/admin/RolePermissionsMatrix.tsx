import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  Eye,
  Edit3,
  Trash2,
  Ban,
  CheckCircle2,
  Sliders,
  Filter,
  Search,
  FileCheck,
  Newspaper,
  Calendar,
  Mail,
  KeyRound,
  Settings,
  Database,
  History,
  Info,
  Sparkles,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Role } from '../../types';

export interface PermissionScope {
  read: boolean;
  write: boolean;
  delete: boolean;
  notes: string;
}

export interface FeatureModule {
  id: string;
  name: string;
  shortName: string;
  category: string;
  description: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  roles: Record<Role, PermissionScope>;
}

export const FEATURE_MODULES: FeatureModule[] = [
  {
    id: 'admissions',
    name: 'Admissions & Dossiers Élèves',
    shortName: 'Admissions',
    category: 'Pédagogie & Scolarité',
    description: 'Examen des candidatures, convocation aux entretiens, validation finale et archivage des dossiers scolaires.',
    icon: FileCheck,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-50 border-blue-200',
    roles: {
      ADMIN: { read: true, write: true, delete: true, notes: 'Accès décisionnaire total (validation, rejet, convocation)' },
      EDITOR: { read: true, write: false, delete: false, notes: 'Consultation en lecture seule des effectifs et listes' },
      TEACHER: { read: true, write: false, delete: false, notes: 'Consultation des listes d’élèves admis par classe' },
      MODERATOR: { read: true, write: false, delete: false, notes: 'Consultation des demandes de visite de campus' },
      PARENT: { read: true, write: true, delete: false, notes: 'Dépôt et suivi en ligne du dossier de son enfant' },
      STUDENT: { read: false, write: false, delete: false, notes: 'Non applicable au portail élève' },
    },
  },
  {
    id: 'news',
    name: 'Publications & Actualités (CMS)',
    shortName: 'Actualités',
    category: 'Communication & Contenu',
    description: 'Rédaction des annonces officielles, palmarès d’examens, articles de vie scolaire et photothèque du campus.',
    icon: Newspaper,
    iconColor: 'text-purple-600',
    iconBg: 'bg-purple-50 border-purple-200',
    roles: {
      ADMIN: { read: true, write: true, delete: true, notes: 'Contrôle éditorial total et validation des communiqués' },
      EDITOR: { read: true, write: true, delete: true, notes: 'Rédaction, modification et suppression des articles et photos' },
      TEACHER: { read: true, write: false, delete: false, notes: 'Consultation des annonces pédagogiques officielles' },
      MODERATOR: { read: true, write: false, delete: false, notes: 'Consultation et veille éditoriale' },
      PARENT: { read: true, write: false, delete: false, notes: 'Lecture publique des actualités du collège' },
      STUDENT: { read: true, write: false, delete: false, notes: 'Lecture publique des articles et activités' },
    },
  },
  {
    id: 'events',
    name: 'Calendrier & Agenda Scolaire',
    shortName: 'Calendrier',
    category: 'Organisation Scolaire',
    description: 'Planification des trimestres, épreuves officielles d’État (9e AF / NS4), rencontres parents et congés.',
    icon: Calendar,
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-50 border-emerald-200',
    roles: {
      ADMIN: { read: true, write: true, delete: true, notes: 'Validation et publication des dates officielles' },
      EDITOR: { read: true, write: false, delete: false, notes: 'Lecture seule du calendrier officiel' },
      TEACHER: { read: true, write: true, delete: true, notes: 'Planification des devoirs, examens et réunions parents' },
      MODERATOR: { read: true, write: false, delete: false, notes: 'Consultation pour orienter les familles à l’accueil' },
      PARENT: { read: true, write: false, delete: false, notes: 'Consultation des dates d’examens et congés' },
      STUDENT: { read: true, write: false, delete: false, notes: 'Consultation du calendrier des cours et devoirs' },
    },
  },
  {
    id: 'messages',
    name: 'Secrétariat & Messagerie',
    shortName: 'Secrétariat',
    category: 'Relations Publiques & Familles',
    description: 'Boîte de réception des demandes d’information du formulaire de contact, réponses par e-mail et WhatsApp.',
    icon: Mail,
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-50 border-amber-200',
    roles: {
      ADMIN: { read: true, write: true, delete: true, notes: 'Accès complet, archivage et suppression des messages' },
      EDITOR: { read: false, write: false, delete: false, notes: 'Accès refusé pour préserver la confidentialité' },
      TEACHER: { read: false, write: false, delete: false, notes: 'Accès confidentiel réservé au secrétariat' },
      MODERATOR: { read: true, write: true, delete: false, notes: 'Traitement des messages, statut et réponse WhatsApp/mail' },
      PARENT: { read: false, write: true, delete: false, notes: 'Envoi de messages via la page Contact publique' },
      STUDENT: { read: false, write: true, delete: false, notes: 'Envoi de messages via la page Contact publique' },
    },
  },
  {
    id: 'access_control',
    name: 'Contrôle d’Accès & RBAC',
    shortName: 'Contrôle d’Accès',
    category: 'Sécurité & Gouvernance',
    description: 'Attribution des rôles granulaires, activation/désactivation instantanée des comptes collaborateurs.',
    icon: KeyRound,
    iconColor: 'text-blue-700',
    iconBg: 'bg-blue-50 border-blue-200',
    roles: {
      ADMIN: { read: true, write: true, delete: true, notes: 'Gouvernance exclusive Super-Admin avec protection anti-révocation' },
      EDITOR: { read: false, write: false, delete: false, notes: 'Accès strictement bloqué' },
      TEACHER: { read: false, write: false, delete: false, notes: 'Accès strictement bloqué' },
      MODERATOR: { read: false, write: false, delete: false, notes: 'Accès strictement bloqué' },
      PARENT: { read: false, write: false, delete: false, notes: 'Accès strictement bloqué' },
      STUDENT: { read: false, write: false, delete: false, notes: 'Accès strictement bloqué' },
    },
  },
  {
    id: 'settings_cms',
    name: 'Paramètres Généraux du Site',
    shortName: 'Paramètres',
    category: 'Configuration Globale',
    description: 'Bandeau d’alerte d’urgence, statut de la campagne 2026-2027, coordonnées téléphoniques et Delmas 50.',
    icon: Settings,
    iconColor: 'text-slate-700',
    iconBg: 'bg-slate-100 border-slate-200',
    roles: {
      ADMIN: { read: true, write: true, delete: true, notes: 'Modification des alertes d’urgence et contacts du collège' },
      EDITOR: { read: false, write: false, delete: false, notes: 'Accès strictement bloqué' },
      TEACHER: { read: false, write: false, delete: false, notes: 'Accès strictement bloqué' },
      MODERATOR: { read: false, write: false, delete: false, notes: 'Accès strictement bloqué' },
      PARENT: { read: false, write: false, delete: false, notes: 'Accès strictement bloqué' },
      STUDENT: { read: false, write: false, delete: false, notes: 'Accès strictement bloqué' },
    },
  },
  {
    id: 'system_backup',
    name: 'Sauvegardes & Restauration Système',
    shortName: 'Sauvegardes JSON',
    category: 'Système & Données Scolaires',
    description: 'Exportation complète des données de l’établissement (JSON), sauvegardes de sécurité et restauration de la base de données.',
    icon: Database,
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-100 border-amber-300',
    roles: {
      ADMIN: { read: true, write: true, delete: true, notes: 'Gouvernance totale des sauvegardes et restauration des données' },
      EDITOR: { read: false, write: false, delete: false, notes: 'Accès strictement bloqué' },
      TEACHER: { read: false, write: false, delete: false, notes: 'Accès strictement bloqué' },
      MODERATOR: { read: false, write: false, delete: false, notes: 'Accès strictement bloqué' },
      PARENT: { read: false, write: false, delete: false, notes: 'Accès strictement bloqué' },
      STUDENT: { read: false, write: false, delete: false, notes: 'Accès strictement bloqué' },
    },
  },
  {
    id: 'audit_logs',
    name: 'Journal d’Audit & Sécurité',
    shortName: 'Audit Logs',
    category: 'Sécurité & Traçabilité',
    description: 'Historique immuable des modifications de rôles, verrouillages de compte, suppressions et synchronisations.',
    icon: History,
    iconColor: 'text-emerald-700',
    iconBg: 'bg-emerald-50 border-emerald-200',
    roles: {
      ADMIN: { read: true, write: false, delete: false, notes: 'Consultation intégrale de la traçabilité (logs immuables non modifiables)' },
      EDITOR: { read: false, write: false, delete: false, notes: 'Accès strictement bloqué' },
      TEACHER: { read: false, write: false, delete: false, notes: 'Accès strictement bloqué' },
      MODERATOR: { read: false, write: false, delete: false, notes: 'Accès strictement bloqué' },
      PARENT: { read: false, write: false, delete: false, notes: 'Accès strictement bloqué' },
      STUDENT: { read: false, write: false, delete: false, notes: 'Accès strictement bloqué' },
    },
  },
];

const ROLES_ORDER: { role: Role; label: string; badgeClass: string; level: string }[] = [
  { role: 'ADMIN', label: 'Super-Admin', badgeClass: 'bg-blue-100 text-blue-900 border-blue-200', level: 'Niveau 1 · Direction' },
  { role: 'EDITOR', label: 'Éditeur', badgeClass: 'bg-purple-100 text-purple-900 border-purple-200', level: 'Niveau 2 · Communication' },
  { role: 'TEACHER', label: 'Enseignant', badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-200', level: 'Niveau 2 · Pédagogie' },
  { role: 'MODERATOR', label: 'Modérateur', badgeClass: 'bg-amber-100 text-amber-900 border-amber-200', level: 'Niveau 2 · Secrétariat' },
  { role: 'PARENT', label: 'Parent d’Élève', badgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-200', level: 'Niveau 3 · Espace Famille' },
  { role: 'STUDENT', label: 'Élève', badgeClass: 'bg-teal-50 text-teal-800 border-teal-200', level: 'Niveau 3 · Espace Élève' },
];

export const RolePermissionsMatrix: React.FC<{
  className?: string;
  defaultExpanded?: boolean;
}> = ({ className = '', defaultExpanded = true }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<Role | 'ALL'>('ALL');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [activeCellDetail, setActiveCellDetail] = useState<{
    module: FeatureModule;
    role: Role;
    scope: PermissionScope;
  } | null>(null);

  // Extract unique categories
  const categories = useMemo(() => {
    return Array.from(new Set(FEATURE_MODULES.map((m) => m.category)));
  }, []);

  // Filter modules
  const filteredModules = useMemo(() => {
    return FEATURE_MODULES.filter((m) => {
      const matchesSearch =
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategoryFilter === 'ALL' || m.category === selectedCategoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategoryFilter]);

  // Roles to display
  const displayedRoles = useMemo(() => {
    if (selectedRoleFilter === 'ALL') return ROLES_ORDER;
    return ROLES_ORDER.filter((r) => r.role === selectedRoleFilter);
  }, [selectedRoleFilter]);

  return (
    <div className={`bg-white rounded-xl border border-slate-200/90 shadow-2xs space-y-2.5 overflow-hidden transition-all ${className}`}>
      
      {/* =====================================================================
          HEADER BAR : Modern web-adapted sans-serif typography
      ===================================================================== */}
      <div className="p-3 sm:px-4 sm:py-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-slate-50/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-900 text-white flex items-center justify-center shadow-xs shrink-0">
            <Sliders className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-sans font-bold text-slate-900 text-xs sm:text-sm tracking-tight">
                Matrice Visuelle des Droits d’Accès par Rôle & Module
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 text-[10px] font-sans font-bold tracking-tight">
                8 Modules Cartographiés
              </span>
            </div>
            <p className="font-sans text-[11px] text-slate-500 mt-0.5">
              Visualisation exhaustive des droits de <strong>Lecture (R)</strong>, <strong>Écriture (W)</strong> et <strong>Suppression (D)</strong> sur chaque fonctionnalité.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-xs font-sans font-semibold border border-slate-200 transition-colors cursor-pointer shadow-2xs"
            aria-expanded={isExpanded}
          >
            <span>{isExpanded ? 'Réduire la Matrice' : 'Déplier la Matrice'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-500" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-3 sm:px-4 sm:pb-3 space-y-3 animate-fade-in">
          
          {/* ===================================================================
              CONTROLS BAR : SEARCH, ROLE FILTER, CATEGORY FILTER & LEGEND
          =================================================================== */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 pt-1">
            
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2 flex-1">
              
              {/* Search Bar */}
              <div className="relative min-w-[180px] max-w-xs flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Filtrer un module..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-sans focus:bg-white focus:border-blue-600 focus:outline-hidden transition-colors"
                />
              </div>

              {/* Role Filter */}
              <div className="flex items-center gap-1">
                <Filter className="w-3 h-3 text-slate-400 shrink-0" />
                <select
                  value={selectedRoleFilter}
                  onChange={(e) => setSelectedRoleFilter(e.target.value as Role | 'ALL')}
                  className="px-2 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-sans text-slate-800 focus:bg-white focus:border-blue-600 focus:outline-hidden cursor-pointer"
                >
                  <option value="ALL">Tous les rôles ({ROLES_ORDER.length})</option>
                  {ROLES_ORDER.map((r) => (
                    <option key={r.role} value={r.role}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <select
                  value={selectedCategoryFilter}
                  onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                  className="px-2 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-sans text-slate-800 focus:bg-white focus:border-blue-600 focus:outline-hidden cursor-pointer"
                >
                  <option value="ALL">Toutes les catégories</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

            </div>

            {/* Visual Legend */}
            <div className="flex items-center gap-2 flex-wrap text-[11px] font-sans bg-slate-50/80 px-2.5 py-1.5 rounded-lg border border-slate-200/80 text-slate-600">
              <span className="font-semibold text-slate-900 text-[10px] uppercase tracking-wider">Légende :</span>
              <span className="inline-flex items-center gap-1 text-emerald-800 font-medium">
                <span className="w-4 h-4 rounded-sm bg-emerald-100 flex items-center justify-center text-[10px] font-bold text-emerald-800 font-mono">R</span>
                <span>Lecture</span>
              </span>
              <span className="inline-flex items-center gap-1 text-blue-800 font-medium">
                <span className="w-4 h-4 rounded-sm bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-800 font-mono">W</span>
                <span>Écriture</span>
              </span>
              <span className="inline-flex items-center gap-1 text-rose-800 font-medium">
                <span className="w-4 h-4 rounded-sm bg-rose-100 flex items-center justify-center text-[10px] font-bold text-rose-800 font-mono">D</span>
                <span>Suppression</span>
              </span>
              <span className="inline-flex items-center gap-1 text-slate-400">
                <span className="w-4 h-4 rounded-sm bg-slate-100 flex items-center justify-center text-[10px] text-slate-400 font-mono">✕</span>
                <span>Interdit</span>
              </span>
            </div>

          </div>

          {/* ===================================================================
              MATRIX GRID TABLE (Fully responsive with sticky column)
          =================================================================== */}
          <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-2xs">
            <table className="w-full text-left text-xs font-sans min-w-[760px] border-collapse">
              
              {/* Header row */}
              <thead className="bg-slate-100/90 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                <tr>
                  <th className="py-2.5 px-3 w-56 sticky left-0 bg-slate-100/95 backdrop-blur-xs z-10 border-r border-slate-200">
                    <div className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-slate-500" />
                      <span>Module / Fonctionnalité</span>
                    </div>
                  </th>

                  {displayedRoles.map((r) => (
                    <th key={r.role} className="py-2 px-2.5 text-center border-r border-slate-200 last:border-r-0">
                      <div className="space-y-0.5">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10.5px] font-bold border ${r.badgeClass}`}>
                          {r.label}
                        </span>
                        <div className="text-[9.5px] text-slate-500 font-normal font-sans">
                          {r.level}
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Body rows */}
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredModules.length === 0 ? (
                  <tr>
                    <td colSpan={displayedRoles.length + 1} className="text-center py-8 text-slate-400 font-sans text-xs">
                      Aucun module ne correspond aux critères de filtre.
                    </td>
                  </tr>
                ) : (
                  filteredModules.map((mod) => {
                    const IconComp = mod.icon;
                    return (
                      <tr key={mod.id} className="hover:bg-slate-50/70 transition-colors">
                        
                        {/* Module Name & Scope (Sticky on mobile horizontal scroll) */}
                        <td className="py-2.5 px-3 sticky left-0 bg-white hover:bg-slate-50/90 z-10 border-r border-slate-200">
                          <div className="flex items-start gap-2">
                            <div className={`w-6 h-6 rounded-md ${mod.iconBg} flex items-center justify-center shrink-0 mt-0.5`}>
                              <IconComp className={`w-3.5 h-3.5 ${mod.iconColor}`} />
                            </div>
                            <div className="min-w-0">
                              <span className="font-sans font-bold text-slate-900 text-xs block leading-tight truncate">
                                {mod.name}
                              </span>
                              <span className="font-sans text-[10px] text-slate-400 block line-clamp-1">
                                {mod.category}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Role Permission Cells */}
                        {displayedRoles.map((r) => {
                          const scope = mod.roles[r.role];
                          const hasFull = scope.read && scope.write && scope.delete;
                          const hasNone = !scope.read && !scope.write && !scope.delete;
                          const hasPartial = !hasFull && !hasNone;

                          return (
                            <td
                              key={r.role}
                              onClick={() => setActiveCellDetail({ module: mod, role: r.role, scope })}
                              className={`py-2 px-2 text-center border-r border-slate-200 last:border-r-0 cursor-pointer transition-colors ${
                                hasFull
                                  ? 'bg-emerald-50/30 hover:bg-emerald-50/70'
                                  : hasNone
                                  ? 'bg-slate-50/40 hover:bg-slate-100/60'
                                  : 'bg-blue-50/30 hover:bg-blue-50/70'
                              }`}
                              title={`Cliquer pour afficher les détails du périmètre (${mod.shortName} · ${r.label})`}
                            >
                              <div className="flex items-center justify-center gap-1">
                                
                                {/* Read badge */}
                                <span
                                  className={`w-4 h-4 rounded-sm text-[9.5px] font-bold font-mono flex items-center justify-center transition-transform hover:scale-110 ${
                                    scope.read
                                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                      : 'bg-slate-100 text-slate-300'
                                  }`}
                                  title={scope.read ? 'Lecture autorisée' : 'Lecture interdite'}
                                >
                                  R
                                </span>

                                {/* Write badge */}
                                <span
                                  className={`w-4 h-4 rounded-sm text-[9.5px] font-bold font-mono flex items-center justify-center transition-transform hover:scale-110 ${
                                    scope.write
                                      ? 'bg-blue-100 text-blue-900 border border-blue-300'
                                      : 'bg-slate-100 text-slate-300'
                                  }`}
                                  title={scope.write ? 'Écriture / Modification autorisée' : 'Écriture interdite'}
                                >
                                  W
                                </span>

                                {/* Delete badge */}
                                <span
                                  className={`w-4 h-4 rounded-sm text-[9.5px] font-bold font-mono flex items-center justify-center transition-transform hover:scale-110 ${
                                    scope.delete
                                      ? 'bg-rose-100 text-rose-900 border border-rose-300'
                                      : 'bg-slate-100 text-slate-300'
                                  }`}
                                  title={scope.delete ? 'Suppression autorisée' : 'Suppression interdite'}
                                >
                                  D
                                </span>

                              </div>

                              {/* Access status tag */}
                              <div className="mt-1">
                                {hasFull ? (
                                  <span className="text-[9.5px] font-sans font-bold text-emerald-700 bg-emerald-100/80 px-1.5 py-0.2 rounded-full">
                                    Total
                                  </span>
                                ) : hasNone ? (
                                  <span className="text-[9px] font-sans text-slate-400">
                                    Bloqué
                                  </span>
                                ) : (
                                  <span className="text-[9.5px] font-sans font-semibold text-blue-700 bg-blue-100/80 px-1.5 py-0.2 rounded-full">
                                    {scope.read && !scope.write ? 'Lecture' : 'Délégué'}
                                  </span>
                                )}
                              </div>
                            </td>
                          );
                        })}

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* ===================================================================
              INTERACTIVE MODAL / DRAWER FOR SELECTED CELL SCOPE
          =================================================================== */}
          {activeCellDetail && (
            <div className="p-3 rounded-lg bg-blue-50/60 border border-blue-200/90 text-xs font-sans space-y-2 animate-fade-in">
              <div className="flex items-center justify-between border-b border-blue-200/80 pb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-blue-900 text-white flex items-center justify-center font-bold text-[10px]">
                    i
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 text-xs">
                      Périmètre Détaillé : {activeCellDetail.module.name}
                    </span>
                    <span className="text-slate-500 text-[11px] ml-1.5">
                      pour le rôle <strong>{activeCellDetail.role}</strong>
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveCellDetail(null)}
                  className="px-2 py-0.5 rounded-md text-[10px] font-semibold text-blue-900 bg-blue-100 hover:bg-blue-200 transition-colors cursor-pointer"
                >
                  Fermer
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="p-2 rounded-md bg-white border border-slate-200 flex items-center gap-2">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    activeCellDetail.scope.read ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {activeCellDetail.scope.read ? '✓' : '✕'}
                  </span>
                  <div>
                    <span className="font-bold text-slate-900 block text-[11px]">Droit de Lecture (R)</span>
                    <span className="text-[10px] text-slate-500">
                      {activeCellDetail.scope.read ? 'Consultation autorisée' : 'Accès interdit'}
                    </span>
                  </div>
                </div>

                <div className="p-2 rounded-md bg-white border border-slate-200 flex items-center gap-2">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    activeCellDetail.scope.write ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {activeCellDetail.scope.write ? '✓' : '✕'}
                  </span>
                  <div>
                    <span className="font-bold text-slate-900 block text-[11px]">Droit d’Écriture (W)</span>
                    <span className="text-[10px] text-slate-500">
                      {activeCellDetail.scope.write ? 'Création & modification' : 'Modification refusée'}
                    </span>
                  </div>
                </div>

                <div className="p-2 rounded-md bg-white border border-slate-200 flex items-center gap-2">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    activeCellDetail.scope.delete ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {activeCellDetail.scope.delete ? '✓' : '✕'}
                  </span>
                  <div>
                    <span className="font-bold text-slate-900 block text-[11px]">Droit de Suppression (D)</span>
                    <span className="text-[10px] text-slate-500">
                      {activeCellDetail.scope.delete ? 'Suppression définitive permise' : 'Suppression interdite'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-2 rounded-md bg-white border border-slate-200 text-[11px] text-slate-700">
                <strong className="text-slate-900">Note de gouvernance :</strong> {activeCellDetail.scope.notes}
              </div>
            </div>
          )}

          {/* Quick stats footer */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-slate-100 text-center font-sans text-xs">
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] text-slate-500 block">Super-Admin</span>
              <span className="font-bold text-blue-900 text-xs">100% Droits (8/8)</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] text-slate-500 block">Éditeur CMS</span>
              <span className="font-bold text-purple-900 text-xs">News R/W/D · Admissions R</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] text-slate-500 block">Enseignant</span>
              <span className="font-bold text-emerald-900 text-xs">Agenda R/W/D · Listes R</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] text-slate-500 block">Modérateur</span>
              <span className="font-bold text-amber-900 text-xs">Messages R/W · Accueil R</span>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
