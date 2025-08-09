import { tailwindExtension } from './src/lib/theme/goldTheme.mjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  theme: {
    extend: tailwindExtension,
  },
};

export default nextConfig;
