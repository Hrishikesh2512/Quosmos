/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Deep-space scientific palette
        void: '#05060f',
        nebula: {
          50: '#eef0ff',
          100: '#d9ddff',
          200: '#b4bcff',
          300: '#8f9bff',
          400: '#6b78f5',
          500: '#4f5ae0',
          600: '#3b44b8',
          700: '#2c338c',
          800: '#1e2360',
          900: '#121536',
        },
        quantum: {
          cyan: '#22d3ee',
          violet: '#a78bfa',
          magenta: '#f472b6',
          amber: '#f59e0b',
          emerald: '#34d399',
        },
        glass: 'rgba(255,255,255,0.04)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        glow: '0 0 40px -10px rgba(124,138,255,0.5)',
        'glow-cyan': '0 0 30px -8px rgba(34,211,238,0.6)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseGlow: {
          '0%,100%': { boxShadow: '0 0 0 0 rgba(124,138,255,0.4)' },
          '50%': { boxShadow: '0 0 24px 6px rgba(124,138,255,0.25)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out',
        float: 'float 4s ease-in-out infinite',
        shimmer: 'shimmer 2.5s linear infinite',
        'pulse-glow': 'pulseGlow 2.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
