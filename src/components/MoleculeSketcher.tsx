'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  PenTool,
  RotateCcw,
  Trash2,
  Download,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  Maximize2,
  Atom,
  Layers,
  CircleDot
} from 'lucide-react';

interface MoleculeSketcherProps {
  initialSmiles?: string;
  onAnalyze: (smiles: string) => void;
}

interface AtomNode {
  id: number;
  x: number;
  y: number;
  element: string;
}

interface BondEdge {
  from: number;
  to: number;
  order: 1 | 2 | 3;
}

type ToolMode = 'atom' | 'bond' | 'template' | 'group' | 'eraser';

const ATOM_ELEMENTS = ['C', 'N', 'O', 'S', 'P', 'F', 'Cl', 'Br', 'I'];
const TEMPLATES = [
  { name: 'Benzene', icon: '⬡', smiles: 'c1ccccc1' },
  { name: 'Cyclopentane', icon: '⬠', smiles: 'C1CCCC1' },
  { name: 'Cyclohexane', icon: '⬡', smiles: 'C1CCCCC1' },
  { name: 'Pyridine', icon: '⬡-N', smiles: 'c1ccncc1' },
];

const FUNCTIONAL_GROUPS = [
  { name: '-OH (Hydroxy)', smiles: 'O' },
  { name: '-COOH (Carboxyl)', smiles: 'C(=O)O' },
  { name: '-NH2 (Amino)', smiles: 'N' },
  { name: '-NO2 (Nitro)', smiles: 'N(=O)=O' },
  { name: '-OCH3 (Methoxy)', smiles: 'OC' },
  { name: '-CF3 (Trifluoromethyl)', smiles: 'C(F)(F)F' },
];

