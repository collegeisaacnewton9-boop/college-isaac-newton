/**
 * Cache-Busting Utility for Hero Carousel, Activity Gallery & Dynamic Media Assets
 * 
 * Ensures browsers and devices always fetch the most up-to-date images without
 * being locked into stale static browser cache, across all pages of the website.
 * 
 * Rules:
 * 1. Preserves data: and blob: URLs untouched (adding query params breaks base64 and object URLs).
 * 2. Appends unique version and timestamp query parameters (?v=...&t=...) to HTTP and relative paths.
 * 3. Safely handles URLs that already contain query parameters.
 * 4. Provides deterministic versioning based on entity attributes (version, updatedAt, id) and runtime session tokens.
 */

import { HeroSlide, GalleryItem, NewsArticle, SchoolEvent } from '../types';

export interface CacheBustOptions {
  version?: string | number;
  timestamp?: string | number;
  isProduction?: boolean;
  forceFresh?: boolean;
}

// Global session build token generated at module evaluation time
const RUNTIME_SESSION_TOKEN = typeof window !== 'undefined' 
  ? Date.now() 
  : 1790679454540;

/**
 * Adds cache-busting query parameter(s) to any image URL across the application.
 */
export function getCacheBustedImageUrl(
  url: string,
  options: CacheBustOptions = {}
): string {
  if (!url || typeof url !== 'string') {
    return '';
  }

  const trimmed = url.trim();

  // 1. Data URLs and Blob URLs must remain strictly unmodified
  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed;
  }

  try {
    const version = options.version !== undefined ? String(options.version) : undefined;
    const timestamp = options.timestamp !== undefined 
      ? String(options.timestamp) 
      : (options.forceFresh ? String(Date.now()) : String(RUNTIME_SESSION_TOKEN));

    // Construct query parameters
    const params: string[] = [];
    if (version) {
      params.push(`v=${encodeURIComponent(version)}`);
    }
    if (timestamp) {
      params.push(`t=${encodeURIComponent(timestamp)}`);
    }

    // Default fallback if no version or timestamp specified
    if (params.length === 0) {
      params.push(`v=${encodeURIComponent(String(RUNTIME_SESSION_TOKEN))}`);
    }

    // If already contains cache buster tokens with the same version or timestamp, return as-is
    if (trimmed.includes('cin_cb=') || (version && trimmed.includes(`v=${encodeURIComponent(version)}`))) {
      return trimmed;
    }

    const queryString = params.join('&');
    const hasQuery = trimmed.includes('?');
    const separator = hasQuery ? '&' : '?';

    return `${trimmed}${separator}${queryString}`;
  } catch {
    return url;
  }
}

/**
 * Specific helper for Hero Carousel slide images.
 */
export function getHeroSlideImageUrl(
  url: string,
  slide?: Partial<HeroSlide> | null,
  sessionToken?: string | number
): string {
  if (!url) return '';
  const version = slide?.version || slide?.updatedAt || (slide?.id ? `${slide.id}` : undefined);
  return getCacheBustedImageUrl(url, {
    version,
    timestamp: sessionToken || RUNTIME_SESSION_TOKEN,
    isProduction: true,
  });
}

/**
 * Specific helper for School Activity Gallery items.
 * Ensures modified or replaced images in the gallery immediately invalidate
 * local browser cache while preserving offline responsiveness.
 */
export function getGalleryImageUrl(
  url: string,
  item?: Partial<GalleryItem> | null,
  forceFresh = false
): string {
  if (!url) return '';
  const version = item?.updatedAt || (item?.id ? `${item.id}` : undefined);
  return getCacheBustedImageUrl(url, {
    version,
    forceFresh,
    timestamp: RUNTIME_SESSION_TOKEN,
  });
}

/**
 * Generic helper for News and Event cover images.
 */
export function getMediaImageUrl(
  url: string,
  entityId?: string,
  updatedAt?: string
): string {
  if (!url) return '';
  return getCacheBustedImageUrl(url, {
    version: updatedAt || entityId,
    timestamp: RUNTIME_SESSION_TOKEN,
  });
}
