import React from 'react';
import { Quote } from 'lucide-react';
import { Article } from '../data/portalData';

interface EditorialsSectionProps {
  onSelectArticle: (article: Article) => void;
  articles: Article[];
}

export const EditorialsSection: React.FC<EditorialsSectionProps> = ({
  onSelectArticle,
  articles
}) => {
  const editorialArticles = articles.filter(a => a.category === 'Editoriais' || a.category === 'Política').slice(0, 2);

  return (
    <section className="py-12 border-t border-gray-200" aria-labelledby="editorials-title">
      <div className="max-w-[1240px] mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-end justify-between pb-3 border-b-2 border-gray-200 mb-8">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-[#dc2626]">
              Opinião & Debate
            </span>
            <h2 id="editorials-title" className="font-condensed font-black text-2xl sm:text-3xl text-[#1e3a8a] uppercase tracking-wide">
              Editoriais do Plantão
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Análises de fundo sobre o esporte brasileiro, gestão e direitos do torcedor
            </p>
          </div>
        </div>

        {/* 2-Column Editorial Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {editorialArticles.map((art) => (
            <article
              key={art.id}
              onClick={() => onSelectArticle(art)}
              className="bg-white border border-gray-200 hover:border-[#1e3a8a] rounded-xl p-6 sm:p-7 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group hover:-translate-y-0.5"
            >
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-condensed font-bold uppercase tracking-wider text-[#dc2626]">
                    {art.category} • Opinião
                  </span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-500">{art.readTime}</span>
                </div>

                <h3 className="font-condensed font-bold text-2xl sm:text-[26px] text-gray-900 group-hover:text-[#1e3a8a] transition-colors uppercase leading-tight mb-3">
                  {art.title}
                </h3>

                <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-5">
                  {art.dek}
                </p>

                {/* Pull Quote Box */}
                <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-[#facc15] my-4 relative">
                  <Quote className="w-5 h-5 text-gray-300 absolute right-3 top-3" />
                  <p className="italic text-gray-800 text-sm sm:text-base leading-snug font-serif-body">
                    {art.id === 'editorial-preco-ingressos'
                      ? '“O futebol não pertence a acionistas ou patrocinadores de ocasião. Pertence a quem passou a vida nas arquibancadas.”'
                      : '“Uma quadra bem cuidada na escola pública custa infinitamente menos aos cofres do que um leito de hospital.”'}
                  </p>
                  <span className="block text-xs font-bold text-[#1e3a8a] uppercase tracking-wider mt-2">
                    — {art.author.name}
                  </span>
                </div>
              </div>

              {/* Author footer */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-full bg-[#1e3a8a] text-white font-condensed font-bold text-xs flex items-center justify-center shrink-0">
                    {art.author.avatar}
                  </span>
                  <div>
                    <span className="font-bold text-gray-900 block">{art.author.name}</span>
                    <span className="text-gray-500 text-[11px]">{art.author.role}</span>
                  </div>
                </div>

                <span className="text-blue-700 font-semibold group-hover:translate-x-1 transition-transform">
                  Ler coluna completa →
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
