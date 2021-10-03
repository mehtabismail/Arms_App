/** REACT NATIVE **/
import React from "react";

/** PROJECT FILES **/
import { 
  AppConfig,
} from '../../../../Services/LibLinking';
import MemberModal from '../../../Member/Modals/member_modal';
import OutletLocation from '../../../OutletLocation/Modals/outlet_location';

/** NPM LIBRARIES **/
import md5 from "react-native-md5";
import moment from 'moment';

export default class DashboardController extends React.Component  {
  constructor(props){
    super(props);
    
    this.navigation = props.navigation

    // Create Member Modal Object
    this.memberModal = new MemberModal();
    this.outletLocation = new OutletLocation();
  }

  // Get Member Info
  FetchMemberInfo(nric) {
    let result = new Promise((resolve, reject) => {
      var memberInfo = this.memberModal.FetchMemberInfoViaAPI()
      memberInfo.then(async (res) => {
        /**
         * This method is to prevent when device is offline, user still can retrieve data from local db. 
         * Return Data Sample,
         * FetchMemberCardNo_Points return result + FetchMemberInfoViaAPI,
         * {result: 1, data: {points, card_no, last_update}, member_info_api: {result:1, data{}}}
         */
        var member_info = await this.getDashboardMemberInfoFromDB(nric);
        member_info.member_info_api = res;
        resolve(member_info);
      })
    })
    return result;
  }

  getDashboardMemberInfoFromDB(nric){
    let result = new Promise((resolve, reject) => {
      var data = this.memberModal.FetchMemberCardNo_Points(nric)
      data.then((res) => {
        if(res.result == 1) {
          if(res.data){
            var points = res.data.points;
            var card_no = res.data.card_no;
            var sign = md5.hex_md5(`${res.data.card_no} ${AppConfig.access_token}`);
            var name = res.data.name;
            var expired_date = res.data.next_expiry_date;
            var last_update = (res.data.points_update != "0000-00-00") ? res.data.points_update : res.data.last_update;
            resolve({result: 1, data:{points, card_no, sign, name, expired_date, last_update}})
          } else {
            resolve({result: 1, data: ""});
          }
        } else {
          resolve(res);
        }
      })
    });
    return result;
  }

  // Get branch data via API into DB
  FetchBranchDataValidation(){
    let result = new Promise(async (resolve, reject) => {
      var last_update_check = await this.outletLocation.FetchBranchListLastUpdate();
      // Compare date is the same date with last update
      if(last_update_check.result == 1 && last_update_check.data){
        var last_update = moment(last_update_check.data).format("YYYY-MM-DD");
        if(!moment().isSame(last_update, 'day')){
          resolve(this.FetchBranchData());
        }
      } else {
        resolve(this.FetchBranchData());
      }
    });
    return result;
  }

  FetchBranchData(){
    let result = new Promise(async (resolve, reject) => {
      var branch_res = this.outletLocation.FetchBranchInfoViaAPI();
      branch_res.then(async (res) => {
        resolve(res);
      });
    });
    return result;
  }

}