/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#020611',
          900: '#050c1c',
          850: '#081329',
          800: '#0a192f',
          750: '#0e223d',
          700: '#132c4e',
          600: '#1a3c68',
          500: '#23508a',
        },
        cyan: {
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          accent: '#00f5ff',
          glow: 'rgba(0, 245, 255, 0.4)',
        },
        electric: {
          blue: '#0080ff',
          indigo: '#4f46e5',
          purple: '#8b5cf6',
        },
        sensor: {
          active: '#10b981',
          warning: '#f59e0b',
          offline: '#ef4444',
          simulated: '#8b5cf6',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(0, 245, 255, 0.35)',
        'glow-blue': '0 0 25px rgba(0, 128, 255, 0.35)',
        'glow-subtle': '0 0 15px rgba(56, 189, 248, 0.15)',
        'glass-panel': '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'radar-sweep': 'radar 3s linear infinite',
        'signal-wave': 'wave 2s ease-out infinite',
      },
      keyframes: {
        radar: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        wave: {
          '0%': { transform: 'scale(0.8)', opacity: '1' },
          '100%': { transform: 'scale(2.2)', opacity: '0' },
        }
      }
    },
  },
  plugins: [],
}
