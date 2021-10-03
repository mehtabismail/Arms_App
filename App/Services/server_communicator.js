/** REACT NATIVE **/
import React from 'react';

/** PROJECT FILES **/
import AppConfig from "../Config/AppConfig";
import Member from '../Modules/Member/Modals/member_modal';
import ServerController from '../Modules/General/ServerConfig/Actions/server_controller';

/** NPM LIBRARIES **/
import md5 from "react-native-md5";

export default class ServerCommunicator extends React.Component {
  constructor() {
    super();

    this.serverController = new ServerController();
  }

  async PostData(formData) {
    const { api_url, access_token, hash_prefix, device_uuid, app_version, app_name } = AppConfig;

    /** Assign Header Data **/
    var header_arr = {
      'X_ENCRYPT_TOKEN': md5.hex_md5(hash_prefix + access_token),
      'X_DEVICE_ID': device_uuid,
      'X_APP_VERSION': app_version,
      'X_APP_TYPE': app_name,
    };
    /** END of Assign Header Data **/

    // Below are the action of API called need to have X_MEM_NRIC & X_MEM_TOKEN header data
    var a_arr_member_identity = [
      'set_member_device_info',
      'get_my_member_info',
      'get_my_member_point_history',
      'get_my_member_promotion_list',
      'get_my_member_voucher_list',
      'get_my_member_coupon_list',
      'change_my_member_pass',
      'validate_my_member_pass',
      'update_my_member_info',
      'upload_my_member_profile_image',
      'logout_my_member',
      'get_my_member_package_list',
      'get_my_member_package_redeem_history',
      'rate_my_member_package_redeem_history',
      'enter_member_referral_code',
    ];

    // Below are the action of API called need to have X_APP_BRANCH_ID header data
    var a_arr_get_selected_branchid = [
      'upload_pos',
      'get_pos_settings'
    ];

    // Retrieve API's action value from formData 
    var field = formData.getParts().find(item => item.fieldName === 'a');
    if (field) {
      // Add user_session_token in header
      if (a_arr_member_identity.indexOf(field.string) >= 0) {
        // GET Member NRIC & Session Token from member_data db
        var member = new Member();
        var member_data = await member.FetchLoginMemberNRIC_SessionToken();
        if (member_data.result == 1 && member_data.data) {
          header_arr.X_MEM_NRIC = member_data.data.nric;
          header_arr.X_MEM_TOKEN = member_data.data.session_token;
        }
      }

      //Add upload photo config in header
      if (field.string == "upload_my_member_profile_image") {
        header_arr["Accept"] = 'application/json';
        header_arr["Content-Type"] = 'multipart/form-data';
      }

      //Add branch id config in header
      if (a_arr_get_selected_branchid.indexOf(field.string) >= 0) {
        var branch_id = formData.getParts().find(item => item.fieldName === 'branch_id');
        header_arr.X_APP_BRANCH_ID = branch_id.string;
      }
    }

    // URL Validation
    let result = new Promise((resolve, reject) => {
      fetch(`${api_url}/api.arms.internal.php`, {
        method: 'POST',
        headers: header_arr,
        body: formData
      })
        .then((response) => response.json())
        .then((responseJson) => {
          resolve(responseJson);
        })
        .catch((error) => {
          resolve({ result: 0, error_msg: error.toString() });
        });
    })
    return result
  }

  // SellerHub Server Communicator
  async SHPostData(jsonData) {
    const { sh_api_url } = AppConfig;

    // Get MarketPlace URL & Access Token
    // var serverController = new ServerController();
    var sh_url = await this.serverController.GetMarketPlaceURL();
    var sh_access_token = await this.serverController.GetMarketPlaceAccessToken();

    /** Assign Header Data **/
    var header_arr = {
      'X_ACCESS_TOKEN': sh_access_token,
    }
    /** END of Assign Header Data **/

    /**
     * Add Member NRIC based on action list
     */
    var list_action_nric = [
      "add_item_cart",
      "update_qty_cart",
      "delete_item_cart",
      "get_item_cart",
      "get_purchase_history",
      "get_shipping_info",
      "add_shipping_data"
    ];
    if (list_action_nric.indexOf(jsonData.a) >= 0) {
      // GET Member NRIC & Session Token from member_data db
      var member = new Member();
      var member_data = await member.FetchLoginMemberNRIC_SessionToken();
      if (member_data.result == 1 && member_data.data) {
        jsonData["member_nric"] = member_data.data.nric;
      }
    }

    // Included action to API URL Path.
    var sh_api_url_action = `${sh_url}/${sh_api_url}${jsonData.a}`;
    // alert(sh_api_url_action)
    delete jsonData.a;
    // Convert FormData to JSON Format, to cater SellerHub api body data receiver.
    // alert(JSON.stringify(jsonData));

    // URL Validation
    let result = new Promise((resolve, reject) => {
      fetch(sh_api_url_action, {
        method: 'POST',
        headers: header_arr,
        body: JSON.stringify(jsonData)
      })
        .then((response) => response.json())
        .then((responseJson) => {
          console.log("Server Result: ", responseJson);
          resolve(responseJson);
        })
        .catch((error) => {
          resolve({ result: 0, error_msg: error.toString() });
        });
    })
    return result;
  }

  render() {
    return null;
  }
}