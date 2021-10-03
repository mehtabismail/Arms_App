/** REACT NATIVE **/
import FormData from 'FormData';

/** PROJECT FILES **/
import { 
  I18n,
  ServerCommunicator,
  Database,
} from '../../../Services/LibLinking';

/** NPM LIBRARIES **/

export default class Promotion {
  constructor(props){
    // super(props);

    // Create Database Object
    this.database = new Database();
    this.db = this.database.db;

    // Create Server Communicator Object
    this.serverCommunicator = new ServerCommunicator();
  }

  /**
   * TODO:
   * √ Insert Promo List
   * √ Insert Promo List Items
   * √ Delete All Promotion Data
   * √ Get promo list via API
   * √ Get SKU's details via API
   * √ Get promo list from db
   * 
   * KIV
   * - Update Promotion Data
   */

  /***********************************************/
  /************* Promotion Data ******************/
  /***********************************************/

  /**
   * Insert Promotion List
   */
  InsertPromoList(data){
      
    // Initiate variables
    var promo_key = data.promo_key;
    // var nric = data.nric;
    var title = data.title;
    var date_from = data.date_from;
    var date_to = data.date_to;
    var time_from = data.time_from;
    var time_to = data.time_to;
    var banner_vertical_1 = data.banner_vertical_1;
    var promo_branch_id = JSON.stringify(data.promo_branch_id);

    var data = [];
    let sqlQuery = `INSERT INTO promotion_list
                    (
                      promo_key, title, date_from, date_to, time_from, 
                      time_to, banner_vertical_1, promo_branch_id
                    ) 
                    VALUES(
                      ?, ?, ?, ?, ?, 
                      ?, ?, ?
                    );`;
    
    let result = new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(sqlQuery, [
          promo_key, title, date_from, date_to, time_from, 
          time_to, banner_vertical_1, promo_branch_id
        ], (tx, results) => { 
          if(results.rowsAffected>0){
            var insertId = results.insertId
            data = {result:1, data: {action: 'insert', insertId: insertId}};
            resolve(data);
          } else {
            data = {result: 0, data: {title: "", msg: I18n.t("promo_modal_insert_promo_list_error_msg")}};
            resolve(data);
          }
        }, (err) => {
          data = {result: 0, data: {title: "Error ExecuteSQL (InsertPromoList)", msg: JSON.stringify(err)}};
          resolve(data);
        });
      }, (error) => {
        data = {result: 0, data: {title: "Error Transaction (InsertPromoList)", msg: error}};
        resolve(data);
      });
    })
    return result
  }

  /**
   * Insert Promotion List Items
   */
  InsertPromoListItems(data){
      
    // Initiate variables
    var promo_key = data.promo_key;
    var sku_item_id = data.sku_item_id;
    var sku_desc = data.sku_description;
    var sku_photo = (data.sku_photo_list.length>0) ? data.sku_photo_list[0].abs_path : '';
    var promo_photo_url = (data.promo_photo_url) ? data.promo_photo_url : sku_photo;
    var member_discount_percent = data.member_discount_percent;
    var member_discount_amount = data.member_discount_amount;
    var member_fixed_price = data.member_fixed_price;
    var non_member_discount_percent = data.non_member_discount_percent;
    var non_member_discount_amount = data.non_member_discount_amount;
    var non_member_fixed_price = data.non_member_fixed_price;
    var special_for_you = data.special_for_you;
    var selling_price = data.selling_price;

    // Add allowed member type
    var allowed_dis_member_type = [] 
    var allowed_dis_member_type_desc =[];
    if(data.allowed_member_type){
      if(data.allowed_member_type.length > 0){
        for (let i = 0; i < data.allowed_member_type.length; i++) {
          allowed_dis_member_type.push(data.allowed_member_type[i].member_type);
          allowed_dis_member_type_desc.push(data.allowed_member_type[i].member_type_desc);
        }
      }
    }

    var data = [];
    let sqlQuery = `INSERT INTO promotion_list_items 
                    (
                      promo_key, sku_item_id, sku_desc, promo_photo_url, member_discount_percent, member_discount_amount, 
                      member_fixed_price, non_member_discount_percent, non_member_discount_amount, non_member_fixed_price, special_for_you, selling_price,
                      allowed_dis_member_type, allowed_dis_member_type_desc
                    ) 
                    VALUES(
                      ?, ?, ?, ?, ?, ?, 
                      ?, ?, ?, ?, ?, ?,
                      ?, ?
                    );`;
    
    let result = new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(sqlQuery, [
          promo_key, sku_item_id, sku_desc, promo_photo_url, member_discount_percent, member_discount_amount, 
          member_fixed_price, non_member_discount_percent, non_member_discount_amount, non_member_fixed_price, special_for_you, selling_price,
          JSON.stringify(allowed_dis_member_type), JSON.stringify(allowed_dis_member_type_desc)
        ], (tx, results) => { 
          if(results.rowsAffected>0){
            var insertId = results.insertId
            data = {result:1, data: {action: 'insert', insertId: insertId}};
            resolve(data);
          } else {
            data = {result: 0, data: {title: "", msg: I18n.t("promo_modal_insert_promo_list_items_error_msg")}};
            resolve(data);
          }
        }, (err) => {
          data = {result: 0, data: {title: "Error ExecuteSQL (InsertPromoListItems)", msg: JSON.stringify(err)}};
          resolve(data);
        });
      }, (error) => {
        data = {result: 0, data: {title: "Error Transaction (InsertPromoListItems)", msg: error}};
        resolve(data);
      });
    })
    return result
  }

  /**
   * Delete All Promo Records (Include promotion_list & promotion_list_items)
   */
  DeleteAllPromoData(){
    let sqlQuery1 = 'DELETE FROM promotion_list;';
    let sqlQuery2 = 'DELETE FROM promotion_list_items;';
    
    let result = new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(sqlQuery1, '', () => { 
        }, (err) => {
          data = {result: 0, data: {title: 'Error ExecuteSQL (DeleteAllPromoDataQ1)', msg: JSON.stringify(err)}}
          resolve(data)
        });
        tx.executeSql(sqlQuery2, '', () => { 
        }, (err) => {
          data = {result: 0, data: {title: 'Error ExecuteSQL (DeleteAllPromoDataQ2)', msg: JSON.stringify(err)}}
          resolve(data)
        });
      }, (error) => {
        data = {result: 0, data: {title: 'Error Transaction (DeleteAllPromoData)', msg: error}}
        resolve(data)
      }, () => {
        data = {result: 1,data: ""}
        resolve(data)
      });
    })
    return result
  }

  /**
   * Get promotion list from server
   */
  FetchPromoListViaAPI(){
    let result = new Promise((resolve, reject) => {
      var formData = new FormData();
      formData.append('a','get_my_member_promotion_list');

      // Send to data to server communicator
      var post_return = this.serverCommunicator.PostData(formData);
      post_return.then((res) =>{
        if(res.result == 1){
          var promo_list = res.promo_list;
          // Step 1: Delete all existing promo records
          var del_res = this.DeleteAllPromoData();
          del_res.then((res)=>{
            if(promo_list.length>0){
              if(res.result == 1){
                for (let i = 0; i < promo_list.length; i++) {
                  var promo_key = promo_list[i].promo_key;
                  var promo_list_items = promo_list[i].item_list;
                  for (let j = 0; j < promo_list_items.length; j++) {
                    promo_list_items[j].promo_key = promo_key;
                    
                    // Step 2: Insert All Promotion Items List Data
                    this.InsertPromoListItems(promo_list_items[j]);
                  }
                  
                  // Step 3: Insert All Promotion List Data
                  var promo_insert_return = this.InsertPromoList(promo_list[i]);
                  promo_insert_return.then((res)=>{
                    if(i == promo_list.length-1){
                      resolve({result: 1, data: "Promotion Updated."});
                    }
                  })
                }
              } else {
                resolve(res);
              }
            } else {
              resolve({result: 1, data: "No promotion available in this moment."});
            }
          })   
        } else {
          resolve({result: 0, data: {title: "", msg: res.error_msg}});
        }
      });
    })
    return result
  }

  /**
   * Return Promotion List
   */
  FetchPromotionList(){
    var data = null
    let sqlQuery = `SELECT * FROM promotion_list ORDER BY date_from DESC`;
    
    let result = new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(sqlQuery, '', (tx, results) => {
          var promo_data = [];
          for (let i = 0; i < results.rows.length; i++) {
            promo_data.push(results.rows.item(i));
          }
          data = {result: 1, data: promo_data}
          resolve(data)
        }, (err) => {
          data = {result:0,data:{title:"Error ExecuteSQL (FetchPromotionList)",msg:JSON.stringify(err)}}
          resolve(data)
        });
      }, (error) => {
        data = {result:0,data:{title:"Error Transaction (FetchPromotionList)",msg:error}}
        resolve(data)
      })
    })
    return result
  }

  /**
   * Return Promotion List Items
   */
  FetchPromotionListItems(promo_key){
    var data = null
    let sqlQuery = `SELECT * 
                    FROM promotion_list_items
                    WHERE promo_key = ?
                    GROUP BY sku_item_id `;
    
    let result = new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(sqlQuery, [promo_key], (tx, results) => {
          var promo_data = [];
          for (let i = 0; i < results.rows.length; i++) {
            promo_data.push(results.rows.item(i));
          }
          data = {result: 1, data: promo_data}
          resolve(data)
        }, (err) => {
          data = {result:0,data:{title:"Error ExecuteSQL (FetchPromotionListItems)",msg:JSON.stringify(err)}}
          resolve(data)
        });
      }, (error) => {
        data = {result:0,data:{title:"Error Transaction (FetchPromotionListItems)",msg:error}}
        resolve(data)
      })
    })
    return result
  }

  /**
   * Get price by branch from ARMS backend via API
   */
  FetchPriceByBranchViaAPI(branch_id, sku_item_id){
    let result = new Promise((resolve, reject) => {
      var formData = new FormData();
      formData.append('a','get_product_details');
      formData.append('sku_item_id', sku_item_id);
      formData.append('selected_branch_id', branch_id);

      // Send to data to server communicator
      var post_return = this.serverCommunicator.PostData(formData);
      post_return.then((res) =>{
        resolve(res);
      });
    })
    return result
  }

  /**
   * Add selling price into branch list based on branch id
   */
  GetSellingPriceFromBranches(branch_list, sku_item_id){
    let result = new Promise(async (resolve, reject) => {
      for (let i = 0; i < branch_list.length; i++) {
        var branch_data = await this.FetchPriceByBranchViaAPI(branch_list[i].branch_id, sku_item_id);
        branch_list[i].selling_price = branch_data.result == 1 ? branch_data.default_price : 0;
      }
      resolve({result: 1, data: branch_list});
    })
    return result
  }
}