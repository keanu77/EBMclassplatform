import { redirect } from 'next/navigation'
import Link from 'next/link'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'
import AdminEventList from './AdminEventList'
import LogoutButton from './LogoutButton'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const isAuthenticated = await isAdminAuthenticated()

  if (!isAuthenticated) {
    redirect('/admin/login')
  }

  const events = await prisma.event.findMany({
    include: {
      _count: {
        select: { ballots: true, groups: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  const eventsData = events.map((event) => ({
    id: event.id,
    name: event.name,
    description: event.description,
    isActive: event.isActive,
    createdAt: event.createdAt.toISOString(),
    groupCount: event._count.groups,
    votedCount: event._count.ballots,
  }))

  return (
    <main className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">管理後台</h1>
          <LogoutButton />
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Actions */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">投票活動</h2>
          <Link
            href="/admin/events/new"
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            建立活動
          </Link>
        </div>

        {/* Event list */}
        <AdminEventList events={eventsData} />
      </div>
    </main>
  )
}
