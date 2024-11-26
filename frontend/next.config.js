/** @type {import('next').NextConfig} */
const nextConfig = {
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
      '@/components': require('path').resolve(__dirname, './components'),
    };
    return config;
  },
}

module.exports = nextConfig
