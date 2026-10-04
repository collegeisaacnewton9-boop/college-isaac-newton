/**
 * SEO & OpenGraph Configuration Service
 * Provides route-specific meta tags, OpenGraph social share cards, and Schema.org structured data.
 */

import { INITIAL_NEWS } from '../data/mockData';

export interface PageSEO {
  title: string;
  description: string;
  keywords?: string[];
  canonicalPath: string;
  ogImage: string;
  ogImageAlt: string;
  ogType?: 'website' | 'article';
  schemaData?: Record<string, any>;
}

export function resolveAbsoluteUrl(path?: string): string {
  if (!path) return 'https://collegeisaacnewton.com';
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}${cleanPath}`;
  }
  return `https://collegeisaacnewton.com${cleanPath}`;
}

const DEFAULT_IMAGE = '/src/assets/images/campus_facade_real_1790679454540.jpg';

export function getPageSEO(page: string, selectedArticleId?: string | null): PageSEO {
  // If viewing a specific news article
  if (page === 'news' && selectedArticleId) {
    const article = INITIAL_NEWS.find(a => a.id === selectedArticleId);
    if (article) {
      return {
        title: `${article.title} | Collège Isaac Newton`,
        description: article.excerpt,
        keywords: ['collège isaac newton', 'actualité', 'delmas 50', article.category.toLowerCase()],
        canonicalPath: `/actualites/${article.slug || article.id}`,
        ogImage: article.coverImage || DEFAULT_IMAGE,
        ogImageAlt: article.title,
        ogType: 'article',
        schemaData: {
          '@context': 'https://schema.org',
          '@type': 'NewsArticle',
          headline: article.title,
          description: article.excerpt,
          image: resolveAbsoluteUrl(article.coverImage || DEFAULT_IMAGE),
          datePublished: article.publishedAt,
          author: {
            '@type': 'Organization',
            name: 'Collège Isaac Newton',
          },
        },
      };
    }
  }

  switch (page) {
    case 'about':
      return {
        title: 'Notre Établissement & Philosophie | Collège Isaac Newton - Delmas 50',
        description: 'Découvrez l’histoire, les valeurs d’excellence, de discipline et l’équipe de direction du Collège Isaac Newton à Delmas 50, Port-au-Prince.',
        keywords: ['collège isaac newton', 'direction', 'orphe jean marie', 'philosophie', 'delmas 50'],
        canonicalPath: '/a-propos',
        ogImage: DEFAULT_IMAGE,
        ogImageAlt: 'Campus principal du Collège Isaac Newton',
      };

    case 'programs':
      return {
        title: 'Programmes Scolaires & Cycles | Collège Isaac Newton',
        description: 'Cursus complet de la maternelle au Nouveau Secondaire IV, laboratoire d’informatique et enseignement scientifique renforcé.',
        keywords: ['programmes scolaires', 'fondamental', 'nouveau secondaire', 'maternelle', 'haïti'],
        canonicalPath: '/programmes',
        ogImage: '/src/assets/images/computer_lab_real_1790679476180.jpg',
        ogImageAlt: 'Laboratoire informatique du Collège Isaac Newton',
      };

    case 'admissions':
    case 'pre-registration':
      return {
        title: 'Inscriptions & Préinscription en Ligne | Collège Isaac Newton',
        description: 'Formulaire de préinscription en ligne pour l’année académique 2026-2027. Effectifs réduits et suivi personnalisé dès le préscolaire.',
        keywords: ['inscriptions', 'préinscription en ligne', 'admission scolaire', 'delmas 50', '2026-2027'],
        canonicalPath: '/admissions',
        ogImage: DEFAULT_IMAGE,
        ogImageAlt: 'Secrétariat et inscriptions du Collège Isaac Newton',
      };

    case 'events':
      return {
        title: 'Calendrier & Agenda Officiel | Collège Isaac Newton',
        description: 'Dates officielles de la rentrée scolaire, examens d’État, réunions des parents et célébrations officielles à Delmas 50.',
        keywords: ['calendrier scolaire', 'agenda', 'examens état', 'réunions parents'],
        canonicalPath: '/evenements',
        ogImage: '/src/assets/images/graduation_promo_real_1790679465649.jpg',
        ogImageAlt: 'Promotion des diplômés du Collège Isaac Newton',
      };

    case 'news':
      return {
        title: 'Actualités & Vie Scolaire | Collège Isaac Newton',
        description: 'Toute l’actualité pédagogique, les palmarès d’excellence et les annonces de la direction générale du Collège Isaac Newton.',
        keywords: ['actualités', 'journal du collège', 'palmarès', 'vie scolaire'],
        canonicalPath: '/actualites',
        ogImage: DEFAULT_IMAGE,
        ogImageAlt: 'Actualités du Collège Isaac Newton',
      };

    case 'contact':
      return {
        title: 'Contact & Localisation Campus | Collège Isaac Newton - Delmas 50',
        description: 'Contactez notre secrétariat au +509 3316-0934 / 3721-1818 ou rendez-vous à Delmas 50, rue Dominique #2 bis, Port-au-Prince.',
        keywords: ['contact', 'adresse delmas 50', 'numéro téléphone', 'secrétariat'],
        canonicalPath: '/contact',
        ogImage: DEFAULT_IMAGE,
        ogImageAlt: 'Façade du Collège Isaac Newton à Delmas 50',
      };

    case 'support':
      return {
        title: 'Soutenir le Collège & Devenir Partenaire | Collège Isaac Newton',
        description: 'Participez à la réussite scolaire des élèves du Collège Isaac Newton à Delmas 50 : parrainage de bourses, dotations pédagogiques, équipements et partenariats.',
        keywords: ['soutenir collège isaac newton', 'parrainage scolaire haiti', 'bourses scolaires delmas', 'devenir partenaire ecole', 'don education haiti'],
        canonicalPath: '/soutenir',
        ogImage: DEFAULT_IMAGE,
        ogImageAlt: 'Soutenir le Collège Isaac Newton et l’avenir des élèves',
      };

    default:
      return {
        title: 'Collège Isaac Newton | Excellence Académique & Citoyenne à Delmas 50',
        description: 'Institution scolaire privée de référence à Port-au-Prince, Haïti (Delmas 50). De la maternelle au Nouveau Secondaire, rigueur et réussite.',
        keywords: ['collège isaac newton', 'école delmas 50', 'port-au-prince', 'nouveau secondaire', 'excellence'],
        canonicalPath: '/',
        ogImage: DEFAULT_IMAGE,
        ogImageAlt: 'Façade du campus du Collège Isaac Newton',
      };
  }
}
