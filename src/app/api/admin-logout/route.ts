import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  const cookieStore = await cookies()
  cookieStore.delete('admin_auth')
  return NextResponse.redirect(new URL('/admin', process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'))
}