import React, { useState, useMemo } from 'react';
import { ArrowLeft, Filter, Clock, Trophy, Flame, PlusCircle } from 'lucide-react';
import { Article, StandingsRow } from '../data/portalData';
import { InFeedAd, SidebarAd } from './AdBanners';

interface CategoryViewProps {
  category: string;
  subcategory?: string;
  articles: Article[];
  standings: StandingsRow[];
  onSelectArticle: (article: Article) => void;
  onBackToHome: () => void;
  onOpenStandingsModal: () => void;
  onSelectSubcategory: (sub?: string) => void;
  onOpenCreateArticle?: (category?: string) => void;
  onOpenAdModal?: () => void;
}

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  Futebol:
    'Cobertura diária e em tempo real dos campeonatos regionais, nacionais e internacionais, com análises táticas, bastidores e entrevistas exclusivas.',
  'Corrida de Rua':
    'Calendário das principais maratonas e meias do Brasil, planilhas de treino, nutrição esportiva e a cobertura dos maiores pelotões urbanos.',
  Ciclismo:
    'Estrada, pista, montanha e as grandes voltas mundiais. Fique por dentro de equipamentos, desempenhos e a elite do pedal nacional.',
  Esportes:
    'Vôlei, basquete, tênis, natação, atletismo e os grandes esportes olímpicos com foco nos atletas e competições brasileiras.',
  Política:
    'Gestão esportiva, Lei Pelé, modelo SAF dos clubes, direitos de transmissão, orçamento público e debates institucionais no Congresso Nacional.',
  Editoriais:
    'Artigos opinativos e ensaios críticos aprofundados sobre a cultura, o espetáculo e os rumos do esporte no Brasil.'
};

const CATEGORY_SUBCATEGORIES: Record<string, string[]> = {
  Futebol: ['Todas', 'Regional', 'Nacional', 'Internacional', 'Mercado da Bola'],
  'Corrida de Rua': ['Todas', 'Maratona', 'Meia Maratona', 'Treinos', 'Equipamentos'],
  Ciclismo: ['Todas', 'Estrada', 'Mountain Bike', 'Mobilidade Urbana', 'Competições'],
  Esportes: ['Todas', 'Basquete', 'Vôlei', 'Tênis', 'Natação', 'Atletismo'],
  Política: ['Todas', 'Gestão Esportiva', 'Legislação', 'CBF', 'Clubes-Empresa SAF'],
  Editoriais: ['Todas', 'Opinião da Redação', 'Crônica Esportiva', 'Debate']
};

