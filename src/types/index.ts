import { z } from 'zod';

export type Role = 'ADMIN' | 'EDITOR' | 'TEACHER' | 'MODERATOR' | 'PARENT' | 'STUDENT';

export type Language = 'fr' | 'ht' | 'en';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  phone?: string;
  token?: string;
  department?: string;
  status?: 'ACTIVE' | 'SUSPENDED';
  lastActive?: string;
  createdAt?: string;
}

export interface RolePermissionDetail {
  role: Role;
  name: string;
  badgeLabel: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  summary: string;
  detailedScope: string;
  allowedActions: string[];
  restrictedActions: string[];
  accessLevel: 'SUPER_ADMIN' | 'DELEGATED_MANAGER' | 'PUBLIC_PORTAL';
}

export type AdmissionStatus = 
  | 'PENDING'
  | 'UNDER_REVIEW'
  | 'INTERVIEW_SCHEDULED'
  | 'ACCEPTED'
  | 'WAITLISTED'
  | 'REJECTED';

export type AcademicCycle = 
  | 'PRESCOLAIRE'
  | 'FONDAMENTAL_CYCLE_1'
  | 'FONDAMENTAL_CYCLE_2'
  | 'FONDAMENTAL_CYCLE_3'
  | 'SECONDAIRE';

export interface AdmissionApplication {
  id: string;
  applicationNumber: string;
  schoolYear: string;
  targetLevel: string;
  cycle: AcademicCycle;
  status: AdmissionStatus;
  
  // Student
  studentLastName: string;
  studentFirstName: string;
  studentBirthDate: string;
  studentGender: 'M' | 'F';
  previousSchool?: string;
  
  // Parent
  parentFullName: string;
  parentRelationship: string;
  parentPhone: string;
  parentEmail: string;
  parentAddress: string;
  parentOccupation?: string;
  
  // Checklist
  hasBirthCert: boolean;
  hasReportCards: boolean;
  hasPassCert: boolean;
  hasIdPhotos: boolean;
  specialNotes?: string;
  
  consentGiven: boolean;
  reviewedBy?: string;
  reviewNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NewsArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  featured?: boolean;
  publishedAt: string;
  authorName?: string;
}

export type EventCategory = 'Pédagogique' | 'Culturel' | 'Sportif' | 'Réunion' | 'Examen' | 'Férié';

export interface SchoolEvent {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate?: string;
  location: string;
  category: EventCategory;
  audience: 'ALL' | 'PARENTS' | 'STUDENTS';
  isPublic: boolean;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: 'campus' | 'laboratoire' | 'vie-scolaire' | 'ceremonies';
  imageUrl: string;
  altText: string;
  caption?: string;
}

export interface DocumentFile {
  id: string;
  title: string;
  description?: string;
  category: 'reglement' | 'calendrier' | 'fournitures' | 'formulaires';
  fileUrl: string;
  fileSize: string;
  fileType: string;
  targetCycle?: string;
  schoolYear: string;
  downloadCount: number;
}

export interface ContactMessage {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'NEW' | 'TREATED' | 'ARCHIVED';
  createdAt: string;
}

export interface SiteSettings {
  announcement: {
    enabled: boolean;
    text: string;
    type: 'info' | 'warning' | 'urgent';
    linkText?: string;
    linkUrl?: string;
  };
  admissionsStatus: {
    isOpen: boolean;
    currentSchoolYear: string;
    deadlineNotice: string;
  };
  contactInfo: {
    phone: string;
    phoneAlt?: string;
    email: string;
    address: string;
    openingHours: string;
  };
  directorInfo?: {
    name: string;
    title: string;
    role: string;
  };
  schoolMotto: string;
  directorWelcome: string;
}

export interface Testimonial {
  id: string;
  authorName: string;
  role: string;
  relationship: 'Parent d’élève' | 'Ancien élève / Lauréat' | 'Enseignant' | 'Élève';
  cycleOrClass?: string;
  comment: string;
  rating: number; // 1 to 5
  avatarInitials: string;
  year?: string;
  verified?: boolean;
}

// Zod Schemas
export const admissionValidationSchema = z.object({
  // Parent Info
  parentFullName: z.string().min(3, 'Le nom complet du responsable est requis'),
  parentRelationship: z.string().min(2, 'Le lien de parenté est requis'),
  parentPhone: z.string().min(8, 'Un numéro de téléphone valide est obligatoire'),
  parentEmail: z.string().email('Adresse e-mail invalide'),
  parentAddress: z.string().min(5, "L'adresse de résidence est obligatoire"),
  parentOccupation: z.string().optional(),

  // Student Info
  studentLastName: z.string().min(2, "Le nom de l'élève est requis"),
  studentFirstName: z.string().min(2, "Le prénom de l'élève est requis"),
  studentBirthDate: z.string().min(4, 'La date de naissance est requise'),
  studentGender: z.enum(['M', 'F'], { message: 'Veuillez sélectionner le sexe' }),
  previousSchool: z.string().optional(),

  // Academic Target
  schoolYear: z.string().default('2026-2027'),
  targetLevel: z.string().min(2, 'Le niveau scolaire visé est obligatoire'),
  cycle: z.enum(['PRESCOLAIRE', 'FONDAMENTAL_CYCLE_1', 'FONDAMENTAL_CYCLE_2', 'FONDAMENTAL_CYCLE_3', 'SECONDAIRE']),

  // Documents checklist
  hasBirthCert: z.boolean().default(false),
  hasReportCards: z.boolean().default(false),
  hasPassCert: z.boolean().default(false),
  hasIdPhotos: z.boolean().default(false),
  specialNotes: z.string().optional(),

  // Consent
  consentGiven: z.boolean().refine(val => val === true, {
    message: 'Le consentement à la politique de confidentialité est obligatoire',
  }),
});

export type AdmissionFormData = z.infer<typeof admissionValidationSchema>;

export const contactValidationSchema = z.object({
  fullName: z.string().min(3, 'Votre nom est requis'),
  email: z.string().email('Adresse e-mail valide requise'),
  phone: z.string().optional(),
  subject: z.string().min(3, 'Le sujet de votre message est requis'),
  message: z.string().min(10, 'Votre message doit comporter au moins 10 caractères'),
});

export type ContactFormData = z.infer<typeof contactValidationSchema>;

export const loginSchema = z.object({
  email: z.string().email('E-mail valide requis'),
  password: z.string().min(6, 'Le mot de passe doit comporter au moins 6 caractères'),
});
