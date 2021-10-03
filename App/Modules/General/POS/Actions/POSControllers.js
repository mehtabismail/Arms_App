/** REACT NATIVE **/
import React from 'react';

/** PROJECT FILES **/
import { 
  I18n,
  AppConfig,
} from '../../../../Services/LibLinking';
import POS from "../Modals/pos_modal";

/** NPM LIBRARIES **/
import NetInfo from "@react-native-community/netinfo";
import moment from 'moment';


export default class POSController extends React.Component {
  constructor(props){
    super(props);

    // Create package object
    this.pos = new POS();
  }

  // Get Product Details
  getProductDetails(barcode, branch_id){
    let result = new Promise((resolve, reject) => {
      var network_return = this.networkConnectValidation();
      network_return.then((res) =>{
        if(res.result == 1){
          var fetch_result = this.pos.FetchProductDetailsViaAPI(barcode, branch_id);
          fetch_result.then((res) =>{
            if(res.result == 1){
              var prodSKUItemID = res.data.sku_item_id;
              var prodDesc = res.data.description;
              var prodPicture = res.data.photo;
              var prodInternalDesc = res.data.internal_description;
              var prodDetails = [
                // {key: 'deparment', cat_title: 'Department', data: res.data.department},
                // {key: 'location', cat_title: 'Location', data: res.data.location},
                {key: 'category', cat_title: 'Category', data: res.data.category},
                {key: 'sub_category', cat_title: 'Sub Category', data: res.data.sub_category},
                {key: 'stock_qty', cat_title: 'Stock', data: res.data.stock_qty}
              ];

              // Product Codes
              var prodCodes = {
                sku_item_code: res.data.sku_item_code,
                mcode: res.data.mcode, 
                link_Code: res.data.link_Code, 
                artno: res.data.artno,
              };

              // Fix price to 2 decimal and add thousand separator
              var default_price = parseFloat(res.data.default_price).toFixed(2);
              var member_price =  parseFloat(res.data.member_price).toFixed(2);
              var non_member_price =  parseFloat(res.data.non_member_price).toFixed(2);

              // Assign member price
              var memberPriceAmt = res.data.member_discount ? member_price : '';
              // Assign non member price type label
              var nonMemberPriceType = res.data.non_member_discount ? 'Discount Price' : 'Normal Price';
              // Assign non member price
              var nonMemberPriceAmt = res.data.non_member_discount ? non_member_price : default_price;
              var priceList = [
                {
                  key: 'member', 
                  price_type: 'Member Price', 
                  price_amt: memberPriceAmt, 
                  discount_percent: res.data.member_discount ? res.data.member_discount : 0,
                  discount_amt: res.data.member_discount ? parseFloat(default_price) - parseFloat(member_price) : 0,
                  default_price: default_price
                },
                {
                  key: 'non_member', 
                  price_type: nonMemberPriceType, 
                  price_amt: nonMemberPriceAmt, 
                  discount_percent: res.data.non_member_discount ? res.data.non_member_discount : 0, // Discount Percent
                  discount_amt: res.data.non_member_discount ? parseFloat(default_price) - parseFloat(non_member_price) : 0,
                  default_price: default_price
                }
              ];
              // Assign Member Category Price List
              if(res.data.member_type_cat_discount && Object.keys(res.data.member_type_cat_discount).length > 0){
                Object.keys(res.data.member_type_cat_discount).map((key, index)=>{
                  priceList.push(
                    {
                      key, 
                      price_type: 'Member Price', 
                      price_amt: parseFloat(res.data.member_type_cat_discount[key].price).toFixed(2), 
                      discount_percent: res.data.member_type_cat_discount[key].discount,
                      discount_amt: parseFloat(default_price) - parseFloat(res.data.member_type_cat_discount[key].price),
                      default_price: default_price
                    }
                  );
                });
              }

              resolve({result: 1, data: {prodSKUItemID, prodDesc, prodPicture, prodDetails, priceList, prodInternalDesc, prodCodes}});
            } else {
              resolve(res);
            }
          })
        } else {
          data = {result: 0, data:{ title: "Network Error", msg: "Please check the network connection." }};
          resolve(data);
        }
      });
    })
    return result;
  }

  // Save order to DB
  saveOrder(order){
    let result = new Promise((resolve, reject) => {
      resolve(this.pos.CreateOrder(order));
    });
    return result;
  }

  // Get order by local id
  getOrder(local_id){
    let result = new Promise((resolve, reject) => {
      var order_result = this.pos.FetchOrderByLocalID(local_id);
      order_result.then((res) => {
        if(res.result == 1){
          var order = res.data;

          // Get order item
          var order_item_result = this.pos.FetchOrderItemByLocalID(local_id);
          order_item_result.then((res) => {
            if(res.result == 1){
              order.order_item = res.data;
              resolve({result: 1, data: order});
            } else {
              resolve(res);
            }
          });
        } else {
          resolve(res);
        }
      });
    });
    return result;
  }

  // Get all order by member card no
  getAllOrderByMemberCardNo(member_card_no){
    let result = new Promise((resolve, reject) => {
      resolve(this.pos.FetchOrderByMemberCardNo(member_card_no));
    });
    return result;
  }

  // Get all un-upload orders
  getAllUnUploadOrders(){
    let result = new Promise((resolve, reject) => {
      resolve(this.pos.FetchOrderByStatus("paid"));
    });
    return result;
  }

