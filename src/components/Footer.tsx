export default function Footer() {
  return (
    <footer className="relative border-t border-white/[0.04] py-16 grain">
      <div className="mx-auto max-w-5xl px-6 lg:px-10">
        <div className="flex flex-col items-center text-center gap-6">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <svg width="16" height="16" viewBox="0 0 16 16" className="text-bronze-400/50">
              <circle cx="8" cy="8" r="1" fill="currentColor" />
              <circle cx="8" cy="8" r="5" fill="none" stroke="currentColor" strokeWidth="0.4" opacity="0.5" />
              <circle cx="8" cy="8" r="7.5" fill="none" stroke="currentColor" strokeWidth="0.25" opacity="0.3" />
            </svg>
            <span className="font-serif text-sm tracking-[0.2em] text-parchment-100">
              SOL-VANAM
            </span>
          </div>

          {/* Tagline */}
          <div className="text-[11px] font-mono tracking-[0.25em] uppercase text-bronze-400/40">
            Tamil Semantic Constellation
          </div>

          {/* Description */}
          <p className="font-serif text-base italic text-parchment-300/40 max-w-md leading-relaxed">
            An exploration of Tamil words across literature, context and time.
          </p>

          {/* Thin separator */}
          <div className="w-32 h-px bg-bronze-400/10 my-4" />

          {/* Minimal links */}
          <div className="flex items-center gap-8">
            {[
              { label: 'Explore', href: '#introduction' },
              { label: 'Corpus', href: '#archive' },
              { label: 'Research', href: '#constellation' },
              { label: 'About', href: '#top' },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-xs text-parchment-300/40 hover:text-bronze-300 transition-colors duration-700"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
