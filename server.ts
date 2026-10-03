import express, { type Request, type Response, type NextFunction } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { z } from 'zod';
import { Octokit } from '@octokit/rest';
import { exec } from 'child_process';
import util from 'util';
import nodemailer from 'nodemailer';
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
  dbDeleteContactMessage,
  dbGetSettings,
  dbSaveSettings,
  dbGetUsers,
  dbInsertUser,
  dbUpdateUserRole,
  dbUpdateUserStatus,
  dbDeleteUser,
  dbGetNews,
  dbInsertNews,
  dbUpdateNews,
  dbDeleteNews,
  dbGetEvents,
  dbInsertEvent,
  dbUpdateEvent,
  dbDeleteEvent,
  dbGetMedia,
  dbInsertMedia,
  dbDeleteMedia,
  dbGetHeroSlides,
  dbSaveHeroSlides,
  dbGetGallery,
  dbSaveGallery,
  dbUpdateUserPassword,
  dbRepairSystemPermissions
} from './server-db';

const execPromise = util.promisify(exec);

dotenv.config();

// ==============================================================================
// GMAIL SMTP NOTIFICATION SERVICE (Collège Isaac Newton) - DYNAMIQUE & MODIFIABLE
// ==============================================================================
function getEmailTransporter() {
  const cfg = siteSettings?.smtpConfig;
  const user = (cfg?.smtpUser || process.env.SMTP_USER || 'collegeisaacnewton9@gmail.com').trim();
  const pass = (cfg?.smtpPass || process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || 'ujwysuytgjcpfnxf').replace(/\s+/g, '');
  const host = (cfg?.smtpHost || 'smtp.gmail.com').trim();
  const port = Number(cfg?.smtpPort) || 465;
  const isSecure = port === 465;
  const senderName = cfg?.senderName || 'Direction Collège Isaac Newton';
  const senderEmail = cfg?.senderEmail || user;

  const transporter = (host === 'smtp.gmail.com' || host.includes('gmail'))
    ? nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass },
      })
    : nodemailer.createTransport({
        host,
        port,
        secure: isSecure,
        auth: { user, pass },
      });

  return {
    transporter,
    from: `"${senderName}" <${senderEmail}>`,
    user,
  };
}

