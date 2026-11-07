import React, { useState } from 'react';
import { 
  Users, 
  Sparkles, 
  Clock, 
  ShieldCheck, 
  Trophy, 
  Music, 
  Code, 
  MessageSquare,
  ArrowRight,
  CheckCircle2,
  FileText,
  Download,
  Shirt,
  PhoneOff,
  BookOpenCheck,
  HeartPulse,
  Compass,
  Calendar,
  ChevronRight,
  Info,
  Loader2
} from 'lucide-react';
import { SCHOOL_IMAGES } from '../assets/images';
import { ContentEditable } from '../components/common/ContentEditable';
import { ImageEditable } from '../components/common/ImageEditable';
import { officialDocumentsPdfService } from '../services/officialDocumentsPdfService';
import { toast } from 'sonner';
import { User } from '../types';

interface SchoolLifePageProps {
  onNavigate: (page: string) => void;
  currentUser?: User | null;
}

export const SchoolLifePage: React.FC<SchoolLifePageProps> = ({ onNavigate, currentUser }) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleDownloadReglement = async () => {
    try {
      setIsGeneratingPdf(true);
      toast.info('Génération du Règlement Intérieur officiel...', { duration: 2500 });
      const result = await officialDocumentsPdfService.generateReglementInterieurPdf({
        paperFormat: 'A4',
      });
      if (result && typeof result.downloadBlob === 'function') {
        result.downloadBlob();
        toast.success('Règlement Intérieur officiel téléchargé avec succès');
      } else {
        toast.error('Erreur lors du téléchargement du fichier.');
      }
    } catch (error) {
      console.error('Erreur génération règlement:', error);
      toast.error('Impossible de générer le document. Veuillez réessayer.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="space-y-10 sm:space-y-16 py-6 sm:py-10 font-sans text-slate-800">
      
      {/* 1. Header & Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl space-y-3.5">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-900">
            <span className="w-2 h-2 rounded-full bg-blue-900" />
            <ContentEditable
              contentKey="schoollife.hero.badge"
              defaultContent="Épanouissement & Citoyenneté"
              as="span"
              currentUser={currentUser}
              multiline={false}
            />
          </div>
          <ContentEditable
            contentKey="schoollife.hero.title"
            defaultContent="La Vie Scolaire au Quotidien"
            as="h1"
            className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 tracking-tight"
            currentUser={currentUser}
            multiline={false}
          />
          <ContentEditable
            contentKey="schoollife.hero.subtitle"
            defaultContent="Une école vivante où chaque élève grandit dans le respect des règles, le goût de l'effort, la camaraderie et la pratique d'activités culturelles et scientifiques."
            as="p"
            className="text-base sm:text-lg text-slate-600 leading-relaxed font-light"
            currentUser={currentUser}
            multiline={true}
          />
        </div>

        {/* Institutional Highlights Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-8 pt-6 border-t border-slate-200">
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 sm:p-4">
            <div className="flex items-center gap-2 text-blue-900 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Accueil matinal</span>
            </div>
            <p className="font-serif font-bold text-lg sm:text-xl text-slate-900">Dès 07h15</p>
            <p className="text-[11px] text-slate-600">Fermeture des grilles à 07h30</p>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 sm:p-4">
            <div className="flex items-center gap-2 text-blue-900 mb-1">
              <Shirt className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Uniforme Officiel</span>
            </div>
            <p className="font-serif font-bold text-lg sm:text-xl text-slate-900">100% Obligatoire</p>
            <p className="text-[11px] text-slate-600">Haut blanc & écusson brodé</p>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 sm:p-4">
            <div className="flex items-center gap-2 text-blue-900 mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Salut au drapeau</span>
            </div>
            <p className="font-serif font-bold text-lg sm:text-xl text-slate-900">Chaque lundi</p>
            <p className="text-[11px] text-slate-600">Rassemblement civique & cohésion</p>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 sm:p-4">
            <div className="flex items-center gap-2 text-blue-900 mb-1">
              <Code className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Ateliers & Clubs</span>
            </div>
            <p className="font-serif font-bold text-lg sm:text-xl text-slate-900">4 Pôles d'excellence</p>
            <p className="text-[11px] text-slate-600">Robotique, débats, échecs, chorale</p>
          </div>
        </div>
      </section>

      {/* 2. Cérémonie civique & Esprit de corps (Photo officielle CIN) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          <div className="lg:col-span-6 space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-600">
              <ShieldCheck className="w-4 h-4" />
              <ContentEditable
                contentKey="schoollife.civic.badge"
                defaultContent="Valeurs Républicaines & Discipline"
                as="span"
                currentUser={currentUser}
                multiline={false}
              />
            </div>
            <ContentEditable
              contentKey="schoollife.civic.title"
              defaultContent="Le Rassemblement Civique : Fierté et Cohésion"
              as="h2"
              className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight"
              currentUser={currentUser}
              multiline={false}
            />
            <ContentEditable
              contentKey="schoollife.civic.p1"
              defaultContent="Chaque semaine débute par le salut solennel aux couleurs nationales sur l'esplanade du collège. Ce moment fédérateur réunit l'ensemble des élèves en uniforme réglementaire, le corps professoral et la direction."
              as="p"
              className="text-sm sm:text-base text-slate-700 leading-relaxed"
              currentUser={currentUser}
              multiline={true}
            />
            <ContentEditable
              contentKey="schoollife.civic.p2"
              defaultContent="C'est l'occasion de rappeler les valeurs d'assiduité, de solidarité et d'amour de la patrie, tout en félicitant publiquement les élèves qui se sont distingués par leurs mérites scolaires ou leur comportement exemplaire."
              as="p"
              className="text-sm sm:text-base text-slate-700 leading-relaxed"
              currentUser={currentUser}
              multiline={true}
            />

            {/* Structured highlights */}
            <div className="space-y-2 pt-1 text-xs sm:text-sm text-slate-700 font-medium">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Exécution solennelle de l'hymne national « La Dessalinienne »</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Proclamation périodique du Tableau d'Honneur et encouragements officiels</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Sensibilisation civique, éthique républicaine et respect du bien commun</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-blue-50/80 border-l-4 border-blue-900 text-xs sm:text-sm text-blue-950 italic">
              <ContentEditable
                contentKey="schoollife.civic.quote"
                defaultContent="« Le respect des autres et la fierté de son établissement constituent les fondations solides de tout futur citoyen éclairé. »"
                as="div"
                currentUser={currentUser}
                multiline={true}
              />
            </div>
          </div>

          {/* Genuine CIN Flag Assembly Photo with ImageEditable uploader */}
          <div className="lg:col-span-6">
            <div className="rounded-2xl overflow-hidden shadow-lg border border-slate-200 bg-slate-900">
              <ImageEditable
                contentKey="schoollife.civic.image"
                defaultImage={SCHOOL_IMAGES.studentsAssembly || '/images/slide_students_flag_assembly.webp'}
                alt="Rassemblement civique et salut au drapeau par les élèves du Collège Isaac Newton"
                label="Modifier la photo officielle du Rassemblement Civique"
                currentUser={currentUser}
                containerClassName="relative aspect-[4/3] sm:aspect-video w-full overflow-hidden bg-slate-900"
              />
              <div className="p-3.5 sm:p-4 bg-slate-900 text-white text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <p className="font-semibold text-amber-300">Photo officielle du Collège Isaac Newton</p>
                    <p className="text-slate-300 text-[11px]">Cérémonie solennelle du salut aux couleurs sur la cour d'honneur</p>
                  </div>
                </div>
                <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-950 text-blue-200 border border-blue-800">
                  Uniforme réglementaire
                </span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 3. Cadre de Vie Réglementé (Standardisé & Moderne) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Section Header */}
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-900">
            <ShieldCheck className="w-4 h-4" />
            <ContentEditable
              contentKey="schoollife.rules.badge"
              defaultContent="Cadre de Vie Réglementé"
              as="span"
              currentUser={currentUser}
              multiline={false}
            />
          </div>
          <ContentEditable
            contentKey="schoollife.rules.title"
            defaultContent="Standards de Vie Scolaire & Règlement Intérieur"
            as="h2"
            className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight"
            currentUser={currentUser}
            multiline={false}
          />
          <ContentEditable
            contentKey="schoollife.rules.desc"
            defaultContent="Le Collège Isaac Newton attache une importance primordiale à la propreté, à la ponctualité et à la dignité de la tenue. Les règles ci-dessous s'appliquent à tous les élèves afin d'assurer un cadre propice à l'apprentissage, à l'émulation saine et à la sérénité commune."
            as="p"
            className="text-sm sm:text-base text-slate-600 leading-relaxed"
            currentUser={currentUser}
            multiline={true}
          />
        </div>

        {/* Standard Institutional Rule Cards (6 Articles Standardisés) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          
          {/* Article 1 : Tenue & Uniforme */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:border-blue-300 transition-all space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-900 flex items-center justify-center">
                <Shirt className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-900 bg-blue-50 px-2 py-0.5 rounded">
                Art. 1 · Uniforme
              </span>
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-slate-900">Tenue & Écusson Réglementaires</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Le port de l'uniforme officiel complet est impératif dès le portail d'entrée jusqu'à la fin de la journée scolaire.
              </p>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-700 pt-1 border-t border-slate-100">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-900 mt-1.5 shrink-0" />
                <span>Haut blanc impeccable avec écusson officiel brodé du Collège</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-900 mt-1.5 shrink-0" />
                <span>Pantalon ou jupe bleu marine institutionnel, chaussures fermées sombres</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-900 mt-1.5 shrink-0" />
                <span>Coiffure et présentation sobres, tenue de sport réservée aux séances d'EPS</span>
              </li>
            </ul>
          </div>

          {/* Article 2 : Horaires & Ponctualité */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:border-blue-300 transition-all space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                Art. 2 · Horaires
              </span>
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-slate-900">Horaires, Ponctualité & Assiduité</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                L'assiduité à tous les cours et la ponctualité constituent des devoirs fondamentaux de chaque élève.
              </p>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-700 pt-1 border-t border-slate-100">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 shrink-0" />
                <span>Accueil dès 07h15, début des cours et rassemblement solennel à 07h30</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 shrink-0" />
                <span>Fermeture stricte des grilles à 07h30 ; enregistrement systématique des retards</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 shrink-0" />
                <span>Toute absence doit être justifiée par écrit par les parents sous 24h</span>
              </li>
            </ul>
          </div>

          {/* Article 3 : Discipline & Respect */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:border-blue-300 transition-all space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                Art. 3 · Civisme
              </span>
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-slate-900">Discipline & Respect Mutuel</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Le climat scolaire repose sur l'écoute, la politesse, la bienveillance et la protection des biens collectifs.
              </p>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-700 pt-1 border-t border-slate-100">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                <span>Courtoisie et respect absolu envers enseignants, personnel et pairs</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                <span>Tolérance zéro envers les violences verbales, physiques ou brimades</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                <span>Respect rigoureux de la propreté du campus et du mobilier scolaire</span>
              </li>
            </ul>
          </div>

          {/* Article 4 : Téléphones & Numérique */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:border-blue-300 transition-all space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-lg bg-red-50 text-red-700 flex items-center justify-center">
                <PhoneOff className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-red-700 bg-red-50 px-2 py-0.5 rounded">
                Art. 4 · Numérique
              </span>
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-slate-900">Appareils Électroniques & Téléphones</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Préservation de la concentration en classe et protection de la vie privée au sein de l'établissement.
              </p>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-700 pt-1 border-t border-slate-100">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1.5 shrink-0" />
                <span>Téléphones portables strictement éteints et rangés dans le sac dès l'entrée</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1.5 shrink-0" />
                <span>Interdiction absolue de filmer ou d'enregistrer des personnes sur le campus</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1.5 shrink-0" />
                <span>Accès aux écrans uniquement au laboratoire informatique sous supervision</span>
              </li>
            </ul>
          </div>

          {/* Article 5 : Carnet de Liaison */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:border-blue-300 transition-all space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
                <BookOpenCheck className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                Art. 5 · Liaison
              </span>
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-slate-900">Carnet de Correspondance Officiel</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Le document obligatoire assurant la communication constante entre la famille et le collège.
              </p>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-700 pt-1 border-t border-slate-100">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                <span>Présence obligatoire chaque jour dans le cartable de l'élève</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                <span>Visa régulier obligatoire des parents pour devoirs, notes et convocations</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                <span>Présentation immédiate à tout contrôle de la vie scolaire ou de la direction</span>
              </li>
            </ul>
          </div>

          {/* Article 6 : Sécurité & Santé */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:border-blue-300 transition-all space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                <HeartPulse className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                Art. 6 · Sécurité
              </span>
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-slate-900">Sécurité, Hygiène & Santé</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Un campus clos et surveillé garantissant la protection et le bien-être physique de tous.
              </p>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-700 pt-1 border-t border-slate-100">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-600 mt-1.5 shrink-0" />
                <span>Interdiction de quitter l'enceinte avant la fin des cours sans bon officiel</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-600 mt-1.5 shrink-0" />
                <span>Poste de premiers secours et prise en charge rapide en cas d'indisposition</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-600 mt-1.5 shrink-0" />
                <span>Respect strict des protocoles d'hygiène et tri ordonné des déchets</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Official Charter PDF Download & Secretary Contact Bar */}
        <div className="bg-gradient-to-r from-slate-900 to-blue-950 text-white rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-md border border-slate-800">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-300">
              <FileText className="w-4 h-4" />
              <span>Document Administratif Officiel · Édition 2026-2027</span>
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-white">
              Règlement Intérieur & Charte de Vie Scolaire
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
              Téléchargez le texte officiel complet (3 pages, format certifié ISO 32000-1) contresigné par la Direction Pédagogique et applicable à chaque élève inscrit.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 w-full md:w-auto">
            <button
              type="button"
              onClick={handleDownloadReglement}
              disabled={isGeneratingPdf}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Génération en cours...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Télécharger le Règlement (PDF)</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => onNavigate('contact')}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs border border-white/20 transition-all cursor-pointer"
            >
              <Info className="w-4 h-4" />
              <span>Contacter la Vie Scolaire</span>
            </button>
          </div>
        </div>

      </section>

      {/* 4. Une Journée Type au Collège */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="max-w-2xl space-y-1.5">
            <div className="inline-block text-xs font-semibold uppercase tracking-wider text-blue-900">
              Rythme & Organisation
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
              Une Journée Type au Collège Isaac Newton
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Une structuration équilibrée des temps d'apprentissage, de détente et d'activités culturelles.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            
            <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
              <span className="text-xs font-bold text-blue-900 font-mono">07h15 — 07h30</span>
              <h4 className="font-serif font-bold text-sm text-slate-900 mt-1">Accueil & Rassemblement</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Accueil dans la cour, salut au drapeau le lundi matin, consignes du jour et entrée calme en classe.
              </p>
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
              <span className="text-xs font-bold text-blue-900 font-mono">07h30 — 10h00</span>
              <h4 className="font-serif font-bold text-sm text-slate-900 mt-1">Session Académique 1</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Cours fondamentaux (Mathématiques, Français, Sciences). Concentration maximale et cours théoriques.
              </p>
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
              <span className="text-xs font-bold text-amber-700 font-mono">10h00 — 10h30</span>
              <h4 className="font-serif font-bold text-sm text-slate-900 mt-1">Récréation Surveillée</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Pause collation, oxygénation et échanges cordiaux sous la vigilance continue des surveillants.
              </p>
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
              <span className="text-xs font-bold text-blue-900 font-mono">10h30 — 13h00</span>
              <h4 className="font-serif font-bold text-sm text-slate-900 mt-1">Session Académique 2</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Travaux dirigés, séances au laboratoire d'informatique et langues vivantes (Anglais & Espagnol).
              </p>
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
              <span className="text-xs font-bold text-amber-700 font-mono">13h00 — 14h00</span>
              <h4 className="font-serif font-bold text-sm text-slate-900 mt-1">Pause Méridienne</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Déjeuner, lecture en bibliothèque, détente et préparation aux ateliers d'après-midi.
              </p>
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
              <span className="text-xs font-bold text-blue-900 font-mono">14h00 — 16h00</span>
              <h4 className="font-serif font-bold text-sm text-slate-900 mt-1">Clubs & Études Dirigées</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Ateliers périscolaires (Codage, Débat, Échecs, Chorale), soutien scolaire personnalisé ou devoirs surveillés.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 5. Les Clubs & Activités Périscolaires */}
      <section className="bg-slate-100/70 py-10 sm:py-14 border-y border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10 space-y-2">
            <div className="inline-block text-xs font-semibold uppercase tracking-wider text-blue-900">
              <ContentEditable
                contentKey="schoollife.clubs.badge"
                defaultContent="Talents & Passions"
                as="span"
                currentUser={currentUser}
                multiline={false}
              />
            </div>
            <ContentEditable
              contentKey="schoollife.clubs.title"
              defaultContent="Clubs Pédagogiques & Activités Périscolaires"
              as="h2"
              className="font-serif text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight"
              currentUser={currentUser}
              multiline={false}
            />
            <ContentEditable
              contentKey="schoollife.clubs.subtitle"
              defaultContent="Des ateliers hebdomadaires pour approfondir les compétences, stimuler la curiosité et révéler les vocations."
              as="p"
              className="text-xs sm:text-sm text-slate-600"
              currentUser={currentUser}
              multiline={true}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            
            <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs hover:border-blue-400 hover:shadow-md transition-all space-y-3.5 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center">
                    <Code className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-semibold text-blue-900 bg-blue-50 px-2 py-0.5 rounded">
                    Mercredi 14h
                  </span>
                </div>
                <h3 className="font-serif font-bold text-base text-slate-900">Club Codage & Robotique</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Initiation aux langages informatiques, programmation d'animations interactives et montage de projets technologiques concrets au laboratoire.
                </p>
              </div>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <span>Cycles 3 & Secondaire</span>
                <span className="text-blue-900 font-semibold">Labo Multimédia</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs hover:border-amber-400 hover:shadow-md transition-all space-y-3.5 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                    Mercredi 14h
                  </span>
                </div>
                <h3 className="font-serif font-bold text-base text-slate-900">Club Débat & Éloquence</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Apprentissage de la prise de parole en public, techniques de rhétorique, argumentation structurée et joutes oratoires en français et anglais.
                </p>
              </div>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <span>Tous cycles</span>
                <span className="text-amber-700 font-semibold">Salle Polyvalente</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs hover:border-emerald-400 hover:shadow-md transition-all space-y-3.5 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    Vendredi 14h
                  </span>
                </div>
                <h3 className="font-serif font-bold text-base text-slate-900">Club d'Échecs & Stratégie</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Développement de la concentration, de la vision prospective et de la patience à travers le noble jeu d'échecs et des tournois internes.
                </p>
              </div>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <span>Tous niveaux</span>
                <span className="text-emerald-700 font-semibold">Tournois Réguliers</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs hover:border-purple-400 hover:shadow-md transition-all space-y-3.5 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                    <Music className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                    Jeudi 14h
                  </span>
                </div>
                <h3 className="font-serif font-bold text-base text-slate-900">Chorale & Arts Plastiques</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Sensibilité artistique, chant choral polyphonique et réalisation d'expositions pour les grandes célébrations annuelles de l'école.
                </p>
              </div>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <span>Tous cycles</span>
                <span className="text-purple-700 font-semibold">Spectacles Annuels</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 6. Call to Action / Admissions */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <h3 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
          Rejoignez la communauté du Collège Isaac Newton
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
          Offrez à votre enfant un environnement d'apprentissage structuré, stimulant et profondément attaché aux valeurs républicaines et citoyennes.
        </p>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate('pre-registration')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-semibold text-xs shadow-md transition-all cursor-pointer"
          >
            <span>Inscrire votre enfant au Collège</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onNavigate('contact')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-xs transition-all cursor-pointer"
          >
            <span>Prendre rendez-vous avec la Direction</span>
          </button>
        </div>
      </section>

    </div>
  );
};
