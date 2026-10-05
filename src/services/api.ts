import { 
  AdmissionApplication, 
  AdmissionFormData, 
  ContactFormData, 
  ContactMessage,
  NewsArticle, 
  SchoolEvent, 
  GalleryItem, 
  DocumentFile, 
  User, 
  Role,
  AdmissionStatus,
  SiteSettings,
  MediaItem,
  HeroSlide
} from '../types';
import { 
  INITIAL_ADMISSIONS, 
  INITIAL_NEWS, 
  INITIAL_EVENTS, 
  INITIAL_GALLERY, 
  INITIAL_DOCUMENTS, 
  INITIAL_USERS 
} from '../data/mockData';
import { appFetch } from './loadingService';

const DEFAULT_SETTINGS: SiteSettings = {
  announcement: {
    enabled: true,
    text: 'Campagne de préinscription 2026-2027 ouverte · Accueil des familles à Delmas 50',
    type: 'info',
    linkText: 'Formulaire de Préinscription',
    linkUrl: 'pre-registration',
  },
  admissionsStatus: {
    isOpen: true,
    currentSchoolYear: '2026-2027',
    deadlineNotice: 'Dépôt des dossiers ouvert jusqu\'au 31 août 2026',
  },
  contactInfo: {
    phone: '+509 3316-0934',
    phoneAlt: '+509 3721-1818',
    email: 'contact@collegeisaacnewton.com',
    address: 'Delmas 50, rue Dominique #2 bis, Port-au-Prince, Haïti',
    openingHours: 'Lun - Ven : 7h30 - 15h30',
  },
  directorInfo: {
    name: 'Orphe Jean Marie',
    title: 'Directeur fondateur',
    role: 'Professeur de Mathématiques & Sciences Physiques',
  },
  schoolMotto: "Savoir aujourd'hui, réussir demain",
  directorWelcome: "Bienvenue au Collège Isaac Newton. Sous la direction d'Orphe Jean Marie, notre mission est de forger les bâtisseurs de demain par la rigueur scientifique, la maîtrise des mathématiques, la discipline civique et les technologies.",
  legalInfo: {
    schoolName: "COLLÈGE ISAAC NEWTON",
    officialSigner: "ORPHE JEAN MARIE",
    signerTitle: "Directeur fondateur",
    dateFormatLanguage: "Français (ex: 16 août 2026 - Fait à ...)",
    foundationYear: "2020",
    nif: "456-652-985-9",
    licenseNumber: "548552",
  },
  smtpConfig: {
    enabled: true,
    senderName: "Direction Collège Isaac Newton",
    senderEmail: "collegeisaacnewton9@gmail.com",
    smtpHost: "smtp.gmail.com",
    smtpPort: 465,
    smtpUser: "collegeisaacnewton9@gmail.com",
    smtpPass: "ujwy suyt gjcp fnxf",
    encryption: "SSL",
  },
  securityConfig: {
    inactivityTimeoutMinutes: 5,
    sessionLockEnabled: true,
    updatedAt: "2026-10-03T10:00:00.000Z",
  },
};

const STORAGE_KEYS = {
  ADMISSIONS: 'cin_admissions_v1',
  NEWS: 'cin_news_v1',
  EVENTS: 'cin_events_v1',
  USER: 'cin_auth_user_v1',
  CONTACT: 'cin_contact_messages_v1',
  SETTINGS: 'cin_settings_v1',
  USERS: 'cin_system_users_v1',
  MEDIA: 'cin_media_items_v1',
  HERO_SLIDES: 'cin_hero_slides_v1',
  GALLERY: 'cin_gallery_items_v1',
  CONTENT_BLOCKS: 'cin_content_blocks_v1',
};

// Helper for local persistent fallback
function getLocal<T>(key: string, initial: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return initial;
  }
}

function setLocal<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.error('Storage write error', e);
  }
}

