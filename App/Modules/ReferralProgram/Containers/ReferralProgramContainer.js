/** REACT NATIVE **/
import React from 'react';
import {
  Alert, Animated,
  Dimensions,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';

/** PROJECT FILES **/
import { 
  Colors, Fonts, Images, Metrics, ApplicationStyles,
  LoadingIndicator, Label, ARMSTextInput, AppsButton
} from '../../../Services/LibLinking';
import LoginController from '../../General/Login/Actions/login_controller';
import ReferralProgramController from '../Actions/ReferralProgramController';

/** NPM LIBRARIES **/
import { NavigationActions, DrawerActions, SafeAreaView } from 'react-navigation';
import QRCode from 'react-native-qrcode-svg';

export default class ReferralProgramView extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      screenWidth: Dimensions.get('window').width,
      screenHeight: Dimensions.get('window').height,

      // Fetch data from server indicator
      fetch_data: false,
      firstLoad: true,

      // Member Data
      nric: '',

      // Referral data
      referralCode: '12WJID9234',
      referBy: '',

      // Referrer Submission Allow Status 
      submit_disabled: false,

      // Loading Indicator Text
      loading_indicator_text: "Fetching data...",

      flatListRentalTrigger: false,

    }

    // Create controller object
    this.loginController = new LoginController();
    this.referralProgramController = new ReferralProgramController();
  }

  /****************************************************************/
  /************************ HEADER ********************************/
  /****************************************************************/

  // Navigation Tab
  static navigationOptions = ({navigation, navigationOptions}) => {
    const params = navigation.state.params || {};
    var navigateToScreen = params.this;

    return {
      title: 'Referral Program',
      headerLeft: (
        <TouchableOpacity style={{paddingLeft: 10}} onPress={() => navigateToScreen(navigation, {loginUpdate: true})}>
          <Image
            style={{width: Metrics.icons.medium, height: Metrics.icons.medium, tintColor: Colors.secondary}} 
            source={Images.menu}/>
        </TouchableOpacity>
      ),
      headerRight: (
        <View style={{width: Metrics.icons.medium, height: Metrics.icons.medium, paddingRight: 10}}></View>
      ),
    }
  }

  // Navigate Function To Open Drawer
  navigateToScreen = (navigation, params = "") => {
    const navigateAction = NavigationActions.navigate({
      routeName: "DrawerStack",
      params: params,
    });
    
    navigation.dispatch(navigateAction);
    navigation.dispatch(DrawerActions.openDrawer());
  }

  /****************************************************************/
  /*********************** COMPONENT  *****************************/
  /****************************************************************/

  componentDidMount() {
    this.props.navigation.setParams({this: this.navigateToScreen});
  }

  componentWillUnmount() {
  }

  componentDidUpdate(prevProps){
    /**
     * Login Update
     */
    var loginUpdate = this.props.navigation.getParam('loginUpdate', false);
    if(loginUpdate && this.props.navigation != prevProps.navigation){
      this.props.navigation.setParams({loginUpdate: false});
      this.handleLoginUpdate();
    }
  }

  handleFetchDataIndicator(status, text){
    this.setState({
      fetch_data: status,
      loading_indicator_text: text ? text : 'Fetching data...'
    })
  }

  /****************************************************************/
  /******************** FUNCTIONALITY *****************************/
  /****************************************************************/

  async handleLoginUpdate(){
    var nric = '';
    var login_user = await this.loginController.fetchCurrentLoginMember();
    if(login_user.result == 1 && login_user.data){
      nric = login_user.data.nric;
    }
    this.handleSetNRIC(nric);
  }

  handleSetNRIC(nric){
    this.setState({nric, firstLoad: false}, ()=>{
      if(nric){
        this.handleGetReferralProgramData(nric);
      }
    });
  }

  handleGetReferralProgramData(nric){
    this.handleFetchDataIndicator(true);
    var fetch_data_res = this.referralProgramController.initScreen(nric);
    fetch_data_res.then((res) => {
      if(res.result == 1){
        if(res.data){
          if(res.data.referral_code){
            this.setState({
              firstLoad: false,
              referralCode: res.data.referral_code ? res.data.referral_code : '',
              referBy: res.data.refer_by_referral_code ? res.data.refer_by_referral_code : '',
              submit_disabled: res.data.refer_by_referral_code ? true : false,
            }) 
          } else {
            this.setState({firstLoad: true});
            Alert.alert("Error", "Cannot find Referral Code. Please contact our customer service to help you.");
          }
        } else {
          this.setState({firstLoad: true});
          Alert.alert("Error", "No Data Retrieve. Please contact our customer service to help you.");
        }
      } else {
        this.setState({firstLoad: true});
        Alert.alert("Error", `No Data Retrieve. Please contact our customer service to help you. (${res.data.msg})`);
      }
      this.handleFetchDataIndicator(false);
    })
  }

  handleSubmitReferrerCode(referrer_code, nric){
    if(referrer_code){
      if(referrer_code == this.state.referralCode){
        Alert.alert("Error", "Referrer's Code cannot same with your own Referral Code.");
      } else {
        this.handleFetchDataIndicator(true, "Submitting...");
        var submit_res = this.referralProgramController.submitReferrerCodeToServer(referrer_code, nric);
        submit_res.then((res) => {
          if(res.result == 1){
            Alert.alert("Successful", "You have submitted the referrer code.");
            this.setState({
              submit_disabled: true
            })
          } else {
            Alert.alert("Submit Failed", res.data.msg);
          }
          this.handleFetchDataIndicator(false);
        })
      }
    } else {
      Alert.alert("Error", "Please enter your referrer's code.");
    }
  }

  /****************************************************************/
  /******************** SCREEN RENDERING **************************/
  /****************************************************************/

  // Loading Indicator
  handleRenderLoadingIndicator(){
    return(
      <LoadingIndicator 
        visible={this.state.fetch_data}
        size={"large"} 
        text={`${this.state.loading_indicator_text}`}
      />
    )
  }

  // Render Referral Program Data
  handleRenderReferralProgramData(){
    return(
      this.state.fetch_data
      ?
      <View/>
      :
      <ScrollView>
        <View style={[{alignItems: 'center', justifyContent: 'space-between', flex: 1}]}>
          {/* Referral Part */}
          <View style={{
            alignItems: 'center',
            width: '100%', height: Dimensions.get("screen").height * 0.4,
            padding: Metrics.basePadding
          }}>
            {/* Referral Code Label */}
            <Label text={`Referral Code`} style={{fontSize: Fonts.size.h5, color: Colors.text_color_3}} />
            
            {/* Referral Code Data */}
            <Label 
              text={`${this.state.referralCode}`} 
              style={{
                fontSize: Fonts.size.h3, 
                fontWeight: 'bold', 
                color: Colors.text_color_3,
                marginTop: Metrics.baseMargin
              }} 
              selectable={true} 
            />

            {/* Referral Code Desc */}
            <Label 
              text={`Earn rewards? Invite your family and friends to join as our member with this Referral Code. T&C Applied.`} 
              style={{
                fontSize: Fonts.size.regular, 
                color: Colors.text_color_3,
                textAlign: 'center'
              }}
            />

            {/* QRCode */}
            {/* <View style={{
                ...ApplicationStyles.screen.test, 
                alignItems: 'center', 
                padding: Metrics.basePadding,
                borderRadius: 20,
                backgroundColor: "#FFFFFF",
                marginVertical: Metrics.marginVertical, 
                overflow:'hidden'
            }}>
              <QRCode
                value={`${this.state.referralCode}`}
                size={Dimensions.get("screen").height * 0.2}
                bgColor='black'
                fgColor='white'
              />
            </View> */}
          </View>

          {/* Referrer Part */}
          <View style={{
            backgroundColor: Colors.background, 
            width: '100%', height: Dimensions.get("screen").height * 0.5,
            borderRadius: 20, 
            alignItems: 'center', justifyContent: 'space-around',
            paddingVertical: Metrics.doubleBasePadding,
          }}>
          
            {/* Referrer Code Title */}
            <Label text={`Enter Referrer's Code`} style={{fontSize: Fonts.size.h5, fontWeight: 'bold', color: Colors.text_color_1}} />

            {/* Referrer Code Input */}
            <View style={{width: '80%', height: 100}}>
              <ARMSTextInput
                inlineLeftImage={Images.two_people}
                leftImageColor={Colors.text_color_1}
                borderColor={Colors.text_color_1}
                placeholder={"Enter referral code here"}
                autoCapitalize={"none"}
                autoCorrect={false}
                helperText={"E.g. 12WDIW382"}
                helperTextColor={Colors.text_color_1}
                editable={!this.state.submit_disabled}
                onChangeText={(value) => {this.setState({referBy: value})}}
                onSubmitEditing={() => {this.handleSubmitReferrerCode(this.state.referBy, this.state.nric)}}
                value={this.state.referBy}
                
              />
            </View>

            {/* Submit Button */}
            <View style={{width: '80%'}}>
              <AppsButton 
                onPress={() => {this.handleSubmitReferrerCode(this.state.referBy, this.state.nric)}}
                backgroundColor={Colors.primary}
                text={"SUBMIT"}
                fontSize={20}
                disabled={this.state.submit_disabled}
              />
            </View>

          </View>
        </View>
      </ScrollView>
    )
  }

  // Empty list screen
  handleRenderEmptyDataScreen(){
    return(
      <View style={[ApplicationStyles.screen.mainContainer, {justifyContent: 'center', flex: 0, height: '100%', paddingBottom: 150}]}>
        <SpringAnimation>
          <Image
            source={Images.shock}
            resizeMode={'contain'}
            style={{
              // tintColor: 'transparent',
              width: Metrics.images.xxLarge,
              height: Metrics.images.xxLarge,
              marginBottom: Metrics.doubleBaseMargin,
            }}
          />
        </SpringAnimation>
        <Label> . . . . . </Label>
        <Label style={{color: Colors.primary}}>Oops! No noticement available yet.</Label>
      </View>
    )
  }

  // Access Login Screen
  handleRenderAccessLoginScreen(){
    return(
      <View style={{...ApplicationStyles.screen.testContainer,}}>
        <View style={{width: '100%', justifyContent: 'center', padding: Metrics.basePadding, backgroundColor: Colors.body}}>
          <Label style={{marginBottom: Metrics.baseMargin*6}}>Come and join us to get your discount vouchers and many more great deals.</Label>
          <AppsButton 
            onPress={() => {this.props.navigation.navigate("LandingScreen", {prev_screen: this.props.navigation.state.routeName})}}
            backgroundColor={Colors.primary}
            text={"LOGIN / REGISTER"}
            fontSize={20}
          />
        </View>
      </View>
    )
  }

  render() {
    return (
      /**Start Safe Area**/
      <SafeAreaView style={[ApplicationStyles.screen.safeAreaContainer, {backgroundColor: Colors.primary}]} forceInset={{vertical:'never', }} >
        
        <KeyboardAvoidingView behavior="padding" enabled={Platform.OS === "ios" ? true : false} >
        
        {/* Screen on loading, hide default state data */}
        {
          this.state.firstLoad
          ?
            <View/>
          :
            (!this.state.nric)
            ?
            // Access Login Screen
            this.handleRenderAccessLoginScreen()
            :
            // Referral Program Data
            this.handleRenderReferralProgramData()
        }

        </KeyboardAvoidingView>

        {/* Loading Animation */}
        {this.handleRenderLoadingIndicator()}

      </SafeAreaView>
    )
  }
}