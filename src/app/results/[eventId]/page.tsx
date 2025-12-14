'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'

interface CandidateResult {
  id: string
  name: string
  description: string | null
  voteCount: number
  weightedScore: number
  groupName?: string
}

interface GroupResult {
  groupId: string
  groupName: string
  candidates: CandidateResult[]
  top3: CandidateResult[]
}

interface ResultsData {
  eventId: string
  eventName: string
  resultsByGroup: GroupResult[]
  overallTop3: CandidateResult[]
}

export default function ResultsPage({
  params,
}: {
  params: Promise<{ eventId: string }>
}) {
  const { eventId } = use(params)
  const [data, setData] = useState<ResultsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await fetch(`/api/results/${eventId}`)
        const result = await res.json()

        if (!res.ok) {
          setError(result.error || '載入失敗')
          return
        }

        setData(result)
      } catch {
        setError('網路錯誤')
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [eventId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">載入中...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md">
          <p className="text-red-600 mb-4">{error}</p>
          <Link href="/" className="text-blue-600 hover:underline">
            返回首頁
          </Link>
        </div>
      </div>
    )
  }

  if (!data) return null

  const getMedalColor = (rank: number) => {
    switch (rank) {
      case 0:
        return 'bg-yellow-400 text-yellow-900'
      case 1:
        return 'bg-gray-300 text-gray-700'
      case 2:
        return 'bg-amber-600 text-amber-100'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  return (
    <main className="min-h-screen pb-8">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">{data.eventName}</h1>
          <p className="text-gray-500 mt-1">投票結果</p>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-8">
        {/* Overall Top 3 */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-4">總排名 Top 3</h2>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6">
            <div className="space-y-4">
              {data.overallTop3.map((candidate, index) => (
                <div
                  key={candidate.id}
                  className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-4"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${getMedalColor(
                      index
                    )}`}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{candidate.name}</h3>
                    <p className="text-sm text-gray-500">{candidate.groupName}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">
                      {candidate.weightedScore}
                    </div>
                    <div className="text-xs text-gray-400">加權分數</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Results by Group */}
        {data.resultsByGroup.map((group) => (
          <section key={group.groupId}>
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              {group.groupName} Top 3
            </h2>
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {group.top3.map((candidate, index) => (
                <div
                  key={candidate.id}
                  className={`p-4 flex items-center gap-4 ${
                    index < group.top3.length - 1 ? 'border-b' : ''
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${getMedalColor(
                      index
                    )}`}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{candidate.name}</h3>
                    {candidate.description && (
                      <p className="text-sm text-gray-500 line-clamp-1">
                        {candidate.description}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-blue-600">
                      {candidate.weightedScore}
                    </div>
                    <div className="text-xs text-gray-400">{candidate.voteCount} 票</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Full results (collapsed by default) */}
            {group.candidates.length > 3 && (
              <details className="mt-2">
                <summary className="text-sm text-blue-600 cursor-pointer hover:underline">
                  查看完整排名 ({group.candidates.length} 人)
                </summary>
                <div className="mt-2 bg-gray-50 rounded-xl p-4 space-y-2">
                  {group.candidates.slice(3).map((candidate, index) => (
                    <div
                      key={candidate.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-gray-600">
                        {index + 4}. {candidate.name}
                      </span>
                      <span className="text-gray-500">
                        {candidate.weightedScore} 分 / {candidate.voteCount} 票
                      </span>
                    </div>
                  ))}
                </div>
              </details>
            )}
          </section>
        ))}

        {/* Legend */}
        <section className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
          <h3 className="font-semibold mb-2">計分說明</h3>
          <ul className="space-y-1">
            <li>• 學員 (Learner) 每票 = 1 分</li>
            <li>• 講師 (Instructor) 每票 = 3 分</li>
            <li>• 加權分數 = 所有投票權重加總</li>
          </ul>
        </section>
      </div>
    </main>
  )
}
