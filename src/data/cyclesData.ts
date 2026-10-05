import { AcademicCyclesRecord } from '../types';

export const DEFAULT_EDUCATIONAL_CYCLES: AcademicCyclesRecord = {
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
};
