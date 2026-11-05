/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  experimental: {
    serverActions: { bodySizeLimit: '6mb' },
  },
  async headers() {
    return [
      {
        // The widget script is loaded from other companies' websites.
        source: '/widget.js',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Cache-Control', value: 'public, max-age=300' },
        ],
      },
    ];
  },
};

export default nextConfig;
