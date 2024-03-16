/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    appDir: true,
  },
  images: {
    domains: ["ca-face-image.s3.ca-central-1.amazonaws.com"],
  },
}
export default nextConfig
