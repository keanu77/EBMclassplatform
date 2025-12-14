import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isAdminAuthenticated } from '@/lib/admin-auth'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: '未授權' }, { status: 401 })
    }

    const { id } = await params

    await prisma.candidate.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete candidate error:', error)
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 })
  }
}
