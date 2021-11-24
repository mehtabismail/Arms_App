import {Colors, Metrics, Fonts} from '../../../Themes';
import {Dimensions, Platform} from 'react-native';
import { getColor } from '../../../../tailwind';

const VoucherContainer = {
  shadow: {
    /** Shadow Effect Settings **/
    backgroundColor: 'lavenderblush',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 5},
    shadowOpacity: 0.58,
    shadowRadius: 5,
    elevation: 15,
  },
  headerContainer: {
    marginHorizontal: Metrics.doubleBaseMargin,
    paddingVertical: Metrics.basePadding,
    justifyContent: 'center',
  },
  headerButtonContainer: {
    flexDirection: 'row', 
    borderRadius: 5, 
    borderColor: getColor('primary'), 
    borderWidth: 2, 
    marginLeft: Metrics.doubleBaseMargin+5,
    marginBottom: (Platform.OS === "ios") ? Metrics.smallMargin : 0,
  },
  ribbonSpace: {
    height: '100%', 
    width: '20%',
  },
  voucherName: {
    height: '100%',
    width: '50%',
  },
  voucherValueContainer: {
    height:'100%', 
    width: '30%', 
    alignItems: 'center',
    justifyContent: 'center', 
    padding: 5, 
    backgroundColor: 'lightcoral', 
    borderRadius: 5, 
    borderWidth: 1, 
    borderColor: Colors.borderBlack, 
    borderStyle: 'dashed'
  },
  voucherValuePrefixCurrencyText: {
    color: Colors.text_color_3, 
    fontWeight: 'bold', 
    fontSize: Fonts.size.h5, 
    textAlign: 'justify',
  },
  voucherValueText: {
    ...Fonts.style.h2,
    color: Colors.text_color_3, 
    fontWeight: 'bold', 
    textAlign: 'justify',
  },
  voucherValueTextInTC: {
    ...Fonts.style.h1,
    color: Colors.text_color_3, 
    fontWeight: 'bold', 
    textAlign: 'justify',
  },
}

export default VoucherContainer;