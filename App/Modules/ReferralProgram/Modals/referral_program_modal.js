/** REACT NATIVE **/
import { Platform } from 'react-native';

/** PROJECT FILES **/
import { 
  I18n,
  AppConfig,
  ServerCommunicator,
  Database,
} from '../../../Services/LibLinking';

/** NPM LIBRARIES **/


export default class ReferralProgram {
  constructor(props){
    // super(props);

    // Create Database Object
    this.database = new Database();
    this.db = this.database.db;

    // Create Server Communicator Object
    this.serverCommunicator = new ServerCommunicator();
  }

  /**
   * Update Member Data
   * - refer_by_referral_code
   */
  UpdateReferByReferralCode(refer_by_referral_code, nric){
    
    var data = [];
    let sqlQuery = `UPDATE member_data
                    SET refer_by_referral_code = ?
                    WHERE nric = ?;`;
    
    let result = new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(sqlQuery, [
          refer_by_referral_code, nric
        ], (tx, results) => { 
          if(results.rowsAffected==0){
            data = {result: 0, data: {title: "Error Update Data (UpdateReferByReferralCode)", msg: "Cannot find nric in db."}};
            resolve(data);
          } else if(results.rowsAffected>0){
            data = {result: 1, data: {action: 'update', msg: "Data updated."}};
            resolve(data);
          }
        }, (err) => {
          data = {result: 0, data: {title: "Error ExecuteSQL (UpdateReferByReferralCode)", msg: JSON.stringify(err)}};
          resolve(err);
        });
      }, (error) => {
        data = {result: 0, data: {title: "Error Transaction (UpdateReferByReferralCode)", msg: error}};
        resolve(data);
      });
    });
    return result;
  }

  /**
   * Get referral data
   * - referral code
   * - refer by referral code from member data
   */
  FetchReferralData(nric){
    var data = null;
    let sqlQuery = `SELECT referral_code, refer_by_referral_code 
                    FROM member_data
                    WHERE nric = ?;`;
    
    let result = new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(sqlQuery, [nric], (tx, results) => {
          if(results.rows.length > 0){
            data = {result: 1, data: results.rows.item(0)};
          } else {
            data = {result: 1, data: ""};
          }
          resolve(data);
        }, (err) => {
          data = {result:0,data:{title:"Error ExecuteSQL (FetchReferralData)",msg:JSON.stringify(err)}};
          resolve(data);
        });
      }, (error) => {
        data = {result:0,data:{title:"Error Transaction (FetchReferralData)",msg:error}};
        resolve(data);
      })
    })
    return result;
  }

  /***************************************************************/
  /************************ API CALLED ***************************/
  /***************************************************************/
  
  /**
   * Submit refer by referral code to server.
   */
  SubmitReferByReferralCodeToServerViaAPI(refer_by_referral_code, nric){
    let result = new Promise((resolve, reject) => {
      var formData = new FormData();
      formData.append('a', 'enter_member_referral_code');
      formData.append('handler', 'member');
      formData.append('referral_code', refer_by_referral_code);

      var post_return = this.serverCommunicator.PostData(formData);
      post_return.then((res) =>{
        if(res.result == 1){
          this.UpdateReferByReferralCode(refer_by_referral_code, nric);
          resolve(res);
        } else {
          resolve({result: 0, data: {title: 'Server Error', msg: res.error_msg}});
        }
      })
    })
    return result;
  }
}

