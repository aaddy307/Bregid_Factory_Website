import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#200d00',
        'primary-container': '#3e1f00',
        secondary: '#7c5630',
        'leather-tan': '#BE7D41',
        background: '#fff8f5',
        surface: '#fff8f5',
        'factory-white': '#FDFDFD',
        'surface-container': '#f6ece6',
        'surface-container-low': '#fcf2ec',
        'surface-container-high': '#f0e6e0',
        'surface-variant': '#ebe1db',
        'on-surface': '#1f1b17',
        'on-surface-variant': '#50453b',
        'muted-sage': '#7F715C',
        outline: '#83746a',
        'outline-variant': '#d5c3b7',
        error: '#ba1a1a',
        'workshop-grey': '#111518',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'dot-grid': 'radial-gradient(circle, #d5c3b7 1px, transparent 1px)',
      },
      backgroundSize: {
        'dot-grid': '20px 20px',
      },
    },
  },
  plugins: [],
};
export default config;
