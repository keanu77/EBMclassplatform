import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { eventId, role, candidateIds } = await request.json()

    if (!eventId || !role || !candidateIds || !Array.isArray(candidateIds)) {
      return NextResponse.json({ error: '參數錯誤' }, { status: 400 })
    }

    // Validate role
    if (!['learner', 'instructor'].includes(role)) {
      return NextResponse.json({ error: '無效的身份' }, { status: 400 })
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
    })

    if (!event) {
      return NextResponse.json({ error: '活動不存在' }, { status: 404 })
    }

    if (!event.isActive) {
      return NextResponse.json({ error: '投票尚未開放或已結束' }, { status: 400 })
    }

    if (candidateIds.length !== event.maxVotes) {
      return NextResponse.json(
        { error: `請選擇 ${event.maxVotes} 位候選人` },
        { status: 400 }
      )
    }

    // Verify candidates belong to this event
    const candidates = await prisma.candidate.findMany({
      where: {
        id: { in: candidateIds },
        group: { eventId },
      },
    })

    if (candidates.length !== candidateIds.length) {
      return NextResponse.json({ error: '候選人無效' }, { status: 400 })
    }

    // Check for duplicate candidates
    const uniqueIds = new Set(candidateIds)
    if (uniqueIds.size !== candidateIds.length) {
      return NextResponse.json({ error: '不可重複選擇同一候選人' }, { status: 400 })
    }

    // Create ballot and votes
    await prisma.ballot.create({
      data: {
        eventId,
        role,
        votes: {
          create: candidateIds.map((candidateId: string) => ({
            candidateId,
          })),
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Vote error:', error)
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 })
  }
}
