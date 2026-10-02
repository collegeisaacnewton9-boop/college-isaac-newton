import { SCHOOL_IMAGES } from '../assets/images';
import { SCHOOL_INFO, INITIAL_NEWS } from '../data/mockData';

export interface PageSEO {
  title: string;
  description: string;
  canonicalPath: string;
  ogImage: string;
  ogImageAlt: string;
  ogType?: 'website' | 'article';
  keywords?: string[];
  schemaData?: Record<string, any>;
}

const DEFAULT_BASE_URL = 'https://collegeisaacnewton.com';

export const PAGE_SEO_CONFIG: Record<string, PageSEO> = {
  home: {
    title: "Collège Isaac Newton | Excellence Académique & Rigueur Scientifique · Delmas 50",
    description: "Site officiel du Collège Isaac Newton à Delmas 50, Port-au-Prince. Établissement d'excellence du préscolaire au secondaire (9e AF et NS4). Savoir aujourd'hui, réussir demain.",
    canonicalPath: '/',
    ogImage: SCHOOL_IMAGES.campusRealFacade,
    ogImageAlt: "Façade du campus principal du Collège Isaac Newton à Delmas 50, Port-au-Prince",
    keywords: [
      "Collège Isaac Newton",
      "école Delmas 50",
      "école privée Port-au-Prince",
      "lycée Haïti",
      "baccalauréat NS4 Haïti",
      "9e année fondamentale Delmas",
      "sciences et mathématiques Haïti",
      "Orphe Jean Marie",
      "admission collège Isaac Newton"
    ],
    schemaData: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Accueil · Collège Isaac Newton",
      "description": "Portail officiel du Collège Isaac Newton à Delmas 50.",
      "url": "https://collegeisaacnewton.com/",
      "isPartOf": {
        "@type": "EducationalOrganization",
        "name": "Collège Isaac Newton",
        "url": "https://collegeisaacnewton.com"
      }
    }
  },

  college: {
    title: "Histoire, Mission & Direction Générale | Collège Isaac Newton",
    description: "Découvrez la vision d'excellence et la direction d'Orphe Jean Marie au Collège Isaac Newton : formation citoyenne, rigueur scientifique et encadrement pédagogique d'élite.",
    canonicalPath: '/college',
    ogImage: SCHOOL_IMAGES.campusRealFacade,
    ogImageAlt: "Campus et Direction Générale du Collège Isaac Newton",
    keywords: ["Orphe Jean Marie", "direction collège Isaac Newton", "histoire collège Isaac Newton", "mission éducative Haïti"],
    schemaData: {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      "name": "Notre Histoire & Direction Générale",
      "url": "https://collegeisaacnewton.com/college"
    }
  },

  programs: {
    title: "Programmes Pédagogiques & Cycles Scolaires | Collège Isaac Newton",
    description: "Cursus complet du Préscolaire, Fondamental et Secondaire (NS1 à NS4 Baccalauréat). Mathématiques renforcées, sciences physiques, informatique et préparation MENFP.",
    canonicalPath: '/programs',
    ogImage: SCHOOL_IMAGES.computerLab,
    ogImageAlt: "Laboratoire informatique et scientifique du Collège Isaac Newton",
    keywords: ["programmes scolaires Haïti", "secondaire rénové NS4", "baccalauréat MENFP", "cours informatique Delmas", "mathématiques sciences Haïti"],
    schemaData: {
      "@context": "https://schema.org",
      "@type": "ItemPage",
      "name": "Programmes Académiques & Cycles Scolaires",
      "url": "https://collegeisaacnewton.com/programs"
    }
  },

  admissions: {
    title: "Admissions & Critères d'Excellence 2026-2027 | Collège Isaac Newton",
    description: "Modalités d'admission au Collège Isaac Newton : dates des tests d'aptitude, pièces requises, barème et entretiens de direction pour la rentrée 2026-2027.",
    canonicalPath: '/admissions',
    ogImage: SCHOOL_IMAGES.graduationPromo,
    ogImageAlt: "Cérémonie académique et promotions d'élèves du Collège Isaac Newton",
    keywords: ["inscription école Delmas", "admissions 2026-2027", "test admission collège Isaac Newton", "tarifs scolaires Port-au-Prince"],
  },

  'pre-registration': {
    title: "Préinscription en Ligne 2026-2027 | Collège Isaac Newton",
    description: "Formulaire officiel de préinscription en ligne au Collège Isaac Newton à Delmas 50. Réservez une place pour votre enfant en quelques clics avec suivi instantané.",
    canonicalPath: '/pre-registration',
    ogImage: SCHOOL_IMAGES.campusRealFacade,
    ogImageAlt: "Portail de préinscription en ligne du Collège Isaac Newton",
    keywords: ["préinscription en ligne Haïti", "formulaire admission CIN", "candidature scolaire 2026"],
  },

  'school-life': {
    title: "Vie Scolaire, Discipline & Citoyenneté | Collège Isaac Newton",
    description: "Le cadre de vie au Collège Isaac Newton : uniforme réglementaire, rassemblement civique hebdomadaire, clubs de sciences, tournois sportifs et discipline bienveillante.",
    canonicalPath: '/school-life',
    ogImage: SCHOOL_IMAGES.studentsAssembly,
    ogImageAlt: "Rassemblement civique des élèves du Collège Isaac Newton",
    keywords: ["vie scolaire Haïti", "uniforme collège Isaac Newton", "discipline scolaire Delmas", "activités parascolaires Port-au-Prince"],
  },

  news: {
    title: "Actualités & Communiqués Officiels | Collège Isaac Newton",
    description: "Toutes les actualités du Collège Isaac Newton : annonces officielles MENFP, résultats aux examens d'État, modernisation des laboratoires et vie du campus.",
    canonicalPath: '/news',
    ogImage: SCHOOL_IMAGES.heroCampus,
    ogImageAlt: "Actualités et vie pédagogique du Collège Isaac Newton",
    keywords: ["actualités scolaires Delmas", "nouvelles collège Isaac Newton", "MENFP examens officiels", "communiqués scolaires"],
  },

  events: {
    title: "Calendrier Scolaire & Événements Clés 2026-2027 | Collège Isaac Newton",
    description: "Consultez le calendrier officiel interactif du Collège Isaac Newton : dates des examens blancs, vacances et jours fériés MENFP, rencontres parents-professeurs et foires scientifiques.",
    canonicalPath: '/events',
    ogImage: SCHOOL_IMAGES.graduationPromo,
    ogImageAlt: "Calendrier et événements officiels du Collège Isaac Newton",
    keywords: ["calendrier scolaire MENFP Haïti", "vacances scolaires Port-au-Prince", "examens officiels 9e AF NS4", "agenda scolaire Delmas 50"],
    schemaData: {
      "@context": "https://schema.org",
      "@type": "ItemPage",
      "name": "Calendrier Académique & Événements Clés",
      "url": "https://collegeisaacnewton.com/events"
    }
  },

  gallery: {
    title: "Galerie Photos & Immersion au Campus | Collège Isaac Newton",
    description: "Explorez en images les infrastructures modernes du Collège Isaac Newton à Delmas 50 : laboratoires informatiques, cour de récréation, salles de cours et cérémonies.",
    canonicalPath: '/gallery',
    ogImage: SCHOOL_IMAGES.campusCourtyard,
    ogImageAlt: "Cour intérieure et infrastructures du Collège Isaac Newton",
    keywords: ["photos collège Isaac Newton", "visite campus Delmas 50", "laboratoire informatique école Haïti"],
  },

  resources: {
    title: "Espace Ressources, Documents & Téléchargements | Collège Isaac Newton",
    description: "Téléchargez en PDF le calendrier académique officiel, les fiches de révision, les listes de fournitures scolaires et les règlements intérieurs du Collège Isaac Newton.",
    canonicalPath: '/resources',
    ogImage: SCHOOL_IMAGES.computerLab,
    ogImageAlt: "Centre de ressources documentaires du Collège Isaac Newton",
    keywords: ["télécharger calendrier scolaire Haïti", "fournitures scolaires Delmas", "règlement intérieur CIN"],
  },

  contact: {
    title: "Contact & Secrétariat Administratif | Delmas 50 · Collège Isaac Newton",
    description: "Contactez le Collège Isaac Newton : Delmas 50, rue Dominique #2 bis, Port-au-Prince. Téléphones directs : +509 3316-0934 / +509 3721-1818. Horaires d'ouverture et plan d'accès.",
    canonicalPath: '/contact',
    ogImage: SCHOOL_IMAGES.campusRealFacade,
    ogImageAlt: "Secrétariat et accueil des familles au Collège Isaac Newton à Delmas 50",
    keywords: ["contact collège Isaac Newton", "téléphone école Delmas 50", "adresse collège Isaac Newton", "secrétariat scolaire Port-au-Prince"],
    schemaData: {
      "@context": "https://schema.org",
      "@type": "ContactPage",
      "name": "Contact & Secrétariat",
      "url": "https://collegeisaacnewton.com/contact"
    }
  },

  legal: {
    title: "Mentions Légales & Registre Officiel | Collège Isaac Newton",
    description: "Informations légales, immatriculation et mentions administratives officielles du Collège Isaac Newton à Port-au-Prince, Haïti.",
    canonicalPath: '/legal',
    ogImage: SCHOOL_IMAGES.campusRealFacade,
    ogImageAlt: "Mentions Légales du Collège Isaac Newton",
  },

  privacy: {
    title: "Politique de Confidentialité & Protection des Données | Collège Isaac Newton",
    description: "Découvrez notre engagement pour la protection des données personnelles des élèves et des parents au Collège Isaac Newton conformément aux meilleures pratiques de confidentialité.",
    canonicalPath: '/privacy',
    ogImage: SCHOOL_IMAGES.campusRealFacade,
    ogImageAlt: "Politique de Confidentialité du Collège Isaac Newton",
  },

  admin: {
    title: "Portail Administratif & Direction | Collège Isaac Newton",
    description: "Espace sécurisé de gestion administrative, admissions et direction générale du Collège Isaac Newton.",
    canonicalPath: '/admin',
    ogImage: SCHOOL_IMAGES.campusRealFacade,
    ogImageAlt: "Portail Administratif Sécurisé du Collège Isaac Newton",
  }
};

