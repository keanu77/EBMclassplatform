'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

interface Candidate {
  id: string
  name: string
  description: string | null
  groupName: string
}

interface EventInfo {
  eventName: string
  maxVotes: number
}

function VoteContent() {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [eventInfo, setEventInfo] = useState<EventInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const eventId = searchParams.get('eventId')
  const role = searchParams.get('role')

  const fetchData = useCallback(async () => {
    if (!eventId || !role) {
      router.push('/')
      return
    }

    try {
      // Fetch event info
      const eventRes = await fetch(`/api/events/${eventId}`)
      if (!eventRes.ok) {
        setError('活動不存在或已結束')
        setLoading(false)
        return
      }
      const eventData = await eventRes.json()

      if (!eventData.isActive) {
        setError('投票已結束')
        setLoading(false)
        return
      }

      setEventInfo({
        eventName: eventData.name,
        maxVotes: eventData.maxVotes,
      })

      // Fetch candidates
      const candidatesRes = await fetch(`/api/candidates?eventId=${eventId}`)
      if (candidatesRes.ok) {
        const candidatesData = await candidatesRes.json()
        setCandidates(candidatesData)
      }
    } catch {
      setError('載入失敗')
    } finally {
      setLoading(false)
    }
  }, [eventId, role, router])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const toggleSelect = (candidateId: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(candidateId)) {
      newSelected.delete(candidateId)
    } else if (eventInfo && newSelected.size < eventInfo.maxVotes) {
      newSelected.add(candidateId)
    }
    setSelectedIds(newSelected)
  }

  const handleSubmit = async () => {
    if (!eventId || !role || !eventInfo) return

    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          role,
          candidateIds: Array.from(selectedIds),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || '投票失敗')
        setShowConfirm(false)
        return
      }

      router.push('/success')
    } catch {
      setError('網路錯誤')
      setShowConfirm(false)
    } finally {
      setSubmitting(false)
    }
  }

  // Group candidates by group name
  const groupedCandidates = candidates.reduce((acc, candidate) => {
    if (!acc[candidate.groupName]) {
      acc[candidate.groupName] = []
    }
    acc[candidate.groupName].push(candidate)
    return acc
  }, {} as Record<string, Candidate[]>)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">載入中...</div>
      </div>
    )
  }

  if (error && !candidates.length) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="text-blue-600 hover:underline"
          >
            返回首頁
          </button>
        </div>
      </div>
    )
  }

  const remainingVotes = eventInfo ? eventInfo.maxVotes - selectedIds.size : 0
  const roleLabel = role === 'instructor' ? '講師' : '學員'

  return (
    <main className="min-h-screen pb-32">
      {/* Header */}
      <header className="sticky top-0 bg-white shadow-sm z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-lg font-bold text-gray-900">{eventInfo?.eventName}</h1>
          <p className="text-sm text-gray-500">
            身份：{roleLabel}，請選擇 {eventInfo?.maxVotes} 位候選人
          </p>
        </div>
      </header>

      {/* Vote counter */}
      <div className="sticky top-[72px] bg-blue-50 border-b border-blue-100 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <span className="text-blue-700 font-medium">
            剩餘票數: {remainingVotes} / {eventInfo?.maxVotes}
          </span>
          <div className="flex gap-1">
            {Array.from({ length: eventInfo?.maxVotes || 0 }).map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full ${
                  i < selectedIds.size ? 'bg-blue-600' : 'bg-blue-200'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="max-w-2xl mx-auto px-4 mt-4">
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm text-center">{error}</p>
          </div>
        </div>
      )}

      {/* Candidates list */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-8">
        {Object.entries(groupedCandidates).map(([groupName, groupCandidates]) => (
          <div key={groupName}>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              {groupName}
            </h2>
            <div className="space-y-3">
              {groupCandidates.map((candidate) => {
                const isSelected = selectedIds.has(candidate.id)
                const isDisabled = !isSelected && remainingVotes === 0

                return (
                  <button
                    key={candidate.id}
                    onClick={() => toggleSelect(candidate.id)}
                    disabled={isDisabled}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : isDisabled
                        ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          isSelected
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-300'
                        }`}
                      >
                        {isSelected && (
                          <svg
                            className="w-4 h-4 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900">{candidate.name}</h3>
                        {candidate.description && (
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                            {candidate.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Fixed submit button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <button
            onClick={() => setShowConfirm(true)}
            disabled={selectedIds.size !== eventInfo?.maxVotes}
            className="w-full py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {selectedIds.size === eventInfo?.maxVotes
              ? '確認送出'
              : `請選擇 ${remainingVotes} 位候選人`}
          </button>
        </div>
      </div>

      {/* Confirm modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">確認投票</h2>
            <p className="text-gray-600 mb-2">身份：{roleLabel}</p>
            <p className="text-gray-600 mb-4">您選擇的候選人：</p>
            <ul className="mb-6 space-y-2">
              {Array.from(selectedIds).map((id) => {
                const candidate = candidates.find((c) => c.id === id)
                return (
                  <li key={id} className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span className="font-medium">{candidate?.name}</span>
                  </li>
                )
              })}
            </ul>
            <p className="text-sm text-red-600 mb-6">
              送出後無法修改，請確認您的選擇！
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={submitting}
                className="flex-1 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
              >
                {submitting ? '送出中...' : '確認送出'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default function VotePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">載入中...</div>
      </div>
    }>
      <VoteContent />
    </Suspense>
  )
}
