import {Dimensions, StyleSheet} from 'react-native';
import {Colors, Metrics, Fonts} from '../../../Themes';

export default StyleSheet.create({
  
  // Credits & Points
  CreditsPointsContainer: {
    width: '47.5%',
    borderColor: Colors.border_line, borderTopWidth: 1, borderBottomWidth: 1,
    paddingVertical: Metrics.basePadding,
    backgroundColor: Colors.body
  },
  CreditsPointsText: {
    color: Colors.primary, 
    fontSize: Fonts.size.h6, fontWeight: 'bold',
    textAlign: 'center',
  },

  // Categories
  CategoriesContainer: {
    borderColor: Colors.border_line, borderTopWidth: 1, borderBottomWidth: 1,
    backgroundColor: Colors.body
  },
  CategoriesHeaderContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'baseline',
    padding: Metrics.basePadding, paddingBottom: Metrics.smallPadding
  },
  CategoriesHeaderTitle: {
    fontSize: Fonts.size.h5 + 2,
    fontWeight: 'bold',
    color: Colors.primary
  },

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