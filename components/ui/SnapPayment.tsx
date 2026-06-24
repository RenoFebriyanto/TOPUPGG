'use client'

// Deklarasi global untuk window.snap dari Midtrans Snap.js
declare global {
  interface Window {
    snap?: {
      pay: (
        snapToken: string,
        options: {
          onSuccess: (result: SnapResult) => void
          onPending: (result: SnapResult) => void
          onError: (result: SnapResult) => void
          onClose: () => void
        }
      ) => void
      hide: () => void
    }
  }
}

export type SnapResult = {
  order_id?: string
  transaction_status?: string
  payment_type?: string
  fraud_status?: string
  status_code?: string
  gross_amount?: string
}

// Helper — tunggu snap.js selesai load (max 10 detik)
export function waitForSnap(timeout = 10000): Promise<typeof window.snap> {
  return new Promise((resolve, reject) => {
    if (window.snap) { resolve(window.snap); return }
    const start = Date.now()
    const check = setInterval(() => {
      if (window.snap) { clearInterval(check); resolve(window.snap); return }
      if (Date.now() - start > timeout) {
        clearInterval(check)
        reject(new Error('Midtrans Snap gagal dimuat. Periksa koneksi internet.'))
      }
    }, 100)
  })
}

// Buka Snap popup dan return Promise dengan hasil
export async function openSnapPayment(
  snapToken: string,
  orderId: string,
  onOrderUpdate: (status: 'SUCCESS' | 'PENDING' | 'FAILED' | 'CLOSED') => void
): Promise<void> {
  const snap = await waitForSnap()

  if (!snap) {
    throw new Error('Midtrans Snap tidak tersedia.')
  }

  snap.pay(snapToken, {
    onSuccess: () => {
      onOrderUpdate('SUCCESS')
    },
    onPending: () => {
      onOrderUpdate('PENDING')
    },
    onError: () => {
      onOrderUpdate('FAILED')
    },
    onClose: () => {
      // User menutup popup tanpa menyelesaikan payment
      onOrderUpdate('CLOSED')
    },
  })
}
