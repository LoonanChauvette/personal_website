/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // Surface colors - tonal layering
        surface: '#fcf9f8',
        'surface-container': '#f0eded',
        'surface-container-low': '#f6f3f2',
        'surface-container-lowest': '#ffffff',
        
        // Text colors
        'on-surface': '#323233',
        'on-surface-variant': '#6b6b6a',
        
        // Primary (blue) - reserved for interactive elements only
        primary: '#115cb9',
        'primary-container': '#d7e2ff',
        
        // Outline
        'outline-variant': '#b2b2b1',
      },
      fontFamily: {
        serif: ['Noto Serif', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Display & Headline (Noto Serif)
        'display-lg': ['3.5rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        'display-md': ['2.75rem', { lineHeight: '1.2', letterSpacing: '-0.015em' }],
        'display-sm': ['2.25rem', { lineHeight: '1.3', letterSpacing: '-0.01em' }],
        'headline-lg': ['2rem', { lineHeight: '1.3', letterSpacing: '-0.01em' }],
        'headline-md': ['1.75rem', { lineHeight: '1.4', letterSpacing: '0' }],
        'headline-sm': ['1.5rem', { lineHeight: '1.4', letterSpacing: '0' }],
        
        // Title & Body (Inter)
        'title-lg': ['1.375rem', { lineHeight: '1.5', letterSpacing: '0' }],
        'title-md': ['1.125rem', { lineHeight: '1.5', letterSpacing: '0.0015em' }],
        'title-sm': ['0.875rem', { lineHeight: '1.5', letterSpacing: '0.001em' }],
        'body-lg': ['1rem', { lineHeight: '1.6', letterSpacing: '-0.01em' }],
        'body-md': ['0.875rem', { lineHeight: '1.6', letterSpacing: '0' }],
        'body-sm': ['0.75rem', { lineHeight: '1.6', letterSpacing: '0.004em' }],
        
        // Labels (Inter, often all caps)
        'label-lg': ['0.875rem', { lineHeight: '1.4', letterSpacing: '0.01em' }],
        'label-md': ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.05em' }],
        'label-sm': ['0.6875rem', { lineHeight: '1.4', letterSpacing: '0.05em' }],
      },
      spacing: {
        '1': '0.25rem',   // 4px
        '2': '0.5rem',    // 8px
        '3': '0.75rem',   // 12px
        '4': '1rem',      // 16px
        '5': '1.25rem',   // 20px
        '6': '1.5rem',    // 24px
        '8': '2rem',      // 32px
        '10': '2.5rem',   // 40px
        '12': '3rem',     // 48px
        '16': '4rem',     // 64px
        '20': '5rem',     // 80px
        '24': '6rem',     // 96px
      },
      borderRadius: {
        none: '0px',      // Hard edges throughout
      },
      boxShadow: {
        'whisper': '0px 20px 40px rgba(50, 50, 51, 0.04)', // Subtle shadow for floating elements
      },
      backdropBlur: {
        'nav': '12px',    // For sticky header
      },
    },
  },
  plugins: [],
};
