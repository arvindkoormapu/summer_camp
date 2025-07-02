/** @type {import('tailwindcss').Config} */
export default {
 content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        flapstick: ['Flapstick', 'cursive'],
        avenir: ['Avenir', 'sans-serif'],
      },
      colors: {
        primary: '#e16f50',
        secondary: '#35727d',
      },
      keyframes: {
        'zoom-grow': {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(1.2)', opacity: '1' },
        },
      },
      animation: {
        'zoom-grow': 'zoom-grow 10s ease-in-out forwards',
        'spin-slow': 'spin 2s linear infinite',
      },
    },
  },
  plugins: [],
}

