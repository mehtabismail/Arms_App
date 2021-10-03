import React, { Component } from 'react';
import Database from './database';
import moment from 'moment';
import AppConfig from '../Config/AppConfig';

export default class GenerateDataTables extends Component {
  constructor(props) {
    super(props);

    // Create Database Object
    this.database = new Database();
    this.db = this.database.db;
  }

  // Destructor
  componentWillUnmount() {
    if (this.db) {
      this.database.close();
    } else {
      alert("SQLiteStorage not open");
    }
  }

  /**
   * Init DB Tables Based on DB Version
   */
  initAppDBTables(){
    let result = new Promise((resolve, reject) => {
      var db_version_data = this.FetchDBVersion();
      db_version_data.then((res)=>{
        var db_version = 0;
        if(res.result == 1) {
          db_version = res.data.version;
        }
        var result = this.ExecuteDBTableGenerationAndAlter(db_version);
        resolve(result);
      })
    })
    return result;
  }

  /**
   * Execution for Generate & Alter DB Table
   */
  ExecuteDBTableGenerationAndAlter(db_version){
    var current_date =  moment().format('YYYY-MM-DD HH:mm:ss');
    var latest_version = AppConfig.latest_db_version;
    
    let result = new Promise((resolve, reject) => {
      if(db_version < 1){
        /** GENERAL **/
        this.GenerateDBVersionTable();
        this.GenerateMemberPointHistoryTable();
        this.GeneratePromotionListTable();
        this.GeneratePromotionListItemsTable();
        this.GenerateVoucherListTable();
        
        var return_result = this.GenerateMemberDataTable();
        return_result.then((res)=>{
          if(res.result==1){
            resolve({result:1, data:""});
          } else {
            resolve({result:0, data:res.error_msg});
          }
        })
        this.InsertDBVersion(latest_version, current_date);
      }

      if(db_version < 2){
        this.AddSellingPriceColumn();
        this.UpdateDBVersion(latest_version, current_date);
      }

      if(db_version < 3){
        this.GeneratePushNotificationTokenTable();
        this.GenerateNoticeBoardTable();
        this.AddPromotionListItemsMemberTypeColumn();
        this.UpdateDBVersion(latest_version, current_date);
      }

      if(db_version < 4){
        this.GenerateCouponListTable();
        this.UpdateDBVersion(latest_version, current_date);
      }

      if(db_version < 5){
        this.GeneratePackageListTable();
        this.GeneratePackageListItemsTable();
        this.GeneratePackageRedeemHistoryTable();
        this.UpdateDBVersion(latest_version, current_date);
      }

      if(db_version < 6){
        this.GenerateServerConfigTable();
        this.UpdateDBVersion(latest_version, current_date);
      }

      if(db_version < 7){
        this.AddMobileRegisteredTimeColumn();
        this.AddMemberLimitCouponColumn();
        this.UpdateDBVersion(latest_version, current_date);
      }

      if(db_version < 8){
        this.GenerateBranchListTable();
        this.UpdateDBVersion(latest_version, current_date);
      }

      if(db_version < 9){
        this.AddMemberReferralProgramColumn();
        this.UpdateDBVersion(latest_version, current_date);
      }

      if(db_version < 10){
        this.GenerateEComCategoryListTable();
        this.UpdateDBVersion(latest_version, current_date);
      }

      if(db_version < 11){
        this.GenerateOrderListTable();
        this.GenerateOrderItemListTable();
        this.UpdateDBVersion(latest_version, current_date);
      }

      if(db_version==latest_version){
        resolve({result:1, data:"DB Tables Updated."});
      }
    })
    return result;
  }

