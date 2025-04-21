/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#F4B860', // Ana turuncu renk
        secondary: '#00204E', // Koyu lacivert renk
        background: '#F6F6F6', // Açık gri arka plan
        cream: '#FFF8F2', // Krem rengi
        
        // Turuncu tonları
        amber: {
          50: '#FFFBF0',
          100: '#FFF3D6',
          200: '#FFE7AD',
          300: '#FFD684',
          400: '#F9C873',
          500: '#F4B860', // Ana turuncu
          600: '#E19F3A',
          700: '#C88725',
          800: '#A66E1B',
          900: '#845812',
        },
        
        // Lacivert tonları
        navy: {
          50: '#E6EEF4',
          100: '#C7D6E6',
          200: '#94ADC9',
          300: '#6684AD',
          400: '#395A8F',
          500: '#153D78',
          600: '#0B2F61',
          700: '#00204E', // Ana lacivert
          800: '#001A40',
          900: '#001331',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 32, 78, 0.07), 0 10px 20px -2px rgba(0, 32, 78, 0.04)',
        'card': '0 2px 8px -1px rgba(0, 32, 78, 0.1), 0 2px 4px -1px rgba(0, 32, 78, 0.06)',
        'elevated': '0 10px 25px -5px rgba(0, 32, 78, 0.1), 0 5px 10px -5px rgba(0, 32, 78, 0.04)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      spacing: {
        '72': '18rem',
        '84': '21rem',
        '96': '24rem',
      },
    },
  },
  plugins: [],
}
