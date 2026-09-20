import { NextRequest, NextResponse } from 'next/server';
import { resolvePubChemCompound } from '@/lib/pubchem-service';
import { BENCHMARK_FALLBACKS } from '@/lib/chem-fallback';

export const maxDuration = 60; // 60 seconds max execution time for Vercel
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const query = (body.query || '').trim();

    if (!query) {
      return NextResponse.json(
        { detail: 'Query parameter (SMILES, CAS, CID, InChI, or name) must not be empty.' },
        { status: 400 }
      );
    }

    // 1. Try local or configured Python backend first (if running)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const pyResp = await fetch('http://127.0.0.1:8000/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (pyResp.ok) {
        const pyData = await pyResp.json();
        return NextResponse.json(pyData);
      }
    } catch {
      // Python backend not running or timed out, proceed to direct PubChem PUG REST
    }

    // 2. Direct PubChem PUG REST Resolution (Accessing entire PubChem 100M+ database)
    try {
      const pubChemData = await resolvePubChemCompound(query);
      return NextResponse.json(pubChemData);
    } catch (pubChemErr: any) {
      console.warn(`PubChem PUG REST error for '${query}':`, pubChemErr.message);

      // 3. Fallback to offline cached benchmark drugs if available
      const qLower = query.toLowerCase();
      if (BENCHMARK_FALLBACKS[qLower]) {
        return NextResponse.json(BENCHMARK_FALLBACKS[qLower]);
      }

      return NextResponse.json(
        {
          detail:
            pubChemErr.message ||
            `Could not resolve compound '${query}' across PubChem database or local engine.`,
        },
        { status: 404 }
      );
    }
  } catch (err: any) {
    return NextResponse.json(
      { detail: err.message || 'Internal server error analyzing molecule.' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('query') || '';

  if (!query) {
    return NextResponse.json({
      status: 'online',
      service: 'cheminformatics-virtual-lab-api',
      engine: 'Next.js App Router Universal Handler (PubChem PUG REST & RDKit)',
    });
  }

  // Delegate to POST handler
  const mockReq = new NextRequest(req.url, {
    method: 'POST',
    body: JSON.stringify({ query }),
  });
  return POST(mockReq);
}
