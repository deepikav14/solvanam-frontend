const eras = [
  {
    name: 'Sangam',
    period: 'c. 300 BCE — 300 CE',
    tamil: 'குறுந்தொகை',
    ref: 'Kuruntokai',
    note: 'The earliest stratum — akam and puram poetry that defines the lexicon.',
  },
  {
    name: 'Classical',
    period: 'c. 200 — 500 CE',
    tamil: 'திருக்குறள்',
    ref: 'Tirukkural',
    note: 'Didactic and ethical literature systematizes word usage.',
  },
  {
    name: 'Bhakti',
    period: 'c. 6th — 15th c.',
    tamil: 'தேவாரம்',
    ref: 'Tevaram',
    note: 'Devotional traditions reshape vocabulary with philosophical depth.',
  },
  {
    name: 'Later Literature',
    period: 'c. 16th — 19th c.',
    tamil: 'நளவெண்பா',
    ref: 'Nalavenpa',
    note: 'Commentarial works preserve and extend earlier semantic layers.',
  },
  {
    name: 'Modern Tamil',
    period: 'c. 19th c. — present',
    tamil: 'பாரதியார்',
    ref: 'Bharati',
    note: 'Contemporary contexts introduce semantic shifts and neologisms.',
  },
];

export default function LiteraryJourney() {
  return (
    <section id="journey" className="relative py-32 lg:py-48 grain">
      <div className="mx-auto max-w-5xl px-6 lg:px-10">
        {/* Header */}
        <div className="text-center mb-4">
          <span className="eyebrow">III — Literary Journey</span>
        </div>

        <h2 className="font-serif text-3xl lg:text-4xl text-parchment-100 text-center mb-6">
          Through centuries of usage
        </h2>

        <p className="font-serif italic text-lg text-parchment-300/50 text-center max-w-lg mx-auto mb-20">
          Follow Tamil vocabulary through centuries of literary usage.
        </p>

        {/* Desktop: horizontal timeline */}
        <div className="hidden lg:block relative">
          {/* Continuous line */}
          <div className="absolute top-[10px] left-[8%] right-[8%] h-px bg-gradient-to-r from-bronze-400/10 via-bronze-400/30 to-bronze-400/10" />

          <div className="grid grid-cols-5 gap-4">
            {eras.map((era, i) => (
              <div key={era.name} className="relative flex flex-col items-center text-center pt-8">
                {/* Marker */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-bronze-400/40 ring-4 ring-ink-950" />
                </div>

                <div className="eyebrow mb-2">{era.period}</div>
                <h3 className="font-serif text-lg text-parchment-100">{era.name}</h3>
                <div className="font-tamil text-sm text-bronze-300/70 mt-2">{era.tamil}</div>
                <div className="text-[11px] text-parchment-300/30 mt-0.5 font-mono">{era.ref}</div>
                <p className="mt-3 text-xs text-parchment-300/40 leading-relaxed max-w-[170px]">
                  {era.note}
                </p>

                {/* Down arrow connector */}
                {i < eras.length - 1 && (
                  <div className="absolute top-[-4px] right-[-50%] text-bronze-400/15 text-lg">
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Mobile: vertical timeline */}
        <div className="lg:hidden relative flex flex-col gap-12">
          <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gradient-to-b from-bronze-400/20 via-bronze-400/10 to-transparent" />
          {eras.map((era) => (
            <div key={era.name} className="relative flex gap-5 items-start">
              <div className="relative w-4 h-4 shrink-0 mt-1">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-bronze-400/40 ring-4 ring-ink-950" />
              </div>
              <div>
                <div className="eyebrow mb-1">{era.period}</div>
                <h3 className="font-serif text-lg text-parchment-100">{era.name}</h3>
                <div className="font-tamil text-sm text-bronze-300/70 mt-1">{era.tamil}</div>
                <div className="text-[11px] text-parchment-300/30 mt-0.5 font-mono">{era.ref}</div>
                <p className="mt-2 text-xs text-parchment-300/40 leading-relaxed">
                  {era.note}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
