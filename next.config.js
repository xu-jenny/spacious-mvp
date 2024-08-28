/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // See https://webpack.js.org/configuration/resolve/#resolvealias
    (config.resolve.alias.canvas = false),
      (config.resolve.alias = {
        ...config.resolve.alias,
        sharp$: false,
        "onnxruntime-node$": false,
      });
    // if (!isServer) {
    // config.experiments = { asyncWebAssembly: true };
    // }
    config.resolve.fallback = { fs: false };
    config.resolve.alias.canvas = false;
    return config;
  },
};

module.exports = nextConfig;
