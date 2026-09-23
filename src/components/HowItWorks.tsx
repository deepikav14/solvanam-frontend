const steps = [
  { num: '01', title: 'Enter a word', description: 'Type any Tamil word to begin the exploration.' },
  { num: '02', title: 'Trace its lexical forms', description: 'Uncover morphological variants and root structures.' },
  { num: '03', title: 'Observe its contexts', description: 'Examine how the word functions across passages and eras.' },
  { num: '04', title: 'Explore its semantic constellation', description: 'Visualize the full network of meanings and relationships.' },
];

export default function HowItWorks() {
  return (
    <section className="relative py-32 lg:py-48 grain">
      <div className="mx-auto max-w-4xl px-6 lg:px-10">
        {/* Header */}
        <div className="text-center mb-4">
          <span className="eyebrow">V — Method</span>
        </div>

        <h2 className="font-serif text-3xl lg:text-4xl text-parchment-100 text-center mb-20">
          How Sol-Vanam works
        </h2>

        {/* Flowing editorial process with continuous line */}
        <div className="relative">
          {/* Vertical continuous line */}
          <div className="absolute left-[27px] sm:left-[31px] top-4 bottom-4 w-px bg-gradient-to-b from-bronze-400/25 via-bronze-400/15 to-bronze-400/25" />

          <div className="flex flex-col gap-16">
            {steps.map((step) => (
              <div key={step.num} className="relative flex gap-8 items-start group">
                {/* Number marker on the line */}
                <div className="relative shrink-0">
                  <div className="w-14 h-14 rounded-full border border-bronze-400/15 bg-ink-950 flex items-center justify-center group-hover:border-bronze-400/30 transition-colors duration-700">
                    <span className="font-serif text-lg text-bronze-300/70">{step.num}</span>
                  </div>
                </div>

                {/* Text */}
                <div className="pt-3">
                  <h3 className="font-serif text-xl text-parchment-100">{step.title}</h3>
                  <p className="mt-2 text-sm text-parchment-300/50 leading-relaxed max-w-md">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
