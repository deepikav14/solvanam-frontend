export default function Introduction() {
  return (
    <section id="introduction" className="relative py-32 lg:py-48 grain">
      <div className="mx-auto max-w-4xl px-6 lg:px-10">
        {/* Centered eyebrow */}
        <div className="text-center mb-16">
          <span className="eyebrow">I — Introduction</span>
        </div>

        {/* Large editorial statement */}
        <blockquote className="font-serif text-3xl sm:text-4xl lg:text-5xl text-parchment-100 leading-[1.3] text-balance text-center">
          Words are more than definitions.
        </blockquote>

        {/* Manuscript-inspired divider */}
        <div className="flex items-center justify-center my-12">
          <div className="h-px w-20 bg-bronze-400/20" />
          <svg width="24" height="24" viewBox="0 0 24 24" className="text-bronze-400/40 mx-4">
            <circle cx="12" cy="12" r="2" fill="currentColor" />
            <circle cx="12" cy="12" r="7" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.5" />
            <circle cx="12" cy="12" r="11" fill="none" stroke="currentColor" strokeWidth="0.3" opacity="0.3" />
          </svg>
          <div className="h-px w-20 bg-bronze-400/20" />
        </div>

        <p className="font-serif text-xl lg:text-2xl text-parchment-300/70 leading-[1.7] text-center max-w-2xl mx-auto">
          Sol-Vanam traces how Tamil words appear, connect and evolve across
          literary contexts — from classical works to living Tamil.
        </p>

        {/* Subtle vertical timeline / manuscript divider */}
        <div className="mt-24 flex justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-px h-16 bg-gradient-to-b from-bronze-400/20 to-transparent" />
            <div className="w-2 h-2 rounded-full border border-bronze-400/30" />
            <div className="w-px h-16 bg-gradient-to-t from-bronze-400/20 to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}
