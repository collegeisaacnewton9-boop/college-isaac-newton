/**
 * Centralized Media Library Service for Collège Isaac Newton
 * Stores, indexes, categorizes and persists all school media assets.
 * Allows reusing existing server/uploaded images across all site pages
 * without re-uploading duplicate files.
 */

import { MediaItem } from '../types';
import { apiService } from './api';
import { SCHOOL_IMAGES } from '../assets/images';

export type MediaCategory = 'CAMPUS' | 'SLIDESHOW' | 'EVENTS' | 'NEWS' | 'LAB' | 'OTHER';

const STORAGE_KEY = 'cin_media_indexed';

// Seeded official high-resolution assets of Collège Isaac Newton
export const DEFAULT_MEDIA_ASSETS: MediaItem[] = [
  {
    id: 'med-campus-facade',
    url: SCHOOL_IMAGES.heroCampus,
    title: 'Façade Principale & Campus Delmas 50 (Notre Histoire & Fondation)',
    category: 'CAMPUS',
    dimensions: '1280 × 853 px',
    createdAt: '2026-09-01T08:00:00Z',
  },
  {
    id: 'med-entrance-portique',
    url: SCHOOL_IMAGES.entranceFacade,
    title: 'Portique d’Entrée Officielle & Enseigne CIN',
    category: 'CAMPUS',
    dimensions: '1280 × 720 px',
    createdAt: '2026-09-02T08:00:00Z',
  },
  {
    id: 'med-courtyard',
    url: SCHOOL_IMAGES.campusCourtyard,
    title: 'Cour d’Honneur & Espace Récréatif Sécurisé',
    category: 'CAMPUS',
    dimensions: '1280 × 853 px',
    createdAt: '2026-09-03T08:00:00Z',
  },
  {
    id: 'med-computer-lab',
    url: SCHOOL_IMAGES.computerLab,
    title: 'Laboratoire Informatique & Postes Multimédias Connectés',
    category: 'LAB',
    dimensions: '1280 × 720 px',
    createdAt: '2026-09-04T08:00:00Z',
  },
  {
    id: 'med-students-assembly',
    url: SCHOOL_IMAGES.studentsAssembly,
    title: 'Rassemblement Civique & Salut au Drapeau National',
    category: 'EVENTS',
    dimensions: '1280 × 853 px',
    createdAt: '2026-09-05T08:00:00Z',
  },
  {
    id: 'med-graduation-promo',
    url: SCHOOL_IMAGES.graduationPromo,
    title: 'Promotion des Diplômés en Toges Officielles (Cérémonie NS IV)',
    category: 'SLIDESHOW',
    dimensions: '1280 × 720 px',
    createdAt: '2026-09-06T08:00:00Z',
  },
  {
    id: 'med-slide-courtyard-facade',
    url: '/images/slide_campus_courtyard_facade.webp',
    title: 'Architecture & Galeries des Étages Supérieurs',
    category: 'CAMPUS',
    dimensions: '1280 × 720 px',
    createdAt: '2026-09-07T08:00:00Z',
  },
  {
    id: 'med-slide-kindergarten',
    url: '/images/slide_kindergarten_lemonde.webp',
    title: 'Éveil Pédagogique — Cycle Préscolaire & Maternelle',
    category: 'NEWS',
    dimensions: '1280 × 720 px',
    createdAt: '2026-09-08T08:00:00Z',
  },
  {
    id: 'med-slide-royalty',
    url: '/images/slide_royalty_elite_promo.webp',
    title: 'Promotion Royalty Elite — Cérémonie d’Excellence Académique',
    category: 'SLIDESHOW',
    dimensions: '1280 × 720 px',
    createdAt: '2026-09-09T08:00:00Z',
  },
];

class MediaLibraryService {
  private cache: MediaItem[] | null = null;

