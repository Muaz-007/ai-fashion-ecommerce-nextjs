import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Premium Pakistani fashion palette
        cream: {
          DEFAULT: '#FAF7F2',
          50: '#FDFBF8',
          100: '#FAF7F2',
          200: '#F2EDE4',
          300: '#E8DFCF',
          400: '#D4C4A8',
        },
        ink: {
          DEFAULT: '#1A1614',
          50: '#3A2E26',
          100: '#2A2522',
          200: '#1A1614',
          300: '#0D0A09',
        },
        accent: {
          DEFAULT: '#B08D5A',
          light: '#D4B896',
          DEFAULT_dark: '#8B6F47',
          50: '#F5EDDF',
          100: '#D4B896',
          200: '#B08D5A',
          300: '#8B6F47',
          400: '#6B4F2E',
          500: '#5C3A28',
        },
        muted: {
          DEFAULT: '#6B5D4F',
          light: '#9C8E7F',
        },
        border: {
          DEFAULT: '#E5DDD0',
          dark: '#2A2522',
        },
        success: '#5A7A5A',
        error: '#B5575A',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Times New Roman', 'serif'],
        body: ['var(--font-body)', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        script: ['var(--font-script)', 'cursive'],
      },
      fontSize: {
        'display-xl': ['clamp(2.5rem, 6vw, 5rem)', { lineHeight: '1.05', letterSpacing: '-0.01em' }],
        'display-lg': ['clamp(2rem, 4.5vw, 3.5rem)', { lineHeight: '1.1', letterSpacing: '-0.01em' }],
        'display-md': ['clamp(1.5rem, 3vw, 2.25rem)', { lineHeight: '1.15' }],
        eyebrow: ['0.75rem', { lineHeight: '1', letterSpacing: '0.25em' }],
      },
      letterSpacing: {
        widest: '0.25em',
        wider: '0.2em',
      },
      maxWidth: {
        container: '1400px',
        narrow: '900px',
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease-out forwards',
        'fade-up': 'fadeUp 0.8s ease-out forwards',
        'scroll-down': 'scrollDown 2s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scrollDown: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(200%)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.5', transform: 'scale(1.5)' },
        },
      },
      boxShadow: {
        soft: '0 2px 8px rgba(26, 22, 20, 0.06)',
        medium: '0 8px 24px rgba(26, 22, 20, 0.08)',
        large: '0 20px 48px rgba(26, 22, 20, 0.12)',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
};

export default config;
