interface StarNode {
  id: string;
  label: string;
  x: number;
  y: number;
  size: 'large' | 'medium' | 'small';
  brightness: 'bright' | 'normal' | 'dim';
}

const nodes: StarNode[] = [
  { id: 'center', label: 'அன்பு', x: 300, y: 300, size: 'large', brightness: 'bright' },
  { id: 'n1', label: 'அன்புடையார்', x: 100, y: 140, size: 'medium', brightness: 'normal' },
  { id: 'n2', label: 'நேசம்', x: 500, y: 160, size: 'medium', brightness: 'normal' },
  { id: 'n3', label: 'உறவு', x: 80, y: 440, size: 'medium', brightness: 'normal' },
  { id: 'n4', label: 'கருணை', x: 520, y: 420, size: 'medium', brightness: 'normal' },
  { id: 'n5', label: 'உள்ளம்', x: 300, y: 80, size: 'small', brightness: 'dim' },
  { id: 'n6', label: 'பாசம்', x: 180, y: 520, size: 'small', brightness: 'dim' },
  { id: 'n7', label: 'வாழ்வு', x: 460, y: 520, size: 'small', brightness: 'dim' },
  { id: 'n8', label: 'அகம்', x: 200, y: 240, size: 'small', brightness: 'dim' },
  { id: 'n9', label: 'உயிர்', x: 420, y: 360, size: 'small', brightness: 'dim' },
];

const sizeMap = { large: 4, medium: 2.5, small: 1.5 };
const fontSizeMap = { large: 22, medium: 13, small: 11 };
const opacityMap = { bright: 1, normal: 0.7, dim: 0.45 };

