import React, { useState } from 'react';
import { Search, Menu, X, ChevronDown, Bookmark, Cloud, CheckCircle2 } from 'lucide-react';
import { User } from 'firebase/auth';

interface HeaderProps {
  currentCategory: string;
  onSelectCategory: (category: string, subcategory?: string) => void;
  onOpenSearch: () => void;
  onOpenSubscribe: () => void;
  onOpenSaved: () => void;
  savedCount: number;
  user: User | null;
  hasDriveToken: boolean;
  onOpenDriveModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentCategory,
  onSelectCategory,
  onOpenSearch,
  onOpenSubscribe,
  onOpenSaved,
  savedCount,
  user,
  hasDriveToken,
  onOpenDriveModal
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [futebolSubmenuOpen, setFutebolSubmenuOpen] = useState(false);
  const [mobileFutebolOpen, setMobileFutebolOpen] = useState(false);

  // Format today's date in Portuguese
  const todayFormatted = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date());

  const capitalizedDate = todayFormatted.charAt(0).toUpperCase() + todayFormatted.slice(1);

  const categories = [
    { name: 'Home', isHome: true },
    {
      name: 'Futebol',
      hasSubmenu: true,
      subcategories: ['Regional', 'Nacional', 'Internacional']
    },
    { name: 'Corrida de Rua' },
    { name: 'Ciclismo' },
    { name: 'Esportes' },
    { name: 'Política' },
    { name: 'Editoriais' }
  ];

  const handleNavClick = (catName: string, sub?: string) => {
    onSelectCategory(catName, sub);
    setMobileMenuOpen(false);
    setFutebolSubmenuOpen(false);
  };

  return (
    <>
      {/* TOPBAR */}
      <div className="bg-[#1e3a8a] text-[#dbe4ff] text-xs py-2 px-4 border-b border-[#172554]">
        <div className="max-w-[1240px] mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="font-medium text-white">{capitalizedDate}</span>
            <span className="hidden sm:inline text-blue-300">•</span>
            <span className="hidden sm:inline text-blue-200">São Paulo, SP</span>
            <span className="inline-flex items-center gap-1 font-semibold text-[#facc15]">
              <span className="w-2 h-2 rounded-full bg-[#facc15] inline-block"></span>
              25°C
            </span>
            <span className="hidden md:inline-flex items-center gap-1.5 ml-2 px-2 py-0.5 rounded bg-blue-900/60 text-[11px] text-blue-200 border border-blue-700/50">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
              TEMPO REAL ATIVO
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Google Drive & Cloud Sync Shortcut */}
            <button
              onClick={onOpenDriveModal}
              className="inline-flex items-center gap-1.5 text-blue-100 hover:text-[#facc15] transition-colors cursor-pointer text-xs font-semibold px-2.5 py-1 rounded bg-blue-900/50 hover:bg-blue-900/80 border border-blue-700/60"
              title="Abrir Central Google Drive e Sincronização na Nuvem"
            >
              <Cloud className="w-3.5 h-3.5 text-[#facc15]" />
              <span>Google Drive</span>
              {user && hasDriveToken && (
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              )}
            </button>

            {/* Saved Articles Shortcut */}
            <button
              onClick={onOpenSaved}
              className="inline-flex items-center gap-1.5 text-blue-100 hover:text-[#facc15] transition-colors cursor-pointer text-xs font-semibold px-2 py-1 rounded hover:bg-blue-900/40"
              title="Ver matérias salvas"
            >
              <Bookmark className="w-3.5 h-3.5 text-[#facc15]" />
              <span>Salvas</span>
              {savedCount > 0 && (
                <span className="bg-[#dc2626] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {savedCount}
                </span>
              )}
            </button>

            <span className="text-blue-400">|</span>

            {/* Social Links */}
            <div className="flex items-center gap-2">
              <a
                href="#facebook"
                onClick={(e) => { e.preventDefault(); }}
                className="hover:text-[#facc15] transition-colors p-1"
                aria-label="Facebook do Plantão Esportivo"
              >
                <svg className="w-3.5 h-3.5 fill-currentColor" viewBox="0 0 24 24">
                  <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.3v7A10 10 0 0 0 22 12z" />
                </svg>
              </a>
              <a
                href="#instagram"
                onClick={(e) => { e.preventDefault(); }}
                className="hover:text-[#facc15] transition-colors p-1"
                aria-label="Instagram do Plantão Esportivo"
              >
                <svg className="w-3.5 h-3.5 fill-currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.2c3.2 0 3.6 0 4.8.1 3.3.1 4.8 1.7 4.9 4.9.1 1.3.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 3.2-1.7 4.8-4.9 4.9-1.3.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-3.3-.1-4.8-1.7-4.9-4.9C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.8C2.4 3.9 3.9 2.4 7.2 2.3 8.4 2.2 8.8 2.2 12 2.2zM12 0C8.7 0 8.3 0 7.1.1 2.7.3.3 2.7.1 7.1 0 8.3 0 8.7 0 12s0 3.7.1 4.9c.2 4.4 2.6 6.8 7 7 1.2.1 1.6.1 4.9.1s3.7 0 4.9-.1c4.4-.2 6.8-2.6 7-7 .1-1.2.1-1.6.1-4.9s0-3.7-.1-4.9c-.2-4.4-2.6-6.8-7-7C15.7 0 15.3 0 12 0zm0 5.8a6.2 6.2 0 1 0 0 12.4 6.2 6.2 0 0 0 0-12.4zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.4-11.8a1.4 1.4 0 1 0 0 2.9 1.4 1.4 0 0 0 0-2.9z" />
                </svg>
              </a>
              <a
                href="#twitter"
                onClick={(e) => { e.preventDefault(); }}
                className="hover:text-[#facc15] transition-colors p-1"
                aria-label="X Twitter do Plantão Esportivo"
              >
                <svg className="w-3.5 h-3.5 fill-currentColor" viewBox="0 0 24 24">
                  <path d="M18.2 2h3.4l-7.4 8.5L23 22h-6.8l-5.3-7-6.1 7H1.4l7.9-9L1 2h7l4.8 6.4L18.2 2zm-1.2 18h1.9L7.1 4H5.1l11.9 16z" />
                </svg>
              </a>
              <a
                href="#youtube"
                onClick={(e) => { e.preventDefault(); }}
                className="hover:text-[#facc15] transition-colors p-1"
                aria-label="YouTube do Plantão Esportivo"
              >
                <svg className="w-3.5 h-3.5 fill-currentColor" viewBox="0 0 24 24">
                  <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.6 15.6V8.4l6.3 3.6-6.3 3.6z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN HEADER */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-[1240px] mx-auto px-4 h-20 flex items-center justify-between gap-4">
          {/* Logo & Slogan */}
          <button
            onClick={() => handleNavClick('Home')}
            className="flex items-center gap-3 text-left cursor-pointer group"
          >
            {/* Sport Emblem */}
            <div className="relative w-11 h-11 rounded-full bg-[#1e3a8a] flex items-center justify-center border-2 border-[#dc2626] shadow-sm group-hover:scale-105 transition-transform shrink-0">
              <svg className="w-6 h-6" viewBox="0 0 40 40" aria-hidden="true">
                <path
                  d="M20 6 L23 17 L34 17 L25 23.5 L28.5 34 L20 27.5 L11.5 34 L15 23.5 L6 17 L17 17 Z"
                  fill="#facc15"
                />
              </svg>
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#dc2626] border border-white flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-[#facc15]"></span>
              </span>
            </div>

            <div>
              <div className="font-condensed font-black text-2xl sm:text-[28px] tracking-tight text-[#1e3a8a] leading-none uppercase">
                Plantão <span className="text-[#dc2626]">Esportivo</span>
              </div>
              <div className="text-[11px] sm:text-xs text-gray-500 font-medium tracking-normal mt-0.5 line-clamp-1 max-w-[280px]">
                O esporte que você ama, na velocidade que você precisa
              </div>
            </div>
          </button>

          {/* Search Bar (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-sm mx-4">
            <button
              onClick={onOpenSearch}
              className="w-full h-10 px-4 pl-10 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-500 flex items-center justify-between transition-colors cursor-pointer text-left relative focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]"
            >
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <span>Buscar notícias, times, atletas…</span>
              <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white border border-gray-200 rounded text-gray-400">
                /
              </kbd>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenSearch}
              className="md:hidden p-2 text-gray-600 hover:text-[#1e3a8a] hover:bg-gray-100 rounded-lg cursor-pointer"
              aria-label="Buscar"
            >
              <Search className="w-5 h-5" />
            </button>

            <button
              onClick={onOpenSubscribe}
              className="hidden sm:inline-flex items-center gap-1.5 bg-[#facc15] hover:bg-[#eab308] text-gray-900 font-condensed font-black text-base px-5 py-2 rounded-lg shadow-sm hover:shadow transition-all uppercase tracking-wide cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
            >
              Assine
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-700 hover:text-[#1e3a8a] rounded-lg cursor-pointer"
              aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* DESKTOP NAVIGATION MENU */}
      <nav className="hidden md:block bg-[#1e3a8a] text-white shadow-md relative z-30">
        <div className="max-w-[1240px] mx-auto px-4">
          <ul className="flex items-center h-12 gap-1 font-condensed text-base font-bold uppercase tracking-wider">
            {categories.map((cat) => {
              const isActive =
                cat.isHome ? currentCategory === 'Home' : currentCategory === cat.name;

              if (cat.hasSubmenu) {
                return (
                  <li
                    key={cat.name}
                    className="relative"
                    onMouseEnter={() => setFutebolSubmenuOpen(true)}
                    onMouseLeave={() => setFutebolSubmenuOpen(false)}
                  >
                    <button
                      onClick={() => handleNavClick(cat.name)}
                      className={`h-12 px-4 inline-flex items-center gap-1 hover:text-[#facc15] transition-colors relative cursor-pointer ${
                        isActive ? 'text-[#facc15]' : 'text-white'
                      }`}
                      aria-haspopup="true"
                      aria-expanded={futebolSubmenuOpen}
                    >
                      <span>{cat.name}</span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          futebolSubmenuOpen ? 'rotate-180' : ''
                        }`}
                      />
                      {isActive && (
                        <span className="absolute bottom-0 left-4 right-4 h-1 bg-[#facc15]"></span>
                      )}
                    </button>

                    {/* Submenu Dropdown */}
                    {futebolSubmenuOpen && (
                      <div className="absolute top-12 left-0 w-48 bg-white text-gray-900 rounded-b-lg shadow-xl border border-gray-200 py-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                        {cat.subcategories?.map((sub) => (
                          <button
                            key={sub}
                            onClick={() => handleNavClick(cat.name, sub)}
                            className="w-full text-left px-4 py-2.5 text-sm font-sans font-semibold text-gray-700 hover:bg-blue-50 hover:text-[#1e3a8a] transition-colors cursor-pointer flex items-center justify-between"
                          >
                            <span>{sub}</span>
                            <span className="text-xs text-gray-400 font-normal">Futebol</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </li>
                );
              }

              return (
                <li key={cat.name}>
                  <button
                    onClick={() => handleNavClick(cat.name)}
                    className={`h-12 px-4 inline-flex items-center hover:text-[#facc15] transition-colors relative cursor-pointer ${
                      isActive ? 'text-[#facc15]' : 'text-white'
                    }`}
                  >
                    <span>{cat.name}</span>
                    {isActive && (
                      <span className="absolute bottom-0 left-4 right-4 h-1 bg-[#facc15]"></span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* MOBILE NAVIGATION DRAWER */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#1e3a8a] text-white border-t border-blue-800 shadow-xl z-50 px-4 py-3 animate-in slide-in-from-top duration-200">
          <ul className="flex flex-col divide-y divide-blue-800/60 font-condensed text-lg font-bold uppercase tracking-wider">
            <li>
              <button
                onClick={() => handleNavClick('Home')}
                className={`w-full py-3 text-left ${currentCategory === 'Home' ? 'text-[#facc15]' : 'text-white'}`}
              >
                Home
              </button>
            </li>
            <li>
              <div className="flex flex-col">
                <button
                  onClick={() => setMobileFutebolOpen(!mobileFutebolOpen)}
                  className="w-full py-3 flex items-center justify-between text-left text-white"
                >
                  <span>Futebol</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${mobileFutebolOpen ? 'rotate-180' : ''}`} />
                </button>
                {mobileFutebolOpen && (
                  <div className="pl-4 pb-2 space-y-2 text-sm font-sans normal-case">
                    <button
                      onClick={() => handleNavClick('Futebol', 'Regional')}
                      className="block w-full text-left py-1.5 text-blue-100 hover:text-white"
                    >
                      • Futebol Regional
                    </button>
                    <button
                      onClick={() => handleNavClick('Futebol', 'Nacional')}
                      className="block w-full text-left py-1.5 text-blue-100 hover:text-white"
                    >
                      • Futebol Nacional
                    </button>
                    <button
                      onClick={() => handleNavClick('Futebol', 'Internacional')}
                      className="block w-full text-left py-1.5 text-blue-100 hover:text-white"
                    >
                      • Futebol Internacional
                    </button>
                  </div>
                )}
              </div>
            </li>
            <li>
              <button
                onClick={() => handleNavClick('Corrida de Rua')}
                className={`w-full py-3 text-left ${currentCategory === 'Corrida de Rua' ? 'text-[#facc15]' : 'text-white'}`}
              >
                Corrida de Rua
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavClick('Ciclismo')}
                className={`w-full py-3 text-left ${currentCategory === 'Ciclismo' ? 'text-[#facc15]' : 'text-white'}`}
              >
                Ciclismo
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavClick('Esportes')}
                className={`w-full py-3 text-left ${currentCategory === 'Esportes' ? 'text-[#facc15]' : 'text-white'}`}
              >
                Esportes
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavClick('Política')}
                className={`w-full py-3 text-left ${currentCategory === 'Política' ? 'text-[#facc15]' : 'text-white'}`}
              >
                Política
              </button>
            </li>
            <li>
              <button
                onClick={() => handleNavClick('Editoriais')}
                className={`w-full py-3 text-left ${currentCategory === 'Editoriais' ? 'text-[#facc15]' : 'text-white'}`}
              >
                Editoriais
              </button>
            </li>
          </ul>

          <div className="mt-4 pt-3 border-t border-blue-800 flex items-center justify-between">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenSubscribe();
              }}
              className="w-full bg-[#facc15] text-gray-900 font-condensed font-black text-lg py-2.5 rounded-lg text-center uppercase"
            >
              Assinar Plantão Premium
            </button>
          </div>
        </div>
      )}
    </>
  );
};
