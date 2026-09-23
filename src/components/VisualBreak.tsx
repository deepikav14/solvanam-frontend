const BREAK_IMAGE =
  'https://images.pexels.com/photos/5149241/pexels-photo-5149241.jpeg?auto=compress&cs=tinysrgb&w=1920';

export default function VisualBreak() {
  return (
    <section className="relative h-[60vh] min-h-[400px] flex items-center justify-center overflow-hidden grain">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={BREAK_IMAGE}
          alt="Ancient manuscript with handwritten inscriptions"
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink-950 via-ink-950/40 to-ink-950" />
        <div className="absolute inset-0 vignette" />
      </div>

      {/* Overlay text */}
      <div className="relative z-10 text-center px-6 max-w-2xl">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="h-px w-10 bg-bronze-400/20" />
          <span className="eyebrow">Visual Archive</span>
          <div className="h-px w-10 bg-bronze-400/20" />
        </div>

        <p className="font-serif text-2xl sm:text-3xl lg:text-4xl text-parchment-100 leading-[1.4] text-balance">
          From ancient verses
          <br />
          <span className="italic text-bronze-300/80">to living language.</span>
        </p>
      </div>
    </section>
  );
}
