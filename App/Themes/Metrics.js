import { Dimensions, Platform } from "react-native";

const { width, height } = Dimensions.get("window");

// Used via Metrics.baseMargin
const metrics = {
  /** Margin Settings **/
  marginHorizontal: 10,
  marginVertical: 10,
  doubleBaseMargin: 30,
  baseMargin: 15,
  regularMargin: 10,
  smallMargin: 5,
  mainContainerMargin: 70,

  /** Padding Settings **/
  doubleBasePadding: 30,
  basePadding: 15,
  regularPadding: 10,
  smallPadding: 5,

  /** Section Settings **/
  section: 25,
  doubleSection: 50,

  /** Radius **/
  containerRadius: 10,
  textInputRadius: 5,

  /** Others **/
  horizontalLineHeight: 1,
  screenWidth: width < height ? width : height,
  screenHeight: width < height ? height : width,
  navBarHeight: Platform.OS === "ios" ? 64 : 54,
  headerContainerHeight: 120,
  flatListHeight: 70,
  datePickerHeight: 55,
  voucherHeight: 200,
  couponHeight: 280,

  /** Icon Settings **/
  icons: {
    tiny: 15,
    small: 20,
    medium: 30,
    notFocus: 25,
    regular: 40,
    focus: 50,
    large: 45,
    xl: 50,
    xxl: 60
  },

  /** Image Settings **/
  images: {
    small: 20,
    medium: 40,
    large: 60,
    xLarge: 80,
    xxLarge: 130,
    drawerBackground: 220,
    drawerUserImg: 60,
    profileImg: 120,
    promoImg: 200,
    prodImg: 150,
    voucherImg: 120,
    voucherValue: 200,
    armsLogoReg: 50,
    armsLogo: 150,
    logo: 200,
    product: 250,
  },

  /** Button Settings **/
  buttonRadius: 4,
  button: 50

  //TODO: Set height of banner, voucher, promotion picture, 
};

export default metrics;
