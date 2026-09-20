import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';

export const metadata: Metadata = {
  title: 'Drug-Likeness & Lipinski Dossier Generator',
  description: 'Automated bio/cheminformatics molecular profiling, multi-style 2D & 3D visualization, and publication-ready PDF dossier generation.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* 3Dmol.js WebGL Molecular Viewer */}
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/3Dmol/2.4.2/3Dmol-min.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className="min-h-screen bg-[#0b0f19] text-slate-100 antialiased selection:bg-teal-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
