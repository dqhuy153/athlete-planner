/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Core palette
        background: 'var(--background)',
        foreground: 'var(--foreground)',

        // Surface levels (depth)
        surface: {
          1: 'var(--surface-1)',
          2: 'var(--surface-2)',
          3: 'var(--surface-3)',
        },

        // Accent (Cyan/Teal)
        accent: {
          DEFAULT: 'var(--accent)',
          muted: 'var(--accent-muted)',
          foreground: 'var(--accent-foreground)',
        },

        // Text
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-tertiary': 'var(--text-tertiary)',

        // Semantic
        success: 'var(--success)',
        warning: 'var(--warning)',
        error: 'var(--error)',

        // Border
        border: 'var(--border)',
        'border-muted': 'var(--border-muted)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'display': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'heading': ['1.875rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        'subheading': ['1.25rem', { lineHeight: '1.4', letterSpacing: '-0.005em' }],
        'body': ['1rem', { lineHeight: '1.6' }],
        'caption': ['0.875rem', { lineHeight: '1.5' }],
        'micro': ['0.75rem', { lineHeight: '1.4' }],
      },
      spacing: {
        'touch': '48px', // Minimum touch target
        '18': '4.5rem',
        '22': '5.5rem',
      },
      borderRadius: {
        'sm': '6px',
        'md': '10px',
        'lg': '14px',
        'xl': '20px',
      },
      animation: {
        'fade-in': 'fadeIn 200ms ease-out',
        'slide-up': 'slideUp 200ms ease-out',
        'pulse-subtle': 'pulseSubtle 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
      transitionDuration: {
        'fast': '150ms',
        'normal': '200ms',
        'slow': '300ms',
      },
    },
  },
  plugins: [],
};
