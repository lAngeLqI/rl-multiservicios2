/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e2f4e8',
          100: '#bae8c9',
          200: '#92d4a6',
          300: '#6bbf84',
          400: '#4fa36a',
          500: '#3d8b55',  // Verde principal
          600: '#347148',
          700: '#2a5f3e',
          800: '#1e4d34',
          900: '#1a3c2a',
        },
        secondary: {
          50: '#fef9e7',
          100: '#fcf0cc',
          200: '#fae199',
          300: '#f8d266',
          400: '#f6c333',
          500: '#f4b400',  // Dorado
          600: '#c39000',
          700: '#926c00',
          800: '#624800',
          900: '#312400',
        },
      },
    },
  },
  plugins: [],
}

