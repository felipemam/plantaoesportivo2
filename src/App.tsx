/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ArrowUp, CheckCircle2, AlertCircle } from 'lucide-react';
import { User } from 'firebase/auth';
import {
  Article,
  LiveMatch,
  INITIAL_ARTICLES,
  INITIAL_MATCHES,
  INITIAL_STANDINGS,
  PORTAL_COLUMNISTS,
  VideoItem
} from './data/portalData';
import { Header } from './components/Header';
import { LiveScoreTicker } from './components/LiveScoreTicker';
import { HeroCarousel } from './components/HeroCarousel';
import { LatestNewsGrid } from './components/LatestNewsGrid';
import { CategoryBlockSection } from './components/CategoryBlockSection';
import { CategoryView } from './components/CategoryView';
import { NewsletterBand } from './components/NewsletterBand';
import { Footer } from './components/Footer';
import { ArticleView } from './components/ArticleView';
import { LeaderboardAd, AdInfoModal } from './components/AdBanners';
import { CreateArticleModal } from './components/CreateArticleModal';
import {
  SearchModal,
  SubscriptionModal,
  MatchCenterModal,
  VideoPlayerModal,
  StandingsModal,
  SavedArticlesModal,
  InstitutionalModal
} from './components/Modals';
import { GoogleDriveModal } from './components/GoogleDriveModal';
import {
  initAuth,
  googleSignIn,
  logout,
  saveBookmarkToCloud,
  removeBookmarkFromCloud,
  subscribeToUserBookmarks,
  subscribeToUserDriveExports,
  saveArticleToFirestore,
  CloudDriveExport
} from './services/firebase';
import { getWordPressConfig, fetchArticlesFromWordPress } from './services/wordpress';

