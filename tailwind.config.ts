import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // GitHub/VS Code/Corkboard Inspired Palette
        sidebar: {
          bg: '#f6f8fa',        // GitHub light gray
          hover: '#eaeef2',
          border: '#d0d7de',
        },
        main: {
          bg: '#fefaf5',        // Warm corkboard cream
        },
        card: {
          bg: '#ffffff',
          border: '#d0d7de',
          'border-hover': '#0969da',
        },
        primary: {
          DEFAULT: '#0969da',   // GitHub blue
          hover: '#0550ae',
          light: '#ddf4ff',
        },
        success: {
          DEFAULT: '#1a7f37',
          light: '#dafbe1',
        },
        warning: {
          DEFAULT: '#bf8700',
          light: '#fff8c5',
        },
        danger: {
          DEFAULT: '#cf222e',
          light: '#ffebe9',
        },
        text: {
          primary: '#24292f',   // Dark charcoal
          secondary: '#57606a', // Medium gray
          tertiary: '#8c959f',  // Light gray
          inverse: '#ffffff',
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0, 0, 0, 0.06)',
        'dropdown': '0 8px 24px rgba(0, 0, 0, 0.12)',
      },
      borderRadius: {
        'DEFAULT': '8px',
        'lg': '12px',
      },
    },
  },
  plugins: [],
};

export default config;