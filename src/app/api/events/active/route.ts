import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        description: true,
        maxVotes: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ events })
  } catch (error) {
    console.error('Get active events error:', error)
    return NextResponse.json({ events: [] })
  }
}
