/** REACT NATIVE **/
import React, { Component } from 'react';
import {
  Image,
  Platform,
  Text,
  View,
} from 'react-native';

import { tailwind, getColor } from '../../tailwind';

/** PROJECT FILES **/
import { Colors, Metrics, Fonts, Images } from '../Themes';
import { Label } from '../Services/LibLinking';

/** NPM LIBRARIES **/
import {
  createAppContainer,
  createDrawerNavigator,
  createStackNavigator,
  createBottomTabNavigator,
  createSwitchNavigator,
} from 'react-navigation';

/******************************************************************/
/************************* SCREENS IMPORT *************************/
/******************************************************************/

/** Import Drawer Screen **/
import DrawerScreen from './DrawerScreen';

/** Login **/
import LandingScreenPath from '../Modules/General/Login/Containers/LandingScreenContainer';
import LoginScreenPath from '../Modules/General/Login/Containers/LoginContainer';
import ForgetPasswordScreenPath from '../Modules/General/Login/Containers/ForgetPasswordContainer';
import RegisterScreenPath from '../Modules/General/Login/Containers/RegisterContainer';
import ExistCustomerScreenPath from '../Modules/General/Login/Containers/ExistCustomerContainer';

/** Dashboard **/
import DashboardScreenPath from '../Modules/General/Dashboard/Containers/DashboardContainer';
import MemberHistoryScreenPath from '../Modules/Member/Containers/MemberHistoryContainer';

/** Promotion **/
import PromotionScreenPath from '../Modules/Promotion/Containers/PromotionContainer';
import PromotionProductScreenPath from '../Modules/Promotion/Containers/PromotionProductContainer';
import ProductDetailScreenPath from '../Modules/Promotion/Containers/ProductDetailsContainer';

/** Voucher **/
import VoucherScreenPath from '../Modules/Voucher/Containers/VoucherContainer';
import VoucherTermConditionScreenPath from '../Modules/Voucher/Containers/VoucherTermConditionContainer';

/** Coupon **/
import CouponScreenPath from '../Modules/Coupon/Containers/CouponContainer';
import CouponTermConditionScreenPath from '../Modules/Coupon/Containers/CouponTermConditionContainer';

/** Profile **/
import ProfileScreenPath from '../Modules/Member/Containers/MemberProfileContainer';
import EmailPasswordScreenPath from '../Modules/Member/Containers/EmailPasswordChange';

/** EBrochure **/
import EBrochureScreenPath from '../Modules/EBrochure/Containers/EBrochureContainer';

/** Outlet Location **/
import OutletListScreenPath from '../Modules/OutletLocation/Containers/OutletListContainer';

/** Referral Program **/
import ReferralProgramScreenPath from '../Modules/ReferralProgram/Containers/ReferralProgramContainer';

/** Package **/
import PackageScreenPath from '../Modules/Package/Containers/PackageContainer';
import PackageItemScreenPath from '../Modules/Package/Containers/PackageItemContainer';
import PackageRedeemHistoryScreenPath from '../Modules/Package/Containers/PackageRedeemHistoryContainer';

/** E-Commerce **/
import EComLandingScreenPath from '../Modules/ECommerce/Containers/EComLandingContainer';
import EComProductListScreenPath from '../Modules/ECommerce/Containers/EComProductListContainer';
import EComProductItemScreenPath from '../Modules/ECommerce/Containers/EComProductItemContainer';
import EComCartScreenPath from '../Modules/ECommerce/Containers/EComCartContainer';
import EComCheckoutScreenPath from '../Modules/ECommerce/Containers/EComCheckoutContainer';
import EComSearchAndCategoryScreenPath from '../Modules/ECommerce/Containers/EComSearchAndCategoryContainer';
import EComPaymentScreenPath from '../Modules/ECommerce/Containers/EComPaymentContainer';
import EComPurchaseHistoryScreenPath from '../Modules/ECommerce/Containers/EComPurchaseHistoryContainer';

