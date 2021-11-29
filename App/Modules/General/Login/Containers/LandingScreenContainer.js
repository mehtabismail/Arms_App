/** REACT NATIVE **/
import React from 'react';
import {Alert, Dimensions, Image, TouchableOpacity, View} from 'react-native';

import {Button, Icon, Text, Input, Avatar} from 'react-native-elements';

/** PROJECT FILES **/
import {
  Colors,
  Fonts,
  Images,
  Metrics,
  ApplicationStyles,
  Label,
  I18n,
  AppConfig,
} from '../../../../Services/LibLinking';
import LoginController from '../Actions/login_controller.js';
import styles from '../Styles/LoginStyles';

/** NPM LIBRARIES **/
import NetInfo from '@react-native-community/netinfo';
import {SafeAreaView, StackActions, NavigationActions} from 'react-navigation';
import {tailwind, getColor} from '../../../../../tailwind';
import images from '../../../../Themes/Images';

var landing_action = [
  // Login
  {
    action: 'login',
    title: 'Login',
    desc: 'Welcome, please login to your account here.',
    navigateScreen: 'LoginScreen',
    tabColour: '#F3F8FF',
  },
  // Register
  {
    action: 'register',
    title: 'Register',
    desc: "Don't have account? Tap here.",
    navigateScreen: 'RegisterScreen',
    tabColour: '#F3FFF4',
  },
  // Existing Customer
  {
    action: 'existing_customer',
    title: 'Existing Customer',
    desc: "Are you our existing member, but you don't have login password?",
    navigateScreen: 'ExistCustomerScreen',
    tabColour: '#FFF3F4',
  },
  // Forget Password
  {
    action: 'forget_password',
    title: 'Forget Password',
    desc: 'Forget your login password?',
    navigateScreen: 'ForgetPasswordScreen',
    tabColour: '#FEFFF3',
  },
];

if (AppConfig.access_token == '2020smo.12') {
  landing_action.splice(1, 1);
}

//Tab Screen Height
const MAIN_TAB_HEIGHT = Dimensions.get('window').height * 0.6;

