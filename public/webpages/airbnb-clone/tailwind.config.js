/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        rausch: '#FF385C',
        babu: '#00A699',
        hof: '#484848',
        foggy: '#767676',
      },
      boxShadow: {
        airbnb: '0 6px 16px rgba(0,0,0,0.12)',
        search: '0 1px 2px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.05)',
      },
    },
  },
  plugins: [],
};
