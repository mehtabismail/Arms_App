/** REACT NATIVE **/
import React, {Component} from 'react';
import {
  Alert,
  View,  
  Image,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';

/** PROJECT FILES **/
import { 
  Colors, Fonts, Images, Metrics,
  AppsButton, Label, LoadingIndicator,
} from '../../../../Services/LibLinking';
import styles from '../Styles/LoginStyles';
import LoginController from '../Actions/login_controller';

/** NPM LIBRARIES **/
import {PropTypes} from 'prop-types';

export default class OTPModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      code1: '',
      code2: '',
      code3: '',
      code4: '',
      code5: '',
      code6: '',

      // countdown timer
      timer: 60,

      // Update data from server indiacator
      fetch_data: false,
    }
    
    //Create Login Controller Object
    this.loginController = new LoginController({
      navigation: this.props.navigation
    });
  }

  static propTypes = {
    isVisible: PropTypes.bool,
    onClose: PropTypes.func,
    nric: PropTypes.string,
    phone_no: PropTypes.string,
    email: PropTypes.string
  }

  handleTimerCountdownStart() {
    this.timer = setInterval(() => {
      if(this.state.timer > 0) {
        var decrement = this.state.timer - 1;
        this.setState({
          timer: decrement
        })
      } else {
        clearInterval(this.timer);
      }
    }, 1000)
  }

  handleTimerCountdownStop() {
    clearInterval(this.timer);
    this.setState({
      code1: '',
      code2: '',
      code3: '',
      code4: '',
      code5: '',
      code6: '',

      // countdown timer
      timer: 60,
    })
  }

  handleGetOTP(nric, phone_no) {  
    this.handleFetchDataIndicator(true);
    var result = this.loginController.HandleRequestOTPCode(nric, phone_no)
    result.then((res) => {
      if(res.result == 1) {
        this.code1.focus();
        this.handleTimerCountdownStop();
        this.handleTimerCountdownStart();
      }
      this.handleFetchDataIndicator(false);
    })
  }

  handleSubmitExistingMember(nric, phone_no, email) {
    var otp_code = `${this.state.code1}${this.state.code2}${this.state.code3}${this.state.code4}${this.state.code5}${this.state.code6}`;
    if(otp_code.length < 6){
      Alert.alert(
        'Invalid Code', 'Please insert 6 OTP Code.',
        [ {text: 'OK', style: 'cancel'}, ],
        { cancelable: false }
      )
    } else {
      var result = this.loginController.FetchExistingMemberDataWithOTP(nric, phone_no, email, otp_code)
      result.then((res) => {
        if(res.result == 1){
          this.props.onClose({action: 'user_submit', result: 1});
        } else {
          if(res.error_code == "invalid_otp") {
            Alert.alert(
              'Invalid Code', res.error_msg,
              [ {text: 'OK', style: 'cancel'}, ],
              { cancelable: false }
            )                        
          } else {
            if(res.error_code == "missing_params") {
              res.error_msg = "Missing required informations."
            }
            this.props.onClose({action: 'user_submit', result: 0, error_msg: res.error_msg});
          }
        }
      })
    }
  }

  handleFetchDataIndicator(status){
    this.setState({
      fetch_data: status
    })
  }

  // Loading Indicator
  handleRenderLoadingIndicator(){
    return(
      <LoadingIndicator 
        visible={this.state.fetch_data}
        size={"large"} 
        text={"Checking data..."}
      />
    )
  }

  render() {
    return (
      <View>
        <Modal
          visible = {this.props.isVisible}
          transparent = {true}
          animationType = 'slide'
          presentationStyle = 'overFullScreen'
          onShow = {() => {this.handleTimerCountdownStart()}}
          onDismiss = {() => {this.handleTimerCountdownStop()}}
        >
          {/* Modal Container */}
          <View
            style={{
              flex: 1,
              backgroundColor:'rgba(0, 0, 0, 0.57)',
              justifyContent: 'center',
            }}>
            
            {/* Modal View Container */}
            <View style={styles.modalViewContainer}>
              
              {/* Close Modal Button */}
              <View style={{justifyContent: 'space-between', flexDirection: 'row'}}>
                <View></View>
                <View style={{justifyContent: 'flex-end'}}>
                  <TouchableOpacity onPress={() => {
                    this.props.onClose({action: 'user_close'}); 
                    this.handleTimerCountdownStop();
                  }}>
                    <Image 
                      source={Images.round_cancel}
                      style={{width: Metrics.icons.medium, height: Metrics.icons.medium}}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* OTP code Container */}
              <View style={{justifyContent: 'center', alignItems: 'center', marginTop: Metrics.doubleBaseMargin}}>
                <Label style={{color: Colors.text_color_1, fontWeight: '700'}}>
                  {`Please enter 6 digit OTP code to verify your identity. OTP code will be send to the mobile number ${this.props.phone_no.replace(this.props.phone_no.substring(0,6), "******")}.`}
                </Label>

                {/* Number code text input */}
                <View style={{flexDirection: 'row', justifyContent: 'space-evenly', marginVertical: Metrics.baseMargin}}>
                  <TextInput 
                    style={styles.textInputStyle}
                    allowFontScaling={true}
                    autoFocus={true}
                    maxLength={1}
                    keyboardType={"number-pad"}
                    returnKeyType={"next"}
                    textContentType={"oneTimeCode"}
                    ref={(input) => {this.code1 = input}}
                    onChangeText={(value) => this.setState({code1: value}, () => {this.code2.focus()})}
                    value={this.state.code1}
                  />
                  <TextInput 
                    style={styles.textInputStyle}
                    allowFontScaling={true}
                    maxLength={1}
                    keyboardType={"number-pad"}
                    returnKeyType={"next"}
                    textContentType={"oneTimeCode"}
                    ref={(input) => {this.code2 = input}}
                    onChangeText={(value) => this.setState({code2: value}, () => {this.code3.focus()})}
                    value={this.state.code2}
                  />
                  <TextInput 
                    style={styles.textInputStyle}
                    allowFontScaling={true}
                    maxLength={1}
                    keyboardType={"number-pad"}
                    returnKeyType={"next"}
                    textContentType={"oneTimeCode"}
                    ref={(input) => {this.code3 = input}}
                    onChangeText={(value) => this.setState({code3: value}, () => {this.code4.focus()})}
                    value={this.state.code3}
                  />
                  <TextInput 
                    style={styles.textInputStyle}
                    allowFontScaling={true}
                    maxLength={1}
                    keyboardType={"number-pad"}
                    returnKeyType={"next"}
                    textContentType={"oneTimeCode"}
                    ref={(input) => {this.code4 = input}}
                    onChangeText={(value) => this.setState({code4: value}, () => {this.code5.focus()})}
                    value={this.state.code4}
                  />
                  <TextInput 
                    style={styles.textInputStyle}
                    allowFontScaling={true}
                    maxLength={1}
                    keyboardType={"number-pad"}
                    returnKeyType={"next"}
                    textContentType={"oneTimeCode"}
                    ref={(input) => {this.code5 = input}}
                    onChangeText={(value) => this.setState({code5: value}, () => {this.code6.focus()})}
                    value={this.state.code5}
                  />
                  <TextInput 
                    style={styles.textInputStyle}
                    allowFontScaling={true}
                    maxLength={1}
                    keyboardType={"number-pad"}
                    returnKeyType={"done"}
                    textContentType={"oneTimeCode"}
                    ref={(input) => {this.code6 = input}}
                    onChangeText={(value) => this.setState({code6: value}, () => {this.handleSubmitExistingMember(this.props.nric, this.props.phone_no, this.props.email)})}
                    value={this.state.code6}
                    // onEndEditing={()=>{this.handleSubmitExistingMember(this.props.nric, this.props.phone_no, this.props.email)}}
                  />
                </View>

                {/* Attribute Submit Button */}
                <View style={{marginTop: Metrics.doubleBaseMargin, width: '100%'}}>
                  <AppsButton 
                    onPress={() => {this.handleSubmitExistingMember(this.props.nric, this.props.phone_no, this.props.email)}}
                    backgroundColor={Colors.primary}
                    text={"SUBMIT"}
                    fontSize={20}
                  />  
                </View>

                <View style={{marginTop: Metrics.doubleBaseMargin*2, justifyContent: 'flex-start', width: '100%'}}>
                {
                  (this.state.timer < 40)
                  ?
                  <View>
                    <Label>
                      {`Didn't receive code?  ${this.state.timer} s`}
                    </Label>
                  </View>
                  :
                  <View/>
                }
                {
                  (this.state.timer)
                  ?
                  <View/>
                  :
                  <View style={{width: '50%', marginVertical: Metrics.baseMargin}}>
                    {/* Attribute request Button */}
                    <AppsButton 
                      onPress={() => {this.handleGetOTP(this.props.nric, this.props.phone_no)}}
                      backgroundColor={Colors.primary}
                      text={"REQUEST"}
                      fontSize={20}
                    />  
                  </View>
                }
                </View>

              </View>

            </View>

          </View>

          {/* Loading Animation */}
          {this.handleRenderLoadingIndicator()}
          
        </Modal>
      </View>
    );
  }
}
