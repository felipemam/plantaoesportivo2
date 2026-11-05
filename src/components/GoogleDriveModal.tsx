import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  FolderOpen,
  FileText,
  UploadCloud,
  RefreshCw,
  Trash2,
  ExternalLink,
  Search,
  CheckCircle2,
  AlertTriangle,
  Edit3,
  Save,
  BookOpen,
  Cloud,
  LogOut
} from 'lucide-react';
import { User } from 'firebase/auth';
import { Article } from '../data/portalData';
import {
  DriveFileItem,
  listDriveFiles,
  exportArticleToDrive,
  exportReadingListToDrive,
  readDriveFileText,
  updateDriveFileContent,
  deleteDriveFile
} from '../services/googleDrive';
import {
  CloudDriveExport,
  recordDriveExportInCloud,
  markDriveExportDeletedInCloud
} from '../services/firebase';

export const GoogleSignInButton: React.FC<{
  onClick: () => void;
  disabled?: boolean;
  label?: string;
}> = ({ onClick, disabled, label = 'Sign in with Google' }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="gsi-material-button"
    >
      <div className="gsi-material-button-state"></div>
      <div className="gsi-material-button-content-wrapper">
        <div className="gsi-material-button-icon">
          <svg
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 48 48"
            style={{ display: 'block' }}
          >
            <path
              fill="#EA4335"
              d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
            ></path>
            <path
              fill="#4285F4"
              d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
            ></path>
            <path
              fill="#FBBC05"
              d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
            ></path>
            <path
              fill="#34A853"
              d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
            ></path>
            <path fill="none" d="M0 0h48v48H0z"></path>
          </svg>
        </div>
        <span className="gsi-material-button-contents">{label}</span>
        <span style={{ display: 'none' }}>{label}</span>
      </div>
    </button>
  );
};

interface GoogleDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  hasDriveToken: boolean;
  onGoogleLogin: () => Promise<void>;
  onLogout: () => Promise<void>;
  currentArticle: Article;
  savedArticles: Article[];
  cloudExports: CloudDriveExport[];
  onShowToast: (message: string, type?: 'success' | 'error') => void;
}

