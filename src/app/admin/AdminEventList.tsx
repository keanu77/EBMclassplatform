'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface EventData {
  id: string
  name: string
  description: string | null
  isActive: boolean
  createdAt: string
  groupCount: number
  votedCount: number
}

export default function AdminEventList({ events }: { events: EventData[] }) {
  const router = useRouter()

  const toggleActive = async (eventId: string, currentActive: boolean) => {
    try {
      await fetch(`/api/admin/events/${eventId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentActive }),
      })
      router.refresh()
    } catch (error) {
      console.error('Toggle error:', error)
    }
  }

  const deleteEvent = async (eventId: string) => {
    if (!confirm('確定要刪除此活動？所有相關資料將被刪除。')) {
      return
    }

    try {
      await fetch(`/api/admin/events/${eventId}`, { method: 'DELETE' })
      router.refresh()
    } catch (error) {
      console.error('Delete error:', error)
    }
  }

  if (events.length === 0) {
    return (
      <div className="bg-white rounded-xl p-8 text-center text-gray-500">
        尚無投票活動，點擊上方按鈕建立第一個活動
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <div key={event.id} className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg text-gray-900">{event.name}</h3>
                <span
                  className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                    event.isActive
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {event.isActive ? '進行中' : '已結束'}
                </span>
              </div>
              {event.description && (
                <p className="text-gray-500 text-sm mt-1">{event.description}</p>
              )}
            </div>
            <button
              onClick={() => toggleActive(event.id, event.isActive)}
              className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
                event.isActive
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              {event.isActive ? '關閉投票' : '開啟投票'}
            </button>
          </div>

          <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
            <span>{event.groupCount} 組</span>
            <span>{event.votedCount} 人已投票</span>
            <span>
              建立於 {new Date(event.createdAt).toLocaleDateString('zh-TW')}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href={`/admin/events/${event.id}`}
              className="px-3 py-1.5 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              管理
            </Link>
            <Link
              href={`/admin/events/${event.id}/candidates`}
              className="px-3 py-1.5 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              候選人
            </Link>
            {!event.isActive && (
              <Link
                href={`/results/${event.id}`}
                className="px-3 py-1.5 text-sm font-medium bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                target="_blank"
              >
                查看結果
              </Link>
            )}
            <button
              onClick={() => deleteEvent(event.id)}
              className="px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-auto"
            >
              刪除
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
