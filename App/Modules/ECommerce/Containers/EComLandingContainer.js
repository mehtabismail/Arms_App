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
  LoadingIndicator, Label,  SpringAnimation, HorizontalScrollAnimation, DiscountLabel, SmallBadge, AppsButton
} from '../../../Services/LibLinking';
import styles from '../Styles/e_com_landing_styles';
import LoginController from '../../General/Login/Actions/login_controller';
import EComLandingController from '../Actions/EComLandingControllers';
import MemberController from '../../Member/Actions/member_controller';
import ServerController from '../../General/ServerConfig/Actions/server_controller';

/** NPM LIBRARIES **/
import { NavigationActions, DrawerActions, SafeAreaView } from 'react-navigation';

const SCREEN_WIDTH = Dimensions.get("screen").width;

export default class EComLandingView extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      screenWidth: Dimensions.get('window').width,
      screenHeight: Dimensions.get('window').height,

      // Member NRIC
      nric: '',

      // Fetch data from server indicator
      fetch_data: false,
      fetch_data_text: 'Fetching data...',
      firstLoad: true,

      // Online Store Module Check
      online_store_access: false,

      // Credits & Points
      credits: 0,
      points: 0,

      // flatList
      categoriesList: [
        // {
        //   category_id: 1,
        //   description: "",
        //   level: 2,
        //   parent_category_id: 0,
        //   changes_row_index: 0,
        //   active: 1,
        // }
      ],
      productList: [],
      flatListRentalTrigger: false,

    }

    // Create controller object
    this.loginController = new LoginController();
    this.eComLandingController = new EComLandingController();
    this.memberController = new MemberController();
    this.serverController = new ServerController();

  }

  /****************************************************************/
  /************************ HEADER ********************************/
  /****************************************************************/

  // Navigation Tab
  static navigationOptions = ({navigation, navigationOptions}) => {
    const params = navigation.state.params || {};
    var navigateToScreen = params.this;
    var online_store_access = params.online_store_access;

    return {
      title: 'Online Store',
      headerLeft: (
        <TouchableOpacity style={{paddingLeft: 10}} onPress={() => navigateToScreen(navigation, {loginUpdate: true})}>
          <Image
            style={{width: Metrics.icons.medium, height: Metrics.icons.medium, tintColor: Colors.secondary}} 
            source={Images.menu}/>
        </TouchableOpacity>
      ),
      headerRight: (
        online_store_access
        ?
        <View style={{flexDirection: 'row'}}>
          <TouchableOpacity 
            style={{paddingRight: 10}}
            onPress={()=>{navigation.navigate("EComSearchAndCategoryScreen")}}
          >
            <Image
              style={{width: Metrics.icons.medium, height: Metrics.icons.medium, tintColor: Colors.secondary}} 
              source={Images.search}/>
          </TouchableOpacity>
          <TouchableOpacity 
            style={{paddingRight: 10}}
            onPress={()=>{navigation.navigate("EComCartScreen", {cartUpdate: true})}}
          >
            <Image
              style={{width: Metrics.icons.medium, height: Metrics.icons.medium, tintColor: Colors.secondary}} 
              source={Images.shopping_cart}/>
            
            <SmallBadge data={`${params.cart_item_count ? params.cart_item_count : ''}`}/>

          </TouchableOpacity>
        </View>
        :
        <View/>
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
    this.props.navigation.setParams({this: this.navigateToScreen});
    this.props.navigation.setParams({online_store_access: false});

    // Update Cart Item Count
    const { navigation } = this.props;
    this.focusListener = navigation.addListener('didFocus', () => {
      this.handleGetCartItemCount();
    });
  }

  componentWillUnmount() {
    this.focusListener.remove();
  }

  componentDidUpdate(prevProps){
    // Login Update
    var loginUpdate = this.props.navigation.getParam('loginUpdate', false);
    if(loginUpdate && this.props.navigation != prevProps.navigation){
      this.props.navigation.setParams({loginUpdate: false});
      this.handleLoginUpdate();
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

  async handleLoginUpdate(){
    var nric = '';
    var login_user = await this.loginController.fetchCurrentLoginMember();
    if(login_user.result == 1 && login_user.data){
      nric = login_user.data.nric;
    }
    this.props.navigation.setParams({loginUpdate: false});
    this.handleSetNRIC(nric);
  }

  handleSetNRIC(nric){
    this.setState({nric, firstLoad: false}, ()=>{
      this.handleOnlineStoreAccessCheck();
    });
  }

  async handleOnlineStoreAccessCheck(){
    this.handleFetchDataIndicator(true, "Module Checking...");
    // Get MarketPlace URL & Access Token
    var sh_url = await this.serverController.GetMarketPlaceURL();
    var sh_access_token = await this.serverController.GetMarketPlaceAccessToken();
    
    if(sh_url && sh_access_token){
      this.initEComGenerateDataUpdate();

      if(this.state.nric){
        this.handleGetMemberPointsAndCredits();
      }
      
      this.setState({online_store_access: true});
      this.props.navigation.setParams({online_store_access: true})
    }
    this.handleFetchDataIndicator(false);
  }

  initEComGenerateDataUpdate(){
    this.handleFetchDataIndicator(true, "Updating data...");
    var init_return = this.eComLandingController.initECommerceLandingScreen();
    init_return.then((res) => {
      
      // Fetch Random 8 Category Data
      var cat_8_result = this.eComLandingController.getRandom8CategoryData();
      cat_8_result.then((res) => {
        // alert(JSON.stringify(res))
        if(res.result == 1){
          if(res.data.length > 0){
            this.setState({
              categoriesList: res.data,
              flatListRentalTrigger: !this.state.flatListRentalTrigger
            });
          } else {
            // No Category List
            // TODO: Hide the category container
          }
        } else {
          // No Category List
          // TODO: Hide the category container
        }
      })

      // Fetch Daily Discover 
      this.handleGetDiscoverProducts();
      this.handleFetchDataIndicator(false);
    })
  }

  handleGetDiscoverProducts(){
    var productList = this.state.productList;
    var start_from = productList.length;
    
    // Fetch Daily Discover 
    var product_result = this.eComLandingController.getDailyDiscoverProducts(start_from);
    product_result.then((res) => {
      // alert(JSON.stringify(res))
      if(res.result == 1){
        if(res.data.length > 0){
          this.setState({
            productList: productList.concat(res.data),
            flatListRentalTrigger: !this.state.flatListRentalTrigger
          });
        }
      }
    })
  }

  handleGetMemberPointsAndCredits(){
    this.memberController.getMemberPointAndCredit()
    .then((res)=>{
      // alert(JSON.stringify(res))
      if(res.result == 1){
        this.setState({
          points: res.data.points
        })
      }
    })
  }

  async handleGetCartItemCount(){
    var cart_item_count = await this.eComLandingController.getCartItemCount();
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

  // Access Login Screen
  handleRenderAccessLoginScreen(){
    return(
      <View style={[ApplicationStyles.screen.testContainer,  {alignSelf: 'center'}]}>
        <View style={{width: '100%', justifyContent: 'center', padding: Metrics.basePadding}}>
          <Label style={{marginBottom: Metrics.baseMargin*6}}>Come and join us to get many more great deals.</Label>
          <AppsButton 
            onPress={() => {this.props.navigation.navigate("LandingScreen", {prev_screen: this.props.navigation.state.routeName})}}
            backgroundColor={Colors.primary}
            text={"LOGIN / REGISTER"}
            fontSize={20}
          />
        </View>
      </View>
    )
  }

  // Render Online Store Not Access
  handleRenderOnlineStoreNotAccessContainer(){
    return(
      <View style={{
        borderColor: Colors.border_line, borderTopWidth: 1, borderBottomWidth: 1,
        paddingVertical: Metrics.basePadding,
        marginTop: Metrics.smallMargin,
        backgroundColor: Colors.body
      }}>
        <Label 
          text={`Online Store Coming Soon.`}
          style={{
            fontSize: Fonts.size.h5,
            color: Colors.primary,
            textAlign: 'center'
          }}
        />
      </View>
    )
  }

  // Render E-Commerce Container
  handleRenderEComContainer(){
    return(
      this.state.fetch_data
      ?
      <View/>
      :
        (this.state.online_store_access)
        ?
        // E-Commerce Display
        <View style={{flex: 1}}>
          <ScrollView 
            contentContainerStyle={{
              paddingBottom: Metrics.mainContainerMargin,
            }}
            onScroll={({nativeEvent}) => {
              if (this.isCloseToBottom(nativeEvent)){
                this.handleGetDiscoverProducts();
              }
            }}
            scrollEventThrottle={400}
          >
            <View>
              {/* Credits and Points */}
              {this.handleRenderCreditsPointsContainer()}

              {/* Categories */}
              {this.handleRenderCategoriesContainer()}

              {/* Title - Daily Discover */}
              {
                this.state.productList.length > 0
                ?
                <View style={[styles.ProductTitleContainer]}>
                  <Label 
                    text={`Daily Discover`} 
                    style={[styles.ProductTitle]} 
                  />
                </View>
                :
                <View/>
              }
              
              {/* Product List */}
              {this.handleRenderProductContainer()}
            </View>
          </ScrollView>

          {/* Bottom Tab - My Purchase History */}
          {this.handleRenderBottomTabNavigationContainer()}
        </View>
        :
        // Online Store Not Access
        this.handleRenderOnlineStoreNotAccessContainer()
    )
  }

  // Render Credit & Points
  handleRenderCreditsPointsContainer(){
    return(
      <View style={{
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: Metrics.smallMargin
      }}>
        
        {/* Credits */}
        <View style={[styles.CreditsPointsContainer, {borderRightWidth: 1}]}>
          <Label 
            text={`${this.state.credits} Credits`}
            style={[styles.CreditsPointsText]}
          />
        </View>
        
        {/* Points */}
        <View style={[styles.CreditsPointsContainer, {borderLeftWidth: 1}]}>
          <Label 
            text={`${this.state.points} Points`}
            style={[styles.CreditsPointsText]}
          />
        </View>

      </View>
    )
  }

  handleRenderCategoriesContainer(){
    return(
      <View style={[styles.CategoriesContainer]}>
        {/* Categories Header */}
        <View style={[styles.CategoriesHeaderContainer]}>
          {/* Title */}
          <Label 
            text={`Categories`}
            style={[styles.CategoriesHeaderTitle]}
          />
          {/* See More */}
          <TouchableOpacity 
            onPress={()=>{this.props.navigation.navigate("EComSearchAndCategoryScreen")}}
          >
            <Label text={`See More >`} style={{fontSize: Fonts.size.medium, color: Colors.primary}} />
          </TouchableOpacity>
        </View>

        {/* Categories Data */}
        <View style={{paddingBottom: Metrics.smallPadding}}>
          <FlatList 
            data={this.state.categoriesList}
            renderItem={this.handleRenderCategoriesItem}
            extraData={this.state.flatListRentalTrigger}
            keyExtractor={(item, index)=>`${index}`}
            numColumns={4}
            columnWrapperStyle={{justifyContent: 'center'}}
            scrollEnabled={false}
          />
        </View>

      </View>
    )
  }

  // Render Categories Data Item List
  handleRenderCategoriesItem = ({item, index}) => {
    return(
      <TouchableOpacity 
        onPress={()=>{
          this.props.navigation.navigate("EComProductListScreen", {
            search_type: "category",
            search_data: {
              category_id: item.category_id,
              description: item.description,
              level: item.level
            }
          })
        }}
        style={{
          alignItems: 'center',
          width: SCREEN_WIDTH / 4,
          padding: Metrics.smallPadding,
          paddingVertical: Metrics.basePadding
        }}
      >
        <Image 
          source={item.icon}
          style={{
            width: (SCREEN_WIDTH / 4)*0.5, //50, //(SCREEN_WIDTH - ((Metrics.smallPadding*2)*4)) / 4,
            height: (SCREEN_WIDTH / 4)*0.5 //50, //(SCREEN_WIDTH - ((Metrics.smallPadding*2)*4)) / 4
          }}
        />
        <Label 
          text={`${item.description}`}
          numberOfLines={1}
          style={{fontSize: Fonts.size.large, color: Colors.primary, marginTop: Metrics.smallMargin}}
          ellipsizeMode={"tail"}
        />
      </TouchableOpacity>
    )
  }

  handleRenderProductContainer(){
    return(
      <View style={{marginBottom: Metrics.baseMargin}}>
        <FlatList 
          data={this.state.productList}
          renderItem={this.handleRenderProductItem}
          extraData={this.state.flatListRentalTrigger}
          numColumns={2}
          keyExtractor={(item, index)=>`${index}`}
          // onEndReachedThreshold={0.4}
          // onEndReached={()=>{
          //   alert("here")
          // }}
        />
      </View>
    )
  }

  // Render Product Data Item List
  handleRenderProductItem = ({item, index}) => {
    return(
      <TouchableOpacity 
        onPress={()=>{
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
          {marginLeft: Metrics.smallMargin, borderLeftWidth: 1} : 
          {borderRightWidth: 1}
        ]}
      >
        {/* Image */}
        <Image 
          source={item.images[0]}
          style={{
            resizeMode: 'contain',
            width: ((SCREEN_WIDTH - (Metrics.smallMargin * 2)) / 2) * 0.8,
            height: ((SCREEN_WIDTH - (Metrics.smallMargin * 2)) / 2),
            marginBottom: Metrics.smallMargin
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

  handleRenderProductDiscountPercentBadge(item){
    return(
      item.discount_per > 0
      ?
      <DiscountLabel data={`Dis ${item.discount_per}%`}/>
      :
      <View/>
    )
  }

  handleRenderProductSoldOutContainer(item, index){
    return(
      item.quantity == 0
      ?
      <View style={{
        position: 'absolute',
        left: 0, right: 0, top: 0,
        height: ((SCREEN_WIDTH - (Metrics.smallMargin * 2)) / 2) + Metrics.smallMargin*2,
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
      <View/>
    )
  }

  handleRenderBottomTabNavigationContainer(){
    return(
      <View style={{
        position: 'absolute',
        left: 0, right: 0, bottom: 0,
        borderTopWidth: 1, borderColor: Colors.border_line,
        backgroundColor: Colors.body
      }}>
        <TouchableOpacity 
          onPress={()=>{this.props.navigation.navigate("EComPurchaseHistoryScreen")}}
          style={{paddingVertical: Metrics.basePadding}}
        >
          <Label 
            text={`My Purchase`}
            style={{
              color: Colors.primary,
              fontSize: Fonts.size.h6,
              fontWeight: 'bold',
              textAlign: 'center'
            }}
          />
        </TouchableOpacity>
      </View>
    )
  }

  // Scroll View onEndReach Function
  isCloseToBottom = ({layoutMeasurement, contentOffset, contentSize}) => {
    const paddingToBottom = Metrics.mainContainerMargin;
    return layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom;
  };

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
            (!this.state.nric)
            ?
            // Access Login Screen
            this.handleRenderAccessLoginScreen()
            :
            // E-Commerce Display
            this.handleRenderEComContainer()
        }

        {/* Loading Animation */}
        {this.handleRenderLoadingIndicator()}

      </SafeAreaView>
    )
  }
}