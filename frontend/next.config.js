/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
      REACT_APP_API: process.env.REACT_APP_API,
    },
    images: {
      domains: ['res.cloudinary.com'],
    }
}

module.exports = nextConfig
