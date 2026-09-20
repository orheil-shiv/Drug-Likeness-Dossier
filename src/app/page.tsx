'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { SearchBar } from '@/components/SearchBar';
import { MetricCards } from '@/components/MetricCards';
import { Viewer2D } from '@/components/Viewer2D';
import { Viewer3D } from '@/components/Viewer3D';
import { RadarChart } from '@/components/RadarChart';
import { MorganFingerprint } from '@/components/MorganFingerprint';
import { SafetyPictograms } from '@/components/SafetyPictograms';
import { AnalysisResult } from '@/types/chem';
import { resolveClientFallback } from '@/lib/chem-fallback';
import {
  FlaskConical,
  AlertCircle,
  Loader2,
  Sparkles,
  ShieldCheck,
  Activity,
  Cpu,
  Layers,
  Database,
  Info
} from 'lucide-react';

export default function Home() {
  const [query, setQuery] = useState('Aspirin');
  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [isFallbackMode, setIsFallbackMode] = useState<boolean>(false);

  const fetchAnalysis = async (searchQuery: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    setIsFallbackMode(false);
    setLoadingStep('Connecting to Cheminformatics Engine & PubChem PUG REST...');

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: searchQuery }),
      });

      if (!response.ok) {
        let errDetail = `Server status ${response.status}`;
        try {
          const errJson = await response.json();
          errDetail = errJson.detail || errDetail;
        } catch {
          const text = await response.text().catch(() => '');
          if (text) {
            errDetail = `${text.slice(0, 150)} (HTTP ${response.status})`;
          }
        }
        throw new Error(errDetail);
      }

      setLoadingStep('Calculating 3D conformer, Morgan fingerprints & vector depictions...');
      const data: AnalysisResult = await response.json();
      setAnalysisData(data);
      setQuery(searchQuery);
    } catch (err: any) {
      console.warn('Backend unreachable or cold start, activating client fallback engine:', err);
      try {
        const clientData = resolveClientFallback(searchQuery);
        setAnalysisData(clientData);
        setQuery(searchQuery);
        setIsFallbackMode(true);
      } catch (fallbackErr: any) {
        setErrorMessage(err.message || 'Failed to analyze molecule');
      }
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  // Initial load
  useEffect(() => {
    fetchAnalysis('Aspirin');
  }, []);

  return (
    <div className="min-h-screen flex flex-col lab-grid transition-colors">
      {/* Top Laboratory Navigation Bar */}
      <Navbar
        analysisData={analysisData}
        onSelectPreset={(p) => {
          setQuery(p);
          fetchAnalysis(p);
        }}
        currentQuery={query}
      />

      {/* Main Workstation Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 space-y-5">
        {/* Telemetry Status Strip */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-1.5 rounded-lg bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400 font-mono shadow-2xs">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-teal-600 dark:text-teal-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 led-online" />
              {isFallbackMode ? 'STANDALONE LAB' : 'ONLINE'}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-slate-400" />
              RDKit 2024.9
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              ETKDGv3 / MMFF94
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Database className="w-3.5 h-3.5 text-slate-400" />
              PubChem PUG REST
            </span>
            <span>•</span>
            <span className="text-teal-600 dark:text-teal-400 font-medium">
              Vercel Serverless Ready
            </span>
          </div>
        </div>

        {/* Search & Chemical Resolver Bar */}
        <section className="glass-panel p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <SearchBar onSearch={fetchAnalysis} isLoading={isLoading} currentQuery={query} />
        </section>

        {/* Error Notification Alert */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-start gap-3 shadow-xs">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
            <div>
              <h4 className="font-bold text-rose-900 dark:text-rose-100">
                Molecule Resolution Alert
              </h4>
              <p className="mt-0.5">{errorMessage}</p>
              <p className="mt-1 text-slate-500 dark:text-slate-400 text-[11px]">
                Tip: Enter a recognized trade/generic name (e.g. <i>Aspirin</i>, <i>Caffeine</i>,{' '}
                <i>Ibuprofen</i>), a CAS number (e.g. <code>50-78-2</code>), a PubChem CID (e.g.{' '}
                <code>2244</code>), or a valid SMILES string (e.g.{' '}
                <code className="text-teal-600 dark:text-teal-400">CC(=O)Oc1ccccc1C(=O)O</code>).
              </p>
            </div>
          </div>
        )}

        {/* Loading Spinner State */}
        {isLoading && (
          <div className="glass-panel p-10 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-3 text-center shadow-md">
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-2 border-teal-500/20 border-t-teal-600 animate-spin" />
              <FlaskConical className="w-6 h-6 text-teal-600 dark:text-teal-400 absolute inset-0 m-auto animate-pulse" />
            </div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {loadingStep}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md">
              Computing Lipinski Rule of 5, Veber oral bioavailability, Ghose filter, Morgan
              fingerprint bit vector, ETKDGv3 3D conformer, and MMFF94 force field minimization.
            </p>
          </div>
        )}

        {/* Loaded Analysis Workstation */}
        {!isLoading && analysisData && (
          <div className="space-y-5">
            {/* Top Row: Physicochemical Metrics & Rule Badges */}
            <section>
              <MetricCards
                properties={analysisData.properties}
                metadata={analysisData.metadata}
              />
            </section>

            {/* Split-Pane: Left Pane (2D RDKit SVG / Sketcher) | Right Pane (3Dmol.js WebGL) */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Left Pane: 2D Depiction & Interactive Sketcher (6 cols) */}
              <div className="lg:col-span-6 min-h-[460px]">
                <Viewer2D
                  depictions={analysisData.depictions}
                  compoundName={analysisData.metadata.name}
                  currentSmiles={analysisData.metadata.smiles}
                  onAnalyzeSketch={(smi) => fetchAnalysis(smi)}
                />
              </div>

              {/* Right Pane: 3D Interactive Conformation Station (6 cols) */}
              <div className="lg:col-span-6 min-h-[460px]">
                <Viewer3D
                  conformer={analysisData.conformer_3d}
                  compoundName={analysisData.metadata.name}
                />
              </div>
            </section>

            {/* Bottom Row: Oral Bioavailability Radar, Morgan Fingerprint, and Safety Badges */}
            <section className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Radar Chart (4 cols) */}
              <div className="md:col-span-4 min-h-[380px]">
                <RadarChart
                  radarB64={analysisData.radar_b64}
                  compoundName={analysisData.metadata.name}
                />
              </div>

              {/* Morgan Fingerprint Matrix (4 cols) */}
              <div className="md:col-span-4 min-h-[380px]">
                <MorganFingerprint
                  morganFp={analysisData.properties.morgan_fp}
                  compoundName={analysisData.metadata.name}
                />
              </div>

              {/* PubChem Safety & Bioassay Stats (4 cols) */}
              <div className="md:col-span-4 min-h-[380px]">
                <SafetyPictograms
                  safety={analysisData.metadata.safety}
                  compoundName={analysisData.metadata.name}
                />
              </div>
            </section>
          </div>
        )}

        {/* Scientific Methodology Footer */}
        <footer className="pt-6 pb-4 border-t border-slate-200/80 dark:border-slate-800/80 text-slate-500 dark:text-slate-400 text-xs flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>Cheminformatics Virtual Lab Suite • RDKit, PubChem PUG REST, 3Dmol.js, and ReportLab</span>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span>Lipinski (1997)</span>
            <span>•</span>
            <span>Veber (2002)</span>
            <span>•</span>
            <span>Ghose (1999)</span>
            <span>•</span>
            <span>MMFF94 Force Field</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
