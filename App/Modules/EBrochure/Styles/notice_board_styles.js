import {Dimensions, StyleSheet} from 'react-native';
import {Colors, Metrics, Fonts} from '../../../Themes';

export default StyleSheet.create({
  FlatListItemContainer: {
    borderRadius: Metrics.containerRadius,
    marginVertical: Metrics.doubleBaseMargin, 
    marginHorizontal: Metrics.baseMargin,
    marginBottom: Metrics.basePadding+50,

    /** Shadow Effect Settings **/
    backgroundColor: Colors.body,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 5},
    shadowOpacity: 0.58,
    shadowRadius: 5,
    elevation: 24,
  }
});