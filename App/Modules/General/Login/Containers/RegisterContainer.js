/** REACT NATIVE **/
import React from 'react';
import {
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

/** PROJECT FILES **/
import { 
  Colors, Fonts, Images, Metrics, ApplicationStyles,
  ARMSTextInput, AppsButton, LoadingIndicator, Label,
  I18n,
  AppConfig,
} from '../../../../Services/LibLinking';
import styles from '../Styles/LoginStyles';
import LoginController from "../Actions/login_controller.js";

/** NPM LIBRARIES **/
import NetInfo from "@react-native-community/netinfo";
import { SafeAreaView } from 'react-navigation';

const regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export default class RegisterView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      repassword: '', 
      company_logo_path: AppConfig.company_logo_default,
      initScreenEmail: true,
      initScreenPwd: true,
      password_verify: true,
      email_verify: true,

      // Update data from server indiacator
      fetch_data: false,

    }

    //Create Login Controller Object
    this.loginController = new LoginController({
      navigation: this.props.navigation
    });
  }

  /**Navigation Bottom Tab**/
  static navigationOptions = ({ navigation, navigationOptions }) => {
    const params = navigation.state.params || {};

    return {
      title: ' Register ',
    };
  };
  /**End Navigation Bottom Tab**/

  componentDidMount() {
    /** Company Logo Show Check **/
    this.handleLoadCompanyLogo();
  }

  handleRegistrationData(email, password, repassword) {
    this.handleFetchDataIndicator(true);
    if(email == '' || password == '') {
      this.setState({
        initScreenEmail: false,
        email_verify: false,
        initScreenPwd: false,
        password_verify: false,
      })
    } else if(password != repassword) {
      Alert.alert(
        'Process Failed', 'Password does not match.',
        [ {text: 'OK', style: 'cancel'}, ],
        { cancelable: false }
      )
    } else { 
      var result = this.loginController.handleMemberRegistration(email, password)
      result.then((res)=>{
        if(res.result == 1){   
          Alert.alert(
            'Congratulations', 'You are now a member!',
            [ {text: 'OK', style: 'cancel'}, ],
            { cancelable: false }
          );
          this.props.navigation.navigate("LoginScreen") ;
        } else {
          var error_msg = res.data.msg;
          if(error_msg == "Email Already Used.") {
            Alert.alert(
              'Process Failed', 'Email already registered in the system. Please use forget password to recovered your accounts or used another email to proceed.',
              [ {text: 'OK', style: 'cancel'}, ],
              { cancelable: false }
            )
          } else {
            Alert.alert(
              'Process Failed', error_msg,
              [ {text: 'OK', style: 'cancel'}, ],
              { cancelable: false }
            ) 
          }

        }
      })
    }
    this.handleFetchDataIndicator(false);
  }

  // handle checking password length
  handleCheckingPassword(password_length) { 
    this.handleFetchDataIndicator(true); 
    if( password_length >= 6 && !this.state.password.match(/(\W)/g)){
      this.setState({
        password_verify: true
      });
      this.passwordReconfirmInput.focus();
    } else {
      this.setState({
        password_verify: false
      });
    }
    this.handleFetchDataIndicator(false); 
  }

  // handle checking email format
  onCheckEmailFormat(email){
    this.handleFetchDataIndicator(true); 
    var bool = regex.test(email);
    if(bool) {
      this.setState({
        email_verify: true
      });
      this.passwordInput.focus();
    } else {
      this.setState({
        email_verify: false
      }); 
    }
    this.handleFetchDataIndicator(false); 
  }

  handleFetchDataIndicator(status){
    this.setState({
      fetch_data: status
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

  handleRenderValidationFormatText(status, text){
    var color = status ? Colors.text_positive : Colors.text_negative;
    return(
      <View style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
        <Image 
          source={status ? Images.round_tick : Images.info} 
          style={{
            tintColor: color, 
            width: Metrics.icons.tiny, 
            height: Metrics.icons.tiny,
            marginRight: Metrics.smallPadding,
            marginVertical: Metrics.smallMargin
          }}
        />
        <Text style={{color, marginVertical: Metrics.smallMargin}}>
        {`${text}`}
        </Text>
      </View>
    )
  }

  // Loading Indicator
  handleRenderLoadingIndicator(){
    return(
      <LoadingIndicator 
        visible={this.state.fetch_data}
        size={"large"} 
        text={"Checking password..."}
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

            <View style={[styles.bodyContainer, {backgroundColor: '#F3FFF4'}]}>

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
                    text={`Registration`}
                    style={{color: Colors.text_color_1, fontSize: Fonts.size.h6, fontWeight: '900', alignSelf: 'center'}}
                  />
                </View>
                <View style={{justifyContent: 'center', width:  '10%'}}/>
              </View>

              <ScrollView>
                {/* Attribute of Input email & Password */}
                <View style={[styles.formContainer]}>

                  {/* Email Input container  */}
                  <View style={{paddingVertical: Metrics.regularPadding}}>
                    <Label 
                      text={`Insert your email`}
                      style={{color: Colors.text_color_1, fontWeight: '900'}}
                    />
                  </View>

                  {/* Attribute Insert email */}
                  <View style={[styles.attrRowContainer, {marginBottom: Metrics.smallMargin}]}>
                    <ARMSTextInput
                      inlineLeftImage={Images.face}
                      leftImageColor={(this.state.email_verify)?'':Colors.text_color_2}
                      borderColor={(this.state.email_verify)?Colors.text_color_1:Colors.text_negative}
                      placeholder={"abc@gmail.com"} 
                      keyboardType={"email-address"}
                      autoCapitalize={"none"}
                      clearButtonMode={"while-editing"}
                      returnKeyType={"next"}
                      autoCorrect={false}
                      onChangeText={(value) => {this.setState({email: value, initScreenEmail: false})}}
                      onEndEditing={() => {this.onCheckEmailFormat(this.state.email)}}
                      value={this.state.email}
                    />
                  </View>

                  {/* Checking Email Format */}
                  {
                    (!this.state.initScreenEmail)
                    ?
                      (regex.test(this.state.email))
                      ?
                      this.handleRenderValidationFormatText(true, `Valid email format.`)
                      :
                      this.handleRenderValidationFormatText(false, `Invalid email format.`)
                    :
                    <Text style={{marginVertical: Metrics.smallMargin}}>{` `}</Text> // To maintain the space in screen.
                  }
                  
                  {/* Password Input container */}
                  <View style={{paddingVertical: Metrics.regularPadding, marginTop: Metrics.doubleBaseMargin}}>
                    <Label 
                      text={`Create your password`}
                      style={{color: Colors.text_color_1, fontWeight: '900'}}
                    />
                  </View>

                  {/* Password remarks */}
                  <View style={{justifyContent: 'flex-start'}}>
                    <Text style={{fontSize: Fonts.size.medium, color: Colors.text_color_1, marginBottom: Metrics.smallMargin}}>
                      *Minimum 6 characters
                    </Text>
                    <Text style={{fontSize: Fonts.size.medium, color: Colors.text_color_1, marginBottom: Metrics.doubleBaseMargin}}>
                      *Alphanumeric (A-z, 0-9)
                    </Text>
                  </View>

                  {/* Checking Password Length */}
                  <View style={[styles.attrRowContainer, {marginBottom: Metrics.smallMargin}]}>
                    <ARMSTextInput
                      inlineLeftImage={Images.lock} 
                      leftImageColor={(this.state.password_verify)?'':Colors.text_color_2}
                      borderColor={(this.state.password_verify)?Colors.text_color_1:Colors.text_negative}
                      placeholder={"Password"}
                      autoCapitalize={"none"}
                      clearButtonMode={"while-editing"}
                      returnKeyType={"go"}
                      inputRef={(input) => {this.passwordInput = input}}
                      secureTextEntry={true}
                      helperTextColor={Colors.primary}
                      onChangeText={(value) => {this.setState({password: value, initScreenPwd: false})}}
                      onEndEditing={() => {this.handleCheckingPassword(this.state.password.length)}}
                      value={this.state.password}
                    />
                  </View>

                  {
                    (!this.state.initScreenPwd)
                    ?
                      (this.state.password.length >= 6 && !this.state.password.match(/(\W)/g))
                      ?
                      this.handleRenderValidationFormatText(true, `Valid password format.`)
                      :
                      this.handleRenderValidationFormatText(false, `Invalid password format.`)
                    :
                    <Text style={{marginVertical: Metrics.smallMargin}}>{` `}</Text> // To maintain the space in screen.
                  }

                  {/* Attribute Re-confirm Access Password */}
                  <View style={[styles.attrRowContainer, {marginTop: Metrics.basePadding}]}>
                    <ARMSTextInput
                      inlineLeftImage={Images.vpnKey}
                      borderColor={Colors.text_color_1}
                      placeholder={"Re-confirm Password"}
                      autoCapitalize={"none"}
                      clearButtonMode={"while-editing"}
                      returnKeyType={"go"}
                      inputRef={(input) => {this.passwordReconfirmInput = input}}
                      secureTextEntry={true}
                      onChangeText={(value) => {this.setState({repassword: value})}}
                      onSubmitEditing={() => {this.handleRegistrationData(this.state.email, this.state.password, this.state.repassword)}}
                      value={this.state.repassword}
                    />
                  </View>
                
                </View>

                {/* Attribute Login Button */}
                {
                  (this.state.password == this.state.repassword)
                  ?
                  <AppsButton 
                    onPress={() => {this.handleRegistrationData(this.state.email, this.state.password, this.state.repassword)}}
                    backgroundColor={Colors.primary}
                    text={"REGISTER"}
                    fontSize={20}
                  /> 
                  :
                  <Label style={{color: Colors.text_negative, textAlign: 'center'}}>
                    Password does not match.
                  </Label>
                }

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
