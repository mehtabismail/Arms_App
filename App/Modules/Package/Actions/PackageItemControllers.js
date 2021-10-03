/** REACT NATIVE **/
import React from 'react';

/** PROJECT FILES **/
import Package from "../Modals/package_modal";

/** NPM LIBRARIES **/

export default class PromotionProductController extends React.Component {
  constructor(props){
    super(props);

    this.navigation = (props)?props.navigation:'';

    // Create cycle count object
    this.package = new Package();
  }

  /** Screen Initiate **/
  initScreen(package_id){
    let result = new Promise((resolve, reject) => {
      var fetch_data = this.package.FetchPackageItemsList(package_id);
      fetch_data.then((res) => {
        if(res.data){
          if(res.result == 1){
            for (let i = 0; i < res.data.length; i++) {
              res.data[i].key = res.data[i].pk_item_id.toString();
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
  /** END of Screen Initiate **/
}
