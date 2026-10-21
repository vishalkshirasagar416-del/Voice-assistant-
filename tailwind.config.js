/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        priya: {
          purple: '#7C3AED',
          purpleLight: '#A78BFA',
          green: '#22C55E',
          greenLight: '#34D399',
          sky: '#38BDF8',
          skyLight: '#7DD3FC',
          darkBg: '#070B16',
          darkSurface: '#111827',
          darkVariant: '#1E293B',
          lightBg: '#F4F7FF',
          lightSurface: '#FFFFFF',
          lightVariant: '#E9EEF9',
        }
      }
    },
  },
  plugins: [],
}
