/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        telegraph: ['Telegraph', 'system-ui', 'sans-serif'],
      },
      colors: {
        institutional: {
          DEFAULT: 'var(--color-institutional)',
          dark: 'var(--color-institutional-dark)',
          light: 'var(--color-institutional-light)',
        },
        cold: {
          gray: 'var(--color-cold-gray)',
          lighter: 'var(--color-cold-gray-lighter)',
          lightest: 'var(--color-cold-gray-lightest)',
        },
        accent: {
          cyan: 'var(--color-accent-cyan)',
          cyanLight: 'var(--color-accent-cyan-light)',
        },
      },
      boxShadow: {
        'card': 'var(--shadow-card)',
        'card-hover': 'var(--shadow-card-hover)',
        'elevated': 'var(--shadow-elevated)',
      },
    },
  },
  plugins: [],
}
