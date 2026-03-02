/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        serif: ["PT Serif", "Georgia", "serif"],
        display: ["Marcellus", "Georgia", "serif"],
      },
      colors: {
        golf: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
        },
        "golf-dark": "#285610",
        "golf-yellow": "#FBE118",
        charcoal: "#2D2D2A",
        "dark-blue": "#34659B",
        cream: {
          50: "#fefdf8",
          100: "#fdf9ed",
          200: "#faf0d1",
        },
      },
    },
  },
  plugins: [],
};
