import { StyleSheet } from "react-native";
import { Colors, Metrics, Fonts } from "../../Themes";

export default StyleSheet.create({
  container:{
    flex: 1,
  },
  textInputContainer: {
    backgroundColor: '#FFFFFF',
    borderColor: Colors.primary,
    borderWidth: 1,
    borderRadius: Metrics.textInputRadius,
    flexDirection: "row",
  },
  inputContainer: {
    fontFamily: Fonts.type.base,
    fontSize: 20,
    padding: Metrics.basePadding,
    flex: 9,
  },
  leftIconContainer: {
    alignItems: "center",
    justifyContent: "center",
    tintColor: Colors.text_color_1,
    paddingLeft: Metrics.smallPadding,
  },
  rightIconContainer: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  helperTextContainer: {
    alignItems: 'flex-end',
    margin: Metrics.smallMargin,
  },
  helperText: {
    ...Fonts.style.description,
  },

});
