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
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0284c7',
          600: '#0369a1',
          700: '#075985',
        },
        student: {
          red: '#ef4444',
          blue: '#3b82f6',
          yellow: '#f59e0b',
          green: '#10b981',
          purple: '#8b5cf6',
        }
      }
    },
  },
  plugins: [],
}
