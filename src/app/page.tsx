'use client';

import React, { useState, useEffect } from 'react';
import { SearchBar } from '@/components/SearchBar';
import { MetricCards } from '@/components/MetricCards';
import { Viewer2D } from '@/components/Viewer2D';
import { Viewer3D } from '@/components/Viewer3D';
import { RadarChart } from '@/components/RadarChart';
import { DossierExport } from '@/components/DossierExport';
import { AnalysisResult } from '@/types/chem';
import { Dna, AlertCircle, Loader2, Sparkles, BookOpen, ShieldCheck } from 'lucide-react';

export default function Home() {
  const [query, setQuery] = useState('Aspirin');
  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState<string>('');

  const fetchAnalysis = async (searchQuery: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    setLoadingStep('Resolving compound structure and PubChem database...');

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: searchQuery }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({ detail: 'Analysis failed' }));
        throw new Error(errJson.detail || `Server error: ${response.status}`);
      }

      setLoadingStep('Calculating 3D conformer & rendering representations...');
      const data: AnalysisResult = await response.json();
      setAnalysisData(data);
      setQuery(searchQuery);
    } catch (err: any) {
      console.error('Analysis error:', err);
      setErrorMessage(err.message || 'Failed to analyze molecule');
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  // Initial load with Aspirin
  useEffect(() => {
    fetchAnalysis('Aspirin');
  }, []);

  return (
    <main className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-teal-500/20">
              <Dna className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-slate-100 flex items-center gap-2">
                <span>Drug-Likeness & Lipinski Dossier Generator</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-300 border border-teal-500/30 font-medium">
                  RDKit 2024
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Automated Bio/Cheminformatics Profiling & Multi-Model 2D/3D Visualization
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            {analysisData && <DossierExport analysisData={analysisData} />}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8 space-y-6">
        {/* Search & Preset Selection Bar */}
        <section className="glass-panel p-4 rounded-2xl border border-slate-800 shadow-xl">
          <SearchBar onSearch={fetchAnalysis} isLoading={isLoading} currentQuery={query} />
        </section>

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-3 shadow-lg">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
            <div>
              <h4 className="font-bold text-rose-200">Molecule Resolution Failed</h4>
              <p className="mt-0.5">{errorMessage}</p>
              <p className="mt-1 text-slate-400 text-[11px]">
                Tip: Enter a valid chemical IUPAC/trade name (e.g. <i>Caffeine</i>, <i>Ibuprofen</i>) or a canonical SMILES string (e.g. <code className="text-teal-300">CC(=O)Oc1ccccc1C(=O)O</code>).
              </p>
            </div>
          </div>
        )}

        {/* Loading Spinner State */}
        {isLoading && (
          <div className="glass-panel p-10 rounded-2xl border border-slate-800 flex flex-col items-center justify-center gap-3 text-center shadow-2xl">
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-2 border-teal-500/20 border-t-teal-400 animate-spin" />
              <Dna className="w-6 h-6 text-teal-400 absolute inset-0 m-auto animate-pulse" />
            </div>
            <p className="text-sm font-semibold text-slate-200">{loadingStep}</p>
            <p className="text-xs text-slate-400 max-w-md">
              Executing RDKit physicochemical descriptors, ETKDGv3 3D conformer minimization, Gasteiger charge mapping, and 2D style synthesis.
            </p>
          </div>
        )}

        {/* Loaded Analysis Results */}
        {!isLoading && analysisData && (
          <div className="space-y-6">
            {/* Physicochemical Metrics & Rule Badges */}
            <section>
              <MetricCards
                properties={analysisData.properties}
                metadata={analysisData.metadata}
              />
            </section>

            {/* Visualizer Grid: 2D Depiction (Left), 3D WebGL (Center), Radar Plot (Right) */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Left Column: 2D Multi-Style Engine (4 cols) */}
              <div className="lg:col-span-4 min-h-[440px]">
                <Viewer2D
                  depictions={analysisData.depictions}
                  compoundName={analysisData.metadata.name}
                />
              </div>

              {/* Center Column: 3Dmol.js WebGL Interactive Viewer (5 cols) */}
              <div className="lg:col-span-5 min-h-[440px]">
                <Viewer3D
                  conformer={analysisData.conformer_3d}
                  compoundName={analysisData.metadata.name}
                />
              </div>

              {/* Right Column: Normalized Lipinski Radar Plot (3 cols) */}
              <div className="lg:col-span-3 min-h-[440px]">
                <RadarChart
                  radarB64={analysisData.radar_b64}
                  compoundName={analysisData.metadata.name}
                />
              </div>
            </section>
          </div>
        )}

        {/* Scientific Methodology Summary Footer */}
        <footer className="pt-8 border-t border-slate-800/80 text-slate-400 text-xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            <span>Built with RDKit, PubChemPy, 3Dmol.js, and ReportLab</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Lipinski Rule of 5 (1997)</span>
            <span>•</span>
            <span>Veber Oral Bioavailability Rules (2002)</span>
            <span>•</span>
            <span>MMFF94 Force Field</span>
          </div>
        </footer>
      </div>
    </main>
  );
}
