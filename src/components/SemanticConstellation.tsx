interface StarNode {
  id: string;
  label: string;
  x: number;
  y: number;
  size: 'large' | 'medium' | 'small';
  brightness: 'bright' | 'normal' | 'dim';
}

const nodes: StarNode[] = [
  {
    id: 'center',
    label: 'அன்பு',
    x: 300,
    y: 300,
    size: 'large',
    brightness: 'bright',
  },
  {
    id: 'n1',
    label: 'நேசம்',
    x: 115,
    y: 150,
    size: 'medium',
    brightness: 'normal',
  },
  {
    id: 'n2',
    label: 'உறவு',
    x: 500,
    y: 145,
    size: 'medium',
    brightness: 'normal',
  },
  {
    id: 'n3',
    label: 'கருணை',
    x: 105,
    y: 445,
    size: 'medium',
    brightness: 'normal',
  },
  {
    id: 'n4',
    label: 'பாசம்',
    x: 500,
    y: 440,
    size: 'medium',
    brightness: 'normal',
  },
  {
    id: 'n5',
    label: 'உள்ளம்',
    x: 300,
    y: 82,
    size: 'small',
    brightness: 'dim',
  },
  {
    id: 'n6',
    label: 'உயிர்',
    x: 190,
    y: 525,
    size: 'small',
    brightness: 'dim',
  },
  {
    id: 'n7',
    label: 'வாழ்வு',
    x: 420,
    y: 525,
    size: 'small',
    brightness: 'dim',
  },
  {
    id: 'n8',
    label: 'அகம்',
    x: 190,
    y: 245,
    size: 'small',
    brightness: 'dim',
  },
  {
    id: 'n9',
    label: 'மனம்',
    x: 420,
    y: 350,
    size: 'small',
    brightness: 'dim',
  },
];

const sizeMap = {
  large: 4.5,
  medium: 2.7,
  small: 1.5,
};

const fontSizeMap = {
  large: 22,
  medium: 14,
  small: 11,
};

const opacityMap = {
  bright: 1,
  normal: 0.72,
  dim: 0.42,
};

