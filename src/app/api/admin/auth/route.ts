import { NextRequest, NextResponse } from 'next/server'
import { setAdminSession, clearAdminSession, verifyAdminPassword } from '@/lib/admin-auth'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    if (!verifyAdminPassword(password)) {
      return NextResponse.json({ error: '密碼錯誤' }, { status: 401 })
    }

    await setAdminSession()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin auth error:', error)
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    await clearAdminSession()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin logout error:', error)
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 })
  }
}
