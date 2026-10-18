import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  ArrowRight, 
  FileCheck, 
  ChevronDown, 
  FileText,
  Clock,
  AlertCircle,
  Sparkles,
  GraduationCap,
  BookOpen,
  DollarSign,
  IdCard,
  Edit3,
  ExternalLink,
  ShieldCheck,
  Check
} from 'lucide-react';
import { FAQS, SCHOOL_INFO } from '../data/mockData';
import { ContentEditable } from '../components/common/ContentEditable';
import { User, SiteSettings, AdmissionRequirementsConfig } from '../types';
import { apiService } from '../services/api';

interface AdmissionsPageProps {
  onNavigate: (page: string, subSection?: string) => void;
  subSection?: string;
  currentUser?: User | null;
}

const DEFAULT_REQUIREMENTS: AdmissionRequirementsConfig = {
  academicYear: '2026-2027',
  registrationFee: '3 000 gourdes',
  openingHours: 'Du lundi au vendredi, de 8 h à 15 h',
  presenceRequiredNotice: "L'enfant doit être présent lors de l'inscription.",
  levelsConcerned: [
    'Préscolaire',
    'Fondamental : 1er, 2e et 3e cycles',
    'Secondaire'
  ],
  fondamentaleDocuments: [
    'Acte de naissance ou extrait des archives : original et copie.',
    'Carnet scolaire du dernier établissement : original.',
    'Deux photos d’identité récentes.',
    'Frais d’inscription : 3 000 gourdes.',
    'Pièce d’identité de la personne responsable : CIN ou NIF.'
  ],
  secondaireDocuments: [
    'Acte de naissance ou extrait des archives : original et copie.',
    'Carnet scolaire du dernier établissement : original.',
    'Deux photos d’identité récentes.',
    'Frais d’inscription : 3 000 gourdes.',
    'Pièce d’identité de la personne responsable : CIN ou NIF.'
  ],
  additionalDocuments: [
    'Relevé de notes NS2 et NS3.',
    'Fiche de 9e A.F.',
    'Attestation 9ème A.F.',
    'N.S.U et code de l’école.'
  ],
  updatedAt: '2026-10-18T08:30:00.000Z'
};

