/** REACT NATIVE **/
import React from 'react';
import {
  Alert,
  Dimensions,
  Keyboard, KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text, TouchableOpacity,
  View,
} from 'react-native';

/** PROJECT FILES **/
import { 
  Colors, Fonts, Images, Metrics, ApplicationStyles,
  ARMSTextInput, AppsButton,
  I18n,
  AppConfig,
} from '../Services/LibLinking';
import styles from '../Modules/General/Login/Styles/LoginStyles';
import LoginController from "../Modules/General/Login/Actions/login_controller.js";

/** NPM LIBRARIES **/
import NetInfo from "@react-native-community/netinfo";
import { StackActions, NavigationActions } from 'react-navigation';
import Animated, { Easing } from 'react-native-reanimated';
import { TapGestureHandler, State } from 'react-native-gesture-handler';
import Svg, { Image, Circle, ClipPath } from 'react-native-svg';
import Icon from 'react-native-vector-icons/FontAwesome';

const ads_banner_path = AppConfig.ads_banner_login_scn_path;
const ads_screen_id = AppConfig.ads_login_screen_id;
const {width, height} = Dimensions.get("screen");
const {Value, event, block, cond, eq, set, Clock, startClock, stopClock, debug, timing, clockRunning, interpolate, Extrapolate, concat} = Animated;

function runTiming(clock, value, dest) {
  const state = {
    finished: new Value(0),
    position: new Value(0),
    time: new Value(0),
    frameTime: new Value(0)
  };

  const config = {
    duration: 1000,
    toValue: new Value(0),
    easing: Easing.inOut(Easing.ease)
  };

  return block([
    cond(clockRunning(clock), 0, [
      set(state.finished, 0),
      set(state.time, 0),
      set(state.position, value),
      set(state.frameTime, 0),
      set(config.toValue, dest),
      startClock(clock)
    ]),
    timing(clock, state, config),
    cond(state.finished, debug('stop clock', stopClock(clock))),
    state.position
  ]);
}

