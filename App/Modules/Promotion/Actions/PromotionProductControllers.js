/** REACT NATIVE **/
import React from 'react';

/** PROJECT FILES **/
import Promotion from "../Modals/promotion_modal";
import OutletLocation from '../../OutletLocation/Modals/outlet_location';

/** NPM LIBRARIES **/

export default class PromotionProductController extends React.Component {
  constructor(props){
    super(props);

    this.navigation = (props)?props.navigation:'';

    // Create cycle count object
    this.promotion = new Promotion();
    this.outletLocation = new OutletLocation();
  }

  /** Screen Initiate **/
  initScreen(promo_key){
    let result = new Promise((resolve, reject) => {
      resolve(this.getPromotionListItemsFromDB(promo_key));
    })
    return result
  }
  /** END of Screen Initiate **/

  getPromotionListItemsFromDB(promo_key){
    let result = new Promise((resolve, reject) => {
      var special_list = [];
      var promo_list = [];
      var promo_return = this.promotion.FetchPromotionListItems(promo_key);
      promo_return.then((res) => {
        if(res.result == 1){
          for (let i = 0; i < res.data.length; i++) {
            res.data[i].key = res.data[i].promo_list_item_id.toString();
            var check = res.data[i].special_for_you;
            var percent = res.data[i].member_discount_percent;
            var amount = res.data[i].member_discount_amount;
            var fixed = res.data[i].member_fixed_price;

            if(check) {
              special_list.push(res.data[i]);
            }
            else {
              promo_list.push(res.data[i]);
            }

            if(percent) {
              res.data[i].display_perc = true;
              res.data[i].display_amt = false;
              res.data[i].display_fixed_price = false;
            } 
            else if(amount) {
              res.data[i].display_perc = false;
              res.data[i].display_amt = true;
              res.data[i].display_fixed_price = false;
            } 
            else if(fixed) {
              res.data[i].display_perc = false;
              res.data[i].display_amt = false;
              res.data[i].display_fixed_price = true;
            } 
            else {
              res.data[i].display_perc = false;
              res.data[i].display_amt = false;
              res.data[i].display_fixed_price = false;
            }
          }
        }
        resolve({result: 1, data:{special_list, promo_list}});
      })
    })
    return result;
  }

  getSellingPriceByBranch(branch_list, sku_item_id){
    let result = new Promise((resolve, reject) => {
      resolve(this.promotion.GetSellingPriceFromBranches(branch_list, sku_item_id));
    })
    return result
  }

  getBranchDesc(branch_id){
    let result = new Promise((resolve, reject) => {
      var branch_res = this.outletLocation.FetchBranchName(branch_id);
      branch_res.then((res) => {
        if(res.result == 1){
          resolve(res.data.desc);
        } else {
          resolve("");
        }
      })
    })
    return result;
  }

}



