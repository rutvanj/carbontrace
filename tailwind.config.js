/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bottle: {
          DEFAULT: '#0F3D2E',
          dark: '#173F32',
          accent: '#1F5D46',
          hover: '#0B2C21',
          light: '#1B4E3C',
          pale: '#E2EBE5',
          subtle: '#EDF3F0',
        },
        beige: {
          DEFAULT: '#F3EBDD',
          card: '#F8F3E8',
          light: '#E8DEC9',
          border: '#D8CBB4',
          dark: '#C8B89E',
        },
        earth: {
          text: '#17352B',
          muted: '#687266',
          greenMuted: '#6F8068',
        },
        brand: {
          50: '#EDF3F0',
          100: '#E2EBE5',
          200: '#C5D7CC',
          300: '#94B8A2',
          400: '#4A8564',
          500: '#1F5D46',
          600: '#173F32',
          700: '#0F3D2E',
          800: '#0B2C21',
          900: '#071F17',
          950: '#030F0B',
        },
        charcoal: {
          50: '#F8F3E8',
          100: '#F3EBDD',
          200: '#E8DEC9',
          300: '#D8CBB4',
          400: '#A39986',
          500: '#687266',
          600: '#4E574C',
          700: '#343B33',
          800: '#232B24',
          900: '#17352B',
          950: '#0E1F1A',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'serif'],
      },
      boxShadow: {
        subtle: '0 1px 2px 0 rgba(15, 61, 46, 0.04)',
        card: '0 1px 3px 0 rgba(15, 61, 46, 0.06), 0 1px 2px -1px rgba(15, 61, 46, 0.04)',
        dropdown: '0 10px 15px -3px rgba(15, 61, 46, 0.08), 0 4px 6px -4px rgba(15, 61, 46, 0.04)',
        natural: '0 4px 20px -2px rgba(15, 61, 46, 0.07)',
      },
    },
  },
  plugins: [],
}
