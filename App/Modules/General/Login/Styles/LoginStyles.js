import { Dimensions, StyleSheet } from "react-native";
import { ApplicationStyles, Colors, Metrics, Fonts } from "../../../../Themes";

export default StyleSheet.create({
  attrRowContainer:{
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Metrics.doubleBaseMargin,
    width: '100%',
  },
  mainViewContainer: {
    backgroundColor: Colors.primary, 
    height: Dimensions.get('window').height, 
    justifyContent: 'center'
  },
  bodyContainer: {
    width: '100%', 
    height: Dimensions.get('window').height*0.8,
    marginVertical: Metrics.doubleBaseMargin, 
    padding: Metrics.basePadding, 
    borderRadius: 30, 
  },
  bodyContainerOld:{
    ...ApplicationStyles.screen.bodyContainer,
    marginHorizontal: Metrics.baseMargin,
    marginBottom: Metrics.baseMargin,
    paddingHorizontal: Metrics.basePadding,
    paddingTop: 30,
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,

    /** Shadow Effect Settings **/
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.58,
    shadowRadius: 5,
    elevation: 24,
  },
  modalViewContainer: {
    width: '100%', 
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
  textInputStyle: {
    borderColor: Colors.text_color_1, 
    backgroundColor: '#F4F4F4',
    borderWidth: 2, 
    borderRadius: 10, 
    width: Dimensions.get('window').width<400 ? 50 : 60, 
    height: Dimensions.get('window').width<400 ? 50 : 60, 
    margin: Metrics.smallMargin, 
    padding: Metrics.smallPadding, 
    textAlign: 'center',
    fontSize: Fonts.size.input, 
    fontWeight: 'bold',
  },
  tabStyle: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderColor: '#ddd',
    borderWidth: 1,
    width: '100%',
    paddingVertical: Metrics.basePadding, 
    position: 'absolute',
    bottom: 0,
    /** Shadow Effect Settings **/
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 5},
    shadowOpacity: 0.58,
    shadowRadius: 5,
    elevation: 24,
  },
  titleStyle: {
    fontSize: Dimensions.get('window').height<750 ? Fonts.size.h6 : Fonts.size.h4,
    fontWeight: 'bold', 
    color: Colors.text_color_1
  },
  descriptionStyle: {
    fontSize: Dimensions.get('window').height<750 ? Fonts.size.medium : Fonts.size.large, 
    color: Colors.text_color_1
  },
});