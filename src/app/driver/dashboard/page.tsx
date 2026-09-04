import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import Link from 'next/link'

export default async function DriverDashboard() {
  const cookieStore = await cookies()
  const pin = cookieStore.get('driver_pin')?.value
  
  if (!pin) redirect('/driver')
  
  const driver = await prisma.driver.findFirst({ where: { pin, active: true } })
  if (!driver) redirect('/driver')

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const jobs = await prisma.job.findMany({
    where: { driverId: driver.id, date: { gte: today, lt: tomorrow } },
    include: { client: true },
    orderBy: { date: 'asc' },
  })

  return (
    <main className="min-h-screen p-4 bg-slate-900 text-white">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Hi, {driver.name}</h1>
        <Link href="/api/driver-logout" className="text-slate-400 underline text-lg">Logout</Link>
      </div>

      <div className="space-y-4">
        {jobs.length === 0 && (
          <p className="text-slate-400 text-xl text-center mt-10">No jobs scheduled for today. Stay warm!</p>
        )}
        {jobs.map(job => (
          <Link key={job.id} href={`/driver/job/${job.id}`}
            className="block p-6 bg-slate-800 rounded-xl border-l-8 border-blue-500 hover:bg-slate-700 transition">
            <div className="text-2xl font-semibold">{job.client.name}</div>
            <div className="text-slate-300 text-lg mt-1">{job.client.address}</div>
            <div className="text-sm text-slate-400 mt-3 uppercase tracking-wide">
              Status: <span className="text-white font-bold">{job.stage}</span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}