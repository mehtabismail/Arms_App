import { Text } from "react-native";
import AppConfig from "./AppConfig";

// Allow/disallow font-scaling in app
Text.defaultProps = Text.defaultProps || {};
Text.defaultProps.allowFontScaling = AppConfig.Allow_Text_Font_Scaling;

if (__DEV__) {
  // If ReactNative's yellow box warnings are too much, it is possible to turn
  // it off, but the healthier approach is to fix the warnings.  =)
  console.disableYellowBox = false;
}
