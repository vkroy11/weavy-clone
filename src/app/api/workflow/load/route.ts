import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const LIST_LIMIT = 50;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const clientId = searchParams.get('clientId');

    if (!clientId) {
      return NextResponse.json(
        { error: 'clientId query param is required' },
        { status: 400 },
      );
    }

    if (id) {
      // Single-row fetch. Returns the full workflow including nodes/edges
      // (which can be large). Scoped to clientId so a guessed id from another
      // browser is a 404.
      const workflow = await prisma.workflow.findFirst({
        where: { id, clientId },
      });
      if (!workflow) {
        return NextResponse.json({ error: 'Workflow not found' }, { status: 404 });
      }
      return NextResponse.json(workflow);
    }

    // List view: slim projection (no nodes/edges). The list can be 50+ rows
    // and the per-row JSON can be megabytes once images get involved — see
    // issue 030 — so excluding the heavy fields here is a real perf win.
    const workflows = await prisma.workflow.findMany({
      where: { clientId },
      orderBy: { updatedAt: 'desc' },
      take: LIST_LIMIT,
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return NextResponse.json(workflows);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Load error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
