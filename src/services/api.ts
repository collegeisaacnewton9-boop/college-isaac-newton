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
  SiteSettings
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
};

const STORAGE_KEYS = {
  ADMISSIONS: 'cin_admissions_v1',
  NEWS: 'cin_news_v1',
  EVENTS: 'cin_events_v1',
  USER: 'cin_auth_user_v1',
  CONTACT: 'cin_contact_messages_v1',
  SETTINGS: 'cin_settings_v1',
  USERS: 'cin_system_users_v1',
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
      const res = await appFetch('/api/events');
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return getLocal<SchoolEvent[]>(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
  },

  async createEvent(event: Omit<SchoolEvent, 'id'>): Promise<SchoolEvent> {
    try {
      const res = await appFetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      });
      if (res.ok) {
        const json = await res.json();
        const current = getLocal<SchoolEvent[]>(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
        setLocal(STORAGE_KEYS.EVENTS, [json, ...current]);
        return json;
      }
    } catch {
      // Fallback
    }

    const newEvt: SchoolEvent = {
      ...event,
      id: `event-${Date.now()}`,
    };
    const current = getLocal<SchoolEvent[]>(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
    const updated = [newEvt, ...current];
    setLocal(STORAGE_KEYS.EVENTS, updated);
    return newEvt;
  },

  async updateEvent(id: string, event: Partial<SchoolEvent>): Promise<SchoolEvent | null> {
    try {
      const res = await appFetch(`/api/events/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      });
      if (res.ok) {
        const json = await res.json();
        const current = getLocal<SchoolEvent[]>(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
        setLocal(STORAGE_KEYS.EVENTS, current.map(e => e.id === id ? json : e));
        return json;
      }
    } catch {
      // Fallback
    }

    const current = getLocal<SchoolEvent[]>(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
    const target = current.find(e => e.id === id);
    if (!target) return null;
    const updatedEvt = { ...target, ...event };
    setLocal(STORAGE_KEYS.EVENTS, current.map(e => e.id === id ? updatedEvt : e));
    return updatedEvt;
  },

  async deleteEvent(id: string): Promise<boolean> {
    try {
      await appFetch(`/api/events/${id}`, { method: 'DELETE' });
    } catch {
      // Fallback
    }
    const current = getLocal<SchoolEvent[]>(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
    setLocal(STORAGE_KEYS.EVENTS, current.filter(e => e.id !== id));
    return true;
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
    return INITIAL_GALLERY;
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
  async login(email: string, _password: string): Promise<User> {
    // Find matching demo user or create a generic session
    const found = INITIAL_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
    const user: User = found || {
      id: `usr-${Date.now()}`,
      email,
      fullName: email.split('@')[0],
      role: 'PARENT',
      token: `jwt-token-${Date.now()}`,
    };
    user.token = `jwt-token-cin-${user.role.toLowerCase()}-${Date.now()}`;
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
};
