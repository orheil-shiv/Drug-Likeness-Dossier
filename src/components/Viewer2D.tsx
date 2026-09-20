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

  const currentImageB64 = depictions[activeTab];
  const currentSvg =
    activeTab === 'skeletal'
      ? depictions.skeletal_svg
      : activeTab === 'wedge_dash'
      ? depictions.wedge_dash_svg
      : activeTab === 'murcko_scaffold'
      ? depictions.murcko_scaffold_svg
      : null;

  const downloadPng = () => {
    if (!currentImageB64) return;
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${currentImageB64}`;
    link.download = `${compoundName.replace(/\s+/g, '_')}_${activeTab}_2D.png`;
    link.click();
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
            {currentSvg ? (
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
                <p className="text-xs">No scaffold or representation available for this molecule.</p>
              </div>
            )}

            {/* Chiral badge indicator */}
            {activeTab === 'wedge_dash' && depictions.chiral_atoms_count !== undefined && (
              <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>
                  {depictions.chiral_atoms_count > 0
                    ? `${depictions.chiral_atoms_count} Chiral Stereocenter(s) Highlighted`
                    : 'Achiral (No stereocenters)'}
                </span>
              </div>
            )}

            {/* Bemis-Murcko badge */}
            {activeTab === 'murcko_scaffold' && depictions.scaffold_smiles && (
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
              {currentSvg ? (
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
