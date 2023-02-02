/** @type {import('next').NextConfig} */
const HtmlWebpackPlugin = require('html-webpack-plugin');
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack(config, { webpack }) {
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
    config.plugins = [
      ...config.plugins,
      new HtmlWebpackPlugin(),
      new webpack.ProvidePlugin({
        TextDecoder: ['text-encoder', 'TextDecoder'],
        TextEncoder: ['text-encoder', 'TextEncoder'],
      }),
    ];
    return config;
  },
};

module.exports = nextConfig;
