/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        black: '#07091C',
        white: '#F2F2F2',
        gray1: '#D9D9D9',
        gray2: '#74768E',
        gray3: '#1F2A43',
        primary: '#C6A75E',
      },
    },
  },
  plugins: [],
}
