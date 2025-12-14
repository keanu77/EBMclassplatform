import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { getRoleWeight, generateCSV } from '@/lib/utils'

export async function GET(request: NextRequest) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: '未授權' }, { status: 401 })
    }

    const eventId = request.nextUrl.searchParams.get('eventId')
    if (!eventId) {
      return NextResponse.json({ error: '缺少 eventId' }, { status: 400 })
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        groups: {
          include: {
            candidates: {
              include: {
                votes: {
                  include: {
                    ballot: {
                      select: { role: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!event) {
      return NextResponse.json({ error: '活動不存在' }, { status: 404 })
    }

    // Calculate results
    const results: {
      rank: number
      group: string
      name: string
      voteCount: number
      weightedScore: number
    }[] = []

    for (const group of event.groups) {
      const groupResults = group.candidates.map((candidate) => {
        const weightedScore = candidate.votes.reduce((sum, vote) => {
          return sum + getRoleWeight(vote.ballot.role)
        }, 0)

        return {
          group: group.name,
          name: candidate.name,
          voteCount: candidate.votes.length,
          weightedScore,
        }
      })

      // Sort by weighted score descending
      groupResults.sort((a, b) => b.weightedScore - a.weightedScore)

      // Add rank within group
      groupResults.forEach((r, i) => {
        results.push({ rank: i + 1, ...r })
      })
    }

    // Sort all results by group, then by weighted score
    results.sort((a, b) => {
      if (a.group !== b.group) return a.group.localeCompare(b.group)
      return b.weightedScore - a.weightedScore
    })

    const csv = generateCSV(results, ['rank', 'group', 'name', 'voteCount', 'weightedScore'])

    const headers = new Headers()
    headers.set('Content-Type', 'text/csv; charset=utf-8')
    headers.set(
      'Content-Disposition',
      `attachment; filename="results-${event.name}-${new Date().toISOString().split('T')[0]}.csv"`
    )

    // Add BOM for Excel UTF-8 compatibility
    const bom = '\uFEFF'
    return new NextResponse(bom + csv, { headers })
  } catch (error) {
    console.error('Export results error:', error)
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 })
  }
}
