import React, { useState, useEffect } from 'react';
import {
  X,
  Globe,
  RefreshCw,
  CheckCircle2,
  Sparkles,
  FileText,
  FolderTree,
  Code2,
  Copy,
  Check
} from 'lucide-react';
import { Article } from '../data/portalData';
import {
  getWordPressConfig,
  saveWordPressConfig,
  fetchArticlesFromWordPress,
  createSampleWpPostPayload,
  buildWpPostsEndpoint
} from '../services/wordpress';
import { mapWpPostToArticle } from '../utils/wordpressMapper';

export interface CreateArticleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveArticle: (article: Article) => void;
  onSyncArticlesBatch?: (articles: Article[]) => void;
  defaultCategory?: string;
}

const WP_CATEGORY_MAPPING = [
  {
    portalCategory: 'Futebol',
    wpSlug: 'futebol',
    subSlugs: 'regional, nacional, internacional',
    description: 'Sincroniza com a editoria de Futebol e submenus Regional, Nacional e Internacional'
  },
  {
    portalCategory: 'Corrida de Rua',
    wpSlug: 'corrida-de-rua',
    subSlugs: 'calendario, treino, maratona',
    description: 'Sincroniza provas de rua, maratonas e planilhas de treino'
  },
  {
    portalCategory: 'Ciclismo',
    wpSlug: 'ciclismo',
    subSlugs: 'estrada, bike',
    description: 'Sincroniza provas de estrada, MTB e grandes voltas'
  },
  {
    portalCategory: 'Esportes',
    wpSlug: 'esportes',
    subSlugs: 'volei, basquete, olimpico',
    description: 'Sincroniza esportes olímpicos, vôlei, basquete e tênis'
  },
  {
    portalCategory: 'Política',
    wpSlug: 'politica',
    subSlugs: 'politica-esportiva',
    description: 'Sincroniza matérias sobre SAFs, legislação, CBF e gestão'
  },
  {
    portalCategory: 'Editoriais',
    wpSlug: 'editoriais',
    subSlugs: 'opiniao, coluna',
    description: 'Sincroniza análises e textos opinativos da redação'
  }
];

