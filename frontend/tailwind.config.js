/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        maroon:  { DEFAULT: '#6B1A2B', dark: '#4A0F1D', light: '#8B2238' },
        gold:    { DEFAULT: '#C9A84C', light: '#E8C97A' },
        ivory:   { DEFAULT: '#FAF7F2', dark: '#F2EDE4' },
        charcoal:{ DEFAULT: '#1C1C1E', muted: '#4A4A4F' },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans:  ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
