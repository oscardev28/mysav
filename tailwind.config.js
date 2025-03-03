// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{html,ts}", // Asegúrate de que Tailwind escanee todos los archivos de Angular
  ],
  theme: {
    extend: {
      colors: {
        first: '#f6ff1f',
        second: 'rgb(57 123 245)',
        secondary: '#020617',

      },
    },
  },
  plugins: [],
};
