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
        primary: {
          DEFAULT: '#1B4D1E',
          50: '#e8f5e9',
          100: '#c8e6c9',
          600: '#2d7a31',
          700: '#1B4D1E',
          800: '#14391a',
          900: '#0d2611',
        },
        accent: '#D72638',
        cream: '#FFFDF5',
        'cream-100': '#FFF8E7',
        'cream-200': '#FEF3D0',
        'text-main': '#1A1A1A',
        'text-muted': '#6B6B6B',
        'hero-brown': '#5A3825',
        'hero-dark': '#3D2517',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        brand: ['Georgia', 'Times New Roman', 'serif'],
      },
      animation: {
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'marquee': 'marquee 20s linear infinite',
        'count-up': 'countUp 1s ease-out',
      },
      keyframes: {
        slideInRight: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
};
