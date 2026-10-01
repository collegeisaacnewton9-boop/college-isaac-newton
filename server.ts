import express, { type Request, type Response, type NextFunction } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';
import { Octokit } from '@octokit/rest';
import { exec } from 'child_process';
import util from 'util';
import { 
  initDatabase, 
  isDbActive, 
  dbGetAdmissions, 
  dbInsertAdmission, 
  dbUpdateAdmissionStatus,
  dbDeleteAdmission,
  dbGetContactMessages,
  dbInsertContactMessage,
  dbUpdateContactMessageStatus,
  dbDeleteContactMessage
} from './server-db';

const execPromise = util.promisify(exec);

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse CLI flags if provided (e.g. --port 3000 --host 0.0.0.0)
const args = process.argv.slice(2);
let portFromArg: number | undefined;
let hostFromArg: string | undefined;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--port' && args[i + 1]) {
    portFromArg = parseInt(args[i + 1], 10);
  }
  if (args[i] === '--host' && args[i + 1]) {
    hostFromArg = args[i + 1];
  }
}

const app = express();
const PORT = Number(process.env.PORT) || portFromArg || 3000;
const HOST = process.env.HOST || hostFromArg || '0.0.0.0';

process.on('uncaughtException', (err) => {
  console.error('[Uncaught Exception]', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('[Unhandled Rejection]', reason);
});

app.use(express.json());

// In-memory data storage (mirrors Prisma schema for runtime operation)
let admissions = [
  {
    id: 'adm-demo-1',
    applicationNumber: 'CIN-2026-0042',
    schoolYear: '2026-2027',
    targetLevel: '7ème Année Fondamentale',
    cycle: 'FONDAMENTAL_CYCLE_3',
    status: 'ACCEPTED',
    studentLastName: 'Pierre',
    studentFirstName: 'Alexandre',
    studentBirthDate: '2014-04-12',
    studentGender: 'M',
    previousSchool: 'École Primaire Frère André',
    parentFullName: 'Marc-Aurèle Pierre',
    parentRelationship: 'Père',
    parentPhone: '+509 3712-3456',
    parentEmail: 'm.pierre@example.com',
    parentAddress: 'Carrefour, Thor 65',
    parentOccupation: 'Comptable',
    hasBirthCert: true,
    hasReportCards: true,
    hasPassCert: true,
    hasIdPhotos: true,
    specialNotes: 'Élève très motivé par les sciences et le dessin technique.',
    consentGiven: true,
    reviewedBy: 'Direction Pédagogique',
    reviewNotes: 'Dossier académique exemplaire. Admis sans réserve.',
    createdAt: '2026-09-18T14:22:00Z',
    updatedAt: '2026-09-20T10:15:00Z',
  },
  {
    id: 'adm-demo-2',
    applicationNumber: 'CIN-2026-0089',
    schoolYear: '2026-2027',
    targetLevel: 'Nouveau Secondaire 1 (NS1)',
    cycle: 'SECONDAIRE',
    status: 'INTERVIEW_SCHEDULED',
    studentLastName: 'Auguste',
    studentFirstName: 'Sherlyne',
    studentBirthDate: '2011-09-03',
    studentGender: 'F',
    previousSchool: 'Institution Sainte-Rose de Lima',
    parentFullName: 'Marie-Yolène Auguste',
    parentRelationship: 'Mère',
    parentPhone: '+509 4821-7789',
    parentEmail: 'yolene.auguste@example.com',
    parentAddress: 'Route des Rails, Carrefour',
    parentOccupation: 'Infirmière cadre',
    hasBirthCert: true,
    hasReportCards: true,
    hasPassCert: true,
    hasIdPhotos: true,
    specialNotes: 'Intérêt pour la filière scientifique SVT.',
    consentGiven: true,
    reviewedBy: 'Comité d’Admission',
    reviewNotes: 'Convoquée pour entretien d’orientation le 24 octobre à 10h00.',
    createdAt: '2026-09-22T09:40:00Z',
    updatedAt: '2026-09-24T16:00:00Z',
  }
];

let newsArticles = [
  {
    id: 'news-1',
    slug: 'ouverture-campagne-admissions-2026-2027',
    title: 'Ouverture officielle de la campagne des admissions 2026-2027',
    excerpt: 'Les préinscriptions en ligne pour les cycles préscolaire, fondamental et secondaire sont désormais ouvertes.',
    content: 'La Direction Générale du Collège Isaac Newton informe les parents d\'élèves que les préinscriptions pour l\'année 2026-2027 sont ouvertes. Les formulaires peuvent être complétés directement sur notre portail web sécurisé ou déposés au secrétariat du campus à Delmas 50.',
    coverImage: '/src/assets/images/campus_facade_real_1790679454540.jpg',
    category: 'Admissions',
    status: 'PUBLISHED',
    featured: true,
    publishedAt: '2026-09-15',
    authorName: 'Direction Générale',
  },
  {
    id: 'news-2',
    slug: 'modernisation-laboratoire-informatique-sciences',
    title: 'Modernisation continue de notre laboratoire informatique et multimédia',
    excerpt: 'De nouveaux équipements informatiques sous onduleurs et logiciels éducatifs ont été installés.',
    content: 'Notre laboratoire informatique climatisé et sécurisé s\'est enrichi de postes récents et d\'outils d\'initiation aux sciences numériques dès le cycle fondamental, garantissant à nos élèves une solide culture technologique.',
    coverImage: '/src/assets/images/computer_lab_real_1790679476180.jpg',
    category: 'Technologie',
    status: 'PUBLISHED',
    featured: true,
    publishedAt: '2026-09-02',
    authorName: 'Pôle Technologies Éducatives',
  },
  {
    id: 'news-3',
    slug: 'celebration-reussite-examens-etat-9e-bac',
    title: 'Palmarès officiel : 100% de réussite aux examens d’État 9e AF et Baccalauréat',
    excerpt: 'Félicitations chaleureuses à l’ensemble de nos lauréats pour leurs résultats éclatants.',
    content: 'Le Collège Isaac Newton réitère sa tradition d\'excellence académique avec un taux exceptionnel de réussite aux épreuves officielles de 9e AF et du Baccalauréat Nouveau Secondaire. Bravo aux professeurs et aux familles !',
    coverImage: '/src/assets/images/graduation_promo_real_1790679465649.jpg',
    category: 'Vie Scolaire',
    status: 'PUBLISHED',
    featured: true,
    publishedAt: '2026-08-25',
    authorName: 'Direction Pédagogique',
  }
];

let schoolEvents = [
  {
    id: 'evt-1',
    title: 'Rentrée Académique Générale 2026-2027',
    description: 'Accueil de tous les élèves des cycles Préscolaire, Fondamental et Nouveau Secondaire à Delmas 50.',
    startDate: '2026-09-08T07:30:00Z',
    endDate: '2026-09-08T14:00:00Z',
    location: 'Campus Collège Isaac Newton, Delmas 50',
    category: 'Pédagogique',
    audience: 'ALL',
    isPublic: true,
  },
  {
    id: 'evt-2',
    title: 'Rencontre d’Orientation des Parents de 9ème AF & NS4',
    description: 'Présentation des objectifs d’excellence et du calendrier des épreuves officielles d’État.',
    startDate: '2026-10-10T09:00:00Z',
    endDate: '2026-10-10T12:00:00Z',
    location: 'Auditorium du Collège',
    category: 'Réunion',
    audience: 'PARENTS',
    isPublic: true,
  },
  {
    id: 'evt-3',
    title: 'Collation Solennelle des Diplômes & Cérémonie de Graduation',
    description: 'Remise des diplômes officiels aux bacheliers de la promotion sortante en toges académiques.',
    startDate: '2026-11-20T14:00:00Z',
    endDate: '2026-11-20T18:00:00Z',
    location: 'Scène Officielle du Campus',
    category: 'Culturel',
    audience: 'ALL',
    isPublic: true,
  }
];

let siteSettings = {
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
    phone: '+509 3721-1818',
    phoneAlt: '+509 3645-1212',
    email: 'contact@collegeisaacnewton.com',
    address: 'Delmas 50, Port-au-Prince, Haïti',
    openingHours: 'Lun - Ven : 7h30 - 15h30',
  },
  schoolMotto: "Savoir aujourd'hui, réussir demain",
  directorWelcome: "Bienvenue au Collège Isaac Newton. Notre mission est de forger les bâtisseurs de demain par l'exigence intellectuelle, la discipline et les technologies.",
};

