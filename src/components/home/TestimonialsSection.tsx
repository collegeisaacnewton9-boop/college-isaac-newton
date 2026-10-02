import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, 
  Quote, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  MessageSquare, 
  Heart, 
  GraduationCap, 
  Users,
  Pause,
  Play,
  Award,
  Sparkles,
  PlusCircle,
  X,
  Send,
  Building,
  ShieldCheck
} from 'lucide-react';
import { INITIAL_TESTIMONIALS } from '../../data/mockData';
import { Testimonial } from '../../types';

interface TestimonialSectionProps {
  onNavigate?: (page: string, subSection?: string) => void;
}

export const TestimonialSection: React.FC<TestimonialSectionProps> = ({ onNavigate }) => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(INITIAL_TESTIMONIALS);
  const [activeTab, setActiveTab] = useState<string>('TOUS');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // New testimonial form state
  const [newAuthor, setNewAuthor] = useState('');
  const [newRole, setNewRole] = useState('Parent d’élève');
  const [newClass, setNewClass] = useState('');
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(5);

  const categories = [
    { id: 'TOUS', label: 'Tous les avis' },
    { id: 'Parent d’élève', label: 'Parents d’élèves' },
    { id: 'Élève / Lauréat', label: 'Élèves & Lauréats' },
    { id: 'Enseignant', label: 'Corps professoral' },
  ];

  const filteredTestimonials = testimonials.filter((t) => {
    if (activeTab === 'TOUS') return true;
    if (activeTab === 'Élève / Lauréat') {
      return t.relationship === 'Ancien élève / Lauréat' || t.relationship === 'Élève';
    }
    return t.relationship === activeTab;
  });

  const total = filteredTestimonials.length;

  // Auto-play slideshow (pauses on hover)
  useEffect(() => {
    if (!isPlaying || total <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % total);
    }, 6000);

    return () => clearInterval(timer);
  }, [isPlaying, total, currentIndex]);

  // Reset index when filter changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [activeTab]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % total);
  };

  const currentItem = filteredTestimonials[currentIndex] || filteredTestimonials[0];
  const nextItem = filteredTestimonials[(currentIndex + 1) % total] || currentItem;
  const previousItem = filteredTestimonials[(currentIndex - 1 + total) % total] || currentItem;

  const handleSubmitNewTestimonial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuthor.trim() || !newComment.trim()) return;

    const initials = newAuthor
      .split(' ')
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'CI';

    const relationshipValue = 
      newRole.includes('Parent') ? 'Parent d’élève' : 
      newRole.includes('Prof') ? 'Enseignant' : 'Élève';

    const newEntry: Testimonial = {
      id: `test-user-${Date.now()}`,
      authorName: newAuthor.trim(),
      role: `${newRole}${newClass ? ` (${newClass})` : ''}`,
      relationship: relationshipValue as any,
      cycleOrClass: newClass || 'Collège Isaac Newton',
      comment: newComment.trim(),
      rating: newRating,
      avatarInitials: initials,
      year: '2026',
      verified: true,
    };

    setTestimonials([newEntry, ...testimonials]);
    setSubmittedSuccess(true);
    setTimeout(() => {
      setSubmittedSuccess(false);
      setIsModalOpen(false);
      setNewAuthor('');
      setNewComment('');
      setNewClass('');
      setActiveTab('TOUS');
      setCurrentIndex(0);
    }, 1800);
  };

  return (
    <section 
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6" 
      aria-label="Carrousel des témoignages élèves et parents"
      onMouseEnter={() => setIsPlaying(false)}
      onMouseLeave={() => setIsPlaying(true)}
    >
      {/* 1. Header with Trust Badge & Tabs */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-5 gap-3 border-b border-slate-100 pb-3">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-900 mb-1">
            <Award className="w-4 h-4 text-amber-500" />
            <span>Prestige & Crédibilité Académique</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
            Témoignages des Élèves, Parents & Lauréats
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl font-light">
            Découvrez la confiance des familles et les récits de réussite des élèves formés à la rigueur du Collège Isaac Newton (Delmas 50).
          </p>
        </div>

        {/* Filter Tabs & Add Review Button */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex p-1 bg-slate-100 rounded-xl text-xs">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  activeTab === cat.id
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
            title="Partager votre expérience au collège"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Donner un avis</span>
          </button>
        </div>
      </div>

      {/* 2. Key Academic Trust Metrics Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mb-6">
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-900/10 text-blue-900 flex items-center justify-center shrink-0">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div>
            <div className="font-serif font-bold text-slate-900 text-base leading-none">100%</div>
            <div className="text-[10px] text-slate-500 font-medium mt-0.5">Réussite Examens d’État</div>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-900/10 text-emerald-800 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="font-serif font-bold text-slate-900 text-base leading-none">98.4%</div>
            <div className="text-[10px] text-slate-500 font-medium mt-0.5">Satisfaction des Parents</div>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-900/10 text-amber-700 flex items-center justify-center shrink-0">
            <Building className="w-4 h-4" />
          </div>
          <div>
            <div className="font-serif font-bold text-slate-900 text-base leading-none">15+ Ans</div>
            <div className="text-[10px] text-slate-500 font-medium mt-0.5">Tradition d’Excellence</div>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-900/10 text-purple-800 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="font-serif font-bold text-slate-900 text-base leading-none">Pôle Tech</div>
            <div className="text-[10px] text-slate-500 font-medium mt-0.5">Postes sous Onduleurs</div>
          </div>
        </div>
      </div>

      {/* 3. MAIN PRESTIGE CAROUSEL CONTAINER */}
      <div className="relative bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 rounded-2xl sm:rounded-3xl p-5 sm:p-8 lg:p-10 text-white shadow-xl overflow-hidden border border-slate-800">
        
        {/* Subtle Decorative Background Quotation Icon */}
        <div className="absolute right-4 bottom-4 text-white/5 pointer-events-none select-none">
          <Quote className="w-64 h-64 sm:w-80 sm:h-80" />
        </div>

        {/* Carousel Header Bar: Counter, Category badge & Autoplay Controls */}
        <div className="flex items-center justify-between gap-3 pb-4 mb-5 border-b border-white/10 relative z-10">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-xs font-bold font-mono">
              {currentIndex + 1} / {total}
            </span>
            <span className="text-xs text-amber-300/90 font-medium">
              {currentItem?.relationship}
            </span>
            {currentItem?.year && (
              <span className="hidden sm:inline-block text-[11px] text-slate-400">
                · Année {currentItem.year}
              </span>
            )}
          </div>

          {/* Autoplay & Arrows */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1.5 px-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/90 hover:text-white transition-colors text-xs flex items-center gap-1.5 cursor-pointer"
              title={isPlaying ? 'Mettre le carrousel en pause' : 'Lancer le défilement automatique'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span className="text-[11px] hidden sm:inline">{isPlaying ? 'Pause' : 'Lecture'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrev}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/25 text-white transition-all cursor-pointer active:scale-95 shadow-xs"
              aria-label="Témoignage précédent"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/25 text-white transition-all cursor-pointer active:scale-95 shadow-xs"
              aria-label="Témoignage suivant"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Animated Carousel Body (Framer Motion Slide & Fade) */}
        <AnimatePresence mode="wait">
          {currentItem && (
            <motion.div
              key={currentItem.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center min-h-[220px]"
            >
              
              {/* Primary Testimonial Text & Author */}
              <div className="lg:col-span-8 space-y-4">
                
                {/* Rating & Verified Tag */}
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center gap-0.5">
                    {[...Array(currentItem.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-amber-300 text-xs font-semibold font-mono">5.0 / 5.0</span>
                  {currentItem.verified && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium ml-2 bg-emerald-950/70 border border-emerald-800/80 px-2.5 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>Témoignage certifié</span>
                    </span>
                  )}
                </div>

                {/* Big, evocative quote */}
                <blockquote className="font-serif text-base sm:text-xl lg:text-2xl text-slate-100 italic leading-relaxed font-normal">
                  « {currentItem.comment} »
                </blockquote>

                {/* Author Avatar, Name & Academic details */}
                <div className="flex items-center gap-3.5 pt-2">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 via-amber-300 to-amber-200 text-slate-950 font-bold text-base flex items-center justify-center shadow-lg shadow-amber-400/20 shrink-0 select-none">
                    {currentItem.avatarInitials}
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-base sm:text-lg text-white">
                      {currentItem.authorName}
                    </h4>
                    <p className="text-xs text-slate-300">
                      {currentItem.role}
                    </p>
                    {currentItem.cycleOrClass && (
                      <span className="inline-block mt-1 text-[11px] font-mono font-medium text-amber-300 bg-white/10 px-2.5 py-0.5 rounded border border-white/15">
                        {currentItem.cycleOrClass}
                      </span>
                    )}
                  </div>
                </div>

              </div>

              {/* Side Teaser: Upcoming Testimonial Preview on Desktop */}
              <div className="hidden lg:flex lg:col-span-4 flex-col justify-between bg-white/5 rounded-2xl p-5 border border-white/10 backdrop-blur-xs min-h-[220px]">
                <div>
                  <div className="flex items-center justify-between text-[11px] font-mono uppercase text-amber-400 font-bold tracking-wider">
                    <span>Avis suivant</span>
                    <span className="text-slate-400 font-normal">({(currentIndex + 1) % total + 1}/{total})</span>
                  </div>
                  <p className="text-xs text-slate-300 italic line-clamp-4 mt-2.5 font-light leading-relaxed">
                    « {nextItem.comment} »
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-white/10 flex items-center justify-between text-xs">
                  <div className="truncate mr-2">
                    <p className="font-semibold text-slate-200 truncate">{nextItem.authorName}</p>
                    <p className="text-[10px] text-slate-400 truncate">{nextItem.role}</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="text-amber-300 hover:text-white font-medium flex items-center gap-1 cursor-pointer text-xs shrink-0 bg-white/10 px-2.5 py-1 rounded-lg hover:bg-white/20 transition-colors"
                  >
                    <span>Suivant</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

        {/* Carousel Progress Dots & Navigation */}
        <div className="flex items-center justify-center gap-1.5 pt-6 mt-4 border-t border-white/10 relative z-10">
          {filteredTestimonials.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                idx === currentIndex 
                  ? 'w-8 bg-amber-400 shadow-sm shadow-amber-400/50' 
                  : 'w-2 bg-white/30 hover:bg-white/60'
              }`}
              title={`Aller à l'avis ${idx + 1}`}
              aria-label={`Aller au témoignage ${idx + 1}`}
            />
          ))}
        </div>

      </div>

      {/* 4. Footer Reassurance & Action Bar */}
      <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 bg-slate-50 border border-slate-200/80 rounded-xl p-3 sm:px-4">
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-rose-500 fill-rose-500 shrink-0" />
          <span className="font-semibold text-slate-800">
            Une communauté soudée et engagée
          </span>
          <span className="text-slate-300 hidden sm:inline">·</span>
          <span className="hidden sm:inline text-slate-600">
            Suivi personnalisé des devoirs, réunions parents-professeurs régulières
          </span>
        </div>

        <button
          type="button"
          onClick={() => onNavigate?.('pre-registration')}
          className="font-bold text-blue-900 hover:text-blue-950 hover:underline flex items-center gap-1 cursor-pointer shrink-0"
        >
          <span>Rejoindre notre établissement</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 5. MODAL: "Donner un avis / Partager un témoignage" */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-5 sm:p-6 overflow-hidden relative"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-blue-50 text-blue-900">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-lg text-slate-900">
                      Partagez votre expérience
                    </h3>
                    <p className="text-xs text-slate-500">
                      Votre avis contribue au rayonnement du Collège Isaac Newton.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {submittedSuccess ? (
                <div className="py-8 text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="font-serif font-bold text-lg text-slate-900">
                    Merci pour votre témoignage !
                  </h4>
                  <p className="text-xs text-slate-600 max-w-xs mx-auto">
                    Votre avis a été certifié et ajouté au carrousel officiel avec succès.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmitNewTestimonial} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Votre Nom complet *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Dr. Jean-Claude Pierre"
                      value={newAuthor}
                      onChange={(e) => setNewAuthor(e.target.value)}
                      className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-900"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Votre Rôle *
                      </label>
                      <select
                        value={newRole}
                        onChange={(e) => setNewRole(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-900"
                      >
                        <option value="Parent d’élève">Parent d’élève</option>
                        <option value="Élève">Élève</option>
                        <option value="Ancien élève / Lauréat">Ancien élève / Lauréat</option>
                        <option value="Enseignant">Enseignant</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Classe ou Cycle concerné
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: 9ème AF, NS4..."
                        value={newClass}
                        onChange={(e) => setNewClass(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Votre Note de satisfaction
                    </label>
                    <div className="flex items-center gap-1 py-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewRating(star)}
                          className="p-1 cursor-pointer focus:outline-none"
                        >
                          <Star
                            className={`w-5 h-5 ${
                              star <= newRating 
                                ? 'fill-amber-400 text-amber-400' 
                                : 'text-slate-300'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="text-xs font-mono font-bold text-slate-700 ml-2">
                        {newRating} / 5
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Votre Témoignage *
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Partagez vos impressions sur la discipline, l'encadrement, les professeurs ou les examens d'État..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-900 resize-none"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-950 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Publier mon avis</span>
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

export const TestimonialsSection = TestimonialSection;
