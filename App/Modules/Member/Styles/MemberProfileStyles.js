import {Colors, Metrics, Fonts} from '../../../Themes';
import {Dimensions} from 'react-native';

const ProfileContainer = {
  mainContainer: {
    backgroundColor: Colors.background ,
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-start',
    paddingBottom: Metrics.basePadding,
    marginHorizontal: Metrics.baseMargin,
    marginBottom:150, 
    borderTopLeftRadius: 20, 
    borderTopRightRadius: 20,
    // borderWidth: 2,
    // borderColor: 'red',
  },
  imageContainer: { 
    // width: Dimensions.get('window').width - (Dimensions.get('window').width * 0.5), 
    // height: Dimensions.get('window').height * 0.3, 
    backgroundColor: 'transparent', 
    margin: Metrics.baseMargin,
    alignSelf: 'center',
  },
  memberInfoContainer: {
    width: '100%',
    borderRadius: Metrics.containerRadius,
    padding: Metrics.smallPadding,
    margin: Metrics.baseMargin,
    /** Shadow Effect Settings **/
    backgroundColor: Colors.body,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 5},
    shadowOpacity: 0.58,
    shadowRadius: 5,
    elevation: 24,
  },
  detailContainer: {
    // flex: 1, 
    backgroundColor: Colors.body, 
    borderColor: 'white', 
    borderWidth: 2, 
    borderRadius: 5, 
    padding: Metrics.smallPadding,
    flexDirection: 'row',
    /** Shadow Effect Settings **/
    backgroundColor: Colors.body,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 5},
    shadowOpacity: 0.58,
    shadowRadius: 5,
    elevation: 24,
  },
}

export default ProfileContainer;