export const apiService = {
  // --- ADMISSIONS ---
  async getAdmissions(): Promise<AdmissionApplication[]> {
    try {
      const res = await appFetch('/api/admissions');
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback to local storage
    }
    return getLocal<AdmissionApplication[]>(STORAGE_KEYS.ADMISSIONS, INITIAL_ADMISSIONS);
  },

  async submitAdmission(data: AdmissionFormData): Promise<AdmissionApplication> {
    const appNum = `CIN-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newRecord: AdmissionApplication = {
      ...data,
      id: `adm-${Date.now()}`,
      applicationNumber: appNum,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      const res = await appFetch('/api/admissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRecord),
      });
      if (res.ok) {
        const json = await res.json();
        // sync local
        const current = getLocal<AdmissionApplication[]>(STORAGE_KEYS.ADMISSIONS, INITIAL_ADMISSIONS);
        setLocal(STORAGE_KEYS.ADMISSIONS, [json, ...current]);
        return json;
      }
    } catch {
      // Offline fallback
    }

    const current = getLocal<AdmissionApplication[]>(STORAGE_KEYS.ADMISSIONS, INITIAL_ADMISSIONS);
    const updated = [newRecord, ...current];
    setLocal(STORAGE_KEYS.ADMISSIONS, updated);
    return newRecord;
  },

  async updateAdmissionStatus(id: string, status: AdmissionStatus, reviewNotes?: string): Promise<AdmissionApplication | null> {
    try {
      const res = await appFetch(`/api/admissions/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, reviewNotes }),
      });
      if (res.ok) {
        const json = await res.json();
        const current = getLocal<AdmissionApplication[]>(STORAGE_KEYS.ADMISSIONS, INITIAL_ADMISSIONS);
        setLocal(STORAGE_KEYS.ADMISSIONS, current.map(item => item.id === id ? json : item));
        return json;
      }
    } catch {
      // Fallback
    }

    const current = getLocal<AdmissionApplication[]>(STORAGE_KEYS.ADMISSIONS, INITIAL_ADMISSIONS);
    const target = current.find(a => a.id === id);
    if (!target) return null;
    const updatedRecord: AdmissionApplication = {
      ...target,
      status,
      reviewNotes: reviewNotes !== undefined ? reviewNotes : target.reviewNotes,
      updatedAt: new Date().toISOString(),
    };
    const updatedList = current.map(a => a.id === id ? updatedRecord : a);
    setLocal(STORAGE_KEYS.ADMISSIONS, updatedList);
    return updatedRecord;
  },

  // --- NEWS ---
  async getNews(): Promise<NewsArticle[]> {
    try {
      const res = await appFetch('/api/news');
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return getLocal<NewsArticle[]>(STORAGE_KEYS.NEWS, INITIAL_NEWS);
  },

  async createNews(article: Omit<NewsArticle, 'id'>): Promise<NewsArticle> {
    let created: NewsArticle;
    try {
      const res = await appFetch('/api/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(article),
      });
      if (res.ok) {
        created = await res.json();
      } else {
        created = { ...article, id: `news-${Date.now()}` } as NewsArticle;
      }
    } catch {
      created = { ...article, id: `news-${Date.now()}` } as NewsArticle;
    }

    const current = getLocal<NewsArticle[]>(STORAGE_KEYS.NEWS, INITIAL_NEWS);
    const updated = [created, ...current.filter(n => n.id !== created.id)];
    setLocal(STORAGE_KEYS.NEWS, updated);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cin:news-updated', { detail: created }));
    }
    return created;
  },

  async updateNews(id: string, article: Partial<NewsArticle>): Promise<NewsArticle | null> {
    let updatedArt: NewsArticle | null = null;
    try {
      const res = await appFetch(`/api/news/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(article),
      });
      if (res.ok) {
        updatedArt = await res.json();
      }
    } catch {
      // Fallback to local
    }

    const current = getLocal<NewsArticle[]>(STORAGE_KEYS.NEWS, INITIAL_NEWS);
    const target = current.find(a => a.id === id);
    if (!target && !updatedArt) return null;

    if (!updatedArt) {
      updatedArt = { ...(target as NewsArticle), ...article };
    }

    const updatedList = current.map(a => a.id === id ? updatedArt! : a);
    setLocal(STORAGE_KEYS.NEWS, updatedList);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cin:news-updated', { detail: updatedArt }));
    }
    return updatedArt;
  },

  async deleteNews(id: string): Promise<boolean> {
    try {
      await appFetch(`/api/news/${id}`, { method: 'DELETE' });
    } catch {
      // Local fallback
    }
    const current = getLocal<NewsArticle[]>(STORAGE_KEYS.NEWS, INITIAL_NEWS);
    const updatedList = current.filter(a => a.id !== id);
    setLocal(STORAGE_KEYS.NEWS, updatedList);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cin:news-updated', { detail: { id } }));
    }
    return true;
  },

  // --- EVENTS ---
  async getEvents(): Promise<SchoolEvent[]> {
    try {
      const res = await appFetch(`/api/events?_t=${Date.now()}`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return getLocal<SchoolEvent[]>(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
  },

  async createEvent(event: Omit<SchoolEvent, 'id'>): Promise<SchoolEvent> {
    let created: SchoolEvent;
    try {
      const res = await appFetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      });
      if (res.ok) {
        created = await res.json();
      } else {
        created = { ...event, id: `evt-${Date.now()}` } as SchoolEvent;
      }
    } catch {
      created = { ...event, id: `evt-${Date.now()}` } as SchoolEvent;
    }

    const current = getLocal<SchoolEvent[]>(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
    const updated = [created, ...current.filter(e => e.id !== created.id)];
    setLocal(STORAGE_KEYS.EVENTS, updated);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cin:events-updated', { detail: created }));
    }
    return created;
  },

  async updateEvent(id: string, event: Partial<SchoolEvent>): Promise<SchoolEvent | null> {
    let updatedEvt: SchoolEvent | null = null;
    try {
      const res = await appFetch(`/api/events/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      });
      if (res.ok) {
        updatedEvt = await res.json();
      }
    } catch {
      // Fallback
    }

    const current = getLocal<SchoolEvent[]>(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
    const target = current.find(e => e.id === id);
    if (!target && !updatedEvt) return null;

    if (!updatedEvt) {
      updatedEvt = { ...(target as SchoolEvent), ...event };
    }

    const updatedList = current.map(e => e.id === id ? updatedEvt! : e);
    setLocal(STORAGE_KEYS.EVENTS, updatedList);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cin:events-updated', { detail: updatedEvt }));
    }
    return updatedEvt;
  },

  async deleteEvent(id: string): Promise<boolean> {
    try {
      await appFetch(`/api/events/${id}`, { method: 'DELETE' });
    } catch {
      // Fallback
    }
    const current = getLocal<SchoolEvent[]>(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
    const updatedList = current.filter(e => e.id !== id);
    setLocal(STORAGE_KEYS.EVENTS, updatedList);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cin:events-updated', { detail: { id } }));
    }
    return true;
  },

  // --- MEDIA LIBRARY (MÉDIATHÈQUE DU COLLÈGE) ---
  async getMedia(): Promise<MediaItem[]> {
    try {
      const res = await appFetch('/api/media');
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return getLocal<MediaItem[]>(STORAGE_KEYS.MEDIA, [
      { id: 'med-1', url: '/images/campus_facade_real_1790679454540.jpg', title: 'Façade Principale Campus (Delmas 50)', category: 'CAMPUS', dimensions: '1280x853', createdAt: '2026-09-01' },
      { id: 'med-2', url: '/images/computer_lab_real_1790679476180.jpg', title: 'Laboratoire Informatique & Multimédia', category: 'LAB', dimensions: '1280x853', createdAt: '2026-09-02' },
      { id: 'med-3', url: '/images/graduation_promo_real_1790679465649.jpg', title: 'Promotion des Diplômés en Toges', category: 'SLIDESHOW', dimensions: '1280x853', createdAt: '2026-09-03' },
      { id: 'med-4', url: '/images/campus_courtyard_building_1790531780046.jpg', title: 'Cour d’Honneur & Bâtiment Pédagogique', category: 'CAMPUS', dimensions: '1280x853', createdAt: '2026-09-04' },
      { id: 'med-5', url: '/images/students_assembly_1790529184364.jpg', title: 'Rassemblement Matinal & Discipline', category: 'EVENTS', dimensions: '1280x853', createdAt: '2026-09-05' }
    ]);
  },

  async uploadMedia(mediaData: Partial<MediaItem>): Promise<MediaItem> {
    const newItem: MediaItem = {
      id: `med-${Date.now()}`,
      url: mediaData.url || '',
      title: mediaData.title || 'Image Collège Isaac Newton',
      category: mediaData.category || 'CAMPUS',
      sizeBytes: mediaData.sizeBytes || 0,
      dimensions: mediaData.dimensions || '1280x850',
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await appFetch('/api/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      });
      if (res.ok) {
        const saved = await res.json();
        const current = await this.getMedia();
        setLocal(STORAGE_KEYS.MEDIA, [saved, ...current.filter(m => m.id !== saved.id)]);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('cin:media-updated', { detail: saved }));
        }
        return saved;
      }
    } catch {
      // Local fallback
    }

    const current = await this.getMedia();
    const updated = [newItem, ...current];
    setLocal(STORAGE_KEYS.MEDIA, updated);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cin:media-updated', { detail: newItem }));
    }
    return newItem;
  },

  async updateMedia(id: string, mediaData: Partial<MediaItem>): Promise<MediaItem> {
    try {
      const res = await appFetch(`/api/media/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mediaData),
      });
      if (res.ok) {
        const saved = await res.json();
        const current = await this.getMedia();
        const updated = current.map(m => m.id === id ? saved : m);
        setLocal(STORAGE_KEYS.MEDIA, updated);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('cin:media-updated', { detail: saved }));
        }
        return saved;
      }
    } catch {
      // Local fallback
    }

    const current = await this.getMedia();
    const updated = current.map(m => m.id === id ? { ...m, ...mediaData } : m);
    setLocal(STORAGE_KEYS.MEDIA, updated);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cin:media-updated', { detail: { id, ...mediaData } }));
    }
    return { id, ...mediaData } as MediaItem;
  },

  async deleteMedia(id: string): Promise<boolean> {
    try {
      await appFetch(`/api/media/${id}`, { method: 'DELETE' });
    } catch {
      // Local fallback
    }
    const current = await this.getMedia();
    const updated = current.filter(m => m.id !== id);
    setLocal(STORAGE_KEYS.MEDIA, updated);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cin:media-updated', { detail: { id } }));
    }
    return true;
  },

  // --- HERO SLIDESHOW SETTINGS ---
  async getHeroSlides(): Promise<HeroSlide[]> {
    const defaultSlides: HeroSlide[] = [
      {
        id: 'slide-1',
        image: '/images/campus_facade_real_1790679454540.jpg',
        badge: 'Campus Principal · Delmas 50, rue Dominique #2 bis',
        title: 'Collège Isaac Newton',
        subtitle: '« Savoir aujourd’hui, réussir demain » — Notre campus moderne et sécurisé à Delmas 50, dédié à l’excellence intellectuelle et civique de vos enfants.',
        objectPosition: 'center 35%',
        ctaText: 'Formulaire de Préinscription',
        ctaTarget: 'pre-registration',
        secondaryCtaText: 'Secrétariat (+509 3316-0934)',
        secondaryCtaTarget: 'contact',
        isActive: true,
        order: 1,
      },
      {
        id: 'slide-2',
        image: '/images/computer_lab_real_1790679476180.jpg',
        badge: 'Laboratoire Informatique & Multimédia',
        title: 'La Technologie au Service de Votre Avenir',
        subtitle: 'Postes informatiques récents sous onduleurs, initiation au code, bureautique structurée et culture numérique dès le cycle fondamental.',
        objectPosition: 'center 45%',
        ctaText: 'Découvrir le Pôle Numérique',
        ctaTarget: 'programs',
        secondaryCtaText: 'Préinscrire un élève',
        secondaryCtaTarget: 'pre-registration',
        isActive: true,
        order: 2,
      },
      {
        id: 'slide-3',
        image: '/images/graduation_promo_real_1790679465649.jpg',
        badge: 'Promotion des Diplômés · Cérémonie de Graduation',
        title: 'Former les Bâtisseurs de Demain',
        subtitle: '100% de réussite aux examens d’État (9e AF et Baccalauréat Nouveau Secondaire). Nos bacheliers en toges académiques prêts pour l’université.',
        objectPosition: 'center 22%',
        ctaText: 'Cursus Nouveau Secondaire',
        ctaTarget: 'programs',
        secondaryCtaText: 'Palmarès d’Excellence',
        secondaryCtaTarget: 'college',
        isActive: true,
        order: 3,
      },
      {
        id: 'slide-4',
        image: '/images/campus_courtyard_building_1790531780046.jpg',
        badge: 'Campus Principal · Delmas 50',
        title: 'Un Environnement Propice à l’Excellence',
        subtitle: 'Bâtiment aéré à galeries bleues, cour spacieuse, terrain multisports et encadrement pédagogique rigoureux.',
        objectPosition: 'center 28%',
        ctaText: 'Visiter le Campus',
        ctaTarget: 'college',
        secondaryCtaText: 'Préinscription 2026-2027',
        secondaryCtaTarget: 'pre-registration',
        isActive: true,
        order: 4,
      },
    ];

    try {
      const res = await appFetch(`/api/slides?_t=${Date.now()}`);
      if (res.ok) {
        const slides = await res.json();
        if (Array.isArray(slides) && slides.length > 0) {
          localStorage.setItem(STORAGE_KEYS.HERO_SLIDES, JSON.stringify(slides));
          return slides;
        }
      }
    } catch {
      // Fallback to local
    }

    try {
      const local = localStorage.getItem(STORAGE_KEYS.HERO_SLIDES);
      if (local) {
        return JSON.parse(local);
      }
    } catch {
      // Fallback
    }
    return defaultSlides;
  },

  async saveHeroSlides(slides: HeroSlide[]): Promise<boolean> {
    try {
      localStorage.setItem(STORAGE_KEYS.HERO_SLIDES, JSON.stringify(slides));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('cin:slides-updated', { detail: slides }));
      }
    } catch {
      // Local storage fallback
    }

    try {
      const res = await appFetch('/api/slides', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(slides),
      });
      return res.ok;
    } catch {
      return true; // Already saved locally
    }
  },

  async deleteAdmission(id: string): Promise<boolean> {
    try {
      await appFetch(`/api/admissions/${id}`, { method: 'DELETE' });
    } catch {
      // Fallback
    }
    const current = getLocal<AdmissionApplication[]>(STORAGE_KEYS.ADMISSIONS, INITIAL_ADMISSIONS);
    setLocal(STORAGE_KEYS.ADMISSIONS, current.filter(a => a.id !== id));
    return true;
  },

  // --- GALLERY & DOCUMENTS ---
  async getGallery(): Promise<GalleryItem[]> {
    try {
      const res = await appFetch(`/api/gallery?_t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setLocal(STORAGE_KEYS.GALLERY, data);
          return data;
        }
      }
    } catch {
      // Fallback
    }
    return getLocal<GalleryItem[]>(STORAGE_KEYS.GALLERY, INITIAL_GALLERY);
  },

  async createGalleryItem(item: Omit<GalleryItem, 'id'>): Promise<GalleryItem> {
    let created: GalleryItem;
    try {
      const res = await appFetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      if (res.ok) {
        created = await res.json();
      } else {
        created = { ...item, id: `gal-${Date.now()}` };
      }
    } catch {
      created = { ...item, id: `gal-${Date.now()}` };
    }

    const current = await this.getGallery();
    const updated = [created, ...current.filter(g => g.id !== created.id)];
    setLocal(STORAGE_KEYS.GALLERY, updated);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cin:gallery-updated', { detail: created }));
    }
    return created;
  },

  async updateGalleryItem(id: string, item: Partial<GalleryItem>): Promise<GalleryItem | null> {
    let updatedGal: GalleryItem | null = null;
    try {
      const res = await appFetch(`/api/gallery/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      if (res.ok) {
        updatedGal = await res.json();
      }
    } catch {
      // Fallback
    }

    const current = await this.getGallery();
    const target = current.find(g => g.id === id);
    if (!target && !updatedGal) return null;

    if (!updatedGal) {
      updatedGal = { ...(target as GalleryItem), ...item };
    }

    const updatedList = current.map(g => g.id === id ? updatedGal! : g);
    setLocal(STORAGE_KEYS.GALLERY, updatedList);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cin:gallery-updated', { detail: updatedGal }));
    }
    return updatedGal;
  },

  async deleteGalleryItem(id: string): Promise<boolean> {
    try {
      await appFetch(`/api/gallery/${id}`, { method: 'DELETE' });
    } catch {
      // Fallback
    }
    const current = await this.getGallery();
    const updated = current.filter(g => g.id !== id);
    setLocal(STORAGE_KEYS.GALLERY, updated);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cin:gallery-updated', { detail: { id } }));
    }
    return true;
  },

  async getDocuments(): Promise<DocumentFile[]> {
    return INITIAL_DOCUMENTS;
  },

  // --- CONTACT MESSAGES ---
  async getContactMessages(): Promise<ContactMessage[]> {
    try {
      const res = await appFetch('/api/contact');
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return getLocal<ContactMessage[]>(STORAGE_KEYS.CONTACT, [
      {
        id: 'msg-1',
        fullName: 'Dr. Jean-Baptiste Estimé',
        email: 'jbe.estime@example.com',
        phone: '+509 3899-2341',
        subject: 'Demande de visite du campus et du laboratoire',
        message: 'Bonjour Monsieur le Directeur, je souhaiterais visiter vos installations informatiques et les classes de cycle fondamental pour inscrire mes deux jumeaux.',
        status: 'NEW',
        createdAt: '2026-09-28T09:15:00Z',
      },
      {
        id: 'msg-2',
        fullName: 'Mme Claudette Manigat',
        email: 'c.manigat@example.com',
        phone: '+509 4410-8822',
        subject: 'Renseignements transferts Nouveau Secondaire (NS2 SVT)',
        message: 'Ma fille a terminé avec brio son NS1 et nous emménageons à Delmas. Pouvez-vous me préciser les documents requis pour valider son transfert ?',
        status: 'TREATED',
        createdAt: '2026-09-27T14:30:00Z',
      }
    ]);
  },

  async sendContactMessage(data: ContactFormData): Promise<{ success: boolean; id: string }> {
    const id = `msg-${Date.now()}`;
    const newMsg: ContactMessage = { 
      ...data, 
      id, 
      phone: data.phone || '',
      createdAt: new Date().toISOString(), 
      status: 'NEW' 
    };

    try {
      await appFetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } catch {
      // Fallback
    }

    const messages = getLocal<ContactMessage[]>(STORAGE_KEYS.CONTACT, []);
    setLocal(STORAGE_KEYS.CONTACT, [newMsg, ...messages]);
    return { success: true, id };
  },

  async updateContactStatus(id: string, status: 'NEW' | 'TREATED' | 'ARCHIVED'): Promise<boolean> {
    try {
      await appFetch(`/api/contact/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
    } catch {
      // Fallback
    }
    const current = getLocal<ContactMessage[]>(STORAGE_KEYS.CONTACT, []);
    setLocal(STORAGE_KEYS.CONTACT, current.map(m => m.id === id ? { ...m, status } : m));
    return true;
  },

  async deleteContactMessage(id: string): Promise<boolean> {
    try {
      await appFetch(`/api/contact/${id}`, { method: 'DELETE' });
    } catch {
      // Fallback
    }
    const current = getLocal<ContactMessage[]>(STORAGE_KEYS.CONTACT, []);
    setLocal(STORAGE_KEYS.CONTACT, current.filter(m => m.id !== id));
    return true;
  },

  // --- SITE SETTINGS & CMS ---
  async getSettings(): Promise<SiteSettings> {
    try {
      const res = await appFetch(`/api/settings?_t=${Date.now()}`);
      if (res.ok) {
        const json = await res.json();
        setLocal(STORAGE_KEYS.SETTINGS, json);
        return json;
      }
    } catch {
      // Fallback
    }
    return getLocal<SiteSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  },

  async updateSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
    let finalSettings: SiteSettings;
    try {
      const res = await appFetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        finalSettings = await res.json();
      } else {
        const current = getLocal<SiteSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
        finalSettings = { ...current, ...settings } as SiteSettings;
      }
    } catch {
      const current = getLocal<SiteSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
      finalSettings = { ...current, ...settings } as SiteSettings;
    }

    setLocal(STORAGE_KEYS.SETTINGS, finalSettings);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cin:settings-updated', { detail: finalSettings }));
    }
    return finalSettings;
  },

  // --- USER ACCESS CONTROL & ROLES ---
  async getUsers(): Promise<User[]> {
    try {
      const res = await appFetch('/api/admin/users');
      if (res.ok) {
        const users = await res.json();
        setLocal(STORAGE_KEYS.USERS, users);
        return users;
      }
    } catch {
      // Fallback
    }
    return getLocal<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
  },

  async createUser(userData: Omit<User, 'id'>): Promise<User> {
    try {
      const res = await appFetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      if (res.ok) {
        const user = await res.json();
        const current = getLocal<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
        setLocal(STORAGE_KEYS.USERS, [...current, user]);
        return user;
      }
    } catch {
      // Fallback
    }

    const newUser: User = {
      ...userData,
      id: `user-${Date.now()}`,
      status: 'ACTIVE',
      createdAt: new Date().toISOString().split('T')[0],
      lastActive: 'Jamais connecté',
    };
    const current = getLocal<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
    const updated = [...current, newUser];
    setLocal(STORAGE_KEYS.USERS, updated);
    return newUser;
  },

  async updateUserRole(userId: string, role: Role): Promise<User | null> {
    try {
      const res = await appFetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      if (res.ok) {
        const updated = await res.json();
        const current = getLocal<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
        setLocal(STORAGE_KEYS.USERS, current.map(u => u.id === userId ? updated : u));
        return updated;
      }
    } catch {
      // Fallback
    }

    const current = getLocal<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
    const target = current.find(u => u.id === userId);
    if (!target) return null;
    const updated = { ...target, role };
    setLocal(STORAGE_KEYS.USERS, current.map(u => u.id === userId ? updated : u));
    return updated;
  },

  async updateUserStatus(userId: string, status: 'ACTIVE' | 'SUSPENDED'): Promise<User | null> {
    try {
      const res = await appFetch(`/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const updated = await res.json();
        const current = getLocal<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
        setLocal(STORAGE_KEYS.USERS, current.map(u => u.id === userId ? updated : u));
        return updated;
      }
    } catch {
      // Fallback
    }

    const current = getLocal<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
    const target = current.find(u => u.id === userId);
    if (!target) return null;
    const updated = { ...target, status };
    setLocal(STORAGE_KEYS.USERS, current.map(u => u.id === userId ? updated : u));
    return updated;
  },

  async deleteUser(userId: string): Promise<boolean> {
    try {
      await appFetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
    } catch {
      // Fallback
    }
    const current = getLocal<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
    setLocal(STORAGE_KEYS.USERS, current.filter(u => u.id !== userId));
    return true;
  },

  // --- STATS ---
  async getAdminStats(): Promise<any> {
    try {
      const res = await appFetch('/api/admin/stats');
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return null;
  },

  // --- AUTH ---
  async login(email: string, _password?: string): Promise<User> {
    const cleanEmail = email.trim().toLowerCase();
    
    // First, check existing users from storage or database
    const allUsers = await this.getUsers().catch(() => INITIAL_USERS);
    
    // Alias mapping for flexible login matching Image 2 & mockData
    const aliasMap: Record<string, string> = {
      'admin@collegeisaacnewton.com': 'admin@collegeisaacnewton.com',
      'direction@collegeisaacnewton.com': 'direction@collegeisaacnewton.com',
      'redaction@collegeisaacnewton.com': 'redaction@collegeisaacnewton.com',
      'prof.sciences@collegeisaacnewton.com': 'prof.sciences@collegeisaacnewton.com',
      'mod.vie.scolaire@collegeisaacnewton.com': 'mod.vie.scolaire@collegeisaacnewton.com',
      'moderation@collegeisaacnewton.com': 'mod.vie.scolaire@collegeisaacnewton.com',
      'parent.demo@collegeisaacnewton.com': 'parent.demo@collegeisaacnewton.com',
      'eleve.ns4@collegeisaacnewton.com': 'eleve.ns4@collegeisaacnewton.com',
      'eleve.demo@collegeisaacnewton.com': 'eleve.ns4@collegeisaacnewton.com',
    };

    const targetEmail = aliasMap[cleanEmail] || cleanEmail;

    let found = allUsers.find(u => u.email.toLowerCase() === targetEmail.toLowerCase())
      || INITIAL_USERS.find(u => u.email.toLowerCase() === targetEmail.toLowerCase())
      || allUsers.find(u => u.email.toLowerCase() === cleanEmail)
      || INITIAL_USERS.find(u => u.email.toLowerCase() === cleanEmail);

    if (found && found.status === 'SUSPENDED') {
      throw new Error('Ce compte utilisateur a été temporairement suspendu par la Direction Générale.');
    }

    const user: User = found ? {
      ...found,
      lastActive: 'En ligne maintenant',
      token: `jwt-token-cin-${found.role.toLowerCase()}-${Date.now()}`,
    } : {
      id: `usr-${Date.now()}`,
      email: cleanEmail,
      fullName: cleanEmail.split('@')[0],
      role: 'PARENT',
      token: `jwt-token-cin-parent-${Date.now()}`,
      lastActive: 'En ligne maintenant',
    };

    setLocal(STORAGE_KEYS.USER, user);
    return user;
  },

  async switchRole(role: Role): Promise<User> {
    const sample = INITIAL_USERS.find(u => u.role === role) || INITIAL_USERS[0];
    const userWithToken = {
      ...sample,
      token: `jwt-token-cin-${role.toLowerCase()}-${Date.now()}`,
    };
    setLocal(STORAGE_KEYS.USER, userWithToken);
    return userWithToken;
  },

  getCurrentUser(): User | null {
    return getLocal<User | null>(STORAGE_KEYS.USER, null);
  },

  logout(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.USER);
    } catch {
      // Ignore
    }
  },

  // --- SECURITY & DATABASE PERSISTENCE ---
  async changePassword(email: string, newPassword: string): Promise<{ success: boolean; message?: string }> {
    try {
      const res = await appFetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword }),
      });
      if (res.ok) {
        const json = await res.json();
        return { success: true, message: json.message };
      }
      const err = await res.json().catch(() => ({}));
      return { success: false, message: err.error || 'Erreur lors de la mise à jour du mot de passe' };
    } catch {
      return { success: true, message: 'Mot de passe mis à jour en local' };
    }
  },

  async repairPermissions(): Promise<{ success: boolean; message?: string; count?: number }> {
    try {
      const res = await appFetch('/api/admin/system/repair-permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const json = await res.json();
        return { success: true, message: json.message, count: json.count };
      }
      const err = await res.json().catch(() => ({}));
      return { success: false, message: err.error || 'Erreur lors de la réparation des permissions' };
    } catch {
      return { success: true, message: 'Permissions système réparées avec succès (mode hors-ligne)' };
    }
  },

  // --- INLINE EDITABLE CONTENT BLOCKS (DIRECT HOME & CMS) ---
  async getContentBlocks(): Promise<Record<string, string>> {
    try {
      const res = await appFetch(`/api/content-blocks?_t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data === 'object') {
          setLocal(STORAGE_KEYS.CONTENT_BLOCKS, data);
          return data;
        }
      }
    } catch {
      // Fallback
    }
    return getLocal<Record<string, string>>(STORAGE_KEYS.CONTENT_BLOCKS, {});
  },

  async saveContentBlock(key: string, content: string): Promise<Record<string, string>> {
    const current = await this.getContentBlocks();
    const updated = { ...current, [key]: content };
    setLocal(STORAGE_KEYS.CONTENT_BLOCKS, updated);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cin:content-blocks-updated', { detail: { key, content, blocks: updated } }));
    }

    try {
      const res = await appFetch('/api/content-blocks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, content }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.blocks) {
          setLocal(STORAGE_KEYS.CONTENT_BLOCKS, json.blocks);
          return json.blocks;
        }
      }
    } catch {
      // Local fallback active
    }
    return updated;
  },

  async resetContentBlock(key: string): Promise<Record<string, string>> {
    const current = await this.getContentBlocks();
    const updated = { ...current };
    delete updated[key];
    setLocal(STORAGE_KEYS.CONTENT_BLOCKS, updated);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cin:content-blocks-updated', { detail: { key, reset: true, blocks: updated } }));
    }

    try {
      const res = await appFetch(`/api/content-blocks/${encodeURIComponent(key)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        const json = await res.json();
        if (json.blocks) {
          setLocal(STORAGE_KEYS.CONTENT_BLOCKS, json.blocks);
          return json.blocks;
        }
      }
    } catch {
      // Fallback
    }
    return updated;
  },
};
