export default function OrdersPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <div
        className="rounded-2xl border border-slate-700/50 p-12 flex flex-col items-center justify-center text-center"
        style={{ background: 'rgba(15,20,35,0.8)', minHeight: '400px' }}
      >
        <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-6">
          <svg className="w-8 h-8 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Riwayat Transaksi</h1>
        <p className="text-slate-400 text-sm max-w-sm">
          Halaman riwayat transaksi sedang dalam pengembangan. Semua histori top up kamu akan tampil di sini lengkap dengan status real-time.
        </p>
        <div className="mt-6 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20">
          <span className="text-violet-400 text-xs font-medium">🚧 Coming Soon — Fase 4</span>
        </div>
      </div>
    </div>
  )
}