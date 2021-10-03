/** REACT NATIVE **/
import React from 'react';

/** PROJECT FILES **/
import { 
  I18n,
  WorldTimeAPICommunicator 
} from '../../../Services/LibLinking';
import Voucher from "../Modals/voucher_modal";
import MemberModal from "../../Member/Modals/member_modal";

/** NPM LIBRARIES **/
import NetInfo from "@react-native-community/netinfo";
import moment from 'moment';

export default class VoucherController extends React.Component {
  constructor(props){
    super(props);

    this.navigation = (props)?props.navigation:'';

    // Create cycle count object
    this.voucher = new Voucher();
    this.memberModal = new MemberModal();
    // this.worldTimeAPICommunicator = new WorldTimeAPICommunicator();
  }

  /** Screen Initiate **/
  initScreen(worldDateTime){
    let result = new Promise((resolve, reject) => {
      /**
       * 1) Check Network 
       * 1.1) Network Available, get voucher list from server
       * 1.2) Network Not Available, get voucher list from local
       */
      var network_return = this.networkConnectValidation();
      network_return.then((res) =>{
        if(res.result == 1){
          // Get voucher list from server
          var fetch_voucher_result = this.voucher.FetchVoucherListViaAPI();
          fetch_voucher_result.then((res) =>{
            if(res.result == 1){
              resolve(this.getVoucherListFromDB(worldDateTime));
            } else {
              resolve(res);
            }
          })
        } else {
          resolve(this.getVoucherListFromDB(worldDateTime));
        }
      })

    })
    return result
  }
  /** END of Screen Initiate **/

  getNRIC(){
    let result = new Promise((resolve, reject) => {
      resolve(this.memberModal.FetchLoginMemberNRIC_SessionToken())
    })
    return result;
  }

  getVoucherListFromDB(worldDateTime){
    let result = new Promise((resolve, reject) => {
      var voucher_return = this.voucher.FetchVoucherList();
      voucher_return.then(async(res) => {
        if(res.result == 1){
          if(res.data){
            var active_arr = [];
            var inactive_arr = [];
            /**
             * Get World Time 
             */
            // var worldTimeAPICommunicator = new WorldTimeAPICommunicator();
            // var worldDateTime = await worldTimeAPICommunicator.GetRealWorldTimeDateTime();
            // var worldDateTime = await this.worldTimeAPICommunicator.GetRealWorldTimeDateTime();
            for (let i = 0; i < res.data.length; i++) {
              res.data[i].key = res.data[i].voucher_id;
              /**
               * Sorting the voucher,
               * 1) Voucher Active 
               * 2) Voucher Inactive
               */
              var active = res.data[i].active;
              var cancelled = res.data[i].cancelled;
              var voucher_used = res.data[i].voucher_used;
              var valid_from = res.data[i].valid_from;
              var valid_to = res.data[i].valid_to;
              if( active && 
                  !cancelled && 
                  !voucher_used && 
                  // valid_from < moment().format('YYYY-MM-DD HH:mm:ss') && 
                  // valid_to > moment().format('YYYY-MM-DD HH:mm:ss') ){
                  valid_from < worldDateTime && 
                  valid_to > worldDateTime ){
                active_arr.push(res.data[i]);
              } else {
                if( voucher_used || 
                    moment(valid_to).month()+1 == moment().format('MM') ) {
                  inactive_arr.push(res.data[i]);
                }
              }
            }
            res.data = active_arr.concat(inactive_arr);
          }
        }
        resolve(res);
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

  // async getWorldTimeData(){
  //   var worldTimeAPICommunicator = new WorldTimeAPICommunicator();
  //   var worldDateTime = await worldTimeAPICommunicator.GetRealWorldTimeDateTime();
  //   this.setState({
  //     worldDateTime: worldDateTime?moment(worldDateTime).format('YYYY-MM-DD HH:mm:ss'):moment().format('YYYY-MM-DD HH:mm:ss')
  //   });
  // }
}
