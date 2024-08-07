/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        typing: {
          "0%": {
            width: "0%",
            height: "100%", /* Keep the height constant */
            visibility: "hidden"
          },
          "1%": {
            visibility: "visible" /* Make the element visible right after the start */
          },
          "100%": {
            width: "100%"
          }  
        },
        blink: {
          "50%": {
            borderColor: "transparent"
          },
          "100%": {
            borderColor: "transparent"
          }  
        },
        rotate360: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        typing: "typing 4s steps(29) infinite alternate, blink 0s 1 0s",
        rotate360: 'rotate360 0.5s linear infinite',
      },
    },
  },
  plugins: [],
}