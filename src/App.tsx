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
import { VideosSection } from './components/VideosSection';
import { EditorialsSection } from './components/EditorialsSection';
import { NewsletterBand } from './components/NewsletterBand';
import { Footer } from './components/Footer';
import { ArticleView } from './components/ArticleView';
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
  CloudDriveExport
} from './services/firebase';

export default function App() {
  // Navigation State
  const [currentView, setCurrentView] = useState<'home' | 'article'>('home');
  const [selectedArticle, setSelectedArticle] = useState<Article>(INITIAL_ARTICLES[0]);
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

  const handleGoogleLogin = async () => {
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setHasDriveToken(true);
        showToast('Conta Google e Google Drive conectados com sucesso!', 'success');
      }
    } catch {
      showToast('Não foi possível concluir o login com o Google.', 'error');
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setHasDriveToken(false);
    showToast('Conta Google desconectada.', 'success');
  };

  // Toggle Save Article (Local + Firestore Cloud Sync)
  const handleToggleSave = async (article: Article) => {
    let updated: string[];
    const isCurrentlySaved = savedArticleIds.includes(article.id);

    if (isCurrentlySaved) {
      updated = savedArticleIds.filter((id) => id !== article.id);
      showToast('Matéria removida dos seus favoritos.', 'success');
      if (user) {
        try {
          await removeBookmarkFromCloud(user, article.id);
        } catch {
          // Handled by handleFirestoreError
        }
      }
    } else {
      updated = [...savedArticleIds, article.id];
      showToast(
        user
          ? 'Matéria salva nos favoritos e sincronizada no Firebase Cloud!'
          : 'Matéria salva nos seus favoritos!',
        'success'
      );
      if (user) {
        try {
          await saveBookmarkToCloud(user, {
            id: article.id,
            title: article.title,
            category: article.category
          });
        } catch {
          // Handled by handleFirestoreError
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
        // Handled by handleFirestoreError
      }
    }
    showToast('Matéria removida dos salvos.', 'success');
  };

  // Live match clock & simulation tick
  const simulateLiveTick = () => {
    setMatches((prevMatches) => {
      return prevMatches.map((m) => {
        if (!m.isLive) return m;

        // Extract numeric minute if possible
        const minNum = parseInt(m.minute.replace("'", ''), 10);
        if (isNaN(minNum)) return m;

        const nextMin = minNum + 1;
        // Occasionally trigger a goal or event
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
    setCurrentView('home');

    if (catName === 'Home') {
      setNewsFilter('Todas');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setNewsFilter(catName);
      // Smoothly scroll down to the content area
      setTimeout(() => {
        const target = document.getElementById('latest-title') || document.body;
        target.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const savedArticlesList = INITIAL_ARTICLES.filter((a) => savedArticleIds.includes(a.id));

  // Hero carousel articles: lead 3 stories
  const heroSlideArticles = INITIAL_ARTICLES.slice(0, 3);
  // Hero side articles: next 3 stories
  const heroSideArticles = [
    INITIAL_ARTICLES.find((a) => a.id === 'politica-clubes-empresa') || INITIAL_ARTICLES[3],
    INITIAL_ARTICLES.find((a) => a.id === 'selecao-convocacao-novembro') || INITIAL_ARTICLES[4],
    INITIAL_ARTICLES.find((a) => a.id === 'editorial-preco-ingressos') || INITIAL_ARTICLES[5]
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fb] text-[#111827]">
      {/* 1. Portal Header */}
      <Header
        currentCategory={currentCategory}
        onSelectCategory={handleSelectCategory}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenSubscribe={() => setIsSubscribeOpen(true)}
        onOpenSaved={() => setIsSavedOpen(true)}
        savedCount={savedArticleIds.length}
        user={user}
        hasDriveToken={hasDriveToken}
        onOpenDriveModal={() => setIsDriveModalOpen(true)}
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

      {/* 3. Main Views */}
      <main className="flex-1">
        {currentView === 'home' ? (
          <>
            {/* Category Banner if filtered */}
            {currentCategory !== 'Home' && (
              <div className="bg-[#1e3a8a] text-white py-4 px-4 shadow-xs">
                <div className="max-w-[1240px] mx-auto flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase font-bold text-[#facc15] tracking-widest">
                      Navegando na editoria:
                    </span>
                    <h2 className="font-condensed font-black text-2xl uppercase tracking-wide">
                      {currentCategory} {currentSubcategory ? `• ${currentSubcategory}` : ''}
                    </h2>
                  </div>
                  <button
                    onClick={() => handleSelectCategory('Home')}
                    className="text-xs font-bold text-blue-200 hover:text-white underline cursor-pointer"
                  >
                    Voltar para Todos os Destaques
                  </button>
                </div>
              </div>
            )}

            {/* Hero Carousel */}
            <HeroCarousel
              articles={heroSlideArticles}
              sideArticles={heroSideArticles}
              onSelectArticle={handleSelectArticle}
            />

            {/* Últimas Notícias Grid */}
            <LatestNewsGrid
              articles={INITIAL_ARTICLES}
              onSelectArticle={handleSelectArticle}
              selectedFilter={newsFilter}
              onFilterChange={(f) => setNewsFilter(f)}
            />

            {/* Content by Category + Sidebar */}
            <CategoryBlockSection
              articles={INITIAL_ARTICLES}
              standings={INITIAL_STANDINGS}
              columnists={PORTAL_COLUMNISTS}
              onSelectArticle={handleSelectArticle}
              onSelectCategory={handleSelectCategory}
              onOpenStandingsModal={() => setIsStandingsOpen(true)}
              onOpenSubscribe={() => setIsSubscribeOpen(true)}
              onShowToast={showToast}
            />

            {/* Videos Multimidia Section */}
            <VideosSection
              onOpenVideo={(v: VideoItem) => {
                setVideoModalData({ title: v.title, duration: v.duration });
              }}
            />

            {/* Editorials of Opinion */}
            <EditorialsSection
              onSelectArticle={handleSelectArticle}
              articles={INITIAL_ARTICLES}
            />

            {/* Newsletter Band */}
            <NewsletterBand onShowToast={showToast} />
          </>
        ) : (
          /* Full Article Reading Experience */
          <ArticleView
            article={selectedArticle}
            onBack={handleBackToHome}
            onSelectArticle={handleSelectArticle}
            relatedArticles={INITIAL_ARTICLES.filter(
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

      {/* 4. Portal Footer */}
      <Footer
        onSelectCategory={handleSelectCategory}
        onOpenInstitutionalModal={(title, content) =>
          setInstitutionalData({ title, content })
        }
        onShowToast={showToast}
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
        articles={INITIAL_ARTICLES}
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
