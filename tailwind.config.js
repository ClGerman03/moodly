/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4F46E5', // Indigo-600
          hover: '#4338CA', // Indigo-700
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'pulse-green': 'pulseGreen 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'scale(0.98)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseGreen: {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '0.6' }
        }
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
