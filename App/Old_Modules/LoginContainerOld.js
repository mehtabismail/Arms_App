/** REACT NATIVE **/
import React from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  Text, TouchableOpacity,
  View,
} from 'react-native';

/** PROJECT FILES **/
import { 
  Colors, Fonts, Images, Metrics, ApplicationStyles,
  ARMSTextInput, AppsButton, LoadingIndicator, Label, AdsBanner,
  I18n,
  AppConfig,
} from '../Services/LibLinking';
import LoginController from "../Modules/General/Login/Actions/login_controller.js";
import styles from '../Modules/General/Login/Styles/LoginStyles';

/** NPM LIBRARIES **/
import NetInfo from "@react-native-community/netinfo";
import { SafeAreaView, StackActions, NavigationActions } from 'react-navigation';

const ads_banner_path = AppConfig.ads_banner_login_scn_path;
const ads_screen_id = AppConfig.ads_login_screen_id;

export default class LoginView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      nric: "",
      password: "",
      email_verify: true,
      password_verify: true,
      login_trial: 0,
      company_logo_path: AppConfig.company_logo_default,

      // Fetch data from server indiacator
      fetch_data: false,
      disabled: false,

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
      title: ' Login ',
      headerLeft: (
        <View style={{width: Metrics.icons.medium, height: Metrics.icons.medium, paddingRight: 10}}></View>
      ),
      headerRight: (
        <TouchableOpacity style={{paddingRight: 10}} onPress={() => navigation.navigate(prev_screen, {})}>
          <Image
            style={{width: Metrics.icons.medium, height: Metrics.icons.medium, tintColor: Colors.secondary}} 
            source={Images.round_cancel}/>
        </TouchableOpacity> 
      ),
    };
  };
  /**End Navigation Bottom Tab**/

  componentWillMount() {
    /** Company Logo Show Check **/
    this.handleLoadCompanyLogo();

    /**
     * Get params prev screen
     */
    var prev_screen = this.props.navigation.getParam("prev_screen", "DashboardScreen");
    this.setState({ prev_screen });
  }

  componentWillUnmount() {
  }
  
  handleNavigationToScreen(routeName, params){
    // if ( NavigationActions.focused == false ){
      const navigateAction = StackActions.replace({
        routeName: route,
        params: params,
        action: NavigationActions.navigate({ routeName: routeName, params: params }),
      });
      props.navigation.dispatch(navigateAction);
    // }
  }

  // Function to handle login data
  handleLoginData(nric, password) {
    var count = this.state.login_trial + 1;
    this.setState({
      login_trial: count
    })
    if(count < 4) {
      this.handleFetchDataIndicator(true);
      if(nric == '' || password == '') {
        if(nric == '') {
          this.setState({
            email_verify: false,
          })
        }
        
        if (password == '') {
          this.setState({
            password_verify: false,
          })
        }
      } else {
        var result = this.loginController.fetchLoginData(nric, password);
        result.then((res)=>{
          if(res.result == 1){
            this.props.navigation.navigate(this.state.prev_screen, {loginUpdate: true});
          } else {
            Alert.alert(
              'Login Failed', 'Your password and/or email are incorect, please try again.',
              [ {text: 'OK', style: 'cancel'}, ],
              { cancelable: false }
            ) 
          }
        })
      } 
    } else {
        Alert.alert(
          'Login Failed', 'Your username or password does not match with our record. Try again or select "Forget Password".',
          [ {text: 'OK', style: 'cancel'}, ],
          { cancelable: false }
        )
      }
      this.handleFetchDataIndicator(false);
  }

  // handle checking email input
  handleCheckingEmail(email_lenght) { 
    this.handleFetchDataIndicator(true); 
    if(email_lenght){
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

  // handle checking password input
  handleCheckingPassword(password_lenght) { 
    this.handleFetchDataIndicator(true); 
    if(password_lenght){
      this.setState({
        password_verify: true
      });
      this.handleLoginData(this.state.nric, this.state.password);
    } else {
      this.setState({
        password_verify: false
      });
    }
    this.handleFetchDataIndicator(false); 
  }

  handleFetchDataIndicator(status){
    this.setState({
      fetch_data: status,
      disabled: status,
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
      <SafeAreaView style={ApplicationStyles.screen.safeAreaContainer} forceInset={{vertical:'never'}} >

        {/* Ads Banner Display */}
        {/* <View style={[ApplicationStyles.screen.headerContainer, {marginBottom: Metrics.doubleBaseMargin}]} >
          <AdsBanner 
            dataFolderPath={ads_banner_path}
            screenId={ads_screen_id}
            imgResizeMode={'stretch'}
            height={Metrics.headerContainerHeight}
            arrowSize={0}
            onPress={(data)=>{
              var url = data.image.link;
              if(url && url != "undefined"){
                url = (url.substring(0,8)=="https://" || url.substring(0,7)=="http://")?url:`http://${url}`;
                Linking.openURL(url);
              } else {
                Alert.alert("", I18n.t("alert_banner_empty_weblink"));
              }
            }}
            onRefresh={this.state.fetch_data}
          />
        </View> */}

        {/* Content */}
        <ScrollView> 
          {/* Start Main View */}
          <KeyboardAvoidingView behavior="padding" enableKeyboardAvoiding={Platform.OS === "ios" ? true : false} >
            <View style={[
              ApplicationStyles.screen.mainContainer,{
                paddingHorizontal: Metrics.basePadding, 
                marginTop: Metrics.baseMargin}
            ]} >

              {/* Start Welcome Text */}
              <View style={{alignItems: 'center', flex: 1, justifyContent: 'center'}}>
                <Text style={{
                  marginBottom: Metrics.baseMargin, 
                  flex: 1, 
                  textAlign: 'center', 
                  fontSize: Fonts.size.h6,
                  color: Colors.primary,
                }}>
                  {`Welcome To ${AppConfig.app_display_name}`}
                </Text>
                <Image 
                  source={this.state.company_logo_path}
                  style={{
                    width: Metrics.images.armsLogo, 
                    height: Metrics.images.armsLogo, 
                    marginBottom: Metrics.baseMargin, 
                    resizeMode: 'contain' 
                  }}
                />
              </View>

              {/* Attribute of Input Username & Password */}
              <View style={[styles.formContainer]}>

                {/* Attribute Insert Username */}
                {
                  (!this.state.email_verify)
                  ?
                  <View style={[styles.attrRowContainer, {marginBottom: Metrics.smallMargin}]}>
                    <ARMSTextInput
                      inlineLeftImage={Images.face}
                      leftImageColor={Colors.text_color_2}
                      borderColor={Colors.text_negative}
                      placeholder={"Email / NRIC / Card No."} 
                      keyboardType={"email-address"}
                      autoCapitalize={"none"}
                      clearButtonMode={"while-editing"}
                      returnKeyType={"next"}
                      autoCorrect={false}
                      // helperText={"E.g. 96........01 (without '-' )"}
                      helperTextColor={Colors.text_negative}
                      onChangeText={(value) => {this.setState({nric: value})}}
                      onEndEditing={() => {this.handleCheckingEmail(this.state.nric.length)}}
                      value={this.state.nric}
                    />
                  </View>
                  :
                  <View style={styles.attrRowContainer}>
                    <ARMSTextInput
                      inlineLeftImage={Images.face}
                      // leftImageColor={Colors.primary}
                      placeholder={"Email / NRIC / Card No."} 
                      keyboardType={"email-address"}
                      autoCapitalize={"none"}
                      clearButtonMode={"while-editing"}
                      returnKeyType={"next"}
                      autoCorrect={false}
                      helperText={"E.g. 96........01 (without '-' )"}
                      helperTextColor={Colors.primary}
                      onChangeText={(value) => {this.setState({nric: value})}}
                      onEndEditing={() => {this.handleCheckingEmail(this.state.nric.length)}}
                      value={this.state.nric}
                    />
                  </View>
                }

                {/* Checking Email input */}
                {
                  (!this.state.email_verify)
                  ?
                  <View style={{justifyContent: 'flex-start'}}>
                    <Text style={{color: Colors.text_negative, marginBottom: Metrics.doubleBaseMargin}}>
                      You have entered invalid login.
                    </Text>
                  </View>
                  :
                  <View/>
                }

                {/* Attribute Access Password */}
                {
                  (!this.state.password_verify)
                  ?
                  <View style={[styles.attrRowContainer, {marginBottom: Metrics.smallMargin}]}>
                    <ARMSTextInput
                      editable={true}
                      inlineLeftImage={Images.lock} 
                      leftImageColor={Colors.text_color_2}
                      borderColor={Colors.text_negative}
                      placeholder={"Password"}
                      autoCapitalize={"none"}
                      clearButtonMode={"while-editing"}
                      returnKeyType={"go"}
                      inputRef={(input) => {this.passwordInput = input}}
                      secureTextEntry={true}
                      // helperText={"E.g. 12bd8g"}
                      helperTextColor={Colors.text_negative}
                      onChangeText={(value) => {this.setState({password: value})}}
                      onEndEditing={() => {this.handleCheckingPassword(this.state.password.length)}}
                      value={this.state.password}
                    />
                  </View>
                  :
                  <View style={styles.attrRowContainer}>
                    <ARMSTextInput
                      editable={true}
                      inlineLeftImage={Images.lock} 
                      // leftImageColor={Colors.primary}
                      placeholder={"Password"}
                      autoCapitalize={"none"}
                      clearButtonMode={"while-editing"}
                      returnKeyType={"go"}
                      inputRef={(input) => {this.passwordInput = input}}
                      secureTextEntry={true}
                      helperText={"E.g. 12bd8g"}
                      helperTextColor={Colors.primary}
                      onChangeText={(value) => {this.setState({password: value})}}
                      onEndEditing={() => {this.handleCheckingPassword(this.state.password.length)}}
                      value={this.state.password}
                    />
                  </View>
                }

                {/* Checking Password input */}
                {
                  (!this.state.password_verify)
                  ?
                  <View style={{justifyContent: 'flex-start'}}>
                    <Text style={{color: Colors.text_negative, marginBottom: Metrics.doubleBaseMargin}}>
                      You have entered invalid password.
                    </Text>
                  </View>
                  :
                  <View/>
                }

              </View>

              {/* Attribute Login Button */}
              <View style={{width: '100%', marginBottom: Metrics.smallMargin, marginTop: 25}}>
                <AppsButton 
                  onPress={() => {this.handleLoginData(this.state.nric, this.state.password)}}
                  backgroundColor={Colors.primary}
                  text={"LOGIN"}
                  fontSize={20}
                  disabled={this.state.disabled}
                />
              </View>

              {/* Attribute Register Button */}
              <View style={{width: '100%', marginVertical: Metrics.baseMargin}}>
                <AppsButton 
                  onPress={() => {this.props.navigation.navigate("RegisterScreen", {})}}
                  backgroundColor={Colors.secondary}
                  text={"REGISTER"}
                  fontSize={20}
                  color={Colors.primary}
                />
              </View>

              {/* Attribute Forget Password */}
              <View style={{width: '100%', marginVertical: Metrics.baseMargin}}>
                <TouchableOpacity onPress={() => {this.props.navigation.navigate("ForgetPasswordScreen", {})}}>
                  <Text style={{
                    textAlign: 'center', 
                    color: Colors.primary, 
                    fontWeight: '500'
                  }}>
                    Forget Password?
                  </Text>
                </TouchableOpacity>
              </View>              

            </View> 
          </KeyboardAvoidingView>

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
              <LoadingIndicator size={"large"} text={"Fetching data..."}/>
            </View>
            :
            <View />
          }
        
        </ScrollView>   
                      
      </SafeAreaView>

    );
  }
}
