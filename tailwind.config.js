/** @type {import('tailwindcss').Config} */
module.exports = {
  content: {
    files: ['./views/**/*.ejs', './routes/**/*.js'],
  },
  theme: {
    extend: {
      fontSize: {
        '3-5xl': '2rem', 
      }
    },
  },
  plugins: [],
}