let contactMessages = [
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
];

let auditLogs: Array<Record<string, any>> = [
  {
    id: 'log-1',
    action: 'SYSTEM_BOOT',
    user: 'Système Administratif',
    details: 'Initialisation du Back-Office Collège Isaac Newton',
    timestamp: new Date().toISOString(),
  }
];

let systemUsers: Array<Record<string, any>> = [
  {
    id: 'user-admin-1',
    email: 'admin@collegeisaacnewton.com',
    fullName: 'Direction Pédagogique (Admin)',
    role: 'ADMIN',
    phone: '+509 3800-0001',
    department: 'Direction Générale & Rectorat',
    status: 'ACTIVE',
    lastActive: 'En ligne maintenant',
    createdAt: '2025-08-15',
  },
  {
    id: 'user-editor-1',
    email: 'redaction@collegeisaacnewton.com',
    fullName: 'Secrétariat & Communication (Éditeur)',
    role: 'EDITOR',
    phone: '+509 3800-0002',
    department: 'Pôle Presse, Rédaction & Multimédia',
    status: 'ACTIVE',
    lastActive: 'Il y a 2 heures',
    createdAt: '2025-09-01',
  },
  {
    id: 'user-teacher-1',
    email: 'prof.sciences@collegeisaacnewton.com',
    fullName: 'Prof. Emmanuel Célestin (Enseignant SVT)',
    role: 'TEACHER',
    phone: '+509 3800-0005',
    department: 'Département des Sciences & Informatique',
    status: 'ACTIVE',
    lastActive: 'Il y a 35 minutes',
    createdAt: '2025-09-10',
  },
  {
    id: 'user-moderator-1',
    email: 'moderation@collegeisaacnewton.com',
    fullName: 'M. Lucner Bernard (Modérateur)',
    role: 'MODERATOR',
    phone: '+509 3800-0006',
    department: 'Vie Scolaire & Relations Familles',
    status: 'ACTIVE',
    lastActive: 'Il y a 10 minutes',
    createdAt: '2025-09-12',
  },
  {
    id: 'user-parent-1',
    email: 'parent.demo@collegeisaacnewton.com',
    fullName: 'Mme Marie-Claire Joseph (Parent)',
    role: 'PARENT',
    phone: '+509 3800-0003',
    department: 'Association des Parents d’Élèves (APE)',
    status: 'ACTIVE',
    lastActive: 'Hier à 16:40',
    createdAt: '2025-09-20',
  },
  {
    id: 'user-student-1',
    email: 'eleve.demo@collegeisaacnewton.com',
    fullName: 'Jean-Marc Joseph (Élève NS3)',
    role: 'STUDENT',
    phone: '+509 3800-0004',
    department: 'Nouveau Secondaire 3 (Série Scientifique)',
    status: 'ACTIVE',
    lastActive: 'Il y a 4 heures',
    createdAt: '2025-09-22',
  },
];