export default class LoginView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // Navigation
      prev_screen: '',
    };

    //Create Login Controller Object
    this.loginController = new LoginController({
      navigation: this.props.navigation,
    });
  }

  componentDidMount() {
    /**
     * Get params prev screen
     */
    var prev_screen = this.props.navigation.getParam(
      'prev_screen',
      'DashboardScreen',
    );
    this.setState({prev_screen});
  }

  componentWillUnmount() {}

  handleNavigationToScreen(routeName, params) {
    // if ( NavigationActions.focused == false ){
    const navigateAction = StackActions.replace({
      routeName: route,
      params: params,
      action: NavigationActions.navigate({
        routeName: routeName,
        params: params,
      }),
    });
    props.navigation.dispatch(navigateAction);
    // }
  }

  networkConnectValidation() {
    let result = new Promise((resolve, reject) => {
      NetInfo.isConnected.fetch().done((isConnected) => {
        if (isConnected) {
          resolve({result: 1, data: isConnected});
        } else {
          resolve({
            result: 0,
            data: {
              title: I18n.t('network_error_title'),
              msg: I18n.t('network_error_msg'),
            },
          });
        }
      });
    });
    return result;
  }

  /****************************************************************/
  /******************** SCREEN RENDERING **************************/
  /****************************************************************/

  handleRenderHeaderBackButton() {
    return (
      <TouchableOpacity
        onPress={() =>
          this.props.navigation.navigate(this.state.prev_screen, {})
        }
        >
        <Image
          source={Images.arrowLeft}
          onPress={() =>
          this.props.navigation.navigate(this.state.prev_screen, {})
        }
          resizeMode={'stretch'}
          style={{
            height: Metrics.icons.xl,
            width: Metrics.icons.xl,
            tintColor: "black",
            // justifyContent: 'flex-start',
          }}
        />
      </TouchableOpacity>
    );
  }

  handleRenderWelcomeText() {
    return (
      <View style={tailwind('text-center p-2')}>
        <Label style={tailwind('text-primary text-lg font-bold text-center')}>
          Welcome To
        </Label>
        {/* <Label style={{ color: Colors.text_color_3, fontWeight: '900', fontSize: 20 }}>To</Label> */}
        <Label
          style={tailwind(
            'text-primary text-2xl font-bold text-center',
          )}>{`${AppConfig.app_display_name}`}</Label>
      </View>
    );
  }

  // handleRenderTabButton(title, desc, navigateScreeen) {
  //   return (
  //     <TouchableOpacity
  //       onPress={() => { this.props.navigation.navigate(navigateScreeen, { prev_screen: this.state.prev_screen }) }}
  //       style={{
  //         height: '100%',
  //         marginHorizontal: Metrics.doubleBaseMargin
  //       }}
  //     >
  //       <Label
  //         text={`${title}`}
  //         style={styles.titleStyle}
  //       />
  //       <Label
  //         text={`${desc}`}
  //         style={styles.descriptionStyle}
  //       />
  //     </TouchableOpacity>
  //   )
  // }

  handleRenderTabButton_LogIn(title, navigateScreeen) {
    return (
      <View style={tailwind('self-center w-4/5')}>
        <View style={{elevation: 20}}>
          <Button
            buttonStyle={tailwind('rounded-lg bg-btn-primary')}
            title={`${title}`}
            titleStyle={tailwind('text-xl font-bold')}
            onPress={() => {
              this.props.navigation.navigate(navigateScreeen, {
                prev_screen: this.state.prev_screen,
              });
            }}
          />
        </View>
      </View>
    );
  }

  handleRenderTabButton_SignUp(title, navigateScreeen) {
    return (
      <View style={tailwind('self-center w-4/5')}>
        <View style={{elevation: 20}}>
          <Button
            buttonStyle={tailwind('rounded-lg bg-white border border-blue-600')}
            title={`${title}`}
            titleStyle={tailwind('text-xl text-primary font-bold')}
            onPress={() => {
              this.props.navigation.navigate(navigateScreeen, {
                prev_screen: this.state.prev_screen,
              });
            }}
          />
        </View>
      </View>
    );
  }

  // handleRenderTabButton_Existing(title, navigateScreeen) {
  //   return (
  //     <View style={tailwind("self-center w-11/12 my-3")}>
  //       <View style={{ elevation: 5 }}>
  //         <Button
  //           buttonStyle={tailwind("rounded-lg bg-white border-gray-200")}
  //           title={`${title}`}
  //           titleStyle={tailwind("text-xl text-primary font-bold")}
  //           onPress={() => { this.props.navigation.navigate(navigateScreeen, { prev_screen: this.state.prev_screen }) }}
  //         />
  //       </View>
  //     </View>
  //   )
  // }
  handleRenderTabButton_Existing(title, navigateScreeen) {
    return (
      <View style={tailwind('self-end mr-1')}>
        <Text
          numberOfLines={1}
          style={tailwind('text-sm text-primary font-semibold underline')}
          onPress={() => {
            this.props.navigation.navigate(navigateScreeen, {
              prev_screen: this.state.prev_screen,
            });
          }}>
          {`${title}`}
        </Text>
      </View>
    );
  }
  handleRenderTabButton_Forget(title, navigateScreeen) {
    return (
      <View style={tailwind('self-start ml-2')}>
        <Text
          numberOfLines={1}
          style={tailwind('text-sm text-primary font-semibold underline ')}
          onPress={() => {
            this.props.navigation.navigate(navigateScreeen, {
              prev_screen: this.state.prev_screen,
            });
          }}>
          {`${title}`}
        </Text>
      </View>
    );
  }

  // handleRenderTabButton_Forget(title, navigateScreeen) {
  //   return (
  //     <View style={tailwind("self-center w-11/12 mb-5")}>
  //       <View style={{ elevation: 5 }}>
  //         <Button
  //           buttonStyle={tailwind("rounded-lg bg-white border border-gray-200")}
  //           title={`${title}`}
  //           titleStyle={tailwind("text-xl text-primary font-bold")}
  //           onPress={() => { this.props.navigation.navigate(navigateScreeen, { prev_screen: this.state.prev_screen }) }}
  //         />
  //       </View>
  //     </View>
  //   )
  // }

  render() {
    return (
      /** Start Safe Area **/
      <SafeAreaView
        style={ApplicationStyles.screen.safeAreaContainer}
        forceInset={{vertical: 'never'}}>
        {/* Image Container */}
        <View style={tailwind('bg-gray-200 h-full w-full')}>
          <View style={tailwind('h-1/4')}>
            <Image
              source={Images.loginLandingBackground}
              resizeMode={'stretch'}
              style={{
                height: '100%',
                width: '100%',
              }}
            />
            <TouchableOpacity
              onPress={() =>
                this.props.navigation.navigate(this.state.prev_screen, {})
              }
              style={{
                // backgroundColor: Colors.opacityBlurBackground,
                // paddingTop: Metrics.basePadding + 15,
                padding: 10,
                // left:5,top:10,
                position: 'absolute',
              }}>
              {/* Back Button */}
              {this.handleRenderHeaderBackButton()}
            </TouchableOpacity>
            <View
              style={{
                position: 'absolute',
                top: 70,
                width: '100%',
                justifyContent: 'center',
                alignItems: 'center',
                padding: 5,
              }}>
              <Image
                source={images.armsLogo}
                style={{
                  width: Metrics.icons.small * 7,
                  height: Metrics.icons.small * 7,
                  resizeMode: 'contain',
                  shadowColor: '#000',
                  shadowOffset: {
                    width: 0,
                    height: 2,
                  },
                  shadowOpacity: 0.25,
                  shadowRadius: 3.84,
                  // elevation: 5,
                }}
              />
            </View>
          </View>
          <View style={tailwind('flex-1')}>
            <View style={tailwind('w-full h-20')}></View>
            <View style={tailwind('flex-1 justify-between')}>
              <View style={tailwind('justify-between')}>
                <View style={tailwind('justify-center items-center p-3')}>
                  {/* Welcome Text */}
                  {this.handleRenderWelcomeText()}
                </View>
              </View>

              <View style={tailwind('justify-end')}>
                <View style={tailwind('flex-row')}>
                  {/* Tab List */}
                  {/* Register Tab */}
                  <View style={tailwind('w-1/2 py-2')}>
                    {this.handleRenderTabButton_SignUp(
                      'Sign Up',
                      'RegisterScreen',
                    )}
                  </View>

                  {/* Login Tab */}
                  <View style={tailwind('w-1/2 py-2')}>
                    {this.handleRenderTabButton_LogIn('Sign In', 'LoginScreen')}
                  </View>
                </View>
                <View style={tailwind('items-center mb-16')}>
                  <View style={tailwind('flex-row ')}>
                    {/* Existing Customer */}
                    <View style={tailwind('w-1/2')}>
                      {this.handleRenderTabButton_Existing(
                        'Existing Customer',
                        'ExistCustomerScreen',
                      )}
                    </View>

                    {/* Forget Password Tab */}
                    <View style={tailwind('w-1/2')}>
                      {this.handleRenderTabButton_Forget(
                        'Forget Password',
                        'ForgetPasswordScreen',
                      )}
                    </View>
                  </View>
                </View>
              </View>
              {/* </View>
                    </View>
                  </View>
                </View>
              </View> */}

              {/* Tab List */}
              {/* <View style={[{ width: '100%', height: MAIN_TAB_HEIGHT }]}>
              {
                landing_action.map((item, index) => {
                  var tabHeight = MAIN_TAB_HEIGHT * (1 - (index * 0.25))
                  return (
                    <View key={`${index}`} style={[styles.tabStyle, { backgroundColor: item.tabColour, height: tabHeight, zIndex: index + 1 }]}>
                      {
                        this.handleRenderTabButton(item.title, item.desc, item.navigateScreen)
                      }
                    </View>
                  )
                })
              }
            </View> */}
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }
}