export default function SemanticConstellation() {
  return (
    <section
      id="constellation"
      className="relative overflow-hidden py-32 lg:py-48"
    >
      {/* Atmospheric layer */}

      <div className="pointer-events-none absolute inset-0 opacity-40 starfield" />

      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-bronze-400/[0.018] blur-[120px]" />

      <div className="relative mx-auto max-w-6xl px-6 lg:px-10">
        {/* Editorial heading */}

        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">
            II — The Semantic Constellation
          </span>

          <h2 className="mt-5 font-serif text-3xl text-parchment-100 lg:text-5xl">
            A celestial map of meaning
          </h2>

          <p className="mx-auto mt-6 max-w-xl font-serif text-base leading-8 text-parchment-300/45 lg:text-lg">
            A Tamil word rarely lives alone.
            Its meanings gather around it through
            usage, association, literature and time.
          </p>
        </div>

        {/* Constellation */}

        <div className="relative mx-auto mt-16 max-w-3xl">
          <div className="relative aspect-square w-full overflow-hidden border border-bronze-400/[0.08] bg-ink-950/40">
            {/* Astronomical frame */}

            <div className="pointer-events-none absolute inset-3 border border-bronze-400/[0.035]" />

            <div className="pointer-events-none absolute inset-6 border border-bronze-400/[0.025]" />

            {/* Corner coordinates */}

            <span className="absolute left-5 top-5 font-mono text-[7px] tracking-[0.3em] text-parchment-300/20">
              13° 04′ N
            </span>

            <span className="absolute right-5 top-5 font-mono text-[7px] tracking-[0.3em] text-parchment-300/20">
              SEMANTIC ATLAS
            </span>

            <span className="absolute bottom-5 left-5 font-mono text-[7px] tracking-[0.3em] text-parchment-300/20">
              CORPUS FIELD
            </span>

            <span className="absolute bottom-5 right-5 font-mono text-[7px] tracking-[0.3em] text-parchment-300/20">
              ✦ 01
            </span>

            <svg
              viewBox="0 0 600 600"
              className="relative z-10 h-full w-full"
              aria-label="Semantic constellation of the Tamil word அன்பு"
            >
              <defs>
                <radialGradient
                  id="solvanamCenterGlow"
                  cx="50%"
                  cy="50%"
                  r="50%"
                >
                  <stop
                    offset="0%"
                    stopColor="rgba(201,169,106,0.22)"
                  />

                  <stop
                    offset="45%"
                    stopColor="rgba(201,169,106,0.055)"
                  />

                  <stop
                    offset="100%"
                    stopColor="rgba(201,169,106,0)"
                  />
                </radialGradient>

                <filter id="softGlow">
                  <feGaussianBlur
                    stdDeviation="3"
                    result="blur"
                  />

                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Outer astronomical rings */}

              <circle
                cx="300"
                cy="300"
                r="270"
                fill="none"
                stroke="rgba(201,169,106,0.035)"
                strokeWidth="0.5"
              />

              <circle
                cx="300"
                cy="300"
                r="205"
                fill="none"
                stroke="rgba(201,169,106,0.045)"
                strokeWidth="0.5"
                strokeDasharray="1 8"
              />

              <circle
                cx="300"
                cy="300"
                r="135"
                fill="none"
                stroke="rgba(201,169,106,0.035)"
                strokeWidth="0.5"
              />

              {/* Center atmosphere */}

              <circle
                cx="300"
                cy="300"
                r="100"
                fill="url(#solvanamCenterGlow)"
              />

              {/* Main connections */}

              {nodes
                .filter(
                  (node) =>
                    node.id !== 'center',
                )
                .map((node) => (
                  <line
                    key={`connection-${node.id}`}
                    x1="300"
                    y1="300"
                    x2={node.x}
                    y2={node.y}
                    stroke="rgba(201,169,106,0.11)"
                    strokeWidth="0.45"
                  />
                ))}

              {/* Secondary constellation lines */}

              <line
                x1="115"
                y1="150"
                x2="300"
                y2="82"
                stroke="rgba(201,169,106,0.045)"
                strokeWidth="0.3"
              />

              <line
                x1="500"
                y1="145"
                x2="300"
                y2="82"
                stroke="rgba(201,169,106,0.045)"
                strokeWidth="0.3"
              />

              <line
                x1="105"
                y1="445"
                x2="190"
                y2="525"
                stroke="rgba(201,169,106,0.04)"
                strokeWidth="0.3"
              />

              <line
                x1="500"
                y1="440"
                x2="420"
                y2="525"
                stroke="rgba(201,169,106,0.04)"
                strokeWidth="0.3"
              />

              <line
                x1="115"
                y1="150"
                x2="190"
                y2="245"
                stroke="rgba(201,169,106,0.035)"
                strokeWidth="0.3"
              />

              <line
                x1="500"
                y1="145"
                x2="420"
                y2="350"
                stroke="rgba(201,169,106,0.035)"
                strokeWidth="0.3"
              />

              {/* Center crosshair */}

              <line
                x1="285"
                y1="300"
                x2="315"
                y2="300"
                stroke="rgba(201,169,106,0.18)"
                strokeWidth="0.4"
              />

              <line
                x1="300"
                y1="285"
                x2="300"
                y2="315"
                stroke="rgba(201,169,106,0.18)"
                strokeWidth="0.4"
              />

              {/* Nodes */}

              {nodes.map(
                (node) => (
                  <g
                    key={node.id}
                    className={
                      node.brightness ===
                      'bright'
                        ? 'animate-twinkle-slow'
                        : node.brightness ===
                            'normal'
                          ? 'animate-twinkle'
                          : ''
                    }
                  >
                    {/* Glow for primary nodes */}

                    {node.size !==
                      'small' && (
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={
                          node.size ===
                          'large'
                            ? 18
                            : 10
                        }
                        fill="rgba(201,169,106,0.045)"
                        filter="url(#softGlow)"
                      />
                    )}

                    {/* Star */}

                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={
                        sizeMap[
                          node.size
                        ]
                      }
                      fill="rgba(235,228,212,0.92)"
                      opacity={
                        opacityMap[
                          node.brightness
                        ]
                      }
                    />

                    {/* Center diffraction */}

                    {node.size ===
                      'large' && (
                      <>
                        <line
                          x1={
                            node.x -
                            16
                          }
                          y1={node.y}
                          x2={
                            node.x +
                            16
                          }
                          y2={node.y}
                          stroke="rgba(201,169,106,0.16)"
                          strokeWidth="0.35"
                        />

                        <line
                          x1={node.x}
                          y1={
                            node.y -
                            16
                          }
                          x2={node.x}
                          y2={
                            node.y +
                            16
                          }
                          stroke="rgba(201,169,106,0.16)"
                          strokeWidth="0.35"
                        />
                      </>
                    )}

                    {/* Label */}

                    <text
                      x={node.x}
                      y={
                        node.size ===
                        'large'
                          ? node.y +
                            30
                          : node.y +
                            17
                      }
                      textAnchor="middle"
                      className="pointer-events-none select-none fill-parchment-100 font-tamil"
                      fontSize={
                        fontSizeMap[
                          node.size
                        ]
                      }
                      fontWeight={
                        node.size ===
                        'large'
                          ? 500
                          : 400
                      }
                      opacity={
                        opacityMap[
                          node.brightness
                        ]
                      }
                    >
                      {node.label}
                    </text>
                  </g>
                ),
              )}

              {/* Chart scale */}

              <g opacity="0.4">
                <text
                  x="520"
                  y="550"
                  textAnchor="start"
                  className="fill-parchment-300/30 font-mono"
                  fontSize="7"
                >
                  CONTEXTUAL MAGNITUDE
                </text>

                <circle
                  cx="525"
                  cy="565"
                  r="3"
                  fill="rgba(235,228,212,0.25)"
                />

                <circle
                  cx="535"
                  cy="565"
                  r="2"
                  fill="rgba(235,228,212,0.18)"
                />

                <circle
                  cx="543"
                  cy="565"
                  r="1"
                  fill="rgba(235,228,212,0.12)"
                />
              </g>
            </svg>
          </div>
        </div>

        {/* Caption */}

        <div className="mx-auto mt-12 max-w-2xl text-center">
          <p className="font-serif text-base italic leading-8 text-parchment-300/40 lg:text-lg">
            The constellation is not a dictionary.
            It is a map of how meanings gather around
            a word through patterns of contextual use.
          </p>

          <div className="mt-7 flex items-center justify-center gap-5 text-[8px] tracking-[0.3em] text-parchment-300/20">
            <span>WORD</span>
            <span>·</span>
            <span>ASSOCIATION</span>
            <span>·</span>
            <span>CONTEXT</span>
            <span>·</span>
            <span>TIME</span>
          </div>
        </div>
      </div>
    </section>
  );
}
 