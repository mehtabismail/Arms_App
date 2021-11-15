/** REACT NATIVE **/
import { Component } from 'react';

/** PROJECT FILES **/
import React from 'react'
import "../../Config";
import AppConfig from "../../Config/AppConfig";
import AppNavigation from "../../Navigation/AppNavigation";
import GenerateDataTables from '../../Database/generate_data_tables';
import Member from '../Member/Modals/member_modal';
import ARMSDownloader from '../../Services/arms_downloader';

/** NPM LIBRARIES **/
import PushNotification from 'react-native-push-notification';
import PushNotificationIOS from "@react-native-community/push-notification-ios";
import NetInfo from "@react-native-community/netinfo";
import { SafeAreaProvider } from "react-native-safe-area-context";

/**
 * Provides an entry point into our application.  Both index.ios.js and index.android.js
 * call this component first.
 */
class App extends Component {

  /**
   * Create Ads Banner Folders
   */
  handleCreateAdsBannerFolders() {
    /**
     * Create Ads Banner Folders
     * - home_btm_vertical
     * - login_top_vertical
     * - promo_top_vertical
     * - promo_product_top_vertical
     * - voucher_top_vertical
     */
    var armsDownloader = new ARMSDownloader();
    const foldersPath = [
      AppConfig.ads_banner_dashboard_scn_path,
      AppConfig.ads_banner_login_scn_path,
      AppConfig.ads_banner_promo_product_scn_path,
      AppConfig.ads_banner_promo_scn_path,
      AppConfig.ads_banner_voucher_scn_path
    ];
    for (let i = 0; i < foldersPath.length; i++) {
      var crFolderResult = armsDownloader.handleCreateFolder(foldersPath[i]);
    }
  }

  /**
   * Update Ads Banner Data
   */
  async handleUpdateAdsBannerData() {
    var network = await this.networkConnectValidation();
    if (network.result == 1) {
      var armsDownloader = new ARMSDownloader();
      armsDownloader.handleRetrieveAdsBannerViaAPI();
    }
  }

  /**
   * Download Company Logo
   */
  async handleDownloadCompanyLogo() {
    var network = await this.networkConnectValidation();
    if (network.result == 1) {
      var armsDownloader = new ARMSDownloader();
      armsDownloader.handleDownloadCompanyLogo();
    }
  }

  /**
   * Network Checking
   */
  networkConnectValidation() {
    let result = new Promise((resolve, reject) => {
      NetInfo.isConnected.fetch().done((isConnected) => {
        if (isConnected) {
          resolve({ result: 1 });
        } else {
          resolve({ result: 0 });
        }
      });
    })
    return result;
  }


  render() {
    /**
     * Init Download Company Logo
     */
    this.handleDownloadCompanyLogo();

    /**
     * Init Ads Banner
     */
    this.handleCreateAdsBannerFolders();
    this.handleUpdateAdsBannerData();

    /**
     * Init the database
     */
    var generateDataTables = new GenerateDataTables();
    var db_result = generateDataTables.initAppDBTables();

    /**
     * Push Notification Setup
     */
    // var PushNotification = require('react-native-push-notification');
    PushNotification.configure({

      // (optional) Called when Token is generated (iOS and Android)
      // onRegister: function(token) {
      //   console.log( 'TOKEN:', token );
      //   var member = new Member();
      //   var result = member.UpdatePNToken(token.token);
      //   result.then((res)=>{
      //     alert(JSON.stringify(res));
      //   })

      // },

      // // (required) Called when a remote or local notification is opened or received
      // onNotification: function(notification) {
      //   console.log( 'NOTIFICATION:', notification );

      //   // process the notification

      //   // required on iOS only (see fetchCompletionHandler docs: https://facebook.github.io/react-native/docs/pushnotificationios.html)
      //   // notification.finish(PushNotificationIOS.FetchResult.NoData);
      // },

      // ANDROID ONLY: GCM or FCM Sender ID (product_number) (optional - not required for local notifications, but is need to receive remote push notifications)
      senderID: AppConfig.sender_id,

      // IOS ONLY (optional): default: all - Permissions to register.
      permissions: {
        alert: true,
        badge: true,
        sound: true
      },

      // Should the initial notification be popped automatically
      // default: true
      popInitialNotification: true,

      /**
        * (optional) default: true
        * - Specified if permissions (ios) and token (android and ios) will requested or not,
        * - if not, you must call PushNotificationsHandler.requestPermissions() later
        */
      requestPermissions: true,
    });

    /**
     * Set Push Notification Badget to zero
     */
    // PushNotification.setApplicationIconBadgeNumber(0);

    return (
      <SafeAreaProvider>
        <AppNavigation />
      </SafeAreaProvider>
    );
  }
}

export default App;
