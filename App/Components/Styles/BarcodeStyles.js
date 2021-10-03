import {Colors, Metrics} from '../../Themes';
import {Dimensions} from 'react-native';

const BarcodeContainer = {
  modalContainer: {
    flex: 1,
    backgroundColor:'rgba(0, 0, 0, 0.57)',
    justifyContent: 'center',
  },
  modalViewContainer: {
    width: '90%', 
    backgroundColor: Colors.background,
    padding: Metrics.basePadding, 
    marginHorizontal: Dimensions.get('window').width*0.1, 
    marginVertical: Dimensions.get('window').height*0.05,
    borderRadius: Metrics.containerRadius,
    alignSelf: 'center',

    /** Shadow Effect Settings **/
    backgroundColor: Colors.body,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 5},
    shadowOpacity: 0.58,
    shadowRadius: 5,
    elevation: 24,
  },
}

export default BarcodeContainer;