'use client';

import React, { useState } from 'react';
import { FileDown, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { AnalysisResult } from '@/types/chem';

interface DossierExportProps {
  analysisData: AnalysisResult;
}

export const DossierExport: React.FC<DossierExportProps> = ({ analysisData }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  const handleExportPdf = async () => {
    setIsExporting(true);
    setStatusMessage('Compiling publication dossier...');
    setIsError(false);

    try {
      const response = await fetch('/api/export-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          analysis_data: analysisData
        })
      });

      if (!response.ok) {
        throw new Error(`PDF export failed with status ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const compoundName = analysisData.metadata.name?.replace(/\s+/g, '_') || 'molecule';
      link.download = `${compoundName}_Lipinski_Dossier.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setStatusMessage('Dossier downloaded successfully!');
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: any) {
      console.error('Export error:', err);
      setIsError(true);
      setStatusMessage(err.message || 'Failed to export PDF dossier');
      setTimeout(() => setStatusMessage(null), 4000);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      {statusMessage && (
        <span
          className={`text-xs flex items-center gap-1.5 font-medium animate-fade-in ${
            isError ? 'text-rose-400' : 'text-emerald-400'
          }`}
        >
          {isError ? <AlertCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
          <span>{statusMessage}</span>
        </span>
      )}

      <button
        type="button"
        onClick={handleExportPdf}
        disabled={isExporting}
        className="px-4 py-2 bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-600 hover:to-blue-700 text-white font-semibold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-teal-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {isExporting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Generating PDF...</span>
          </>
        ) : (
          <>
            <FileDown className="w-4 h-4" />
            <span>Download Dossier PDF</span>
          </>
        )}
      </button>
    </div>
  );
};
