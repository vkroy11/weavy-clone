import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (id) {
      const workflow = await prisma.workflow.findUnique({
        where: { id },
      });
      return NextResponse.json(workflow);
    }

    const workflows = await prisma.workflow.findMany({
      orderBy: { updatedAt: 'desc' },
    });
    return NextResponse.json(workflows);
  } catch (error: any) {
    console.error('Load error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

