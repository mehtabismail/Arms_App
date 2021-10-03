import {Dimensions, StyleSheet} from 'react-native';
import {Colors, Metrics, Fonts} from '../../../Themes';

export default StyleSheet.create({
  
  // Product Title
  ProductTitleContainer: {
    backgroundColor: Colors.body,
    borderColor: Colors.border_line, borderTopWidth: 1, borderBottomWidth: 1,
    marginVertical: Metrics.smallMargin,
    paddingVertical: Metrics.smallPadding,
    paddingHorizontal: Metrics.basePadding
  },
  ProductTitle: {
    fontSize: Fonts.size.h5 + 2,
    fontWeight: 'bold',
    color: Colors.primary
  }
});