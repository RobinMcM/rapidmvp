/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'rm-black':        '#07080d',
        'rm-dark':         '#0b0f1a',
        'rm-dark-2':       '#0f1623',
        'rm-dark-3':       '#141d2e',
        'azure':           '#0078d4',
        'azure-600':       '#0063b1',
        'azure-400':       '#2196f3',
        'azure-300':       '#50b4f8',
        'cf-orange':       '#f48120',
        'cf-600':          '#d4691a',
        'cf-300':          '#f9a558',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      animation: {
        'pulse-slow':    'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-up':       'fade-up 0.6s ease-out forwards',
        'fade-in':       'fade-in 0.5s ease-out forwards',
        'grid-flow':     'grid-flow 24s linear infinite',
        'glow-pulse':    'glow-pulse 3s ease-in-out infinite',
      },
      keyframes: {
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'grid-flow': {
          '0%':   { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '0 60px' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.4' },
          '50%':      { opacity: '0.8' },
        },
      },
    },
  },
  plugins: [],
}