export default function App() {
  // Articles state with localStorage synchronization
  const [articles, setArticles] = useState<Article[]>(() => {
    try {
      const saved = localStorage.getItem('plantao_custom_articles');
      if (saved) {
        const parsed: Article[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return [...parsed, ...INITIAL_ARTICLES];
        }
      }
    } catch {
      // fallback to INITIAL_ARTICLES
    }
    return INITIAL_ARTICLES;
  });

  // Navigation State
  const [currentView, setCurrentView] = useState<'home' | 'category' | 'article'>('home');
  const [selectedArticle, setSelectedArticle] = useState<Article>(() => articles[0] || INITIAL_ARTICLES[0]);
  const [currentCategory, setCurrentCategory] = useState<string>('Home');
  const [currentSubcategory, setCurrentSubcategory] = useState<string | undefined>();
  const [newsFilter, setNewsFilter] = useState<string>('Todas');

  // Firebase Auth & Google Drive State
  const [user, setUser] = useState<User | null>(null);
  const [hasDriveToken, setHasDriveToken] = useState<boolean>(false);
  const [cloudExports, setCloudExports] = useState<CloudDriveExport[]>([]);
  const [isDriveModalOpen, setIsDriveModalOpen] = useState<boolean>(false);

  // Live Matches State
  const [matches, setMatches] = useState<LiveMatch[]>(INITIAL_MATCHES);
  const [isSimulatingLive, setIsSimulatingLive] = useState<boolean>(true);

  // Saved Articles (Bookmarks)
  const [savedArticleIds, setSavedArticleIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('plantao_saved_ids');
      return saved ? JSON.parse(saved) : ['palmeiras-corinthians-virada'];
    } catch {
      return ['palmeiras-corinthians-virada'];
    }
  });

  // Modals state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSubscribeOpen, setIsSubscribeOpen] = useState(false);
  const [matchCenterMatch, setMatchCenterMatch] = useState<LiveMatch | null>(null);
  const [videoModalData, setVideoModalData] = useState<{ title: string; duration: string } | null>(null);
  const [isStandingsOpen, setIsStandingsOpen] = useState(false);
  const [isSavedOpen, setIsSavedOpen] = useState(false);
  const [institutionalData, setInstitutionalData] = useState<{ title: string; content: string } | null>(null);

  // Ad Info & Create Article Modals
  const [isAdModalOpen, setIsAdModalOpen] = useState(false);
  const [isCreateArticleOpen, setIsCreateArticleOpen] = useState(false);
  const [createArticleDefaultCat, setCreateArticleDefaultCat] = useState('Futebol');

  // Toast Notification state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; visible: boolean }>({
    message: '',
    type: 'success',
    visible: false
  });

  // Scroll to Top visibility
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 450);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type, visible: true });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 3200);
  };

  // Initialize Firebase Auth & Real-time Firestore Subscriptions
  useEffect(() => {
    let unsubBookmarks: (() => void) | null = null;
    let unsubExports: (() => void) | null = null;

    const unsubAuth = initAuth(
      (loggedInUser, token) => {
        setUser(loggedInUser);
        setHasDriveToken(Boolean(token));

        if (unsubBookmarks) unsubBookmarks();
        unsubBookmarks = subscribeToUserBookmarks(loggedInUser, (cloudItems) => {
          if (cloudItems.length > 0) {
            const cloudIds = cloudItems.map((b) => b.articleId);
            setSavedArticleIds((prev) => Array.from(new Set([...prev, ...cloudIds])));
          }
        });

        if (unsubExports) unsubExports();
        unsubExports = subscribeToUserDriveExports(loggedInUser, (exportsList) => {
          setCloudExports(exportsList);
        });
      },
      () => {
        setUser(null);
        setHasDriveToken(false);
        setCloudExports([]);
        if (unsubBookmarks) {
          unsubBookmarks();
          unsubBookmarks = null;
        }
        if (unsubExports) {
          unsubExports();
          unsubExports = null;
        }
      }
    );

    return () => {
      unsubAuth();
      if (unsubBookmarks) unsubBookmarks();
      if (unsubExports) unsubExports();
    };
  }, []);

  // Handlers for Login & Logout
  const handleGoogleLogin = async () => {
    try {
      await googleSignIn();
      showToast('Login com Google realizado com sucesso!', 'success');
    } catch {
      showToast('Não foi possível autenticar com o Google.', 'error');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      showToast('Você encerrou a sessão com sucesso.', 'success');
    } catch {
      showToast('Erro ao encerrar sessão.', 'error');
    }
  };

  // Handlers for Saving Articles (Bookmarks)
  const handleToggleSave = async (article: Article) => {
    const isAlreadySaved = savedArticleIds.includes(article.id);
    let updated: string[];

    if (isAlreadySaved) {
      updated = savedArticleIds.filter((id) => id !== article.id);
      showToast('Matéria removida dos itens salvos.', 'success');
      if (user) {
        try {
          await removeBookmarkFromCloud(user, article.id);
        } catch {
          // Handled gracefully
        }
      }
    } else {
      updated = [article.id, ...savedArticleIds];
      showToast('Matéria salva para leitura offline e backup.', 'success');
      if (user) {
        try {
          await saveBookmarkToCloud(user, {
            id: article.id,
            title: article.title,
            category: article.category
          });
        } catch {
          // Handled gracefully
        }
      }
    }

    setSavedArticleIds(updated);
    try {
      localStorage.setItem('plantao_saved_ids', JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  const handleRemoveSaved = async (articleId: string) => {
    const updated = savedArticleIds.filter((id) => id !== articleId);
    setSavedArticleIds(updated);
    try {
      localStorage.setItem('plantao_saved_ids', JSON.stringify(updated));
    } catch {
      // Ignore
    }
    if (user) {
      try {
        await removeBookmarkFromCloud(user, articleId);
      } catch {
        // Handled gracefully
      }
    }
    showToast('Matéria removida dos salvos.', 'success');
  };

  // Create Article & Category Synchronization
  const handleOpenCreateArticle = (category?: string) => {
    setCreateArticleDefaultCat(category || (currentCategory !== 'Home' ? currentCategory : 'Futebol'));
    setIsCreateArticleOpen(true);
  };

  const handleSaveNewArticle = async (newArticle: Article) => {
    // 1. Prepend to in-memory articles state
    setArticles((prev) => [newArticle, ...prev]);

    // 2. Persist to localStorage
    try {
      const saved = localStorage.getItem('plantao_custom_articles');
      const parsed: Article[] = saved ? JSON.parse(saved) : [];
      localStorage.setItem('plantao_custom_articles', JSON.stringify([newArticle, ...parsed]));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }

    // 3. Persist to Firebase Firestore collection '/articles'
    saveArticleToFirestore({
      id: newArticle.id,
      title: newArticle.title,
      category: newArticle.category,
      subcategory: newArticle.subcategory,
      author: newArticle.author,
      dek: newArticle.dek,
      paragraphs: newArticle.content.filter((c) => c.type === 'paragraph').map((c) => c.text || ''),
      publishedAt: newArticle.publishedAt
    });

    // 4. Navigate directly to the new article for preview
    setSelectedArticle(newArticle);
    setCurrentCategory(newArticle.category);
    setCurrentView('article');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    showToast(
      `Notícia do WordPress publicada e sincronizada na editoria ${newArticle.category}!`,
      'success'
    );
  };

  const handleSyncWordPressBatch = (wpArticles: Article[]) => {
    setArticles((prev) => {
      const existingIds = new Set(prev.map((a) => a.id));
      const newOnes = wpArticles.filter((a) => !existingIds.has(a.id));
      const merged = [...newOnes, ...prev];
      try {
        const customOnly = merged.filter(
          (a) => !INITIAL_ARTICLES.some((init) => init.id === a.id)
        );
        localStorage.setItem('plantao_custom_articles', JSON.stringify(customOnly));
      } catch {
        // ignore
      }
      return merged;
    });

    showToast(
      `${wpArticles.length} matérias sincronizadas do WordPress com as categorias!`,
      'success'
    );
  };

  // Automatic WordPress background synchronization if configured
  useEffect(() => {
    const cfg = getWordPressConfig();
    if (cfg.siteUrl && cfg.autoSync) {
      fetchArticlesFromWordPress(cfg.siteUrl)
        .then((wpArticles) => {
          if (wpArticles.length > 0) {
            handleSyncWordPressBatch(wpArticles);
          }
        })
        .catch(() => {
          // Silent background check if offline or unconfigured
        });
    }
  }, []);

  // Live match clock & simulation tick
  const simulateLiveTick = () => {
    setMatches((prevMatches) => {
      return prevMatches.map((m) => {
        if (!m.isLive) return m;

        const minNum = parseInt(m.minute.replace("'", ''), 10);
        if (isNaN(minNum)) return m;

        const nextMin = minNum + 1;
        if (m.id === 'm1' && nextMin === 80) {
          showToast(`⚡ TEMPO REAL: Quase o terceiro do Palmeiras no Allianz Parque!`, 'success');
        }

        return {
          ...m,
          minute: `${nextMin}'`
        };
      });
    });
  };

  useEffect(() => {
    if (!isSimulatingLive) return;

    const interval = setInterval(() => {
      simulateLiveTick();
    }, 20000);

    return () => clearInterval(interval);
  }, [isSimulatingLive]);

  // Navigation handlers
  const handleSelectArticle = (article: Article) => {
    setSelectedArticle(article);
    setCurrentView('article');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCategory = (catName: string, sub?: string) => {
    setCurrentCategory(catName);
    setCurrentSubcategory(sub);

    if (catName === 'Home') {
      setCurrentView('home');
      setNewsFilter('Todas');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setCurrentView('category');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBackToHome = () => {
    setCurrentCategory('Home');
    setCurrentSubcategory(undefined);
    setCurrentView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackFromArticle = () => {
    if (currentCategory && currentCategory !== 'Home') {
      setCurrentView('category');
    } else {
      setCurrentView('home');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const savedArticlesList = articles.filter((a) => savedArticleIds.includes(a.id));

  // Hero carousel articles: lead 3 stories
  const heroSlideArticles = articles.slice(0, 3);
  // Hero side articles: next 3 stories
  const heroSideArticles = [
    articles.find((a) => a.id === 'politica-clubes-empresa') || articles[3] || articles[0],
    articles.find((a) => a.id === 'selecao-convocacao-novembro') || articles[4] || articles[1],
    articles.find((a) => a.id === 'editorial-preco-ingressos') || articles[5] || articles[2]
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fb] dark:bg-[#0b0f19] text-[#111827] dark:text-[#f9fafb] transition-colors">
      {/* 1. Portal Header */}
      <Header
        currentCategory={currentCategory}
        onSelectCategory={handleSelectCategory}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenCreateArticle={() => handleOpenCreateArticle()}
        onOpenAdModal={() => setIsAdModalOpen(true)}
      />

      {/* 2. Live Scores Ticker */}
      <LiveScoreTicker
        matches={matches}
        onSelectMatch={(m) => setMatchCenterMatch(m)}
        onSimulateTick={simulateLiveTick}
        isSimulating={isSimulatingLive}
        onToggleSimulate={() => {
          setIsSimulatingLive(!isSimulatingLive);
          showToast(
            !isSimulatingLive
              ? 'Atualizações ao vivo ativadas!'
              : 'Atualizações ao vivo pausadas.',
            'success'
          );
        }}
      />

      {/* 3. Top Leaderboard Banner (IAB 728x90) */}
      <LeaderboardAd onOpenAdModal={() => setIsAdModalOpen(true)} />

      {/* 4. Main Views */}
      <main className="flex-1">
        {currentView === 'home' ? (
          <>
            {/* Hero Carousel */}
            <HeroCarousel
              articles={heroSlideArticles}
              sideArticles={heroSideArticles}
              onSelectArticle={handleSelectArticle}
            />

            {/* Últimas Notícias Grid with in-feed ad */}
            <LatestNewsGrid
              articles={articles}
              onSelectArticle={handleSelectArticle}
              selectedFilter={newsFilter}
              onFilterChange={(f) => setNewsFilter(f)}
              onOpenAdModal={() => setIsAdModalOpen(true)}
            />

            {/* Content by Category + Sidebar */}
            <CategoryBlockSection
              articles={articles}
              standings={INITIAL_STANDINGS}
              onSelectArticle={handleSelectArticle}
              onSelectCategory={handleSelectCategory}
              onOpenStandingsModal={() => setIsStandingsOpen(true)}
              onOpenSubscribe={() => setIsSubscribeOpen(true)}
              onShowToast={showToast}
              onOpenAdModal={() => setIsAdModalOpen(true)}
            />

            {/* Newsletter Band */}
            <NewsletterBand onShowToast={showToast} />
          </>
        ) : currentView === 'category' ? (
          /* Dedicated Standalone Category Page */
          <CategoryView
            category={currentCategory}
            subcategory={currentSubcategory}
            articles={articles}
            standings={INITIAL_STANDINGS}
            onSelectArticle={handleSelectArticle}
            onBackToHome={handleBackToHome}
            onOpenStandingsModal={() => setIsStandingsOpen(true)}
            onSelectSubcategory={(sub) => setCurrentSubcategory(sub)}
            onOpenCreateArticle={(cat) => handleOpenCreateArticle(cat)}
            onOpenAdModal={() => setIsAdModalOpen(true)}
          />
        ) : (
          /* Full Article Reading Experience */
          <ArticleView
            article={selectedArticle}
            onBack={handleBackFromArticle}
            onSelectArticle={handleSelectArticle}
            relatedArticles={articles.filter(
              (a) => a.id !== selectedArticle.id && a.category === selectedArticle.category
            )}
            isSaved={savedArticleIds.includes(selectedArticle.id)}
            onToggleSave={handleToggleSave}
            onShowToast={showToast}
            onOpenVideoModal={(duration, caption) =>
              setVideoModalData({ title: caption, duration })
            }
            user={user}
            onOpenDriveModal={() => setIsDriveModalOpen(true)}
          />
        )}
      </main>

      {/* 5. Portal Footer */}
      <Footer
        onSelectCategory={handleSelectCategory}
        onOpenInstitutionalModal={(title, content) =>
          setInstitutionalData({ title, content })
        }
        onShowToast={showToast}
        onOpenWordPressConfig={() => handleOpenCreateArticle()}
      />

      {/* Back to Top Floating Button */}
      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-40 w-11 h-11 rounded-full bg-[#dc2626] hover:bg-[#b91c1c] text-white shadow-xl flex items-center justify-center transition-all hover:scale-110 cursor-pointer animate-in fade-in"
          aria-label="Voltar ao topo da página"
        >
          <ArrowUp className="w-5 h-5 stroke-[2.5]" />
        </button>
      )}

      {/* Toast Notification Container */}
      {toast.visible && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 bg-gray-900/95 text-white px-5 py-3 rounded-xl shadow-2xl text-xs sm:text-sm font-semibold border border-gray-700 backdrop-blur-md animate-in slide-in-from-bottom-2 duration-200"
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* MODALS */}
      {/* WordPress CMS & Category Sync Modal */}
      <CreateArticleModal
        isOpen={isCreateArticleOpen}
        onClose={() => setIsCreateArticleOpen(false)}
        onSaveArticle={handleSaveNewArticle}
        onSyncArticlesBatch={handleSyncWordPressBatch}
        defaultCategory={createArticleDefaultCat}
      />

      {/* Media Kit & Ad Spaces Modal */}
      <AdInfoModal
        isOpen={isAdModalOpen}
        onClose={() => setIsAdModalOpen(false)}
        onShowToast={showToast}
      />

      {/* Google Drive & Firebase Cloud Modal */}
      <GoogleDriveModal
        isOpen={isDriveModalOpen}
        onClose={() => setIsDriveModalOpen(false)}
        user={user}
        hasDriveToken={hasDriveToken}
        onGoogleLogin={handleGoogleLogin}
        onLogout={handleLogout}
        currentArticle={selectedArticle}
        savedArticles={savedArticlesList}
        cloudExports={cloudExports}
        onShowToast={showToast}
      />

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        articles={articles}
        onSelectArticle={handleSelectArticle}
      />

      {/* Subscription Modal */}
      <SubscriptionModal
        isOpen={isSubscribeOpen}
        onClose={() => setIsSubscribeOpen(false)}
        onSubscribeSuccess={(plan) =>
          showToast(`Parabéns! Assinatura do ${plan} confirmada com sucesso!`, 'success')
        }
      />

      {/* Match Center Modal */}
      <MatchCenterModal
        isOpen={!!matchCenterMatch}
        onClose={() => setMatchCenterMatch(null)}
        match={matchCenterMatch}
      />

      {/* Video Player Modal */}
      <VideoPlayerModal
        isOpen={!!videoModalData}
        onClose={() => setVideoModalData(null)}
        title={videoModalData?.title || 'Vídeo do Plantão'}
        duration={videoModalData?.duration || '04:32'}
      />

      {/* Standings Modal */}
      <StandingsModal
        isOpen={isStandingsOpen}
        onClose={() => setIsStandingsOpen(false)}
        standings={INITIAL_STANDINGS}
      />

      {/* Saved Articles Modal */}
      <SavedArticlesModal
        isOpen={isSavedOpen}
        onClose={() => setIsSavedOpen(false)}
        savedArticles={savedArticlesList}
        onSelectArticle={handleSelectArticle}
        onRemoveSaved={handleRemoveSaved}
      />

      {/* Institutional Dialog */}
      <InstitutionalModal
        isOpen={!!institutionalData}
        onClose={() => setInstitutionalData(null)}
        title={institutionalData?.title || ''}
        content={institutionalData?.content || ''}
      />
    </div>
  );
}
