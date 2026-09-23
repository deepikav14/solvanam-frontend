/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#070912',
          900: '#0b0e1a',
          850: '#0f1322',
          800: '#141829',
          700: '#1c2238',
        },
        parchment: {
          50: '#f5f0e6',
          100: '#ebe4d4',
          200: '#d9cfb8',
          300: '#c4b896',
          400: '#a89972',
        },
        bronze: {
          300: '#c9a96a',
          400: '#b8965a',
          500: '#a07d45',
          600: '#8a6a3a',
        },
        teal: {
          300: '#5a9a92',
          400: '#4a8a82',
          500: '#3a7a72',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['"Cormorant Garamond"', 'serif'],
        tamil: ['"Noto Serif Tamil"', '"Noto Sans Tamil"', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 1.2s ease-out forwards',
        'fade-in-slow': 'fadeIn 2s ease-out forwards',
        'fade-in-up': 'fadeInUp 1s ease-out forwards',
        'draw': 'draw 3s ease-out forwards',
        'twinkle': 'twinkle 4s ease-in-out infinite',
        'twinkle-slow': 'twinkle 7s ease-in-out infinite',
        'float': 'float 8s ease-in-out infinite',
        'float-slow': 'float 12s ease-in-out infinite',
        'parallax': 'parallax 30s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        draw: {
          '0%': { strokeDashoffset: '1000' },
          '100%': { strokeDashoffset: '0' },
        },
        twinkle: {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '0.9' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        parallax: {
          '0%': { transform: 'scale(1.05) translateY(0)' },
          '100%': { transform: 'scale(1.1) translateY(-15px)' },
        },
      },
    },
  },
  plugins: [],
};
