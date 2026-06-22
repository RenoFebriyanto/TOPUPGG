'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function RetryButton({ orderId }: { orderId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function handleRetry() {
    setLoading(true)
    setMessage('')
    try {
      const res = await fetch('/api/payment/retry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      })
      const data = await res.json()

      if (data.status === 'SUCCESS') {
        setMessage('✅ Berhasil! Halaman akan diperbarui...')
        setTimeout(() => router.refresh(), 1500)
      } else if (data.status === 'PROCESSING') {
        setMessage('⏳ Masih diproses Digiflazz, coba lagi nanti.')
      } else {
        setMessage(data.error ?? '❌ Retry gagal.')
      }
    } catch {
      setMessage('❌ Tidak dapat terhubung ke server.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleRetry}
        disabled={loading}
        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center gap-1.5">
            <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Checking...
          </span>
        ) : 'Retry'}
      </button>
      {message && (
        <p className="text-xs text-slate-400 max-w-[160px] text-right">{message}</p>
      )}
    </div>
  )
}