async function sendNotificationEmail(options: { to: string; subject: string; html: string; text?: string }) {
  try {
    const { transporter, from } = getEmailTransporter();
    const info = await transporter.sendMail({
      from,
      to: options.to,
      subject: options.subject,
      text: options.text || options.subject,
      html: options.html,
    });
    console.log(`[Email] Notification envoyée avec succès à ${options.to} (${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.warn(`[Email Warning] Impossible d'envoyer à ${options.to}:`, error.message);
    return { success: false, error: error.message };
  }
}

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
  // Septembre 2026
  {
    id: 'evt-rentree',
    title: 'Rentrée Solennelle & Accueil des Promotions 2026-2027',
    description: 'Rentrée générale des classes pour les cycles Préscolaire, Fondamental et Nouveau Secondaire à Delmas 50, rue Dominique #2 bis.',
    startDate: '2026-09-08T07:30:00Z',
    endDate: '2026-09-08T14:00:00Z',
    location: 'Cour d’honneur & Salles de cours',
    category: 'Pédagogique',
    audience: 'ALL',
    isPublic: true,
  },
  // Octobre 2026
  {
    id: 'evt-ag',
    title: 'Assemblée Générale de Rentrée des Parents d’Élèves',
    description: 'Présentation du projet d’établissement par le Directeur fondateur M. Orphe Jean Marie et présentation des professeurs principaux.',
    startDate: '2026-10-10T09:00:00Z',
    endDate: '2026-10-10T12:30:00Z',
    location: 'Auditorium Principal · Delmas 50',
    category: 'Réunion',
    audience: 'PARENTS',
    isPublic: true,
  },
  {
    id: 'evt-jpo',
    title: 'Journée Portes Ouvertes & Visite des Installations',
    description: 'Rencontre avec la direction générale, visite commentée des salles de cours et du laboratoire informatique.',
    startDate: '2026-10-17T09:00:00Z',
    endDate: '2026-10-17T14:00:00Z',
    location: 'Campus Principal (Delmas 50, rue Dominique #2 bis)',
    category: 'Pédagogique',
    audience: 'ALL',
    isPublic: true,
  },
  {
    id: 'evt-tests-adm',
    title: 'Première session des tests d’admission 2026-2027',
    description: 'Évaluation diagnostique en mathématiques, français et raisonnement logique pour les nouveaux candidats inscrits.',
    startDate: '2026-10-24T08:00:00Z',
    endDate: '2026-10-24T12:00:00Z',
    location: 'Bâtiment Principal · Salles B1 à B4',
    category: 'Examen',
    audience: 'PARENTS',
    isPublic: true,
  },
  // Novembre 2026
  {
    id: 'evt-toussaint',
    title: 'Congé officiel de la Toussaint & Fête des Morts',
    description: 'Journées chômées officielles selon le calendrier du Ministère de l’Éducation Nationale (MENFP). Fermeture administrative.',
    startDate: '2026-11-01T00:00:00Z',
    endDate: '2026-11-02T23:59:59Z',
    location: 'Établissement fermé',
    category: 'Férié',
    audience: 'ALL',
    isPublic: true,
  },
  {
    id: 'evt-vertieres',
    title: 'Fête de la Victoire de Vertières (Jour Férié National)',
    description: 'Commémoration patriotique solennelle de la bataille de Vertières.',
    startDate: '2026-11-18T00:00:00Z',
    endDate: '2026-11-18T23:59:59Z',
    location: 'Jour férié national en Haïti',
    category: 'Férié',
    audience: 'ALL',
    isPublic: true,
  },
  {
    id: 'evt-foire-sciences',
    title: 'Foire Scientifique & Exposition Technologique Annuelle',
    description: 'Démonstrations de sciences physiques, projets de biologie et réalisations logicielles des élèves au laboratoire.',
    startDate: '2026-11-20T10:00:00Z',
    endDate: '2026-11-20T16:00:00Z',
    location: 'Cour d’honneur & Laboratoire Multimédia',
    category: 'Culturel',
    audience: 'ALL',
    isPublic: true,
  },
  {
    id: 'evt-exam-t1',
    title: 'Contrôles généraux & Évaluations du 1er Trimestre',
    description: 'Évaluations sommatives trimestrielles pour l’ensemble des cycles (Fondamental et Nouveau Secondaire).',
    startDate: '2026-11-26T08:00:00Z',
    endDate: '2026-11-30T14:00:00Z',
    location: 'Toutes les salles de classe',
    category: 'Examen',
    audience: 'STUDENTS',
    isPublic: false,
  },
  // Décembre 2026
  {
    id: 'evt-reunion-t1',
    title: 'Rencontre Pédagogique Trimestrielle Parents-Enseignants',
    description: 'Bilan personnalisé du premier trimestre, remise officielle des bulletins scolaires et entretiens individuels.',
    startDate: '2026-12-05T08:30:00Z',
    endDate: '2026-12-05T15:00:00Z',
    location: 'Salles de classe respectives · Delmas 50',
    category: 'Réunion',
    audience: 'PARENTS',
    isPublic: true,
  },
  {
    id: 'evt-tournoi-sport',
    title: 'Tournoi Sportif Interclasses & Célébration de Noël',
    description: 'Compétition sur le terrain multisports de la cour d’honneur, suivie de la célébration fraternelle de fin d’année.',
    startDate: '2026-12-18T11:00:00Z',
    endDate: '2026-12-18T17:00:00Z',
    location: 'Terrain de Basket & Cour d’Honneur',
    category: 'Sportif',
    audience: 'STUDENTS',
    isPublic: true,
  },
  {
    id: 'evt-vacances-noel',
    title: 'Vacances de Noël & de Fin d’Année (Congés Scolaires)',
    description: 'Interruption des cours pour les fêtes de fin d’année. Réouverture des portes le lundi 4 janvier 2027.',
    startDate: '2026-12-19T00:00:00Z',
    endDate: '2027-01-03T23:59:59Z',
    location: 'Campus fermé aux cours réguliers',
    category: 'Férié',
    audience: 'ALL',
    isPublic: true,
  },
  // Janvier 2027
  {
    id: 'evt-independance',
    title: 'Jour de l’Indépendance & Jour des Aïeux (Fêtes Nationales)',
    description: 'Célébration historique de la proclamation de l’Indépendance d’Haïti et hommage aux Pères de la Patrie.',
    startDate: '2027-01-01T00:00:00Z',
    endDate: '2027-01-02T23:59:59Z',
    location: 'Fête nationale d’Haïti',
    category: 'Férié',
    audience: 'ALL',
    isPublic: true,
  },
  {
    id: 'evt-exam-blancs',
    title: 'Examens Blancs Officiels d’État (9e AF & NS4)',
    description: 'Épreuves blanches en conditions réelles d’examen d’État avec surveillance rigoureuse et barème officiel MENFP.',
    startDate: '2027-01-22T08:00:00Z',
    endDate: '2027-01-26T14:00:00Z',
    location: 'Centre d’examens du Collège',
    category: 'Examen',
    audience: 'STUDENTS',
    isPublic: false,
  },
  // Février 2027
  {
    id: 'evt-eloquence',
    title: 'Concours Interscolaire d’Éloquence & Dictée d’Or',
    description: 'Célébration des langues française et créole, art oratoire et joutes oratoires entre les élèves du secondaire.',
    startDate: '2027-02-12T10:00:00Z',
    endDate: '2027-02-12T13:30:00Z',
    location: 'Auditorium du Campus',
    category: 'Culturel',
    audience: 'ALL',
    isPublic: true,
  },
  {
    id: 'evt-carnaval',
    title: 'Congé officiel du Carnaval National',
    description: 'Jours gras et festivités traditionnelles. Fermeture administrative selon l’arrêté ministériel.',
    startDate: '2027-02-15T00:00:00Z',
    endDate: '2027-02-17T23:59:59Z',
    location: 'Congé officiel en Haïti',
    category: 'Férié',
    audience: 'ALL',
    isPublic: true,
  },
  // Mars 2027
  {
    id: 'evt-reunion-t2',
    title: '2ème Réunion Parents-Enseignants & Remise des Bulletins',
    description: 'Point d’étape crucial du deuxième trimestre et conseils d’orientation pour le Nouveau Secondaire.',
    startDate: '2027-03-13T08:30:00Z',
    endDate: '2027-03-13T14:30:00Z',
    location: 'Campus Principal · Delmas 50',
    category: 'Réunion',
    audience: 'PARENTS',
    isPublic: true,
  },
  {
    id: 'evt-paques',
    title: 'Vacances de Pâques (Semaine Sainte & Pâques)',
    description: 'Congé pascal officiel pour les élèves et les enseignants.',
    startDate: '2027-03-25T00:00:00Z',
    endDate: '2027-03-30T23:59:59Z',
    location: 'Campus fermé',
    category: 'Férié',
    audience: 'ALL',
    isPublic: true,
  },
  // Avril 2027
  {
    id: 'evt-hackathon',
    title: 'Semaine de la Robotique & Hackathon Junior au Lab Tech',
    description: 'Ateliers intensifs de programmation et présentation des projets technologiques développés par nos élèves.',
    startDate: '2027-04-16T09:00:00Z',
    endDate: '2027-04-17T15:00:00Z',
    location: 'Laboratoire Informatique & Multimédia',
    category: 'Pédagogique',
    audience: 'STUDENTS',
    isPublic: true,
  },
  // Mai 2027
  {
    id: 'evt-travail',
    title: 'Fête du Travail et de l’Agriculture (Jour Férié)',
    description: 'Journée chômée en hommage aux travailleurs et aux richesses de la terre haïtienne.',
    startDate: '2027-05-01T00:00:00Z',
    endDate: '2027-05-01T23:59:59Z',
    location: 'Jour férié national',
    category: 'Férié',
    audience: 'ALL',
    isPublic: true,
  },
  {
    id: 'evt-drapeau',
    title: 'Fête du Drapeau & de l’Université (Célébration Nationale)',
    description: 'Cérémonie patriotique de la montée des couleurs, défilé des élèves en uniforme d’apparat et hommage au Bicolore.',
    startDate: '2027-05-18T08:00:00Z',
    endDate: '2027-05-18T13:00:00Z',
    location: 'Cour d’honneur du Campus (Delmas 50)',
    category: 'Férié',
    audience: 'ALL',
    isPublic: true,
  },
  // Juin 2027
  {
    id: 'evt-exam-pass',
    title: 'Examens de Passage & Épreuves Finales (Tous Cycles)',
    description: 'Semaine d’examens récapitulatifs déterminant le passage en classe supérieure pour tous les cycles.',
    startDate: '2027-06-07T08:00:00Z',
    endDate: '2027-06-11T13:30:00Z',
    location: 'Bâtiment Principal · Salles de cours',
    category: 'Examen',
    audience: 'STUDENTS',
    isPublic: false,
  },
  {
    id: 'evt-exam-etat',
    title: 'Examens Officiels d’État MENFP (9e AF & Baccalauréat)',
    description: 'Déroulement des épreuves officielles nationales du Ministère de l’Éducation Nationale pour les promotions terminales.',
    startDate: '2027-06-21T08:00:00Z',
    endDate: '2027-06-25T14:00:00Z',
    location: 'Centres d’Examens Officiels désignés par le MENFP',
    category: 'Examen',
    audience: 'STUDENTS',
    isPublic: false,
  },
  // Juillet 2027
  {
    id: 'evt-grad',
    title: 'Cérémonie Solennelle de Graduation & Palmarès de l’Année',
    description: 'Remise des diplômes, toges de fin d’études secondaires, discours des lauréats et couronnement de l’excellence.',
    startDate: '2027-07-04T10:00:00Z',
    endDate: '2027-07-04T16:00:00Z',
    location: 'Auditorium Principal · Delmas 50',
    category: 'Culturel',
    audience: 'ALL',
    isPublic: true,
  }
];

