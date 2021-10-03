/** REACT NATIVE **/
import React from 'react';

/** PROJECT FILES **/
import { 
  I18n,
} from '../../../Services/LibLinking';
import ECommerce from "../../ECommerce/Modals/e_commerce";
import ProductCategory from "../../ECommerce/Modals/product_category";

/** NPM LIBRARIES **/

export default class EComSearchAndCategoryControllers extends React.Component {
  constructor(props){
    super(props);

    // Create modal object
    this.eCommerce = new ECommerce();
    this.productCategory = new ProductCategory;
  }

  getAllCategoryData(){
    let result = new Promise(async(resolve, reject) => {
      var catLvl2_res = await this.getAllCategoryLevel2Data();
      var catLvl3_res = await this.getAllCategoryLevel3Data();

      if(catLvl2_res.result == 0 && catLvl3_res.result == 0){
        // Return error
        resolve({result: 0, data: {title: '', msg: `Error Category Level 2 - ${catLvl2_res.data.msg}. Error Category Level 3 - ${catLvl3_res.data.msg}`}});
      } else {
        var cat_lvl2_list = catLvl2_res.result == 1 ? catLvl2_res.data : [];
        var cat_lvl3_list = catLvl3_res.result == 1 ? catLvl3_res.data : [];

        resolve({result: 1, data: {cat_lvl2_list, cat_lvl3_list}});
      }
    })
    return result;
  }

  getAllCategoryLevel2Data(){
    let result = new Promise((resolve, reject) => {
      resolve(this.productCategory.GetAllCategoryLevel2());
    })
    return result;
  }

  getAllCategoryLevel3Data(){
    let result = new Promise((resolve, reject) => {
      resolve(this.productCategory.GetAllCategoryLevel3());
    })
    return result;
  }

  /**
   * Function of get related child category id list
   */
  getRelatedChildCategoryID(level, parent_category_id){
    let result = new Promise(async (resolve, reject) => {
      var cat_id_list = [parent_category_id];
      do {
        level += 1;
        var chidCatIDResult = await this.productCategory.GetChildCatIDByParentCatID(level, parent_category_id.toString());
        // alert(JSON.stringify(chidCatIDResult))
        if(chidCatIDResult.result == 1){
          if(chidCatIDResult.data.length > 0){
            // Data is not empty continue
            cat_id_list = cat_id_list.concat(chidCatIDResult.data);
            parent_category_id = chidCatIDResult.data;
            getNextChildID = true;
          } else {
            // Data is empty exit loop
            getNextChildID = false;
            resolve({result: 1, data: cat_id_list});
          }
        } else {
          // Return Error
          getNextChildID = false;
          resolve({result: 1, data: cat_id_list});
        }
      } while (getNextChildID);
    });
    return result;
  }

}
