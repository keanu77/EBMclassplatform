import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isAdminAuthenticated } from '@/lib/admin-auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: '未授權' }, { status: 401 })
    }

    const { id } = await params

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        groups: {
          include: {
            candidates: true,
          },
        },
        voters: true,
        _count: {
          select: { ballots: true },
        },
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: '未授權' }, { status: 401 })
    }

    const { id } = await params
    const updates = await request.json()

    const event = await prisma.event.update({
      where: { id },
      data: updates,
    })

    return NextResponse.json(event)
  } catch (error) {
    console.error('Update event error:', error)
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: '未授權' }, { status: 401 })
    }

    const { id } = await params

    await prisma.event.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete event error:', error)
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 })
  }
}
