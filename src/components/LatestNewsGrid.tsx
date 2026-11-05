import React from 'react';
import { Article } from '../data/portalData';

interface LatestNewsGridProps {
  articles: Article[];
  onSelectArticle: (article: Article) => void;
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
}

export const LatestNewsGrid: React.FC<LatestNewsGridProps> = ({
  articles,
  onSelectArticle,
  selectedFilter,
  onFilterChange
}) => {
  const filterCategories = [
    'Todas',
    'Futebol',
    'Corrida de Rua',
    'Ciclismo',
    'Esportes',
    'Política'
  ];

  const filtered = selectedFilter === 'Todas'
    ? articles
    : articles.filter(a => a.category === selectedFilter);

  const getBadgeClass = (category: string) => {
    switch (category) {
      case 'Futebol':
        return 'bg-[#dc2626] text-white';
      case 'Corrida de Rua':
        return 'bg-[#dc2626] text-white';
      case 'Ciclismo':
        return 'bg-[#1e3a8a] text-white';
      case 'Política':
        return 'bg-[#1e3a8a] text-white';
      case 'Esportes':
        return 'bg-[#0f766e] text-white';
      default:
        return 'bg-gray-800 text-white';
    }
  };

  return (
    <section className="py-8 border-t border-gray-200" aria-labelledby="latest-title">
      <div className="max-w-[1240px] mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 pb-3 border-b-2 border-gray-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#dc2626] animate-pulse"></span>
              <h2 id="latest-title" className="font-condensed font-black text-2xl sm:text-3xl text-[#1e3a8a] uppercase tracking-wide">
                Últimas Notícias
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Atualizadas em tempo real pela nossa redação esportiva
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar pb-1">
            {filterCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => onFilterChange(cat)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all shrink-0 cursor-pointer ${
                  selectedFilter === cat
                    ? 'bg-[#1e3a8a] text-white shadow-xs'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 3-Column Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.slice(0, 6).map((art) => (
            <article
              key={art.id}
              onClick={() => onSelectArticle(art)}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs hover:shadow-lg transition-all duration-200 hover:-translate-y-1 flex flex-col cursor-pointer group"
            >
              {/* Card Image Banner */}
              <div
                className="h-44 relative overflow-hidden"
                style={{ background: art.imageBg }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent"></div>
                <div className="absolute top-3 left-3 z-10">
                  <span className={`text-[11px] font-condensed font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-xs ${getBadgeClass(art.category)}`}>
                    {art.category} {art.subcategory ? `• ${art.subcategory}` : ''}
                  </span>
                </div>
                <div className="absolute bottom-2 right-3 z-10 text-[11px] font-semibold text-white/90 bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded">
                  {art.readTime}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 sm:p-5 flex flex-col flex-1">
                <h3 className="font-condensed font-bold text-xl text-gray-900 group-hover:text-[#1e3a8a] transition-colors uppercase leading-tight line-clamp-2 mb-2">
                  {art.title}
                </h3>
                <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed mb-4 flex-1">
                  {art.dek}
                </p>

                {/* Footer Metadata */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#1e3a8a] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                      {art.author.avatar}
                    </span>
                    <span className="font-medium text-gray-700 truncate max-w-[110px]">
                      {art.author.name}
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-400">
                    {art.readCount}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
