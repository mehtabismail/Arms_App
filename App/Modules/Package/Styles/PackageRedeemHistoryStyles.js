import {Colors, Metrics, Fonts, ApplicationStyles} from '../../../Themes';
import {Dimensions, Platform} from 'react-native';

const PackageRedeemHistoryContainer = {
  shadow: {
    /** Shadow Effect Settings **/
    backgroundColor: Colors.body,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 5},
    shadowOpacity: 0.58,
    shadowRadius: 5,
    elevation: 15,
  },
  headerContainer: {
    marginTop: Metrics.baseMargin,
    marginHorizontal: Metrics.doubleBaseMargin,
    paddingVertical: Metrics.basePadding,
    justifyContent: 'center',
  },
  flatListContainerRow: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: Metrics.basePadding,
    // ...ApplicationStyles.screen.test
  },
  flatListContainerTitleFont: {
    ...Fonts.style.normal,
    fontWeight: 'bold', 
    color: Colors.primary
  },
  flatListContainerHelpFont: {
    ...Fonts.style.description
  },
  flatListContainerStars: {
    width: '80%',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    // ...ApplicationStyles.screen.test
  },
}

export default PackageRedeemHistoryContainer;