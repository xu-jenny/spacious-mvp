/** @type {import('next').NextConfig} */
const webpack = require('webpack');
const nextConfig = {
  webpack: (config) => {
    // See https://webpack.js.org/configuration/resolve/#resolvealias
    config.resolve.alias = {
      ...config.resolve.alias,
      sharp$: false,
      "onnxruntime-node$": false,
    };
    config.resolve.fallback = { fs: false };
    return config;
  },
};

module.exports = nextConfig;
