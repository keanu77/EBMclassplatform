import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const event = await prisma.event.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        isActive: true,
        maxVotes: true,
      },
    })

    if (!event) {
      return NextResponse.json({ error: '活動不存在' }, { status: 404 })
    }

    return NextResponse.json(event)
  } catch (error) {
    console.error('Get event error:', error)
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 })
  }
}
