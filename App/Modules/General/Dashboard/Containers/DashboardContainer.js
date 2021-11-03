/** REACT NATIVE **/
import React from 'react';
import {
  Alert, AppState,
  Dimensions,
  Image,
  Linking,
  Platform,
  RefreshControl,
  SafeAreaView, ScrollView,
  TouchableOpacity,
  View
} from 'react-native';

import { Card, Button, Icon, Text } from 'react-native-elements'

/** PROJECT FILES **/
import {
  Colors, Fonts, Images, Metrics, ApplicationStyles,
  AppsButton, LoadingIndicator, AdsBanner, Label,
  I18n,
  AppConfig, ScreenTag, ScreenTagTo,
} from '../../../../Services/LibLinking';
import styles from '../Styles/DashboardContainerStyles';
import DashboardController from '../Actions/dashboard_controller.js';
import LoginController from '../../Login/Actions/login_controller';
import Member from '../../../Member/Modals/member_modal';
import ServerConfig from '../../ServerConfig/Actions/server_controller';

/** NPM LIBRARIES **/
import Barcode from 'react-native-barcode-builder';
import QRCode from 'react-native-qrcode-svg';
import { NavigationActions, DrawerActions } from 'react-navigation';
import PushNotification from 'react-native-push-notification';
import PushNotificationIOS from "@react-native-community/push-notification-ios";
import SystemSetting from 'react-native-system-setting'
import { tailwind } from '../../../../../tailwind';


const ads_banner_path = AppConfig.ads_banner_dashboard_scn_path;
const ads_screen_id = AppConfig.ads_dashboard_screen_id;

const MIN_HEIGHT = 750;

