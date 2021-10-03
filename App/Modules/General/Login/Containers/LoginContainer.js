/** REACT NATIVE **/
import React from 'react';
import {
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  Text, TouchableOpacity,
  View,
} from 'react-native';

/** PROJECT FILES **/
import { 
  Colors, Fonts, Images, Metrics, ApplicationStyles,
  ARMSTextInput, AppsButton, LoadingIndicator, Label, AdsBanner,
  I18n,
  AppConfig,
} from '../../../../Services/LibLinking';
import LoginController from "../Actions/login_controller.js";
import styles from '../Styles/LoginStyles';

/** NPM LIBRARIES **/
import NetInfo from "@react-native-community/netinfo";
import { SafeAreaView, StackActions, NavigationActions } from 'react-navigation';

const ads_banner_path = AppConfig.ads_banner_login_scn_path;
const ads_screen_id = AppConfig.ads_login_screen_id;

export default class LoginView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      nric: "",
      password: "",
      email_verify: true,
      password_verify: true,
      login_trial: 0,
      company_logo_path: AppConfig.company_logo_default,

      // Fetch data from server indiacator
      fetch_data: false,
      disabled: false,

      // Navigation
      prev_screen: "",
    }

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
      headerLeft: (
        <View style={{width: Metrics.icons.medium, height: Metrics.icons.medium, paddingRight: 10}}></View>
      ),
      headerRight: (
        <TouchableOpacity style={{paddingRight: 10}} onPress={() => navigation.navigate(prev_screen, {})}>
          <Image
            style={{width: Metrics.icons.medium, height: Metrics.icons.medium, tintColor: Colors.secondary}} 
            source={Images.round_cancel}/>
        </TouchableOpacity> 
      ),
    };
  };
  /**End Navigation Bottom Tab**/

  componentDidMount() {
    /** Company Logo Show Check **/
    this.handleLoadCompanyLogo();

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

  // Function to handle login data
  handleLoginData(nric, password) {
    var count = this.state.login_trial + 1;
    var error_msg_member_login_failed = count < 4 ? 'Your password and/or email are incorrect, please try again.' : 'Your username or password does not match with our record. Try again or select "Forget Password".';
    this.setState({
      login_trial: count
    })
    // if(count < 4) {
      
    if(nric == '' || password == '') {
      if(nric == '') {
        this.setState({
          email_verify: false,
        })
      }
      
      if (password == '') {
        this.setState({
          password_verify: false,
        })
      }
    } else {
      this.handleFetchDataIndicator(true);
      var result = this.loginController.fetchLoginData(nric, password);
      result.then((res)=>{
        if(res.result == 1){
          this.props.navigation.navigate(this.state.prev_screen, {loginUpdate: true});
        } else {
          if(res.error_code && res.error_code == "member_login_failed"){
            res.error_msg = error_msg_member_login_failed;
          }
          Alert.alert(
            'Login Failed', res.error_msg,
            [ {text: 'OK', style: 'cancel'}, ],
            { cancelable: false }
          ) 
        }
        this.handleFetchDataIndicator(false);
      })
    } 
    // } else {
    //   Alert.alert(
    //     'Login Failed', 'Your username or password does not match with our record. Try again or select "Forget Password".',
    //     [ {text: 'OK', style: 'cancel'}, ],
    //     { cancelable: false }
    //   )
    // }
    // this.handleFetchDataIndicator(false);
  }

  // handle checking email input
  handleCheckingEmail(email_length) { 
    this.handleFetchDataIndicator(true); 
    if(email_length){
      this.setState({
        email_verify: true,
        password: '',
      });
      this.passwordInput.focus();
    } else {
      this.setState({
        email_verify: false
      });
    }
    this.handleFetchDataIndicator(false); 
  }

  // handle checking password input
  handleCheckingPassword(password_length) { 
    this.handleFetchDataIndicator(true); 
    if(password_length){
      this.setState({
        password_verify: true
      });
      this.handleLoginData(this.state.nric, this.state.password);
    } else {
      this.setState({
        password_verify: false
      });
    }
    this.handleFetchDataIndicator(false); 
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

  // Loading Indicator
  handleRenderLoadingIndicator(){
    return(
      <LoadingIndicator 
        visible={this.state.fetch_data}
        size={"large"} 
        text={"Fetching data..."}
      />
    )
  }

  render() {
    return (
      
      /** Start Safe Area **/
      <SafeAreaView style={ApplicationStyles.screen.safeAreaContainer} forceInset={{vertical:'never'}} >

        {/* Content */}
          <KeyboardAvoidingView behavior="padding" enableKeyboardAvoiding={Platform.OS === "ios" ? true : false} >

            {/* Start Main View */}
            <View style={styles.mainViewContainer}>

              <View style={[styles.bodyContainer, {backgroundColor: '#F3F8FF'}]}>

                {/* Header Navigation */}
                <View style={[{flexDirection: 'row', justifyContent: 'center'}]}>
                  <TouchableOpacity onPress={() => {this.props.navigation.navigate("LandingScreen")}}>
                    <View style={{justifyContent: 'center', width:  '10%'}}>
                      <Image
                        source={Images.arrowLeft}
                        style={{
                          height: Metrics.icons.large,
                          width:  Metrics.icons.large,
                          tintColor: Colors.text_color_1,
                        }}
                      />
                    </View>
                  </TouchableOpacity>
                  <View style={{justifyContent: 'center', width:  '80%'}}>
                    <Label 
                      text={`Login`}
                      style={{color: Colors.text_color_1, fontSize: Fonts.size.h6, fontWeight: '900', alignSelf: 'center'}}
                    />
                  </View>
                  <View style={{justifyContent: 'center', width:  '10%'}}/>
                </View>

                <ScrollView>

                  {/* Attribute of Input Username & Password */}
                  <View style={[{marginTop: Metrics.doubleBaseMargin}]}>

                    {/* Attribute Insert Username */}
                    <View style={[styles.attrRowContainer, {marginBottom: Metrics.smallMargin}]}>
                      <ARMSTextInput
                        inlineLeftImage={Images.face}
                        leftImageColor={(this.state.email_verify)?'':Colors.text_color_2}
                        borderColor={(this.state.email_verify)?Colors.text_color_1:Colors.text_negative}
                        placeholder={"Email / NRIC / Card No."} 
                        keyboardType={"email-address"}
                        autoCapitalize={"none"}
                        clearButtonMode={"while-editing"}
                        returnKeyType={"next"}
                        autoCorrect={false}
                        helperText={"E.g. 96........01 (without '-' )"}
                        helperTextColor={Colors.text_color_1}
                        onChangeText={(value) => {this.setState({nric: value})}}
                        onEndEditing={() => {this.handleCheckingEmail(this.state.nric.length)}}
                        value={this.state.nric}
                      />
                    </View>

                    {/* Checking Email input */}
                    {
                      (!this.state.email_verify)
                      ?
                      <View style={{justifyContent: 'flex-start'}}>
                        <Text style={{color: Colors.text_negative, marginBottom: Metrics.doubleBaseMargin}}>
                          You have entered invalid login.
                        </Text>
                      </View>
                      :
                      <Text style={{marginBottom: Metrics.doubleBaseMargin}}>{` `}</Text> // To maintain empty space in screen.
                    }

                    {/* Attribute Access Password */}
                    <View style={[styles.attrRowContainer, {marginBottom: Metrics.smallMargin}]}>
                      <ARMSTextInput
                        editable={true}
                        inlineLeftImage={Images.lock} 
                        leftImageColor={(this.state.password_verify)?'':Colors.text_color_2}
                        borderColor={(this.state.password_verify)?Colors.text_color_1:Colors.text_negative}
                        placeholder={"Password"}
                        autoCapitalize={"none"}
                        clearButtonMode={"while-editing"}
                        returnKeyType={"go"}
                        inputRef={(input) => {this.passwordInput = input}}
                        secureTextEntry={true}
                        helperText={"E.g. 12bd8g"}
                        helperTextColor={Colors.text_color_1}
                        onChangeText={(value) => {this.setState({password: value})}}
                        onEndEditing={() => {this.handleCheckingPassword(this.state.password.length)}}
                        value={this.state.password}
                      />
                    </View>

                    {/* Checking Password input */}
                    {
                      (!this.state.password_verify)
                      ?
                      <View style={{justifyContent: 'flex-start'}}>
                        <Text style={{color: Colors.text_negative, marginBottom: Metrics.doubleBaseMargin}}>
                          You have entered invalid password.
                        </Text>
                      </View>
                      :
                      <Text style={{marginBottom: Metrics.doubleBaseMargin}}>{` `}</Text> // To maintain empty space in screen.
                    }

                  </View>

                  {/* Attribute Login Button */}
                  <View style={{width: '100%', marginBottom: Metrics.smallMargin}}>
                    <AppsButton 
                      onPress={() => {this.handleLoginData(this.state.nric, this.state.password)}}
                      backgroundColor={Colors.primary}
                      text={"LOGIN"}
                      fontSize={20}
                      disabled={this.state.disabled}
                    />
                  </View>
                  
                  {/* To text input avoid keyboard */}
                  <View style={{marginBottom: Metrics.mainContainerMargin*2}}/> 
                </ScrollView>

              </View>
            </View>
          </KeyboardAvoidingView>

          {/* Loading Animation */}
          {this.handleRenderLoadingIndicator()}

      </SafeAreaView>

    );
  }
}
