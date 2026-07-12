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
        secondary: '#B48247',
      },
      fontFamily: {
        'pretendard-regular': ['Pretendard-Regular'],
        'pretendard-medium': ['Pretendard-Medium'],
        'pretendard-extrabold': ['Pretendard-ExtraBold'],
      },
      fontSize: {
        title: ['28px', { lineHeight: '36px' }],
        main: ['17px', { lineHeight: 'normal' }],
        small1: ['13px', { lineHeight: 'normal' }],
        small2: ['12px', { lineHeight: 'normal' }],
        'popup-lg': ['24px', { lineHeight: 'normal' }],
        'popup-md': ['20px', { lineHeight: 'normal' }],
      },
      boxShadow: {
        card: '0 0 12.7px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
}
