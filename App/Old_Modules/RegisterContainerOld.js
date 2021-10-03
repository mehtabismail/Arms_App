/** REACT NATIVE **/
import React from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from 'react-native';

/** PROJECT FILES **/
import { 
  Colors, Fonts, Images, Metrics, ApplicationStyles,
  ARMSTextInput, AppsButton, LoadingIndicator, Label,
  I18n,
  AppConfig,
} from '../Services/LibLinking';
import styles from '../Modules/General/Login/Styles/LoginStyles';
import LoginController from "../Modules/General/Login/Actions/login_controller.js";

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

  componentWillMount() {
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

  // handle checking password lenght
  handleCheckingPassword(password_lenght) { 
    this.handleFetchDataIndicator(true); 
    if( password_lenght >= 6 && !this.state.password.match(/(\W)/g)){
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

  render() {
    return (
      
      /** Start Safe Area **/
      <SafeAreaView style={[ApplicationStyles.screen.safeAreaContainer, {backgroundColor: Colors.background}]} forceInset={{vertical:'never'}} >

        {/* Content */}
        <ScrollView> 
          <KeyboardAvoidingView behavior="padding" enableKeyboardAvoiding={Platform.OS === "ios" ? true : false} >
            
            {/* Start Welcome Text */}
            <View style={{
              marginBottom: Metrics.baseMargin*2,
              padding: Metrics.regularPadding,
              alignItems: 'center', 
              flexDirection: 'row',
              width: '100%', 
              justifyContent: 'center',  
              backgroundColor: Colors.primary,
              borderBottomLeftRadius: 200
              }}
            >
              <Image
                resizeMode= 'contain'
                source={this.state.company_logo_path}
                style={{height: Metrics.images.armsLogoReg, width: Metrics.images.armsLogoReg}}
              />
              <Label style={{margin: Metrics.baseMargin, color: Colors.secondary}}> REGISTRATION </Label>
            </View>
            
            {/* Start Main View */}
            <View style={[ApplicationStyles.screen.mainContainer,{paddingHorizontal: Metrics.basePadding}]}>
              {/* Attribute of Input email & Password */}
              <View style={[styles.formContainer]}>

                {/* Email Input container  */}
                <View style={{padding: Metrics.regularPadding}}>
                  <Label style={{color: Colors.primary}}>
                    Insert your email.
                  </Label>
                </View>

                {/* Attribute Insert email */}
                <View style={{flexDirection: 'column'}}>
                {
                  (!this.state.email_verify)
                  ?
                  <View style={[styles.attrRowContainer, {marginBottom: Metrics.smallMargin}]}>
                    <ARMSTextInput
                      inlineLeftImage={Images.face}
                      leftImageColor={Colors.text_color_2}
                      borderColor={Colors.text_negative}
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
                  :
                  <View style={[styles.attrRowContainer, {marginBottom: Metrics.smallMargin}]}>
                    <ARMSTextInput
                      inlineLeftImage={Images.face}
                      // leftImageColor={Colors.primary}
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
                }

                {/* Checking Email Format */}
                {
                  (!this.state.initScreenEmail)
                  ?
                    (regex.test(this.state.email))
                    ?
                    <View style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
                      <Image 
                        source={Images.round_tick} 
                        style={{
                          tintColor: Colors.text_positive, 
                          width: Metrics.icons.tiny, 
                          height: Metrics.icons.tiny,
                          marginRight: Metrics.smallPadding,
                          marginVertical: Metrics.smallMargin
                        }}
                      />
                      <Text style={{color: Colors.text_positive, marginVertical: Metrics.smallMargin}}>
                        Valid email format.
                      </Text>
                    </View>
                    :
                    <View style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
                      <Image 
                        source={Images.info} 
                        style={{
                          tintColor: Colors.text_negative, 
                          width: Metrics.icons.tiny, 
                          height: Metrics.icons.tiny,
                          marginRight: Metrics.smallPadding,
                          marginVertical: Metrics.smallMargin
                        }}
                      />
                      <Text style={{color: Colors.text_negative, marginVertical: Metrics.smallMargin}}>
                        Invalid email format.
                      </Text>
                    </View>
                  :
                  <View/>
                }
                </View>
                
                {/* Password Input container */}
                <View style={{padding: Metrics.regularPadding}}>
                  <Label style={{color: Colors.primary}}>
                    Create your password.
                  </Label>
                </View>

                {/* Checking Password Lenght */}
                {
                  (!this.state.password_verify)
                  ?
                  <View style={[styles.attrRowContainer, {marginBottom: Metrics.smallMargin}]}>
                    <ARMSTextInput
                      inlineLeftImage={Images.lock} 
                      leftImageColor={Colors.text_color_2}
                      borderColor={Colors.text_negative}
                      placeholder={"Password"}
                      autoCapitalize={"none"}
                      clearButtonMode={"while-editing"}
                      returnKeyType={"go"}
                      inputRef={(input) => {this.passwordInput = input}}
                      secureTextEntry={true}
                      // helperText={"*Min 6 characters  *Alphanumeric (A-z, 0-9)  E.g. 12bd8g"}
                      helperTextColor={Colors.text_negative}
                      onChangeText={(value) => {this.setState({password: value, initScreenPwd: false})}}
                      onEndEditing={() => {this.handleCheckingPassword(this.state.password.length)}}
                      value={this.state.password}
                    />
                  </View>
                  :
                  <View style={[styles.attrRowContainer, {marginBottom: Metrics.smallMargin}]}>
                    <ARMSTextInput
                      inlineLeftImage={Images.lock} 
                      // leftImageColor={Colors.primary}
                      placeholder={"Password"}
                      autoCapitalize={"none"}
                      clearButtonMode={"while-editing"}
                      returnKeyType={"go"}
                      inputRef={(input) => {this.passwordInput = input}}
                      secureTextEntry={true}
                      // helperText={"*Min 6 characters  *Alphanumeric (A-z, 0-9)  E.g. 12bd8g"}
                      helperTextColor={Colors.primary}
                      onChangeText={(value) => {this.setState({password: value, initScreenPwd: false})}}
                      onEndEditing={() => {this.handleCheckingPassword(this.state.password.length)}}
                      value={this.state.password}
                    />
                  </View>
                }
                {
                  (!this.state.initScreenPwd)
                  ?
                    (this.state.password.length >= 6 && !this.state.password.match(/(\W)/g))
                    ?
                    <View style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
                      <Image 
                        source={Images.round_tick} 
                        style={{
                          tintColor: Colors.text_positive, 
                          width: Metrics.icons.tiny, 
                          height: Metrics.icons.tiny,
                          marginRight: Metrics.smallPadding,
                          marginBottom: Metrics.baseMargin
                        }}
                      />
                      <Text style={{color: Colors.text_positive, marginBottom: Metrics.baseMargin}}>
                        Valid password format.
                      </Text>
                    </View>
                    :
                    <View style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
                      <Image 
                        source={Images.info} 
                        style={{
                          tintColor: Colors.text_negative, 
                          width: Metrics.icons.tiny, 
                          height: Metrics.icons.tiny,
                          marginRight: Metrics.smallPadding,
                          marginBottom: Metrics.baseMargin
                        }}
                      />
                      <Text style={{color: Colors.text_negative, marginBottom: Metrics.baseMargin}}>
                        Invalid password format.
                      </Text>
                    </View>
                  :
                  <View/>
                }

                {/* Password remarks */}
                <View style={{justifyContent: 'flex-start'}}>
                  <Text style={{fontSize: Fonts.size.medium, color: Colors.primary, marginBottom: Metrics.smallMargin, marginTop: Metrics.doubleBaseMargin}}>
                    *Minimum 6 characters
                  </Text>
                  <Text style={{fontSize: Fonts.size.medium, color: Colors.primary, marginBottom: Metrics.doubleBaseMargin}}>
                    *Alphanumeric (A-z, 0-9)
                  </Text>
                </View>

                {/* Attribute Re-confirm Access Password */}
                <View style={styles.attrRowContainer}>
                  <ARMSTextInput
                    inlineLeftImage={Images.vpnKey} 
                    // leftImageColor={Colors.primary}
                    placeholder={"Re-confirm Password"}
                    autoCapitalize={"none"}
                    clearButtonMode={"while-editing"}
                    returnKeyType={"go"}
                    inputRef={(input) => {this.passwordReconfirmInput = input}}
                    secureTextEntry={true}
                    // helperText={"E.g. 1299cbdjf8"}
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
                <Label style={{color: Colors.text_negative}}>
                  Password does not match.
                </Label>
              }
            </View> 
          
          </KeyboardAvoidingView>
        </ScrollView> 
          
        {/* Loading Animation */}
        {
          (this.state.fetch_data)
          ?
          <View style={{
            position: 'absolute',
            top: '25%',
            bottom: '25%',
            left: '25%',
            right: '25%',
          }}>
            <LoadingIndicator size={"large"} text={"Checking password..."}/>
          </View>
          :
          <View />
        }
                      
      </SafeAreaView>

    );
  }
}
