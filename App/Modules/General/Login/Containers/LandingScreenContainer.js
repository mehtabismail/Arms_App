/** REACT NATIVE **/
import React from 'react';
import {
  Dimensions,
  Image,
  TouchableOpacity,
  View,
} from 'react-native';

/** PROJECT FILES **/
import { 
  Colors, Fonts, Images, Metrics, ApplicationStyles,
  Label,
  I18n,
  AppConfig,
} from '../../../../Services/LibLinking';
import LoginController from "../Actions/login_controller.js";
import styles from '../Styles/LoginStyles';

/** NPM LIBRARIES **/
import NetInfo from "@react-native-community/netinfo";
import { SafeAreaView, StackActions, NavigationActions } from 'react-navigation';

var landing_action = [
  // Login
  {
    action: "login", 
    title: "Login", 
    desc: "Welcome, please login to your account here.", 
    navigateScreen: "LoginScreen", 
    tabColour: '#F3F8FF' 
  },
  // Register
  {
    action: "register", 
    title: "Register", 
    desc: "Don't have account? Tap here.", 
    navigateScreen: "RegisterScreen", 
    tabColour: '#F3FFF4' 
  },
  // Existing Customer
  {
    action: "existing_customer", 
    title: "Existing Customer", 
    desc: "Are you our existing member, but you don't have login password?", 
    navigateScreen: "ExistCustomerScreen", 
    tabColour: '#FFF3F4' 
  },
  // Forget Password
  {
    action: "forget_password", 
    title: "Forget Password", 
    desc: "Forget your login password?", 
    navigateScreen: "ForgetPasswordScreen", 
    tabColour: '#FEFFF3' 
  }
];

if(AppConfig.access_token == "2020smo.12"){
  landing_action.splice(1, 1);
}

//Tab Screen Height
const MAIN_TAB_HEIGHT = Dimensions.get('window').height*0.6;


export default class LoginView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // Navigation
      prev_screen: "",
    }

    //Create Login Controller Object
    this.loginController = new LoginController({
      navigation: this.props.navigation
    });
  }

  componentDidMount() {
    /**
     * Get params prev screen
     */
    var prev_screen = this.props.navigation.getParam("prev_screen", "DashboardScreen");
    this.setState({ prev_screen });
  }

  componentWillUnmount() {
  }
  
  handleNavigationToScreen(routeName, params){
    // if ( NavigationActions.focused == false ){
      const navigateAction = StackActions.replace({
        routeName: route,
        params: params,
        action: NavigationActions.navigate({ routeName: routeName, params: params }),
      });
      props.navigation.dispatch(navigateAction);
    // }
  }

  networkConnectValidation(){
    let result = new Promise((resolve, reject) => {
      NetInfo.isConnected.fetch().done((isConnected) => { 
        if(isConnected) {
          resolve({result: 1, data: isConnected})
        } else {
          resolve({result: 0, data: {title: I18n.t("network_error_title"), msg: I18n.t("network_error_msg")}});
        }
      });
    })
    return result;
  }

  /****************************************************************/
  /******************** SCREEN RENDERING **************************/
  /****************************************************************/

  handleRenderHeaderBackButton(){
    return(
      <TouchableOpacity onPress={() => this.props.navigation.navigate(this.state.prev_screen, {})}>
        <Image
          source={Images.arrowLeft}
          resizeMode={'stretch'}
          style={{
            height: Metrics.icons.xl,
            width:  Metrics.icons.xl,
            tintColor: Colors.text_color_3,
            justifyContent: 'flex-start'
          }}
        />
      </TouchableOpacity>
    )
  }

  handleRenderWelcomeText(){
    return(
      <View style={[{
        padding: Dimensions.get('window').height<750 ? Metrics.smallPadding :Metrics.basePadding, 
        alignItems: 'flex-start',flex: 1, 
        marginTop: Dimensions.get('window').height<750 ? Metrics.smallMargin : Metrics.doubleBaseMargin}]}>
        <Label style={{color: Colors.text_color_3, fontWeight: '900', fontSize: 20}}>Welcome</Label>
        <Label style={{color: Colors.text_color_3, fontWeight: '900', fontSize: 20}}>To</Label>
        <Label style={{color: Colors.text_color_3, fontWeight: '900', fontSize: 25}}>{`${AppConfig.app_display_name}`}</Label>
      </View>
    )
  }

  handleRenderTabButton(title, desc, navigateScreeen){
    return(
      <TouchableOpacity 
        onPress={() => {this.props.navigation.navigate(navigateScreeen, {prev_screen: this.state.prev_screen})}}
        style={{
          height: '100%',
          marginHorizontal: Metrics.doubleBaseMargin
        }}
      >
        <Label
          text={`${title}`}
          style={styles.titleStyle}
        />
        <Label
          text={`${desc}`}
          style={styles.descriptionStyle}
        />
      </TouchableOpacity>
    )
  }

  render() {
    return (
      
      /** Start Safe Area **/
      <SafeAreaView style={ApplicationStyles.screen.safeAreaContainer} forceInset={{vertical:'never'}} >

        <View>

          {/* Image Container */}
          <View style={{height: '100%', width: '100%',}}>
          {/* <View> */}
            <Image
              source={Images.loginLandingBackground}
              resizeMode={'stretch'}
              style={{
                height: '100%',
                width: '100%'
              }}
            />
            <View style={{
              width: '100%',
              height: '100%',
              backgroundColor: Colors.opacityBlurBackground, 
              paddingTop: Metrics.basePadding + 15,
              position: 'absolute',
            }}>
              {/* Back Button */}
              {this.handleRenderHeaderBackButton()}
              
              {/* Welcome Text */}
              {this.handleRenderWelcomeText()}
              
              {/* Tab List */}
              {/* <View style={[{width: '100%', height: MAIN_TAB_HEIGHT}]}> */}
                {/* Login Tab */}
                {/* <View style={[styles.tabStyle, {backgroundColor: '#F3F8FF', height: '100%'}]}>
                  {this.handleRenderTabButton('Login', descLogin, "LoginScreen")} */}

                  {/* Register Tab */}
                  {/* <View style={[styles.tabStyle, {backgroundColor: '#F3FFF4', height: '75%'}]}>
                    {this.handleRenderTabButton('Register', descRegister, "RegisterScreen")} */}

                    {/* Existing Customer */}
                    {/* <View style={[styles.tabStyle, {backgroundColor: '#FFF3F4', height: '50%'}]}>
                      {this.handleRenderTabButton('Existing Customer', descExistingCus, "ExistCustomerScreen")} */}


                      {/* Forget Password Tab */}
                      {/* <View style={[styles.tabStyle, {backgroundColor: '#FEFFF3', height: "25%"}]}>
                        {this.handleRenderTabButton('Forget Password', descForgetPass, "ForgetPasswordScreen")} */}

                      {/* </View>
                    </View>
                  </View>
                </View>
              </View> */}

              {/* Tab List */}
              <View style={[{width: '100%', height: MAIN_TAB_HEIGHT}]}>
                {
                  landing_action.map((item, index)=>{
                    var tabHeight = MAIN_TAB_HEIGHT * (1 - (index * 0.25))
                    return(
                      <View key={`${index}`} style={[styles.tabStyle, {backgroundColor: item.tabColour, height: tabHeight, zIndex: index + 1}]}>
                        {
                          this.handleRenderTabButton(item.title, item.desc, item.navigateScreen)
                        }
                      </View>
                    )
                  })
                }
              </View>

            </View>
          </View>

        </View>

      </SafeAreaView>

    );
  }
}
