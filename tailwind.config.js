/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta institucional de la cooperativa
        coop: {
          navy: '#0B3B66',      // color principal (títulos, botones secundarios)
          'navy-dark': '#082A49', // barra superior y pie
          'navy-deep': '#0B2238', // fondos oscuros / texto sobre verde claro
          green: '#17783F',     // llamados a la acción
          'green-dark': '#11602F',
          mint: '#8EE0AE',      // acento sobre fondos oscuros
          'green-soft': '#E7F5EC',
          'blue-soft': '#E8F0F8',
          orange: '#B5520F',
          'orange-soft': '#FDEEE2',
          ground: '#F3F6F9',    // fondo general
          ink: '#14212E',       // texto principal
          muted: '#52606D',     // texto secundario
          line: '#DDE5EE',      // bordes
          'line-soft': '#E1E8F0',
          'line-strong': '#C9D5E2',
        },
      },
      fontFamily: {
        sans: ['Barlow', 'system-ui', 'sans-serif'],
        display: ['"Barlow Condensed"', 'Barlow', 'sans-serif'],
      },
      boxShadow: {
        card: '0 18px 40px rgba(8, 42, 73, 0.16)',
        soft: '0 6px 16px rgba(8, 42, 73, 0.12)',
      },
      maxWidth: {
        site: '1200px',
      },
    },
  },
  plugins: [],
};
