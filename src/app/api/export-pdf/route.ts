import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Proxy to local or containerized Python server running ReportLab
    try {
      const pyResp = await fetch('http://127.0.0.1:8000/api/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (pyResp.ok) {
        const pdfBlob = await pyResp.blob();
        return new NextResponse(pdfBlob, {
          status: 200,
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="Compound_Dossier.pdf"',
          },
        });
      }
    } catch {
      // Python ReportLab backend not currently reachable
    }

    return NextResponse.json(
      {
        detail:
          'PDF dossier generator requires Python ReportLab runtime. Run `uvicorn api.index:app` for serverless PDF compilation.',
      },
      { status: 503 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { detail: err.message || 'Error exporting compound dossier.' },
      { status: 500 }
    );
  }
}
