/** REACT NATIVE **/
import React from 'react';
import {
  Alert, Animated,
  Dimensions,
  FlatList,
  Image,
  Linking,
  Modal,
  Platform,
  ScrollView,
  Text, TextInput, TouchableOpacity,
  View,
} from 'react-native';

/** PROJECT FILES **/
import {
  Colors, Fonts, Images, Metrics, ApplicationStyles,
  LoadingIndicator, Label, SpringAnimation, HorizontalScrollAnimation, DiscountLabel, SmallBadge, AppsButton, Divider
} from '../../../Services/LibLinking';
import LoginController from '../../General/Login/Actions/login_controller';
import MemberController from '../../Member/Actions/member_controller';
import POSController from '../../General/POS/Actions/POSControllers';

/** NPM LIBRARIES **/
import { NavigationActions, DrawerActions, SafeAreaView } from 'react-navigation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from "moment";
import { RNCamera } from 'react-native-camera';
import 'react-native-get-random-values';
import { v1 as uuidv1 } from 'uuid';
import Swipeout from 'react-native-swipeout';
import QRCode from 'react-native-qrcode-svg';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Sound from 'react-native-sound';

// Load Sound Track
var scannerBeepSound = new Sound('scanner_beep.mp3', Sound.MAIN_BUNDLE, (error) => {
  if (error) {
    console.log('failed to load the sound', error);
    return;
  }
  // loaded successfully
  // console.log('duration in seconds: ' + scannerBeepSound.getDuration() + 'number of channels: ' + scannerBeepSound.getNumberOfChannels());
});

const SCREEN_WIDTH = Dimensions.get("screen").width;
const SCREEN_HEIGHT = Dimensions.get("screen").height;

