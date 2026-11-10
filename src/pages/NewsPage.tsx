import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Calendar, 
  User, 
  ArrowLeft, 
  ArrowRight, 
  Share2, 
  Tag, 
  BookOpen, 
  Clock, 
  Check, 
  Bell, 
  Send, 
  Loader2, 
  AlertCircle,
  Sparkles,
  Phone,
  Mail,
  CheckCircle2,
  X
} from 'lucide-react';
import { NewsArticle } from '../types';
import { apiService } from '../services/api';
import { getMediaImageUrl } from '../utils/cacheBuster';
import { ResponsiveLazyImage } from '../components/common/ResponsiveLazyImage';
import { validateEmail, validatePhone } from '../utils/validation';
import { toast } from 'sonner';

interface NewsPageProps {
  selectedArticleId?: string | null;
  onClearSelectedArticle?: () => void;
  onNavigate?: (page: string, subSection?: string) => void;
}

export const NewsPage: React.FC<NewsPageProps> = ({ 
  selectedArticleId, 
  onClearSelectedArticle,
  onNavigate 
}) => {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tous');

  // Formulaire d'abonnement aux alertes
  const [subEmail, setSubEmail] = useState('');
  const [subName, setSubName] = useState('');
  const [subPhone, setSubPhone] = useState('');
  const [subPref, setSubPref] = useState('toutes');
  const [subLoading, setSubLoading] = useState(false);
  const [subSuccess, setSubSuccess] = useState(false);
  const [subError, setSubError] = useState<string | null>(null);

  useEffect(() => {
    apiService.getNews().then(data => {
      setNews(data);
      if (selectedArticleId) {
        const found = data.find(a => a.id === selectedArticleId);
        if (found) {
          setSelectedArticle(found);
        }
      }
    });
  }, [selectedArticleId]);

  // Synchronisation si selectedArticleId change depuis l'extérieur (ex: click sur la Home)
  useEffect(() => {
    if (selectedArticleId && news.length > 0) {
      const found = news.find(a => a.id === selectedArticleId);
      if (found) {
        setSelectedArticle(found);
      }
    }
  }, [selectedArticleId, news]);

  // Extraction dynamique des catégories
  const categories = useMemo(() => {
    const set = new Set<string>(['Tous']);
    news.forEach(art => {
      if (art.category && art.category.trim()) {
        set.add(art.category.trim());
      }
    });
    // Compléter avec les catégories classiques si la liste est courte
    ['Admissions', 'Technologie', 'Vie scolaire', 'Résultats'].forEach(c => set.add(c));
    return Array.from(set);
  }, [news]);

  const filteredNews = useMemo(() => {
    return news.filter(art => {
      const matchesCategory = selectedCategory === 'Tous' || art.category?.toLowerCase() === selectedCategory.toLowerCase();
      const q = search.toLowerCase().trim();
      const matchesSearch = !q || 
        art.title?.toLowerCase().includes(q) || 
        art.excerpt?.toLowerCase().includes(q) ||
        art.category?.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [news, selectedCategory, search]);

  const handleBack = () => {
    setSelectedArticle(null);
    if (onClearSelectedArticle) onClearSelectedArticle();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleShare = async (article: NewsArticle) => {
    const shareData = {
      title: article.title,
      text: article.excerpt,
      url: window.location.href
    };

    if (navigator.share && typeof navigator.share === 'function') {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Lien de l’article copié dans le presse-papier !');
    } catch {
      toast.error('Impossible de copier le lien.');
    }
  };

  const handleSubscribeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubError(null);

    if (!subEmail.trim() || !subName.trim()) {
      setSubError('Veuillez renseigner votre nom et une adresse email valide.');
      return;
    }

    const emailCheck = validateEmail(subEmail);
    if (!emailCheck.isValid) {
      setSubError(emailCheck.error || 'Adresse e-mail non valide.');
      return;
    }

    if (subPhone.trim()) {
      const phoneCheck = validatePhone(subPhone);
      if (!phoneCheck.isValid) {
        setSubError(phoneCheck.error || 'Numéro de téléphone non valide.');
        return;
      }
    }

    setSubLoading(true);
    try {
      await apiService.sendContactMessage({
        fullName: subName.trim(),
        email: subEmail.trim(),
        phone: subPhone.trim(),
        subject: `[Abonnement Alertes & Communiqués] ${subName.trim()} - Préférence: ${subPref}`,
        message: `Inscription aux alertes et communiqués officiels du Collège Isaac Newton.
- Destinataire : ${subName.trim()}
- E-mail : ${subEmail.trim()}
- Téléphone : ${subPhone.trim() || 'Non renseigné'}
- Préférence d'alertes : ${subPref === 'toutes' ? 'Toutes les actualités' : subPref === 'urgences' ? 'Urgences & dates d’examens' : 'Résultats & vie scolaire'}`
      });

      setSubSuccess(true);
      toast.success('Abonnement validé ! Vous recevrez les prochains communiqués.');
    } catch {
      setSubError('Une erreur est survenue lors de l’inscription. Veuillez réessayer.');
    } finally {
      setSubLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // VUE 1 : ARTICLE COMPLET (LECTURE CONFORTABLE & DENSE)
  // ---------------------------------------------------------------------------
  if (selectedArticle) {
    const otherArticles = news.filter(a => a.id !== selectedArticle.id).slice(0, 3);

    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-5 font-sans">
        
        {/* Barre de retour et partage rapide */}
        <div className="flex items-center justify-between gap-3 text-xs">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-1.5 font-bold text-blue-900 hover:text-blue-950 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Retour aux actualités</span>
          </button>

          <button
            type="button"
            onClick={() => handleShare(selectedArticle)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors cursor-pointer"
            title="Partager cet article"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Partager</span>
          </button>
        </div>

        {/* Fiche Article */}
        <article className="bg-white rounded-2xl overflow-hidden shadow-xs border border-slate-200/90 space-y-4">
          
          {/* Couverture optimisée avec scrim mesuré */}
          <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full max-h-[340px] overflow-hidden bg-slate-950">
            <ResponsiveLazyImage
              src={getMediaImageUrl(selectedArticle.coverImage, selectedArticle.id, selectedArticle.publishedAt)}
              alt={selectedArticle.title}
              preset="hero"
              darkPlaceholder
              containerClassName="w-full h-full"
              loading="eager"
              fetchPriority="high"
              decoding="async"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent pointer-events-none" />
            <div className="absolute bottom-4 left-4 right-4 text-white space-y-1">
              <span className="text-[11px] font-mono uppercase tracking-wider text-amber-300 font-bold">
                {selectedArticle.category || 'Communiqué Officiel'}
              </span>
              <h1 className="font-serif text-lg sm:text-2xl lg:text-3xl font-bold text-white leading-snug text-balance">
                {selectedArticle.title}
              </h1>
            </div>
          </div>

          <div className="px-4 sm:px-7 pb-6 space-y-4">
            {/* Métadonnées épurées unboxed avec séparateurs */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 border-b border-slate-100 pb-3">
              <span className="flex items-center gap-1 text-slate-700 font-medium">
                <Calendar className="w-3.5 h-3.5 text-blue-900" />
                <span>
                  {new Date(selectedArticle.publishedAt).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
              </span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="flex items-center gap-1 text-slate-700">
                <User className="w-3.5 h-3.5 text-blue-900" />
                <span>{selectedArticle.authorName || 'Direction du Collège'}</span>
              </span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="flex items-center gap-1 text-slate-500">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Lecture : 2 min</span>
              </span>
            </div>

            {/* Extrait d'introduction mis en valeur */}
            {selectedArticle.excerpt && (
              <p className="font-serif italic text-sm sm:text-base text-slate-800 leading-relaxed border-l-2 border-blue-900 pl-3 py-0.5">
                {selectedArticle.excerpt}
              </p>
            )}

            {/* Corps du texte lisible et aéré */}
            <div className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal whitespace-pre-line space-y-3 max-w-prose">
              {selectedArticle.content}
            </div>

            {/* Pied de l'article avec actions */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="text-slate-500 text-[11px]">
                Publié par la Direction de la communication · Collège Isaac Newton (Delmas 50)
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold cursor-pointer"
                >
                  Toutes les actualités
                </button>
                {onNavigate && (
                  <button
                    type="button"
                    onClick={() => onNavigate('pre-registration')}
                    className="px-3 py-1.5 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-semibold cursor-pointer"
                  >
                    Préinscription
                  </button>
                )}
              </div>
            </div>
          </div>
        </article>

        {/* Suggestions d'articles connexes pour fluidifier le parcours */}
        {otherArticles.length > 0 && (
          <section className="space-y-3 pt-2">
            <h3 className="font-serif font-bold text-base text-slate-900">
              Autres actualités récentes
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {otherArticles.map((art) => (
                <div
                  key={art.id}
                  onClick={() => {
                    setSelectedArticle(art);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="bg-white rounded-xl p-3 border border-slate-200 hover:border-blue-900 transition-all cursor-pointer group space-y-1.5"
                >
                  <span className="text-[10px] font-mono text-blue-900 font-bold uppercase block">
                    {art.category || 'Actualité'}
                  </span>
                  <h4 className="font-serif font-bold text-xs text-slate-900 group-hover:text-blue-900 line-clamp-2 leading-snug">
                    {art.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-tight">
                    {art.excerpt}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // VUE 2 : LISTE COMPACTE ET DENSE DES ACTUALITÉS
  // ---------------------------------------------------------------------------
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-5 sm:space-y-6 font-sans">
      
      {/* 1. Header Compact */}
      <section className="space-y-2">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-medium">
          <span className="text-blue-900 font-bold uppercase tracking-wider">Vie Scolaire</span>
          <span aria-hidden="true" className="text-slate-300">/</span>
          <span>Communiqués & Publications Officielles</span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span>Delmas 50</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 sm:gap-6 items-baseline">
          <div className="lg:col-span-7">
            <h1 className="font-serif text-2xl sm:text-4xl font-bold text-slate-900 tracking-tight text-balance">
              Actualités du Collège Isaac Newton
            </h1>
          </div>
          <div className="lg:col-span-5">
            <p className="text-xs sm:text-sm text-slate-600 leading-snug">
              Annonces officielles, célébrations, innovations numériques et temps forts de la communauté éducative.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Barre d'outils unifiée : Filtres Catégories & Recherche en direct */}
      <section className="bg-slate-100/80 p-2 sm:p-2.5 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        
        {/* Sélecteur de Catégories compact */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pb-0.5 sm:pb-0">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-900 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Champ de Recherche compact avec effacement */}
        <div className="relative min-w-[200px] sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par mot-clé..."
            className="w-full pl-8 pr-7 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-900 transition-all"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
              aria-label="Effacer la recherche"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

      </section>

      {/* Décompte discret des articles */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono px-1">
        <span>{filteredNews.length} publication{filteredNews.length > 1 ? 's' : ''} disponible{filteredNews.length > 1 ? 's' : ''}</span>
        {selectedCategory !== 'Tous' && (
          <button
            type="button"
            onClick={() => { setSelectedCategory('Tous'); setSearch(''); }}
            className="text-blue-900 underline font-semibold cursor-pointer"
          >
            Réinitialiser les filtres
          </button>
        )}
      </div>

      {/* 3. Grille Dense & Responsive d'Articles (1 col mobile, 2 col tablette, 3 col desktop) */}
      {filteredNews.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
          <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
          <h3 className="font-serif font-bold text-sm text-slate-800">Aucune actualité trouvée</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Aucun article ne correspond à vos filtres actuels. Essayez avec d'autres mots-clés.
          </p>
          <button
            type="button"
            onClick={() => { setSelectedCategory('Tous'); setSearch(''); }}
            className="mt-2 px-3 py-1.5 rounded-lg bg-blue-900 text-white text-xs font-semibold cursor-pointer"
          >
            Afficher toutes les actualités
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {filteredNews.map((art) => (
            <article
              key={art.id}
              onClick={() => {
                setSelectedArticle(art);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="bg-white rounded-xl overflow-hidden border border-slate-200/90 shadow-2xs hover:shadow-xs hover:border-blue-900/60 transition-all cursor-pointer flex flex-col group justify-between"
            >
              <div>
                {/* Image 16:9 avec chargement différé et cache optimisé */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-900">
                  <ResponsiveLazyImage
                    src={getMediaImageUrl(art.coverImage, art.id, art.publishedAt)}
                    alt={art.title}
                    preset="news"
                    aspectRatio="video"
                    containerClassName="w-full h-full"
                    imgClassName="group-hover:scale-104 transition-transform duration-300"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute top-2 left-2 bg-slate-950/80 backdrop-blur-xs text-amber-300 text-[10px] font-mono px-2 py-0.5 rounded font-semibold border border-white/10">
                    {art.category || 'Actualité'}
                  </div>
                </div>

                {/* Corps de la carte dense */}
                <div className="p-3.5 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[10.5px] text-slate-400 font-mono">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>
                      {new Date(art.publishedAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>

                  <h3 className="font-serif font-bold text-sm text-slate-900 group-hover:text-blue-900 transition-colors leading-snug line-clamp-2">
                    {art.title}
                  </h3>

                  <p className="text-[11.5px] text-slate-600 line-clamp-2 leading-relaxed">
                    {art.excerpt}
                  </p>
                </div>
              </div>

              {/* Pied de carte avec lien fluide */}
              <div className="px-3.5 py-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-blue-900">
                <span>Lire la suite</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </article>
          ))}
        </div>
      )}

      {/* 4. NOUVEAU FORMULAIRE MODERNE : ALERTE INFO & NOTIFICATIONS OFFICIELLES */}
      <section className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-1.5 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <Bell className="w-3.5 h-3.5 text-amber-400" />
              <span>Restez Connectés · Collège Isaac Newton</span>
            </div>
            <h2 className="font-serif text-base sm:text-lg font-bold text-white mt-0.5">
              Recevoir les communiqués officiels par email
            </h2>
            <p className="text-xs text-slate-300">
              Inscrivez-vous pour être prévenu en direct des dates d’examens, convocations et actualités du campus.
            </p>
          </div>
          <div className="text-xs text-slate-400 font-mono hidden sm:block">
            Sans spam · Désinscription libre
          </div>
        </div>

        {subSuccess ? (
          <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-center space-y-1.5">
            <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center mx-auto">
              <Check className="w-4 h-4" />
            </div>
            <h3 className="font-serif font-bold text-xs sm:text-sm text-emerald-200">Abonnement confirmé avec succès !</h3>
            <p className="text-[11px] text-emerald-300/90 max-w-md mx-auto">
              Vous êtes bien inscrit sur la liste de diffusion officielle du Collège Isaac Newton.
            </p>
            <button
              type="button"
              onClick={() => {
                setSubSuccess(false);
                setSubEmail('');
                setSubName('');
                setSubPhone('');
              }}
              className="text-[11px] font-bold text-amber-300 underline cursor-pointer mt-1"
            >
              Ajouter une autre adresse
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubscribeSubmit} className="space-y-2.5 text-xs">
            {subError && (
              <div className="p-2.5 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-200 flex items-center gap-2 text-xs">
                <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>{subError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="space-y-1">
                <label className="font-medium text-slate-300 text-[11px] block">
                  Nom et prénom <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={subName}
                  onChange={(e) => setSubName(e.target.value)}
                  placeholder="ex: Patrick Cadet"
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 text-xs outline-none focus:border-amber-400 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-slate-300 text-[11px] block">
                  Adresse e-mail <span className="text-amber-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={subEmail}
                  onChange={(e) => setSubEmail(e.target.value)}
                  placeholder="nom@exemple.com"
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 text-xs outline-none focus:border-amber-400 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-slate-300 text-[11px] block">
                  Téléphone (SMS / WhatsApp)
                </label>
                <input
                  type="tel"
                  value={subPhone}
                  onChange={(e) => setSubPhone(e.target.value)}
                  placeholder="+509 3700-0000"
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 text-xs outline-none focus:border-amber-400 transition-colors font-mono"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
              <div className="flex items-center gap-3 text-[11px] text-slate-300">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="pref"
                    checked={subPref === 'toutes'}
                    onChange={() => setSubPref('toutes')}
                    className="accent-amber-400"
                  />
                  <span>Toutes actualités</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="pref"
                    checked={subPref === 'urgences'}
                    onChange={() => setSubPref('urgences')}
                    className="accent-amber-400"
                  />
                  <span>Urgences & Examens</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={subLoading}
                className="px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60 shadow-xs"
              >
                {subLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Enregistrement...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>S'abonner aux alertes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </section>

    </div>
  );
};
