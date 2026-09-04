import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import Link from 'next/link'

async function updateTemplate(formData: FormData) {
  'use server'
  const id = formData.get('id') as string
  const subject = formData.get('subject') as string
  const body = formData.get('body') as string
  
  await prisma.emailTemplate.update({ 
    where: { id }, 
    data: { subject, body } 
  })
  redirect('/admin/templates')
}

export default async function AdminTemplates() {
  const cookieStore = await cookies()
  const auth = cookieStore.get('admin_auth')?.value
  if (!auth) redirect('/admin')

  const templates = await prisma.emailTemplate.findMany({ orderBy: { stage: 'asc' } })

  const stageLabels: Record<string, string> = {
    enroute: '🚛 En Route',
    plowing: '❄️ Plowing',
    completed: '✅ Completed',
    issue: '⚠️ Issue',
  }

  return (
    <main className="min-h-screen p-6 bg-slate-900 text-white">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Email Templates</h1>
        <Link href="/admin/dashboard" className="text-blue-400 underline text-lg">← Back to Dashboard</Link>
      </div>

      <p className="text-slate-400 mb-8 text-lg">
        Customize the emails sent to clients. Use <code className="bg-slate-800 px-2 py-1 rounded text-blue-400">{'{{clientName}}'}</code> and <code className="bg-slate-800 px-2 py-1 rounded text-blue-400">{'{{address}}'}</code> as placeholders.
      </p>

      <div className="space-y-8">
        {templates.map(template => (
          <div key={template.id} className="bg-slate-800 rounded-xl p-6">
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">
              {stageLabels[template.stage] || template.stage}
            </h2>
            <form action={updateTemplate} className="flex flex-col gap-4">
              <input type="hidden" name="id" value={template.id} />
              
              <div>
                <label className="block text-sm text-slate-400 mb-1">Subject Line</label>
                <input 
                  name="subject" 
                  type="text" 
                  defaultValue={template.subject}
                  className="w-full p-4 rounded-xl bg-slate-700 border-2 border-slate-600 focus:border-blue-500 outline-none text-white" 
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Email Body</label>
                <textarea 
                  name="body" 
                  defaultValue={template.body}
                  rows={4}
                  className="w-full p-4 rounded-xl bg-slate-700 border-2 border-slate-600 focus:border-blue-500 outline-none text-white resize-y" 
                  required
                />
              </div>

              <div className="flex justify-end">
                <button type="submit" className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl text-lg font-semibold transition">
                  Save Template
                </button>
              </div>
            </form>
          </div>
        ))}
      </div>
    </main>
  )
}