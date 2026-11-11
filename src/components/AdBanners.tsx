import React, { useState } from 'react';
import { Megaphone, ExternalLink, Sparkles, X, Mail, Phone, BarChart2 } from 'lucide-react';

export interface AdInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast?: (message: string, type: 'success' | 'error') => void;
}

export const AdInfoModal: React.FC<AdInfoModalProps> = ({ isOpen, onClose, onShowToast }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyEmail = () => {
    navigator.clipboard?.writeText('comercial@plantaoesportivo.com.br');
    setCopied(true);
    onShowToast?.('Email comercial copiado com sucesso!', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative text-gray-900 dark:text-gray-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Megaphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-condensed font-black text-2xl uppercase tracking-tight text-[#1e3a8a] dark:text-[#facc15]">
              Mídia Kit & Espaços Publicitários
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Conecte sua marca a milhões de apaixonados por esportes
            </p>
          </div>
        </div>

        <div className="space-y-4 my-4">
          <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/60">
            <div className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-1.5">
              <BarChart2 className="w-4 h-4" /> Formatos Disponíveis (Padrão IAB)
            </div>
            <ul className="text-xs space-y-1.5 text-gray-600 dark:text-gray-300">
              <li>• <strong>Super Banner Topo (Leaderboard):</strong> 728x90 px (desktop) e 320x50 px (mobile)</li>
              <li>• <strong>MPU In-Feed (Native):</strong> 300x250 px integrado às notícias</li>
              <li>• <strong>Half-Page Lateral (Sidebar):</strong> 300x600 px de alto impacto</li>
              <li>• <strong>Patrocínio de Cobertura ao Vivo:</strong> Branding em placares e tempo real</li>
            </ul>
          </div>

          <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-xs text-gray-700 dark:text-gray-300 space-y-2">
            <div className="font-semibold text-[#1e3a8a] dark:text-blue-300">
              Fale com nosso departamento comercial:
            </div>
            <div className="flex items-center justify-between bg-white dark:bg-gray-900 p-2 rounded-lg border border-blue-200/80 dark:border-blue-900">
              <div className="flex items-center gap-2 truncate">
                <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span className="font-mono text-[11px] truncate">comercial@plantaoesportivo.com.br</span>
              </div>
              <button
                onClick={handleCopyEmail}
                className="px-2.5 py-1 text-[11px] font-bold bg-[#1e3a8a] text-white rounded hover:bg-blue-800 transition-colors cursor-pointer shrink-0"
              >
                {copied ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-[11px]">
              <Phone className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>(11) 3456-7890 • Atendimento de Segunda a Sexta das 9h às 18h</span>
            </div>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold uppercase rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

interface LeaderboardAdProps {
  onOpenAdModal?: () => void;
  className?: string;
}

export const LeaderboardAd: React.FC<LeaderboardAdProps> = ({ onOpenAdModal, className = '' }) => {
  return (
    <div className={`w-full max-w-[1240px] mx-auto px-4 my-3 ${className}`}>
      <div className="relative rounded-xl border border-gray-300 dark:border-gray-700/80 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-850 dark:to-gray-900 shadow-xs overflow-hidden">
        {/* Top Ad Identification Label */}
        <div className="flex items-center justify-between px-3 py-1 bg-gray-200/80 dark:bg-gray-800/80 border-b border-gray-300/80 dark:border-gray-700/80 text-[10px] text-gray-500 dark:text-gray-400 font-semibold tracking-wider uppercase">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            <span>Espaço Publicitário • Super Banner (728x90 / 970x90)</span>
          </div>
          {onOpenAdModal && (
            <button
              onClick={onOpenAdModal}
              className="text-[#1e3a8a] dark:text-[#facc15] hover:underline font-bold cursor-pointer inline-flex items-center gap-1"
            >
              <span>Anuncie Aqui</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </button>
          )}
        </div>

        {/* Ad Content Creative */}
        <div className="min-h-[85px] sm:h-[90px] px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1e3a8a] to-[#dc2626] text-white flex items-center justify-center font-black text-lg shadow-sm shrink-0">
              <Sparkles className="w-6 h-6 text-[#facc15]" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-gray-900 dark:text-gray-100 leading-snug">
                BANCO DO TORCEDOR & CONCESSIONÁRIA SPORT
              </div>
              <div className="text-[11px] sm:text-xs text-gray-600 dark:text-gray-300 font-medium">
                Abra sua conta digital com camisa oficial grátis e cashback nos ingressos.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenAdModal}
              className="px-4 py-1.5 rounded-lg bg-[#dc2626] hover:bg-[#b91c1c] text-white font-condensed font-bold text-xs uppercase tracking-wider transition-colors shadow-xs cursor-pointer"
            >
              Conferir Oferta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface InFeedAdProps {
  onOpenAdModal?: () => void;
  className?: string;
}

export const InFeedAd: React.FC<InFeedAdProps> = ({ onOpenAdModal, className = '' }) => {
  return (
    <div
      className={`rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-800/40 p-4 flex flex-col items-center justify-center text-center min-h-[260px] relative group hover:border-[#1e3a8a] dark:hover:border-[#facc15] transition-all ${className}`}
    >
      <div className="absolute top-2.5 right-2.5 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
        Publicidade • 300x250 MPU
      </div>

      <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-950/80 text-[#1e3a8a] dark:text-blue-400 flex items-center justify-center mb-3">
        <Megaphone className="w-6 h-6" />
      </div>

      <h4 className="font-condensed font-bold text-base uppercase text-gray-800 dark:text-gray-200 mb-1">
        Espaço Publicitário Nativo
      </h4>
      <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs mb-3">
        Destaque sua marca para os leitores do Plantão Esportivo neste bloco de alta visualização.
      </p>

      {onOpenAdModal && (
        <button
          onClick={onOpenAdModal}
          className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-[#1e3a8a] dark:bg-blue-600 hover:bg-blue-800 dark:hover:bg-blue-500 text-white transition-colors cursor-pointer inline-flex items-center gap-1.5"
        >
          <span>Mídia Kit & Reservas</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};

interface SidebarAdProps {
  onOpenAdModal?: () => void;
  className?: string;
}

export const SidebarAd: React.FC<SidebarAdProps> = ({ onOpenAdModal, className = '' }) => {
  return (
    <div
      className={`rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/90 shadow-sm p-4 relative overflow-hidden ${className}`}
    >
      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-400 mb-3 pb-2 border-b border-gray-100 dark:border-gray-700">
        <span>Anúncio Patrocinado</span>
        <span className="text-[9px] bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 px-1.5 py-0.5 rounded font-mono">
          300x300
        </span>
      </div>

      <div className="bg-gradient-to-br from-blue-900 to-[#1e3a8a] text-white p-4 rounded-xl text-center space-y-2">
        <div className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-[#dc2626] text-white uppercase tracking-wider">
          Parceiro Oficial
        </div>
        <div className="font-condensed font-black text-xl uppercase tracking-tight text-[#facc15]">
          Corrida & Ciclismo Store
        </div>
        <p className="text-xs text-blue-100">
          Equipamentos profissionais de maratona e bikes de alta performance com frete grátis.
        </p>
        <button
          onClick={onOpenAdModal}
          className="mt-2 w-full py-2 rounded-lg bg-[#facc15] hover:bg-yellow-400 text-gray-900 font-condensed font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
        >
          Acessar Desconto de 20%
        </button>
      </div>
    </div>
  );
};