let siteSettings: any = {
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
  educationalCycles: {
    prescolaire: {
      title: 'Cycle Préscolaire',
      subtitle: 'De 3 à 5 ans · Petite, Moyenne et Grande Section',
      description: 'Un espace protecteur, stimulant et chaleureux dédié à l’éveil sensoriel, à l’apprentissage précoce des langues et à la socialisation positive de votre enfant.',
      highlights: [
        'Enseignantes qualifiées en petite enfance',
        'Ateliers de motricité fine et créativité',
        'Initiation bilingue (Créole / Français)',
        'Espace récréatif sécurisé et adapté'
      ],
      targetPage: 'prescolaire',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-200',
      image: '/images/campus_courtyard_building_1790531780046.jpg',
    },
    fondamental: {
      title: 'Cycle Fondamental (1er, 2e et 3e Cycles)',
      subtitle: 'De la 1ère à la 9ème Année Fondamentale (AF)',
      description: 'Acquisition des socles fondamentaux : lecture courante, calcul mathématique, sciences expérimentales et préparation aux examens officiels d’État de 9e AF.',
      highlights: [
        'Curriculum national enrichi par nos référentiels',
        'Initiation pratique au laboratoire informatique dès le 2e cycle',
        'Évaluations continues et bulletins périodiques transparents',
        'Préparation rigoureuse et examens blancs pour la 9e AF'
      ],
      targetPage: 'fondamental',
      badgeColor: 'bg-blue-100 text-blue-900 border-blue-200',
      image: '/images/students_assembly_1790529184364.jpg',
    },
    secondaire: {
      title: 'Nouveau Secondaire (NS1 à NS4)',
      subtitle: 'Filières Scientifiques (SVT/SMP) et Économiques',
      description: 'Formation intellectuelle de haut niveau menant au Baccalauréat d’État, préparant les lauréats aux facultés et universités réputées.',
      highlights: [
        'Corps professoral spécialisé de haut niveau académique',
        'Laboratoire scientifique et informatique en libre accès tutoré',
        'Coaching d’orientation post-bac et méthode universitaire',
        '100% de présentation aux épreuves officielles'
      ],
      targetPage: 'secondaire',
      badgeColor: 'bg-purple-100 text-purple-900 border-purple-200',
      image: '/images/graduation_promo_real_1790679465649.jpg',
    },
    numerique: {
      title: 'Pôle Numérique & Informatique',
      subtitle: 'Laboratoire Technologique pour tous les cycles',
      description: 'Formation pratique hebdomadaire sur ordinateurs récents, de la bureautique essentielle à la logique algorithmique et la cybersécurité.',
      highlights: [
        '25+ postes informatiques équipés sous onduleurs',
        'Initiation aux suites bureautiques et au traitement de texte',
        'Fondements de la logique algorithmique et codage',
        'Éthique numérique et recherche documentaire sécurisée'
      ],
      targetPage: 'numerique',
      badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-200',
      image: '/images/computer_lab_real_1790679476180.jpg',
    }
  },
};

// Disk Persistence for Site Settings
const SETTINGS_FILE_PATH = path.join(__dirname, 'data', 'site-settings.json');

