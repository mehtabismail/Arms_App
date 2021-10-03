/** REACT NATIVE **/
import React from 'react';

/** PROJECT FILES **/
import { 
  I18n,
} from '../../../Services/LibLinking';
import ECommerce from "../../ECommerce/Modals/e_commerce";
import ProductCategory from "../../ECommerce/Modals/product_category";

/** NPM LIBRARIES **/

export default class EComLandingControllers extends React.Component {
  constructor(props){
    super(props);

    // Create modal object
    this.eCommerce = new ECommerce();
    this.productCategory = new ProductCategory;
  }

  initECommerceLandingScreen(){
    let result = new Promise((resolve, reject) => {
      resolve(this.productCategory.FetchCategory());
    })
    return result;
  }

  getRandom8CategoryData(){
    let result = new Promise((resolve, reject) => {
      resolve(this.productCategory.GetRandom8Category());
    })
    return result;
  }

  getDailyDiscoverProducts(start_from){
    let result = new Promise((resolve, reject) => {
      resolve(this.eCommerce.FetchFeaturedProduct(start_from));
      // resolve(this.eCommerce.FetchProduct(start_from));
    })
    return result;
  }

  getProduct(){
    let result = new Promise((resolve, reject) => {
      resolve(this.eCommerce.FetchProduct());
    })
    return result;
  }

  getCartItemCount(){
    let result = new Promise((resolve, reject) => {
      var fetch_return = this.eCommerce.FetchCartItemCount();
      fetch_return.then((res)=>{
        resolve(res.total_cart_item);
      });
    })
    return result;
  }
}
