'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Event {
  id: string
  name: string
  description: string | null
}

export default function HomePage() {
  const [events, setEvents] = useState<Event[]>([])
  const [selectedEvent, setSelectedEvent] = useState('')
  const [role, setRole] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/events/active')
      .then((res) => res.json())
      .then((data) => {
        setEvents(data.events || [])
        if (data.events?.length === 1) {
          setSelectedEvent(data.events[0].id)
        }
      })
      .catch(() => setError('無法載入活動'))
      .finally(() => setLoading(false))
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedEvent) {
      setError('請選擇投票活動')
      return
    }
    if (!role) {
      setError('請選擇您的身份')
      return
    }

    router.push(`/vote?eventId=${selectedEvent}&role=${role}`)
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">載入中...</div>
      </main>
    )
  }

  if (events.length === 0) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">投票平台</h1>
          <p className="text-gray-500">目前沒有進行中的投票活動</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">投票平台</h1>
            <p className="text-gray-500">請選擇您的身份開始投票</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Event selection (if multiple) */}
            {events.length > 1 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  選擇投票活動
                </label>
                <select
                  value={selectedEvent}
                  onChange={(e) => setSelectedEvent(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                >
                  <option value="">請選擇</option>
                  {events.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Show event name if only one */}
            {events.length === 1 && (
              <div className="p-4 bg-blue-50 rounded-xl text-center">
                <p className="font-semibold text-blue-900">{events[0].name}</p>
                {events[0].description && (
                  <p className="text-sm text-blue-600 mt-1">{events[0].description}</p>
                )}
              </div>
            )}

            {/* Role selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                請選擇您的身份
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRole('learner')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    role === 'learner'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-2">🎓</div>
                  <div className="font-semibold text-gray-900">學員</div>
                  <div className="text-xs text-gray-500 mt-1">Learner</div>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('instructor')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    role === 'instructor'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-2">👨‍🏫</div>
                  <div className="font-semibold text-gray-900">講師</div>
                  <div className="text-xs text-gray-500 mt-1">Instructor</div>
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm text-center">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={!role || !selectedEvent}
              className="w-full py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              開始投票
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
