import React, { useState } from 'react';
import { 
  CheckCircle2, 
  ArrowRight, 
  FileCheck, 
  ChevronDown, 
  FileText
} from 'lucide-react';
import { FAQS, SCHOOL_INFO } from '../data/mockData';
import { ContentEditable } from '../components/common/ContentEditable';
import { User } from '../types';

interface AdmissionsPageProps {
  onNavigate: (page: string) => void;
  subSection?: string;
  currentUser?: User | null;
}

export const AdmissionsPage: React.FC<AdmissionsPageProps> = ({ onNavigate, currentUser }) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="space-y-8 sm:space-y-10 lg:space-y-12 py-5 sm:py-7 lg:py-8 font-sans">
      
      {/* Header */}
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
            defaultContent={`Admissions & Inscriptions ${SCHOOL_INFO.currentYear}`}
            as="h1"
            className="font-serif text-2xl sm:text-4xl font-bold text-slate-900"
            currentUser={currentUser}
            multiline={false}
          />
          <ContentEditable
            contentKey="admissions.hero.subtitle"
            defaultContent="Découvrez la procédure d'admission pour intégrer le Collège Isaac Newton, les conditions requises et les documents à préparer."
            as="p"
            className="text-sm sm:text-base text-slate-600 leading-relaxed font-light"
            currentUser={currentUser}
            multiline={true}
          />
          <div className="pt-1.5">
            <button
              onClick={() => onNavigate('pre-registration')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-semibold text-xs sm:text-sm shadow-md transition-all active:scale-98 cursor-pointer"
            >
              <FileCheck className="w-4 h-4 text-amber-400" />
              <span>Accéder au formulaire de préinscription en ligne</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      </section>

      {/* 1. Procédure étape par étape */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

      {/* 2. Conditions d'Admission & Pièces requises */}
      <section className="bg-slate-100/70 py-8 sm:py-10 border-y border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            
            {/* Conditions */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-2xs space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <ContentEditable
                  contentKey="admissions.conditions.badge"
                  defaultContent="Critères Généraux"
                  as="span"
                  currentUser={currentUser}
                  multiline={false}
                />
              </div>
              <ContentEditable
                contentKey="admissions.conditions.title"
                defaultContent="Conditions d'Admission"
                as="h3"
                className="font-serif text-2xl font-bold text-slate-900"
                currentUser={currentUser}
                multiline={false}
              />
              <ul className="space-y-3 text-xs sm:text-sm text-slate-700">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Préscolaire :</strong> Âge requis atteint au 31 décembre de l'année en cours (3 ans pour la Petite Section).</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Cycle Fondamental :</strong> Présentation des bulletins scolaires de l'établissement précédent et attestation de passage officiel.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Nouveau Secondaire :</strong> Attestation de réussite aux examens officiels de la 9ème Année Fondamentale (pour entrée en NS1) ou relevés de notes équivalents.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Adhésion formelle de la famille au règlement intérieur et au projet éducatif de l'établissement.</span>
                </li>
              </ul>
            </div>

            {/* Dossier de pièces */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-600">
                <FileText className="w-4 h-4 text-amber-600" />
                <ContentEditable
                  contentKey="admissions.dossier.badge"
                  defaultContent="Pièces à Fournir"
                  as="span"
                  currentUser={currentUser}
                  multiline={false}
                />
              </div>
              <ContentEditable
                contentKey="admissions.dossier.title"
                defaultContent="Constitution du Dossier"
                as="h3"
                className="font-serif text-2xl font-bold text-slate-900"
                currentUser={currentUser}
                multiline={false}
              />
              <ul className="space-y-3 text-xs sm:text-sm text-slate-700">
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-800 text-[11px] font-bold flex items-center justify-center shrink-0">1</span>
                  <span>Extrait d'acte de naissance original ou copie légalisée conforme par les autorités compétentes.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-800 text-[11px] font-bold flex items-center justify-center shrink-0">2</span>
                  <span>Bulletins de notes originaux des deux dernières années scolaires écoulées.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-800 text-[11px] font-bold flex items-center justify-center shrink-0">3</span>
                  <span>Certificat de passage officiel signé et timbré par la direction de l'école d'origine.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-800 text-[11px] font-bold flex items-center justify-center shrink-0">4</span>
                  <span>Quatre (4) photos d'identité récentes en tenue correcte.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-800 text-[11px] font-bold flex items-center justify-center shrink-0">5</span>
                  <span>Fiche médicale et carnet de vaccination à jour.</span>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* 3. Foire aux Questions (FAQ) */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
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
            defaultContent="Notre secrétariat d'admission est à votre écoute pour vous conseiller et vous accueillir lors des permanences hebdomadaires."
            as="p"
            className="text-xs sm:text-sm text-slate-200 max-w-lg mx-auto"
            currentUser={currentUser}
            multiline={true}
          />
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => onNavigate('contact')}
              className="px-5 py-2.5 rounded-xl bg-white text-blue-950 font-semibold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Poser une question au secrétariat
            </button>
            <button
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
