import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';

export const metadata: Metadata = {
  title: 'Cheminformatics Virtual Lab | Drug-Likeness & Molecular Suite',
  description: 'Next-generation bio/cheminformatics workstation with interactive 2D sketching, 3Dmol.js WebGL visualization, Lipinski/Veber/Ghose profiling, and publication-grade PDF dossiers.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* 3Dmol.js WebGL Molecular Viewer */}
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/3Dmol/2.4.2/3Dmol-min.js"
          strategy="beforeInteractive"
        />
        {/* SmilesDrawer 2D Chemical Formula Renderer */}
        <Script
          src="https://unpkg.com/smiles-drawer@2.1.7/dist/smiles-drawer.min.js"
          strategy="afterInteractive"
        />
      </head>
      <body className="min-h-screen antialiased selection:bg-teal-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
