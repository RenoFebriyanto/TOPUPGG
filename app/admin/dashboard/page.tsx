import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import { checkBalance } from '@/lib/digiflazz'
import AdminExportButton from '@/components/admin/ExportButton'

// Threshold peringatan saldo Digiflazz (Rp 50.000)
const LOW_BALANCE_THRESHOLD = 50_000

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(date))
}

const STATUS_CONFIG = {
  SUCCESS:    { label: 'Sukses',    color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20' },
  FAILED:     { label: 'Gagal',     color: 'text-red-400',     bg: 'bg-red-400/10 border-red-400/20' },
  PENDING:    { label: 'Pending',   color: 'text-amber-400',   bg: 'bg-amber-400/10 border-amber-400/20' },
  PROCESSING: { label: 'Diproses', color: 'text-sky-400',     bg: 'bg-sky-400/10 border-sky-400/20' },
} as const

export default async function AdminDashboardPage() {
  const session = await auth()

  const [
    totalUsers,
    totalOrders,
    successOrders,
    processingOrders,
    failedOrders,
    revenueResult,
    recentOrders,
    todayOrders,
    digiflazzBalance,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.order.count(),
    prisma.order.count({ where: { status: 'SUCCESS' } }),
    prisma.order.count({ where: { status: { in: ['PENDING', 'PROCESSING'] } } }),
    prisma.order.count({ where: { status: 'FAILED' } }),
    prisma.order.aggregate({ where: { status: 'SUCCESS' }, _sum: { amount: true } }),
    prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 8,
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.order.count({
      where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
    }),
    checkBalance().catch(() => null),
  ])

  const totalRevenue = revenueResult._sum.amount ?? 0
  const successRate = totalOrders > 0 ? Math.round((successOrders / totalOrders) * 100) : 0

  const statCards = [
    { label: 'Total User', value: totalUsers.toLocaleString(), sub: 'terdaftar', accent: 'sky', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
    { label: 'Total Transaksi', value: totalOrders.toLocaleString(), sub: `${todayOrders} hari ini`, accent: 'violet', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg> },
    { label: 'Total Revenue', value: formatCurrency(totalRevenue), sub: `${successRate}% success rate`, accent: 'emerald', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    { label: 'Saldo Digiflazz', value: digiflazzBalance !== null ? formatCurrency(digiflazzBalance) : '—', sub: processingOrders > 0 ? `${processingOrders} diproses` : 'semua selesai', accent: 'amber', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg> },
  ]

  const accentMap: Record<string, { icon: string; border: string }> = {
    sky:     { icon: 'text-sky-400 bg-sky-400/10',     border: 'border-sky-500/20' },
    violet:  { icon: 'text-violet-400 bg-violet-400/10', border: 'border-violet-500/20' },
    emerald: { icon: 'text-emerald-400 bg-emerald-400/10', border: 'border-emerald-500/20' },
    amber:   { icon: 'text-amber-400 bg-amber-400/10',  border: 'border-amber-500/20' },
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">

      {/* Welcome */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white">Selamat datang, {session!.user.name?.split(' ')[0]} 👋</h1>
          <p className="text-slate-400 text-sm mt-1">Ini ringkasan platform TopUpGG hari ini.</p>
        </div>
        <AdminExportButton />
      </div>

      {/* Alert saldo rendah */}
      {digiflazzBalance !== null && digiflazzBalance < LOW_BALANCE_THRESHOLD && (
        <div className="rounded-2xl border border-red-500/30 p-4 flex items-start gap-3 bg-red-500/5">
          <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p className="text-red-400 text-sm font-semibold">Saldo Digiflazz Hampir Habis</p>
            <p className="text-red-400/70 text-xs mt-0.5">
              Saldo saat ini <span className="font-bold">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(digiflazzBalance)}</span>. Segera deposit agar transaksi tidak terganggu.
            </p>
          </div>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const colors = accentMap[card.accent]
          return (
            <div key={card.label} className={`rounded-2xl border ${colors.border} p-5`} style={{ background: 'rgba(15,20,35,0.8)' }}>
              <div className="flex items-start justify-between mb-3">
                <p className="text-slate-400 text-xs font-medium">{card.label}</p>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colors.icon}`}>{card.icon}</div>
              </div>
              <p className="text-2xl font-bold text-white leading-tight">{card.value}</p>
              <p className="text-slate-500 text-xs mt-1">{card.sub}</p>
            </div>
          )
        })}
      </div>

      {/* Status breakdown + Recent orders */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Status breakdown */}
        <div className="rounded-2xl border border-slate-700/50 p-6 space-y-4" style={{ background: 'rgba(15,20,35,0.8)' }}>
          <h2 className="text-white font-semibold">Status Transaksi</h2>
          {[
            { label: 'Sukses', count: successOrders, color: 'bg-emerald-400' },
            { label: 'Diproses', count: processingOrders, color: 'bg-sky-400' },
            { label: 'Gagal', count: failedOrders, color: 'bg-red-400' },
          ].map((item) => {
            const pct = totalOrders > 0 ? Math.round((item.count / totalOrders) * 100) : 0
            return (
              <div key={item.label}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-400">{item.label}</span>
                  <span className="text-white font-medium">{item.count} <span className="text-slate-500">({pct}%)</span></span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-800">
                  <div className={`h-1.5 rounded-full ${item.color} transition-all`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            )
          })}
          <div className="pt-2 border-t border-slate-800/60">
            <Link href="/admin/orders" className="text-violet-400 text-xs hover:text-violet-300 transition-colors">Lihat semua transaksi →</Link>
          </div>
        </div>

        {/* Recent orders */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-700/50 p-6" style={{ background: 'rgba(15,20,35,0.8)' }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-white font-semibold">Transaksi Terbaru</h2>
            <Link href="/admin/orders" className="text-violet-400 text-sm hover:text-violet-300 transition-colors">Lihat semua →</Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-8">Belum ada transaksi</p>
          ) : (
            <div className="space-y-2">
              {recentOrders.map((order) => {
                const status = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG]
                return (
                  <div key={order.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-700/30">
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-medium truncate">{order.productName}</p>
                      <p className="text-slate-500 text-xs truncate">{order.user.name ?? order.user.email}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-white text-xs font-semibold">{formatCurrency(order.amount)}</p>
                      <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-xs font-medium border ${status.bg} ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                    <p className="text-slate-600 text-xs shrink-0 hidden sm:block w-28 text-right">{formatDate(order.createdAt)}</p>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Kelola Transaksi', href: '/admin/orders', icon: '📋', color: 'border-violet-500/20 hover:border-violet-500/40' },
          { label: 'Kelola User', href: '/admin/users', icon: '👥', color: 'border-sky-500/20 hover:border-sky-500/40' },
          { label: 'Daftar Produk', href: '/admin/products', icon: '🎮', color: 'border-emerald-500/20 hover:border-emerald-500/40' },
          { label: 'Dashboard User', href: '/dashboard', icon: '🏠', color: 'border-slate-700/40 hover:border-slate-600/60' },
        ].map((item) => (
          <Link key={item.href} href={item.href}
            className={`rounded-2xl border p-4 flex flex-col items-center gap-2 text-center transition-all duration-200 hover:-translate-y-0.5 ${item.color}`}
            style={{ background: 'rgba(15,20,35,0.8)' }}
          >
            <span className="text-2xl">{item.icon}</span>
            <span className="text-slate-300 text-xs font-medium">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
