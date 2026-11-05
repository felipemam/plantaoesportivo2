import React, { useState } from 'react';

interface FooterProps {
  onSelectCategory: (category: string) => void;
  onOpenInstitutionalModal: (title: string, content: string) => void;
  onShowToast: (message: string, type?: 'success' | 'error') => void;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectCategory,
  onOpenInstitutionalModal,
  onShowToast
}) => {
  const [footEmail, setFootEmail] = useState('');

  const handleFootSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!footEmail.includes('@') || !footEmail.includes('.')) {
      onShowToast('Informe um e-mail válido.', 'error');
      return;
    }
    setFootEmail('');
    onShowToast('Assinatura confirmada no rodapé!', 'success');
  };

  const handleInstitutionalClick = (item: string) => {
    switch (item) {
      case 'Sobre a redação':
        onOpenInstitutionalModal(
          'Sobre a Redação',
          'O Plantão Esportivo é um portal de jornalismo esportivo brasileiro independente, fundado em 2026. Nossa redação é composta por repórteres, colunistas e analistas dedicados à cobertura ágil, transparente e fundamentada em dados sobre futebol, modalidades olímpicas, atletismo de rua e políticas públicas do esporte.'
        );
        break;
      case 'Expediente':
        onOpenInstitutionalModal(
          'Expediente',
          'Direção Editorial: Rafael Tavares\nEditora Executiva: Juliana Prado\nChefia de Reportagem: Lucas Campos\nCorrespondente de Ciclismo: Marcos Velloso\nAnálise de Políticas Públicas: Helena Alves\nTecnologia & Dados: Redação Digital SP.'
        );
        break;
      case 'Trabalhe conosco':
        onOpenInstitutionalModal(
          'Trabalhe Conosco',
          'Interessado em fazer parte da equipe de cobertura esportiva do Plantão? Envie seu currículo e portfólio para redacao@plantaoesportivo.com.br com o assunto "Talentos Plantão 2026".'
        );
        break;
      case 'Política de privacidade':
        onOpenInstitutionalModal(
          'Política de Privacidade & Termos',
          'O Plantão Esportivo respeita sua privacidade e atua em conformidade com a LGPD (Lei Geral de Proteção de Dados - Lei 13.709/2018). Seus dados cadastrais de newsletter nunca são compartilhados ou comercializados com terceiros.'
        );
        break;
      case 'Contato':
        onOpenInstitutionalModal(
          'Fale com a Redação',
          'Sugestões de pauta, correções e parcerias comerciais:\nE-mail: contato@plantaoesportivo.com.br\nWhatsApp da Redação: (11) 98765-4321\nEndereço: Av. Paulista, 1000 - Bela Vista, São Paulo, SP.'
        );
        break;
      default:
        break;
    }
  };

  return (
    <footer className="bg-[#1f2937] text-gray-300 pt-14 pb-8 border-t border-gray-800">
      <div className="max-w-[1240px] mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Col 1: Brand & Bio */}
          <div>
            <div className="font-condensed font-black text-2xl text-white tracking-tight uppercase">
              Plantão <span className="text-[#dc2626]">Esportivo</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-400 mt-3 leading-relaxed">
              Jornalismo esportivo independente, com cobertura diária e em tempo real de futebol, corrida de rua, ciclismo e política esportiva.
            </p>

            <div className="flex items-center gap-2.5 mt-5">
              <a
                href="#facebook"
                onClick={(e) => { e.preventDefault(); }}
                className="w-8 h-8 rounded-full bg-gray-800 hover:bg-[#1e3a8a] text-white flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.3v7A10 10 0 0 0 22 12z" />
                </svg>
              </a>
              <a
                href="#instagram"
                onClick={(e) => { e.preventDefault(); }}
                className="w-8 h-8 rounded-full bg-gray-800 hover:bg-[#1e3a8a] text-white flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.2c3.2 0 3.6 0 4.8.1 3.3.1 4.8 1.7 4.9 4.9.1 1.3.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 3.2-1.7 4.8-4.9 4.9-1.3.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-3.3-.1-4.8-1.7-4.9-4.9C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.8C2.4 3.9 3.9 2.4 7.2 2.3 8.4 2.2 8.8 2.2 12 2.2zM12 0C8.7 0 8.3 0 7.1.1 2.7.3.3 2.7.1 7.1 0 8.3 0 8.7 0 12s0 3.7.1 4.9c.2 4.4 2.6 6.8 7 7 1.2.1 1.6.1 4.9.1s3.7 0 4.9-.1c4.4-.2 6.8-2.6 7-7 .1-1.2.1-1.6.1-4.9s0-3.7-.1-4.9c-.2-4.4-2.6-6.8-7-7C15.7 0 15.3 0 12 0zm0 5.8a6.2 6.2 0 1 0 0 12.4 6.2 6.2 0 0 0 0-12.4zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.4-11.8a1.4 1.4 0 1 0 0 2.9 1.4 1.4 0 0 0 0-2.9z" />
                </svg>
              </a>
              <a
                href="#twitter"
                onClick={(e) => { e.preventDefault(); }}
                className="w-8 h-8 rounded-full bg-gray-800 hover:bg-[#1e3a8a] text-white flex items-center justify-center transition-colors"
                aria-label="Twitter / X"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.2 2h3.4l-7.4 8.5L23 22h-6.8l-5.3-7-6.1 7H1.4l7.9-9L1 2h7l4.8 6.4L18.2 2zm-1.2 18h1.9L7.1 4H5.1l11.9 16z" />
                </svg>
              </a>
              <a
                href="#youtube"
                onClick={(e) => { e.preventDefault(); }}
                className="w-8 h-8 rounded-full bg-gray-800 hover:bg-[#1e3a8a] text-white flex items-center justify-center transition-colors"
                aria-label="YouTube"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.6 15.6V8.4l6.3 3.6-6.3 3.6z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Col 2: Categorias */}
          <div>
            <h4 className="font-condensed font-bold text-base text-[#facc15] uppercase tracking-wider mb-4">
              Categorias
            </h4>
            <ul className="space-y-2 text-sm">
              {['Futebol', 'Corrida de Rua', 'Ciclismo', 'Esportes', 'Política', 'Editoriais'].map((cat) => (
                <li key={cat}>
                  <button
                    onClick={() => onSelectCategory(cat)}
                    className="hover:text-[#facc15] transition-colors cursor-pointer text-left"
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Institucional */}
          <div>
            <h4 className="font-condensed font-bold text-base text-[#facc15] uppercase tracking-wider mb-4">
              Institucional
            </h4>
            <ul className="space-y-2 text-sm">
              {['Sobre a redação', 'Expediente', 'Trabalhe conosco', 'Política de privacidade', 'Contato'].map((item) => (
                <li key={item}>
                  <button
                    onClick={() => handleInstitutionalClick(item)}
                    className="hover:text-[#facc15] transition-colors cursor-pointer text-left"
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Newsletter do rodapé */}
          <div>
            <h4 className="font-condensed font-bold text-base text-[#facc15] uppercase tracking-wider mb-2">
              Newsletter
            </h4>
            <p className="text-xs text-gray-400 mb-3">
              Receba o resumo esportivo de hora em hora.
            </p>
            <form onSubmit={handleFootSubmit} className="space-y-2">
              <input
                type="email"
                value={footEmail}
                onChange={(e) => setFootEmail(e.target.value)}
                placeholder="seu@email.com.br"
                className="w-full h-10 px-3 rounded-lg bg-gray-900 border border-gray-700 text-sm text-white focus:outline-none focus:border-[#facc15]"
                required
              />
              <button
                type="submit"
                className="w-full h-10 bg-[#facc15] hover:bg-[#eab308] text-gray-950 font-condensed font-bold text-sm uppercase rounded-lg transition-colors cursor-pointer"
              >
                Assinar
              </button>
            </form>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-12 pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-2">
          <span>© 2026 Plantão Esportivo. Todos os direitos reservados.</span>
          <span>CNPJ 00.000.000/0001-00 • Redação Central em São Paulo, SP</span>
        </div>
      </div>
    </footer>
  );
};
