import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import Link from 'next/link'

async function addJob(formData: FormData) {
  'use server'
  const clientId = formData.get('clientId') as string
  const driverId = (formData.get('driverId') as string) || null
  const date = formData.get('date') as string
  
  await prisma.job.create({ 
    data: { 
      clientId, 
      driverId, 
      date: new Date(date),
      stage: 'scheduled'
    } 
  })
  redirect('/admin/jobs')
}

async function updateJobStage(formData: FormData) {
  'use server'
  const id = formData.get('id') as string
  const stage = formData.get('stage') as string
  
  await prisma.job.update({ where: { id }, data: { stage } })
  redirect('/admin/jobs')
}

async function updateJobDriver(formData: FormData) {
  'use server'
  const id = formData.get('id') as string
  const driverId = (formData.get('driverId') as string) || null
  
  await prisma.job.update({ where: { id }, data: { driverId } })
  redirect('/admin/jobs')
}

async function deleteJob(formData: FormData) {
  'use server'
  const id = formData.get('id') as string
  await prisma.job.delete({ where: { id } })
  redirect('/admin/jobs')
}

export default async function AdminJobs() {
  const cookieStore = await cookies()
  const auth = cookieStore.get('admin_auth')?.value
  if (!auth) redirect('/admin')

  const jobs = await prisma.job.findMany({ 
    include: { client: true, driver: true },
    orderBy: { date: 'desc' }
  })
  const clients = await prisma.client.findMany({ orderBy: { name: 'asc' } })
  const drivers = await prisma.driver.findMany({ where: { active: true }, orderBy: { name: 'asc' } })

  return (
    <main className="min-h-screen p-6 bg-slate-900 text-white">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Jobs</h1>
        <Link href="/admin/dashboard" className="text-blue-400 underline text-lg">← Back to Dashboard</Link>
      </div>

      <div className="bg-slate-800 rounded-xl p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Schedule New Job</h2>
        <form action={addJob} className="flex flex-col gap-4">
          <select 
            name="clientId" 
            className="p-4 rounded-xl bg-slate-700 border-2 border-slate-600 focus:border-blue-500 outline-none" 
            required
          >
            <option value="">Select Client</option>
            {clients.map(client => (
              <option key={client.id} value={client.id}>{client.name} - {client.address}</option>
            ))}
          </select>
          <select 
            name="driverId" 
            className="p-4 rounded-xl bg-slate-700 border-2 border-slate-600 focus:border-blue-500 outline-none" 
          >
            <option value="">Unassigned</option>
            {drivers.map(driver => (
              <option key={driver.id} value={driver.id}>{driver.name}</option>
            ))}
          </select>
          <input 
            name="date" 
            type="date" 
            className="p-4 rounded-xl bg-slate-700 border-2 border-slate-600 focus:border-blue-500 outline-none" 
            required
          />
          <button type="submit" className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-xl text-lg font-semibold transition">
            Schedule Job
          </button>
        </form>
      </div>

      <div className="space-y-4">
        {jobs.map(job => (
          <div key={job.id} className="p-6 bg-slate-800 rounded-xl">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="text-xl font-semibold">{job.client.name}</div>
                <div className="text-slate-400">{job.client.address}</div>
                <div className="text-slate-400 text-sm">Date: {new Date(job.date).toLocaleDateString()}</div>
              </div>
              <form action={deleteJob}>
                <input type="hidden" name="id" value={job.id} />
                <button className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-semibold transition">
                  Delete
                </button>
              </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <form action={updateJobDriver} className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="block text-sm text-slate-400 mb-1">Assigned Driver</label>
                  <select 
                    name="driverId" 
                    defaultValue={job.driverId ?? ''}
                    className="w-full p-2 rounded-lg bg-slate-700 border border-slate-600 text-sm"
                  >
                    <option value="">Unassigned</option>
                    {drivers.map(driver => (
                      <option key={driver.id} value={driver.id}>{driver.name}</option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-semibold transition">
                  Assign
                </button>
              </form>

              <form action={updateJobStage} className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="block text-sm text-slate-400 mb-1">Stage</label>
                  <select 
                    name="stage" 
                    defaultValue={job.stage}
                    className="w-full p-2 rounded-lg bg-slate-700 border border-slate-600 text-sm"
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="enroute">En Route</option>
                    <option value="plowing">Plowing</option>
                    <option value="completed">Completed</option>
                    <option value="issue">Issue</option>
                  </select>
                </div>
                <button type="submit" className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-semibold transition">
                  Update
                </button>
              </form>
            </div>

            <div className="text-sm mt-4">
              Status: <span className="text-white font-bold uppercase">{job.stage}</span>
              {' · '}Driver: <span className="text-white font-bold">{job.driver?.name || 'Unassigned'}</span>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}