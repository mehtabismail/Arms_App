import { StyleSheet, Dimensions } from "react-native";
import { Colors } from "../../Themes";

export default StyleSheet.create({
  scrollPage: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
  // card: {
  //   // height: 600,
  //   justifyContent: "center",
  //   alignItems: "center",
  //   borderRadius: 25,
  //   backgroundColor: Colors.body,
  //   /** Shadow Effect Settings **/
  //   shadowColor: '#000',
  //   shadowOffset: {width: 0, height: 5},
  //   shadowOpacity: 0.58,
  //   shadowRadius: 5,
  //   elevation: 24,
  // },
});