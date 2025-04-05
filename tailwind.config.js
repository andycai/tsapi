/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./templates/**/*.html",
    "./public/**/*.js",
    "./public/**/*.css"
  ],
  // Add safelist for classes that might be dynamically generated
  safelist: [
    // Indigo colors for buttons
    'bg-indigo-500',
    'bg-indigo-600',
    'bg-indigo-700',
    'hover:bg-indigo-600',
    'hover:bg-indigo-700',
    'focus:ring-indigo-500',
    'text-indigo-600',
    'border-indigo-500',
    // Red colors for error/warning buttons
    'bg-red-600',
    'hover:bg-red-700',
    'focus:ring-red-500',
  ],
  theme: {
    extend: {
      colors: {
        // We keep the primary color definitions for reference but use standard indigo in templates
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  // Disable core plugins you don't use to reduce size
  corePlugins: {
    aspectRatio: false,
    container: false,
    objectPosition: false,
    tableLayout: false, 
    placeholderColor: false,
    placeholderOpacity: false,
    ringOffsetWidth: false,
    ringOffsetColor: false,
    ringWidth: false,
    ringColor: false,
    ringOpacity: false,
  },
  plugins: [],
  // Enable JIT mode for smaller builds
  mode: 'jit',
  darkMode: 'class',
  future: {
    hoverOnlyWhenSupported: true,
  }
} 