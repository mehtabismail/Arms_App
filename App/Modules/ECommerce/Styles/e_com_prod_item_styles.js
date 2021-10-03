import {Dimensions, StyleSheet} from 'react-native';
import {Colors, Metrics, Fonts} from '../../../Themes';

export default StyleSheet.create({
  
  // Product Image, Desc & Price 
  ProdImgDescPriceContainer: {
    backgroundColor: Colors.body,
    borderBottomWidth: 1, borderColor: Colors.border_line,
    paddingBottom: Metrics.basePadding
  }, 
  ProdDescPriceContainer: {
    paddingHorizontal: Metrics.smallPadding,
    paddingVertical: Metrics.smallPadding
  },
  ProdDescPriceText: {
    fontSize: Fonts.size.h6,
    color: Colors.primary
  },
  ProdDescPriceOriginalText: {
    fontSize: Fonts.size.regular,
    color: Colors.gray,
    textDecorationLine: 'line-through', 
  },

  // Product Image
  TotalProdImageIndicatorContainer: {
    position: 'absolute',
    left: 5, bottom: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.80)',
    borderWidth: 1, borderRadius: 15,
    padding: Metrics.smallPadding
  },

  // Product Variation Modal
  PVModalDarkBackgroundContainer: {
    backgroundColor: Colors.modalBackground,
    flex: 1,
    justifyContent: 'flex-end',
  }

});