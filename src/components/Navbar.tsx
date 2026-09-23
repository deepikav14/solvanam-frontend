import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { label: 'Introduction', href: '#introduction' },
  { label: 'Constellation', href: '#constellation' },
  { label: 'Literary Journey', href: '#journey' },
  { label: 'Archive', href: '#archive' },
];

export default function Navbar({ onSearchClick }: { onSearchClick?: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-1000 ${
        scrolled
          ? 'bg-ink-950/85 backdrop-blur-md border-b border-white/[0.04]'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <nav className="mx-auto max-w-6xl px-6 lg:px-10 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="#top" className="flex items-center gap-3 group">
          <svg width="20" height="20" viewBox="0 0 20 20" className="text-bronze-400">
            <circle cx="10" cy="10" r="1.5" fill="currentColor" />
            <circle cx="10" cy="10" r="6" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.5" />
            <circle cx="10" cy="10" r="9" fill="none" stroke="currentColor" strokeWidth="0.3" opacity="0.3" />
            <circle cx="10" cy="1" r="0.8" fill="currentColor" opacity="0.6" />
            <circle cx="19" cy="10" r="0.8" fill="currentColor" opacity="0.4" />
            <circle cx="10" cy="19" r="0.8" fill="currentColor" opacity="0.5" />
            <circle cx="1" cy="10" r="0.8" fill="currentColor" opacity="0.4" />
          </svg>
          <span className="font-serif text-base tracking-[0.15em] text-parchment-100">
            SOL-VANAM
          </span>
        </a>

        {/* Desktop links */}
        <div className="hidden lg:flex items-center gap-10">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[13px] text-parchment-300/60 hover:text-bronze-300 transition-colors duration-700"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Right action */}
        <div className="hidden lg:flex items-center">
          <button
            onClick={onSearchClick}
            className="text-[13px] text-bronze-300/80 hover:text-bronze-300 transition-colors duration-700 border-b border-bronze-400/20 hover:border-bronze-400/50 pb-0.5"
          >
            Explore a Word
          </button>
        </div>

        {/* Mobile toggle */}
        <button
          className="lg:hidden text-parchment-300/70"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-ink-950/95 backdrop-blur-md border-b border-white/[0.04]">
          <div className="px-6 py-5 flex flex-col gap-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-sm text-parchment-300/60 hover:text-bronze-300 transition-colors"
              >
                {link.label}
              </a>
            ))}
            <button
              onClick={() => {
                setMobileOpen(false);
                onSearchClick?.();
              }}
              className="text-sm text-bronze-300 text-left"
            >
              Explore a Word
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
