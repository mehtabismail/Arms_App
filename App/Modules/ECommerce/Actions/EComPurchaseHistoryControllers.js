/** REACT NATIVE **/
import React from 'react';

/** PROJECT FILES **/
import { 
  I18n,
} from '../../../Services/LibLinking';
import ECommerce from "../Modals/e_commerce";

/** NPM LIBRARIES **/

export default class EComPurchaseHistoryControllers extends React.Component {
  constructor(props){
    super(props);

    // Create modal object
    this.eCommerce = new ECommerce();
  }

  getPurchaseHistory(){
    let result = new Promise(async(resolve, reject) => {
      resolve(this.eCommerce.FetchPurchaseHistory());
    })
    return result;
  }

}
