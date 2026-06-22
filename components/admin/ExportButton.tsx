'use client'

import { useState } from 'react'

export default function AdminExportButton() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState('')

  async function download(url: string, label: string) {
    setLoading(label)
    setOpen(false)
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error('Gagal export')
      const blob = await res.blob()
      const filename = res.headers.get('Content-Disposition')
        ?.split('filename=')[1]?.replace(/"/g, '') ?? `${label}.csv`
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = filename
      a.click()
      URL.revokeObjectURL(a.href)
    } catch {
      alert('Gagal mengunduh laporan.')
    } finally {
      setLoading('')
    }
  }

  const exports = [
    { label: 'Semua Transaksi', url: '/api/admin/export?type=orders' },
    { label: 'Transaksi Sukses', url: '/api/admin/export?type=orders&status=SUCCESS' },
    { label: 'Transaksi Gagal', url: '/api/admin/export?type=orders&status=FAILED' },
    { label: 'Transaksi Pending', url: '/api/admin/export?type=orders&status=PENDING' },
    { label: 'Daftar User', url: '/api/admin/export?type=users' },
  ]

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={!!loading}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-violet-500/30 bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 transition-colors disabled:opacity-50"
      >
        {loading ? (
          <>
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Mengunduh...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export CSV
          </>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 top-11 z-20 w-52 rounded-xl border border-slate-700/60 overflow-hidden shadow-2xl"
            style={{ background: 'rgba(15,20,35,0.98)' }}
          >
            <p className="px-3 py-2 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-800/60">
              Pilih Laporan
            </p>
            {exports.map((item) => (
              <button
                key={item.label}
                onClick={() => download(item.url, item.label)}
                className="w-full text-left px-3 py-2.5 text-sm text-slate-300 hover:bg-slate-800/80 hover:text-white transition-colors flex items-center gap-2"
              >
                <svg className="w-3.5 h-3.5 text-violet-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {item.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
