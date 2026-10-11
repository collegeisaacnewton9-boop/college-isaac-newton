import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Image as ImageIcon, 
  Layers, 
  Camera, 
  Upload, 
  Check, 
  Trash2, 
  Eye, 
  ExternalLink, 
  RotateCcw, 
  ShieldCheck, 
  GraduationCap, 
  Laptop, 
  Users, 
  Building, 
  CheckCircle2, 
  Clock, 
  SlidersHorizontal,
  X,
  FileImage,
  ArrowRight,
  BookOpen,
  Edit3,
  HelpCircle,
  Info,
  Save,
  Search,
  Star,
  Quote,
  Compass
} from 'lucide-react';
import { toast } from 'sonner';
import { useContentBlocks } from '../../context/ContentBlockContext';
import { apiService } from '../../services/api';
import { SCHOOL_IMAGES } from '../../assets/images';
import { ImageUploadCompressor } from '../common/ImageUploadCompressor';
import { SlideshowEditorView } from './SlideshowEditorView';
import { HeroSlide, Role, SiteSettings } from '../../types';

interface SiteImagesManagerViewProps {
  onNavigate?: (page: string, subSection?: string) => void;
  currentUserRole?: Role;
}

export interface KeyPageImageConfig {
  id: string;
  contentKey: string;
  defaultImage: string;
  pageTitle: string;
  pageRoute: string;
  sectionTitle: string;
  description: string;
  aspectRatio: string;
  badge: string;
  isFeatured?: boolean; // Highlighted for "Notre Image"
  category: 'viescolaire' | 'campus' | 'pedagogie' | 'accueil';
  
  // Associated editable texts
  titleKey?: string;
  defaultTitle?: string;
  badgeKey?: string;
  defaultBadge?: string;
  captionKey?: string;
  defaultCaption?: string;
  subcaptionKey?: string;
  defaultSubcaption?: string;
  p1Key?: string;
  defaultP1?: string;
  p2Key?: string;
  defaultP2?: string;
  quoteKey?: string;
  defaultQuote?: string;
}

