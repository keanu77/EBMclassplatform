'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface Candidate {
  id: string
  name: string
  description: string | null
}

interface Group {
  id: string
  name: string
  candidates: Candidate[]
}

interface CandidateManagementProps {
  eventId: string
  groups: Group[]
}

export default function CandidateManagement({
  eventId,
  groups,
}: CandidateManagementProps) {
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImporting(true)
    setError('')
    setSuccess('')

    try {
      const text = await file.text()
      const res = await fetch('/api/admin/candidates/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, csvData: text }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || '匯入失敗')
        return
      }

      setSuccess(`成功匯入 ${data.count} 位候選人`)
      router.refresh()
    } catch {
      setError('網路錯誤')
    } finally {
      setImporting(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const deleteCandidate = async (candidateId: string) => {
    if (!confirm('確定要刪除此候選人？')) return

    try {
      await fetch(`/api/admin/candidates/${candidateId}`, { method: 'DELETE' })
      router.refresh()
    } catch (error) {
      console.error('Delete error:', error)
    }
  }

  const totalCandidates = groups.reduce((sum, g) => sum + g.candidates.length, 0)

  return (
    <div className="space-y-6">
      {/* Stats & Actions */}
      <div className="bg-white rounded-xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="font-semibold text-gray-900">
              {totalCandidates} 位候選人
            </h2>
            <p className="text-sm text-gray-500">{groups.length} 個組別</p>
          </div>
          <label className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 cursor-pointer transition-colors">
            {importing ? '匯入中...' : '匯入 CSV'}
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleImport}
              disabled={importing}
              className="hidden"
            />
          </label>
        </div>

        {/* CSV format hint */}
        <div className="p-3 bg-gray-50 rounded-lg text-sm">
          <p className="font-medium text-gray-700 mb-1">CSV 格式：</p>
          <code className="text-gray-600">name,description,group</code>
          <p className="text-gray-500 mt-1">
            • group 為組別名稱，相同名稱會歸入同一組
            <br />• description 可省略
          </p>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}
      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-600 text-sm">{success}</p>
        </div>
      )}

      {/* Candidate list by group */}
      {groups.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center text-gray-500">
          尚無候選人，請匯入 CSV 檔案
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map((group) => (
            <div key={group.id} className="bg-white rounded-xl overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b">
                <h3 className="font-semibold text-gray-900">{group.name}</h3>
                <p className="text-sm text-gray-500">
                  {group.candidates.length} 位候選人
                </p>
              </div>
              <div className="divide-y">
                {group.candidates.map((candidate) => (
                  <div
                    key={candidate.id}
                    className="px-4 py-3 flex items-center justify-between hover:bg-gray-50"
                  >
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {candidate.name}
                      </h4>
                      {candidate.description && (
                        <p className="text-sm text-gray-500 line-clamp-1">
                          {candidate.description}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => deleteCandidate(candidate.id)}
                      className="text-red-600 text-sm hover:underline"
                    >
                      刪除
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