// Middleware logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    if (req.path.startsWith('/api')) {
      const duration = Date.now() - start;
      console.log(`[API] ${req.method} ${req.path} -> ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// --- REST API ENDPOINTS ---

// 1. Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    database: isDbActive() ? 'connected (PostgreSQL)' : 'fallback (memory)',
    institution: 'Collège Isaac Newton',
    motto: "Savoir aujourd'hui, réussir demain",
    timestamp: new Date().toISOString(),
  });
});

// 2. Auth routes
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis' });
  }

  const role = email.includes('admin') 
    ? 'ADMIN' 
    : email.includes('redaction') 
    ? 'EDITOR' 
    : email.includes('eleve') 
    ? 'STUDENT' 
    : 'PARENT';

  const user = {
    id: `usr-${Date.now()}`,
    email,
    fullName: role === 'ADMIN' ? 'Direction Pédagogique (Admin)' : email.split('@')[0],
    role,
    token: `jwt-token-cin-${role.toLowerCase()}-${Date.now()}`,
  };

  auditLogs.push({
    action: 'USER_LOGIN',
    user: user.email,
    role: user.role,
    timestamp: new Date().toISOString(),
  });

  return res.json(user);
});

// 3. Admissions routes
app.get('/api/admissions', async (req: Request, res: Response) => {
  if (isDbActive()) {
    try {
      const dbRows = await dbGetAdmissions();
      return res.json(dbRows);
    } catch (e: any) {
      console.error('[API Admissions DB Error]', e.message);
    }
  }
  res.json(admissions);
});

app.post('/api/admissions', async (req: Request, res: Response) => {
  try {
    const rawData = req.body;
    const appNum = rawData.applicationNumber || `CIN-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newRecord = {
      ...rawData,
      id: `adm-${Date.now()}`,
      applicationNumber: appNum,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (isDbActive()) {
      try {
        const saved = await dbInsertAdmission(newRecord);
        if (saved) {
          admissions.unshift(saved);
          auditLogs.push({
            action: 'ADMISSION_SUBMITTED_POSTGRES',
            applicationNumber: appNum,
            student: `${newRecord.studentFirstName} ${newRecord.studentLastName}`,
            timestamp: new Date().toISOString(),
          });
          return res.status(201).json(saved);
        }
      } catch (dbErr: any) {
        console.error('[API Admissions DB Insert Error]', dbErr.message);
      }
    }

    admissions.unshift(newRecord);
    auditLogs.push({
      action: 'ADMISSION_SUBMITTED',
      applicationNumber: appNum,
      student: `${newRecord.studentFirstName} ${newRecord.studentLastName}`,
      timestamp: new Date().toISOString(),
    });

    res.status(201).json(newRecord);
  } catch (err: any) {
    res.status(400).json({ error: 'Données de formulaire invalides', details: err.message });
  }
});

