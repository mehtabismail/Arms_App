/** REACT NATIVE **/
import FormData from 'FormData';

/** PROJECT FILES **/
import { 
  ServerCommunicator,
  Database
} from '../../../Services/LibLinking';

/** NPM LIBRARIES **/

export default class NoticeBoard {
  constructor(props){
    // super(props);

    // Create Database Object
    this.database = new Database();
    this.db = this.database.db;

    // Create Server Communicator Object
    this.serverCommunicator = new ServerCommunicator();
  }

  /**
   * - Insert Notice Board Data
   * - Update Notice Board Data
   * - Delete All Notice Board Data
   * - Get Notice Board Data via API
   * - Get Notice Board List from db
   * - Get Notice Board Last Update DateTime
   */

  /***********************************************/
  /************* Notice Board Data ***************/
  /***********************************************/

  /**
   * Insert Notice Board Data
   */
  InsertNoticeBoardData(nb_data){
      
    // Initiate variables
    var nb_server_id = nb_data.id;
    var item_type = nb_data.item_type;
    var image_click_link = nb_data.image_click_link;
    var item_url = nb_data.item_url;
    var video_site = nb_data.video_site;
    var video_link = nb_data.video_link;
    var sequence = nb_data.sequence;
    var last_update = nb_data.last_update;

    var data = [];
    let sqlQuery = `INSERT INTO notice_board
                    (
                      nb_server_id, item_type, image_click_link, item_url, video_site, 
                      video_link, sequence, last_update
                    ) 
                    VALUES(
                      ?, ?, ?, ?, ?, 
                      ?, ?, ?
                    );`;
    
    let result = new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(sqlQuery, [
          nb_server_id, item_type, image_click_link, item_url, video_site, 
          video_link, sequence, last_update
        ], (tx, results) => { 
          if(results.rowsAffected>0){
            var insertId = results.insertId
            data = {result:1, data: {action: 'insert', insertId: insertId}};
            resolve(data);
          } else {
            data = {result: 0, data: {title: "", msg: "Unable insert notice board data."}};
            resolve(data);
          }
        }, (err) => {
          data = {result: 0, data: {title: "Error ExecuteSQL (InsertNoticeBoardData)", msg: JSON.stringify(err)}};
          resolve(data);
        });
      }, (error) => {
        data = {result: 0, data: {title: "Error Transaction (InsertNoticeBoardData)", msg: error}};
        resolve(data);
      });
    })
    return result
  }

  /**
   * Update Notice Board Data
   */
  UpdateNoticeBoardData(nb_data){
    // Initiate variables
    var nb_server_id = nb_data.id;
    var item_type = nb_data.item_type;
    var image_click_link = nb_data.image_click_link;
    var item_url = nb_data.item_url;
    var video_site = nb_data.video_site;
    var video_link = nb_data.video_link;
    var sequence = nb_data.sequence;
    var last_update = nb_data.last_update;
    

    var data = []
    let sqlQuery = `UPDATE notice_board
                    SET 
                      item_type = ?, image_click_link = ?, item_url = ?, video_site = ?, video_link = ?,
                      sequence = ?, last_update = ?
                    WHERE nb_server_id = ? ;`

    let result = new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(sqlQuery, [
          item_type, image_click_link, item_url, video_site, video_link, 
          sequence, last_update, nb_server_id
        ], (tx, results) => { 
          if(results.rowsAffected==0){
            resolve(this.InsertNoticeBoardData(nb_data));
          } else if(results.rowsAffected>0){
            data = {result: 1, data: {action: 'update', msg: "Update Notice Board Data."}};
            resolve(data);
          }
        }, (err) => {
          data = {result: 0, data: {title: "Error ExecuteSQL (UpdateNoticeBoardData)", msg: JSON.stringify(err)}};
          resolve(err);
        });
      }, (error) => {
        data = {result: 0, data: {title: "Error Transaction (UpdateNoticeBoardData)", msg: error}};
        resolve(data);
      });
    });
    return result;
  }

  /**
   * Delete All Notice Board Data
   */
  DeleteAllNoticeBoardData(){
    let sqlQuery = 'DELETE FROM notice_board;';
    
    let result = new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(sqlQuery, '', () => { 
        }, (err) => {
          data = {result: 0, data: {title: 'Error ExecuteSQL (DeleteAllNoticeBoardData)', msg: JSON.stringify(err)}}
          resolve(data)
        });
      }, (error) => {
        data = {result: 0, data: {title: 'Error Transaction (DeleteAllNoticeBoardData)', msg: error}}
        resolve(data)
      }, () => {
        data = {result: 1,data: ""}
        resolve(data)
      });
    })
    return result
  }

  /**
   * Get Notice Board Data From Server via API
   * Step 1: Send data to server communicator
   * Step 2: Check API return data receive latest change?
   * Step 3:
   *  Condition 1: API doesn't receive any latest change. 
   *    -> Resolve result = 1 and data = "Notice Board Data Doesn't Have Latest Change.".
   *  Condition 2: API receive latest change.
   *    -> Step 3.1: Delete all existing notice board data
   *    -> Step 3.2: Check nb_data is empty?
   *      Condition 1: nb_data is not empty, which mean received latest notice board data list.
   *        -> Step 3.2.1: Insert new notice board data into db.
   *        -> Resolve result = 1 and data = "Notice Board Data Updated.".
   *      Condition 2: nb_data is empty, which mean BACKEND deactivated all notice board data.
   *        -> Resolve result = 1 and data = "Notice Board Data Updated.".
   * 
   * Samples Data From API
   * - Data is existed
   *    { result: 1, last_update: "2019-10-09 11:49:43", data: [{id: 16, item_type: "image", ...}] }
   * - Data no change
   *    { result: 1, last_update: "2019-10-09 11:49:43", no_change: 1 }
   * - Data is empty
   *    { result: 1, last_update: "2019-10-09 11:49:43", data: [] }
   */
  FetchNoticeBoardViaAPI(last_update=""){
    let result = new Promise((resolve, reject) => {
      var formData = new FormData();
      formData.append('a', 'get_member_notice_board');
      if(last_update){
        formData.append('last_update', last_update);
      }

      // Step 1: Send data to server communicator
      var post_return = this.serverCommunicator.PostData(formData);
      post_return.then((res) =>{
        if(res.result == 1){
          // Step 2: Check API return data receive latest change?
          if(res.no_change){
            // Step 3: Condition 1: API doesn't receive any latest change.
            resolve({result: 1, data: "Notice Board Data Doesn't Have Latest Change."});
          } else {
            // Step 3: Condition 2: API receive latest change.
            var last_update = res.last_update;
            var nb_data = res.data;

            // Step 3.1: Delete all existing notice board data
            var del_res = this.DeleteAllNoticeBoardData();
            del_res.then((res)=>{
              if(res.result == 1){
                // Deleted notice board data successful
                // Step 3.2: Check nb_data is empty?
                if(nb_data.length > 0){
                  // Step 3.2: Condition 1: nb_data is not empty, which mean received latest notice board data list.
                  // Step 3.2.1: Insert new notice board data into db.
                  for (let i = 0; i < nb_data.length; i++) {
                    nb_data[i].last_update = last_update;
                    var nb_insert_return = this.UpdateNoticeBoardData(nb_data[i]);
                    nb_insert_return.then((res)=>{
                      if(i == nb_data.length-1){
                        resolve({result: 1, data: "Notice Board Data Updated."});
                      }
                    });
                  }
                } else {
                  // Step 3.2: Condition 2: nb_data is empty, which mean BACKEND deactivated all notice board data.
                  resolve({result: 1, data: "Notice Board Data Updated."});
                }
              } else {
                // Deleted notice board data failed
                resolve(res);
              }
            })
          }
        } else {
          // API return error
          resolve({result: 0, data: {title: "", msg: res.error_msg}});
        }
      });
    })
    return result
  }

  /**
   * Get Notice Board List from db
   */
  FetchNoticeBoardList(){
    var data = null
    let sqlQuery = `SELECT * FROM notice_board GROUP BY nb_server_id ORDER BY sequence ASC`;
    
    let result = new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(sqlQuery, '', (tx, results) => {
          var nb_data = [];
          for (let i = 0; i < results.rows.length; i++) {
            nb_data.push(results.rows.item(i));
          }
          data = {result: 1, data: nb_data}
          resolve(data)
        }, (err) => {
          data = {result:0,data:{title:"Error ExecuteSQL (FetchNoticeBoardList)",msg:JSON.stringify(err)}}
          resolve(data)
        });
      }, (error) => {
        data = {result:0,data:{title:"Error Transaction (FetchNoticeBoardList)",msg:error}}
        resolve(data)
      })
    })
    return result
  }

  /**
   * Get Notice Board Last Update DateTime
   */
  FetchNoticeBoardLastUpdate(){
    var data = null
    let sqlQuery = `SELECT last_update FROM notice_board LIMIT 1`;
    
    let result = new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(sqlQuery, '', (tx, results) => {
          if(results.rows.length > 0){
            data = {result: 1, data: results.rows.item(0)};
          } else {
            data = {result: 1, data: ''};
          }
          
          resolve(data);
        }, (err) => {
          data = {result:0,data:{title:"Error ExecuteSQL (FetchNoticeBoardLastUpdate)",msg:JSON.stringify(err)}};
          resolve(data);
        });
      }, (error) => {
        data = {result:0,data:{title:"Error Transaction (FetchNoticeBoardLastUpdate)",msg:error}};
        resolve(data);
      })
    });
    return result;
  }

}