/** REACT NATIVE **/
import { Platform } from 'react-native';

/** PROJECT FILES **/
import {
  I18n,
  AppConfig,
  ARMSDownloader, ServerCommunicator, WorldTimeAPICommunicator,
  Database,
} from '../../../Services/LibLinking';

/** NPM LIBRARIES **/
import moment from 'moment';
import md5 from "react-native-md5";

const {api_url} = AppConfig;

export default class Package {
  constructor(props){
    // super(props);

    // Create Database Object
    this.database = new Database();
    this.db = this.database.db;

    // Create Server Communicator Object
    this.armsDownloader = new ARMSDownloader();

    // Create Server Communicator Object
    this.serverCommunicator = new ServerCommunicator();
  }

  /**
   * TODO:
   *  √ Insert package data into database
   *  v Insert package items data into database
   *  √ Insert package redeem history into database
   *  √ Get package list from API
   *  √ Get package redeem history from API
   *  √ Submit rate for package redeem history to server via API
   *  √ Get sku item photo via API
   *  √ Delete package data and package items data
   *  √ Delete package redeem history
   *  √ Get package list from database
   *  √ Get package items list from database
   *  √ Get package redeem history from database based on package guid and package item guid
   *  √ Get package redeem history from database based on service rating = 0 and redeem time not more than 7 days
   */


  /***************************************************************/
  /************************ INSERT DATA **************************/
  /***************************************************************/

