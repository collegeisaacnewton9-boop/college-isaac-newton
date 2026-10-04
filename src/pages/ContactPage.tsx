import React, { useState } from 'react';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle2, 
  ShieldCheck, 
  Building,
  Navigation,
  ExternalLink
} from 'lucide-react';
import { SCHOOL_INFO } from '../data/mockData';
import { apiService } from '../services/api';
import { ContactFormData } from '../types';
import { validateEmail, validatePhone, formatPhoneNumber } from '../utils/validation';

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    fullName: '',
    email: '',
    phone: '',
    subject: 'Renseignement général',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.message) {
      setError('Veuillez renseigner votre nom, adresse email et votre message.');
      return;
    }

    const emailCheck = validateEmail(formData.email);
    if (!emailCheck.isValid) {
      setError(emailCheck.error || 'Format d\'adresse email non valide.');
      return;
    }

    if (formData.phone && formData.phone.trim()) {
      const phoneCheck = validatePhone(formData.phone);
      if (!phoneCheck.isValid) {
        setError(phoneCheck.error || 'Format de numéro de téléphone non valide.');
        return;
      }
    }

    setLoading(true);
    setError(null);
    try {
      await apiService.sendContactMessage(formData);
      setSuccess(true);
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        subject: 'Renseignement général',
        message: '',
      });
    } catch {
      setError("Une erreur est survenue lors de l'envoi de votre message.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 sm:py-5 space-y-4 sm:space-y-5">
      
      {/* Header - Compact */}
      <div className="max-w-2xl space-y-0.5">
        <span className="text-[10px] font-bold uppercase tracking-widest text-blue-900 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
          Secrétariat & Accueil des Familles · Delmas 50
        </span>
        <h1 className="font-serif text-xl sm:text-2xl font-bold text-slate-900">
          Contactez le Collège Isaac Newton
        </h1>
        <p className="text-[11px] sm:text-xs text-slate-600">
          Notre équipe pédagogique et administrative vous accueille à Delmas 50 et répond à toutes vos questions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
        
        {/* Left Col: Contact Info & Horaires Card (5 cols) */}
        <div className="lg:col-span-5 space-y-3.5">
          
          {/* Card reproducing the exact institutional "Contact & Horaires" visual */}
          <div className="bg-[#0f172a] text-white rounded-2xl p-4 sm:p-5 space-y-4 shadow-lg border border-slate-800">
            <div>
              <h2 className="font-serif text-lg font-bold text-white tracking-wide">
                Contact & Horaires
              </h2>
              <div className="w-10 h-0.5 bg-amber-400 mt-1.5 rounded-full" />
            </div>

            <div className="space-y-3 text-xs text-slate-200">
              {/* Address */}
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-400/10 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div>
                  <p className="font-semibold text-white">Delmas 50, Haïti</p>
                  <p className="text-[10px] text-slate-400">Campus Principal · Secrétariat</p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-400/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Phone className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div>
                  <a 
                    href={`tel:${SCHOOL_INFO.phone}`} 
                    className="font-mono font-bold text-white hover:text-amber-400 transition-colors"
                  >
                    {SCHOOL_INFO.phone}
                  </a>
                  <p className="text-[10px] text-slate-400">Ligne directe secrétariat</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-400/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Mail className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div>
                  <a 
                    href={`mailto:${SCHOOL_INFO.email}`} 
                    className="font-medium text-slate-200 hover:text-amber-400 transition-colors break-all"
                  >
                    {SCHOOL_INFO.email}
                  </a>
                  <p className="text-[10px] text-slate-400">Réponse sous 24h ouvrées</p>
                </div>
              </div>

              {/* Class Hours */}
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-400/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div>
                  <p className="font-semibold text-white">Lun - Ven : 7:30 AM - 2:00 PM</p>
                  <p className="text-[10px] text-slate-400">Horaires réguliers de cours</p>
                </div>
              </div>

              {/* Secretariat Hours */}
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-400/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div>
                  <p className="font-semibold text-amber-300">Secrétariat ouvert jusqu'à 3:30 PM</p>
                  <p className="text-[10px] text-slate-400">Dépôt de dossiers, reçus & renseignements</p>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="pt-2.5 border-t border-slate-800/80 flex flex-wrap gap-2">
              <a
                href={`tel:${SCHOOL_INFO.phone}`}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Appeler maintenant</span>
              </a>
              <a
                href="https://maps.google.com/?q=Delmas+50+Haiti"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium text-xs transition-colors"
              >
                <Navigation className="w-3.5 h-3.5 text-amber-400" />
                <span>Itinéraire</span>
              </a>
            </div>
          </div>

          {/* Quick Access Note */}
          <div className="bg-white rounded-xl p-3 sm:p-3.5 border border-slate-200/80 shadow-2xs space-y-1 text-xs">
            <h3 className="font-serif font-bold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-900" />
              <span>Accès & Sécurité Campus (Delmas 50)</span>
            </h3>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Le campus dispose d'un poste de contrôle à l'entrée, d'un parking intérieur et d'une aire surveillée pour la sécurité intégrale des élèves.
            </p>
          </div>
        </div>

        {/* Right Col: Contact Form (7 cols) - Dense & Ergonomic */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs">
          <div className="border-b border-slate-100 pb-2 mb-3">
            <h2 className="font-serif text-base sm:text-lg font-bold text-slate-900">
              Formulaire de Contact Direct
            </h2>
            <p className="text-[11px] text-slate-500">
              Remplissez les champs ci-dessous pour joindre notre équipe administrative.
            </p>
          </div>

          {success && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Message transmis avec succès. Le secrétariat vous répondra très prochainement.</span>
            </div>
          )}

          {error && (
            <div className="mb-4 p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nom et prénom *
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Ex : M. Pierre Paul"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm focus:border-blue-900 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Numéro de téléphone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: formatPhoneNumber(e.target.value) })}
                  placeholder="+509 3721-1818"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm focus:border-blue-900 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Adresse e-mail valide *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="votre.email@exemple.com"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm focus:border-blue-900 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Objet de la demande
                </label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm focus:border-blue-900 outline-none bg-white cursor-pointer"
                >
                  <option value="Renseignement général">Renseignement général</option>
                  <option value="Admissions & Inscriptions">Admissions & Inscriptions {SCHOOL_INFO.currentYear}</option>
                  <option value="Visite du Campus Delmas 50">Visite du Campus à Delmas 50</option>
                  <option value="Vie scolaire & Pédagogie">Vie scolaire & Pédagogie</option>
                  <option value="Laboratoire & Numérique">Laboratoire & Numérique</option>
                  <option value="Rendez-vous Direction">Rendez-vous avec la direction</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Votre message *
              </label>
              <textarea
                rows={3}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Précisez votre demande ou vos questions..."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs sm:text-sm focus:border-blue-900 outline-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs sm:text-sm transition-colors shadow-xs disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 text-amber-400" />
              <span>{loading ? 'Transmission en cours...' : 'Envoyer mon message'}</span>
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};
