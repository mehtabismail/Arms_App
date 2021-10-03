/** REACT NATIVE **/
import { Platform } from 'react-native';
import FormData from 'FormData';

/** PROJECT FILES **/
import { 
  I18n,
  AppConfig,
  ServerCommunicator,
  Database,
} from '../../../Services/LibLinking';

/** NPM LIBRARIES **/
import moment from 'moment';


export default class OutletLocation {
  constructor(props){
    // super(props);

    // Create Database Object
    this.database = new Database();
    this.db = this.database.db;

    // Create Server Communicator Object
    this.serverCommunicator = new ServerCommunicator();
  }

  /**
   * Insert Branch Data
   */
  InsertBranchData(branch_data, last_update){
      
    // Initiate variables
    var id = branch_data.id;
    var code = branch_data.code;
    var desc = branch_data.description;
    var address = branch_data.address;
    var phone_1 = branch_data.phone_1;
    var phone_2 = branch_data.phone_2;
    var phone_3 = branch_data.phone_3;
    var contact_email = branch_data.contact_email;
    var outlet_photo_url = branch_data.outlet_photo_url;
    var operation_time = branch_data.operation_time;
    var longitude = branch_data.longitude;
    var latitude = branch_data.latitude;
    var branch_group_id = branch_data.branch_group_id;
    var branch_group_code = branch_data.branch_group_code;
    var branch_group_desc = branch_data.branch_group_desc;

    var data = [];
    let sqlQuery = `INSERT INTO branch_list 
                    (
                      id, code, desc, address, phone_1, phone_2, 
                      phone_3, contact_email, outlet_photo_url, operation_time, longitude, latitude,
                      branch_group_id, branch_group_code, branch_group_desc, last_update
                    ) 
                    VALUES
                    (
                      ?, ?, ?, ?, ?, ?, 
                      ?, ?, ?, ?, ?, ?,
                      ?, ?, ?, ?
                    );`;
    
    let result = new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(sqlQuery, [
          id, code, desc, address, phone_1, phone_2, 
          phone_3, contact_email, outlet_photo_url, operation_time, longitude, latitude,
          branch_group_id, branch_group_code, branch_group_desc, last_update
        ], (tx, results) => { 
          if(results.rowsAffected>0){
            var insertId = results.insertId
            data = {result:1, data: {action: 'insert', insertId}};
            resolve(data);
          } else {
            data = {result: 0, data: {title: "", msg: "Insert Branch Data Failed."}};
            resolve(data);
          }
        }, (err) => {
          data = {result: 0, data: {title: "Error ExecuteSQL (InsertBranchData)", msg: JSON.stringify(err)}};
          resolve(data);
        });
      }, (error) => {
        data = {result: 0, data: {title: "Error Transaction (InsertBranchData)", msg: error}};
        resolve(data);
      });
    })
    return result;
  }

  /**
   * Delete all records of branch list
   */
  DeleteBranchList() {
    let sqlQuery_sales = 'DELETE FROM branch_List;'
    
    let result = new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(sqlQuery_sales, [], () => { 
        }, (err) => {
          data = {result: 0, data: {title: 'Error ExecuteSQL (DeleteBranchList)', msg: JSON.stringify(err)}};
          resolve(data);
        });
      }, (error) => {
        data = {result: 0, data: {title: 'Error Transaction (DeleteBranchList)', msg: error}};
        resolve(data);
      }, () => {
        data = {result: 1,data: I18n.t("")};
        resolve(data);
      });
    })
    return result;
  }

  /**
   * Get all branch info
   */
  FetchAllBranchData(){
    var data = null;
    let sqlQuery = `SELECT * 
                    FROM branch_list;`;
    
    let result = new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(sqlQuery, '', (tx, results) => {
          if(results.rows.length > 0){
            var branch_data = [];
            for (let i = 0; i < results.rows.length; i++) {
              branch_data.push(results.rows.item(i));
            }
            data = {result: 1, data: branch_data};
          } else {
            data = {result: 1, data: ""};
          }
          resolve(data);
        }, (err) => {
          data = {result:0,data:{title:"Error ExecuteSQL (FetchAllBranchData)",msg:JSON.stringify(err)}};
          resolve(data);
        });
      }, (error) => {
        data = {result:0,data:{title:"Error Transaction (FetchAllBranchData)",msg:error}};
        resolve(data);
      })
    })
    return result;
  }

  /**
   * Get branch name by branch code
   */
  FetchBranchName(branch_id){
    var data = null;
    let sqlQuery = `SELECT desc
                    FROM branch_list
                    WHERE id = ?;`;
    
    let result = new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(sqlQuery, [branch_id], (tx, results) => {
          if(results.rows.length > 0){
            data = {result: 1, data: results.rows.item(0)};
          } else {
            data = {result: 1, data: ""};
          }
          resolve(data);
        }, (err) => {
          data = {result:0,data:{title:"Error ExecuteSQL (FetchBranchName)",msg:JSON.stringify(err)}};
          resolve(data);
        });
      }, (error) => {
        data = {result:0,data:{title:"Error Transaction (FetchBranchName)",msg:error}};
        resolve(data);
      })
    })
    return result;
  }

  /**
   * Get branch list last update
   */
  FetchBranchListLastUpdate(){
    var data = null;
    let sqlQuery = `SELECT last_update
                    FROM branch_list
                    LIMIT 1;`;
    
    let result = new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(sqlQuery, [], (tx, results) => {
          if(results.rows.length > 0){
            data = {result: 1, data: results.rows.item(0)};
          } else {
            data = {result: 1, data: ""};
          }
          resolve(data);
        }, (err) => {
          data = {result:0,data:{title:"Error ExecuteSQL (FetchBranchListLastUpdate)",msg:JSON.stringify(err)}};
          resolve(data);
        });
      }, (error) => {
        data = {result:0,data:{title:"Error Transaction (FetchBranchListLastUpdate)",msg:error}};
        resolve(data);
      })
    })
    return result;
  }

  /***************************************************************/
  /************************ API CALLED ***************************/
  /***************************************************************/
  
  /**
   * Get branch info from API
   */
  FetchBranchInfoViaAPI(){
    let result = new Promise((resolve, reject) => {
      var formData = new FormData();
      formData.append('a', 'get_branches_info');

      // Step 1: Send data to server communicator
      var post_return = this.serverCommunicator.PostData(formData);
      post_return.then(async (res) =>{
        if(res.result == 1){
          if(res.branch_data.length > 0){
            var deleteBranchData = await this.DeleteBranchList();
            if(deleteBranchData.result == 1){
              var last_update = moment().format('YYYY-MM-DD HH:mm:ss');
              for (let i = 0; i < res.branch_data.length; i++) {
                this.InsertBranchData(res.branch_data[i], last_update);
                if(i == res.branch_data.length-1){
                  resolve({result: 1, data: res.branch_data});
                }
              }
            } else {
              resolve({result: 0, data: deleteBranchData.data});
            }
          }
        } else {
          resolve(res);
        }
      })
    })
    return result;
  }
}

