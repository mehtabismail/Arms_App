/** REACT NATIVE **/
import { Platform } from 'react-native';

/** PROJECT FILES **/
import { 
  I18n,
  AppConfig,
  ARMSDownloader, ServerCommunicator,
  Database,
  Images,
} from '../../../Services/LibLinking';

/** NPM LIBRARIES **/
import moment from 'moment';
import md5 from "react-native-md5";

export default class ProductCategory {
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
   * 
   */

  /************************************************************/
  /*************** SELLER HUB API CONNECTION ******************/
  /************************************************************/

  /**
   * Seller Hub - Get Category Data
   */
  FetchCategory(){
    let result = new Promise(async (resolve, reject) => {

      // Fetch last changes_row_index from local DB.
      var last_changes_data = await this.GetCategoryLastChangesRowIndex();
      var last_changes_row_index = last_changes_data.result == 1 && last_changes_data.data.data_existed ? 
                                    last_changes_data.data.changes_row_index + 1 : 
                                    0; // Add 1 to changes_row_index to next last update.
      var is_cat_data_exist = last_changes_data.result == 1 ? last_changes_data.data.data_existed : 0;
      var is_run_cat_update = last_changes_row_index == 0 && is_cat_data_exist ? false : true;

      var jsonData = {};
      jsonData["a"] = "get_category";
      jsonData["min_changes_row_index"] = last_changes_row_index;

      if(is_run_cat_update){
        // Send to data to server communicator
        var post_return = this.serverCommunicator.SHPostData(jsonData);
        post_return.then((res) =>{
          // alert(JSON.stringify(res));
          if(res.result == 1){
            var category_data_length = Object.keys(res.category_data).length;
            if(category_data_length > 0){
              Object.keys(res.category_data).map(async (value, index) => {
                // Update or Insert Category Data
                await this.UpdateProdCategory(res.category_data[value]);

                if(index == category_data_length-1){
                  resolve({result: 1, data: "Category Data Updated."});
                }
              });
            } else {
              // Category Data Is Empty
              resolve({result: 0, data: {title: "Error - Fetch Category From Server", msg: "Category Data Is Empty."}});
            }
          } else {
            // If error_code = "data_not_found", mean no latest update. Should return result 1.
            if(res.error_code == "data_not_found"){
              resolve({result: 1, data: "Category Data Updated."});
            } else {
              res.error_msg = res.error_code == "exception_error" && res.error_msg == "" ? "Server Updating. Please Try Again." : res.error_msg;
              resolve({result: 0, data: {title: "Error - Fetch Category From Server", msg: res.error_msg, error_code: res.error_code}});
            }
          }
        });
      } else {
        resolve({result: 1, data: "Category Data Updated."});
      }
    })
    return result;
  }

  /************************************************************/
  /********************** INSERT DATA *************************/
  /************************************************************/

