/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/static/**",
      },
      {
        protocol: "https",
        hostname: "app.prozlab.com",
        pathname: "/static/**",
      },
    ],
  },
  async rewrites() {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
    return [
      {
        source: "/uploads/:path*",
        destination: `${apiBase}/static/:path*`,
      },
    ]
  },
}

export default nextConfig
