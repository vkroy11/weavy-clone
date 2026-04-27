import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { DeleteWorkflowSchema } from '@/lib/schemas';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = DeleteWorkflowSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request: id and clientId are required' },
        { status: 400 },
      );
    }
    const { id, clientId } = parsed.data;

    const existing = await prisma.workflow.findUnique({ where: { id } });
    if (!existing) {
      // Idempotent: deleting an already-deleted row is a success.
      return NextResponse.json({ deleted: true });
    }
    if (existing.clientId && existing.clientId !== clientId) {
      return NextResponse.json(
        { error: 'This workflow belongs to a different browser session.' },
        { status: 403 },
      );
    }

    await prisma.workflow.delete({ where: { id } });
    return NextResponse.json({ deleted: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Delete error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
