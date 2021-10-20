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
  TextInput, TouchableOpacity,
  View,
} from 'react-native';

import { Input, Icon } from 'react-native-elements';
import { tailwind } from '../../../../tailwind';

/** PROJECT FILES **/
import {
  Colors, Fonts, Images, Metrics, ApplicationStyles,
  LoadingIndicator, Label, SpringAnimation, HorizontalScrollAnimation, AppsButton, DiscountLabel
} from '../../../Services/LibLinking';
import styles from '../Styles/e_com_prod_list_styles';
import LoginController from '../../General/Login/Actions/login_controller';
import EComProductListController from '../Actions/EComProductListControllers';

/** NPM LIBRARIES **/
import { NavigationActions, DrawerActions, SafeAreaView } from 'react-navigation';

/**
 * TODO: 
 * √ Add discount percent
 * √ Product list reached bottom, push more data from server
 */

const SCREEN_WIDTH = Dimensions.get("screen").width;

export default class EComProductListView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      screenWidth: Dimensions.get('window').width,
      screenHeight: Dimensions.get('window').height,

      // Fetch data from server indicator
      fetch_data: false,
      fetch_data_text: 'Fetching data...',
      firstLoad: true,

      // FlatList Bottom Refresh Indicator
      getMoreData: true,

      // Search Parameter
      search_type: '',
      search_data: '',

      // Product Data List
      productList: [
        // Sample Data
        // {
        //   product_sku_id: '',
        //   product_name: '',
        //   sku_id: '',
        //   brand: '',
        //   weight: '',
        //   category_id: '',
        //   category_tree: '',
        //   description: '',
        //   changes_row_index: '',
        //   last_stock_changed: '',
        //   images: [],
        //   quantity: '',
        //   default_selling_price: '',
        //   discounted_price: '',
        //   discount_amt: '',
        //   discount_amt_type: '',
        //   promotion_from: '',
        //   promotion_to: '',
        //   qty_sold_this_month: '',
        //   variation: {
        //     tier1: {
        //         variation_name: "Color",
        //         variation_option: "Red"
        //     },
        //     tier2: {
        //         variation_name: "Size",
        //         variation_option: "S"
        //     }
        //   },
        //   active: ''
        // }
      ],
      flatListRentalTrigger: false,

    }

    // Create controller object
    this.loginController = new LoginController();
    this.eComProductListController = new EComProductListController();
  }

  /****************************************************************/
  /************************ HEADER ********************************/
  /****************************************************************/

  // Navigation Tab
  static navigationOptions = ({ navigation, navigationOptions }) => {
    const params = navigation.state.params || {};
    // var navigateToScreen = params.this;
    var search_type = params.search_type;
    var search_data_id = params.search_data.id;
    var search_data_desc = params.search_data.description;
    var search_text = params.search_data.description;

    return {
      headerTitle: (
        <Input
          editable={false}
          placeholder={`Searching...`}
          ref={(input) => this.searchInput = input}
          value={`${search_text}`}
          leftIcon={
            <Icon
              name='search'
              type='font-awesome'
              size={25}
              color="#586bca"
            />
          }
          onChangeText={(value)=>{
            search_text = value;
          }}
          defaultValue={`${search_data_desc}`}
          containerStyle={{
            marginTop: 25,
            width: '95%',
          }}
          inputContainerStyle={tailwind("border px-2 bg-white opacity-100 h-10 w-full self-center rounded-lg")}
          inputStyle={tailwind("text-primaryBlue mt-1")}
          // leftIconContainerStyle={tailwind("p-2")}
        />






        // <View style={{
        //   backgroundColor: Colors.body,
        //   width: SCREEN_WIDTH * 0.6,
        //   flexDirection: 'row', flex: 1,
        // }}>
        //   <Image 
        //     source={Images.search}
        //     style={{
        //       tintColor: Colors.primary,
        //       height: 30, width: 30,
        //     }}
        //   />
        //   <TextInput
        //     editable={false}
        //     placeholder={`Searching...`}
            // onChangeText={(value)=>{
            //   search_text = value;
            //   // params.setParams({search_data: {
            //   //   description: value
            //   // }});
            // }}
        //     defaultValue={`${search_data_desc}`}
        //     value={`${search_text}`}
        //     style={{
        //       color: Colors.primary,
        //       paddingVertical: Metrics.smallPadding,
        //       marginLeft: Metrics.smallPadding,
        //       flex: 1,
        //     }}
        //   />
        // </View>
      ),
      // headerLeft: (
      //   <TouchableOpacity style={{paddingLeft: 10}} onPress={() => navigateToScreen(navigation, {loginUpdate: true})}>
      //     <Image
      //       style={{width: Metrics.icons.medium, height: Metrics.icons.medium, tintColor: Colors.secondary}} 
      //       source={Images.menu}/>
      //   </TouchableOpacity>
      // ),
      // headerRight: (
      //   <View style={{flexDirection: 'row'}}>
      //     <TouchableOpacity 
      //       style={{paddingRight: 10}}
      //       onPress={()=>{navigation.navigate("EComSearchAndCategoryScreen")}}
      //     >
      //       <Image
      //         style={{width: Metrics.icons.medium, height: Metrics.icons.medium, tintColor: Colors.secondary}} 
      //         source={Images.search}/>
      //     </TouchableOpacity>
      //     <TouchableOpacity 
      //       style={{paddingRight: 10}}
      //       onPress={()=>{navigation.navigate("EComCartScreen")}}
      //     >
      //       <Image
      //         style={{width: Metrics.icons.medium, height: Metrics.icons.medium, tintColor: Colors.secondary}} 
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

  componentDidMount() {
    // Set Search Type and Search Data
    var search_type = this.props.navigation.getParam("search_type", "");
    var search_data = this.props.navigation.getParam("search_data", "");
    // alert(JSON.stringify(search_data))
    this.handleInitScreen_GetProductList(search_type, search_data);
  }

  componentWillUnmount() {
  }

  componentDidUpdate(prevProps) {
    // Login Update
    var loginUpdate = this.props.navigation.getParam('loginUpdate', false);
    if (loginUpdate && this.props.navigation != prevProps.navigation) {
      this.props.navigation.setParams({ loginUpdate: false });
      // this.handleLoginUpdate();
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

  handleInitScreen_GetProductList(search_type, search_data) {
    this.handleFetchDataIndicator(true, "Loading...");
    this.setState({
      firstLoad: false,
      search_type,
      search_data
    });
    this.handleGetProductData(search_type, search_data);
  }

  handleGetProductData(search_type, search_data) {
    var productList = this.state.productList;
    var start_from = productList.length;

    var product_result = this.eComProductListController.getProductList(search_type, search_data, start_from);
    product_result.then((res) => {
      // alert(JSON.stringify(res));
      if (res.result == 1) {
        if (res.data.length > 0) {
          this.setState({
            getMoreData: true,
            productList: productList.concat(res.data),
            flatListRentalTrigger: !this.state.flatListRentalTrigger
          })
        }
      }
      this.handleFetchDataIndicator(false);
    });
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

  // Render Main Container
  handleRenderMainContainer() {
    return (
      this.state.fetch_data
        ?
        <View />
        :
        <View>
          <ScrollView
            contentContainerStyle={{
              paddingBottom: Metrics.mainContainerMargin,
            }}
            onScroll={({ nativeEvent }) => {
              if (this.isCloseToBottom(nativeEvent)) {
                if (this.state.getMoreData) {
                  this.setState({ getMoreData: false });
                  this.handleGetProductData(this.state.search_type, this.state.search_data);
                }
              }
            }}
            scrollEventThrottle={400}
          >
            <View>
              {/* Product List */}
              {this.handleRenderProductContainer()}
            </View>
          </ScrollView>
        </View>
    )
  }

  handleRenderProductContainer() {
    return (
      this.state.productList.length > 0
        ?
        <View style={{ marginBottom: Metrics.baseMargin }}>
          <FlatList
            data={this.state.productList}
            renderItem={this.handleRenderProductItem}
            extraData={this.state.flatListRentalTrigger}
            numColumns={2}
            keyExtractor={(item, index) => `${index}`}
          />
        </View>
        :
        <View>
          <Label
            text={`No Product.`}
            style={{
              fontSize: Fonts.size.h5,
              color: Colors.primary,
              textAlign: 'center',
              marginVertical: Metrics.doubleBaseMargin
            }}
          />
        </View>
    )
  }

  // Render Product Data Item List
  handleRenderProductItem = ({ item, index }) => {
    return (
      <TouchableOpacity
        onPress={() => {
          this.props.navigation.navigate("EComProductItemScreen", {
            product_data: item
          })
        }}
        activeOpacity={9}
        style={[{
          width: (SCREEN_WIDTH - Metrics.smallMargin) / 2,
          backgroundColor: Colors.body,
          alignItems: 'center',
          padding: Metrics.smallPadding,
          marginBottom: Metrics.smallMargin,
          borderColor: Colors.border_line, borderTopWidth: 1, borderBottomWidth: 1
        },
        (index % 2) ?
          { marginLeft: Metrics.smallMargin, borderLeftWidth: 1 } :
          { borderRightWidth: 1 }
        ]}
      >
        {/* Image */}
        <Image
          source={item.images[0]}
          style={{
            resizeMode: 'contain',
            width: ((SCREEN_WIDTH - (Metrics.smallMargin * 2)) / 2) * 0.8,
            height: ((SCREEN_WIDTH - (Metrics.smallMargin * 2)) / 2),
            marginBottom: Metrics.smallMargin,
          }}
        />

        {/* Product Desc */}
        <Label
          text={`${item.product_name}`}
          numberOfLines={2}
          ellipsizeMode={"tail"}
          style={{
            width: '100%',
            height: 45,
            color: Colors.primary,
            fontSize: Fonts.size.medium,
            marginBottom: Metrics.smallMargin,
          }}
        />

        {/* Product Price */}
        <Label
          text={`${item.currency_symbol} ${parseFloat(item.discount_amt) > 0 ?
            item.discounted_price :
            item.default_selling_price}`}
          numberOfLines={1}
          ellipsizeMode={"tail"}
          style={{
            width: '100%',
            height: 25,
            color: Colors.primary,
            fontSize: Fonts.size.regular, fontWeight: 'bold',
            marginBottom: Metrics.smallMargin,
          }}
        />

        {/* Product Discount Badge */}
        {this.handleRenderProductDiscountPercentBadge(item)}

        {/* Sold Out Indicator */}
        {this.handleRenderProductSoldOutContainer(item, index)}

      </TouchableOpacity>
    )
  }

  handleRenderProductDiscountPercentBadge(item) {
    return (
      item.discount_per > 0
        ?
        <DiscountLabel data={`Dis ${item.discount_per}%`} />
        :
        <View />
    )
  }

  handleRenderProductSoldOutContainer(item, index) {
    return (
      item.quantity == 0
        ?
        <View style={{
          position: 'absolute',
          left: 0, right: 0, top: 0,
          height: ((SCREEN_WIDTH - (Metrics.smallMargin * 2)) / 2) + Metrics.smallMargin * 2,
          backgroundColor: '#000000', opacity: 0.7,
          justifyContent: 'center'
        }}>
          <Label
            text={`Sold Out`}
            style={{
              fontSize: Fonts.size.h5,
              color: '#FFFFFF',
              textAlign: 'center'
            }}
          />
        </View>
        :
        <View />
    )
  }

  // Scroll View onEndReach Function
  isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }) => {
    const paddingToBottom = Metrics.mainContainerMargin + Metrics.baseMargin;
    return layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom;
  };

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
            // // Main Display
            this.handleRenderMainContainer()
        }

        {/* Loading Animation */}
        {this.handleRenderLoadingIndicator()}

      </SafeAreaView>
    )
  }
}