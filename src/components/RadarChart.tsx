'use client';

import React, { useRef } from 'react';
import { Download, Radar, CheckCircle2, AlertTriangle } from 'lucide-react';
import { PropertiesData } from '@/types/chem';

interface RadarChartProps {
  radarB64?: string;
  compoundName: string;
  properties?: PropertiesData;
}

export const RadarChart: React.FC<RadarChartProps> = ({
  radarB64,
  compoundName,
  properties,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  // Extract canonical oral bioavailability metrics (Lipinski & Veber)
  const mw = properties?.lipinski?.mw?.value ?? 180.16;
  const logp = properties?.lipinski?.logp?.value ?? 1.31;
  const hbd = properties?.lipinski?.hbd?.value ?? 1;
  const hba = properties?.lipinski?.hba?.value ?? 4;
  const rotb = properties?.veber?.rotb?.value ?? 3;
  const tpsa = properties?.veber?.tpsa?.value ?? 63.6;

  // Limits
  const axes = [
    { key: 'mw', label: 'MW', val: mw, limit: 500, unit: 'g/mol' },
    { key: 'logp', label: 'LogP', val: logp, limit: 5.0, unit: '' },
    { key: 'hbd', label: 'HBD', val: hbd, limit: 5, unit: '' },
    { key: 'hba', label: 'HBA', val: hba, limit: 10, unit: '' },
    { key: 'rotb', label: 'RotB', val: rotb, limit: 10, unit: '' },
    { key: 'tpsa', label: 'TPSA', val: tpsa, limit: 140, unit: 'Å²' },
  ];

  // SVG Geometry parameters
  const cx = 150;
  const cy = 125;
  const maxR = 75;
  const numAxes = axes.length;

  const getCoordinates = (index: number, ratio: number) => {
    const angle = index * ((2 * Math.PI) / numAxes) - Math.PI / 2;
    const clampedRatio = Math.min(Math.max(ratio, 0.08), 1.5);
    const r = clampedRatio * maxR;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
      angle,
    };
  };

  // Concentric grid polygons (0.25, 0.5, 0.75, 1.0)
  const gridLevels = [0.25, 0.5, 0.75, 1.0];
  const gridPolygons = gridLevels.map((lvl) => {
    const pts = axes.map((_, i) => {
      const { x, y } = getCoordinates(i, lvl);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });
    return pts.join(' ');
  });

  // Molecule candidate polygon
  const candidatePoints = axes
    .map((axis, i) => {
      const ratio = axis.val / axis.limit;
      const { x, y } = getCoordinates(i, ratio);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const downloadChart = () => {
    if (radarB64) {
      const link = document.createElement('a');
      link.href = `data:image/png;base64,${radarB64}`;
      link.download = `${compoundName.replace(/\s+/g, '_')}_Lipinski_Radar.png`;
      link.click();
      return;
    }

    if (svgRef.current) {
      const svgXml = new XMLSerializer().serializeToString(svgRef.current);
      const svgBlob = new Blob([svgXml], { type: 'image/svg+xml;charset=utf-8' });
      const blobURL = URL.createObjectURL(svgBlob);
      const link = document.createElement('a');
      link.href = blobURL;
      link.download = `${compoundName.replace(/\s+/g, '_')}_Bioavailability_Radar.svg`;
      link.click();
      URL.revokeObjectURL(blobURL);
    }
  };

  const allPassed = axes.every((a) => a.val <= a.limit);

  return (
    <div className="rounded-xl glass-panel flex flex-col h-full shadow-2xs overflow-hidden border border-slate-200 dark:border-slate-800">
      {/* Header */}
      <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Radar className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            Oral Bioavailability Radar
          </h4>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
              allPassed
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
            }`}
          >
            {allPassed ? (
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-3 h-3 text-amber-600" />
            )}
            <span>{allPassed ? 'In Boundary' : 'Alert'}</span>
          </span>

          <button
            type="button"
            onClick={downloadChart}
            title="Download Radar Chart (SVG/PNG)"
            className="p-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Dynamic Vector SVG Spider Radar */}
      <div className="flex-1 flex flex-col items-center justify-center p-3 bg-white dark:bg-slate-950/40">
        <div className="w-full max-w-[300px] flex items-center justify-center">
          <svg
            ref={svgRef}
            viewBox="0 0 300 250"
            className="w-full h-auto max-h-[250px] overflow-visible"
          >
            {/* Background concentric grid levels */}
            {gridPolygons.map((pts, idx) => (
              <polygon
                key={`grid-${idx}`}
                points={pts}
                fill={idx === 3 ? '#f8fafc' : 'none'}
                fillOpacity={0.5}
                stroke={idx === 3 ? '#ef4444' : '#e2e8f0'}
                strokeDasharray={idx === 3 ? '3 3' : 'none'}
                strokeWidth={idx === 3 ? 1.5 : 1}
                className="dark:stroke-slate-800 dark:fill-slate-900/30"
              />
            ))}

            {/* Axis Rays */}
            {axes.map((_, i) => {
              const { x, y } = getCoordinates(i, 1.25);
              return (
                <line
                  key={`ray-${i}`}
                  x1={cx}
                  y1={cy}
                  x2={x}
                  y2={y}
                  stroke="#cbd5e1"
                  strokeWidth="1"
                  className="dark:stroke-slate-800"
                />
              );
            })}

            {/* Candidate Molecule Filled Polygon */}
            <polygon
              points={candidatePoints}
              fill="#0d9488"
              fillOpacity={0.28}
              stroke="#0d9488"
              strokeWidth="2.2"
              strokeLinejoin="round"
            />

            {/* Vertices & Badges */}
            {axes.map((axis, i) => {
              const ratio = axis.val / axis.limit;
              const { x, y } = getCoordinates(i, ratio);
              const isViolated = axis.val > axis.limit;
              const labelPos = getCoordinates(i, 1.38);

              return (
                <g key={`vertex-${axis.key}`}>
                  {/* Vertex dot */}
                  <circle
                    cx={x}
                    cy={y}
                    r={3.5}
                    fill={isViolated ? '#ef4444' : '#0d9488'}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />

                  {/* Outer Axis Label */}
                  <text
                    x={labelPos.x}
                    y={labelPos.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="text-[10px] font-sans font-bold fill-slate-700 dark:fill-slate-300 pointer-events-none"
                  >
                    {axis.label}
                  </text>
                  <text
                    x={labelPos.x}
                    y={labelPos.y + 11}
                    textAnchor="middle"
                    dominantBaseline="central"
                    className={`text-[9px] font-mono font-medium pointer-events-none ${
                      isViolated
                        ? 'fill-red-600 dark:fill-red-400 font-bold'
                        : 'fill-slate-400 dark:fill-slate-500'
                    }`}
                  >
                    {axis.val}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Legend Footnote */}
        <div className="w-full mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/70 text-[10px] text-slate-500 dark:text-slate-400 space-y-1">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 border-t-2 border-dashed border-red-500" />
              <span>Boundary Limit (1.0x)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-teal-500/30 border border-teal-500" />
              <span>Target Profile ({compoundName.slice(0, 14)})</span>
            </span>
          </div>
          <p className="text-[9px] text-slate-400 text-center">
            Normalized scale: Points enclosed inside the red boundary conform to Lipinski/Veber criteria.
          </p>
        </div>
      </div>
    </div>
  );
};
