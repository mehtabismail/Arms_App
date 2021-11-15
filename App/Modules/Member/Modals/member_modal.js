/** REACT NATIVE **/
import { Platform } from 'react-native';

/** PROJECT FILES **/
import {
  I18n,
  AppConfig,
  ARMSDownloader, ServerCommunicator,
  Database,
} from '../../../Services/LibLinking';

/** NPM LIBRARIES **/
import moment from 'moment';
import md5 from "react-native-md5";
import 'react-native-get-random-values';
import { v1 as uuidv1 } from 'uuid';

export default class Member {
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
   * √ Insert member data
   * √ Update member data
   * √ Delete member data
   * √ Get member point
   * √ update member point
   * √ Insert PN Token data
   * √ Update PN Token data
   */

  /***********************************************/
  /*************** Member Data *******************/
  /***********************************************/

  /**
   * Insert Member Data
   */
  InsertMemberData(member_data){
    // Initiate variables
    var member_guid = uuidv1();
    var nric = member_data.nric;
    var card_no = member_data.card_no;
    var name = member_data.name;
    var gender = member_data.gender;
    var dob = member_data.dob;
    var postcode = member_data.postcode;
    var address = member_data.address;
    var city = member_data.city;
    var state = member_data.state;
    var phone = member_data.phone;
    var email = member_data.email;
    var points = member_data.points;
    var points_update = member_data.points_update;
    var issue_date = member_data.issue_date;
    var next_expiry_date = member_data.next_expiry_date;
    var member_type = member_data.member_type;
    var member_type_desc = member_data.member_type_desc;
    var mobile_registered_time = member_data.mobile_registered_time;
    var referral_code = member_data.referral_code;
    var refer_by_referral_code = member_data.refer_by_referral_code;
    var last_update = moment().format('YYYY-MM-DD HH:mm:ss');

    var data = [];
    let sqlQuery = `INSERT INTO member_data
                    (
                      member_guid, nric, card_no, name, gender,
                      dob, postcode, address, city, state, phone,
                      points, issue_date, next_expiry_date, member_type, member_type_desc, last_update, email, points_update,
                      mobile_registered_time, referral_code, refer_by_referral_code
                    )
                    VALUES(
                      ?, ?, ?, ?, ?,
                      ?, ?, ?, ?, ?, ?,
                      ?, ?, ?, ?, ?, ?, ?, ?,
                      ?, ?, ?
                    );`;

    let result = new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(sqlQuery, [
          member_guid, nric, session_token, card_no, name, gender,
          dob, postcode, address, city, state, phone,
          points, issue_date, next_expiry_date, member_type, member_type_desc, last_update, email, points_update,
          mobile_registered_time, referral_code, refer_by_referral_code
        ], (tx, results) => {
          if(results.rowsAffected>0){
            var member_InsertId = results.insertId
            data = {result:1, data: {action: 'insert', insertId: member_InsertId}};
            resolve(data);
          } else {
            data = {result: 0, data: {title: "", msg: I18n.t("member_modal_insert_member_data_error_msg")}};
            resolve(data);
          }
        }, (err) => {
          data = {result: 0, data: {title: "Error ExecuteSQL (InsertMemberData)", msg: JSON.stringify(err)}};
          resolve(data);
        });
      }, (error) => {
        data = {result: 0, data: {title: "Error Transaction (InsertMemberData)", msg: error}};
        resolve(data);
      });
    })
    return result
  }

  /**
   * Update Member Data
   */
  UpdateMemberData(member_data){
    var nric = member_data.nric;
    var card_no = member_data.card_no;
    var name = member_data.name;
    var gender = member_data.gender;
    var dob = member_data.dob;
    var postcode = member_data.postcode;
    var address = member_data.address;
    var city = member_data.city;
    var state = member_data.state;
    var phone = member_data.phone_3;
    var email = member_data.email;
    var points = member_data.points;
    var points_update = member_data.points_update;
    var issue_date = member_data.issue_date;
    var next_expiry_date = member_data.next_expiry_date;
    var member_type = member_data.member_type;
    var member_type_desc = member_data.member_type_desc;
    var mobile_registered_time = member_data.mobile_registered_time;
    var referral_code = member_data.referral_code;
    var refer_by_referral_code = member_data.refer_by_referral_code;
    var last_update = moment().format('YYYY-MM-DD HH:mm:ss');


    var data = []
    let sqlQuery = `UPDATE member_data
                    SET
                      card_no = ?, name = ?, gender = ?, dob = ?, postcode = ?,
                      address = ?, city = ?, state = ?, phone = ?, points = ?, issue_date = ?,
                      next_expiry_date = ?, member_type = ?, member_type_desc = ?, last_update = ?, email = ?, points_update = ?,
                      mobile_registered_time = ?, referral_code = ?, refer_by_referral_code = ?
                    WHERE nric = ? ;`

    let result = new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(sqlQuery, [
          card_no, name, gender, dob, postcode,
          address, city, state, phone, points, issue_date,
          next_expiry_date, member_type, member_type_desc, last_update, email, points_update,
          mobile_registered_time, referral_code, refer_by_referral_code,
          nric
        ], (tx, results) => {
          if(results.rowsAffected==0){
            resolve(this.InsertMemberData(member_data));
          } else if(results.rowsAffected>0){
            data = {result: 1, data: {action: 'update', msg: I18n.t("member_modal_update_member_data_success_msg")}};
            resolve(data);
          }
        }, (err) => {
          data = {result: 0, data: {title: "Error ExecuteSQL (UpdateMemberData)", msg: JSON.stringify(err)}};
          resolve(err);
        });
      }, (error) => {
        data = {result: 0, data: {title: "Error Transaction (UpdateMemberData)", msg: error}};
        resolve(data);
      });
    })
    return result
  }

  /**
   * Update Member Contact Information
   */
  UpdateMemberContactInformation(contact_list){
    var nric = contact_list.nric;
    var postcode = contact_list.postcode;
    var address = contact_list.address;
    var city = contact_list.city;
    var state = contact_list.state;
    var phone = contact_list.phone_3;
    var last_update = moment().format('YYYY-MM-DD HH:mm:ss');

    var data = []
    let sqlQuery = `UPDATE member_data
                    SET
                      postcode = ?, address = ?, city = ?, state = ?, phone = ?, last_update = ?
                    WHERE nric = ? ;`

    let result = new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(sqlQuery, [
          postcode, address, city, state, phone, last_update, nric
        ], (tx, results) => {
          if(results.rowsAffected==0){
            alert('No Data Updated')
          } else if(results.rowsAffected>0){
            data = {result: 1, data: {action: 'update', msg: I18n.t("member_modal_update_member_data_success_msg")}};
            resolve(data);
          }
        }, (err) => {
          data = {result: 0, data: {title: "Error ExecuteSQL (UpdateMemberContactInformation)", msg: JSON.stringify(err)}};
          resolve(err);
        });
      }, (error) => {
        data = {result: 0, data: {title: "Error Transaction (UpdateMemberContactInformation)", msg: error}};
        resolve(data);
      });
    })
    return result
  }

  /**
   * Update Member Personal Information
   */
  UpdateMemberPersonalInformation(personal_list){
    var nric = personal_list.nric;
    var name = personal_list.name;
    var gender = personal_list.gender;
    var dob = personal_list.dob;
    var last_update = moment().format('YYYY-MM-DD HH:mm:ss');

    var data = []
    let sqlQuery = `UPDATE member_data
                    SET
                      name = ?, gender = ?, dob = ?, last_update = ?
                    WHERE nric = ? ;`

    let result = new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(sqlQuery, [
          name, gender, dob, last_update, nric
        ], (tx, results) => {
          if(results.rowsAffected==0){
            alert('No Data Updated')
          } else if(results.rowsAffected>0){
            data = {result: 1, data: {action: 'update', msg: I18n.t("member_modal_update_member_data_success_msg")}};
            resolve(data);
          }
        }, (err) => {
          data = {result: 0, data: {title: "Error ExecuteSQL (UpdateMemberPersonalInformation)", msg: JSON.stringify(err)}};
          resolve(err);
        });
      }, (error) => {
        data = {result: 0, data: {title: "Error Transaction (UpdateMemberPersonalInformation)", msg: error}};
        resolve(data);
      });
    })
    return result
  }

  /**
   * Update member contact info to API
   */
  UpdateMemberContactInfoViaAPI(postcode, address, city, state, phone_3){
    let result = new Promise((resolve, reject) => {
      var formData = new FormData();
      formData.append('a','update_my_member_info');
      if(postcode){
        formData.append('postcode', postcode);
      };
      if(address){
        formData.append('address', address);
      };
      if(city){
        formData.append('city', city);
      };
      if(state){
        formData.append('state', state);
      };
      if(phone_3){
        formData.append('phone_3', phone_3);
      };
      // Send to data to server communicator
      var post_return = this.serverCommunicator.PostData(formData);
      resolve(post_return);
    })
    return result
  }

  /**
   * Update member personal info to API
   */
  UpdateMemberPersonalInfoViaAPI(name, gender, dob){
    let result = new Promise((resolve, reject) => {
      var formData = new FormData();
      formData.append('a','update_my_member_info');
      if(name){
        formData.append('name', name);
      };
      if(gender){
        formData.append('gender', gender);
      };
      if(dob){
        formData.append('dob', dob);
      };
      // Send to data to server communicator
      var post_return = this.serverCommunicator.PostData(formData);
      resolve(post_return);
    })
    return result
  }

  /**
   * Update Member Login Status to 0 (Logout)
   */
  MemberLogout(nric){
    var last_update = moment().format('YYYY-MM-DD HH:mm:ss');

    var data = []
    let sqlQuery = `UPDATE member_data
                    SET login_status = 0, last_update = ?
                    WHERE nric = ? ;`

    let result = new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(sqlQuery, [ last_update, nric ], (tx, results) => {
          if(results.rowsAffected==0){
            data = {result: 0, data: "Logout Failed."};
          } else if(results.rowsAffected>0){
            data = {result: 1, data: "Logout."};
            resolve(data);
          }
        }, (err) => {
          data = {result: 0, data: {title: "Error ExecuteSQL (MemberLogout)", msg: JSON.stringify(err)}};
          resolve(err);
        });
      }, (error) => {
        data = {result: 0, data: {title: "Error Transaction (MemberLogout)", msg: error}};
        resolve(data);
      });
    })
    return result
  }

  /**
   * Get member data info from server
   */
  FetchMemberInfoViaAPI(){
    let result = new Promise((resolve, reject) => {
      var formData = new FormData();
      formData.append('a','get_my_member_info');

      // Send to data to server communicator
      var post_return = this.serverCommunicator.PostData(formData);
      post_return.then((res) =>{
        if(res.result == 1){
          var member = res.member_data;
          var nric = res.member_data.nric;
          var profile_image = `${AppConfig.api_url}/${res.member_data.profile_image_url}`;
          var fileURL = res.member_data.profile_image_url ? profile_image : '';
          // Check profile image existent
          var check_file = this.CheckProfileImage(nric, fileURL);
          check_file.then((res) => {
            if(res.result == 1){
              resolve(this.UpdateMemberData(member));
            } else {
              resolve({result: 0, data: res.error_msg});
            }
          })
        } else {
          resolve({result: 0, data: res.error_msg});
        }
      });
    })
    return result;
  }

  /**
   * Check profile image from API and local
   */
  CheckProfileImage(nric, fileURL){
    let result = new Promise((resolve, reject) => {
      var path = `${AppConfig.folder_path_prefix}${AppConfig.profile_image_local}/${nric}`;
      var fileStoragePath = `${AppConfig.profile_image_local}/${nric}/profile_image_${moment()}.png`;
      // Check file existent
      var check_profile_image = this.armsDownloader.handleFileExistChecking(path);
      check_profile_image.then((res) => {
        if(res.result == 1){
          // file exist
          if(res.data){
            // unlink exist file
            var unlink_profile_image = this.armsDownloader.handleFileUnlink(path);
            unlink_profile_image.then((res) => {
              if(res.result == 1) {
                // download image from server into local
                if(fileURL){
                  resolve(this.SaveProfileImage(fileStoragePath, fileURL));
                } else {
                  resolve({result: 1});
                }
              } else {
                resolve({result: 0});
              }
            })
          }
          // file non-exist
          else {
            // download image from server into local
            if(fileURL){
              resolve(this.SaveProfileImage(fileStoragePath, fileURL));
            } else {
              resolve({result: 1});
            }
          }
        } else {
          resolve({result: 0});
        }
      })
    })
    return result
  }

  /**
   * Save profile image into local
   */
  SaveProfileImage(fileStoragePath, fileURL){
    let result = new Promise((resolve, reject) => {
      var download_profile_image = this.armsDownloader.handleFileDownload(fileStoragePath, fileURL);
      download_profile_image.then((res) => {
        if(res.result == 1) {
          resolve({result: 1});
        } else {
          resolve({result: 0});
        }
      })
    })
    return result
  }

  /**
   * Return Member Card No. & Points
   */
  FetchMemberCardNo_Points(nric){
    var data = null
    let sqlQuery = `SELECT card_no, name, points, points_update, next_expiry_date, last_update
                    FROM member_data
                    WHERE nric = ?`;

    let result = new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(sqlQuery, [nric], (tx, results) => {
          data = {result: 1, data: results.rows.item(0)}
          resolve(data)
        }, (err) => {
          data = {result:0,data:{title:"Error ExecuteSQL (FetchMemberCardNo_Points)",msg:JSON.stringify(err)}}
          resolve(data)
        });
      }, (error) => {
        data = {result:0,data:{title:"Error Transaction (FetchMemberCardNo_Points)",msg:error}}
        resolve(data)
      })
    })
    return result
  }

  /**
    * Get member data info from local database
    */
  FetchMemberInfo(nric){
    var data = null
    let sqlQuery = `SELECT *
                    FROM member_data
                    WHERE nric = ?`;

    let result = new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(sqlQuery, [nric], (tx, results) => {
          data = {result: 1, data: results.rows.item(0)}
          resolve(data)
        }, (err) => {
          data = {result:0,data:{title:"Error ExecuteSQL (FetchMemberInfo)",msg:JSON.stringify(err)}}
          resolve(data)
        });
      }, (error) => {
        data = {result:0,data:{title:"Error Transaction (FetchMemberInfo)",msg:error}}
        resolve(data)
      })
    })
    return result
  }

  /**
   * Upload member profile image
   * Sample,
   * uri: ${AppConfig.folder_path_prefix}/${AppConfig.profile_image_local}/930601075237/profile_image_1569222333784.png
   * name: 'profile_image_1569222333784.png'
   * type: 'image/png'
   */
  UploadMemberProfileImageViaAPI(uri, image_name){
    let result = new Promise((resolve, reject) => {
      var formData = new FormData();
      formData.append('a', 'upload_my_member_profile_image')
      formData.append('profile_image', {
        uri,
        name: image_name,
        type: 'image/png'
      });

      // Send to data to server communicator
      var post_return = this.serverCommunicator.PostData(formData);
      resolve(post_return);
    })
    return result
  }

  // TestUpload(uri, image_name){
  //   let result = new Promise((resolve, reject) => {
  //     var formData = new FormData();
  //     formData.append('a', 'save_grr')
  //     formData.append('handler', 'grr')
  //     formData.append('grr_id', 451)
  //     formData.append('rcv_date', '2020-03-11')
  //     formData.append('vendor_id', '123')
  //     formData.append('department_id', 5455)
  //     formData.append('transport', 'PNB 1234')
  //     formData.append('rcv_by', 306)
  //     console.log(uri);
  //     formData.append('grr_image_info', {uri, name: image_name, type: "image/jpg"})

  //     formData.append('items', JSON.stringify([
  //       {
  //         "doc_no": "123",
  //         "type": "OTHER",
  //         "doc_date": "2020-02-10",
  //         "ctn": 10,
  //         "pcs": 10,
  //         "amount": 20.00,
  //         "tax_amount": 1.20,
  //         "remark": "test 123",
  //         // "gi_image_info": {uri, name: image_name, type: "image/jpg"}
  //       },
  //       // {
  //       //   "doc_no": "234",
  //       //   "type": "OTHER",
  //       //   "doc_date": "2020-02-10",
  //       //   "ctn": 11,
  //       //   "pcs": 11,
  //       //   "amount": 22.00,
  //       //   "tax_amount": 12.20,
  //       //   "remark": "test 234",
  //       //   // "gi_image_info": {uri, name: image_name, type: "image/jpg"}
  //       // },
  //     ]));

  //     // for (let i = 0; i < 2; i++) {
  //     //   formData.append(`gi_image_info[${i}]`, {uri, name: image_name, type: "image/jpg"})
  //     // }

  //     // formData.append('items', {
  //     //   uri,
  //     //   name: image_name,
  //     //   type: 'image/png'
  //     // });

  //     // Send to data to server communicator
  //     var post_return = this.serverCommunicator.PostData(formData);
  //     post_return.then((res) => {
  //       alert(JSON.stringify(res));
  //     })
  //   })
  //   return result
  // }

  /**
   * Get member data for coupon verification:
   * - mobile registered date
   * - address, postcode, state, phone, gender, dob
   */
  FetchCouponVerifMemberData(){
    let sqlQuery = `SELECT
                      mobile_registered_time,
                      address, postcode, state, phone, gender, dob
                    FROM member_data
                    WHERE login_status = 1`;

    let result = new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(sqlQuery, [], (tx, results) => {
          resolve({result: 1, data: results.rows.item(0)});
        }, (err) => {
          resolve({result:0,data:{title:"Error ExecuteSQL (FetchCouponVerifMemberData)",msg:JSON.stringify(err)}});
        });
      }, (error) => {
        resolve({result:0,data:{title:"Error Transaction (FetchCouponVerifMemberData)",msg:error}});
      });
    });
    return result;
  }

  /**
   * Get member registered date
   */
  FetchMemberRegisteredDate(){
    let sqlQuery = `SELECT mobile_registered_time
                    FROM member_data
                    WHERE nric = ?`;

    let result = new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(sqlQuery, [], (tx, results) => {
          resolve({result: 1, data: results.rows.item(0)});
        }, (err) => {
          resolve({result:0,data:{title:"Error ExecuteSQL (FetchMemberInfo)",msg:JSON.stringify(err)}});
        });
      }, (error) => {
        resolve({result:0,data:{title:"Error Transaction (FetchMemberInfo)",msg:error}});
      });
    });
    return result;
  }

  /***********************************************/
  /************** Login / Logout *****************/
  /***********************************************/

  /**
   * New Member Registration using email and password server
   */
  MemberRegistrationViaAPI(email, password){
    let result = new Promise((resolve, reject) => {
      var formData = new FormData();
      formData.append('a','register_new_member');
      formData.append('email', email);
      formData.append('p', password);

      // Send to data to server communicator
      var post_return = this.serverCommunicator.PostData(formData);
      resolve(post_return);
    })
    return result
  }

  /**
   * Login verification member's nric / card.no and password to server
   */
  MemberLoginViaAPI(username, password){
    let result = new Promise((resolve, reject) => {
      var formData = new FormData();
      formData.append('a','member_login');
      formData.append('login_id', username);
      formData.append('p', md5.hex_md5(password));

      // Send to data to server communicator
      var post_return = this.serverCommunicator.PostData(formData);
      resolve(post_return);
    })
    return result
  }

  /**
   * Logout user for this device to server
   */
  MemberLogoutViaAPI(){
    let result = new Promise((resolve, reject) => {
      var formData = new FormData();
      formData.append('a','logout_my_member');

      // Send to data to server communicator
      var post_return = this.serverCommunicator.PostData(formData);
      resolve(post_return);
    })
    return result
  }

  /**
   * Login status update
   */
  UpdateLoginStatus(nric){
    var data = [];
    let sqlQuery1 = `UPDATE member_data
                    SET login_status = 0;`

    let sqlQuery2 = `UPDATE member_data
                    SET login_status = 1
                    WHERE nric = ? ;`

    let result = new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        // Query 1
        tx.executeSql(sqlQuery1, '', (tx, results) => {
        }, (err) => {
          data = {result: 0, data: {title: "Error ExecuteSQL Query1 (UpdateLoginStatus)", msg: JSON.stringify(err)}};
          resolve(err);
        });

        // Query 2
        tx.executeSql(sqlQuery2, [nric], (tx, results) => {
          if(results.rowsAffected==0){
            data = {result: 1, data: ""};
            resolve(data);
          } else if(results.rowsAffected>0){
            data = {result: 1, data: ""};
            resolve(data);
          }
        }, (err) => {
          data = {result: 0, data: {title: "Error ExecuteSQL Query2 (UpdateLoginStatus)", msg: JSON.stringify(err)}};
          resolve(err);
        });
      }, (error) => {
        data = {result: 0, data: {title: "Error Transaction (UpdateLoginStatus)", msg: error}};
        resolve(data);
      });
    })
    return result
  }

  /**
   * Return Member NRIC & Session Token By Login Status = 1
   */
  FetchLoginMemberNRIC_SessionToken(){
    var data = null
    let sqlQuery = `SELECT nric, session_token, card_no, member_type
                    FROM member_data
                    WHERE login_status = 1`;

    let result = new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(sqlQuery, '', (tx, results) => {
          if(results.rows.length > 0){
            data = {result: 1, data: results.rows.item(0)}
          } else {
            data = {result: 1, data: ""}
          }
          resolve(data)
        }, (err) => {
          data = {result:0,data:{title:"Error ExecuteSQL (FetchMemberNRIC_SessionToken)",msg:JSON.stringify(err)}}
          resolve(data)
        });
      }, (error) => {
        data = {result:0,data:{title:"Error Transaction (FetchMemberNRIC_SessionToken)",msg:error}}
        resolve(data)
      })
    })
    return result
  }

  /**
   * Insert Member Session Token
   */
  InsertMemberSessionTokenData(nric, session_token){

    // Initiate variables
    var member_guid = uuidv1();
    var last_update = moment().format('YYYY-MM-DD HH:mm:ss');

    var data = [];
    let sqlQuery = `INSERT INTO member_data
                    ( member_guid, nric, session_token, last_update )
                    VALUES( ?, ?, ?, ? );`;

    let result = new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(sqlQuery, [
          member_guid, nric, session_token, last_update
        ], (tx, results) => {
          if(results.rowsAffected>0){
            var member_InsertId = results.insertId
            data = {result:1, data: {action: 'insert', insertId: member_InsertId}};
            resolve(data);
          } else {
            data = {result: 0, data: {title: "", msg: I18n.t("member_modal_insert_member_session_token_error_msg")}};
            resolve(data);
          }
        }, (err) => {
          data = {result: 0, data: {title: "Error ExecuteSQL (InsertMemberSessionTokenData)", msg: JSON.stringify(err)}};
          resolve(data);
        });
      }, (error) => {
        data = {result: 0, data: {title: "Error Transaction (InsertMemberSessionTokenData)", msg: error}};
        resolve(data);
      });
    })
    return result
  }

  /**
   * Update Member Session Token
   */
  UpdateMemberSessionTokenData(nric, session_token){
    var last_update = moment().format('YYYY-MM-DD HH:mm:ss');

    var data = []
    let sqlQuery = `UPDATE member_data
                    SET session_token = ?, last_update = ?
                    WHERE nric = ? ;`

    let result = new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(sqlQuery, [ session_token, last_update, nric ], (tx, results) => {
          if(results.rowsAffected==0){
            resolve(this.InsertMemberSessionTokenData(nric, session_token));
          } else if(results.rowsAffected>0){
            data = {result: 1, data: {action: 'update', msg: I18n.t("member_modal_update_member_session_token_success_msg")}};
            resolve(data);
          }
        }, (err) => {
          data = {result: 0, data: {title: "Error ExecuteSQL (UpdateMemberSessionTokenData)", msg: JSON.stringify(err)}};
          resolve(err);
        });
      }, (error) => {
        data = {result: 0, data: {title: "Error Transaction (UpdateMemberSessionTokenData)", msg: error}};
        resolve(data);
      });
    })
    return result
  }

  /***********************************************/
  /********** Password Configuration *************/
  /***********************************************/

  /**
   * Forget member's password to server
   */
  ForgetMemberPasswordViaAPI(nric, email){
    let result = new Promise((resolve, reject) => {
      var formData = new FormData();
      formData.append('a','reset_my_member_pass');
      formData.append('login_id', nric);
      formData.append('email', email);

      // Send to data to server communicator
      var post_return = this.serverCommunicator.PostData(formData);
      resolve(post_return);
    })
    return result
  }

  /**
   * Change member's password to server
   */
  ChangeMemberPasswordViaAPI(old_pass, new_pass){
    let result = new Promise((resolve, reject) => {
      var formData = new FormData();
      formData.append('a','change_my_member_pass');
      formData.append('old_p', md5.hex_md5(old_pass));
      formData.append('new_p', new_pass);

      // Send to data to server communicator
      var post_return = this.serverCommunicator.PostData(formData);
      resolve(post_return);
    })
    return result
  }

  /**
   * Old password validate from server before change the email or password
   */
  ValidateMemberPasswordViaAPI(password){
    let result = new Promise((resolve, reject) => {
      var formData = new FormData();
      formData.append('a','validate_my_member_pass');
      formData.append('p', md5.hex_md5(password));

      // Send to data to server communicator
      var post_return = this.serverCommunicator.PostData(formData);
      resolve(post_return);
    })
    return result
  }

  /***********************************************/
  /******** Existing Member Configuration ********/
  /***********************************************/

  /**
   * Fetch Existing Member Data from API
   */
  FetchExistingMemberDataViaAPI(nric){
    let result = new Promise((resolve, reject) => {
      var formData = new FormData();
      formData.append('a','existing_member_setup');
      formData.append('login_id', nric);

      // Send to data to server communicator
      var post_return = this.serverCommunicator.PostData(formData);
      resolve(post_return);
    })
    return result
  }

  /**
   * Request SMS OTP code
   */
  RequestOTPCodeViaAPI(nric, phone_no){
    let result = new Promise((resolve, reject) => {
      var formData = new FormData();
      formData.append('a','request_sms_otp');
      formData.append('login_id', nric);
      formData.append('mobile_num', phone_no);

      // Send to data to server communicator
      var post_return = this.serverCommunicator.PostData(formData);
      resolve(post_return);
    })
    return result
  }

  /**
   * Fetch Exixting Member Data with OTP code from API
   */
  FetchExistingMemberDataWithOTPViaAPI(nric, phone_no, email, otp_code){
    let result = new Promise((resolve, reject) => {
      var formData = new FormData();
      formData.append('a','existing_member_setup_with_otp');
      formData.append('login_id', nric);
      formData.append('mobile_num', phone_no);
      formData.append('email', email);
      formData.append('otp_code', otp_code);

      // Send to data to server communicator
      var post_return = this.serverCommunicator.PostData(formData);
      resolve(post_return);
    })
    return result
  }

  /***********************************************/
  /********* Member Points / History *************/
  /***********************************************/

  /**
   * Update Member Points
   */
  UpdateMemberPoints(nric, points){
    var nric = nric;
    var points = points;
    var last_update = moment().format('YYYY-MM-DD HH:mm:ss');


    var data = []
    let sqlQuery = `UPDATE member_data
                    SET points = ?, last_update = ?
                    WHERE nric = ? ;`

    let result = new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(sqlQuery, [
          points, last_update, nric
        ], (tx, results) => {
          if(results.rowsAffected==0){
            data = {result: 1, data: 'Points Updated Failed.'};
          } else if(results.rowsAffected>0){
            data = {result: 1, data: 'Points Updated'};
            resolve(data);
          }
        }, (err) => {
          data = {result: 0, data: {title: "Error ExecuteSQL (UpdateMemberPoints)", msg: JSON.stringify(err)}};
          resolve(err);
        });
      }, (error) => {
        data = {result: 0, data: {title: "Error Transaction (UpdateMemberPoints)", msg: error}};
        resolve(data);
      });
    })
    return result
  }

  /**
   * Fetch Member Points
   */
  FetchMemberPoints(nric){
    var data = null
    let sqlQuery = `SELECT points, points_update AS last_update
                    FROM member_data
                    WHERE nric = ?`;

    let result = new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(sqlQuery, [nric], (tx, results) => {
          data = {result: 1, data: results.rows.item(0)}
          resolve(data)
        }, (err) => {
          data = {result:0,data:{title:"Error ExecuteSQL (FetchMemberPoints)",msg:JSON.stringify(err)}}
          resolve(data)
        });
      }, (error) => {
        data = {result:0,data:{title:"Error Transaction (FetchMemberPoints)",msg:error}}
        resolve(data)
      })
    })
    return result
  }

  /**
   * Fetch Last Recalculate Time From member_data
   */
  FetchMemberHistoryLastRecalculateTime(nric){
    var data = null
    let sqlQuery = `SELECT member_history_last_recalculate_time
                    FROM member_data
                    WHERE nric = ?`;

    let result = new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(sqlQuery, [nric], (tx, results) => {
          data = {result: 1, data: results.rows.item(0)}
          resolve(data)
        }, (err) => {
          data = {result:0,data:{title:"Error ExecuteSQL (FetchMemberHistoryLastRecalculateTime)",msg:JSON.stringify(err)}}
          resolve(data)
        });
      }, (error) => {
        data = {result:0,data:{title:"Error Transaction (FetchMemberHistoryLastRecalculateTime)",msg:error}}
        resolve(data)
      })
    })
    return result
  }

  /**
   * Update Last Recalculate Time To member_data
   */
  UpdateMemberHistoryLastRecalculateTime(nric){
    var last_recalculate = moment().format('YYYY-MM-DD HH:mm:ss');
    var data = []
    let sqlQuery = `UPDATE member_data
                    SET member_history_last_recalculate_time = ?
                    WHERE nric = ? ;`

    let result = new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(sqlQuery, [ last_recalculate, nric ], (tx, results) => {
          if(results.rowsAffected==0){
            data = {result: 1, data: 'Last Recalculate Time Updated Failed.'};
          } else if(results.rowsAffected>0){
            data = {result: 1, data: 'Last Recalculate Time Updated'};
            resolve(data);
          }
        }, (err) => {
          data = {result: 0, data: {title: "Error ExecuteSQL (UpdateMemberHistoryLastRecalculateTime)", msg: JSON.stringify(err)}};
          resolve(err);
        });
      }, (error) => {
        data = {result: 0, data: {title: "Error Transaction (UpdateMemberHistoryLastRecalculateTime)", msg: error}};
        resolve(data);
      });
    })
    return result
  }

  /**
   * Delete all records of member history
   */
  DeleteMemberPointHistory(nric) {
    let sqlQuery_sales = 'DELETE FROM member_point_history WHERE nric = ?;'

    let result = new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(sqlQuery_sales, [nric], () => {
        }, (err) => {
          data = {result: 0, data: {title: 'Error ExecuteSQL (DeleteMemberPointHistory)', msg: JSON.stringify(err)}}
          resolve(data)
        });
      }, (error) => {
        data = {result: 0, data: {title: 'Error Transaction (DeleteMemberPointHistory)', msg: error}}
        resolve(data)
      }, () => {
        data = {result: 1,data: I18n.t("")}
        resolve(data)
      });
    })
    return result
  }

  /**
   * Get member point history from server
   */
  async FetchMemberPointHistoryViaAPI(nric){
    var LRT_result = await this.FetchMemberHistoryLastRecalculateTime(nric);
    var last_recalculate_time = (LRT_result.result == 1) ? LRT_result.data.member_history_last_recalculate_time : '';

    let result = new Promise((resolve, reject) => {

      var formData = new FormData();
      formData.append('a','get_my_member_point_history');
      formData.append('last_recalculate_time', last_recalculate_time);

      // Send to data to server communicator
      var post_return = this.serverCommunicator.PostData(formData);
      post_return.then((res) =>{
        // alert(JSON.stringify(res))
        if(res.result == 1){
          var point_history = res.history_data;
          // Step 1: Update Last Recalculate Time to member_data
          this.UpdateMemberHistoryLastRecalculateTime(nric);
          // Step 2: Delete All Member History Records
          var del_result = this.DeleteMemberPointHistory(nric);
          del_result.then((res1) => {
            if(res1.result == 1){
              if(point_history.length > 0){
                for (let i = 0; i < point_history.length; i++) {
                  var ins_result = this.InsertMemberPointHistory(point_history[i]);
                  ins_result.then((res) =>{
                    // Return data at last loop count
                    if(i == point_history.length-1){
                      resolve({result: 1, data: "Member Point History Updated."});
                    }
                  });
                }
              } else {
                resolve({result: 1, data: ""});
              }
            } else {
              resolve(res1)
            }
          })
        } else {
          resolve({result: 0, data: {title: '', msg: res.error_msg}});
        }
      });
    })
    return result
  }

  /**
   * Insert Member Point History
   */
  async InsertMemberPointHistory(data){

    // Initiate variables
    var nric = data.nric;
    var card_no = data.card_no;
    var date = data.date;
    var branch_id = data.branch_id;
    var branch_desc = data.branch_desc;
    var type = data.type;
    var points = data.points;
    var remark = data.remark;
    var point_source = data.point_source;

    var data = [];
    let sqlQuery = `INSERT INTO member_point_history
                    (
                      nric, card_no, date, branch_id, branch_desc,
                      type, points, remark, point_source
                    )
                    VALUES(
                      ?, ?, ?, ?, ?,
                      ?, ?, ?, ?
                    );`;

    let result = new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(sqlQuery, [
          nric, card_no, date, branch_id, branch_desc,
          type, points, remark, point_source,
        ], (tx, results) => {
          if(results.rowsAffected>0){
            var insertId = results.insertId
            data = {result:1, data: {action: 'insert', insertId: insertId}};
            resolve(data);
          } else {
            data = {result: 0, data: {title: "", msg: I18n.t("member_modal_insert_member_point_history_error_msg")}};
            resolve(data);
          }
        }, (err) => {
          data = {result: 0, data: {title: "Error ExecuteSQL (InsertMemberPointHistory)", msg: JSON.stringify(err)}};
          resolve(data);
        });
      }, (error) => {
        data = {result: 0, data: {title: "Error Transaction (InsertMemberPointHistory)", msg: error}};
        resolve(data);
      });
    })
    return result
  }

  /**
   * Return Member Point History
   */
  FetchMemberPointHistory(nric){
    var data = null
    let sqlQuery = `SELECT *
                    FROM member_point_history
                    WHERE nric = ?
                    ORDER BY date DESC`;

    let result = new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(sqlQuery, [nric], (tx, results) => {
          var mph_data = [];
          for (let i = 0; i < results.rows.length; i++) {
            mph_data.push(results.rows.item(i));
          }
          data = {result: 1, data: mph_data}
          resolve(data)
        }, (err) => {
          data = {result:0,data:{title:"Error ExecuteSQL (FetchMemberPointHistory)",msg:JSON.stringify(err)}}
          resolve(data)
        });
      }, (error) => {
        data = {result:0,data:{title:"Error Transaction (FetchMemberPointHistory)",msg:error}}
        resolve(data)
      })
    })
    return result
  }

  /***********************************************/
  /***************** PN Token ********************/
  /***********************************************/

  /**
   * Insert Push Notification Token
   */
  InsertPNToken(pn_token){

    // Initiate variables
    var pn_token = pn_token;
    var last_update = moment().format('YYYY-MM-DD HH:mm:ss');

    var data = [];
    let sqlQuery = `INSERT INTO push_notification_token (
                      pn_token, last_update
                    )
                    VALUES(
                      ?, ?
                    );`;

    let result = new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(sqlQuery, [
          pn_token, last_update
        ], (tx, results) => {
          if(results.rowsAffected>0){
            var insertId = results.insertId
            data = {result:1, data: {action: 'insert', insertId: insertId}};
            resolve(data);
          } else {
            data = {result: 0, data: {title: "", msg: I18n.t("member_modal_insert_pn_token_error_msg")}};
            resolve(data);
          }
        }, (err) => {
          data = {result: 0, data: {title: "Error ExecuteSQL (InsertPNToken)", msg: JSON.stringify(err)}};
          resolve(data);
        });
      }, (error) => {
        data = {result: 0, data: {title: "Error Transaction (InsertPNToken)", msg: error}};
        resolve(data);
      });
    })
    return result
  }

  /**
   * Update Push Notification Token
   */
  UpdatePNToken(pn_token){
    var pn_token = pn_token
    var last_update = moment().format('YYYY-MM-DD HH:mm:ss');


    var data = []
    let sqlQuery = `UPDATE push_notification_token
                    SET pn_token = ?, last_update = ? ;`

    let result = new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(sqlQuery, [
          pn_token, last_update
        ], (tx, results) => {
          if(results.rowsAffected==0){
            resolve(this.InsertPNToken(pn_token));
          } else if(results.rowsAffected>0){
            data = {result: 1, data: {action: 'update', msg: I18n.t("member_modal_update_pn_token_success_msg")}};
            resolve(data);
          }
        }, (err) => {
          data = {result: 0, data: {title: "Error ExecuteSQL (UpdatePNToken)", msg: JSON.stringify(err)}};
          resolve(err);
        });
      }, (error) => {
        data = {result: 0, data: {title: "Error Transaction (UpdatePNToken)", msg: error}};
        resolve(data);
      });
    })
    return result
  }

  /**
   * Upload device registered push notification token to server based on the member nric
   */
  // UploadPNTokenToServer(nric){
  //   var data = null
  //   let sqlQuery = `SELECT pn_token
  //                   FROM push_notification_token
  //                   LIMIT 1`;

  //   let result = new Promise((resolve, reject) => {
  //     this.db.transaction((tx) => {
  //       tx.executeSql(sqlQuery, [], (tx, results) => {

  //         var pn_token = results.rows.item(0).pn_token;
  //         /**
  //          * Create form data for API
  //          */
  //         var formData = new FormData();
  //         formData.append('a','set_member_device_info');
  //         formData.append('mobile_type', Platform.OS);
  //         formData.append('push_notification_token', pn_token);

  //         // Send to data to server communicator
  //         var post_return = this.serverCommunicator.PostData(formData);
  //         resolve(post_return);

  //       }, (err) => {
  //         data = {result:0,data:{title:"Error ExecuteSQL (UploadPNTokenToServer)",msg:JSON.stringify(err)}}
  //         resolve(data)
  //       });
  //     }, (error) => {
  //       data = {result:0,data:{title:"Error Transaction (UploadPNTokenToServer)",msg:error}}
  //       resolve(data)
  //     })
  //   })
  //   return result
  // }

  UploadPNTokenToServer(pn_token){
    let result = new Promise((resolve, reject) => {
      /**
       * Create form data for API
       */
      var formData = new FormData();
      formData.append('a','set_member_device_info');
      formData.append('mobile_type', Platform.OS);
      formData.append('push_notification_token', pn_token);

      // Send to data to server communicator
      resolve(this.serverCommunicator.PostData(formData));
    })
    return result
  }

  /***********************************************/
  /************** E-Commerce USED ****************/
  /***********************************************/

  /**
   * Fetch Member Name, Email, Phone & Address
   */
  FetchMemberShippingAddress(){
    var data = null
    let sqlQuery = `SELECT nric, name, phone, email, address, postcode, city, state
                    FROM member_data
                    WHERE login_status = 1`;

    let result = new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(sqlQuery, '', (tx, results) => {
          data = {result: 1, data: results.rows.item(0)}
          resolve(data);
        }, (err) => {
          data = {result:0,data:{title:"Error ExecuteSQL (FetchMemberShippingAddress)",msg:JSON.stringify(err)}}
          resolve(data);
        });
      }, (error) => {
        data = {result:0,data:{title:"Error Transaction (FetchMemberShippingAddress)",msg:error}}
        resolve(data);
      })
    })
    return result
  }

  /**
   * Fetch Member Point and Credit
   * TODO: Add retrieve credit data
   */
  FetchMemberPointAndCredit(){
    var data = null
    let sqlQuery = `SELECT points
                    FROM member_data
                    WHERE login_status = 1`;

    let result = new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(sqlQuery, '', (tx, results) => {
          data = {result: 1, data: results.rows.item(0)}
          resolve(data);
        }, (err) => {
          data = {result:0,data:{title:"Error ExecuteSQL (FetchMemberPointAndCredit)",msg:JSON.stringify(err)}}
          resolve(data);
        });
      }, (error) => {
        data = {result:0,data:{title:"Error Transaction (FetchMemberPointAndCredit)",msg:error}}
        resolve(data);
      })
    })
    return result
  }
}