  /**
   * Insert package data into database
   */
  InsertPackageData(data){

    // Initiate variables
    var pk_guid = data.guid;
    var package_ref_no = data.package_ref_no;
    var pos_receipt_ref_no = data.pos_receipt_ref_no;
    var purchase_date = data.date;
    var purchase_qty = data.qty;
    var earn_entry = data.earn_entry;
    var used_entry = data.used_entry;
    var remaining_entry = data.remaining_entry;
    var package_added_datetime = data.added;
    var last_update = data.last_update;
    var package_unique_id = data.package_unique_id;
    var doc_no = data.doc_no;
    var package_title = data.title;
    var pos_branch_id = data.pos_branch_id;
    var pos_branch_code = data.pos_bcode;
    var sku_item_id = data.sku_item_id;

    var data = [];
    let sqlQuery = `INSERT INTO package_list
                    (
                      pk_guid, package_ref_no, pos_receipt_ref_no, purchase_date, purchase_qty, earn_entry,
                      used_entry, remaining_entry, package_added_datetime, last_update, package_unique_id, doc_no,
                      package_title, pos_branch_id, pos_branch_code, sku_item_id
                    )
                    VALUES(
                      ?, ?, ?, ?, ?, ?,
                      ?, ?, ?, ?, ?, ?,
                      ?, ?, ?, ?
                    );`;

    let result = new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(sqlQuery, [
          pk_guid, package_ref_no, pos_receipt_ref_no, purchase_date, purchase_qty, earn_entry,
          used_entry, remaining_entry, package_added_datetime, last_update, package_unique_id, doc_no,
          package_title, pos_branch_id, pos_branch_code, sku_item_id
        ], (tx, results) => {
          if(results.rowsAffected>0){
            var insertId = results.insertId
            data = {result:1, data: {action: 'insert', insertId: insertId}};
            resolve(data);
          } else {
            data = {result: 0, data: {title: "", msg: I18n.t("package_modal_insert_package_data_error_msg")}};
            resolve(data);
          }
        }, (err) => {
          data = {result: 0, data: {title: "Error ExecuteSQL (InsertPackageData)", msg: JSON.stringify(err)}};
          resolve(data);
        });
      }, (error) => {
        data = {result: 0, data: {title: "Error Transaction (InsertPackageData)", msg: error}};
        resolve(data);
      });
    })
    return result
  }

  /**
   * Insert package items data into database
   */
  InsertPackageItemsData(data){

    // Initiate variables
    var pk_item_guid = data.guid;
    var pk_item_title = data.title;
    var pk_item_desc = data.description;
    var remark = data.remark;
    var entry_need = data.entry_need;
    var max_redeem = data.max_redeem;
    var used_count = data.used_count;
    var sequence = data.sequence;
    var package_guid = data.package_guid;

    var data = [];
    let sqlQuery = `INSERT INTO package_list_items
                    (
                      pk_item_guid, pk_item_title, pk_item_desc, remark, entry_need, max_redeem,
                      used_count, sequence, package_guid
                    )
                    VALUES(
                      ?, ?, ?, ?, ?, ?,
                      ?, ?, ?
                    );`;

    let result = new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(sqlQuery, [
          pk_item_guid, pk_item_title, pk_item_desc, remark, entry_need, max_redeem,
          used_count, sequence, package_guid
        ], (tx, results) => {
          if(results.rowsAffected>0){
            var insertId = results.insertId
            data = {result:1, data: {action: 'insert', insertId: insertId}};
            resolve(data);
          } else {
            data = {result: 0, data: {title: "", msg: I18n.t("package_modal_insert_package_items_data_error_msg")}};
            resolve(data);
          }
        }, (err) => {
          data = {result: 0, data: {title: "Error ExecuteSQL (InsertPackageItemsData)", msg: JSON.stringify(err)}};
          resolve(data);
        });
      }, (error) => {
        data = {result: 0, data: {title: "Error Transaction (InsertPackageItemsData)", msg: error}};
        resolve(data);
      });
    })
    return result
  }

  /**
   * Insert package redeem history into database
   */
  InsertPackageRedeemHistoryData(data){

    // Initiate variables
    var pk_rh_guid = data.guid;
    var branch_id = data.branch_id;
    var branch_code = data.bcode;
    var package_guid = data.package_guid;
    var package_item_guid = data.package_items_guid;
    var redeem_date = data.date;
    var used_entry = data.used_entry;
    var service_rating = data.service_rating;
    var redeem_datetime = data.added;
    var package_title = data.package_title;
    var package_item_title = data.item_title;
    var sa_info = JSON.stringify(data.sa_info);

    var data = [];
    let sqlQuery = `INSERT INTO package_redeem_history
                    (
                      pk_rh_guid, branch_id, branch_code, package_guid, package_item_guid, redeem_date,
                      used_entry, service_rating, redeem_datetime, package_title, package_item_title, sa_info
                    )
                    VALUES(
                      ?, ?, ?, ?, ?, ?,
                      ?, ?, ?, ?, ?, ?
                    );`;

    let result = new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(sqlQuery, [
          pk_rh_guid, branch_id, branch_code, package_guid, package_item_guid, redeem_date,
          used_entry, service_rating, redeem_datetime, package_title, package_item_title, sa_info
        ], (tx, results) => {
          if(results.rowsAffected>0){
            var insertId = results.insertId
            data = {result:1, data: {action: 'insert', insertId: insertId}};
            resolve(data);
          } else {
            data = {result: 0, data: {title: "", msg: I18n.t("package_modal_insert_package_redeem_history_data_error_msg")}};
            resolve(data);
          }
        }, (err) => {
          data = {result: 0, data: {title: "Error ExecuteSQL (InsertPackageRedeemHistoryData)", msg: JSON.stringify(err)}};
          resolve(data);
        });
      }, (error) => {
        data = {result: 0, data: {title: "Error Transaction (InsertPackageRedeemHistoryData)", msg: error}};
        resolve(data);
      });
    })
    return result
  }

  /***************************************************************/
  /************************ API CALLED ***************************/
  /***************************************************************/

  /**
   * Get package list from API
   *
   * Step 1: Delete all existing package records
   * Step 2: Insert package items data
   * Step 3: Insert package data
   * Step 4: Insert package redeem history data
   */
  FetchPackageDataViaAPI(){
    let result = new Promise((resolve, reject) => {
      var formData = new FormData();
      formData.append('a','get_my_member_package_list');

      // Send to data to server communicator
      var post_return = this.serverCommunicator.PostData(formData);
      post_return.then((res) =>{
        if(res.result == 1){
          var package_list = res.package_list;
          // Step 1: Delete all existing package records
          var del_res = this.DeleteAllPackageData();
          del_res.then((res)=>{
            if(package_list.length>0){
              if(res.result == 1){
                for (let i = 0; i < package_list.length; i++) {
                  var package_guid = package_list[i].guid;
                  var package_list_items = package_list[i].item_list;
                  for (let j = 0; j < package_list_items.length; j++) {
                    package_list_items[j].package_guid = package_guid;
                    // Step 2: Insert package items data
                    this.InsertPackageItemsData(package_list_items[j]);
                  }

                  // Step 3: Insert package data
                  var insert_return = this.InsertPackageData(package_list[i]);
                  insert_return.then((res)=>{
                    if(i == package_list.length-1){
                      // resolve({result: 1, data: "Package Updated."});
                      // Step 4: Insert package redeem history data
                      resolve(this.FetchPackageRedeemHistoryDataViaAPI());
                    }
                  })
                }
              } else {
                resolve(res);
              }
            } else {
              resolve({result: 1, data: "No Data."});
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
   * Get package redeem history from API
   *
   * Step 1: Delete all existing package history records
   * Step 2: Insert package redeem history data
   *
   */
  FetchPackageRedeemHistoryDataViaAPI(){
    let result = new Promise((resolve, reject) => {
      var formData = new FormData();
      formData.append('a','get_my_member_package_redeem_history');

      // Send to data to server communicator
      var post_return = this.serverCommunicator.PostData(formData);
      post_return.then((res) =>{
        if(res.result == 1){
          var history_list = res.history_data;
          // Step 1: Delete all existing package redeem history records
          var del_res = this.DeleteAllPackageRedeemHistoryData();
          del_res.then((res)=>{
            if(history_list.length>0){
              if(res.result == 1){
                for (let i = 0; i < history_list.length; i++) {
                  // Step 2: Insert package redeem history data
                  var insert_return = this.InsertPackageRedeemHistoryData(history_list[i]);
                  insert_return.then((res)=>{
                    if(i == history_list.length-1){
                      resolve({result: 1, data: "Package Redeem History Updated."});
                    }
                  })
                }
              } else {
                resolve(res);
              }
            } else {
              resolve({result: 1, data: "No Data."});
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
   * Submit rate for package redeem history to server via API
   */
  SubmitRateDataViaAPI(redeem_guid, service_rating, sa_rating){
    let result = new Promise((resolve, reject) => {
      var formData = new FormData();
      formData.append('a', 'rate_my_member_package_redeem_history');
      formData.append('redeem_guid', redeem_guid);
      formData.append('service_rating', service_rating);
      if(sa_rating && sa_rating.length > 0){
        formData.append('sa_rating', JSON.stringify(sa_rating[0]));  //{"sa_id": "rate", "sa_id": "rate"}
      }

      // Send to data to server communicator
      var post_return = this.serverCommunicator.PostData(formData);
      post_return.then((res) =>{
        if(res.result == 1){
          resolve({result: 1, data: "Data submitted."});
        } else {
          resolve({result: 0, data: {title: "", msg: res.error_msg}});
        }
      });
    })
    return result
  }

  /**
   * Get sku item photo via API
   */
  FetchSKUItemPhotoViaAPI(sku_item_id){
    let result = new Promise((resolve, reject) => {
      var formData = new FormData();
      formData.append('a', 'get_product_details');
      formData.append('sku_item_id', sku_item_id);

      // Send to data to server communicator
      var post_return = this.serverCommunicator.PostData(formData);
      post_return.then((res) =>{
        if(res.result == 1){
          var promo_photo_url = res.promo_photo_url ? `${api_url}/${res.promo_photo_url}` : '';
          resolve({result: 1, promo_photo_url});
        } else {
          resolve({result: 0, data: {title: "", msg: res.error_msg}});
        }
      });
    })
    return result
  }

  /***************************************************************/
  /************************ DELETE DATA **************************/
  /***************************************************************/

  /**
   * Delete package data and package items data
   */
  DeleteAllPackageData(){
    let sqlQuery1 = 'DELETE FROM package_list;';
    let sqlQuery2 = 'DELETE FROM package_list_items;';

    let result = new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(sqlQuery1, '', () => {
        }, (err) => {
          data = {result: 0, data: {title: 'Error ExecuteSQL (DeleteAllPackageDataQ1)', msg: JSON.stringify(err)}}
          resolve(data)
        });
        tx.executeSql(sqlQuery2, '', () => {
        }, (err) => {
          data = {result: 0, data: {title: 'Error ExecuteSQL (DeleteAllPackageDataQ2)', msg: JSON.stringify(err)}}
          resolve(data)
        });
      }, (error) => {
        data = {result: 0, data: {title: 'Error Transaction (DeleteAllPackageData)', msg: error}}
        resolve(data)
      }, () => {
        data = {result: 1,data: ""}
        resolve(data)
      });
    })
    return result
  }

  /**
   * Delete package redeem history
   */
  DeleteAllPackageRedeemHistoryData(){
    let sqlQuery = 'DELETE FROM package_redeem_history;';

    let result = new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(sqlQuery, '', () => {
        }, (err) => {
          data = {result: 0, data: {title: 'Error ExecuteSQL (DeleteAllPackageRedeemHistoryData)', msg: JSON.stringify(err)}}
          resolve(data)
        });
      }, (error) => {
        data = {result: 0, data: {title: 'Error Transaction (DeleteAllPackageRedeemHistoryData)', msg: error}}
        resolve(data)
      }, () => {
        data = {result: 1,data: ""}
        resolve(data)
      });
    })
    return result
  }

  /***************************************************************/
  /************************ GET DATA *****************************/
  /***************************************************************/

  /**
   * Get package list from database
   */
  FetchPackageList(){
    var data = null
    let sqlQuery = `SELECT *
                    FROM package_list
                    GROUP BY pk_guid
                    ORDER BY package_added_datetime DESC`;

    let result = new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(sqlQuery, '', async(tx, results) => {
          if(results.rows.length>0){
            var item_data = [];
            for (let i = 0; i < results.rows.length; i++) {
              var photo_data = await this.FetchSKUItemPhotoViaAPI(results.rows.item(i).sku_item_id);
              results.rows.item(i).promo_photo_url = photo_data.result == 1 ? photo_data.promo_photo_url : '';
              item_data.push(results.rows.item(i));
            }
            data = {result: 1, data: item_data};
          } else {
            data = {result: 1, data: ''};
          }
          resolve(data);
        }, (err) => {
          data = {result: 0, data: {title: "Error ExecuteSQL (FetchPackageList)", msg: JSON.stringify(err)}};
          resolve(data);
        });
      }, (error) => {
        data = {result: 0, data: {title: "Error Transaction (FetchPackageList)", msg: error}};
        resolve(data);
      });
    })
    return result;
  }

  /**
   * Get package items list from database
   */
  FetchPackageItemsList(package_guid){
    var data = null
    let sqlQuery = `SELECT *
                    FROM package_list_items
                    WHERE package_guid = ?
                    GROUP BY pk_item_guid
                    ORDER BY sequence ASC`;

    let result = new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(sqlQuery, [package_guid], (tx, results) => {
          if(results.rows.length>0){
            var item_data = [];
            for (let i = 0; i < results.rows.length; i++) {
              item_data.push(results.rows.item(i));
            }
            data = {result: 1, data: item_data}
          } else {
            data = {result: 1, data: ''}
          }
          resolve(data)
        }, (err) => {
          data = {result:0,data:{title:"Error ExecuteSQL (FetchPackageItemsList)",msg:JSON.stringify(err)}}
          resolve(data)
        });
      }, (error) => {
        data = {result:0,data:{title:"Error Transaction (FetchPackageItemsList)",msg:error}}
        resolve(data)
      })
    })
    return result
  }

  /**
   * Get package redeem history from database based on package guid and package item guid
   */
  FetchPackageRedeemHistoryListByPackageItems(package_guid, package_item_guid){
    var data = null
    let sqlQuery = `SELECT *
                    FROM package_redeem_history
                    WHERE package_guid = ? AND package_item_guid = ?
                    GROUP BY pk_rh_guid
                    ORDER BY redeem_datetime DESC`;

    let result = new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(sqlQuery, [package_guid, package_item_guid], (tx, results) => {
          if(results.rows.length>0){
            var item_data = [];
            for (let i = 0; i < results.rows.length; i++) {
              item_data.push(results.rows.item(i));
            }
            data = {result: 1, data: item_data}
          } else {
            data = {result: 1, data: ''}
          }
          resolve(data)
        }, (err) => {
          data = {result:0,data:{title:"Error ExecuteSQL (FetchPackageRedeemHistoryListByPackageItems)",msg:JSON.stringify(err)}}
          resolve(data)
        });
      }, (error) => {
        data = {result:0,data:{title:"Error Transaction (FetchPackageRedeemHistoryListByPackageItems)",msg:error}}
        resolve(data)
      })
    })
    return result
  }

  /**
   * Get package redeem history from database based on service rating = 0 and redeem time not more than 7 days
   */
  async FetchPackageRedeemHistoryListByUnratedHistory(){
    var data = null

    /**
     * Get World Time
     */
    var worldTimeAPICommunicator = new WorldTimeAPICommunicator();
    var worldDateTime = await worldTimeAPICommunicator.GetRealWorldTimeDateTime();
    const rating_duration = moment(worldDateTime).subtract(7, 'days').format("YYYY-MM-DD");

    let sqlQuery = `SELECT *
                    FROM package_redeem_history
                    WHERE service_rating = 0 AND redeem_date >= ?
                    GROUP BY pk_rh_guid
                    ORDER BY redeem_datetime DESC`;

    let result = new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(sqlQuery, [rating_duration], (tx, results) => {
          if(results.rows.length>0){
            var item_data = [];
            for (let i = 0; i < results.rows.length; i++) {
              item_data.push(results.rows.item(i));
            }
            data = {result: 1, data: item_data}
          } else {
            data = {result: 1, data: ''}
          }
          resolve(data)
        }, (err) => {
          data = {result:0,data:{title:"Error ExecuteSQL (FetchPackageRedeemHistoryListByUnratedHistory)",msg:JSON.stringify(err)}}
          resolve(data)
        });
      }, (error) => {
        data = {result:0,data:{title:"Error Transaction (FetchPackageRedeemHistoryListByUnratedHistory)",msg:error}}
        resolve(data)
      })
    })
    return result
  }
}