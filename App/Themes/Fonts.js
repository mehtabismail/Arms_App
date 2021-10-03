const type = {
  base: 'Avenir-Book',
  // bold: 'Avenir-Black',
  // emphasis: 'HelveticaNeue-Italic'

  /** 
   * NOTE: 
   * - Android only accepted base font.
   * - To use bold and italic font effect, use fontWeight & fontStyle. 
   * - Else, use custom style fontBold & fontItalic
   * */
}

const size = {
  h1: 38,
  h2: 34,
  h3: 30,
  h4: 26,
  h5: 20,
  h6: 19,
  input: 18,
  regular: 17,
  large: 16,
  medium: 14,
  small: 12,
  tiny: 8.5,
  label: 11,
}

const style = {
  fontBold: {
    fontFamily: type.base,
    fontWeight: 'bold',
  },
  fontItalic: {
    fontFamily: type.base,
    fontStyle: 'italic',
  },
  h1: {
    fontFamily: type.base,
    fontSize: size.h1
  },
  h2: {
    fontWeight: 'bold',
    fontSize: size.h2
  },
  h3: {
    fontFamily: type.base,
    fontSize: size.h3
  },
  h4: {
    fontFamily: type.base,
    fontSize: size.h4
  },
  h5: {
    fontFamily: type.base,
    fontSize: size.h5
  },
  h6: {
    fontFamily: type.base,
    fontSize: size.h6
  },
  normal: {
    fontFamily: type.base,
    fontSize: size.regular
  },
  description: {
    fontFamily: type.base,
    fontSize: size.medium
  },
  buttonText: {
    fontFamily: type.base,
    fontWeight: 'bold',
  }
}

export default {
  type,
  size,
  style
}
