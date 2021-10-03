import { StyleSheet, Dimensions } from "react-native";
import { Metrics, ApplicationStyles } from "../../Themes";

export default StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    // margin: Metrics.baseMargin,
    width: Dimensions.get('window').width*0.8,
    overflow:'hidden'
  },
  titleContainer: {
    flexDirection: 'row',
    height: 50,
  },
  title: {
    flex: 1,
    padding: Metrics.regularPadding,
    color: '#2a2f43',
    fontWeight: 'bold'
  },
  button: {
  },
  buttonImage: {
    width: Metrics.icons.large,
    height: Metrics.icons.large
  },
  body: {
    paddingHorizontal: Metrics.basePadding,
  }
});