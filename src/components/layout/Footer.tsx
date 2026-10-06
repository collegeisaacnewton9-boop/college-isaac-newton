import React from 'react';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  ArrowRight, 
  Facebook, 
  Instagram, 
  Youtube, 
  ShieldCheck,
  Lock,
  Calendar,
  FileText,
  Navigation,
  ExternalLink
} from 'lucide-react';
import { SchoolLogo } from '../ui/SchoolLogo';
import { SCHOOL_INFO } from '../../data/mockData';

interface FooterProps {
  onNavigate: (page: string, subSection?: string) => void;
  onOpenAuth: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenAuth }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-900 mt-auto" aria-label="Pied de page institutionnel">
      
      {/* 1. BANDEAU D'ACCÈS RAPIDE AUX COORDONNÉES (Ultra-accessible sur Mobile & Desktop) */}
      <div className="bg-slate-900/90 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
            
            {/* Action 1 : Téléphone Direct */}
            <div className="flex items-center gap-3 p-2.5 sm:p-3 rounded-xl bg-slate-950/70 hover:bg-blue-900/40 border border-slate-800 hover:border-amber-400/40 transition-all group">
              <div className="w-9 h-9 rounded-lg bg-amber-400/10 text-amber-400 flex items-center justify-center shrink-0 group-hover:bg-amber-400 group-hover:text-slate-950 transition-colors">
                <Phone className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Lignes téléphoniques directes
                </span>
                <div className="text-xs sm:text-sm font-bold font-mono text-white group-hover:text-amber-300 transition-colors flex flex-wrap items-center gap-1">
                  <a href="tel:+50933160934" className="hover:underline">+509 3316-0934</a>
                  <span className="text-slate-500 font-sans font-normal">/</span>
                  <a href="tel:+50937211818" className="hover:underline">+509 3721-1818</a>
                </div>
              </div>
            </div>

            {/* Action 2 : Adresse & Itinéraire */}
            <a 
              href="https://maps.google.com/?q=Delmas+50+rue+Dominique+2+bis+Port-au-Prince+Haiti"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-2.5 sm:p-3 rounded-xl bg-slate-950/70 hover:bg-blue-900/40 border border-slate-800 hover:border-amber-400/40 transition-all group"
            >
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Campus Principal
                </span>
                <span className="text-xs sm:text-sm font-semibold text-white group-hover:text-amber-300 transition-colors truncate block">
                  Delmas 50, rue Dominique #2 bis, Port-au-Prince
                </span>
              </div>
            </a>

            {/* Action 3 : Horaires du Secrétariat */}
            <div className="flex items-center gap-3 p-2.5 sm:p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Horaires Secrétariat
                </span>
                <span className="text-xs sm:text-sm font-semibold text-white truncate block">
                  Lun - Ven : 7h30 - 15h30
                </span>
              </div>
            </div>

            {/* Action 4 : Préinscription Rapide */}
            <button
              onClick={() => onNavigate('pre-registration')}
              className="flex items-center justify-between gap-2 p-2.5 sm:p-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 shrink-0" />
                <span className="text-left font-semibold">Préinscription {SCHOOL_INFO.currentYear}</span>
              </div>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </button>

          </div>
        </div>
      </div>

      {/* 2. CORPS PRINCIPAL : GRILLE COMPACTE & RESPONSIVE */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 sm:py-9 lg:py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-6 sm:gap-7 lg:gap-8">
          
          {/* Col 1 : Identité de l'établissement (3 colonnes en desktop) */}
          <div className="sm:col-span-2 lg:col-span-3 space-y-3.5">
            <SchoolLogo variant="light" />
            
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
              Établissement scolaire privé d’excellence à Delmas 50. Une formation académique rigoureuse, bilingue et technologique du préscolaire au baccalauréat.
            </p>

            {/* Devises officielles & Direction */}
            <div className="space-y-1.5 text-xs text-slate-400 border-l-2 border-amber-400 pl-3 py-0.5">
              <p className="italic font-serif text-slate-200">
                « Apprendre aujourd'hui pour bâtir demain »
              </p>
              <p className="text-[11px] text-slate-400">
                Devise fondatrice : <em>« Savoir aujourd'hui, réussir demain »</em>
              </p>
              <p className="text-[11px] text-slate-300 pt-0.5">
                <span className="text-amber-400 font-semibold">Directeur fondateur :</span> Orphe Jean Marie
                <span className="block text-[10px] text-slate-400 font-light">Professeur de Mathématiques & Sciences Physiques</span>
              </p>
            </div>

            {/* Réseaux sociaux & Certification */}
            <div className="flex items-center gap-2.5 pt-1">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-blue-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                aria-label="Facebook Collège Isaac Newton"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-pink-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                aria-label="Instagram Collège Isaac Newton"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a 
                href="https://youtube.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-red-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                aria-label="YouTube Collège Isaac Newton"
              >
                <Youtube className="w-4 h-4" />
              </a>
              
              <span className="text-[11px] text-slate-400 pl-2 border-l border-slate-800">
                Agrément MENFP Haïti
              </span>
            </div>
          </div>

          {/* Col 2 : Programmes d'enseignement (4 colonnes en desktop - sur une seule ligne) */}
          <div className="sm:col-span-1 lg:col-span-4 space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 pb-1 border-b border-slate-900">
              Cycles d'Enseignement
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <button 
                  onClick={() => onNavigate('programs', 'prescolaire')} 
                  className="hover:text-white transition-colors flex items-center gap-1.5 text-slate-400 hover:translate-x-0.5 duration-150 cursor-pointer whitespace-nowrap"
                >
                  <ArrowRight className="w-3 h-3 text-slate-600 shrink-0" />
                  <span className="whitespace-nowrap">Cycle Préscolaire (TPS, PS, MS, GS)</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('programs', 'fondamental')} 
                  className="hover:text-white transition-colors flex items-center gap-1.5 text-slate-400 hover:translate-x-0.5 duration-150 cursor-pointer whitespace-nowrap"
                >
                  <ArrowRight className="w-3 h-3 text-slate-600 shrink-0" />
                  <span className="whitespace-nowrap">Cycle Fondamental (1ère à 9e AF)</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('programs', 'secondaire')} 
                  className="hover:text-white transition-colors flex items-center gap-1.5 text-slate-400 hover:translate-x-0.5 duration-150 cursor-pointer whitespace-nowrap"
                >
                  <ArrowRight className="w-3 h-3 text-slate-600 shrink-0" />
                  <span className="whitespace-nowrap">Nouveau Secondaire (NS1 à NS4 Bac)</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('programs', 'numerique')} 
                  className="hover:text-white transition-colors flex items-center gap-1.5 text-slate-400 hover:translate-x-0.5 duration-150 cursor-pointer whitespace-nowrap"
                >
                  <ArrowRight className="w-3 h-3 text-slate-600 shrink-0" />
                  <span className="whitespace-nowrap">Laboratoire & Pôle Informatique</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('school-life')} 
                  className="hover:text-white transition-colors flex items-center gap-1.5 text-slate-400 hover:translate-x-0.5 duration-150 cursor-pointer whitespace-nowrap"
                >
                  <ArrowRight className="w-3 h-3 text-slate-600 shrink-0" />
                  <span className="whitespace-nowrap">Activités sportives & culturelles</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3 : Admissions & Vie scolaire (2 colonnes) */}
          <div className="lg:col-span-2 space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 pb-1 border-b border-slate-900">
              Admissions
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <button 
                  onClick={() => onNavigate('pre-registration')} 
                  className="text-amber-300 hover:text-white font-medium transition-colors flex items-center gap-1.5 hover:translate-x-0.5 duration-150 cursor-pointer"
                >
                  <ArrowRight className="w-3 h-3 text-amber-500 shrink-0" />
                  <span>Formulaire en ligne</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('admissions', 'conditions')} 
                  className="hover:text-white transition-colors flex items-center gap-1.5 text-slate-400 hover:translate-x-0.5 duration-150 cursor-pointer"
                >
                  <ArrowRight className="w-3 h-3 text-slate-600 shrink-0" />
                  <span>Critères d'admission</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('events')} 
                  className="hover:text-white transition-colors flex items-center gap-1.5 text-slate-400 hover:translate-x-0.5 duration-150 cursor-pointer"
                >
                  <ArrowRight className="w-3 h-3 text-slate-600 shrink-0" />
                  <span>Agenda & Calendrier</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('news')} 
                  className="hover:text-white transition-colors flex items-center gap-1.5 text-slate-400 hover:translate-x-0.5 duration-150 cursor-pointer"
                >
                  <ArrowRight className="w-3 h-3 text-slate-600 shrink-0" />
                  <span>Actualités du collège</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('gallery')} 
                  className="hover:text-white transition-colors flex items-center gap-1.5 text-slate-400 hover:translate-x-0.5 duration-150 cursor-pointer"
                >
                  <ArrowRight className="w-3 h-3 text-slate-600 shrink-0" />
                  <span>Galerie photos campus</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate('support')} 
                  className="hover:text-amber-300 transition-colors flex items-center gap-1.5 text-slate-300 font-medium hover:translate-x-0.5 duration-150 cursor-pointer"
                >
                  <ArrowRight className="w-3 h-3 text-amber-500 shrink-0" />
                  <span>Soutenir le Collège & Partenariats</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4 : Contact Officiel & Secrétariat (3 colonnes) */}
          <div className="lg:col-span-3 space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 pb-1 border-b border-slate-900">
              Secrétariat & Contact
            </h3>
            
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white block">Delmas 50, rue Dominique #2 bis</span>
                  <span className="text-[11px] text-slate-400">Port-au-Prince, Haïti · Campus principal</span>
                </div>
              </li>

              <li className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-mono font-semibold text-white space-y-0.5">
                    <a 
                      href="tel:+50933160934" 
                      className="hover:text-amber-300 transition-colors block"
                    >
                      +509 3316-0934
                    </a>
                    <a 
                      href="tel:+50937211818" 
                      className="hover:text-amber-300 transition-colors block"
                    >
                      +509 3721-1818
                    </a>
                  </div>
                  <span className="text-[11px] text-slate-400">Secrétariat & accueil téléphonique</span>
                </div>
              </li>

              <li className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <a 
                    href={`mailto:${SCHOOL_INFO.email}`} 
                    className="text-white hover:text-amber-300 transition-colors block break-all font-mono text-[11px]"
                  >
                    {SCHOOL_INFO.email}
                  </a>
                  <span className="text-[10px] text-slate-400">Dossiers et correspondance</span>
                </div>
              </li>

              <li className="pt-1">
                <button
                  onClick={() => onNavigate('contact')}
                  className="w-full py-1.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-amber-400 hover:text-amber-300 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Formulaire & plan d'accès</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* 3. BARRE INFÉRIEURE : COPYRIGHT, ACCÈS ADMIN & MENTIONS */}
      <div className="border-t border-slate-900 bg-black/60 text-xs text-slate-400 py-3.5 sm:py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 text-[11px] sm:text-xs">
            <span>© {currentYear} Collège Isaac Newton.</span>
            <span className="text-slate-700 hidden sm:inline">|</span>
            <span className="text-slate-400">Tous droits réservés.</span>
            <span className="text-slate-700 hidden md:inline">|</span>
            <span className="italic text-slate-400 font-serif hidden md:inline">Delmas 50, rue Dominique #2 bis, Port-au-Prince, Haïti</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] sm:text-xs text-slate-400">
            <button 
              onClick={() => onNavigate('legal')} 
              className="hover:text-slate-200 transition-colors cursor-pointer"
            >
              Mentions légales
            </button>
            <span className="text-slate-800">·</span>
            <button 
              onClick={() => onNavigate('privacy')} 
              className="hover:text-slate-200 transition-colors cursor-pointer"
            >
              Confidentialité
            </button>
            <span className="text-slate-800">·</span>
            <button 
              onClick={onOpenAuth} 
              className="flex items-center gap-1 text-slate-400 hover:text-amber-400 transition-colors cursor-pointer font-medium"
            >
              <Lock className="w-3 h-3 text-amber-400/80" />
              <span>Portail Administration</span>
            </button>
          </div>

        </div>
      </div>
    </footer>
  );
};
