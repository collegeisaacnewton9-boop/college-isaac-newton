import React, { useState } from 'react';
import { 
  Camera, 
  ArrowRight, 
  Maximize2, 
  X, 
  Sparkles, 
  Tag, 
  Users, 
  Cpu, 
  Trophy, 
  GraduationCap,
  Calendar
} from 'lucide-react';
import { SCHOOL_IMAGES } from '../../assets/images';

interface ActivityItem {
  id: string;
  title: string;
  category: 'informatique' | 'sport' | 'civique' | 'academique';
  categoryLabel: string;
  image: string;
  badge: string;
  badgeColor: string;
  description: string;
  date: string;
  location: string;
}

interface ActivityGallerySectionProps {
  onNavigate: (page: string, subSection?: string) => void;
}

export const ActivityGallerySection: React.FC<ActivityGallerySectionProps> = ({ onNavigate }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activePhoto, setActivePhoto] = useState<ActivityItem | null>(null);

  const activities: ActivityItem[] = [
    {
      id: 'act-1',
      title: 'Séances pratiques au Laboratoire Informatique',
      category: 'informatique',
      categoryLabel: 'Technologie & Sciences',
      image: SCHOOL_IMAGES.computerLab,
      badge: 'Laboratoire Tech',
      badgeColor: 'bg-blue-600 text-white',
      description: 'Initiation méthodique au traitement de texte, à la recherche documentaire sécurisée et à la logique algorithmique sous onduleurs et générateurs dédiés.',
      date: 'Hebdomadaire',
      location: 'Salle Multimédia 2e étage',
    },
    {
      id: 'act-2',
      title: 'Tournois de Basketball & Éducation Physique',
      category: 'sport',
      categoryLabel: 'Sports & Motricité',
      image: SCHOOL_IMAGES.campusCourtyard,
      badge: 'Cour Intérieure',
      badgeColor: 'bg-emerald-600 text-white',
      description: 'Pratique sportive encadrée sur le terrain multisports de la cour d’honneur. Esprit d’équipe, santé et cohésion entre les différentes promotions.',
      date: 'Mercredi & Vendredi',
      location: 'Cour principale de Delmas 50',
    },
    {
      id: 'act-3',
      title: 'Rassemblement Civique & Montée du Drapeau',
      category: 'civique',
      categoryLabel: 'Civisme & Discipline',
      image: SCHOOL_IMAGES.studentsAssembly,
      badge: 'Vie Civique',
      badgeColor: 'bg-amber-600 text-white',
      description: 'Chaque matin à 7h30, les élèves en uniforme bleu et blanc se réunissent pour l’hymne national, le rappel des valeurs républicaines et les consignes du jour.',
      date: 'Chaque matin (7h30)',
      location: 'Cour d’honneur',
    },
    {
      id: 'act-4',
      title: 'Célébration Solennelle de la Promotion des Lauréats',
      category: 'academique',
      categoryLabel: 'Excellence & Réussite',
      image: SCHOOL_IMAGES.graduationPromo,
      badge: 'Graduation',
      badgeColor: 'bg-purple-600 text-white',
      description: 'Remise des parchemins officiels aux diplômés du Nouveau Secondaire (NS4), prêts pour les universités haïtiennes et internationales.',
      date: 'Session Annuelle',
      location: 'Auditorium du Campus',
    },
    {
      id: 'act-5',
      title: 'Accueil & Sécurité des Familles à l’Entrée Principale',
      category: 'civique',
      categoryLabel: 'Campus Serein',
      image: SCHOOL_IMAGES.entranceFacade,
      badge: 'Entrée Principale',
      badgeColor: 'bg-slate-700 text-white',
      description: 'Contrôle d’accès strict, dépose sécurisée des élèves et secrétariat ouvert pour l’accueil chaleureux des parents d’élèves.',
      date: 'Lun - Ven',
      location: 'Campus Principal Delmas 50',
    },
    {
      id: 'act-6',
      title: 'Infrastructures Claires & Cadre d’Étude Moderne',
      category: 'academique',
      categoryLabel: 'Infrastructures',
      image: SCHOOL_IMAGES.heroCampusAlt,
      badge: 'Campus CIN',
      badgeColor: 'bg-blue-800 text-white',
      description: 'Salles aérées, galeries couvertes et environnement propice au travail intellectuel assidu et à l’émulation positive.',
      date: 'Permanent',
      location: 'Ensemble du Campus',
    },
  ];

  const filterTabs = [
    { id: 'all', label: 'Toutes les activités' },
    { id: 'informatique', label: 'Informatique & Labo' },
    { id: 'sport', label: 'Sports & Cour' },
    { id: 'civique', label: 'Civisme & Rassemblements' },
    { id: 'academique', label: 'Cérémonies & Réussite' },
  ];

  const filteredActivities = selectedCategory === 'all'
    ? activities
    : activities.filter((a) => a.category === selectedCategory);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6" aria-label="Galerie des activités scolaires et périscolaires">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-4 sm:mb-5 gap-3 border-b border-slate-100 pb-3">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-900 mb-0.5">
            <Camera className="w-3.5 h-3.5 text-amber-500" />
            <span>Immersion par l'Image</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
            Galerie des Activités Scolaires
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5 max-w-xl font-light">
            Vivez le dynamisme de la vie scolaire au Collège Isaac Newton : laboratoire informatique, sports, rassemblements civiques et promotions lauréates.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100/90 rounded-xl text-xs overflow-x-auto">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === tab.id
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ACTIVITIES PHOTO GRID (Responsive 3 Columns Desktop, 2 Tablet, 1 Mobile) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
        {filteredActivities.map((act) => (
          <div
            key={act.id}
            onClick={() => setActivePhoto(act)}
            className="group relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-200/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-end aspect-[16/11] cursor-pointer"
          >
            {/* Background Image with Zoom on Hover */}
            <img
              src={act.image}
              alt={act.title}
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
              loading="lazy"
            />

            {/* Gradient Overlays for Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent opacity-90 group-hover:opacity-95 transition-opacity" />

            {/* Top Badges */}
            <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-sm ${act.badgeColor}`}>
                {act.badge}
              </span>

              <div className="w-8 h-8 rounded-full bg-slate-900/60 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Maximize2 className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Bottom Card Content */}
            <div className="relative z-10 p-3.5 sm:p-4 space-y-1 text-white">
              <div className="flex items-center gap-2 text-[10px] text-amber-300 font-mono">
                <span>{act.date}</span>
                <span>·</span>
                <span>{act.location}</span>
              </div>

              <h3 className="font-serif font-bold text-sm sm:text-base text-white group-hover:text-amber-300 transition-colors leading-snug">
                {act.title}
              </h3>

              <p className="text-[11px] text-slate-300 line-clamp-2 font-light leading-relaxed">
                {act.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom CTA to Full Gallery */}
      <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs">
        <span className="text-slate-500 font-medium">
          Toutes les photos sont prises in situ au campus du Collège Isaac Newton (Delmas 50).
        </span>

        <button
          onClick={() => onNavigate('gallery')}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-blue-900 hover:text-white text-blue-900 font-semibold transition-all cursor-pointer shadow-2xs"
        >
          <span>Consulter l'album complet ({activities.length}+ clichés)</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* PHOTO LIGHTBOX MODAL (When clicking a photo) */}
      {activePhoto && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150"
          onClick={() => setActivePhoto(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-slate-900 rounded-2xl sm:rounded-3xl overflow-hidden max-w-3xl w-full border border-slate-700 shadow-2xl animate-in zoom-in-95 duration-150 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image Preview */}
            <div className="relative h-[320px] sm:h-[420px] bg-black">
              <img
                src={activePhoto.image}
                alt={activePhoto.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setActivePhoto(null)}
                className="absolute top-3 right-3 p-2 rounded-full bg-slate-950/70 hover:bg-slate-950 text-white transition-colors cursor-pointer"
                aria-label="Fermer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute top-3 left-3">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${activePhoto.badgeColor}`}>
                  {activePhoto.badge}
                </span>
              </div>
            </div>

            {/* Modal Description */}
            <div className="p-4 sm:p-6 text-white space-y-2 bg-slate-900">
              <div className="flex items-center gap-2 text-xs text-amber-400 font-mono">
                <span>{activePhoto.date}</span>
                <span>·</span>
                <span>{activePhoto.location}</span>
                <span>·</span>
                <span>Collège Isaac Newton</span>
              </div>

              <h3 className="font-serif font-bold text-lg sm:text-xl text-white">
                {activePhoto.title}
              </h3>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
                {activePhoto.description}
              </p>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => {
                    setActivePhoto(null);
                    onNavigate('pre-registration');
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
                >
                  Inscrire mon enfant pour ces activités →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </section>
  );
};
