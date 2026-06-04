import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function AdminDashboardPage() {
  const session = await auth()

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#080C14] p-8">
      <div className="max-w-7xl mx-auto">
        <div
          className="rounded-2xl border border-violet-500/20 p-12 flex flex-col items-center justify-center text-center"
          style={{ background: 'rgba(15,20,35,0.8)', minHeight: '400px' }}
        >
          <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Admin Panel</h1>
          <p className="text-slate-400 text-sm max-w-sm">
            Panel admin sedang dalam pengembangan. Manajemen produk, transaksi, user, dan laporan keuangan akan tersedia di sini.
          </p>
          <div className="mt-4 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20">
            <span className="text-violet-400 text-xs font-medium">🔐 Admin Only — {session.user.email}</span>
          </div>
          <div className="mt-3 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20">
            <span className="text-violet-400 text-xs font-medium">🚧 Coming Soon — Fase 5</span>
          </div>
        </div>
      </div>
    </div>
  )
}