app.patch('/api/admissions/:id/status', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, reviewNotes } = req.body;

  if (isDbActive()) {
    try {
      const updated = await dbUpdateAdmissionStatus(id, status, reviewNotes, 'Direction Pédagogique');
      if (updated) {
        const targetIndex = admissions.findIndex(a => a.id === id);
        if (targetIndex !== -1) {
          admissions[targetIndex] = { ...admissions[targetIndex], ...updated };
        }
        auditLogs.push({
          action: 'ADMISSION_STATUS_UPDATED_POSTGRES',
          admissionId: id,
          newStatus: status,
          timestamp: new Date().toISOString(),
        });
        return res.json(updated);
      }
    } catch (e: any) {
      console.error('[API Admissions DB Update Error]', e.message);
    }
  }

  const targetIndex = admissions.findIndex(a => a.id === id);
  if (targetIndex === -1) {
    return res.status(404).json({ error: 'Dossier introuvable' });
  }

  admissions[targetIndex] = {
    ...admissions[targetIndex],
    status,
    reviewNotes: reviewNotes !== undefined ? reviewNotes : admissions[targetIndex].reviewNotes,
    updatedAt: new Date().toISOString(),
  };

  auditLogs.push({
    action: 'ADMISSION_STATUS_UPDATED',
    admissionId: id,
    newStatus: status,
    timestamp: new Date().toISOString(),
  });

  res.json(admissions[targetIndex]);
});

// 4. News routes
app.get('/api/news', (req: Request, res: Response) => {
  res.json(newsArticles);
});

