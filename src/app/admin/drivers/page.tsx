import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import Link from 'next/link'

async function addDriver(formData: FormData) {
  'use server'
  const name = formData.get('name') as string
  const pin = formData.get('pin') as string
  
  await prisma.driver.create({ data: { name, pin, active: true } })
  redirect('/admin/drivers')
}

async function toggleDriver(formData: FormData) {
  'use server'
  const id = formData.get('id') as string
  const driver = await prisma.driver.findUnique({ where: { id } })
  
  if (driver) {
    await prisma.driver.update({ 
      where: { id }, 
      data: { active: !driver.active } 
    })
  }
  redirect('/admin/drivers')
}

async function deleteDriver(formData: FormData) {
  'use server'
  const id = formData.get('id') as string
  await prisma.driver.delete({ where: { id } })
  redirect('/admin/drivers')
}

export default async function AdminDrivers() {
  const cookieStore = await cookies()
  const auth = cookieStore.get('admin_auth')?.value
  if (!auth) redirect('/admin')

  const drivers = await prisma.driver.findMany({ orderBy: { name: 'asc' } })

  return (
    <main className="min-h-screen p-6 bg-slate-900 text-white">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Drivers</h1>
        <Link href="/admin/dashboard" className="text-blue-400 underline text-lg">← Back to Dashboard</Link>
      </div>

      <div className="bg-slate-800 rounded-xl p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Add New Driver</h2>
        <form action={addDriver} className="flex gap-4">
          <input 
            name="name" 
            type="text" 
            placeholder="Driver Name"
            className="flex-1 p-4 rounded-xl bg-slate-700 border-2 border-slate-600 focus:border-blue-500 outline-none" 
            required
          />
          <input 
            name="pin" 
            type="text" 
            placeholder="PIN (4 digits)"
            maxLength={4}
            className="w-40 p-4 rounded-xl bg-slate-700 border-2 border-slate-600 focus:border-blue-500 outline-none" 
            required
          />
          <button type="submit" className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-xl text-lg font-semibold transition">
            Add
          </button>
        </form>
      </div>

      <div className="space-y-4">
        {drivers.map(driver => (
          <div key={driver.id} className="flex justify-between items-center p-6 bg-slate-800 rounded-xl">
            <div>
              <div className="text-xl font-semibold">{driver.name}</div>
              <div className="text-slate-400">PIN: {driver.pin}</div>
            </div>
            <div className="flex gap-4">
              <form action={toggleDriver}>
                <input type="hidden" name="id" value={driver.id} />
                <button className={`px-6 py-2 rounded-xl text-lg font-semibold transition ${driver.active ? 'bg-green-600 hover:bg-green-700' : 'bg-slate-600 hover:bg-slate-700'}`}>
                  {driver.active ? 'Active' : 'Inactive'}
                </button>
              </form>
              <form action={deleteDriver}>
                <input type="hidden" name="id" value={driver.id} />
                <button className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-xl text-lg font-semibold transition">
                  Delete
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}