export default class SAPLandingView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      screenWidth: Dimensions.get('window').width,
      screenHeight: Dimensions.get('window').height,

      // Member
      nric: '',
      card_no: '',
      member_type: '',

      // Fetch data from server indicator
      isFetchData: false,
      textFetchData: 'Fetching data...',
      firstLoad: true,

      // Scan & Pay Module Check
      isSAPAccessible: false,

      // Order Data
      order: {
        id: 0,
        local_id: '',
        transaction_id: '',
        receipt_no: '',
        receipt_ref_no: '',
        branch_id: '',
        member_card_no: '',
        counter_id: '',
        cashier_id: '',
        cashier_name: '',
        status: 'paid',
        sub_total_amount: 0,
        discount_amount: 0,
        rounding: 0,
        total_amount: 0,
        cash_received: 0,
        change: 0,
        payment: [],
        transaction_date: '',
        start_time: '',
        end_time: '',
        created_date: '',
        order_item: [
          // {
          //   local_id: '123',
          //   transaction_id: '123',
          //   branch_id: '47',
          //   sku_item_id: '12345',
          //   product_name: 'Testing 123456',
          //   product_image: '',
          //   default_price: 1.0,
          //   selling_price: 1.0,
          //   quantity: 1,
          //   manual_discount_amount: 0,
          //   created_date: "",
          // }
        ],
        pos_settings: {
          receipt_header: "", //"ARMS SOFTWARE INTERNATIONAL SDN BHD\r\n\r\n58-2 Jalan Bayu Mutiara 1,\r\nTaman Bayu Mutiara,\r\n14000 Bukit Mertajam, \r\nPenang Malaysia.",
          receipt_footer: "", //"Thank You, Welcome again\r\nTerima Kasih\r\n欢迎光临\r\n歡迎光臨",
          ewallet_type: {
            // boost: "0",
            // paydibs_boost: "0",
            // paydibs_grabpay: "0",
            // paydibs_mbb: "0",
            // paydibs_mcash: "0",
            // paydibs_tng: "0"
          },
          use_running_no_as_receipt_no: 0,
          hour_start: 0,
          minute_start: 0
        }
      },

      // Camera
      focusPointX: 0.5,
      focusPointY: 0.5,

      // Branch Selection
      isScanBranch: false,
      scanBranchID: '',
      scanBranchCount: 0,

      // Scan & Search
      isScanProduct: false,
      scanProduct: '',
      scanProductCount: 0,

      // Payment Modal
      isPaymentModalDisplayed: false,
      selectedPaymentOption: 0,
      paymentOptions: [
        { id: "kiosk_counter", name: "Kiosk / Counter" },
        { id: "online_payment", name: "Online Payment" }
      ],

      // Kiosk or Counter Checkout
      isKioskCounterCheckout: false,
      checkoutQR: '12345',

    }

    // Create controller object
    this.loginController = new LoginController();
    this.memberController = new MemberController();
    this.posController = new POSController();

  }

  /****************************************************************/
  /************************ HEADER ********************************/
  /****************************************************************/

  // Navigation Tab
  static navigationOptions = ({ navigation, navigationOptions }) => {
    const params = navigation.state.params || {};
    var navigateToScreen = params.this;

    return {
      title: 'Scan & Pay',
      headerLeft: (
        <TouchableOpacity style={{ paddingLeft: 10 }} onPress={() => navigateToScreen(navigation, { loginUpdate: true })}>
          <Image
            style={{ width: Metrics.icons.medium, height: Metrics.icons.medium, tintColor: Colors.secondary }}
            source={Images.menu} />
        </TouchableOpacity>
      ),
      headerRight: (
        <TouchableOpacity
          style={{ paddingRight: 10 }}
          onPress={() => { navigation.navigate("SAPOrderListScreen") }}
        >
          {/* <Image
              style={{width: Metrics.icons.medium, height: Metrics.icons.medium, tintColor: Colors.secondary}} 
              source={Images.search}/> */}
          <FontAwesome5
            regular
            name={"list-alt"}
            size={Metrics.icons.medium}
            color={Colors.secondary}
          // style={{marginRight: Metrics.baseMargin, alignSelf: 'center'}}
          />
        </TouchableOpacity>
      ),
    }
  }

  // Navigate Function To Open Drawer
  navigateToScreen = (navigation, params = "") => {
    const navigateAction = NavigationActions.navigate({
      routeName: "DrawerStack",
      params: params,
    });

    navigation.dispatch(navigateAction);
    navigation.dispatch(DrawerActions.openDrawer());
  }

  /****************************************************************/
  /*********************** COMPONENT  *****************************/
  /****************************************************************/

  componentDidMount() {
    this.props.navigation.setParams({ this: this.navigateToScreen });

    // Execute Login Update
    const { navigation } = this.props;
    this.focusListener = navigation.addListener('didFocus', () => {
      this.handleLoginUpdate();
    });
  }

  componentWillUnmount() {
    this.focusListener.remove();
  }

  componentDidUpdate(prevProps) {
    // Login Update
    var loginUpdate = this.props.navigation.getParam('loginUpdate', false);
    if (loginUpdate && this.props.navigation != prevProps.navigation) {
      this.props.navigation.setParams({ loginUpdate: false });
      this.handleLoginUpdate();
    }
  }

  handleFetchDataIndicator(status, text = "") {
    this.setState({
      isFetchData: status,
      textFetchData: text ? text : 'Fetching data...'
    })
  }

  thousandSeparator(input) {
    var result = input.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    return result
  }

  /****************************************************************/
  /******************** FUNCTIONALITY *****************************/
  /****************************************************************/

  async handleLoginUpdate() {
    var nric = '', card_no = '', member_type = '';
    var login_user = await this.loginController.fetchCurrentLoginMember();
    if (login_user.result == 1 && login_user.data) {
      nric = login_user.data.nric;
      card_no = login_user.data.card_no;
      member_type = login_user.data.member_type;
    }
    this.props.navigation.setParams({ loginUpdate: false });
    this.handleSetNRIC(nric, card_no, member_type);
  }

  handleSetNRIC(nric, card_no, member_type) {
    this.setState({ nric, card_no, member_type, firstLoad: false }, () => {
      this.handleInitScanAndPay();
    });
  }

  handleInitScanAndPay() {
    this.handleFetchDataIndicator(true, "Module Checking...");
    this.setState({ isSAPAccessible: true }, async () => {
      var order_valid = await this.handleRetrieveOrderAndValidation();
      console.log("Order Valid Result: ", order_valid);
      if (order_valid.result == 1 && order_valid.data.isNewOrder) {
        this.setState({ isScanBranch: true });
      }
    });
    this.handleFetchDataIndicator(false);
  }

  /*********** ORDER ***********/
  /**
   * Check order status
   * - If existing order date not current date, need create new order.
   */
  handleRetrieveOrderAndValidation() {
    let result = new Promise(async (resolve, reject) => {

      try {

        // Get data from Async Storage
        var order = await AsyncStorage.getItem("order");
        console.log("ORDER (ASYNC STORAGE): ", order);

        if (order !== null) {
          order = JSON.parse(order);
          var transaction_date = order.transaction_date;
          var member_card_no = order.member_card_no;
          if (moment().isSame(transaction_date, 'day') && (member_card_no === this.state.card_no)) {
            console.log("Order Existed.")
            this.setState({ order });
            resolve({ result: 1, data: { isNewOrder: false } });
          } else {
            await this.handleCreateNewOrder();
            resolve({ result: 1, data: { isNewOrder: true } });
          }
        } else {
          await this.handleCreateNewOrder();
          resolve({ result: 1, data: { isNewOrder: true } });
        }

      } catch (e) {
        resolve({ result: 0 });
        Alert.alert("Error", e.toString());
      }
    });
    return result;
  }

  handleCreateNewOrder() {
    let result = new Promise(async (resolve, reject) => {
      try {
        // Create new order
        var new_order = {
          local_id: uuidv1(),
          transaction_id: uuidv1(),
          receipt_no: '',
          receipt_ref_no: '',
          branch_id: '',
          member_card_no: this.state.card_no,
          counter_id: 100,
          cashier_id: '',
          cashier_name: '',
          status: 'pending',
          sub_total_amount: 0,
          discount_amount: 0,
          rounding: 0,
          total_amount: 0,
          cash_received: 0,
          change: 0,
          payment: [],
          transaction_date: '',
          start_time: '',
          end_time: '',
          created_date: moment().format('YYYY-MM-DD HH:mm:ss'),
          order_item: []
        };

        // Save into Async Storage
        this.setState({ order: new_order });
        this.handleUpdateOrderToAS(new_order);
        resolve({ result: 1 });
      } catch (e) {
        resolve({ result: 0 });
        Alert.alert("Error", e.toString());
      }
    });
    return result;
  }

  async handleUpdateOrderToAS(order) {
    try {
      await AsyncStorage.setItem("order", JSON.stringify(order));
      console.log("Order: ", order);
    } catch (e) {
      console.log("Add Product to Order List Error: ", e);
    }
  }

  handleGetTransactionDate() {
    var cut_off_time = moment(`${this.state.order.pos_settings.hour_start}:${this.state.order.pos_settings.minute_start}`, "HH:mm:ss").format("YYYY-MM-DD HH:mm:ss");
    // var cut_off_time = moment(`20:00`, "HH:mm:ss").format("YYYY-MM-DD HH:mm:ss");
    console.log("cut_off_time: ", cut_off_time);

    var is_cut_off = moment().isSameOrAfter(cut_off_time);
    if (is_cut_off) {
      var transaction_date = moment().format("YYYY-MM-DD");
    } else {
      var transaction_date = moment().subtract(1, 'days').format("YYYY-MM-DD");
    }
    console.log("transaction date: ", transaction_date);
    return transaction_date;
  }

  handleOnBarCodeRead(e) {
    scannerBeepSound.play();
    var scanProduct = e.data;
    this.setState({
      scanProduct: e.data,
      scanProductCount: this.state.scanProductCount + 1,
      isScanProduct: false,
    }, () => {
      if (this.state.scanProductCount == 1 && !this.state.isPaymentModalDisplayed) {
        this.handleScannedProcess(scanProduct);
      } else {
        // Reset Scan Count
        this.setState({ scanProductCount: 0 });
      }
    });
  }

  handleScannedProcess(scanProduct) {
    // Clear Time Out when scanned
    // clearTimeout(this.autoSaveTimer);

    if (scanProduct && !this.state.isFetchData) {
      this.handleFetchDataIndicator(true, "Retrieving data...");
      var product_result = this.posController.getProductDetails(scanProduct, this.state.order.branch_id);
      product_result.then((res) => {
        console.log("Get Product Details: ", res);
        // res = {
        //   data: {
        //     priceList: [
        //       {
        //         key: 'member', 
        //         price_type: 'Member Price', 
        //         price_amt: 0, 
        //         discount: 0
        //       },
        //       {
        //         key: 'non_member', 
        //         price_type: "Normal Price", 
        //         price_amt: 0.9, 
        //         discount_percent: 0, 
        //         discount_amt: 0,
        //         default_price: 0.9
        //       }
        //     ],
        //     prodCodes: {
        //       artno: "4225442545254",
        //       link_Code: "",
        //       mcode: "4225442545254",
        //       sku_item_code: "285098280000"
        //     },
        //     prodDesc: "100PLUS2",
        //     prodDetails: [
        //       {key: 'category', cat_title: 'Category', data: ''},
        //       {key: 'sub_category', cat_title: 'Sub Category', data: ''},
        //       {key: 'stock_qty', cat_title: 'Stock', data: 0}
        //     ],
        //     prodInternalDesc: "",
        //     prodPicture: "",
        //     prodSKUItemID: "509951"
        //   },
        //   result: 1
        // };

        if (res.result == 1) {
          // Add Product Item into list
          this.handleAddProductToOrderList(res.data, scanProduct);
        } else {
          Alert.alert("Error", res.data.msg);
        }
        // Reset Scan Count
        this.setState({ scanProductCount: 0 });
        this.handleFetchDataIndicator(false);
      });
    } else {
      if (!scanProduct) {
        Alert.alert("Search Product Failed", "Please enter the product code.");
      }
    }
  }

  handleAddProductToOrderList(product, scanned_code) {
    /**
     * Price List Index Logic
     * Index = 0 (member), Don't have member type category discount price list
     * Index = 1 (non_member), Non member
     * ...
     * - Others is set from member_type_cat_discount. 
     * - member_type_cat_discount will be priority.
     */
    var priceList_index = 1;
    if (this.state.nric) {
      if (!this.state.member_type) {
        priceList_index = 0;
      } else {
        var memberTypeIndex = product.priceList.findIndex((item, index) => {
          return item.key === this.state.member_type
        });
        priceList_index = this.state.member_type && memberTypeIndex >= 0 ? memberTypeIndex : 0;
      }

      if (priceList_index == 0) {
        priceList_index = product.priceList[0].price_amt ? 0 : 1
      }
    }
    var product_data = {
      local_id: this.state.order.local_id,
      transaction_id: this.state.order.transaction_id,
      branch_id: this.state.order.branch_id,
      sku_item_id: product.prodSKUItemID,
      product_name: product.prodDesc,
      product_image: product.prodPicture,
      product_codes: product.prodCodes,
      quantity: 1,
      default_price: product.priceList[priceList_index].default_price,
      selling_price: product.priceList[priceList_index].price_amt,
      discount_percent: product.priceList[priceList_index].discount_percent,
      discount_amount: product.priceList[priceList_index].discount_amt,
      tax_amount: "0.00",
      manual_discount_amount: 0,
      created_date: moment().format('YYYY-MM-DD HH:mm:ss'),
      updated_date: moment().format('YYYY-MM-DD HH:mm:ss'),
      scanned_code
    };

    var order = this.state.order;
    if (order.order_item.length > 0) {
      // Check item is existed ?
      var itemIndex = order.order_item.findIndex((item, index) => {
        return (item.sku_item_id == product_data.sku_item_id) && (item.selling_price == product_data.selling_price);
      });
      if (itemIndex >= 0) {
        order.order_item[itemIndex].quantity = parseInt(order.order_item[itemIndex].quantity) + 1;
        order.order_item[itemIndex].updated_date = moment().format('YYYY-MM-DD HH:mm:ss');
      } else {
        order.order_item.push(product_data);
      }
    } else {
      order.order_item = [product_data];
    }

    // Calculate Sub Total Amount & Total Amount
    order = this.updateTotalAmountAndSubTotalAmount(order);
    // var sub_total_amount = order.order_item.reduce((total, currentValue, index, arr) => {
    //   return total + (currentValue.quantity * currentValue.selling_price );
    // }, 0);
    // order.sub_total_amount = sub_total_amount;
    // order.total_amount = sub_total_amount;

    this.setState({ order });
    // Update Async Storage
    this.handleUpdateOrderToAS(order);
  }

  handleDeleteOrderItem(index) {
    var order = this.state.order;
    order.order_item.splice(index, 1);
    console.log("DELETE ORDER: ", order);

    // Calculate Sub Total Amount & Total Amount
    order = this.updateTotalAmountAndSubTotalAmount(order);

    this.setState({ order });
    this.handleUpdateOrderToAS(order);
  }

  handleUpdateOrderItemQuantity(action, index, value) {
    var order = this.state.order;
    switch (action) {
      case 'sub':
        order.order_item[index].quantity -= 1;
        break;

      case 'add':
        order.order_item[index].quantity += 1;
        break;

      case 'edit':
        order.order_item[index].quantity = value;
        break;

      default:
        break;
    }

    // Calculate Sub Total Amount & Total Amount
    order = this.updateTotalAmountAndSubTotalAmount(order);

    this.setState({ order });
    this.handleUpdateOrderToAS(order);

  }

  updateTotalAmountAndSubTotalAmount(order) {
    // Calculate Sub Total Amount & Total Amount
    var sub_total_amount = order.order_item.reduce((total, currentValue, index, arr) => {
      return total + (currentValue.quantity * currentValue.selling_price);
    }, 0);
    order.sub_total_amount = sub_total_amount;
    order.total_amount = sub_total_amount;
    return order;
  }

  /*********** SCAN BRANCH ***********/
  handleOnBranchIDRead(e) {
    scannerBeepSound.play();
    var scanBranchID = e.data;
    this.setState({
      scanBranchID: e.data,
      scanBranchCount: this.state.scanBranchCount + 1
    }, () => {
      if (this.state.scanBranchCount == 1) {
        this.handleScannedBranchProcess(scanBranchID);
      } else {
        // Reset Scan Count
        this.setState({ scanBranchCount: 0 });
      }
    });
  }

  // TODO: Validation branch id with server backend
  handleScannedBranchProcess(branch_id) {
    var order = this.state.order;
    order.branch_id = branch_id;

    this.handleUpdateOrderToAS(order);
    this.setState({
      order,
      isScanBranch: false,
      scanBranchID: '',
      scanBranchCount: 0
    }, () => {
      this.handleGetPOSSettings(branch_id);
      // this.handleRunStartOrder();
    });
  }

  handleGetPOSSettings(branch_id) {
    this.handleFetchDataIndicator(true, "Getting data...");
    var POSSettingResponse = this.posController.getPOSSettings(branch_id);
    POSSettingResponse.then((res) => {
      if (res.result == 1) {
        if (Object.keys(res.data.pos_settings).length > 0) {
          this.handleSetStatePOSSettings(res.data.pos_settings);
        } else {
          this.handleSetStatePOSSettings({
            receipt_header: "",
            receipt_footer: "",
            ewallet_type: {
              // boost: "1",
              // paydibs_boost: "1",
              // paydibs_grabpay: "1",
              // paydibs_mbb: "0",
              // paydibs_mcash: "0",
              // paydibs_tng: "1"
            },
            use_running_no_as_receipt_no: 0,
            hour_start: 0,
            minute_start: 0
          });
        }
      } else {
        this.handleSetStatePOSSettings({
          receipt_header: "",
          receipt_footer: "",
          ewallet_type: {
            // boost: "1",
            // paydibs_boost: "1",
            // paydibs_grabpay: "1",
            // paydibs_mbb: "0",
            // paydibs_mcash: "0",
            // paydibs_tng: "1"
          },
          use_running_no_as_receipt_no: 0,
          hour_start: 0,
          minute_start: 0
        });
      }
      this.handleFetchDataIndicator(false);
    });
  }

  handleSetStatePOSSettings(pos_settings) {
    var order = this.state.order;
    order.pos_settings = pos_settings;

    this.handleUpdateOrderToAS(order);
    this.setState({ order }, () => {
      this.handleRunStartOrder();
    });
  }

  async handleRunStartOrder() {
    var order = this.state.order;
    if (!order.receipt_no) {
      var start_time = moment().format('YYYY-MM-DD HH:mm:ss');
      var transaction_date = this.handleGetTransactionDate();
      var receipt_res = await this.posController.getReceiptNo(
        this.state.order.pos_settings.use_running_no_as_receipt_no,
        order.branch_id,
        order.counter_id,
        start_time,
        transaction_date
      );
      console.log("Receipt Res: ", JSON.stringify(receipt_res));

      var receipt_ref_no_res = await this.posController.generateReceiptRefNo(
        order.branch_id,
        order.counter_id,
        transaction_date,
        receipt_res.receipt_no
      );
      console.log("Receipt Ref No Res: ", JSON.stringify(receipt_ref_no_res));

      order.start_time = start_time;
      order.transaction_date = transaction_date;
      order.receipt_no = receipt_res.receipt_no;
      order.receipt_ref_no = receipt_ref_no_res.ref_no;

      this.handleUpdateOrderToAS(order);
      this.setState({ order });
    }
  }

  /*********** PROCESS PAYMENT / CHECKOUT ***********/
  handleMalaysiaRounding(amountToPay) {
    // 0.1, 0.2 -> 0.0
    // 0.3, 0.4 -> 0.5
    // 0.6, 0.7 -> 0.5
    // 0.8, 0.9 -> 1.0

    // separate amount
    var amountToPay = parseFloat(amountToPay).toFixed(2);
    var amtSplit = amountToPay.toString().split(".");
    var amtInt = amtSplit[0];
    var amtDec = amtSplit[1];
    console.log("Amt Int: ", amtInt);
    console.log("Amt Dec: ", amtDec);

    if (amtDec) {
      var dec1 = amtDec.substring(0, 1);
      var dec2 = amtDec.substring(1, 2);
      console.log("Convert to parseFloat: ", parseFloat(amountToPay));
      switch (dec2) {
        case "0":
        case "5":
          var rounding = "0.00";
          break;
        case "1":
        case "6":
          amountToPay = parseFloat(amountToPay) - 0.01;
          var rounding = "-0.01";
          break;
        case "2":
        case "7":
          amountToPay = parseFloat(amountToPay) - 0.02;
          var rounding = "-0.02";
          break;
        case "3":
        case "8":
          amountToPay = (parseFloat(amountToPay) + 0.02).toFixed(2);
          var rounding = "+0.02";
          break;
        case "4":
        case "9":
          amountToPay = (parseFloat(amountToPay) + 0.01).toFixed(2);
          var rounding = "+0.01";
          break;
      }
      console.log("rounding: ", rounding);
      console.log("after rounding: ", amountToPay);

      // Calculate QuickPay
      var amt_roundDec = Math.ceil(amountToPay);
      var amt_round10 = Math.ceil((amt_roundDec + 1) / 10) * 10;
      var amt_round20 = Math.ceil((amt_round10 + 1) / 10) * 10;
      console.log("Round Decimal: ", amt_roundDec);
      console.log("Around to 10: ", amt_round10);
      console.log("Around to 20: ", amt_round20);

      // Update Total Amount & Rounding
      var order = this.state.order;
      order.rounding = rounding;
      order.total_amount = amountToPay;
      this.setState({
        order,
        quickPay_amtRoundDec: amt_roundDec.toFixed(2),
        quickPay_amtRound10: amt_round10.toFixed(2),
        quickPay_amtRound20: amt_round20.toFixed(2)
      }, () => {
        // Re-Calculate Discount Amount, if discount amount already existed.
        var discountPaymentTypeIndex = this.searchPaymentTypeIndex("discount");
        if (discountPaymentTypeIndex >= 0) {
          var order = this.handleDiscountCalculation(
            this.state.order.payment[discountPaymentTypeIndex].discount_type,
            this.state.order.payment[discountPaymentTypeIndex].discount_value
          );
          this.handleUpdateOrderToAS(order);
          this.setState({ order });
        }
      });
      this.handleUpdateOrderToAS(order);
    }

  }

  searchPaymentTypeIndex(payment_type) {
    var order_payment_list = this.state.order.payment;
    for (let i = 0; i < order_payment_list.length; i++) {
      if (order_payment_list[i].payment_type === payment_type) {
        return i;
      }
    }
    return -1;
  }

  handlePaymentMethodProcess(payment_id) {
    // this.setState({isPaymentModalDisplayed: false});
    // this.props.navigation.navigate("VSReceiptScreen");
    switch (payment_id) {
      case "kiosk_counter":
        // #SC,276848485866,285098830001,2*285098830002,10*285098830012,#E#reac-na
        var checkoutQR = [
          "#SC",
          this.state.card_no ? this.state.card_no : ''
        ];
        this.state.order.order_item.map((item, index) => {
          var item_data = item.quantity > 1 ? `${item.quantity}*${item.scanned_code}` : item.scanned_code;
          checkoutQR.push(item_data);
        });
        checkoutQR.push("#E#");

        this.setState({ checkoutQR: checkoutQR.toString() }, () => {
          this.setState({ isKioskCounterCheckout: true });
        });
        break;

      case "online_payment":
        var order = this.state.order;
        var amount = parseFloat(order.total_amount);
        order.payment.push({ payment_type: "credit_card", amount });
        this.handleUpdateOrderToAS(order);
        this.setState({ order }, () => {
          this.handlePayment(amount);
        });

        // Link payment to GoBiz App (Credit Card Payment Type)
        // var amountToPay = parseFloat(this.state.order.total_amount) - this.handleGetTotalReceivedPaymentAmount();
        // var typeofSale = "1";
        // var amount = parseFloat(amountToPay).toFixed(2);
        // var sqn = "00";
        // var indexM = "1";
        // var indexT = "1";
        // GoBiz.makePayment(typeofSale, amount, sqn, indexM, indexT);

        // typeofSale, (int) Sale = 1, Card Searching = 9, Void = 3, Settlement = 10, Txn List = 11, Ewallet = 66
        // Value_1, Amount with 2 decimal place(String)
        // sqn, Sequence Number(String)
        // indexM, Merchant Index=1(int)
        // indexT, Terminal Index=1(int)
        break;

      default:
        Alert.alert("Error", "Error Payment Method.");
        break;
    }
  }

  handlePayment(received_amount) {
    // if payment amount less than total amount, allow user to add payment.
    if (received_amount >= 0 || received_amount == "0") {
      received_amount = parseFloat(received_amount);
      var total_amount = parseFloat(this.state.order.total_amount);

      if (received_amount >= total_amount) {
        // Calculate Change
        var change = parseFloat("0").toFixed(2);
        var cashPaymentTypeIndex = this.searchPaymentTypeIndex("cash");
        if (cashPaymentTypeIndex >= 0) {
          var cash_amount = this.state.order.payment[cashPaymentTypeIndex].amount;
          var non_cash_amount = this.handleGetTotalReceivedPaymentAmount() - cash_amount;
          change = (cash_amount - (total_amount - non_cash_amount)).toFixed(2);
        }

        // Convert to 2 decimal
        received_amount = received_amount.toFixed(2);
        total_amount = total_amount.toFixed(2);

        // Update Order
        var order = this.state.order;
        order.status = "paid";
        order.cash_received = received_amount;
        order.change = change;
        order.end_time = moment().format("YYYY-MM-DD HH:mm:ss");

        // Save order to DB
        var saveOrder_result = this.posController.saveOrder(order);
        saveOrder_result.then(async (res) => {
          if (res.result == 1) {
            var local_id = order.local_id;
            // Remove order from Async Storage & state data.
            try {
              await AsyncStorage.removeItem("order");
              this.setState({
                isPaymentModalDisplayed: false,
                isKioskCounterCheckout: false,
                scanProduct: ''
              }, () => {
                this.handleFetchDataIndicator(true, "Process Payment...");
                this.handleCreateNewOrder().then((res) => {
                  this.handleFetchDataIndicator(false);
                  this.props.navigation.navigate("SAPReceiptScreen", { local_id });
                });
              });
            } catch (e) {
              Alert.alert("Error", e.toString());
            }
          } else {
            Alert.alert("Error", res.data.msg);
          }
        });

        console.log("cash received: ", received_amount);
        console.log("total amt: ", total_amount);
        console.log("change: ", change);

      } else {
        // Alert.alert("Error", "Received cash not enough to pay total amount.");
        this.setState({
          isCashReceivedDialogDisplayed: false,
          isDiscountDialogDisplayed: false
        });
      }
    } else {
      Alert.alert("Error", "No amount detected.");
    }

  }

  handleGetTotalReceivedPaymentAmount() {
    return this.state.order.payment.reduce((total, currentValue, index, arr) => {
      return total + parseFloat(currentValue.amount);
    }, 0);
  }

  /****************************************************************/
  /******************** SCREEN RENDERING **************************/
  /****************************************************************/

  // Loading Indicator
  handleRenderLoadingIndicator() {
    return (
      <LoadingIndicator
        visible={this.state.isFetchData}
        size={"large"}
        text={`${this.state.textFetchData}`}
      />
    )
  }

  // Access Login Screen
  handleRenderAccessLoginScreen() {
    return (
      <View style={[ApplicationStyles.screen.testContainer, { alignSelf: 'center' }]}>
        <View style={{ width: '100%', justifyContent: 'center', padding: Metrics.basePadding }}>
          <Label style={{ marginBottom: Metrics.baseMargin * 6 }}>Come and join us to get many more great deals.</Label>
          <AppsButton
            onPress={() => { this.props.navigation.navigate("LandingScreen", { prev_screen: this.props.navigation.state.routeName }) }}
            backgroundColor={Colors.primary}
            text={"LOGIN / REGISTER"}
            fontSize={20}
          />
        </View>
      </View>
    )
  }

  // Render Online Store Not Access
  handleRenderOnlineStoreNotAccessContainer() {
    return (
      <View style={{
        borderColor: Colors.border_line, borderTopWidth: 1, borderBottomWidth: 1,
        paddingVertical: Metrics.basePadding,
        marginTop: Metrics.smallMargin,
        backgroundColor: Colors.body
      }}>
        <Label
          text={`Scan And Pay Not Available.`}
          style={{
            fontSize: Fonts.size.h5,
            color: Colors.primary,
            textAlign: 'center'
          }}
        />
      </View>
    )
  }

  // Render Landing Screen
  handleRenderLandingScreen() {
    return (
      this.state.isFetchData
        ?
        <View />
        :
        (this.state.isSAPAccessible)
          ?
          // Landing Screen
          <View style={{ flex: 1 }}>
            {
              !this.state.isScanBranch && !this.state.isScanProduct
                ?
                <View style={{ flex: 1 }}>

                  {/* Total Items & Total Amount */}
                  {this.handleRenderOrderHeaderContainer()}

                  {/* Order List */}
                  {this.handleRenderOrderListContainer()}

                  {/* Action Button */}
                  {this.handleRenderBottomButtonContainer()}
                </View>
                :
                this.state.isScanBranch
                  ?
                  this.handleRenderScanBranchContainer()
                  :
                  this.handleRenderScanProductContainer()
            }
          </View>
          :
          // Online Store Not Access
          this.handleRenderOnlineStoreNotAccessContainer()
    )
  }

  /******************** Scan Branch ********************/
  handleRenderScanBranchContainer() {
    return (
      <RNCamera
        ref={(ref) => {
          this.scanBranchCamera = ref;
        }}
        captureAudio={false}
        autoFocus={true}
        autoFocusPointOfInterest={{ x: this.state.focusPointX, y: this.state.focusPointY }}
        type={RNCamera.Constants.Type.back}
        onBarCodeRead={(e) => { this.handleOnBranchIDRead(e) }}
        style={{
          width: '100%', height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          // marginVertical: Metrics.smallMargin,
          overflow: 'hidden' // To fixed camera height extended automatically
        }}
      >

        {/* Scan Box */}
        <View style={{
          borderColor: "#fff", borderWidth: 2,
          paddingTop: 180, paddingBottom: 180,
          marginBottom: 30,
          width: '80%'
        }}>
          <Divider lineColor={'red'} />
        </View>

        {/* Message for User */}
        <View style={{ margin: Metrics.baseMargin, padding: Metrics.basePadding, backgroundColor: Colors.primary }}>
          <Label
            text={`Please scan QRCode to start shopping. The QRCode usually will placed nearby the entrance.`}
            style={{ fontSize: Fonts.size.h5, color: Colors.body, textAlign: 'center' }}
          />
        </View>

        {/* Temporary Button for iOS Simulator */}
        {/* <View>
          <TouchableOpacity style={{ backgroundColor: Colors.primary }} onPress={() => { this.handleScannedBranchProcess(1) }}>
            <Label text={`Enter Branch ID`} />
          </TouchableOpacity>
        </View> */}

      </RNCamera>
    )
  }

  handleRenderScanProductContainer() {
    return (
      <RNCamera
        ref={(ref) => {
          this.scanProductCamera = ref;
        }}
        captureAudio={false}
        autoFocus={true}
        autoFocusPointOfInterest={{ x: this.state.focusPointX, y: this.state.focusPointY }}
        type={RNCamera.Constants.Type.back}
        onBarCodeRead={(e) => { this.handleOnBarCodeRead(e) }}
        style={{
          width: '100%', height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          // marginVertical: Metrics.smallMargin,
          overflow: 'hidden' // To fixed camera height extended automatically
        }}
      >

        {/* Scan Box */}
        <View style={{
          borderColor: "#fff", borderWidth: 2,
          paddingTop: 180, paddingBottom: 180,
          marginBottom: 30,
          width: '80%'
        }}>
          <Divider lineColor={'red'} />
        </View>

        {/* Temporary Button for iOS Simulator */}
        {/* <View>
          <TouchableOpacity style={{ backgroundColor: Colors.primary }} onPress={() => { this.handleScannedProcess("280948820001"); this.setState({ isScanProduct: false }) }}>
            <Label text={`Enter Product Code`} />
          </TouchableOpacity>
        </View> */}

      </RNCamera>
    )
  }

  /******************** Order List ********************/
  handleRenderOrderHeaderContainer() {
    var itemCount = this.state.order.order_item.reduce((total, currentValue, index, arr) => {
      return total + currentValue.quantity;
    }, 0);
    return (
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: Metrics.smallMargin
      }}>

        {/* Total Items */}
        <View style={{
          alignItems: 'flex-start',
          width: '47.5%',
          borderColor: Colors.border_line, borderTopWidth: 1, borderBottomWidth: 1,
          paddingVertical: Metrics.basePadding - 5,
          paddingHorizontal: Metrics.basePadding,
          backgroundColor: Colors.body
        }}>
          <Label text={`Total`} style={{ fontSize: Fonts.size.regular, color: Colors.primary }} />
          <Label
            text={`${itemCount} ${itemCount < 2 ? "Item" : "Items"}`}
            style={{ fontSize: Fonts.size.h4, color: Colors.primary, fontWeight: 'bold' }} />
        </View>

        {/* Total Payment */}
        <View style={{
          alignItems: 'flex-end',
          width: '47.5%',
          borderColor: Colors.border_line, borderTopWidth: 1, borderBottomWidth: 1,
          paddingVertical: Metrics.basePadding - 5,
          paddingHorizontal: Metrics.basePadding,
          backgroundColor: Colors.body
        }}>
          <Label text={`Total RM`} style={{ fontSize: Fonts.size.regular, color: Colors.primary }} />
          <Label text={`${this.thousandSeparator(parseFloat(this.state.order.sub_total_amount).toFixed(2))}`} style={{ fontSize: Fonts.size.h4, color: Colors.primary, fontWeight: 'bold' }} />
        </View>

      </View>
    )
  }

  handleRenderOrderListContainer() {
    return (
      <ScrollView style={{ backgroundColor: Colors.background }}>

        {/* Order List Title */}
        {/* <View style={{
          // backgroundColor: "#fff",
          backgroundColor: Colors.primary,
          flexDirection: 'row',
          paddingHorizontal: Metrics.smallPadding,
          paddingVertical: Metrics.basePadding - 5,
          borderTopWidth: 1, 
          borderColor: Colors.border
        }}>
          <Label text={`Order List`} style={{fontSize: Fonts.size.h6, fontWeight: 'bold', color: "#fff"}} />
        </View> */}

        {/* Order List Data */}
        {
          this.state.order.order_item.length > 0
            ?
            <View style={{ borderBottomWidth: 1, borderColor: '#D7D7D7' }}>
              {
                this.state.order.order_item.sort((a, b) => { return moment(b.updated_date).isAfter(a.updated_date) }).map((item, index) => {
                  return (
                    <Swipeout
                      key={`${index}`}
                      autoClose={true}
                      right={[{
                        text: 'Delete',
                        backgroundColor: 'red',
                        underlayColor: '#000',
                        onPress: () => { this.handleDeleteOrderItem(index); }
                      }]}
                    // style={{marginVertical: Metrics.smallMargin / 2}}
                    >
                      {this.handleRenderOrderItemContainer(item, index)}

                    </Swipeout>
                  )
                })
              }

              {/* List of Bottom Notice */}
              <Label
                text={`Bottom of list.`}
                style={{
                  fontSize: Fonts.size.regular,
                  fontWeight: 'bold',
                  color: Colors.primary,
                  flex: 1,
                  textAlign: 'center',
                  marginVertical: Metrics.doubleBaseMargin
                }}
              />
            </View>
            :
            <View />
        }

      </ScrollView>
    )
  }

  handleRenderOrderItemContainer1(item, index) {
    return (
      <View
        key={`${index}`}
        style={{
          backgroundColor: Colors.body,
          height: 120, //150, //200,
          flexDirection: 'row',
          paddingHorizontal: Metrics.smallPadding,
          paddingVertical: Metrics.basePadding + 5,
          borderTopWidth: 1,
          borderColor: Colors.border
          // ...ApplicationStyles.screen.test
        }}
      >

        {/* Image Container */}
        <View style={{ width: '30%', marginRight: Metrics.doubleBaseMargin, borderWidth: 1, borderColor: Colors.border }}>
          <Image
            source={item.product_image ? item.product_image : Images.company_logo}
            style={{
              width: '100%',
              height: '100%',
              resizeMode: "contain",
              backgroundColor: '#fff'
            }}
          />
        </View>

        {/* Product Details */}
        <View style={{ flex: 1, justifyContent: 'space-between', marginRight: Metrics.smallMargin }}>
          {/* Product Title */}
          <Label
            text={`${item.product_name}`}
            ellipsizeMode={"tail"}
            numberOfLines={2}
            style={{ color: "#fff", fontSize: Fonts.size.input, fontWeight: 'bold' }}
          />

          {/* Product Price & Product Quantity */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Label
              text={`x${item.quantity}`}
              style={{ color: "#fff", fontSize: Fonts.size.h6 }}
            />
            <Label
              text={`RM ${this.thousandSeparator(parseFloat(item.selling_price).toFixed(2))}`}
              style={{ color: "#fff", fontSize: Fonts.size.h6, textAlign: 'right' }}
            />
          </View>
        </View>

      </View>
    );
  }

  handleRenderOrderItemContainer(item, index) {
    const itemPrice = parseFloat(item.default_price) * item.quantity
    const discountAmount = parseFloat(item.discount_amount) * item.quantity
    const sellingPrice = parseFloat(item.selling_price) * item.quantity

    return (
      <View
        key={`${index}`}
        style={{
          backgroundColor: Colors.body,
          paddingHorizontal: Metrics.basePadding,
          paddingVertical: Metrics.doubleBasePadding,
          borderTopWidth: index == 0 ? 0 : 0.5,
          borderColor: Colors.border
        }}
      >

        {/* Item Header (Product Name & Image & Quantity) */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          height: 110,
          marginBottom: Metrics.baseMargin,
        }}>
          {/* Product Name & Product Quantity */}
          <View style={{ flex: 1, justifyContent: 'space-between', marginRight: Metrics.smallMargin }}>
            <View style={{ flex: 1, padding: Metrics.smallPadding, marginBottom: Metrics.smallMargin, backgroundColor: '#fafafa' }}>
              <Label
                text={`${item.product_name}`}
                ellipsizeMode={"tail"}
                numberOfLines={2}
                style={{ color: Colors.primary, fontSize: Fonts.size.h5 }}
              />
            </View>

            <View>
              {this.handleRenderCartItemProdQuantityContainer(item, index)}
            </View>
          </View>

          {/* Image Container */}
          <View style={{ width: '30%', borderWidth: 1, borderColor: Colors.borderLight }}>
            <Image
              source={item.product_image ? item.product_image : Images.company_logo}
              style={{
                width: '100%',
                height: '100%',
                resizeMode: "contain",
                backgroundColor: '#fff'
              }}
            />
          </View>
        </View>

        {/* Item Price Container */}
        <View style={{ flex: 1 }}>
          {/* Price Label */}
          <View style={{ flexDirection: 'row', flex: 1 }}>
            <Label text={`Item Price`} style={{ flex: 1, textAlign: 'center', fontSize: Fonts.size.input, color: Colors.body, backgroundColor: Colors.primary }} />
            <Label text={`Discount`} style={{ flex: 1, textAlign: 'center', fontSize: Fonts.size.input, color: Colors.body, backgroundColor: Colors.primary }} />
            <Label text={`Total Price`} style={{ flex: 1, textAlign: 'center', fontSize: Fonts.size.input, color: Colors.body, backgroundColor: Colors.primary }} />
          </View>
          {/* Price */}
          <View style={{ flexDirection: 'row', flex: 1, paddingVertical: Metrics.basePadding - 5, borderWidth: 1, borderColor: Colors.primary, backgroundColor: Colors.background }}>
            <Label text={`${this.thousandSeparator(itemPrice.toFixed(2))}`} style={{ flex: 1, textAlign: 'center', fontSize: Fonts.size.h6, color: Colors.primary }} />
            <Label text={`${this.thousandSeparator(discountAmount.toFixed(2))}`} style={{ flex: 1, textAlign: 'center', fontSize: Fonts.size.h6, color: Colors.primary }} />
            <Label text={`${this.thousandSeparator(sellingPrice.toFixed(2))}`} style={{ flex: 1, textAlign: 'center', fontSize: Fonts.size.h6, color: Colors.primary }} />
          </View>
        </View>


        {/* Product Details */}
        {/* <View style={{flex: 1, justifyContent: 'space-between', marginRight: Metrics.smallMargin}}> */}
        {/* Product Title */}
        {/* <Label 
            text={`${item.product_name}`}
            ellipsizeMode={"tail"}
            numberOfLines={2}
            style={{color: "#fff", fontSize: Fonts.size.input, fontWeight: 'bold'}}
          /> */}

        {/* Product Price & Product Quantity */}
        {/* <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Label 
              text={`x${item.quantity}`}
              style={{color: "#fff", fontSize: Fonts.size.h6}}
            />
            <Label 
              text={`RM ${this.thousandSeparator(parseFloat(item.selling_price).toFixed(2))}`}
              style={{color: "#fff", fontSize: Fonts.size.h6, textAlign: 'right'}}
            />
          </View>
        </View> */}

      </View>
    );
  }

  handleRenderCartItemProdQuantityContainer(item, index) {
    return (
      <View style={{
        flexDirection: 'row',
        marginLeft: Metrics.smallMargin
      }}>
        <TouchableOpacity
          disabled={(item.quantity == 1)}
          style={{
            justifyContent: 'center',
            borderRadius: 50,
            width: 40, height: 40,
            backgroundColor: item.quantity == 1 ? Colors.editable_disabled : Colors.primary
          }}
          onPress={() => {
            this.handleUpdateOrderItemQuantity("sub", index, 1);
          }}
        // disabled={this.state.cart_list[index].qty <= 1 ? true : false}
        >
          <Label
            text={`-`}
            style={{
              fontSize: Fonts.size.h3,
              fontWeight: 'bold',
              color: Colors.body,
              textAlign: 'center'
            }}
          />
        </TouchableOpacity>

        <TextInput
          editable={false}
          onEndEditing={(value) => {
            this.handleUpdateOrderItemQuantity("edit", index, value.nativeEvent.text);
          }}
          defaultValue={`${item.quantity}`}
          keyboardType={'number-pad'}
          style={{
            fontSize: Fonts.size.h4,
            color: Colors.primary,
            textAlign: 'center',
            width: 80,
            paddingHorizontal: Metrics.smallPadding
          }}
        />

        <TouchableOpacity
          style={{
            justifyContent: 'center',
            borderRadius: 50,
            width: 40, height: 40,
            backgroundColor: Colors.primary
          }}
          onPress={() => {
            this.handleUpdateOrderItemQuantity("add", index, 1);
          }}
        >
          <Label
            text={`+`}
            style={{
              fontSize: Fonts.size.h4,
              fontWeight: 'bold',
              color: Colors.body,
              textAlign: 'center'
            }}
          />
        </TouchableOpacity>
      </View>
    )
  }

  handleRenderBottomButtonContainer() {
    return (
      <View style={{
        backgroundColor: Colors.background,
        paddingHorizontal: Metrics.smallPadding,
        // paddingVertical: Metrics.basePadding,
        paddingVertical: Metrics.basePadding - 5,
        borderTopWidth: 1, borderBottomWidth: 1,
        borderColor: Colors.border,
        // Shadow
        ...ApplicationStyles.container.shadow
      }}>

        {/* Pay Button & Scan Button */}
        <View style={{
          flexDirection: 'row',
          marginHorizontal: Metrics.smallMargin,
          // marginVertical: Metrics.baseMargin
          marginVertical: Metrics.baseMargin - 5
        }}>
          <AppsButton
            onPress={() => {
              if (this.state.order.sub_total_amount > 0) {
                this.setState({ isPaymentModalDisplayed: true });
                this.handleMalaysiaRounding(this.state.order.sub_total_amount);
              } else {
                Alert.alert("Error", "Please add product item.");
              }

            }}
            backgroundColor={Colors.primary}
            text={"Pay"}
            fontSize={18}
            disabled={this.state.btnPayDisabled}
            style={{
              flex: 1,
              marginRight: Metrics.smallMargin / 2,
              // Shadow
              ...ApplicationStyles.container.shadow
            }}
          />

          <AppsButton
            onPress={() => {
              this.setState({ isScanProduct: true });
            }}
            // source={Images.scanner}
            backgroundColor={Colors.primary}
            text={"Scan"}
            fontSize={18}
            disabled={this.state.btnPayDisabled}
            style={{
              flex: 1,
              marginLeft: Metrics.smallMargin / 2,
              // Shadow
              ...ApplicationStyles.container.shadow
            }}
          />
        </View>

      </View>
    )
  }

  /******************** Payment ********************/
  handleRenderPaymentModalContainer() {
    return (
      <Modal
        visible={this.state.isPaymentModalDisplayed}
        transparent={true}
        animationType={"fade"}
      >
        <View
          style={{
            width: '100%',
            height: '100%',
            alignItems: 'center',
            justifyContent: 'flex-end',
            backgroundColor: Colors.opacityBlurBackground,
            // paddingHorizontal: Metrics.basePadding,
          }}
        >

          {/* Payment Method Container */}
          <View
            style={{
              backgroundColor: "#f6f6f6",
              width: '100%',
              maxHeight: "80%",
              borderColor: Colors.primary,
              borderTopLeftRadius: 40, borderTopRightRadius: 40,
              borderWidth: 3, borderBottomWidth: 0, borderColor: Colors.primary,
              paddingTop: 15,

              // Shadow
              ...ApplicationStyles.container.shadow
            }}
            onPress={() => { }}
          >
            <ScrollView>

              {/* Payment Method Container */}
              <View style={{
                marginTop: Metrics.smallMargin,
                marginBottom: Metrics.smallMargin / 2,
                paddingTop: 35,
              }}>

                {/* Payment Options List */}
                {
                  this.state.paymentOptions.map((item, index) => {
                    return (
                      <View
                        key={`${index}`}
                        style={{
                          marginHorizontal: Metrics.baseMargin, marginVertical: Metrics.smallMargin,

                          // Shadow
                          ...ApplicationStyles.container.shadow
                        }}
                      >
                        <AppsButton
                          onPress={() => { this.handlePaymentMethodProcess(item.id); }}
                          backgroundColor={Colors.primary}
                          text={`${item.name}`}
                          fontSize={18}
                          style={{
                            borderWidth: 1, borderColor: Colors.primary, borderRadius: 10
                          }}
                        />
                      </View>
                    )
                  })
                }

                {/* Cancel Button - Modal */}
                <View style={{
                  marginHorizontal: Metrics.baseMargin, marginVertical: Metrics.baseMargin, marginBottom: 35,

                  // Shadow
                  ...ApplicationStyles.container.shadow
                }}>
                  <AppsButton
                    onPress={() => { this.setState({ isPaymentModalDisplayed: false }) }}
                    backgroundColor={"#fff"}
                    color={Colors.primary}
                    text={"CANCEL"}
                    fontSize={18}
                    // disabled={this.state.btnMCancelDisabled}
                    style={{
                      borderWidth: 1, borderColor: Colors.primary, borderRadius: 10
                    }}
                  />
                </View>

              </View>

            </ScrollView>

            {/* Total Payment Amount Container */}
            <View style={{
              backgroundColor: Colors.primary,
              width: '70%',
              position: 'absolute', top: -100,
              alignSelf: 'center',
              paddingHorizontal: Metrics.basePadding,
              paddingVertical: Metrics.basePadding,
              borderRadius: 10, borderWidth: 1, borderColor: Colors.border,

              // Shadow
              ...ApplicationStyles.container.shadow
            }}>
              <Label text={`Amount to Pay`} style={{ fontSize: Fonts.size.regular, color: '#fff' }} />
              <Label text={`RM ${this.thousandSeparator(parseFloat(this.state.order.total_amount).toFixed(2))}`} style={{ fontSize: Fonts.size.h3, color: '#fff', fontWeight: 'bold', textAlign: 'right' }} />
            </View>

          </View>

        </View>

        {/* Cash Received Modal Container */}
        {
          this.state.isKioskCounterCheckout
            ?
            this.handleRenderKioskCounterCheckoutQR()
            :
            <View />
        }

      </Modal>
    )
  }

  handleRenderKioskCounterCheckoutQR() {
    return (
      // {Modal Background Effect}
      <View
        style={{
          position: "absolute",
          width: '100%',
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: Colors.opacityBlurBackground
        }}
      >

        {/* Kiosk Counter Checkout Container */}
        <View
          style={{
            backgroundColor: "#f6f6f6",
            width: '95%',
            height: "80%",
            borderColor: Colors.primary,
            borderRadius: 40,
            borderWidth: 3, borderColor: Colors.primary,
            justifyContent: 'center',

            // Shadow
            ...ApplicationStyles.container.shadow
          }}
        >
          {/* QR Code with Message Label */}
          <View style={{ alignItems: 'center', marginBottom: Metrics.baseMargin }}>
            <QRCode
              value={this.state.checkoutQR}
              // value={this.state.qr_data}
              size={(SCREEN_HEIGHT - Metrics.headerContainerHeight) * 0.3}
              bgColor='black'
              fgColor='white'
            />

            <Label
              text={`Please scan the QRCode at Self Checkout Kiosk or Counter.`}
              style={{ textAlign: 'center', fontSize: Fonts.size.h6, color: "#000", marginTop: Metrics.baseMargin }}
            />
          </View>

          {/* Close Button */}
          <View style={{ paddingHorizontal: Metrics.basePadding, marginVertical: Metrics.baseMargin }}>
            <AppsButton
              onPress={() => { this.setState({ isKioskCounterCheckout: false }) }}
              backgroundColor={"#fff"}
              color={Colors.primary}
              text={"CLOSE"}
              fontSize={18}
              // disabled={this.state.btnMCancelDisabled}
              style={{ borderWidth: 1, borderColor: Colors.primary, borderRadius: 10 }}
            />
          </View>

        </View>

      </View>
    )
  }

  render() {
    return (
      /**Start Safe Area**/
      <SafeAreaView style={ApplicationStyles.screen.safeAreaContainer} forceInset={{ vertical: 'never' }} >

        {/* Screen on loading, hide default state data */}
        {
          this.state.firstLoad
            ?
            <View />
            :
            // (!this.state.nric)
            // ?
            // // Access Login Screen
            // this.handleRenderAccessLoginScreen()
            // :
            // Landing Screen
            this.handleRenderLandingScreen()
        }

        {/* Payment Modal */}
        {this.handleRenderPaymentModalContainer()}

        {/* Loading Animation */}
        {this.handleRenderLoadingIndicator()}

      </SafeAreaView>
    )
  }
}