/** Scan And Pay **/
import SAPLandingScreenPath from '../Modules/ScanAndPay/Containers/SAPLandingContainer';
import SAPOrderListScreenPath from '../Modules/ScanAndPay/Containers/SAPOrderListContainer';
import SAPReceiptScreenPath from '../Modules/ScanAndPay/Containers/SAPReceiptContainer';
import SAPWebScreenPath from '../Modules/ScanAndPay/Containers/SAPWeb';

let app;
app = {} || app;

const FadeTransition = (index, position) => {
  const sceneRange = [index - 1, index];
  const outputOpacity = [0, 1];
  const transition = position.interpolate({
    inputRange: sceneRange,
    outputRange: outputOpacity,
  });

  return {
    opacity: transition
  }
}

const BottomTransition = (index, position, height) => {
  const sceneRange = [index - 1, index, index + 1];
  const outputHeight = [height, 0, 0];
  const transition = position.interpolate({
    inputRange: sceneRange,
    outputRange: outputHeight,
  });

  return {
    transform: [{ translateY: transition }]
  }
}

const NavigationConfig = () => {
  return {
    screenInterpolator: (sceneProps) => {
      const position = sceneProps.position;
      const scene = sceneProps.scene;
      const index = scene.index;
      const height = sceneProps.layout.initHeight;

      // return FadeTransition(index, position);
      return BottomTransition(index, position, height);
    }
  }
}

/**
 * Login Stack
 * Include:
 * - Login Screen
 * - Forget Password Screen 
 */
const LoginStack = createStackNavigator({
  LandingScreen: LandingScreenPath,
  LoginScreen: LoginScreenPath,
  ForgetPasswordScreen: ForgetPasswordScreenPath,
  RegisterScreen: RegisterScreenPath,
  ExistCustomerScreen: ExistCustomerScreenPath,
}, {
  transitionConfig: NavigationConfig,
  initialRouteName: 'LandingScreen',
  defaultNavigationOptions: {
    // header: null,
    headerTransparent: true,
    headerTitleStyle: tailwind("flex-1 text-black font-bold text-2xl text-center mt-1"),
    headerTintColor: Colors.secondary,
    headerTintStyle: {
      ...Fonts.style.fontBold,
    },
  },
},
);

/**
 * Dashboard Stack
 * Include:
 * - Dashboard Screen
 * - Member Points History Screen 
 */
const DashboardStack = createStackNavigator({
  DashboardScreen: DashboardScreenPath,
},
  {
    initialRouteName: '',
    defaultNavigationOptions: {
      // headerStyle: {
      //   backgroundColor: getColor("transparent")
      // },
      headerTransparent: true,
      headerTitleStyle: tailwind("flex-1 text-black font-bold text-2xl text-center mt-1"),
      headerTintColor: Colors.secondary,
      headerTintStyle: {
        ...Fonts.style.fontBold,
      },
    },
  });

const DashboardChild = createStackNavigator({
  MemberHistoryScreen: MemberHistoryScreenPath,
},
  {
    initialRouteName: '',
    defaultNavigationOptions: {
      headerStyle: {
        backgroundColor: Colors.primary,
      },
      headerTitleStyle: {
        ...Fonts.size.normal,
        flex: 1,
        textAlign: 'center',
      },
      headerTintColor: Colors.secondary,
      headerTintStyle: {
        ...Fonts.style.fontBold,
      },
    },
  });

/**
 * Promotion Stack
 * Include:
 * - Promotion Screen
 * - Promotion Product Screen
 */
const PromotionStack = createStackNavigator({
  PromotionScreen: PromotionScreenPath,
},
  {
    initialRouteName: '',
    defaultNavigationOptions: {
      headerStyle: {
        backgroundColor: Colors.primary,
      },
      headerTitleStyle: {
        ...Fonts.size.normal,
        flex: 1,
        textAlign: 'center',
      },
      headerTintColor: Colors.secondary,
      headerTintStyle: {
        ...Fonts.style.fontBold,
      },
    },
  });

