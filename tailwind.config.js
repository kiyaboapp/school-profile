/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'shule-blue': '#1e40af',
        'shule-green': '#059669',
        'shule-yellow': '#d97706',
        'shule-red': '#dc2626',
      },
    },
  },
  plugins: [],
}
