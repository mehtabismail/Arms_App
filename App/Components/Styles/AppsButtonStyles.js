import { StyleSheet } from "react-native";
import { Colors, Metrics, Fonts } from "../../Themes";

export default StyleSheet.create({
  button: {
    alignItems: "center",
    backgroundColor: Colors.button_background,
    borderRadius: Metrics.button / 2,
    // height: Metrics.button,
    justifyContent: "center",
    
  },
  buttonText: {
    ...Fonts.style.fontBold,
    color: Colors.button_font,
    marginVertical: Metrics.baseMargin,
    textAlign: "center",
  },
  contentContain: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  iconContainer: {
    width: Metrics.icons.medium,
    height: Metrics.icons.medium,
    tintColor: Colors.button_font,
    marginHorizontal: Metrics.smallMargin,
  },
});