const PromotionChild = createStackNavigator({
  PromotionProductScreen: PromotionProductScreenPath,
  ProductDetailScreen: ProductDetailScreenPath,
},
  {
    initialRouteName: '',
    defaultNavigationOptions: {
      headerStyle: {
        backgroundColor: Colors.primary,
      },
      headerTitleStyle: {
        ...Fonts.size.normal,
        flex: 1,
        textAlign: 'center',
      },
      headerTintColor: Colors.secondary,
      headerTintStyle: {
        ...Fonts.style.fontBold,
      },
    },
  });

/**
 * App Coupon Stack
 * Include:
 * -Coupon Screen
 * -Voucher Screen
 */
const AppCouponStack = createStackNavigator({
  CouponScreen: { screen: CouponScreenPath },
  VoucherScreen: { screen: VoucherScreenPath },
},
  {
    initialRouteName: '',
    defaultNavigationOptions: {
      headerStyle: {
        backgroundColor: Colors.primary,
      },
      headerTitleStyle: {
        ...Fonts.size.normal,
        flex: 1,
        textAlign: 'center',
      },
      headerTintColor: Colors.secondary,
      headerTintStyle: {
        ...Fonts.style.fontBold,
      },
    }
  });

const VoucherChild = createStackNavigator({
  VoucherTermConditionScreen: VoucherTermConditionScreenPath,
},
  {
    initialRouteName: '',
    defaultNavigationOptions: {
      headerStyle: {
        backgroundColor: Colors.primary,
      },
      headerTitleStyle: {
        ...Fonts.size.normal,
        flex: 1,
        textAlign: 'center',
      },
      headerTintColor: Colors.secondary,
      headerTintStyle: {
        ...Fonts.style.fontBold,
      },
    },
  });

const CouponChild = createStackNavigator({
  CouponTermConditionScreen: CouponTermConditionScreenPath,
},
  {
    initialRouteName: '',
    defaultNavigationOptions: {
      headerStyle: {
        backgroundColor: Colors.primary,
      },
      headerTitleStyle: {
        ...Fonts.size.normal,
        flex: 1,
        textAlign: 'center',
      },
      headerTintColor: Colors.secondary,
      headerTintStyle: {
        ...Fonts.style.fontBold,
      },
    },
  });

/**
 * Member Profile Stack
 * Include:
 * - Profile Screen
 */
const ProfileStack = createStackNavigator({
  ProfileScreen: ProfileScreenPath,
  EmailPasswordScreen: EmailPasswordScreenPath,
},
  {
    initialRouteName: '',
    defaultNavigationOptions: {
      headerTransparent: true,
      headerTitleStyle: tailwind("flex-1 text-black font-bold text-2xl text-center"),
      headerTintColor: Colors.secondary,
      headerTintStyle: {
        ...Fonts.style.fontBold,
      },
    },
  });

/**
 * EBrochure Stack
 * Include: 
 * - EBrochure Screen
 */
const EBrochureStack = createStackNavigator({
  EBrochureScreen: EBrochureScreenPath,
},
  {
    initialRouteName: '',
    defaultNavigationOptions: {
      headerTransparent: true,
      headerTitleStyle: tailwind("flex-1 text-black font-bold text-2xl text-center"),
      headerTintColor: Colors.secondary,
      headerTintStyle: {
        ...Fonts.style.fontBold,
      },
    },
  });

/**
 * Outlet Location Stack
 * Include: 
 * - Outlet List Screen
 */
const OutletLocationStack = createStackNavigator({
  OutletListScreen: OutletListScreenPath,
},
  {
    initialRouteName: '',
    defaultNavigationOptions: {
      headerStyle: {
        backgroundColor: Colors.primary,
      },
      headerTitleStyle: {
        ...Fonts.size.normal,
        flex: 1,
        textAlign: 'center',
      },
      headerTintColor: Colors.secondary,
      headerTintStyle: {
        ...Fonts.style.fontBold,
      },
    },
  });

/**
 * Referral Program Stack
 * Include: 
 * - Referral Program Screen
 */
