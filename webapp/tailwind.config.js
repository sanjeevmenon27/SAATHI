/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        cream: {
          50: "#fff9f1",
          100: "#fff2de"
        },
        saffron: {
          50: "#fff4de",
          100: "#ffe1b0",
          200: "#ffd08a",
          300: "#f9bf66",
          500: "#f29f38",
          700: "#c77718"
        },
        apricot: {
          100: "#ffe6d5",
          300: "#ffbc8c",
          500: "#f38a4d"
        },
        cocoa: {
          700: "#654321",
          900: "#3f2a16"
        }
      },
      fontFamily: {
        sans: ["Trebuchet MS", "Verdana", "sans-serif"]
      },
      boxShadow: {
        card: "0 18px 40px rgba(146, 92, 24, 0.12)"
      }
    }
  },
  plugins: []
};
