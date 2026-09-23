import { useState, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Introduction from '@/components/Introduction';
import SemanticConstellation from '@/components/SemanticConstellation';
import LiteraryJourney from '@/components/LiteraryJourney';
import CorpusArchive from '@/components/CorpusArchive';
import VisualBreak from '@/components/VisualBreak';
import HowItWorks from '@/components/HowItWorks';
import FinalCTA from '@/components/FinalCTA';
import Footer from '@/components/Footer';
import WordExplorer from '@/components/WordExplorer';

function App() {
  const [view, setView] = useState<'home' | 'word'>('home');
  const [word, setWord] = useState('');

  const navigateToWord = useCallback((w: string) => {
    setWord(w);
    setView('word');
  }, []);

  const navigateHome = useCallback(() => {
    setView('home');
    setWord('');
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  if (view === 'word') {
    return (
      <WordExplorer
        word={word}
        onBack={navigateHome}
        onNavigate={navigateToWord}
      />
    );
  }

  return (
    <div className="min-h-screen bg-ink-950 relative">
      <Navbar onSearchClick={scrollToTop} />
      <main>
        <Hero onSearch={navigateToWord} />
        <Introduction />
        <SemanticConstellation />
        <LiteraryJourney />
        <VisualBreak />
        <CorpusArchive />
        <HowItWorks />
        <FinalCTA onSearch={navigateToWord} />
      </main>
      <Footer />
    </div>
  );
}

export default App;
