import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  Menu, 
  X, 
  UserCircle, 
  FileCheck, 
  GraduationCap,
  Phone,
  Mail,
  MapPin,
  ArrowRight,
  BookOpen,
  Cpu,
  Sparkles,
  Target,
  Users,
  Building,
  CheckCircle2,
  FileText,
  ShieldCheck,
  HelpCircle,
  Calendar,
  Newspaper,
  Image,
  Trophy,
  Download,
  Award
} from 'lucide-react';
import { SchoolLogo } from '../ui/SchoolLogo';
import { User } from '../../types';
import { SCHOOL_INFO } from '../../data/mockData';

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string, subSection?: string) => void;
  currentUser: User | null;
  onOpenAuth: () => void;
  onSelectArticle?: (articleId: string) => void;
}

interface SubNavItem {
  id: string;
  label: string;
  subSection?: string;
  icon?: React.ElementType;
  description?: string;
}

interface NavItem {
  id: string;
  label: string;
  hideOnDesktop?: boolean; // When true, only appears in mobile/tablet drawer (desktop uses the logo for Accueil)
  description?: string;
  children?: SubNavItem[];
}

// 4 Main Pillars + Contact: Clean, uncluttered, responsive hierarchy with rich ergonomics
const NAV_ITEMS: NavItem[] = [
  { 
    id: 'home', 
    label: 'Accueil', 
    hideOnDesktop: true 
  },
  {
    id: 'college',
    label: 'Le Collège',
    description: 'Histoire, mission, corps enseignant et installations',
    children: [
      { id: 'college', label: 'Notre histoire & Fondation', subSection: 'histoire', icon: Target, description: 'L’héritage scientifique et les valeurs fondatrices' },
      { id: 'college', label: 'Mission & Vision pédagogique', subSection: 'mission', icon: Sparkles, description: 'Exigence académique et formation citoyenne' },
      { id: 'college', label: 'Direction & Corps professoral', subSection: 'equipe', icon: Users, description: 'Dirigé par M. Orphe Jean Marie, Directeur fondateur' },
      { id: 'college', label: 'Infrastructures & Campus', subSection: 'infrastructures', icon: Building, description: 'Bâtiments modernes et cour sécurisée à Delmas 50' },
      { id: 'contact', label: 'Localisation & Secrétariat', icon: MapPin, description: 'Delmas 50, rue Dominique #2 bis · Port-au-Prince' },
    ],
  },
  {
    id: 'programs',
    label: 'Programmes',
    description: 'Du préscolaire au baccalauréat d’État et pôle multimédia',
    children: [
      { id: 'programs', label: 'Cycle Préscolaire (TPS - GS)', subSection: 'prescolaire', icon: Sparkles, description: 'Éveil, motricité et premiers apprentissages' },
      { id: 'programs', label: 'Cycle Fondamental (1ère - 9ème AF)', subSection: 'fondamental', icon: BookOpen, description: 'Bases solides, rigueur et préparation aux examens officiels' },
      { id: 'programs', label: 'Nouveau Secondaire (NS1 - NS4)', subSection: 'secondaire', icon: GraduationCap, description: 'Séries scientifiques et littéraires vers l’université' },
      { id: 'programs', label: 'Pôle Numérique & Informatique', subSection: 'numerique', icon: Cpu, description: 'Laboratoire équipé, programmation et bureautique' },
    ],
  },
  {
    id: 'admissions',
    label: 'Admissions',
    description: 'Modalités d’inscription, pièces requises et tarifs',
    children: [
      { id: 'admissions', label: 'Pourquoi choisir notre école', subSection: 'pourquoi', icon: CheckCircle2, description: 'L’encadrement d’excellence et nos réussites' },
      { id: 'admissions', label: 'Conditions & Pièces à fournir', subSection: 'conditions', icon: FileText, description: 'Dossier scolaire et certificat de naissance' },
      { id: 'admissions', label: 'Procédure & Frais de scolarité', subSection: 'procedure', icon: ShieldCheck, description: 'Échéancier transparent et modalités de paiement' },
      { id: 'pre-registration', label: 'Formulaire de préinscription', icon: FileCheck, description: 'Candidature en ligne rapide pour 2026-2027' },
      { id: 'admissions', label: 'Questions fréquentes (FAQ)', subSection: 'faq', icon: HelpCircle, description: 'Toutes les réponses à vos interrogations' },
    ],
  },
  {
    id: 'school-life',
    label: 'Vie Scolaire',
    description: 'Agenda, vie étudiante, actualités et documents',
    children: [
      { id: 'events', label: 'Calendrier scolaire & Agenda', icon: Calendar, description: 'Examens, jours fériés et réunions parents-profs' },
      { id: 'news', label: 'Actualités & Vie de l’école', icon: Newspaper, description: 'Événements, projets et réalisations des élèves' },
      { id: 'gallery', label: 'Galerie photos du campus', icon: Image, description: 'Instantanés des cours, cérémonies et tournois' },
      { id: 'school-life', label: 'Clubs & Activités périscolaires', subSection: 'activites', icon: Trophy, description: 'Génie scolaire, basket, échecs et robotique' },
      { id: 'resources', label: 'Documents officiels à télécharger', subSection: 'documents', icon: Download, description: 'Règlements, listes de manuels et fiches' },
      { id: 'resources', label: 'Résultats d’examens & Palmarès', subSection: 'resultats', icon: Award, description: 'Performances aux examens de 9e AF et du Bac' },
    ],
  },
  { id: 'contact', label: 'Contact' },
];

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  onNavigate,
  currentUser,
  onOpenAuth,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [expandedMobileItem, setExpandedMobileItem] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  
  // Timer ref to provide a comfortable grace period (hover bridge)
  // preventing sudden close when cursor moves diagonally
  const leaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Scroll detection for sticky header shadow
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Body scroll lock when mobile/tablet drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [mobileMenuOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        setActiveDropdown(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close desktop dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Navigation click dispatcher
  const handleNavClick = (pageId: string, subSection?: string) => {
    if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
    setActiveDropdown(null);
    setMobileMenuOpen(false);
    onNavigate(pageId, subSection);
  };

  // Safe hover handlers with 250ms intent grace period
  const handleDropdownMouseEnter = (itemId: string) => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
    setActiveDropdown(itemId);
  };

  const handleDropdownMouseLeave = () => {
    if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
    // 250ms buffer: cursor can safely move diagonally without the menu snapping closed
    leaveTimerRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 250);
  };

  // Click toggle: User can also click on the menu header to pin it open
  const handleDropdownToggle = (itemId: string) => {
    if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
    setActiveDropdown((prev) => (prev === itemId ? null : itemId));
  };

  return (
    <>
      <header 
        ref={navRef}
        className={`sticky top-0 z-40 bg-white/95 backdrop-blur-md transition-all duration-200 border-b ${
          isScrolled ? 'border-slate-200/90 shadow-sm py-2' : 'border-slate-100 py-2.5 sm:py-3'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3 sm:gap-4">
            
            {/* Brand Logo - Official clickable link to Home */}
            <button 
              onClick={() => handleNavClick('home')}
              className="text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-900 rounded-lg p-0.5 cursor-pointer shrink-0"
              aria-label="Collège Isaac Newton - Retour à l'accueil"
            >
              <SchoolLogo />
            </button>

            {/* Desktop Navigation Links (>= 1024px) - Clean, Spacious & Uncluttered */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-sm font-medium text-slate-700">
              {NAV_ITEMS.filter((item) => !item.hideOnDesktop).map((item) => {
                const hasChildren = item.children && item.children.length > 0;
                const isActive = currentPage === item.id || 
                  (item.id === 'school-life' && ['school-life', 'events', 'gallery', 'news', 'resources'].includes(currentPage));
                const isDropdownOpen = activeDropdown === item.id;

                if (!hasChildren) {
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                        isActive 
                          ? 'text-blue-900 font-bold bg-blue-50/80 shadow-2xs' 
                          : 'hover:text-blue-900 hover:bg-slate-100/70 text-slate-700'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                }

                return (
                  <div 
                    key={item.id} 
                    className="relative"
                    onMouseEnter={() => handleDropdownMouseEnter(item.id)}
                    onMouseLeave={handleDropdownMouseLeave}
                  >
                    {/* Main Category Trigger Button - Clickable or Hoverable */}
                    <button
                      type="button"
                      onClick={() => handleDropdownToggle(item.id)}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer select-none ${
                        isActive || isDropdownOpen
                          ? 'text-blue-900 font-bold bg-blue-50/90 shadow-2xs' 
                          : 'hover:text-blue-900 hover:bg-slate-100/70 text-slate-700'
                      }`}
                      aria-expanded={isDropdownOpen}
                      aria-haspopup="true"
                    >
                      <span>{item.label}</span>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        isDropdownOpen ? 'rotate-180 text-blue-900' : 'text-slate-400'
                      }`} />
                    </button>

                    {/* 
                      DROPDOWN WRAPPER WITH INVISIBLE HOVER BRIDGE:
                      Starts immediately at top-full (0 gap) with a transparent pseudo-bridge
                      so the mouse NEVER exits the bounding box when traveling from button to menu items.
                    */}
                    {isDropdownOpen && (
                      <div 
                        className="absolute top-full left-0 pt-1.5 z-50 min-w-[290px] w-72 sm:w-80"
                        onMouseEnter={() => handleDropdownMouseEnter(item.id)}
                        onMouseLeave={handleDropdownMouseLeave}
                      >
                        {/* Invisible safety bridge layer (eliminates any micro-gap) */}
                        <div className="absolute -top-3 left-0 right-0 h-4 bg-transparent pointer-events-auto" />

                        <div 
                          className="bg-white rounded-2xl shadow-xl border border-slate-200/90 p-2 overflow-hidden ring-1 ring-slate-900/5 animate-in fade-in slide-in-from-top-1 duration-150"
                          role="menu"
                        >
                          {/* Section Header / Overview Quick Link */}
                          <div className="px-3 py-2 mb-1 border-b border-slate-100 flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Rubrique {item.label}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleNavClick(item.id)}
                              className="text-[11px] font-semibold text-blue-900 hover:text-blue-950 inline-flex items-center gap-1 cursor-pointer"
                            >
                              <span>Aperçu</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Subitems List with comfortable click areas & icons */}
                          <div className="space-y-0.5">
                            {item.children?.map((subItem, idx) => {
                              const Icon = subItem.icon || ArrowRight;
                              return (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => handleNavClick(subItem.id, subItem.subSection)}
                                  className="w-full text-left p-2 sm:p-2.5 rounded-xl text-slate-700 hover:text-blue-900 hover:bg-blue-50/80 transition-all flex items-start gap-3 cursor-pointer group"
                                  role="menuitem"
                                >
                                  <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-white text-slate-500 group-hover:text-blue-900 flex items-center justify-center shrink-0 border border-slate-200/60 group-hover:border-blue-200 transition-colors mt-0.5">
                                    <Icon className="w-4 h-4" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <span className="text-xs sm:text-sm font-semibold block leading-tight text-slate-900 group-hover:text-blue-900">
                                      {subItem.label}
                                    </span>
                                    {subItem.description && (
                                      <span className="text-[11px] text-slate-500 line-clamp-1 block leading-normal font-light mt-0.5">
                                        {subItem.description}
                                      </span>
                                    )}
                                  </div>
                                </button>
                              );
                            })}
                          </div>

                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>

            {/* Action Zone: Connexion, Primary CTA & Mobile/Tablet Trigger */}
            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
              
              {/* User Session / Connexion trigger */}
              {currentUser ? (
                <button
                  type="button"
                  onClick={() => onNavigate('admin')}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:text-blue-950 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
                  title={`Connecté en tant que ${currentUser.fullName}`}
                >
                  <UserCircle className="w-4 h-4 text-blue-900" />
                  <span className="hidden xl:inline max-w-[110px] truncate">{currentUser.fullName}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-900 text-white uppercase tracking-wider">
                    {currentUser.role}
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onOpenAuth}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  title="Accéder au portail"
                >
                  <UserCircle className="w-4 h-4" />
                  <span className="hidden md:inline">Connexion</span>
                </button>
              )}

              {/* Contrast Primary CTA: Préinscription */}
              <button
                type="button"
                onClick={() => handleNavClick('pre-registration')}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-blue-900 hover:bg-blue-950 shadow-sm transition-all hover:shadow active:scale-98 whitespace-nowrap focus-visible:ring-2 focus-visible:ring-amber-500 cursor-pointer"
              >
                <FileCheck className="w-4 h-4 text-amber-400" />
                <span className="hidden xs:inline">Préinscription</span>
                <span className="xs:hidden">S’inscrire</span>
              </button>

              {/* Mobile & Tablet Hamburger Toggle (Visible on < 1024px) */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-900 transition-colors cursor-pointer"
                aria-label="Ouvrir le menu de navigation"
                aria-expanded={mobileMenuOpen}
              >
                <Menu className="w-6 h-6" />
              </button>

            </div>

          </div>
        </div>
      </header>

      {/* 
        PORTALED SLIDE-OVER DRAWER WITH FLUID FRAMER-MOTION ENTRANCE & EXIT:
        Rendered directly in document.body via createPortal to completely avoid 
        being trapped inside the sticky header or CSS backdrop-filter containing block.
      */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {mobileMenuOpen && (
            <div 
              className="fixed inset-0 z-[100] lg:hidden"
              role="dialog"
              aria-modal="true"
              aria-label="Menu de navigation"
            >
              {/* Dark Backdrop Overlay with smooth fade in/out */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs cursor-pointer"
                onClick={() => setMobileMenuOpen(false)}
              />

              {/* Slide-over Drawer with spring slide in/out from right */}
              <motion.div 
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 320 }}
                className="fixed inset-y-0 right-0 w-full sm:w-[420px] max-w-full bg-white shadow-2xl flex flex-col z-[101]"
              >
                
                {/* Drawer Header */}
                <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
                  <button 
                    onClick={() => handleNavClick('home')} 
                    className="text-left focus:outline-none cursor-pointer"
                  >
                    <SchoolLogo compact />
                  </button>

                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-200/70 transition-colors cursor-pointer"
                    aria-label="Fermer le menu"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Scrollable Navigation Body */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-1.5 divide-y divide-slate-100">
                  
                  {/* Pillar List with staggered entrance */}
                  <div className="space-y-1.5 pb-3">
                    {NAV_ITEMS.map((item, idx) => {
                      const hasChildren = item.children && item.children.length > 0;
                      const isExpanded = expandedMobileItem === item.id;
                      const isCurrent = currentPage === item.id;

                      if (!hasChildren) {
                        return (
                          <motion.button
                            key={item.id}
                            initial={{ opacity: 0, x: 14 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.03 + idx * 0.035, duration: 0.22 }}
                            onClick={() => handleNavClick(item.id)}
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-base font-medium transition-colors cursor-pointer ${
                              isCurrent 
                                ? 'bg-blue-50 text-blue-900 font-semibold' 
                                : 'text-slate-800 hover:bg-slate-50'
                            }`}
                          >
                            <span>{item.label}</span>
                            <ArrowRight className="w-4 h-4 text-slate-400" />
                          </motion.button>
                        );
                      }

                      return (
                        <motion.div 
                          key={item.id}
                          initial={{ opacity: 0, x: 14 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.03 + idx * 0.035, duration: 0.22 }}
                          className="rounded-xl overflow-hidden"
                        >
                          <button
                            type="button"
                            onClick={() => setExpandedMobileItem(isExpanded ? null : item.id)}
                            className={`w-full flex items-center justify-between px-4 py-3 text-base font-medium transition-colors cursor-pointer ${
                              isCurrent || isExpanded 
                                ? 'bg-blue-50/70 text-blue-900 font-semibold' 
                                : 'text-slate-800 hover:bg-slate-50'
                            }`}
                          >
                            <span>{item.label}</span>
                            <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${
                              isExpanded ? 'rotate-180 text-blue-900' : ''
                            }`} />
                          </button>

                          {/* Accordion Subitems with smooth height animation */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden bg-slate-50/80 px-2 py-1.5 space-y-1 rounded-b-xl border-t border-slate-100"
                              >
                                {item.children?.map((subItem, sIdx) => {
                                  const Icon = subItem.icon || ArrowRight;
                                  return (
                                    <button
                                      key={sIdx}
                                      type="button"
                                      onClick={() => handleNavClick(subItem.id, subItem.subSection)}
                                      className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-slate-700 hover:text-blue-900 hover:bg-white flex items-center gap-2.5 transition-colors cursor-pointer"
                                    >
                                      <Icon className="w-4 h-4 text-blue-900/60 shrink-0" />
                                      <span className="font-medium">{subItem.label}</span>
                                    </button>
                                  );
                                })}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Action Buttons: Auth & Pre-registration with subtle fade in */}
                  <motion.div 
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.22, duration: 0.24 }}
                    className="pt-4 space-y-2.5"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onOpenAuth();
                      }}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-100 text-slate-800 text-sm font-semibold hover:bg-slate-200 transition-colors cursor-pointer"
                    >
                      <UserCircle className="w-5 h-5 text-blue-900" />
                      <span>{currentUser ? `Mon Espace (${currentUser.role})` : 'Espace Utilisateur & Connexion'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleNavClick('pre-registration')}
                      className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-blue-900 text-white text-sm font-bold hover:bg-blue-950 transition-colors shadow-md shadow-blue-900/15 cursor-pointer"
                    >
                      <GraduationCap className="w-5 h-5 text-amber-400" />
                      <span>Formulaire de Préinscription</span>
                    </button>
                  </motion.div>

                  {/* Fast Campus Contact info footer */}
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.28, duration: 0.25 }}
                    className="pt-4 space-y-2 text-xs text-slate-500"
                  >
                    <div className="flex items-center gap-2 text-slate-600">
                      <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>{SCHOOL_INFO.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <a href={`tel:${SCHOOL_INFO.phone.replace(/[\s-]+/g, '')}`} className="font-mono font-medium text-slate-700 hover:text-blue-900">
                        {SCHOOL_INFO.phone}
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <a href={`mailto:${SCHOOL_INFO.email}`} className="text-slate-700 hover:text-blue-900">
                        {SCHOOL_INFO.email}
                      </a>
                    </div>
                  </motion.div>

                </div>

              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};