const ReferralProgramStack = createStackNavigator({
  ReferralProgramScreen: ReferralProgramScreenPath,
},
  {
    initialRouteName: '',
    defaultNavigationOptions: {
      // headerStyle: {
      //   backgroundColor: Colors.primary,
      // },
      headerTransparent: true,
      headerTitleStyle: tailwind("flex-1 text-black font-bold text-2xl text-center"),
      headerTintColor: Colors.secondary,
      headerTintStyle: {
        ...Fonts.style.fontBold,
      },
    },
  });

/**
 * Package Stack
 * Include:
 * - Package Screen
 */
const PackageStack = createStackNavigator({
  PackageScreen: PackageScreenPath,
},
  {
    initialRouteName: '',
    defaultNavigationOptions: {
      headerStyle: {
        backgroundColor: Colors.primary,
      },
      headerTitleStyle: {
        ...Fonts.size.normal,
        flex: 1,
        textAlign: 'center',
      },
      headerTintColor: Colors.secondary,
      headerTintStyle: {
        ...Fonts.style.fontBold,
      },
    },
  });

const PackageChild = createStackNavigator({
  PackageItemScreen: PackageItemScreenPath,
  PackageRedeemHistoryScreen: PackageRedeemHistoryScreenPath,
},
  {
    initialRouteName: '',
    defaultNavigationOptions: {
      headerStyle: {
        backgroundColor: Colors.primary,
      },
      headerTitleStyle: {
        ...Fonts.size.normal,
        flex: 1,
        textAlign: 'center',
      },
      headerTintColor: Colors.secondary,
      headerTintStyle: {
        ...Fonts.style.fontBold,
      },
    },
  });

const AllPackageRedeemHistoryStack = createStackNavigator({
  AllPackageRedeemHistoryScreen: PackageRedeemHistoryScreenPath,
},
  {
    initialRouteName: '',
    defaultNavigationOptions: {
      headerStyle: {
        backgroundColor: Colors.primary,
      },
      headerTitleStyle: {
        ...Fonts.size.normal,
        flex: 1,
        textAlign: 'center',
      },
      headerTintColor: Colors.secondary,
      headerTintStyle: {
        ...Fonts.style.fontBold,
      },
    },
  });

/**
 * E-Commerce Stack
 * Include: 
 * - E-Commerce Landing Screen
 */
const ECommerceStack = createStackNavigator({
  EComLandingScreen: EComLandingScreenPath,
  EComProductListScreen: EComProductListScreenPath,
  EComProductItemScreen: {
    screen: EComProductItemScreenPath,
    navigationOptions: {
      headerTransparent: true,
      headerStyle: {
        // position: 'absolute',
        // backgroundColor: 'transparent',
        // zIndex: 100,
        // top: 0,
        // left: 0,
        // right: 0,
        // elevation: 0,
        // shadowOpacity: 0,
        // borderBottomWidth: 0,
      }
    }
  },
  EComCartScreen: EComCartScreenPath,
  EComCheckoutScreen: EComCheckoutScreenPath,
  EComSearchAndCategoryScreen: EComSearchAndCategoryScreenPath,
  EComPaymentScreen: EComPaymentScreenPath,
  EComPurchaseHistoryScreen: EComPurchaseHistoryScreenPath,
},
  {
    initialRouteName: '',
    defaultNavigationOptions: {
      headerBackTitle: null,
      headerStyle: {
        backgroundColor: Colors.button_background,
      },
      headerTitleStyle: {
        ...Fonts.size.normal,
        flex: 1,
        textAlign: 'center',
      },
      headerTintColor: Colors.secondary,
      headerTintStyle: {
        ...Fonts.style.fontBold,
      },
    },
  });

/**
 * Scan And Pay Stack
 * Include: 
 * - SAP Landing Screen
 * - SAP Order List Screen
 * - SAP Receipt Screen
 */
const SAPStack = createStackNavigator({
  SAPLandingScreen: SAPLandingScreenPath,
  SAPOrderListScreen: SAPOrderListScreenPath,
  SAPReceiptScreen: SAPReceiptScreenPath
},
  {
    initialRouteName: '',
    defaultNavigationOptions: {
      headerBackTitle: null,
      headerStyle: {
        backgroundColor: Colors.primary,
      },
      headerTitleStyle: {
        ...Fonts.size.normal,
        flex: 1,
        textAlign: 'center',
      },
      headerTintColor: Colors.secondary,
      headerTintStyle: {
        ...Fonts.style.fontBold,
      },
    },
  });

