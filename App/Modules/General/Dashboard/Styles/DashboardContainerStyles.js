import { Dimensions, StyleSheet } from 'react-native';
import { Colors, Metrics, Fonts } from '../../../../Themes';

export default StyleSheet.create({
  headerLogoContainer: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    height: 40,
    flexDirection: 'row',
    marginBottom: Metrics.smallMargin,
    marginHorizontal: Metrics.baseMargin,
  },
  scanContainer: {
    alignItems: 'center',
    // backgroundColor: Colors.body,
    backgroundColor: '#EFF1F3',
    width: '90%',
    // height: 600, //Dimensions.get('window').height - Metrics.headerContainerHeight,
    margin: Metrics.baseMargin,
    borderWidth: 1,
    borderRadius: 2,
    borderColor: '#ddd',
    /** Shadow Effect Settings **/
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.58,
    shadowRadius: 5,
    elevation: 24,
  },
  pointContainer: {
    alignItems: 'center',
    backgroundColor: Colors.body,
    width: '100%',
    // margin: Metrics.smallMargin,
    // borderWidth: 1,
    // borderRadius: 2,
    // borderColor: '#ddd',
    /** Shadow Effect Settings **/
    // shadowColor: '#000',
    // shadowOffset: {width: 0, height: 5},
    // shadowOpacity: 0.58,
    // shadowRadius: 5,
    // elevation: 24,
  },
  historyContainer: {
    flexDirection: 'row',
    margin: Metrics.baseMargin,
    alignItems: 'center',
    padding: Metrics.basePadding,
    justifyContent: 'space-between',
    backgroundColor: Colors.body,
    borderRadius: 10,
    /** Shadow Effect Settings **/
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});