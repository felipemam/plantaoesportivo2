import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ArrowLeft,
  Share2,
  Bookmark,
  Check,
  Play,
  Heart,
  MessageSquare,
  UserPlus,
  UserCheck,
  Type,
  Cloud,
  Clock,
  BookOpen
} from 'lucide-react';
import { User } from 'firebase/auth';
import { Article } from '../data/portalData';
import {
  CloudComment,
  postCommentToCloud,
  subscribeToArticleComments
} from '../services/firebase';
import {
  parseMinutesFromReadTime,
  calculateScrollPercentage,
  computeReadingMetrics
} from '../utils/readingProgress';

interface ArticleViewProps {
  article: Article;
  onBack: () => void;
  onSelectArticle: (article: Article) => void;
  relatedArticles: Article[];
  isSaved: boolean;
  onToggleSave: (article: Article) => void;
  onShowToast: (message: string, type?: 'success' | 'error') => void;
  onOpenVideoModal: (videoDuration: string, videoCaption: string) => void;
  user: User | null;
  onOpenDriveModal: () => void;
}

export const ArticleView: React.FC<ArticleViewProps> = ({
  article,
  onBack,
  onSelectArticle,
  relatedArticles,
  isSaved,
  onToggleSave,
  onShowToast,
  onOpenVideoModal,
  user,
  onOpenDriveModal
}) => {
  // Reading progress bar calculation
  const articleContentRef = useRef<HTMLDivElement>(null);
  const totalMinutes = useMemo(() => parseMinutesFromReadTime(article.readTime), [article.readTime]);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Text size state: 'sm' | 'md' | 'lg'
  const [textSize, setTextSize] = useState<'sm' | 'md' | 'lg'>('md');

  // Follow author toggle
  const [isFollowing, setIsFollowing] = useState(false);

  // Link copied state
  const [copied, setCopied] = useState(false);

  // Comments state (local + Firestore real-time comments)
  const [localComments, setLocalComments] = useState(article.initialComments);
  const [cloudComments, setCloudComments] = useState<CloudComment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [likedComments, setLikedComments] = useState<{ [id: string]: boolean }>({});

  useEffect(() => {
    setLocalComments(article.initialComments);
    if (!user) {
      setCloudComments([]);
      return;
    }
    const unsub = subscribeToArticleComments(article.id, (fetched) => {
      setCloudComments(fetched);
    });
    return () => unsub();
  }, [article.id, article.initialComments, user]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setScrollProgress(0);

    const handleScroll = () => {
      if (articleContentRef.current) {
        const rect = articleContentRef.current.getBoundingClientRect();
        const elementTop = window.scrollY + rect.top;
        const elementHeight = rect.height;
        const progress = calculateScrollPercentage(
          window.scrollY,
          elementTop,
          elementHeight,
          window.innerHeight
        );
        setScrollProgress(progress);
      } else {
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (docHeight > 0) {
          const pct = Math.min(100, Math.max(0, Math.round((window.scrollY / docHeight) * 100)));
          setScrollProgress(pct);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [article.id]);

  const metrics = useMemo(
    () => computeReadingMetrics(scrollProgress, totalMinutes),
    [scrollProgress, totalMinutes]
  );

  const handleShare = (network: string) => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(article.title);

    let shareUrl = '';
    if (network === 'wa') shareUrl = `https://wa.me/?text=${text}%20${url}`;
    else if (network === 'x') shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
    else if (network === 'fb') shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    else if (network === 'li') shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'noopener,noreferrer');
      onShowToast('Abrindo compartilhamento…', 'success');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(
      () => {
        setCopied(true);
        onShowToast('Link da matéria copiado para a área de transferência!', 'success');
        setTimeout(() => setCopied(false), 2500);
      },
      () => {
        onShowToast('Link copiado!', 'success');
      }
    );
  };

  const handleToggleFollow = () => {
    const nextState = !isFollowing;
    setIsFollowing(nextState);
    onShowToast(
      nextState
        ? `Você agora está seguindo ${article.author.name}!`
        : `Deixou de seguir ${article.author.name}.`,
      'success'
    );
  };

  const handleLikeComment = (commentId: string) => {
    const isLiked = !!likedComments[commentId];
    setLikedComments(prev => ({ ...prev, [commentId]: !isLiked }));
    setLocalComments(prev =>
      prev.map(c => {
        if (c.id === commentId) {
          return { ...c, likes: isLiked ? c.likes - 1 : c.likes + 1 };
        }
        return c;
      })
    );
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = newCommentText.trim();
    if (!text) {
      onShowToast('Escreva sua mensagem antes de publicar.', 'error');
      return;
    }

    if (user) {
      try {
        await postCommentToCloud(user, article.id, text);
        setNewCommentText('');
        onShowToast('Comentário salvo no Firebase Cloud em tempo real!', 'success');
      } catch {
        onShowToast('Erro ao salvar comentário na nuvem.', 'error');
      }
      return;
    }

    const newComment = {
      id: `user-${Date.now()}`,
      author: 'Você (Leitor)',
      avatar: 'VC',
      time: 'Agora mesmo',
      text,
      likes: 0
    };

    setLocalComments([newComment, ...localComments]);
    setNewCommentText('');
    onShowToast('Comentário publicado com sucesso!', 'success');
  };

  const comments = [
    ...cloudComments.map((cc) => ({
      id: cc.id,
      author: cc.authorName,
      avatar: cc.authorAvatar,
      time: 'Sincronizado na nuvem',
      text: cc.text,
      likes: cc.likes,
      isEditor: false
    })),
    ...localComments
  ];

  // Font size classes
  const bodyTextClass =
    textSize === 'sm'
      ? 'text-base sm:text-lg leading-relaxed'
      : textSize === 'lg'
      ? 'text-xl sm:text-2xl leading-relaxed'
      : 'text-lg sm:text-[20px] leading-[1.75]';

  return (
    <div className="relative pb-16">
      {/* Top Fixed Reading Progress Indicator with Track and Glow Tip */}
      <div
        id="reading-progress-container"
        className="fixed top-0 left-0 w-full z-50 pointer-events-none"
        role="progressbar"
        aria-valuenow={metrics.percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Progresso de leitura da matéria"
      >
        {/* Full-width background track providing visual depth context */}
        <div className="w-full h-1.5 bg-slate-200/90 shadow-2xs">
          <div
            id="readProgress"
            className="h-full bg-gradient-to-r from-[#1e3a8a] via-[#dc2626] to-[#facc15] transition-[width] duration-150 ease-out relative"
            style={{ width: `${metrics.percentage}%` }}
          >
            {/* Glowing active reader bead at leading edge */}
            {metrics.percentage > 0 && metrics.percentage < 100 && (
              <span
                className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#facc15] border border-white shadow-sm ring-2 ring-red-500/40"
                aria-hidden="true"
              />
            )}
          </div>
        </div>
      </div>

      {/* Floating Reading Depth Badge / Visual Cue */}
      {scrollProgress > 2 && (
        <div
          className="fixed top-24 right-4 sm:right-8 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border border-gray-200/90 dark:border-gray-800 shadow-lg rounded-full py-1.5 px-3.5 flex items-center gap-2.5 text-xs text-gray-800 dark:text-gray-200 transition-all animate-in fade-in slide-in-from-top-2 duration-200 pointer-events-auto"
          title={`Progresso: ${metrics.percentage}% • ${metrics.depthLabel}`}
        >
          <div className="flex items-center gap-1.5">
            <span className="font-condensed font-black text-xs px-1.5 py-0.5 rounded bg-[#1e3a8a] text-white tracking-wider">
              {metrics.percentage}%
            </span>
            <span className="hidden sm:inline font-medium text-gray-700 dark:text-gray-300">
              {metrics.depthLabel}
            </span>
          </div>
          <span className="text-gray-300 dark:text-gray-700 hidden sm:inline">|</span>
          <span className="text-[11px] font-semibold text-gray-500 flex items-center gap-1">
            {metrics.isComplete ? (
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                Concluído
              </span>
            ) : (
              <>
                <Clock className="w-3 h-3 text-gray-400" />
                <span>{metrics.remainingText}</span>
              </>
            )}
          </span>
        </div>
      )}

      {/* Floating Vertical Share (Desktop on the left edge) */}
      <div className="hidden xl:flex fixed left-6 top-1/2 -translate-y-1/2 flex-col gap-2.5 z-30 bg-white p-2 rounded-xl shadow-lg border border-gray-200">
        <button
          onClick={() => handleShare('wa')}
          className="w-10 h-10 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 flex items-center justify-center transition-colors cursor-pointer"
          title="WhatsApp"
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M12 0C5.4 0 0 5.4 0 12c0 2.1.6 4.1 1.6 5.9L0 24l6.3-1.6c1.7.9 3.7 1.5 5.7 1.5 6.6 0 12-5.4 12-12S18.6 0 12 0z" />
          </svg>
        </button>
        <button
          onClick={() => handleShare('x')}
          className="w-10 h-10 rounded-lg bg-gray-50 text-gray-900 hover:bg-gray-100 flex items-center justify-center transition-colors cursor-pointer"
          title="X / Twitter"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M18.2 2h3.4l-7.4 8.5L23 22h-6.8l-5.3-7-6.1 7H1.4l7.9-9.1L1 2h7l4.8 6.4L18.2 2zm-1.2 18h1.9L7.1 4H5.1l11.9 16z" />
          </svg>
        </button>
        <button
          onClick={() => handleShare('fb')}
          className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 flex items-center justify-center transition-colors cursor-pointer"
          title="Facebook"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M24 12a12 12 0 10-13.9 11.9v-8.4H7.1V12h3V9.4c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2v2.9h-1.5c-1.5 0-2 .9-2 1.9V12h3.3l-.5 3.5h-2.8v8.4A12 12 0 0024 12z" />
          </svg>
        </button>
        <button
          onClick={handleCopyLink}
          className="w-10 h-10 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-100 flex items-center justify-center transition-colors cursor-pointer"
          title="Copiar Link"
        >
          {copied ? <Check className="w-5 h-5 text-green-600" /> : <Share2 className="w-4 h-4" />}
        </button>
        <button
          onClick={() => onToggleSave(article)}
          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
            isSaved ? 'bg-[#facc15] text-gray-950 font-bold' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
          }`}
          title={isSaved ? 'Matéria salva' : 'Salvar matéria'}
        >
          <Bookmark className="w-4 h-4" fill={isSaved ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="max-w-[1240px] mx-auto px-4 pt-6">
        {/* Back and Breadcrumb Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 font-medium">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1 font-bold text-[#1e3a8a] hover:text-[#dc2626] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar à Home</span>
            </button>
            <span>/</span>
            <span>{article.category}</span>
            {article.subcategory && (
              <>
                <span>/</span>
                <span className="text-gray-900 font-semibold">{article.subcategory}</span>
              </>
            )}
          </div>

          {/* Font Size Adjuster Control */}
          <div className="inline-flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1 text-xs font-semibold text-gray-700 shadow-xs">
            <Type className="w-3.5 h-3.5 text-gray-400 ml-1.5" />
            <button
              onClick={() => setTextSize('sm')}
              className={`px-2 py-0.5 rounded cursor-pointer ${textSize === 'sm' ? 'bg-[#1e3a8a] text-white' : 'hover:bg-gray-100'}`}
              title="Texto menor"
            >
              A-
            </button>
            <button
              onClick={() => setTextSize('md')}
              className={`px-2 py-0.5 rounded cursor-pointer ${textSize === 'md' ? 'bg-[#1e3a8a] text-white' : 'hover:bg-gray-100'}`}
              title="Texto normal"
            >
              Padrão
            </button>
            <button
              onClick={() => setTextSize('lg')}
              className={`px-2 py-0.5 rounded cursor-pointer ${textSize === 'lg' ? 'bg-[#1e3a8a] text-white' : 'hover:bg-gray-100'}`}
              title="Texto maior"
            >
              A+
            </button>
          </div>
        </div>

        {/* Main Article Container constrained for ideal reading */}
        <div ref={articleContentRef} className="max-w-[820px] mx-auto">
          {/* Header section */}
          <header className="mb-6">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="bg-[#dc2626] text-white text-xs font-condensed font-bold uppercase tracking-wider px-3 py-1 rounded-sm shadow-xs">
                {article.category}
              </span>
              <span className="bg-[#1e3a8a] text-white text-xs font-condensed font-bold uppercase tracking-wider px-3 py-1 rounded-sm shadow-xs">
                {article.heroTag || 'Cobertura Especial'}
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-condensed font-black text-3xl sm:text-5xl lg:text-[52px] text-gray-950 dark:text-gray-100 uppercase leading-[1.05] tracking-tight mb-4">
              {article.title}
            </h1>

            {/* Dek */}
            <p className="font-serif-body italic text-gray-700 dark:text-gray-300 text-lg sm:text-2xl leading-relaxed mb-6">
              {article.dek}
            </p>

            {/* Byline bar */}
            <div className="py-3.5 border-y border-gray-200 dark:border-gray-800 flex flex-wrap items-center justify-between gap-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-[#1e3a8a] text-white font-condensed font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
                  {article.author.avatar}
                </span>
                <div>
                  <div className="font-bold text-gray-900 dark:text-gray-100 leading-tight">
                    Por {article.author.name}
                  </div>
                  <div className="text-gray-500 dark:text-gray-400 text-xs">
                    {article.author.role} • {article.publishedAt}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                <span>{article.readTime}</span>
                <span>•</span>
                <span>{article.readCount}</span>
              </div>
            </div>

            {/* Horizontal Share Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 my-4 pt-1">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => handleShare('wa')}
                  className="inline-flex items-center gap-1.5 h-9 px-3.5 bg-green-50 text-green-800 hover:bg-green-100 border border-green-200 rounded-md text-xs font-bold cursor-pointer transition-colors"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 0C5.4 0 0 5.4 0 12c0 2.1.6 4.1 1.6 5.9L0 24l6.3-1.6c1.7.9 3.7 1.5 5.7 1.5 6.6 0 12-5.4 12-12S18.6 0 12 0z" />
                  </svg>
                  <span>WhatsApp</span>
                </button>
                <button
                  onClick={() => handleShare('x')}
                  className="inline-flex items-center gap-1.5 h-9 px-3.5 bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-200 rounded-md text-xs font-bold cursor-pointer transition-colors"
                >
                  <span>X</span>
                </button>
                <button
                  onClick={() => handleShare('fb')}
                  className="inline-flex items-center gap-1.5 h-9 px-3.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-md text-xs font-bold cursor-pointer transition-colors"
                >
                  <span>Facebook</span>
                </button>
                <button
                  onClick={handleCopyLink}
                  className={`inline-flex items-center gap-1.5 h-9 px-3.5 border rounded-md text-xs font-bold cursor-pointer transition-colors ${
                    copied
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300'
                  }`}
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copiado!' : 'Copiar Link'}</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenDriveModal}
                  className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-md text-xs font-bold bg-[#1e3a8a] hover:bg-[#172554] text-white transition-all cursor-pointer shadow-xs"
                  title="Exportar esta matéria para o seu Google Drive"
                >
                  <Cloud className="w-3.5 h-3.5 text-[#facc15]" />
                  <span>Salvar no Google Drive</span>
                </button>

                <button
                  onClick={() => onToggleSave(article)}
                  className={`inline-flex items-center gap-1.5 h-9 px-4 rounded-md text-xs font-bold transition-all cursor-pointer ${
                    isSaved
                      ? 'bg-[#facc15] text-gray-950 font-black shadow-xs'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" fill={isSaved ? 'currentColor' : 'none'} />
                  <span>{isSaved ? 'Salva' : 'Salvar Matéria'}</span>
                </button>
              </div>
            </div>

            {/* Visual Cue for Content Depth & Reading Guide */}
            <div className="my-5 p-3.5 bg-gradient-to-r from-blue-50/80 via-white to-amber-50/60 rounded-xl border border-gray-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#1e3a8a] text-[#facc15] flex items-center justify-center shrink-0 shadow-xs">
                  <BookOpen className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="font-condensed font-bold uppercase tracking-wider text-[#1e3a8a] flex items-center gap-2">
                    <span>Profundidade do Artigo</span>
                    <span className="text-[10px] font-sans font-semibold text-gray-400">• {article.readTime}</span>
                  </div>
                  <div className="text-gray-600 font-medium">
                    {metrics.depthLabel} ({metrics.percentage}%)
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-gray-500 font-semibold text-[11px] sm:text-xs">
                  {metrics.remainingText}
                </span>
                <div className="w-28 sm:w-40 h-2 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                  <div
                    className="h-full bg-gradient-to-r from-[#1e3a8a] via-[#dc2626] to-[#facc15] transition-all duration-200"
                    style={{ width: `${metrics.percentage}%` }}
                  />
                </div>
              </div>
            </div>
          </header>

          {/* Hero Image */}
          <figure className="mb-8">
            <div
              className="relative aspect-video rounded-xl overflow-hidden shadow-md flex items-center justify-center"
              style={{ background: article.imageBg }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              {/* Graphic Icon representing the sport */}
              <div className="relative z-10 text-center text-white p-6">
                <div className="w-20 h-20 mx-auto rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center border-2 border-[#facc15] shadow-lg mb-2">
                  <svg className="w-10 h-10 fill-[#facc15]" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
                    <path d="M12 2a10 10 0 0 0-7 17l4-5 6 1 4 4a10 10 0 0 0-7-17z" />
                  </svg>
                </div>
                <span className="font-condensed font-black text-xl uppercase tracking-wider text-white">
                  Plantão Esportivo • Cobertura Nacional
                </span>
              </div>
            </div>
            <figcaption className="mt-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500 font-sans italic">
              <span>{article.imageCaption}</span>
              <span className="not-italic font-medium text-gray-400">{article.imageCredit}</span>
            </figcaption>
          </figure>

          {/* Editorial Body Text */}
          <div className={`font-serif-body text-gray-900 ${bodyTextClass} space-y-6`}>
            {/* First paragraph with Drop Cap */}
            <p className="drop-cap font-normal">
              {article.leadParagraph}
            </p>

            {/* Structured Content Elements */}
            {article.content.map((block, idx) => {
              if (block.type === 'heading') {
                return (
                  <h2
                    key={idx}
                    className="font-condensed font-black text-2xl sm:text-3xl text-[#1e3a8a] uppercase tracking-wide pt-6 pb-2 border-b border-gray-200"
                  >
                    {block.text}
                  </h2>
                );
              }

              if (block.type === 'quote') {
                return (
                  <blockquote
                    key={idx}
                    className="my-8 p-6 bg-blue-50/50 rounded-xl border-l-4 border-[#dc2626] font-serif-body"
                  >
                    <p className="italic text-xl sm:text-2xl text-gray-900 font-normal leading-snug mb-3">
                      “{block.text}”
                    </p>
                    <footer className="font-sans text-xs font-bold text-[#1e3a8a] uppercase tracking-wider">
                      — {block.quoteAuthor}{block.quoteRole ? `, ${block.quoteRole}` : ''}
                    </footer>
                  </blockquote>
                );
              }

              if (block.type === 'stats' && block.stats) {
                return (
                  <div
                    key={idx}
                    className="my-8 p-6 bg-gray-50 border border-gray-200 rounded-xl font-sans"
                  >
                    <h3 className="font-condensed font-black text-xl text-[#1e3a8a] uppercase tracking-wider mb-4">
                      Números do Jogo
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {block.stats.map((s, sIdx) => (
                        <div key={sIdx} className="bg-white p-4 rounded-lg border border-gray-200 shadow-2xs">
                          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                            {s.label}
                          </div>
                          <div className="font-condensed font-black text-3xl text-gray-900 my-1">
                            {s.value}
                          </div>
                          <div className="text-xs text-gray-600 mb-2">{s.detail}</div>
                          {/* Visual representation bar */}
                          <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${s.isHome ? 'bg-[#dc2626]' : 'bg-[#1e3a8a]'}`}
                              style={{ width: `${s.percent}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }

              if (block.type === 'video') {
                return (
                  <div
                    key={idx}
                    className="my-8 rounded-xl overflow-hidden border border-gray-200 bg-[#111827] text-white shadow-md font-sans"
                  >
                    <div
                      className="aspect-video relative flex items-center justify-center cursor-pointer group"
                      style={{ background: 'linear-gradient(135deg, #111827, #1e3a8a 60%, #7f1d1d)' }}
                      onClick={() =>
                        onOpenVideoModal(
                          block.videoDuration || '2:34',
                          block.videoCaption || 'Melhores Momentos'
                        )
                      }
                    >
                      <button
                        className="w-16 h-16 rounded-full bg-[#dc2626] text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform cursor-pointer"
                        aria-label="Reproduzir vídeo"
                      >
                        <Play className="w-7 h-7 fill-current ml-1" />
                      </button>
                      <span className="absolute bottom-3 right-3 bg-black/80 text-white text-xs font-bold px-2.5 py-1 rounded">
                        {block.videoDuration}
                      </span>
                    </div>
                    <div className="p-3 bg-gray-900 text-sm text-gray-200 font-medium">
                      {block.videoCaption}
                    </div>
                  </div>
                );
              }

              if (block.type === 'nextGame') {
                return (
                  <div
                    key={idx}
                    className="p-4 bg-gray-100 rounded-lg text-sm text-gray-800 font-sans border border-gray-200 my-6"
                  >
                    <strong className="text-[#1e3a8a] uppercase font-bold">Próximos compromissos: </strong>
                    <span>{block.text}</span>
                  </div>
                );
              }

              return <p key={idx}>{block.text}</p>;
            })}
          </div>

          {/* Tags Chips */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2.5">
              Assuntos Relacionados
            </div>
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-white hover:bg-blue-50 border border-gray-300 text-gray-800 hover:text-[#1e3a8a] rounded-full text-xs font-semibold cursor-pointer transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Author Box */}
          <div className="my-10 bg-white border border-gray-200 rounded-xl p-6 shadow-xs flex flex-col sm:flex-row items-start gap-5">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#1e3a8a] to-[#2563eb] text-white font-condensed font-black text-2xl flex items-center justify-center shrink-0 shadow-sm">
              {article.author.avatar}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-1">
                <div>
                  <h3 className="font-condensed font-bold text-xl text-gray-900 uppercase">
                    {article.author.name}
                  </h3>
                  <p className="text-xs text-gray-500 font-medium">{article.author.role}</p>
                </div>

                <button
                  onClick={handleToggleFollow}
                  className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isFollowing
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      : 'bg-[#1e3a8a] text-white hover:bg-[#172554]'
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Seguindo</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Seguir Autor</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed">
                {article.author.bio}
              </p>

              <div className="mt-3 text-xs text-gray-400 font-semibold">
                {article.author.publishedCount} matérias publicadas no Plantão
              </div>
            </div>
          </div>

          {/* Related Articles ("Leia Também") */}
          <section className="my-12 pt-8 border-t-2 border-gray-200" aria-labelledby="related-title">
            <div className="flex items-center justify-between mb-6">
              <h2 id="related-title" className="font-condensed font-black text-2xl text-[#1e3a8a] uppercase tracking-wide">
                Leia Também
              </h2>
              <span className="text-xs text-gray-500">Mais notícias desta categoria</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {relatedArticles.slice(0, 3).map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => onSelectArticle(rel)}
                  className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col hover:-translate-y-1"
                >
                  <div className="h-28 relative" style={{ background: rel.imageBg }}>
                    <span className="absolute top-2 left-2 bg-[#dc2626] text-white text-[10px] font-condensed font-bold uppercase px-2 py-0.5 rounded">
                      {rel.category}
                    </span>
                  </div>
                  <div className="p-3.5 flex flex-col flex-1">
                    <h3 className="font-condensed font-bold text-base text-gray-900 group-hover:text-[#1e3a8a] uppercase leading-snug line-clamp-2 mb-2">
                      {rel.title}
                    </h3>
                    <div className="mt-auto text-[11px] text-gray-400 flex items-center justify-between pt-2 border-t border-gray-100">
                      <span>{rel.readTime}</span>
                      <span className="text-[#1e3a8a] font-bold">Ler →</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Comments Section */}
          <section className="my-12 pt-8 border-t-2 border-gray-200" aria-labelledby="comments-title">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#1e3a8a]" />
                <h2 id="comments-title" className="font-condensed font-black text-2xl text-[#1e3a8a] uppercase tracking-wide">
                  Comentários
                </h2>
              </div>
              <span className="text-xs font-bold bg-blue-100 text-[#1e3a8a] px-2.5 py-1 rounded-full">
                {comments.length} comentários
              </span>
            </div>

            {/* Comment Form */}
            <form onSubmit={handlePostComment} className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs mb-8">
              <div className="flex items-start gap-3">
                <span className="w-9 h-9 rounded-full bg-[#1e3a8a] text-white font-condensed font-bold text-xs flex items-center justify-center shrink-0">
                  VC
                </span>
                <div className="flex-1">
                  <textarea
                    rows={3}
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    placeholder="O que você achou desta matéria? Deixe seu comentário esportivo..."
                    className="w-full p-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] focus:bg-white bg-gray-50"
                  />
                  <div className="flex items-center justify-between mt-2.5 text-xs text-gray-500">
                    <span>Mantenha o debate esportivo respeitoso.</span>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-[#1e3a8a] hover:bg-[#172554] text-white font-condensed font-bold text-sm uppercase rounded-lg transition-colors cursor-pointer"
                    >
                      Comentar
                    </button>
                  </div>
                </div>
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-4">
              {comments.map((c) => {
                const liked = !!likedComments[c.id];

                return (
                  <div key={c.id} className="p-4 bg-white border border-gray-200 rounded-xl shadow-2xs">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded-full bg-[#1e3a8a] text-white font-condensed font-bold text-xs flex items-center justify-center shrink-0">
                          {c.avatar}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-gray-900">{c.author}</span>
                            {c.isEditor && (
                              <span className="bg-[#facc15] text-gray-950 font-black text-[10px] px-1.5 py-0.2 rounded uppercase">
                                Redação
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-gray-400">{c.time}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleLikeComment(c.id)}
                        className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded transition-colors cursor-pointer ${
                          liked ? 'text-[#dc2626] font-bold bg-red-50' : 'text-gray-500 hover:bg-gray-100'
                        }`}
                        title="Curtir comentário"
                      >
                        <Heart className="w-3.5 h-3.5" fill={liked ? 'currentColor' : 'none'} />
                        <span>{c.likes}</span>
                      </button>
                    </div>

                    <p className="text-sm text-gray-700 pl-10 leading-relaxed font-sans">
                      {c.text}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