app.post('/api/news', (req: Request, res: Response) => {
  const newArt = {
    ...req.body,
    id: `news-${Date.now()}`,
    slug: req.body.slug || `article-${Date.now()}`,
    publishedAt: req.body.publishedAt || new Date().toISOString().split('T')[0],
  };
  newsArticles.unshift(newArt);
  auditLogs.push({
    id: `log-${Date.now()}`,
    action: 'NEWS_CREATED',
    user: 'Direction / Rédaction',
    details: `Publication de l'article : ${newArt.title}`,
    timestamp: new Date().toISOString(),
  });
  res.status(201).json(newArt);
});

app.put('/api/news/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = newsArticles.findIndex(a => a.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Article introuvable' });
  }
  newsArticles[index] = {
    ...newsArticles[index],
    ...req.body,
  };
  auditLogs.push({
    id: `log-${Date.now()}`,
    action: 'NEWS_UPDATED',
    user: 'Direction / Rédaction',
    details: `Mise à jour de l'article : ${newsArticles[index].title}`,
    timestamp: new Date().toISOString(),
  });
  res.json(newsArticles[index]);
});

app.delete('/api/news/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  newsArticles = newsArticles.filter(a => a.id !== id);
  auditLogs.push({
    id: `log-${Date.now()}`,
    action: 'NEWS_DELETED',
    user: 'Direction / Rédaction',
    details: `Suppression de l'article ID : ${id}`,
    timestamp: new Date().toISOString(),
  });
  res.json({ success: true });
});

// 5. School Events routes
app.get('/api/events', (req: Request, res: Response) => {
  res.json(schoolEvents);
});

app.post('/api/events', (req: Request, res: Response) => {
  const newEvt = {
    ...req.body,
    id: `evt-${Date.now()}`,
  };
  schoolEvents.unshift(newEvt);
  auditLogs.push({
    id: `log-${Date.now()}`,
    action: 'EVENT_CREATED',
    user: 'Direction Pédagogique',
    details: `Création de l'événement : ${newEvt.title}`,
    timestamp: new Date().toISOString(),
  });
  res.status(201).json(newEvt);
});

app.put('/api/events/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = schoolEvents.findIndex(e => e.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Événement introuvable' });
  }
  schoolEvents[idx] = {
    ...schoolEvents[idx],
    ...req.body,
  };
  auditLogs.push({
    id: `log-${Date.now()}`,
    action: 'EVENT_UPDATED',
    user: 'Direction Pédagogique',
    details: `Mise à jour de l'événement : ${schoolEvents[idx].title}`,
    timestamp: new Date().toISOString(),
  });
  res.json(schoolEvents[idx]);
});

app.delete('/api/events/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  schoolEvents = schoolEvents.filter(e => e.id !== id);
  auditLogs.push({
    id: `log-${Date.now()}`,
    action: 'EVENT_DELETED',
    user: 'Direction Pédagogique',
    details: `Suppression de l'événement ID : ${id}`,
    timestamp: new Date().toISOString(),
  });
  res.json({ success: true });
});

// 6. Contact & Secretarial Messages routes
app.get('/api/contact', async (req: Request, res: Response) => {
  if (isDbActive()) {
    try {
      const dbMessages = await dbGetContactMessages();
      return res.json(dbMessages);
    } catch (e: any) {
      console.error('[API Contact DB Error]', e.message);
    }
  }
  res.json(contactMessages);
});

app.post('/api/contact', async (req: Request, res: Response) => {
  const { fullName, email, phone, subject, message } = req.body;
  if (!fullName || !email || !message) {
    return res.status(400).json({ error: 'Champs obligatoires manquants' });
  }

  const newMsg = {
    id: `msg-${Date.now()}`,
    fullName,
    email,
    phone: phone || '',
    subject,
    message,
    status: 'NEW',
    createdAt: new Date().toISOString(),
  };

  if (isDbActive()) {
    try {
      const saved = await dbInsertContactMessage(newMsg);
      if (saved) {
        contactMessages.unshift(saved);
        auditLogs.push({
          id: `log-${Date.now()}`,
          action: 'CONTACT_RECEIVED_POSTGRES',
          user: 'Portail Visiteur',
          details: `Nouveau message enregistré en base PostgreSQL de : ${fullName}`,
          timestamp: new Date().toISOString(),
        });
        return res.json({ success: true, message: 'Message reçu et enregistré en base de données.', data: saved });
      }
    } catch (dbErr: any) {
      console.error('[API Contact DB Insert Error]', dbErr.message);
    }
  }

  contactMessages.unshift(newMsg);
  auditLogs.push({
    id: `log-${Date.now()}`,
    action: 'CONTACT_RECEIVED',
    user: 'Portail Visiteur',
    details: `Nouveau message reçu de : ${fullName}`,
    timestamp: new Date().toISOString(),
  });
  res.json({ success: true, message: 'Message reçu par le secrétariat du Collège Isaac Newton.' });
});

