/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      transitionDuration: {
        DEFAULT: '300ms'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      width: {
        4.5: '1.125rem'
      },
      height: {
        4.5: '1.125rem'
      },
      grayscale: {
        50: '.5'
      },
      keyframes: {
        'caret-blink': {
          '0%,70%,100%': { opacity: '1' },
          '20%,50%': { opacity: '0' },
        },
      },
      animation: {
        'caret-blink': 'caret-blink 1.2s ease-out infinite',
      },
      colors: {
        brand: '#238ff1',
        'brand-dark': '#147fdf',
        grey: {
          50: 'hsl(var(--rl-grey-50))',
          100: 'hsl(var(--rl-grey-100))',
          150: 'hsl(var(--rl-grey-150))',
          200: 'hsl(var(--rl-grey-200))',
          250: 'hsl(var(--rl-grey-250))',
          300: 'hsl(var(--rl-grey-300))',
          350: 'hsl(var(--rl-grey-350))',
          400: 'hsl(var(--rl-grey-400))',
          450: 'hsl(var(--rl-grey-450))',
          500: 'hsl(var(--rl-grey-500))',
          550: 'hsl(var(--rl-grey-550))',
          600: 'hsl(var(--rl-grey-600))',
          650: 'hsl(var(--rl-grey-650))',
          700: 'hsl(var(--rl-grey-700))',
          750: 'hsl(var(--rl-grey-750))',
          800: 'hsl(var(--rl-grey-800))',
          850: 'hsl(var(--rl-grey-850))',
          875: 'hsl(var(--rl-grey-875))',
          900: 'hsl(var(--rl-grey-900))',
          950: 'hsl(var(--rl-grey-950))',
          1000: 'hsl(var(--rl-grey-1000))',
        },
        primary: {
          50: 'hsl(var(--rl-primary-50))',
          100: 'hsl(var(--rl-primary-100))',
          200: 'hsl(var(--rl-primary-200))',
          300: 'hsl(var(--rl-primary-300))',
          400: 'hsl(var(--rl-primary-400))',
          500: 'hsl(var(--rl-primary-500))',
          600: 'hsl(var(--rl-primary-600))',
          700: 'hsl(var(--rl-primary-700))',
          800: 'hsl(var(--rl-primary-800))',
          900: 'hsl(var(--rl-primary-900))',
          950: 'hsl(var(--rl-primary-950))',
        },
      },
    },
  },
  plugins: [],
}
