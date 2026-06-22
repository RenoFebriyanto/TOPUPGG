'use client'

import { usePathname } from 'next/navigation'

type User = { name?: string | null; email?: string | null }

const PAGE_TITLES: Record<string, string> = {
  '/admin/dashboard': 'Overview',
  '/admin/orders': 'Manajemen Transaksi',
  '/admin/users': 'Manajemen User',
  '/admin/products': 'Daftar Produk',
}

export default function AdminHeader({ user }: { user: User }) {
  const pathname = usePathname()
  const title = PAGE_TITLES[pathname] ?? 'Admin Panel'

  return (
    <header className="sticky top-0 z-10 border-b border-slate-800/60 px-4 lg:px-8 py-4 flex items-center justify-between gap-4"
      style={{ background: 'rgba(8,12,20,0.95)', backdropFilter: 'blur(12px)' }}
    >
      <h2 className="hidden lg:block text-white font-semibold text-lg">{title}</h2>
      <div className="flex items-center gap-2 lg:hidden">
        <div className="w-7 h-7 rounded-lg bg-violet-500 flex items-center justify-center">
          <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <span className="text-white font-bold text-sm">Admin Panel</span>
      </div>
      <div className="flex items-center gap-2 pl-3 border-l border-slate-700/60">
        <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
        <span className="text-violet-400 text-xs font-medium hidden sm:block">{user.name?.split(' ')[0]} · Admin</span>
      </div>
    </header>
  )
}
