import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getRoleWeight } from '@/lib/utils'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params

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

    // Only show results if voting is closed
    if (event.isActive) {
      return NextResponse.json({ error: '投票進行中，結果尚未公開' }, { status: 403 })
    }

    // Calculate weighted scores by group
    const resultsByGroup = event.groups.map((group) => {
      const candidateResults = group.candidates.map((candidate) => {
        const weightedScore = candidate.votes.reduce((sum, vote) => {
          const weight = getRoleWeight(vote.ballot.role)
          return sum + weight
        }, 0)

        return {
          id: candidate.id,
          name: candidate.name,
          description: candidate.description,
          voteCount: candidate.votes.length,
          weightedScore,
        }
      })

      // Sort by weighted score descending
      candidateResults.sort((a, b) => b.weightedScore - a.weightedScore)

      return {
        groupId: group.id,
        groupName: group.name,
        candidates: candidateResults,
        top3: candidateResults.slice(0, 3),
      }
    })

    // Calculate overall top 3
    const allCandidates = resultsByGroup.flatMap((g) =>
      g.candidates.map((c) => ({ ...c, groupName: g.groupName }))
    )
    allCandidates.sort((a, b) => b.weightedScore - a.weightedScore)

    return NextResponse.json({
      eventId: event.id,
      eventName: event.name,
      resultsByGroup,
      overallTop3: allCandidates.slice(0, 3),
    })
  } catch (error) {
    console.error('Results error:', error)
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 })
  }
}
