import type { Config } from 'tailwindcss'
export default { content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'], theme: { extend: { colors: { ink: '#17171c', paper: '#fbfaf8', violet: '#6b5ce7' }, fontFamily: { sans: ['Arial', 'Helvetica', 'sans-serif'] } } }, plugins: [] } satisfies Config