  // Upload all un-upload orders to server
  uploadAllUnUploadOrders(){
    let result = new Promise((resolve, reject) => {
      // Get All Un-Upload Order
      var unUploadOrder_return = this.getAllUnUploadOrders();
      unUploadOrder_return.then((res)=>{
        // console.log("Get All Un-Upload Orders: ", JSON.stringify(res));
        if(res.result == 1){
          var data_list = [];
          for (let i = 0; i < res.data.length; i++) {
            // Calculate Amount W/O Tax
            var total_amount = parseFloat(res.data[i].total_amount);
            var tax_rate = parseFloat("0.06");
            res.data[i].tax_amount = total_amount * tax_rate;
            res.data[i].total_amount_wo_tax = total_amount - res.data[i].tax_amount;

            // Assign Order Data
            var order_data = {
              pos_guid: res.data[i].local_id,
              ref_id: res.data[i].id,
              pos_time: res.data[i].created_date,
              cashier_id: res.data[i].cashier_id,
              user_name: '',
              amount: res.data[i].total_amount,
              cancel_status: 0,
              date: moment(res.data[i].transaction_date).format("YYYY-MM-DD"),
              start_time: res.data[i].start_time,
              end_time: res.data[i].end_time,
              amount_change: res.data[i].change,
              service_charges: 0.0,
              service_charges_tax_amt: 0.0,
              receipt_discount: 0.0,
              discount_pattern: "",
              receipt_no: res.data[i].receipt_no,
              receipt_ref_no: res.data[i].receipt_ref_no,
              tax_amount: res.data[i].tax_amount,
              tax_code: "ST6",
              round: res.data[i].rounding,
              remark: "",
              items_list: [],
              payment: [],
            };

            // Assign Order Items Data
            for (let j = 0; j < res.data[i].order_item.length; j++) {
              var item = res.data[i].order_item[j];
              order_data.items_list.push({
                ref_id: item.id,
                sku_item_id: item.sku_item_id,
                arms_code: item.sku_item_code,
                qty: item.quantity,
                price: item.default_price,
                discount: item.discount_amount,
                discount2: "",
                tax_amount: item.tax_amount,
                remark: ""
              });
            }

            // Add Payment Method
            for (let k = 0; k < res.data[i].payment.length; k++) {
              var item = res.data[i].payment[k];
              order_data.payment.push({
                type: item.payment_type,
                remark: "",
                amount: item.amount
              });
            }

            // Assign into data_list
            data_list.push(order_data);
          }
          resolve(this.pos.UploadOrderViaAPI(data_list));
        } else {
          resolve(res);
        }
      });
    });
    return result;
  }

  // Upload order to server (a order per time)
  uploadOrder(data){
    let result = new Promise((resolve, reject) => {
      resolve(this.pos.UploadOrderViaAPI(data));
    });
    return result;
  }

  // Generate Receipt No
  getReceiptNo(use_running_no_as_receipt_no, branch_id, counter_id, start_time, transaction_date){
    let result = new Promise(async (resolve, reject) => {
      // var start_time = "2021-01-19 12:00:00";
      // var transaction_date = "2021-01-19";
      
      // Get Receipt No
      if(use_running_no_as_receipt_no > 0){
        console.log("isUseRunningNoAsReceiptNo");
        var result_return = await this.pos.GetLatestReceiptNo(branch_id, counter_id, transaction_date);
        var last_receipt_no = result_return.result == 1 && result_return.data ? parseInt(result_return.data.receipt_no) : use_running_no_as_receipt_no;
        var receipt_no = last_receipt_no + 1;
      } else {
        console.log("isNotUseRunningNoAsReceiptNo");
        var unix_start_time = moment(start_time).utc(true).unix();
        var unix_transaction_date = moment(transaction_date).utc(true).unix();
        var receipt_no = unix_start_time - unix_transaction_date;
      }

      // Receipt Validation with existing receipt no list
      var valid = 1;
      while(valid){
        var result_return = await this.pos.ValidationReceiptNo(branch_id, counter_id, receipt_no, transaction_date);
        if(result_return.result == 1 && !result_return.data.receipt_no_existed){
          valid = 0;
          resolve({receipt_no: receipt_no.toString()});
          break;
        } else {
          receipt_no++;
        }
      }
    });
    return result;
  }

  /** Generate Pos Receipt No **/
  generateReceiptRefNo(branch_id, counter_id, transaction_date, receipt_no){
    let result = new Promise(async (resolve, reject) => {
      var DOCNO_STARTTIME = moment('2000-01-01 00:00:00').utc(true).unix();
      var day = 60*60*24;

      branch_id         = this.sprintf(branch_id.toString(), 4); 
      counter_id        = this.sprintf(counter_id.toString(), 4);
      receipt_no        = this.sprintf(receipt_no.toString(), 6);
      var diff_datetime = this.sprintf(Math.floor((moment(transaction_date).utc(true).unix() - DOCNO_STARTTIME) / day).toString(), 4);
      var ref_no        = branch_id + counter_id + diff_datetime + receipt_no;

      resolve({ref_no});
    });
    return result;
  }

  getPOSSettings(branch_id){
    let result = new Promise((resolve, reject) => {
      resolve(this.pos.GetPOSSettingsViaAPI(branch_id));
    });
    return result;
  }

  sprintf(val, size){
    while (val.length < (size)) {val = "0" + val;}
    return val;
  }

  networkConnectValidation(){
    let result = new Promise((resolve, reject) => {
      NetInfo.fetch().then(state => {
        console.log("Connection: ", state.isConnected);
        if(state.isConnected){
          resolve({result: 1, data: state.isConnected})
        } else {
          resolve({result: 0, data: {title: "Network Error", msg: "No Network Connection."}});
        }
      });
    })
    return result;
  }

  thousandSeparator(input) {
    var result = input.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    return result
  }
}
