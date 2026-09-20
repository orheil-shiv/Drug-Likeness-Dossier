'use client';

import React, { useRef, useEffect } from 'react';
import { Binary, Sparkles, Hash, Layers } from 'lucide-react';
import { MorganFingerprintData } from '@/types/chem';

interface MorganFingerprintProps {
  morganFp: MorganFingerprintData;
  compoundName: string;
}

export const MorganFingerprint: React.FC<MorganFingerprintProps> = ({
  morganFp,
  compoundName,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { radius, n_bits, on_bits_count, bit_density, on_bits, matrix_preview } = morganFp;

  // Render a visual 32x32 grid matrix of the 1024 bits
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const isDark = document.documentElement.classList.contains('dark');
    const cols = 32;
    const rows = 32;
    const cellW = width / cols;
    const cellH = height / rows;

    const bitSet = new Set(on_bits);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const bitIndex = r * cols + c;
        const isOn = bitSet.has(bitIndex);

        if (isOn) {
          ctx.fillStyle = '#0d9488'; // Teal on-bit
        } else {
          ctx.fillStyle = isDark ? '#1e293b' : '#f1f5f9'; // Off-bit
        }

        ctx.fillRect(c * cellW + 0.5, r * cellH + 0.5, cellW - 1, cellH - 1);
      }
    }
  }, [on_bits]);

  return (
    <div className="rounded-xl glass-panel p-4 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3 flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-2.5">
        <div className="flex items-center gap-2">
          <Binary className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            Morgan Fingerprint (ECFP4)
          </h4>
        </div>
        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
          Radius {radius} • {n_bits} Bits
        </span>
      </div>

      {/* Bit Statistics Readout */}
      <div className="grid grid-cols-2 gap-2">
        <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/60">
          <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 block">
            Active Bits
          </span>
          <span className="text-base font-extrabold font-mono text-slate-900 dark:text-slate-100">
            {on_bits_count}{' '}
            <span className="text-[11px] font-normal text-slate-400">/ 1024</span>
          </span>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/60">
          <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 block">
            Bit Density
          </span>
          <span className="text-base font-extrabold font-mono text-teal-600 dark:text-teal-400">
            {(bit_density * 100).toFixed(2)}%
          </span>
        </div>
      </div>

      {/* 32x32 Bit Grid Visualizer */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[10px] text-slate-400">
          <span>1024-Bit Structural Matrix</span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-xs bg-teal-500" /> On
            <span className="w-2 h-2 rounded-xs bg-slate-200 dark:bg-slate-800 ml-1.5" /> Off
          </span>
        </div>
        <div className="p-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center">
          <canvas
            ref={canvasRef}
            width={192}
            height={192}
            className="w-full max-w-[180px] h-auto aspect-square rounded"
          />
        </div>
      </div>

      {/* Sample On-Bits List */}
      <div className="text-[10px] text-slate-500 dark:text-slate-400 space-y-1">
        <span className="font-semibold block">Sample Active Bit Indices:</span>
        <div className="p-1.5 rounded bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/60 font-mono text-[10px] truncate text-slate-600 dark:text-slate-300">
          {on_bits.slice(0, 10).join(', ')}
          {on_bits.length > 10 ? `... (+${on_bits.length - 10} more)` : ''}
        </div>
      </div>
    </div>
  );
};
