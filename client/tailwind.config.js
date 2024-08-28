import { nextui } from '@nextui-org/react';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{tsx,ts}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        slideUpOut: {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(-100%)', opacity: '0' },
        },
        slideUpIn: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDownOut: {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(100%)', opacity: '0' },
        },
        slideDownIn: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        slideUpOut: 'slideUpOut 0.5s forwards',
        slideUpIn: 'slideUpIn 0.5s forwards',
        slideDownOut: 'slideDownOut 0.5s forwards',
        slideDownIn: 'slideDownIn 0.5s forwards',
      },
    },
  },
  darkMode: "class",
  plugins: [
    nextui(),
    function({ addUtilities }) {
      addUtilities({
        '.no-scroll': {
          'overflow': 'hidden',
          'position': 'fixed',
          'width': '100%',
          'height': '100vh',
        },
      });
    },
  ],
}

