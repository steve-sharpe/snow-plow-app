import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

async function loginAdmin(formData: FormData) {
  'use server'
  const username = formData.get('username') as string
  const password = formData.get('password') as string
  const secret = process.env.ADMIN_SECRET || '1234'

  if (username === 'admin' && password === secret) {
    const cookieStore = await cookies()
    cookieStore.set('admin_auth', 'true', { httpOnly: true, sameSite: 'lax' })
    redirect('/admin/dashboard')
  }
  redirect('/admin?error=invalid')
}

export default async function AdminLogin({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-900 text-white">
      <h1 className="text-3xl font-bold mb-8">Admin Login</h1>
      {error && (
        <p className="text-red-500 mb-4 text-xl">Invalid credentials. Try again.</p>
      )}
      <form action={loginAdmin} className="flex flex-col gap-4 w-full max-w-xs">
        <input 
          name="username" 
          type="text" 
          placeholder="Username"
          className="text-xl p-4 rounded-xl bg-slate-800 border-2 border-slate-600 focus:border-blue-500 outline-none" 
          autoFocus
        />
        <input 
          name="password" 
          type="password" 
          placeholder="Password"
          className="text-xl p-4 rounded-xl bg-slate-800 border-2 border-slate-600 focus:border-blue-500 outline-none" 
        />
        <button type="submit" className="w-full px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-xl text-xl font-semibold transition">
          Login
        </button>
      </form>
      <p className="text-slate-400 mt-8 text-sm">Username: admin — Password: your ADMIN_SECRET value</p>
    </main>
  )
}