/** REACT NATIVE **/
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert, Animated,
  Dimensions,
  FlatList,
  Image,
  Keyboard,
  Linking,
  Modal,
  Platform,
  ScrollView,
  TextInput, TouchableOpacity,
  View,
} from 'react-native';

/** REACT NATIVE ELEMENTS **/
import { Card, Text, Input, Button, Icon } from 'react-native-elements';


/** TAILWIND CSS **/
import { tailwind } from '../../../../tailwind';


/** PROJECT FILES **/
import {
  Colors, Fonts, Images, Metrics, ApplicationStyles,
  LoadingIndicator, Label, AppsButton,
} from '../../../Services/LibLinking';
import styles from '../Styles/e_com_checkout_styles';
import LoginController from '../../General/Login/Actions/login_controller';
import EComProductItemControllers from '../Actions/EComProductItemControllers';
import MemberController from '../../Member/Actions/member_controller';
import ServerController from '../../General/ServerConfig/Actions/server_controller';
import ShippingMethod from './shipping-method';
import { ShippingMethodType } from './shipping-method/constants';

/** NPM LIBRARIES **/
import { NavigationActions, DrawerActions, SafeAreaView } from 'react-navigation';
import Picker from 'react-native-picker';

const SCREEN_WIDTH = Dimensions.get("screen").width;
const SCREEN_HEIGHT = Dimensions.get("screen").height;

/**
 * TODO:
 * √ Add shipping note
 * - Add enter voucher code (pending due to don't have api to validation the voucher)
 * √ Add shipping details to payment, need separate name to first_name and last_name
 * √ Combine payment gateway
 * √ Get payment result and redirect to purchase history screen
 */

