/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FDFBF7',
          100: '#FAF7F0',
          200: '#F4EEE1',
          300: '#EDE4D1',
        },
        rosebud: {
          50: '#FDF7F8',
          100: '#FCECEE',
          200: '#F8D4D9',
          300: '#F2B0B9',
          400: '#E67B8A',
          500: '#CE4559',
          600: '#B0263B',
          700: '#8A1526',
        },
        ink: {
          900: '#141414',
          800: '#222222',
          700: '#383838',
          500: '#6B6B6B',
          400: '#949494',
          200: '#E2E2E2',
          100: '#F0F0F0',
        },
        ballet: '#FCE7EB',
        gingham: '#6A8072',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        mono: ['"Courier Prime"', '"Courier New"', 'monospace'],
        sans: ['"Inter"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      animation: {
        'marquee': 'marquee 28s linear infinite',
        'fade-in': 'fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up': 'slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
