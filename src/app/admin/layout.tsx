import { redirect } from 'next/navigation'
import { isAdminAuthenticated } from '@/lib/admin-auth'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const isAuthenticated = await isAdminAuthenticated()
  const isLoginPage = false // This is handled at runtime

  // Allow login page to render without authentication
  // The actual check happens in the page components

  return <>{children}</>
}

export async function generateMetadata() {
  return {
    title: '管理後台 | 投票平台',
  }
}