export default class LoginView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      nric: "",
      password: "",
      company_logo_path: AppConfig.company_logo_default,

      // Fetch data from server indiacator
      fetch_data: false,
      disabled: false,

      // Navigation
      prev_screen: "",
    }

    this.buttonOpacity = new Value(1);
    this.onStateChange = event([
      {
        nativeEvent: ({ state }) =>
          block([
            cond(
              eq(state, State.END), [
                set(this.buttonOpacity, runTiming(new Clock(), 1, 0))
              ]
            )
          ])
      }
    ]);

    this.onStateClose = event([
      {
        nativeEvent: ({ state }) =>
          block([
            cond(
              eq(state, State.END), [
                set(this.buttonOpacity, runTiming(new Clock(), 0, 1)),
              ]
            )
          ])
      }
    ], {listener: ()=> Keyboard.dismiss()});

    this.buttonY = interpolate(this.buttonOpacity, {
      inputRange: [0, 1],
      outputRange: [100, 0],
      extrapolate: Extrapolate.CLAMP
    })

    this.bgY = interpolate(this.buttonOpacity, {
      inputRange: [0, 1],
      outputRange: [-height/2-165, 0],
      extrapolate: Extrapolate.CLAMP
    })

    this.textInputZIndex = interpolate(this.buttonOpacity, {
      inputRange: [0, 1],
      outputRange: [1, -1],
      extrapolate: Extrapolate.CLAMP
    })

    this.textInputOpacity = interpolate(this.buttonOpacity, {
      inputRange: [0, 1],
      outputRange: [1, 0],
      extrapolate: Extrapolate.CLAMP
    })

    this.textInputY = interpolate(this.buttonOpacity, {
      inputRange: [0, 1],
      outputRange: [0, 100],
      extrapolate: Extrapolate.CLAMP
    })

    this.rotateCross = interpolate(this.buttonOpacity, {
      inputRange: [0, 1],
      outputRange: [180, 360],
      extrapolate: Extrapolate.CLAMP
    })

    //Create Login Controller Object
    this.loginController = new LoginController({
      navigation: this.props.navigation
    });
  }

  /**Navigation Bottom Tab**/
  static navigationOptions = ({ navigation, navigationOptions }) => {
    const params = navigation.state.params || {};
    var prev_screen = params.prev_screen;

    return {
      title: ' Login ',
      headerRight: (
        <TouchableOpacity style={{paddingRight: 10}} onPress={() => navigation.navigate(prev_screen, {})}>
          <Icon name="times-circle" size={Metrics.icons.medium} color={Colors.secondary} />
        </TouchableOpacity> 
      ),
    };
  };
  /**End Navigation Bottom Tab**/

  componentWillMount() {
    /** Company Logo Show Check **/
    this.handleLoadCompanyLogo();

    /**
     * Get params prev screen
     */
    var prev_screen = this.props.navigation.getParam("prev_screen", "DashboardScreen");
    this.setState({ prev_screen });

    /** Test */
    this.keyboardDidShowSub = Keyboard.addListener('keyboardDidShow', this.keyboardDidShow);
    this.keyboardDidHideSub = Keyboard.addListener('keyboardDidHide', this.keyboardDidHide);
  }

  componentWillUnmount() {
    this.keyboardDidShowSub.remove();
    this.keyboardDidHideSub.remove();
  }

  keyboardDidShow = (event) => {
    console.log(`keyboard is showing ${JSON.stringify(event)}`)
  }

  keyboardDidHide = (event) => {
    console.log("keyboard is hide" + JSON.stringify(event))
  }

  testFunction(){
    var value = screenY-keyboardHeight;
    this.config = {
      duration: 300,
      toValue: status=='show' ? -230 : 0,
      easing: Easing.inOut(Easing.ease),
    };
    this.anim = timing(this.bgY, this.config);
    this.anim.start();

  }

  test123(){
    Keyboard.dismiss();
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

  // Function to handle login data
  handleLoginData(nric, password) { 
    this.handleFetchDataIndicator(true); 
    var result = this.loginController.fetchLoginData(nric, password)
    result.then((res)=>{
      if(res.result == 1){
        // var nric = res.data.nric;  
        this.props.navigation.navigate(this.state.prev_screen, {
          // nric: nric,
          loginUpdate: true
        });
      } else {
        this.handleFetchDataIndicator(false);
        var error_msg = res.data.msg;
        Alert.alert(
          'Login Failed', error_msg,
          [ {text: 'OK', style: 'cancel'}, ],
          { cancelable: false }
        ) 
      }
    })
  }

  handleFetchDataIndicator(status){
    this.setState({
      fetch_data: status,
      disabled: status,
    })
  }

  async handleLoadCompanyLogo(){
    const { api_url, company_logo_url, company_logo_local } = AppConfig;
    var network = await this.networkConnectValidation();
    if(network.result == 1){
      this.setState({
        company_logo_path: {uri: `${api_url}/${company_logo_url}`}
      })
    } else {
      this.setState({ 
        company_logo_path: {uri: company_logo_local}
      })                                                  
    }
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

  render() {
    
    return (
      // <SafeAreaView style={{ borderWidth: 1, borderColor: 'red' }}>
      <KeyboardAvoidingView behavior="padding" enableKeyboardAvoiding={Platform.OS === "ios" ? true : false}  style={{ flex:1, backgroundColor: 'white', justifyContent: 'flex-end' }}>
      {/* <View style={{ flex:1, backgroundColor: 'white', justifyContent: 'flex-end' }}> */}
        
        {/* Image Background */}
        <Animated.View style={{ ...StyleSheet.absoluteFill, transform: [{ translateY: this.bgY }] }}>
          <Svg height={height+50} width={width}>
            <ClipPath id="clip">
              <Circle r={height+50} cx={width/2} />
            </ClipPath>
            {/* <Image 
              source={{uri: 'https://media.idownloadblog.com/wp-content/uploads/2018/12/icy-water-mountain-moon-green-background-iphone-wallpaper-ongliong11.jpg'}}
              style={{ flex: 1, height: null, width: null }}
            /> */}
            <Image 
              href={{uri: 'https://media.idownloadblog.com/wp-content/uploads/2018/12/icy-water-mountain-moon-green-background-iphone-wallpaper-ongliong11.jpg'}}
              height={height+50}
              width={width}
              preserveAspectRatio={"xMidYMid slice"}
              clipPath="url(#clip)"
            />
          </Svg>
        </Animated.View>
        
        {/* Buttons */}
        <View style={{ height: height/2, justifyContent: 'center' }}>
          
          {/* Sign In Button */}
          <TapGestureHandler onHandlerStateChange={this.onStateChange}>
            <Animated.View style={{ opacity: this.buttonOpacity, transform: [{translateY: this.buttonY}], backgroundColor: 'white', height: 70, marginHorizontal: 20, borderRadius: 35, alignItems: 'center', justifyContent: 'center', marginVertical: 5}}>
              <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Sign In</Text>
            </Animated.View>
          </TapGestureHandler>

          {/* Sign In With Facebook Button */}
          <Animated.View style={{ opacity: this.buttonOpacity, transform: [{translateY: this.buttonY}], backgroundColor: '#2E71DC', height: 70, marginHorizontal: 20, borderRadius: 35, alignItems: 'center', justifyContent: 'center', marginVertical: 5}}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'white' }}>Sign In With Facebook</Text>
          </Animated.View>

          {/* TextInput View */}
          <Animated.View style={{ 
            zIndex: this.textInputZIndex,
            opacity: this.textInputOpacity,
            transform: [{ translateY: this.textInputY }],
            height: height/2,
            ...StyleSheet.absoluteFill,
            top: null,
            justifyContent: 'space-evenly',
            marginHorizontal: Metrics.baseMargin,
          }}>
            {/* Close TextInput View */}
            <TapGestureHandler onHandlerStateChange={this.onStateClose}>
              <Animated.View style={{
                backgroundColor: 'white',
                height: 40,
                width: 40,
                borderRadius: 20,
                alignItems: 'center',
                justifyContent: 'center',
                position: 'absolute',
                top: -50,
                left: width / 2 - 30,
                shadowOffset: { width: 2, height: 2},
                shadowColor: 'black',
                shadowOpacity: 0.2,
                elevation: 6,
              }}>
                <Animated.Text style={{fontSize: 15, transform: [{ rotate: concat(this.rotateCross, 'deg') }]}}>X</Animated.Text>
              </Animated.View>
            </TapGestureHandler>
            
            {/* Username TextInput */}
            <Animated.View style={[styles.attrRowContainer, {marginBottom: 0}]}>
              <ARMSTextInput
                inlineLeftImage={Images.face}
                leftImageColor={Colors.primary}
                placeholder={"Email / NRIC / Card No."} 
                keyboardType={"email-address"}
                autoCapitalize={"none"}
                clearButtonMode={"while-editing"}
                returnKeyType={"next"}
                autoCorrect={false}
                helperText={"E.g. 96........01 (without '-' )"}
                helperTextColor={Colors.primary}
                onChangeText={(value) => {this.setState({nric: value})}}
                onSubmitEditing={() => {this.passwordInput.focus()}}
                value={this.state.nric}
              />
            </Animated.View>

            {/* Password TextInput */}
            <Animated.View style={[styles.attrRowContainer, {marginBottom: 0}]}>
              <ARMSTextInput
                editable={true}
                inlineLeftImage={Images.lock} 
                leftImageColor={Colors.primary}
                placeholder={"Password"}
                autoCapitalize={"none"}
                clearButtonMode={"while-editing"}
                returnKeyType={"go"}
                inputRef={(input) => {this.passwordInput = input}}
                secureTextEntry={true}
                helperText={"E.g. 1299cbdjf8"}
                helperTextColor={Colors.primary}
                onChangeText={(value) => {this.setState({password: value})}}
                onSubmitEditing={() => {this.handleLoginData(this.state.nric, this.state.password)}}
                value={this.state.password}
              />
            </Animated.View>

            {/* Login Button */}
            <View style={[styles.attrRowContainer, {marginBottom: 0}]}>
              <AppsButton 
                onPress={() => {this.handleLoginData(this.state.nric, this.state.password,)}}
                backgroundColor={Colors.primary}
                text={"LOGIN"}
                fontSize={20}
                disabled={this.state.disabled}
              />
            </View>
          </Animated.View>
        </View>
        
      {/* </View> */}
      </KeyboardAvoidingView>
      // </SafeAreaView>
    );
  }
}
