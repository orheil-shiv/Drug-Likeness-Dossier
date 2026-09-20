'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  RotateCw,
  RotateCcw,
  Camera,
  Eye,
  EyeOff,
  Sparkles,
  Sliders,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { Conformer3D } from '@/types/chem';

interface Viewer3DProps {
  conformer: Conformer3D;
  compoundName: string;
}

type ModelMode = 'wireframe' | 'stick' | 'ball_stick' | 'sphere';
type SurfaceType = 'none' | 'vdw' | 'sas' | 'ses' | 'esp';

declare global {
  interface Window {
    $3Dmol?: any;
  }
}

export const Viewer3D: React.FC<Viewer3DProps> = ({ conformer, compoundName }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerInstanceRef = useRef<any>(null);

  const [modelMode, setModelMode] = useState<ModelMode>('ball_stick');
  const [surfaceType, setSurfaceType] = useState<SurfaceType>('none');
  const [surfaceOpacity, setSurfaceOpacity] = useState<number>(0.75);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [showHydrogens, setShowHydrogens] = useState<boolean>(true);
  const [isViewerReady, setIsViewerReady] = useState<boolean>(false);

  // Apply representation styles and surface overlays to the 3Dmol viewer
  const updateViewerDisplay = useCallback(() => {
    const viewer = viewerInstanceRef.current;
    if (!viewer) return;

    // Clear previous surfaces & styles
    viewer.removeAllSurfaces();
    viewer.removeAllShapes();

    // Hydrogen filter
    const atomFilter = showHydrogens ? {} : { elem: ['C', 'N', 'O', 'S', 'P', 'F', 'Cl', 'Br', 'I', 'B', 'Si', 'Fe', 'Zn'] };

    // 1. Apply Model representation mode
    switch (modelMode) {
      case 'wireframe':
        viewer.setStyle({}, { line: { hidden: true } });
        viewer.setStyle(atomFilter, { line: { colorscheme: 'element' } });
        break;
      case 'stick':
        viewer.setStyle({}, { stick: { hidden: true } });
        viewer.setStyle(atomFilter, { stick: { colorscheme: 'element', radius: 0.22 } });
        break;
      case 'sphere':
        viewer.setStyle({}, { sphere: { hidden: true } });
        viewer.setStyle(atomFilter, { sphere: { colorscheme: 'element' } });
        break;
      case 'ball_stick':
      default:
        viewer.setStyle({}, { stick: { hidden: true }, sphere: { hidden: true } });
        viewer.setStyle(atomFilter, {
          stick: { colorscheme: 'element', radius: 0.16 },
          sphere: { colorscheme: 'element', scale: 0.28 }
        });
        break;
    }

    // Hide explicit hydrogens if toggled off
    if (!showHydrogens) {
      viewer.setStyle({ elem: 'H' }, { hidden: true });
    }

    // 2. Apply Surface Overlays
    const $3Dmol = window.$3Dmol;
    if ($3Dmol && surfaceType !== 'none') {
      try {
        if (surfaceType === 'vdw') {
          viewer.addSurface($3Dmol.SurfaceType.VDW, {
            opacity: surfaceOpacity,
            color: 'white'
          });
        } else if (surfaceType === 'sas') {
          viewer.addSurface($3Dmol.SurfaceType.SAS, {
            opacity: surfaceOpacity,
            color: '#38bdf8'
          });
        } else if (surfaceType === 'ses') {
          viewer.addSurface($3Dmol.SurfaceType.SES, {
            opacity: surfaceOpacity,
            color: '#fb923c'
          });
        } else if (surfaceType === 'esp') {
          // Electrostatic Potential surface mapped with Gasteiger charges
          // Map partial charges onto atom properties
          const model = viewer.getModel();
          if (model) {
            const atoms = model.selectedAtoms({});
            const charges = conformer.partial_charges || [];
            atoms.forEach((atom: any, idx: number) => {
              atom.partialCharge = charges[idx] !== undefined ? charges[idx] : 0.0;
            });
            viewer.addSurface($3Dmol.SurfaceType.VDW, {
              opacity: surfaceOpacity,
              colorscheme: {
                prop: 'partialCharge',
                gradient: 'rwb', // Red (-ve) -> White (neutral) -> Blue (+ve)
                min: -0.4,
                max: 0.4
              }
            });
          }
        }
      } catch (err) {
        console.error('Failed to generate surface:', err);
      }
    }

    viewer.render();
  }, [modelMode, surfaceType, surfaceOpacity, showHydrogens, conformer.partial_charges]);

  // Initialize or re-init 3Dmol viewer when conformer changes
  useEffect(() => {
    let checkInterval: NodeJS.Timeout;

    const initViewer = () => {
      if (typeof window === 'undefined' || !window.$3Dmol || !containerRef.current) return;

      const $3Dmol = window.$3Dmol;
      containerRef.current.innerHTML = '';

      const viewer = $3Dmol.createViewer(containerRef.current, {
        backgroundColor: '#0b0f19'
      });
      viewerInstanceRef.current = viewer;

      // Load MolBlock SDF
      if (conformer.molblock) {
        viewer.addModel(conformer.molblock, 'sdf');
        viewer.zoomTo();
        viewer.render();
      }

      setIsViewerReady(true);
      updateViewerDisplay();
    };

    if (window.$3Dmol) {
      initViewer();
    } else {
      // Poll briefly if 3Dmol script is still loading asynchronously
      checkInterval = setInterval(() => {
        if (window.$3Dmol) {
          clearInterval(checkInterval);
          initViewer();
        }
      }, 100);
    }

    return () => {
      if (checkInterval) clearInterval(checkInterval);
    };
  }, [conformer.molblock]);

  // Update styles when controls change
  useEffect(() => {
    if (isViewerReady) {
      updateViewerDisplay();
    }
  }, [isViewerReady, updateViewerDisplay]);

  // Handle spin toggle
  const toggleSpin = () => {
    const viewer = viewerInstanceRef.current;
    if (!viewer) return;
    if (isSpinning) {
      viewer.spin(false);
      setIsSpinning(false);
    } else {
      viewer.spin('y', 1.0);
      setIsSpinning(true);
    }
  };

  // Reset view
  const resetCamera = () => {
    const viewer = viewerInstanceRef.current;
    if (!viewer) return;
    viewer.zoomTo();
    viewer.render();
  };

  // Capture Snapshot
  const captureSnapshot = () => {
    const viewer = viewerInstanceRef.current;
    if (!viewer) return;
    try {
      const uri = viewer.pngURI();
      const link = document.createElement('a');
      link.href = uri;
      link.download = `${compoundName}_3D_${modelMode}.png`;
      link.click();
    } catch (e) {
      console.error('Snapshot error:', e);
    }
  };

  return (
    <div className="rounded-xl glass-panel border border-slate-800 flex flex-col h-full shadow-lg overflow-hidden">
      {/* Top Header & Optimization Info */}
      <div className="p-3 border-b border-slate-800/80 bg-slate-900/60 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            3D Interactive Conformer (WebGL)
          </h4>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-mono border font-medium ${
              conformer.is_3d
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
            }`}
          >
            {conformer.optimization_method}
          </span>
          <span className="text-[10px] text-slate-400">
            {conformer.num_atoms} Atoms
          </span>
        </div>
      </div>

      {/* Control Bar */}
      <div className="p-2.5 bg-slate-950/70 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Model Mode Dropdown */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 text-[11px] font-medium">Model:</span>
          <select
            value={modelMode}
            onChange={(e) => setModelMode(e.target.value as ModelMode)}
            className="bg-slate-900 border border-slate-700/80 rounded-lg px-2 py-1 text-slate-200 text-xs focus:ring-1 focus:ring-teal-500 focus:outline-none"
          >
            <option value="wireframe">Wireframe / Line</option>
            <option value="stick">Stick / Licorice</option>
            <option value="ball_stick">Ball-and-Stick</option>
            <option value="sphere">Space-Filling / CPK</option>
          </select>
        </div>

        {/* Surface Overlay Dropdown */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 text-[11px] font-medium">Surface:</span>
          <select
            value={surfaceType}
            onChange={(e) => setSurfaceType(e.target.value as SurfaceType)}
            className="bg-slate-900 border border-slate-700/80 rounded-lg px-2 py-1 text-slate-200 text-xs focus:ring-1 focus:ring-teal-500 focus:outline-none"
          >
            <option value="none">None (Atoms Only)</option>
            <option value="vdw">Van der Waals (VDW)</option>
            <option value="sas">Solvent Accessible (SAS)</option>
            <option value="ses">Solvent Excluded (SES / Connolly)</option>
            <option value="esp">Electrostatic Potential (ESP Map)</option>
          </select>
        </div>

        {/* Surface Opacity Slider (visible if surface selected) */}
        {surfaceType !== 'none' && (
          <div className="flex items-center gap-1.5 bg-slate-900/80 px-2 py-0.5 rounded-lg border border-slate-800">
            <Sliders className="w-3 h-3 text-slate-400" />
            <span className="text-[10px] text-slate-400">Opacity:</span>
            <input
              type="range"
              min="0.2"
              max="1.0"
              step="0.05"
              value={surfaceOpacity}
              onChange={(e) => setSurfaceOpacity(parseFloat(e.target.value))}
              className="w-16 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-400"
            />
          </div>
        )}

        {/* Camera and Tool Buttons */}
        <div className="flex items-center gap-1 ml-auto">
          {/* Toggle Hydrogens */}
          <button
            type="button"
            onClick={() => setShowHydrogens(!showHydrogens)}
            title={showHydrogens ? 'Hide explicit hydrogens' : 'Show explicit hydrogens'}
            className={`p-1.5 rounded-lg border transition-colors ${
              showHydrogens
                ? 'bg-slate-800 text-slate-200 border-slate-700'
                : 'bg-teal-500/20 text-teal-300 border-teal-500/40'
            }`}
          >
            {showHydrogens ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>

          {/* Auto-Spin Toggle */}
          <button
            type="button"
            onClick={toggleSpin}
            title={isSpinning ? 'Pause Auto-Spin' : 'Start Auto-Spin'}
            className={`p-1.5 rounded-lg border transition-colors ${
              isSpinning
                ? 'bg-teal-500/20 text-teal-300 border-teal-500/40 animate-spin-slow'
                : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          {/* Reset Camera */}
          <button
            type="button"
            onClick={resetCamera}
            title="Reset Camera View"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Snapshot Button */}
          <button
            type="button"
            onClick={captureSnapshot}
            title="Download 3D Snapshot PNG"
            className="p-1.5 rounded-lg bg-emerald-600/80 hover:bg-emerald-600 text-white border border-emerald-500 transition-colors"
          >
            <Camera className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Warning Alert if 3D failed */}
      {conformer.warning && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-3 py-1.5 text-[11px] text-amber-300 flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{conformer.warning}</span>
        </div>
      )}

      {/* 3D WebGL Canvas */}
      <div className="relative flex-1 min-h-[350px] w-full bg-[#0b0f19]">
        <div ref={containerRef} className="w-full h-full min-h-[350px]" />

        {/* ESP Gradient Legend (when ESP surface is active) */}
        {surfaceType === 'esp' && (
          <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-lg p-2 text-[10px] text-slate-300 flex flex-col gap-1 shadow-lg">
            <span className="font-semibold text-slate-200">Gasteiger ESP Map</span>
            <div className="w-32 h-2.5 rounded bg-gradient-to-r from-red-600 via-white to-blue-600 border border-slate-700" />
            <div className="flex justify-between text-[9px] text-slate-400 font-mono">
              <span>-0.4 e (Electronegative)</span>
              <span>+0.4 e (Electropositive)</span>
            </div>
          </div>
        )}

        {/* Interactive Interaction Tips */}
        <div className="absolute top-2 left-2 pointer-events-none opacity-40 hover:opacity-100 transition-opacity bg-slate-900/70 rounded px-2 py-1 text-[9px] text-slate-400 font-mono">
          Left Drag: Rotate | Right Drag: Pan | Scroll: Zoom
        </div>
      </div>
    </div>
  );
};