export default function SemanticConstellation() {
  return (
    <section id="constellation" className="relative py-32 lg:py-48 overflow-hidden grain">
      <div className="absolute inset-0 starfield opacity-40" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-bronze-400/[0.02] blur-[100px]" />

      <div className="relative mx-auto max-w-5xl px-6 lg:px-10">
        {/* Header */}
        <div className="text-center mb-4">
          <span className="eyebrow">II — The Semantic Constellation</span>
        </div>

        <h2 className="font-serif text-3xl lg:text-4xl text-parchment-100 text-center mb-20">
          A celestial map of meaning
        </h2>

        {/* Star chart */}
        <div className="relative max-w-2xl mx-auto">
          {/* Chart frame — thin elegant astronomical border */}
          <div className="absolute inset-0 border border-bronze-400/[0.06] rounded-sm" />
          {/* Corner marks */}
          {[
            { top: '-4px', left: '-4px', borderT: 'border-t', borderL: 'border-l' },
            { top: '-4px', right: '-4px', borderT: 'border-t', borderR: 'border-r' },
            { bottom: '-4px', left: '-4px', borderB: 'border-b', borderL: 'border-l' },
            { bottom: '-4px', right: '-4px', borderB: 'border-b', borderR: 'border-r' },
          ].map((corner, i) => (
            <div
              key={i}
              className={`absolute w-3 h-3 border-bronze-400/30 ${corner.borderT || ''} ${corner.borderL || ''} ${corner.borderR || ''} ${corner.borderB || ''}`}
              style={{ top: corner.top, left: corner.left, right: corner.right, bottom: corner.bottom }}
            />
          ))}

          <svg
            viewBox="0 0 600 600"
            className="w-full"
            style={{ aspectRatio: '1' }}
            aria-label="Semantic constellation star chart"
          >
            <defs>
              <radialGradient id="centerStarGlow">
                <stop offset="0%" stopColor="rgba(201,169,106,0.3)" />
                <stop offset="40%" stopColor="rgba(201,169,106,0.06)" />
                <stop offset="100%" stopColor="rgba(201,169,106,0)" />
              </radialGradient>
            </defs>

            {/* Faint background circle — celestial chart ring */}
            <circle cx="300" cy="300" r="260" fill="none" stroke="rgba(201,169,106,0.04)" strokeWidth="0.5" />
            <circle cx="300" cy="300" r="180" fill="none" stroke="rgba(201,169,106,0.03)" strokeWidth="0.5" />

            {/* Center glow */}
            <circle cx="300" cy="300" r="80" fill="url(#centerStarGlow)" />

            {/* Connection lines — extremely thin */}
            {nodes.filter((n) => n.id !== 'center').map((node) => (
              <line
                key={`line-${node.id}`}
                x1={300}
                y1={300}
                x2={node.x}
                y2={node.y}
                stroke="rgba(201,169,106,0.12)"
                strokeWidth="0.4"
              />
            ))}

            {/* Inter-satellite faint lines */}
            <line x1={100} y1={140} x2={300} y2={80} stroke="rgba(201,169,106,0.05)" strokeWidth="0.3" />
            <line x1={500} y1={160} x2={300} y2={80} stroke="rgba(201,169,106,0.05)" strokeWidth="0.3" />
            <line x1={80} y1={440} x2={180} y2={520} stroke="rgba(201,169,106,0.05)" strokeWidth="0.3" />
            <line x1={520} y1={420} x2={460} y2={520} stroke="rgba(201,169,106,0.05)" strokeWidth="0.3" />
            <line x1={100} y1={140} x2={200} y2={240} stroke="rgba(201,169,106,0.04)" strokeWidth="0.3" />
            <line x1={500} y1={160} x2={420} y2={360} stroke="rgba(201,169,106,0.04)" strokeWidth="0.3" />

            {/* Crosshair on center */}
            <line x1={300} y1={288} x2={300} y2={312} stroke="rgba(201,169,106,0.15)" strokeWidth="0.3" />
            <line x1={288} y1={300} x2={312} y2={300} stroke="rgba(201,169,106,0.15)" strokeWidth="0.3" />

            {/* Nodes — stars with labels */}
            {nodes.map((node) => (
              <g key={node.id} className={node.brightness === 'bright' ? 'animate-twinkle-slow' : node.brightness === 'normal' ? 'animate-twinkle' : ''}>
                {/* Star point */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={sizeMap[node.size]}
                  fill="rgba(235,228,212,0.9)"
                  opacity={opacityMap[node.brightness]}
                />
                {/* Tiny diffraction for center star */}
                {node.size === 'large' && (
                  <>
                    <line x1={node.x - 12} y1={node.y} x2={node.x + 12} y2={node.y} stroke="rgba(201,169,106,0.15)" strokeWidth="0.3" />
                    <line x1={node.x} y1={node.y - 12} x2={node.x} y2={node.y + 12} stroke="rgba(201,169,106,0.15)" strokeWidth="0.3" />
                  </>
                )}
                {/* Label */}
                <text
                  x={node.x}
                  y={node.size === 'large' ? node.y + 28 : node.y + 16}
                  textAnchor="middle"
                  className="fill-parchment-100 font-tamil pointer-events-none select-none"
                  fontSize={fontSizeMap[node.size]}
                  fontWeight={node.size === 'large' ? 500 : 400}
                  opacity={opacityMap[node.brightness]}
                >
                  {node.label}
                </text>
              </g>
            ))}

            {/* Small magnitude scale — bottom right, astronomical chart detail */}
            <text x={560} y={580} textAnchor="end" className="fill-parchment-300/20 font-mono" fontSize="7">
              mag. scale
            </text>
            <circle cx={565} cy={565} r={3} fill="rgba(235,228,212,0.2)" />
            <circle cx={572} cy={565} r={2} fill="rgba(235,228,212,0.15)" />
            <circle cx={578} cy={565} r={1.5} fill="rgba(235,228,212,0.1)" />
          </svg>
        </div>

        {/* Editorial caption */}
        <p className="mt-12 font-serif italic text-base lg:text-lg text-parchment-300/40 text-center max-w-xl mx-auto leading-relaxed">
          Semantic relationships emerge from patterns of contextual usage
          across the corpus.
        </p>
      </div>
    </section>
  );
}
