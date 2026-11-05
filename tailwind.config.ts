import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: '#0E1116', soft: '#3A4150', mute: '#6B7280' },
        paper: { DEFAULT: '#FAFAF7', warm: '#F3F2EC' },
        brand: {
          50: '#EEF0FF',
          100: '#DFE2FF',
          200: '#C2C7FF',
          400: '#7C83FF',
          500: '#5B5BF7',
          600: '#4A45E0',
          700: '#3B36B8',
        },
        lime: { accent: '#D4F25A' },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Georgia', 'serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(14,17,22,0.04), 0 4px 16px rgba(14,17,22,0.06)',
        lift: '0 12px 40px rgba(14,17,22,0.12)',
      },
    },
  },
  plugins: [],
};

export default config;
