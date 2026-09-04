import bundleAnalyzer from '@next/bundle-analyzer';
import type { NextConfig } from 'next';

/**
 * Bundle analyzer — opt-in via `npm run analyze`, inert during normal builds,
 * so first-load JS budgets can be inspected after the bundle-size work.
 */
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  // E2E builds use a separate output dir so `next build` for tests never
  // clobbers the `.next` folder the local `next dev` server is serving from.
  distDir: process.env.E2E_BUILD === '1' ? '.next-e2e' : '.next',
  experimental: {
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
    optimizePackageImports: [
      'gsap',
      '@gsap/react',
      'lucide-react',
      'react-toastify',
    ],
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  reactStrictMode: true,
  // No `sassOptions.includePaths`: it pointed at `<repo>/styles`, which does not
  // exist. The single SCSS file lives in `app/styles/` and is imported by its
  // own path, so no search path is needed.
  images: {
    formats: ['image/avif', 'image/webp'],
    // Dev-only escape hatch for the optimizer's SSRF guard: it resolves the
    // upstream host with `all: true` and rejects the request if ANY record is
    // private/reserved. On networks with DNS64 the resolver synthesizes a NAT64
    // AAAA (64:ff9b::/96) for beauty.oneentry.cloud alongside the public A
    // record, so every remote image 400s ('"url" parameter is not allowed')
    // even though the fetch itself would succeed. Production keeps the guard.
    dangerouslyAllowLocalIP: process.env.NODE_ENV === 'development',
    // OneEntry file URLs are content-addressable, so a long TTL is safe (30 days).
    minimumCacheTTL: 60 * 60 * 24 * 30,
    deviceSizes: [640, 768, 1024, 1280, 1920],
    imageSizes: [16, 32, 64, 128, 256, 384],
    unoptimized: false,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.oneentry.cloud',
        port: '',
        pathname: '/cloud-static/**',
      },
    ],
  },
  async headers() {
    return [
      // NOTE: do NOT set Cache-Control for `/_next/static/:path*` — Next.js
      // already serves those assets with `public, max-age=31536000, immutable`
      // and warns when user config overrides the built-in headers.
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(), microphone=(), camera=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/password',
        destination: '/',
        permanent: true,
      },
    ];
  },
  compress: true,
  // Do not advertise the framework: `X-Powered-By: Next.js` tells a scanner
  // which CVE list to try. Covered by tests/e2e/security-headers.spec.ts.
  poweredByHeader: false,
};

export default withBundleAnalyzer(nextConfig);