export const GoogleDriveModal: React.FC<GoogleDriveModalProps> = ({
  isOpen,
  onClose,
  user,
  hasDriveToken,
  onGoogleLogin,
  onLogout,
  currentArticle,
  savedArticles,
  cloudExports,
  onShowToast
}) => {
  const [driveFiles, setDriveFiles] = useState<DriveFileItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [needsReauth, setNeedsReauth] = useState(false);

  // File Viewer / Editor state
  const [selectedFile, setSelectedFile] = useState<DriveFileItem | null>(null);
  const [fileContent, setFileContent] = useState('');
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [isSavingContent, setIsSavingContent] = useState(false);

  // Mandatory Confirmation Dialog state for mutating/deleting Drive files
  const [confirmDialog, setConfirmDialog] = useState<{
    type: 'update' | 'delete';
    file: DriveFileItem;
    newContent?: string;
  } | null>(null);

  const fetchFiles = useCallback(
    async (queryStr?: string) => {
      if (!hasDriveToken) return;
      setIsLoadingFiles(true);
      setNeedsReauth(false);
      try {
        const files = await listDriveFiles(queryStr);
        setDriveFiles(files);
      } catch (err: unknown) {
        if (err instanceof Error && err.message === 'AUTH_REQUIRED') {
          setNeedsReauth(true);
        } else {
          onShowToast(
            err instanceof Error ? err.message : 'Erro ao carregar arquivos do Google Drive.',
            'error'
          );
        }
      } finally {
        setIsLoadingFiles(false);
      }
    },
    [hasDriveToken, onShowToast]
  );

  useEffect(() => {
    if (isOpen && hasDriveToken) {
      fetchFiles('');
    }
  }, [isOpen, hasDriveToken, fetchFiles]);

  if (!isOpen) return null;

  const handleExportCurrentArticle = async (format: 'gdoc' | 'markdown') => {
    if (!user || !hasDriveToken) {
      setNeedsReauth(true);
      return;
    }

    setIsExporting(true);
    try {
      const created = await exportArticleToDrive(currentArticle, format);
      await recordDriveExportInCloud(user, {
        driveFileId: created.id,
        fileName: created.name,
        mimeType: created.mimeType,
        articleId: currentArticle.id
      });
      onShowToast(`Matéria salva no Google Drive: ${created.name}`, 'success');
      await fetchFiles(searchQuery);
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'AUTH_REQUIRED') {
        setNeedsReauth(true);
      } else {
        onShowToast(
          err instanceof Error ? err.message : 'Falha ao exportar matéria para o Google Drive.',
          'error'
        );
      }
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportReadingList = async () => {
    if (!user || !hasDriveToken) {
      setNeedsReauth(true);
      return;
    }
    if (savedArticles.length === 0) {
      onShowToast('Você ainda não possui matérias salvas para exportar.', 'error');
      return;
    }

    setIsExporting(true);
    try {
      const created = await exportReadingListToDrive(savedArticles);
      await recordDriveExportInCloud(user, {
        driveFileId: created.id,
        fileName: created.name,
        mimeType: created.mimeType,
        articleId: 'caderno-leitura'
      });
      onShowToast('Caderno de Leitura exportado para o Google Drive!', 'success');
      await fetchFiles(searchQuery);
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'AUTH_REQUIRED') {
        setNeedsReauth(true);
      } else {
        onShowToast('Erro ao exportar Caderno de Leitura.', 'error');
      }
    } finally {
      setIsExporting(false);
    }
  };

  const handleOpenFileEditor = async (file: DriveFileItem) => {
    setSelectedFile(file);
    setIsLoadingContent(true);
    setFileContent('');
    try {
      const text = await readDriveFileText(file.id, file.mimeType);
      setFileContent(text);
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'AUTH_REQUIRED') {
        setNeedsReauth(true);
      } else {
        setFileContent(
          'Este arquivo não possui visualização direta em texto simples ou é um formato binário. Use o botão "Abrir no Drive" para visualizá-lo.'
        );
      }
    } finally {
      setIsLoadingContent(false);
    }
  };

  const executeConfirmedAction = async () => {
    if (!confirmDialog) return;

    const { type, file, newContent } = confirmDialog;
    setConfirmDialog(null);

    if (type === 'update' && typeof newContent === 'string') {
      setIsSavingContent(true);
      try {
        await updateDriveFileContent(file.id, newContent);
        onShowToast(`Arquivo "${file.name}" atualizado no Google Drive!`, 'success');
        await fetchFiles(searchQuery);
      } catch (err: unknown) {
        if (err instanceof Error && err.message === 'AUTH_REQUIRED') {
          setNeedsReauth(true);
        } else {
          onShowToast('Erro ao atualizar arquivo no Google Drive.', 'error');
        }
      } finally {
        setIsSavingContent(false);
      }
    } else if (type === 'delete') {
      setIsLoadingFiles(true);
      try {
        await deleteDriveFile(file.id);
        await markDriveExportDeletedInCloud(file.id);
        if (selectedFile?.id === file.id) {
          setSelectedFile(null);
          setFileContent('');
        }
        onShowToast(`Arquivo "${file.name}" excluído do Google Drive.`, 'success');
        await fetchFiles(searchQuery);
      } catch (err: unknown) {
        if (err instanceof Error && err.message === 'AUTH_REQUIRED') {
          setNeedsReauth(true);
        } else {
          onShowToast('Erro ao excluir arquivo do Google Drive.', 'error');
        }
      } finally {
        setIsLoadingFiles(false);
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="gdrive-modal-title"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden border border-gray-200 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#1e3a8a] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
              <Cloud className="w-5 h-5 text-[#facc15]" />
            </div>
            <div>
              <span className="text-[11px] font-condensed font-bold uppercase tracking-widest text-[#facc15] block">
                Google Workspace & Firebase Cloud
              </span>
              <h2
                id="gdrive-modal-title"
                className="font-condensed font-black text-2xl uppercase tracking-wide leading-none"
              >
                Central Google Drive — Plantão Esportivo
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-blue-200 hover:text-white p-1.5 rounded-lg hover:bg-blue-800/50 cursor-pointer"
            aria-label="Fechar central Google Drive"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-gray-50/60">
          {/* Authentication Banner */}
          {!user || !hasDriveToken || needsReauth ? (
            <div className="bg-white border-2 border-[#1e3a8a]/20 rounded-xl p-6 text-center shadow-xs">
              <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-blue-50 text-[#1e3a8a] flex items-center justify-center">
                <FolderOpen className="w-7 h-7" />
              </div>
              <h3 className="font-condensed font-black text-2xl text-gray-900 uppercase mb-2">
                {user
                  ? 'Autorize o acesso ao seu Google Drive'
                  : 'Conecte sua Conta Google ao Plantão Esportivo'}
              </h3>
              <p className="text-sm text-gray-600 max-w-lg mx-auto mb-5 leading-relaxed">
                Salve matérias completas como Google Docs ou Markdown diretamente no seu Google Drive,
                sincronize seus favoritos no Firebase Cloud e gerencie seus recortes esportivos em tempo real.
              </p>
              <div className="flex justify-center">
                <GoogleSignInButton
                  onClick={onGoogleLogin}
                  label={user ? 'Reconectar Google Drive' : 'Sign in with Google'}
                />
              </div>
            </div>
          ) : (
            <>
              {/* Signed-In User Bar & Quick Export Actions */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-2xs flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'Usuário'}
                      className="w-10 h-10 rounded-full border border-gray-200"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#1e3a8a] text-white font-condensed font-bold flex items-center justify-center">
                      {(user.displayName || user.email || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-gray-900">
                        {user.displayName || 'Leitor Conectado'}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> Drive Ativo
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">{user.email}</span>
                  </div>
                </div>

                <button
                  onClick={onLogout}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-gray-600 hover:text-[#dc2626] bg-gray-100 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Desconectar</span>
                </button>
              </div>

              {/* Export Actions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Export Current Article Card */}
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-condensed font-bold uppercase text-[#dc2626] tracking-wider mb-1">
                      <UploadCloud className="w-4 h-4" />
                      <span>Exportar Matéria em Destaque</span>
                    </div>
                    <h4 className="font-condensed font-bold text-base text-gray-900 uppercase line-clamp-1 mb-1">
                      {currentArticle.title}
                    </h4>
                    <p className="text-xs text-gray-500 mb-4">
                      Crie um documento no seu Google Drive com o texto integral, estatísticas e ficha técnica.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => handleExportCurrentArticle('gdoc')}
                      disabled={isExporting}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-[#1e3a8a] hover:bg-[#172554] disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5 text-[#facc15]" />
                      <span>Salvar como Google Doc</span>
                    </button>
                    <button
                      onClick={() => handleExportCurrentArticle('markdown')}
                      disabled={isExporting}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-800 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      <span>.MD</span>
                    </button>
                  </div>
                </div>

                {/* Export Saved Reading List Card */}
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-condensed font-bold uppercase text-[#1e3a8a] tracking-wider mb-1">
                      <BookOpen className="w-4 h-4" />
                      <span>Caderno de Leitura ({savedArticles.length} salvas)</span>
                    </div>
                    <h4 className="font-condensed font-bold text-base text-gray-900 uppercase mb-1">
                      Compilado de Matérias Favoritas
                    </h4>
                    <p className="text-xs text-gray-500 mb-4">
                      Exporte todas as suas matérias salvas em um único Google Doc organizado para leitura offline.
                    </p>
                  </div>

                  <button
                    onClick={handleExportReadingList}
                    disabled={isExporting || savedArticles.length === 0}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-[#facc15] hover:bg-[#eab308] disabled:opacity-50 text-gray-950 font-condensed font-black text-sm uppercase rounded-lg transition-colors cursor-pointer"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>Exportar Caderno para o Google Drive</span>
                  </button>
                </div>
              </div>

              {/* Drive Browser & Editor Split */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Left Column: Drive Files List */}
                <div className="lg:col-span-7 bg-white border border-gray-200 rounded-xl p-4 shadow-2xs flex flex-col">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <h3 className="font-condensed font-black text-lg text-[#1e3a8a] uppercase tracking-wide">
                      Arquivos no Seu Google Drive
                    </h3>
                    <button
                      onClick={() => fetchFiles(searchQuery)}
                      disabled={isLoadingFiles}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#1e3a8a] hover:text-[#dc2626] cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isLoadingFiles ? 'animate-spin' : ''}`} />
                      <span>Atualizar</span>
                    </button>
                  </div>

                  {/* Search bar inside Drive */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      fetchFiles(searchQuery);
                    }}
                    className="flex gap-2 mb-3"
                  >
                    <div className="relative flex-1">
                      <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Filtrar arquivos no Google Drive..."
                        className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-[#1e3a8a] text-white text-xs font-bold rounded-lg cursor-pointer"
                    >
                      Buscar
                    </button>
                  </form>

                  {/* File list */}
                  <div className="divide-y divide-gray-100 max-h-64 overflow-y-auto pr-1">
                    {isLoadingFiles ? (
                      <div className="py-8 text-center text-xs text-gray-500">
                        Consultando Google Drive API v3...
                      </div>
                    ) : driveFiles.length === 0 ? (
                      <div className="py-8 text-center text-xs text-gray-500">
                        Nenhum arquivo encontrado. Exporte uma matéria acima para começar!
                      </div>
                    ) : (
                      driveFiles.map((file) => {
                        const isExportedByPortal = cloudExports.some(
                          (exp) => exp.driveFileId === file.id
                        );
                        return (
                          <div
                            key={file.id}
                            className={`py-2.5 px-2 flex items-center justify-between gap-2 rounded-lg transition-colors ${
                              selectedFile?.id === file.id ? 'bg-blue-50/80' : 'hover:bg-gray-50'
                            }`}
                          >
                            <div
                              onClick={() => handleOpenFileEditor(file)}
                              className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
                            >
                              <FileText className="w-4 h-4 text-[#1e3a8a] shrink-0" />
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                  <p className="text-xs font-bold text-gray-900 truncate">
                                    {file.name}
                                  </p>
                                  {isExportedByPortal && (
                                    <span className="px-1.5 py-0.2 bg-[#facc15] text-gray-950 font-black text-[9px] rounded uppercase shrink-0">
                                      Plantão
                                    </span>
                                  )}
                                </div>
                                <p className="text-[10px] text-gray-400 truncate">
                                  {file.mimeType.replace('application/vnd.google-apps.', 'google-')}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => handleOpenFileEditor(file)}
                                className="p-1.5 text-gray-500 hover:text-[#1e3a8a] hover:bg-blue-50 rounded cursor-pointer"
                                title="Ler ou editar notas do arquivo"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              {file.webViewLink && (
                                <a
                                  href={file.webViewLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 text-gray-500 hover:text-[#1e3a8a] hover:bg-blue-50 rounded"
                                  title="Abrir no Google Drive"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              )}
                              <button
                                onClick={() =>
                                  setConfirmDialog({
                                    type: 'delete',
                                    file
                                  })
                                }
                                className="p-1.5 text-gray-400 hover:text-[#dc2626] hover:bg-red-50 rounded cursor-pointer"
                                title="Excluir arquivo do Google Drive"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Right Column: File Inspector & Editor */}
                <div className="lg:col-span-5 bg-white border border-gray-200 rounded-xl p-4 shadow-2xs flex flex-col">
                  <h3 className="font-condensed font-black text-lg text-[#1e3a8a] uppercase tracking-wide mb-2">
                    Leitor & Editor de Notas
                  </h3>

                  {!selectedFile ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-gray-400 text-xs">
                      <FileText className="w-8 h-8 mb-2 stroke-1" />
                      <p>
                        Selecione um arquivo ao lado para visualizar seu conteúdo textual ou adicionar anotações.
                      </p>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col">
                      <div className="mb-2 pb-2 border-b border-gray-100 flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-gray-800 truncate">
                          {selectedFile.name}
                        </span>
                        <button
                          onClick={() => setSelectedFile(null)}
                          className="text-[11px] text-gray-400 hover:text-gray-600 cursor-pointer"
                        >
                          Fechar
                        </button>
                      </div>

                      {isLoadingContent ? (
                        <div className="flex-1 flex items-center justify-center text-xs text-gray-500 py-8">
                          Carregando conteúdo do Google Drive...
                        </div>
                      ) : (
                        <>
                          <textarea
                            value={fileContent}
                            onChange={(e) => setFileContent(e.target.value)}
                            rows={8}
                            className="w-full flex-1 p-2.5 text-xs font-mono bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] mb-3"
                          />
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              disabled={isSavingContent}
                              onClick={() =>
                                setConfirmDialog({
                                  type: 'update',
                                  file: selectedFile,
                                  newContent: fileContent
                                })
                              }
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#1e3a8a] hover:bg-[#172554] disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                            >
                              <Save className="w-3.5 h-3.5 text-[#facc15]" />
                              <span>
                                {isSavingContent ? 'Salvando...' : 'Salvar Alterações no Drive'}
                              </span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Mandatory Confirmation Modal for Update / Delete actions in Google Drive */}
        {confirmDialog && (
          <div
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
            onClick={() => setConfirmDialog(null)}
          >
            <div
              className="bg-white max-w-md w-full rounded-xl p-6 shadow-2xl border border-gray-200 animate-in zoom-in-95 duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    confirmDialog.type === 'delete'
                      ? 'bg-red-100 text-[#dc2626]'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-condensed font-black text-xl text-gray-900 uppercase">
                    {confirmDialog.type === 'delete'
                      ? 'Confirmar Exclusão no Google Drive'
                      : 'Confirmar Atualização no Google Drive'}
                  </h4>
                  <p className="text-xs text-gray-500">
                    Esta ação modificará diretamente seu arquivo na nuvem.
                  </p>
                </div>
              </div>

              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-200 mb-5">
                {confirmDialog.type === 'delete' ? (
                  <>
                    Tem certeza de que deseja excluir permanentemente o arquivo{' '}
                    <strong>{confirmDialog.file.name}</strong> do seu Google Drive?
                  </>
                ) : (
                  <>
                    Tem certeza de que deseja sobrescrever o conteúdo do arquivo{' '}
                    <strong>{confirmDialog.file.name}</strong> no seu Google Drive?
                  </>
                )}
              </p>

              <div className="flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setConfirmDialog(null)}
                  className="px-4 py-2 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={executeConfirmedAction}
                  className={`px-4 py-2 text-xs font-bold text-white rounded-lg cursor-pointer ${
                    confirmDialog.type === 'delete'
                      ? 'bg-[#dc2626] hover:bg-[#b91c1c]'
                      : 'bg-[#1e3a8a] hover:bg-[#172554]'
                  }`}
                >
                  {confirmDialog.type === 'delete'
                    ? 'Sim, Excluir do Drive'
                    : 'Sim, Atualizar Arquivo'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
