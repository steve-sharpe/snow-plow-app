import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import Link from 'next/link'

export default async function AdminDashboard() {
  const cookieStore = await cookies()
  const auth = cookieStore.get('admin_auth')?.value
  
  if (!auth) redirect('/admin')

  const drivers = await prisma.driver.count()
  const clients = await prisma.client.count()
  const jobs = await prisma.job.count()

  return (
    <main className="min-h-screen p-6 bg-slate-900 text-white">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Link href="/api/admin-logout" className="text-slate-400 underline text-lg">Logout</Link>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-10">
        <Link href="/admin/drivers" className="block p-8 bg-slate-800 rounded-xl border-l-8 border-blue-500 hover:bg-slate-700 transition">
          <div className="text-4xl font-bold">{drivers}</div>
          <div className="text-slate-300 text-lg mt-2">Drivers</div>
        </Link>
        <Link href="/admin/clients" className="block p-8 bg-slate-800 rounded-xl border-l-8 border-green-500 hover:bg-slate-700 transition">
          <div className="text-4xl font-bold">{clients}</div>
          <div className="text-slate-300 text-lg mt-2">Clients</div>
        </Link>
        <Link href="/admin/jobs" className="block p-8 bg-slate-800 rounded-xl border-l-8 border-yellow-500 hover:bg-slate-700 transition">
          <div className="text-4xl font-bold">{jobs}</div>
          <div className="text-slate-300 text-lg mt-2">Jobs</div>
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <Link href="/admin/drivers" className="block p-6 bg-slate-800 rounded-xl hover:bg-slate-700 transition">
          <h2 className="text-2xl font-semibold mb-2">Manage Drivers</h2>
          <p className="text-slate-400">Add, edit, or remove drivers and their PINs</p>
        </Link>
        <Link href="/admin/clients" className="block p-6 bg-slate-800 rounded-xl hover:bg-slate-700 transition">
          <h2 className="text-2xl font-semibold mb-2">Manage Clients</h2>
          <p className="text-slate-400">Add, edit, or remove client information</p>
        </Link>
        <Link href="/admin/jobs" className="block p-6 bg-slate-800 rounded-xl hover:bg-slate-700 transition">
          <h2 className="text-2xl font-semibold mb-2">Manage Jobs</h2>
          <p className="text-slate-400">Schedule and track plowing jobs</p>
        </Link>
      </div>
    </main>
  )
}