export const MoleculeSketcher: React.FC<MoleculeSketcherProps> = ({
  initialSmiles = 'CC(=O)Oc1ccccc1C(=O)O',
  onAnalyze,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [smilesInput, setSmilesInput] = useState(initialSmiles);
  const [selectedElement, setSelectedElement] = useState('C');
  const [currentBondOrder, setCurrentBondOrder] = useState<1 | 2 | 3>(1);
  const [toolMode, setToolMode] = useState<ToolMode>('atom');
  const [copied, setCopied] = useState(false);
  const [drawerRenderError, setDrawerRenderError] = useState<string | null>(null);

  // Update SMILES input if initialSmiles changes from outside
  useEffect(() => {
    if (initialSmiles) {
      setSmilesInput(initialSmiles);
    }
  }, [initialSmiles]);

  // Render SMILES to Canvas using SmilesDrawer or Native Canvas Drawer
  const renderSmilesToCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const isDark = document.documentElement.classList.contains('dark');
    const SmilesDrawer = (window as any).SmilesDrawer;

    if (SmilesDrawer && smilesInput.trim()) {
      try {
        setDrawerRenderError(null);
        const options = {
          width: canvas.width,
          height: canvas.height,
          bondThickness: 2.2,
          bondLength: 25,
          compactDrawing: false,
          theme: isDark ? 'dark' : 'light',
          fontSizeLarge: 7,
          fontSizeSmall: 5,
        };

        const drawer = new SmilesDrawer.Drawer(options);
        SmilesDrawer.parse(
          smilesInput.trim(),
          (tree: any) => {
            drawer.draw(tree, canvas, isDark ? 'dark' : 'light', false);
          },
          (err: any) => {
            setDrawerRenderError('Invalid SMILES syntax for 2D render');
            drawFallbackPlaceholder(ctx, canvas.width, canvas.height, smilesInput);
          }
        );
      } catch (err: any) {
        setDrawerRenderError(err.message || 'SmilesDrawer error');
        drawFallbackPlaceholder(ctx, canvas.width, canvas.height, smilesInput);
      }
    } else {
      drawFallbackPlaceholder(ctx, canvas.width, canvas.height, smilesInput);
    }
  }, [smilesInput]);

  const drawFallbackPlaceholder = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    smi: string
  ) => {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#64748b';
    ctx.font = '12px ui-monospace, SFMono-Regular, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('SmilesDrawer active rendering', width / 2, height / 2 - 10);
    ctx.fillStyle = '#0d9488';
    ctx.fillText(smi.slice(0, 45) + (smi.length > 45 ? '...' : ''), width / 2, height / 2 + 15);
  };

  useEffect(() => {
    // Attempt render after mount and when smiles changes
    renderSmilesToCanvas();
    const timer = setTimeout(renderSmilesToCanvas, 300);
    return () => clearTimeout(timer);
  }, [renderSmilesToCanvas]);

  const handleApplyTemplate = (tmplSmiles: string) => {
    if (!smilesInput.trim()) {
      setSmilesInput(tmplSmiles);
    } else {
      // Append or substitute
      setSmilesInput(tmplSmiles);
    }
  };

  const handleApplyGroup = (groupSmiles: string) => {
    if (!smilesInput.trim()) {
      setSmilesInput(groupSmiles);
    } else {
      setSmilesInput((prev) => `${prev}${groupSmiles}`);
    }
  };

  const handleCopySmiles = () => {
    navigator.clipboard.writeText(smilesInput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMol = () => {
    if (!smilesInput.trim()) return;
    const link = document.createElement('a');
    link.href = `/api/structure/mol?query=${encodeURIComponent(smilesInput.trim())}`;
    link.download = `sketched_molecule.mol`;
    link.click();
  };

  const handleDownloadSmiles = () => {
    if (!smilesInput.trim()) return;
    const blob = new Blob([smilesInput.trim()], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `molecule.smi`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Sketcher Toolbar */}
      <div className="p-3 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500 led-active" />
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <PenTool className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>Interactive 2D Structure Sketcher</span>
            </h4>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleCopySmiles}
              title="Copy SMILES"
              className="p-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs flex items-center gap-1 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="text-[10px] hidden sm:inline">Copy SMILES</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadMol}
              title="Download MDL Molfile (.mol)"
              className="p-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs flex items-center gap-1 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="text-[10px] hidden sm:inline">.MOL</span>
            </button>
          </div>
        </div>

        {/* Atom Palette & Templates */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase mr-1">
            Atoms:
          </span>
          {ATOM_ELEMENTS.map((elem) => (
            <button
              key={elem}
              type="button"
              onClick={() => {
                setSelectedElement(elem);
                handleApplyGroup(elem);
              }}
              className={`px-2 py-0.5 rounded text-xs font-bold font-mono transition-all ${
                selectedElement === elem
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {elem}
            </button>
          ))}

          <span className="text-slate-300 dark:text-slate-700 mx-1">|</span>

          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase mr-1">
            Rings:
          </span>
          {TEMPLATES.map((tmpl) => (
            <button
              key={tmpl.name}
              type="button"
              onClick={() => handleApplyTemplate(tmpl.smiles)}
              className="px-2 py-0.5 rounded text-[11px] font-medium bg-white dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center gap-1 transition-colors"
            >
              <span>{tmpl.icon}</span>
              <span>{tmpl.name}</span>
            </button>
          ))}
        </div>

        {/* Functional Groups Toolbar */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase mr-1">
            Groups:
          </span>
          {FUNCTIONAL_GROUPS.map((grp) => (
            <button
              key={grp.name}
              type="button"
              onClick={() => handleApplyGroup(grp.smiles)}
              className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 hover:bg-teal-50 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/60 transition-colors"
            >
              {grp.name}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setSmilesInput('')}
            className="px-2 py-0.5 rounded text-[10px] font-medium bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 flex items-center gap-1 transition-colors ml-auto"
          >
            <Trash2 className="w-3 h-3" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Canvas Drawing Area */}
      <div className="relative flex-1 min-h-[300px] bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-center p-3">
        <canvas
          ref={canvasRef}
          width={450}
          height={320}
          className="w-full h-full max-h-[340px] rounded-lg object-contain bg-white dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 shadow-inner"
        />

        {drawerRenderError && (
          <div className="absolute bottom-4 left-4 right-4 p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-[11px] text-center">
            {drawerRenderError}
          </div>
        )}
      </div>

      {/* Bottom SMILES Synchronization & Analyze Button */}
      <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 font-mono">
            SMILES:
          </span>
          <input
            type="text"
            value={smilesInput}
            onChange={(e) => setSmilesInput(e.target.value)}
            placeholder="Type or paste SMILES (e.g. CC(=O)Oc1ccccc1C(=O)O)..."
            className="flex-1 px-2.5 py-1.5 text-xs font-mono bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="text-[11px] text-slate-400">
            SmilesDrawer • Interactive 2D Structure Canvas
          </div>

          <button
            type="button"
            onClick={() => {
              if (smilesInput.trim()) {
                onAnalyze(smilesInput.trim());
              }
            }}
            disabled={!smilesInput.trim()}
            className="px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-semibold text-xs rounded-xl flex items-center gap-2 shadow-md shadow-teal-600/20 disabled:opacity-50 transition-all shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Send to 3D Virtual Lab & Analyze</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
