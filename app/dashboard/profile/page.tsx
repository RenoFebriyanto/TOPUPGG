export default function ProfilePage() {
  return (
    <div className="max-w-7xl mx-auto">
      <div
        className="rounded-2xl border border-slate-700/50 p-12 flex flex-col items-center justify-center text-center"
        style={{ background: 'rgba(15,20,35,0.8)', minHeight: '400px' }}
      >
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
          <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Profil Saya</h1>
        <p className="text-slate-400 text-sm max-w-sm">
          Halaman profil sedang dalam pengembangan. Kamu akan bisa mengatur informasi akun, keamanan, dan preferensi di sini.
        </p>
        <div className="mt-6 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <span className="text-emerald-400 text-xs font-medium">🚧 Coming Soon — Fase 4</span>
        </div>
      </div>
    </div>
  )
}