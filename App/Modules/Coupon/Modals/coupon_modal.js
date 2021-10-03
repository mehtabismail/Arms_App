/** REACT NATIVE **/
import FormData from 'FormData';

/** PROJECT FILES **/
import { 
  I18n,
  ServerCommunicator,
  Database
} from '../../../Services/LibLinking';

/** NPM LIBRARIES **/


export default class Coupon {
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
   * √ Insert coupon data by nric
   * √ Delete coupon data by nric
   * √ Get coupon data list
   * √ Get coupon data from server
   * - 
   */

  /***********************************************/
  /*************** Coupon Data *******************/
  /***********************************************/

  /**
   * Insert Coupon Data
   */
  InsertCouponData(data){
      
    // Initiate variables
    var cp_id = data.cp_id;
    var full_coupon_code = data.full_coupon_code;
    var value = data.value;
    var discount_by = data.discount_by;
    var member_limit_count = data.member_limit_count;
    var total_used_count = data.total_used_count;
    var valid_from = data.valid_from;
    var valid_to = data.valid_to;
    var time_from = data.time_from;
    var time_to = data.time_to;
    var min_qty = data.min_qty;
    var min_amt = data.min_amt;
    var min_receipt_amt = data.min_receipt_amt;
    var remark = data.remark;
    var limit_sid_list = JSON.stringify(data.limit_sid_list);
    var dept_id = data.dept_id;
    var dept_desc = data.dept_desc;
    var brand_id = data.brand_id;
    var brand_desc = data.brand_desc;
    var vendor_id = data.vendor_id;
    var vendor_desc = data.vendor_desc;
    var member_limit_mobile_day_start = data.member_limit_mobile_day_start;
    var member_limit_mobile_day_end = data.member_limit_mobile_day_end;
    var member_limit_profile_info = JSON.stringify(data.member_limit_profile_info);

    var data = [];
    let sqlQuery = `INSERT INTO coupon_list 
                    (
                      cp_id, full_coupon_code, value, discount_by, member_limit_count, total_used_count,
                      valid_from, valid_to, time_from, time_to, min_qty, min_amt, min_receipt_amt, remark,
                      limit_sid_list, dept_id, dept_desc, brand_id, brand_desc, vendor_id, vendor_desc,
                      member_limit_mobile_day_start, member_limit_mobile_day_end, member_limit_profile_info
                    ) 
                    VALUES(
                      ?, ?, ?, ?, ?, ?, ?,
                      ?, ?, ?, ?, ?, ?, ?, 
                      ?, ?, ?, ?, ?, ?, ?,
                      ?, ?, ?
                    );`;
    
    let result = new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(sqlQuery, [
          cp_id, full_coupon_code, value, discount_by, member_limit_count, total_used_count,
          valid_from, valid_to, time_from, time_to, min_qty, min_amt, min_receipt_amt, remark,
          limit_sid_list, dept_id, dept_desc, brand_id, brand_desc, vendor_id, vendor_desc,
          member_limit_mobile_day_start, member_limit_mobile_day_end, member_limit_profile_info
        ], (tx, results) => { 
          if(results.rowsAffected>0){
            var insertId = results.insertId
            data = {result:1, data: {action: 'insert', insertId: insertId}};
            resolve(data);
          } else {
            data = {result: 0, data: {title: "", msg: I18n.t("coupon_modal_insert_coupon_data_error_msg")}};
            resolve(data);
          }
        }, (err) => {
          data = {result: 0, data: {title: "Error ExecuteSQL (InsertCouponData)", msg: JSON.stringify(err)}};
          resolve(data);
        });
      }, (error) => {
        data = {result: 0, data: {title: "Error Transaction (InsertCouponData)", msg: error}};
        resolve(data);
      });
    })
    return result
  }

  /**
   * Delete All Coupon Records
   */
  DeleteAllCouponData(){
    let sqlQuery = 'DELETE FROM coupon_list;';
    
    let result = new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(sqlQuery, '', () => { 
        }, (err) => {
          data = {result: 0, data: {title: 'Error ExecuteSQL (DeleteAllCouponData)', msg: JSON.stringify(err)}}
          resolve(data)
        });
      }, (error) => {
        data = {result: 0, data: {title: 'Error Transaction (DeleteAllCouponData)', msg: error}}
        resolve(data)
      }, () => {
        data = {result: 1,data: ""}
        resolve(data)
      });
    })
    return result
  }

  /**
   * Get Coupon list from server
   */
  FetchCouponListViaAPI(){
    let result = new Promise((resolve, reject) => {
      var formData = new FormData();
      formData.append('a','get_my_member_coupon_list');

      // Send to data to server communicator
      var post_return = this.serverCommunicator.PostData(formData);
      post_return.then((res) =>{
        if(res.result == 1){
          var coupon_list = res.coupon_list;
          // Step 1: Delete all existing coupon records
          var del_res = this.DeleteAllCouponData();
          del_res.then((res)=>{
            if(coupon_list.length>0){
              if(res.result == 1){
                for (let i = 0; i < coupon_list.length; i++) {
                  // Step 2: Insert all coupon data
                  var coupon_insert_return = this.InsertCouponData(coupon_list[i]);
                  coupon_insert_return.then((res)=>{
                    if(i == coupon_list.length-1){
                      resolve({result: 1, data: "Coupon Updated."});
                    }
                  })
                }
              } else {
                resolve(res);
              }
            } else {
              resolve({result: 1, data: "No coupon available in this moment."});
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
   * Return Coupon List
   */
  FetchCouponList(){
    var data = null
    let sqlQuery = `SELECT * FROM coupon_list GROUP BY full_coupon_code ORDER BY valid_to ASC`;
    
    let result = new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(sqlQuery, '', (tx, results) => {
          if(results.rows.length>0){
            var coupon_data = [];
            for (let i = 0; i < results.rows.length; i++) {
              coupon_data.push(results.rows.item(i));
            }
            data = {result: 1, data: coupon_data}
          } else {
            data = {result: 1, data: ''}
          }
          resolve(data)
        }, (err) => {
          data = {result:0,data:{title:"Error ExecuteSQL (FetchCouponList)",msg:JSON.stringify(err)}}
          resolve(data)
        });
      }, (error) => {
        data = {result:0,data:{title:"Error Transaction (FetchCouponList)",msg:error}}
        resolve(data)
      })
    })
    return result
  }

  /**
   * Get sku Description by sku id from ARMS backend via API
   */
  FetchSkuDescriptionBySkuIdViaAPI(sku_item_id){
    let result = new Promise((resolve, reject) => {
      var formData = new FormData();
      formData.append('a','get_product_details');
      formData.append('sku_item_id', sku_item_id);

      // Send to data to server communicator
      var post_return = this.serverCommunicator.PostData(formData);
      post_return.then((res) =>{
        resolve(res);
      });
    })
    return result
  }

  /**
   * Get sku description by sku id from coupon
   */
  GetSkuDescriptionFromSkuId(limit_sid_list){
    let result = new Promise(async (resolve, reject) => {
      var description = [];
      for (let i = 0; i < limit_sid_list.length; i++) {
        var sku_data = await this.FetchSkuDescriptionBySkuIdViaAPI(limit_sid_list[i].sku_id);
        limit_sid_list[i].sku_desc = sku_data.result == 1 ? sku_data.description : '';
        description.push(limit_sid_list[i].sku_desc)
      }
      resolve({result: 1, data: limit_sid_list, desc: description});
    })
    return result
  }
}