/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack(config, webpack) {
    config.experiments = {
      layers: true,
      asyncWebAssembly: true,
      topLevelAwait: true,
    };
    config.resolve.fallback = {
      fs: false,
      path: false,
      os: false,
    };
    return config;
  },
  compiler: {
    styledComponents: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.pngtree.com', // TODO change
      },
    ],
  },
};

module.exports = nextConfig;
