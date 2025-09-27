/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_ADMIN_USER: process.env.ADMIN_USER,
    NEXT_PUBLIC_ADMIN_PASS: process.env.ADMIN_PASS,
  },
};

export default nextConfig;