app.patch('/api/contact/:id/status', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  if (isDbActive()) {
    try {
      const updated = await dbUpdateContactMessageStatus(id, status);
      if (updated) {
        const target = contactMessages.find(m => m.id === id);
        if (target) target.status = status;
        return res.json(updated);
      }
    } catch (e: any) {
      console.error('[API Contact DB Update Error]', e.message);
    }
  }

  const target = contactMessages.find(m => m.id === id);
  if (!target) {
    return res.status(404).json({ error: 'Message introuvable' });
  }
  target.status = status;
  res.json(target);
});

app.delete('/api/contact/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  if (isDbActive()) {
    try {
      await dbDeleteContactMessage(id);
    } catch (e: any) {
      console.error('[API Contact DB Delete Error]', e.message);
    }
  }
  contactMessages = contactMessages.filter(m => m.id !== id);
  res.json({ success: true });
});

// 7. Site Settings & Page CMS
app.get('/api/settings', (req: Request, res: Response) => {
  res.json(siteSettings);
});

app.put('/api/settings', (req: Request, res: Response) => {
  siteSettings = {
    ...siteSettings,
    ...req.body,
  };
  auditLogs.push({
    id: `log-${Date.now()}`,
    action: 'SETTINGS_UPDATED',
    user: 'Direction Générale (Admin)',
    details: 'Mise à jour des paramètres généraux du Collège et annonces du site',
    timestamp: new Date().toISOString(),
  });
  res.json(siteSettings);
});

// 8. Delete admission
app.delete('/api/admissions/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  if (isDbActive()) {
    try {
      await dbDeleteAdmission(id);
    } catch (e: any) {
      console.error('[API Admissions DB Delete Error]', e.message);
    }
  }
  admissions = admissions.filter(a => a.id !== id);
  auditLogs.push({
    id: `log-${Date.now()}`,
    action: 'ADMISSION_DELETED',
    user: 'Comité d’Admission',
    details: `Suppression du dossier ID : ${id}`,
    timestamp: new Date().toISOString(),
  });
  res.json({ success: true });
});

// 9. Executive Dashboard Stats
app.get('/api/admin/stats', (req: Request, res: Response) => {
  const totalAdmissions = admissions.length;
  const pending = admissions.filter(a => a.status === 'PENDING').length;
  const accepted = admissions.filter(a => a.status === 'ACCEPTED').length;
  const interview = admissions.filter(a => a.status === 'INTERVIEW_SCHEDULED').length;
  const underReview = admissions.filter(a => a.status === 'UNDER_REVIEW').length;
  const rejected = admissions.filter(a => a.status === 'REJECTED').length;
  const unreadMessages = contactMessages.filter(m => m.status === 'NEW').length;

  res.json({
    admissions: {
      total: totalAdmissions,
      pending,
      accepted,
      interview,
      underReview,
      rejected,
      byCycle: {
        prescolaire: admissions.filter(a => a.cycle === 'PRESCOLAIRE').length,
        fondamental: admissions.filter(a => a.cycle.startsWith('FONDAMENTAL')).length,
        secondaire: admissions.filter(a => a.cycle === 'SECONDAIRE').length,
      }
    },
    publications: {
      totalNews: newsArticles.length,
      publishedNews: newsArticles.filter(n => n.status === 'PUBLISHED').length,
      totalEvents: schoolEvents.length,
    },
    messages: {
      total: contactMessages.length,
      unread: unreadMessages,
    },
    system: {
      schoolYear: siteSettings.admissionsStatus.currentSchoolYear,
      admissionsOpen: siteSettings.admissionsStatus.isOpen,
      announcementActive: siteSettings.announcement.enabled,
    }
  });
});

