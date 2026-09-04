import { Resend } from 'resend'
import { prisma } from './db'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendStageEmail(jobId: string, stage: string) {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: { client: true },
  })
  if (!job) throw new Error('Job not found')

  const template = await prisma.emailTemplate.findUnique({ where: { stage } })
  if (!template) throw new Error(`No template for stage: ${stage}`)

  const subject = template.subject
    .replace('{{clientName}}', job.client.name)
    .replace('{{address}}', job.client.address)

  const body = template.body
    .replace('{{clientName}}', job.client.name)
    .replace('{{address}}', job.client.address)

  await resend.emails.send({
    from: process.env.EMAIL_FROM ?? 'Snow Plow <noreply@yourdomain.com>',
    to: job.client.email,
    subject,
    html: body.replace(/\n/g, '<br/>'),
  })
}