/**
 * Scan And Pay Web Stack
 */
const SAPWebStack = createStackNavigator({
  SAPWebScreen: SAPWebScreenPath
},
  {
    initialRouteName: 'SAPWebScreen',
    defaultNavigationOptions: {
      headerBackTitle: null,
      headerStyle: {
        backgroundColor: Colors.primary,
      },
      headerTitleStyle: {
        ...Fonts.size.normal,
        flex: 1,
        textAlign: 'center',
      },
      headerTintColor: Colors.secondary,
      headerTintStyle: {
        ...Fonts.style.fontBold,
      },
    },
  });


const myTabBarIcon = (focused, tintColor, source) => {
  return (
    <View
      style={{
        height: "100%", width: "100%",
        alignItems: "center",
        // justifyContent: "flex-end",
        justifyContent: focused ? "center" : "flex-end",
        alignSelf: "center"
      }}
    >
      <Image
        style={[{
          height: focused ? Metrics.icons.focus : Metrics.icons.notFocus,
          width: focused ? Metrics.icons.focus : Metrics.icons.notFocus,
          tintColor,
        }]}
        source={source}
      />
    </View>

  )
}

const myTabBarLabel = (focused, tintColor, text) => {
  if (!focused) {
    return (
      <Label
        text={`${text}`}
        // style={{
        //   fontSize: Fonts.size.small - 2,
        //   color: tintColor,
        //   textAlign: 'center'
        // }}
        // style={tailwind("text-xs text-primaryBlue text-center -mt-3")}
        style={{ height: "40%", color: Colors.text_primary, textAlign: "center", fontSize: 10 }}
        numberOfLines={1}
      />

    )
  }
}

/**
 * Bottom Tab Navigator
 * Include:
 * - Promotion Stack
 * - Voucher Stack
 * - Member Profile Stack
 * - EBrochure Stack
 */
