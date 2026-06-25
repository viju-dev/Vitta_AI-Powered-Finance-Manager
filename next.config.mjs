/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'randomuser.me',
        },
        {
          protocol: 'https',
          hostname: 'img.clerk.com',
        },
      ],
    },
    experimental:{
      serverActions:{
        bodySizeLimit:"5mb",
      },
    },
  }
export default nextConfig;
