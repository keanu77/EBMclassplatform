import { redirect } from 'next/navigation'
import Link from 'next/link'
import { isAdminAuthenticated } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'
import CandidateManagement from './CandidateManagement'

export const dynamic = 'force-dynamic'

export default async function CandidatesPage({
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
            orderBy: { name: 'asc' },
          },
        },
        orderBy: { name: 'asc' },
      },
    },
  })

  if (!event) {
    redirect('/admin')
  }

  const groups = event.groups.map((g) => ({
    id: g.id,
    name: g.name,
    candidates: g.candidates.map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description,
    })),
  }))

  return (
    <main className="min-h-screen bg-gray-100">
      <header className="bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            href={`/admin/events/${event.id}`}
            className="text-gray-300 hover:text-white"
          >
            &larr; 返回
          </Link>
          <h1 className="text-xl font-bold">候選人管理</h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <CandidateManagement eventId={event.id} groups={groups} />
      </div>
    </main>
  )
}