const DashboardBottomTabStack = createBottomTabNavigator({
  Promotion: {
    screen: PromotionStack,
    navigationOptions: {
      tabBarIcon: ({ focused, tintColor }) => (
        // <Image style={{height: Metrics.icons.small, width: Metrics.icons.small, tintColor}} source={Images.promo}/>
        myTabBarIcon(focused, tintColor, Images.promo)
      ),
      tabBarOnPress: ({ navigation, defaultHandle }) => {
        navigation.navigate("PromotionScreen", {
          loginUpdate: true
        });
      },
      tabBarLabel: ({ focused, tintColor }) => (
        myTabBarLabel(focused, tintColor, 'test')
      )
    },
  },
  Coupon: {
    screen: AppCouponStack,
    navigationOptions: {
      tabBarIcon: ({ focused, tintColor }) => (
        // <Image style={{height: Metrics.icons.small, width: Metrics.icons.small, tintColor}} source={Images.voucherIcon}/>
        myTabBarIcon(focused, tintColor, Images.voucherIcon)
      ),
      tabBarOnPress: ({ navigation, defaultHandle }) => {
        navigation.navigate("CouponScreen", {
          loginUpdate: true
        });
      },
      tabBarLabel: ({ focused, tintColor }) => (
        myTabBarLabel(focused, tintColor, 'Coupon')
      ),
    },
  },
  Home: {
    screen: DashboardStack,
    navigationOptions: ({ navigation }) => ({
      tabBarIcon: ({ focused, tintColor }) => (
        // <Image 
        //   style={{
        //     height: focused ? Metrics.icons.large : Metrics.icons.small, 
        //     width: focused ? Metrics.icons.large : Metrics.icons.small, 
        //     tintColor
        //   }} 
        //   source={Images.home}
        // />
        myTabBarIcon(focused, tintColor, Images.home)
      ),
      tabBarOnPress: ({ navigation, defaultHandle }) => {
        navigation.navigate("DashboardScreen", {
          loginUpdate: true
        });
      },
      tabBarLabel: ({ focused, tintColor }) => (
        myTabBarLabel(focused, tintColor, 'Home')
        // if(!focused){
        //   return(
        //     <Label 
        //       text={`Home`}
        //       style={{
        //         fontSize: Fonts.size.small,
        //         color: tintColor
        //       }}
        //     />
        //   )
        // }
        // const { routeName } = navigation.state;
        // if (routeName === "Home") {
        //   return <Text /> ;
        // } else {
        //   return (
        //     <Text style={{alignSelf: "center", color: tintColor}}>
        //       {routeName}
        //     </Text>
        //   );
        // }
      )
    }),
  },
  Package: {
    screen: PackageStack,
    navigationOptions: {
      tabBarIcon: ({ focused, tintColor }) => (
        // <Image 
        //   style={{
        //     height: focused ? Metrics.icons.large : Metrics.icons.small, 
        //     width: focused ? Metrics.icons.large : Metrics.icons.small, 
        //     tintColor
        //   }} 
        //   source={Images.couponIcon}
        // />
        myTabBarIcon(focused, tintColor, Images.couponIcon)

      ),
      tabBarOnPress: ({ navigation, defaultHandle }) => {
        navigation.navigate("PackageScreen", {
          loginUpdate: true
        });
      },
      tabBarLabel: ({ focused, tintColor }) => (
        myTabBarLabel(focused, tintColor, 'Package')
      )
    },
  },
  NoticeBoard: {
    screen: EBrochureStack,
    navigationOptions: {
      tabBarIcon: ({ focused, tintColor }) => (
        // <Image style={{height: Metrics.icons.small, width: Metrics.icons.small, tintColor}} source={Images.eBrochure}/>
        myTabBarIcon(focused, tintColor, Images.eBrochure)
      ),
      tabBarOnPress: ({ navigation, defaultHandle }) => {
        navigation.navigate("EBrochureScreen", {
          loginUpdate: true
        });
      },
      tabBarLabel: ({ focused, tintColor }) => (
        myTabBarLabel(focused, tintColor, 'Notice')
      )
    },
  },
}, {
  initialRouteName: 'Home',
  navigationOptions: {
    header: null,
  },
  tabBarOptions: {
    activeTintColor: getColor("primary"),
    inactiveTintColor: getColor("secondary"),
    // inactiveTintColor: Colors.tab_icon_text_inactive,
    // activeBackgroundColor: Colors.body,
    style: {
      opacity: 1,
      paddingHorizontal: 10,
      position: "absolute",
      bottom: 15,
      left: 20,
      right: 20,
      // marginHorizontal:20,
      justifyContent: "center",
      borderRadius: 15,
      height: 80,
      backgroundColor: "white",
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.30,
      shadowRadius: 4.65,
      elevation: 8,
    },

    labelStyle: ({ focused, tintColor }) => ({
      // fontSize: Fonts.size.regular,
      // color: tintColor,
    }),
    tabStyle: {
      // height: Metrics.icons.xl - 5,
      // width: Metrics.icons.xl,
      marginVertical: 1,
      marginHorizontal: 1,
    }

  }
});

/**
 * Drawer Stack
 * Include: 
 * - Dashboard Stack
 * - Member Profile Stack
 */
const DrawerStack = createDrawerNavigator({
  Home: { screen: DashboardBottomTabStack },
  Profile: { screen: ProfileStack },
  OutletLocation: { screen: OutletLocationStack },
  ReferralProgram: { screen: ReferralProgramStack },
  ECommerce: { screen: ECommerceStack },
  SAP: { screen: SAPStack },
  SAPWeb: { screen: SAPWebStack }
}, {
  initialRouteName: 'Home',
  contentComponent: DrawerScreen,
  drawerWidth: 300,
})

/**
 * Main Stack
 * Include: 
 * - Drawer Stack
 */
