'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface EventActionsProps {
  event: {
    id: string
    name: string
    isActive: boolean
  }
}

export default function EventActions({ event }: EventActionsProps) {
  const router = useRouter()

  const toggleActive = async () => {
    const action = event.isActive ? '關閉' : '開啟'
    if (!confirm(`確定要${action}投票？`)) return

    try {
      await fetch(`/api/admin/events/${event.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !event.isActive }),
      })
      router.refresh()
    } catch (error) {
      console.error('Toggle error:', error)
    }
  }

  const exportResults = async () => {
    window.open(`/api/admin/results/export?eventId=${event.id}`, '_blank')
  }

  return (
    <div className="bg-white rounded-xl p-6">
      <h2 className="font-semibold text-gray-900 mb-4">操作</h2>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={toggleActive}
          className={`px-4 py-2 font-medium rounded-lg transition-colors ${
            event.isActive
              ? 'bg-red-100 text-red-700 hover:bg-red-200'
              : 'bg-green-100 text-green-700 hover:bg-green-200'
          }`}
        >
          {event.isActive ? '關閉投票' : '開啟投票'}
        </button>

        {!event.isActive && (
          <>
            <Link
              href={`/results/${event.id}`}
              target="_blank"
              className="px-4 py-2 bg-blue-100 text-blue-700 font-medium rounded-lg hover:bg-blue-200 transition-colors"
            >
              查看結果頁
            </Link>
            <button
              onClick={exportResults}
              className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              匯出結果 CSV
            </button>
          </>
        )}
      </div>
    </div>
  )
}
