/** REACT NATIVE **/
import React from 'react';

/** PROJECT FILES **/
import { 
  I18n,
} from '../../../Services/LibLinking';
import Package from "../Modals/package_modal";

/** NPM LIBRARIES **/
import NetInfo from "@react-native-community/netinfo";

export default class PackageContainerController extends React.Component {
  constructor(props){
    super(props);

    this.navigation = (props)?props.navigation:'';

    // Create cycle count object
    this.package = new Package();
  }

  /** Screen Initiate **/
  initScreen(){
    let result = new Promise((resolve, reject) => {
      /**
       * 1) Check Network 
       * 1.1) Network Available, get package list from server
       * 1.2) Network Not Available, get package list from local
       */
      var network_return = this.networkConnectValidation();
      network_return.then((res) =>{
        if(res.result == 1){
          // Get package list from server
          var fetch_package_result = this.package.FetchPackageDataViaAPI();
          fetch_package_result.then((res) =>{
            if(res.result == 1){
              resolve(this.getPackageListFromDB());
            } else {
              resolve(res);
            }
          })
        } else {
          resolve(this.getPackageListFromDB());
        }
      })
    })
    return result
  }
  /** END of Screen Initiate **/

  getPackageListFromDB(){
    let result = new Promise((resolve, reject) => {
      var package_return = this.package.FetchPackageList();
      package_return.then((res) => {
        if(res.data){
          if(res.result == 1){
            for (let i = 0; i < res.data.length; i++) {
              res.data[i].key = res.data[i].pk_id.toString();
            }
          }
          resolve(res);
        } else {
          resolve(res);
        }
      })
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
