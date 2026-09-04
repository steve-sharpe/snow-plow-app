import { prisma } from '@/lib/db'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'

async function updateStage(formData: FormData) {
  'use server'
  const jobId = formData.get('jobId') as string
  const stage = formData.get('stage') as string

  // 1. Update database
  await prisma.job.update({ where: { id: jobId }, data: { stage } })

  // 2. Trigger email (non-blocking)
  try {
    const { sendStageEmail } = await import('@/lib/email')
    await sendStageEmail(jobId, stage)
  } catch (e) {
    console.error('Email failed:', e)
  }

  // 3. Refresh UI
  revalidatePath(`/driver/job/${jobId}`)
}

export default async function JobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const cookieStore = await cookies()
  const pin = cookieStore.get('driver_pin')?.value
  
  if (!pin) redirect('/driver')

  const job = await prisma.job.findUnique({
    where: { id },
    include: { client: true },
  })

  if (!job) return <div className="p-6 text-white">Job not found</div>

  const stages = [
    { key: 'enroute', label: '🚛 En Route', color: 'bg-yellow-500 hover:bg-yellow-600' },
    { key: 'plowing', label: '❄️ Plowing', color: 'bg-blue-500 hover:bg-blue-600' },
    { key: 'completed', label: '✅ Completed', color: 'bg-green-500 hover:bg-green-600' },
    { key: 'issue', label: '⚠️ Issue', color: 'bg-red-500 hover:bg-red-600' },
  ]

  return (
    <main className="min-h-screen p-4 bg-slate-900 text-white">
      <Link href="/driver/dashboard" className="text-blue-400 underline mb-6 block text-lg">← Back to Jobs</Link>
      
      <h1 className="text-4xl font-bold mb-2">{job.client.name}</h1>
      <p className="text-slate-300 text-2xl mb-10">{job.client.address}</p>

      <div className="grid grid-cols-2 gap-4">
        {stages.map(s => (
          <form key={s.key} action={updateStage}>
            <input type="hidden" name="jobId" value={job.id} />
            <input type="hidden" name="stage" value={s.key} />
            <button className={`w-full p-10 rounded-2xl text-2xl font-bold text-white shadow-lg active:scale-95 transition transform ${s.color}`}>
              {s.label}
            </button>
          </form>
        ))}
      </div>

      <p className="text-slate-400 text-xl mt-12 text-center">
        Current status: <span className="text-white font-bold uppercase">{job.stage}</span>
      </p>
    </main>
  )
}