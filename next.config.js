/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: 'frontend/.next',
  images: {
    domains: [
      'localhost',
      process.env.AWS_BUCKET_NAME + '.s3.' + process.env.AWS_REGION + '.amazonaws.com'
    ],
  }
}

module.exports = nextConfig