export const CreateArticleModal: React.FC<CreateArticleModalProps> = ({
  isOpen,
  onClose,
  onSaveArticle,
  onSyncArticlesBatch,
  defaultCategory = 'Futebol'
}) => {
  const [activeTab, setActiveTab] = useState<'connect' | 'mapping' | 'publish'>('connect');

  // WordPress Connection State
  const [siteUrl, setSiteUrl] = useState('');
  const [autoSync, setAutoSync] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  // WP Simulator / Direct Post State
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [selectedSlug, setSelectedSlug] = useState('futebol');
  const [subSlug, setSubSlug] = useState('nacional');
  const [authorName, setAuthorName] = useState('Redação WordPress');
  const [leadParagraph, setLeadParagraph] = useState('');
  const [secondParagraph, setSecondParagraph] = useState('');

  useEffect(() => {
    const cfg = getWordPressConfig();
    setSiteUrl(cfg.siteUrl || '');
    setAutoSync(cfg.autoSync);
  }, [isOpen]);

  useEffect(() => {
    const matched = WP_CATEGORY_MAPPING.find(
      (m) => m.portalCategory.toLowerCase() === defaultCategory.toLowerCase()
    );
    if (matched) {
      setSelectedSlug(matched.wpSlug);
    }
  }, [defaultCategory]);

  if (!isOpen) return null;

  const handleSaveConfigAndSync = async (e: React.FormEvent) => {
    e.preventDefault();
    setSyncStatus(null);

    saveWordPressConfig({
      siteUrl: siteUrl.trim(),
      autoSync,
      syncIntervalMinutes: 5,
      lastSyncedAt: new Date().toISOString()
    });

    if (!siteUrl.trim()) {
      setSyncStatus({
        type: 'error',
        text: 'Informe a URL do seu WordPress (ex: https://seudominio.com.br) para buscar os posts.'
      });
      return;
    }

    setIsSyncing(true);
    try {
      const wpArticles = await fetchArticlesFromWordPress(siteUrl);
      if (wpArticles.length === 0) {
        setSyncStatus({
          type: 'error',
          text: 'Conectado ao WordPress, mas nenhum post publicado foi encontrado.'
        });
      } else {
        if (onSyncArticlesBatch) {
          onSyncArticlesBatch(wpArticles);
        } else {
          wpArticles.forEach((a) => onSaveArticle(a));
        }
        setSyncStatus({
          type: 'success',
          text: `${wpArticles.length} matérias importadas e sincronizadas com as categorias do portal!`
        });
      }
    } catch (err: any) {
      setSyncStatus({
        type: 'error',
        text:
          err?.message ||
          'Não foi possível conectar à API REST do WordPress. Verifique se o endpoint /wp-json/wp/v2/posts está público.'
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSimulateWpWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !leadParagraph.trim()) {
      setSyncStatus({
        type: 'error',
        text: 'Preencha o título e o primeiro parágrafo do post do WordPress.'
      });
      return;
    }

    const mapping =
      WP_CATEGORY_MAPPING.find((m) => m.wpSlug === selectedSlug) || WP_CATEGORY_MAPPING[0];

    const htmlContent = `<p>${leadParagraph.trim()}</p>${
      secondParagraph.trim() ? `<p>${secondParagraph.trim()}</p>` : ''
    }`;

    const wpPayload = createSampleWpPostPayload({
      title: title.trim(),
      excerpt: excerpt.trim() || leadParagraph.trim().slice(0, 140),
      contentHtml: htmlContent,
      categorySlug: mapping.wpSlug,
      categoryName: mapping.portalCategory,
      subcategorySlug: subSlug || undefined,
      subcategoryName: subSlug ? subSlug.charAt(0).toUpperCase() + subSlug.slice(1) : undefined,
      authorName: authorName.trim() || 'Redação WordPress'
    });

    const mappedArticle = mapWpPostToArticle(wpPayload);
    onSaveArticle(mappedArticle);
    onClose();
  };

  const copySlug = (slug: string) => {
    navigator.clipboard?.writeText(slug);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative text-gray-900 dark:text-gray-100 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-[#1e3a8a] dark:text-blue-400 flex items-center justify-center">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-condensed font-black text-2xl uppercase tracking-tight text-[#1e3a8a] dark:text-[#facc15]">
                Integração WordPress CMS • Sincronização de Matérias
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Envio de matérias pelo painel do WordPress com distribuição automática por categoria
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mt-4 border-b border-gray-200 dark:border-gray-800 pb-3">
          <button
            type="button"
            onClick={() => {
              setActiveTab('connect');
              setSyncStatus(null);
            }}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'connect'
                ? 'bg-[#1e3a8a] text-white shadow-xs'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>1. Conectar WordPress</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('mapping');
              setSyncStatus(null);
            }}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'mapping'
                ? 'bg-[#1e3a8a] text-white shadow-xs'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
            }`}
          >
            <FolderTree className="w-3.5 h-3.5" />
            <span>2. Slugs & Categorias</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('publish');
              setSyncStatus(null);
            }}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'publish'
                ? 'bg-[#dc2626] text-white shadow-xs'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>3. Testar Envio WP</span>
          </button>
        </div>

        {syncStatus && (
          <div
            className={`mt-4 p-3 rounded-lg border text-xs font-semibold flex items-center gap-2 ${
              syncStatus.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                : 'bg-red-50 dark:bg-red-950/60 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{syncStatus.text}</span>
          </div>
        )}

        {/* TAB 1: CONECTAR WORDPRESS REST API */}
        {activeTab === 'connect' && (
          <form onSubmit={handleSaveConfigAndSync} className="mt-4 space-y-4">
            <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 text-xs text-gray-700 dark:text-gray-300 space-y-1.5">
              <div className="font-bold text-[#1e3a8a] dark:text-[#facc15] uppercase tracking-wider">
                Como funciona o envio pelo WordPress?
              </div>
              <p>
                Todo site WordPress já possui nativamente a API REST em{' '}
                <code className="px-1.5 py-0.5 rounded bg-white dark:bg-gray-800 font-mono text-[11px]">
                  /wp-json/wp/v2/posts?_embed
                </code>
                . Quando o redator publica uma matéria no painel do WordPress e marca a categoria
                (ex: <strong>Futebol</strong> ou <strong>Ciclismo</strong>), o Plantão Esportivo lê
                esse endpoint e distribui automaticamente a notícia para a categoria correspondente!
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1">
                URL do seu Site WordPress
              </label>
              <input
                type="url"
                value={siteUrl}
                onChange={(e) => setSiteUrl(e.target.value)}
                placeholder="https://seuportal.com.br"
                className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]"
              />
              {siteUrl && (
                <div className="mt-1.5 text-[11px] text-gray-500 dark:text-gray-400 font-mono truncate">
                  Endpoint ativo: {buildWpPostsEndpoint(siteUrl)}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700">
              <div>
                <div className="text-xs font-bold text-gray-900 dark:text-gray-100">
                  Sincronização Automática em Segundo Plano
                </div>
                <div className="text-[11px] text-gray-500 dark:text-gray-400">
                  Busca novas matérias publicadas no WordPress automaticamente ao abrir o portal
                </div>
              </div>
              <input
                type="checkbox"
                checked={autoSync}
                onChange={(e) => setAutoSync(e.target.checked)}
                className="w-4 h-4 accent-[#1e3a8a] rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold uppercase rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 cursor-pointer"
              >
                Fechar
              </button>
              <button
                type="submit"
                disabled={isSyncing}
                className="px-5 py-2 text-xs font-condensed font-black uppercase tracking-wider rounded-lg bg-[#1e3a8a] hover:bg-blue-800 text-white shadow-md transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Sincronizando...' : 'Salvar & Sincronizar Agora'}</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: MAPEAMENTO DE SLUGS E CATEGORIAS */}
        {activeTab === 'mapping' && (
          <div className="mt-4 space-y-4">
            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              No painel do seu <strong>WordPress (Posts → Categorias)</strong>, basta criar as
              categorias com os <strong>Slugs</strong> abaixo. Sempre que você publicar uma matéria
              no WordPress marcando uma dessas categorias, ela aparecerá automaticamente na página
              daquela categoria aqui no portal:
            </p>

            <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-bold uppercase text-[11px]">
                    <th className="py-2.5 px-3">Categoria no Portal</th>
                    <th className="py-2.5 px-3">Slug no WordPress</th>
                    <th className="py-2.5 px-3">Subcategorias (Slugs)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {WP_CATEGORY_MAPPING.map((row) => (
                    <tr
                      key={row.wpSlug}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="py-2.5 px-3 font-bold text-[#1e3a8a] dark:text-[#facc15]">
                        {row.portalCategory}
                      </td>
                      <td className="py-2.5 px-3">
                        <button
                          type="button"
                          onClick={() => copySlug(row.wpSlug)}
                          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-mono text-[11px] border border-blue-200 dark:border-blue-800 cursor-pointer"
                          title="Copiar slug"
                        >
                          <span>{row.wpSlug}</span>
                          {copiedSlug === row.wpSlug ? (
                            <Check className="w-3 h-3 text-emerald-500" />
                          ) : (
                            <Copy className="w-3 h-3 opacity-60" />
                          )}
                        </button>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-gray-500 dark:text-gray-400">
                        {row.subSlugs}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-300 flex items-center gap-2">
              <Code2 className="w-4 h-4 shrink-0" />
              <span>
                <strong>Imagem Destacada e Autor:</strong> A imagem destacada (Featured Image) e o
                nome do autor definidos no WordPress são importados automaticamente via{' '}
                <code>_embedded</code>.
              </span>
            </div>
          </div>
        )}

        {/* TAB 3: SIMULAR / ENVIAR POST WORDPRESS */}
        {activeTab === 'publish' && (
          <form onSubmit={handleSimulateWpWebhook} className="mt-4 space-y-3.5">
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-800 dark:text-emerald-300">
              Simule abaixo o envio de um post vindo do <strong>WordPress REST API</strong> para
              testar o funcionamento imediato nas páginas de categorias:
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1">
                  Categoria WordPress (Slug) *
                </label>
                <select
                  value={selectedSlug}
                  onChange={(e) => setSelectedSlug(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  {WP_CATEGORY_MAPPING.map((m) => (
                    <option key={m.wpSlug} value={m.wpSlug}>
                      {m.portalCategory} (slug: {m.wpSlug})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1">
                  Subcategoria WordPress (Slug)
                </label>
                <select
                  value={subSlug}
                  onChange={(e) => setSubSlug(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="nacional">nacional</option>
                  <option value="regional">regional</option>
                  <option value="internacional">internacional</option>
                  <option value="calendario">calendario</option>
                  <option value="treino">treino</option>
                  <option value="estrada">estrada</option>
                  <option value="opiniao">opiniao</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1">
                Título do Post no WordPress *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Flamengo anuncia reforço europeu para a sequência da temporada"
                className="w-full px-3 py-2 text-sm font-semibold rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1">
                  Resumo (Excerpt do WP)
                </label>
                <input
                  type="text"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Linha fina da matéria..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1">
                  Autor no WordPress
                </label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1">
                Conteúdo do Post (Parágrafo Principal) *
              </label>
              <textarea
                required
                rows={3}
                value={leadParagraph}
                onChange={(e) => setLeadParagraph(e.target.value)}
                placeholder="Texto do post publicado no editor Gutenberg / Clássico do WordPress..."
                className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1">
                Segundo Parágrafo (Opcional)
              </label>
              <textarea
                rows={2}
                value={secondParagraph}
                onChange={(e) => setSecondParagraph(e.target.value)}
                placeholder="Parágrafo complementar..."
                className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold uppercase rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-condensed font-black uppercase tracking-wider rounded-lg bg-[#dc2626] hover:bg-[#b91c1c] text-white shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4 text-[#facc15]" />
                <span>Sincronizar Post WordPress</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
