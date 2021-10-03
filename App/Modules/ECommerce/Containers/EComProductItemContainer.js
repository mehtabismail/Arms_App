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
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';

/** PROJECT FILES **/
import { 
  Colors, Fonts, Images, Metrics, ApplicationStyles,
  LoadingIndicator, Label, AppsButton, DiscountLabel, Divider, SmallBadge,
} from '../../../Services/LibLinking';
import styles from '../Styles/e_com_prod_item_styles';
import LoginController from '../../General/Login/Actions/login_controller';
import EComProductItemControllers from '../Actions/EComProductItemControllers';

/** NPM LIBRARIES **/
import { NavigationActions, DrawerActions, SafeAreaView } from 'react-navigation';
import { TextInput } from 'react-native-gesture-handler';
import HTML from 'react-native-render-html';

/**
 * TODO: 
 * √ Product Variation Selection
 * √ Add to cart
 */

const SCREEN_WIDTH = Dimensions.get("screen").width;
const SCREEN_HEIGHT = Dimensions.get("screen").height;

// LayoutAnimation Config
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default class EComProductItemView extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      screenWidth: Dimensions.get('window').width,
      screenHeight: Dimensions.get('window').height,

      // Fetch data from server indicator
      fetch_data: false,
      fetch_data_text: 'Fetching data...',
      firstLoad: true,

      // Product 
      product_data: {
        // Sample Data
        // product_sku_id: '',
        // product_name: '',
        // sku_id: '',
        // brand: '',
        // weight: '',
        // category_id: '',
        // category_tree: '',
        // description: '',
        // changes_row_index: '',
        // last_stock_changed: '',
        // images: [],
        // quantity: '',
        // default_selling_price: '',
        // discounted_price: '',
        // discount_amt: '',
        // discount_amt_type: '',
        // promotion_from: '',
        // promotion_to: '',
        // qty_sold_this_month: ''
      },

      // Product Variation Modal
      is_pv_modal_show: false,

      // Product Variation Test
      prod_variation_selected: -1,
      prod_variation_label: "Size",
      prod_variation_list: [
        {key: "1", data: "128goawk"},
        {key: "2", data: "128gdadawdawdawd"},
        {key: "3", data: "128g"},
        {key: "4", data: "128g"},
        {key: "5", data: "128g"},
      ],

      // Product Quantity
      add_to_cart_qty: 1,

      // Keyboard Show Screen Translate
      modalTranslateY: new Animated.Value(0), //0,

      // Current Product Image Index
      cur_prodImg_index: 0,

    }

    // Create controller object
    this.loginController = new LoginController();
    this.eComProductItemControllers = new EComProductItemControllers();
  }

  /****************************************************************/
  /************************ HEADER ********************************/
  /****************************************************************/

  // Navigation Tab
  static navigationOptions = ({navigation, navigationOptions}) => {
    const params = navigation.state.params || {};
    var navigateToScreen = params.this;

    return {
      title: '',
      headerLeft: (
        <View style={{flexDirection: 'row'}}>
          {/* Back Button */}
          <TouchableOpacity 
            style={{
              padding: Metrics.smallPadding, 
              marginLeft: Metrics.basePadding,
              backgroundColor: Colors.primary,
              borderRadius: 30, borderWidth: 0.5, borderColor: Colors.secondary,
              opacity: 0.9
            }} 
            onPress={() => navigation.goBack()}>
            <Image
              style={{
                width: Metrics.icons.medium, height: Metrics.icons.medium, 
                tintColor: Colors.secondary
              }} 
              source={Images.arrowLeft}/>
          </TouchableOpacity>

          {/* Cart Button */}
          <TouchableOpacity 
            style={{
              padding: Metrics.smallPadding + 5, 
              marginLeft: Metrics.basePadding,
              backgroundColor: Colors.primary,
              borderRadius: 30, borderWidth: 0.5, borderColor: Colors.secondary,
              opacity: 0.9
            }} 
            onPress={() => navigation.navigate("EComCartScreen", {cartUpdate: true})}>
            <Image
              style={{
                width: Metrics.icons.small, height: Metrics.icons.small, 
                tintColor: Colors.secondary
              }} 
              source={Images.shopping_cart}/>
            
            <SmallBadge 
              data={`${params.cart_item_count ? params.cart_item_count : ''}`}
              positionTop={2}
            />
          </TouchableOpacity>
        </View>
        
      ),
      // headerRight: (
      //   <View>
      //     {/* Cart Button */}
      //     <TouchableOpacity 
      //       style={{
      //         padding: Metrics.smallPadding + 5, 
      //         marginRight: Metrics.basePadding,
      //         backgroundColor: Colors.primary,
      //         borderRadius: 30, borderWidth: 0.5, borderColor: Colors.secondary,
      //         opacity: 0.9
      //       }} 
      //       onPress={() => navigation.navigate("EComCartScreen")}>
      //       <Image
      //         style={{
      //           width: Metrics.icons.small, height: Metrics.icons.small, 
      //           tintColor: Colors.secondary
      //         }} 
      //         source={Images.shopping_cart}/>
      //     </TouchableOpacity>
      //   </View>
      // ),
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

  componentDidMount(){
    // this.props.navigation.setParams({this: this.navigateToScreen});
    var product_data = this.props.navigation.getParam("product_data", {});
    this.setState({
      firstLoad: false,
      product_data,
      flatListRentalTrigger: !this.state.flatListRentalTrigger
    });

    this.keyboardDidShowListener = Keyboard.addListener('keyboardWillShow', this.keyboardDidShow.bind(this));
    this.keyboardDidHideListener = Keyboard.addListener('keyboardWillHide', this.keyboardDidHide.bind(this));

    // Update Cart Item Count
    const { navigation } = this.props;
    this.focusListener = navigation.addListener('didFocus', () => {
      this.handleGetCartItemCount();
    });
  }

  componentWillUnmount(){
    this.keyboardDidShowListener.remove();
    this.keyboardDidHideListener.remove();
    this.focusListener.remove();
  }

  componentDidUpdate(prevProps){
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

  keyboardDidShow(e){
    // alert(JSON.stringify(e.endCoordinates));
    // e.endCoordinates.screenY
    // e.endCoordinates.height
    // alert(JSON.stringify(e));
    // LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
    // this.setState({
    //   modalTranslateY: 0 - e.endCoordinates.height
    // })

    Animated.timing(this.state.modalTranslateY,{
      toValue : 0 - e.endCoordinates.height,
      duration : e.duration
    }).start();
  }
  
  keyboardDidHide(e){
    // this.setState({
    //   modalTranslateY: 0,
    // })

    Animated.timing(this.state.modalTranslateY,{
      toValue : 0,
      duration : e.duration
    }).start();
  }  

  addItemToCart(){
    this.handleFetchDataIndicator(true, "Adding to cart...");
    var product_data = {
      product_sku_id: this.state.product_data.product_sku_id,
      quantity: this.state.add_to_cart_qty,
    };

    var return_result = this.eComProductItemControllers.addItemToCart(product_data);
    return_result.then((res) => {
      // alert(JSON.stringify(res));
      if(res.result == 1){
        Alert.alert("Added", "Item Added To Cart.");
      } else {
        Alert.alert("Oops..", res.data.msg);
      }
      // Update cart item count
      this.handleGetCartItemCount();
      this.handleFetchDataIndicator(false);
    })
  }

  async handleGetCartItemCount(){
    var cart_item_count = await this.eComProductItemControllers.getCartItemCount();
    this.props.navigation.setParams({cart_item_count});
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

  // Render Product
  handleRenderProductContainer(){
    return(
      this.state.fetch_data
      ?
      <View/>
      :
      <View style={{flex: 1}}>
        
        <ScrollView contentContainerStyle={{
          paddingBottom: Metrics.mainContainerMargin
        }}>

          {/* Product Image, Desc & Price */}
          {this.handleRenderProdImgDescPriceContainer()}

          {/* Product Variation */}
          {/* NOTE: Temp disabled due to product data from server cannot support */}
          {/* {this.handleRenderProdVariationContainer()} */}

          {/* Product Details */}
          {this.handleRenderProdDescContainer()}

        </ScrollView>

        {/* Add To Cart Button */}
        {this.handleRenderAddToCartButtonContainer()}

        {/* Prod Variation Modal */}
        {this.handleRenderProdVariationModal()}
      </View>
    )
  }

  handleRenderProdImgDescPriceContainer(){
    return(
      <View style={[styles.ProdImgDescPriceContainer]}>

        <View style={{
          paddingVertical: Metrics.basePadding
        }}>
          {/* Product Images List */}
          <FlatList 
            data={this.state.product_data.images}
            keyExtractor={(item, index)=>`${index}`}
            renderItem={this.handleRenderProdImageItem}
            extraData={this.state.flatListRentalTrigger}
            horizontal={true}
            disableIntervalMomentum={true}
            pagingEnabled={true}
            showsHorizontalScrollIndicator={false}
          />
        </View>

        {/* Product Desc */}
        <View style={[styles.ProdDescPriceContainer]}>
          <Label 
            text={`${this.state.product_data.product_name}`} 
            style={[styles.ProdDescPriceText, {
              marginRight: 80
            }]}
          />

          {/* Product Discount Badge */}
          {this.handleRenderProductDiscountPercentBadge(this.state.product_data.discount_per)}
        </View>

        {/* Product Price */}
        <View style={[styles.ProdDescPriceContainer]}>
          <Label 
            text={`${this.state.product_data.currency_symbol} ${parseFloat(this.state.product_data.discount_amt) > 0 ? 
                                                                  this.state.product_data.discounted_price : 
                                                                  this.state.product_data.default_selling_price}`}
            style={[styles.ProdDescPriceText, {fontWeight: 'bold'}]}
          />

          {/* If product discounted show Original Price */}
          {
            parseFloat(this.state.product_data.discount_amt)
            ?
            <Label 
              text={`${this.state.product_data.currency_symbol} ${this.state.product_data.default_selling_price}`} 
              style={[styles.ProdDescPriceOriginalText, {}]}
            />
            :
            <View/>
          }
        </View>

      </View>
    )
  }

  handleRenderProdImageItem = ({item, index}) => {
    return(
      <View>
        <Image 
          source={item}
          style={{
            resizeMode: 'contain',
            width: SCREEN_WIDTH,
            height: SCREEN_WIDTH,
          }}
        />

        {/* Total Images Indicator */}
        <View style={[styles.TotalProdImageIndicatorContainer]}>
          <Label 
            text={`${index + 1} / ${this.state.product_data.images.length}`}
            style={{
              textAlign: 'center', fontSize: Fonts.size.medium,
              color: '#FFFFFF',
            }}
          />
        </View>
      </View>
    )
  }

  handleRenderProductDiscountPercentBadge(discount_per){
    return(
      discount_per > 0
      ?
      <DiscountLabel data={`Dis ${discount_per}%`}/>
      :
      <View/>
    )
  }

  handleRenderProdVariationContainer(){
    return(
      <TouchableOpacity 
        style={{
          backgroundColor: Colors.body,
          borderColor: Colors.border_line, borderTopWidth: 1, borderBottomWidth: 1,
          marginTop: Metrics.smallMargin,
          paddingHorizontal: Metrics.smallPadding,
          paddingVertical: Metrics.basePadding,
          flexDirection: 'row',
          justifyContent: 'space-between'
        }}
        onPress={()=>{this.setState({is_pv_modal_show: true})}}
      >
        <Label 
          text={`Select Variation`}
          style={{
            color: Colors.primary,
            fontSize: Fonts.size.h6,
            fontWeight: 'bold',
          }}
        />
        <Label 
          text={`>`}
          style={{
            color: Colors.primary,
            fontSize: Fonts.size.h6,
            fontWeight: 'bold',
          }}
        />
      </TouchableOpacity>
    )
  }

  handleRenderProdDescContainer(){
    return(
      <View style={{
        backgroundColor: Colors.body,
        borderColor: Colors.border_line, borderTopWidth: 1, borderBottomWidth: 1,
        marginTop: Metrics.smallMargin,
        paddingHorizontal: Metrics.smallPadding,
        paddingVertical: Metrics.basePadding,
        flex: 1
      }}>
        {/* Product Details - Label */}
        <Label 
          text={`Product Details`}
          style={{
            color: Colors.primary,
            fontSize: Fonts.size.h6,
            fontWeight: 'bold',
            marginBottom: Metrics.baseMargin
          }}
        />

        {/* Product Details - Data */}
        <View>
          
          {/* Stock */}
          {this.handleRenderProdDescItemContainer("Stock", this.state.product_data.quantity)}

          {/* Brand */}
          {this.handleRenderProdDescItemContainer("Brand", this.state.product_data.brand)}

          {/* Categories Tree */}
          {this.handleRenderProdDescItemContainer("Category", this.state.product_data.category_tree)}

          {/* Weight */}
          {this.handleRenderProdDescItemContainer("Weight", this.state.product_data.weight)}

          {/* Description */}
          {this.handleRenderProdDescWebViewContainer("Description", this.state.product_data.description)}

        </View>

      </View>
    )
  }

  handleRenderProdDescItemContainer(label, data){
    return(
      <View style={{
        flexDirection: 'row',
        width: '100%',
        marginVertical: Metrics.smallMargin,
      }}>
        <Label 
          text={`${label}`} 
          style={{
            width: '30%',
            color: Colors.primary,
            fontSize: Fonts.size.medium + 1,
          }}
        />
        <Label 
          text={`${data}`} 
          style={{
            width: '70%',
            paddingLeft: Metrics.smallPadding,
            color: Colors.primary,
            fontSize: Fonts.size.medium + 1,
          }}
        />
      </View>
    )
  }

  handleRenderProdDescWebViewContainer(label, data){
    return(
      <View style={{
        width: '100%',
        marginVertical: Metrics.smallMargin,
        marginTop: Metrics.baseMargin,
      }}>
        <Divider 
          lineColor={Colors.primary} 
          lineWidth={1} 
          opacity={0.7} 
        />

        <Label 
          text={`${label}`} 
          style={{
            width: '30%',
            color: Colors.primary,
            fontSize: Fonts.size.medium + 1,
            fontWeight: 'bold',
            marginTop: Metrics.baseMargin
          }}
        />
        {/* <Label 
          text={`${data}`} 
          style={{
            width: '70%',
            paddingLeft: Metrics.smallPadding,
            color: Colors.primary,
            fontSize: Fonts.size.medium + 1,
          }}
        /> */}

        <HTML 
          html={`${data ? data : `<p>---</p>`}`}
          baseFontStyle={{
            color: Colors.primary
          }}
          // style={{...ApplicationStyles.screen.test}}
        />
      </View>
    )
  }

  handleRenderAddToCartButtonContainer(){
    var qty_available = this.state.product_data.quantity;
    return(
      <View style={{
        position: 'absolute',
        bottom: 10, right: 5, left: 10
      }}>
        <AppsButton 
          disabled={qty_available ? false : true}
          text={qty_available ? `Add To Cart` : `Sold Out`} 
          backgroundColor={qty_available ? Colors.primary : Colors.inactive_primary}
          fontSize={Fonts.size.h6}
          onPress={()=>{
            this.addItemToCart();
          }}
        />
      </View>
    )
  }

  // Prod Variation Modal
  handleRenderProdVariationModal(){
    return(
      <View>
        <Modal
          animationType="slide"
          transparent={true}
          visible={this.state.is_pv_modal_show}
        >
          {/* Dark Background */}
          <Animated.View style={[
            styles.PVModalDarkBackgroundContainer, {
              transform: [{translateY: this.state.modalTranslateY}]
            }
          ]}>
            {/* Product Content */}
            <View style={{
              maxHeight: SCREEN_HEIGHT * 0.8,
              backgroundColor: Colors.body
            }}>

              {/* Prod Image, Price & Stock */}
              {/* {this.handleRenderPVModalProdHeader()} */}

              <ScrollView 
                onScroll={()=>{Keyboard.dismiss();}}
              > 
                {/* Prod Image, Price & Stock */}
                {this.handleRenderPVModalProdHeader()}

                {/* Prod Variation */}
                {this.handleRenderPVModalItemContainer("Size", this.state.prod_variation_list)}

                {/* Prod Variation */}
                {this.handleRenderPVModalItemContainer("Size", this.state.prod_variation_list)}

                {/* Prod Quantity */}
                {this.handleRenderPVModalProdQuantity()}

                {/* Add To Cart Button */}
                <View style={{
                  paddingHorizontal: Metrics.smallPadding,
                  paddingVertical: Metrics.basePadding,
                }}>
                  <AppsButton 
                    text={`Add To Cart`} 
                    backgroundColor={Colors.primary}
                    fontSize={Fonts.size.h6}
                  />
                </View>

              </ScrollView>

              {/* Close Modal Button */}
              {this.handleRenderClosePVModalButton()}

            </View>
          </Animated.View>
        </Modal>
      </View>
    )
  }

  handleRenderClosePVModalButton(){
    return(
      <TouchableOpacity
        style={{
          position: 'absolute',
          top: 5, right: 5,
        }}
        onPress={()=>{
          this.setState({is_pv_modal_show: false});
        }}
      >
        <Image 
          source={Images.round_cancel}
          style={{
            tintColor: Colors.primary,
            width: 32, height: 32
          }}
        />
      </TouchableOpacity>
    )
  }

  handleRenderPVModalProdHeader(){
    return(
      <View style={{
        width: '100%',
        alignItems: 'flex-end',
        flexDirection: 'row',
        paddingHorizontal: Metrics.smallPadding,
        paddingVertical: Metrics.basePadding,
        borderColor: Colors.border_line, borderBottomWidth: 1
      }}>
        {/* Left - Prod Image*/}
        <View>
          <Image 
            source={this.state.product_data.images[0]}
            style={{
              width: 90, height: 90,
              resizeMode: 'contain',
            }}
          />
        </View>

        {/* Right - Price & Stock */}
        <View style={{
          paddingLeft: Metrics.smallPadding
        }}>
          {/* Price */}
          <Label 
            text={`${this.state.product_data.currency_symbol} ${parseFloat(this.state.product_data.discount_amt) > 0 ? 
                                                                  this.state.product_data.discounted_price : 
                                                                  this.state.product_data.default_selling_price}`}
            style={{
              color: Colors.primary,
              fontSize: Fonts.size.large,
              fontWeight: 'bold'
            }}
          />

          {/* Stock */}
          <Label 
            text={`Stock: ${this.state.product_data.quantity}`}
            style={{
              color: Colors.primary,
              fontSize: Fonts.size.large,
            }}
          />
        </View>
      </View>
    )
  }

  handleRenderPVModalItemContainer(label, prod_variation_data){
    return(
      <View style={{
        paddingVertical: Metrics.smallPadding,
        borderBottomWidth: 1, borderColor: Colors.border_line
      }}>
        {/* Variation Label */}
        <Label 
          text={`${label}`}
          style={{
            fontSize: Fonts.size.input,
            color: Colors.primary,
            marginVertical: Metrics.smallPadding,
            marginHorizontal: Metrics.smallMargin,
          }}
        />
        
        {/* Variation Option */}
        <View style={{ flexWrap: "wrap", flexDirection: 'row' }}>
          {this.handleRenderPVModalSelectionItem(prod_variation_data)}
        </View>
  
      </View>
    )
  }

  handleRenderPVModalSelectionItem(prod_variation_list){
    var data = [];
    for (let index = 0; index < prod_variation_list.length; index++) {
      var item = prod_variation_list[index];
      data.push(
      // return(
        <TouchableOpacity 
          key={`${index}`}
          activeOpacity={9}
          style={{
            backgroundColor: this.state.prod_variation_selected == index ? Colors.primary : Colors.editable_disabled,
            // width: (SCREEN_WIDTH - ((Metrics.smallMargin * 2) * 4)) / 4,
            marginHorizontal: Metrics.smallMargin,
            marginVertical: Metrics.smallMargin,
            paddingHorizontal: Metrics.smallPadding,
            paddingVertical: Metrics.smallPadding
          }}
          onPress={() => {
            this.setState({
              prod_variation_selected: this.state.prod_variation_selected == index ? -1 : index,
              flatListRentalTrigger: !this.state.flatListRentalTrigger
            });
          }}
        >
          <Label
            text={`${item.data}`}
            style={{
              color: this.state.prod_variation_selected == index ? Colors.text_color_3 : Colors.primary,
              fontSize: Fonts.size.large,
              textAlign: 'center'
            }}
          />
        </TouchableOpacity>
      )
    }
    return data;
  }

  handleRenderPVModalProdQuantity(){
    return(
      <View style={{
        paddingVertical: Metrics.basePadding,
        paddingHorizontal: Metrics.smallPadding,
        borderBottomWidth: 1, borderColor: Colors.border_line,
        flexDirection: 'row', 
        justifyContent: 'space-between'
      }}>
        {/* Quantity Label */}
        <Label 
          text={`Quantity`}
          style={{
            fontSize: Fonts.size.input,
            color: Colors.primary
          }}
        />

        {/* Quantity */}
        <View style={{
          flexDirection: 'row'
        }}>
          <TouchableOpacity style={{
            borderWidth: 1, borderColor: Colors.border_line,
            width: 25, height: 25
          }}>
            <Label
              text={`-`}
              style={{
                fontSize: Fonts.size.input,
                color: Colors.primary,
                textAlign: 'center'
              }}
            />
          </TouchableOpacity>

          <TextInput 
            onChangeText={(value)=>{this.setState({add_to_cart_qty: value})}}
            value={`${this.state.add_to_cart_qty}`}
            style={{
              fontSize: Fonts.size.regular,
              color: Colors.primary,
              textAlign: 'center',
              width: 60,
              paddingHorizontal: Metrics.basePadding,
              borderWidth: 1, borderColor: Colors.border_line
            }}
          />

          <TouchableOpacity style={{
            borderWidth: 1, borderColor: Colors.border_line,
            width: 25, height: 25
          }}>
            <Label
              text={`+`}
              style={{
                fontSize: Fonts.size.input,
                color: Colors.primary,
                textAlign: 'center'
              }}
            />
          </TouchableOpacity>
        </View>
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
            // Product Details
            this.handleRenderProductContainer()
        }
        
        {/* Loading Animation */}
        {this.handleRenderLoadingIndicator()}

      </SafeAreaView>
    )
  }
}