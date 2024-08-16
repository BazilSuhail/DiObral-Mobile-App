/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./AppNavigator.{js,jsx,ts,tsx}", "./Components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        'custom-gray':'#FFF7FF', 
        'truck-completed':'#706902', 
        'search-color':'#474747', 
      },

    },
  },
  plugins: [],
}

