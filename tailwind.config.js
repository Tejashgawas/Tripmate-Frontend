/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx,jsx,js}", "./components/**/*.{ts,tsx,jsx,js}", "*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      /* 1 ➜ define an RGB triplet so “/opacity” utilities work */
      colors: {
        primary: "30 64 175",     // #1e40af
        secondary: "6 182 212",   // #06b6d4   (optional helper)
      },
    },
  },
  plugins: [],
}
