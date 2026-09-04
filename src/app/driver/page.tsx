import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'

async function loginDriver(formData: FormData) {
  'use server'
  const pin = formData.get('pin') as string
  const driver = await prisma.driver.findFirst({ where: { pin, active: true } })
  
  if (driver) {
    const cookieStore = await cookies()
    cookieStore.set('driver_pin', driver.pin, { httpOnly: true, sameSite: 'lax' })
    redirect('/driver/dashboard')
  }
  redirect('/driver?error=invalid')
}

export default function DriverLogin({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-900 text-white">
      <h1 className="text-3xl font-bold mb-8">Enter your PIN</h1>
      {searchParams.error && (
        <p className="text-red-500 mb-4 text-xl">Invalid PIN. Try again.</p>
      )}
      <form action={loginDriver} className="flex flex-col gap-4 w-full max-w-xs">
        <input 
          name="pin" 
          type="password" 
          inputMode="numeric" 
          pattern="[0-9]*" 
          maxLength={4}
          placeholder="0000"
          className="text-4xl text-center p-6 rounded-xl bg-slate-800 border-2 border-slate-600 focus:border-blue-500 outline-none" 
          autoFocus
        />
        <button type="submit" className="w-full px-8 py-6 bg-blue-600 hover:bg-blue-700 rounded-xl text-2xl font-semibold transition">
          Go
        </button>
      </form>
    </main>
  )
}