  /**
   * Fetch DB Version 
   */
  FetchDBVersion() {
    var data = null
    let sqlQuery = 'SELECT * FROM db_version ORDER BY ID LIMIT 1;'
    
    let result = new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(sqlQuery, [], (tx, results) => {
          // alert("data: " + JSON.stringify(results.rows.item(0)))
          if(results.rows.length > 0) {
            data = { result: 1, data: results.rows.item(0) }
            resolve(data)
          } else {
            data = { result: 0, data: "No Data Found" }
            resolve(data)
            // alert(JSON.stringify(data))
          }
        })
      }, (error) => {
        data = { result: 0, data: JSON.stringify(error) }
        resolve(data)
        // alert(JSON.stringify(data))
      })
    })
    return result
  }

  /**
   * Insert DB Version 
   */
  InsertDBVersion(version, last_update) {

    var data = [];
    let sqlQuery = 'INSERT INTO db_version (version, last_update) VALUES(?,?);'

    let result = new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(sqlQuery, [version, last_update], (tx, results) => { 
          if(results.rowsAffected>0){
            var insertId = results.insertId
            data = {result:1, data: {action: 'insert', insertId}};
            resolve(data);
          } else {
            data = {result: 0, data: {title: "", msg: "Inserted DB Version."}};
            resolve(data);
          }
        }, (err) => {
          data = {result: 0, data: {title: "Error ExecuteSQL (InsertDBVersion)", msg: JSON.stringify(err)}};
          resolve(data);
        });
      }, (error) => {
        data = {result: 0, data: {title: "Error Transaction (InsertDBVersion)", msg: error}};
        resolve(data);
      });
    })
    return result;
  }

  /**
   * Update DB Version 
   */
  UpdateDBVersion(version, last_update) {

    var data = [];
    let sqlQuery = `UPDATE db_version 
                    SET version = ?, last_update = ? 
                    WHERE id=(SELECT id FROM db_version ORDER BY ID LIMIT 1);`

    let result = new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(sqlQuery, [version, last_update], (tx, results) => { 
          if(results.rowsAffected==0){
            resolve(this.InsertDBVersion(version, last_update));
          } else if(results.rowsAffected>0){
            data = {result: 1, data: {action: 'update', msg: "Updated DB Version."}};
            resolve(data);
          }
        }, (err) => {
          data = {result: 0, data: {title: "Error ExecuteSQL (UpdateDBVersion)", msg: JSON.stringify(err)}};
          resolve(err);
        });
      }, (error) => {
        data = {result: 0, data: {title: "Error Transaction (UpdateDBVersion)", msg: error}};
        resolve(data);
      });
    });
    return result;
  }

  /*************************************************************/
  /************* GENERATE GENERAL DATA TABLES ******************/
  /*************************************************************/

  /**
   * Generate DB Version Table 
   */
  GenerateDBVersionTable() {
    // For alter table use in development.
    // let sqlQuery = 'ALTER TABLE server_config ADD selected_machine_branchid INTEGER ; '

    let sqlQuery = 'CREATE TABLE IF NOT EXISTS db_version (' + 
      'id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, ' + 
      'version INTEGER DEFAULT 0, ' +
      'last_update DATETIME ' +
    ');'
  
    this.db.transaction((tx) => {
      tx.executeSql(sqlQuery, "", () => {
      }, (err) => {
        this.database.errorCB('Error ExecuteSQL (GenerateDBVersionTable)', JSON.stringify(err));
      });
    }, (error) => {
      this.database.errorCB('Error Transaction (GenerateDBVersionTable)', error);
    }, () => {
      this.database.successCB('DB Version table generated.');
    });
  }

  /**
   * Generate Member Data Table 
   */
  GenerateMemberDataTable() {
    // For alter table use in development.
    // let sqlQuery = 'ALTER TABLE server_config ADD selected_machine_branchid INTEGER ; '

    var data = []
    let sqlQuery = `CREATE TABLE IF NOT EXISTS member_data (
      member_guid VARCHAR(36) NOT NULL PRIMARY KEY, 
      nric VARCHAR(20), 
      session_token VARCHAR(50), 
      pn_token VARCHAR(300), 
      card_no VARCHAR(36), 
      name TEXT, 
      gender VARCHAR(1), 
      dob DATE,
      postcode VARCHAR(10),
      address VARCHAR(100),
      city VARCHAR(50),
      state VARCHAR(20),
      phone VARCHAR(15),
      email VARCHAR(50),
      points INTEGER,
      points_update DATETIME,
      issue_date DATE,
      next_expiry_date DATE,
      member_type VARCHAR(15),
      member_type_desc TEXT,
      last_update DATETIME,
      pn_token_last_update DATETIME,
      login_status INTEGER,
      member_history_last_recalculate_time DATETIME,
      mobile_registered_time DATETIME, 
      referral_code TEXT,
      refer_by_referral_code TEXT
    );`

    let result = new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(sqlQuery, "", (tx, results) => {
        }, (err) => {
          data = { result: 0, error_msg: JSON.stringify(err) };
          resolve(data);
        });
      }, (error) => {
        data = { result: 0, error_msg: JSON.stringify(error) };
        resolve(data);
      }, () => {
        data = { result: 1, data: "Member Data Table Generated." };
        resolve(data);
      });
    })
    return result
  }

  /**
   * Generate Member Point History Table 
   */
  GenerateMemberPointHistoryTable() {

    var data = []
    let sqlQuery = `CREATE TABLE IF NOT EXISTS member_point_history (
      mph_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, 
      nric VARCHAR(20), 
      card_no VARCHAR(36),
      date DATETIME,
      branch_id INTEGER,
      branch_desc TEXT,
      type VARCHAR(20),
      points INTEGER,
      remark TEXT,
      point_source VARCHAR(20)
    );`

    let result = new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(sqlQuery, "", (tx, results) => {
        }, (err) => {
          data = { result: 0, error_msg: JSON.stringify(err) };
          resolve(data);
        });
      }, (error) => {
        data = { result: 0, error_msg: JSON.stringify(error) };
        resolve(data);
      }, () => {
        data = { result: 1, data: "Member Point History Table Generated." };
        resolve(data);
      });
    })
    return result
  }

  /**
   * Generate Promotion List Table 
   */
  GeneratePromotionListTable() {
    var data = []
    let sqlQuery = `CREATE TABLE IF NOT EXISTS promotion_list (
      promo_key VARCHAR(20) NOT NULL PRIMARY KEY, 
      nric VARCHAR(20), 
      title VARCHAR(50),
      date_from DATE,
      date_to DATE,
      time_from TIME,
      time_to TIME,
      banner_vertical_1 TEXT,
      promo_branch_id TEXT
    );`

    let result = new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(sqlQuery, "", (tx, results) => {
        }, (err) => {
          data = { result: 0, error_msg: JSON.stringify(err) };
          resolve(data);
        });
      }, (error) => {
        data = { result: 0, error_msg: JSON.stringify(error) };
        resolve(data);
      }, () => {
        data = { result: 1, data: "Promotion List Table Generated." };
        resolve(data);
      });
    })
    return result
  }

  /**
   * Generate Promotion List Items Table 
   */
  GeneratePromotionListItemsTable() {
    var data = []
    let sqlQuery = `CREATE TABLE IF NOT EXISTS promotion_list_items (
      promo_list_item_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, 
      promo_key VARCHAR(20),
      sku_item_id INTEGER,
      sku_desc TEXT,
      promo_photo_url TEXT,
      member_discount_percent DOUBLE,
      member_discount_amount DOUBLE,
      member_fixed_price DOUBLE,
      non_member_discount_percent DOUBLE,
      non_member_discount_amount DOUBLE,
      non_member_fixed_price DOUBLE,
      special_for_you INTEGER,
      selling_price DOUBLE,
      allowed_dis_member_type TEXT,
      allowed_dis_member_type_desc TEXT
    );`

    let result = new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(sqlQuery, "", (tx, results) => {
        }, (err) => {
          data = { result: 0, error_msg: JSON.stringify(err) };
          resolve(data);
        });
      }, (error) => {
        data = { result: 0, error_msg: JSON.stringify(error) };
        resolve(data);
      }, () => {
        data = { result: 1, data: "Promotion List Items Table Generated." };
        resolve(data);
      });
    })
    return result
  }

  /**
   * Generate Voucher List Table 
   */
  GenerateVoucherListTable() {
    // For alter table use in development.
    // let sqlQuery = 'ALTER TABLE server_config ADD selected_machine_branchid INTEGER ; '

    var data = []
    let sqlQuery = `CREATE TABLE IF NOT EXISTS voucher_list (
      voucher_id VARCHAR(20) NOT NULL PRIMARY KEY,
      batch_id VARCHAR(20),
      voucher_value DOUBLE,
      active INTEGER,
      activated_time DATETIME,
      valid_from DATETIME,
      valid_to DATETIME,
      cancelled INTEGER,
      voucher_barcode TEXT,
      voucher_used INTEGER,
      used_time DATETIME,
      used_receipt_ref_no TEXT
    );`

    let result = new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(sqlQuery, "", (tx, results) => {
        }, (err) => {
          data = { result: 0, error_msg: JSON.stringify(err) };
          resolve(data);
        });
      }, (error) => {
        data = { result: 0, error_msg: JSON.stringify(error) };
        resolve(data);
      }, () => {
        data = { result: 1, data: "Voucher List Table Generated." };
        resolve(data);
      });
    })
    return result
  }

  /**
   * Generate Push Notification Token Table
   */
  GeneratePushNotificationTokenTable() {

    var data = []
    let sqlQuery = `CREATE TABLE IF NOT EXISTS push_notification_token (
      id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      pn_token VARCHAR(300),
      last_update DATETIME
    );`

    let result = new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(sqlQuery, "", (tx, results) => {
        }, (err) => {
          data = { result: 0, error_msg: JSON.stringify(err) };
          resolve(data);
        });
      }, (error) => {
        data = { result: 0, error_msg: JSON.stringify(error) };
        resolve(data);
      }, () => {
        data = { result: 1, data: "Push Notification Token Table Generated." };
        resolve(data);
      });
    })
    return result
  }

  /**
   * Generate Notice Board Table
   */
  GenerateNoticeBoardTable() {

    var data = []
    let sqlQuery = `CREATE TABLE IF NOT EXISTS notice_board (
      nb_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      nb_server_id INTEGER NOT NULL,
      item_type VARCHAR(20) NOT NULL,
      image_click_link TEXT,
      item_url TEXT NOT NULL,
      video_site VARCHAR(50),
      video_link TEXT,
      sequence INTEGER,
      last_update DATETIME
    );`

    let result = new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(sqlQuery, "", (tx, results) => {
        }, (err) => {
          data = { result: 0, error_msg: JSON.stringify(err) };
          resolve(data);
        });
      }, (error) => {
        data = { result: 0, error_msg: JSON.stringify(error) };
        resolve(data);
      }, () => {
        data = { result: 1, data: "Notice Board Table Generated." };
        resolve(data);
      });
    });
    return result;
  }

  /**
   * Generate Coupon List Table
   */
  GenerateCouponListTable() {

    var data = []
    let sqlQuery = `CREATE TABLE IF NOT EXISTS coupon_list (
      cp_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      full_coupon_code VARCHAR(100) NOT NULL,
      value DOUBLE NOT NULL,
      discount_by VARCHAR(10) NOT NULL,
      member_limit_count INTEGER DEFAULT 0,
      total_used_count INTEGER DEFAULT 0,
      valid_from DATE,
      valid_to DATE,
      time_from TIME,
      time_to TIME,
      min_qty INTEGER DEFAULT 0,
      min_amt INTEGER DEFAULT 0,
      min_receipt_amt INTEGER DEFAULT 0,
      remark TEXT,
      limit_sid_list TEXT,
      dept_id INTEGER,
      dept_desc TEXT,
      brand_id INTEGER,
      brand_desc TEXT,
      vendor_id INTEGER,
      vendor_desc TEXT,
      member_limit_mobile_day_start INTEGER,
      member_limit_mobile_day_end INTEGER,
      member_limit_profile_info TEXT
    );`

    let result = new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(sqlQuery, "", (tx, results) => {
        }, (err) => {
          data = { result: 0, error_msg: JSON.stringify(err) };
          resolve(data);
        });
      }, (error) => {
        data = { result: 0, error_msg: JSON.stringify(error) };
        resolve(data);
      }, () => {
        data = { result: 1, data: "Coupon List Table Generated." };
        resolve(data);
      });
    });
    return result;
  }

  /**
   * Generate Package List Table
   */
  GeneratePackageListTable() {

    var data = []
    let sqlQuery = `CREATE TABLE IF NOT EXISTS package_list (
      pk_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      pk_guid VARCHAR(36) NOT NULL,
      package_ref_no VARCHAR(50) NOT NULL,
      pos_receipt_ref_no VARCHAR(50) NOT NULL,
      purchase_date DATE NOT NULL,
      purchase_qty INTEGER NOT NULL,
      earn_entry INTEGER NOT NULL,
      used_entry INTEGER NOT NULL,
      remaining_entry INTEGER NOT NULL,
      package_added_datetime DATETIME,
      last_update DATETIME,
      package_unique_id INTEGER NOT NULL,
      doc_no VARCHAR(50) NOT NULL,
      package_title VARCHAR(100),
      pos_branch_id INTEGER,
      pos_branch_code VARCHAR(50),
      sku_item_id INTEGER
    );`

    let result = new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(sqlQuery, "", (tx, results) => {
        }, (err) => {
          data = { result: 0, error_msg: JSON.stringify(err) };
          resolve(data);
        });
      }, (error) => {
        data = { result: 0, error_msg: JSON.stringify(error) };
        resolve(data);
      }, () => {
        data = { result: 1, data: "Package List Table Generated." };
        resolve(data);
      });
    });
    return result;
  }

  /**
   * Generate Package List Items Table
   */
  GeneratePackageListItemsTable() {

    var data = []
    let sqlQuery = `CREATE TABLE IF NOT EXISTS package_list_items (
      pk_item_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      pk_item_guid VARCHAR(36) NOT NULL,
      pk_item_title VARCHAR(100) NOT NULL,
      pk_item_desc TEXT,
      remark TEXT,
      entry_need INTEGER,
      max_redeem INTEGER,
      used_count INTEGER,
      sequence INTEGER,
      package_guid VARCHAR(36) NOT NULL
    );`

    let result = new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(sqlQuery, "", (tx, results) => {
        }, (err) => {
          data = { result: 0, error_msg: JSON.stringify(err) };
          resolve(data);
        });
      }, (error) => {
        data = { result: 0, error_msg: JSON.stringify(error) };
        resolve(data);
      }, () => {
        data = { result: 1, data: "Package List Items Table Generated." };
        resolve(data);
      });
    });
    return result;
  }

  /**
   * Generate Package Redeem History Table
   */
  GeneratePackageRedeemHistoryTable() {

    var data = []
    let sqlQuery = `CREATE TABLE IF NOT EXISTS package_redeem_history (
      pk_rh_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      pk_rh_guid VARCHAR(36) NOT NULL,
      branch_id INTEGER,
      branch_code VARCHAR(50),
      package_guid VARCHAR(36) NOT NULL,
      package_item_guid VARCHAR(36) NOT NULL,
      redeem_date DATE NOT NULL,
      used_entry INTEGER NOT NULL,
      service_rating INTEGER DEFAULT 0,
      redeem_datetime DATETIME,
      package_title VARCHAR(100) NOT NULL,
      package_item_title VARCHAR(100) NOT NULL,
      sa_info TEXT
    );`

    let result = new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(sqlQuery, "", (tx, results) => {
        }, (err) => {
          data = { result: 0, error_msg: JSON.stringify(err) };
          resolve(data);
        });
      }, (error) => {
        data = { result: 0, error_msg: JSON.stringify(error) };
        resolve(data);
      }, () => {
        data = { result: 1, data: "Package Redeem History Table Generated." };
        resolve(data);
      });
    });
    return result;
  }
  
  /**
   * Generate Server Config Table
   */
  GenerateServerConfigTable() {

    var data = []
    let sqlQuery = `CREATE TABLE IF NOT EXISTS server_config (
      id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      config_type VARCHAR(100) NOT NULL,
      data TEXT,
      last_update DATETIME
    );`

    let result = new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(sqlQuery, "", (tx, results) => {
        }, (err) => {
          data = { result: 0, error_msg: JSON.stringify(err) };
          resolve(data);
        });
      }, (error) => {
        data = { result: 0, error_msg: JSON.stringify(error) };
        resolve(data);
      }, () => {
        data = { result: 1, data: "Server Config Table Generated." };
        resolve(data);
      });
    });
    return result;
  }

  /**
   * Generate Branch List Table
   */
  GenerateBranchListTable() {

    var data = []
    let sqlQuery = `CREATE TABLE IF NOT EXISTS branch_list (
      guid INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      id INTEGER NOT NULL,
      code VARCHAR(20) NOT NULL,
      desc TEXT,
      address TEXT,
      phone_1 VARCHAR(20),
      phone_2 VARCHAR(20),
      phone_3 VARCHAR(20),
      contact_email VARCHAR(50),
      outlet_photo_url TEXT,
      operation_time TEXT,
      longitude VARCHAR(20),
      latitude VARCHAR(20),
      branch_group_id INTEGER,
      branch_group_code VARCHAR(20),
      branch_group_desc TEXT,
      last_update DATETIME
    );`

    let result = new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(sqlQuery, "", (tx, results) => {
        }, (err) => {
          data = { result: 0, error_msg: JSON.stringify(err) };
          resolve(data);
        });
      }, (error) => {
        data = { result: 0, error_msg: JSON.stringify(error) };
        resolve(data);
      }, () => {
        data = { result: 1, data: "Branch List Table Generated." };
        resolve(data);
      });
    });
    return result;
  }

  /**
   * Generate ECommerce Product Category Table
   */
  GenerateEComCategoryListTable() {

    var data = []
    let sqlQuery = `CREATE TABLE IF NOT EXISTS ecom_category_list (
      id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER NOT NULL,
      description TEXT,
      level INTEGER,
      parent_category_id INTEGER,
      changes_row_index INTEGER,
      active INTEGER,
      image_path TEXT
    );`

    let result = new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(sqlQuery, "", (tx, results) => {
        }, (err) => {
          data = { result: 0, error_msg: JSON.stringify(err) };
          resolve(data);
        });
      }, (error) => {
        data = { result: 0, error_msg: JSON.stringify(error) };
        resolve(data);
      }, () => {
        data = { result: 1, data: "ECommerce Product Category Table Generated." };
        resolve(data);
      });
    });
    return result;
  }

  /**
   * Generate Order List Data Table
   */
  GenerateOrderListTable() {
    
    var data = []
    let sqlQuery = `CREATE TABLE IF NOT EXISTS order_list (
      id                 INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      local_id           VARCHAR(36),
      transaction_id     VARCHAR(100),
      receipt_no         VARCHAR(50),
      receipt_ref_no     VARCHAR(50),
      branch_id          INTEGER,
      member_card_no     VARCHAR(36),
      counter_id         VARCHAR(50),
      cashier_id         INTEGER,
      cashier_name       VARCHAR(100),
      status             VARCHAR(100),
      sub_total_amount   DOUBLE,
      discount_amount    DOUBLE,
      rounding           VARCHAR(50),
      total_amount       DOUBLE,
      cash_received      DOUBLE,
      change             DOUBLE,
      payment            TEXT,
      transaction_date   DATE,
      start_time         DATETIME,
      end_time           DATETIME,
      uploaded_sale_time DATETIME,
      created_date       DATETIME,
      updated_date       DATETIME,
      deleted_date       DATETIME,
      pos_settings       TEXT
    );`

    let result = new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(sqlQuery, "", (tx, results) => {
        }, (err) => {
          data = { result: 0, error_msg: JSON.stringify(err) };
          resolve(data);
        });
      }, (error) => {
        data = { result: 0, error_msg: JSON.stringify(error) };
        resolve(data);
      }, () => {
        data = { result: 1, data: "Order List Table Generated." };
        resolve(data);
      });
    });
    return result;
  }

  /**
   * Generate Order Item List Data Table
   */
  GenerateOrderItemListTable() {
    
    var data = []
    let sqlQuery = `CREATE TABLE IF NOT EXISTS order_item_list (
      id                          INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      local_id                    VARCHAR(36),
      transaction_id              VARCHAR(100),
      branch_id                   INTEGER,
      sku_item_id                 INTEGER,
      sku_item_code               INTEGER,
      mcode                       INTEGER,
      link_code                   INTEGER,
      artno                       INTEGER,
      scanned_code                INTEGER,
      product_name                VARCHAR(100),
      default_price               DOUBLE,
      selling_price               DOUBLE,
      quantity                    DOUBLE,
      manual_discount_amount      DOUBLE,
      created_date                DATETIME,
      updated_date                DATETIME,
      product_image               TEXT,
      discount_percent            DOUBLE,
      discount_amount             DOUBLE,
      tax_amount                  DOUBLE
    );`

    let result = new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(sqlQuery, "", (tx, results) => {
        }, (err) => {
          data = { result: 0, error_msg: JSON.stringify(err) };
          resolve(data);
        });
      }, (error) => {
        data = { result: 0, error_msg: JSON.stringify(error) };
        resolve(data);
      }, () => {
        data = { result: 1, data: "Order Item List Table Generated." };
        resolve(data);
      });
    });
    return result;
  }

  /**
   * Generate 
   */

  /*************************************************************/
  /************** GENERATE ALTER DATA TABLES *******************/
  /*************************************************************/

  AddSellingPriceColumn(){
    var data = [];
    let sqlQuery = 'ALTER TABLE promotion_list_items ADD selling_price DOUBLE ;';
    
    let result = new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(sqlQuery, "", () => {
        }, (err) => {
          data = { result: 0, error_msg: JSON.stringify(err) };
          resolve(data);
        });
      }, (error) => {
        data = { result: 0, error_msg: error };
        resolve(data);
      }, () => {
        data = { result: 1, data: 'Selling price added in promotion list items db.' };
        resolve(data);
      });
    });
    return result;
  }

  AddPromotionListItemsMemberTypeColumn(){
    var data = [];
    let sqlQuery1 = 'ALTER TABLE promotion_list_items ADD allowed_dis_member_type TEXT ;';
    let sqlQuery2 = 'ALTER TABLE promotion_list_items ADD allowed_dis_member_type_desc TEXT ;';
    
    let result = new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(sqlQuery1, "", () => {
        }, (err) => {
          data = { result: 0, error_msg: JSON.stringify(err) };
        });
        tx.executeSql(sqlQuery2, "", () => {
        }, (err) => {
          data = { result: 0, error_msg: JSON.stringify(err) };
          resolve(data);
        });
      }, (error) => {
        data = { result: 0, error_msg: error };
        resolve(data);
      }, () => {
        data = { result: 1, data: 'Member type added in promotion list items db.' };
        resolve(data);
      });
    });
    return result;
  }

  AddMobileRegisteredTimeColumn(){
    var data = [];
    let sqlQuery = 'ALTER TABLE member_data ADD mobile_registered_time DATETIME ;';
    
    let result = new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(sqlQuery, "", () => {
        }, (err) => {
          data = { result: 0, error_msg: JSON.stringify(err) };
          resolve(data);
        });
      }, (error) => {
        data = { result: 0, error_msg: error };
        resolve(data);
      }, () => {
        data = { result: 1, data: 'Mobile Registered Time added in member data db.' };
        resolve(data);
      });
    });
    return result;
  }

  AddMemberLimitCouponColumn(){
    var data = [];
    let sqlQuery1 = 'ALTER TABLE coupon_list ADD member_limit_mobile_day_start INTEGER ;';
    let sqlQuery2 = 'ALTER TABLE coupon_list ADD member_limit_mobile_day_end INTEGER ;';
    let sqlQuery3 = 'ALTER TABLE coupon_list ADD member_limit_profile_info TEXT ;';
    
    let result = new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(sqlQuery1, "", () => {
        }, (err) => {
          data = { result: 0, error_msg: JSON.stringify(err) };
          resolve(data);
        });
        tx.executeSql(sqlQuery2, "", () => {
        }, (err) => {
          data = { result: 0, error_msg: JSON.stringify(err) };
          resolve(data);
        });
        tx.executeSql(sqlQuery3, "", () => {
        }, (err) => {
          data = { result: 0, error_msg: JSON.stringify(err) };
          resolve(data);
        });
      }, (error) => {
        data = { result: 0, error_msg: error };
        resolve(data);
      }, () => {
        data = { result: 1, data: 'Member Limit Coupon added in coupon list db.' };
        resolve(data);
      });
    });
    return result;
  }

  AddMemberReferralProgramColumn(){
    var data = [];
    let sqlQuery1 = 'ALTER TABLE member_data ADD referral_code TEXT ;';
    let sqlQuery2 = 'ALTER TABLE member_data ADD refer_by_referral_code TEXT ;';
    
    let result = new Promise((resolve, reject) => {
      this.db.transaction((tx) => {
        tx.executeSql(sqlQuery1, "", () => {
        }, (err) => {
          data = { result: 0, error_msg: JSON.stringify(err) };
          resolve(data);
        });
        tx.executeSql(sqlQuery2, "", () => {
        }, (err) => {
          data = { result: 0, error_msg: JSON.stringify(err) };
          resolve(data);
        });
      }, (error) => {
        data = { result: 0, error_msg: error };
        resolve(data);
      }, () => {
        data = { result: 1, data: 'Referral Program Column added in member data db.' };
        resolve(data);
      });
    });
    return result;
  }

  render() {
    return null;
  }
};  