export default class EComCheckoutView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      screenWidth: Dimensions.get('window').width,
      screenHeight: Dimensions.get('window').height,

      // Fetch data from server indicator
      fetch_data: false,
      fetch_data_text: 'Fetching data...',
      firstLoad: true,

      // Keyboard show indicator
      screenY: new Animated.Value(0),
      scrollViewBtmMargin: { paddingBottom: 50 },

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

      // Cart Data
      voucher_code: "",
      voucher_amount: 0,
      total_item_amount: 0,
      total_amount: 0, // Include shipping_fee and voucher amount
      currency_symbol: '',

      // Cart Product Data
      cart_list: [
        // {
        //   product_sku_id: 14,
        //   qty: 1,
        //   amount: 26.9,
        //   product_name: '',
        //   prod_price: '',
        //   images: '',
        //   active: '',
        //   full_product_data: ''
        // }
      ],
      flatListRentalTrigger: false,

      // State list
      state_data: [],

      // Shipping Data
      shipping_fee: 0,
      selected_shipment_method: {
        type: null,
        pickup_address: null,
        pickup_address_id: null,
        pickup_date: null,
        pickup_time: null,
        shipping_fee: 0,
        service_id: null,
        courier_name: null
      },

      // Shipping Method Selection List
      shipment_methods_list: {}

    }

    // Create controller object
    this.loginController = new LoginController();
    this.eComProductItemControllers = new EComProductItemControllers();
    this.memberController = new MemberController();
    this.serverController = new ServerController();
  }

  /****************************************************************/
  /************************ HEADER ********************************/
  /****************************************************************/

  // Navigation Tab
  static navigationOptions = ({ navigation, navigationOptions }) => {
    const params = navigation.state.params || {};
    var navigateToScreen = params.this;

    return {
      title: 'Checkout',
      headerLeft: (
        <TouchableOpacity style={{}} onPress={() => {
          navigation.replace('EComCartScreen', { cartUpdate: true })
        }}>
          <Image
            style={{ width: Metrics.icons.regular, height: Metrics.icons.regular, tintColor: Colors.secondary }}
            source={Images.arrowLeft} />
        </TouchableOpacity>
      ),
      headerRight: (
        <View style={{ width: Metrics.icons.medium, height: Metrics.icons.medium, paddingRight: 10 }}></View>
      ),
    }
  }

  /****************************************************************/
  /*********************** COMPONENT  *****************************/
  /****************************************************************/

  componentDidMount() {
    this.handleGetCartList();

    // Get Shipping Details
    this.handleGetShippingDetails();

    // Get Status List
    this.handleGetState();

    // Keyboard Listener
    this.keyboardDidShowListener = Keyboard.addListener('keyboardWillShow', this.keyboardDidShow.bind(this));
    this.keyboardDidHideListener = Keyboard.addListener('keyboardWillHide', this.keyboardDidHide.bind(this));
  }

  componentWillUnmount() {
    this.keyboardDidShowListener.remove();
    this.keyboardDidHideListener.remove();
  }

  componentDidUpdate(prevProps) {
    // Payment Update
    var paymentUpdate = this.props.navigation.getParam('paymentUpdate', false);
    if (paymentUpdate && this.props.navigation != prevProps.navigation) {
      this.props.navigation.setParams({ paymentUpdate: false });
      var payment_result = this.props.navigation.getParam("payment_result", {});
      this.handlePaymentResult(payment_result);
    }
  }

  handleFetchDataIndicator(status, text = "") {
    this.setState({
      fetch_data: status,
      fetch_data_text: text ? text : 'Fetching data...'
    })
  }

  /****************************************************************/
  /******************** FUNCTIONALITY *****************************/
  /****************************************************************/

  keyboardDidShow(e) {
    // Animated.timing(this.state.screenY,{
    //   toValue : 0 - e.endCoordinates.height,
    //   duration : e.duration
    // }).start();

    this.setState({
      scrollViewBtmMargin: { paddingBottom: e.endCoordinates.height + Metrics.basePadding }
    });

    Picker.hide();
  }

  keyboardDidHide(e) {
    // Animated.timing(this.state.screenY,{
    //   toValue : 0,
    //   duration : e.duration
    // }).start();

    this.setState({
      scrollViewBtmMargin: { paddingBottom: 50 }
    });
  }

  handleGetCartList() {
    this.handleFetchDataIndicator(true, "Calculating Data...");
    var cart_data = this.eComProductItemControllers.getCartList();
    cart_data.then((res) => {
      if (res.result == 1) {
        this.setState({
          firstLoad: false,
          cart_list: res.item_data,
          voucher_code: res.voucher_code,
          voucher_amount: res.voucher_amount,
          shipping_fee: res.shipping_fee,
          total_item_amount: res.total_item_amount,
          total_amount: res.total_amount, // Include shipping_fee and voucher amount
          currency_symbol: res.currency_symbol,
          flatListRentalTrigger: !this.state.flatListRentalTrigger,
          selected_shipment_method: res.shipping_data
        });
      } else {
        Alert.alert("Error", res.data.msg);
      }
      this.handleFetchDataIndicator(false);
    })
  }

  handleGetShippingDetails() {
    this.memberController.getMemberShippingAddress()
      .then((res) => {
        // alert(JSON.stringify(res))
        if (res.result == 1) {
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
          }, () => {
            this.handleGetShipmentMethodList()
          })
        }
      })
  }

  async handleGetShipmentMethodList() {
    const { address, postcode, city, state, country } = this.state
    const userAddress = {
      address1: address,
      postcode,
      city,
      state,
      country
    }
    const { result, data } = await this.eComProductItemControllers.getShippingInfo(userAddress)
    this.setState({
      shipment_methods_list: result == 1 ? data : {}
    })
  }

  handlePaymentProcess() {
    if (this.state.name && this.state.email &&
      this.state.phone && this.state.address &&
      this.state.postcode && this.state.city &&
      this.state.state) {
      // Product SKU List
      var product_sku_list = [];
      var cart_list = this.state.cart_list;
      for (let i = 0; i < cart_list.length; i++) {
        product_sku_list.push({
          product_sku_id: cart_list[i].product_sku_id,
          quantity: cart_list[i].qty
        });
      }
      // Shipping Data
      var shipping_data = {
        firstname: this.state.name.split(' ').slice(0, -1).join(' '),
        lastname: this.state.name.split(' ').slice(-1).join(' '),
        email: this.state.email,
        contact_no: this.state.phone,
        address1: this.state.address,
        postcode: this.state.postcode,
        city: this.state.city,
        state: this.state.state,
        country: this.state.country,
      }

      // Payment Checkout Data
      var checkout_data = {
        member_nric: this.state.nric,
        product_sku_list,
        // voucher_code: this.state.voucher_code,
        payment_method_id: 1,
        shipping_fee: this.state.shipping_fee,
        shipment_method: this.state.selected_shipment_method.type,
        total_checkout_amt: this.state.total_item_amount,
        shipping_notes: this.state.shipping_notes,
        billing_data: shipping_data,
        shipping_data
      }
      this.props.navigation.navigate("EComPaymentScreen", {
        action: 'cart_checkout',
        checkout_data
      })
    } else {
      Alert.alert("Error", "Please complete the shipping details.");
    }
  }

  handlePaymentResult(payment_result) {
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

    if (payment_result.result == 0 && payment_result.error_code) {
      // Checkout Cart Error
      Alert.alert("Error", payment_result.error_code);
    } else {
      var history_tab_selected = 0;
      if (payment_result.result == 1 && payment_result.status == 1) {
        // Payment success
        history_tab_selected = 1;
        Alert.alert("Payment Successful");
      } else {
        Alert.alert("Payment Failed", payment_result.message);
      }
      this.props.navigation.replace("EComPurchaseHistoryScreen", {
        historyUpdate: true,
        history_tab_selected
      });
    }
  }

  handleDeliveryAddressInfoUpdate(id, data) {
    switch (id) {
      case 'name':
        this.setState({
          name: data
        });
        break;

      case 'phone':
        this.setState({
          phone: data
        });
        break;

      case 'email':
        this.setState({
          email: data
        });
        break;

      case 'address':
        this.setState({
          address: data
        });
        break;

      case 'postcode':
        this.setState({
          postcode: data
        });
        break;

      case 'city':
        this.setState({
          city: data
        });
        break;

      case 'state':
        this.setState({
          state: data
        });
        break;

      default:
        break;
    }

  }

  handleGetState() {
    var state_data = this.serverController.FetchServerConfigStateData();
    state_data.then((res) => {
      if (res.result == 1) {
        var config_type = res.config_type;
        this.setState({
          state_data: JSON.parse(config_type)
        })
      }
    })
  }

  handleSelectState() {
    Picker.init({
      pickerTitleText: "Select State",
      pickerData: this.state.state_data,
      selectedValue: [this.state.state],
      onPickerConfirm: data => {
        this.setState({
          state: data[0],
        }, () => {
          this.handleGetShipmentMethodList()
        })
      },
      onPickerCancel: data => {
      },
      onPickerSelect: data => {
      }
    });
    Picker.show();
  }

  handleShippingMethodOnChange = (data) => {
    this.setState({
      selected_shipment_method: data
    }, () => {
      this.handleUpdateShippingFee()
      this.handleUpdateShippingDataToServer()
    })
  }

  handleUpdateShippingFee() {
    const { shipping_fee = 0 } = this.state.selected_shipment_method
    const num_shipping_fee = typeof shipping_fee === 'string' ? parseFloat(shipping_fee) : shipping_fee
    const total_item_amount = (parseFloat(this.state.total_amount) + num_shipping_fee).toFixed(2)
    this.setState({
      shipping_fee: shipping_fee,
      total_item_amount: total_item_amount
    })
  }

  async handleUpdateShippingDataToServer() {
    const {
      type,
      pickup_address_id,
      pickup_date,
      pickup_time,
      shipping_fee,
      service_id,
      courier_name
    } = this.state.selected_shipment_method
    const shipping_data = (() => {
      if (type === ShippingMethodType.PICKUP) {
        return {
          pickup_address_id,
          pickup_date,
          pickup_time
        }
      }
      if (type === ShippingMethodType.DELIVERY) {
        return {
          courier_name,
          shipping_fee,
          shipping_service_id: service_id
        }
      }
      return {}
    })()
    await this.eComProductItemControllers.addShippingData({
      shipping_method: type,
      ...shipping_data
    })
  }

  /****************************************************************/
  /******************** SCREEN RENDERING **************************/
  /****************************************************************/

  // Loading Indicator
  handleRenderLoadingIndicator() {
    return (
      <LoadingIndicator
        visible={this.state.fetch_data}
        size={"large"}
        text={`${this.state.fetch_data_text}`}
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

  // Render Cart Products list
  handleRenderCartProductsContainer() {
    return (
      this.state.fetch_data
        ?
        <View />
        :
        <View style={tailwind('flex-1 flex-col h-full bg-gray-background')}>
          <View style={{ justifyContent: "flex-start", height: "85%", width: "100%" }} >
            <Animated.ScrollView
              contentContainerStyle={[this.state.scrollViewBtmMargin]}
            >

              {/* Cart List */}
              <View>
                <FlatList
                  data={this.state.cart_list}
                  renderItem={this.handleRenderCartListItemContainer}
                  extraData={this.state.flatListRentalTrigger}
                  keyExtractor={(item, index) => `${index}`}
                  scrollEnabled={false}
                />
              </View>
              <View >
                {/* Delivery Address */}
                {this.handleRenderDeliveryAddressContainer()}
              </View>
              {/* Shipping Method */}
              {this.handleRenderShippingMethodContainer()}

              {/* Shipping Note */}
              {this.handleRenderShippingNoteContainer()}

              {/* Payment Option */}
              {this.handleRenderPaymentOptionContainer()}

              {/* Payment Summary */}
              {this.handleRenderPaymentSummaryContainer()}

              {/* {
                this.handleDummyCard()
              } */}


            </Animated.ScrollView>
          </View>
          <View style={{ justifyContent: "center", height: "15%", }}>

            {/* Checkout Button */}
            {this.handleRenderCheckoutButtonContainer()}
          </View>
        </View>
    )
  }

  handleRenderDeliveryAddressContainer() {
    return (
      // this.state.shipping_details_status
      // ?
      <Card containerStyle={tailwind('bg-white rounded-lg opacity-100')}>
        <Card.Title style={tailwind("text-primary text-xl font-bold")}>
          Delivery Address</Card.Title>
        <Card.Divider />
        <View
          style={tailwind('mt-5')}
        // style={{
        //   alignSelf: "center",
        //   backgroundColor: Colors.body,
        //   width: "95%",
        //   paddingHorizontal: Metrics.smallPadding,
        //   paddingVertical: Metrics.basePadding,
        //   marginVertical: Metrics.smallMargin,
        //   // borderTopWidth: 1, borderBottomWidth: 1, 
        //   borderWidth: 1, borderRadius: 5,
        //   borderColor: Colors.border_line
        // }}
        >

          {/* Customer Name */}
          {this.handleRenderDeliveryAddressAttrContainer("Name", this.state.name, "name")}

          {/* Customer Phone Number */}
          {this.handleRenderDeliveryAddressAttrContainer("Phone Number", this.state.phone, "phone")}

          {/* Customer Email */}
          {this.handleRenderDeliveryAddressAttrContainer("Email", this.state.email, "email")}

          {/* Customer Delivery Address */}
          {this.handleRenderDeliveryAddressAttrContainer("Address", this.state.address, "address")}

          {/* Customer Delivery Address Postcode */}
          {this.handleRenderDeliveryAddressAttrContainer("Postcode", this.state.postcode, "postcode")}

          {/* Customer Delivery Address City */}
          {this.handleRenderDeliveryAddressAttrContainer("City", this.state.city, "city")}

          {/* Customer Delivery Address State */}
          <View style={{ marginBottom: Metrics.basePadding - 2 }}>
            <Label
              text={`State`}
              style={tailwind("text-primaryBlue text-lg ")}
            />
            <TouchableOpacity
              onPress={() => { this.handleSelectState() }}
              style={
                tailwind(" h-12 border border-gray-400 rounded-lg justify-center")
                //   [styles.deliveryAddressTextInput,
                // this.state.state ? { borderColor: Colors.border_line } : { borderColor: Colors.text_negative }
                // ]
              }
            >
              <Label
                text={`${this.state.state}`}
                style={tailwind("text-gray-400 text-base ml-5")}
              />
            </TouchableOpacity>
            {
              !this.state.state
                ?
                <Label
                  text={`Please select state.`}
                  style={{
                    color: Colors.text_negative,
                    fontSize: Fonts.size.small,
                  }}
                />
                :
                <View />
            }
          </View>


          {/* Customer Delivery Address Country */}
          <Label
            text={`Country`}
            style={tailwind("text-primaryBlue text-lg ")}
          // style={{
          //   color: Colors.primary,
          //   fontSize: Fonts.size.large,
          // }}
          />
          <Input
            editable={false}
            placeholder={`Country`}
            value={`${this.state.country}`}
            onChangeText={(value) => {
              this.setState({
                country: value
              });
            }}

            inputStyle={tailwind("text-gray-400 text-base")}
            inputContainerStyle={tailwind("border-transparent")}
            containerStyle={tailwind(" h-12 border border-gray-400 rounded-lg")}
          />
          {/* <TextInput
            editable={false}
            placeholder={`Country`}
            value={`${this.state.country}`}
            onChangeText={(value) => {
              this.setState({
                country: value
              });
            }}
            // style={[styles.deliveryAddressTextInput]}
            style={tailwind(" h-10 border border-gray-400 rounded-lg justify-center")}
          /> */}
        </View>
      </Card>
      // :
      // <View style={{
      //   backgroundColor: Colors.body,
      //   paddingHorizontal: Metrics.smallPadding,
      //   paddingVertical: Metrics.basePadding,
      //   marginVertical: Metrics.smallMargin,
      //   borderTopWidth: 1, borderBottomWidth: 1, borderColor: Colors.border_line
      // }}>
      //   <View style={{
      //     flexDirection: 'row'
      //   }}>
      //     <Image
      //       source={Images.info}
      //       style={{
      //         width: Metrics.icons.medium, height: Metrics.icons.medium,
      //         tintColor: Colors.text_negative,
      //         marginRight: Metrics.smallMargin
      //       }}
      //     />
      //     <Label
      //       text={`Please complete shipping details in Profile Information. \n${!this.state.name ? '- Name \n' : ''}${!this.state.email ? '- Email \n' : ''}${!this.state.phone ? '- Phone \n' : ''}${!this.state.address ? '- Address \n' : ''}${!this.state.postcode ? '- Postcode \n' : ''}${!this.state.state ? '- State \n' : ''}`}
      //       style={{
      //         color: Colors.text_negative,
      //         fontSize: Fonts.size.h6,
      //         fontWeight: 'bold'
      //       }}
      //     />
      //   </View>
      //   <AppsButton 
      //     text={`Update now`} 
      //     backgroundColor={Colors.primary}
      //     fontSize={Fonts.size.h6}
      //     onPress={()=>{
      //       this.props.navigation.navigate("ProfileScreen", {
      //         nric: this.state.nric, 
      //         loginUpdate: true
      //       });
      //     }}
      //   />
      // </View>

    )
  }

  handleRenderDeliveryAddressAttrContainer(label, data, updateId) {
    return (
      <View style={tailwind('mb-3')}>
        <Label
          text={`${label}`}
          style={tailwind("text-primaryBlue text-lg my-0.5")}
        />
        <Input
          placeholder={`${label}`}
          value={`${data}`}
          onChangeText={
            (value) => {
              this.handleDeliveryAddressInfoUpdate(updateId, value);
            }
          }
          onEndEditing={
            () => {
              this.handleGetShipmentMethodList()
            }
          }

          inputStyle={tailwind("text-gray-400 text-base")}
          inputContainerStyle={tailwind("border-transparent")}
          containerStyle={tailwind(" h-12 border border-gray-400 rounded-lg")}
        />
        {
          !data
            ?
            <Label
              text={`Please fill in ${updateId}.`}
              style={{
                color: Colors.text_negative,
                fontSize: Fonts.size.small,
              }}
            />
            :
            <View />
        }
      </View>
    )
  }

  // handleRenderCartListItemContainer = ({ item, index }) => {
  //   return (
  //     <TouchableOpacity
  //       activeOpacity={0.9}
  //       style={{
  //         backgroundColor: Colors.body,
  //         width: "95%",
  //         alignSelf: "center",
  //         // borderTopWidth: 1, borderBottomWidth: 1,
  //         borderWidth: 1,
  //         borderRadius: 5,
  //         borderColor: Colors.border_line,
  //         flex: 1, flexDirection: 'row',
  //         // marginVertical: Metrics.smallMargin,
  //         marginTop: 3,
  //       }}
  //     >
  //       {/* Left - Product Image */}
  //       {this.handleRenderCartItemImageContainer(item, index)}

  //       {/* Right - Product Details */}
  //       <View style={{
  //         flex: 1,
  //         paddingHorizontal: Metrics.smallPadding,
  //         // paddingVertical: Metrics.basePadding,
  //       }}>
  //         <View style={{ flex: 1, justifyContent: "center" }}>

  //           {/* Prod Desc */}
  //           {this.handleRenderCartItemProdDescContainer(item, index)}

  //           <View >
  //             {/* Prod Variation */}
  //             {/* {this.handleRenderCartItemProdVariationContainer(item, index)} */}

  //             {/* Prod Price */}
  //             {this.handleRenderCartItemProdPriceContainer(item, index)}

  //             {/* Prod Quantity */}
  //             {this.handleRenderCartItemProdQuantityContainer(item, index)}

  //             {/* Item Total Amount */}
  //             {this.handleRenderCartItemProdTotalAmountContainer(item, index)}
  //           </View>
  //         </View>
  //       </View>

  //     </TouchableOpacity>
  //   )
  // }

  handleRenderCartListItemContainer = ({ item, index }) => {
    return (
      <Card containerStyle={tailwind('bg-white rounded-lg opacity-100')}>
        <View style={tailwind('flex-row ')}>
          <View style={tailwind('justify-center items-center')}>
            {/* Left - Product Image */}
            {this.handleRenderCartItemImageContainer(item, index)}
          </View>

          <View style={{flexShrink: 1, marginLeft: Metrics.basePadding, flexDirection: "column", justifyContent: "center" }}>
            {/* Right - Product Details */}
            {/* Prod Desc */}
            <View>
              {this.handleRenderCartItemProdDescContainer(item, index)}
            </View>
            <View style={tailwind("mt-1")}>
              {/* Prod Variation */}
              {/* {this.handleRenderCartItemProdVariationContainer(item, index)} */}

              {/* Prod Price */}
              {/* {this.handleRenderCartItemProdPriceContainer(item, index)} */}

              {/* Prod Quantity */}
              {/* {this.handleRenderCartItemProdQuantityContainer(item, index)} */}

              {/* Item Total Amount */}
              {this.handleRenderCartItemProdTotalAmountContainer(item, index)}
            </View>
          </View>
        </View>
      </Card>
    )
  }


  handleRenderCartItemImageContainer(item, index) {
    return (
      <View>
        <Image
          source={item.images}
          style={{
            width: SCREEN_WIDTH * 0.2,
            height: SCREEN_WIDTH * 0.2,
            resizeMode: 'contain'
          }}
        />
      </View>
    )
  }

  handleRenderCartItemProdDescContainer(item, index) {
    return (
      <Label
        text={`${item.product_name}`}
        style={tailwind("flex flex-wrap text-xl font-bold text-primary")}
        numberOfLines={3}
        ellipsizeMode={'tail'}
      />
    )
  }

  handleRenderCartItemProdVariationContainer(item, index) {
    return (
      <Label
        text={`Variation: ${item.variation}`}
        style={{
          fontSize: Fonts.size.medium,
          color: Colors.text_color_1,
        }}
      />
    )
  }

  handleRenderCartItemProdPriceContainer(item, index) {
    return (
      <Label
        text={`${this.state.currency_symbol} ${item.prod_price}`}
        style={{
          fontSize: Fonts.size.regular,
          // fontWeight: 'bold',
          color: Colors.primary,
          // paddingVertical: Metrics.smallPadding
        }}
      />
    )
  }

  handleRenderCartItemProdQuantityContainer(item, index) {
    return (
      <Label
        text={`Quantity: ${item.qty}`}
        style={{
          fontSize: Fonts.size.regular,
          color: Colors.primary,
        }}
      />
    )
  }

  handleRenderCartItemProdTotalAmountContainer(item, index) {
    var total_amount = parseFloat(item.prod_price) * item.qty;
    return (
      <Label
        text={`Total Amount: ${this.state.currency_symbol} ${total_amount.toFixed(2)}`}
        style={tailwind("flex flex-wrap text-primaryBlue text-base")}
        numberOfLines={2}
      />
    )
  }

  handleRenderPaymentOptionContainer() {
    return (
      <Card containerStyle={tailwind('bg-white rounded-lg opacity-100')}>
        <Card.Title style={tailwind("text-primary text-xl font-bold")}>
          Payment Option
        </Card.Title>
        <Card.Divider />

        <View>

          <Label
            text={`iPay88`}
            style={tailwind("text-primaryBlue text-lg")}
          // style={{
          //   color: Colors.primary,
          //   fontSize: Fonts.size.h6,
          // }}
          />
        </View>
      </Card>

    )
  }

  handleRenderPaymentSummaryContainer() {
    return (
      <Card containerStyle={tailwind('bg-white rounded-lg opacity-100')}>
        <Card.Title style={tailwind("text-primary text-xl font-bold")}>
          Order Summary
        </Card.Title>
        <Card.Divider />
        <View>
          <View >

            {/* Total Items Amount */}
            <View
              // style={{
              //   flexDirection: 'row',
              //   // paddingVertical: Metrics.smallPadding,
              //   justifyContent: 'space-between',
              // }}
              style={tailwind("flex-row justify-between mt-5")}
            >
              <Label
                text={`Total Items Amount: `}
                //   style={{
                //     fontSize: Fonts.size.large,
                //     color: Colors.primary
                //   }
                // }
                style={tailwind("text-primaryBlue text-lg")}
              />

              <Label
                text={`${this.state.currency_symbol} ${this.state.total_amount}`}
                style={tailwind("text-primaryBlue text-lg")}
              />
            </View>

            {/* Shipping Fee */}
            <View style={tailwind("flex-row justify-between")}
            >
              <Label
                text={`Shipping Fee: `}
                style={tailwind("text-primaryBlue text-lg")}
              />

              <Label
                text={`${this.state.currency_symbol} ${parseFloat(this.state.shipping_fee).toFixed(2)}`}
                style={tailwind("text-primaryBlue text-lg")}
              />
            </View>
            <View>
            </View>

            {/* Total Amount */}
            <View style={{
              flexDirection: 'row',
              // paddingVertical: Metrics.smallPadding,
              marginBottom: Metrics.smallMargin,
              justifyContent: 'space-between'
            }}>
              <Label
                text={`Total Payment: `}
                style={tailwind("text-primary text-lg font-bold")}
              />

              <Label
                text={`${this.state.currency_symbol} ${this.state.total_item_amount}`}
                style={tailwind("text-primary text-lg")}
              />
            </View>

          </View>

        </View>
      </Card>

    )
  }
  

  handleRenderShippingMethodContainer() {
    return (
      <Card containerStyle={tailwind('bg-white rounded-lg opacity-100')}>
        <Card.Title 
        style={tailwind("text-primary text-xl font-bold")}
        // {{
        //   color: Colors.button_background,
        //   fontSize: Fonts.size.h6,
        //   fontWeight: 'bold',
        // }}
        >Shipping Method</Card.Title>
        <Card.Divider />
        <View
        // style={{
        //   backgroundColor: Colors.body,
        //   paddingHorizontal: Metrics.smallPadding,
        //   paddingVertical: Metrics.basePadding,
        //   marginVertical: Metrics.smallMargin,
        //   // borderTopWidth: 1, borderBottomWidth: 1,
        //   width: "95%", alignSelf: "center",
        //   borderRadius: 5, borderWidth: 1,
        //   borderColor: Colors.border_line
        // }}
        >


          <View style={{ paddingTop: Metrics.smallPadding, }}>
            {
              Object.keys(this.state.shipment_methods_list).length > 0
                ? <ShippingMethod
                  data={this.state.shipment_methods_list}
                  preSelectedData={this.state.selected_shipment_method}
                  onChange={this.handleShippingMethodOnChange}
                />
                : <Label
                  text={`Action Require, please fill in delivery address.`}
                  style={{
                    color: Colors.button_red,
                    fontSize: Fonts.size.input,
                    marginBottom: Metrics.smallMargin
                  }}
                />
            }
          </View>


        </View>


      </Card>
    )
  }

  handleRenderShippingNoteContainer() {
    return (
      <Card containerStyle={tailwind('bg-white rounded-lg opacity-100')}>
        <Card.Title style={tailwind("text-primary text-xl font-bold")}>
          Shipping Note
        </Card.Title>
        <Card.Divider />
        <View
        // style={{
        //   backgroundColor: Colors.body,
        //   paddingHorizontal: Metrics.smallPadding,
        //   paddingVertical: Metrics.basePadding,
        //   marginVertical: Metrics.smallMargin,
        //   // borderTopWidth: 1, borderBottomWidth: 1, 
        //   width: "95%", alignSelf: "center",
        //   borderRadius: 5, borderWidth: 1,
        //   borderColor: Colors.border_line
        // }}
        >
          <Input
            placeholder={`Please enter your shipping note here...`}
            value={`${this.state.shipping_notes}`}
            //  multiline={true}
            onChangeText={(value) => {
              this.setState({
                shipping_notes: value
              });
            }}


            inputStyle={tailwind("text-gray-400 text-base")}
            inputContainerStyle={tailwind("border-transparent")}
            containerStyle={tailwind(" h-12 border border-gray-400 rounded-lg")}
          />

        </View>
      </Card>
    )
  }

  handleRenderCheckoutButtonContainer() {
    return (
      <View style={tailwind("self-center w-full ")}>

        {/* Checkout Button */}
        {/* <AppsButton

          text={`Payment`}
          backgroundColor={Colors.button_background}
          fontSize={Fonts.size.h6}
          onPress={() => {
            this.handlePaymentProcess();
          }}
        /> */}
        <Button
          containerStyle={tailwind("mx-5")}
          buttonStyle={tailwind("rounded-lg bg-buttoncolor")}
          icon={
            <Icon
              name="credit-card"
              type="evilicon"
              color="white"
              containerStyle={tailwind("mr-1")}
            />
          }
          title="Payment"
          titleStyle={tailwind("text-xl")}
          onPress={() => {
            this.handlePaymentProcess();
          }}
        />

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
            // Cart Products list
            this.handleRenderCartProductsContainer()
        }

        {/* Loading Animation */}
        {this.handleRenderLoadingIndicator()}
      </SafeAreaView>
    )
  }
}