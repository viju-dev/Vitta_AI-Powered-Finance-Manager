/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
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
