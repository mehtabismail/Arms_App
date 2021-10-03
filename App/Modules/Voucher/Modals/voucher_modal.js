/** REACT NATIVE **/
import FormData from 'FormData';

/** PROJECT FILES **/
import { 
  I18n,
  ServerCommunicator,
  Database,
} from '../../../Services/LibLinking';

/** NPM LIBRARIES **/

export default class Voucher {
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
   * √ Insert voucher data by nric
   * √ Delete voucher data by nric
   * √ Get voucher data list
   * √ Get voucher data from server
   * - 
   */

  /***********************************************/
  /*************** Voucher Data *******************/
  /***********************************************/

  /**
   * Insert Voucher Data
   */
  InsertVoucherData(data){
      
    // Initiate variables
    var voucher_id = data.voucher_id;
    var batch_id = data.batch_id;
    var voucher_value = data.voucher_value;
    var active = data.active;
    var activated_time = data.activated_time;
    var valid_from = data.valid_from;
    var valid_to = data.valid_to;
    var cancelled = data.cancelled;
    var voucher_barcode = data.voucher_barcode;
    var voucher_used = data.voucher_used;
    var used_time = data.used_time;
    var used_receipt_ref_no = data.used_receipt_ref_no;

    var data = [];
    let sqlQuery = `INSERT INTO voucher_list 
                    (
                      voucher_id, batch_id, voucher_value, active, activated_time, valid_from,
                      valid_to, cancelled, voucher_barcode, voucher_used, used_time, used_receipt_ref_no
                    ) 
                    VALUES(
                      ?, ?, ?, ?, ?, ?,
                      ?, ?, ?, ?, ?, ?
                    );`;
    
    let result = new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(sqlQuery, [
          voucher_id, batch_id, voucher_value, active, activated_time, valid_from,
          valid_to, cancelled, voucher_barcode, voucher_used, used_time, used_receipt_ref_no
        ], (tx, results) => { 
          if(results.rowsAffected>0){
            var insertId = results.insertId
            data = {result:1, data: {action: 'insert', insertId: insertId}};
            resolve(data);
          } else {
            data = {result: 0, data: {title: "", msg: I18n.t("voucher_modal_insert_voucher_data_error_msg")}};
            resolve(data);
          }
        }, (err) => {
          data = {result: 0, data: {title: "Error ExecuteSQL (InsertVoucherData)", msg: JSON.stringify(err)}};
          resolve(data);
        });
      }, (error) => {
        data = {result: 0, data: {title: "Error Transaction (InsertVoucherData)", msg: error}};
        resolve(data);
      });
    })
    return result
  }

  /**
   * Delete All Voucher Records
   */
  DeleteAllVoucherData(){
    let sqlQuery = 'DELETE FROM voucher_list;';
    
    let result = new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(sqlQuery, '', () => { 
        }, (err) => {
          data = {result: 0, data: {title: 'Error ExecuteSQL (DeleteAllVoucherData)', msg: JSON.stringify(err)}}
          resolve(data)
        });
      }, (error) => {
        data = {result: 0, data: {title: 'Error Transaction (DeleteAllVoucherData)', msg: error}}
        resolve(data)
      }, () => {
        data = {result: 1,data: ""}
        resolve(data)
      });
    })
    return result
  }

  /**
   * Get voucher list from server
   */
  FetchVoucherListViaAPI(){
    let result = new Promise((resolve, reject) => {
      var formData = new FormData();
      formData.append('a','get_my_member_voucher_list');

      // Send to data to server communicator
      var post_return = this.serverCommunicator.PostData(formData);
      post_return.then((res) =>{
        if(res.result == 1){
          var voucher_list = res.voucher_list;
          // Step 1: Delete all existing voucher records
          var del_res = this.DeleteAllVoucherData();
          del_res.then((res)=>{
            if(voucher_list.length>0){
              if(res.result == 1){
                for (let i = 0; i < voucher_list.length; i++) {
                  // Step 2: Insert all voucher data
                  var voucher_insert_return = this.InsertVoucherData(voucher_list[i]);
                  voucher_insert_return.then((res)=>{
                    if(i == voucher_list.length-1){
                      resolve({result: 1, data: "Voucher Updated."});
                    }
                  })
                }
              } else {
                resolve(res);
              }
            } else {
              resolve({result: 1, data: "No voucher available in this moment."});
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
   * Return Voucher List
   */
  FetchVoucherList(){
    var data = null
    let sqlQuery = `SELECT * FROM voucher_list ORDER BY valid_to ASC`;
    
    let result = new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(sqlQuery, '', (tx, results) => {
          if(results.rows.length>0){
            var voucher_data = [];
            for (let i = 0; i < results.rows.length; i++) {
              voucher_data.push(results.rows.item(i));
            }
            data = {result: 1, data: voucher_data}
          } else {
            data = {result: 1, data: ''}
          }
          resolve(data)
        }, (err) => {
          data = {result:0,data:{title:"Error ExecuteSQL (FetchVoucherList)",msg:JSON.stringify(err)}}
          resolve(data)
        });
      }, (error) => {
        data = {result:0,data:{title:"Error Transaction (FetchVoucherList)",msg:error}}
        resolve(data)
      })
    })
    return result
  }
}