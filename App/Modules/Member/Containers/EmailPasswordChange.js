/** REACT NATIVE **/
import React from 'react';
import {
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text, TouchableOpacity,
  View,
} from 'react-native';

/** PROJECT FILES **/
import { 
  Colors, Fonts, Images, Metrics, ApplicationStyles,
  AppsButton, Divider, LoadingIndicator, Label,
} from '../../../Services/LibLinking';
import MemberController from '../Actions/member_controller';

/** NPM LIBRARIES **/
import {SafeAreaView} from 'react-navigation';
import { TextInput } from 'react-native-gesture-handler';


export default class EditView extends React.Component {
  constructor(props){
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
  static navigationOptions = ({navigation, navigationOptions}) => {
    const params = navigation.state.params || {};
    return {
        title: '',
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
      if(res.result == 1) {
        this.setState({
          authenticate: true,
        })
      } else {
        Alert.alert(
          'Process Failed', 'Your password is incorect, please try again.',
          [ {text: 'OK', style: 'cancel'}, ],
          { cancelable: false }
        );  
      }
      this.handleFetchDataIndicator(false);
    }) 
  }

  handleChangePassword(newPassword, reconfirmPassword) {
    this.handleFetchDataIndicator(true);
    var old_pass = this.state.currentPassword;
    if(newPassword == '' || reconfirmPassword == '') {
      this.setState({
        initScreenPwd: false,
        password_verify: false,
      })
    }
    // Check for the match new password and confirm password
    else if(newPassword != reconfirmPassword) {
      Alert.alert(
        'Process Failed', 'Password does not match.',
        [ {text: 'OK', style: 'cancel'}, ],
        { cancelable: false }
      )
    } 
    // check for the new password and old password that must be different
    else if(old_pass == newPassword){
      Alert.alert(
        'Process Failed', 'New password must be different from existing password.',
        [ {text: 'OK', style: 'cancel'}, ],
        { cancelable: false }
      )
    } else {
      var result = this.memberController.changePassword(old_pass, newPassword)
      result.then((res)=>{
        if(res.result == 1){  
          Alert.alert(
            'Success', 'You have change a new password.',
            [ {text: 'OK', style: 'cancel'}, ],
            { cancelable: false }
          ); 
          this.props.navigation.navigate("ProfileScreen");
        } else {
          var error_msg = res.data.msg;
          Alert.alert(
            'Process Failed', error_msg,
            [ {text: 'OK', style: 'cancel'}, ],
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
    if( password_lenght >= 6 && !this.state.newPassword.match(/(\W)/g)){
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
      <SafeAreaView style={ApplicationStyles.screen.safeAreaContainer} forceInset={{vertical:'never'}} >

        <ScrollView>
          <KeyboardAvoidingView behavior="padding" enableKeyboardAvoiding={Platform.OS === "ios" ? true : false}>
            <View style={ApplicationStyles.screen.mainContainer}>
              <View style={{margin: Metrics.baseMargin * 3}}>
                {/* some text */}
                <Text style={{
                  color: Colors.primary, 
                  fontWeight: 'bold',
                  fontSize: Fonts.size.regular,
                }}>
                  To protect your account safety, please verify your password before proceed.
                </Text>

                {/* Current password */}
                <View style={{marginVertical: Metrics.baseMargin * 3}}>
                  <TextInput
                    ref={(input) => {this.currentPasswordInput = input;}}
                    placeholder={"Current Password"}
                    placeholderTextColor={Colors.primary}
                    style={{
                      borderBottomWidth: 1, 
                      borderColor: Colors.primary, 
                      padding: Metrics.smallPadding,
                      color: Colors.primary,
                    }}
                    secureTextEntry={true}
                    onChangeText={(value) => this.setState({currentPassword: value})}
                    onSubmitEditing={() => {this.reauthenticate(this.state.currentPassword)}}
                    value={this.state.currentPassword}
                  />
                </View>

                <TouchableOpacity 
                  onPress={() => {this.reauthenticate(this.state.currentPassword)}}
                  style={{paddingVertical: Metrics.basePadding, borderColor: Colors.primary, borderWidth: 1}}
                >
                  <Text style={{
                    textAlign: 'center', 
                    fontWeight: 'bold',
                    fontSize: Fonts.size.regular, 
                    color: Colors.primary
                  }}>
                    CONFIRM PASSWORD
                  </Text>
                </TouchableOpacity>                

                {
                  (this.state.authenticate == true)
                  ?
                  <View style={[{marginTop: Metrics.doubleBaseMargin*3}]}>

                    {/* Divider */}
                    <View style={{}}>
                      <Divider 
                        text={"NEW PASSWORD"} 
                        textBold={true}
                        textColor={Colors.primary}
                        lineColor={Colors.primary}
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
                        <View style={{marginVertical: Metrics.baseMargin * 2}}>
                          <TextInput
                            placeholder={"New Password"}
                            placeholderTextColor={Colors.text_color_2}
                            style={{
                              borderBottomWidth: 1, 
                              borderColor: Colors.text_negative, 
                              padding: Metrics.smallPadding,
                              color: Colors.text_negative,
                            }}
                            autoCapitalize={"none"}
                            clearButtonMode={"while-editing"}
                            returnKeyType={"go"}
                            autoCorrect={false}
                            secureTextEntry={true}
                            onChangeText={(value) => this.setState({newPassword: value, initScreenPwd: false})}
                            value={this.state.newPassword}
                            onEndEditing={() => {this.handleCheckingPassword(this.state.newPassword.length)}}
                          />
                        </View>
                        :
                        <View style={{marginVertical: Metrics.baseMargin * 2}}>
                          <TextInput
                            placeholder={"New Password"}
                            placeholderTextColor={Colors.primary}
                            style={{
                              borderBottomWidth: 1, 
                              borderColor: Colors.primary, 
                              padding: Metrics.smallPadding,
                              color: Colors.primary,
                            }}
                            autoCapitalize={"none"}
                            clearButtonMode={"while-editing"}
                            returnKeyType={"go"}
                            autoCorrect={false}
                            secureTextEntry={true}
                            onChangeText={(value) => this.setState({newPassword: value, initScreenPwd: false})}
                            value={this.state.newPassword}
                            onEndEditing={() => {this.handleCheckingPassword(this.state.newPassword.length)}}
                          />
                        </View>
                      }
                      {
                        (!this.state.initScreenPwd)
                        ?
                          (this.state.newPassword.length >= 6 && !this.state.newPassword.match(/(\W)/g))
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
                        <Text style={{fontSize: Fonts.size.medium, color: Colors.text_color_2, marginBottom: Metrics.smallMargin, marginTop: Metrics.doubleBaseMargin}}>
                          *Minimum 6 characters
                        </Text>
                        <Text style={{fontSize: Fonts.size.medium, color: Colors.text_color_2, marginBottom: Metrics.doubleBaseMargin}}>
                          *Alphanumeric (A-z, 0-9)
                        </Text>
                      </View>
              
                      {/* reconfirm password */}
                      <View style={{marginVertical: Metrics.baseMargin * 2}}>
                        <TextInput
                          placeholder={"Re-confirm Password"}
                          placeholderTextColor={Colors.primary}
                          style={{
                            borderBottomWidth: 1, 
                            borderColor: Colors.primary, 
                            padding: Metrics.smallPadding,
                            color: Colors.primary,
                          }}
                          autoCapitalize={"none"}
                          clearButtonMode={"while-editing"}
                          ref={(input) => {this.passwordReconfirmInput = input}}
                          returnKeyType={"go"}
                          autoCorrect={false}
                          secureTextEntry={true}
                          onChangeText={(value) => this.setState({reconfirmPassword :value})}
                          value={this.state.reconfirmPassword}               
                          onSubmitEditing={() => {this.handleChangePassword(this.state.newPassword, this.state.reconfirmPassword)}}
                        />
                      </View>

                      {/* Confirm */}
                      <View>
                      {
                        (this.state.newPassword == this.state.reconfirmPassword)
                        ?
                        <AppsButton 
                          onPress={() => {this.handleChangePassword(this.state.newPassword, this.state.reconfirmPassword)}}
                          backgroundColor={Colors.primary}
                          text={"CHANGE PASSWORD"}
                          fontSize={20}
                        /> 
                        :
                        <Label style={{color: Colors.text_negative}}>
                          Password does not match.
                        </Label>
                      }
                      </View>
                    </View>
        
                    :
        
                    <View>
                      {/* new email */}
                      <View style={{marginVertical: Metrics.baseMargin * 2}}>
                        <TextInput
                          placeholder={"New Email"}
                          style={{borderBottomWidth: 1, borderColor: Colors.primary, padding: Metrics.smallPadding}}
                          onChangeText={(value) => this.setState({newEmail: value})}
                          value={this.state.newEmail}
                        />
                      </View>
        
                      {/* reconfirm password */}
                      <View style={{marginVertical: Metrics.baseMargin * 2}}>
                        <TextInput
                          placeholder={"Re-confirm Password"}
                          style={{borderBottomWidth: 1, borderColor: Colors.primary, padding: Metrics.smallPadding}}
                          onChangeText={(reconfirmPassword) => this.setState({reconfirmPassword})}
                          value={this.state.reconfirmPassword}
                        />
                      </View>
                      
                      {/* Confirm */}
                      <AppsButton 
                        onPress={() => {this.changeEmail(this.state.newEmail)}}
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

      </SafeAreaView>
    ) 
  }
}