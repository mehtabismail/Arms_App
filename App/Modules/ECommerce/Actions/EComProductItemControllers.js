/** REACT NATIVE **/
import React from 'react';

/** PROJECT FILES **/
import {
  I18n,
} from '../../../Services/LibLinking';
import ECommerce from "../Modals/e_commerce";

/** NPM LIBRARIES **/

export default class EComProductItemControllers extends React.Component {
  constructor(props) {
    super(props);

    // Create modal object
    this.eCommerce = new ECommerce();
  }

  addItemToCart(product_data) {
    let result = new Promise(async (resolve, reject) => {
      resolve(this.eCommerce.AddItemToCart(product_data));
    })
    return result;
  }

  updateQtyToCart(product_data) {
    let result = new Promise(async (resolve, reject) => {
      resolve(this.eCommerce.UpdateQtyToCart(product_data));
    })
    return result;
  }

  deleteItemFromCart(product_sku_id) {
    let result = new Promise(async (resolve, reject) => {
      resolve(this.eCommerce.DeleteItemFromCart(product_sku_id));
    })
    return result;
  }

  getCartList() {
    let result = new Promise(async (resolve, reject) => {
      resolve(this.eCommerce.FetchCartDataList());
    })
    return result;
  }

  getCartItemCount() {
    let result = new Promise((resolve, reject) => {
      var fetch_return = this.eCommerce.FetchCartItemCount();
      fetch_return.then((res) => {
        resolve(res.total_cart_item);
      });
    })
    return result;
  }

  getShippingInfo(userAddress) {
    let result = new Promise((resolve, reject) => {
      resolve(this.eCommerce.FetchShippingInfo(userAddress))
    })
    return result
  }

  addShippingData(shippingMethod) {
    let result = new Promise((resolve, reject) => {
      resolve(this.eCommerce.AddShippingData(shippingMethod))
    })
    return result
  }
}
