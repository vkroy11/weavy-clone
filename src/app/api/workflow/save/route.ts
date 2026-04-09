import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const SaveWorkflowSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  nodes: z.array(z.any()),
  edges: z.array(z.any()),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, name, nodes, edges } = SaveWorkflowSchema.parse(body);

    const workflow = await prisma.workflow.upsert({
      where: { id: id || '' },
      update: { name, nodes, edges },
      create: { name, nodes, edges },
    });

    return NextResponse.json(workflow);
  } catch (error: any) {
    console.error('Save error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

