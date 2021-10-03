/** REACT NATIVE **/
import React from 'react';

/** PROJECT FILES **/
import { 
  I18n,
} from '../../../Services/LibLinking';
import Package from "../Modals/package_modal";

/** NPM LIBRARIES **/
import NetInfo from "@react-native-community/netinfo";


export default class PackageRedeemHistoryController extends React.Component {
  constructor(props){
    super(props);

    this.navigation = (props)?props.navigation:'';

    // Create package object
    this.package = new Package();
  }

  /**
   * Check screen source
   * 1) Screen source is Push Notification Redeem History (Screen ID: rate_us)
   *    1.2) Check Network
   *        -> Network Available, get package redeem hisotry data from server and display redeem history data
   *        -> Network Error, show network error
   * 2) Screen source is Package's Item Redeem History (Screen ID: redeem_history)
   *    - Display only selected package's item redeem history.
   */

  initScreen(screenSource, package_guid = '', package_item_guid = ''){
    let result = new Promise((resolve, reject) => {
      if(screenSource == "rate_us"){
        var network_return = this.networkConnectValidation();
        network_return.then((res) =>{
          if(res.result == 1){
            // Get package redeem hisotry data from server and display redeem history data
            var fetch_result = this.package.FetchPackageRedeemHistoryDataViaAPI();
            fetch_result.then((res) =>{
              if(res.result == 1){
                resolve(this.getRedeemHistoryListFromDB(screenSource));
              } else {
                resolve(res);
              }
            })
          } else {
            data = {result: 0, data:{ title: "", msg: "Network Error." }}
            resolve(data);
          }
        })
      } else {
        resolve(this.getRedeemHistoryListFromDB(screenSource, package_guid, package_item_guid));
      }
    })
    return result
  }

  getRedeemHistoryListFromDB(screenSource, package_guid = '', package_item_guid = ''){
    let result = new Promise((resolve, reject) => {
      var fetch_return = screenSource == "rate_us" ? 
        this.package.FetchPackageRedeemHistoryListByUnratedHistory() : 
        this.package.FetchPackageRedeemHistoryListByPackageItems(package_guid, package_item_guid);
      fetch_return.then((res) => {
        if(res.result == 1){
          if(res.data){
            for (let i = 0; i < res.data.length; i++) {
              res.data[i].key = res.data[i].pk_rh_guid.toString();
              res.data[i].sa_info = JSON.parse(res.data[i].sa_info);
            }
          }
        }
        resolve(res);
      })
    })
    return result
  }

  submitRatingData(redeem_guid, service_rating, sa_info){
    let result = new Promise((resolve, reject) => {
      // Generate sa rating & sa rating checking list
      var sa_rating = [];
      var sa_rating_check = [];
      if(sa_info && sa_info.length > 0){
        var item = {};
        for (let i = 0; i < sa_info.length; i++) {
          item[sa_info[i].sa_id] = sa_info[i].rate;
          sa_rating_check.push(sa_info[i].rate==0?false:true);
        }
        sa_rating.push(item);
      }

      // Check service_rating and sa_rating value is not zero.
      if(service_rating == 0 || !service_rating){
        resolve({result: 0, data: {title: "Submit Rating Failed", msg: "Please rate for our package service."}});
      } else if(sa_rating_check.findIndex(data => data === false)>=0){
        resolve({result: 0, data: {title: "Submit Rating Failed", msg: "Please rate for our staff service."}});
      } else {
        resolve(this.package.SubmitRateDataViaAPI(redeem_guid, service_rating, sa_rating));
      }
    })
    return result
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
}
