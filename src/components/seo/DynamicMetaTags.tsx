import React, { useEffect } from 'react';
import { getPageSEO, resolveAbsoluteUrl } from '../../services/seoConfig';

interface DynamicMetaTagsProps {
  currentPage: string;
  selectedArticleId?: string | null;
}

/**
 * Dynamically updates document title, canonical link, OpenGraph tags,
 * Twitter card tags, and Schema.org structured data on route changes.
 */
export const DynamicMetaTags: React.FC<DynamicMetaTagsProps> = ({
  currentPage,
  selectedArticleId,
}) => {
  useEffect(() => {
    const seo = getPageSEO(currentPage, selectedArticleId);

    // 1. Update Document Title
    document.title = seo.title;

    // Helper to set or create meta tag by name attribute
    const setMetaByName = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('name', name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    // Helper to set or create meta tag by property attribute (OpenGraph)
    const setMetaByProperty = (property: string, content: string) => {
      let el = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('property', property);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    // Helper to set or create canonical link
    const setCanonicalLink = (url: string) => {
      let el = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!el) {
        el = document.createElement('link');
        el.setAttribute('rel', 'canonical');
        document.head.appendChild(el);
      }
      el.setAttribute('href', url);
    };

    // Resolve absolute canonical & OpenGraph URLs
    const canonicalUrl = resolveAbsoluteUrl(seo.canonicalPath);
    const ogImageUrl = resolveAbsoluteUrl(seo.ogImage);

    // 2. Standard Search Meta Tags
    setMetaByName('description', seo.description);
    if (seo.keywords && seo.keywords.length > 0) {
      setMetaByName('keywords', seo.keywords.join(', '));
    }
    setCanonicalLink(canonicalUrl);

    // 3. OpenGraph Social Share Card Tags
    setMetaByProperty('og:title', seo.title);
    setMetaByProperty('og:description', seo.description);
    setMetaByProperty('og:url', canonicalUrl);
    setMetaByProperty('og:image', ogImageUrl);
    setMetaByProperty('og:image:alt', seo.ogImageAlt);
    setMetaByProperty('og:image:width', '1200');
    setMetaByProperty('og:image:height', '630');
    setMetaByProperty('og:type', seo.ogType || 'website');
    setMetaByProperty('og:site_name', 'Collège Isaac Newton');
    setMetaByProperty('og:locale', 'fr_FR');

    // 4. Twitter / X Large Summary Card Tags
    setMetaByName('twitter:card', 'summary_large_image');
    setMetaByName('twitter:title', seo.title);
    setMetaByName('twitter:description', seo.description);
    setMetaByName('twitter:image', ogImageUrl);
    setMetaByName('twitter:image:alt', seo.ogImageAlt);

    // 5. Dynamic Page-Specific Schema.org JSON-LD Structured Data
    if (seo.schemaData) {
      let script = document.getElementById('cin-dynamic-page-ldjson') as HTMLScriptElement | null;
      if (!script) {
        script = document.createElement('script');
        script.id = 'cin-dynamic-page-ldjson';
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(seo.schemaData);
    } else {
      const existingScript = document.getElementById('cin-dynamic-page-ldjson');
      if (existingScript) {
        existingScript.remove();
      }
    }
  }, [currentPage, selectedArticleId]);

  return null;
};
