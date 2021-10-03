import {Dimensions, StyleSheet} from 'react-native';
import {Colors, Metrics, Fonts} from '../../../Themes';

export default StyleSheet.create({
  // Delivery Address TextInput 
  deliveryAddressTextInput: {
    color: '#000000',
    fontSize: Fonts.size.regular,
    // fontWeight: 'bold',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Metrics.smallPadding, paddingVertical: Metrics.smallPadding+2,
    borderWidth: 1, borderColor: Colors.border_line,
    // marginBottom: Metrics.basePadding-2
  }
});