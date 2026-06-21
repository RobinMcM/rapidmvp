/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      // Phase 2: /workspace/* → /repositories/* (repository-to-cloud rename)
      { source: '/workspace', destination: '/repositories', permanent: false },
      { source: '/workspace/vision', destination: '/repositories/new', permanent: false },
      {
        source: '/workspace/blueprints/:id/repository-install',
        destination: '/repositories/:id',
        permanent: false,
      },
      { source: '/workspace/blueprints/:id', destination: '/repositories/:id', permanent: false },
      { source: '/workspace/:path*', destination: '/repositories', permanent: false },
    ]
  },
}

export default nextConfig
