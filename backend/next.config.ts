import type { NextConfig } from 'next';

// The React frontend (Vite) is a separate app. In development it forwards /api to this server
// through its proxy, so CORS is only needed when the two are deployed on different domains.
const allowedOrigin = process.env.ALLOWED_ORIGIN ?? 'http://localhost:3000';

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: allowedOrigin },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,PATCH,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
};

export default nextConfig;
