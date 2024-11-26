/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  images: {
    domains: [
      'localhost',
      process.env.AWS_BUCKET_NAME + '.s3.' + process.env.AWS_REGION + '.amazonaws.com'
    ],
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@/lib': require('path').resolve(__dirname, './lib'),
    };
    return config;
  },
}

module.exports = nextConfig
