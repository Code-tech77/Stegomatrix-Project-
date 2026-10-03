import React from 'react';
import { ShieldCheck, Lock, Unlock, Eye, BookOpen, Coffee, Sun, Moon, Search } from 'lucide-react';

export type TabType = 'embed' | 'extract' | 'proof' | 'inspector' | 'docs';

interface NavbarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, theme, toggleTheme }) => {
  const tabs = [
    { id: 'embed' as TabType, label: 'Embed Data', icon: Lock },
    { id: 'extract' as TabType, label: 'Extract Payload', icon: Unlock },
    { id: 'proof' as TabType, label: 'Forensic Proof', icon: ShieldCheck, highlight: true },
    { id: 'inspector' as TabType, label: 'Bit Inspector', icon: Eye },
    { id: 'docs' as TabType, label: 'Methodology', icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-amber-900/20 dark:border-amber-500/20 bg-amber-50/80 dark:bg-stone-950/80 backdrop-blur-2xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo with Coffee + Cyber Investigation Theme */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveTab('embed')}>
            <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-700 to-amber-900 p-0.5 shadow-lg shadow-amber-900/20 group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full bg-stone-950 rounded-[14px] flex items-center justify-center relative overflow-hidden">
                <Coffee className="w-5 h-5 text-amber-400" />
                <Search className="w-3 h-3 text-amber-200 absolute bottom-1.5 right-1.5" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg tracking-wider text-amber-950 dark:text-stone-100 group-hover:text-amber-600 transition-colors">
                  STEGO<span className="text-amber-600 dark:text-amber-500 font-extrabold">CAFÉ</span>
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30 font-mono">
                  ARITHMATRIX
                </span>
              </div>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 font-mono tracking-tight flex items-center gap-1">
                <span>Espresso Steganography & Forensic Engine</span>
              </p>
            </div>
          </div>

          {/* Minimalist Nav Tabs */}
          <nav className="hidden md:flex items-center gap-1 p-1 bg-stone-200/60 dark:bg-stone-900/80 rounded-2xl border border-amber-900/10 dark:border-stone-800 shadow-inner">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-300 ${
                    isActive
                      ? 'bg-amber-600 text-white dark:bg-amber-500/20 dark:text-amber-300 dark:border dark:border-amber-500/40 shadow-md shadow-amber-600/20'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-300/40 dark:hover:bg-stone-800/40'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 transition-colors ${isActive ? 'text-white dark:text-amber-400' : 'text-stone-500 dark:text-stone-400'}`} />
                  {tab.label}
                  {tab.highlight && (
                    <span className="absolute -top-1 -right-1 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Controls: Theme Switcher & Status Badge */}
          <div className="flex items-center gap-3">
            
            {/* Dark / Light Mode Toggle Button */}
            <button
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              className="p-2.5 rounded-2xl bg-stone-200/80 dark:bg-stone-900/90 text-amber-800 dark:text-amber-400 border border-amber-900/10 dark:border-stone-800 hover:scale-105 active:scale-95 transition-all shadow-sm flex items-center justify-center gap-1.5"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
                  <span className="text-xs font-semibold hidden sm:inline text-amber-300">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-amber-800" />
                  <span className="text-xs font-semibold hidden sm:inline text-amber-900">Dark</span>
                </>
              )}
            </button>

            <div className="hidden xl:flex flex-col items-end text-right border-l border-amber-900/10 dark:border-stone-800 pl-3">
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                Forensic Engine Ready
              </span>
              <span className="text-[10px] text-stone-500 font-mono">AES-256 PBKDF2</span>
            </div>

          </div>

        </div>

        {/* Mobile Navigation Row */}
        <div className="md:hidden flex overflow-x-auto gap-2 py-2.5 border-t border-amber-900/10 dark:border-stone-800 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs whitespace-nowrap font-medium transition-colors ${
                  isActive
                    ? 'bg-amber-600 text-white dark:bg-amber-500/20 dark:text-amber-300 dark:border dark:border-amber-500/40'
                    : 'text-stone-600 dark:text-stone-400 bg-stone-200/60 dark:bg-stone-900/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
