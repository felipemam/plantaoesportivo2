import React, { useState } from 'react';
import {
  X,
  Search,
  Check,
  Trophy,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Clock,
  ArrowRight,
  Bookmark,
  Trash2
} from 'lucide-react';
import { Article, LiveMatch, StandingsRow, INITIAL_STANDINGS } from '../data/portalData';

// --- 1. SEARCH MODAL ---
interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  articles: Article[];
  onSelectArticle: (article: Article) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  articles,
  onSelectArticle
}) => {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const filtered = query.trim()
    ? articles.filter((a) => {
        const q = query.toLowerCase();
        return (
          a.title.toLowerCase().includes(q) ||
          a.dek.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q) ||
          a.author.name.toLowerCase().includes(q) ||
          a.tags.some((t) => t.toLowerCase().includes(q))
        );
      })
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden mt-12 border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center gap-3">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por times, atletas, categorias, palavras-chave…"
            className="flex-1 text-base font-medium text-gray-900 focus:outline-none placeholder-gray-400"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-gray-400 hover:text-gray-600 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-4">
          {!query.trim() ? (
            <div className="py-8 text-center text-gray-500">
              <p className="text-sm">Digite um termo para pesquisar em todo o portal.</p>
              <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs">
                <span className="text-gray-400">Sugestões:</span>
                {['Flamengo', 'Palmeiras', 'Maratona', 'Ciclismo', 'Brasileirão'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setQuery(s)}
                    className="px-2.5 py-1 bg-gray-100 hover:bg-blue-50 text-gray-700 hover:text-[#1e3a8a] rounded-full cursor-pointer font-medium"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-8 text-center text-gray-500 text-sm">
              Nenhuma matéria encontrada para “{query}”. Tente outro termo esportivo.
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                {filtered.length} resultado(s) encontrado(s)
              </div>
              {filtered.map((art) => (
                <div
                  key={art.id}
                  onClick={() => {
                    onSelectArticle(art);
                    onClose();
                  }}
                  className="p-3.5 rounded-xl border border-gray-100 hover:border-[#1e3a8a] hover:bg-blue-50/40 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2 text-xs mb-1">
                    <span className="font-bold text-[#dc2626] uppercase">{art.category}</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-500">Por {art.author.name}</span>
                  </div>
                  <h4 className="font-condensed font-bold text-lg text-gray-900 group-hover:text-[#1e3a8a] uppercase leading-snug">
                    {art.title}
                  </h4>
                  <p className="text-xs text-gray-500 line-clamp-1 mt-1">{art.dek}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- 2. SUBSCRIPTION MODAL ---
interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscribeSuccess: (plan: string) => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  onSubscribeSuccess
}) => {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('annual');
  const [email, setEmail] = useState('');

  if (!isOpen) return null;

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    onSubscribeSuccess(selectedPlan === 'annual' ? 'Plano Anual' : 'Plano Mensal');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden border border-gray-200 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 rounded-full cursor-pointer z-10"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Banner */}
        <div className="bg-[#1e3a8a] text-white p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-[#dc2626] rounded-full opacity-30 pointer-events-none"></div>
          <span className="text-xs font-condensed font-bold tracking-widest text-[#facc15] uppercase bg-blue-950 px-2.5 py-1 rounded">
            Plantão Premium
          </span>
          <h2 className="font-condensed font-black text-3xl sm:text-4xl uppercase mt-2 leading-none">
            Jornalismo Esportivo sem Limites
          </h2>
          <p className="text-blue-100 text-xs sm:text-sm mt-1.5 max-w-md">
            Apoie o jornalismo independente e tenha acesso completo a análises táticas, transmissões em vídeo e placares instantâneos.
          </p>
        </div>

        {/* Plans Choice */}
        <div className="p-6 sm:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div
              onClick={() => setSelectedPlan('monthly')}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                selectedPlan === 'monthly'
                  ? 'border-[#1e3a8a] bg-blue-50/50 shadow-xs'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-xs font-bold uppercase text-gray-500">Plano Mensal</div>
              <div className="font-condensed font-black text-2xl text-gray-900 mt-1">
                R$ 9,90 <span className="text-xs font-sans text-gray-500 font-normal">/mês</span>
              </div>
              <p className="text-[11px] text-gray-500 mt-2">Cancele quando quiser, sem fidelidade.</p>
            </div>

            <div
              onClick={() => setSelectedPlan('annual')}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all relative ${
                selectedPlan === 'annual'
                  ? 'border-[#1e3a8a] bg-blue-50/50 shadow-xs'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="absolute -top-2.5 right-3 bg-[#facc15] text-gray-950 text-[10px] font-condensed font-black uppercase px-2 py-0.5 rounded shadow-2xs">
                Economize 25%
              </span>
              <div className="text-xs font-bold uppercase text-[#1e3a8a]">Plano Anual</div>
              <div className="font-condensed font-black text-2xl text-gray-900 mt-1">
                R$ 89,90 <span className="text-xs font-sans text-gray-500 font-normal">/ano</span>
              </div>
              <p className="text-[11px] text-gray-500 mt-2">Equivalente a apenas R$ 7,49/mês.</p>
            </div>
          </div>

          {/* Benefits list */}
          <div className="space-y-2 mb-6 text-xs text-gray-700">
            {[
              'Acesso ilimitado a todas as reportagens investigativas e editoriais',
              'Placar ao vivo com alerta de gols instantâneo no navegador',
              'Navegação 100% limpa, rápida e sem anúncios publicitários',
              'Newsletter diária exclusiva com análises de bastidores às 7h'
            ].map((ben, i) => (
              <div key={i} className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{ben}</span>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubscribe} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Digite seu e-mail para ativar a assinatura"
              className="w-full h-11 px-4 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]"
              required
            />
            <button
              type="submit"
              className="w-full h-11 bg-[#facc15] hover:bg-[#eab308] text-gray-950 font-condensed font-black text-base uppercase rounded-lg shadow-sm hover:scale-101 transition-all cursor-pointer"
            >
              Assinar Agora
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// --- 3. MATCH CENTER MODAL ---
interface MatchCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: LiveMatch | null;
}

export const MatchCenterModal: React.FC<MatchCenterModalProps> = ({
  isOpen,
  onClose,
  match
}) => {
  if (!isOpen || !match) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-gray-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-[#111827] text-white p-5 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#dc2626] animate-ping"></span>
            <span className="font-condensed font-bold text-lg text-[#facc15] uppercase">
              Centro da Partida • {match.tournament}
            </span>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-white rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scoreboard Banner */}
        <div className="bg-[#1e293b] text-white p-6 text-center border-b border-gray-700">
          <div className="text-xs text-gray-400 mb-2 font-medium">{match.stadium}</div>
          <div className="flex items-center justify-center gap-6 sm:gap-12">
            {/* Home */}
            <div className="flex flex-col items-center gap-2 w-28">
              <span
                className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-black text-white shadow-md"
                style={{ backgroundColor: match.homeTeam.crestBg }}
              >
                {match.homeTeam.shortName}
              </span>
              <span className="font-bold text-sm sm:text-base text-gray-100">{match.homeTeam.name}</span>
            </div>

            {/* Score */}
            <div className="flex flex-col items-center">
              <div className="font-condensed font-black text-4xl sm:text-5xl text-[#facc15] tabular-nums tracking-wider">
                {match.homeTeam.score} - {match.awayTeam.score}
              </div>
              <span className="mt-1 text-xs font-bold text-red-400 uppercase bg-red-950/60 px-2 py-0.5 rounded border border-red-800/40">
                {match.minute}
              </span>
            </div>

            {/* Away */}
            <div className="flex flex-col items-center gap-2 w-28">
              <span
                className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-black text-white shadow-md"
                style={{ backgroundColor: match.awayTeam.crestBg }}
              >
                {match.awayTeam.shortName}
              </span>
              <span className="font-bold text-sm sm:text-base text-gray-100">{match.awayTeam.name}</span>
            </div>
          </div>
        </div>

        {/* Modal Body: Events & Stats */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Timeline of events */}
          <div>
            <h4 className="font-condensed font-bold text-lg text-gray-900 uppercase tracking-wide mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#1e3a8a]" />
              Lances e Gols Principais
            </h4>
            <div className="space-y-2.5">
              {match.events.map((ev, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50 border border-gray-200 text-xs"
                >
                  <span className="font-condensed font-black text-sm text-[#1e3a8a] min-w-8">
                    {ev.minute}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                      ev.type === 'goal'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {ev.type === 'goal' ? 'GOL ⚽' : 'CARTÃO'}
                  </span>
                  <div className="flex-1">
                    <strong className="text-gray-900">{ev.player}</strong>
                    {ev.detail && <span className="text-gray-500 ml-1">({ev.detail})</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Statistics Comparison */}
          <div>
            <h4 className="font-condensed font-bold text-lg text-gray-900 uppercase tracking-wide mb-3">
              Estatísticas Comparativas
            </h4>
            <div className="space-y-3 font-sans text-xs">
              <div>
                <div className="flex justify-between font-semibold text-gray-700 mb-1">
                  <span>{match.stats.possession[0]}%</span>
                  <span className="uppercase text-gray-400 font-bold">Posse de Bola</span>
                  <span>{match.stats.possession[1]}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full flex overflow-hidden">
                  <div className="bg-[#1e3a8a]" style={{ width: `${match.stats.possession[0]}%` }} />
                  <div className="bg-[#dc2626]" style={{ width: `${match.stats.possession[1]}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold text-gray-700 mb-1">
                  <span>{match.stats.shots[0]}</span>
                  <span className="uppercase text-gray-400 font-bold">Finalizações Totais</span>
                  <span>{match.stats.shots[1]}</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full flex overflow-hidden">
                  <div
                    className="bg-[#1e3a8a]"
                    style={{
                      width: `${(match.stats.shots[0] / (match.stats.shots[0] + match.stats.shots[1] || 1)) * 100}%`
                    }}
                  />
                  <div
                    className="bg-[#dc2626]"
                    style={{
                      width: `${(match.stats.shots[1] / (match.stats.shots[0] + match.stats.shots[1] || 1)) * 100}%`
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold text-gray-700 mb-1">
                  <span>{match.stats.corners[0]}</span>
                  <span className="uppercase text-gray-400 font-bold">Escanteios</span>
                  <span>{match.stats.corners[1]}</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full flex overflow-hidden">
                  <div
                    className="bg-[#1e3a8a]"
                    style={{
                      width: `${(match.stats.corners[0] / (match.stats.corners[0] + match.stats.corners[1] || 1)) * 100}%`
                    }}
                  />
                  <div
                    className="bg-[#dc2626]"
                    style={{
                      width: `${(match.stats.corners[1] / (match.stats.corners[0] + match.stats.corners[1] || 1)) * 100}%`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- 4. VIDEO PLAYER MODAL ---
interface VideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  duration: string;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  isOpen,
  onClose,
  title,
  duration
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(35);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#111827] text-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden border border-gray-800">
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <div className="font-condensed font-bold text-base text-[#facc15] uppercase truncate">
            {title}
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-white rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Canvas Simulation */}
        <div className="aspect-video bg-black relative flex items-center justify-center overflow-hidden">
          {/* Animated gradient visualizer */}
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-950 via-slate-900 to-red-950 opacity-90"></div>

          <div className="relative z-10 text-center p-6">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-20 h-20 rounded-full bg-[#dc2626] hover:bg-[#b91c1c] text-white flex items-center justify-center mx-auto shadow-2xl transition-transform hover:scale-110 cursor-pointer mb-4"
            >
              {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
            </button>
            <div className="font-condensed font-black text-2xl uppercase tracking-wide">
              {title}
            </div>
            <div className="text-xs text-gray-400 mt-1">Transmissão Plantão Esportivo HD</div>
          </div>

          {/* Bottom Video Controls Bar */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col gap-2">
            {/* Timeline scrubber */}
            <div
              className="h-1.5 bg-gray-700 hover:h-2 transition-all rounded-full cursor-pointer relative"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const pos = ((e.clientX - rect.left) / rect.width) * 100;
                setProgress(pos);
              }}
            >
              <div className="h-full bg-[#dc2626] rounded-full" style={{ width: `${progress}%` }} />
            </div>

            <div className="flex items-center justify-between text-xs text-gray-300">
              <div className="flex items-center gap-3">
                <button onClick={() => setIsPlaying(!isPlaying)} className="hover:text-white cursor-pointer">
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button onClick={() => setIsMuted(!isMuted)} className="hover:text-white cursor-pointer">
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <span>01:14 / {duration}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold bg-[#dc2626] px-1.5 py-0.2 rounded uppercase">
                  1080p
                </span>
                <Maximize2 className="w-4 h-4 hover:text-white cursor-pointer" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- 5. STANDINGS FULL MODAL ---
interface StandingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  standings: StandingsRow[];
}

export const StandingsModal: React.FC<StandingsModalProps> = ({
  isOpen,
  onClose,
  standings
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-gray-200 max-h-[85vh] flex flex-col">
        <div className="bg-[#1e3a8a] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#facc15]" />
            <h3 className="font-condensed font-black text-2xl uppercase tracking-wide">
              Tabela Completa • Brasileirão Série A 2026
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-blue-200 hover:text-white rounded cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-300 text-gray-500 font-bold uppercase text-[11px]">
                <th className="py-2 text-center w-8">#</th>
                <th className="py-2">Time</th>
                <th className="py-2 text-center">J</th>
                <th className="py-2 text-center">V</th>
                <th className="py-2 text-center">E</th>
                <th className="py-2 text-center">D</th>
                <th className="py-2 text-center">SG</th>
                <th className="py-2 text-right font-black">Pts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {standings.map((r) => (
                <tr key={r.team} className="hover:bg-blue-50/40">
                  <td className="py-2.5 text-center">
                    <span
                      className={`w-5 h-5 rounded-full inline-flex items-center justify-center text-xs font-bold ${
                        r.position === 1
                          ? 'bg-[#facc15] text-gray-950'
                          : r.position <= 4
                          ? 'bg-blue-100 text-[#1e3a8a]'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {r.position}
                    </span>
                  </td>
                  <td className="py-2.5 font-bold text-gray-900 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: r.crestColor }} />
                    <span>{r.team}</span>
                  </td>
                  <td className="py-2.5 text-center text-gray-500">{r.played}</td>
                  <td className="py-2.5 text-center text-gray-700">{r.won}</td>
                  <td className="py-2.5 text-center text-gray-500">{r.drawn}</td>
                  <td className="py-2.5 text-center text-gray-500">{r.lost}</td>
                  <td className="py-2.5 text-center text-gray-700">{r.goalDiff > 0 ? `+${r.goalDiff}` : r.goalDiff}</td>
                  <td className="py-2.5 text-right font-condensed font-black text-base text-[#1e3a8a] tabular-nums">
                    {r.points}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between text-[11px] text-gray-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span> G-4 Libertadores
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Sul-Americana
              </span>
            </div>
            <span>Critérios: Pts, V, SG, GP</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- 6. SAVED ARTICLES MODAL ---
interface SavedArticlesModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedArticles: Article[];
  onSelectArticle: (article: Article) => void;
  onRemoveSaved: (articleId: string) => void;
}

export const SavedArticlesModal: React.FC<SavedArticlesModalProps> = ({
  isOpen,
  onClose,
  savedArticles,
  onSelectArticle,
  onRemoveSaved
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-gray-200 max-h-[80vh] flex flex-col">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-[#facc15]" fill="currentColor" />
            <h3 className="font-condensed font-black text-xl text-gray-900 uppercase">
              Matérias Salvas ({savedArticles.length})
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-700 rounded cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-1">
          {savedArticles.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <Bookmark className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium">Você ainda não salvou nenhuma matéria.</p>
              <p className="text-xs text-gray-400 mt-1">
                Clique no botão "Salvar" no topo ou dentro das matérias para ler depois.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {savedArticles.map((art) => (
                <div
                  key={art.id}
                  className="p-3 border border-gray-200 rounded-xl flex items-center justify-between gap-3 hover:border-[#1e3a8a] transition-colors"
                >
                  <div
                    onClick={() => {
                      onSelectArticle(art);
                      onClose();
                    }}
                    className="flex-1 cursor-pointer"
                  >
                    <span className="text-[10px] font-bold text-[#dc2626] uppercase">
                      {art.category}
                    </span>
                    <h4 className="font-condensed font-bold text-base text-gray-900 line-clamp-1 uppercase">
                      {art.title}
                    </h4>
                    <span className="text-[11px] text-gray-400">{art.readTime}</span>
                  </div>

                  <button
                    onClick={() => onRemoveSaved(art.id)}
                    className="p-2 text-gray-400 hover:text-red-600 rounded cursor-pointer transition-colors"
                    title="Remover dos salvos"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- 7. INSTITUTIONAL DIALOG ---
interface InstitutionalModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
}

export const InstitutionalModal: React.FC<InstitutionalModalProps> = ({
  isOpen,
  onClose,
  title,
  content
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-[#1e3a8a] text-white">
          <h3 className="font-condensed font-black text-xl uppercase tracking-wide">
            {title}
          </h3>
          <button onClick={onClose} className="p-1 text-blue-200 hover:text-white rounded cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="text-sm text-gray-700 whitespace-pre-line leading-relaxed font-sans">
            {content}
          </div>
          <div className="mt-6 text-right">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-[#1e3a8a] text-white font-condensed font-bold text-sm uppercase rounded-lg cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
