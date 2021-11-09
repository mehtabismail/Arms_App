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


import { Button, Card, Text, Input, Icon } from 'react-native-elements'

import { tailwind, getColor } from '../../../../../tailwind';

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
      title: 'Forget Password',
      headerLeft: (
        <View style={{ elevation: 20 }}>
          <TouchableOpacity style={tailwind("bg-white rounded-lg opacity-100 p-2 ml-3 mt-3")}
            onPress={() => navigation.goBack()}>
            <Image
              style={{ width: Metrics.icons.medium, height: Metrics.icons.medium, tintColor: "black" }}
              source={Images.arrowLeft} />
          </TouchableOpacity>
        </View>

      ),

      headerRight: (
        <View style={{ elevation: 20 }}>
          <TouchableOpacity
            style={tailwind("bg-white rounded-lg opacity-100 p-2 mt-3 mr-3")}
            onPress={() => navigation.navigate(prev_screen, {})}
          >
            <Image
              style={{ width: Metrics.icons.medium, height: Metrics.icons.medium, tintColor: "black" }}
              source={Images.round_cancel} />
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
    var prev_screen = this.props.navigation.getParam("prev_screen", "DashboardScreen");
    this.setState({ prev_screen });
  }

  // Function to handle forget passsword data
  handleForgetPasswordData(nric, email) {
    this.handleFetchDataIndicator(true);
    if (nric == '' || email == '') {
      if (nric == '') {
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
      result.then((res) => {
        if (res.result == 1) {
          Alert.alert(
            'Reset Password Success', 'Your temporary password will be sent to your email.',
            [{ text: 'OK', style: 'cancel' },],
            { cancelable: false }
          )
          this.props.navigation.navigate("LoginScreen");
        } else {
          var error_msg = res.data.msg;
          if (error_msg == "Data Not Found") {
            Alert.alert(
              'Reset Password Failed', 'Data not found. Please make sure your card no and email are correct.',
              [{ text: 'OK', style: 'cancel' },],
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
    if (nric_length) {
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
  onCheckEmail(email_length) {
    this.handleFetchDataIndicator(true);
    if (email_length) {
      this.setState({ email_verify: true });
      this.handleForgetPasswordData(this.state.nric, this.state.email);
    } else {
      this.setState({ email_verify: false });
    }
    this.handleFetchDataIndicator(false);
  }

  handleFetchDataIndicator(status) {
    this.setState({
      fetch_data: status
    })
  }

  async handleLoadCompanyLogo() {
    const { api_url, company_logo_url, company_logo_local } = AppConfig;
    var network = await this.networkConnectValidation();
    if (network.result == 1) {
      this.setState({
        company_logo_path: { uri: `${api_url}/${company_logo_url}` }
      })
    } else {
      this.setState({
        company_logo_path: { uri: company_logo_local }
      })
    }
  }

  networkConnectValidation() {
    let result = new Promise((resolve, reject) => {
      NetInfo.isConnected.fetch().done((isConnected) => {
        if (isConnected) {
          resolve({ result: 1, data: isConnected })
        } else {
          resolve({ result: 0, data: { title: I18n.t("network_error_title"), msg: I18n.t("network_error_msg") } });
        }
      });
    })
    return result;
  }

  // Loading Indicator
  handleRenderLoadingIndicator() {
    return (
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
      <SafeAreaView style={ApplicationStyles.screen.safeAreaContainer} forceInset={{ vertical: 'never' }} >

        {/* Content */}
        <KeyboardAvoidingView behavior="padding" enableKeyboardAvoiding={Platform.OS === "ios" ? true : false} >

          {/* Start Main View */}
          <View style={tailwind("h-full w-full justify-center")}>
            <View style={{ elevation: 20 }}>
              <Card containerStyle={tailwind("rounded-lg bg-white opacity-100 mt-16")}>
                <ScrollView>
                  <View>
                    <View style={tailwind("mt-3 px-3")}>
                      <Text style={tailwind("text-base font-bold")}>
                        To reset your password, please insert your card no. and email. Your temporary password will be sent to your email.
                      </Text>
                    </View>
                    <View style={tailwind("mt-3 p-3 mb-5")}>
                      <Text style={tailwind("text-base")}>
                        *Please check the spam folder if you do not receive the email.
                      </Text>
                    </View>
                  </View>

                  {/* Attribute of Input Username and Email */}
                  <View style={tailwind('justify-center items-center')}>
                    {/* Attribute Insert Username */}
                    <View style={tailwind("w-11/12 justify-center items-center flex-row my-3")}>
                      <View style={{marginRight:5,justifyContent:"center" }}>
                        <Image
                          source={Images.card_membership}
                          style={{
                            tintColor: getColor('primary'),
                            backgroundColor: "white",
                            marginRight: 5, marginLeft: 2,
                            width: Metrics.icons.small * 2.5,
                            height: Metrics.icons.small * 2.5,
                            // marginRight: Metrics.smallPadding
                          }}
                        />
                      </View>
                      <View style={tailwind("flex-1")}>
                        <Input
                          label="Insert your Card No."
                          placeholder="Card No."
                          labelStyle={tailwind('text-secondary font-bold')}
                          autoCapitalize={"none"}
                          clearButtonMode={"while-editing"}
                          returnKeyType={"next"}
                          autoCorrect={false}
                          onChangeText={(value) => { this.setState({ nric: value, initScreenNric: false }) }}
                          onEndEditing={() => { this.onCheckNric(this.state.nric.length) }}
                          value={this.state.nric}
                          inputContainerStyle={tailwind("h-9")}
                          inputStyle={tailwind('text-primary')}
                        />
                      </View>
                    </View>

                    {/* Checking nric input */}
                    {
                      (!this.state.nric_verify)
                        ?
                        <View style={tailwind("w-11/12 justify-start items-center")}>
                          <View style={{ justifyContent: 'flex-start', alignSelf: "flex-start" }}>
                            <Text style={{ color: Colors.text_negative, marginBottom: Metrics.doubleBaseMargin }}>
                              You have entered invalid card no.
                            </Text>
                          </View>
                        </View>
                        :
                        <Text style={{ marginBottom: Metrics.doubleBaseMargin }}>{` `}</Text> // To maintain empty space in screen.
                    }

                    {/* Attribute Insert Email */}
                    <View style={tailwind("w-11/12 justify-center items-center flex-row my-3")}>
                      <View style={tailwind("justify-center mr-3")}>
                        <Icon
                          name='envelope'
                          type='font-awesome'
                          color={getColor('primary')}
                          onPress={() => console.log('hello')} 
                          size={40}
                          />
                      </View>
                      <View style={tailwind("flex-1")}>
                        <Input
                          label="Insert your email. "
                          placeholder="abc@gmail.com"
                          keyboardType={"email-address"}
                          labelStyle={tailwind('text-secondary font-bold')}
                          autoCapitalize={"none"}
                          clearButtonMode={"while-editing"}
                          returnKeyType={"next"}
                          inputRef={(input) => { this.emailInput = input }}
                          autoCorrect={false}
                          onChangeText={(value) => { this.setState({ email: value }) }}
                          onEndEditing={() => { this.onCheckEmail(this.state.email.length) }}
                          value={this.state.email}
                          inputContainerStyle={tailwind("h-9")}
                          inputStyle={tailwind('text-primary')}
                        />
                      </View>
                    </View>

                    {/* Checking Email input */}
                    {
                      (!this.state.email_verify)
                        ?
                        <View style={tailwind("w-11/12 justify-start items-center")}>
                          <View style={{ justifyContent: 'flex-start', alignSelf: "flex-start" }}>
                            <Text style={{ color: Colors.text_negative, marginBottom: Metrics.doubleBaseMargin }}>
                              You have entered invalid email.
                            </Text>
                          </View>
                        </View>
                        :
                        <Text style={{ marginBottom: Metrics.doubleBaseMargin }}>{` `}</Text> // To maintain empty space in screen.
                    }

                    {/* Attribute Login Button */}
                    <View style={tailwind("self-center w-11/12 my-3 ")}>
                      <View style={{ elevation: 20 }}>
                        <Button
                          buttonStyle={tailwind("rounded-lg bg-primary")}
                          title="SEND PASSWORD TO MY EMAIL"
                          titleStyle={tailwind("text-xl font-bold")}
                          onPress={
                            () => { this.handleForgetPasswordData(this.state.nric, this.state.email) }
                          }
                        />
                      </View>
                    </View>
                  </View>



                  {/* To text input avoid keyboard */}
                  {/* <View style={{marginBottom: Metrics.mainContainerMargin*2}}/>  */}
                </ScrollView>
              </Card>
            </View>
          </View>

        </KeyboardAvoidingView>

        {/* Loading Animation */}
        {this.handleRenderLoadingIndicator()}

      </SafeAreaView>

    );
  }
}
