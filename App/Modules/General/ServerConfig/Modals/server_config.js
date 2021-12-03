/** REACT NATIVE **/
import { Platform } from 'react-native';

/** PROJECT FILES **/
import {
  I18n,
  AppConfig,
  ServerCommunicator,
  Database,
} from '../../../../Services/LibLinking';

/** NPM LIBRARIES **/
import moment from 'moment';


export default class ServerConfig {
  constructor(props){
    // super(props);

    // Create Database Object
    this.database = new Database();
    this.db = this.database.db;
  }

  /**
   * TODO:
   *  √ Insert server config into database
   *  v Update server config into database
   *  √ Get server config from API
   *  √ Fetch server config from database
   */


  /***************************************************************/
  /************************ INSERT DATA **************************/
  /***************************************************************/
  InsertServerConfigData(config_type, config_data){
    // Initiate variables
    var config_type = config_type;
    var config_data = JSON.stringify(config_data);
    var last_update = moment().format('YYYY-MM-DD HH:mm:ss');

    var data = [];
    let sqlQuery = `INSERT INTO server_config
                    (
                      config_type, data, last_update
                    )
                    VALUES (
                      ?, ?, ?
                    );`;

    let result = new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(sqlQuery, [
          config_type, config_data, last_update
        ], (tx, results) => {
          if(results.rowsAffected>0){
            var insertId = results.insertId
            data = {result:1, data: {action: 'insert', insertId: insertId}};
            resolve(data);
          } else {
            data = {result: 0, data: {title: "", msg: "Unable insert server config data."}};
            resolve(data);
          }
        }, (err) => {
          data = {result: 0, data: {title: "Error ExecuteSQL (InsertServerConfigData)", msg: JSON.stringify(err)}};
          resolve(data);
        });
      }, (error) => {
        data = {result: 0, data: {title: "Error Transaction (InsertServerConfigData)", msg: error}};
        resolve(data);
      });
    })
    return result
  }

  /***************************************************************/
  /************************ DELETE DATA **************************/
  /***************************************************************/
  DeleteAllServerConfigData(){
    let sqlQuery = 'DELETE FROM server_config;';

    let result = new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(sqlQuery, '', () => {
        }, (err) => {
          data = {result: 0, data: {title: 'Error ExecuteSQL (DeleteAllServerConfigData)', msg: JSON.stringify(err)}}
          resolve(data)
        });
      }, (error) => {
        data = {result: 0, data: {title: 'Error Transaction (DeleteAllServerConfigData)', msg: error}}
        resolve(data)
      }, () => {
        data = {result: 1,data: ""}
        resolve(data)
      });
    })
    return result
  }

  /***************************************************************/
  /************************ API CALLED ***************************/
  /***************************************************************/
  FetchServerConfigViaAPI(){
    let result = new Promise((resolve, reject) => {
      var formData = new FormData();
      formData.append('a', 'get_config');

      // Step 1: Send data to server communicator
      // Create Server Communicator Object
      var serverCommunicator = new ServerCommunicator();
      var post_return = serverCommunicator.PostData(formData);
      post_return.then((res) =>{
        if(res.result == 1){
          var config = res.config_data;
          // Step 1: Delete all existing config data records
          var del_res = this.DeleteAllServerConfigData();
          del_res.then((res)=>{
            if(res.result == 1){
              // Loop data from API
              for(key in config){
                var config_type = key;
                var config_data = config[key];
                var server_config = this.InsertServerConfigData(config_type, config_data);
                server_config.then((res) => {
                  resolve({result: 1, data: "Server Config Updated."});
                })
              }
            } else {
              resolve(res);
            }
          })
        } else {
          resolve(res);
        }
      })
    })
    return result
  }

  /***************************************************************/
  /************************ GET DATA *****************************/
  /***************************************************************/
  FetchServerConfigData(){
    var data = null
    let sqlQuery = `SELECT * FROM server_config;`;

    let result = new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(sqlQuery, '', (tx, results) => {
          if(results.rows.length>0){
            var config_list  = [];
            for (let i = 0; i < results.rows.length; i++) {
              config_list.push(results.rows.item(i));
            }
            data = {result: 1, data: config_list}
          } else {
            data = {result: 1, data: []}
          }
          resolve(data)
        }, (err) => {
          data = {result:0,data:{title:"Error ExecuteSQL (FetchServerConfigData)",msg:JSON.stringify(err)}}
          resolve(data)
        });
      }, (error) => {
        data = {result:0,data:{title:"Error Transaction (FetchServerConfigData)",msg:error}}
        resolve(data)
      })
    })
    return result
  }

  FetchMarketPlaceURL(){
    let sqlQuery = `SELECT data FROM server_config WHERE config_type = 'arms_marketplace_settings';`;

    let result = new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(sqlQuery, '', (tx, results) => {
          if(results.rows.length > 0){
            if(results.rows.item(0).data){
              var jsonMarketPlaceURL = JSON.parse(results.rows.item(0).data);
              if(jsonMarketPlaceURL.marketplace_url) {
                resolve({result: 1, data: jsonMarketPlaceURL.marketplace_url});
              } else {
                resolve({result: 0, data: ''});
              }
            } else {
              resolve({result: 0, data: ''});
            }
          } else {
            resolve({result: 0, data: ''});
          }
        }, (err) => {
          resolve({result: 0, data: {title: "Error ExecuteSQL (FetchMarketPlaceURL)", msg: JSON.stringify(err)}});
        });
      }, (error) => {
        resolve({result: 0, data: {title: "Error Transaction (FetchMarketPlaceURL)", msg: error}});
      })
    })
    return result;
  }

  FetchMarketPlaceAccessToken(){
    let sqlQuery = `SELECT data FROM server_config WHERE config_type = 'arms_marketplace_settings';`;

    let result = new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(sqlQuery, '', (tx, results) => {
          if(results.rows.length > 0){
            if(results.rows.item(0).data){
              var jsonMarketPlaceURL = JSON.parse(results.rows.item(0).data);
              if(jsonMarketPlaceURL.marketplace_url) {
                resolve({result: 1, data: jsonMarketPlaceURL.ecom_token});
              } else {
                resolve({result: 0, data: ''});
              }
            } else {
              resolve({result: 0, data: ''});
            }
          } else {
            resolve({result: 0, data: ''});
          }
        }, (err) => {
          resolve({result: 0, data: {title: "Error ExecuteSQL (FetchMarketPlaceAccessToken)", msg: JSON.stringify(err)}});
        });
      }, (error) => {
        resolve({result: 0, data: {title: "Error Transaction (FetchMarketPlaceAccessToken)", msg: error}});
      })
    })
    return result;
  }

  FetchCurrencyData(){
    let sqlQuery = `SELECT data FROM server_config WHERE config_type = 'arms_currency';`;

    let result = new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(sqlQuery, '', (tx, results) => {
          if(results.rows.length > 0){
            var jsonCurrencyData = JSON.parse(results.rows.item(0).data);
            resolve({result: 1, data: jsonCurrencyData});
          } else {
            resolve({result: 0, data: ''});
          }
        }, (err) => {
          resolve({result: 0, data: {title: "Error ExecuteSQL (FetchCurrencyData)", msg: JSON.stringify(err)}});
        });
      }, (error) => {
        resolve({result: 0, data: {title: "Error Transaction (FetchCurrencyData)", msg: error}});
      })
    })
    return result;
  }
}

