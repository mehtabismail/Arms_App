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
  TouchableOpacity,
  View,
} from 'react-native';

/** PROJECT FILES **/
import { 
  Colors, Fonts, Images, Metrics, ApplicationStyles,
  LoadingIndicator, Label,  AppsButton
} from '../../../Services/LibLinking';
import styles from '../Styles/e_com_purchase_history_styles';
import EComPurchaseHistoryControllers from '../Actions/EComPurchaseHistoryControllers';
import MemberController from '../../Member/Actions/member_controller';

/** NPM LIBRARIES **/
import { NavigationActions, DrawerActions, SafeAreaView } from 'react-navigation';

/**
 * TODO: 
 * √ Create order data UI view
 * - Fix scroll view change show empty screen when tabs switch
 * √ Link to checkout screen
 */

const SCREEN_WIDTH = Dimensions.get("screen").width;

export default class EComLandingView extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      screenWidth: Dimensions.get('window').width,
      screenHeight: Dimensions.get('window').height,

      // Fetch data from server indicator
      fetch_data: false,
      fetch_data_text: 'Fetching data...',
      firstLoad: true,

      // History Tabs
      history_tab_selected: 0,
      history_tabs: [
        {label: "To Pay", id: "unpaid"},
        {label: "To Ship", id: "ready_to_ship"},
        {label: "To Receive", id: "checkout"},
        {label: "Completed", id: "complete"},
        {label: "Cancelled", id: "cancel"},
      ],

      // Currency Symbol
      currency_symbol: 'RM',

      // flatList
      flatListRentalTrigger: false,
      order_data: [
        // {
        //   order_no: "MA20051589514442",
        //   voucher_code: null,
        //   voucher_amount: null,
        //   shipping_fees: 0.5, 
        //   total_item_amount: 0.5,
        //   buyer_note: "Test payment.",
        //   invoice_no: null,
        //   logistic_company: "Other",
        //   tracking_number: null,
        //   order_status: "unpaid",
        //   order_status_text: "Unpaid",
        //   payment_attribute: "PUBLIC BANK BERHAD",
        //   payment_reference: "MA20051589514442",
        //   payment_amount: 1,
        //   payment_type: "ipay88",
        //   payment_transaction_date: "2020-05-15",
        //   payment_transaction_error_message: "Payment overlimit. Testing here. Yes. I know.",
        //   item_data: [
        //     {
        //       product_sku_id: 7,
        //       quantity: 1,
        //       amount: 0.5,

        //       // From DB
        //       product_name: "Test Only",
        //       images: Images.imageNoAvailable,
        //       active: '',
        //       full_product_data: '',
        //     },
        //     {
        //       product_sku_id: 7,
        //       quantity: 1,
        //       amount: 0.5,

        //       // From DB
        //       product_name: "Test Only",
        //       images: Images.imageNoAvailable,
        //       active: '',
        //       full_product_data: '',
        //     }
        //   ]
        // }
      ],

      // Shipping Details
      shipping_details_status: false,
      nric: '',
      name: '',
      email: '',
      phone: '',
      address: '',
      postcode: '',
      city: '',
      state: '',
      country: 'Malaysia',
      shipping_notes: '',

    }

    // Create controller object
    this.eComPurchaseHistoryControllers = new EComPurchaseHistoryControllers();
    this.memberController = new MemberController();
  }

  /****************************************************************/
  /************************ HEADER ********************************/
  /****************************************************************/

  // Navigation Tab
  static navigationOptions = ({navigation, navigationOptions}) => {
    const params = navigation.state.params || {};
    var navigateToScreen = params.this;

    return {
      title: 'Purchase History',
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
    // this.props.navigation.setParams({this: this.navigateToScreen});
    this.handleGetPurchaseHistory();

    // get member nric
    this.handleGetShippingDetails();
  }

  componentWillUnmount() {
  }

  componentDidUpdate(prevProps){
    // History Update
    var historyUpdate = this.props.navigation.getParam('historyUpdate', false);
    if(historyUpdate && this.props.navigation != prevProps.navigation){
      this.props.navigation.setParams({historyUpdate: false});
      this.handleGetPurchaseHistory();
    }

    // Payment Update
    var paymentUpdate = this.props.navigation.getParam('paymentUpdate', false);
    if(paymentUpdate && this.props.navigation != prevProps.navigation){
      this.props.navigation.setParams({paymentUpdate: false});
      var payment_result = this.props.navigation.getParam("payment_result", {});
      this.handlePaymentResult(payment_result);
    }
  }

  handleFetchDataIndicator(status, text=""){
    this.setState({
      fetch_data: status,
      fetch_data_text: text ? text : 'Fetching data...'
    })
  }

  /****************************************************************/
  /******************** FUNCTIONALITY *****************************/
  /****************************************************************/

  handleGetPurchaseHistory(){
    this.handleFetchDataIndicator(true, "Loading Data...");
    var ph_return = this.eComPurchaseHistoryControllers.getPurchaseHistory();
    ph_return.then((res) => {
      if(res.result == 1){
        this.setState({
          firstLoad: false,
          order_data: res.order_data,
          flatListRentalTrigger: !this.state.flatListRentalTrigger,
          currency_symbol: res.currency_symbol
        }, () => {
          // Get history tab selected index from Checkout Screen
          var history_tab_selected = this.props.navigation.getParam("history_tab_selected", 0);
          this.setState({
            history_tab_selected,
            flatListRentalTrigger: !this.state.flatListRentalTrigger
          });
        })
      } else {
        Alert.alert("Error", res.data.msg);
      }
      this.handleFetchDataIndicator(false);
    })
  }

  handleGetShippingDetails(){
    this.memberController.getMemberShippingAddress()
    .then((res)=>{
      // alert(JSON.stringify(res))
      if(res.result == 1){
        this.setState({
          shipping_details_status: (res.data.name && res.data.email && res.data.phone &&
                                    res.data.address && res.data.postcode && res.data.city && res.data.state),
          nric: res.data.nric,
          name: res.data.name,
          email: res.data.email,
          phone: res.data.phone,
          address: res.data.address,
          postcode: res.data.postcode,
          city: res.data.city,
          state: res.data.state,
        })
      }
    })
  }

  handlePaymentProcess(order_no){
    // Payment Checkout Data
    var checkout_data = {
      member_nric: this.state.nric,
      order_no
    }
    this.props.navigation.navigate("EComPaymentScreen", { 
      action: 'update_order_payment',
      checkout_data 
    });
  }

  handlePaymentResult(payment_result){
    /**
     * 
     * - Cart Checkout Error, remain at current screen and show error message.
     * - Payment Result, show message and navigate to purchase history.
     * 
     * Sample payment gateway return message
     * {
          result: '',
          status: '',
          message: '',
          data: {
            MerchantCode: '',
            PaymentId: '',
            RefNo: '',
            Amount: '',
            Currency: '',
            Remark: '',
            TransId: '',
            AuthCode: '',
            Status: '',
            ErrDesc: '',
            Signature: '',
            HiddenToURL: '',
            ActionType: '',
            TokenId: '',
            PromoCode: '',
            MTVersion: '',
          },
          local_check: ''
        }
     *
     * Sample cart_checkout api return error message
     * {
          result: '',
          error_code: '',
          error_msg: '',
        }
     */
    // alert(JSON.stringify(payment_result))
    if(payment_result.result == 0 && payment_result.error_code){
      // Checkout Cart Error
      Alert.alert("Error", payment_result.error_code);
    } else {
      if(payment_result.result == 1 && payment_result.status == 1){
        // Payment success
        this.setState({
          history_tab_selected: 1
        })
        Alert.alert("Payment Successful");
      } else {
        Alert.alert("Payment Failed", payment_result.message);
      }
      this.handleGetPurchaseHistory();
    }
  }

  /****************************************************************/
  /******************** SCREEN RENDERING **************************/
  /****************************************************************/

  // Loading Indicator
  handleRenderLoadingIndicator(){
    return(
      <LoadingIndicator 
        visible={this.state.fetch_data}
        size={"large"}
        text={`${this.state.fetch_data_text}`}
      />
    )
  }

  // Render My Purchase History Container
  handleRenderPurchaseHistoryContainer(){
    return(
      this.state.fetch_data
      ?
      <View/>
      :
      <View style={{flex: 1}}>
        {/* History tabs */}
        <View style={{
          backgroundColor: Colors.body,
          paddingHorizontal: Metrics.smallPadding,
          marginTop: Metrics.smallMargin,
          borderTopWidth: 1, borderBottomWidth: 1, borderColor: Colors.border_line
        }}>
          <FlatList 
            data={this.state.history_tabs}
            renderItem={this.handleRenderHistoryTabsContainer}
            extraData={this.state.flatListRentalTrigger}
            keyExtractor={(item, index)=>`${index}`}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
          />
        </View>

        <ScrollView 
          contentContainerStyle={{
            paddingBottom: Metrics.mainContainerMargin
          }}
          ref={(ref) => this.scrollView = ref}
        >

          {/* History Tabs Content */}
          {
            this.handleRenderHistoryTabsContent(this.state.order_data
              .reverse()
              .filter(
                (value, index) => value.order_status == this.state.history_tabs[this.state.history_tab_selected].id
              )
              // .sort(
              //   (a, b) => b.order_no - a.order_no
              // )
            )
          }

        </ScrollView>
      </View>
    )
  }

  /******************************/
  /******** Header Tabs *********/
  /******************************/

  handleRenderHistoryTabsContainer = ({item, index}) => {
    return(
      <TouchableOpacity 
        style={{
          paddingVertical: Metrics.basePadding,
          paddingHorizontal: Metrics.basePadding,
        }}
        onPress={()=>{
          // Make screen scroll to top
          if(this.scrollView){
            this.scrollView.scrollTo({x: 0, y: 0, animated: true});
          }

          this.setState({
            history_tab_selected: index,
            flatListRentalTrigger: !this.state.flatListRentalTrigger
          });
        }}
      >
        <Label 
          text={`${item.label}`}
          style={[{
            color: Colors.primary,
          }, this.state.history_tab_selected == index ? {fontWeight: 'bold'} : '']}
        />
      </TouchableOpacity>
    )
  }

  /*******************************/
  /******** Content Data *********/
  /*******************************/

  handleRenderHistoryTabsContent(data){
    return(
      data.length > 0
      ?
      <View>
        <FlatList 
          data={data}
          renderItem={this.handleRenderHistoryTabsContentItem}
          extraData={this.state.flatListRentalTrigger}
          keyExtractor={(item, index)=>`${index}_${item.order_no}`}
          scrollEnabled={false}
        />
      </View>
      :
      <View style={{
        backgroundColor: Colors.body,
        paddingHorizontal: Metrics.smallPadding,
        paddingVertical: Metrics.basePadding,
        marginVertical: Metrics.baseMargin,
        borderTopWidth: 1, borderBottomWidth: 1, borderColor: Colors.border_line
      }}>
        <Label 
          text={`No Order Yet.`}
          style={{
            fontSize: Fonts.size.h6,
            color: Colors.primary,
            textAlign: 'center'
          }}
        />
      </View>
    )
  }

  handleRenderHistoryTabsContentItem = ({item, index}) => {
    return(
      <View style={{
        backgroundColor: Colors.body,
        // paddingHorizontal: Metrics.smallPadding,
        paddingVertical: Metrics.basePadding,
        marginVertical: Metrics.baseMargin,
        borderTopWidth: 1, borderBottomWidth: 1, borderColor: Colors.border_line
      }}>

        {/*******************************/}
        {/******** ORDER DETAILS ********/}
        {/*******************************/}
        {this.handleRenderOrderDetailsContainer(item, index)}

        {/*******************************/}
        {/********** ITEM DATA **********/}
        {/*******************************/}

        <View style={{
          paddingHorizontal: Metrics.smallPadding,
          // paddingVertical: Metrics.basePadding,
          marginVertical: Metrics.smallMargin,
        }}>
          <FlatList 
            data={item.item_data}
            renderItem={this.handleRenderProductItemContainer}
            extraData={this.state.flatListRentalTrigger}
            keyExtractor={(item, index)=>`${index}`}
            scrollEnabled={false}
          />
        </View>

        {/*******************************/}
        {/********** LOGISTIC ***********/}
        {/*******************************/}
        {this.handleRenderLogisticContainer(item, index)}

        {/*******************************/}
        {/****** INVOICE & PAYMENT ******/}
        {/*******************************/}
        {this.handleRenderPaymentAndInvoiceContainer(item, index)}

        {/*******************************/}
        {/********* PAY BUTTON **********/}
        {/*******************************/}
        {
          this.state.history_tab_selected == 0
          ?
          this.handleRenderPayButtonContainer(item, index)
          :
          <View/>
        }

      </View>
    )
  }

  handleRenderOrderDetailsContainer(item, index){
    return(
      <View style={{
        paddingHorizontal: Metrics.smallPadding,
        // paddingVertical: Metrics.basePadding,
        marginVertical: Metrics.smallMargin,
      }}>
        {/* Order Label */}
        {this.handleRenderTitleAttrContainer(`Order Details`)}

        {/* Order Number */}
        {this.handleRenderSpaceBetweenAttrContainer(`Order No.:`, item.order_no)}

        {/* Order Status */}
        {this.handleRenderSpaceBetweenAttrContainer(`Order Status:`, item.order_status_text)}

        {/* Shipping Fees */}
        {this.handleRenderSpaceBetweenAttrContainer(`Shipping Fees:`, `${this.state.currency_symbol} ${item.shipping_fees}`)}

        {/* Total Items Amount */}
        {this.handleRenderSpaceBetweenAttrContainer(`Total Item Amount:`, `${this.state.currency_symbol} ${item.total_item_amount}`)}

        {/* Buyer Note */}
        {this.handleRenderNormalAttrContainer(`Buyer Note:`, item.buyer_note)}
      </View>
    )
  }

  handleRenderLogisticContainer(item, index){
    return(
      <View style={{
        paddingHorizontal: Metrics.smallPadding,
        // paddingVertical: Metrics.basePadding,
        marginVertical: Metrics.smallMargin,
      }}>
        {/* Logistic Label */}
        {this.handleRenderTitleAttrContainer(`Logistic`)}

        {/* Logistic Company */}
        {this.handleRenderSpaceBetweenAttrContainer(`Logistic Company:`,item.logistic_company)}

        {/* Tracking Number */}
        {this.handleRenderSpaceBetweenAttrContainer(`Tracking No.:`,item.tracking_number)}
      </View>
    )
  }

  handleRenderPaymentAndInvoiceContainer(item, index){
    return(
      <View style={{
        paddingHorizontal: Metrics.smallPadding,
        // paddingVertical: Metrics.smallPadding,
        marginVertical: Metrics.smallMargin,
      }}>
        {/* Invoice & Payment Label */}
        {this.handleRenderTitleAttrContainer(`Invoice & Payment`)}

        {/* Invoice Number */}
        {this.handleRenderSpaceBetweenAttrContainer(`Invoice No.:`,item.invoice_no)}

        {/* Payment Ref. */}
        {this.handleRenderSpaceBetweenAttrContainer(`Payment Ref.:`,item.payment_reference)}

        {/* Payment Amount */}
        {this.handleRenderSpaceBetweenAttrContainer(`Payment Amount:`,item.payment_amount)}

        {/* Payment Type */}
        {this.handleRenderSpaceBetweenAttrContainer(`Payment Type:`,item.payment_type)}

        {/* Payment Date */}
        {this.handleRenderSpaceBetweenAttrContainer(`Payment Date:`,item.payment_transaction_date)}

        {/* Payment Transaction Error Msg */}
        {this.handleRenderNormalAttrContainer(`Error Message:`, item.payment_transaction_error_message)}
      </View>
    )
  }

  handleRenderPayButtonContainer(item, index){
    return(
      <View style={{
        marginHorizontal: Metrics.baseMargin
      }}>
        <AppsButton 
          text={`PAY`} 
          backgroundColor={Colors.primary}
          fontSize={Fonts.size.h6}
          onPress={()=>{
            this.handlePaymentProcess(item.order_no);
            // var cart_list = [];
            // for (let i = 0; i < item.item_data.length; i++) {
            //   cart_list.push({
            //     product_sku_id: item.item_data[i].product_sku_id,
            //     qty: item.item_data[i].quantity,
            //     amount: item.item_data[i].amount,
            //     product_name: item.item_data[i].product_name,
            //     prod_price: item.item_data[i].amount,
            //     images: item.item_data[i].images,
            //     active: item.item_data[i].active,
            //     full_product_data: item.item_data[i].full_product_data
            //   });
            // }
            // var checkout_data = {
            //   cart_list,
            //   voucher_code: item.voucher_code,
            //   voucher_amount: item.voucher_amount,
            //   shipping_fee: item.shipping_fees,
            //   total_item_amount: item.payment_amount,
            //   total_amount: item.total_item_amount,
            //   shipping_notes: item.buyer_note,
            //   currency_symbol: this.state.currency_symbol,
            // }
            // this.props.navigation.navigate("EComCheckoutScreen", {
            //   checkoutType: "by_order_no",
            //   checkout_data
            // });
          }}
        />
      </View>
    )
  }

  /*************************************/
  /******** Data Label Container *******/
  /*************************************/

  handleRenderTitleAttrContainer(label){
    return(
      <Label
            text={`${label}`}
            style={{
              fontSize: Fonts.size.input,
              color: Colors.primary,
              fontWeight: 'bold',
              marginBottom: Metrics.smallMargin / 2,
            }}
          />
    )
  }

  handleRenderSpaceBetweenAttrContainer(label, data){
    return(
      <View style={{
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: Metrics.smallMargin / 2
      }}>
        <Label
          text={`${label}`}
          style={{
            fontSize: Fonts.size.regular,
            color: Colors.primary
          }}
        />

        <Label
          text={`${data}`}
          style={{
            fontSize: Fonts.size.regular,
            fontWeight: 'bold',
            color: Colors.primary,
            textAlign: 'right'
          }}
        />
      </View>
    )
  }

  handleRenderNormalAttrContainer(label, data){
    return(
      // <Label
      //   text={`${label} ${data}`}
      //   style={{
      //     fontSize: Fonts.size.regular,
      //     color: Colors.primary,
      //     marginVertical: Metrics.smallMargin / 2
      //   }}
      // />

      <View style={{
        flex: 1,
        flexDirection: 'row',
        marginVertical: Metrics.smallMargin / 2
      }}>
        <Label
          text={`${label} `}
          style={{
            fontSize: Fonts.size.regular,
            color: Colors.primary,
          }}
        />

        <Label
          text={`${data}`}
          style={{
            fontSize: Fonts.size.regular,
            fontWeight: 'bold',
            color: Colors.primary,
            flex: 1,
          }}
        />
      </View>
    )
  }

  /**********************************/
  /******** Product Item List *******/
  /**********************************/

  handleRenderProductItemContainer = ({item, index}) =>{
    return(
      <TouchableOpacity 
        activeOpacity={0.9}
        style={{
          backgroundColor: Colors.body,
          borderTopWidth: 1, borderBottomWidth: 1, borderColor: Colors.border_line,
          flex: 1, flexDirection: 'row',
          marginVertical: Metrics.smallMargin,
        }}
        onPress={()=>{
          if(item.active){
            this.props.navigation.navigate("EComProductItemScreen", {
              product_data: item.full_product_data
            });
          } else {
            Alert.alert("", "Product is inactive.");
          }
        }}
      >
        {/* Left - Product Image */}
        {this.handleRenderProductImageContainer(item, index)}

        {/* Right - Product Details */}
        <View style={{
          flex: 1,
          paddingHorizontal: Metrics.smallPadding,
          paddingVertical: Metrics.basePadding,
        }}>
          
          {/* Prod Desc */}
          {this.handleRenderProductProdDescContainer(item, index)}

          {/* Prod Variation */}
          {/* {this.handleRenderProductProdVariationContainer(item, index)} */}

          {/* Prod Price */}
          {this.handleRenderProductProdPriceContainer(item, index)}

          {/* Prod Quantity */}
          {this.handleRenderProductProdQuantityContainer(item, index)}
          
        </View>

      </TouchableOpacity>
    )
  }

  handleRenderProductImageContainer(item, index){
    return(
      <View style={{paddingVertical: Metrics.basePadding, paddingLeft: Metrics.smallPadding}}>
        <Image 
          source={item.images}
          style={{
            width: SCREEN_WIDTH * 0.2,
            height: SCREEN_WIDTH * 0.2,
            resizeMode: 'contain',
          }}
        />
      </View>
    )
  }

  handleRenderProductProdDescContainer(item, index){
    return(
      <Label 
        text={`${item.product_name}`}
        style={{
          fontSize: Fonts.size.regular,
          color: Colors.primary,
        }}
        numberOfLines={1}
        ellipsizeMode={'tail'}
      />
    )
  }

  handleRenderProductProdVariationContainer(item, index){
    return(
      <Label 
        text={`Variation: ${item.variation}`}
        style={{
          fontSize: Fonts.size.medium,
          color: Colors.text_color_1,
        }}
      />
    )
  }

  handleRenderProductProdPriceContainer(item, index){
    return(
      <Label 
        text={`${this.state.currency_symbol} ${item.amount}`}
        style={{
          fontSize: Fonts.size.regular,
          // fontWeight: 'bold',
          color: Colors.primary,
          // marginVertical: Metrics.smallMargin
        }}
      />
    )
  }

  handleRenderProductProdQuantityContainer(item, index){
    return(
      <View style={{
        flexDirection: 'row',
      }}>
        <Label 
          text={`Quantity: ${item.quantity}`}
          style={{
            fontSize: Fonts.size.regular,
            // fontWeight: 'bold',
            color: Colors.primary,
          }}
        />
      </View>
    )
  }

  render() {
    return (
      /**Start Safe Area**/
      <SafeAreaView style={ApplicationStyles.screen.safeAreaContainer} forceInset={{vertical:'never'}} >
        
        {/* Screen on loading, hide default state data */}
        {
          this.state.firstLoad
          ?
            <View/>
          :
            // Purchase History Display
            this.handleRenderPurchaseHistoryContainer()
        }

        {/* Loading Animation */}
        {this.handleRenderLoadingIndicator()}

      </SafeAreaView>
    )
  }
}