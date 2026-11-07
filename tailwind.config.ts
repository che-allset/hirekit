import type { Config } from 'tailwindcss';

/**
 * HireKit brand tokens
 * graphite  #23272D  text, dark bands
 * steel     #E7E9EC  page canvas
 * signal    #FFD12E  brand yellow (the plug), highlights and primary buttons
 * forest    #1D5C47  positive states, links, progress
 * flag      #D7442F  errors only
 *
 * Older token names (ink, paper, brand, lime) are kept and mapped onto the
 * new palette so the dashboard picks up the new brand without rewrites.
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        graphite: { DEFAULT: '#23272D', 700: '#2E333A', 600: '#454B54', 400: '#7A818B' },
        steel: { DEFAULT: '#E7E9EC', 200: '#D9DCE1', 50: '#F4F5F7' },
        signal: { DEFAULT: '#FFD12E', 600: '#F2BC00', 100: '#FFF3C7' },
        forest: { DEFAULT: '#1D5C47', 600: '#174A39', 100: '#DCEBE4' },
        flag: { DEFAULT: '#D7442F' },
        ink: { DEFAULT: '#23272D', soft: '#454B54', mute: '#6F7680' },
        paper: { DEFAULT: '#E7E9EC', warm: '#DDE0E4' },
        brand: {
          50: '#E6F0EB',
          100: '#DCEBE4',
          200: '#B7D4C6',
          400: '#4C8A72',
          500: '#2F735A',
          600: '#1D5C47',
          700: '#174A39',
        },
        lime: { accent: '#FFD12E' },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Helvetica Neue', 'Arial', 'sans-serif'],
        display: ['var(--font-display)', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 0 rgba(35,39,45,0.06), 0 2px 8px rgba(35,39,45,0.05)',
        lift: '0 24px 60px -24px rgba(35,39,45,0.35)',
      },
      letterSpacing: {
        display: '-0.015em',
      },
    },
  },
  plugins: [],
};

export default config;
