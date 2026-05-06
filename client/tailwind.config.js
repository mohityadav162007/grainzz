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
        'brand-green': '#1D5E20',
        'brand-light': '#EEFBDC',
        'brand-yellow': '#FFEBBA',
        'brand-red': '#B00912',
        'brand-black': '#1A1A1A',
        'brand-peach-light': '#FFDFD6',
        'brand-peach': '#FF8B68',
        'brand-orange-light': '#FFF9EC',
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
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        brand: ['Georgia', 'Times New Roman', 'serif'],
      },
      animation: {
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
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
        scaleIn: {
          '0%': { transform: 'scale(0.85)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
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
