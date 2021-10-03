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

export default class ForgetPasswordView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      nric: '', 
      email: '',
      company_logo_path: AppConfig.company_logo_default,  
      email_verify: true,
      nric_verify: true,
      
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
      title: ' Forget Password ',
    };
  };
  /**End Navigation Bottom Tab**/

  componentWillMount() {
    /** Company Logo Show Check **/
    this.handleLoadCompanyLogo();
  }

  // Function to handle forget passsword data
  handleForgetPasswordData(nric, email) { 
    this.handleFetchDataIndicator(true);
    if(nric == '' || email == ''){
      if(nric == '') {
        this.setState({
          nric_verify: false,
        })
      }
      
      if (email == '') {
        this.setState({
          email_verify: false,
        })
      }
    } else {
      var result = this.loginController.handleForgetPassword(nric, email)
      result.then((res)=>{
        if(res.result == 1){   
          Alert.alert(
            'Reset Password Success', 'Your temporary password will be sent to your email.',
            [ {text: 'OK', style: 'cancel'}, ],
            { cancelable: false }
          ) 
          this.props.navigation.navigate("LoginScreen");
        } else {
          var error_msg = res.data.msg;
          if(error_msg == "Data Not Found"){
            Alert.alert(
              'Reset Password Failed', 'Data not found. Please make sure your card no and email are correct.',
              [ {text: 'OK', style: 'cancel'}, ],
              { cancelable: false }
            ) 
          }
        }
      })
    }
    this.handleFetchDataIndicator(false);
  }

  // handle checking password input
  onCheckNric(nric_lenght) { 
    this.handleFetchDataIndicator(true); 
    if(nric_lenght){
      this.setState({
        nric_verify: true
      });
      this.emailInput.focus();
    } else {
      this.setState({
        nric_verify: false
      });
    }
    this.handleFetchDataIndicator(false); 
  }

  // handle checking email input
  onCheckEmail(email_lenght){
    this.handleFetchDataIndicator(true); 
    if(email_lenght) {
      this.setState({
        email_verify: true
      });
      this.handleForgetPasswordData(this.state.nric, this.state.email);
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
          <KeyboardAvoidingView  behavior="padding" enableKeyboardAvoiding={Platform.OS === "ios" ? true : false} >
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
              <Label style={{margin: Metrics.baseMargin, color: Colors.secondary}}>
                FORGET PASSWORD
              </Label>
            </View>
            
            {/* Start Main View */}
            <View style={[ApplicationStyles.screen.mainContainer,{paddingHorizontal: Metrics.basePadding}]}>
              <View style={{padding: Metrics.regularPadding}}>
                <Label style={{color: Colors.primary, fontWeight: 'bold'}}>
                  To reset your password, please insert your card no. and email. Your temporary password will be sent to your email.
                </Label>
                <Label style={{color: Colors.primary}}>
                  *Please check the spam folder if you do not receive the email. 
                </Label>
              </View>

              {/* Attribute of Input Username and Email */}
              <View style={[styles.formContainer, {width: '100%'}]}>

                {/* Username */}
                <View style={{padding: Metrics.regularPadding, }}>
                  <Label style={{color: Colors.primary}}>
                    Insert your Card No. 
                  </Label>
                </View>

                {/* Attribute Insert Username */}
                {
                  (!this.state.nric_verify)
                  ?
                  <View style={[styles.attrRowContainer, {marginBottom: Metrics.smallMargin}]}>
                    <ARMSTextInput
                      inlineLeftImage={Images.card_membership}
                      leftImageColor={Colors.text_color_2}
                      borderColor={Colors.text_negative}
                      placeholder={"Card No."} 
                      autoCapitalize={"none"}
                      clearButtonMode={"while-editing"}
                      returnKeyType={"next"}
                      autoCorrect={false}
                      onChangeText={(value) => {this.setState({nric: value, initScreenNric: false})}}
                      onEndEditing={() => {this.onCheckNric(this.state.nric.length)}}
                      value={this.state.nric}
                    />
                  </View>
                  :
                  <View style={[styles.attrRowContainer, {marginBottom: Metrics.smallMargin}]}>
                    <ARMSTextInput
                      inlineLeftImage={Images.card_membership}
                      // leftImageColor={Colors.primary}
                      placeholder={"Card No."} 
                      autoCapitalize={"none"}
                      clearButtonMode={"while-editing"}
                      returnKeyType={"next"}
                      autoCorrect={false}
                      onChangeText={(value) => {this.setState({nric: value, initScreenNric: false})}}
                      onEndEditing={() => {this.onCheckNric(this.state.nric.length)}}
                      value={this.state.nric}
                    />
                  </View>
                }

                {/* Checking nric input */}
                {
                  (!this.state.nric_verify)
                  ?
                  <View style={{justifyContent: 'flex-start'}}>
                    <Text style={{color: Colors.text_negative, marginBottom: Metrics.doubleBaseMargin}}>
                      You have entered invalid card no.
                    </Text>
                  </View>
                  :
                  <View/>
                }

                {/* Email */}
                <View style={{padding: Metrics.regularPadding}}>
                  <Label style={{color: Colors.primary}}>
                    Insert your email. 
                  </Label>
                </View>

                {/* Attribute Insert Email */}
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
                      inputRef={(input) => {this.emailInput = input}}
                      autoCorrect={false}
                      onChangeText={(value) => {this.setState({email: value})}}
                      onEndEditing={() => {this.onCheckEmail(this.state.email.length)}}                      
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
                      inputRef={(input) => {this.emailInput = input}}
                      autoCorrect={false}
                      onChangeText={(value) => {this.setState({email: value})}}
                      onEndEditing={() => {this.onCheckEmail(this.state.email.length)}}
                      value={this.state.email}
                    />
                  </View>
                }

                {/* Checking Email input */}
                {
                  (!this.state.email_verify)
                  ?
                  <View style={{justifyContent: 'flex-start'}}>
                    <Text style={{color: Colors.text_negative, marginBottom: Metrics.doubleBaseMargin}}>
                      You have entered invalid email.
                    </Text>
                  </View>
                  :
                  <View/>
                }

                {/* Attribute Login Button */}
                <View style={{marginTop: Metrics.doubleBaseMargin}}>
                  <AppsButton 
                    onPress={() => {this.handleForgetPasswordData(this.state.nric, this.state.email)}}
                    backgroundColor={Colors.primary}
                    text={"RESET PASSWORD"}
                    fontSize={20}
                  />  
                </View>
 
              </View>
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
