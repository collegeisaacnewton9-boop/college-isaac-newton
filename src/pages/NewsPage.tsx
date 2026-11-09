import React, { useState, useEffect } from 'react';
import { Search, Calendar, User, ArrowLeft, ArrowRight, Share2, Tag, BookOpen } from 'lucide-react';
import { NewsArticle } from '../types';
import { apiService } from '../services/api';
import { getMediaImageUrl } from '../utils/cacheBuster';
import { ResponsiveLazyImage } from '../components/common/ResponsiveLazyImage';

interface NewsPageProps {
  selectedArticleId?: string | null;
  onClearSelectedArticle?: () => void;
}

export const NewsPage: React.FC<NewsPageProps> = ({ 
  selectedArticleId, 
  onClearSelectedArticle 
}) => {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tous');

  useEffect(() => {
    apiService.getNews().then(data => {
      setNews(data);
      if (selectedArticleId) {
        const found = data.find(a => a.id === selectedArticleId);
        if (found) setSelectedArticle(found);
      }
    });
  }, [selectedArticleId]);

  const categories = ['Tous', 'Admissions', 'Technologie', 'Vie scolaire', 'Pédagogie'];

  const filteredNews = news.filter(art => {
    const matchesCategory = selectedCategory === 'Tous' || art.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = art.title.toLowerCase().includes(search.toLowerCase()) || 
                          art.excerpt.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleBack = () => {
    setSelectedArticle(null);
    if (onClearSelectedArticle) onClearSelectedArticle();
  };

  // FULL ARTICLE VIEW
  if (selectedArticle) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7 space-y-5">
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-blue-900 hover:text-blue-950 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour à toutes les actualités</span>
        </button>

        <article className="bg-white rounded-3xl overflow-hidden shadow-lg border border-slate-100">
          <div className="relative aspect-video sm:aspect-[21/9] w-full max-h-[380px] overflow-hidden bg-slate-900">
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
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-5 left-5 right-5 text-white space-y-1.5">
              <span className="text-xs font-mono uppercase tracking-wider text-amber-300 bg-black/40 px-2.5 py-0.5 rounded">
                {selectedArticle.category}
              </span>
              <h1 className="font-serif text-xl sm:text-3xl font-bold text-white leading-tight">
                {selectedArticle.title}
              </h1>
            </div>
          </div>

          <div className="p-5 sm:p-8 space-y-5">
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 border-b border-slate-100 pb-4">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-900" />
                <span>
                  {new Date(selectedArticle.publishedAt).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-900" />
                <span>{selectedArticle.authorName || 'Direction de la communication'}</span>
              </span>
            </div>

            <div className="text-sm sm:text-base text-slate-700 leading-relaxed font-light whitespace-pre-line space-y-4">
              {selectedArticle.content}
            </div>
          </div>
        </article>
      </div>
    );
  }

  // ARTICLES LIST VIEW
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7 lg:py-8 space-y-6 sm:space-y-8">
      
      {/* Header */}
      <div className="max-w-3xl space-y-2">
        <span className="text-xs font-semibold uppercase tracking-widest text-blue-900">
          Communiqués & Vie de l'École
        </span>
        <h1 className="font-serif text-2xl sm:text-4xl font-bold text-slate-900">
          Actualités du Collège Isaac Newton
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-light">
          Restez informés des annonces officielles, des innovations pédagogiques et des temps forts de la communauté scolaire.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        
        {/* Category Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-blue-900 text-white font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une actualité..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900"
          />
        </div>

      </div>

      {/* Grid of Articles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNews.map((art) => (
          <article
            key={art.id}
            onClick={() => setSelectedArticle(art)}
            className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col group"
          >
            <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
              <ResponsiveLazyImage
                src={getMediaImageUrl(art.coverImage, art.id, art.publishedAt)}
                alt={art.title}
                preset="news"
                aspectRatio="video"
                containerClassName="w-full h-full"
                imgClassName="group-hover:scale-105 duration-300"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-mono px-2.5 py-1 rounded">
                {art.category}
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <span className="text-[11px] text-slate-400 font-mono">
                  {new Date(art.publishedAt).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
                <h3 className="font-serif font-bold text-base text-slate-900 group-hover:text-blue-900 transition-colors mt-1">
                  {art.title}
                </h3>
                <p className="text-xs text-slate-600 line-clamp-2 mt-2 leading-relaxed">
                  {art.excerpt}
                </p>
              </div>

              <div className="flex items-center text-xs font-semibold text-blue-900 pt-3 border-t border-slate-100">
                <span>Lire l'intégralité</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 duration-150" />
              </div>
            </div>
          </article>
        ))}
      </div>

    </div>
  );
};
