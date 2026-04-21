/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg:     '#060B18',
        bg2:    '#0D1526',
        bg3:    '#111D34',
        border: '#1E2D4D',
        cyan:   { DEFAULT: '#00D4FF', 400: '#00D4FF', 500: '#00B8E0' },
        muted:  '#6B7A99',
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        head: ['Syne', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
