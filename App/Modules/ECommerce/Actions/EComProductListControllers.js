/** REACT NATIVE **/
import React from 'react';

/** PROJECT FILES **/
import { 
  I18n,
} from '../../../Services/LibLinking';
import ECommerce from "../Modals/e_commerce";
import EComSearchAndCategoryControllers from "../Actions/EComSearchAndCategoryControllers";

/** NPM LIBRARIES **/

export default class EComProductListControllers extends React.Component {
  constructor(props){
    super(props);

    // Create modal object
    this.eCommerce = new ECommerce();
    this.eComSearchAndCategoryControllers = new EComSearchAndCategoryControllers();
  }

  getProductList(search_type, search_data, start_from){
    let result = new Promise(async(resolve, reject) => {
      if(search_type == "category"){
        // Get Category Related Child ID
        var childCatIDList = await this.eComSearchAndCategoryControllers.getRelatedChildCategoryID(search_data.level, search_data.category_id);
        var cat_id_list = childCatIDList.data ? childCatIDList.data : [search_data.category_id];
        // alert(JSON.stringify(cat_id_list));
        console.log(`${cat_id_list}`)
        // Get Product List
        resolve(this.eCommerce.FetchProductByCatList(cat_id_list, start_from));
      } else if(search_type == "keyword"){
        // Covert to upper case.
        search_data.description = search_data.description.toUpperCase();
        // Get related category id based on keyword
        var cat_id_list = [];
        var keyword_cat_return = await this.eComSearchAndCategoryControllers.productCategory.GetCatIDByKeyword(search_data.description);
        if(keyword_cat_return.result == 1){
          var cat_list = keyword_cat_return.data;
          for (let i = 0; i < cat_list.length; i++) {
            var child_cat_return = await this.eComSearchAndCategoryControllers.getRelatedChildCategoryID(cat_list[i].level, cat_list[i].category_id);
            // console.log("cat list:" + child_cat_return.data);
            cat_id_list = cat_id_list.concat(child_cat_return.data);
          }
        }
        console.log("cat_id_list:" + cat_id_list);
        // Get Product List
        resolve(this.eCommerce.FetchProductByCatListAndDesc(search_data.description, cat_id_list, start_from));
      }
    })
    return result;
  }

}
