import React, { useState } from 'react';
import { X, ZoomIn, Image as ImageIcon } from 'lucide-react';
import { INITIAL_GALLERY } from '../data/mockData';
import { GalleryItem } from '../types';

export const GalleryPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeItem, setActiveItem] = useState<GalleryItem | null>(null);

  const categories = [
    { id: 'all', label: 'Toutes les photos' },
    { id: 'campus', label: 'Campus & Bâtiments' },
    { id: 'laboratoire', label: 'Laboratoire Numérique' },
    { id: 'vie-scolaire', label: 'Cérémonies & Vie Scolaire' },
  ];

  const filteredItems = INITIAL_GALLERY.filter(item => {
    if (selectedCategory === 'all') return true;
    return item.category === selectedCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 space-y-10">
      
      {/* Header */}
      <div className="max-w-3xl space-y-3">
        <span className="text-xs font-semibold uppercase tracking-widest text-blue-900">
          Photothèque Officielle
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-slate-900">
          Galerie du Collège Isaac Newton
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-light">
          Aperçu visuel de nos infrastructures modernes, de nos espaces de travail informatiques et de nos rassemblements civiques.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200/80 max-w-xl">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              selectedCategory === cat.id
                ? 'bg-blue-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            onClick={() => setActiveItem(item)}
            className="group relative rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm aspect-[4/3] cursor-pointer"
          >
            <img
              src={item.imageUrl}
              alt={item.altText}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 duration-300"
            />
            <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-white/90 text-slate-900 flex items-center justify-center shadow-lg">
                <ZoomIn className="w-5 h-5" />
              </div>
            </div>
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-transparent p-4 text-white">
              <h4 className="font-serif font-bold text-sm text-white">{item.title}</h4>
              {item.caption && (
                <p className="text-[11px] text-slate-300 line-clamp-1 mt-0.5">{item.caption}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {activeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative max-w-4xl w-full bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
            <button
              onClick={() => setActiveItem(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/60 text-white hover:bg-black/90 flex items-center justify-center transition-colors"
              aria-label="Fermer la vue agrandie"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="max-h-[70vh] bg-black flex items-center justify-center">
              <img
                src={activeItem.imageUrl}
                alt={activeItem.altText}
                referrerPolicy="no-referrer"
                className="max-h-[70vh] w-auto object-contain mx-auto"
              />
            </div>
            <div className="p-6 bg-slate-900 text-white space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 bg-white/10 px-2 py-0.5 rounded">
                {activeItem.category}
              </span>
              <h3 className="font-serif font-bold text-lg text-white">{activeItem.title}</h3>
              {activeItem.caption && (
                <p className="text-xs text-slate-300 leading-relaxed">{activeItem.caption}</p>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
