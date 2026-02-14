import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

const nextConfig: NextConfig = {
  reactStrictMode: true,

  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  transpilePackages: ['@repo/validators'],

  serverExternalPackages: ['@prisma/client'],

  // In production, inline CSS to avoid the "preloaded but not used" warning for
  // app/layout.css. In dev, that warning is a known Next.js behavior and harmless.
  experimental: {
    inlineCss: true,
  },

  async rewrites() {
    return [{ source: '/favicon.ico', destination: '/icon' }]
  },

  webpack: (config) => {
    config.watchOptions = {
      ...(config.watchOptions ?? {}),
      ignored: [
        'C:\\hiberfil.sys',
        'C:\\pagefile.sys',
        'C:\\swapfile.sys',
        'C:\\DumpStack.log.tmp',
      ],
    }

    return config
  },
}

export default withNextIntl(nextConfig)
