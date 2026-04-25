/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#F47B20',
          50: '#FEF5ED',
          100: '#FCE7D0',
          200: '#F9C99B',
          300: '#F5A765',
          400: '#F28D3F',
          500: '#F47B20',
          600: '#E06510',
          700: '#B24E0C',
          800: '#8A3C09',
          900: '#5D2806',
        },
        navy: {
          DEFAULT: '#1E3A5F',
          50: '#EBF0F7',
          100: '#C6D3E4',
          200: '#8FA5C5',
          300: '#5A79A6',
          400: '#2F4E80',
          500: '#1E3A5F',
          600: '#182F4D',
          700: '#12233A',
          800: '#0C1826',
          900: '#060C13',
        },
        salmon: {
          DEFAULT: '#FAA581',
          50: '#FFF5F0',
          100: '#FFE5DD',
          200: '#FFD4C0',
          300: '#FFC2A3',
          400: '#FFA87D',
          500: '#FAA581',
          600: '#E8826B',
        },
        deal: { DEFAULT: '#E74C3C', 600: '#C0392B' },
      },
    },
  },
  plugins: [],
};
