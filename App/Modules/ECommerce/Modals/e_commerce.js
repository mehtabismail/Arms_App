/** REACT NATIVE **/
import { Platform } from 'react-native';

/** PROJECT FILES **/
import {
  I18n, Images,
  AppConfig,
  ARMSDownloader, ServerCommunicator,
  Database,
} from '../../../Services/LibLinking';

/** NPM LIBRARIES **/
import moment from 'moment';
import md5 from "react-native-md5";

export default class ECommerce {
  constructor(props) {
    // super(props);

    // Create Database Object
    this.database = new Database();
    this.db = this.database.db;

    // Create Object
    this.armsDownloader = new ARMSDownloader();
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
   * Seller Hub - Get Product
   */
  FetchProduct(start_from) {
    let result = new Promise((resolve, reject) => {
      var jsonData = {};
      jsonData["a"] = "get_product";
      jsonData["limit_count"] = 10;
      jsonData["start_from"] = start_from ? start_from : 0;
      jsonData["active"] = 1;

      resolve(this.GetProductData(jsonData));
    });
    return result;
  }

  /**
   * Seller Hub - Get Featured Product
   */
  FetchFeaturedProduct(start_from) {
    let result = new Promise((resolve, reject) => {
      var jsonData = {};
      jsonData["a"] = "get_product";
      jsonData["limit_count"] = 10;
      jsonData["start_from"] = start_from ? start_from : 0;
      jsonData["active"] = 1;
      jsonData["featured_products"] = 1;

      resolve(this.GetProductData(jsonData));
    });
    return result;
  }

  /**
   * Seller Hub - Get Product By Product SKU ID
   */
  FetchProductBySKUId(product_sku_id_list) {
    let result = new Promise((resolve, reject) => {
      var jsonData = {};
      jsonData["a"] = "get_product";
      jsonData["product_sku_id_list"] = product_sku_id_list;

      resolve(this.GetProductData(jsonData));
    });
    return result;
  }

  /**
   * Seller Hub - Get Active Product By Category List
   */
  FetchProductByCatList(category_list, start_from) {
    let result = new Promise((resolve, reject) => {
      var jsonData = {};
      jsonData["a"] = "get_product";
      jsonData["category_id_list"] = category_list;
      jsonData["limit_count"] = 30;
      jsonData["start_from"] = start_from ? start_from : 0;
      jsonData["active"] = 1;

      resolve(this.GetProductData(jsonData));
    });
    return result;
  }

  /**
   * Seller Hub - Get Active Product By Category List & Description
   */
  FetchProductByCatListAndDesc(description, category_list, start_from) {
    let result = new Promise((resolve, reject) => {
      var jsonData = {};
      jsonData["a"] = "get_product";
      // Description
      if (description) {
        jsonData["description"] = description;
      }
      // Category ID List 
      if (category_list.length > 0) {
        jsonData["category_id_list"] = category_list;
      }
      jsonData["limit_count"] = 30;
      jsonData["start_from"] = start_from ? start_from : 0;
      jsonData["active"] = 1;

      resolve(this.GetProductData(jsonData));
    });
    return result;
  }

  /**
   * Get Product Data From Server
   */
  async GetProductData(jsonData) {
    // Get MarketPlace URL
    var sh_url = await this.serverCommunicator.serverController.GetMarketPlaceURL();
    // Get Currency Symbol
    var currency_symbol = await this.serverCommunicator.serverController.GetCurrencyData("symbol");

    let result = new Promise((resolve, reject) => {

      // Send to data to server communicator
      var post_return = this.serverCommunicator.SHPostData(jsonData);
      post_return.then((res) => {
        // alert(JSON.stringify(res));
        if (res.result == 1) {
          var product_data_length = Object.keys(res.product_data).length;
          if (product_data_length > 0) {
            var product_data = [];
            Object.keys(res.product_data).map((value, index) => {
              // Combine Image URL with Server URL
              if (res.product_data[value].images.length > 0) {
                for (let i = 0; i < res.product_data[value].images.length; i++) {
                  res.product_data[value].images[i] = { uri: `${sh_url}/${res.product_data[value].images[i]}` };
                }
              } else {
                res.product_data[value].images[0] = Images.imageNoAvailable;
              }
              // Add Currency Symbol to product data
              res.product_data[value].currency_symbol = currency_symbol;
              // Add Discount Percentage Rate
              res.product_data[value].discount_per = parseFloat(res.product_data[value].discounted_price) > 0 ?
                Math.round((1 - (res.product_data[value].discounted_price / res.product_data[value].default_selling_price)) * 100) : 0;

              product_data.push(res.product_data[value]);
            });
            // alert(JSON.stringify(product_data));
            resolve({ result: 1, data: product_data });
          } else {
            // Product Data Is Empty
            resolve({ result: 0, data: { title: "Error", msg: "Product Data Is Empty." } });
          }
        } else {
          res.error_msg = res.error_code == "exception_error" && res.error_msg == "" ? "Server Updating. Please Try Again." : res.error_msg;
          resolve({ result: 0, data: { title: "Error", msg: res.error_msg, error_code: res.error_code } });
        }
      });

    });
    return result;
  }

  /**
   * Seller Hub - Add Item To Cart
   */
  AddItemToCart(product_data) {

    var jsonData = {};
    jsonData["a"] = "add_item_cart";
    jsonData["product_sku_id"] = product_data.product_sku_id;
    jsonData["quantity"] = product_data.quantity;

    let result = new Promise((resolve, reject) => {
      // Send to data to server communicator
      var post_return = this.serverCommunicator.SHPostData(jsonData);
      post_return.then((res) => {
        // alert(JSON.stringify(res));
        if (res.result == 1) {
          resolve(res);
        } else {
          res.error_msg = res.error_code == "exception_error" && res.error_msg == "" ? "Server Updating. Please Try Again." : res.error_msg;
          resolve({ result: 0, data: { title: "Error", msg: res.error_msg, error_code: res.error_code } });
        }
      });
    });
    return result;
  }

  /**
   * Seller Hub - Update Item Quantity To Cart
   */
  UpdateQtyToCart(product_data) {

    var jsonData = {};
    jsonData["a"] = "update_qty_cart";
    jsonData["product_sku_id"] = product_data.product_sku_id;
    jsonData["quantity"] = product_data.quantity;

    let result = new Promise((resolve, reject) => {
      // Send to data to server communicator
      var post_return = this.serverCommunicator.SHPostData(jsonData);
      post_return.then((res) => {
        // alert(JSON.stringify(res));
        if (res.result == 1) {
          resolve(res);
        } else {
          res.error_msg = res.error_code == "exception_error" && res.error_msg == "" ? "Server Updating. Please Try Again." : res.error_msg;
          resolve({ result: 0, data: { title: "Error", msg: res.error_msg, error_code: res.error_code } });
        }
      });
    });
    return result;
  }

  /**
   * Seller Hub - Delete Item From Cart
   */
  DeleteItemFromCart(product_sku_id) {

    var jsonData = {};
    jsonData["a"] = "delete_item_cart";
    jsonData["product_sku_id"] = product_sku_id;

    let result = new Promise((resolve, reject) => {
      // Send to data to server communicator
      var post_return = this.serverCommunicator.SHPostData(jsonData);
      post_return.then((res) => {
        // alert(JSON.stringify(res));
        if (res.result == 1) {
          resolve(res);
        } else {
          res.error_msg = res.error_code == "exception_error" && res.error_msg == "" ? "Server Updating. Please Try Again." : res.error_msg;
          resolve({ result: 0, data: { title: "Error", msg: res.error_msg, error_code: res.error_code } });
        }
      });
    });
    return result;
  }

  /**
   * Seller Hub - Get Cart Data List
   */
  async FetchCartDataList() {
    // Get Currency Symbol
    var currency_symbol = await this.serverCommunicator.serverController.GetCurrencyData("symbol");

    var jsonData = {};
    jsonData["a"] = "get_item_cart";

    let result = new Promise((resolve, reject) => {
      // Send to data to server communicator
      var post_return = this.serverCommunicator.SHPostData(jsonData);
      post_return.then(async (res) => {
        // alert(JSON.stringify(res));
        res.currency_symbol = currency_symbol;
        // alert(JSON.stringify(res));
        // "result": 1,
        // "member_nric": "930601075237",
        // "total_amount": 26.9,
        // "voucher_code": "",
        // "voucher_amount": 0,
        // "shipping_fee": 0,
        // "total_item_amount": 26.9,
        // "item_data": [
        //     {
        //         "product_sku_id": 14,
        //         "qty": 1,
        //         "amount": 26.9
        //     }
        // ]

        // "result": 0,
        // "error_code": "cart_empty",
        // "error_msg": "Cart is empty"
        if (res.result == 1) {
          for (let i = 0; i < res.item_data.length; i++) {
            var get_prod_data = await this.FetchProductBySKUId([res.item_data[i].product_sku_id]);
            if (get_prod_data.result == 1) {
              res.item_data[i].product_name = get_prod_data.data[0].product_name
              res.item_data[i].prod_price = parseFloat(get_prod_data.data[0].discount_amt) > 0 ?
                parseFloat(get_prod_data.data[0].discounted_price).toFixed(2) :
                parseFloat(get_prod_data.data[0].default_selling_price).toFixed(2);
              res.item_data[i].images = get_prod_data.data[0].images[0];
              res.item_data[i].active = get_prod_data.data[0].active;

              // Add Product Data Into full_product_data
              res.item_data[i].full_product_data = get_prod_data.data[0];
            }
          }

          // Convert to 2 decimal
          res.shipping_fee = parseFloat(res.shipping_fee).toFixed(2);
          res.total_amount = parseFloat(res.total_amount).toFixed(2);
          res.total_item_amount = parseFloat(res.total_item_amount).toFixed(2);

          resolve(res);
        } else {
          res.error_msg = res.error_code == "exception_error" && res.error_msg == "" ? "Server Updating. Please Try Again." : res.error_msg;
          resolve({ result: 0, data: { title: "Error", msg: res.error_msg, error_code: res.error_code } });
        }
      });
    });
    return result;
  }

  /**
   * Seller Hub - Get Cart Item Count
   */
  FetchCartItemCount() {

    var jsonData = {};
    jsonData["a"] = "get_item_cart";

    let result = new Promise((resolve, reject) => {
      // Send to data to server communicator
      var post_return = this.serverCommunicator.SHPostData(jsonData);
      post_return.then((res) => {
        // alert(JSON.stringify(res));
        // "result": 1,
        // "member_nric": "930601075237",
        // "total_amount": 26.9,
        // "voucher_code": "",
        // "voucher_amount": 0,
        // "shipping_fee": 0,
        // "total_item_amount": 26.9,
        // "item_data": [
        //     {
        //         "product_sku_id": 14,
        //         "qty": 1,
        //         "amount": 26.9
        //     }
        // ]

        // "result": 0,
        // "error_code": "cart_empty",
        // "error_msg": "Cart is empty"
        if (res.result == 1) {
          resolve({ result: 1, total_cart_item: res.item_data.length });
        } else {
          resolve({ result: 1, total_cart_item: 0 });
        }
      });
    });
    return result;
  }

  /**
   * Seller Hub - Get Purchase History
   */
  async FetchPurchaseHistory() {
    // Get Currency Symbol
    var currency_symbol = await this.serverCommunicator.serverController.GetCurrencyData("symbol");

    var jsonData = {};
    jsonData["a"] = "get_purchase_history";

    let result = new Promise((resolve, reject) => {
      // Send to data to server communicator
      var post_return = this.serverCommunicator.SHPostData(jsonData);
      post_return.then(async (res) => {
        // alert(JSON.stringify(res))
        res.currency_symbol = currency_symbol;
        if (res.result == 1) {
          for (let i = 0; i < res.order_data.length; i++) {

            // Assign order status text based on order status
            switch (res.order_data[i].order_status) {
              case "unpaid":
                res.order_data[i].order_status_text = "Unpaid";
                break;

              case "ready_to_ship":
                res.order_data[i].order_status_text = "Ready To Ship";
                break;

              case "checkout":
                res.order_data[i].order_status_text = "Pending To Receive";
                break;

              case "complete":
                res.order_data[i].order_status_text = "Completed";

              case "cancel":
                res.order_data[i].order_status_text = "Completed";

              default:
                res.order_data[i].order_status_text = "";
                break;
            }

            // Assign Product Info From DB
            for (let j = 0; j < res.order_data[i].item_data.length; j++) {
              var get_prod_data = await this.FetchProductBySKUId([res.order_data[i].item_data[j].product_sku_id]);
              if (get_prod_data.result == 1) {
                res.order_data[i].item_data[j].product_name = get_prod_data.data[0].product_name;
                res.order_data[i].item_data[j].images = get_prod_data.data[0].images[0];
                res.order_data[i].item_data[j].active = get_prod_data.data[0].active;

                // Add Product Data Into full_product_data
                res.order_data[i].item_data[j].full_product_data = get_prod_data.data[0];

                // Convert product amount to 2 decimal
                res.order_data[i].item_data[j].amount = parseFloat(res.order_data[i].item_data[j].amount).toFixed(2);
              }
            }

            // Convert to 2 decimal
            res.order_data[i].shipping_fees = parseFloat(res.order_data[i].shipping_fees).toFixed(2);
            res.order_data[i].total_item_amount = parseFloat(res.order_data[i].total_item_amount).toFixed(2);
            res.order_data[i].payment_amount = parseFloat(res.order_data[i].payment_amount).toFixed(2);
          }

          resolve(res);
        } else {
          res.error_msg = res.error_code == "exception_error" && res.error_msg == "" ? "Server Updating. Please Try Again." : res.error_msg;
          resolve({ result: 0, data: { title: "Error", msg: res.error_msg, error_code: res.error_code } });
        }
      });
    });
    return result;
  }

  /**
   * Seller Hub - Get Shipping Info
   */
  async FetchShippingInfo(userAddress) {
    let result = new Promise(async (resolve, reject) => {
      const jsonData = { ...userAddress, a: 'get_shipping_info' }
      const response = await this.serverCommunicator.SHPostData(jsonData) // Send to data to server communicator
      if (response.result == 0) { // return early
        const error_msg =
          response.error_code == 'exception_error' && response.error_msg == ''
            ? 'Server Updating. Please Try Again.'
            : response.error_msg
        resolve({ result: 0, data: { title: "Error", msg: error_msg, error_code: response.error_code } })
      }
      resolve({ result: 1, data: response.shipment_methods })
    })
    return result
  }

  /**
   * Seller Hub - Get Shipping Info
   */
  async AddShippingData(shippingMethod) {
    let result = new Promise(async (resolve, reject) => {
      const jsonData = { ...shippingMethod, a: 'add_shipping_data' }
      const response = await this.serverCommunicator.SHPostData(jsonData) // Send to data to server communicator
      if (response.result == 0) { // return early
        const error_msg =
          response.error_code == 'exception_error' && response.error_msg == ''
            ? 'Server Updating. Please Try Again.'
            : response.error_msg
        resolve({ result: 0, data: { title: "Error", msg: error_msg, error_code: response.error_code } })
      }
      resolve({ result: 1, data: {} })
    })
    return result
  }

}