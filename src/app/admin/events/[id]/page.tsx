import { redirect } from 'next/navigation'
import Link from 'next/link'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'
import { getRoleWeight } from '@/lib/utils'
import EventActions from './EventActions'

export const dynamic = 'force-dynamic'

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const isAuthenticated = await isAdminAuthenticated()
  if (!isAuthenticated) {
    redirect('/admin/login')
  }

  const { id } = await params

  const event = await prisma.event.findUnique({
    where: { id },
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
      _count: {
        select: { ballots: true },
      },
    },
  })

  // Calculate vote statistics by group
  const groupStats = event?.groups.map((group) => {
    const candidateStats = group.candidates.map((candidate) => {
      const voteCount = candidate.votes.length
      const weightedScore = candidate.votes.reduce((sum, vote) => {
        return sum + getRoleWeight(vote.ballot.role)
      }, 0)
      return {
        id: candidate.id,
        name: candidate.name,
        voteCount,
        weightedScore,
      }
    })
    // Sort by weighted score descending
    candidateStats.sort((a, b) => b.weightedScore - a.weightedScore)
    return {
      id: group.id,
      name: group.name,
      candidateCount: group.candidates.length,
      candidates: candidateStats,
    }
  }) || []

  if (!event) {
    redirect('/admin')
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <header className="bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/admin" className="text-gray-300 hover:text-white">
            &larr; 返回
          </Link>
          <h1 className="text-xl font-bold">{event.name}</h1>
          <span
            className={`px-2 py-0.5 text-xs font-medium rounded-full ${
              event.isActive
                ? 'bg-green-500 text-white'
                : 'bg-gray-600 text-gray-200'
            }`}
          >
            {event.isActive ? '進行中' : '已結束'}
          </span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-green-600">
              {event._count.ballots}
            </div>
            <div className="text-sm text-gray-500">已投票</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-purple-600">
              {event.groups.length}
            </div>
            <div className="text-sm text-gray-500">組別</div>
          </div>
          <div className="bg-white rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-orange-600">
              {event.groups.reduce((sum, g) => sum + g.candidates.length, 0)}
            </div>
            <div className="text-sm text-gray-500">候選人</div>
          </div>
        </div>

        {/* Real-time Vote Statistics by Group */}
        <div className="bg-white rounded-xl p-6">
          <h2 className="font-semibold text-gray-900 mb-4">即時票數統計</h2>
          {groupStats.length === 0 ? (
            <p className="text-gray-500">尚無組別</p>
          ) : (
            <div className="space-y-6">
              {groupStats.map((group) => (
                <div key={group.id}>
                  <h3 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-sm rounded">
                      {group.name}
                    </span>
                    <span className="text-sm text-gray-500">
                      {group.candidateCount} 位候選人
                    </span>
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium text-gray-600">排名</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-600">姓名</th>
                          <th className="px-3 py-2 text-right font-medium text-gray-600">票數</th>
                          <th className="px-3 py-2 text-right font-medium text-gray-600">加權分數</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {group.candidates.map((candidate, index) => (
                          <tr key={candidate.id} className={index < 3 ? 'bg-yellow-50' : ''}>
                            <td className="px-3 py-2">
                              {index < 3 ? (
                                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                                  index === 0 ? 'bg-yellow-400 text-yellow-900' :
                                  index === 1 ? 'bg-gray-300 text-gray-700' :
                                  'bg-amber-600 text-white'
                                }`}>
                                  {index + 1}
                                </span>
                              ) : (
                                <span className="text-gray-500">{index + 1}</span>
                              )}
                            </td>
                            <td className="px-3 py-2 font-medium">{candidate.name}</td>
                            <td className="px-3 py-2 text-right text-gray-600">{candidate.voteCount}</td>
                            <td className="px-3 py-2 text-right font-bold text-blue-600">{candidate.weightedScore}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
          <p className="text-xs text-gray-400 mt-4">
            計分規則：學員票 = 1分，講師票 = 3分
          </p>
        </div>

        {/* Quick links */}
        <div className="bg-white rounded-xl p-6">
          <h2 className="font-semibold text-gray-900 mb-4">管理功能</h2>
          <Link
            href={`/admin/events/${event.id}/candidates`}
            className="block p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <h3 className="font-medium text-purple-900">候選人管理</h3>
            <p className="text-sm text-purple-600 mt-1">
              匯入 CSV、管理分組、編輯資料
            </p>
          </Link>
        </div>

        {/* Actions */}
        <EventActions event={{
          id: event.id,
          name: event.name,
          isActive: event.isActive,
        }} />
      </div>
    </main>
  )
}
