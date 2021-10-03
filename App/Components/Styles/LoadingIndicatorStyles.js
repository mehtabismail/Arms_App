import { StyleSheet } from "react-native";
import { Colors, Metrics, Fonts } from "../../Themes";

export default StyleSheet.create({
  backgroundContainer:{
    alignItems: 'center',
    backgroundColor: Colors.loadingIndicatorBackground,
    borderRadius: Metrics.containerRadius,
    justifyContent: 'center',
    padding: Metrics.basePadding,
  },
  textContainer:{
    ...Fonts.style.description,
    color: Colors.loadingIndicatorText,
    paddingTop: Metrics.smallPadding,
    textAlign: 'center'
  }
});
