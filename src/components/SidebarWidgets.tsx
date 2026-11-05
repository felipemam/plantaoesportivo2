import React, { useState, useEffect } from 'react';
import { Trophy, CheckCircle2, Mail, Users, ArrowUpRight } from 'lucide-react';
import { StandingsRow, Columnist, Article } from '../data/portalData';

interface SidebarWidgetsProps {
  standings: StandingsRow[];
  columnists: Columnist[];
  onOpenStandingsModal: () => void;
  onOpenSubscribe: () => void;
  onSelectArticleById: (articleId: string) => void;
  onShowToast: (message: string, type?: 'success' | 'error') => void;
}

interface PollOption {
  label: string;
  votes: number;
}

export const SidebarWidgets: React.FC<SidebarWidgetsProps> = ({
  standings,
  columnists,
  onOpenStandingsModal,
  onOpenSubscribe,
  onSelectArticleById,
  onShowToast
}) => {
  // Poll state with localStorage persistence
  const [pollOptions, setPollOptions] = useState<PollOption[]>([
    { label: 'Flamengo', votes: 42 },
    { label: 'Palmeiras', votes: 31 },
    { label: 'Botafogo', votes: 14 },
    { label: 'Corinthians', votes: 13 }
  ]);
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedPollIndex, setSelectedPollIndex] = useState<number | null>(null);

  // Newsletter state
  const [sideEmail, setSideEmail] = useState('');

  useEffect(() => {
    try {
      const savedVote = localStorage.getItem('plantao_poll_vote');
      if (savedVote !== null) {
        setHasVoted(true);
        setSelectedPollIndex(parseInt(savedVote, 10));
      }
    } catch (e) {
      // Ignore localStorage unavailable
    }
  }, []);

  const totalVotes = pollOptions.reduce((acc, curr) => acc + curr.votes, 0);

  const handleVote = (index: number) => {
    if (hasVoted) return;

    const updated = [...pollOptions];
    updated[index].votes += 1;
    setPollOptions(updated);
    setHasVoted(true);
    setSelectedPollIndex(index);

    try {
      localStorage.setItem('plantao_poll_vote', index.toString());
    } catch (e) {
      // Ignore
    }

    onShowToast(`Voto registrado para ${updated[index].label}! Obrigado por participar.`, 'success');
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sideEmail.includes('@') || !sideEmail.includes('.')) {
      onShowToast('Informe um e-mail válido para receber o boletim.', 'error');
      return;
    }
    setSideEmail('');
    onShowToast('Inscrição confirmada! Você receberá o resumo diário às 7h.', 'success');
  };

  return (
    <aside className="space-y-6" aria-label="Barra lateral informativa">
      {/* 1. Ranking do Brasileirão */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-condensed font-black text-xl text-[#1e3a8a] uppercase flex items-center gap-1.5">
            <Trophy className="w-5 h-5 text-[#facc15]" />
            Ranking Brasileirão
          </h3>
          <span className="text-[11px] font-bold text-gray-400 uppercase">Série A</span>
        </div>
        <p className="text-xs text-gray-500 mb-3">Classificação atualizada • Pontos corridos</p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                <th className="py-1.5 w-7 text-center">#</th>
                <th className="py-1.5">Time</th>
                <th className="py-1.5 text-center text-xs">J</th>
                <th className="py-1.5 text-right font-black text-xs">Pts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {standings.slice(0, 5).map((row) => (
                <tr key={row.team} className="hover:bg-blue-50/40 transition-colors">
                  <td className="py-2.5 text-center">
                    <span
                      className={`w-5 h-5 rounded-full inline-flex items-center justify-center text-xs font-bold ${
                        row.position === 1
                          ? 'bg-[#facc15] text-gray-950 shadow-xs'
                          : row.position <= 4
                          ? 'bg-blue-100 text-[#1e3a8a]'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {row.position}
                    </span>
                  </td>
                  <td className="py-2.5 font-semibold text-gray-900 flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: row.crestColor }}
                    />
                    <span className="truncate">{row.team}</span>
                  </td>
                  <td className="py-2.5 text-center text-xs text-gray-500 font-normal">
                    {row.played}
                  </td>
                  <td className="py-2.5 text-right font-condensed font-black text-base text-[#1e3a8a] tabular-nums">
                    {row.points}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button
          onClick={onOpenStandingsModal}
          className="mt-3.5 w-full py-2 text-xs font-bold text-[#1e3a8a] hover:text-[#dc2626] bg-blue-50/80 hover:bg-blue-100/80 rounded-lg transition-colors cursor-pointer uppercase tracking-wider flex items-center justify-center gap-1"
        >
          <span>Ver Tabela Completa</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 2. Enquete Interativa */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-condensed font-black text-xl text-[#1e3a8a] uppercase">
            Enquete do Leitor
          </h3>
          <span className="text-[10px] font-bold text-[#dc2626] uppercase bg-red-50 px-2 py-0.5 rounded">
            Interativo
          </span>
        </div>
        <p className="text-xs text-gray-500 mb-3">Participe com o seu voto</p>

        <p className="font-semibold text-sm text-gray-900 mb-3 leading-snug">
          Quem leva o título do Brasileirão 2026?
        </p>

        <div className="space-y-2">
          {pollOptions.map((opt, idx) => {
            const pct = Math.round((opt.votes / (totalVotes || 1)) * 100);
            const isSelected = selectedPollIndex === idx;

            if (hasVoted) {
              return (
                <div
                  key={opt.label}
                  className={`relative p-2.5 border rounded-lg overflow-hidden transition-all text-xs font-semibold ${
                    isSelected
                      ? 'border-[#1e3a8a] bg-blue-50/60'
                      : 'border-gray-200 bg-gray-50/40'
                  }`}
                >
                  {/* Animated Percentage Fill Bar */}
                  <div
                    className="absolute left-0 top-0 bottom-0 bg-blue-200/50 transition-all duration-700 ease-out z-0"
                    style={{ width: `${pct}%` }}
                  />
                  <div className="relative z-10 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-gray-900">
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#1e3a8a]" />}
                      {opt.label}
                    </span>
                    <span className="font-bold text-[#1e3a8a] tabular-nums">{pct}%</span>
                  </div>
                </div>
              );
            }

            return (
              <button
                key={opt.label}
                onClick={() => handleVote(idx)}
                className="w-full text-left p-2.5 border border-gray-200 hover:border-[#1e3a8a] hover:bg-blue-50/40 rounded-lg text-xs font-semibold text-gray-800 transition-colors cursor-pointer flex items-center justify-between"
              >
                <span>{opt.label}</span>
                <span className="text-[11px] text-gray-400 font-normal">Votar</span>
              </button>
            );
          })}
        </div>

        <div className="mt-3 text-right text-[11px] text-gray-400">
          {totalVotes} votos computados
        </div>
      </div>

      {/* 3. Newsletter Express */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <Mail className="w-5 h-5 text-[#dc2626]" />
          <h3 className="font-condensed font-black text-xl text-[#1e3a8a] uppercase">
            Newsletter
          </h3>
        </div>
        <p className="text-xs text-gray-500 mb-3">
          Receba o resumo diário do esporte toda manhã no seu e-mail.
        </p>

        <form onSubmit={handleNewsletterSubmit} className="space-y-2">
          <input
            type="email"
            value={sideEmail}
            onChange={(e) => setSideEmail(e.target.value)}
            placeholder="seu@email.com.br"
            className="w-full h-10 px-3 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] focus:bg-white"
            required
          />
          <button
            type="submit"
            className="w-full h-10 bg-[#1e3a8a] hover:bg-[#172554] text-white font-condensed font-bold text-sm uppercase rounded-lg tracking-wider transition-colors cursor-pointer"
          >
            Quero Receber
          </button>
        </form>
        <p className="text-[10px] text-gray-400 mt-2">Sem spam. Cancele quando quiser com 1 clique.</p>
      </div>

      {/* 4. Colunistas do Plantão */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <Users className="w-5 h-5 text-[#1e3a8a]" />
          <h3 className="font-condensed font-black text-xl text-[#1e3a8a] uppercase">
            Colunistas
          </h3>
        </div>
        <p className="text-xs text-gray-500 mb-3.5">
          Opinião de quem vive e apura o esporte de perto
        </p>

        <div className="space-y-3">
          {columnists.map((col) => (
            <div
              key={col.id}
              onClick={() => onSelectArticleById(col.latestArticleId)}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group"
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-condensed font-black text-sm shrink-0 shadow-xs"
                style={{ background: col.gradient }}
              >
                {col.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm text-gray-900 group-hover:text-[#1e3a8a] transition-colors truncate">
                  {col.name}
                </div>
                <div className="text-xs text-gray-500 flex items-center gap-1.5">
                  <span className="font-medium text-blue-900">{col.beat}</span>
                  <span>•</span>
                  <span>{col.region}</span>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-[#1e3a8a] group-hover:translate-x-0.5 transition-all" />
            </div>
          ))}
        </div>
      </div>

      {/* 5. Banner Promocional 300x250 */}
      <div className="relative rounded-xl overflow-hidden p-6 text-white text-center shadow-md bg-gradient-to-br from-[#dc2626] to-[#991b1b] min-h-[220px] flex flex-col items-center justify-center">
        <div className="text-[10px] uppercase font-bold tracking-widest text-[#facc15] mb-1">
          Publicidade
        </div>
        <div className="font-condensed font-black text-2xl uppercase tracking-wide leading-none mb-2">
          Temporada 2026
        </div>
        <p className="text-xs text-white/90 max-w-[240px] mb-4">
          Assinantes têm acesso ilimitado às transmissões em vídeo, colunas exclusivas e sem anúncios.
        </p>
        <button
          onClick={onOpenSubscribe}
          className="bg-[#facc15] hover:bg-[#eab308] text-gray-950 font-condensed font-black text-sm uppercase px-5 py-2.5 rounded-lg shadow-sm hover:scale-105 transition-all cursor-pointer"
        >
          Conhecer Planos
        </button>
      </div>
    </aside>
  );
};
