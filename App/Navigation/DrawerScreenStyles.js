import { StyleSheet } from "react-native";
import { ApplicationStyles, Colors, Metrics, Fonts } from "../Themes";

export default StyleSheet.create({
  rowBodyContainer:{
    backgroundColor: Colors.secondary,
    borderColor: Colors.borderLight, 
    borderBottomWidth: 1,
    padding: Metrics.basePadding, 
  },
  rowBodyText:{
    color: Colors.primary,
    paddingHorizontal: Metrics.basePadding,
  },
  rowLogoutContainer:{
    alignItems: 'center',
    // backgroundColor: Colors.redContainerBackground,
    backgroundColor: Colors.primary,
    // borderColor: Colors.borderLight, 
    // borderWidth: 1,
    // borderRadius: 10,
    // marginTop: Metrics.doubleBaseMargin,
    padding: Metrics.basePadding,
  }
});