import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { parseCSV } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: '未授權' }, { status: 401 })
    }

    const { eventId, csvData } = await request.json()

    if (!eventId || !csvData) {
      return NextResponse.json({ error: '缺少必要參數' }, { status: 400 })
    }

    const event = await prisma.event.findUnique({ where: { id: eventId } })
    if (!event) {
      return NextResponse.json({ error: '活動不存在' }, { status: 404 })
    }

    const rows = parseCSV(csvData)
    if (rows.length === 0) {
      return NextResponse.json({ error: 'CSV 格式錯誤或無資料' }, { status: 400 })
    }

    // Group candidates by group name
    const groupMap = new Map<string, { name: string; description: string | null }[]>()

    for (const row of rows) {
      const groupName = row.group || '預設組別'
      if (!groupMap.has(groupName)) {
        groupMap.set(groupName, [])
      }
      groupMap.get(groupName)!.push({
        name: row.name || '未命名',
        description: row.description || null,
      })
    }

    let totalCreated = 0

    // Create groups and candidates
    for (const [groupName, candidates] of groupMap) {
      // Find or create group
      let group = await prisma.group.findFirst({
        where: { eventId, name: groupName },
      })

      if (!group) {
        group = await prisma.group.create({
          data: { eventId, name: groupName },
        })
      }

      // Create candidates
      const result = await prisma.candidate.createMany({
        data: candidates.map((c) => ({
          groupId: group.id,
          name: c.name,
          description: c.description,
        })),
      })

      totalCreated += result.count
    }

    return NextResponse.json({ count: totalCreated })
  } catch (error) {
    console.error('Import candidates error:', error)
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 })
  }
}