const KEY_PAGE_IMAGES: KeyPageImageConfig[] = [
  {
    id: 'schoollife-civic',
    contentKey: 'schoollife.civic.image',
    defaultImage: SCHOOL_IMAGES.studentsAssembly,
    pageTitle: 'Vie Scolaire',
    pageRoute: 'schoollife',
    sectionTitle: 'Rassemblement Civique des Élèves (« Notre Image »)',
    description: 'Photo officielle de la cérémonie hebdomadaire du salut au drapeau sur l’esplanade du collège. Illustration majeure des valeurs républicaines et de la discipline.',
    aspectRatio: '16:9',
    badge: 'Page Vie Scolaire',
    isFeatured: true,
    category: 'viescolaire',
    titleKey: 'schoollife.civic.title',
    defaultTitle: 'Le Rassemblement Civique : Fierté et Cohésion',
    badgeKey: 'schoollife.civic.badge',
    defaultBadge: 'Valeurs Républicaines & Discipline',
    captionKey: 'schoollife.civic.image.caption',
    defaultCaption: 'Rassemblement civique des élèves',
    subcaptionKey: 'schoollife.civic.image.subcaption',
    defaultSubcaption: 'Discipline, élégance et dignité lors de la cérémonie de début de semaine',
    p1Key: 'schoollife.civic.p1',
    defaultP1: 'Chaque semaine débute par le salut solennel aux couleurs nationales sur l\'esplanade du collège. Ce moment fédérateur réunit l\'ensemble des élèves en uniforme réglementaire, le corps professoral et la direction.',
    p2Key: 'schoollife.civic.p2',
    defaultP2: 'C\'est l\'occasion de rappeler les valeurs d\'assiduité, de solidarité et d\'amour de la patrie, tout en félicitant publiquement les élèves qui se sont distingués par leurs mérites scolaires ou leur comportement exemplaire.',
    quoteKey: 'schoollife.civic.quote',
    defaultQuote: '« Le respect des autres et la fierté de son établissement constituent les fondations solides de tout futur citoyen éclairé. »'
  },
  {
    id: 'about-campus',
    contentKey: 'about.campus.image',
    defaultImage: SCHOOL_IMAGES.heroCampus,
    pageTitle: 'À Propos / Le Collège',
    pageRoute: 'college',
    sectionTitle: 'Bâtiment Principal & Campus Delmas 50',
    description: 'Façade et architecture de l’établissement à Delmas 50, rue Dominique #2 bis. Vue extérieure des galeries et de l’infrastructure d’apprentissage.',
    aspectRatio: '16:9',
    badge: 'Page À Propos',
    category: 'campus',
    titleKey: 'about.history.title',
    defaultTitle: 'Un Héritage d’Excellence et de Rigueur',
    badgeKey: 'about.history.badge',
    defaultBadge: 'Notre Histoire',
    captionKey: 'about.campus.caption',
    defaultCaption: 'Campus Principal du Collège Isaac Newton',
    subcaptionKey: 'about.campus.subcaption',
    defaultSubcaption: 'Delmas 50, rue Dominique #2 bis — Cadre d’apprentissage moderne et sécurisé'
  },
  {
    id: 'programs-lab',
    contentKey: 'programs.lab.image',
    defaultImage: SCHOOL_IMAGES.computerLab,
    pageTitle: 'Programmes & Cursus',
    pageRoute: 'programs',
    sectionTitle: 'Laboratoire Informatique & Multimédia',
    description: 'Postes d’apprentissage informatique individuel, sous onduleurs et serveurs dédiés. Initiation à la technologie, à la programmation et à la bureautique.',
    aspectRatio: '16:9',
    badge: 'Pôle Numérique',
    category: 'pedagogie',
    titleKey: 'programs.numerique.title',
    defaultTitle: 'Laboratoire Multimédia & Culture Numérique',
    badgeKey: 'programs.numerique.badge',
    defaultBadge: 'Technologie & Avenir',
    captionKey: 'programs.lab.caption',
    defaultCaption: 'Postes informatiques individuels modernes',
    subcaptionKey: 'programs.lab.subcaption',
    defaultSubcaption: 'Environnement connecté sous onduleurs et serveurs dédiés'
  },
  {
    id: 'campus-courtyard',
    contentKey: 'campus.courtyard.image',
    defaultImage: SCHOOL_IMAGES.campusCourtyard,
    pageTitle: 'Vie du Campus',
    pageRoute: 'college',
    sectionTitle: 'Cour d’Honneur & Espace Récréatif',
    description: 'Terrain multisports, galeries d’étages aérées et espace d’épanouissement sécurisé des élèves lors des récréations et activités parascolaires.',
    aspectRatio: '16:9',
    badge: 'Infrastructures',
    category: 'campus',
    captionKey: 'campus.courtyard.caption',
    defaultCaption: 'Cour d’Honneur & Galeries Sécurisées',
    subcaptionKey: 'campus.courtyard.subcaption',
    defaultSubcaption: 'Terrain multisports et espaces d’épanouissement pour tous les cycles'
  },
  {
    id: 'entrance-facade',
    contentKey: 'entrance.facade.image',
    defaultImage: SCHOOL_IMAGES.entranceFacade,
    pageTitle: 'Accueil / Enseigne',
    pageRoute: 'home',
    sectionTitle: 'Portique & Enseigne Officielle du Collège',
    description: 'Entrée principale sécurisée arborant l’enseigne officielle « COLLÈGE ISAAC NEWTON » et la devise républicaine « Savoir aujourd’hui, réussir demain ».',
    aspectRatio: '16:9',
    badge: 'Façade Principale',
    category: 'accueil',
    captionKey: 'entrance.facade.caption',
    defaultCaption: 'Entrée officielle à Delmas 50',
    subcaptionKey: 'entrance.facade.subcaption',
    defaultSubcaption: 'Contrôle d’accès permanent et accueil des familles'
  },
  {
    id: 'graduation-promo',
    contentKey: 'graduation.promo.image',
    defaultImage: SCHOOL_IMAGES.graduationPromo,
    pageTitle: 'Excellence Académique',
    pageRoute: 'programs',
    sectionTitle: 'Promotion & Cérémonie de Graduation',
    description: 'Nos élèves diplômés en toges académiques officielles lors de la remise solennelle des diplômes de fin d’études secondaires.',
    aspectRatio: '16:9',
    badge: 'Réussite & Diplômés',
    category: 'pedagogie',
    captionKey: 'graduation.promo.caption',
    defaultCaption: 'Promotion des Bacheliers & Cérémonie Officielle',
    subcaptionKey: 'graduation.promo.subcaption',
    defaultSubcaption: '100% de réussite aux examens d’État officiels'
  }
];

