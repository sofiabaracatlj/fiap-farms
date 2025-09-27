/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
     '*.{html,js}'
  ],
  theme: {
    colors: {
      darkTeal: '#004D61',
      'black': '#000000',
      'white': '#FFFFFF',
      'gray': '#F1F1F1',
      'lightGray': '#E5E5E5',
      'darkGray': '#B3B3B3',
      'red': '#FF0000',
      'green': '#47A138',
      
    },
    extend: {},
  },
  plugins: [],
}