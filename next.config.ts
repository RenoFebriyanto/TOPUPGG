import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Security headers untuk semua response
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Cegah clickjacking
          { key: 'X-Frame-Options', value: 'DENY' },
          // Cegah MIME sniffing
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Referrer policy
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Permissions policy — nonaktifkan fitur browser yang tidak dipakai
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          // XSS protection (legacy browsers)
          { key: 'X-XSS-Protection', value: '1; mode=block' },
        ],
      },
      {
        // Tambahan header untuk API routes
        source: '/api/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate' },
        ],
      },
    ]
  },

  // Izinkan gambar dari domain eksternal (Google OAuth avatar, dll)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
      },
    ],
  },
}

export default nextConfig
