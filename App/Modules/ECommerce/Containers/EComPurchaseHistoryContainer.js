/** REACT NATIVE **/
import React from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Image,
  Linking,
  Modal,
  Platform,
  Text,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';

/** PROJECT FILES **/
import {
  Colors,
  Fonts,
  Images,
  Metrics,
  ApplicationStyles,
  LoadingIndicator,
  Label,
  AppsButton,
} from '../../../Services/LibLinking';
import styles from '../Styles/e_com_purchase_history_styles';
import EComPurchaseHistoryControllers from '../Actions/EComPurchaseHistoryControllers';
import MemberController from '../../Member/Actions/member_controller';

/** NPM LIBRARIES **/
import {NavigationActions, DrawerActions, SafeAreaView} from 'react-navigation';
import {getColor, tailwind} from '../../../../tailwind';
import {Button, Card, Icon} from 'react-native-elements';

/**
 * TODO:
 * √ Create order data UI view
 * - Fix scroll view change show empty screen when tabs switch
 * √ Link to checkout screen
 */

const SCREEN_WIDTH = Dimensions.get('screen').width;

export default class EComLandingView extends React.Component {
  constructor(props) {
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
        {label: 'To Pay', id: 'unpaid'},
        {label: 'To Ship', id: 'ready_to_ship'},
        {label: 'To Receive', id: 'checkout'},
        {label: 'Completed', id: 'complete'},
        {label: 'Cancelled', id: 'cancel'},
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
    };

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
      headerRight: (
        <View
          style={{
            width: Metrics.icons.medium,
            height: Metrics.icons.medium,
            paddingRight: 10,
          }}></View>
      ),
    };
  };

  // Navigate Function To Open Drawer
  navigateToScreen = (navigation, params = '') => {
    const navigateAction = NavigationActions.navigate({
      routeName: 'DrawerStack',
      params: params,
    });

    navigation.dispatch(navigateAction);
    navigation.dispatch(DrawerActions.openDrawer());
  };

  /****************************************************************/
  /*********************** COMPONENT  *****************************/
  /****************************************************************/

  componentDidMount() {
    // this.props.navigation.setParams({this: this.navigateToScreen});
    this.handleGetPurchaseHistory();

    // get member nric
    this.handleGetShippingDetails();
  }

  componentWillUnmount() {}

  componentDidUpdate(prevProps) {
    // History Update
    var historyUpdate = this.props.navigation.getParam('historyUpdate', false);
    if (historyUpdate && this.props.navigation != prevProps.navigation) {
      this.props.navigation.setParams({historyUpdate: false});
      this.handleGetPurchaseHistory();
    }

    // Payment Update
    var paymentUpdate = this.props.navigation.getParam('paymentUpdate', false);
    if (paymentUpdate && this.props.navigation != prevProps.navigation) {
      this.props.navigation.setParams({paymentUpdate: false});
      var payment_result = this.props.navigation.getParam('payment_result', {});
      this.handlePaymentResult(payment_result);
    }
  }

  handleFetchDataIndicator(status, text = '') {
    this.setState({
      fetch_data: status,
      fetch_data_text: text ? text : 'Fetching data...',
    });
  }

  /****************************************************************/
  /******************** FUNCTIONALITY *****************************/
  /****************************************************************/

  handleGetPurchaseHistory() {
    this.handleFetchDataIndicator(true, 'Loading Data...');
    var ph_return = this.eComPurchaseHistoryControllers.getPurchaseHistory();
    ph_return.then((res) => {
      if (res.result == 1) {
        this.setState(
          {
            firstLoad: false,
            order_data: res.order_data,
            flatListRentalTrigger: !this.state.flatListRentalTrigger,
            currency_symbol: res.currency_symbol,
          },
          () => {
            // Get history tab selected index from Checkout Screen
            var history_tab_selected = this.props.navigation.getParam(
              'history_tab_selected',
              0,
            );
            this.setState({
              history_tab_selected,
              flatListRentalTrigger: !this.state.flatListRentalTrigger,
            });
          },
        );
      } else {
        Alert.alert('Error', res.data.msg);
      }
      this.handleFetchDataIndicator(false);
    });
  }

  handleGetShippingDetails() {
    this.memberController.getMemberShippingAddress().then((res) => {
      // alert(JSON.stringify(res))
      if (res.result == 1) {
        this.setState({
          shipping_details_status:
            res.data.name &&
            res.data.email &&
            res.data.phone &&
            res.data.address &&
            res.data.postcode &&
            res.data.city &&
            res.data.state,
          nric: res.data.nric,
          name: res.data.name,
          email: res.data.email,
          phone: res.data.phone,
          address: res.data.address,
          postcode: res.data.postcode,
          city: res.data.city,
          state: res.data.state,
        });
      }
    });
  }

  handlePaymentProcess(order_no) {
    // Payment Checkout Data
    var checkout_data = {
      member_nric: this.state.nric,
      order_no,
    };
    this.props.navigation.navigate('EComPaymentScreen', {
      action: 'update_order_payment',
      checkout_data,
    });
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
    // alert(JSON.stringify(payment_result))
    if (payment_result.result == 0 && payment_result.error_code) {
      // Checkout Cart Error
      Alert.alert('Error', payment_result.error_code);
    } else {
      if (payment_result.result == 1 && payment_result.status == 1) {
        // Payment success
        this.setState({
          history_tab_selected: 1,
        });
        Alert.alert('Payment Successful');
      } else {
        Alert.alert('Payment Failed', payment_result.message);
      }
      this.handleGetPurchaseHistory();
    }
  }

  /****************************************************************/
  /******************** SCREEN RENDERING **************************/
  /****************************************************************/

  // Loading Indicator
  handleRenderLoadingIndicator() {
    return (
      <LoadingIndicator
        visible={this.state.fetch_data}
        size={'large'}
        text={`${this.state.fetch_data_text}`}
      />
    );
  }

  // Render My Purchase History Container
  handleRenderPurchaseHistoryContainer() {
    return this.state.fetch_data ? (
      <View />
    ) : (
      <View style={tailwind('flex-1 bg-gray-200')}>
        {/* History tabs */}
        <View
          style={{
            backgroundColor: 'white',
            paddingHorizontal: Metrics.smallPadding,
            marginTop: Metrics.baseMargin,
            borderTopWidth: 1,
            borderBottomWidth: 1,
            borderColor: Colors.border_line,
          }}>
          <FlatList
            data={this.state.history_tabs}
            renderItem={this.handleRenderHistoryTabsContainer}
            extraData={this.state.flatListRentalTrigger}
            keyExtractor={(item, index) => `${index}`}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
          />
        </View>
        <View style={tailwind('mt-3')}>
          <ScrollView
            contentContainerStyle={{
              paddingBottom: Metrics.mainContainerMargin,
            }}
            ref={(ref) => (this.scrollView = ref)}>
            {/* History Tabs Content */}
            {this.handleRenderHistoryTabsContent(
              this.state.order_data
                .reverse()
                .filter(
                  (value, index) =>
                    value.order_status ==
                    this.state.history_tabs[this.state.history_tab_selected].id,
                ),
              // .sort(
              //   (a, b) => b.order_no - a.order_no
              // )
            )}
          </ScrollView>
        </View>
      </View>
    );
  }

  /******************************/
  /******** Header Tabs *********/
  /******************************/

  handleRenderHistoryTabsContainer = ({item, index}) => {
    return (
      <TouchableOpacity
        style={{
          paddingVertical: Metrics.basePadding,
          paddingHorizontal: Metrics.basePadding,
          backgroundColor: 'white',
         
        }}
        onPress={() => {
          // Make screen scroll to top
          if (this.scrollView) {
            this.scrollView.scrollTo({x: 0, y: 0, animated: true});
          }

          this.setState({
            history_tab_selected: index,
            flatListRentalTrigger: !this.state.flatListRentalTrigger,
          });
        }}>
        <Label
          text={`${item.label}`}
          style={[
            tailwind('text-primary text-xl '),
            this.state.history_tab_selected == index
              ? {fontWeight: 'bold'}
              : '',
          ]}
        />
      </TouchableOpacity>
    );
  };

  /*******************************/
  /******** Content Data *********/
  /*******************************/

  handleRenderHistoryTabsContent(data) {
    return data.length > 0 ? (
      <View>
        <FlatList
          data={data}
          renderItem={this.handleRenderHistoryTabsContentItem}
          extraData={this.state.flatListRentalTrigger}
          keyExtractor={(item, index) => `${index}_${item.order_no}`}
          scrollEnabled={false}
        />
      </View>
    ) : (
      <View
        style={{
          backgroundColor: Colors.body,
          paddingHorizontal: Metrics.smallPadding,
          paddingVertical: Metrics.basePadding,
          marginVertical: Metrics.baseMargin,
          borderTopWidth: 1,
          borderBottomWidth: 1,
          borderColor: Colors.border_line,
        }}>
        <Label
          text={`No Order Yet.`}
          style={tailwind('text-primary text-2xl font-bold text-center')}
        />
      </View>
    );
  }

  handleRenderHistoryTabsContentItem = ({item, index}) => {
    return (
      <View
        style={{
          backgroundColor: 'white',
          width: '92%',
          borderRadius: 10,
          marginVertical: 5,
          marginTop:Metrics.baseMargin,
          alignSelf: 'center',
          borderWidth: 1,
          borderColor: Colors.border_line,
          marginBottom:40,
          marginTop:5,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,

          elevation: 5,
        }}>
        {/*******************************/}
        {/********** ITEM DATA **********/}
        {/*******************************/}
        <View
          style={
            {
              // paddingHorizontal: Metrics.smallPadding,
              // paddingVertical: Metrics.basePadding,
              // marginVertical: Metrics.smallMargin,
            }
          }>
          <FlatList
            data={item.item_data}
            renderItem={this.handleRenderProductItemContainer}
            extraData={this.state.flatListRentalTrigger}
            keyExtractor={(item, index) => `${index}`}
            scrollEnabled={false}
          />
        </View>
        {/*******************************/}
        {/******** ORDER DETAILS ********/}
        {/*******************************/}
        {this.handleRenderOrderDetailsContainer(item, index)}
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
        {this.state.history_tab_selected == 0 ? (
          this.handleRenderPayButtonContainer(item, index)
        ) : (
          <View />
        )}
      </View>
    );
  };

  handleRenderOrderDetailsContainer(item, index) {
    return (
      <View
        style={{
          paddingHorizontal: Metrics.smallPadding,
          paddingVertical: Metrics.smallPadding,
          // marginVertical: Metrics.smallMargin,
        }}>
        {/* Order Label */}
        {this.handleRenderTitleAttrContainer(`Order Details`)}

        {/* Order Number */}
        {this.handleRenderSpaceBetweenAttrContainer(
          `Order No.:`,
          item.order_no,
        )}

        {/* Order Status */}
        {this.handleRenderSpaceBetweenAttrContainer(
          `Order Status:`,
          item.order_status_text,
        )}

        {/* Shipping Fees */}
        {this.handleRenderSpaceBetweenAttrContainer(
          `Shipping Fees:`,
          `${this.state.currency_symbol} ${item.shipping_fees}`,
        )}

        {/* Total Items Amount */}
        {this.handleRenderSpaceBetweenAttrContainer(
          `Total Item Amount:`,
          `${this.state.currency_symbol} ${item.total_item_amount}`,
        )}

        {/* Buyer Note */}
        {this.handleRenderNormalAttrContainer(`Buyer Note:`, item.buyer_note)}
      </View>
    );
  }

  handleRenderLogisticContainer(item, index) {
    return (
      <View
        style={{
          paddingHorizontal: Metrics.smallPadding,
          // paddingVertical: Metrics.basePadding,
          marginVertical: Metrics.smallMargin,
        }}>
        {/* Logistic Label */}
        {this.handleRenderTitleAttrContainer(`Logistic`)}

        {/* Logistic Company */}
        {this.handleRenderSpaceBetweenAttrContainer(
          `Logistic Company:`,
          item.logistic_company,
        )}

        {/* Tracking Number */}
        {this.handleRenderSpaceBetweenAttrContainer(
          `Tracking No.:`,
          item.tracking_number,
        )}
      </View>
    );
  }

  handleRenderPaymentAndInvoiceContainer(item, index) {
    return (
      <View
        style={{
          paddingHorizontal: Metrics.smallPadding,
          // paddingVertical: Metrics.smallPadding,
          marginVertical: Metrics.smallMargin,
        }}>
        {/* Invoice & Payment Label */}
        {this.handleRenderTitleAttrContainer(`Invoice & Payment`)}

        {/* Invoice Number */}
        {this.handleRenderSpaceBetweenAttrContainer(
          `Invoice No.:`,
          item.invoice_no,
        )}

        {/* Payment Ref. */}
        {this.handleRenderSpaceBetweenAttrContainer(
          `Payment Ref.:`,
          item.payment_reference,
        )}

        {/* Payment Amount */}
        {this.handleRenderSpaceBetweenAttrContainer(
          `Payment Amount:`,
          item.payment_amount,
        )}

        {/* Payment Type */}
        {this.handleRenderSpaceBetweenAttrContainer(
          `Payment Type:`,
          item.payment_type,
        )}

        {/* Payment Date */}
        {this.handleRenderSpaceBetweenAttrContainer(
          `Payment Date:`,
          item.payment_transaction_date,
        )}

        {/* Payment Transaction Error Msg */}
        {this.handleRenderNormalAttrContainer(
          `Error Message:`,
          item.payment_transaction_error_message,
        )}
      </View>
    );
  }

  handleRenderPayButtonContainer(item, index) {
    return (
      <View>
        <Button
          containerStyle={tailwind("mx-5 my-5")}
          buttonStyle={tailwind("rounded-lg bg-btn-primary")}
          icon={
            <Icon
              name="credit-card"
              type="evilicon"
              color="white"
              containerStyle={tailwind("mr-1")}
            />
          }
          title="PAY"
          titleStyle={tailwind("text-xl")}
          onPress={() => {
            this.handlePaymentProcess(item.order_no);
          }}
        />
       
      </View>
    );
  }

  /*************************************/
  /******** Data Label Container *******/
  /*************************************/

  handleRenderTitleAttrContainer(label) {
    return (
      <View style={tailwind('mb-1')}>
        <Label
          text={`${label}`}
          style={tailwind('text-primary text-lg font-bold')}
          // style={{
          //   fontSize: Fonts.size.input,
          //   color: Colors.primary,
          //   fontWeight: 'bold',
          //   marginBottom: Metrics.smallMargin / 2,
          // }}
        />
      </View>
    );
  }

  handleRenderSpaceBetweenAttrContainer(label, data) {
    return (
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          justifyContent: 'space-between',
          // marginVertical: Metrics.smallMargin / 2,
        }}>
        <Label
          text={`${label}`}
          style={tailwind('text-secondary text-base ')}
        />

        <Label
          text={`${data}`}
          style={tailwind('text-secondary text-base text-right')}
        />
      </View>
    );
  }

  handleRenderNormalAttrContainer(label, data) {
    return (
      // <Label
      //   text={`${label} ${data}`}
      //   style={{
      //     fontSize: Fonts.size.regular,
      //     color: Colors.primary,
      //     marginVertical: Metrics.smallMargin / 2
      //   }}
      // />

      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          marginVertical: Metrics.smallMargin / 2,
        }}>
          <Label
            text={`${label} `}
            style={tailwind('text-secondary text-base font-bold')}
          />

          <Label
            text={`${data}`}
            style={tailwind('flex-1 text-secondary text-base text-right')}
          />
      </View>
    );
  }

  /**********************************/
  /******** Product Item List *******/
  /**********************************/

  handleRenderProductItemContainer = ({item, index}) => {
    return (
      <TouchableOpacity
        // activeOpacity={0.9}
        style={{
          flex: 1,
          flexDirection: 'row',
          marginVertical: Metrics.smallMargin,
        }}
        onPress={() => {
          if (item.active) {
            this.props.navigation.navigate('EComProductItemScreen', {
              product_data: item.full_product_data,
            });
          } else {
            Alert.alert('', 'Product is inactive.');
          }
        }}>
        <View
          style={{
            width: '30%',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          {/* Left - Product Image */}
          {this.handleRenderProductImageContainer(item, index)}
        </View>

        {/* Right - Product Details */}
        <View
          style={{
            flex: 1,
            paddingHorizontal: Metrics.smallPadding,
            paddingVertical: Metrics.basePadding,
            justifyContent: 'center',
            alignItems: 'flex-start',
          }}>
          <View>
            <View>
              {/* Prod Desc */}
              <View>
                {this.handleRenderProductProdDescContainer(item, index)}
              </View>

              {/* Prod Variation */}
              {/* {this.handleRenderProductProdVariationContainer(item, index)} */}

              <View style={tailwind('mt-2')}>
                {/* Prod Price */}
                {this.handleRenderProductProdPriceContainer(item, index)}

                {/* Prod Quantity */}
                {this.handleRenderProductProdQuantityContainer(item, index)}
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  handleRenderProductImageContainer(item, index) {
    return (
      <View
        style={{
          paddingVertical: Metrics.basePadding,
          paddingHorizontal: Metrics.smallPadding,
        }}>
        <Image
          source={item.images}
          style={{
            width: SCREEN_WIDTH * 0.2,
            height: SCREEN_WIDTH * 0.2,
            resizeMode: 'contain',
          }}
        />
      </View>
    );
  }

  handleRenderProductProdDescContainer(item, index) {
    return (
      <Label
        text={`${item.product_name}`}
        style={tailwind('text-primary text-lg font-bold')}
        numberOfLines={1}
        ellipsizeMode={'tail'}
      />
    );
  }

  handleRenderProductProdVariationContainer(item, index) {
    return (
      <Label
        text={`Variation: ${item.variation}`}
        style={tailwind('text-secondary text-base')}
      />
    );
  }

  handleRenderProductProdPriceContainer(item, index) {
    return (
      <Label
        text={`${this.state.currency_symbol} ${item.amount}`}
        style={tailwind('text-secondary text-base')}
      />
    );
  }

  handleRenderProductProdQuantityContainer(item, index) {
    return (
      <View
        style={{
          flexDirection: 'row',
        }}>
        <Label
          text={`Quantity: ${item.quantity}`}
          style={tailwind('text-secondary text-base')}
        />
      </View>
    );
  }

  render() {
    return (
      /**Start Safe Area**/
      <SafeAreaView
        style={ApplicationStyles.screen.safeAreaContainer}
        forceInset={{vertical: 'never'}}>
            {/* Screen on loading, hide default state data */}
        {this.state.firstLoad ? (
          <View />
        ) : (
          // Purchase History Display
          this.handleRenderPurchaseHistoryContainer()
        )}

        {/* Loading Animation */}
        {this.handleRenderLoadingIndicator()} 
      </SafeAreaView>
    );
  }
}
