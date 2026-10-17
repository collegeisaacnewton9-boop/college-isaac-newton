import React from 'react';
import { SCHOOL_INFO } from '../data/mockData';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6">
      <div className="space-y-2 border-b border-slate-200 pb-4">
        <span className="text-xs font-semibold uppercase tracking-widest text-blue-900">
          Protection des Données Personnelles
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900">
          Politique de Confidentialité
        </h1>
        <p className="text-xs text-slate-500">
          Protection renforcée des données des élèves mineurs et des familles
        </p>
      </div>

      <div className="prose prose-slate max-w-none space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
        <section className="space-y-2">
          <h2 className="font-serif text-lg font-bold text-slate-900">1. Collecte des Données Scolaires</h2>
          <p>
            Le Collège Isaac Newton ne collecte que les informations strictement nécessaires à la gestion pédagogique, au traitement des préinscriptions et à la sécurité des élèves :
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Identité de l'élève (nom, prénom, date de naissance, classe demandée) ;</li>
            <li>Coordonnées des parents ou tuteurs légaux (nom, téléphone, adresse email, adresse de résidence) ;</li>
            <li>Pièces justificatives d'admissibilité (bulletins de notes, attestations de passage).</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-lg font-bold text-slate-900">2. Finalité du Traitement</h2>
          <p>
            Les données recueillies via le formulaire de préinscription ou de contact sont traitées uniquement pour :
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>L'instruction des demandes d'admission pour l'année scolaire 2026-2027 ;</li>
            <li>La convocation aux tests d'aptitude et aux entretiens d'orientation ;</li>
            <li>La communication institutionnelle avec les familles.</li>
          </ul>
          <p>
            En aucun cas ces données ne font l'objet de commercialisation, de cession ou de diffusion publique à des tiers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-lg font-bold text-slate-900">3. Droits des Familles & Conservation</h2>
          <p>
            Les parents et tuteurs disposent d'un droit permanent d'accès, de rectification et d'effacement des données concernant leur enfant. Pour exercer ces droits, vous pouvez contacter le secrétariat par email à <strong className="text-blue-900">{SCHOOL_INFO.email}</strong> ou par courrier postal.
          </p>
        </section>
      </div>
    </div>
  );
};
