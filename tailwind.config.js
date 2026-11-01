/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          500: '#22c55e',
          700: '#15803d',
          800: '#144732', // Brand Royal Forest Emerald
          900: '#0b2b1e', // Brand Deep Night Forest
          950: '#051810',
        },
        gold: {
          50: '#fdfbf6',
          100: '#f9f3e5',
          200: '#f3e5c7',
          300: '#ebd19f',
          400: '#e1b76e',
          500: '#d4a359', // Brand Warm Sandstone Gold
          600: '#bc853c',
          700: '#92580a', // Brand Accent Deep Bronze Gold
          800: '#76430d',
          900: '#462406',
        },
        parchment: {
          50: '#ffffff',
          100: '#faf8f4',
          200: '#f6f4ed', // Brand Slide Ivory Sandstone
          300: '#eae5d8',
          400: '#dcd7ca',
        },
      },
      fontFamily: {
        sans: ['Outfit', 'Noto Sans Devanagari', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
        hindi: ['Noto Sans Devanagari', 'sans-serif'],
      },
      boxShadow: {
        'luxury': '0 20px 40px -15px rgba(20, 71, 50, 0.12)',
        'luxury-gold': '0 20px 40px -15px rgba(212, 163, 89, 0.25)',
      }
    },
  },
  plugins: [],
};
