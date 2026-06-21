'use client'

import Link from 'next/link'
import { SUPPORTED_GAMES } from '@/lib/digiflazz'

export default function TopUpPage() {
  const games = Object.entries(SUPPORTED_GAMES)

  return (
    <div className="max-w-7xl mx-auto space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Top Up Game</h1>
        <p className="text-slate-400 text-sm mt-1">
          Pilih game yang ingin kamu top up. Proses instan, harga terbaik.
        </p>
      </div>

      {/* Grid Game */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
        {games.map(([key, game]) => (
          <Link
            key={key}
            href={`/dashboard/topup/${key}`}
            className="group relative rounded-2xl overflow-hidden border border-slate-700/50 hover:border-slate-500/60 transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl"
          >
            {/* Gradient background */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-20 group-hover:opacity-35 transition-opacity duration-200`}
            />

            {/* Content */}
            <div className="relative p-6 flex flex-col gap-4" style={{ background: 'rgba(15,20,35,0.85)' }}>
              {/* Icon + Tag */}
              <div className="flex items-start justify-between">
                <span className="text-4xl">{game.icon}</span>
                <span className="text-xs font-semibold px-2 py-1 rounded-full bg-slate-800/80 text-slate-400 border border-slate-700/50">
                  {game.tag}
                </span>
              </div>

              {/* Name + arrow */}
              <div className="flex items-end justify-between">
                <div>
                  <h2 className="text-white font-bold text-base leading-tight">
                    {game.label}
                  </h2>
                  <p className="text-slate-500 text-xs mt-1">Top Up Sekarang</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-800/60 border border-slate-700/50 flex items-center justify-center group-hover:bg-sky-500/20 group-hover:border-sky-500/40 transition-all duration-200 shrink-0">
                  <svg className="w-4 h-4 text-slate-500 group-hover:text-sky-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Info */}
      <div
        className="rounded-2xl border border-slate-700/30 p-5 flex items-start gap-4"
        style={{ background: 'rgba(15,20,35,0.6)' }}
      >
        <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
          <svg className="w-5 h-5 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p className="text-white text-sm font-medium">Cara Top Up</p>
          <p className="text-slate-400 text-xs mt-1 leading-relaxed">
            Pilih game → pilih nominal → masukkan ID akun game kamu → konfirmasi → selesai. Diamond/UC/VP langsung masuk ke akun dalam hitungan detik.
          </p>
        </div>
      </div>
    </div>
  )
}