/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'p3-red': '#C41E3A',
        'p3-red-dark': '#9B1B30',
        'p3-blue': '#1E3A8A',
        'p3-blue-light': '#3B82F6',
        'p3-gray': '#F3F4F6',
        'p3-dark': '#1F2937',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
