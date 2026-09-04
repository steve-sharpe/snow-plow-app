import { cookies } from 'next/headers'
import { prisma } from './db'
import { redirect } from 'next/navigation'

export async function requireDriver() {
  const pin = cookies().get('driver_pin')?.value
  if (!pin) redirect('/')
  const driver = await prisma.driver.findFirst({ where: { pin, active: true } })
  if (!driver) redirect('/')
  return driver
}

export async function requireAdmin() {
  const token = cookies().get('admin_token')?.value
  if (token !== process.env.ADMIN_SECRET) redirect('/')
}