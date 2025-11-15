/** @type {import('tailwindcss').Config} */
export default {
  content: [
    // This array tells Tailwind where to look for utility classes (all JS/JSX files in src)
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable dark mode based on the 'dark' class on the HTML tag
  theme: {
    extend: {},
  },
  plugins: [],
}