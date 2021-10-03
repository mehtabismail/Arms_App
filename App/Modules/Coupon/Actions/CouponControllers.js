/** REACT NATIVE **/
import React from 'react';

/** PROJECT FILES **/
import { 
  I18n,
} from '../../../Services/LibLinking';
import Coupon from "../Modals/coupon_modal";
import MemberModal from "../../Member/Modals/member_modal";

/** NPM LIBRARIES **/
import NetInfo from "@react-native-community/netinfo";
import moment from 'moment';

export default class CouponController extends React.Component {
  constructor(props){
    super(props);

    this.navigation = (props)?props.navigation:'';

    // Create cycle count object
    this.coupon = new Coupon();

    this.memberModal = new MemberModal();
  }

  /** Screen Initiate **/
  initScreen(){
    let result = new Promise((resolve, reject) => {
      /**
       * 1) Check Network 
       * 1.1) Network Available, get coupon list from server
       * 1.2) Network Not Available, get coupon list from local
       */
      var network_return = this.networkConnectValidation();
      network_return.then((res) =>{
        if(res.result == 1){
          // Get coupon list from server
          var fetch_coupon_result = this.coupon.FetchCouponListViaAPI();
          fetch_coupon_result.then((res) =>{
            if(res.result == 1){
              resolve(this.getCouponListFromDB());
            } else {
              resolve(res);
            }
          })
        } else {
          resolve(this.getCouponListFromDB());
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

  getCouponListFromDB(){
    let result = new Promise((resolve, reject) => {
      var coupon_return = this.coupon.FetchCouponList();
      coupon_return.then(async(res) => {
        if(res.result == 1){
          if(res.data){
            /**
             * - Get member registered date from member modal
             * - Get member personal info from member modal
             *    -> address
             *    -> postcode
             *    -> state
             *    -> phone_3
             *    -> gender
             *    -> dob
             */
            var member_data = await this.memberModal.FetchCouponVerifMemberData();
            if(member_data.result == 1 && member_data.data){
              res.member_data = member_data.data
            } else {
              res.member_data = {
                mobile_registered_time: '',
                address: '', 
                postcode: '', 
                state: '', 
                phone: '', 
                gender: '', 
                dob: ''
              }
            }

            var normal_coupon = [];
            var register_coupon = [];
            for (let i = 0; i < res.data.length; i++) {
              res.data[i].key = res.data[i].cp_id.toString();
              res.data[i].limit_sid_list = JSON.parse(res.data[i].limit_sid_list);
              res.data[i].member_limit_profile_info = JSON.parse(res.data[i].member_limit_profile_info);

              if(res.data[i].member_limit_profile_info.length != 0 || (res.data[i].member_limit_mobile_day_start && res.data[i].member_limit_mobile_day_end)){
                const registered_days = moment().diff(moment(res.member_data.mobile_registered_time), 'days');
                // Register day still under coupon limit days and need to fullfil member profile criteria
                if(res.data[i].member_limit_profile_info.length != 0 && 
                  (res.data[i].member_limit_mobile_day_start && res.data[i].member_limit_mobile_day_end) && 
                  (registered_days < res.data[i].member_limit_mobile_day_end)){
                  register_coupon.push(res.data[i]);
                } else {
                  if((res.data[i].member_limit_mobile_day_start && res.data[i].member_limit_mobile_day_end) && res.data[i].member_limit_profile_info.length==0){
                    // Register day still under coupon limit days ONLY
                    if(registered_days < res.data[i].member_limit_mobile_day_end){
                      register_coupon.push(res.data[i]);
                    }
                  } else if(res.data[i].member_limit_profile_info.length!=0 && (!res.data[i].member_limit_mobile_day_start && !res.data[i].member_limit_mobile_day_end)){
                    // Member Profile Criteria for use coupon ONLY
                    register_coupon.push(res.data[i]);
                  }
                }
              } else {
                normal_coupon.push(res.data[i]);
              }
            }
            res.data = register_coupon.concat(normal_coupon);
          }
        }
        resolve(res);
      });
    });
    return result;
  }

  GetSkuDescription(limit_sid_list){
    let result = new Promise((resolve, reject) => {
      resolve(this.coupon.GetSkuDescriptionFromSkuId(limit_sid_list));
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
