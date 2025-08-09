import { tailwindExtension } from './src/lib/theme/goldTheme.ts';

/** @type {import('next').NextConfig} */
const nextConfig = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: tailwindExtension,
  },
  plugins: [],
};

export default nextConfig;