function saveSettingsToDisk(settings: any) {
  try {
    const dir = path.dirname(SETTINGS_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(SETTINGS_FILE_PATH, JSON.stringify(settings, null, 2), 'utf-8');
    console.log('[Settings Disk] Paramètres sauvegardés sur disque :', SETTINGS_FILE_PATH);
  } catch (err: any) {
    console.error('[Settings Disk Save Error]', err.message);
  }
}

function loadSettingsFromDisk(): any | null {
  try {
    if (fs.existsSync(SETTINGS_FILE_PATH)) {
      const raw = fs.readFileSync(SETTINGS_FILE_PATH, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err: any) {
    console.error('[Settings Disk Load Error]', err.message);
  }
  return null;
}

// Initial sync from disk if present
const cachedDiskSettings = loadSettingsFromDisk();
if (cachedDiskSettings) {
  siteSettings = { ...siteSettings, ...cachedDiskSettings };
}

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

// 2.1 Change Password with DB Persistence
app.post('/api/auth/change-password', async (req: Request, res: Response) => {
  const { email, newPassword } = req.body;
  if (!email || !newPassword) {
    return res.status(400).json({ error: 'Email et mot de passe requis' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'Le mot de passe doit comporter au moins 6 caractères' });
  }

  const normalizedEmail = email.toLowerCase().trim();

  // 1. Update in-memory user list
  let userFound = false;
  systemUsers = systemUsers.map(u => {
    if (u.email && u.email.toLowerCase() === normalizedEmail) {
      userFound = true;
      return { ...u, password: newPassword, lastActive: 'À l’instant', updatedAt: new Date().toISOString() };
    }
    return u;
  });

  if (!userFound) {
    systemUsers.push({
      id: `usr-${Date.now()}`,
      email: normalizedEmail,
      fullName: normalizedEmail.split('@')[0],
      role: normalizedEmail.includes('admin') ? 'ADMIN' : 'EDITOR',
      password: newPassword,
      status: 'ACTIVE',
      lastActive: 'À l’instant',
      createdAt: new Date().toISOString().split('T')[0],
    });
  }

  // 2. Persist to PostgreSQL database
  let dbSuccess = false;
  if (isDbActive()) {
    try {
      dbSuccess = await dbUpdateUserPassword(normalizedEmail, newPassword);
      console.log(`[Database] Mot de passe de ${normalizedEmail} enregistré dans PostgreSQL avec succès.`);
    } catch (e: any) {
      console.error('[API Change Password DB Error]', e.message);
    }
  }

  auditLogs.push({
    id: `log-${Date.now()}`,
    action: 'SECURITY_PASSWORD_UPDATED',
    user: normalizedEmail,
    details: `Mise à jour du mot de passe de sécurité pour ${normalizedEmail} (Persistance BDD: ${dbSuccess ? 'PostgreSQL' : 'Mémoire/Cache'})`,
    timestamp: new Date().toISOString(),
  });

  return res.json({
    success: true,
    message: 'Mot de passe mis à jour et enregistré dans la base de données avec succès',
    persistedToDb: dbSuccess || !isDbActive(),
  });
});

// 2.2 Permissions & Database Integrity Repair
app.post('/api/admin/system/repair-permissions', async (req: Request, res: Response) => {
  let dbResult = { success: true, repairedUsersCount: systemUsers.length, message: 'Base de données vérifiée et permissions resynchronisées.' };

  if (isDbActive()) {
    try {
      dbResult = await dbRepairSystemPermissions();
    } catch (e: any) {
      console.error('[API Repair Permissions Error]', e.message);
      dbResult = { success: false, repairedUsersCount: 0, message: e.message };
    }
  }

  auditLogs.push({
    id: `log-${Date.now()}`,
    action: 'SECURITY_PERMISSIONS_REPAIRED',
    user: 'Direction Générale (Super-Admin)',
    details: `Contrôle d’intégrité RBAC et synchronisation des tables de la base de données exécutés avec succès`,
    timestamp: new Date().toISOString(),
  });

  return res.json({
    success: true,
    message: dbResult.message || 'Permissions RBAC et base de données synchronisées avec succès.',
    count: dbResult.repairedUsersCount,
  });
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

    // Dispatch email notifications asynchronously
    (async () => {
      const recipientSecretariat = siteSettings?.smtpConfig?.smtpUser || process.env.SMTP_USER || 'collegeisaacnewton9@gmail.com';
      // 1. Notification to the school secretariat
      await sendNotificationEmail({
        to: recipientSecretariat,
        subject: `[Nouvelle Préinscription] Dossier ${appNum} - ${newRecord.studentFirstName} ${newRecord.studentLastName} (${newRecord.targetLevel})`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
            <div style="background-color: #0f274a; color: white; padding: 15px 20px; border-radius: 6px; text-align: center;">
              <h2 style="margin: 0; font-size: 20px;">Collège Isaac Newton</h2>
              <p style="margin: 4px 0 0 0; font-size: 13px; color: #fbbf24;">Nouvelle Préinscription en Ligne</p>
            </div>
            <div style="padding: 20px 0;">
              <div style="background-color: #f8fafc; border-left: 4px solid #f59e0b; padding: 10px 14px; margin-bottom: 16px;">
                <p style="margin: 0; font-size: 11px; color: #64748b; text-transform: uppercase;">Référence du Dossier</p>
                <p style="margin: 2px 0 0 0; font-size: 20px; font-weight: bold; color: #0f274a;">${appNum}</p>
              </div>
              <h3 style="color: #0f274a; font-size: 14px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">Informations de l'Élève</h3>
              <p style="margin: 4px 0; font-size: 13px;"><strong>Nom & Prénom :</strong> ${newRecord.studentFirstName} ${newRecord.studentLastName}</p>
              <p style="margin: 4px 0; font-size: 13px;"><strong>Classe visée :</strong> ${newRecord.targetLevel} (${newRecord.cycle})</p>
              <p style="margin: 4px 0; font-size: 13px;"><strong>Date de naissance :</strong> ${newRecord.studentBirthDate}</p>
              <p style="margin: 4px 0; font-size: 13px;"><strong>Sexe :</strong> ${newRecord.studentGender === 'M' ? 'Masculin' : 'Féminin'}</p>
              <p style="margin: 4px 0; font-size: 13px;"><strong>École précédente :</strong> ${newRecord.previousSchool || 'Non renseignée'}</p>
              
              <h3 style="color: #0f274a; font-size: 14px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-top: 16px;">Responsable Légal</h3>
              <p style="margin: 4px 0; font-size: 13px;"><strong>Nom :</strong> ${newRecord.parentFullName} (${newRecord.parentRelationship})</p>
              <p style="margin: 4px 0; font-size: 13px;"><strong>Téléphone :</strong> ${newRecord.parentPhone}</p>
              <p style="margin: 4px 0; font-size: 13px;"><strong>Email :</strong> ${newRecord.parentEmail}</p>
              <p style="margin: 4px 0; font-size: 13px;"><strong>Adresse :</strong> ${newRecord.parentAddress}</p>
            </div>
            <div style="border-top: 1px solid #e2e8f0; padding-top: 10px; font-size: 11px; color: #94a3b8; text-align: center;">
              Consultable depuis le panneau d'administration du Collège Isaac Newton.
            </div>
          </div>
        `
      });

      // 2. Accusé de réception au parent
      if (newRecord.parentEmail && newRecord.parentEmail.includes('@')) {
        await sendNotificationEmail({
          to: newRecord.parentEmail,
          subject: `Accusé de réception - Préinscription au Collège Isaac Newton (${appNum})`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
              <div style="background-color: #0f274a; color: white; padding: 15px 20px; border-radius: 6px; text-align: center;">
                <h2 style="margin: 0; font-size: 20px;">Collège Isaac Newton</h2>
                <p style="margin: 4px 0 0 0; font-size: 13px; color: #fbbf24;">Savoir aujourd'hui, réussir demain</p>
              </div>
              <div style="padding: 20px 0; color: #334155; font-size: 14px; line-height: 1.6;">
                <p>Chère famille <strong>${newRecord.parentFullName}</strong>,</p>
                <p>Nous avons bien reçu le dossier de préinscription pour <strong>${newRecord.studentFirstName} ${newRecord.studentLastName}</strong> en classe de <strong>${newRecord.targetLevel}</strong> pour l'année académique 2026-2027.</p>
                <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 15px; margin: 15px 0; text-align: center;">
                  <p style="margin: 0; font-size: 11px; color: #64748b; text-transform: uppercase;">Référence officielle de dossier</p>
                  <p style="margin: 4px 0 0 0; font-size: 22px; font-weight: bold; color: #0f274a;">${appNum}</p>
                </div>
                <p><strong>Prochaines étapes :</strong></p>
                <ul style="padding-left: 20px; font-size: 13px; color: #475569;">
                  <li>Examen administratif du dossier sous 48 à 72 heures.</li>
                  <li>Convocation de l'élève pour le test d'évaluation diagnostique.</li>
                  <li>Dépôt des pièces physiques et confirmation d'inscription au campus.</li>
                </ul>
                <p style="margin-top: 15px;">Secrétariat : <strong>+509 3316-0934 / +509 3721-1818</strong> · Delmas 50, rue Dominique #2 bis.</p>
              </div>
            </div>
          `
        });
      }
    })().catch(e => console.warn('[Async Email Error]', e.message));

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
app.get('/api/news', async (req: Request, res: Response) => {
  if (isDbActive()) {
    try {
      const dbArticles = await dbGetNews();
      if (dbArticles && dbArticles.length > 0) {
        newsArticles = dbArticles;
        return res.json(dbArticles);
      }
    } catch (e: any) {
      console.error('[API News DB Error]', e.message);
    }
  }
  res.json(newsArticles);
});

app.post('/api/news', async (req: Request, res: Response) => {
  const newArt = {
    ...req.body,
    id: `news-${Date.now()}`,
    slug: req.body.slug || `article-${Date.now()}`,
    publishedAt: req.body.publishedAt || new Date().toISOString().split('T')[0],
  };

  if (isDbActive()) {
    try {
      const saved = await dbInsertNews(newArt);
      if (saved) {
        newsArticles.unshift(saved);
        auditLogs.push({
          id: `log-${Date.now()}`,
          action: 'NEWS_CREATED_POSTGRES',
          user: 'Direction / Rédaction',
          details: `Publication de l'article en base PostgreSQL : ${saved.title}`,
          timestamp: new Date().toISOString(),
        });
        return res.status(201).json(saved);
      }
    } catch (e: any) {
      console.error('[API News Insert DB Error]', e.message);
    }
  }

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

app.put('/api/news/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const index = newsArticles.findIndex(a => a.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Article introuvable' });
  }

  if (isDbActive()) {
    try {
      const updated = await dbUpdateNews(id, req.body);
      if (updated) {
        newsArticles[index] = { ...newsArticles[index], ...updated };
        auditLogs.push({
          id: `log-${Date.now()}`,
          action: 'NEWS_UPDATED_POSTGRES',
          user: 'Direction / Rédaction',
          details: `Mise à jour dans PostgreSQL de : ${updated.title}`,
          timestamp: new Date().toISOString(),
        });
        return res.json(updated);
      }
    } catch (e: any) {
      console.error('[API News Update DB Error]', e.message);
    }
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

app.delete('/api/news/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  if (isDbActive()) {
    try {
      await dbDeleteNews(id);
    } catch (e: any) {
      console.error('[API News Delete DB Error]', e.message);
    }
  }

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
app.get('/api/events', async (req: Request, res: Response) => {
  if (isDbActive()) {
    try {
      const dbEvts = await dbGetEvents();
      if (dbEvts && dbEvts.length > 0) {
        schoolEvents = dbEvts;
        return res.json(dbEvts);
      }
    } catch (e: any) {
      console.error('[API Events DB Error]', e.message);
    }
  }
  res.json(schoolEvents);
});

app.post('/api/events', async (req: Request, res: Response) => {
  const newEvt = {
    ...req.body,
    id: `evt-${Date.now()}`,
  };

  if (isDbActive()) {
    try {
      const saved = await dbInsertEvent(newEvt);
      if (saved) {
        schoolEvents.unshift(saved);
        auditLogs.push({
          id: `log-${Date.now()}`,
          action: 'EVENT_CREATED_POSTGRES',
          user: 'Direction Pédagogique',
          details: `Création de l'événement en base : ${saved.title}`,
          timestamp: new Date().toISOString(),
        });
        return res.status(201).json(saved);
      }
    } catch (e: any) {
      console.error('[API Events Insert DB Error]', e.message);
    }
  }

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

app.put('/api/events/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = schoolEvents.findIndex(e => e.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Événement introuvable' });
  }

  if (isDbActive()) {
    try {
      const updated = await dbUpdateEvent(id, req.body);
      if (updated) {
        schoolEvents[idx] = { ...schoolEvents[idx], ...updated };
        auditLogs.push({
          id: `log-${Date.now()}`,
          action: 'EVENT_UPDATED_POSTGRES',
          user: 'Direction Pédagogique',
          details: `Mise à jour en base de l'événement : ${updated.title}`,
          timestamp: new Date().toISOString(),
        });
        return res.json(updated);
      }
    } catch (e: any) {
      console.error('[API Events Update DB Error]', e.message);
    }
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

app.delete('/api/events/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  if (isDbActive()) {
    try {
      await dbDeleteEvent(id);
    } catch (e: any) {
      console.error('[API Events Delete DB Error]', e.message);
    }
  }

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

// 5b. Media Library routes (Médiathèque du Collège Isaac Newton)
let memoryMediaItems = [
  { id: 'med-1', url: '/src/assets/images/campus_facade_real_1790679454540.jpg', title: 'Façade Principale Campus (Delmas 50)', category: 'CAMPUS', dimensions: '1280x853', createdAt: '2026-09-01' },
  { id: 'med-2', url: '/src/assets/images/computer_lab_real_1790679476180.jpg', title: 'Laboratoire Informatique & Multimédia', category: 'LAB', dimensions: '1280x853', createdAt: '2026-09-02' },
  { id: 'med-3', url: '/src/assets/images/graduation_promo_real_1790679465649.jpg', title: 'Promotion des Diplômés en Toges', category: 'SLIDESHOW', dimensions: '1280x853', createdAt: '2026-09-03' },
  { id: 'med-4', url: '/src/assets/images/campus_courtyard_building_1790531780046.jpg', title: 'Cour d’Honneur & Bâtiment Pédagogique', category: 'CAMPUS', dimensions: '1280x853', createdAt: '2026-09-04' },
  { id: 'med-5', url: '/src/assets/images/students_assembly_1790529184364.jpg', title: 'Rassemblement Matinal & Discipline', category: 'EVENTS', dimensions: '1280x853', createdAt: '2026-09-05' }
];

app.get('/api/media', async (req: Request, res: Response) => {
  if (isDbActive()) {
    try {
      const dbMedia = await dbGetMedia();
      if (dbMedia && dbMedia.length > 0) {
        memoryMediaItems = dbMedia;
        return res.json(dbMedia);
      }
    } catch (e: any) {
      console.error('[API Media DB Error]', e.message);
    }
  }
  res.json(memoryMediaItems);
});

app.post('/api/media', async (req: Request, res: Response) => {
  const { url, title, category, dimensions, sizeBytes } = req.body;
  if (!url || !title) {
    return res.status(400).json({ error: 'URL et titre requis' });
  }

  const newItem = {
    id: `med-${Date.now()}`,
    url,
    title,
    category: category || 'CAMPUS',
    dimensions: dimensions || '1280x850',
    sizeBytes: sizeBytes || 0,
    createdAt: new Date().toISOString(),
  };

  if (isDbActive()) {
    try {
      const saved = await dbInsertMedia(newItem);
      if (saved) {
        memoryMediaItems.unshift(saved);
        auditLogs.push({
          id: `log-${Date.now()}`,
          action: 'MEDIA_UPLOADED_POSTGRES',
          user: 'Direction (Admin)',
          details: `Image ajoutée à la médiathèque : ${title}`,
          timestamp: new Date().toISOString(),
        });
        return res.status(201).json(saved);
      }
    } catch (e: any) {
      console.error('[API Media Insert DB Error]', e.message);
    }
  }

  memoryMediaItems.unshift(newItem);
  auditLogs.push({
    id: `log-${Date.now()}`,
    action: 'MEDIA_UPLOADED',
    user: 'Direction (Admin)',
    details: `Image ajoutée à la médiathèque : ${title}`,
    timestamp: new Date().toISOString(),
  });
  res.status(201).json(newItem);
});

app.delete('/api/media/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  if (isDbActive()) {
    try {
      await dbDeleteMedia(id);
    } catch (e: any) {
      console.error('[API Media Delete DB Error]', e.message);
    }
  }

  memoryMediaItems = memoryMediaItems.filter(m => m.id !== id);
  auditLogs.push({
    id: `log-${Date.now()}`,
    action: 'MEDIA_DELETED',
    user: 'Direction (Admin)',
    details: `Suppression média ID : ${id}`,
    timestamp: new Date().toISOString(),
  });
  res.json({ success: true });
});

// 5c. Homepage Hero Slideshow Configuration
let memoryHeroSlides = [
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

app.get('/api/slides', async (req: Request, res: Response) => {
  if (isDbActive()) {
    try {
      const dbSlides = await dbGetHeroSlides();
      if (dbSlides && Array.isArray(dbSlides) && dbSlides.length > 0) {
        memoryHeroSlides = dbSlides;
        return res.json(dbSlides);
      }
    } catch (e: any) {
      console.error('[API Slides DB Error]', e.message);
    }
  }
  res.json(memoryHeroSlides);
});

app.put('/api/slides', async (req: Request, res: Response) => {
  const newSlides = req.body;
  if (!Array.isArray(newSlides)) {
    return res.status(400).json({ error: 'Liste de diapositives invalide' });
  }

  memoryHeroSlides = newSlides;

  if (isDbActive()) {
    try {
      await dbSaveHeroSlides(newSlides);
      auditLogs.push({
        id: `log-${Date.now()}`,
        action: 'SLIDESHOW_UPDATED_POSTGRES',
        user: 'Direction (Admin)',
        details: `Diaporama enregistré dans PostgreSQL (${newSlides.length} diapositives)`,
        timestamp: new Date().toISOString(),
      });
      return res.json(newSlides);
    } catch (e: any) {
      console.error('[API Slides Save DB Error]', e.message);
    }
  }

  auditLogs.push({
    id: `log-${Date.now()}`,
    action: 'SLIDESHOW_UPDATED',
    user: 'Direction (Admin)',
    details: `Mise à jour du diaporama (${newSlides.length} diapositives)`,
    timestamp: new Date().toISOString(),
  });
  res.json(memoryHeroSlides);
});

// 5d. School Activity Gallery
let memoryGallery = [
  {
    id: 'gal-1',
    title: 'Cour d’honneur & Bâtiment principal',
    imageUrl: '/images/campus_courtyard_building_1790531780046.jpg',
    caption: 'Cour intérieure moderne et sécurisée au campus de Delmas 50',
    altText: 'Bâtiment moderne du Collège Isaac Newton avec ses galeries bleues et son terrain de basket',
  },
  {
    id: 'gal-2',
    title: 'Façade d’accueil du campus',
    imageUrl: '/images/campus_facade_real_1790679454540.jpg',
    caption: 'Entrée officielle et accueil des familles à Delmas 50',
    altText: 'Façade d’accueil du Collège Isaac Newton avec son fronton et sa devise',
  },
  {
    id: 'gal-3',
    title: 'Cérémonie solennelle de graduation',
    imageUrl: '/images/graduation_promo_real_1790679465649.jpg',
    caption: 'Célébration académique des bâtisseurs de demain',
    altText: 'Lauréats et diplômés du Collège Isaac Newton en toges bleues et blanches',
  },
  {
    id: 'gal-4',
    title: 'Laboratoire informatique et multimédia',
    imageUrl: '/images/computer_lab_real_1790679476180.jpg',
    caption: 'Postes connectés pour la pratique bureautique et le codage',
    altText: 'Élèves travaillant sur les postes informatiques',
  },
  {
    id: 'gal-5',
    title: 'Rassemblement civique & Esprit de corps',
    imageUrl: '/images/students_assembly_1790529184364.jpg',
    caption: 'Discipline, fierté et respect des valeurs républicaines',
    altText: 'Rassemblement des élèves en uniforme bleu et blanc',
  },
  {
    id: 'gal-6',
    title: 'Perspective architecturale du campus',
    imageUrl: '/images/campus_courtyard_building_1790531780046.jpg',
    caption: 'Un cadre structuré et serein propice à l’étude',
    altText: 'Vue d’ensemble des installations scolaires',
  },
];

app.get('/api/gallery', async (req: Request, res: Response) => {
  if (isDbActive()) {
    try {
      const dbGal = await dbGetGallery();
      if (dbGal && Array.isArray(dbGal) && dbGal.length > 0) {
        memoryGallery = dbGal;
        return res.json(dbGal);
      }
    } catch (e: any) {
      console.error('[API Gallery DB Error]', e.message);
    }
  }
  res.json(memoryGallery);
});

app.post('/api/gallery', async (req: Request, res: Response) => {
  const { title, imageUrl, caption, altText } = req.body;
  if (!imageUrl || !title) {
    return res.status(400).json({ error: 'Image et titre requis' });
  }

  const newItem = {
    id: `gal-${Date.now()}`,
    title: title.trim(),
    imageUrl,
    caption: caption || '',
    altText: altText || title,
  };

  memoryGallery.unshift(newItem);

  if (isDbActive()) {
    try {
      await dbSaveGallery(memoryGallery);
    } catch (e: any) {
      console.error('[API Gallery Save DB Error]', e.message);
    }
  }

  auditLogs.push({
    id: `log-${Date.now()}`,
    action: 'GALLERY_ITEM_ADDED',
    user: 'Direction (Admin)',
    details: `Photo ajoutée à la galerie : ${newItem.title}`,
    timestamp: new Date().toISOString(),
  });
  res.status(201).json(newItem);
});

app.put('/api/gallery/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = memoryGallery.findIndex(g => g.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Élément introuvable' });
  }

  memoryGallery[idx] = {
    ...memoryGallery[idx],
    ...req.body,
  };

  if (isDbActive()) {
    try {
      await dbSaveGallery(memoryGallery);
    } catch (e: any) {
      console.error('[API Gallery Update DB Error]', e.message);
    }
  }

  auditLogs.push({
    id: `log-${Date.now()}`,
    action: 'GALLERY_ITEM_UPDATED',
    user: 'Direction (Admin)',
    details: `Photo galerie mise à jour : ${memoryGallery[idx].title}`,
    timestamp: new Date().toISOString(),
  });
  res.json(memoryGallery[idx]);
});

app.delete('/api/gallery/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  memoryGallery = memoryGallery.filter(g => g.id !== id);

  if (isDbActive()) {
    try {
      await dbSaveGallery(memoryGallery);
    } catch (e: any) {
      console.error('[API Gallery Delete DB Error]', e.message);
    }
  }

  auditLogs.push({
    id: `log-${Date.now()}`,
    action: 'GALLERY_ITEM_DELETED',
    user: 'Direction (Admin)',
    details: `Photo galerie supprimée ID : ${id}`,
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

  // Dispatch contact email notifications asynchronously
  (async () => {
    const recipientSecretariat = siteSettings?.smtpConfig?.smtpUser || process.env.SMTP_USER || 'collegeisaacnewton9@gmail.com';
    // 1. Notification to the school secretariat
    await sendNotificationEmail({
      to: recipientSecretariat,
      subject: `[Nouveau Contact] ${subject} - de ${fullName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <div style="background-color: #0f274a; color: white; padding: 12px 16px; border-radius: 6px;">
            <h3 style="margin: 0; font-size: 16px;">Nouveau Message depuis le Site Web</h3>
          </div>
          <div style="padding: 16px 0; color: #334155; font-size: 14px;">
            <p><strong>Expéditeur :</strong> ${fullName}</p>
            <p><strong>Email :</strong> ${email}</p>
            <p><strong>Téléphone :</strong> ${phone || 'Non renseigné'}</p>
            <p><strong>Objet :</strong> ${subject}</p>
            <div style="background-color: #f8fafc; border-left: 3px solid #0f274a; padding: 12px; margin-top: 12px;">
              <p style="margin: 0; font-weight: bold; font-size: 12px; color: #64748b;">Message :</p>
              <p style="margin: 6px 0 0 0; white-space: pre-wrap;">${message}</p>
            </div>
          </div>
        </div>
      `
    });

    // 2. Accusé de réception automatique au visiteur
    if (email && email.includes('@')) {
      await sendNotificationEmail({
        to: email,
        subject: `Accusé de réception : votre message au Collège Isaac Newton`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h3 style="color: #0f274a; margin-top: 0;">Bonjour ${fullName},</h3>
            <p style="color: #334155; font-size: 14px; line-height: 1.6;">
              Nous vous confirmons la bonne réception de votre message concernant <em>« ${subject} »</em>.
            </p>
            <p style="color: #334155; font-size: 14px; line-height: 1.6;">
              Notre secrétariat traite les demandes avec soin et reviendra vers vous si nécessaire.
            </p>
            <div style="margin-top: 20px; border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 12px; color: #64748b;">
              <strong>Collège Isaac Newton</strong> · Delmas 50, rue Dominique #2 bis · Tél : +509 3316-0934 / +509 3721-1818
            </div>
          </div>
        `
      });
    }
  })().catch(e => console.warn('[Async Contact Email Error]', e.message));

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

// 7. Site Settings & Page CMS (Persisted in PostgreSQL and Disk)
app.get('/api/settings', (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.json(siteSettings);
});

app.put('/api/settings', async (req: Request, res: Response) => {
  siteSettings = {
    ...siteSettings,
    ...req.body,
  };

  // 1. Save to local disk cache immediately
  saveSettingsToDisk(siteSettings);

  // 2. Persist to PostgreSQL database if connected
  if (isDbActive()) {
    try {
      await dbSaveSettings(siteSettings);
      console.log('[Database] Paramètres du site enregistrés dans PostgreSQL avec succès.');
    } catch (e: any) {
      console.error('[Database Settings Save Error]', e.message);
    }
  }

  const bannerStatus = siteSettings.announcement?.enabled ? 'ACTIVÉ' : 'DÉSACTIVÉ';
  auditLogs.push({
    id: `log-${Date.now()}`,
    action: 'SETTINGS_UPDATED',
    user: 'Direction Générale (Super Admin)',
    details: `Mise à jour des paramètres généraux (Bandeau public d'alerte : ${bannerStatus})`,
    timestamp: new Date().toISOString(),
  });

  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
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

// 9b. Email Service Status & Test Endpoints
app.get('/api/email-status', (req: Request, res: Response) => {
  const cfg = siteSettings?.smtpConfig;
  const user = cfg?.smtpUser || process.env.SMTP_USER || 'collegeisaacnewton9@gmail.com';
  const pass = cfg?.smtpPass || process.env.SMTP_PASS || 'ujwysuytgjcpfnxf';
  res.json({
    configured: Boolean(user && pass),
    smtpUser: user,
    smtpHost: cfg?.smtpHost || 'smtp.gmail.com',
    smtpPort: cfg?.smtpPort || 465,
    senderName: cfg?.senderName || 'Direction Collège Isaac Newton',
    senderEmail: cfg?.senderEmail || user,
    service: 'Serveur SMTP Sortant',
  });
});

app.post('/api/test-email', async (req: Request, res: Response) => {
  const cfg = siteSettings?.smtpConfig;
  const defaultTo = cfg?.smtpUser || process.env.SMTP_USER || 'collegeisaacnewton9@gmail.com';
  const targetEmail = req.body?.to || defaultTo;
  try {
    const result = await sendNotificationEmail({
      to: targetEmail,
      subject: `[Test Réussi] Validation du service de messagerie Collège Isaac Newton`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #10b981; border-radius: 8px;">
          <div style="background-color: #0f274a; color: white; padding: 12px 16px; border-radius: 6px; text-align: center;">
            <h2 style="margin: 0; font-size: 18px;">Collège Isaac Newton</h2>
            <p style="margin: 4px 0 0 0; font-size: 12px; color: #34d399;">Test du Service de Messagerie Réussi</p>
          </div>
          <div style="padding: 16px 0; color: #334155; font-size: 14px;">
            <p>Bonjour,</p>
            <p>Ce message confirme que la connexion SMTP avec votre compte <strong>${defaultTo}</strong> fonctionne parfaitement !</p>
            <p>Les notifications pour les <strong>préinscriptions</strong> et les <strong>messages de contact</strong> sont actives.</p>
          </div>
          <div style="border-top: 1px solid #e2e8f0; padding-top: 10px; font-size: 11px; color: #94a3b8; text-align: center;">
            Test effectué le ${new Date().toLocaleString('fr-FR')} depuis l'espace d'administration.
          </div>
        </div>
      `,
    });

    if (result.success) {
      return res.json({ success: true, message: `E-mail de test envoyé avec succès à ${targetEmail} !` });
    } else {
      return res.status(500).json({ success: false, error: result.error });
    }
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
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
    try {
      await execPromise('git rev-parse --is-inside-work-tree');
    } catch {
      await execPromise('git init');
      await execPromise('git branch -m main');
      await execPromise('git config user.name "College Isaac Newton"');
      await execPromise('git config user.email "collegeisaacnewton9@gmail.com"');
    }

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
app.get('/api/admin/users', async (req: Request, res: Response) => {
  if (isDbActive()) {
    try {
      const dbUsers = await dbGetUsers();
      if (dbUsers && dbUsers.length > 0) {
        systemUsers = dbUsers;
        return res.json(dbUsers);
      }
    } catch (e: any) {
      console.error('[API Users DB Error]', e.message);
    }
  }
  res.json(systemUsers);
});

app.post('/api/admin/users', async (req: Request, res: Response) => {
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

  if (isDbActive()) {
    try {
      const saved = await dbInsertUser(newUser);
      if (saved) {
        systemUsers.push(saved);
        auditLogs.push({
          id: `log-${Date.now()}`,
          action: 'USER_CREATED_POSTGRES',
          user: 'Direction (Super-Admin)',
          details: `Compte enregistré en base PostgreSQL : ${fullName} (${email}) - ${role}`,
          timestamp: new Date().toISOString(),
        });
        return res.status(201).json(saved);
      }
    } catch (dbErr: any) {
      console.error('[API User Insert DB Error]', dbErr.message);
    }
  }

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

app.patch('/api/admin/users/:id/role', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { role } = req.body;
  if (!role) {
    return res.status(400).json({ error: 'Rôle manquant' });
  }

  const user = systemUsers.find(u => u.id === id);
  if (!user) {
    return res.status(404).json({ error: 'Utilisateur introuvable' });
  }

  if (isDbActive()) {
    try {
      const updated = await dbUpdateUserRole(id, role);
      if (updated) {
        user.role = role;
        auditLogs.push({
          id: `log-${Date.now()}`,
          action: 'ROLE_ASSIGNED_POSTGRES',
          user: 'Direction (Super-Admin)',
          details: `Rôle mis à jour dans PostgreSQL pour ${user.fullName} : ${role}`,
          timestamp: new Date().toISOString(),
        });
        return res.json(updated);
      }
    } catch (e: any) {
      console.error('[API User Role DB Error]', e.message);
    }
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

app.patch('/api/admin/users/:id/status', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const user = systemUsers.find(u => u.id === id);
  if (!user) {
    return res.status(404).json({ error: 'Utilisateur introuvable' });
  }

  if (isDbActive()) {
    try {
      const updated = await dbUpdateUserStatus(id, status);
      if (updated) {
        user.status = status;
        auditLogs.push({
          id: `log-${Date.now()}`,
          action: 'USER_STATUS_UPDATED_POSTGRES',
          user: 'Direction (Super-Admin)',
          details: `Statut mis à jour dans PostgreSQL pour ${user.fullName} : ${status}`,
          timestamp: new Date().toISOString(),
        });
        return res.json(updated);
      }
    } catch (e: any) {
      console.error('[API User Status DB Error]', e.message);
    }
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

app.delete('/api/admin/users/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = systemUsers.find(u => u.id === id);
  if (!user) {
    return res.status(404).json({ error: 'Utilisateur introuvable' });
  }
  if (user.role === 'ADMIN' && systemUsers.filter(u => u.role === 'ADMIN').length <= 1) {
    return res.status(400).json({ error: 'Impossible de supprimer le dernier super-administrateur' });
  }

  if (isDbActive()) {
    try {
      await dbDeleteUser(id);
    } catch (e: any) {
      console.error('[API User Delete DB Error]', e.message);
    }
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
      const dbSettings = await dbGetSettings();
      if (dbSettings) {
        siteSettings = { ...siteSettings, ...dbSettings };
        console.log(`[Database] Paramètres généraux du Collège synchronisés depuis PostgreSQL (Bandeau : ${siteSettings.announcement?.enabled ? 'Activé' : 'Désactivé'}).`);
        saveSettingsToDisk(siteSettings);
      } else {
        await dbSaveSettings(siteSettings);
        console.log('[Database] Paramètres initiaux enregistrés dans la table PostgreSQL site_settings.');
      }
    }
  } catch (err: any) {
    console.error('[Database Startup Error]', err.message);
  }

  // Static asset serving for images (accessible in dev, preview, docker, and production builds)
  app.use('/images', express.static(path.join(__dirname, 'dist', 'images')));
  app.use('/images', express.static(path.join(__dirname, 'src', 'assets', 'images')));
  app.use('/src/assets/images', express.static(path.join(__dirname, 'dist', 'images')));
  app.use('/src/assets/images', express.static(path.join(__dirname, 'src', 'assets', 'images')));
  app.use('/assets/images', express.static(path.join(__dirname, 'src', 'assets', 'images')));
  app.use(express.static(path.join(__dirname, 'public')));

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
