/** REACT NATIVE **/
import { Platform } from 'react-native';

/** PROJECT FILES **/
import { 
  AppConfig,
  ServerCommunicator,
  Database,
} from '../../../../Services/LibLinking';
import OutletLocation from '../../../OutletLocation/Modals/outlet_location';

/** NPM LIBRARIES **/
import moment from 'moment';
import md5 from "react-native-md5";

export default class POS {
  constructor(props){

    // Create Database Object
    this.database = new Database();
    this.db = this.database.db;

    // Create Server Communicator Object
    this.serverCommunicator = new ServerCommunicator();
  }

  /***************************************************************/
  /************************ INSERT DATA **************************/
  /***************************************************************/

  /**
   * Create order
   */
  CreateOrder(order_data){

    // const local_id = require('uuid/v1');
    // var created_date = moment().format('YYYY-MM-DD HH:mm:ss');
    var last_update = moment().format('YYYY-MM-DD HH:mm:ss');
    console.log("ORDER DATA: ", JSON.stringify(order_data));
    var data = [];
    let sqlQuery = `INSERT INTO order_list 
                    (
                      local_id, transaction_id, branch_id, cashier_id, status,
                      sub_total_amount, discount_amount, rounding, total_amount, cash_received,
                      change, payment, created_date, cashier_name, receipt_no,
                      counter_id, transaction_date, start_time, end_time, member_card_no,
                      updated_date, pos_settings, receipt_ref_no
                    ) 
                    VALUES(
                      ?, ?, ?, ?, ?,
                      ?, ?, ?, ?, ?,
                      ?, ?, ?, ?, ?,
                      ?, ?, ?, ?, ?,
                      ?, ?, ?
                    );`;
    
    let result = new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(sqlQuery, [
          order_data.local_id, order_data.transaction_id, order_data.branch_id, order_data.cashier_id, order_data.status,
          order_data.sub_total_amount, order_data.discount_amount, order_data.rounding, order_data.total_amount, order_data.cash_received,
          order_data.change, JSON.stringify(order_data.payment), order_data.created_date, order_data.cashier_name, order_data.receipt_no,
          order_data.counter_id, order_data.transaction_date, order_data.start_time, order_data.end_time, order_data.member_card_no,
          last_update, JSON.stringify(order_data.pos_settings), order_data.receipt_ref_no
        ], (tx, results) => { 
          if(results.rowsAffected>0){
            if(order_data.order_item.length > 0){
              resolve(this.ProcessOrderItem(order_data.order_item));
            } else {
              data = {result:1, data: {action: 'insert', insertId: results.insertId}};
            }
          } else {
            data = {result: 0, data: {title: "", msg: "Create order failed."}};
            resolve(data);
          }
        }, (err) => {
          data = {result: 0, data: {title: "Error ExecuteSQL (CreateOrder)", msg: JSON.stringify(err)}};
          resolve(data);
        });
      }, (error) => {
        data = {result: 0, data: {title: "Error Transaction (CreateOrder)", msg: error}};
        resolve(data);
      });
    });
    return result;
  }

  /**
   * Process order item
   */
  ProcessOrderItem(order_item){
    let result = new Promise((resolve, reject) => {
      if(order_item.length > 0){
        for (let i = 0; i < order_item.length; i++) {
          this.CreateOrderItem(order_item[i]).then((res) => {
            console.log("Create Order Item Result: ", res);
            if(i == order_item.length - 1){
              resolve({result: 1, data: "Order item created."});
            }
          });
        }
      } else {
        resolve({result: 1, data: "No order item."});
      }
    });
    return result;
  }

  /**
   * Create order item
   */
  CreateOrderItem(order_item){
    // console.log("Create Order Item Data: ", order_item);
    // const local_id = require('uuid/v1');
    // var created_date = moment().format('YYYY-MM-DD HH:mm:ss');
    order_item.product_image = order_item.product_image ? JSON.stringify(order_item.product_image) : '';

    var data = [];
    let sqlQuery = `INSERT INTO order_item_list 
                    (
                      local_id, transaction_id, branch_id, sku_item_id, product_name,
                      default_price, selling_price, quantity, manual_discount_amount, created_date, 
                      product_image, discount_percent, discount_amount, tax_amount, sku_item_code,
                      mcode, link_Code, artno, scanned_code, updated_date
                    ) 
                    VALUES(
                      ?, ?, ?, ?, ?,
                      ?, ?, ?, ?, ?,
                      ?, ?, ?, ?, ?,
                      ?, ?, ?, ?, ?
                    );`;
    
    let result = new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(sqlQuery, [
          order_item.local_id, order_item.transaction_id, order_item.branch_id, order_item.sku_item_id, order_item.product_name,
          order_item.default_price, order_item.selling_price, order_item.quantity, order_item.manual_discount_amount, order_item.created_date,
          order_item.product_image, order_item.discount_percent, order_item.discount_amount, order_item.tax_amount, order_item.product_codes.sku_item_code,
          order_item.product_codes.mcode, order_item.product_codes.link_Code, order_item.product_codes.artno, order_item.scanned_code, order_item.updated_date
        ], (tx, results) => { 
          if(results.rowsAffected>0){
            data = {result:1, data: {action: 'insert', insertId: results.insertId}};
            resolve(data);
          } else {
            data = {result: 0, data: {title: "", msg: "Create order item failed."}};
            resolve(data);
          }
        }, (err) => {
          data = {result: 0, data: {title: "Error ExecuteSQL (CreateOrderItem)", msg: JSON.stringify(err)}};
          resolve(data);
        });
      }, (error) => {
        data = {result: 0, data: {title: "Error Transaction (CreateOrderItem)", msg: error}};
        resolve(data);
      });
    });
    return result;
  }

  /***************************************************************/
  /************************ UPDATE DATA **************************/
  /***************************************************************/

  /**
   * Update Order Status
   */
  UpdateOrderStatus(id, status){

    var data = [];
    var last_update = moment().format('YYYY-MM-DD HH:mm:ss');
    let sqlQuery = `UPDATE order_list
                    SET status = ?, updated_date = ?, uploaded_sale_time = ?
                    WHERE id = ?;`

    let result = new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(sqlQuery, [status, last_update, last_update, id], (tx, results) => { 
          if(results.rowsAffected>0){
            console.log(`Updated Order Status - ID (${id})`);
            data = {result: 1, data: {action: 'update', msg: "Data updated."}};
            resolve(data);
          } else {
            console.log(`Update Order Status Failed - ID (${id})`);
            data = {result: 0, data: {title: "Update Order Status Failed", msg: JSON.stringify(results)}};
            resolve(data);
          }
        }, (err) => {
          console.log(`Error ExecuteSQL (UpdateOrderStatus) - ID (${id})`);
          data = {result: 0, data: {title: "Error ExecuteSQL (UpdateOrderStatus)", msg: JSON.stringify(err)}};
          resolve(err);
        });
      }, (error) => {
        console.log(`Error Transaction (UpdateOrderStatus) - ID (${id})`);
        data = {result: 0, data: {title: "Error Transaction (UpdateOrderStatus)", msg: error}};
        resolve(data);
      });
    });
    return result;
  }

  /***************************************************************/
  /************************ API CALLED ***************************/
  /***************************************************************/

  /**
   * Get product details via API
   */
  FetchProductDetailsViaAPI(barcode, branch_id){
    let result = new Promise((resolve, reject) => {
      var formData = new FormData();
      formData.append('a', 'get_product_details');
      formData.append('barcode', barcode);
      formData.append('selected_branch_id', branch_id);

      // Send to data to server communicator
      var post_return = this.serverCommunicator.PostData(formData);
      post_return.then(async(res) =>{
        console.log("Get Product Details (API): ", res);
        if(res.result == 1){
          // var prod_photo = res.photo ? {uri: `${AppConfig.api_url}/${res.photo}`} : '';
          var prod_photo = res.promo_photo_url ? {uri: `${AppConfig.api_url}/${res.promo_photo_url}`} : '';

          resolve({result: 1, data: {
            // product details
            sku_item_id: res.id,
            description: res.description ? res.description : '',
            // location: res.location ? res.location : '',
            stock_qty: res.stock_qty ? res.stock_qty : '',
            // department: res.category_tree.length >= 2 ? res.category_tree[1].description : '',
            category: res.category_tree && res.category_tree.length >= 3 ? res.category_tree[2].description : '',
            sub_category: res.category_tree && res.category_tree.length >= 4 ? res.category_tree[3].description : '',
            photo: prod_photo,
            internal_description: res.internal_description ? res.internal_description : '',

            // Product Codes
            sku_item_code: res.sku_item_code,
            mcode: res.mcode, 
            link_Code: res.link_Code, 
            artno: res.artno,

            // price list
            default_price: res.default_price ? res.default_price : '',
            member_price: res.member_price ? res.member_price : '',
            member_discount: res.member_discount ? res.member_discount : '',
            // member_date_from: res.member_date_from ? res.member_date_from : '',
            // member_date_to: res.member_date_to ? res.member_date_to: '',
            non_member_price: res.non_member_price ? res.non_member_price : '',
            non_member_discount: res.non_member_discount ? res.non_member_discount : '',
            // non_member_date_from: res.non_member_date_from ? res.non_member_date_from : '',
            // non_member_date_to: res.non_member_date_to ? res.non_member_date_to : ''
            member_type_cat_discount: res.member_type_cat_discount && Object.keys(res.member_type_cat_discount).length > 0 ? res.member_type_cat_discount : {}
          }})
        } else {
          resolve({result: 0, data: {title: "", msg: res.error_msg}});
        }
      });
    });
    return result;
  }

  /**
   * Upload order via API to ARMS Backend
   */
  UploadOrderViaAPI(data_list){
    let result = new Promise((resolve, reject) => {
      var formData = new FormData();
      formData.append('a', 'upload_pos');
      formData.append('handler', 'pos');
      formData.append('data_list', JSON.stringify(data_list));
      console.log("Data List: " + JSON.stringify(data_list));

      // Send to data to server communicator
      var post_return = this.serverCommunicator.PostData(formData);
      post_return.then(async(res) =>{
        console.log("Upload POS (Product Modal): ", res);
        if(res.result == 1){
          // Mark Order Status To "Uploaded"
          if(res.success_id_list && res.success_id_list.length > 0){
            for (let i = 0; i < res.success_id_list.length; i++) {
              this.UpdateOrderStatus(res.success_id_list[i], "Uploaded");
            }
          }

          resolve({
            result: 1, 
            data: {
              success_id_list: res.success_id_list,
              error: res.err
            }});
        } else {
          resolve({result: 0, data: {title: "", msg: res.error_msg}});
        }
      });
    });
    return result;
  }

  /**
   * Get branches details via API
   */
  GetPOSSettingsViaAPI(branch_id){
    let result = new Promise((resolve, reject) => {
      var formData = new FormData();
      formData.append('a', 'get_pos_settings');
      formData.append('handler', 'pos');
      formData.append('setting_list', JSON.stringify(['use_running_no_as_receipt_no', 'receipt_header', 'receipt_footer', 'ewallet_type', 'hour_start', 'minute_start']));
      formData.append('branch_id', branch_id);

      // Send to data to server communicator
      var post_return = this.serverCommunicator.PostData(formData);
      post_return.then(async (res) =>{
        console.log("POS Settings: ", JSON.stringify(res));
        // try{
        //   await AsyncStorage.setItem("pos_settings", JSON.stringify(res.data));
        // } catch (e) {
        //   console.log("Add POS Settings Error: ", e);
        // }
        // resolve(res);
        if(res.result == 1){
          var pos_settings_obj = res.data;
          var pos_settings = {};
          for (let i = 0; i < pos_settings_obj.length; i++) {
            pos_settings[pos_settings_obj[i].setting_name] = pos_settings_obj[i].setting_value;
          }
          resolve({result: 1, data: {pos_settings}});
        } else {
          resolve({result: 0, data: {title: "", msg: res.error_msg}});
        }
      });
    });
    return result;
  }

  /***************************************************************/
  /************************ FETCH DATA ***************************/
  /***************************************************************/
  
  /**
   * Fetch Order By Local ID
   */
  FetchOrderByLocalID(local_id){
    var data = null
    let sqlQuery = `SELECT *
                    FROM order_list
                    WHERE local_id = ? `;
    
    let result = new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(sqlQuery, [local_id], (tx, results) => {
          results.rows.item(0).payment = JSON.parse(results.rows.item(0).payment);
          results.rows.item(0).pos_settings = JSON.parse(results.rows.item(0).pos_settings);
          data = {result: 1, data: results.rows.item(0)};
          resolve(data);
        }, (err) => {
          data = {result:0,data:{title:"Error ExecuteSQL (FetchOrderByLocalID)",msg:JSON.stringify(err)}};
          resolve(data);
        });
      }, (error) => {
        data = {result:0,data:{title:"Error Transaction (FetchOrderByLocalID)",msg:error}};
        resolve(data);
      })
    })
    return result;
  }

  /**
   * Fetch Order By Status
   */
  FetchOrderByStatus(status){
    var data = null
    let sqlQuery = `SELECT *
                    FROM order_list
                    WHERE status = ? `;
    
    let result = new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(sqlQuery, [status], async(tx, results) => {
          if(results.rows.length > 0){
            var item = [];
            for (let i = 0; i < results.rows.length; i++) {
              results.rows.item(i).payment = JSON.parse(results.rows.item(i).payment);
              results.rows.item(i).pos_settings = JSON.parse(results.rows.item(i).pos_settings);
              var local_id = results.rows.item(i).local_id;
              // Get Order Items
              var order_item_res = await this.FetchOrderItemByLocalID(local_id);
              if(order_item_res.result == 1){
                // console.log("ORDER ITEMS: ", JSON.stringify(order_item_res.data));
                results.rows.item(i).order_item = order_item_res.data;
              }
              item.push(results.rows.item(i));
            }
            data = {result: 1, data: item};
          } else {
            data = {result: 1, data: ''};
          }
          resolve(data);
        }, (err) => {
          data = {result: 0, data: {title: "Error ExecuteSQL (FetchOrderByStatus)", msg: JSON.stringify(err)}};
          resolve(data);
        });
      }, (error) => {
        data = {result: 0, data: {title: "Error Transaction (FetchOrderByStatus)", msg: error}};
        resolve(data);
      })
    })
    return result;
  }

  /**
   * Fetch Order Item By Local ID
   */
  FetchOrderItemByLocalID(local_id){
    var data = null
    let sqlQuery = `SELECT *
                    FROM order_item_list
                    WHERE local_id = ? `;
    
    let result = new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(sqlQuery, [local_id], (tx, results) => {
          if(results.rows.length>0){
            var order_item = [];
            for (let i = 0; i < results.rows.length; i++) {
              order_item.push(results.rows.item(i));
            }
            data = {result: 1, data: order_item};
          } else {
            data = {result: 1, data: ''};
          }
          resolve(data);
        }, (err) => {
          data = {result:0,data:{title:"Error ExecuteSQL (FetchOrderItemByLocalID)",msg:JSON.stringify(err)}};
          resolve(data);
        });
      }, (error) => {
        data = {result:0,data:{title:"Error Transaction (FetchOrderItemByLocalID)",msg:error}};
        resolve(data);
      })
    })
    return result;
  }

  /**
   * Fetch Order By Member Card No
   */
  FetchOrderByMemberCardNo(member_card_no){
    var member_card_no_condition = member_card_no ? `member_card_no = '${member_card_no}'` : `member_card_no = ''`;
    var data = null
    let sqlQuery = `SELECT *
                    FROM order_list
                    WHERE ${member_card_no_condition}`;
    
    let result = new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(sqlQuery, [], async(tx, results) => {
          if(results.rows.length > 0){
            var item = [];
            var outletLocation = new OutletLocation();

            for (let i = 0; i < results.rows.length; i++) {
              var outletResponse = await outletLocation.FetchBranchName(results.rows.item(i).branch_id);
              results.rows.item(i).branch_name = outletResponse.result == 1 && outletResponse.data ? outletResponse.data.desc : ''; 
              results.rows.item(i).payment = JSON.parse(results.rows.item(i).payment);
              results.rows.item(i).pos_settings = JSON.parse(results.rows.item(i).pos_settings);
              var local_id = results.rows.item(i).local_id;
              // Get Order Items
              var order_item_res = await this.FetchOrderItemByLocalID(local_id);
              if(order_item_res.result == 1){
                // console.log("ORDER ITEMS: ", JSON.stringify(order_item_res.data));
                results.rows.item(i).order_item = order_item_res.data;
              }
              item.push(results.rows.item(i));
            }
            data = {result: 1, data: item};
          } else {
            data = {result: 1, data: ''};
          }
          resolve(data);
        }, (err) => {
          data = {result: 0, data: {title: "Error ExecuteSQL (FetchOrderByMemberCardNo)", msg: JSON.stringify(err)}};
          resolve(data);
        });
      }, (error) => {
        data = {result: 0, data: {title: "Error Transaction (FetchOrderByMemberCardNo)", msg: error}};
        resolve(data);
      })
    })
    return result;
  }

  /**
   * Get Latest Receipt No from oder
   */
  GetLatestReceiptNo(branch_id, counter_id, transaction_date){
    var data = null
    let sqlQuery = `SELECT receipt_no
                    FROM order_list
                    WHERE branch_id = ? AND counter_id = ? AND transaction_date = ? 
                    ORDER BY receipt_no DESC `;
    
    let result = new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(sqlQuery, [branch_id, counter_id, transaction_date], async(tx, results) => {
          if(results.rows.length > 0){
            data = {result: 1, data: results.rows.item(0)};
          } else {
            data = {result: 1, data: ''};
          }
          resolve(data);
        }, (err) => {
          data = {result: 0, data: {title: "Error ExecuteSQL (GetLatestReceiptNo)", msg: JSON.stringify(err)}};
          resolve(data);
        });
      }, (error) => {
        data = {result: 0, data: {title: "Error Transaction (GetLatestReceiptNo)", msg: error}};
        resolve(data);
      });
    });
    return result;
  }

  /**
   * Validation Receipt No From Order List
   */
  ValidationReceiptNo(branch_id, counter_id, receipt_no, transaction_date){
    var data = null
    let sqlQuery = `SELECT *
                    FROM order_list
                    WHERE branch_id = ? AND counter_id = ? AND receipt_no = ? AND transaction_date = ? `;
    
    let result = new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(sqlQuery, [branch_id, counter_id, receipt_no, transaction_date], async(tx, results) => {
          data = {result: 1, data: {receipt_no_existed: results.rows.length > 0 ? 1 : 0}};
          resolve(data);
        }, (err) => {
          data = {result: 0, data: {title: "Error ExecuteSQL (ValidationReceiptNo)", msg: JSON.stringify(err)}};
          resolve(data);
        });
      }, (error) => {
        data = {result: 0, data: {title: "Error Transaction (ValidationReceiptNo)", msg: error}};
        resolve(data);
      });
    });
    return result;
  }

  /***************************************************************/
  /************************ DELETE DATA **************************/
  /***************************************************************/


}