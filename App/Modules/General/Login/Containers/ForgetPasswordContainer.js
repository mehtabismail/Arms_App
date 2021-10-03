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

  componentDidMount() {
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
            );
          } else {
            Alert.alert('Reset Password Failed', res.data.msg);
          }
        }
      })
    }
    this.handleFetchDataIndicator(false);
  }

  // handle checking password input
  onCheckNric(nric_length) { 
    this.handleFetchDataIndicator(true); 
    if(nric_length){
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
  onCheckEmail(email_length){
    this.handleFetchDataIndicator(true); 
    if(email_length) {
      this.setState({ email_verify: true });
      this.handleForgetPasswordData(this.state.nric, this.state.email);
    } else {
      this.setState({ email_verify: false }); 
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

              <View style={[styles.bodyContainer, {backgroundColor: '#FEFFF3'}]}>
                
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
                      text={`Forget Password`}
                      style={{color: Colors.text_color_1, fontSize: Fonts.size.h6, fontWeight: '900', alignSelf: 'center'}}
                    />
                  </View>
                  <View style={{justifyContent: 'center', width:  '10%'}}/>
                </View>

                <ScrollView>
                  <View style={{paddingVertical: Metrics.regularPadding}}>
                    <Label style={{color: Colors.text_color_1, fontWeight: 'bold'}}>
                      To reset your password, please insert your card no. and email. Your temporary password will be sent to your email.
                    </Label>
                    <Label style={{color: Colors.text_color_1, marginTop: Metrics.baseMargin}}>
                      *Please check the spam folder if you do not receive the email. 
                    </Label>
                  </View>

                  {/* Attribute of Input Username and Email */}
                  <View style={[{width: '100%', marginTop: Metrics.baseMargin}]}>

                    {/* Username */}
                    <View style={{paddingVertical: Metrics.regularPadding}}>
                      <Label 
                        text={`Insert your Card No.`}
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
                    <View style={{paddingVertical: Metrics.regularPadding}}>
                      <Label 
                        text={`Insert your email. `}
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

                    {/* Attribute Login Button */}
                    <View style={{marginTop: Metrics.doubleBaseMargin}}>
                      <AppsButton 
                        onPress={() => {this.handleForgetPasswordData(this.state.nric, this.state.email)}}
                        backgroundColor={Colors.primary}
                        text={"SEND PASSWORD TO MY EMAIL"}
                        fontSize={Fonts.size.large}
                      />  
                    </View>
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
