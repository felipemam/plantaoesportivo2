import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Clock, Eye, User } from 'lucide-react';
import { Article } from '../data/portalData';

interface HeroCarouselProps {
  articles: Article[];
  sideArticles: Article[];
  onSelectArticle: (article: Article) => void;
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({
  articles,
  sideArticles,
  onSelectArticle
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const INTERVAL = 6000;
  const startTimeRef = useRef<number>(Date.now());
  const animationFrameRef = useRef<number | null>(null);

  const totalSlides = articles.length;

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
    startTimeRef.current = Date.now();
    setProgress(0);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
    startTimeRef.current = Date.now();
    setProgress(0);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    startTimeRef.current = Date.now();
    setProgress(0);
  };

  useEffect(() => {
    const tick = () => {
      if (!isPaused) {
        const elapsed = Date.now() - startTimeRef.current;
        const pct = Math.min(100, (elapsed / INTERVAL) * 100);
        setProgress(pct);

        if (elapsed >= INTERVAL) {
          nextSlide();
        }
      }
      animationFrameRef.current = requestAnimationFrame(tick);
    };

    animationFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPaused, currentSlide, totalSlides]);

  const activeArticle = articles[currentSlide] || articles[0];

  return (
    <section className="py-6" aria-label="Destaques principais">
      <div className="max-w-[1240px] mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-[1.65fr_1fr] gap-5 items-stretch">
          {/* Main Carousel */}
          <div
            className="relative rounded-xl overflow-hidden min-h-[420px] sm:min-h-[460px] text-white shadow-md flex flex-col justify-end group select-none cursor-pointer"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => {
              setIsPaused(false);
              startTimeRef.current = Date.now() - (progress / 100) * INTERVAL;
            }}
            onClick={() => onSelectArticle(activeArticle)}
          >
            {/* Background with sports themed gradient */}
            <div
              className="absolute inset-0 z-0 transition-all duration-700 ease-out transform group-hover:scale-102"
              style={{ background: activeArticle.imageBg }}
            />

            {/* Dark gradient overlay for text contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-900/60 to-transparent z-10" />

            {/* Content overlay */}
            <div className="relative z-20 p-6 sm:p-8 flex flex-col justify-end">
              {/* Category & Badge */}
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-block bg-[#facc15] text-gray-900 font-condensed font-black text-xs uppercase px-3 py-1 rounded-full shadow-xs tracking-wider">
                  {activeArticle.category} {activeArticle.subcategory ? `• ${activeArticle.subcategory}` : ''}
                </span>
                {activeArticle.heroTag && (
                  <span className="hidden sm:inline-block bg-white/20 text-white font-condensed font-bold text-xs uppercase px-2.5 py-1 rounded-full backdrop-blur-xs">
                    {activeArticle.heroTag}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="font-condensed font-black text-2xl sm:text-4xl lg:text-[42px] leading-[1.08] text-white uppercase mb-3 max-w-3xl drop-shadow-sm group-hover:text-[#facc15] transition-colors">
                {activeArticle.title}
              </h1>

              {/* Dek / Subtitle */}
              <p className="text-gray-200 text-sm sm:text-base font-normal max-w-2xl line-clamp-2 sm:line-clamp-3 mb-4 leading-relaxed">
                {activeArticle.dek}
              </p>

              {/* Metadata */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-300 font-medium pt-2 border-t border-white/15">
                <span className="flex items-center gap-1.5 text-white">
                  <User className="w-3.5 h-3.5 text-[#facc15]" />
                  Por {activeArticle.author.name}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {activeArticle.readTime}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  {activeArticle.readCount}
                </span>
              </div>
            </div>

            {/* Carousel Arrow Controls */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevSlide();
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-[#1e3a8a] shadow-lg flex items-center justify-center transition-all opacity-80 sm:opacity-0 group-hover:opacity-100 hover:scale-105 cursor-pointer"
              aria-label="Matéria anterior"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextSlide();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-[#1e3a8a] shadow-lg flex items-center justify-center transition-all opacity-80 sm:opacity-0 group-hover:opacity-100 hover:scale-105 cursor-pointer"
              aria-label="Próxima matéria"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Navigation Dots */}
            <div className="absolute bottom-3 right-4 z-30 flex items-center gap-1.5">
              {articles.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation();
                    goToSlide(i);
                  }}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    i === currentSlide ? 'w-7 bg-[#facc15]' : 'w-2 bg-white/50 hover:bg-white'
                  }`}
                  aria-label={`Ir para destaque ${i + 1}`}
                />
              ))}
            </div>

            {/* Progress Bar */}
            <div className="absolute left-0 bottom-0 h-1 bg-white/20 w-full z-20">
              <div
                className="h-full bg-[#facc15] transition-all duration-100 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Side Headline Cards */}
          <div className="flex flex-col gap-3.5">
            {sideArticles.map((art) => (
              <div
                key={art.id}
                onClick={() => onSelectArticle(art)}
                className="flex-1 bg-white border border-gray-200 hover:border-[#1e3a8a] rounded-xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group hover:-translate-y-0.5"
              >
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`text-[11px] font-condensed font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                        art.category === 'Futebol'
                          ? 'bg-[#dc2626] text-white'
                          : art.category === 'Política'
                          ? 'bg-[#1e3a8a] text-white'
                          : 'bg-gray-800 text-white'
                      }`}
                    >
                      {art.category} {art.subcategory ? `• ${art.subcategory}` : ''}
                    </span>
                    <span className="text-[11px] text-gray-400 font-medium">
                      {art.readTime}
                    </span>
                  </div>

                  <h3 className="font-condensed font-bold text-lg sm:text-xl text-gray-900 leading-tight uppercase group-hover:text-[#1e3a8a] transition-colors line-clamp-2">
                    {art.title}
                  </h3>
                </div>

                <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                  <span className="truncate max-w-[200px]">Por {art.author.name}</span>
                  <span className="text-blue-700 font-semibold group-hover:translate-x-1 transition-transform">
                    Ler matéria →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