export const AdmissionsPage: React.FC<AdmissionsPageProps> = ({ 
  onNavigate, 
  subSection, 
  currentUser 
}) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  // Load site settings & live admission requirements
  useEffect(() => {
    let isMounted = true;
    apiService.getSettings().then((s) => {
      if (isMounted && s) setSettings(s);
    });

    const handleSettingsUpdated = () => {
      apiService.getSettings().then((s) => {
        if (isMounted && s) setSettings(s);
      });
    };

    window.addEventListener('cin:settings-updated', handleSettingsUpdated);
    window.addEventListener('cin:env-changed', handleSettingsUpdated);
    return () => {
      isMounted = false;
      window.removeEventListener('cin:settings-updated', handleSettingsUpdated);
      window.removeEventListener('cin:env-changed', handleSettingsUpdated);
    };
  }, []);

  // Smooth scroll to target subSection if requested via navigation
  useEffect(() => {
    if (subSection === 'conditions') {
      const el = document.getElementById('conditions') || document.getElementById('admissions-conditions');
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      }
    } else if (subSection === 'procedure') {
      const el = document.getElementById('admissions-procedure');
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      }
    } else if (subSection === 'faq') {
      const el = document.getElementById('admissions-faq');
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      }
    }
  }, [subSection]);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const req: AdmissionRequirementsConfig = settings?.admissionRequirements || DEFAULT_REQUIREMENTS;
  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'EDITOR';

  return (
    <div className="space-y-8 sm:space-y-10 lg:space-y-12 py-5 sm:py-7 lg:py-8 font-sans">
      
      {/* 1. Header Hero Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl space-y-3">
          <div className="inline-block text-xs font-semibold uppercase tracking-widest text-blue-900">
            <ContentEditable
              contentKey="admissions.hero.badge"
              defaultContent="Rejoindre la Communauté Newtonienne"
              as="span"
              currentUser={currentUser}
              multiline={false}
            />
          </div>
          <ContentEditable
            contentKey="admissions.hero.title"
            defaultContent={`Admissions & Inscriptions ${req.academicYear || SCHOOL_INFO.currentYear}`}
            as="h1"
            className="font-serif text-2xl sm:text-4xl font-bold text-slate-900"
            currentUser={currentUser}
            multiline={false}
          />
          <ContentEditable
            contentKey="admissions.hero.subtitle"
            defaultContent="Découvrez la procédure d'admission pour intégrer le Collège Isaac Newton, les conditions requises, les pièces exigibles par section et le calendrier des inscriptions."
            as="p"
            className="text-sm sm:text-base text-slate-600 leading-relaxed font-light"
            currentUser={currentUser}
            multiline={true}
          />

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('pre-registration')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-semibold text-xs sm:text-sm shadow-md transition-all active:scale-98 cursor-pointer"
            >
              <FileCheck className="w-4 h-4 text-amber-400" />
              <span>Accéder au formulaire de préinscription en ligne</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('conditions');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs sm:text-sm transition-colors cursor-pointer border border-slate-200"
            >
              <FileText className="w-4 h-4 text-blue-900" />
              <span>Consulter les pièces exigées ({req.academicYear})</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. NIVEAUX CONCERNÉS & PERMANENCE DES INSCRIPTIONS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 relative overflow-hidden">
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* Left Col: Niveaux d'enseignement */}
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-mono font-semibold border border-white/15">
                <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
                <span>Niveaux Concernés · Année Académique {req.academicYear}</span>
              </div>

              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Offre Pédagogique du Préscolaire au Secondaire
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
                Le Collège Isaac Newton accueille les élèves à Delmas 50 pour un cursus complet d’excellence :
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/15 space-y-1">
                  <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wide">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Préscolaire</span>
                  </div>
                  <p className="text-[11px] text-slate-200 leading-snug">
                    TPS, PS, MS, GS : éveil, motricité, langage et premiers apprentissages structurés.
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/15 space-y-1">
                  <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wide">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Fondamental</span>
                  </div>
                  <p className="text-[11px] text-slate-200 leading-snug">
                    1er, 2e et 3e cycles (1ère à 9ème A.F.) : bases solides, calcul et examens d’État.
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/15 space-y-1">
                  <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wide">
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>Secondaire</span>
                  </div>
                  <p className="text-[11px] text-slate-200 leading-snug">
                    Nouveau Secondaire (NS1 à NS4) : filières scientifiques et littéraires vers l'Université.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Col: Horaires & Consigne essentielle */}
            <div className="lg:col-span-5 bg-white/10 backdrop-blur-md rounded-2xl p-5 sm:p-6 border border-white/20 space-y-4">
              <div className="flex items-center justify-between border-b border-white/15 pb-3">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                  <Clock className="w-4 h-4" />
                  <span>Permanence du Secrétariat</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold border border-emerald-400/30">
                  Ouvert aux familles
                </span>
              </div>

              <div className="space-y-3 text-xs sm:text-sm">
                <div>
                  <span className="text-slate-400 text-xs block">Jours & Horaires d'inscription :</span>
                  <p className="font-bold text-white text-base font-serif mt-0.5">
                    {req.openingHours}
                  </p>
                </div>

                <div>
                  <span className="text-slate-400 text-xs block">Frais d'inscription officiel :</span>
                  <p className="font-bold text-amber-300 text-lg font-serif mt-0.5 flex items-center gap-1.5">
                    <span>{req.registrationFee}</span>
                    <span className="text-[11px] font-sans font-normal text-slate-300">(tarif unique validé)</span>
                  </p>
                </div>

                {/* Consigne obligatoire : enfant présent */}
                <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-400/40 text-amber-200 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-xs space-y-0.5">
                    <span className="font-bold block text-amber-300 uppercase tracking-wide text-[10px]">
                      Consigne impérative d'inscription
                    </span>
                    <p className="leading-snug">
                      {req.presenceRequiredNotice}
                    </p>
                  </div>
                </div>

                {isAdmin && (
                  <div className="pt-2 border-t border-white/10 flex justify-end">
                    <button
                      type="button"
                      onClick={() => onNavigate('admin', 'cms')}
                      className="inline-flex items-center gap-1.5 text-xs text-amber-300 hover:text-amber-200 font-semibold cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Modifier ces critères dans l'Administration</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 3. CONDITIONS & PIÈCES À FOURNIR (SECTION FONDAMENTALE & SECTION SECONDAIRE SÉPARÉES) */}
      <section id="conditions" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        
        <div className="text-center max-w-3xl mx-auto mb-8 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-900 text-xs font-semibold uppercase tracking-wider">
            <FileText className="w-3.5 h-3.5 text-blue-900" />
            <span>Dossier Officiel d'Inscription {req.academicYear}</span>
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900">
            Conditions & Pièces Exigées par Section
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Veuillez réunir l'ensemble des originaux et photocopies certifiées avant de vous présenter au secrétariat du collège (Delmas 50, rue Dominique #2 bis).
          </p>
        </div>

        {/* 2 Colonnes séparées : Section Fondamentale vs Section Secondaire */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          
          {/* SECTION FONDAMENTALE */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-md flex flex-col justify-between relative overflow-hidden">
            <div className="space-y-5">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-900 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                    Cycle 1, 2 & 3
                  </span>
                  <h3 className="font-serif font-bold text-xl sm:text-2xl text-slate-900">
                    Section Fondamentale
                  </h3>
                  <p className="text-xs text-slate-500">
                    De la 1ère à la 9ème Année Fondamentale (9e A.F.)
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-blue-900 text-amber-300 flex items-center justify-center font-serif font-bold text-lg shadow-sm shrink-0">
                  SF
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Pièces requises pour l'inscription :</span>
                </h4>

                <ol className="space-y-3">
                  {req.fondamentaleDocuments.map((doc, idx) => (
                    <li key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs sm:text-sm text-slate-800 leading-relaxed hover:bg-blue-50/40 transition-colors">
                      <span className="w-6 h-6 rounded-lg bg-blue-900 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                        {idx + 1}
                      </span>
                      <span className="pt-0.5 font-medium">{doc}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs text-slate-600">
                <p className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-900" />
                  <span>Horaires de dépôt : {req.openingHours}</span>
                </p>
                <p className="text-[11px] text-slate-500">
                  Les originaux vous seront immédiatement restitués après vérification de conformité par le secrétariat.
                </p>
              </div>

            </div>

            <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">Frais requis : <strong>{req.registrationFee}</strong></span>
              <button
                type="button"
                onClick={() => onNavigate('pre-registration')}
                className="px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-950 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                Préinscrire en ligne
              </button>
            </div>
          </div>

          {/* SECTION SECONDAIRE */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-md flex flex-col justify-between relative overflow-hidden">
            <div className="space-y-5">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-900 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                    Nouveau Secondaire
                  </span>
                  <h3 className="font-serif font-bold text-xl sm:text-2xl text-slate-900">
                    Section Secondaire
                  </h3>
                  <p className="text-xs text-slate-500">
                    Classes de NS1, NS2, NS3 et NS4 (Terminale / Bac)
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-purple-900 text-amber-300 flex items-center justify-center font-serif font-bold text-lg shadow-sm shrink-0">
                  SS
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Pièces requises pour l'inscription :</span>
                </h4>

                <ol className="space-y-3">
                  {req.secondaireDocuments.map((doc, idx) => (
                    <li key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs sm:text-sm text-slate-800 leading-relaxed hover:bg-purple-50/40 transition-colors">
                      <span className="w-6 h-6 rounded-lg bg-purple-900 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                        {idx + 1}
                      </span>
                      <span className="pt-0.5 font-medium">{doc}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* PIÈCES ADDITIONNELLES EXIGIBLES AU SECONDAIRE */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50/80 to-purple-50/40 border border-amber-200/80 space-y-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <h5 className="font-serif font-bold text-xs sm:text-sm text-slate-900">
                    Pièces additionnelles exigibles pour le Secondaire :
                  </h5>
                </div>
                <p className="text-[11px] text-slate-600">
                  Selon la classe d'accueil et le statut du candidat (notamment pour NS1, NS2, NS3 ou NS4) :
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs text-slate-800 font-medium">
                  {req.additionalDocuments.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-white border border-amber-200/70 shadow-2xs">
                      <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>

            <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">Frais requis : <strong>{req.registrationFee}</strong></span>
              <button
                type="button"
                onClick={() => onNavigate('pre-registration')}
                className="px-4 py-2 rounded-xl bg-purple-900 hover:bg-purple-950 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                Préinscrire en ligne
              </button>
            </div>
          </div>

        </div>

        {/* Note informative de bienveillance et de sécurité */}
        <div className="mt-8 p-5 rounded-2xl bg-blue-50/70 border border-blue-200/80 text-blue-950 text-xs sm:text-sm leading-relaxed flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="font-bold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-900" />
              <span>Processus transparent et accueil bienveillant</span>
            </span>
            <p className="text-slate-700 text-xs">
              Cette page est strictement informative et ne requiert aucun téléversement immédiat de fichiers. Les familles peuvent initier une demande numérique via notre formulaire sécurisé puis déposer les documents originaux lors de leur venue au collège.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('pre-registration')}
            className="px-5 py-2.5 rounded-xl bg-blue-900 text-white font-bold text-xs hover:bg-blue-950 transition-colors shrink-0 shadow-sm cursor-pointer"
          >
            Formulaire de Préinscription
          </button>
        </div>

      </section>

      {/* 4. PROCÉDURE EN 4 ÉTAPES */}
      <section id="admissions-procedure" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8 space-y-1.5">
          <div className="inline-block text-xs font-semibold uppercase tracking-wider text-blue-900">
            <ContentEditable
              contentKey="admissions.procedure.badge"
              defaultContent="Simplicité & Rigueur"
              as="span"
              currentUser={currentUser}
              multiline={false}
            />
          </div>
          <ContentEditable
            contentKey="admissions.procedure.title"
            defaultContent="La Procédure d'Admission en 4 Étapes"
            as="h2"
            className="font-serif text-2xl sm:text-3xl font-bold text-slate-900"
            currentUser={currentUser}
            multiline={false}
          />
          <ContentEditable
            contentKey="admissions.procedure.subtitle"
            defaultContent="Un processus clair et transparent pour accueillir au mieux votre enfant."
            as="p"
            className="text-xs sm:text-sm text-slate-600"
            currentUser={currentUser}
            multiline={true}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-5 relative">
          {[
            {
              step: '01',
              title: 'Préinscription en ligne',
              desc: 'Remplissez le formulaire numérique sur ce site pour générer votre numéro de dossier officiel.',
            },
            {
              step: '02',
              title: 'Dépôt des pièces & Étude',
              desc: 'Transmission des bulletins précédents et de l’extrait d’acte de naissance pour évaluation préliminaire.',
            },
            {
              step: '03',
              title: 'Test d’aptitude & Entretien',
              desc: 'Convocation de l’élève pour un test diagnostique bienveillant et rencontre d’orientation avec la famille.',
            },
            {
              step: '04',
              title: 'Confirmation & Inscription',
              desc: 'Validation officielle de l’admission, remise du livret d’accueil et finalisation des formalités.',
            },
          ].map((item, idx) => (
            <div 
              key={idx} 
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs relative flex flex-col justify-between"
            >
              <div>
                <span className="font-mono text-2xl font-bold text-blue-900/30 block mb-1.5">
                  {item.step}
                </span>
                <h3 className="font-serif font-bold text-sm sm:text-base text-slate-900 mb-1.5">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Foire aux Questions (FAQ) */}
      <section id="admissions-faq" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 scroll-mt-24">
        <div className="text-center space-y-2">
          <div className="inline-block text-xs font-semibold uppercase tracking-wider text-blue-900">
            <ContentEditable
              contentKey="admissions.faq.badge"
              defaultContent="Réponses & Éclaircissements"
              as="span"
              currentUser={currentUser}
              multiline={false}
            />
          </div>
          <ContentEditable
            contentKey="admissions.faq.title"
            defaultContent="Questions Fréquentes"
            as="h2"
            className="font-serif text-2xl sm:text-3xl font-bold text-slate-900"
            currentUser={currentUser}
            multiline={false}
          />
          <ContentEditable
            contentKey="admissions.faq.subtitle"
            defaultContent="Retrouvez les réponses aux interrogations courantes des futurs parents."
            as="p"
            className="text-xs sm:text-sm text-slate-600"
            currentUser={currentUser}
            multiline={true}
          />
        </div>

        <div className="space-y-3 pt-4">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm transition-all"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full text-left p-5 flex items-center justify-between gap-4 font-serif font-bold text-sm sm:text-base text-slate-900 hover:text-blue-900 cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span>{faq.question}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${
                    isOpen ? 'rotate-180 text-blue-900' : ''
                  }`} />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* CTA Banner */}
        <div className="mt-10 p-8 rounded-3xl bg-blue-900 text-white text-center space-y-4 shadow-xl">
          <ContentEditable
            contentKey="admissions.cta.title"
            defaultContent="Vous avez d'autres questions sur l'admission ?"
            as="h3"
            className="font-serif text-xl sm:text-2xl font-bold"
            currentUser={currentUser}
            multiline={false}
          />
          <ContentEditable
            contentKey="admissions.cta.subtitle"
            defaultContent="Notre secrétariat d'admission est à votre écoute pour vous conseiller et vous accueillir lors des permanences hebdomadaires à Delmas 50."
            as="p"
            className="text-xs sm:text-sm text-slate-200 max-w-lg mx-auto"
            currentUser={currentUser}
            multiline={true}
          />
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('contact')}
              className="px-5 py-2.5 rounded-xl bg-white text-blue-950 font-semibold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Poser une question au secrétariat
            </button>
            <button
              type="button"
              onClick={() => onNavigate('pre-registration')}
              className="px-5 py-2.5 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs hover:bg-amber-300 transition-colors cursor-pointer"
            >
              Remplir la préinscription
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
