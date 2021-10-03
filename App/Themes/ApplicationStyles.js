import Fonts from "./Fonts";
import Metrics from "./Metrics";
import Colors from "./Colors";
import {Dimensions} from 'react-native';
// import { getStatusBarHeight } from "react-native-iphone-x-helper";

// This file is for a reusable grouping of Theme items.
// Similar to an XML fragment layout in Android

const ApplicationStyles = {
  screen: {
    safeAreaContainer: {
      backgroundColor: Colors.background,
      flex: 1,
      // height: Dimensions.get('window').height,
      // borderWidth: 2,
      // borderColor: 'red',
    },
    backgroundImage: {
      position: "absolute",
      top: 0,
      left: 0,
      bottom: 0,
      right: 0
    },
    scrollContainer: {
      width: '100%',
      // borderWidth: 2,
      // borderColor: 'blue',
    },
    mainContainer: {
      alignItems: 'center',
      // height: '100%',
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'flex-start',
      paddingBottom: Metrics.basePadding,
      marginBottom: Metrics.mainContainerMargin,
      // borderWidth: 2,
      // borderColor: 'red',
    },
    headerContainer: {
      alignItems: 'center',
      backgroundColor: 'transparent',
      // height: Metrics.headerContainerHeight,
      width: '100%',
    },
    bodyContainer: {
      alignItems: 'center',
      backgroundColor: Colors.body,
      borderRadius: Metrics.containerRadius,
      flex: 1,
    },
    titleStatusContainer: {
      alignItems: 'center',
      // backgroundColor: Colors.body,
      // width: '100%',
      margin: Metrics.baseMargin,
      padding: Metrics.basePadding,
    },
    titleStatusText: {
      ...Fonts.style.h4, 
      color: Colors.primary, 
      fontWeight: 'bold'
    },
    testContainer: {
      alignItems: 'center',
      backgroundColor: Colors.body,
      width: '90%',
      margin: Metrics.baseMargin,
      borderWidth: 1,
      borderRadius: 2,
      borderColor: '#ddd',
      /** Shadow Effect Settings **/
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 5},
      shadowOpacity: 0.58,
      shadowRadius: 5,
      elevation: 24,
    },
    test: {
      borderColor: 'red', 
      borderWidth:1
    },

    //Default
    section: {
      margin: Metrics.section,
      padding: Metrics.baseMargin
    },
    sectionText: {
      ...Fonts.style.normal,
      paddingVertical: Metrics.doubleBaseMargin,
      color: Colors.snow,
      marginVertical: Metrics.smallMargin,
      textAlign: "center"
    },
    subtitle: {
      ...Fonts.style.h2,
      color: Colors.text,
      fontSize: 20
    },
    orangeSubtitleText: {
      ...Fonts.style.h2,
      color: Colors.orange,
      fontSize: 20
    },
    blueSubtitleText: {
      ...Fonts.style.h2,
      color: Colors.blue,
      fontSize: 20
    },
    orangeTitleText: {
      ...Fonts.style.h2,
      color: Colors.orange,
      fontSize: 30
    },
    titleText: {
      ...Fonts.style.h2,
      fontSize: 30,
      color: Colors.text
    },
    normalTitle: {
      ...Fonts.style.h2,
      fontSize: 26,
      color: Colors.text
    },
    homeTitle: {
      ...Fonts.style.h2,
      color: Colors.snow,
      fontSize: 20
    }
  },
  darkLabelContainer: {
    padding: Metrics.smallMargin,
    paddingBottom: Metrics.doubleBaseMargin,
    borderBottomColor: Colors.border,
    borderBottomWidth: 1,
    marginBottom: Metrics.baseMargin
  },
  darkLabel: {
    fontFamily: Fonts.type.bold,
    color: Colors.snow
  },
  groupContainer: {
    margin: Metrics.smallMargin,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center"
  },
  sectionTitle: {
    ...Fonts.style.h4,
    color: Colors.coal,
    backgroundColor: Colors.ricePaper,
    padding: Metrics.smallMargin,
    marginTop: Metrics.smallMargin,
    marginHorizontal: Metrics.baseMargin,
    borderWidth: 1,
    borderColor: Colors.ember,
    alignItems: "center",
    textAlign: "center"
  },
  container: {
    shadow: {
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 5},
      shadowOpacity: 0.58,
      shadowRadius: 5,
      elevation: 24
    }
  }
};

export default ApplicationStyles;
