/** REACT NATIVE **/
import React from 'react';

/** PROJECT FILES **/
import { 
  I18n,
} from '../../../Services/LibLinking';
import Promotion from "../Modals/promotion_modal";

/** NPM LIBRARIES **/
import NetInfo from "@react-native-community/netinfo";
import reactotron from 'reactotron-react-native';

export default class PromotionContainerController extends React.Component {
  constructor(props){
    super(props);

    this.navigation = (props)?props.navigation:'';

    // Create cycle count object
    this.promotion = new Promotion();
  }

  /** Screen Initiate **/
  initScreen(){
    let result = new Promise((resolve, reject) => {
      /**
       * 1) Check Network 
       * 1.1) Network Available, get promotion list from server
       * 1.2) Network Not Available, get promotion list from local
       */
      var network_return = this.networkConnectValidation();
      network_return.then((res) =>{
        if(res.result == 1){
          // Get promotion list from server
          var fetch_promo_result = this.promotion.FetchPromoListViaAPI();
          fetch_promo_result.then((res) =>{
            if(res.result == 1){
              var promo_list = this.getPromotionListFromDB();
              promo_list.then((res) => {
                var check = res.data.length > 0 ? true : false; //TEMP resolution
                resolve({result: 1, data: res.data, check});
              })
            } else {
              resolve(res);
            }
          })
        } else {
          resolve(this.getPromotionListFromDB());
        }
      })

    })
    return result
  }
  /** END of Screen Initiate **/

  getPromotionListFromDB(){
    let result = new Promise((resolve, reject) => {
      var promo_return = this.promotion.FetchPromotionList();
      promo_return.then((res) => {
        if(res.result == 1){
          for (let i = 0; i < res.data.length; i++) {
            res.data[i].key = res.data[i].promo_key;
            res.data[i].promo_branch_id = JSON.parse(res.data[i].promo_branch_id);
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
}