  /**
   * Get all indexed media items with optional filtering and search
   */
  async getMedia(options?: {
    category?: string;
    search?: string;
  }): Promise<MediaItem[]> {
    let items = await this.getAllItems();

    if (options?.category && options.category !== 'ALL') {
      items = items.filter(
        (item) => item.category?.toUpperCase() === options.category?.toUpperCase()
      );
    }

    if (options?.search && options.search.trim()) {
      const q = options.search.trim().toLowerCase();
      items = items.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q)
      );
    }

    return items;
  }

  /**
   * Fetches media combining remote server items and local indexed store
   */
  private async getAllItems(): Promise<MediaItem[]> {
    try {
      const serverItems = await apiService.getMedia();
      if (serverItems && Array.isArray(serverItems) && serverItems.length > 0) {
        // Merge server items with our defaults to make sure standard assets are always reachable
        const merged = this.mergeItems(serverItems, DEFAULT_MEDIA_ASSETS);
        this.cache = merged;
        return merged;
      }
    } catch {
      // Fallback to local
    }

    if (this.cache) return this.cache;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const merged = this.mergeItems(parsed, DEFAULT_MEDIA_ASSETS);
          this.cache = merged;
          return merged;
        }
      }
    } catch {}

    this.cache = DEFAULT_MEDIA_ASSETS;
    return DEFAULT_MEDIA_ASSETS;
  }

  /**
   * Registers/indexes an image into the centralized Media Library.
   * If an image with the same URL already exists, it updates metadata.
   * Otherwise, creates a new entry and saves it to the backend server.
   */
  async registerMedia(params: {
    url: string;
    title?: string;
    category?: MediaCategory;
    dimensions?: string;
    sizeBytes?: number;
    sourcePage?: string;
  }): Promise<MediaItem> {
    if (!params.url) {
      throw new Error('URL d’image requise pour enregistrement');
    }

    const currentItems = await this.getAllItems();
    const existingIndex = currentItems.findIndex((m) => m.url === params.url);

    const title = params.title?.trim() || `Image Collège — ${new Date().toLocaleDateString('fr-FR')}`;
    const category: MediaCategory = params.category || 'OTHER';

    if (existingIndex >= 0) {
      const existing = currentItems[existingIndex];
      const updated: MediaItem = {
        ...existing,
        title: params.title?.trim() || existing.title,
        category: params.category || existing.category,
        dimensions: params.dimensions || existing.dimensions,
        sizeBytes: params.sizeBytes || existing.sizeBytes,
      };

      try {
        await apiService.updateMedia(existing.id, updated);
      } catch {}

      currentItems[existingIndex] = updated;
      this.persistLocally(currentItems);
      this.broadcastUpdate();
      return updated;
    }

    // Create new media item
    const newItem: MediaItem = {
      id: `med-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      url: params.url,
      title,
      category,
      dimensions: params.dimensions || '1280 × 720 px',
      sizeBytes: params.sizeBytes,
      createdAt: new Date().toISOString(),
    };

    try {
      await apiService.uploadMedia(newItem);
    } catch {
      // Offline / fallback handled
    }

    const updatedList = [newItem, ...currentItems];
    this.persistLocally(updatedList);
    this.broadcastUpdate();
    return newItem;
  }

  /**
   * Deletes a media item from the catalog
   */
  async deleteMedia(id: string): Promise<boolean> {
    try {
      await apiService.deleteMedia(id);
    } catch {}

    const currentItems = await this.getAllItems();
    const filtered = currentItems.filter((m) => m.id !== id);
    this.persistLocally(filtered);
    this.broadcastUpdate();
    return true;
  }

  private mergeItems(primary: MediaItem[], fallback: MediaItem[]): MediaItem[] {
    const urls = new Set<string>();
    const result: MediaItem[] = [];

    for (const item of primary) {
      if (item.url && !urls.has(item.url)) {
        urls.add(item.url);
        result.push(item);
      }
    }

    for (const item of fallback) {
      if (item.url && !urls.has(item.url)) {
        urls.add(item.url);
        result.push(item);
      }
    }

    return result;
  }

  private persistLocally(items: MediaItem[]) {
    this.cache = items;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }

  private broadcastUpdate() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cin:media-updated'));
    }
  }
}

export const mediaLibraryService = new MediaLibraryService();
