import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      colors: {
        primary: {
          DEFAULT: '#0A52EF', // ANC French Blue
          foreground: '#ffffff',
        },
        navy: {
          DEFAULT: '#002C73', // ANC Blue Opal (Updated from deep navy)
          foreground: '#ffffff',
        },
        brand: {
          blue: '#0A52EF',     // French Blue
          splash: '#03B8FF',   // Splish Splash
          malibu: '#0385DD',   // Malibu Blue
          opal: '#002C73',     // Blue Opal
        },
        accent: {
          DEFAULT: '#C4D600', // ANC Lime Green
          foreground: '#0A52EF',
        },
      },
      borderRadius: {
        lg: '0.75rem',
        md: '0.5rem',
        sm: '0.375rem',
      },
    },
  },
  plugins: [],
}
export default config
