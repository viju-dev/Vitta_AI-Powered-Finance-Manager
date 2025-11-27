/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        //  FIX: Added required external image domains
    domains: [
      "randomuser.me",
      "img.clerk.com", //for Clerk user avatars
    ],
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'randomuser.me',
        //   port: '',
        //   pathname: '/account123/**',
        //   search: '',
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