  /**
   * Insert Product Category Data Into Local DB
   */
  InsertProdCategory(cat_data){
    
    // Initiate variables
    var category_id = cat_data.category_id;
    var description = cat_data.description;
    var level = cat_data.level;
    var parent_category_id = cat_data.parent_category_id;
    var changes_row_index = cat_data.changes_row_index;
    var active = cat_data.active;
    var image_path = cat_data.image_path;

    var data = [];
    let sqlQuery = `INSERT INTO ecom_category_list 
                    (
                      category_id, description, level, 
                      parent_category_id, changes_row_index, active, image_path
                    ) 
                    VALUES(
                      ?, ?, ?,
                      ?, ?, ?, ?
                    );`;
    
    let result = new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(sqlQuery, [
          category_id, description, level, 
          parent_category_id, changes_row_index, active, image_path
        ], (tx, results) => { 
          if(results.rowsAffected>0){
            data = {result:1, data: {action: 'insert', insertId: results.insertId}};
            resolve(data);
          } else {
            data = {result: 0, data: {title: "", msg: `Failed to insert Category ID (${category_id}).`}};
            resolve(data);
          }
        }, (err) => {
          data = {result: 0, data: {title: "Error ExecuteSQL (InsertProdCategory)", msg: JSON.stringify(err)}};
          resolve(data);
        });
      }, (error) => {
        data = {result: 0, data: {title: "Error Transaction (InsertProdCategory)", msg: error}};
        resolve(data);
      });
    });
    return result;
  }

  /************************************************************/
  /********************** UPDATE DATA *************************/
  /************************************************************/

  /**
   * Update Product Category Data Into Local DB
   */
  UpdateProdCategory(cat_data){
    
    var category_id = cat_data.category_id;
    var description = cat_data.description;
    var level = cat_data.level;
    var parent_category_id = cat_data.parent_category_id;
    var changes_row_index = cat_data.changes_row_index;
    var active = cat_data.active;
    var image_path = cat_data.image_path;
    

    var data = []
    let sqlQuery = `UPDATE ecom_category_list
                    SET 
                      description = ?, level = ?, parent_category_id = ?, changes_row_index = ?, active = ?, image_path = ?
                    WHERE category_id = ? ;`

    let result = new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(sqlQuery, [
          description, level, parent_category_id, changes_row_index, active, image_path,
          category_id
        ], (tx, results) => { 
          if(results.rowsAffected==0){
            resolve(this.InsertProdCategory(cat_data));
          } else if(results.rowsAffected>0){
            data = {result: 1, data: {action: 'update', msg: `Category ID (${category_id}) has been updated.`}};
            resolve(data);
          }
        }, (err) => {
          data = {result: 0, data: {title: "Error ExecuteSQL (UpdateProdCategory)", msg: JSON.stringify(err)}};
          resolve(err);
        });
      }, (error) => {
        data = {result: 0, data: {title: "Error Transaction (UpdateProdCategory)", msg: error}};
        resolve(data);
      });
    });
    return result;
  }

  /************************************************************/
  /******************* FETCH LOCAL DATA ***********************/
  /************************************************************/

  /**
   * Get Last changes_row_index From Category Local DB
   */
  GetCategoryLastChangesRowIndex(){
    let sqlQuery = `SELECT changes_row_index
                    FROM ecom_category_list
                    ORDER BY changes_row_index DESC`;
    
    let result = new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(sqlQuery, [], (tx, results) => {
          if(results.rows.length > 0){
            var changes_row_index = results.rows.item(0).changes_row_index;
            resolve({result: 1, data: {data_existed: 1, changes_row_index}});
          } else {
            resolve({result: 1, data: {data_existed: 0, changes_row_index: 0}});
          }
        }, (err) => {
          resolve({result:0,data:{title:"Error ExecuteSQL (GetCategoryLastChangesRowIndex)",msg:JSON.stringify(err)}});
        });
      }, (error) => {
        resolve({result:0,data:{title:"Error Transaction (GetCategoryLastChangesRowIndex)",msg:error}});
      });
    });
    return result;
  }

  /**
   * Get 8 Random Category Data Level 2
   */
  GetRandom8Category(){
    let sqlQuery = `SELECT ecom_category_list.*
                    FROM ecom_category_list
                    LEFT JOIN ecom_category_list b ON b.category_id = ecom_category_list.parent_category_id
                    WHERE ecom_category_list.level = 2 AND ecom_category_list.active = 1 AND b.active = 1
                    ORDER BY RANDOM(), ecom_category_list.description ASC
                    LIMIT 8`;

    // let sqlQuery = `SELECT *
    //                 FROM ecom_category_list
    //                 WHERE level = 1 AND active = 1
    //                 ORDER BY RANDOM(), description ASC
    //                 LIMIT 8`;
    
    let result = new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(sqlQuery, [], async (tx, results) => {
          if(results.rows.length > 0){
            var cat_list = [];
            for (let i = 0; i < results.rows.length; i++) {
              cat_list.push(results.rows.item(i));

              // Get MarketPlace URL
              var sh_url = await this.serverCommunicator.serverController.GetMarketPlaceURL();
              cat_list[i].icon = cat_list[i].image_path ? {uri: `${sh_url}/${cat_list[i].image_path}`} : Images.imageNoAvailable;
            }
            resolve({result: 1, data: cat_list.sort((a, b)=>a.description.localeCompare(b.description))});
          } else {
            resolve({result: 1, data: []});
          }
        }, (err) => {
          resolve({result:0,data:{title:"Error ExecuteSQL (GetRandom8Category)",msg:JSON.stringify(err)}});
        });
      }, (error) => {
        resolve({result:0,data:{title:"Error Transaction (GetRandom8Category)",msg:error}});
      });
    });
    return result;
  }

  /**
   * Get All Category Data Level 1
   */
  GetAllCategoryLevel1(){
    let sqlQuery = `SELECT *
                    FROM ecom_category_list
                    WHERE level = 1 AND active = 1
                    ORDER BY description ASC`;
    
    let result = new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(sqlQuery, [], async (tx, results) => {
          if(results.rows.length > 0){
            var cat_list = [];
            for (let i = 0; i < results.rows.length; i++) {
              cat_list.push(results.rows.item(i));

              // Get MarketPlace URL
              var sh_url = await this.serverCommunicator.serverController.GetMarketPlaceURL();
              cat_list[i].icon = cat_list[i].image_path ? {uri: `${sh_url}/${cat_list[i].image_path}`} : Images.imageNoAvailable;
            }
            resolve({result: 1, data: cat_list});
          } else {
            resolve({result: 1, data: []});
          }
        }, (err) => {
          resolve({result: 0, data: {title:"Error ExecuteSQL (GetAllCategoryLevel1)", msg: JSON.stringify(err)}});
        });
      }, (error) => {
        resolve({result: 0, data: {title:"Error Transaction (GetAllCategoryLevel1)", msg: error}});
      });
    });
    return result;
  }

  /**
   * Get All Category Data Level 2
   */
  GetAllCategoryLevel2(){
    let sqlQuery = `SELECT ecom_category_list.*
                    FROM ecom_category_list
                    LEFT JOIN ecom_category_list b ON b.category_id = ecom_category_list.parent_category_id
                    WHERE ecom_category_list.level = 2 AND ecom_category_list.active = 1 AND b.active = 1
                    ORDER BY ecom_category_list.description ASC`;
    
    let result = new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(sqlQuery, [], async (tx, results) => {
          if(results.rows.length > 0){
            var cat_list = [];
            for (let i = 0; i < results.rows.length; i++) {
              cat_list.push(results.rows.item(i));

              // Get MarketPlace URL
              var sh_url = await this.serverCommunicator.serverController.GetMarketPlaceURL();
              cat_list[i].icon = cat_list[i].image_path ? {uri: `${sh_url}/${cat_list[i].image_path}`} : Images.imageNoAvailable;
            }
            resolve({result: 1, data: cat_list});
          } else {
            resolve({result: 1, data: []});
          }
        }, (err) => {
          resolve({result:0,data:{title:"Error ExecuteSQL (GetAllCategoryLevel2)",msg:JSON.stringify(err)}});
        });
      }, (error) => {
        resolve({result:0,data:{title:"Error Transaction (GetAllCategoryLevel2)",msg:error}});
      });
    });
    return result;
  }

  /**
   * Get All Category Data Level 3
   */
  GetAllCategoryLevel3(){
    let sqlQuery = `SELECT *
                    FROM ecom_category_list
                    WHERE level = 3 AND active = 1
                    ORDER BY description ASC`;
    
    let result = new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(sqlQuery, [], async (tx, results) => {
          if(results.rows.length > 0){
            var cat_list = [];
            for (let i = 0; i < results.rows.length; i++) {
              cat_list.push(results.rows.item(i));

              // Get MarketPlace URL
              var sh_url = await this.serverCommunicator.serverController.GetMarketPlaceURL();
              cat_list[i].icon = cat_list[i].image_path ? {uri: `${sh_url}/${cat_list[i].image_path}`} : Images.imageNoAvailable;
            }
            resolve({result: 1, data: cat_list});
          } else {
            resolve({result: 1, data: []});
          }
        }, (err) => {
          resolve({result:0,data:{title:"Error ExecuteSQL (GetAllCategoryLevel3)",msg:JSON.stringify(err)}});
        });
      }, (error) => {
        resolve({result:0,data:{title:"Error Transaction (GetAllCategoryLevel3)",msg:error}});
      });
    });
    return result;
  }

  /**
   * Get child category id by parent category id
   */
  GetChildCatIDByParentCatID(level, parent_category_id){
    
    var query_parent_cat_id = `AND parent_category_id IN (${parent_category_id})`;
    let sqlQuery = `SELECT category_id
                    FROM ecom_category_list
                    WHERE level = ? AND active = 1 ${query_parent_cat_id}`;
    
    let result = new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(sqlQuery, [level], (tx, results) => {
          if(results.rows.length > 0){
            var cat_id_list = [];
            for (let i = 0; i < results.rows.length; i++) {
              cat_id_list.push(results.rows.item(i).category_id);
            }
            resolve({result: 1, data: cat_id_list});
          } else {
            resolve({result: 1, data: []});
          }
        }, (err) => {
          resolve({result:0,data:{title:"Error ExecuteSQL (GetChildCatIDByParentCatID)",msg:JSON.stringify(err)}});
        });
      }, (error) => {
        resolve({result:0,data:{title:"Error Transaction (GetChildCatIDByParentCatID)",msg:error}});
      });
    });
    return result;
  }

  /**
   * Get category id based on description keyword
   */
  GetCatIDByKeyword(keyword){
    
    let sqlQuery = `SELECT category_id, level
                    FROM ecom_category_list
                    WHERE description LIKE '%${keyword}%'`;
    
    let result = new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(sqlQuery, '', (tx, results) => {
          if(results.rows.length > 0){
            var cat_id_list = [];
            for (let i = 0; i < results.rows.length; i++) {
              cat_id_list.push(results.rows.item(i));
            }
            resolve({result: 1, data: cat_id_list});
          } else {
            resolve({result: 1, data: []});
          }
        }, (err) => {
          resolve({result:0,data:{title:"Error ExecuteSQL (GetCatIDByKeyword)",msg:JSON.stringify(err)}});
        });
      }, (error) => {
        resolve({result:0,data:{title:"Error Transaction (GetCatIDByKeyword)",msg:error}});
      });
    });
    return result;
  }

  /************************************************************/
  /****************** FUNCTIONAL PROCESS **********************/
  /************************************************************/

  /**
   * Function of get related child category id list
   */
  // GetRelatedChildCategoryID(level, parent_category_id){
  //   let result = new Promise(async (resolve, reject) => {
  //     var cat_id_list = [parent_category_id];
  //     do {
  //       level += 1;
  //       var chidCatIDResult = await this.GetChildCatIDByParentCatID(level, parent_category_id.toString());
  //       // alert(JSON.stringify(chidCatIDResult))
  //       if(chidCatIDResult.result == 1){
  //         if(chidCatIDResult.data.length > 0){
  //           // Data is not empty continue
  //           cat_id_list = cat_id_list.concat(chidCatIDResult.data);
  //           parent_category_id = chidCatIDResult.data;
  //           getNextChildID = true;
  //         } else {
  //           // Data is empty exit loop
  //           getNextChildID = false;
  //           resolve({result: 1, data: cat_id_list});
  //         }
  //       } else {
  //         // Return Error
  //         getNextChildID = false;
  //         resolve({result: 1, data: cat_id_list});
  //       }
  //     } while (getNextChildID);
  //   });
  //   return result;
  // }

}