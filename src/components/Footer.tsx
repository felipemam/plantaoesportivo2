import React, { useState } from 'react';
import { Edit3, X, Save, RotateCcw, Settings } from 'lucide-react';
import {
  FooterTextConfig,
  InstitutionalItemConfig,
  loadFooterConfig,
  saveFooterConfig,
  resetFooterConfig
} from '../utils/footerConfig';

interface FooterProps {
  onSelectCategory: (category: string) => void;
  onOpenInstitutionalModal: (title: string, content: string) => void;
  onShowToast: (message: string, type?: 'success' | 'error') => void;
  onOpenWordPressConfig?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectCategory,
  onOpenInstitutionalModal,
  onShowToast,
  onOpenWordPressConfig
}) => {
  const [footEmail, setFootEmail] = useState('');
  const [config, setConfig] = useState<FooterTextConfig>(() => loadFooterConfig());
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [draftConfig, setDraftConfig] = useState<FooterTextConfig>(() => loadFooterConfig());
  const [activeTab, setActiveTab] = useState<'main' | 'institutional'>('main');

  const handleFootSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!footEmail.includes('@') || !footEmail.includes('.')) {
      onShowToast('Informe um e-mail válido.', 'error');
      return;
    }
    setFootEmail('');
    onShowToast('Assinatura confirmada no rodapé!', 'success');
  };

  const handleInstitutionalClick = (item: InstitutionalItemConfig) => {
    onOpenInstitutionalModal(item.modalTitle, item.modalContent);
  };

  const handleOpenEditor = () => {
    setDraftConfig({
      ...config,
      institutionalItems: config.institutionalItems.map((i) => ({ ...i }))
    });
    setIsEditorOpen(true);
  };

  const handleSaveEditor = (e: React.FormEvent) => {
    e.preventDefault();
    const saved = saveFooterConfig(draftConfig);
    setConfig(saved);
    setIsEditorOpen(false);
    onShowToast('Textos do rodapé atualizados com sucesso!', 'success');
  };

  const handleResetEditor = () => {
    const defaults = resetFooterConfig();
    setConfig(defaults);
    setDraftConfig({
      ...defaults,
      institutionalItems: defaults.institutionalItems.map((i) => ({ ...i }))
    });
    onShowToast('Textos do rodapé restaurados para o padrão.', 'success');
  };

  const updateDraftInstitutional = (
    index: number,
    field: keyof InstitutionalItemConfig,
    value: string
  ) => {
    setDraftConfig((prev) => {
      const updated = [...prev.institutionalItems];
      updated[index] = {
        ...updated[index],
        [field]: value
      };
      return {
        ...prev,
        institutionalItems: updated
      };
    });
  };

  return (
    <>
      <footer className="bg-[#1f2937] text-gray-300 pt-14 pb-8 border-t border-gray-800">
        <div className="max-w-[1240px] mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* Col 1: Brand & Bio */}
            <div>
              <div className="font-condensed font-black text-2xl text-white tracking-tight uppercase">
                Plantão <span className="text-[#dc2626]">Esportivo</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-400 mt-3 leading-relaxed">
                {config.brandBio}
              </p>

              <div className="flex items-center gap-2.5 mt-5">
                <a
                  href="#facebook"
                  onClick={(e) => {
                    e.preventDefault();
                  }}
                  className="w-8 h-8 rounded-full bg-gray-800 hover:bg-[#1e3a8a] text-white flex items-center justify-center transition-colors"
                  aria-label="Facebook"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.3v7A10 10 0 0 0 22 12z" />
                  </svg>
                </a>
                <a
                  href="#instagram"
                  onClick={(e) => {
                    e.preventDefault();
                  }}
                  className="w-8 h-8 rounded-full bg-gray-800 hover:bg-[#1e3a8a] text-white flex items-center justify-center transition-colors"
                  aria-label="Instagram"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.2c3.2 0 3.6 0 4.8.1 3.3.1 4.8 1.7 4.9 4.9.1 1.3.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 3.2-1.7 4.8-4.9 4.9-1.3.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-3.3-.1-4.8-1.7-4.9-4.9C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.8C2.4 3.9 3.9 2.4 7.2 2.3 8.4 2.2 8.8 2.2 12 2.2zM12 0C8.7 0 8.3 0 7.1.1 2.7.3.3 2.7.1 7.1 0 8.3 0 8.7 0 12s0 3.7.1 4.9c.2 4.4 2.6 6.8 7 7 1.2.1 1.6.1 4.9.1s3.7 0 4.9-.1c4.4-.2 6.8-2.6 7-7 .1-1.2.1-1.6.1-4.9s0-3.7-.1-4.9c-.2-4.4-2.6-6.8-7-7C15.7 0 15.3 0 12 0zm0 5.8a6.2 6.2 0 1 0 0 12.4 6.2 6.2 0 0 0 0-12.4zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.4-11.8a1.4 1.4 0 1 0 0 2.9 1.4 1.4 0 0 0 0-2.9z" />
                  </svg>
                </a>
                <a
                  href="#twitter"
                  onClick={(e) => {
                    e.preventDefault();
                  }}
                  className="w-8 h-8 rounded-full bg-gray-800 hover:bg-[#1e3a8a] text-white flex items-center justify-center transition-colors"
                  aria-label="Twitter / X"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M18.2 2h3.4l-7.4 8.5L23 22h-6.8l-5.3-7-6.1 7H1.4l7.9-9L1 2h7l4.8 6.4L18.2 2zm-1.2 18h1.9L7.1 4H5.1l11.9 16z" />
                  </svg>
                </a>
                <a
                  href="#youtube"
                  onClick={(e) => {
                    e.preventDefault();
                  }}
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
                {[
                  'Futebol',
                  'Corrida de Rua',
                  'Ciclismo',
                  'Esportes',
                  'Política',
                  'Editoriais'
                ].map((cat) => (
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
                {config.institutionalItems.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => handleInstitutionalClick(item)}
                      className="hover:text-[#facc15] transition-colors cursor-pointer text-left"
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 4: Newsletter do rodapé */}
            <div>
              <h4 className="font-condensed font-bold text-base text-[#facc15] uppercase tracking-wider mb-2">
                {config.newsletterTitle}
              </h4>
              <p className="text-xs text-gray-400 mb-3">{config.newsletterSubtitle}</p>
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
                  {config.newsletterButtonText}
                </button>
              </form>
            </div>
          </div>

          {/* Bottom copyright & Developer Credit */}
          <div className="mt-12 pt-6 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between text-xs text-gray-400 gap-3">
            <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left">
              <span>{config.copyrightText}</span>
              <span className="hidden sm:inline text-gray-700">•</span>
              <span>{config.companyInfoText}</span>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-end gap-3">
              <div className="text-center md:text-right">
                <span className="text-[11px] uppercase tracking-wider text-gray-500 block sm:inline mr-1">
                  {config.developerLabel}
                </span>
                <span className="text-[#facc15] font-condensed font-bold tracking-wide uppercase">
                  {config.developerCredit}
                </span>
              </div>

              <button
                onClick={handleOpenEditor}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-gray-800/80 hover:bg-gray-700 text-gray-400 hover:text-[#facc15] text-[11px] font-medium transition-colors cursor-pointer border border-gray-700/60"
                title="Editar textos e informações do rodapé"
              >
                <Edit3 className="w-3 h-3" />
                <span>Editar Rodapé</span>
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Modal: Editor de Textos do Rodapé */}
      {isEditorOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
          aria-labelledby="footer-editor-title"
        >
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden my-8">
            {/* Header */}
            <div className="bg-[#1e3a8a] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Edit3 className="w-5 h-5 text-[#facc15]" />
                <div>
                  <h2
                    id="footer-editor-title"
                    className="font-condensed font-black text-xl uppercase tracking-wide"
                  >
                    Personalizar Textos do Rodapé
                  </h2>
                  <p className="text-xs text-blue-200">
                    Edite a descrição, CNPJ, créditos, newsletter e textos institucionais
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditorOpen(false)}
                className="p-1.5 text-blue-200 hover:text-white rounded-lg hover:bg-blue-800/60 cursor-pointer"
                aria-label="Fechar editor do rodapé"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 px-6 gap-2 pt-3">
              <button
                type="button"
                onClick={() => setActiveTab('main')}
                className={`px-4 py-2 text-xs font-condensed font-bold uppercase tracking-wider rounded-t-lg border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'main'
                    ? 'border-[#1e3a8a] dark:border-[#facc15] text-[#1e3a8a] dark:text-[#facc15] bg-white dark:bg-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                1. Textos Principais & Créditos
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('institutional')}
                className={`px-4 py-2 text-xs font-condensed font-bold uppercase tracking-wider rounded-t-lg border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'institutional'
                    ? 'border-[#1e3a8a] dark:border-[#facc15] text-[#1e3a8a] dark:text-[#facc15] bg-white dark:bg-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                2. Páginas Institucionais (5 Links)
              </button>
            </div>

            <form onSubmit={handleSaveEditor} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {activeTab === 'main' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-700 dark:text-gray-300 mb-1">
                      Descrição do Portal (abaixo da logo no rodapé)
                    </label>
                    <textarea
                      rows={2}
                      value={draftConfig.brandBio}
                      onChange={(e) =>
                        setDraftConfig((prev) => ({ ...prev, brandBio: e.target.value }))
                      }
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-700 dark:text-gray-300 mb-1">
                        Título da Newsletter
                      </label>
                      <input
                        type="text"
                        value={draftConfig.newsletterTitle}
                        onChange={(e) =>
                          setDraftConfig((prev) => ({ ...prev, newsletterTitle: e.target.value }))
                        }
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-700 dark:text-gray-300 mb-1">
                        Texto do Botão da Newsletter
                      </label>
                      <input
                        type="text"
                        value={draftConfig.newsletterButtonText}
                        onChange={(e) =>
                          setDraftConfig((prev) => ({
                            ...prev,
                            newsletterButtonText: e.target.value
                          }))
                        }
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-700 dark:text-gray-300 mb-1">
                      Subtítulo da Newsletter
                    </label>
                    <input
                      type="text"
                      value={draftConfig.newsletterSubtitle}
                      onChange={(e) =>
                        setDraftConfig((prev) => ({ ...prev, newsletterSubtitle: e.target.value }))
                      }
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-700 dark:text-gray-300 mb-1">
                        Texto de Direitos Autorais (Copyright)
                      </label>
                      <input
                        type="text"
                        value={draftConfig.copyrightText}
                        onChange={(e) =>
                          setDraftConfig((prev) => ({ ...prev, copyrightText: e.target.value }))
                        }
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-700 dark:text-gray-300 mb-1">
                        CNPJ e Cidade/Endereço da Redação
                      </label>
                      <input
                        type="text"
                        value={draftConfig.companyInfoText}
                        onChange={(e) =>
                          setDraftConfig((prev) => ({ ...prev, companyInfoText: e.target.value }))
                        }
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-gray-200 dark:border-gray-800">
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-700 dark:text-gray-300 mb-1">
                        Rótulo do Desenvolvedor
                      </label>
                      <input
                        type="text"
                        value={draftConfig.developerLabel}
                        onChange={(e) =>
                          setDraftConfig((prev) => ({ ...prev, developerLabel: e.target.value }))
                        }
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold uppercase text-gray-700 dark:text-gray-300 mb-1">
                        Assinatura / Crédito de Desenvolvimento
                      </label>
                      <input
                        type="text"
                        value={draftConfig.developerCredit}
                        onChange={(e) =>
                          setDraftConfig((prev) => ({ ...prev, developerCredit: e.target.value }))
                        }
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]"
                      />
                    </div>
                  </div>

                  {/* Discreet Admin Shortcut for WordPress since Header buttons were hidden */}
                  {onOpenWordPressConfig && (
                    <div className="pt-3 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gray-50 dark:bg-gray-800/60 p-3 rounded-xl">
                      <div>
                        <span className="text-xs font-bold text-gray-800 dark:text-gray-200 block">
                          Integração WordPress CMS (Oculta do Cabeçalho)
                        </span>
                        <span className="text-[11px] text-gray-500 dark:text-gray-400">
                          Configure a URL do seu WordPress ou consulte os slugs das categorias
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditorOpen(false);
                          onOpenWordPressConfig();
                        }}
                        className="px-3 py-1.5 rounded-lg bg-[#1e3a8a] hover:bg-[#172554] text-white text-xs font-condensed font-bold uppercase tracking-wider inline-flex items-center gap-1.5 cursor-pointer shrink-0"
                      >
                        <Settings className="w-3.5 h-3.5 text-[#facc15]" />
                        <span>Abrir Painel WordPress</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-5">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Personalize o nome de cada link da coluna <strong>Institucional</strong> e o
                    texto completo que aparece quando o leitor clica nele:
                  </p>
                  {draftConfig.institutionalItems.map((item, idx) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 space-y-3"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold uppercase text-gray-600 dark:text-gray-400 mb-1">
                            Texto do Link no Rodapé #{idx + 1}
                          </label>
                          <input
                            type="text"
                            value={item.label}
                            onChange={(e) =>
                              updateDraftInstitutional(idx, 'label', e.target.value)
                            }
                            className="w-full px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs text-gray-900 dark:text-gray-100"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold uppercase text-gray-600 dark:text-gray-400 mb-1">
                            Título da Janela (Modal)
                          </label>
                          <input
                            type="text"
                            value={item.modalTitle}
                            onChange={(e) =>
                              updateDraftInstitutional(idx, 'modalTitle', e.target.value)
                            }
                            className="w-full px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs text-gray-900 dark:text-gray-100"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold uppercase text-gray-600 dark:text-gray-400 mb-1">
                          Conteúdo Completo
                        </label>
                        <textarea
                          rows={3}
                          value={item.modalContent}
                          onChange={(e) =>
                            updateDraftInstitutional(idx, 'modalContent', e.target.value)
                          }
                          className="w-full px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs text-gray-900 dark:text-gray-100"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Modal Actions */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-800 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleResetEditor}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restaurar Padrão</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditorOpen(false)}
                    className="px-4 py-2 rounded-lg text-xs font-bold uppercase text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[#dc2626] hover:bg-[#b91c1c] text-white font-condensed font-bold text-sm uppercase tracking-wider transition-colors cursor-pointer shadow-sm"
                  >
                    <Save className="w-4 h-4" />
                    <span>Salvar Textos do Rodapé</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
