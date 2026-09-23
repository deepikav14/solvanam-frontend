const stats = [
  { value: '65K+', label: 'Passages' },
  { value: '550K+', label: 'Word Forms' },
  { value: 'Classical → Modern', label: 'Literary Coverage' },
  { value: 'Multiple', label: 'Literary Sources' },
];

export default function CorpusArchive() {
  return (
    <section id="archive" className="relative py-32 lg:py-48 grain">
      <div className="absolute inset-0 starfield opacity-20" />
      <div className="relative mx-auto max-w-5xl px-6 lg:px-10">
        {/* Header */}
        <div className="text-center mb-4">
          <span className="eyebrow">IV — The Archive</span>
        </div>

        <h2 className="font-serif text-3xl lg:text-4xl text-parchment-100 text-center mb-24">
          Corpus as archive
        </h2>

        {/* Oversized typography stats */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-y-16 lg:gap-x-0">
          {stats.map((stat, i) => (
            <div key={stat.label} className="flex items-center">
              {/* Stat */}
              <div className="text-center px-8 lg:px-12">
                <div className="font-serif text-3xl sm:text-4xl lg:text-5xl text-parchment-100 leading-none">
                  {stat.value}
                </div>
                <div className="mt-3 eyebrow">{stat.label}</div>
              </div>
              {/* Separator */}
              {i < stats.length - 1 && (
                <div className="hidden lg:block w-px h-16 bg-bronze-400/15" />
              )}
            </div>
          ))}
        </div>

        {/* Subtle metadata footer */}
        <div className="mt-20 flex items-center justify-center gap-3">
          <div className="h-px w-8 bg-bronze-400/15" />
          <span className="text-[10px] font-mono text-parchment-300/25 tracking-wider">
            archival metadata · sol-vanam corpus
          </span>
          <div className="h-px w-8 bg-bronze-400/15" />
        </div>
      </div>
    </section>
  );
}
