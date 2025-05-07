/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'primary-blue': '#003087',
        'secondary-blue': '#0055B8',
        'accent-blue': '#0076DE',
        'dark-blue': '#001A49',
        'primary-green': '#00843D',
        'hover-green': '#006B31',
        'success-green': '#43B02A',
        'warning-red': '#E31937',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Montserrat', 'sans-serif'],
      },
    },
  },
  plugins: [],
}