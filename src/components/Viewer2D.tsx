'use client';

import React, { useState } from 'react';
import { Download, Maximize2, X, Eye, Layers, Atom, GitBranch } from 'lucide-react';
import { Depictions } from '@/types/chem';

interface Viewer2DProps {
  depictions: Depictions;
  compoundName: string;
}

type TabType = 'skeletal' | 'wedge_dash' | 'explicit_atoms' | 'murcko_scaffold';

export const Viewer2D: React.FC<Viewer2DProps> = ({ depictions, compoundName }) => {
  const [activeTab, setActiveTab] = useState<TabType>('skeletal');
  const [isZoomed, setIsZoomed] = useState(false);

  const tabs: { id: TabType; label: string; icon: React.ReactNode; desc: string }[] = [
    {
      id: 'skeletal',
      label: 'Skeletal Formula',
      icon: <Layers className="w-3.5 h-3.5" />,
      desc: 'Standard line-angle chemical formula'
    },
    {
      id: 'wedge_dash',
      label: 'Stereochemical (Wedge/Dash)',
      icon: <Eye className="w-3.5 h-3.5" />,
      desc: 'Explicit stereochemistry with chiral centers highlighted'
    },
    {
      id: 'explicit_atoms',
      label: 'Explicit Atoms & Hs',
      icon: <Atom className="w-3.5 h-3.5" />,
      desc: 'All carbon atoms and implicit hydrogens explicitly drawn'
    },
    {
      id: 'murcko_scaffold',
      label: 'Bemis-Murcko Scaffold',
      icon: <GitBranch className="w-3.5 h-3.5" />,
      desc: 'Extracted core ring & linker topology'
    }
  ];

  const currentImageB64 = depictions[activeTab];

  const downloadImage = () => {
    if (!currentImageB64) return;
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${currentImageB64}`;
    link.download = `${compoundName}_${activeTab}_2D.png`;
    link.click();
  };

  return (
    <div className="rounded-xl glass-panel border border-slate-800 flex flex-col h-full shadow-lg overflow-hidden">
      {/* Top Header & Tabs */}
      <div className="p-3 border-b border-slate-800/80 bg-slate-900/60 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse" />
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              2D Molecular Depiction Engine
            </h4>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={downloadImage}
              disabled={!currentImageB64}
              title="Download 2D PNG"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors disabled:opacity-40"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setIsZoomed(true)}
              disabled={!currentImageB64}
              title="Expand view"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors disabled:opacity-40"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-1 bg-slate-950/60 p-1 rounded-lg border border-slate-800">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-2 py-1.5 rounded-md text-[11px] font-medium flex items-center justify-center gap-1.5 transition-all ${
                activeTab === tab.id
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {tab.icon}
              <span className="truncate">{tab.label.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main 2D Canvas Area */}
      <div className="flex-1 min-h-[300px] flex flex-col items-center justify-center p-4 relative bg-slate-950/40">
        {currentImageB64 ? (
          <div className="relative group flex flex-col items-center justify-center w-full h-full">
            <div className="p-3 rounded-2xl bg-white/95 shadow-xl border border-slate-300/50 max-w-[340px] max-h-[300px] flex items-center justify-center transition-transform duration-200 group-hover:scale-[1.02]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`data:image/png;base64,${currentImageB64}`}
                alt={`${compoundName} 2D depiction`}
                className="max-h-[260px] w-auto object-contain"
              />
            </div>
          </div>
        ) : (
          <div className="text-center p-6 text-slate-400 space-y-2">
            <GitBranch className="w-8 h-8 mx-auto text-slate-600" />
            <p className="text-xs font-medium text-slate-300">No Ring Scaffold Found</p>
            <p className="text-[11px] text-slate-500 max-w-xs">
              This molecule is acyclic and does not contain cyclic ring assemblies for Bemis-Murcko framework extraction.
            </p>
          </div>
        )}

        {/* Tab Description Footnote */}
        <div className="w-full text-center mt-3 pt-2 border-t border-slate-800/60">
          <p className="text-[11px] text-slate-400">
            {tabs.find((t) => t.id === activeTab)?.desc}
            {activeTab === 'wedge_dash' && depictions.chiral_atoms_count !== undefined && (
              <span className="ml-1 text-rose-400 font-semibold">
                ({depictions.chiral_atoms_count} chiral centers highlighted)
              </span>
            )}
            {activeTab === 'murcko_scaffold' && depictions.has_scaffold && (
              <span className="block text-[10px] font-mono text-teal-400 truncate mt-0.5">
                Scaffold: {depictions.scaffold_smiles}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Zoom Modal */}
      {isZoomed && currentImageB64 && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-2xl w-full flex flex-col items-center gap-4 relative shadow-2xl">
            <button
              type="button"
              onClick={() => setIsZoomed(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <span>{compoundName}</span>
              <span className="text-slate-400 font-normal">({tabs.find((t) => t.id === activeTab)?.label})</span>
            </h3>
            <div className="bg-white p-6 rounded-xl shadow-inner max-h-[70vh] overflow-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`data:image/png;base64,${currentImageB64}`}
                alt={`${compoundName} 2D zoomed`}
                className="max-h-[500px] w-auto object-contain"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={downloadImage}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2"
              >
                <Download className="w-4 h-4" /> Download High-Res PNG
              </button>
              <button
                type="button"
                onClick={() => setIsZoomed(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
