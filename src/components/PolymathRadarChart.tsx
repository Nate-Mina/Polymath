import React, { useState } from 'react';
import { DisciplineMeta } from '../types/polymath';
import { DISCIPLINES } from '../data/disciplines';

interface RadarItem {
  discipline: DisciplineMeta;
  score: number; // 0 to 100
  correct: number;
  total: number;
  easyCorrect: number;
  medCorrect: number;
  hardCorrect: number;
}

interface PolymathRadarChartProps {
  domainScores: Record<
    string,
    {
      discipline: DisciplineMeta;
      correct: number;
      total: number;
      percentage: number;
      easyCorrect: number;
      medCorrect: number;
      hardCorrect: number;
    }
  >;
  size?: number;
}

export const PolymathRadarChart: React.FC<PolymathRadarChartProps> = ({
  domainScores,
  size = 560,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Maintain canonical order of all 20 disciplines
  const items: RadarItem[] = DISCIPLINES.map((d) => {
    const recorded = domainScores[d.id];
    return {
      discipline: d,
      score: recorded ? recorded.percentage : 0,
      correct: recorded ? recorded.correct : 0,
      total: recorded ? recorded.total : 0,
      easyCorrect: recorded ? recorded.easyCorrect : 0,
      medCorrect: recorded ? recorded.medCorrect : 0,
      hardCorrect: recorded ? recorded.hardCorrect : 0,
    };
  });

  const totalAxes = items.length; // 20 axes
  const center = size / 2;
  const radius = (size / 2) - 68; // Leave margin for labels

  // Helper to calculate (x, y) on a given radius at angle index
  const getCoordinates = (index: number, valRadius: number) => {
    const angle = (Math.PI * 2 * index) / totalAxes - Math.PI / 2;
    const x = center + valRadius * Math.cos(angle);
    const y = center + valRadius * Math.sin(angle);
    return { x, y, angle };
  };

  // Concentric levels (25%, 50%, 75%, 100%)
  const gridLevels = [0.25, 0.5, 0.75, 1.0];

  // Polygon points for user score
  const scorePoints = items
    .map((item, i) => {
      const valRadius = (Math.max(item.score, 4) / 100) * radius;
      const { x, y } = getCoordinates(i, valRadius);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const hoveredItem = hoveredIndex !== null ? items[hoveredIndex] : null;

  return (
    <div className="relative flex flex-col items-center justify-center p-4 bg-slate-900 border border-slate-800 rounded-2xl text-slate-100 shadow-xl overflow-hidden">
      <div className="w-full flex items-center justify-between pb-3 border-b border-slate-800 mb-2">
        <div>
          <h3 className="text-sm font-semibold tracking-wide text-slate-200 uppercase font-mono">
            20-Axis Trans-Disciplinary Radar
          </h3>
          <p className="text-xs text-slate-400">
            Interactive visual footprint across 15 technical &amp; 5 non-technical disciplines
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          <span className="flex items-center gap-1.5 text-cyan-400">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
            Technical (15)
          </span>
          <span className="flex items-center gap-1.5 text-amber-400">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            Humanities (5)
          </span>
        </div>
      </div>

      <div className="relative w-full max-w-[560px] aspect-square flex items-center justify-center">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="w-full h-full select-none"
        >
          <defs>
            <radialGradient id="radarFillGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.45" />
              <stop offset="70%" stopColor="#2563eb" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#1e1b4b" stopOpacity="0.05" />
            </radialGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Concentric grid polygons */}
          {gridLevels.map((lvl) => {
            const pts = Array.from({ length: totalAxes })
              .map((_, i) => {
                const { x, y } = getCoordinates(i, radius * lvl);
                return `${x.toFixed(1)},${y.toFixed(1)}`;
              })
              .join(' ');
            return (
              <g key={lvl}>
                <polygon
                  points={pts}
                  fill="none"
                  stroke={lvl === 1.0 ? '#334155' : '#1e293b'}
                  strokeWidth={lvl === 1.0 ? '1.5' : '1'}
                  strokeDasharray={lvl === 1.0 ? undefined : '3 3'}
                />
                <text
                  x={center + 6}
                  y={center - radius * lvl + 12}
                  fill="#64748b"
                  fontSize="9"
                  fontFamily="monospace"
                  className="pointer-events-none select-none"
                >
                  {Math.round(lvl * 100)}%
                </text>
              </g>
            );
          })}

          {/* Radial Axis Lines and Labels */}
          {items.map((item, i) => {
            const { x: axX, y: axY } = getCoordinates(i, radius);
            const { x: lblX, y: lblY, angle } = getCoordinates(i, radius + 24);
            const isTechnical = item.discipline.type === 'technical';
            const isHovered = hoveredIndex === i;

            // Align text properly based on quadrant
            let textAnchor: 'start' | 'middle' | 'end' = 'middle';
            const cosAngle = Math.cos(angle);
            if (cosAngle > 0.3) textAnchor = 'start';
            else if (cosAngle < -0.3) textAnchor = 'end';

            return (
              <g
                key={item.discipline.id}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="cursor-pointer"
              >
                {/* Axis line */}
                <line
                  x1={center}
                  y1={center}
                  x2={axX}
                  y2={axY}
                  stroke={isHovered ? '#38bdf8' : '#1e293b'}
                  strokeWidth={isHovered ? '2' : '1'}
                  className="transition-colors duration-150"
                />

                {/* Outer label */}
                <text
                  x={lblX}
                  y={lblY + 3}
                  textAnchor={textAnchor}
                  fill={isHovered ? '#38bdf8' : isTechnical ? '#94a3b8' : '#fbbf24'}
                  fontSize={isHovered ? '11' : '9.5'}
                  fontWeight={isHovered ? '700' : isTechnical ? '500' : '600'}
                  className="transition-all duration-150 select-none"
                >
                  {item.discipline.shortName}
                </text>
              </g>
            );
          })}

          {/* Filled User Polygon */}
          <polygon
            points={scorePoints}
            fill="url(#radarFillGrad)"
            stroke="#06b6d4"
            strokeWidth="2.5"
            strokeLinejoin="round"
            filter="url(#glow)"
            className="transition-all duration-300"
          />

          {/* Vertex Nodes */}
          {items.map((item, i) => {
            const valRadius = (Math.max(item.score, 4) / 100) * radius;
            const { x, y } = getCoordinates(i, valRadius);
            const isTechnical = item.discipline.type === 'technical';
            const isHovered = hoveredIndex === i;

            return (
              <circle
                key={`dot-${item.discipline.id}`}
                cx={x}
                cy={y}
                r={isHovered ? 6 : item.score > 0 ? 3.5 : 2}
                fill={isHovered ? '#ffffff' : isTechnical ? '#06b6d4' : '#f59e0b'}
                stroke="#0f172a"
                strokeWidth={isHovered ? '2.5' : '1.5'}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="cursor-pointer transition-transform duration-150"
              />
            );
          })}

          {/* Central Origin */}
          <circle cx={center} cy={center} r="3" fill="#475569" />
        </svg>

        {/* Hover Floating HUD Tooltip */}
        {hoveredItem && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-slate-950/95 backdrop-blur-md border border-cyan-500/50 shadow-2xl rounded-xl p-3 w-72 pointer-events-none z-20 text-xs">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
              <span className="font-semibold text-white">{hoveredItem.discipline.name}</span>
              <span
                className={`font-mono text-[10px] uppercase px-1.5 py-0.5 rounded ${
                  hoveredItem.discipline.type === 'technical'
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                    : 'bg-amber-950 text-amber-300 border border-amber-800'
                }`}
              >
                {hoveredItem.discipline.type}
              </span>
            </div>

            <div className="mt-2 grid grid-cols-2 gap-2 font-mono">
              <div>
                <span className="text-slate-400 text-[10px] block">MASTERY</span>
                {hoveredItem.total === 0 ? (
                  <span className="text-xs font-semibold text-slate-500">Not Tested</span>
                ) : (
                  <>
                    <span className="text-base font-bold text-cyan-400">
                      {hoveredItem.score}%
                    </span>
                    <span className="text-slate-500 text-[11px] ml-1">
                      ({hoveredItem.correct}/{hoveredItem.total})
                    </span>
                  </>
                )}
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">TIER ACCURACY</span>
                {hoveredItem.total === 0 ? (
                  <span className="text-[11px] text-slate-500">Excluded from sprint</span>
                ) : (
                  <div className="text-[11px] text-slate-300">
                    <span>Easy: {hoveredItem.easyCorrect}</span> · <span>Med: {hoveredItem.medCorrect}</span>{hoveredItem.hardCorrect !== undefined ? ` · Hard: ${hoveredItem.hardCorrect}` : ''}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="w-full pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 font-mono">
        <span>Hover any vertex or label to inspect domain depth</span>
        <span>Center: 0% · Perimeter: 100%</span>
      </div>
    </div>
  );
};
