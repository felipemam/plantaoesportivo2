import React, { useState } from 'react';
import { Mail, CheckCircle } from 'lucide-react';

interface NewsletterBandProps {
  onShowToast: (message: string, type?: 'success' | 'error') => void;
}

export const NewsletterBand: React.FC<NewsletterBandProps> = ({ onShowToast }) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@') || !email.includes('.')) {
      onShowToast('Por favor, informe um endereço de e-mail válido.', 'error');
      return;
    }
    setSubscribed(true);
    onShowToast('Inscrição confirmada na Newsletter Diária!', 'success');
  };

  return (
    <section className="bg-[#1e3a8a] text-white py-14 relative overflow-hidden" aria-labelledby="band-title">
      {/* Dynamic angled geometric shapes from branding */}
      <div className="absolute -top-16 -right-24 w-96 h-48 bg-[#dc2626] -rotate-12 opacity-80 pointer-events-none"></div>
      <div className="absolute -bottom-20 -left-20 w-80 h-40 bg-[#facc15] -rotate-12 opacity-20 pointer-events-none"></div>

      <div className="max-w-[1240px] mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-8 items-center">
          <div>
            <span className="text-xs font-condensed font-black tracking-widest text-[#facc15] uppercase bg-blue-900/60 px-3 py-1 rounded-full border border-blue-700/50">
              Newsletter Diária Gratuita
            </span>
            <h2 id="band-title" className="font-condensed font-black text-3xl sm:text-4xl lg:text-5xl uppercase leading-none mt-3 mb-2">
              O resumo do esporte, todo dia cedo
            </h2>
            <p className="text-blue-100 text-sm sm:text-base max-w-xl leading-relaxed">
              Placares da rodada, manchetes urgentes e análises exclusivas selecionadas pela redação, direto na sua caixa de entrada às 7h da manhã.
            </p>
          </div>

          <div>
            {subscribed ? (
              <div className="bg-white/10 backdrop-blur-xs border border-white/20 rounded-xl p-6 text-center animate-in fade-in duration-300">
                <CheckCircle className="w-10 h-10 text-[#facc15] mx-auto mb-2" />
                <h3 className="font-condensed font-bold text-2xl uppercase">Bem-vindo ao Plantão!</h3>
                <p className="text-sm text-blue-100 mt-1">
                  Enviamos uma mensagem de confirmação para o seu e-mail.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Digite seu melhor e-mail"
                  className="flex-1 h-12 px-4 rounded-lg bg-white text-gray-900 text-sm sm:text-base font-medium placeholder-gray-500 focus:outline-none focus:ring-3 focus:ring-[#facc15]"
                  required
                />
                <button
                  type="submit"
                  className="h-12 px-7 bg-[#facc15] hover:bg-[#eab308] text-gray-950 font-condensed font-black text-base uppercase rounded-lg shadow-sm hover:scale-102 transition-all cursor-pointer shrink-0"
                >
                  Assinar Grátis
                </button>
              </form>
            )}
            <p className="text-[11px] text-blue-200 mt-2.5">
              Gratuita, sem compromisso. Cancele seu cadastro quando quiser.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
