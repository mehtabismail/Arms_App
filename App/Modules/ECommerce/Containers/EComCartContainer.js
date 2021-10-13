/** REACT NATIVE **/
import React from 'react';
import {
  Alert, Animated,
  Dimensions,
  FlatList,
  Image,
  Keyboard,
  LayoutAnimation, Linking,
  Modal,
  Platform,
  ScrollView,
  TextInput, TouchableOpacity,
  UIManager,
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
import styles from '../Styles/e_com_cart_styles';
import LoginController from '../../General/Login/Actions/login_controller';
import EComProductItemControllers from '../Actions/EComProductItemControllers';

/** NPM LIBRARIES **/
import { NavigationActions, DrawerActions, SafeAreaView } from 'react-navigation';
import { t } from 'i18n-js';

const SCREEN_WIDTH = Dimensions.get("screen").width;
const SCREEN_HEIGHT = Dimensions.get("screen").height;

// LayoutAnimation Config
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

/**
 * TODO:
 * √ Click product go to product item screen
 * √ Update product qty to server (pending server side checking)
 * √ Remove the product item
 */

export default class EComCartView extends React.Component {
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
      scrollViewBtmMargin: { paddingBottom: 150 },

      // Cart Data
      voucher_code: "",
      voucher_amount: 0,
      shipping_fee: 0,
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

      // Delete Button Indicator
      is_delete_mode: false,
      deleteButtonTranslateX: new Animated.Value(100),

    }

    // Create controller object
    this.loginController = new LoginController();
    this.eComProductItemControllers = new EComProductItemControllers();
  }

  /****************************************************************/
  /************************ HEADER ********************************/
  /****************************************************************/

  // Navigation Tab
  static navigationOptions = ({ navigation, navigationOptions }) => {
    const params = navigation.state.params || {};
    var navigateToScreen = params.this;

    return {
      title: 'Shopping Cart',
      // headerLeft: (
      //   <TouchableOpacity style={{paddingLeft: 10}} onPress={() => navigateToScreen(navigation, {loginUpdate: true})}>
      //     <Image
      //       style={{width: Metrics.icons.medium, height: Metrics.icons.medium, tintColor: Colors.secondary}} 
      //       source={Images.menu}/>
      //   </TouchableOpacity>
      // ),
      headerRight: (
        <View style={{ width: Metrics.icons.medium, height: Metrics.icons.medium, paddingRight: 10 }}></View>
      ),
    }
  }

  /****************************************************************/
  /*********************** COMPONENT  *****************************/
  /****************************************************************/

  componentDidMount() {
    // this.props.navigation.setParams({this: this.navigateToScreen});
    this.handleGetCartList();

    this.keyboardDidShowListener = Keyboard.addListener('keyboardWillShow', this.keyboardDidShow.bind(this));
    this.keyboardDidHideListener = Keyboard.addListener('keyboardWillHide', this.keyboardDidHide.bind(this));
  }

  componentWillUnmount() {
    this.keyboardDidShowListener.remove();
    this.keyboardDidHideListener.remove();
  }

  componentDidUpdate(prevProps) {
    console.log(this.props.navigation)
    // Cart Update
    var cartUpdate = this.props.navigation.getParam('cartUpdate', false);
    if (cartUpdate && this.props.navigation != prevProps.navigation) {
      this.props.navigation.setParams({ cartUpdate: false });
      this.handleGetCartList();
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
  }

  keyboardDidHide(e) {
    // Animated.timing(this.state.screenY,{
    //   toValue : 0,
    //   duration : e.duration
    // }).start();

    this.setState({
      scrollViewBtmMargin: { paddingBottom: 150 }
    });
  }

  handleGetCartList() {
    this.handleFetchDataIndicator(true, "Fetching Cart Data...");
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
          flatListRentalTrigger: !this.state.flatListRentalTrigger
        });
      } else {
        Alert.alert("Error", res.data.msg);
      }
      this.handleFetchDataIndicator(false);
    })
  }

  handleItemQtyUpdate(action, index, value) {
    this.handleFetchDataIndicator(true, "Updating Quantity...");
    var cart_list = this.state.cart_list;
    var qty = cart_list[index].qty;
    switch (action) {
      case 'sub':
        qty -= 1;
        break;

      case 'add':
        qty += 1;
        break;

      case 'edit':
        qty = value;
        break;

      default:
        break;
    }

    if (qty >= 1) {
      // Update cart to server
      var product_data = {
        product_sku_id: cart_list[index].product_sku_id,
        quantity: qty
      }
      var update_result = this.eComProductItemControllers.updateQtyToCart(product_data);
      update_result.then((res) => {
        if (res.result == 1) {
          // Update local cart_list data
          cart_list[index].qty = qty;
          this.setState({
            cart_list,
            flatListRentalTrigger: !this.state.flatListRentalTrigger
          });
        } else {
          if (res.data.error_code == "stock_not_enough") {
            var product_available_qty = cart_list[index].full_product_data.quantity;
            Alert.alert("Error", `${res.data.msg} Stock available quantity is ${product_available_qty}.`);
          } else {
            Alert.alert("Error", res.data.msg);
          }
        }
        this.handleFetchDataIndicator(false);
      });
    } else {
      this.handleFetchDataIndicator(false);
    }


  }

  handleRemoveItemFromCart(index) {
    this.handleFetchDataIndicator(true, "Deleting item...");
    var cart_list = this.state.cart_list;
    var product_sku_id = cart_list[index].product_sku_id;

    var del_result = this.eComProductItemControllers.deleteItemFromCart(product_sku_id);
    del_result.then((res) => {
      if (res.result == 1) {
        // Remove item from local cart_list
        cart_list.splice(index, 1);
        this.setState({
          cart_list,
          flatListRentalTrigger: !this.state.flatListRentalTrigger
        });
      } else {
        Alert.alert("Error", res.data.msg);
      }
      this.handleFetchDataIndicator(false);
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

  // Render Cart Products list
  handleRenderCartProductsContainer() {
    return (
      this.state.fetch_data
        ?
        <View />
        :
        <View style={{ flex: 1 }}>

          {/* Edit Mode */}
          {this.handleRenderEditModeContainer()}

          <Animated.ScrollView
            contentContainerStyle={[this.state.scrollViewBtmMargin]}
          // style={{
          //   transform: [{scaleY: this.state.screenY}]
          // }}
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

          </Animated.ScrollView>

          {/* Checkout Button */}
          {this.handleRenderCheckoutButtonContainer()}
        </View>
    )
  }

  handleRenderEditModeContainer() {
    return (
      // <View>
      <TouchableOpacity
        style={{
          paddingTop: Metrics.smallPadding,
          paddingHorizontal: Metrics.smallPadding,
          alignSelf: 'flex-end',
        }}
        onPress={() => {
          this.setState({
            is_delete_mode: !this.state.is_delete_mode,
            flatListRentalTrigger: !this.state.flatListRentalTrigger
          }, () => {
            Animated.timing(this.state.deleteButtonTranslateX, {
              toValue: this.state.is_delete_mode ? 0 : 100,
              duration: 320
            }).start();
          })
        }}
      >
        <Label
          text={this.state.is_delete_mode ? `Done` : `Edit`}
          style={{
            fontSize: Fonts.size.regular,
            color: Colors.primary,
            alignSelf: 'flex-end',
          }}
        />
      </TouchableOpacity>
      // </View>
    )
  }

  handleRenderCartListItemContainer = ({ item, index }) => {
    return (
      <Card
        containerStyle={tailwind("flex rounded-lg opacity-100 ")}
        onPress={() => {
          this.props.navigation.navigate("EComProductItemScreen", {
            product_data: item.full_product_data
          })
        }}
      >
        <View style={tailwind("flex-row justify-around ")}>
          <View style={tailwind("items-center justify-center")}>
            {/* Left - Product Image */}
            {this.handleRenderCartItemImageContainer(item, index)}
          </View>
          <View style={tailwind("justify-center")}>
            <View>
              {/* Right - Product Details */}
              {/* Prod Desc */}
              {this.handleRenderCartItemProdDescContainer(item, index)}
            </View>
            {/* Prod Variation */}
            {/* {this.handleRenderCartItemProdVariationContainer(item, index)} */}
            <View style={tailwind("self-start")}>
              {/* Prod Price */}
              {this.handleRenderCartItemProdPriceContainer(item, index)}
            </View>
          </View>
        </View>
        <View style={tailwind("flex-col justify-center items-center")}>
          <View>
            {/* Prod Quantity */}
            {this.handleRenderCartItemProdQuantityContainer(item, index)}
          </View>
          <View>
            {/* Item Total Amount */}
            {/* {this.handleRenderCartItemProdTotalAmountContainer(item, index)} */}
          </View>
          {/* Delete Item Button */}
          {/* {this.handleRenderCartItemDeleteButton(item, index)} */}
        </View>
      </Card>
    )
  }

  handleRenderCartItemImageContainer(item, index) {
    return (
      <View
      // style={{ paddingVertical: Metrics.basePadding, paddingLeft: Metrics.smallPadding }}
      >
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
        style={{
          fontSize: Fonts.size.regular,
          color: Colors.primary,
        }}
        numberOfLines={1}
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
          fontWeight: 'bold',
          color: Colors.primary,
          // paddingVertical: Metrics.basePadding
        }}
      />
    )
  }

  handleRenderCartItemProdQuantityContainer(item, index) {
    return (
      <View style={tailwind("flex-row")}>
        {/* <TouchableOpacity
          style={{
            borderWidth: 1, borderColor: Colors.border_line,
            width: 25, height: 25
          }}
          onPress={() => {
            // var cart_list = this.state.cart_list;
            // cart_list[index].qty -= 1;
            // this.setState({
            //   cart_list,
            //   flatListRentalTrigger: !this.state.flatListRentalTrigger
            // });
            this.handleItemQtyUpdate("sub", index, 1);
          }}
        // disabled={this.state.cart_list[index].qty <= 1 ? true : false}
        >
          <Label
            text={`-`}
            style={{
              fontSize: Fonts.size.input,
              color: Colors.primary,
              textAlign: 'center'
            }}
          />
        </TouchableOpacity> */}
        <Button
          title="__"
          type="clear"
          onPress={() => {
            this.handleItemQtyUpdate("sub", index, 1);
          }}
          containerStyle={tailwind("border-2 border-primary mx-1 h-12 w-12 justify-center rounded-lg opacity-100")}
          buttonStyle={tailwind("border-red-600 ")}
          titleStyle={tailwind("text-black font-bold text-lg")}
        />

        <TextInput
          onEndEditing={(value) => {
            // var cart_list = this.state.cart_list;
            // cart_list[index].qty = value;
            // this.setState({
            //   cart_list,
            //   flatListRentalTrigger: !this.state.flatListRentalTrigger
            // });
            this.handleItemQtyUpdate("edit", index, value.nativeEvent.text);
          }}
          defaultValue={`${item.qty}`}
          keyboardType={'number-pad'}
          // style={{
          //   fontSize: Fonts.size.regular,
          //   color: Colors.primary,
          //   textAlign: 'center',
          //   width: 80,
          //   paddingHorizontal: Metrics.basePadding,
          //   borderWidth: 1, borderColor: Colors.border_line
          // }}
          style={tailwind("text-2xl text-black text-center h-12 w-16 ")}
        />
        <Button
          title="+"
          type="clear"
          onPress={() => {
            this.handleItemQtyUpdate("add", index, 1);
          }}
          containerStyle={tailwind("border-2 border-black mx-1 h-12 w-12 justify-center rounded-lg opacity-100")}
          buttonStyle={tailwind("border-red-600 border-black border-transparent")}
          titleStyle={tailwind("text-black font-bold text-2xl ")}
        />

        {/* <TouchableOpacity
          style={{
            borderWidth: 1, borderColor: Colors.border_line,
            width: 25, height: 25
          }}
          onPress={() => {
            // var cart_list = this.state.cart_list;
            // cart_list[index].qty += 1;
            // this.setState({
            //   cart_list,
            //   flatListRentalTrigger: !this.state.flatListRentalTrigger
            // });
            this.handleItemQtyUpdate("add", index, 1);
          }}
        >
          <Label
            text={`+`}
            style={{
              fontSize: Fonts.size.input,
              color: Colors.primary,
              textAlign: 'center'
            }}
          />
        </TouchableOpacity> */}
      </View>
    )
  }

  handleRenderCartItemProdTotalAmountContainer(item, index) {
    var total_amount = parseFloat(item.prod_price) * item.qty;
    return (
      <View 
      // style={{ marginVertical: Metrics.smallMargin }}
      style={tailwind("mt-3")}
      >
        <Label
          text={`Total Amount: ${this.state.currency_symbol} ${total_amount.toFixed(2)}`}
          style={{
            fontSize: Fonts.size.regular,
            fontWeight: 'bold',
            color: Colors.primary,
          }}
        />
      </View>
    )
  }

  handleRenderCartItemDeleteButton(item, index) {
    return (
      <Animated.View style={{
        backgroundColor: Colors.button_red,
        position: 'absolute',
        right: 0, top: 0, bottom: 0,
        transform: [{ translateX: this.state.deleteButtonTranslateX }]
      }}>
        <TouchableOpacity
          onPress={() => {
            this.handleRemoveItemFromCart(index);
          }}
          style={{
            ...ApplicationStyles.screen.test,
            height: '100%', width: '100%',
            justifyContent: 'center',
            paddingHorizontal: Metrics.smallPadding,
          }}
        >
          <Label
            text={`Delete`}
            style={{
              fontSize: Fonts.size.input,
              fontWeight: 'bold',
              color: Colors.text_color_3
            }}
          />
        </TouchableOpacity>
      </Animated.View>
    )
  }

  handleRenderCheckoutButtonContainer() {
    return (
      <View style={{
        position: 'absolute',
        bottom: 0, right: 0, left: 0,
        backgroundColor: Colors.body,
        borderTopWidth: 1, borderColor: Colors.border_line,
        paddingVertical: Metrics.basePadding,
        paddingHorizontal: Metrics.smallMargin
      }}>
        {/* Sub Total */}
        <View style={{
          flexDirection: 'row',
          paddingVertical: Metrics.basePadding,
          justifyContent: 'center'
        }}>
          <Label
            text={`Sub Total: `}
            style={{
              fontSize: Fonts.size.input,
              color: Colors.primary
            }}
          />

          <Label
            text={`${this.state.currency_symbol} ${this.state.cart_list.reduce((total, currentValue, index, arr) => {
              return total + (currentValue.qty * currentValue.prod_price);
            }, 0).toFixed(2)}`}
            style={{
              fontSize: Fonts.size.input,
              fontWeight: 'bold',
              color: Colors.primary,
            }}
          />
        </View>

        {/* Checkout Button */}
        <AppsButton
          text={`Checkout`}
          backgroundColor={Colors.primary}
          fontSize={Fonts.size.h6}
          onPress={() => {
            this.props.navigation.replace("EComCheckoutScreen");
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