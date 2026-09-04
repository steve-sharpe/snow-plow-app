import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import Link from 'next/link'

async function addClient(formData: FormData) {
  'use server'
  const name = formData.get('name') as string
  const address = formData.get('address') as string
  const email = formData.get('email') as string

  await prisma.client.create({ data: { name, address, email } })
  redirect('/admin/clients')
}

async function updateClient(formData: FormData) {
  'use server'
  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const address = formData.get('address') as string
  const email = formData.get('email') as string

  await prisma.client.update({ where: { id }, data: { name, address, email } })
  redirect('/admin/clients')
}

async function deleteClient(formData: FormData) {
  'use server'
  const id = formData.get('id') as string
  await prisma.client.delete({ where: { id } })
  redirect('/admin/clients')
}

export default async function AdminClients() {
  const cookieStore = await cookies()
  const auth = cookieStore.get('admin_auth')?.value
  if (!auth) redirect('/admin')

  const clients = await prisma.client.findMany({ orderBy: { name: 'asc' } })

  return (
    <main className="min-h-screen p-6 bg-slate-900 text-white">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Clients</h1>
        <Link href="/admin/dashboard" className="text-blue-400 underline text-lg">← Back to Dashboard</Link>
      </div>

      <div className="bg-slate-800 rounded-xl p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Add New Client</h2>
        <form action={addClient} className="flex flex-col gap-4">
          <input 
            name="name" 
            type="text" 
            placeholder="Client Name"
            className="p-4 rounded-xl bg-slate-700 border-2 border-slate-600 focus:border-blue-500 outline-none" 
            required
          />
          <input 
            name="address" 
            type="text" 
            placeholder="Address"
            className="p-4 rounded-xl bg-slate-700 border-2 border-slate-600 focus:border-blue-500 outline-none" 
            required
          />
          <input 
            name="email" 
            type="email" 
            placeholder="Email"
            className="p-4 rounded-xl bg-slate-700 border-2 border-slate-600 focus:border-blue-500 outline-none" 
            required
          />
          <button type="submit" className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-xl text-lg font-semibold transition">
            Add Client
          </button>
        </form>
      </div>

      <div className="space-y-6">
        {clients.map(client => (
          <div key={client.id} className="p-6 bg-slate-800 rounded-xl">
            <form action={updateClient} className="flex flex-col gap-4">
              <input type="hidden" name="id" value={client.id} />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Name</label>
                  <input 
                    name="name" 
                    type="text" 
                    defaultValue={client.name}
                    className="w-full p-3 rounded-xl bg-slate-700 border-2 border-slate-600 focus:border-blue-500 outline-none" 
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Address</label>
                  <input 
                    name="address" 
                    type="text" 
                    defaultValue={client.address}
                    className="w-full p-3 rounded-xl bg-slate-700 border-2 border-slate-600 focus:border-blue-500 outline-none" 
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Email</label>
                  <input 
                    name="email" 
                    type="email" 
                    defaultValue={client.email}
                    className="w-full p-3 rounded-xl bg-slate-700 border-2 border-slate-600 focus:border-blue-500 outline-none" 
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button type="submit" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl text-lg font-semibold transition">
                  Save Changes
                </button>
                <button 
                  type="submit" 
                  form={`delete-${client.id}`}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-xl text-lg font-semibold transition"
                >
                  Delete
                </button>
              </div>
            </form>
            <form id={`delete-${client.id}`} action={deleteClient}>
              <input type="hidden" name="id" value={client.id} />
            </form>
          </div>
        ))}
      </div>
    </main>
  )
}