export default class DashboardView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      screenWidth: Dimensions.get('window').width,
      screenHeight: Dimensions.get('window').height,

      nric: '',
      card_no: '123',
      points: '',
      last_update: '',
      qr_data: '123',

      // Fetch data from server indicator
      fetch_data: false,
      fetch_data_text: 'Fetching data...',

      // Push Notification
      notificationIdList: [],
      totalPNCount: 0,

      // Screen Brightness
      deviceScreenBrightness: 0.5
    }

    //Create Dashboard Controller Object
    this.dashboardController = new DashboardController({
      navigation: this.props.navigation,
    });

    this.loginController = new LoginController();
    this.serverConfig = new ServerConfig();

    // Timer
    this.brightnessTimer = "";
  }

  /****************************************************************/
  /************************ HEADER ********************************/
  /****************************************************************/


  // Navigation Tab
  static navigationOptions = ({ navigation, navigationOptions }) => {
    const params = navigation.state.params || {};

    // Open Drawer Navigation
    var navigateToScreen = params.this;
    // Get device screen height
    const deviceScreenHeight = params.deviceScreenHeight;
    // Set title, if device screen height is lower than MIN HEIGHT, set title 
    const title = (deviceScreenHeight < MIN_HEIGHT && params.nric) ? `Total Points: ${params.points}` : 'Home';


    // Set variable for screen height
    // const minHeight = params.minHeight;
    // const deviceScreenHeight = params.deviceScreenHeight;
    // const points = deviceScreenHeight > minHeight ? '' : params.points;
    // const title = deviceScreenHeight > minHeight ? 'Home' : `Total Points: ${points}`;
    // const nric = params.nric ? `${title}` : 'Total Points: 0';
    // const status = params.status ? `${nric}` : 'Home';

    return {
      // title,
      // headerLeft: (
      //   <TouchableOpacity style={{ paddingLeft: 10 }} onPress={() => navigateToScreen(navigation, { loginUpdate: true })}>
      //     <Image
      //       style={{ width: Metrics.icons.medium, height: Metrics.icons.medium, tintColor: Colors.secondary, colors:"black" }}
      //       source={Images.menu} />
      //   </TouchableOpacity>
      // ),
      // headerRight: (
      //   <TouchableOpacity style={{ paddingRight: 10 }} onPress={() => navigation.navigate('MemberHistoryScreen')}>
      //     <Image
      //       style={{ width: Metrics.icons.medium, height: Metrics.icons.medium, tintColor: Colors.secondary }}
      //       source={Images.history} />
      //   </TouchableOpacity>
      // ),
      //NEW
      title,
      headerLeft: (
        <TouchableOpacity style={tailwind("bg-white rounded-lg opacity-100 p-2 ml-3 mt-3")}
          onPress={() => navigateToScreen(navigation, { loginUpdate: true })}>
          <Image
            style={{ width: Metrics.icons.medium, height: Metrics.icons.medium, tintColor: "black" }}
            source={Images.menu} />
        </TouchableOpacity>
      ),

      headerRight: (
        <TouchableOpacity style={{ paddingRight: 10, }} onPress={() => navigation.navigate('MemberHistoryScreen')}>
          <Image
            style={{ width: Metrics.icons.medium, height: Metrics.icons.medium, tintColor: "black" }}
            source={Images.history} />
        </TouchableOpacity>
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

  async componentDidMount() {
    /* Initiate Screen */
    this.handleLoginUpdate();

    /* Set open drawer navigation to header */
    this.props.navigation.setParams({ this: this.navigateToScreen });

    /** Handle PN onNotification Process **/
    this.handlePushNotificationScreenAllocate();
    this.handleDeliveredNotifications();

    /** Download / Update Branch Data List **/
    this.handleFetchBranchListData();
  }

  componentWillUnmount() {
    clearTimeout(this.brightnessTimer);
  }

  componentDidUpdate(prevProps) {
    // Handle Login Update Process, compare prev props with current Props is to prevent infinite loop and hit the update max limit. 
    var loginUpdate = this.props.navigation.getParam('loginUpdate', false);
    if (loginUpdate && prevProps.navigation != this.props.navigation) {
      this.props.navigation.setParams({ loginUpdate: false });
      this.handleLoginUpdate();
    }
  }

  // Handle screen on refresh function, call handleMemberInfo() to receive last update member data.
  handleRefresh = () => {
    this.handleFetchDataIndicator(true, "Refreshing data...");
    var nric = this.state.nric;
    this.handleMemberInfo(nric);
  }

  // Handle fetch data indicator display.
  handleFetchDataIndicator(status, text = "") {
    this.setState({
      fetch_data: status,
      fetch_data_text: text ? text : 'Fetching data...'
    })
  }

  /****************************************************************/
  /******************** FUNCTIONALITY *****************************/
  /****************************************************************/

  async handleLoginUpdate() {
    this.handleFetchDataIndicator(true, "Check Login...");
    var nric = '';
    var login_user = await this.loginController.fetchCurrentLoginMember();
    if (login_user.result == 1 && login_user.data) {
      nric = login_user.data.nric;
    }

    this.serverConfig.GetServerConfigLastUpdate();
    this.handleSetNRIC(nric);

  }

  handleSetNRIC(nric) {
    this.setState({ nric });
    this.handleMemberInfo(nric);
    this.handleRegisterPNToken(nric);
  }

  /**
   * Loading member data from database first, then only get latest data from server in background and update.
   * Handle fetch latest member data from API
   * and set member card no and points
   * Data setState:
   * - card_no
   * - points
   * - last_update
   */
  handleMemberInfo(nric) {
    this.handleFetchDataIndicator(true, "Fetching member...");
    if (nric) {
      var result = this.dashboardController.getDashboardMemberInfoFromDB(nric);
      result.then((res) => {
        if (res.result == 1) {
          if (res.data) {
            this.handleSetMemberData(nric, res.data);
            this.handleFetchMemberDataFromServer(nric);
          }
        }
        // set refreshing page to false
        this.handleFetchDataIndicator(false);
      })
    } else {
      this.handleMemberPointsHeader(nric, 0);
      this.handleFetchDataIndicator(false);
    }
  }

  /**
   * This function created is to make retrieve data from server running in background. 
   */
  handleFetchMemberDataFromServer(nric) {
    var result = this.dashboardController.FetchMemberInfo(nric);
    result.then((res) => {
      if (res.result == 1) {
        if (res.data) {
          this.handleSetMemberData(nric, res.data);
        }
      } else {
        var res_mem_api = res.member_info_api;
        var err_msg = (res_mem_api.result == 1) ? `${res.data.msg}.` : `${res.data.msg}. ${err_mem_api.data}`;
        Alert.alert(
          '', err_msg
        )
      }
      // set refreshing page to false
      this.handleFetchDataIndicator(false);
    })
  }

  handleSetMemberData(nric, data) {
    var points = data.points;
    this.setState({
      points: points,
      card_no: data.card_no,
      last_update: data.last_update,
      qr_data: JSON.stringify({ "card_no": data.card_no, "sign": data.sign, "name": data.name, "expired_date": data.expired_date })
    });
    this.handleMemberPointsHeader(nric, points);
  }

  /**
   * Handle send data to header for display.
   * * Data setParams:
   * - deviceScreenHeight
   * - points
   * - nric
   */
  handleMemberPointsHeader(nric, points) {
    this.props.navigation.setParams({
      deviceScreenHeight: this.state.screenHeight,
      points: points,
      nric: nric,
    });
  }

  handleAdjustBrightness() {
    if (!this.brightnessTimer) {
      // Adjust to bright
      SystemSetting.getAppBrightness().then(brightness => {
        this.setState({
          deviceScreenBrightness: brightness
        }, () => {
          SystemSetting.setAppBrightness(0.8);
        });
      });

      this.brightnessTimer = setTimeout(() => {
        // Adjust to default brightness
        SystemSetting.setAppBrightness(this.state.deviceScreenBrightness);
        clearTimeout(this.brightnessTimer);
        this.brightnessTimer = "";
      }, 10000);
    }
  }

  handleFetchBranchListData() {
    var test = this.dashboardController.FetchBranchDataValidation();
  }

  /****************************************************************/
  /******************** SCREEN RENDERING **************************/
  /****************************************************************/

  // Ads Banner
  handleRenderAdsBanner() {
    return (
      <View
        // style={[ApplicationStyles.screen.headerContainer]} 
        //   style={
        //     {
        //     alignItems: 'center',
        //     backgroundColor: 'transparent',
        //     // height: Metrics.headerContainerHeight,
        //     width: '90%',
        //     alignSelf: "center",
        //   }
        // }
        style={tailwind("w-11/12 self-center rounded-lg mt-1")}
      >
        <AdsBanner
          dataFolderPath={ads_banner_path}
          screenId={ads_screen_id}
          imgResizeMode={'stretch'}
          height={Metrics.headerContainerHeight}
          arrowSize={0}
          onPress={(data) => {
            var url = data.image.link;
            if (url && url != "undefined") {
              url = (url.substring(0, 8) == "https://" || url.substring(0, 7) == "http://") ? url : `http://${url}`;
              Linking.openURL(url);
            } else {
              Alert.alert("", I18n.t("alert_banner_empty_weblink"));
            }
          }}
          onRefresh={this.state.fetch_data}
        />
      </View>
    )
  }

  // Loading Indicator
  handleRenderLoadingIndicator() {
    return (
      <LoadingIndicator
        visible={this.state.fetch_data}
        size={"large"}
        text={`${this.state.fetch_data_text}`}
      />
    )
  }

  // Handle Render Member Total Points
  handleRenderMemberTotalPoints() {
    return (
      (!this.state.nric)
        ?
        <View />
        :
        <View>
          {
            (this.state.screenHeight > MIN_HEIGHT)
              ?
              // Display Total Point
              <Card
                containerStyle={tailwind('bg-white rounded-lg opacity-100')}
              >
                {/* Customer Point Data Container  */}
                <View style={tailwind("flex-row justify-between")}>
                  <View>
                    <Text
                      // style={{ fontSize: Fonts.size.h5, fontWeight: '500', color: Colors.secondary }}
                      style={tailwind("text-primary text-2xl font-bold")}
                    >TOTAL POINTS: </Text>
                  </View>
                  {/* Customer Point Container */}
                  <View>
                    <Text style={tailwind("text-primary text-2xl font-bold")}>{this.state.points}</Text>
                  </View>
                </View>
                <View>
                  <Text
                    style={tailwind("text-base text-primaryBlue mt-3")}
                  >Last update on {this.state.last_update}</Text>
                </View>
              </Card>
              :
              <View />
          }
        </View>
    )
  }

  // Access Login Screen
  handleRenderAccessLoginScreen() {
    return (
      <Card containerStyle={tailwind("bg-white rounded-lg opacity-100")}>
        <View style={tailwind("w-full items-center mb-5")}>
          <Text style={tailwind("text-secondary text-base font-medium")}>Come and join us to get your discounted vouchers
            and many more great deals.
          </Text>
        </View>
        <View style={tailwind("self-center w-full mt-5 bg-yellow-200")}>
          <Button
            buttonStyle={tailwind("rounded-lg bg-buttoncolor")}
            title="LOGIN / REGISTER"
            titleStyle={tailwind("text-xl")}
            onPress={
              () => { this.props.navigation.navigate("LandingScreen", { prev_screen: this.props.navigation.state.routeName }) }
            }
          />

        </View>
      </Card>

    )
  }

  // Handle render QR Code and Barcode
  handleRenderQRCodeAndBarcode() {
    return (
      <View >
        {/* Notice Text */}
        <View>
          <Label
            text={`Please scan your code here`}
            style={tailwind("text-black text-lg text-center")}
          />
        </View>

        {/* QRCode */}
        <View
          // style={{ alignItems: 'center', marginVertical: Metrics.marginVertical, overflow: 'hidden' }}
          style={tailwind("items-center overflow-hidden my-2")}
        >
          {
            this.state.card_no
              ?
              <QRCode
                value={this.state.card_no}
                // value={this.state.qr_data}
                size={(Dimensions.get('window').height - Metrics.headerContainerHeight) * 0.3}
                bgColor='black'
                fgColor='white'
              />
              :
              <View />
          }
        </View>

        {/* Barcode */}
        <View style={tailwind("items-center mt-3 mb-1")}>
          <Barcode
            value={this.state.card_no}
            format="CODE128"
            text={this.state.card_no}
            // width={1.7}
            height={(Dimensions.get('window').height - Metrics.headerContainerHeight) * 0.12}
          />
        </View>

        {/* Notice Text */}
        <View style={tailwind("items-center")}>
          <Label
            text={`Tap barcode to brightness your screen.`}
            style={tailwind("text-black text-base text-center")}
          />
        </View>
      </View>
    )
  }

  render() {
    return (
      /**Start Safe Area**/
      <SafeAreaView style={tailwind("bg-gray-200")} forceInset={{ vertical: 'never' }} >
        <View style={tailwind("mt-16")}>
          {/* Start Main View */}
          <ScrollView refreshControl={
            <RefreshControl
              refreshing={this.state.fetch_data}
              onRefresh={this.handleRefresh}
              colors={[Colors.background]} //android
              progressBackgroundColor={Colors.background} //android
              progressViewOffset={this.state.screenHeight * 2} //android
              tintColor={Colors.background} //ios
            />
          }
          >
            {
              (this.state.fetch_data)
                ?
                <View />
                :
                <View style={tailwind("flex-1")}
                // {[ApplicationStyles.screen.mainContainer,{}]} 
                // behavior="padding"
                >
                  {/* Display Member Total Points */}
                  {this.handleRenderMemberTotalPoints()}

                  {/* Display Member QRCode and BarCode OR Login Screen */}
                  {/* <View style={[styles.scanContainer,  {paddingVertical: Metrics.basePadding, ...ApplicationStyles.screen.test}]}> */}
                  {
                    (!this.state.nric)
                      ?
                      <View style={{ elevation: 100 }}>
                        {this.handleRenderAccessLoginScreen()}
                      </View>
                      :
                      <Card containerStyle={tailwind("bg-white rounded-lg opacity-100")}>
                        <TouchableOpacity
                          onPress={() => { this.handleAdjustBrightness() }}
                        >
                          {this.handleRenderQRCodeAndBarcode()}
                        </TouchableOpacity>
                      </Card>
                  }
                  {/* </View> */}
                  <View style={tailwind("w-full h-full mt-3 pb-28")}>
                    {/* Display Ads Banner */}
                    {this.handleRenderAdsBanner()}
                  </View>
                </View>
            }

          </ScrollView>

          {/* Loading Animation */}
          {this.handleRenderLoadingIndicator()}


        </View>
      </SafeAreaView>
    )
  }

  /******************************************************************************/
  /************************* PUSH NOTIFICATION **********************************/
  /******************************************************************************/

  handlePushNotificationScreenAllocate() {
    /**
     * iOS problem:
     *  - notification.foreground = true, notification.userInteraction will always is false.
     *  - notification.foreground = false, notification.userInteraction will always is true.
     * Sample Data:
     *  1) Situation: Received PN with AppState = active.
     *     Data Received: foreground = true, userInteraction = false.
     *  2) Situation: Tapped PN from dropdown with AppState = active.
     *     Data Received: foreground = true, userInteraction = false.
     *  3) Situation: Received PN with AppState = inactive.
     *     Data Received: foreground = true, userInteraction = false.
     *  4) Situation: Tapped PN from Notification Center with AppState = inactive.
     *     Data Received: foreground = true, userInteraction = false.
     *  5) Situation: Tapped PN from from dropdown with AppState = background.
     *     Data Received: foreground = false, userInteraction = true.
     *  6) Situation: Tapped PN from Notification Center with AppState = background.
     *     Data Received: foreground = false, userInteraction = true.
     * 
     */
    PushNotification.configure({
      onNotification: (notification) => {
        // console.log( 'NOTIFICATION1:', notification );
        // alert(AppState.currentState + " " + JSON.stringify(notification));

        // To solve iOS problem: Detect user tapped push notification when AppState.currentState = "active".
        if (Platform.OS === "ios") {
          if ((AppState.currentState === "active" || AppState.currentState === "inactive" || AppState.currentState === "background") && !notification.userInteraction) {
            if (notification.message.pnIndex) {
              var currentNotificationId = notification.message.pnIndex;
              var notificationIdList = this.state.notificationIdList;
              var index = notificationIdList.findIndex((data) => data == currentNotificationId);
              if (index == -1) {
                notification.userInteraction = false;
                // Add current notificationId id to the list
                notificationIdList.push(currentNotificationId);
              } else {
                // User tapped push notification
                notification.userInteraction = true;
                // Clear current notificationId from the list
                notificationIdList.splice(index, 1);
              }
              this.setState({
                notificationIdList,
                totalPNCount: notificationIdList.length,
              });
              // Show total badge number
              PushNotification.setApplicationIconBadgeNumber(notificationIdList.length);
            }
          }
        }

        // process the notification when user tapped
        if (notification.userInteraction) {
          this.handleDeliveredNotifications();
          // console.log("User pressed.");
          var screenTag = Platform.OS === "ios" ? notification.message.screenTag : notification.screenTag
          if (screenTag) {
            switch (screenTag) {
              case ScreenTag.SCREEN_PROMO:
                this.handlePNScreenRoute(ScreenTagTo.SCREEN_PROMO, { loginUpdate: true });
                break;
              case ScreenTag.SCREEN_VOUCHER:
                this.handlePNScreenRoute(ScreenTagTo.SCREEN_VOUCHER, { loginUpdate: true });
                break;
              case ScreenTag.SCREEN_COUPON:
                this.handlePNScreenRoute(ScreenTagTo.SCREEN_COUPON, { loginUpdate: true });
                break;
              case ScreenTag.SCREEN_PACKAGE:
                this.handlePNScreenRoute(ScreenTagTo.SCREEN_PACKAGE, { loginUpdate: true });
                break;
              case ScreenTag.SCREEN_PACKAGE_RATING:
                this.handlePNScreenRoute(ScreenTagTo.SCREEN_PACKAGE_RATING, { screenSource: 'rate_us', loginUpdate: true });
                break;
              case ScreenTag.SCREEN_NOTICE_BOARD:
                this.handlePNScreenRoute(ScreenTagTo.SCREEN_NOTICE_BOARD, { loginUpdate: true });
                break;
              default:
                this.handlePNScreenRoute(ScreenTagTo.SCREEN_HOME, { loginUpdate: true });
            }
          }
        }

        // required on iOS only (see fetchCompletionHandler docs: https://facebook.github.io/react-native/docs/pushnotificationios.html)
        notification.finish(PushNotificationIOS.FetchResult.NoData);
      },
    })
  }

  handlePNScreenRoute(screenName, params = {}) {
    this.props.navigation.navigate(screenName, params);
  }

  handleDeliveredNotifications() {
    if (Platform.OS === "ios") {
      // Get all delivered notifications from notification center
      PushNotificationIOS.getDeliveredNotifications((notification) => {
        // alert(JSON.stringify(notification));
        // console.log(notification);
        if (notification) {
          var notificationIdList = [];
          PushNotification.setApplicationIconBadgeNumber(notification.length);
          for (let i = 0; i < notification.length; i++) {
            if (notification[i].userInfo.aps.alert.pnIndex) {
              notificationIdList.push(notification[i].userInfo.aps.alert.pnIndex);
            }
          }
          this.setState({
            notificationIdList,
            totalPNCount: notification.length
          })
          // alert(JSON.stringify(notificationIdList));
        }
      });
    }
  }

  handleRegisterPNToken(nric) {
    PushNotification.configure({
      // Called when Token is generated (iOS and Android)
      onRegister: (token) => {
        // console.log( 'TOKEN:', token );
        // alert(JSON.stringify(token))

        /** Update member PN Token to server **/
        var member = new Member();
        var updatePNToken = member.UploadPNTokenToServer(token.token);
        // updatePNToken.then((res) => {
        // })
      }
    })
  }
}