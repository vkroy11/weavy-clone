import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SaveWorkflowSchema } from '@/lib/schemas';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = SaveWorkflowSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: `Invalid request: ${parsed.error.issues
            .map((i) => `${i.path.join('.') || '<root>'} ${i.message}`)
            .join('; ')}`,
        },
        { status: 400 },
      );
    }
    const { id, clientId, name, nodes, edges } = parsed.data;

    // Branch on id presence. The previous `upsert` with `where: { id: id || '' }`
    // always failed the lookup when id was undefined and silently created a
    // new row each save, producing duplicates (issue 010).
    const data = { clientId, name, nodes, edges };
    let workflow;
    if (id) {
      // Make sure the row is owned by this clientId before updating.
      const existing = await prisma.workflow.findUnique({ where: { id } });
      if (!existing) {
        // Stale id — fall through to create. Stops a refresh from
        // producing a 404 if the row was deleted server-side.
        workflow = await prisma.workflow.create({ data });
      } else if (existing.clientId && existing.clientId !== clientId) {
        return NextResponse.json(
          { error: 'This workflow belongs to a different browser session.' },
          { status: 403 },
        );
      } else {
        workflow = await prisma.workflow.update({
          where: { id },
          data,
        });
      }
    } else {
      workflow = await prisma.workflow.create({ data });
    }

    return NextResponse.json(workflow);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Save error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
