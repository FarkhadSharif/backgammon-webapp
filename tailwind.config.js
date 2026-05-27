/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        board: {
          frame: '#5b3420',
          rail: '#7a492d',
          felt: '#f4d6a4',
          darkPoint: '#7f1d1d',
          lightPoint: '#f8fafc',
        },
      },
      boxShadow: {
        board: '0 24px 70px rgb(27 18 11 / 0.28)',
      },
    },
  },
  plugins: [],
};
