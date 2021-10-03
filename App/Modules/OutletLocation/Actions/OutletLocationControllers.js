/** REACT NATIVE **/
import React from 'react';

/** PROJECT FILES **/
import { 
  I18n,
  AppConfig,
} from '../../../Services/LibLinking';
import OutletLocation from '../Modals/outlet_location';

/** NPM LIBRARIES **/
import NetInfo from "@react-native-community/netinfo";

export default class OutletLocationController extends React.Component {
  constructor(props){
    super(props);

    this.navigation = (props)?props.navigation:'';

    // Create cycle count object
    this.outletLocation = new OutletLocation();
  }

  /** Screen Initiate **/
  initScreen(){
    let result = new Promise((resolve, reject) => {
      resolve(this.handleGetBranchLocationData());
    })
    return result
  }
  /** END of Screen Initiate **/

  /**
   * Handle Get Branch Location Data
   * - If Network Available, 
   *    1) Fetch Branch Location data from server via API.
   * - If Network Not Availble,
   *    1) No data.
   */
  handleGetBranchLocationData(){
    let result = new Promise((resolve, reject) => {
      /**
       * 1) Check Network 
       * 1.1) Network Available, get Branch Location list from server
       * 1.2) Network Not Available, no data
       */
      var network_return = this.networkConnectValidation();
      network_return.then((res) =>{
        if(res.result == 1){
          // Get Branch Location data list from server based
          var branch_location = this.outletLocation.FetchBranchInfoViaAPI();
          branch_location.then((res) =>{
            if(res.result == 1){
              resolve({ result: 1, data: res.data });
            } else {
              resolve({ result: 0, data: "", check: 1 });
            }
          })
        } else {
          resolve({ result: 0, data: "", check: 0 });
        }
      })
    });
    return result;
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
