import autoprefixer from 'autoprefixer';
import postcssNested from 'postcss-nested';
import tailwindcssAnimate from 'tailwindcss-animate';
import tailwindcssMotion from 'tailwindcss-motion';
import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontSize: {
        xxs: '1px',
        xs: '4px',
        sm: '10px',
        base: '12px',
        md: '14px',
        lg: '16px',
        xl: '18px',
        '2xl': '20px',
        '3xl': '24px',
        '4xl': '30px',
        '5xl': '36px',
        '6xl': '48px',
        '7xl': '64px'
      },
      gridTemplateColumns: {
        sidebar: '330px auto',
        'sidebar-collapsed': '64px auto'
      },
      gridTemplateColumnsMain: {
        sidebar: '300px auto',
        'sidebar-collapsed': '64px auto'
      },
      gridTemplateColumnsRightSidebar: {
        sidebar: 'auto 550px',
        'sidebar-collapsed': 'auto 64px'
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in': 'slideIn 0.5s ease-out',
        'rotate-shake': 'rotate-shake 1.9s infinite',
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out'
      },
      keyframes: {
        gradientShift: {
          '0%': { background: 'linear-gradient(to right, #FFD700, #FF5900)' },
          '100%': { background: 'linear-gradient(to right, #FF5900, #FFD700)' }
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        levitate: {
          '0%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
          '100%': { transform: 'translateY(0)' }
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' }
        },
        'rotate-shake': {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '50%': { transform: 'rotate(5deg)' }
        },
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' }
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))'
        },
        yellow: '#FFD700',
        lighterYellow: '#FFFEA6',
        lightYellow: '#FEE773',
        mangoYellow: '#FDFFB1',
        paleYellow: '#FFF9C4',
        softYellow: '#FFF176',
        goldenYellow: '#FFEB3B',
        amberYellow: '#FFC107',
        darkYellow: '#FFA000',
        deepYellow: '#FF8F00',
        whiteYellow: '#FFFCEA',
        orange: '#FF5900',
        gray: '#606060',
        white: '#FFFFFF',
        black: '#000000',
        lightOrange: '#FF9C67',
        Amber: {
          '50': '#FFF5F0',
          '100': '#FFE6D5',
          '200': '#FFCCAA',
          '300': '#FFB380',
          '400': '#FF9966',
          '500': '#FF7F4D',
          '600': '#FF6633',
          '700': '#CC5229',
          '800': '#993D1F',
          '900': '#662914'
        }
      },
      gradientColorStops: {
        'yellow-orange': ['#FFD700', '#FF5900'],
        'yellow-gray': ['#FFD700', '#E0E0E0'],
        'orange-yellow': ['#FF5900', '#FFEB73']
      },
      fontFamily: {
        roboto: ['Roboto', 'sans-serif'],
        funnel: ['Funnel Sans', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        lato: ['Lato', 'sans-serif'],

      }
    }
  },
  plugins: [
    autoprefixer,
    postcssNested,
    tailwindcssAnimate,
    tailwindcssMotion,
    typography,
    function ({ addUtilities, theme }) {
      const newUtilities = Object.entries(theme('gridTemplateColumnsMain')).reduce(
        (acc, [key, value]) => {
          acc[`.grid-cols-main-${key}`] = { gridTemplateColumns: value };
          return acc;
        },
        {}
      );
      addUtilities(newUtilities, ['responsive']);
    }
  ]
};
