import {Colors, Metrics, Fonts} from '../../../Themes';
import {Dimensions, Platform} from 'react-native';
import { getColor } from '../../../../tailwind';

const PackageContainer = {
  mainContainer: {
    margin: Metrics.baseMargin,
    borderRadius: Metrics.containerRadius,
    /** Shadow Effect Settings **/
    backgroundColor: Colors.body,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 5},
    shadowOpacity: 0.58,
    shadowRadius: 5,
    elevation: 15,
  },
  packageImageStyle: {
    borderTopLeftRadius: Metrics.containerRadius,
    borderTopRightRadius: Metrics.containerRadius,
    width: '100%',
    height: Metrics.images.prodImg,
  },
  packageImageLabelContainer: {
    borderTopLeftRadius: Metrics.containerRadius,
    borderTopRightRadius: Metrics.containerRadius,
    width: '100%',
    height: Metrics.images.prodImg,
    backgroundColor: Colors.opacityBlurBackground, 
    justifyContent: 'center', 
    position: 'absolute',
  },
  packageNameStyle: {
    color: Colors.text_color_1, 
    fontWeight: 'bold', 
    fontSize: Fonts.size.h4
  },
  packageInfoStyle: {
    fontSize: Fonts.size.medium, 
    marginTop: Metrics.smallMargin
  },
  packageItemInfoStyle: {
    fontSize: Fonts.size.large, 
    // marginTop: Metrics.smallMargin
  },
  labelNameStyle: {
    color: Colors.text_color_1, 
    fontWeight: 'bold', 
    fontSize: Fonts.size.large
  },
  labelDataStyle1: {
    color: Colors.text_color_1, 
    fontWeight: 'bold', 
    fontSize: (Dimensions.get("window").width > 400)?45:40, 
    marginTop: Metrics.smallMargin
  },
  labelDataStyle2: {
    color: Colors.text_color_1, 
    fontWeight: 'bold', 
    fontSize: (Dimensions.get("window").width > 400)?30:25, 
    marginTop: Metrics.smallMargin
  },
}

export default PackageContainer;