export const SiteImagesManagerView: React.FC<SiteImagesManagerViewProps> = ({
  onNavigate,
  currentUserRole = 'ADMIN'
}) => {
  const [activeTab, setActiveTab] = useState<'hero' | 'key-pages' | 'cycles' | 'certified' | 'guide'>('hero');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'viescolaire' | 'campus' | 'pedagogie' | 'accueil'>('all');
  
  const { getBlock, saveBlocks, isEditModeActive, toggleEditMode } = useContentBlocks();

  // Modal for changing a key page image and its texts
  const [activeModalImage, setActiveModalImage] = useState<KeyPageImageConfig | null>(null);
  const [modalTab, setModalTab] = useState<'photo' | 'texts'>('photo');
  
  // Modal local form draft
  const [tempCompressedUrl, setTempCompressedUrl] = useState<string>('');
  const [tempTitle, setTempTitle] = useState<string>('');
  const [tempBadge, setTempBadge] = useState<string>('');
  const [tempCaption, setTempCaption] = useState<string>('');
  const [tempSubcaption, setTempSubcaption] = useState<string>('');
  const [tempP1, setTempP1] = useState<string>('');
  const [tempP2, setTempP2] = useState<string>('');
  const [tempQuote, setTempQuote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Academic Cycles Data
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [cyclesData, setCyclesData] = useState<Record<string, { title: string; image: string; level: string }>>({
    prescolaire: {
      title: 'École Préscolaire & Maternelle',
      level: 'Petite, Moyenne & Grande sections',
      image: SCHOOL_IMAGES.campusCourtyard,
    },
    fondamental1_2: {
      title: 'Fondamental 1er & 2ème Cycles',
      level: '1ère à 6ème Année Fondamentale',
      image: SCHOOL_IMAGES.campusRealFacade,
    },
    fondamental3: {
      title: 'Fondamental 3ème Cycle (9ème AF)',
      level: '7ème, 8ème et 9ème Année Fondamentale',
      image: SCHOOL_IMAGES.graduationPromo,
    },
    secondaire: {
      title: 'Secondaire Général & Baccalauréat',
      level: 'Nouveau Secondaire (NS I à NS IV)',
      image: SCHOOL_IMAGES.computerLab,
    },
  });

  // Load site settings for cycles
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await apiService.getSettings();
      setSettings(data);
      if (data?.educationalCycles) {
        setCyclesData(data.educationalCycles as any);
      }
    } catch {
      // Fallback
    }
  };

  const handleUpdateCycleImage = async (cycleKey: string, newImageUrl: string) => {
    try {
      const updated = {
        ...cyclesData,
        [cycleKey]: {
          ...cyclesData[cycleKey],
          image: newImageUrl,
        },
      };
      setCyclesData(updated);

      if (settings) {
        const newSettings: SiteSettings = {
          ...settings,
          educationalCycles: updated as any,
        };
        await apiService.updateSettings(newSettings);
        setSettings(newSettings);
        window.dispatchEvent(new CustomEvent('cin:settings-updated', { detail: newSettings }));
        toast.success(`Photo du cycle mise à jour avec succès dans PostgreSQL !`);
      }
    } catch (err: any) {
      toast.error('Erreur lors de la mise à jour : ' + err.message);
    }
  };

  const handleOpenKeyImageModal = (config: KeyPageImageConfig, defaultSubTab: 'photo' | 'texts' = 'photo') => {
    const currentUrl = getBlock(config.contentKey, config.defaultImage);
    setTempCompressedUrl(currentUrl);
    setTempTitle(config.titleKey ? getBlock(config.titleKey, config.defaultTitle || '') : '');
    setTempBadge(config.badgeKey ? getBlock(config.badgeKey, config.defaultBadge || '') : '');
    setTempCaption(config.captionKey ? getBlock(config.captionKey, config.defaultCaption || '') : '');
    setTempSubcaption(config.subcaptionKey ? getBlock(config.subcaptionKey, config.defaultSubcaption || '') : '');
    setTempP1(config.p1Key ? getBlock(config.p1Key, config.defaultP1 || '') : '');
    setTempP2(config.p2Key ? getBlock(config.p2Key, config.defaultP2 || '') : '');
    setTempQuote(config.quoteKey ? getBlock(config.quoteKey, config.defaultQuote || '') : '');
    
    setModalTab(defaultSubTab);
    setActiveModalImage(config);
  };

  const handleSaveModalData = async () => {
    if (!activeModalImage) return;

    setIsSubmitting(true);
    try {
      const blocksToSave: Record<string, string> = {
        [activeModalImage.contentKey]: tempCompressedUrl || activeModalImage.defaultImage,
      };

      if (activeModalImage.titleKey) blocksToSave[activeModalImage.titleKey] = tempTitle;
      if (activeModalImage.badgeKey) blocksToSave[activeModalImage.badgeKey] = tempBadge;
      if (activeModalImage.captionKey) blocksToSave[activeModalImage.captionKey] = tempCaption;
      if (activeModalImage.subcaptionKey) blocksToSave[activeModalImage.subcaptionKey] = tempSubcaption;
      if (activeModalImage.p1Key) blocksToSave[activeModalImage.p1Key] = tempP1;
      if (activeModalImage.p2Key) blocksToSave[activeModalImage.p2Key] = tempP2;
      if (activeModalImage.quoteKey) blocksToSave[activeModalImage.quoteKey] = tempQuote;

      await saveBlocks(blocksToSave);
      toast.success(`Photo et informations enregistrées pour : « ${activeModalImage.sectionTitle} » !`, {
        description: `Visible immédiatement sur la page ${activeModalImage.pageTitle}.`,
      });
      setActiveModalImage(null);
    } catch (err: any) {
      toast.error('Erreur lors de la sauvegarde : ' + (err.message || 'Erreur réseau'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetKeyImage = async (config: KeyPageImageConfig) => {
    if (window.confirm(`Rétablir la photo certifiée et les textes d'origine pour « ${config.sectionTitle} » ?`)) {
      const blocksToReset: Record<string, string> = {
        [config.contentKey]: config.defaultImage,
      };
      if (config.titleKey && config.defaultTitle) blocksToReset[config.titleKey] = config.defaultTitle;
      if (config.badgeKey && config.defaultBadge) blocksToReset[config.badgeKey] = config.defaultBadge;
      if (config.captionKey && config.defaultCaption) blocksToReset[config.captionKey] = config.defaultCaption;
      if (config.subcaptionKey && config.defaultSubcaption) blocksToReset[config.subcaptionKey] = config.defaultSubcaption;
      if (config.p1Key && config.defaultP1) blocksToReset[config.p1Key] = config.defaultP1;
      if (config.p2Key && config.defaultP2) blocksToReset[config.p2Key] = config.defaultP2;
      if (config.quoteKey && config.defaultQuote) blocksToReset[config.quoteKey] = config.defaultQuote;

      await saveBlocks(blocksToReset);
      toast.info(`Photo et textes rétablis avec succès.`);
    }
  };

  const filteredImages = KEY_PAGE_IMAGES.filter((img) => {
    const matchesCategory = selectedCategory === 'all' || img.category === selectedCategory;
    const matchesQuery = 
      img.sectionTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      img.pageTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      img.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const featuredImageConfig = KEY_PAGE_IMAGES.find(img => img.isFeatured);

  return (
    <div className="space-y-4 sm:space-y-5 font-sans">
      
      {/* =========================================================================
          HEADER: GESTIONNAIRE DES IMAGES & INFORMATIONS DU SITE
      ========================================================================= */}
      <div className="bg-white rounded-2xl p-3.5 sm:p-5 border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-900 to-indigo-950 text-amber-400 flex items-center justify-center shadow-xs border border-blue-800 shrink-0">
              <Camera className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-serif font-bold text-slate-900 text-base sm:text-lg tracking-tight">
                  Gestionnaire des Images & Textes du Site
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200 font-mono">
                  Zéro Ligne de Code
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200 flex items-center gap-1 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  WebP 16:9 Haute Performance
                </span>
              </div>
              <p className="text-xs text-slate-500 font-sans">
                Remplacez et personnalisez facilement les photos officielles et informations associées (Carrousel Héro, Vie Scolaire « Notre Image », Campus, Cycles).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
            <button
              type="button"
              onClick={toggleEditMode}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isEditModeActive
                  ? 'bg-amber-400 text-slate-950 shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
              title="Active le bouton d'édition directe directement sur les pages publiques"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Éditeur en Direct : {isEditModeActive ? 'ACTIF' : 'INACTIF'}</span>
            </button>

            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('home')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-900 hover:bg-blue-950 text-white text-xs font-bold transition-colors cursor-pointer shrink-0 shadow-xs"
              >
                <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                <span>Voir le Site en Direct</span>
              </button>
            )}
          </div>
        </div>

        {/* Subtabs Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-100 no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('hero')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'hero'
                ? 'bg-amber-400 text-slate-950 shadow-2xs ring-1 ring-amber-300'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>🎠 Diaporama Hero (Accueil)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('key-pages')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'key-pages'
                ? 'bg-blue-900 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Building className="w-3.5 h-3.5 text-blue-400" />
            <span>🏫 « Notre Image » & Pages Clés</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cycles')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'cycles'
                ? 'bg-blue-900 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5 text-blue-400" />
            <span>🎓 4 Cycles Pédagogiques</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('certified')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'certified'
                ? 'bg-blue-900 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>📸 Banque de Photos Certifiées</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('guide')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'guide'
                ? 'bg-slate-900 text-amber-400 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>📘 Guide : Comment Procéder ?</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          TAB 1: DIAPORAMA HERO (PAGE D'ACCUEIL)
      ========================================================================= */}
      {activeTab === 'hero' && (
        <div className="space-y-3">
          <div className="bg-amber-50/90 border border-amber-200/90 rounded-2xl p-3 sm:p-4 text-xs text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <span className="font-bold block">Éditeur Visuel du Carrousel d'Accueil (Hero)</span>
                <span className="text-[11px] text-amber-900/80">
                  Sélectionnez chaque diapositive pour remplacer sa photo par votre image réelle, modifier le texte, les boutons ou ajuster le centrage.
                </span>
              </div>
            </div>
            <div className="text-[10px] font-mono font-bold bg-white px-2.5 py-1 rounded-lg border border-amber-200 text-amber-900 shrink-0 shadow-2xs">
              Mise à jour en temps réel
            </div>
          </div>

          <SlideshowEditorView
            currentUserRole={currentUserRole}
            onNavigate={onNavigate}
          />
        </div>
      )}

      {/* =========================================================================
          TAB 2: PHOTOS DES PAGES CLÉS DU SITE (VIE SCOLAIRE, À PROPOS, PROGRAMMES)
      ========================================================================= */}
      {activeTab === 'key-pages' && (
        <div className="space-y-4">
          
          {/* VEDETTE : « NOTRE IMAGE » DE LA PAGE VIE SCOLAIRE (REPONSE DIRECTE A LA DEMANDE UTILISATEUR) */}
          {featuredImageConfig && (
            <div className="bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-4 sm:p-6 border border-blue-800/80 shadow-lg space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
                    <Star className="w-4 h-4 fill-slate-950" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                        Image Principale Demandée
                      </span>
                      <span className="px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono border border-emerald-500/30">
                        Page Vie Scolaire
                      </span>
                    </div>
                    <h2 className="font-serif font-bold text-base sm:text-xl text-white">
                      « Notre Image » : Rassemblement Civique & Élèves
                    </h2>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {onNavigate && (
                    <button
                      type="button"
                      onClick={() => onNavigate('schoollife')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-xs transition-colors cursor-pointer"
                    >
                      <span>Voir la page Vie Scolaire</span>
                      <ExternalLink className="w-3.5 h-3.5 text-amber-300" />
                    </button>
                  )}
                </div>
              </div>

              {/* Grid 2-cols: Preview & Current Information */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
                <div className="lg:col-span-5 relative rounded-2xl overflow-hidden aspect-video bg-black/60 border border-white/20 shadow-inner group">
                  <img
                    src={getBlock(featuredImageConfig.contentKey, featuredImageConfig.defaultImage)}
                    alt={featuredImageConfig.sectionTitle}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                  
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 text-xs text-white space-y-0.5">
                    <p className="font-bold text-amber-300 line-clamp-1">
                      {getBlock(featuredImageConfig.captionKey || '', featuredImageConfig.defaultCaption || '')}
                    </p>
                    <p className="text-[11px] text-slate-300 line-clamp-1">
                      {getBlock(featuredImageConfig.subcaptionKey || '', featuredImageConfig.defaultSubcaption || '')}
                    </p>
                  </div>
                </div>

                <div className="lg:col-span-7 space-y-3">
                  <div className="space-y-1">
                    <span className="text-[11px] font-mono text-amber-300 uppercase tracking-wider font-semibold">
                      {getBlock(featuredImageConfig.badgeKey || '', featuredImageConfig.defaultBadge || '')}
                    </span>
                    <h3 className="font-serif text-lg sm:text-xl font-bold text-white leading-snug">
                      {getBlock(featuredImageConfig.titleKey || '', featuredImageConfig.defaultTitle || '')}
                    </h3>
                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      {getBlock(featuredImageConfig.p1Key || '', featuredImageConfig.defaultP1 || '')}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-amber-200/90 italic">
                    {getBlock(featuredImageConfig.quoteKey || '', featuredImageConfig.defaultQuote || '')}
                  </div>

                  {/* Actions for Featured */}
                  <div className="flex items-center gap-2 pt-1 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleOpenKeyImageModal(featuredImageConfig, 'photo')}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer hover:scale-102"
                    >
                      <Camera className="w-4 h-4 text-slate-950" />
                      <span>Remplacer « Notre Photo »</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenKeyImageModal(featuredImageConfig, 'texts')}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-800 hover:bg-blue-700 text-white font-semibold text-xs border border-blue-600 transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-amber-300" />
                      <span>Modifier les Textes & Légendes</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleResetKeyImage(featuredImageConfig)}
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-slate-400 hover:text-rose-300 hover:bg-white/5 text-xs transition-colors cursor-pointer"
                      title="Rétablir les valeurs d'origine"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Rétablir d'origine</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Controls: Search & Categories */}
          <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-serif font-bold text-slate-900 text-sm sm:text-base">
                  Toutes les Photos Principales & Sections Clés
                </h2>
                <p className="text-xs text-slate-500">
                  Sélectionnez n’importe quelle section pour remplacer son image ou mettre à jour ses textes descriptifs sans toucher au code.
                </p>
              </div>

              {/* Search input */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Rechercher une section..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900 bg-slate-50"
                />
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pt-1 no-scrollbar text-xs">
              {[
                { id: 'all', label: 'Toutes les Photos' },
                { id: 'viescolaire', label: 'Vie Scolaire' },
                { id: 'campus', label: 'Campus & Façade' },
                { id: 'pedagogie', label: 'Pôle Pédagogique' },
                { id: 'accueil', label: 'Accueil' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id as any)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-blue-900 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredImages.map((config) => {
              const currentImageUrl = getBlock(config.contentKey, config.defaultImage);
              const isCustom = currentImageUrl !== config.defaultImage;

              return (
                <div 
                  key={config.id} 
                  className={`bg-white rounded-2xl border shadow-2xs overflow-hidden flex flex-col justify-between group transition-all ${
                    config.isFeatured 
                      ? 'border-blue-900/50 ring-1 ring-blue-900/10' 
                      : 'border-slate-200/90 hover:border-blue-900/40'
                  }`}
                >
                  <div>
                    {/* Visual 16:9 Image Preview */}
                    <div className="relative aspect-video w-full bg-slate-950 overflow-hidden">
                      <img
                        src={currentImageUrl}
                        alt={config.sectionTitle}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                      
                      {/* Top Badges */}
                      <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-full bg-blue-900/90 backdrop-blur-xs text-white text-[10px] font-bold border border-white/20">
                          {config.badge}
                        </span>
                        {isCustom ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold shadow-xs">
                            ✓ Photo Active
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-slate-800/90 text-slate-200 text-[10px] font-medium backdrop-blur-xs">
                            Photo Certifiée d'Origine
                          </span>
                        )}
                      </div>

                      {/* Route Tag */}
                      <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/70 text-slate-200 text-[10px] font-mono">
                        Route : /{config.pageRoute}
                      </div>
                    </div>

                    {/* Content Details */}
                    <div className="p-3.5 space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-serif font-bold text-slate-900 text-sm leading-snug">
                          {config.sectionTitle}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {config.description}
                      </p>

                      {/* Info preview badges */}
                      {config.captionKey && (
                        <div className="pt-1.5 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-slate-500">
                          <Info className="w-3 h-3 text-blue-800 shrink-0" />
                          <span className="truncate">
                            Légende : « {getBlock(config.captionKey, config.defaultCaption || '')} »
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="p-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5">
                      {isCustom && (
                        <button
                          type="button"
                          onClick={() => handleResetKeyImage(config)}
                          className="px-2 py-1 rounded-lg text-rose-600 hover:bg-rose-50 text-[11px] font-semibold transition-colors cursor-pointer"
                          title="Rétablir la photo certifiée d'origine"
                        >
                          <RotateCcw className="w-3 h-3 inline mr-1" />
                          <span>Rétablir</span>
                        </button>
                      )}

                      {onNavigate && (
                        <button
                          type="button"
                          onClick={() => onNavigate(config.pageRoute)}
                          className="text-[11px] text-blue-900 hover:underline font-semibold flex items-center gap-1"
                        >
                          <span>Voir la page</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenKeyImageModal(config, 'texts')}
                        className="px-2.5 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-200/60 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                        title="Modifier le titre, la légende et les descriptions"
                      >
                        <Edit3 className="w-3 h-3 inline mr-1 text-slate-600" />
                        <span>Textes</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenKeyImageModal(config, 'photo')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5 text-amber-400" />
                        <span>Changer la Photo</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: PHOTOS DES 4 CYCLES PÉDAGOGIQUES
      ========================================================================= */}
      {activeTab === 'cycles' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/90 shadow-2xs">
            <h2 className="font-serif font-bold text-slate-900 text-sm sm:text-base">
              Bannières des 4 Cycles d'Enseignement (Page d'Accueil)
            </h2>
            <p className="text-xs text-slate-500">
              Ces photos illustrent l’onglet interactif des cycles sur la page d’accueil (Maternelle, Fondamental 1 & 2, Fondamental 3, Secondaire).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {Object.entries(cyclesData).map(([cycleKey, cycle]) => (
              <div 
                key={cycleKey}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  <div className="relative aspect-video w-full bg-slate-950 overflow-hidden">
                    <img
                      src={cycle.image}
                      alt={cycle.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/70 text-amber-300 text-[10px] font-mono font-bold">
                      {cycleKey.toUpperCase()}
                    </span>
                  </div>

                  <div className="p-3 space-y-1">
                    <h3 className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-1">
                      {cycle.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 line-clamp-1">
                      {cycle.level}
                    </p>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50/80 border-t border-slate-100">
                  <ImageUploadCompressor
                    currentImageUrl={cycle.image}
                    onImageReady={(url) => handleUpdateCycleImage(cycleKey, url)}
                    label="Changer la photo"
                    recommendedAspect="Format 16:9 recommandé"
                    compact={true}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: BANQUE DE PHOTOS CERTIFIÉES DU COLLÈGE
      ========================================================================= */}
      {activeTab === 'certified' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="font-serif font-bold text-slate-900 text-sm sm:text-base">
                Banque de Photos Certifiées du Collège Isaac Newton
              </h2>
              <p className="text-xs text-slate-500">
                Photos haute définition officielles prêtes à l’emploi, hébergées sur le serveur et utilisables en un clic.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-xl bg-blue-50 text-blue-900 text-xs font-bold border border-blue-200 self-start sm:self-auto font-mono">
              5 Photos HD Référencées
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                id: 'campus-facade',
                title: 'Façade Réelle du Campus',
                subtitle: 'Enseigne officielle Collège Isaac Newton & devise',
                url: SCHOOL_IMAGES.campusRealFacade,
                location: 'Delmas 50, rue Dominique #2 bis',
              },
              {
                id: 'courtyard',
                title: 'Cour d’Honneur & Bâtiment',
                subtitle: 'Espaces extérieurs aérés et galeries bleues',
                url: SCHOOL_IMAGES.campusCourtyard,
                location: 'Campus Principal',
              },
              {
                id: 'grad-ceremony',
                title: 'Promotion & Cérémonie de Graduation',
                subtitle: 'Élèves bacheliers en toges académiques officielles',
                url: SCHOOL_IMAGES.graduationPromo,
                location: 'Cérémonie Officielle',
              },
              {
                id: 'computer-lab',
                title: 'Laboratoire Informatique & Multimédia',
                subtitle: 'Postes individuels de technologie & sciences',
                url: SCHOOL_IMAGES.computerLab,
                location: 'Pôle Technologique',
              },
              {
                id: 'assembly',
                title: 'Rassemblement Civique des Élèves',
                subtitle: 'Salut au drapeau national et discipline républicaine',
                url: SCHOOL_IMAGES.studentsAssembly,
                location: 'Esplanade du Collège',
              },
            ].map((photo) => (
              <div 
                key={photo.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col justify-between group hover:border-blue-900/40 transition-all"
              >
                <div>
                  <div className="relative aspect-video w-full bg-slate-950 overflow-hidden">
                    <img
                      src={photo.url}
                      alt={photo.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/70 text-amber-300 text-[10px] font-mono">
                      {photo.location}
                    </span>
                  </div>

                  <div className="p-3.5 space-y-1">
                    <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                      {photo.title}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      {photo.subtitle}
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[10px] font-mono text-slate-400 truncate max-w-[150px]">
                    {photo.url}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(photo.url);
                      toast.success('Lien de l’image copié dans le presse-papier !');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 font-semibold border border-slate-200 transition-colors text-[11px] cursor-pointer"
                  >
                    Copier le lien
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 5: GUIDE PRATIQUE : COMMENT PROCÉDER ? (REPONSE A LA QUESTION DE L'EXPERT)
      ========================================================================= */}
      {activeTab === 'guide' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-3xl p-5 sm:p-6 shadow-md space-y-2">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider">
              <Compass className="w-4 h-4" />
              <span>Guide d'Administration Officiel</span>
            </div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold">
              Comment Modifier les Infos et les Images du Site Sans Code ?
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 max-w-3xl leading-relaxed">
              Vous disposez de <strong>deux méthodes extrêmement simples</strong> pour mettre à jour les photos (notamment « Notre Image » de la Vie Scolaire et le Carrousel Héro d'accueil) ainsi que tous les textes du site sans jamais toucher au code source.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* METHODE 1 : DEPUIS CE TABLEAU DE BORD ADMIN */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-slate-900 text-sm sm:text-base">
                      Méthode 1 : Depuis cet Onglet Administrateur
                    </h3>
                    <p className="text-xs text-slate-500">Recommandée pour une gestion centralisée et rapide</p>
                  </div>
                </div>

                <ol className="space-y-2.5 text-xs text-slate-600 list-decimal list-inside leading-relaxed pl-1">
                  <li className="pl-1">
                    <strong className="text-slate-900">Choisissez la section :</strong> Onglet <em>« Diaporama Hero »</em> pour l'accueil, ou <em>« « Notre Image » & Pages Clés »</em> pour la Vie Scolaire, le Campus ou les Programmes.
                  </li>
                  <li className="pl-1">
                    <strong className="text-slate-900">Cliquez sur « Remplacer la Photo » :</strong> Sélectionnez votre fichier photo depuis votre ordinateur ou téléphone (JPG, PNG ou WebP).
                  </li>
                  <li className="pl-1">
                    <strong className="text-slate-900">Compression automatique :</strong> L'outil compresse intelligemment l'image au format WebP 16:9 ultra-rapide pour ne jamais ralentir le site.
                  </li>
                  <li className="pl-1">
                    <strong className="text-slate-900">Modifiez les textes :</strong> Cliquez sur <em>« Textes »</em> pour ajuster le titre, la légende ou le paragraphe d'accompagnement.
                  </li>
                  <li className="pl-1">
                    <strong className="text-slate-900">Cliquez sur « Enregistrer » :</strong> Vos modifications sont enregistrées en base de données PostgreSQL et s'affichent immédiatement en direct.
                  </li>
                </ol>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveTab('key-pages')}
                  className="w-full py-2 px-3 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Camera className="w-3.5 h-3.5 text-amber-400" />
                  <span>Accéder à « Notre Image » maintenant</span>
                </button>
              </div>
            </div>

            {/* METHODE 2 : DIRECTEMENT SUR LA PAGE PUBLIQUE VIA L'EDITEUR EN DIRECT */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-sm">
                    2
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-slate-900 text-sm sm:text-base">
                      Méthode 2 : Édition en Direct sur la Page Publique
                    </h3>
                    <p className="text-xs text-slate-500">Pour modifier les textes et photos comme dans un traitement de texte</p>
                  </div>
                </div>

                <ol className="space-y-2.5 text-xs text-slate-600 list-decimal list-inside leading-relaxed pl-1">
                  <li className="pl-1">
                    <strong className="text-slate-900">Activez le Mode Édition :</strong> Vérifiez que le bouton flottant en bas à gauche indique <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">Mode Édition : ON</span>.
                  </li>
                  <li className="pl-1">
                    <strong className="text-slate-900">Rendez-vous sur la page :</strong> Naviguez par exemple sur la page <em>Vie Scolaire</em> (ou À Propos, Programmes, etc.).
                  </li>
                  <li className="pl-1">
                    <strong className="text-slate-900">Survol d'image :</strong> Un bouton sombre « Changer la photo » apparaît en haut à droite de l'image. Cliquez dessus pour téléverser votre nouvelle photo.
                  </li>
                  <li className="pl-1">
                    <strong className="text-slate-900">Clic sur n'importe quel texte :</strong> Cliquez sur le titre, le paragraphe ou la légende pour taper directement vos corrections au clavier.
                  </li>
                  <li className="pl-1">
                    <strong className="text-slate-900">Sauvegarde automatique :</strong> Chaque modification est immédiatement sauvegardée au fur et à mesure !
                  </li>
                </ol>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleEditMode}
                  className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs ${
                    isEditModeActive
                      ? 'bg-amber-400 text-slate-950'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{isEditModeActive ? 'Désactiver le Mode Édition' : 'Activer le Mode Édition'}</span>
                </button>

                {onNavigate && (
                  <button
                    type="button"
                    onClick={() => onNavigate('schoollife')}
                    className="py-2 px-3 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs cursor-pointer shadow-xs"
                    title="Tester sur la page Vie Scolaire"
                  >
                    Aller sur Vie Scolaire →
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL UNIFIÉ: ÉDITION IMAGE & TEXTES ASSOCIÉS D'UNE PAGE CLÉ
      ========================================================================= */}
      {activeModalImage && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in"
          onClick={() => setActiveModalImage(null)}
        >
          <div 
            className="bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full p-4 sm:p-5 shadow-2xl border border-slate-200/90 animate-scale-in space-y-4 my-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center">
                  <Camera className="w-4.5 h-4.5 text-blue-900" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                      {activeModalImage.sectionTitle}
                    </h3>
                    <span className="px-2 py-0.2 rounded-full bg-blue-50 text-blue-800 text-[10px] font-mono font-semibold">
                      Page {activeModalImage.pageTitle}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Modifiez la photo et les informations textuelles associées sans aucune ligne de code.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveModalImage(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Subtabs : Photo vs Textes */}
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2 text-xs">
              <button
                type="button"
                onClick={() => setModalTab('photo')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all ${
                  modalTab === 'photo'
                    ? 'bg-blue-900 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>1. Photo Principale</span>
              </button>

              <button
                type="button"
                onClick={() => setModalTab('texts')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all ${
                  modalTab === 'texts'
                    ? 'bg-blue-900 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>2. Textes & Légendes Associés</span>
              </button>
            </div>

            {/* Subtab 1: Photo & Image Compressor */}
            {modalTab === 'photo' && (
              <div className="space-y-3">
                <div className="bg-slate-50 p-3 sm:p-4 rounded-2xl border border-slate-200">
                  <ImageUploadCompressor
                    currentImageUrl={tempCompressedUrl || activeModalImage.defaultImage}
                    onImageReady={(compressedUrl) => setTempCompressedUrl(compressedUrl)}
                    label="Téléversez votre vraie photo d'établissement"
                    recommendedAspect="Format 16:9 recommandé (WebP Auto)"
                    compact={false}
                    enforce169AspectRatio={true}
                  />
                </div>

                <div className="text-[11px] text-slate-500 bg-blue-50/60 border border-blue-100 p-2.5 rounded-xl flex items-center gap-2">
                  <Info className="w-4 h-4 text-blue-900 shrink-0" />
                  <span>
                    La photo est automatiquement optimisée en WebP pour garantir un chargement ultra-rapide sur mobile et ordinateur.
                  </span>
                </div>
              </div>
            )}

            {/* Subtab 2: Associated Text Fields */}
            {modalTab === 'texts' && (
              <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                {/* Title & Badge */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeModalImage.badgeKey && (
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">Badge / Thématique</label>
                      <input
                        type="text"
                        value={tempBadge}
                        onChange={(e) => setTempBadge(e.target.value)}
                        placeholder="Ex: Valeurs Républicaines & Discipline"
                        className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-900 bg-slate-50"
                      />
                    </div>
                  )}

                  {activeModalImage.titleKey && (
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">Titre de la Section</label>
                      <input
                        type="text"
                        value={tempTitle}
                        onChange={(e) => setTempTitle(e.target.value)}
                        placeholder="Ex: Le Rassemblement Civique : Fierté et Cohésion"
                        className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-900 bg-slate-50 font-serif font-bold"
                      />
                    </div>
                  )}
                </div>

                {/* Caption & Subcaption under image */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeModalImage.captionKey && (
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">Légende Principale de l'Image</label>
                      <input
                        type="text"
                        value={tempCaption}
                        onChange={(e) => setTempCaption(e.target.value)}
                        placeholder="Ex: Rassemblement civique des élèves"
                        className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-900 bg-slate-50 font-semibold"
                      />
                    </div>
                  )}

                  {activeModalImage.subcaptionKey && (
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">Sous-Légende Descriptive</label>
                      <input
                        type="text"
                        value={tempSubcaption}
                        onChange={(e) => setTempSubcaption(e.target.value)}
                        placeholder="Ex: Discipline, élégance et dignité lors de la cérémonie"
                        className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-900 bg-slate-50"
                      />
                    </div>
                  )}
                </div>

                {/* Paragraphs if applicable */}
                {activeModalImage.p1Key && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700">Premier Paragraphe d'Accompagnement</label>
                    <textarea
                      rows={2}
                      value={tempP1}
                      onChange={(e) => setTempP1(e.target.value)}
                      placeholder="Texte descriptif principal..."
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-900 bg-slate-50 resize-none"
                    />
                  </div>
                )}

                {activeModalImage.p2Key && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700">Second Paragraphe (Facultatif)</label>
                    <textarea
                      rows={2}
                      value={tempP2}
                      onChange={(e) => setTempP2(e.target.value)}
                      placeholder="Complément d'information..."
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-900 bg-slate-50 resize-none"
                    />
                  </div>
                )}

                {activeModalImage.quoteKey && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700">Citation / Devise Institutionnelle</label>
                    <input
                      type="text"
                      value={tempQuote}
                      onChange={(e) => setTempQuote(e.target.value)}
                      placeholder="« Le respect des autres... »"
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-900 bg-slate-50 italic"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Live Preview Bar */}
            <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-xs flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 truncate">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <span className="text-[11px] text-slate-600 truncate">
                  Aperçu en direct : <strong>{tempTitle || activeModalImage.sectionTitle}</strong>
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-500 shrink-0">
                Format 16:9
              </span>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => handleResetKeyImage(activeModalImage)}
                className="text-xs text-rose-600 hover:underline font-semibold cursor-pointer"
              >
                Rétablir d'origine
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModalImage(null)}
                  disabled={isSubmitting}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleSaveModalData}
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isSubmitting ? 'Enregistrement...' : 'Enregistrer les Modifications'}</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
