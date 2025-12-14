'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewEventPage() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [maxVotes, setMaxVotes] = useState(3)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('請輸入活動名稱')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/admin/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, maxVotes }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || '建立失敗')
        return
      }

      const event = await res.json()
      router.push(`/admin/events/${event.id}`)
    } catch {
      setError('網路錯誤')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <header className="bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/admin" className="text-gray-300 hover:text-white">
            &larr; 返回
          </Link>
          <h1 className="text-xl font-bold">建立投票活動</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                活動名稱 *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例如：2024 年度最佳講師票選"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                活動描述
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="選填，活動說明或備註"
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                每人可投票數
              </label>
              <input
                type="number"
                value={maxVotes}
                onChange={(e) => setMaxVotes(parseInt(e.target.value) || 1)}
                min={1}
                max={10}
                className="w-24 px-4 py-3 border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
              />
              <p className="text-sm text-gray-500 mt-1">
                每位投票者需選擇的候選人數量
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <Link
                href="/admin"
                className="px-6 py-3 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
              >
                {loading ? '建立中...' : '建立活動'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}
