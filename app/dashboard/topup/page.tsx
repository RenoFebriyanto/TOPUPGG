export default function TopUpPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <div
        className="rounded-2xl border border-slate-700/50 p-12 flex flex-col items-center justify-center text-center"
        style={{ background: 'rgba(15,20,35,0.8)', minHeight: '400px' }}
      >
        <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center mb-6">
          <svg className="w-8 h-8 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Top Up Game</h1>
        <p className="text-slate-400 text-sm max-w-sm">
          Halaman top up game sedang dalam pengembangan. Akan segera hadir dengan katalog produk lengkap dan proses transaksi instan.
        </p>
        <div className="mt-6 px-4 py-2 rounded-full bg-sky-500/10 border border-sky-500/20">
          <span className="text-sky-400 text-xs font-medium">🚧 Coming Soon — Fase 2</span>
        </div>
      </div>
    </div>
  )
}