import { useMemo } from 'react';
import type { ParsedConstellationNode } from '@/api';

interface ConstellationChartProps {
  center: string;
  nodes: ParsedConstellationNode[];
  size?: number;
}

// Deterministic angle seed so layout is stable between renders
function hashCode(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export default function ConstellationChart({ center, nodes, size = 600 }: ConstellationChartProps) {
  const placed = useMemo(() => {
    const cx = size / 2;
    const cy = size / 2;
    const maxR = size * 0.4;

    // Sort by weight descending — heavier nodes closer to center
    const sorted = [...nodes].sort((a, b) => (b.weight ?? 0) - (a.weight ?? 0));

    return sorted.map((node, i) => {
      const seed = hashCode(node.label);
      const ring = Math.floor(i / 6); // first 6 in inner ring, next 6 outer
      const angleOffset = (seed % 60) * (Math.PI / 180);
      const baseAngle = (i % 6) * (Math.PI / 3);
      const angle = baseAngle + angleOffset;
      const radius = maxR * (0.45 + ring * 0.35);

      return {
        ...node,
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius,
        isInner: ring === 0,
      };
    });
  }, [nodes, size]);

  const cx = size / 2;
  const cy = size / 2;

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="w-full h-auto"
      style={{ aspectRatio: '1' }}
      aria-label={`Semantic constellation for ${center}`}
    >
      <defs>
        <radialGradient id="chartCenterGlow">
          <stop offset="0%" stopColor="rgba(201,169,106,0.25)" />
          <stop offset="40%" stopColor="rgba(201,169,106,0.05)" />
          <stop offset="100%" stopColor="rgba(201,169,106,0)" />
        </radialGradient>
      </defs>

      {/* Celestial chart rings */}
      <circle cx={cx} cy={cy} r={size * 0.45} fill="none" stroke="rgba(201,169,106,0.04)" strokeWidth="0.5" />
      <circle cx={cx} cy={cy} r={size * 0.3} fill="none" stroke="rgba(201,169,106,0.03)" strokeWidth="0.5" />

      {/* Center glow */}
      <circle cx={cx} cy={cy} r={70} fill="url(#chartCenterGlow)" />

      {/* Center crosshair */}
      <line x1={cx} y1={cy - 10} x2={cx} y2={cy + 10} stroke="rgba(201,169,106,0.12)" strokeWidth="0.3" />
      <line x1={cx - 10} y1={cy} x2={cx + 10} y2={cy} stroke="rgba(201,169,106,0.12)" strokeWidth="0.3" />

      {/* Connection lines center → nodes */}
      {placed.map((node) => (
        <line
          key={`line-${node.label}`}
          x1={cx}
          y1={cy}
          x2={node.x}
          y2={node.y}
          stroke="rgba(201,169,106,0.1)"
          strokeWidth="0.4"
        />
      ))}

      {/* Inter-node faint lines (inner ring) */}
      {placed.filter((n) => n.isInner).map((node, i, arr) => {
        const next = arr[(i + 1) % arr.length];
        return (
          <line
            key={`inter-${node.label}`}
            x1={node.x}
            y1={node.y}
            x2={next.x}
            y2={next.y}
            stroke="rgba(201,169,106,0.04)"
            strokeWidth="0.3"
          />
        );
      })}

      {/* Center node */}
      <g className="animate-twinkle-slow">
        <circle cx={cx} cy={cy} r={4} fill="rgba(235,228,212,0.95)" />
        <line x1={cx - 14} y1={cy} x2={cx + 14} y2={cy} stroke="rgba(201,169,106,0.18)" strokeWidth="0.3" />
        <line x1={cx} y1={cy - 14} x2={cx} y2={cy + 14} stroke="rgba(201,169,106,0.18)" strokeWidth="0.3" />
        <text
          x={cx}
          y={cy + 30}
          textAnchor="middle"
          className="fill-parchment-100 font-tamil"
          fontSize="22"
          fontWeight={500}
        >
          {center}
        </text>
      </g>

      {/* Satellite nodes */}
      {placed.map((node) => {
        const r = node.isInner ? 2.5 : 1.8;
        const opacity = node.isInner ? 0.75 : 0.5;
        return (
          <g key={node.label} className="animate-twinkle">
            <circle cx={node.x} cy={node.y} r={r} fill="rgba(235,228,212,0.85)" opacity={opacity} />
            <text
              x={node.x}
              y={node.y + 16}
              textAnchor="middle"
              className="fill-parchment-100 font-tamil"
              fontSize={node.isInner ? 13 : 11}
              opacity={opacity}
            >
              {node.label}
            </text>
            {node.sub && (
              <text
                x={node.x}
                y={node.y + 29}
                textAnchor="middle"
                className="fill-parchment-300/30 font-mono"
                fontSize="6"
              >
                {node.sub}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
