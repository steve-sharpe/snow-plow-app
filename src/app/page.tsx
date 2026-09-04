import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-900 text-white">
      <h1 className="text-4xl font-bold mb-12 text-blue-400">Snow Plow Dispatch</h1>
      <div className="flex flex-col gap-6 w-full max-w-xs">
        <Link href="/driver" className="w-full px-8 py-6 bg-blue-600 hover:bg-blue-700 rounded-xl text-2xl font-semibold text-center transition">
           Driver Login
        </Link>
        <Link href="/admin" className="w-full px-8 py-6 bg-slate-700 hover:bg-slate-600 rounded-xl text-2xl font-semibold text-center transition">
          🔒 Office Admin
        </Link>
      </div>
    </main>
  )
}