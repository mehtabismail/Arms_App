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
import LoginController from '../Actions/login_controller';
import OTPModal from './OTPModalContainer';

/** NPM LIBRARIES **/
import NetInfo from "@react-native-community/netinfo";
import { SafeAreaView } from 'react-navigation';

export default class ForgetPasswordView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      nric: '', 
      phone_no: '',
      otp_code: '',
      email: '',
      email_input: false,
      email_verify: true,
      nric_verify: true,
      showOTPModal: false,
      
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
      title: ' Existing Member ',
    };
  };
  /**End Navigation Bottom Tab**/

  componentDidMount() {
  }

  // Function to check existing member data
  handleCheckMemberData(nric) { 
    this.handleFetchDataIndicator(true);
    if(nric == '') {
      this.setState({
        nric_verify: false,
      })
      this.handleFetchDataIndicator(false);
    } else {
      var result = this.loginController.FetchExistingMemberData(nric);
      result.then((res)=>{
        if(res.result == 1){ 
          if(res.success_register == 1)  {
            Alert.alert(
              'Process Success', 'Your temporary password will be sent to your email.',
              [ {text: 'OK', style: 'cancel'}, ],
              { cancelable: false }
            )
            this.props.navigation.navigate("LoginScreen");
          } else {
            this.setState({
              phone_no: res.mobile_num,
              email_input: true
            })
          }
        } else {
          var error_msg = res.data.msg;
          if(error_msg == "Data Not Found"){
            Alert.alert(
              'Process Failed', 'Data not found. Please make sure your card no or NRIC is correct.',
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
      this.handleFetchDataIndicator(false);
    }
  }

  // handle checking password input
  onCheckNric(nric_length) { 
    this.handleFetchDataIndicator(true); 
    if(nric_length){
      this.setState({
        nric_verify: true
      });
      this.handleCheckMemberData(this.state.nric);
    } else {
      this.setState({
        nric_verify: false
      });
    }
    this.handleFetchDataIndicator(false); 
  }

  handleGetOTP(status, nric, phone_no, email) {  
    this.handleFetchDataIndicator(true);  
    if (email == '') {
      this.setState({
        email_verify: false,
      })
      this.handleFetchDataIndicator(false);
    } else {
      var result = this.loginController.HandleRequestOTPCode(nric, phone_no)
      result.then((res) => {
        if(res.result == 1) {
          this.handleOTPModalVisibleOnChanged(status);
        } else {
          Alert.alert(
            'Process Failed', res.data.msg,
            [ {text: 'OK', style: 'cancel'}, ],
            { cancelable: false }
          )
        }
        this.handleFetchDataIndicator(false);
      })
    }
  }

  // handle checking email input
  onCheckEmail(email_length){
    this.handleFetchDataIndicator(true); 
    if(email_length) {
      this.setState({
        email_verify: true
      });
      // handleGetOTP(this.state.nric, this.state.phone_no, this.state.email);
    } else {
      this.setState({
        email_verify: false
      }); 
    }
    this.handleFetchDataIndicator(false); 
  }

  handleOTPModalVisibleOnChanged(status, res = ""){
    this.handleFetchDataIndicator(true);
    this.setState({
      showOTPModal: status,
    }, () => {
      this.timer = setTimeout(() => {
        this.processOTPResult(res);
      }, 1000)
    })
  }

  processOTPResult(res) {
    if(res.action == "user_submit"){
      if(res.result == 1) {
        Alert.alert(
          'Process Success', 'Your temporary password will be sent to your email.',
          [ {text: 'OK', style: 'cancel'}, ],
          { cancelable: false }
        )
        this.props.navigation.navigate("LoginScreen");
      } else {
        Alert.alert(
          'Process Failed', res.error_msg,
          [ {text: 'OK', style: 'cancel'}, ],
          { cancelable: false }
        )
      }
    }
    this.handleFetchDataIndicator(false);
  }

  handleFetchDataIndicator(status){
    this.setState({
      fetch_data: status
    })
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
          <KeyboardAvoidingView  behavior="padding" enableKeyboardAvoiding={Platform.OS === "ios" ? true : false} >
            
            {/* Start Main View */}
            <View style={styles.mainViewContainer}>

              <View style={[styles.bodyContainer, {backgroundColor: '#FFF3F4'}]}>

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
                      text={`Existing Customer`}
                      style={{color: Colors.text_color_1, fontSize: Fonts.size.h6, fontWeight: '900', alignSelf: 'center'}}
                    />
                  </View>
                  <View style={{justifyContent: 'center', width:  '10%'}}/>
                </View>

                <ScrollView>
                  <View style={{paddingVertical: Metrics.regularPadding}}>
                    <Label 
                      text={`Please insert your Card No. or NRIC. Your first time login password will be sent to your email.`}
                      style={{color: Colors.text_color_1, fontWeight: '900'}}
                    />
                    <Label
                      text={`*Please check the spam folder if you do not receive the email.`}
                      style={{color: Colors.text_color_1, paddingTop: Metrics.basePadding}}
                    />
                  </View>

                  {/* Attribute of Input Username and Email */}
                  <View style={[styles.formContainer, {width: '100%'}]}>

                    {/* Username */}
                    <View style={{paddingVertical: Metrics.regularPadding}}>
                      <Label 
                        text={`Insert your Card No. or NRIC`}
                        style={{color: Colors.text_color_1, fontWeight: '900'}} 
                      />
                    </View>

                    {/* Attribute Insert Username */}
                    <View style={[styles.attrRowContainer, {marginBottom: Metrics.smallMargin}]}>
                      <ARMSTextInput
                        inlineLeftImage={Images.card_membership}
                        leftImageColor={(this.state.nric_verify)?'':Colors.text_color_2}
                        borderColor={(this.state.nric_verify)?Colors.text_color_1:Colors.text_negative}
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
                      <Text style={{marginBottom: Metrics.doubleBaseMargin}}>{` `}</Text> // To maintain empty space in screen.
                    }

                    {/* Email */}
                    {
                      (this.state.email_input)
                      ?
                      <View>
                        <View style={{justifyContent: 'flex-start'}}>
                          <Text style={{
                            fontSize: Fonts.size.regular,
                            fontWeight: 'bold',
                            color: Colors.text_negative,
                            marginBottom: Metrics.smallMargin,
                          }}>
                            Error: Your email is not found.
                          </Text>
                        </View>

                        <View style={{paddingVertical: Metrics.regularPadding}}>
                          <Label 
                            text={`Insert your email`}
                            style={{color: Colors.text_color_1, fontWeight: '900'}}
                          />
                        </View>

                        {/* Attribute Insert Email */}
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
                            inputRef={(input) => {this.emailInput = input}}
                            autoCorrect={false}
                            onChangeText={(value) => {this.setState({email: value})}}
                            onEndEditing={() => {this.onCheckEmail(this.state.email.length)}}
                            value={this.state.email}
                          />
                        </View>

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
                          <Text style={{marginBottom: Metrics.doubleBaseMargin}}>{` `}</Text> // To maintain empty space in screen.
                        }
                      </View>
                      :
                      <View/>
                    }

                    {/* Attribute Login Button */}
                    {
                      (this.state.email_input)
                      ?
                      <View style={{marginTop: Metrics.doubleBaseMargin}}>
                        <AppsButton 
                          onPress={() => {this.handleGetOTP(true ,this.state.nric, this.state.phone_no, this.state.email)}}
                          backgroundColor={Colors.primary}
                          text={"SEND PASSWORD TO MY EMAIL"}
                          fontSize={Fonts.size.large}
                        />  
                      </View>
                      :
                      <View style={{marginTop: Metrics.doubleBaseMargin}}>
                        <AppsButton 
                          onPress={() => {this.handleCheckMemberData(this.state.nric)}}
                          backgroundColor={Colors.primary}
                          text={"SEND PASSWORD TO MY EMAIL"}
                          fontSize={Fonts.size.large}
                        />  
                      </View>
                    }

                    <OTPModal
                      isVisible={this.state.showOTPModal}
                      onClose={(res) => {this.handleOTPModalVisibleOnChanged(false, res)}}
                      nric={this.state.nric}
                      phone_no={this.state.phone_no}
                      email={this.state.email}
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
