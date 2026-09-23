import SearchBox from './SearchBox';

export default function FinalCTA({ onSearch }: { onSearch?: (word: string) => void }) {
  return (
    <section className="relative py-32 lg:py-48 overflow-hidden grain">
      <div className="absolute inset-0 starfield opacity-30" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[300px] bg-bronze-400/[0.02] blur-[100px] rounded-full" />

      <div className="relative mx-auto max-w-2xl px-6 text-center">
        {/* Small constellation mark */}
        <div className="flex items-center justify-center mb-10">
          <svg width="32" height="32" viewBox="0 0 32 32" className="text-bronze-400/30">
            <circle cx="16" cy="16" r="2" fill="currentColor" />
            <circle cx="16" cy="16" r="9" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.5" />
            <circle cx="16" cy="16" r="14" fill="none" stroke="currentColor" strokeWidth="0.3" opacity="0.3" />
            <circle cx="16" cy="2" r="1" fill="currentColor" opacity="0.5" />
            <circle cx="30" cy="16" r="1" fill="currentColor" opacity="0.4" />
            <circle cx="16" cy="30" r="1" fill="currentColor" opacity="0.4" />
            <circle cx="2" cy="16" r="1" fill="currentColor" opacity="0.5" />
          </svg>
        </div>

        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-parchment-100 leading-[1.3] text-balance">
          Begin with a word.
        </h2>

        <p className="mt-6 font-serif text-lg text-parchment-300/55 leading-relaxed max-w-md mx-auto">
          Enter a Tamil word and discover the literary universe
          surrounding it.
        </p>

        <div className="mt-12">
          <SearchBox variant="minimal" onSearch={onSearch} />
        </div>
      </div>
    </section>
  );
}
