import SearchBox from './SearchBox';

const HERO_IMAGE =
  'https://images.pexels.com/photos/30719635/pexels-photo-30719635.jpeg?auto=compress&cs=tinysrgb&w=1920';

interface HeroProps {
  onSearch?: (word: string) => void;
}

export default function Hero({ onSearch }: HeroProps) {
  return (
    <section id="top" className="relative min-h-screen flex flex-col justify-end overflow-hidden grain">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={HERO_IMAGE}
          alt="Ancient palm-leaf manuscript"
          className="w-full h-full object-cover opacity-40 animate-parallax"
        />
        <div className="absolute inset-0 manuscript-overlay" />
        <div className="absolute inset-0 vignette" />
      </div>

      {/* Subtle constellation overlay */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
        <defs>
          <radialGradient id="heroStarGlow">
            <stop offset="0%" stopColor="rgba(201,169,106,0.4)" />
            <stop offset="100%" stopColor="rgba(201,169,106,0)" />
          </radialGradient>
        </defs>
        {/* thin constellation lines */}
        <line x1="15%" y1="22%" x2="35%" y2="35%" stroke="rgba(201,169,106,0.12)" strokeWidth="0.5" />
        <line x1="35%" y1="35%" x2="60%" y2="28%" stroke="rgba(201,169,106,0.08)" strokeWidth="0.5" />
        <line x1="60%" y1="28%" x2="82%" y2="40%" stroke="rgba(201,169,106,0.1)" strokeWidth="0.5" />
        <line x1="35%" y1="35%" x2="50%" y2="55%" stroke="rgba(201,169,106,0.08)" strokeWidth="0.5" />
        <line x1="50%" y1="55%" x2="72%" y2="62%" stroke="rgba(201,169,106,0.06)" strokeWidth="0.5" />
        {/* subtle stars */}
        <circle cx="15%" cy="22%" r="2" fill="rgba(201,169,106,0.5)" className="animate-twinkle" />
        <circle cx="35%" cy="35%" r="1.5" fill="rgba(201,169,106,0.4)" className="animate-twinkle-slow" />
        <circle cx="60%" cy="28%" r="2" fill="rgba(201,169,106,0.45)" className="animate-twinkle" />
        <circle cx="82%" cy="40%" r="1.5" fill="rgba(201,169,106,0.35)" className="animate-twinkle-slow" />
        <circle cx="50%" cy="55%" r="1" fill="rgba(201,169,106,0.3)" className="animate-twinkle" />
        <circle cx="72%" cy="62%" r="1.5" fill="rgba(201,169,106,0.3)" className="animate-twinkle-slow" />
      </svg>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-4xl px-6 lg:px-10 pb-20 pt-32 text-center">
        {/* Small marker */}
        <div className="flex items-center justify-center gap-3 mb-8 animate-fade-in">
          <div className="h-px w-12 bg-bronze-400/30" />
          <span className="eyebrow">Tamil Semantic Constellation</span>
          <div className="h-px w-12 bg-bronze-400/30" />
        </div>

        <h1 className="font-serif text-4xl sm:text-5xl lg:text-7xl text-parchment-100 leading-[1.15] text-balance animate-fade-in-up">
          Every Tamil Word
          <br />
          <span className="italic text-bronze-300/90">Has a Universe.</span>
        </h1>

        <p className="mt-6 text-base lg:text-lg text-parchment-300/60 max-w-xl mx-auto leading-relaxed animate-fade-in-slow">
          Explore the meanings, relationships and literary journey
          hidden within Tamil words.
        </p>

        {/* Search at the bottom of hero */}
        <div className="mt-12 animate-fade-in-slow">
          <SearchBox variant="hero" onSearch={onSearch} />
        </div>
      </div>

      {/* Bottom fade into next section */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-ink-950 to-transparent" />
    </section>
  );
}
