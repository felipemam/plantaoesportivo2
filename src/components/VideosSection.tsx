import React from 'react';
import { Play } from 'lucide-react';
import { VideoItem, PORTAL_VIDEOS } from '../data/portalData';

interface VideosSectionProps {
  onOpenVideo: (video: VideoItem) => void;
}

export const VideosSection: React.FC<VideosSectionProps> = ({ onOpenVideo }) => {
  return (
    <section className="bg-[#111827] text-white py-12" aria-labelledby="videos-title">
      <div className="max-w-[1240px] mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-end justify-between pb-3 border-b border-gray-800 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#facc15] animate-pulse"></span>
              <h2 id="videos-title" className="font-condensed font-black text-2xl sm:text-3xl text-[#facc15] uppercase tracking-wide">
                Vídeos do Plantão
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              Gols, melhores momentos, entrevistas exclusivas e bastidores
            </p>
          </div>
          <button
            onClick={() => onOpenVideo(PORTAL_VIDEOS[0])}
            className="text-xs font-bold text-gray-300 hover:text-[#facc15] uppercase tracking-wider transition-colors cursor-pointer"
          >
            Ver Todos →
          </button>
        </div>

        {/* 3-Column Video Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PORTAL_VIDEOS.map((v) => (
            <div
              key={v.id}
              onClick={() => onOpenVideo(v)}
              className="bg-[#1f2937] border border-gray-800 hover:border-[#facc15] rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all cursor-pointer group flex flex-col hover:-translate-y-1"
            >
              {/* Video Thumbnail with Play Button Overlay */}
              <div
                className="h-48 relative flex items-center justify-center overflow-hidden"
                style={{ background: v.gradientBg }}
              >
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors"></div>

                {/* Animated Play Circle */}
                <div className="w-14 h-14 rounded-full bg-white/95 text-[#1e3a8a] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform relative z-10">
                  <Play className="w-6 h-6 fill-current ml-1" />
                </div>

                {/* Category & Duration */}
                <span className="absolute top-3 left-3 bg-[#111827]/80 backdrop-blur-xs text-[#facc15] text-[10px] font-condensed font-bold uppercase px-2.5 py-0.5 rounded-full">
                  {v.category}
                </span>
                <span className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-xs text-white text-xs font-bold px-2 py-0.5 rounded">
                  {v.duration}
                </span>
              </div>

              {/* Video Details */}
              <div className="p-4 flex flex-col flex-1">
                <h3 className="font-condensed font-bold text-lg text-white group-hover:text-[#facc15] transition-colors uppercase leading-snug line-clamp-2 mb-2">
                  {v.title}
                </h3>
                <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed mb-4 flex-1">
                  {v.subtitle}
                </p>

                <div className="pt-2 border-t border-gray-800 flex items-center justify-between text-[11px] text-gray-400">
                  <span>{v.views}</span>
                  <span>{v.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
