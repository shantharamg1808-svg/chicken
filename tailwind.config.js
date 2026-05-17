export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'sans-serif'], mono: ['Space Mono', 'monospace'] },
      colors: {
          'utility-red': '#E53935', 'utility-green': '#43A047',
          'utility-yellow': '#FDD835', 'utility-blue': '#1E88E5',
          'utility-dark': '#212121', 'utility-bg': '#F5F5F5'
      }
    },
  },
  plugins: [],
}
