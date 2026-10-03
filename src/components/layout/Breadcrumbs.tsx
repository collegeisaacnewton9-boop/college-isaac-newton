import React, { useEffect } from 'react';
import { Home, ChevronRight } from 'lucide-react';
import { INITIAL_NEWS } from '../../data/mockData';

export interface BreadcrumbItem {
  label: string;
  page?: string;
  subSection?: string;
  isCurrent?: boolean;
  canonicalPath?: string;
}

interface BreadcrumbsProps {
  currentPage: string;
  currentSubSection?: string;
  selectedArticleId?: string | null;
  onNavigate: (page: string, subSection?: string) => void;
}

const BASE_URL = 'https://collegeisaacnewton.com';

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  currentPage,
  currentSubSection,
  selectedArticleId,
  onNavigate,
}) => {
  // Construct dynamic breadcrumb trail
  const items: BreadcrumbItem[] = [
    { label: 'Accueil', page: 'home', canonicalPath: '/' }
  ];

  switch (currentPage) {
    case 'college':
      items.push({ 
        label: 'Le Collège', 
        page: currentSubSection ? 'college' : undefined,
        canonicalPath: '/college' 
      });
      if (currentSubSection === 'histoire') {
        items.push({ label: 'Notre Histoire & Fondation', isCurrent: true, canonicalPath: '/college#histoire' });
      } else if (currentSubSection === 'mission') {
        items.push({ label: 'Mission & Vision Pédagogique', isCurrent: true, canonicalPath: '/college#mission' });
      } else if (currentSubSection === 'equipe') {
        items.push({ label: 'Direction & Corps Professoral', isCurrent: true, canonicalPath: '/college#equipe' });
      } else if (currentSubSection === 'infrastructures') {
        items.push({ label: 'Infrastructures & Campus', isCurrent: true, canonicalPath: '/college#infrastructures' });
      } else {
        items[items.length - 1].isCurrent = true;
      }
      break;

    case 'programs':
      items.push({ 
        label: 'Programmes Académiques', 
        page: currentSubSection ? 'programs' : undefined,
        canonicalPath: '/programs' 
      });
      if (currentSubSection === 'prescolaire') {
        items.push({ label: 'Cycle Préscolaire (TPS - GS)', isCurrent: true, canonicalPath: '/programs#prescolaire' });
      } else if (currentSubSection === 'fondamental') {
        items.push({ label: 'Cycle Fondamental (1ère - 9e AF)', isCurrent: true, canonicalPath: '/programs#fondamental' });
      } else if (currentSubSection === 'secondaire') {
        items.push({ label: 'Nouveau Secondaire (NS1 - NS4)', isCurrent: true, canonicalPath: '/programs#secondaire' });
      } else if (currentSubSection === 'numerique') {
        items.push({ label: 'Pôle Numérique & Informatique', isCurrent: true, canonicalPath: '/programs#numerique' });
      } else {
        items[items.length - 1].isCurrent = true;
      }
      break;

    case 'admissions':
      items.push({ 
        label: 'Admissions', 
        page: currentSubSection ? 'admissions' : undefined,
        canonicalPath: '/admissions' 
      });
      if (currentSubSection === 'pourquoi') {
        items.push({ label: 'Pourquoi Choisir le Collège', isCurrent: true, canonicalPath: '/admissions#pourquoi' });
      } else if (currentSubSection === 'conditions') {
        items.push({ label: 'Conditions & Pièces Requises', isCurrent: true, canonicalPath: '/admissions#conditions' });
      } else if (currentSubSection === 'procedure') {
        items.push({ label: 'Procédure & Frais de Scolarité', isCurrent: true, canonicalPath: '/admissions#procedure' });
      } else if (currentSubSection === 'faq') {
        items.push({ label: 'Questions Fréquentes (FAQ)', isCurrent: true, canonicalPath: '/admissions#faq' });
      } else {
        items[items.length - 1].isCurrent = true;
      }
      break;

    case 'pre-registration':
      items.push({ label: 'Admissions', page: 'admissions', canonicalPath: '/admissions' });
      items.push({ label: 'Préinscription en Ligne 2026-2027', isCurrent: true, canonicalPath: '/pre-registration' });
      break;

    case 'school-life':
      items.push({ 
        label: 'Vie Scolaire', 
        page: currentSubSection ? 'school-life' : undefined,
        canonicalPath: '/school-life' 
      });
      if (currentSubSection === 'activites') {
        items.push({ label: 'Clubs & Activités Périscolaires', isCurrent: true, canonicalPath: '/school-life#activites' });
      } else {
        items[items.length - 1].isCurrent = true;
      }
      break;

    case 'events':
      items.push({ label: 'Vie Scolaire', page: 'school-life', canonicalPath: '/school-life' });
      items.push({ label: 'Calendrier Scolaire & Événements Clés', isCurrent: true, canonicalPath: '/events' });
      break;

    case 'news':
      items.push({ 
        label: 'Actualités', 
        page: selectedArticleId ? 'news' : undefined,
        canonicalPath: '/news' 
      });
      if (selectedArticleId) {
        const article = INITIAL_NEWS.find((a) => a.id === selectedArticleId);
        const articleLabel = article ? article.title : 'Article';
        items.push({ label: articleLabel, isCurrent: true, canonicalPath: `/news?article=${selectedArticleId}` });
      } else {
        items[items.length - 1].isCurrent = true;
      }
      break;

    case 'gallery':
      items.push({ label: 'Vie Scolaire', page: 'school-life', canonicalPath: '/school-life' });
      items.push({ label: 'Galerie Photos du Campus', isCurrent: true, canonicalPath: '/gallery' });
      break;

    case 'resources':
      items.push({ label: 'Vie Scolaire', page: 'school-life', canonicalPath: '/school-life' });
      if (currentSubSection === 'calendrier') {
        items.push({ label: 'Ressources & Documents', page: 'resources', canonicalPath: '/resources' });
        items.push({ label: 'Calendrier Scolaire PDF', isCurrent: true, canonicalPath: '/resources#calendrier' });
      } else if (currentSubSection === 'documents') {
        items.push({ label: 'Ressources & Documents', page: 'resources', canonicalPath: '/resources' });
        items.push({ label: 'Documents Officiels', isCurrent: true, canonicalPath: '/resources#documents' });
      } else if (currentSubSection === 'resultats') {
        items.push({ label: 'Ressources & Documents', page: 'resources', canonicalPath: '/resources' });
        items.push({ label: 'Résultats & Palmarès', isCurrent: true, canonicalPath: '/resources#resultats' });
      } else {
        items.push({ label: 'Ressources & Documents', isCurrent: true, canonicalPath: '/resources' });
      }
      break;

    case 'contact':
      items.push({ label: 'Contact & Secrétariat Administratif', isCurrent: true, canonicalPath: '/contact' });
      break;

    case 'legal':
      items.push({ label: 'Mentions Légales', isCurrent: true, canonicalPath: '/legal' });
      break;

    case 'privacy':
      items.push({ label: 'Politique de Confidentialité', isCurrent: true, canonicalPath: '/privacy' });
      break;

    case 'admin':
      items.push({ label: 'Portail Administratif & Direction', isCurrent: true, canonicalPath: '/admin' });
      break;

    default:
      items.push({ label: currentPage, isCurrent: true, canonicalPath: `/${currentPage}` });
      break;
  }

  // Inject Schema.org BreadcrumbList for rich Google Search indexing
  useEffect(() => {
    // If on homepage, clean up breadcrumbs schema and return
    if (currentPage === 'home') {
      const existing = document.getElementById('cin-schema-breadcrumbs');
      if (existing) {
        existing.remove();
      }
      return;
    }

    const origin = typeof window !== 'undefined' && window.location.origin
      ? window.location.origin
      : BASE_URL;

    const schemaBreadcrumbs = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": items.map((item, idx) => ({
        "@type": "ListItem",
        "position": idx + 1,
        "name": item.label,
        "item": item.canonicalPath ? `${origin}${item.canonicalPath}` : `${origin}/`
      }))
    };

    let script = document.getElementById('cin-schema-breadcrumbs') as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = 'cin-schema-breadcrumbs';
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(schemaBreadcrumbs);

    return () => {
      // Cleanup on unmount or page change
      const existing = document.getElementById('cin-schema-breadcrumbs');
      if (existing) {
        existing.remove();
      }
    };
  }, [currentPage, currentSubSection, selectedArticleId, items]);

  // Hide breadcrumbs visual render on homepage (standard clean UX practice)
  if (currentPage === 'home') {
    return null;
  }

  return (
    <nav 
      aria-label="Fil d'Ariane (Navigation)"
      className="bg-slate-50/90 border-b border-slate-200/80 transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-2.5">
        <ol 
          itemScope 
          itemType="https://schema.org/BreadcrumbList"
          className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-slate-600 overflow-x-auto no-scrollbar whitespace-nowrap scroll-smooth"
        >
          {items.map((item, idx) => {
            const isLast = idx === items.length - 1;

            return (
              <li 
                key={idx}
                itemProp="itemListElement" 
                itemScope 
                itemType="https://schema.org/ListItem"
                className="flex items-center gap-1.5 sm:gap-2 shrink-0"
              >
                {/* Separator icon (rendered before all items except the first) */}
                {idx > 0 && (
                  <ChevronRight 
                    className="w-3.5 h-3.5 text-slate-400 shrink-0 select-none" 
                    aria-hidden="true" 
                  />
                )}

                {/* Breadcrumb Node */}
                {isLast ? (
                  <span 
                    itemProp="name"
                    aria-current="page"
                    className="font-semibold text-slate-900 truncate max-w-[180px] sm:max-w-[280px] md:max-w-none"
                    title={item.label}
                  >
                    {item.label}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      if (item.page) {
                        onNavigate(item.page, item.subSection);
                      }
                    }}
                    className={`inline-flex items-center gap-1.5 transition-colors cursor-pointer text-slate-600 hover:text-blue-900 hover:underline ${
                      idx === 0 ? 'font-medium' : ''
                    }`}
                  >
                    {idx === 0 && (
                      <Home className="w-3.5 h-3.5 text-slate-500 shrink-0" aria-hidden="true" />
                    )}
                    <span itemProp="name">{item.label}</span>
                  </button>
                )}

                <meta itemProp="position" content={String(idx + 1)} />
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
};
