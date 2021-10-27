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

/** REACT NATIVE ELEMENTS **/
import { Button, Input, Icon, Text, Card } from 'react-native-elements';

/** TAILWIND CSS **/
import { tailwind, getColor } from '../../../../tailwind';

/** PROJECT FILES **/
import {
  Colors, Fonts, Images, Metrics, ApplicationStyles,
  AppsButton, Divider, LoadingIndicator, Label,
} from '../../../Services/LibLinking';
import MemberController from '../Actions/member_controller';

/** NPM LIBRARIES **/
import { SafeAreaView } from 'react-navigation';
import { TextInput } from 'react-native-gesture-handler';


export default class EditView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      screenWidth: Dimensions.get('window').width,
      screenHeight: Dimensions.get('window').height,

      // Update data from server indiacator
      fetch_data: false,

      currentPassword: '',
      newPassword: '',
      reconfirmPassword: '',
      newEmail: '',
      authenticate: false,
      nric: '',
      edit: '',

      password_verify: true,
      initScreenPwd: true,
    }

    this.memberController = new MemberController();
  }

  /**Navigation Bottom Tab**/
  static navigationOptions = ({ navigation, navigationOptions }) => {
    const params = navigation.state.params || {};
    return {
      title: "Change Password",
      headerLeft: (
        <TouchableOpacity style={tailwind("bg-white rounded-lg opacity-100 p-2 ml-3 mt-3 justify-center items-center")}
          onPress={() => navigation.goBack()}>
          <Icon
            name='chevron-left'
            size={50}
            fontWeight="bold"
            type='evilicon'
            color='black'
          />
        </TouchableOpacity>
      ),

      headerRight: (
        <View style={{ width: Metrics.icons.medium, height: Metrics.icons.medium, paddingRight: 10 }}></View>
      ),
    };
  };
  /**End Navigation Bottom Tab**/

  componentDidMount() {
    var nric = this.props.navigation.getParam('nric');
    this.setState({
      nric: nric,
    })

    var edit = this.props.navigation.getParam('edit');
    this.setState({
      edit: edit,
    })
    // this.currentPasswordInput.focus();
  }

  reauthenticate(currentPassword) {
    this.handleFetchDataIndicator(true);
    var password = currentPassword;
    var auth = this.memberController.currentPasswordValidation(password)
    auth.then((res) => {
      if (res.result == 1) {
        this.setState({
          authenticate: true,
        })
      } else {
        Alert.alert(
          'Process Failed', 'Your password is incorect, please try again.',
          [{ text: 'OK', style: 'cancel' },],
          { cancelable: false }
        );
      }
      this.handleFetchDataIndicator(false);
    })
  }

  handleChangePassword(newPassword, reconfirmPassword) {
    this.handleFetchDataIndicator(true);
    var old_pass = this.state.currentPassword;
    if (newPassword == '' || reconfirmPassword == '') {
      this.setState({
        initScreenPwd: false,
        password_verify: false,
      })
    }
    // Check for the match new password and confirm password
    else if (newPassword != reconfirmPassword) {
      Alert.alert(
        'Process Failed', 'Password does not match.',
        [{ text: 'OK', style: 'cancel' },],
        { cancelable: false }
      )
    }
    // check for the new password and old password that must be different
    else if (old_pass == newPassword) {
      Alert.alert(
        'Process Failed', 'New password must be different from existing password.',
        [{ text: 'OK', style: 'cancel' },],
        { cancelable: false }
      )
    } else {
      var result = this.memberController.changePassword(old_pass, newPassword)
      result.then((res) => {
        if (res.result == 1) {
          Alert.alert(
            'Success', 'You have change a new password.',
            [{ text: 'OK', style: 'cancel' },],
            { cancelable: false }
          );
          this.props.navigation.navigate("ProfileScreen");
        } else {
          var error_msg = res.data.msg;
          Alert.alert(
            'Process Failed', error_msg,
            [{ text: 'OK', style: 'cancel' },],
            { cancelable: false }
          )
        }
      })
    }
    this.handleFetchDataIndicator(false);
  }

  // handle checking password lenght
  handleCheckingPassword(password_lenght) {
    this.handleFetchDataIndicator(true);
    if (password_lenght >= 6 && !this.state.newPassword.match(/(\W)/g)) {
      this.setState({
        password_verify: true
      });
      this.passwordReconfirmInput.focus()
    } else {
      this.setState({
        password_verify: false
      });
    }
    this.handleFetchDataIndicator(false);
  }

  changeEmail(currentPassword, newEmail) {

  }

  handleFetchDataIndicator(status) {
    this.setState({
      fetch_data: status
    })
  }

  // Loading Indicator
  handleRenderLoadingIndicator() {
    return (
      <LoadingIndicator
        visible={this.state.fetch_data}
        size={"large"}
        text={"Checking password..."}
      />
    )
  }

  render() {
    /** Local variable config **/
    var portrait = this.state.screenWidth < this.state.screenHeight
    /** End local variable config **/

    return (
      /**Start Safe Area**/
      <SafeAreaView style={ApplicationStyles.screen.safeAreaContainer} forceInset={{ vertical: 'never' }} >
        <View style={tailwind("flex-1 bg-gray-200")}>
          <ScrollView>
            <KeyboardAvoidingView behavior="padding" enableKeyboardAvoiding={Platform.OS === "ios" ? true : false}>
              <View style={tailwind("mt-16 pb-5")}>
                {/* some text */}
                <View style={tailwind("justify-center items-center m-4")}>
                  <Text style={tailwind("text-primaryBlue text-lg justify-center items-center")}>
                    To protect your account safety, please verify your password before proceed.
                  </Text>
                </View>

                {/* Current password */}
                <View style={tailwind("justify-center items-center m-3")}>
                  <Input
                    ref={(input) => { this.currentPasswordInput = input; }}
                    placeholder='Current Password'
                    placeholderTextColor={getColor("primary")}
                    secureTextEntry={true}
                    leftIcon={
                      <Icon
                        name='lock'
                        size={40}
                        color={getColor("primary")}
                        type='evilicon'
                      />
                    }
                    onChangeText={(value) => this.setState({ currentPassword: value })}
                    onSubmitEditing={() => { this.reauthenticate(this.state.currentPassword) }}
                    value={this.state.currentPassword}

                  />
                </View>

                <View style={tailwind("self-center w-full ")}>
                  <Button
                    containerStyle={tailwind("mx-5")}
                    buttonStyle={tailwind("rounded-lg bg-buttoncolor")}
                    title="CONFIRM PASSWORD"
                    titleStyle={tailwind("text-xl")}
                    onPress={
                      () => {
                        this.reauthenticate(this.state.currentPassword)
                      }}
                  />
                </View>
                <View>
                  {
                    (this.state.authenticate == true)
                      ?
                      <View style={[{ marginTop: Metrics.doubleBaseMargin * 2.5 }]}>

                        {/* Divider */}
                        <View style={[{ marginBottom: Metrics.doubleBaseMargin * 2 }]}>
                          <Divider
                            text={"NEW PASSWORD"}
                            textBold={true}
                            textColor={Colors.primary}
                            lineColor={getColor("primary")}
                          />
                        </View>

                        {
                          (this.state.edit == 2)

                            ?

                            <View>
                              {/* new password */}
                              {
                                (!this.state.password_verify)
                                  ?
                                  <View style={tailwind("justify-center items-center m-3")}>
                                    <Input
                                      placeholder='New Password'
                                      placeholderTextColor={getColor("primary")}
                                      autoCapitalize={"none"}
                                      clearButtonMode={"while-editing"}
                                      returnKeyType={"go"}
                                      autoCorrect={false}
                                      secureTextEntry={true}
                                      onChangeText={(value) => this.setState({ newPassword: value, initScreenPwd: false })}
                                      value={this.state.newPassword}
                                      onEndEditing={() => { this.handleCheckingPassword(this.state.newPassword.length) }}

                                    />
                                  </View>
                                  :
                                  <View style={tailwind("justify-center items-center m-3")}>
                                    <Input
                                      placeholder='New Password'
                                      placeholderTextColor={getColor("primary")}
                                      autoCapitalize={"none"}
                                      clearButtonMode={"while-editing"}
                                      returnKeyType={"go"}
                                      autoCorrect={false}
                                      secureTextEntry={true}
                                      onChangeText={(value) => this.setState({ newPassword: value, initScreenPwd: false })}
                                      value={this.state.newPassword}
                                      onEndEditing={() => { this.handleCheckingPassword(this.state.newPassword.length) }}

                                    />
                                  </View>
                              }
                              {
                                (!this.state.initScreenPwd)
                                  ?
                                  (this.state.newPassword.length >= 6 && !this.state.newPassword.match(/(\W)/g))
                                    ?
                                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
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
                                      <Text style={{ color: Colors.text_positive, marginBottom: Metrics.baseMargin }}>
                                        Valid password format.
                                      </Text>
                                    </View>
                                    :
                                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
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
                                      <Text style={{ color: Colors.text_negative, marginBottom: Metrics.baseMargin }}>
                                        Invalid password format.
                                      </Text>
                                    </View>
                                  :
                                  <View />
                              }

                              {/* Password remarks */}
                              <View style={tailwind("px-5 py-2")}>
                                <Text style={tailwind("text-lg text-base text-primaryBlue")}>
                                  *Minimum 6 characters
                                </Text>
                                <Text style={tailwind("text-lg text-base text-primaryBlue")}>
                                  *Alphanumeric (A-z, 0-9)
                                </Text>
                              </View>

                              {/* reconfirm password */}
                              <View style={tailwind("justify-center items-center m-3")}>
                                <Input
                                  placeholder='Re-confirm Password'
                                  placeholderTextColor={getColor("primary")}
                                  autoCapitalize={"none"}
                                  clearButtonMode={"while-editing"}
                                  ref={(input) => { this.passwordReconfirmInput = input }}
                                  returnKeyType={"go"}
                                  autoCorrect={false}
                                  secureTextEntry={true}
                                  onChangeText={(value) => this.setState({ reconfirmPassword: value })}
                                  value={this.state.reconfirmPassword}
                                  onSubmitEditing={
                                    () => {
                                      this.handleChangePassword(this.state.newPassword, this.state.reconfirmPassword)
                                    }}
                                />
                              </View>

                              {/* Confirm */}
                              <View>
                                {
                                  (this.state.newPassword == this.state.reconfirmPassword)
                                    ?

                                    <View style={tailwind("self-center w-full ")}>
                                      <Button
                                        containerStyle={tailwind("mx-5")}
                                        buttonStyle={tailwind("rounded-lg bg-buttoncolor")}
                                        title="CHANGE PASSWORD"
                                        titleStyle={tailwind("text-xl")}
                                        onPress={() => { this.handleChangePassword(this.state.newPassword, this.state.reconfirmPassword) }}
                                      />
                                    </View>
                                    :
                                    <Label style={{ color: Colors.text_negative }}>
                                      Password does not match.
                                    </Label>

                                }
                              </View>
                            </View>

                            :

                            <View>
                              {/* new email */}
                              <View style={{ marginVertical: Metrics.baseMargin * 2 }}>
                                <TextInput
                                  placeholder={"New Email"}
                                  style={{ borderBottomWidth: 1, borderColor: Colors.primary, padding: Metrics.smallPadding }}
                                  onChangeText={(value) => this.setState({ newEmail: value })}
                                  value={this.state.newEmail}
                                />
                              </View>

                              {/* reconfirm password */}
                              <View style={{ marginVertical: Metrics.baseMargin * 2 }}>
                                <TextInput
                                  placeholder={"Re-confirm Password"}
                                  style={{ borderBottomWidth: 1, borderColor: Colors.primary, padding: Metrics.smallPadding }}
                                  onChangeText={(reconfirmPassword) => this.setState({ reconfirmPassword })}
                                  value={this.state.reconfirmPassword}
                                />
                              </View>

                              {/* Confirm */}
                              <AppsButton
                                onPress={() => { this.changeEmail(this.state.newEmail) }}
                                backgroundColor={Colors.primary}
                                text={"CHANGE EMAIL"}
                                fontSize={14}
                              />
                            </View>
                        }
                      </View>
                      :
                      <View></View>
                  }
                </View>

              </View>
            </KeyboardAvoidingView>

            {/* Loading Animation */}
            {this.handleRenderLoadingIndicator()}

          </ScrollView>
        </View>
      </SafeAreaView>
    )
  }
}