// 10. GitHub Synchronization via Octokit REST API
app.post('/api/admin/github/sync', async (req: Request, res: Response) => {
  const { token, owner, repo, branch, message } = req.body;
  if (!token) {
    return res.status(400).json({ error: 'Token d\'accès personnel GitHub requis' });
  }

  const targetOwner = owner || 'collegeisaacnewton9-boop';
  const targetRepo = repo || 'college-isaac-newton';
  const targetBranch = branch || 'main';
  const commitMsg = message || `Mise à jour automatique des sources - ${new Date().toLocaleString('fr-FR')}`;

  try {
    // 1. Verify with Octokit REST API
    const octokit = new Octokit({ auth: token });
    const { data: repoInfo } = await octokit.rest.repos.get({
      owner: targetOwner,
      repo: targetRepo,
    });

    // 2. Stage all changes and commit
    const safeCommitMsg = commitMsg.replace(/"/g, '\\"');
    await execPromise('git add .');

    try {
      await execPromise(`git commit -m "${safeCommitMsg}"`);
    } catch {
      // If working tree clean, continue to push
    }

    // 3. Push to GitHub repository using authenticated token
    const pushUrl = `https://${targetOwner}:${token}@github.com/${targetOwner}/${targetRepo}.git`;

    // Fetch and reconcile remote branch first to prevent fast-forward rejection
    try {
      await execPromise(`git fetch ${pushUrl} ${targetBranch}`);
      await execPromise(`git merge FETCH_HEAD -m "merge: synchronisation des sources" --strategy-option=ours --allow-unrelated-histories`);
    } catch (reconcileErr: any) {
      console.warn('[GitHub Sync Reconcile Notice]', reconcileErr.message);
    }

    try {
      await execPromise(`git push ${pushUrl} ${targetBranch}`);
    } catch (pushErr: any) {
      console.warn('[GitHub Sync Push Retry with --force]', pushErr.message);
      await execPromise(`git push --force ${pushUrl} ${targetBranch}`);
    }

    // 4. Retrieve latest commit SHA via Octokit
    let latestCommitSha = 'main';
    try {
      const { data: commits } = await octokit.rest.repos.listCommits({
        owner: targetOwner,
        repo: targetRepo,
        sha: targetBranch,
        per_page: 1,
      });
      if (commits && commits.length > 0) {
        latestCommitSha = commits[0].sha.substring(0, 7);
      }
    } catch {
      // Non-blocking
    }

    auditLogs.push({
      id: `log-${Date.now()}`,
      action: 'GITHUB_SYNC',
      user: 'Direction (Admin)',
      details: `Synchronisation GitHub réussie vers ${repoInfo.full_name} (${latestCommitSha}) via Octokit REST API`,
      timestamp: new Date().toISOString(),
    });

    res.json({
      success: true,
      commitSha: latestCommitSha,
      repo: repoInfo.full_name,
      message: `Fichiers sources synchronisés avec succès sur ${repoInfo.full_name} (${latestCommitSha})`,
    });
  } catch (error: any) {
    console.error('[GitHub Sync Error]', error);
    res.status(500).json({
      error: error.message || 'Erreur lors de la synchronisation avec GitHub',
    });
  }
});

// 11. Access Control & User Roles Management
app.get('/api/admin/users', (req: Request, res: Response) => {
  res.json(systemUsers);
});

app.post('/api/admin/users', (req: Request, res: Response) => {
  const { email, fullName, role, phone, department } = req.body;
  if (!email || !fullName || !role) {
    return res.status(400).json({ error: 'Nom, e-mail et rôle requis' });
  }

  const existing = systemUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'Un compte avec cette adresse e-mail existe déjà' });
  }

  const newUser = {
    id: `user-${Date.now()}`,
    email,
    fullName,
    role,
    phone: phone || '',
    department: department || 'Non spécifié',
    status: 'ACTIVE',
    lastActive: 'Jamais connecté',
    createdAt: new Date().toISOString().split('T')[0],
  };

  systemUsers.push(newUser);
  auditLogs.push({
    id: `log-${Date.now()}`,
    action: 'USER_CREATED',
    user: 'Direction (Super-Admin)',
    details: `Création du compte : ${fullName} (${email}) avec le rôle ${role}`,
    timestamp: new Date().toISOString(),
  });

  res.status(201).json(newUser);
});

