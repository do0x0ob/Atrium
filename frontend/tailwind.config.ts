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
        primary: {
          pink: '#FFB3D9',
          purple: '#B8A4E8',
          orange: '#FFB366',
        },
        background: {
          main: '#FFFFFF',
          glass: 'rgba(255, 255, 255, 0.7)',
        },
        text: {
          primary: '#2D3748',
          secondary: '#718096',
        }
      },
      backgroundImage: {
        'gradient-header': 'linear-gradient(135deg, #FFB3D9 0%, #B8A4E8 50%, #FFB366 100%)',
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
};

export default config;

