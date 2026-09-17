/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js}'],
  theme: {
    extend: {
      // Warm, playful palette: cream paper, deep-indigo ink, electric indigo
      // for the chart, sunny amber for income from wealth, coral for "you"
      // and calls to action, red only for debt.
      colors: {
        paper: '#fff8ec',
        card: '#ffffff',
        ink: '#1f1b3a',
        muted: '#665f7d',
        faint: '#a09ab3',
        rule: '#efe3cc',
        accent: { DEFAULT: '#5b4bff', lift: '#7d70ff', soft: '#eceaff' },
        capital: { DEFAULT: '#ffb000', lift: '#ffc63d', soft: '#fff1cc' },
        neg: { DEFAULT: '#e5484d', lift: '#f0686c', soft: '#fde2e3' },
        coral: { DEFAULT: '#ff5a36', lift: '#ff7a5c', soft: '#ffe4dc' },
        mint: { DEFAULT: '#1fb37a', soft: '#dcf5e7' },
      },
      fontFamily: {
        display: ['"Bricolage Grotesque Variable"', 'system-ui', '-apple-system', '"Segoe UI"', 'sans-serif'],
        sans: ['"Nunito Variable"', 'system-ui', '-apple-system', '"Segoe UI"', 'sans-serif'],
      },
      boxShadow: {
        pop: '0 12px 30px -12px rgba(31, 27, 58, 0.35)',
        tile: '0 1px 0 rgba(31, 27, 58, 0.06)',
      },
      maxWidth: {
        page: '70rem',
      },
    },
  },
  plugins: [],
}
