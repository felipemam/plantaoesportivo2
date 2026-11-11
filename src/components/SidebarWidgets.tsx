import React, { useState, useEffect } from 'react';
import { Trophy, CheckCircle2, Mail, Megaphone, ExternalLink } from 'lucide-react';
import { StandingsRow, Columnist } from '../data/portalData';

interface SidebarWidgetsProps {
  standings: StandingsRow[];
  columnists?: Columnist[];
  onOpenStandingsModal: () => void;
  onOpenSubscribe: () => void;
  onSelectArticleById: (articleId: string) => void;
  onShowToast: (message: string, type?: 'success' | 'error') => void;
  onOpenAdModal?: () => void;
}

interface PollOption {
  label: string;
  votes: number;
}

export const SidebarWidgets: React.FC<SidebarWidgetsProps> = ({
  standings,
  onOpenStandingsModal,
  onOpenSubscribe,
  onShowToast,
  onOpenAdModal
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
    } catch {
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
    } catch {
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
    <aside className="space-y-6">
      {/* 1. Mini Tabela do Brasileirão */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-xs transition-colors">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#facc15]" />
            <h3 className="font-condensed font-black text-xl text-[#1e3a8a] dark:text-[#facc15] uppercase tracking-wide">
              Brasileirão Série A
            </h3>
          </div>
          <span className="text-[11px] font-bold text-gray-400 uppercase">2026</span>
        </div>

        <div className="space-y-2 mb-4">
          <div className="grid grid-cols-[24px_1fr_40px_40px] text-[11px] font-bold text-gray-400 dark:text-gray-400 uppercase px-2">
            <span>#</span>
            <span>Clube</span>
            <span className="text-center">J</span>
            <span className="text-right">PTS</span>
          </div>

          {standings.slice(0, 5).map((row) => (
            <div
              key={row.position}
              className="grid grid-cols-[24px_1fr_40px_40px] items-center text-xs py-1.5 px-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-colors"
            >
              <span
                className={`w-5 h-5 rounded-full inline-flex items-center justify-center font-bold text-[11px] ${
                  row.position === 1
                    ? 'bg-[#facc15] text-gray-950 font-black'
                    : row.position <= 4
                    ? 'bg-blue-100 dark:bg-blue-950 text-[#1e3a8a] dark:text-blue-300 font-bold'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {row.position}
              </span>
              <span className="font-semibold text-gray-900 dark:text-gray-100 truncate pr-2">
                {row.team}
              </span>
              <span className="text-center text-gray-500 dark:text-gray-400 font-mono text-[11px]">
                {row.played}
              </span>
              <span className="text-right font-condensed font-black text-sm text-[#1e3a8a] dark:text-blue-400">
                {row.points}
              </span>
            </div>
          ))}
        </div>

        <button
          onClick={onOpenStandingsModal}
          className="w-full py-2 bg-gray-100 dark:bg-gray-800 hover:bg-[#1e3a8a] hover:text-white dark:hover:bg-blue-600 text-gray-700 dark:text-gray-200 font-condensed font-bold text-xs uppercase rounded-lg transition-colors cursor-pointer"
        >
          Ver Classificação Completa
        </button>
      </div>

      {/* 2. Enquete do Leitor */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-xs transition-colors">
        <div className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-100 dark:bg-red-950/60 text-[#dc2626] dark:text-red-400 mb-2">
          Enquete Plantão
        </div>
        <h3 className="font-condensed font-bold text-lg text-gray-900 dark:text-gray-100 uppercase leading-snug mb-3">
          Quem leva o título do Campeonato Brasileiro nesta temporada?
        </h3>

        <div className="space-y-2">
          {pollOptions.map((opt, idx) => {
            const percent = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
            const isSelected = selectedPollIndex === idx;

            if (hasVoted) {
              return (
                <div key={opt.label} className="relative overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800 p-2 text-xs">
                  <div
                    className={`absolute inset-y-0 left-0 transition-all duration-500 ${
                      isSelected
                        ? 'bg-blue-100 dark:bg-blue-950/70 border-r-2 border-[#1e3a8a]'
                        : 'bg-gray-100 dark:bg-gray-800'
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                  <div className="relative flex items-center justify-between font-medium">
                    <span className="flex items-center gap-1.5 text-gray-900 dark:text-gray-100">
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#1e3a8a] dark:text-blue-400 inline" />}
                      {opt.label}
                    </span>
                    <span className="font-bold text-gray-700 dark:text-gray-300">{percent}%</span>
                  </div>
                </div>
              );
            }

            return (
              <button
                key={opt.label}
                onClick={() => handleVote(idx)}
                className="w-full text-left p-2.5 border border-gray-200 dark:border-gray-800 hover:border-[#1e3a8a] dark:hover:border-blue-500 hover:bg-blue-50/40 dark:hover:bg-gray-800/80 rounded-lg text-xs font-semibold text-gray-800 dark:text-gray-200 transition-colors cursor-pointer flex items-center justify-between"
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

      {/* 3. Espaço Publicitário Lateral (Half Page / MPU 300x250) */}
      <div className="relative rounded-xl border border-gray-300 dark:border-gray-700/80 bg-gradient-to-br from-[#1e3a8a] to-[#0f172a] text-white p-5 shadow-md overflow-hidden text-center">
        <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-widest text-[#facc15] mb-2 border-b border-blue-800/60 pb-1.5">
          <span className="flex items-center gap-1">
            <Megaphone className="w-3 h-3 text-[#facc15]" />
            Publicidade • 300x250
          </span>
          {onOpenAdModal && (
            <button
              onClick={onOpenAdModal}
              className="hover:underline flex items-center gap-0.5 text-blue-200 cursor-pointer"
            >
              <span>Mídia Kit</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </button>
          )}
        </div>
        <div className="font-condensed font-black text-2xl uppercase tracking-wide leading-none my-2 text-white">
          Temporada Esportiva 2026
        </div>
        <p className="text-xs text-blue-100 max-w-[240px] mx-auto mb-4">
          Divulgue seu produto ou evento para o público mais engajado do esporte brasileiro.
        </p>
        <div className="flex items-center justify-center gap-2">
          {onOpenAdModal ? (
            <button
              onClick={onOpenAdModal}
              className="bg-[#facc15] hover:bg-[#eab308] text-gray-950 font-condensed font-black text-xs uppercase px-4 py-2 rounded-lg shadow-sm hover:scale-105 transition-all cursor-pointer inline-flex items-center gap-1"
            >
              <span>Anuncie Aqui</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          ) : (
            <button
              onClick={onOpenSubscribe}
              className="bg-[#facc15] hover:bg-[#eab308] text-gray-950 font-condensed font-black text-xs uppercase px-4 py-2 rounded-lg shadow-sm hover:scale-105 transition-all cursor-pointer"
            >
              Conhecer Planos
            </button>
          )}
        </div>
      </div>

      {/* 4. Newsletter Express */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-xs transition-colors">
        <div className="flex items-center gap-2 mb-1">
          <Mail className="w-5 h-5 text-[#dc2626]" />
          <h3 className="font-condensed font-black text-xl text-[#1e3a8a] dark:text-[#facc15] uppercase">
            Boletim Matinal
          </h3>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          Receba o resumo diário do esporte toda manhã no seu e-mail.
        </p>

        <form onSubmit={handleNewsletterSubmit} className="space-y-2">
          <input
            type="email"
            value={sideEmail}
            onChange={(e) => setSideEmail(e.target.value)}
            placeholder="seu@email.com.br"
            className="w-full h-10 px-3 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] dark:focus:ring-blue-500 text-gray-900 dark:text-gray-100"
            required
          />
          <button
            type="submit"
            className="w-full h-10 bg-[#1e3a8a] dark:bg-blue-600 hover:bg-[#172554] dark:hover:bg-blue-700 text-white font-condensed font-bold text-sm uppercase rounded-lg tracking-wider transition-colors cursor-pointer"
          >
            Quero Receber
          </button>
        </form>
        <p className="text-[10px] text-gray-400 mt-2">Sem spam. Cancele quando quiser com 1 clique.</p>
      </div>
    </aside>
  );
};