/**
 * Returns dynamic SEO configuration for a specific page and optional news article ID
 */
export function getPageSEO(page: string, selectedArticleId?: string | null): PageSEO {
  if (page === 'news' && selectedArticleId) {
    const article = INITIAL_NEWS.find((a) => a.id === selectedArticleId);
    if (article) {
      return {
        title: `${article.title} | Collège Isaac Newton`,
        description: article.excerpt || "Actualité officielle du Collège Isaac Newton à Delmas 50.",
        canonicalPath: `/news?article=${article.id}`,
        ogImage: article.coverImage || SCHOOL_IMAGES.heroCampus,
        ogImageAlt: article.title,
        ogType: 'article',
        keywords: [article.category, "Collège Isaac Newton", "actualité Delmas 50", "éducation Haïti"],
        schemaData: {
          "@context": "https://schema.org",
          "@type": "NewsArticle",
          "headline": article.title,
          "description": article.excerpt,
          "image": article.coverImage,
          "datePublished": article.publishedAt,
          "author": {
            "@type": "Person",
            "name": article.authorName || SCHOOL_INFO.director
          },
          "publisher": {
            "@type": "EducationalOrganization",
            "name": SCHOOL_INFO.name,
            "url": DEFAULT_BASE_URL
          }
        }
      };
    }
  }

  return PAGE_SEO_CONFIG[page] || PAGE_SEO_CONFIG.home;
}

/**
 * Resolves a given image or canonical path to a full absolute URL for search engines and social cards
 */
export function resolveAbsoluteUrl(pathOrUrl: string): string {
  if (!pathOrUrl) {
    return `${DEFAULT_BASE_URL}/og-image.jpg`;
  }
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
    return pathOrUrl;
  }
  const origin = typeof window !== 'undefined' && window.location.origin
    ? window.location.origin
    : DEFAULT_BASE_URL;

  const cleanPath = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
  return `${origin}${cleanPath}`;
}
