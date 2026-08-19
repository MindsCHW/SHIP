/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#5cb85c",
        sidebar: {
          active: "#4cae4c"
        },
        pageBg: "#F5F7FA",
        cardBg: "#FFFFFF",
        borderColor: "#E5E7EB",
        textColor: "#374151",
        muted: "#6B7280"
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
      keyframes: {
        traffic: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        }
      },
      animation: {
        'traffic': 'traffic 15s linear infinite',
      }
    },
  },
  plugins: [],
}
