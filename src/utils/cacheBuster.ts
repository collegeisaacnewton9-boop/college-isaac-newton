/**
 * Cache-Busting Utility for Hero Carousel & Dynamic Media Assets
 * 
 * Ensures the browser fetches the most recent images in production instead of stale cached versions.
 * Rules:
 * 1. Preserves data: and blob: URLs untouched (adding query params breaks base64 and object URLs).
 * 2. Appends unique version and timestamp query parameters (?v=...&t=...) to HTTP and relative paths.
 * 3. Safely handles URLs that already contain query parameters.
 * 4. Provides deterministic versioning based on slide attributes (version, updatedAt, id) and runtime session tokens.
 */

import { HeroSlide } from '../types';

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
 * Adds cache-busting query parameter(s) to an image URL.
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
    const isProd = options.isProduction ?? (typeof process !== 'undefined' && process.env?.NODE_ENV === 'production');
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

    // Check if the URL already has some or all parameters
    const queryString = params.join('&');
    const hasQuery = trimmed.includes('?');

    // If already contains cache buster tokens, avoid duplicate concatenation
    if (trimmed.includes('cin_cb=') || (version && trimmed.includes(`v=${encodeURIComponent(version)}`))) {
      return trimmed;
    }

    const separator = hasQuery ? '&' : '?';
    return `${trimmed}${separator}${queryString}`;
  } catch {
    return url;
  }
}

/**
 * Specific helper for Hero Carousel slide images.
 * Extracts version or updatedAt timestamp from the HeroSlide object,
 * guaranteeing instantaneous delivery of newly updated or added slide photos.
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