export const CategoryView: React.FC<CategoryViewProps> = ({
  category,
  subcategory,
  articles,
  standings,
  onSelectArticle,
  onBackToHome,
  onOpenStandingsModal,
  onSelectSubcategory,
  onOpenCreateArticle,
  onOpenAdModal
}) => {
  const [activeSub, setActiveSub] = useState<string>(subcategory || 'Todas');

  // Filter articles belonging to this category
  const categoryArticles = useMemo(() => {
    return articles.filter((a) => a.category.toLowerCase() === category.toLowerCase());
  }, [articles, category]);

  // Subcategory filtering
  const filteredArticles = useMemo(() => {
    if (activeSub === 'Todas') return categoryArticles;
    return categoryArticles.filter((a) => {
      if (a.subcategory && a.subcategory.toLowerCase() === activeSub.toLowerCase()) return true;
      if (a.tags && a.tags.some((t) => t.toLowerCase().includes(activeSub.toLowerCase()))) return true;
      return false;
    });
  }, [categoryArticles, activeSub]);

  const leadArticle = filteredArticles[0] || categoryArticles[0];
  const remainingArticles = leadArticle
    ? filteredArticles.filter((a) => a.id !== leadArticle.id)
    : [];

  const subcategoryList = CATEGORY_SUBCATEGORIES[category] || ['Todas'];
  const description =
    CATEGORY_DESCRIPTIONS[category] ||
    `Acompanhe as últimas notícias, apurações exclusivas e reportagens especiais sobre ${category}.`;

  const handleSubClick = (sub: string) => {
    setActiveSub(sub);
    onSelectSubcategory(sub === 'Todas' ? undefined : sub);
  };

  return (
    <div className="pb-16 bg-[#f8f9fb] dark:bg-[#0b0f19] text-gray-900 dark:text-gray-100 transition-colors">
      {/* 1. Category Hero Banner */}
      <div className="bg-[#1e3a8a] dark:bg-[#090d16] text-white pt-8 pb-10 border-b border-[#172554] dark:border-gray-800 shadow-sm transition-colors">
        <div className="max-w-[1240px] mx-auto px-4">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2 text-xs text-blue-200 font-medium">
              <button
                onClick={onBackToHome}
                className="inline-flex items-center gap-1 hover:text-[#facc15] transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Início</span>
              </button>
              <span>/</span>
              <span className="text-white font-bold">{category}</span>
              {activeSub !== 'Todas' && (
                <>
                  <span>/</span>
                  <span className="text-[#facc15] font-semibold">{activeSub}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 mb-2">
                <span className="bg-[#dc2626] text-white text-[11px] font-condensed font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-sm">
                  Editoria Exclusiva
                </span>
                <span className="text-xs text-blue-300 font-medium">
                  {categoryArticles.length} matérias sincronizadas
                </span>
              </div>
              <h1 className="font-condensed font-black text-4xl sm:text-6xl uppercase tracking-tight text-white mb-3">
                {category}
              </h1>
              <p className="text-sm sm:text-base text-blue-100/90 leading-relaxed max-w-2xl">
                {description}
              </p>
            </div>

            {/* Subcategory Pills */}
            <div className="flex flex-wrap items-center gap-1.5 self-start md:self-end">
              <span className="text-xs text-blue-200 mr-1 flex items-center gap-1 font-semibold">
                <Filter className="w-3.5 h-3.5 text-[#facc15]" />
                Filtros:
              </span>
              {subcategoryList.map((sub) => {
                const isActive = activeSub === sub;
                return (
                  <button
                    key={sub}
                    onClick={() => handleSubClick(sub)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-condensed font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#facc15] text-gray-950 shadow-sm'
                        : 'bg-blue-900/60 hover:bg-blue-800 text-blue-100 border border-blue-700/50'
                    }`}
                  >
                    {sub}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Content Grid */}
      <div className="max-w-[1240px] mx-auto px-4 pt-8">
        {filteredArticles.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-12 text-center border border-gray-200 dark:border-gray-800 shadow-xs max-w-lg mx-auto my-8">
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
              Nenhuma matéria encontrada para a subcategoria <strong>{activeSub}</strong>.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => handleSubClick('Todas')}
                className="px-4 py-2 bg-[#1e3a8a] text-white text-xs font-bold uppercase rounded-lg hover:bg-[#172554] cursor-pointer"
              >
                Ver Todas em {category}
              </button>
              {onOpenCreateArticle && (
                <button
                  onClick={() => onOpenCreateArticle(category)}
                  className="px-4 py-2 bg-[#dc2626] text-white text-xs font-bold uppercase rounded-lg hover:bg-[#b91c1c] cursor-pointer inline-flex items-center gap-1"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Criar Primeira Notícia</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start">
            {/* Left Articles Stream */}
            <div className="space-y-8 min-w-0">
              {/* Highlight / Lead Article */}
              {leadArticle && (
                <article
                  onClick={() => onSelectArticle(leadArticle)}
                  className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 hover:border-[#1e3a8a] dark:hover:border-blue-500 rounded-2xl overflow-hidden shadow-xs hover:shadow-lg transition-all cursor-pointer group flex flex-col md:flex-row"
                >
                  <div
                    className="w-full md:w-[48%] h-64 md:h-auto min-h-[260px] relative shrink-0"
                    style={{ background: leadArticle.imageBg }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    <span className="absolute top-4 left-4 bg-[#dc2626] text-white text-xs font-condensed font-bold uppercase tracking-wider px-3 py-1 rounded-sm shadow-sm">
                      Destaque da Editoria
                    </span>
                    <span className="absolute bottom-4 left-4 text-xs text-white/90 font-medium">
                      {leadArticle.imageCaption || leadArticle.category}
                    </span>
                  </div>

                  <div className="p-6 md:p-8 flex flex-col justify-between flex-1">
                    <div>
                      <div className="flex items-center gap-2 mb-2 text-xs text-gray-500 dark:text-gray-400 font-semibold">
                        <span className="text-[#1e3a8a] dark:text-[#facc15] font-bold uppercase tracking-wider">
                          {leadArticle.subcategory || category}
                        </span>
                        <span>•</span>
                        <span>{leadArticle.publishedAt}</span>
                      </div>

                      <h2 className="font-condensed font-black text-2xl sm:text-3xl lg:text-[32px] text-gray-900 dark:text-gray-100 group-hover:text-[#1e3a8a] dark:group-hover:text-[#facc15] uppercase leading-tight tracking-tight mb-3 transition-colors">
                        {leadArticle.title}
                      </h2>

                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 leading-relaxed mb-6">
                        {leadArticle.dek}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-2 font-medium">
                        <span className="w-7 h-7 rounded-full bg-[#1e3a8a] text-white font-condensed font-bold text-xs flex items-center justify-center">
                          {leadArticle.author.avatar}
                        </span>
                        <span>Por {leadArticle.author.name}</span>
                      </div>
                      <span className="font-bold text-[#1e3a8a] dark:text-blue-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                        Ler Matéria Completa →
                      </span>
                    </div>
                  </div>
                </article>
              )}

              {/* Grid of Remaining Articles in this Category */}
              <div>
                <h3 className="font-condensed font-black text-xl text-[#1e3a8a] dark:text-[#facc15] uppercase tracking-wide mb-4 pb-2 border-b border-gray-200 dark:border-gray-800 flex items-center gap-2">
                  <Flame className="w-5 h-5 text-[#dc2626]" />
                  <span>Outras Notícias de {category}</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {remainingArticles.map((art) => (
                    <article
                      key={art.id}
                      onClick={() => onSelectArticle(art)}
                      className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-[#1e3a8a] dark:hover:border-blue-500 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col hover:-translate-y-1"
                    >
                      <div className="h-44 relative" style={{ background: art.imageBg }}>
                        <span className="absolute top-2.5 left-2.5 bg-[#1e3a8a] text-white text-[10px] font-condensed font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                          {art.subcategory || category}
                        </span>
                        <span className="absolute bottom-2.5 right-2.5 bg-black/70 text-white text-[10px] font-semibold px-2 py-0.5 rounded flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#facc15]" />
                          {art.readTime}
                        </span>
                      </div>

                      <div className="p-4 flex flex-col flex-1 justify-between">
                        <div>
                          <h4 className="font-condensed font-bold text-lg text-gray-900 dark:text-gray-100 group-hover:text-[#1e3a8a] dark:group-hover:text-[#facc15] uppercase leading-snug line-clamp-2 mb-2 transition-colors">
                            {art.title}
                          </h4>
                          <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed mb-4">
                            {art.dek}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-[11px] text-gray-400">
                          <span>{art.author.name}</span>
                          <span className="text-[#1e3a8a] dark:text-blue-400 font-bold">Ler notícia →</span>
                        </div>
                      </div>
                    </article>
                  ))}

                  {/* Native In-Feed Ad in Category */}
                  <InFeedAd onOpenAdModal={onOpenAdModal} />
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <aside className="space-y-6">
              {/* Standings Widget (Contextual if category is Futebol) */}
              {category.toLowerCase() === 'futebol' && (
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-condensed font-black text-xl text-[#1e3a8a] dark:text-[#facc15] uppercase flex items-center gap-1.5">
                      <Trophy className="w-5 h-5 text-[#facc15]" />
                      Brasileirão Série A
                    </h3>
                    <span className="text-[11px] font-bold text-gray-400 uppercase">2026</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Liderança e classificação ao vivo</p>

                  <div className="space-y-2">
                    {standings.slice(0, 5).map((row) => (
                      <div
                        key={row.team}
                        className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-5 h-5 rounded-full inline-flex items-center justify-center font-bold text-[11px] ${
                              row.position === 1
                                ? 'bg-[#facc15] text-gray-950 font-black'
                                : row.position <= 4
                                ? 'bg-blue-100 text-[#1e3a8a]'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {row.position}
                          </span>
                          <span className="font-semibold text-gray-900 dark:text-gray-100">{row.team}</span>
                        </div>
                        <span className="font-condensed font-black text-sm text-[#1e3a8a] dark:text-blue-400">
                          {row.points} pts
                        </span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={onOpenStandingsModal}
                    className="w-full mt-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-gray-700 text-[#1e3a8a] dark:text-blue-300 text-xs font-bold uppercase rounded-lg transition-colors cursor-pointer"
                  >
                    Ver Tabela Completa
                  </button>
                </div>
              )}

              {/* Sidebar Ad Banner */}
              <SidebarAd onOpenAdModal={onOpenAdModal} />

              {/* Category Info Box */}
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-xs">
                <h3 className="font-condensed font-black text-lg text-[#1e3a8a] dark:text-[#facc15] uppercase mb-2">
                  Sobre a Cobertura de {category}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  Todas as matérias publicadas nesta editoria passam por checagem da redação central do Plantão Esportivo, com repórteres em campo e cobertura em tempo real.
                </p>
                <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-lg border border-blue-200 dark:border-blue-900/60 text-xs text-[#1e3a8a] dark:text-blue-300 font-medium">
                  Receba alertas urgentes de <strong>{category}</strong> ativando as notificações no navegador.
                </div>
              </div>

              {/* Quick Return to All News */}
              <button
                onClick={onBackToHome}
                className="w-full py-3 bg-[#1e3a8a] hover:bg-[#172554] text-white font-condensed font-black text-sm uppercase rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar à Página Principal</span>
              </button>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
};