const MainStack = createStackNavigator({
  DrawerStack: {
    screen: DrawerStack,
    navigationOptions: {
      header: null,
    }
  },
  /**
   * Take out child screen from parent stack to hide the bottom tab.
   */
  DashboardChild: {
    screen: DashboardChild,
    navigationOptions: {
      header: null,
    }
  },
  PromotionChild: {
    screen: PromotionChild,
    navigationOptions: {
      header: null,
    }
  },
  VoucherChild: {
    screen: VoucherChild,
    navigationOptions: {
      header: null,
    }
  },
  CouponChild: {
    screen: CouponChild,
    navigationOptions: {
      header: null,
    }
  },
  PackageChild: {
    screen: PackageChild,
    navigationOptions: {
      header: null,
    }
  },
  AllPackageRedeemHistoryStack: {
    screen: AllPackageRedeemHistoryStack,
    navigationOptions: {
      header: null,
    }
  },
  /**
   * LoginStack placed inside MainStack is because of prevent TextInput not able to use copy and paste function.
   */
  Login: {
    screen: LoginStack,
    navigationOptions: {
      header: null,
    }
  },
}, {
  initialRouteName: 'DrawerStack',
})

/**
 * Root Stack
 * Include: 
 * - Main Stack
 */
const RootStack = createStackNavigator({
  Main: MainStack,
},
  {
    mode: 'modal',
    headerMode: 'none',
  })

const AppContainer = createAppContainer(RootStack);

class App extends Component {
  render() {
    return (
      <AppContainer />
    );
  }
}
export default App;



/*********************************************/
/************** Hide Bottom Tab **************/
/*********************************************/

// DashboardStack.navigationOptions = ({ navigation }) => {
//   const { routeName } = navigation.state.routes[navigation.state.index];
//   app.visible = true;
//   if(routeName === 'MemberHistoryScreen'){
//     app.visible = true;
//   } else {
//     app.visible = false;
//   }
// };

// PromotionStack.navigationOptions = ({ navigation }) => {
//   const { routeName } = navigation.state.routes[navigation.state.index];
//   app.visible = true;
//   if(routeName === 'PromotionProductScreen'){
//     app.visible = true;
//   } else if (routeName === 'ProductDetailScreen'){
//     app.visible = true;
//   } else {
//     app.visible = false;
//   }
// };

// VoucherStack.navigationOptions = ({ navigation }) => {
//   const { routeName } = navigation.state.routes[navigation.state.index];
//   app.visible = true;
//   if(routeName === 'VoucherTermConditionScreen'){
//     app.visible = true;
//   } else {
//     app.visible = false;
//   }
// };

// CouponStack.navigationOptions = ({ navigation }) => {
//   const { routeName } = navigation.state.routes[navigation.state.index];
//   app.visible = true;
//   if(routeName === 'CouponTermConditionScreen'){
//     app.visible = true;
//   } else {
//     app.visible = false;
//   }
// };

  // defaultNavigationOptions : ({navigation}) =>{ 
  //   let visible;
  //   if(app.visible) {visible = false;} 
  //   else {visible = true;}
  //   return {tabBarVisible : visible}
  // },

/**
 * Voucher Stack
 * Include:
 * - Voucher Screen
 */
// const VoucherStack = createStackNavigator({
//   VoucherScreen: VoucherScreenPath,
// },
// {
//   initialRouteName: '',
//   defaultNavigationOptions: {
//     headerStyle: {
//       backgroundColor: Colors.primary,
//     },
//     headerTitleStyle: {
//       ...Fonts.size.normal,
//       flex: 1,
//       textAlign: 'center',
//     },
//     headerTintColor: Colors.secondary, 
//     headerTintStyle: {
//       ...Fonts.style.fontBold,
//     },
//   },
// });

/**
 * Coupon Stack
 * Include:
 * - Coupon Screen
 */
// const CouponStack = createStackNavigator({
//   CouponScreen: CouponScreenPath,
// },
// {
//   initialRouteName: '',
//   defaultNavigationOptions: {
//     headerStyle: {
//       backgroundColor: Colors.primary,
//     },
//     headerTitleStyle: {
//       ...Fonts.size.normal,
//       flex: 1,
//       textAlign: 'center',
//     },
//     headerTintColor: Colors.secondary, 
//     headerTintStyle: {
//       ...Fonts.style.fontBold,
//     },
//   },
// });