app.patch('/api/admin/users/:id/role', (req: Request, res: Response) => {
  const { id } = req.params;
  const { role } = req.body;
  if (!role) {
    return res.status(400).json({ error: 'Rôle manquant' });
  }

  const user = systemUsers.find(u => u.id === id);
  if (!user) {
    return res.status(404).json({ error: 'Utilisateur introuvable' });
  }

  const oldRole = user.role;
  user.role = role;

  auditLogs.push({
    id: `log-${Date.now()}`,
    action: 'ROLE_ASSIGNED',
    user: 'Direction (Super-Admin)',
    details: `Attribution de rôle pour ${user.fullName} : ${oldRole} -> ${role}`,
    timestamp: new Date().toISOString(),
  });

  res.json(user);
});

app.patch('/api/admin/users/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const user = systemUsers.find(u => u.id === id);
  if (!user) {
    return res.status(404).json({ error: 'Utilisateur introuvable' });
  }
  user.status = status;
  auditLogs.push({
    id: `log-${Date.now()}`,
    action: 'USER_STATUS_UPDATED',
    user: 'Direction (Super-Admin)',
    details: `Statut du compte ${user.fullName} modifié : ${status}`,
    timestamp: new Date().toISOString(),
  });
  res.json(user);
});

app.delete('/api/admin/users/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const user = systemUsers.find(u => u.id === id);
  if (!user) {
    return res.status(404).json({ error: 'Utilisateur introuvable' });
  }
  if (user.role === 'ADMIN' && systemUsers.filter(u => u.role === 'ADMIN').length <= 1) {
    return res.status(400).json({ error: 'Impossible de supprimer le dernier super-administrateur' });
  }
  systemUsers = systemUsers.filter(u => u.id !== id);
  auditLogs.push({
    id: `log-${Date.now()}`,
    action: 'USER_DELETED',
    user: 'Direction (Super-Admin)',
    details: `Suppression du compte : ${user.fullName} (${user.email})`,
    timestamp: new Date().toISOString(),
  });
  res.json({ success: true });
});

// 12. Audit & System
app.get('/api/audit', (req: Request, res: Response) => {
  res.json(auditLogs);
});

// Global error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[Error]', err);
  res.status(500).json({ error: 'Erreur interne du serveur', message: err.message });
});

// Dev / Prod Vite mounting
async function startServer() {
  // Initialize PostgreSQL database connection and tables if DATABASE_URL is present
  try {
    const initialized = await initDatabase();
    if (initialized) {
      console.log('[Database] Synchronisation initiale des tables en cours...');
      const dbAdmissions = await dbGetAdmissions();
      if (dbAdmissions.length > 0) {
        admissions = dbAdmissions;
        console.log(`[Database] ${dbAdmissions.length} dossiers d'admissions chargés depuis PostgreSQL.`);
      }
      const dbMessages = await dbGetContactMessages();
      if (dbMessages.length > 0) {
        contactMessages = dbMessages;
        console.log(`[Database] ${dbMessages.length} messages de contact chargés depuis PostgreSQL.`);
      }
    }
  } catch (err: any) {
    console.error('[Database Startup Error]', err.message);
  }

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    // In dev, integrate Vite middlewares
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, HOST, () => {
    console.log(`[Server] Collège Isaac Newton API & Web running on http://${HOST}:${PORT}`);
  });
}

startServer();
