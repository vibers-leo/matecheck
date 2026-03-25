/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF7F50', // Coral
          light: '#FFAB91',
          dark: '#E64A19',
        },
        secondary: {
          DEFAULT: '#4DB6AC', // Soft Teal
        },
        vote: '#5C6BC0', // Indigo
        toss: {
          blue: '#3182f6',
          gray: {
            DEFAULT: '#4e5968',
            dark: '#191f28',
            light: '#8b95a1',
            input: '#f2f4f6',
          },
          bg: '#f9fafb',
          success: '#2da07a',
          error: '#f04452',
        }
      }
    },
  },
  darkMode: "class",
  corePlugins: {
    preflight: false,
  },
  plugins: [],
}
