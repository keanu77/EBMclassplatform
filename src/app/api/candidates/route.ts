import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const eventId = request.nextUrl.searchParams.get('eventId')

    if (!eventId) {
      return NextResponse.json({ error: '缺少 eventId' }, { status: 400 })
    }

    const candidates = await prisma.candidate.findMany({
      where: {
        group: { eventId },
      },
      include: {
        group: {
          select: { name: true },
        },
      },
      orderBy: [
        { group: { name: 'asc' } },
        { name: 'asc' },
      ],
    })

    const result = candidates.map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description,
      groupName: c.group.name,
    }))

    return NextResponse.json(result)
  } catch (error) {
    console.error('Fetch candidates error:', error)
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 })
  }
}
