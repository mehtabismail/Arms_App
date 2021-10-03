import { StyleSheet } from "react-native";
import { Colors, Metrics, Fonts } from "../../Themes";

export default StyleSheet.create({
  dividerContainer:{
    alignItems: 'center',
    flexDirection: 'row',
  },
  dividerHorizontal: {
    // borderBottomColor: Colors.text_color_1,
    borderBottomWidth: 1,
    flex: 1,
  },
  dividerVertical: {
    // borderRightColor: Colors.text_color_1,
    borderRightWidth: 1,
    flex: 1,
  },
  textContainer: {
    ...Fonts.style.normal,
    paddingHorizontal: Metrics.basePadding,
  }

});
