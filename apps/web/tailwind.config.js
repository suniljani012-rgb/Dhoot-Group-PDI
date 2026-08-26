/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#FAFAFA',
        surface: '#FFFFFF',
        line: '#E5E7EB',
        'line-strong': '#CBD5E1',
        ink: '#0F172A',
        'ink-2': '#475569',
        'ink-3': '#94A3B8',
        accent: '#0F172A',
        'accent-soft': '#F1F5F9',
        ok: '#10B981',
        danger: '#EF4444',
        warn: '#F59E0B',
        brand: {
          primary: '#1A3A6B',
          secondary: '#C8102E',
        }
      },
      borderRadius: {
        chip: '4px',
      }
    },
  },
  plugins: [],
}