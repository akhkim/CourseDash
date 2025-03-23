/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  assetPrefix: '',
  output: 'standalone',
  distDir: 'build',
};

module.exports = nextConfig; 