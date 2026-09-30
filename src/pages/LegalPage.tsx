import React from 'react';
import { SCHOOL_INFO } from '../data/mockData';

export const LegalPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 space-y-8">
      <div className="space-y-2 border-b border-slate-200 pb-4">
        <span className="text-xs font-semibold uppercase tracking-widest text-blue-900">
          Informations Réglementaires
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900">
          Mentions Légales
        </h1>
        <p className="text-xs text-slate-500">
          Dernière mise à jour : Septembre 2026
        </p>
      </div>

      <div className="prose prose-slate max-w-none space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
        <section className="space-y-2">
          <h2 className="font-serif text-lg font-bold text-slate-900">1. Éditeur de la Plateforme</h2>
          <p>
            Le site officiel du <strong>Collège Isaac Newton</strong> est édité par la Direction Générale de l'établissement :
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Dénomination :</strong> Collège Isaac Newton (CIN)</li>
            <li><strong>Devise :</strong> « Savoir aujourd'hui, réussir demain »</li>
            <li><strong>Adresse :</strong> {SCHOOL_INFO.address}</li>
            <li><strong>Téléphone :</strong> {SCHOOL_INFO.phone}</li>
            <li><strong>Courrier électronique :</strong> {SCHOOL_INFO.email}</li>
            <li><strong>Directeur de la publication :</strong> Direction Générale du Collège Isaac Newton</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-lg font-bold text-slate-900">2. Propriété Intellectuelle & Droits Réservés</h2>
          <p>
            Tous les contenus textuels, photographies du campus, logo typographique et éléments graphiques présents sur ce site sont la propriété exclusive du Collège Isaac Newton ou font l'objet d'une autorisation d'utilisation régulière.
          </p>
          <p>
            Toute reproduction, représentation, modification ou publication totale ou partielle de ces éléments est expressément interdite sans accord écrit préalable de la direction.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif text-lg font-bold text-slate-900">3. Hébergement & Sécurité</h2>
          <p>
            La plateforme est hébergée sur des infrastructures cloud hautement sécurisées respectant les normes de disponibilité et d'intégrité des données éducatives.
          </p>
        </section>
      </div>
    </div>
  );
};
