import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Article, StandingsRow, Columnist } from '../data/portalData';
import { SidebarWidgets } from './SidebarWidgets';

interface CategoryBlockSectionProps {
  articles: Article[];
  standings: StandingsRow[];
  columnists?: Columnist[];
  onSelectArticle: (article: Article) => void;
  onSelectCategory: (category: string) => void;
  onOpenStandingsModal: () => void;
  onOpenSubscribe: () => void;
  onShowToast: (message: string, type?: 'success' | 'error') => void;
  onOpenAdModal?: () => void;
}

export const CategoryBlockSection: React.FC<CategoryBlockSectionProps> = ({
  articles,
  standings,
  columnists,
  onSelectArticle,
  onSelectCategory,
  onOpenStandingsModal,
  onOpenSubscribe,
  onShowToast,
  onOpenAdModal
}) => {
  const futebolArticles = articles.filter(a => a.category.toLowerCase() === 'futebol').slice(0, 3);
  const corridaArticles = articles.filter(a => a.category.toLowerCase() === 'corrida de rua').slice(0, 2);
  const ciclismoArticles = articles.filter(a => a.category.toLowerCase() === 'ciclismo').slice(0, 2);

  const onSelectArticleById = (id: string) => {
    const art = articles.find(a => a.id === id);
    if (art) onSelectArticle(art);
  };

  return (
    <section className="py-8 transition-colors" aria-label="Notícias por modalidade esportiva e barra lateral">
      <div className="max-w-[1240px] mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start">
          {/* LEFT: Category Blocks */}
          <div className="space-y-10 min-w-0">
            {/* 1. Futebol Block */}
            <div>
              <div className="flex items-center justify-between pb-2 border-b-2 border-gray-200 dark:border-gray-800 mb-4">
                <div>
                  <h3 className="font-condensed font-black text-2xl text-[#1e3a8a] dark:text-[#facc15] uppercase tracking-wide">
                    Futebol
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Análises táticas, bastidores e cobertura dos campeonatos</p>
                </div>
                <button
                  onClick={() => onSelectCategory('Futebol')}
                  className="text-xs font-bold text-[#1e3a8a] dark:text-blue-400 hover:text-[#dc2626] dark:hover:text-[#facc15] uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>Ver Mais</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-3.5">
                {futebolArticles.map((art) => (
                  <div
                    key={art.id}
                    onClick={() => onSelectArticle(art)}
                    className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-[#1e3a8a] dark:hover:border-blue-500 rounded-xl p-3.5 sm:p-4 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col sm:flex-row gap-4 items-start"
                  >
                    <div
                      className="w-full sm:w-48 h-32 rounded-lg shrink-0 overflow-hidden relative"
                      style={{ background: art.imageBg }}
                    >
                      <span className="absolute top-2 left-2 bg-[#dc2626] text-white text-[10px] font-condensed font-bold uppercase px-2 py-0.5 rounded-full">
                        {art.subcategory || 'Futebol'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-condensed font-bold text-lg sm:text-xl text-gray-900 dark:text-gray-100 group-hover:text-[#1e3a8a] dark:group-hover:text-[#facc15] transition-colors uppercase leading-tight line-clamp-2 mb-1.5">
                        {art.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed mb-2">
                        {art.dek}
                      </p>
                      <div className="text-[11px] text-gray-400 dark:text-gray-400 font-medium flex items-center gap-2">
                        <span>Por {art.author.name}</span>
                        <span>•</span>
                        <span>{art.readTime}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Corrida de Rua Block */}
            <div>
              <div className="flex items-center justify-between pb-2 border-b-2 border-gray-200 dark:border-gray-800 mb-4">
                <div>
                  <h3 className="font-condensed font-black text-2xl text-[#1e3a8a] dark:text-[#facc15] uppercase tracking-wide">
                    Corrida de Rua
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Calendário nacional, dicas de treino e maratonas</p>
                </div>
                <button
                  onClick={() => onSelectCategory('Corrida de Rua')}
                  className="text-xs font-bold text-[#1e3a8a] dark:text-blue-400 hover:text-[#dc2626] dark:hover:text-[#facc15] uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>Ver Mais</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-3.5">
                {corridaArticles.map((art) => (
                  <div
                    key={art.id}
                    onClick={() => onSelectArticle(art)}
                    className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-[#1e3a8a] dark:hover:border-blue-500 rounded-xl p-3.5 sm:p-4 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col sm:flex-row gap-4 items-start"
                  >
                    <div
                      className="w-full sm:w-48 h-32 rounded-lg shrink-0 overflow-hidden relative"
                      style={{ background: art.imageBg }}
                    >
                      <span className="absolute top-2 left-2 bg-[#dc2626] text-white text-[10px] font-condensed font-bold uppercase px-2 py-0.5 rounded-full">
                        {art.subcategory || 'Corrida'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-condensed font-bold text-lg sm:text-xl text-gray-900 dark:text-gray-100 group-hover:text-[#1e3a8a] dark:group-hover:text-[#facc15] transition-colors uppercase leading-tight line-clamp-2 mb-1.5">
                        {art.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed mb-2">
                        {art.dek}
                      </p>
                      <div className="text-[11px] text-gray-400 dark:text-gray-400 font-medium flex items-center gap-2">
                        <span>Por {art.author.name}</span>
                        <span>•</span>
                        <span>{art.readTime}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Ciclismo Block */}
            <div>
              <div className="flex items-center justify-between pb-2 border-b-2 border-gray-200 dark:border-gray-800 mb-4">
                <div>
                  <h3 className="font-condensed font-black text-2xl text-[#1e3a8a] dark:text-[#facc15] uppercase tracking-wide">
                    Ciclismo
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Estradas, pistas, grandes voltas e a elite nacional</p>
                </div>
                <button
                  onClick={() => onSelectCategory('Ciclismo')}
                  className="text-xs font-bold text-[#1e3a8a] dark:text-blue-400 hover:text-[#dc2626] dark:hover:text-[#facc15] uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>Ver Mais</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-3.5">
                {ciclismoArticles.map((art) => (
                  <div
                    key={art.id}
                    onClick={() => onSelectArticle(art)}
                    className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-[#1e3a8a] dark:hover:border-blue-500 rounded-xl p-3.5 sm:p-4 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col sm:flex-row gap-4 items-start"
                  >
                    <div
                      className="w-full sm:w-48 h-32 rounded-lg shrink-0 overflow-hidden relative"
                      style={{ background: art.imageBg }}
                    >
                      <span className="absolute top-2 left-2 bg-[#1e3a8a] text-white text-[10px] font-condensed font-bold uppercase px-2 py-0.5 rounded-full">
                        {art.subcategory || 'Ciclismo'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-condensed font-bold text-lg sm:text-xl text-gray-900 dark:text-gray-100 group-hover:text-[#1e3a8a] dark:group-hover:text-[#facc15] transition-colors uppercase leading-tight line-clamp-2 mb-1.5">
                        {art.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed mb-2">
                        {art.dek}
                      </p>
                      <div className="text-[11px] text-gray-400 dark:text-gray-400 font-medium flex items-center gap-2">
                        <span>Por {art.author.name}</span>
                        <span>•</span>
                        <span>{art.readTime}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: Sidebar Widgets */}
          <SidebarWidgets
            standings={standings}
            columnists={columnists}
            onOpenStandingsModal={onOpenStandingsModal}
            onOpenSubscribe={onOpenSubscribe}
            onSelectArticleById={onSelectArticleById}
            onShowToast={onShowToast}
            onOpenAdModal={onOpenAdModal}
          />
        </div>
      </div>
    </section>
  );
};
