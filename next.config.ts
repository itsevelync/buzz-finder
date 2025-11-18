import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
};

const { NEXTAUTH_URL } = process.env;

if (!NEXTAUTH_URL) {
  console.warn("NEXTAUTH_URL is not set. This can lead to issues in production.");
}

nextConfig.env = {
  NEXTAUTH_URL: NEXTAUTH_URL,
};

export default nextConfig;
