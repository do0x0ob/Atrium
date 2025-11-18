/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.externals.push('pino-pretty', 'encoding');
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.walrus.site',
      },
      {
        protocol: 'https',
        hostname: 'aggregator.walrus-testnet.walrus.space',
      },
      {
        protocol: 'https',
        hostname: '**.suifrens.com',
      },
    ],
  },
};

module.exports = nextConfig;

