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
  HelpCircle,
  Maximize2,
  Box,
  Layers,
  Activity,
  Gauge
} from 'lucide-react';
import { Conformer3D } from '@/types/chem';

interface Viewer3DProps {
  conformer: Conformer3D;
  compoundName: string;
}

type ModelMode = 'ball_stick' | 'stick' | 'sphere' | 'cartoon' | 'wireframe';
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
  const [canvasBgDark, setCanvasBgDark] = useState<boolean>(false);
  const [showMinimized, setShowMinimized] = useState<boolean>(true);

  // Apply representation styles and surface overlays to the 3Dmol viewer
  const updateViewerDisplay = useCallback(() => {
    const viewer = viewerInstanceRef.current;
    if (!viewer) return;

    viewer.removeAllSurfaces();
    viewer.removeAllShapes();

    // Hydrogen filter
    const atomFilter = showHydrogens
      ? {}
      : { elem: ['C', 'N', 'O', 'S', 'P', 'F', 'Cl', 'Br', 'I', 'B', 'Si', 'Fe', 'Zn'] };

    // 1. Apply Model representation mode
    switch (modelMode) {
      case 'wireframe':
        viewer.setStyle({}, { line: { hidden: true } });
        viewer.setStyle(atomFilter, { line: { colorscheme: 'element', linewidth: 2.0 } });
        break;
      case 'stick':
        viewer.setStyle({}, { stick: { hidden: true } });
        viewer.setStyle(atomFilter, { stick: { colorscheme: 'element', radius: 0.22 } });
        break;
      case 'sphere':
        viewer.setStyle({}, { sphere: { hidden: true } });
        viewer.setStyle(atomFilter, { sphere: { colorscheme: 'element' } });
        break;
      case 'cartoon':
        viewer.setStyle({}, { cartoon: { color: 'spectrum' }, stick: { radius: 0.12 } });
        break;
      case 'ball_stick':
      default:
        viewer.setStyle({}, { stick: { hidden: true }, sphere: { hidden: true } });
        viewer.setStyle(atomFilter, {
          stick: { colorscheme: 'element', radius: 0.16 },
          sphere: { colorscheme: 'element', scale: 0.28 },
        });
        break;
    }

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
            color: 'white',
          });
        } else if (surfaceType === 'sas') {
          viewer.addSurface($3Dmol.SurfaceType.SAS, {
            opacity: surfaceOpacity,
            color: '#0ea5e9',
          });
        } else if (surfaceType === 'ses') {
          viewer.addSurface($3Dmol.SurfaceType.SES, {
            opacity: surfaceOpacity,
            color: '#14b8a6',
          });
        } else if (surfaceType === 'esp') {
          // Electrostatic potential mapping with Gasteiger partial charges
          const colorFunc = (atom: any) => {
            const charge = atom.properties?.charge || 0.0;
            if (charge < -0.15) return '#ef4444'; // Negative = red
            if (charge > 0.15) return '#3b82f6';  // Positive = blue
            return '#f1f5f9';                     // Neutral = light slate
          };
          viewer.addSurface($3Dmol.SurfaceType.VDW, {
            opacity: surfaceOpacity,
            colorscheme: { prop: 'charge', map: colorFunc },
          });
        }
      } catch (err) {
        console.warn('Surface generation warning:', err);
      }
    }

    viewer.render();
  }, [modelMode, surfaceType, surfaceOpacity, showHydrogens]);

  // Initialize or re-render 3Dmol viewer when conformer changes or minimization toggles
  useEffect(() => {
    let isCancelled = false;

    const checkAndInit = () => {
      if (typeof window === 'undefined' || !containerRef.current) return;
      const $3Dmol = window.$3Dmol;

      if (!$3Dmol) {
        setTimeout(checkAndInit, 150);
        return;
      }

      if (isCancelled) return;

      containerRef.current.innerHTML = '';

      const bgColor = canvasBgDark ? '#090d16' : '#f8fafc';
      const viewer = $3Dmol.createViewer(containerRef.current, {
        backgroundColor: bgColor,
        defaultcolors: $3Dmol.rasmolElementColors,
      });

      viewerInstanceRef.current = viewer;

      const activeMolblock =
        !showMinimized && conformer.unminimized_molblock
          ? conformer.unminimized_molblock
          : conformer.molblock;

      if (activeMolblock) {
        viewer.addModel(activeMolblock, 'mol');

        // Assign partial charges to atoms for ESP mapping
        if (conformer.atoms && conformer.atoms.length > 0) {
          const model = viewer.getModel();
          if (model) {
            const atoms = model.selectedAtoms({});
            conformer.atoms.forEach((ad, i) => {
              if (atoms[i]) {
                atoms[i].properties = { charge: ad.charge };
              }
            });
          }
        }

        viewer.zoomTo();
        setIsViewerReady(true);
        updateViewerDisplay();
      }
    };

    checkAndInit();

    return () => {
      isCancelled = true;
      if (viewerInstanceRef.current) {
        try {
          viewerInstanceRef.current.clear();
        } catch {
          // ignore cleanup errors
        }
      }
    };
  }, [conformer, showMinimized, canvasBgDark, updateViewerDisplay]);

  // Update display when mode, surface, or hydrogen toggles change
  useEffect(() => {
    if (isViewerReady) {
      updateViewerDisplay();
    }
  }, [isViewerReady, updateViewerDisplay]);

  // Handle spinning
  useEffect(() => {
    const viewer = viewerInstanceRef.current;
    if (!viewer) return;

    if (isSpinning) {
      viewer.spin('y', 0.8);
    } else {
      viewer.spin(false);
    }
  }, [isSpinning]);

  const handleResetView = () => {
    if (viewerInstanceRef.current) {
      viewerInstanceRef.current.zoomTo();
      viewerInstanceRef.current.render();
    }
  };

  const handleSnapshot = () => {
    const canvas = containerRef.current?.querySelector('canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `${compoundName.replace(/\s+/g, '_')}_3D_Structure.png`;
      link.click();
    }
  };

  return (
    <div className="rounded-xl glass-panel flex flex-col h-full shadow-sm overflow-hidden border border-slate-200 dark:border-slate-800">
      {/* 3D Header Toolbar */}
      <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500 led-online" />
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Box className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>3Dmol.js WebGL Conformation</span>
            </h4>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5">
            {/* Unminimized vs Minimized Conformer Toggle */}
            {conformer.unminimized_molblock && (
              <button
                type="button"
                onClick={() => setShowMinimized(!showMinimized)}
                title={showMinimized ? 'Viewing MMFF94 Minimized. Click for Raw ETKDG.' : 'Viewing Raw ETKDG. Click for Minimized.'}
                className={`px-2 py-1 rounded-lg text-[10px] font-semibold border flex items-center gap-1 transition-all ${
                  showMinimized
                    ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800'
                    : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                }`}
              >
                <Activity className="w-3 h-3" />
                <span>{showMinimized ? 'MMFF94 Minimized' : 'ETKDG Raw'}</span>
              </button>
            )}

            {/* Spin toggle */}
            <button
              type="button"
              onClick={() => setIsSpinning(!isSpinning)}
              title={isSpinning ? 'Pause Rotation' : 'Auto-Rotate Molecule'}
              className={`p-1.5 rounded-lg border transition-colors ${
                isSpinning
                  ? 'bg-teal-600 text-white border-teal-600 shadow-2xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <RotateCw className={`w-3.5 h-3.5 ${isSpinning ? 'animate-spin' : ''}`} />
            </button>

            {/* Hydrogens toggle */}
            <button
              type="button"
              onClick={() => setShowHydrogens(!showHydrogens)}
              title={showHydrogens ? 'Hide Hydrogens' : 'Show Explicit Hydrogens'}
              className={`p-1.5 rounded-lg border transition-colors ${
                showHydrogens
                  ? 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                  : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
              }`}
            >
              {showHydrogens ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            </button>

            {/* Canvas light/dark background toggle */}
            <button
              type="button"
              onClick={() => setCanvasBgDark(!canvasBgDark)}
              title={canvasBgDark ? 'Switch Canvas to Light' : 'Switch Canvas to Dark'}
              className="p-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
            >
              <span className="w-3.5 h-3.5 rounded-full border flex items-center justify-center text-[9px] font-bold">
                {canvasBgDark ? '◐' : '◑'}
              </span>
            </button>

            {/* Snapshot */}
            <button
              type="button"
              onClick={handleSnapshot}
              title="Download High-Res 3D Snapshot"
              className="p-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>

            {/* Reset View */}
            <button
              type="button"
              onClick={handleResetView}
              title="Reset Camera Center"
              className="p-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Style & Surface Selectors Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-800/60">
          {/* Representation Style Pills */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">Style:</span>
            {(['ball_stick', 'stick', 'sphere', 'cartoon', 'wireframe'] as ModelMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setModelMode(mode)}
                className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider transition-all ${
                  modelMode === mode
                    ? 'bg-teal-600 text-white shadow-2xs'
                    : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {mode.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Surface Overlay Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Surface:</span>
            <select
              value={surfaceType}
              onChange={(e) => setSurfaceType(e.target.value as SurfaceType)}
              className="px-2 py-1 rounded-md text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500 font-medium"
            >
              <option value="none">None</option>
              <option value="vdw">Van der Waals (VDW)</option>
              <option value="sas">Solvent Accessible (SAS)</option>
              <option value="ses">Solvent Excluded (SES)</option>
              <option value="esp">Electrostatic Potential (ESP)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3D WebGL Canvas Container */}
      <div className="relative flex-1 min-h-[360px] bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div ref={containerRef} className="w-full h-full absolute inset-0 cursor-grab active:cursor-grabbing" />

        {/* Warning if conformer is 2D fallback */}
        {conformer.warning && (
          <div className="absolute top-3 left-3 right-3 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-200 text-xs flex items-center gap-2 backdrop-blur-md shadow-sm">
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
            <span>{conformer.warning}</span>
          </div>
        )}

        {/* Floating Telemetry Badge */}
        <div className="absolute bottom-3 left-3 px-2.5 py-1.5 rounded-lg bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-sm text-[11px] text-slate-600 dark:text-slate-300 font-mono space-y-0.5 pointer-events-none">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800 dark:text-slate-100">
              {conformer.optimization_method}
            </span>
            <span>•</span>
            <span>{conformer.num_atoms} Atoms</span>
          </div>
          {conformer.energy_score !== undefined && conformer.energy_score !== null && (
            <div className="text-[10px] text-teal-600 dark:text-teal-400 font-medium">
              MMFF94 Energy: {conformer.energy_score} kcal/mol
            </div>
          )}
        </div>

        {/* ESP Legend if ESP Surface active */}
        {surfaceType === 'esp' && (
          <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-sm text-[10px] space-y-1">
            <div className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[9px]">
              ESP Charge Map
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span className="text-slate-600 dark:text-slate-400">Negative (-δ)</span>
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 ml-1.5" />
              <span className="text-slate-600 dark:text-slate-400">Positive (+δ)</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-2.5 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
        <span>Drag to rotate • Scroll to zoom • Shift+Drag to pan</span>
        <span className="font-mono text-teal-600 dark:text-teal-400">WebGL 3Dmol</span>
      </div>
    </div>
  );
};
