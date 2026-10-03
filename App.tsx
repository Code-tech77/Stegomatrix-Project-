import { useState, useEffect } from 'react';
import { BackgroundParticles } from './components/BackgroundParticles';
import { Navbar, type TabType } from './components/Navbar';
import { EmbedTab } from './components/EmbedTab';
import { ExtractTab } from './components/ExtractTab';
import { ProofDemoTab } from './components/ProofDemoTab';
import { BitInspectorTab } from './components/BitInspectorTab';
import { DocsTab } from './components/DocsTab';
import { Shield, Coffee, Search } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('embed');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <div className={`min-h-screen flex flex-col relative selection:bg-amber-500 selection:text-stone-950 font-sans antialiased overflow-x-hidden transition-colors duration-300 ${theme === 'dark' ? 'bg-stone-950 text-stone-100' : 'bg-amber-50/40 text-stone-900'}`}>
      
      {/* Dynamic Background Mesh / Particles */}
      <BackgroundParticles />

      {/* Top Navbar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} theme={theme} toggleTheme={toggleTheme} />

      {/* Main Container */}
      <main className="flex-1 z-10 py-6 px-2 sm:px-4 max-w-7xl mx-auto w-full">
        {activeTab === 'embed' && <EmbedTab onGoToExtract={() => setActiveTab('extract')} />}
        {activeTab === 'extract' && <ExtractTab />}
        {activeTab === 'proof' && <ProofDemoTab />}
        {activeTab === 'inspector' && <BitInspectorTab />}
        {activeTab === 'docs' && <DocsTab />}
      </main>

      {/* Minimalist Professional Footer */}
      <footer className="z-10 border-t border-amber-900/10 dark:border-stone-800/80 bg-amber-50/80 dark:bg-stone-950/80 backdrop-blur-2xl py-8 mt-16 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
              <Coffee className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-stone-800 dark:text-stone-300">
                Arithmatrix Internship Project developed by <span className="font-bold text-amber-600 dark:text-amber-400">Mohammed Zuoriki</span>
              </p>
              <p className="text-[11px] text-stone-500 font-mono mt-0.5 flex items-center gap-1.5">
                <Search className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                <span>Steganography & Forensic Pixel Inspection Engine</span>
              </p>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/Code-tech77"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-stone-200/80 dark:bg-stone-900/90 text-stone-800 dark:text-stone-300 hover:text-amber-600 dark:hover:text-amber-400 border border-amber-900/10 dark:border-stone-800 hover:border-amber-500/40 transition-all text-xs font-semibold shadow-sm hover:scale-105 active:scale-95 group"
            >
              <svg className="w-4 h-4 text-stone-500 dark:text-stone-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              <span>GitHub</span>
            </a>

            <a
              href="https://www.linkedin.com/in/mohammed-zuoriki-856133250/?isSelfProfile=true"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-stone-200/80 dark:bg-stone-900/90 text-stone-800 dark:text-stone-300 hover:text-amber-600 dark:hover:text-amber-400 border border-amber-900/10 dark:border-stone-800 hover:border-amber-500/40 transition-all text-xs font-semibold shadow-sm hover:scale-105 active:scale-95 group"
            >
              <svg className="w-4 h-4 text-stone-500 dark:text-stone-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors fill-current" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
              </svg>
              <span>LinkedIn</span>
            </a>
          </div>

        </div>
      </footer>

    </div>
  );
}

export default App;

