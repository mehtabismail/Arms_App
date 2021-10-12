module.exports = {
  purge: [],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        buttonss: "#586bca"
      }
    },
  },
  variants: {
    extend: {

    },
  },
  plugins: [
    require('tailwindcss-elevation')(
      [],
      {
        color: '77,192,181',
        opacityBoost: '0.23'
      }
    )
  ],
}
