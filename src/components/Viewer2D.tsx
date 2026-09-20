'use client';

import React, { useState } from 'react';
import {
  Download,
  Maximize2,
  X,
  Eye,
  Layers,
  Atom,
  GitBranch,
  PenTool,
  Sparkles,
  FileCode2
} from 'lucide-react';
import { Depictions } from '@/types/chem';
import { MoleculeSketcher } from './MoleculeSketcher';

interface Viewer2DProps {
  depictions: Depictions;
  compoundName: string;
  currentSmiles?: string;
  onAnalyzeSketch: (smiles: string) => void;
}

type MainViewMode = 'depiction' | 'sketcher';
type TabType = 'skeletal' | 'wedge_dash' | 'explicit_atoms' | 'murcko_scaffold';

export const Viewer2D: React.FC<Viewer2DProps> = ({
  depictions,
  compoundName,
  currentSmiles = '',
  onAnalyzeSketch,
}) => {
  const [mainMode, setMainMode] = useState<MainViewMode>('depiction');
  const [activeTab, setActiveTab] = useState<TabType>('skeletal');
  const [isZoomed, setIsZoomed] = useState(false);

  const tabs: { id: TabType; label: string; icon: React.ReactNode; desc: string }[] = [
    {
      id: 'skeletal',
      label: 'Skeletal',
      icon: <Layers className="w-3.5 h-3.5" />,
      desc: 'Standard line-angle formula',
    },
    {
      id: 'wedge_dash',
      label: 'Stereo (Chiral)',
      icon: <Eye className="w-3.5 h-3.5" />,
      desc: 'Stereochemical wedges/dashes with chiral centers',
    },
    {
      id: 'explicit_atoms',
      label: 'Explicit Hs',
      icon: <Atom className="w-3.5 h-3.5" />,
      desc: 'All carbons and explicit hydrogens drawn',
    },
    {
      id: 'murcko_scaffold',
      label: 'Murcko Scaffold',
      icon: <GitBranch className="w-3.5 h-3.5" />,
      desc: 'Extracted core molecular ring topology',
    },
  ];

  // Resilient resolution: maps every tab to its SVG with intelligent fallback to skeletal SVG
  const currentSvg =
    activeTab === 'skeletal'
      ? (depictions.skeletal_svg || null)
      : activeTab === 'wedge_dash'
      ? (depictions.wedge_dash_svg || depictions.skeletal_svg || null)
      : activeTab === 'explicit_atoms'
      ? (depictions.explicit_atoms_svg || depictions.skeletal_svg || null)
      : activeTab === 'murcko_scaffold'
      ? (depictions.murcko_scaffold_svg || (depictions.has_scaffold ? depictions.skeletal_svg : null))
      : (depictions.skeletal_svg || null);

  const currentImageB64 = depictions[activeTab] || depictions.skeletal || '';

  const downloadPng = () => {
    if (currentImageB64) {
      const link = document.createElement('a');
      link.href = `data:image/png;base64,${currentImageB64}`;
      link.download = `${compoundName.replace(/\s+/g, '_')}_${activeTab}_2D.png`;
      link.click();
      return;
    }
    if (currentSvg) {
      const svgBlob = new Blob([currentSvg], { type: 'image/svg+xml;charset=utf-8' });
      const blobURL = URL.createObjectURL(svgBlob);
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 900;
        canvas.height = 800;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const pngUrl = canvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.href = pngUrl;
          link.download = `${compoundName.replace(/\s+/g, '_')}_${activeTab}_2D.png`;
          link.click();
        }
        URL.revokeObjectURL(blobURL);
      };
      img.src = blobURL;
    }
  };

  const downloadSvg = () => {
    if (!currentSvg) return;
    const blob = new Blob([currentSvg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${compoundName.replace(/\s+/g, '_')}_${activeTab}.svg`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-xl glass-panel flex flex-col h-full shadow-sm overflow-hidden border border-slate-200 dark:border-slate-800">
      {/* Top Header Mode Switcher (Depiction vs Sketcher) */}
      <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500 led-active" />
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              2D Structure Station
            </h4>
          </div>

          {/* Mode Switcher Buttons */}
          <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setMainMode('depiction')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                mainMode === 'depiction'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <FileCode2 className="w-3.5 h-3.5" />
              <span>RDKit 2D</span>
            </button>
            <button
              type="button"
              onClick={() => setMainMode('sketcher')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
                mainMode === 'sketcher'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>Sketcher</span>
            </button>
          </div>
        </div>

        {/* Sub-Tabs if Depiction mode is active */}
        {mainMode === 'depiction' && (
          <div className="flex items-center justify-between gap-2">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 flex-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  title={tab.desc}
                  className={`px-2 py-1 rounded-md text-[11px] font-medium flex items-center justify-center gap-1 transition-all ${
                    activeTab === tab.id
                      ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 shadow-2xs font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {tab.icon}
                  <span className="truncate">{tab.label}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1">
              {currentSvg && (
                <button
                  type="button"
                  onClick={downloadSvg}
                  title="Download Vector SVG"
                  className="p-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold transition-colors"
                >
                  SVG
                </button>
              )}
              <button
                type="button"
                onClick={downloadPng}
                disabled={!currentImageB64}
                title="Download 2D PNG"
                className="p-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors disabled:opacity-40"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsZoomed(true)}
                disabled={!currentImageB64 && !currentSvg}
                title="Expand 2D View"
                className="p-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors disabled:opacity-40"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main View Body */}
      <div className="flex-1 min-h-[360px] relative bg-white dark:bg-slate-950/40 flex items-center justify-center p-4">
        {mainMode === 'sketcher' ? (
          <div className="w-full h-full">
            <MoleculeSketcher
              initialSmiles={currentSmiles}
              onAnalyze={(smi) => {
                onAnalyzeSketch(smi);
                setMainMode('depiction');
              }}
            />
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center relative">
            {activeTab === 'murcko_scaffold' && !depictions.has_scaffold ? (
              <div className="flex flex-col items-center justify-center p-6 text-center max-w-sm mx-auto space-y-3 animate-in fade-in">
                <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-xs">
                  <GitBranch className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h5 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Acyclic Compound (No Ring Scaffold)
                  </h5>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Bemis-Murcko scaffold extraction decomposes molecules into ring assemblies and linkers. Since this compound contains no cyclic rings, no Murcko framework is defined.
                  </p>
                </div>
                {depictions.skeletal_svg && (
                  <div className="mt-1 p-2 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 opacity-75 max-w-[200px]">
                    <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block mb-1">
                      Linear Molecule Structure
                    </span>
                    <div
                      className="w-full h-24 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full"
                      dangerouslySetInnerHTML={{ __html: depictions.skeletal_svg }}
                    />
                  </div>
                )}
              </div>
            ) : currentSvg ? (
              <div
                className="w-full h-full max-h-[340px] flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:max-h-[320px] transition-all"
                dangerouslySetInnerHTML={{ __html: currentSvg }}
              />
            ) : currentImageB64 ? (
              <img
                src={`data:image/png;base64,${currentImageB64}`}
                alt={`${compoundName} ${activeTab} 2D depiction`}
                className="max-h-[320px] w-auto object-contain drop-shadow-sm transition-all"
              />
            ) : (
              <div className="text-center p-6 text-slate-400">
                <p className="text-xs">No depiction available for this molecule.</p>
              </div>
            )}

            {/* Chiral badge indicator */}
            {activeTab === 'wedge_dash' && (
              <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>
                  {depictions.chiral_atoms_count && depictions.chiral_atoms_count > 0
                    ? `${depictions.chiral_atoms_count} Chiral Stereocenter(s) Highlighted (Emerald)`
                    : 'Achiral Molecule (No stereocenters / Symmetric)'}
                </span>
              </div>
            )}

            {/* Explicit Hs badge indicator */}
            {activeTab === 'explicit_atoms' && (
              <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-[10px] font-semibold text-teal-700 dark:text-teal-300 flex items-center gap-1.5 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                <span>Explicit Hydrogens & Terminal Methyls Included</span>
              </div>
            )}

            {/* Skeletal badge indicator */}
            {activeTab === 'skeletal' && (
              <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                <span>Standard Skeletal (Kekulé / Line-Angle)</span>
              </div>
            )}

            {/* Bemis-Murcko badge */}
            {activeTab === 'murcko_scaffold' && depictions.has_scaffold && depictions.scaffold_smiles && (
              <div className="absolute bottom-2 left-2 right-2 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] text-slate-600 dark:text-slate-300 font-mono truncate shadow-xs">
                Scaffold: {depictions.scaffold_smiles}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Zoom Modal */}
      {isZoomed && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative max-w-3xl w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {compoundName} — {tabs.find((t) => t.id === activeTab)?.label}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  High-Resolution 2D Molecular Vector Depiction (RDKit)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsZoomed(false)}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center justify-center p-4 min-h-[380px] bg-slate-50 dark:bg-slate-950/40 rounded-xl">
              {activeTab === 'murcko_scaffold' && !depictions.has_scaffold ? (
                <div className="flex flex-col items-center justify-center p-6 text-center max-w-sm mx-auto space-y-3">
                  <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-xs">
                    <GitBranch className="w-6 h-6" />
                  </div>
                  <h5 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Acyclic Compound (No Ring Scaffold)
                  </h5>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Bemis-Murcko scaffold extraction requires cyclic rings. This molecule has no rings, so no scaffold is defined.
                  </p>
                  {depictions.skeletal_svg && (
                    <div
                      className="w-48 h-32 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full opacity-70"
                      dangerouslySetInnerHTML={{ __html: depictions.skeletal_svg }}
                    />
                  )}
                </div>
              ) : currentSvg ? (
                <div
                  className="w-full max-h-[460px] flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:max-h-[440px]"
                  dangerouslySetInnerHTML={{ __html: currentSvg }}
                />
              ) : currentImageB64 ? (
                <img
                  src={`data:image/png;base64,${currentImageB64}`}
                  alt={`${compoundName} 2D zoomed`}
                  className="max-h-[440px] w-auto object-contain"
                />
              ) : null}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              {currentSvg && (
                <button
                  type="button"
                  onClick={downloadSvg}
                  className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download SVG</span>
                </button>
              )}
              <button
                type="button"
                onClick={downloadPng}
                className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PNG</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
