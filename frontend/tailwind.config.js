/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        background: '#030305',
        surface: 'rgba(25, 25, 30, 0.4)',
        surfaceHover: 'rgba(35, 35, 45, 0.5)',
        surfaceBorder: 'rgba(255, 255, 255, 0.08)',
        primary: {
          400: '#60A5FA', // blue-400
          500: '#3B82F6', // blue-500
          600: '#2563EB', // blue-600
        },
        accent: {
          400: '#A78BFA', // violet-400
          500: '#8B5CF6', // violet-500
          600: '#7C3AED', // violet-600
        },
        glow: {
          blue: 'rgba(59, 130, 246, 0.5)',
          purple: 'rgba(139, 92, 246, 0.5)',
          teal: 'rgba(20, 184, 166, 0.5)',
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-glow': 'conic-gradient(from 180deg at 50% 50%, #3b82f6 0deg, #8b5cf6 180deg, #14b8a6 360deg)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 8s linear infinite',
        'blob': 'blob 7s infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        shimmer: {
          from: { backgroundPosition: '200% 0' },
          to: { backgroundPosition: '-200% 0' },
        }
      }
    },
  },
  plugins: [],
}
