import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Activity, RefreshCw } from 'lucide-react';
import { LiveMatch } from '../data/portalData';

interface LiveScoreTickerProps {
  matches: LiveMatch[];
  onSelectMatch: (match: LiveMatch) => void;
  onSimulateTick: () => void;
  isSimulating: boolean;
  onToggleSimulate: () => void;
}

export const LiveScoreTicker: React.FC<LiveScoreTickerProps> = ({
  matches,
  onSelectMatch,
  onSimulateTick,
  isSimulating,
  onToggleSimulate
}) => {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollerRef.current) {
      const offset = direction === 'left' ? -280 : 280;
      scrollerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <section className="bg-[#111827] text-white border-b-4 border-[#dc2626] shadow-inner select-none">
      <div className="max-w-[1240px] mx-auto px-4 py-2.5">
        {/* Header row */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-black tracking-wider text-white uppercase bg-[#dc2626] px-2 py-0.5 rounded">
              <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
              AO VIVO
            </span>
            <span className="font-condensed font-bold text-base text-[#facc15] uppercase tracking-wide">
              Placar da Rodada em Tempo Real
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Live simulation toggle button */}
            <button
              onClick={onToggleSimulate}
              className={`hidden sm:inline-flex items-center gap-1 text-[11px] font-bold uppercase px-2.5 py-1 rounded border transition-colors cursor-pointer ${
                isSimulating
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                  : 'bg-gray-800 text-gray-300 border-gray-700 hover:text-white'
              }`}
              title="Ativar/Desativar atualização automática de placares em tempo real"
            >
              <Activity className={`w-3 h-3 ${isSimulating ? 'text-emerald-400 animate-pulse' : ''}`} />
              <span>{isSimulating ? 'Tempo Real Ativo' : 'Pausado'}</span>
            </button>

            <button
              onClick={onSimulateTick}
              className="p-1.5 text-gray-400 hover:text-[#facc15] hover:bg-gray-800 rounded transition-colors cursor-pointer"
              title="Forçar atualização dos lances"
              aria-label="Atualizar lances"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>

            {/* Scroll navigation */}
            <button
              onClick={() => scroll('left')}
              className="w-7 h-7 bg-gray-800 hover:bg-gray-700 text-white rounded flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Rolar placar para a esquerda"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-7 h-7 bg-gray-800 hover:bg-gray-700 text-white rounded flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Rolar placar para a direita"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Matches List */}
        <div
          ref={scrollerRef}
          className="flex items-stretch gap-3 overflow-x-auto hide-scrollbar pb-1 scroll-smooth"
        >
          {matches.map((m) => (
            <div
              key={m.id}
              onClick={() => onSelectMatch(m)}
              className="shrink-0 w-[245px] sm:w-[260px] bg-[#1f2937] hover:bg-[#283548] border border-gray-700/80 hover:border-[#facc15]/80 rounded-lg p-2.5 cursor-pointer transition-all hover:-translate-y-0.5 shadow-sm group"
            >
              {/* Top metadata */}
              <div className="flex items-center justify-between text-[11px] text-gray-400 mb-2 font-medium">
                <span className="truncate max-w-[150px]">{m.tournament}</span>
                {m.isLive ? (
                  <span className="inline-flex items-center gap-1 font-bold text-[#ef4444] text-[10px] uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444] animate-pulse"></span>
                    {m.minute}
                  </span>
                ) : (
                  <span className="font-semibold text-gray-400 text-[10px]">{m.minute}</span>
                )}
              </div>

              {/* Home Team */}
              <div className="flex items-center justify-between gap-2 py-0.5">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0 shadow-xs"
                    style={{ backgroundColor: m.homeTeam.crestBg }}
                  >
                    {m.homeTeam.shortName}
                  </span>
                  <span className="font-semibold text-sm text-gray-100 truncate group-hover:text-white">
                    {m.homeTeam.name}
                  </span>
                </div>
                <span className="font-condensed font-black text-xl text-[#facc15] min-w-5 text-right tabular-nums">
                  {m.homeTeam.score}
                </span>
              </div>

              {/* Away Team */}
              <div className="flex items-center justify-between gap-2 py-0.5">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0 shadow-xs"
                    style={{ backgroundColor: m.awayTeam.crestBg }}
                  >
                    {m.awayTeam.shortName}
                  </span>
                  <span className="font-semibold text-sm text-gray-100 truncate group-hover:text-white">
                    {m.awayTeam.name}
                  </span>
                </div>
                <span className="font-condensed font-black text-xl text-[#facc15] min-w-5 text-right tabular-nums">
                  {m.awayTeam.score}
                </span>
              </div>

              <div className="mt-1.5 pt-1.5 border-t border-gray-700/60 flex items-center justify-between text-[10px] text-gray-400">
                <span className="truncate">{m.stadium.split(',')[0]}</span>
                <span className="text-[#facc15] opacity-0 group-hover:opacity-100 transition-opacity font-semibold">
                  Ver lances →
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
