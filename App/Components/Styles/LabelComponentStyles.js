import { StyleSheet } from "react-native";
import { Colors, Metrics, Fonts } from "../../Themes/";

export default StyleSheet.create({
  title: {
    ...Fonts.style.h1,
    color: Colors.text_color_1,
  },
  normal: {
    ...Fonts.style.normal,
    color: Colors.text_color_2,
  },
  normal_bold: {
    ...Fonts.style.normal,
    color: Colors.text_color_2,
    fontWeight: 'bold',
  },
  description: {
    ...Fonts.style.description,
    color: Colors.text_color_2,
  },
  description_bold: {
    ...Fonts.style.description,
    color: Colors.text_color_2,
    fontWeight: 'bold',
  },
});
