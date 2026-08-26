/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    // Deliberately constrained scales. Fewer choices = fewer inconsistencies.
    extend: {
      colors: {
        canvas: '#FAFAFA',
        surface: '#FFFFFF',
        line: '#E8EAED',
        'line-strong': '#D7DBE0',
        ink: '#0E1116',
        'ink-2': '#4A5159',
        'ink-3': '#858C95',
        accent: {
          DEFAULT: '#1A3A6B',
          soft: '#EEF2F8',
          line: '#C9D6E8',
          600: '#254B85',
          400: '#5B7CAE',
          300: '#8AA3C6',
          200: '#B6C5DA',
        },
        ok: '#0B7355',
        warn: '#A65A00',
        danger: '#B3253C',
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        // one tight scale, nothing below 11px
        label: ['0.6875rem', { lineHeight: '1rem', letterSpacing: '0.06em' }],
        xs: ['0.75rem', { lineHeight: '1.125rem' }],
        sm: ['0.8125rem', { lineHeight: '1.25rem' }],
        base: ['0.875rem', { lineHeight: '1.375rem' }],
        lg: ['1.0625rem', { lineHeight: '1.5rem', letterSpacing: '-0.011em' }],
        num: ['1.625rem', { lineHeight: '1.875rem', letterSpacing: '-0.02em' }],
      },
      fontWeight: { normal: '400', medium: '500', semibold: '600' },
      borderRadius: { chip: '4px', DEFAULT: '6px', md: '6px', lg: '8px', panel: '10px' },
      boxShadow: {
        // exactly one elevation, reserved for things that float
        pop: '0 8px 28px -6px rgba(14,17,22,0.16), 0 2px 6px -2px rgba(14,17,22,0.08)',
      },
    },
  },
  plugins: [],
}