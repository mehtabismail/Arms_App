/** REACT NATIVE **/
import React from 'react';
import {
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';

import {Button, Icon, Text, Input} from 'react-native-elements';

import {tailwind, getColor} from '../../../../../tailwind';

/** PROJECT FILES **/
import {
  Colors,
  Fonts,
  Images,
  Metrics,
  ApplicationStyles,
  ARMSTextInput,
  AppsButton,
  LoadingIndicator,
  Label,
  I18n,
  AppConfig,
} from '../../../../Services/LibLinking';
import styles from '../Styles/LoginStyles';
import LoginController from '../Actions/login_controller.js';

/** NPM LIBRARIES **/
import NetInfo from '@react-native-community/netinfo';
import {SafeAreaView} from 'react-navigation';

const regex =
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

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

      prev_screen: '',
    };

    //Create Login Controller Object
    this.loginController = new LoginController({
      navigation: this.props.navigation,
    });
  }

  /**Navigation Bottom Tab**/
  static navigationOptions = ({navigation, navigationOptions}) => {
    const params = navigation.state.params || {};
    var prev_screen = params.prev_screen;

    return {
      title: ' Register ',
      headerLeft: (
        <View style={{elevation: 20}}>
          <TouchableOpacity
            style={tailwind('bg-white rounded-lg opacity-100 p-2 ml-3 mt-3')}
            onPress={() => navigation.goBack()}>
            <Image
              style={{
                width: Metrics.icons.medium,
                height: Metrics.icons.medium,
                tintColor: 'black',
              }}
              source={Images.arrowLeft}
            />
          </TouchableOpacity>
        </View>
      ),

      headerRight: (
        <View style={{elevation: 20}}>
          <TouchableOpacity
            style={tailwind('bg-white rounded-lg opacity-100 p-2 mt-3 mr-3')}
            onPress={() => navigation.navigate(prev_screen, {})}>
            <Image
              style={{
                width: Metrics.icons.medium,
                height: Metrics.icons.medium,
                tintColor: 'black',
              }}
              source={Images.round_cancel}
            />
          </TouchableOpacity>
        </View>
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
    var prev_screen = this.props.navigation.getParam(
      'prev_screen',
      'DashboardScreen',
    );
    this.setState({prev_screen});
  }

  handleRegistrationData(email, password, repassword) {
    this.handleFetchDataIndicator(true);
    if (email == '' || password == '') {
      this.setState({
        initScreenEmail: false,
        email_verify: false,
        initScreenPwd: false,
        password_verify: false,
      });
    } else if (password != repassword) {
      Alert.alert(
        'Process Failed',
        'Password does not match.',
        [{text: 'OK', style: 'cancel'}],
        {cancelable: false},
      );
    } else {
      var result = this.loginController.handleMemberRegistration(
        email,
        password,
      );
      result.then((res) => {
        if (res.result == 1) {
          Alert.alert(
            'Congratulations',
            'You are now a member!',
            [{text: 'OK', style: 'cancel'}],
            {cancelable: false},
          );
          this.props.navigation.navigate('LoginScreen');
        } else {
          var error_msg = res.data.msg;
          if (error_msg == 'Email Already Used.') {
            Alert.alert(
              'Process Failed',
              'Email already registered in the system. Please use forget password to recovered your accounts or used another email to proceed.',
              [{text: 'OK', style: 'cancel'}],
              {cancelable: false},
            );
          } else {
            Alert.alert(
              'Process Failed',
              error_msg,
              [{text: 'OK', style: 'cancel'}],
              {cancelable: false},
            );
          }
        }
      });
    }
    this.handleFetchDataIndicator(false);
  }

  // handle checking password length
  handleCheckingPassword(password_length) {
    this.handleFetchDataIndicator(true);
    if (password_length >= 6 && !this.state.password.match(/(\W)/g)) {
      this.setState({
        password_verify: true,
      });
      // this.passwordReconfirmInput.focus();
    } else {
      this.setState({
        password_verify: false,
      });
    }
    this.handleFetchDataIndicator(false);
  }

  // handle checking email format
  onCheckEmailFormat(email) {
    this.handleFetchDataIndicator(true);
    var bool = regex.test(email);
    if (bool) {
      this.setState({
        email_verify: true,
      });
      // this.passwordInput.focus();
    } else {
      this.setState({
        email_verify: false,
      });
    }
    this.handleFetchDataIndicator(false);
  }

  handleFetchDataIndicator(status) {
    this.setState({
      fetch_data: status,
    });
  }

  async handleLoadCompanyLogo() {
    const {api_url, company_logo_url, company_logo_local} = AppConfig;
    var network = await this.networkConnectValidation();
    if (network.result == 1) {
      this.setState({
        company_logo_path: {uri: `${api_url}/${company_logo_url}`},
      });
    } else {
      this.setState({
        company_logo_path: {uri: company_logo_local},
      });
    }
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

  handleRenderValidationFormatText(status, text) {
    var color = status ? Colors.text_positive : Colors.text_negative;
    return (
      <View style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
        <Image
          source={status ? Images.round_tick : Images.info}
          style={{
            tintColor: color,
            width: Metrics.icons.tiny,
            height: Metrics.icons.tiny,
            marginRight: Metrics.smallPadding,
            marginVertical: Metrics.smallMargin,
          }}
        />
        <Text style={{color, marginVertical: Metrics.smallMargin}}>
          {`${text}`}
        </Text>
      </View>
    );
  }

  // Loading Indicator
  handleRenderLoadingIndicator() {
    return (
      <LoadingIndicator
        visible={this.state.fetch_data}
        size={'large'}
        text={'Checking password...'}
      />
    );
  }

  render() {
    return (
      /** Start Safe Area **/
      <SafeAreaView
        style={ApplicationStyles.screen.safeAreaContainer}
        forceInset={{vertical: 'never'}}>
        <View style={tailwind('h-full w-full bg-gray-200')}>
          <View style={tailwind('mt-16')}>
            <ScrollView
              contentContainerStyle={{
                // justifyContent: 'center',
                paddingVertical: 5,
              }}>
              {/* Content */}
              <KeyboardAvoidingView
                behavior="padding"
                enableKeyboardAvoiding={Platform.OS === 'ios' ? true : false}>
                {/* Start Main View */}

                <View style={tailwind('justify-center items-center')}>
                  <View style={tailwind('w-10/12 justify-center items-center')}>
                    <View style={tailwind('flex-row mb-3 justify-center')}>
                      <View style={tailwind('')}>
                        <Icon
                          raised
                          name="envelope"
                          type="font-awesome"
                          color={getColor('primary')}
                          onPress={() => console.log('hello')}
                        />
                      </View>
                      <View style={tailwind('flex-1 flex-col')}>
                        <View>
                          <Input
                            label="E-mail address"
                            placeholder="abc@gmail.com"
                            labelStyle={tailwind('text-secondary font-bold')}
                            keyboardType={'email-address'}
                            autoCapitalize={'none'}
                            clearButtonMode={'while-editing'}
                            returnKeyType={'next'}
                            autoCorrect={false}
                            onChangeText={(value) => {
                              this.setState({
                                email: value,
                                initScreenEmail: false,
                              });
                            }}
                            onEndEditing={() => {
                              this.onCheckEmailFormat(this.state.email);
                            }}
                            value={this.state.email}
                            inputContainerStyle={tailwind('h-9')}
                            inputStyle={tailwind('text-primary')}
                          />
                        </View>
                        <View>
                          {/* Checking Email Format */}
                          {
                            !this.state.initScreenEmail ? (
                              regex.test(this.state.email) ? (
                                this.handleRenderValidationFormatText(
                                  true,
                                  `Valid email format.`,
                                )
                              ) : (
                                this.handleRenderValidationFormatText(
                                  false,
                                  `Invalid email format.`,
                                )
                              )
                            ) : (
                              <Text>{` `}</Text>
                            ) // To maintain the space in screen.
                          }
                        </View>
                      </View>
                    </View>

                    <View style={tailwind('self-start mb-5 -mt-5')}>
                      <Text>*Minimum 6 characters</Text>
                      <Text>*Alphanumeric (A-z, 0-9)</Text>
                    </View>

                    <View style={tailwind('flex-row justify-center')}>
                      <View>
                        <Icon
                          raised
                          name="lock"
                          type="font-awesome"
                          color={getColor('primary')}
                          onPress={() => console.log('hello')}
                        />
                      </View>
                      <View style={tailwind('flex-1 flex-col')}>
                        <View>
                          <Input
                            label="Password"
                            labelStyle={tailwind('text-secondary font-bold ')}
                            placeholder=""
                            inputContainerStyle={tailwind('h-9')}
                            inputStyle={tailwind('text-primary')}
                            autoCapitalize={'none'}
                            clearButtonMode={'while-editing'}
                            returnKeyType={'go'}
                            inputRef={(input) => {
                              this.passwordInput = input;
                            }}
                            secureTextEntry={true}
                            onChangeText={(value) => {
                              this.setState({
                                password: value,
                                initScreenPwd: false,
                              });
                            }}
                            onEndEditing={() => {
                              this.handleCheckingPassword(
                                this.state.password.length,
                              );
                            }}
                            value={this.state.password}
                          />
                        </View>
                        <View>
                          {
                            !this.state.initScreenPwd ? (
                              this.state.password.length >= 6 &&
                              !this.state.password.match(/(\W)/g) ? (
                                this.handleRenderValidationFormatText(
                                  true,
                                  `Valid password format.`,
                                )
                              ) : (
                                this.handleRenderValidationFormatText(
                                  false,
                                  `Invalid password format.`,
                                )
                              )
                            ) : (
                              <Text
                                style={{
                                  marginVertical: Metrics.smallMargin,
                                }}>{` `}</Text>
                            ) // To maintain the space in screen.
                          }
                        </View>
                      </View>
                    </View>
                    <View style={tailwind('flex-row justify-center')}>
                      <View>
                        <Icon
                          raised
                          name="key"
                          type="font-awesome"
                          color={getColor('primary')}
                          onPress={() => console.log('hello')}
                        />
                      </View>
                      <View style={tailwind('flex-1')}>
                        <Input
                          label="Re-Confirm Password"
                          labelStyle={tailwind('text-secondary font-bold ')}
                          placeholder=""
                          inputContainerStyle={tailwind('h-9')}
                          inputStyle={tailwind('text-primary')}
                          autoCapitalize={'none'}
                          clearButtonMode={'while-editing'}
                          returnKeyType={'go'}
                          inputRef={(input) => {
                            this.passwordReconfirmInput = input;
                          }}
                          secureTextEntry={true}
                          onChangeText={(value) => {
                            this.setState({repassword: value});
                          }}
                          onSubmitEditing={() => {
                            this.handleRegistrationData(
                              this.state.email,
                              this.state.password,
                              this.state.repassword,
                            );
                          }}
                          value={this.state.repassword}
                        />
                      </View>
                    </View>
                    <View style={tailwind('w-full justify-center mt-3')}>
                      <View style={tailwind('self-center w-full mt-5 ')}>
                        <View style={{elevation: 20}}>
                          <Button
                            buttonStyle={tailwind('rounded-lg bg-btn-primary')}
                            title="REGISTER"
                            titleStyle={tailwind('text-xl font-bold')}
                            onPress={() => {
                              this.handleRegistrationData(
                                this.state.email, 
                                this.state.password,
                                this.state.repassword,
                              );
                            }}
                          />
                        </View>
                      </View>
                      <View style={tailwind('self-center w-full mt-3 ')}>
                        <View style={{elevation: 20}}>
                          <Button
                            buttonStyle={tailwind(
                              'rounded-lg bg-white border border-blue-600',
                            )}
                            title="SIGN IN"
                            titleStyle={tailwind(
                              'text-xl text-primary font-bold',
                            )}
                            onPress={() => {
                              this.props.navigation.navigate("LoginScreen", {
                                prev_screen: this.state.prev_screen,
                              });
                            }}
                          />
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              </KeyboardAvoidingView>

              {/* Loading Animation */}
              {this.handleRenderLoadingIndicator()}
              {/* </ScrollView> */}
            </ScrollView>
          </View>
        </View>
      </SafeAreaView>
    );
  }
}

// <View style={tailwind("h-full w-full bg-blue-200")}>

// <View >
//     {/* Attribute of Input email & Password */}
//     <View style={[styles.formContainer]}>

//       {/* Email Input container  */}
//       <View style={{paddingVertical: Metrics.regularPadding}}>
//         <Label
//           text={`Insert your email`}
//           style={{color: Colors.text_color_1, fontWeight: '900'}}
//         />
//       </View>

//       {/* Attribute Insert email */}
//       <View style={[styles.attrRowContainer, {marginBottom: Metrics.smallMargin}]}>
//         <ARMSTextInput
//           inlineLeftImage={Images.face}
//           leftImageColor={(this.state.email_verify)?'':Colors.text_color_2}
//           borderColor={(this.state.email_verify)?Colors.text_color_1:Colors.text_negative}
//           placeholder={"abc@gmail.com"}
//           keyboardType={"email-address"}
//           autoCapitalize={"none"}
//           clearButtonMode={"while-editing"}
//           returnKeyType={"next"}
//           autoCorrect={false}
//           onChangeText={(value) => {this.setState({email: value, initScreenEmail: false})}}
//           onEndEditing={() => {this.onCheckEmailFormat(this.state.email)}}
//           value={this.state.email}
//         />
//       </View>

//       {/* Checking Email Format */}
//       {
//         (!this.state.initScreenEmail)
//         ?
//           (regex.test(this.state.email))
//           ?
//           this.handleRenderValidationFormatText(true, `Valid email format.`)
//           :
//           this.handleRenderValidationFormatText(false, `Invalid email format.`)
//         :
//         <Text style={{marginVertical: Metrics.smallMargin}}>{` `}</Text> // To maintain the space in screen.
//       }

//       {/* Password Input container */}
//       <View style={{paddingVertical: Metrics.regularPadding, marginTop: Metrics.doubleBaseMargin}}>
//         <Label
//           text={`Create your password`}
//           style={{color: Colors.text_color_1, fontWeight: '900'}}
//         />
//       </View>

//       {/* Password remarks */}
//       <View style={{justifyContent: 'flex-start'}}>
//         <Text style={{fontSize: Fonts.size.medium, color: Colors.text_color_1, marginBottom: Metrics.smallMargin}}>
//           *Minimum 6 characters
//         </Text>
//         <Text style={{fontSize: Fonts.size.medium, color: Colors.text_color_1, marginBottom: Metrics.doubleBaseMargin}}>
//           *Alphanumeric (A-z, 0-9)
//         </Text>
//       </View>

//       {/* Checking Password Length */}
//       <View style={[styles.attrRowContainer, {marginBottom: Metrics.smallMargin}]}>
//         <ARMSTextInput
//           inlineLeftImage={Images.lock}
//           leftImageColor={(this.state.password_verify)?'':Colors.text_color_2}
//           borderColor={(this.state.password_verify)?Colors.text_color_1:Colors.text_negative}
//           placeholder={"Password"}
//           autoCapitalize={"none"}
//           clearButtonMode={"while-editing"}
//           returnKeyType={"go"}
//           inputRef={(input) => {this.passwordInput = input}}
//           secureTextEntry={true}
//           helperTextColor={Colors.primary}
//           onChangeText={(value) => {this.setState({password: value, initScreenPwd: false})}}
//           onEndEditing={() => {this.handleCheckingPassword(this.state.password.length)}}
//           value={this.state.password}
//         />
//       </View>

//       {
//         (!this.state.initScreenPwd)
//         ?
//           (this.state.password.length >= 6 && !this.state.password.match(/(\W)/g))
//           ?
//           this.handleRenderValidationFormatText(true, `Valid password format.`)
//           :
//           this.handleRenderValidationFormatText(false, `Invalid password format.`)
//         :
//         <Text style={{marginVertical: Metrics.smallMargin}}>{` `}</Text> // To maintain the space in screen.
//       }

//       {/* Attribute Re-confirm Access Password */}
//       <View style={[styles.attrRowContainer, {marginTop: Metrics.basePadding}]}>
//         <ARMSTextInput
//           inlineLeftImage={Images.vpnKey}
//           borderColor={Colors.text_color_1}
//           placeholder={"Re-confirm Password"}
//           autoCapitalize={"none"}
//           clearButtonMode={"while-editing"}
//           returnKeyType={"go"}
//           inputRef={(input) => {this.passwordReconfirmInput = input}}
//           secureTextEntry={true}
//           onChangeText={(value) => {this.setState({repassword: value})}}
//           onSubmitEditing={() => {this.handleRegistrationData(this.state.email, this.state.password, this.state.repassword)}}
//           value={this.state.repassword}
//         />
//       </View>

//     </View>

//     {/* Attribute Login Button */}
//     {
//       (this.state.password == this.state.repassword)
//       ?
//       <AppsButton
//         onPress={() => {this.handleRegistrationData(this.state.email, this.state.password, this.state.repassword)}}
//         backgroundColor={Colors.primary}
//         text={"REGISTER"}
//         fontSize={20}
//       />
//       :
//       <Label style={{color: Colors.text_negative, textAlign: 'center'}}>
//         Password does not match.
//       </Label>
//     }

//     {/* To text input avoid keyboard */}
//     <View style={{marginBottom: Metrics.mainContainerMargin*2}}/>
// </View>
// </View>
