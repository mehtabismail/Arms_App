/** REACT NATIVE **/
import React from 'react';
import {
  Alert, Animated,
  Dimensions,
  Platform,
  View,
} from 'react-native';
import ServerController from '../../General/ServerConfig/Actions/server_controller';

/** PROJECT FILES **/
import { 
  Colors, Fonts, Images, Metrics, ApplicationStyles,
  LoadingIndicator, Label, AppsButton,
  AppConfig
} from '../../../Services/LibLinking';
import styles from '../Styles/e_com_payment_styles';
import LoginController from '../../General/Login/Actions/login_controller';

/** NPM LIBRARIES **/
import { NavigationActions, DrawerActions, SafeAreaView } from 'react-navigation';
import { WebView } from 'react-native-webview';

/**
 * TODO:
 * √ Get SellerHub URL and Access Token
 * √ Link to api checkout and payment
 * √ After get the return message, navigate to checkout screen and to do next action.
 * 
 */

const SCREEN_WIDTH = Dimensions.get("screen").width;

export default class EComPaymentView extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      screenWidth: Dimensions.get('window').width,
      screenHeight: Dimensions.get('window').height,

      // Fetch data from server indicator
      fetch_data: false,
      fetch_data_text: 'Fetching data...',
      firstLoad: true,

      // Checkout data
      action: 'cart_checkout',
      checkout_data: '',
      checkout_url: '',
      sh_access_token: '',

      // WebView
      readyToLoad: false,
      html: ''

    }

    // Create controller object
    this.loginController = new LoginController();
    this.serverController = new ServerController();
  }

  /****************************************************************/
  /************************ HEADER ********************************/
  /****************************************************************/

  // Navigation Tab
  static navigationOptions = ({navigation, navigationOptions}) => {
    const params = navigation.state.params || {};

    return {
      title: 'Payment',
    }
  }

  /****************************************************************/
  /*********************** COMPONENT  *****************************/
  /****************************************************************/

  async componentDidMount() {
    // this.props.navigation.setParams({this: this.navigateToScreen});
    var action = this.props.navigation.getParam("action", 'cart_checkout'); // Enum: cart_checkout, update_order_payment
    var checkout_data = this.props.navigation.getParam("checkout_data", {});
    // alert(JSON.stringify(checkout_data));
    if(checkout_data){
      // Get MarketPlace API Action Path and Access Token
      const { sh_api_url } = AppConfig;

      // Get MarketPlace URL & Access Token
      var sh_url = await this.serverController.GetMarketPlaceURL();
      var sh_access_token = await this.serverController.GetMarketPlaceAccessToken();

      // Action
      // var action = "cart_checkout";
      console.log("Checkout Data: ", checkout_data);
      this.setState({ 
        firstLoad: false,
        action,
        checkout_data,
        checkout_url: `${sh_url}/${sh_api_url}${action}`,
        sh_access_token,
        readyToLoad: true
      }, ()=>{
        this.handleFetchDataIndicator(true, "Connecting...");
        fetch(this.state.checkout_url, {
          method: 'POST',
          headers: {
            X_ACCESS_TOKEN: this.state.sh_access_token
          },
          body: JSON.stringify(this.state.checkout_data)
        }).then(response => response.text()).then(text => {
          console.log("CHECKOUT: ", text);
          this.setState({ html: text });
          this.handleFetchDataIndicator(false);
        });
      });
    }
  }

  componentWillUnmount() {
  }

  componentDidUpdate(prevProps){
    // Login Update
    var loginUpdate = this.props.navigation.getParam('loginUpdate', false);
    if(loginUpdate && this.props.navigation != prevProps.navigation){
      this.props.navigation.setParams({loginUpdate: false});
      // this.handleLoginUpdate();
    }
  }

  handleFetchDataIndicator(status, text=""){
    this.setState({
      fetch_data: status,
      fetch_data_text: text ? text : 'Fetching data...'
    })
  }

  /****************************************************************/
  /******************** FUNCTIONALITY *****************************/
  /****************************************************************/

  /****************************************************************/
  /******************** SCREEN RENDERING **************************/
  /****************************************************************/

  // Loading Indicator
  handleRenderLoadingIndicator(){
    return(
      <LoadingIndicator 
        visible={this.state.fetch_data}
        size={"large"}
        text={`${this.state.fetch_data_text}`}
      />
    )
  }

  // Render Payment Webview Container
  handleRenderPaymentWebviewContainer(){
    return(
      <View style={{ flex: 1 }}>
        {
          this.state.html
          ?
          <WebView
            // source={{ html }}
            source={{
              html: this.state.html,
              baseUrl: this.state.checkout_url
            }}
            onMessage={event => {
              var payment_result = JSON.parse(event.nativeEvent.data);
              if(this.state.action == "cart_checkout"){
                this.props.navigation.navigate("EComCheckoutScreen", { paymentUpdate: true, payment_result });
              } else {
                this.props.navigation.navigate("EComPurchaseHistoryScreen", { paymentUpdate: true, payment_result });
              }
              
              // alert(JSON.stringify(test));
              // // alert(JSON.stringify(event.nativeEvent.data));
              // // alert(event.nativeEvent.data);
            }}
            // startInLoadingState={this.state.readyToLoad}
            originWhitelist={["*"]}
            onLoadStart={(syntheticEvent)=>{
              const { nativeEvent } = syntheticEvent;
              console.log("onLoadStart Loading Status: ", nativeEvent.loading);
              this.handleFetchDataIndicator(true, "Loading...");
            }}
            onLoadEnd={(syntheticEvent)=>{
              const { nativeEvent } = syntheticEvent;
              console.log("onLoadEnd Loading Status: ", nativeEvent.loading);
              this.handleFetchDataIndicator(false);
            }}
            // style={{...ApplicationStyles.screen.test}}
          />
          :
          <View/>
        }
      </View>
    )
  }

  handleRenderPaymentWebviewContainer1(){
    return(
      this.state.fetch_data
      ?
      <View/>
      :
      <View style={{ flex: 1 }}>
        <WebView
          // source={{ html }}
          source={{
            // uri: 'https://sellerhubdev2.arms.com.my/api/mobileapp/rcv_action/cart_checkout',
            uri: this.state.checkout_url,
            headers: {
              X_ACCESS_TOKEN: this.state.sh_access_token,
            }, 
            method:'POST',
            body: JSON.stringify(this.state.checkout_data)
            // JSON.stringify({
            //   member_nric: 930601075237,
            //   product_sku_list: [
            //     { product_sku_id: 7, quantity: 1 }
            //   ],
            //   // voucher_code: "",
            //   payment_method_id: 1,
            //   shipping_fee: 0.5,
            //   total_checkout_amt: 1, //Need convert to double, need combine with shipping fee
            //   shipping_notes: "Test payment.",
            //   billing_data: {
            //     firstname: "Brandon",
            //     lastname: "Khor",
            //     email: "brandon@arms.my",
            //     contact_no: "0143474588",
            //     address1: "55, Lorong Bukit Panchor 6",
            //     address2: "Taman Bukit Panchor",
            //     postcode: "14300",
            //     city: "Nibong Tebal",
            //     state: "Pulau Pinang",
            //     country: "Malaysia"
            //   },
            //   shipping_data: {
            //     firstname: "Brandon",
            //     lastname: "Khor",
            //     email: "brandon@arms.my",
            //     contact_no: "0143474588",
            //     address1: "55, Lorong Bukit Panchor 6",
            //     address2: "Taman Bukit Panchor",
            //     postcode: "14300",
            //     city: "Nibong Tebal",
            //     state: "Pulau Pinang",
            //     country: "Malaysia"
            //   }
            // }),
          }}
          onMessage={event => {
            var payment_result = JSON.parse(event.nativeEvent.data);
            if(this.state.action == "cart_checkout"){
              this.props.navigation.navigate("EComCheckoutScreen", { paymentUpdate: true, payment_result });
            } else {
              this.props.navigation.navigate("EComPurchaseHistoryScreen", { paymentUpdate: true, payment_result });
            }
            
            // alert(JSON.stringify(test));
            // // alert(JSON.stringify(event.nativeEvent.data));
            // // alert(event.nativeEvent.data);
          }}
          startInLoadingState={this.state.readyToLoad}
          originWhitelist={["*"]}
        />
      </View>
    )
  }

  render() {
    return (
      /**Start Safe Area**/
      <SafeAreaView style={ApplicationStyles.screen.safeAreaContainer} forceInset={{vertical:'never'}} >
        
        {/* Screen on loading, hide default state data */}
        {
          this.state.firstLoad
          ?
            <View/>
          :
            // Payment Webview
            this.handleRenderPaymentWebviewContainer()
        }

        {/* Loading Animation */}
        {this.handleRenderLoadingIndicator()}

      </SafeAreaView>
    )
  }

  /**
   * SAMPLE OF HTML PASS RETURN MESSAGE TO MOBILE APP
   * const html = `
      <html>
      <head></head>
      <body>
        <script>
          setTimeout(function () {
            var test = {result: 1, data: "Hello World"};
            window.ReactNativeWebView.postMessage(JSON.stringify(test))
          }, 2000)
        </script>
      </body>
      </html>
    `;
   */
}