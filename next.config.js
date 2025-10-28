/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable caching in development for smoother updates
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = false;
    }
    return config;
  },
  turbopack: {}, // <-- Add this line
};

module.exports = nextConfig;
