import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Monitor, Check, ChevronDown } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { Logo } from './Logo';

export const ThemeToggle: React.FC = () => {
  const { theme, mode, toggleTheme, setTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      {/* Automatic / Theme Status Button */}
      <div className="inline-flex items-center rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-0.5 shadow-xs transition-colors">
        <button
          onClick={toggleTheme}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md text-gray-700 dark:text-gray-200 hover:text-[#1e3a8a] dark:hover:text-[#facc15] hover:bg-white dark:hover:bg-gray-700/80 transition-all cursor-pointer"
          title={`Tema ${mode === 'auto' ? `Automático (${theme === 'dark' ? 'Escuro' : 'Claro'})` : mode === 'dark' ? 'Escuro' : 'Claro'}`}
          aria-label="Alternar tema claro/escuro/automático"
        >
          {mode === 'auto' ? (
            <>
              <Monitor className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">Auto ({theme === 'dark' ? 'Escuro' : 'Claro'})</span>
            </>
          ) : theme === 'light' ? (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline">Claro</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Escuro</span>
            </>
          )}
        </button>

        {/* Options Dropdown Trigger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-white dark:hover:bg-gray-700/80 rounded-md transition-colors cursor-pointer"
          aria-label="Opções de tema e logos"
          title="Opções de tema e logos"
          aria-expanded={menuOpen}
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Dropdown with Automatic Mode + Light/Dark Logo Previews */}
      {menuOpen && (
        <div className="absolute right-0 mt-2 w-80 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-400 px-2 pb-2 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <span>Tema Automático & Logos</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">
              Ativo: {mode === 'auto' ? 'Automático' : mode === 'dark' ? 'Escuro' : 'Claro'}
            </span>
          </div>

          <div className="mt-2 space-y-1.5">
            {/* Opção 1: Automático (Padrão) */}
            <button
              onClick={() => {
                setTheme('auto');
                setMenuOpen(false);
              }}
              className={`w-full text-left p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                mode === 'auto'
                  ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/30'
                  : 'border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/60'
              }`}
            >
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900 dark:text-gray-100">
                  <Monitor className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Automático (Sistema / Horário)</span>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                  Alterna sozinho entre a Logo Clara (dia) e Logo Escura (noite/sistema).
                </p>
              </div>
              {mode === 'auto' && (
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              )}
            </button>

            {/* Opção 2: Tema Claro Fixo */}
            <button
              onClick={() => {
                setTheme('light');
                setMenuOpen(false);
              }}
              className={`w-full text-left p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                mode === 'light'
                  ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40'
                  : 'border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/60'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900 dark:text-gray-100">
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span>Claro (Logo Clara)</span>
                </div>
                <div className="bg-white p-1.5 rounded border border-gray-200 inline-block scale-90 origin-left">
                  <Logo variant="light" size="sm" showSlogan={false} />
                </div>
              </div>
              {mode === 'light' && (
                <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              )}
            </button>

            {/* Opção 3: Tema Escuro Fixo */}
            <button
              onClick={() => {
                setTheme('dark');
                setMenuOpen(false);
              }}
              className={`w-full text-left p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                mode === 'dark'
                  ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40'
                  : 'border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/60'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900 dark:text-gray-100">
                  <Moon className="w-3.5 h-3.5 text-blue-400" />
                  <span>Escuro (Logo Escura)</span>
                </div>
                <div className="bg-gray-950 p-1.5 rounded border border-gray-800 inline-block scale-90 origin-left">
                  <Logo variant="dark" size="sm" showSlogan={false} />
                </div>
              </div>
              {mode === 'dark' && (
                <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
