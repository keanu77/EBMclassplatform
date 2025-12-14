import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isAdminAuthenticated } from '@/lib/admin-auth'

export async function GET() {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: '未授權' }, { status: 401 })
    }

    const events = await prisma.event.findMany({
      include: {
        _count: {
          select: { ballots: true, groups: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(events)
  } catch (error) {
    console.error('Get events error:', error)
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: '未授權' }, { status: 401 })
    }

    const { name, description, maxVotes = 3 } = await request.json()

    if (!name) {
      return NextResponse.json({ error: '請輸入活動名稱' }, { status: 400 })
    }

    const event = await prisma.event.create({
      data: {
        name,
        description,
        maxVotes,
      },
    })

    return NextResponse.json(event)
  } catch (error) {
    console.error('Create event error:', error)
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 })
  }
}
