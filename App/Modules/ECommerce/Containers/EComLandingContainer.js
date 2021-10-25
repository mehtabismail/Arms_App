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

/** REACT NATIVE ELEMENTS **/
import { Button, Icon, Text, Card } from 'react-native-elements';

/** TAILWIND CSS **/
import { tailwind } from '../../../../tailwind';

/** PROJECT FILES **/
import {
  Colors, Fonts, Images, Metrics, ApplicationStyles,
  LoadingIndicator, Label, SpringAnimation, HorizontalScrollAnimation, DiscountLabel, SmallBadge, AppsButton
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
  constructor(props) {
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
  static navigationOptions = ({ navigation, navigationOptions }) => {
    const params = navigation.state.params || {};
    var navigateToScreen = params.this;
    var online_store_access = params.online_store_access;

    return {
      title: 'Online Store',
      headerLeft: (
        <TouchableOpacity style={{ paddingLeft: 10 }} onPress={() => navigateToScreen(navigation, { loginUpdate: true })}>
          <Image
            style={{ width: Metrics.icons.medium, height: Metrics.icons.medium, tintColor: Colors.secondary }}
            source={Images.menu} />
        </TouchableOpacity>
      ),
      headerRight: (
        online_store_access
          ?
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity
              style={{ paddingRight: 10 }}
              onPress={() => { navigation.navigate("EComSearchAndCategoryScreen") }}
            >
              <Image
                style={{ width: Metrics.icons.medium, height: Metrics.icons.medium, tintColor: Colors.secondary }}
                source={Images.search} />
            </TouchableOpacity>
            <TouchableOpacity
              style={{ paddingRight: 10 }}
              onPress={() => { navigation.navigate("EComCartScreen", { cartUpdate: true }) }}
            >
              <Image
                style={{ width: Metrics.icons.medium, height: Metrics.icons.medium, tintColor: Colors.secondary }}
                source={Images.shopping_cart} />

              <SmallBadge data={`${params.cart_item_count ? params.cart_item_count : ''}`} />

            </TouchableOpacity>
          </View>
          :
          <View />
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
    this.props.navigation.setParams({ online_store_access: false });

    // Update Cart Item Count
    const { navigation } = this.props;
    this.focusListener = navigation.addListener('didFocus', () => {
      this.handleGetCartItemCount();
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
      fetch_data: status,
      fetch_data_text: text ? text : 'Fetching data...'
    })
  }

  /****************************************************************/
  /******************** FUNCTIONALITY *****************************/
  /****************************************************************/

  async handleLoginUpdate() {
    var nric = '';
    var login_user = await this.loginController.fetchCurrentLoginMember();
    if (login_user.result == 1 && login_user.data) {
      nric = login_user.data.nric;
    }
    this.props.navigation.setParams({ loginUpdate: false });
    this.handleSetNRIC(nric);
  }

  handleSetNRIC(nric) {
    this.setState({ nric, firstLoad: false }, () => {
      this.handleOnlineStoreAccessCheck();
    });
  }

  async handleOnlineStoreAccessCheck() {
    this.handleFetchDataIndicator(true, "Module Checking...");
    // Get MarketPlace URL & Access Token
    var sh_url = await this.serverController.GetMarketPlaceURL();
    var sh_access_token = await this.serverController.GetMarketPlaceAccessToken();

    if (sh_url && sh_access_token) {
      this.initEComGenerateDataUpdate();

      if (this.state.nric) {
        this.handleGetMemberPointsAndCredits();
      }

      this.setState({ online_store_access: true });
      this.props.navigation.setParams({ online_store_access: true })
    }
    this.handleFetchDataIndicator(false);
  }

  initEComGenerateDataUpdate() {
    this.handleFetchDataIndicator(true, "Updating data...");
    var init_return = this.eComLandingController.initECommerceLandingScreen();
    init_return.then((res) => {

      // Fetch Random 8 Category Data
      var cat_8_result = this.eComLandingController.getRandom8CategoryData();
      cat_8_result.then((res) => {
        // alert(JSON.stringify(res))
        if (res.result == 1) {
          if (res.data.length > 0) {
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

  handleGetDiscoverProducts() {
    var productList = this.state.productList;
    var start_from = productList.length;

    // Fetch Daily Discover 
    var product_result = this.eComLandingController.getDailyDiscoverProducts(start_from);
    product_result.then((res) => {
      // alert(JSON.stringify(res))
      if (res.result == 1) {
        if (res.data.length > 0) {
          this.setState({
            productList: productList.concat(res.data),
            flatListRentalTrigger: !this.state.flatListRentalTrigger
          });
        }
      }
    })
  }

  handleGetMemberPointsAndCredits() {
    this.memberController.getMemberPointAndCredit()
      .then((res) => {
        // alert(JSON.stringify(res))
        if (res.result == 1) {
          this.setState({
            points: res.data.points
          })
        }
      })
  }

  async handleGetCartItemCount() {
    var cart_item_count = await this.eComLandingController.getCartItemCount();
    this.props.navigation.setParams({ cart_item_count });
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
  handleRenderEComContainer() {
    return (
      this.state.fetch_data
        ?
        <View />
        :
        (this.state.online_store_access)
          ?
          // E-Commerce Display
          <View style={tailwind("flex-1 bg-light")}>
            <ScrollView
              contentContainerStyle={tailwind("pb-32")}
              onScroll={({ nativeEvent }) => {
                if (this.isCloseToBottom(nativeEvent)) {
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
                    <View>
                      <Card containerStyle={tailwind("flex-1 bg-white border rounded-lg justify-center items-center opacity-100")}>
                        <Card.Title style={tailwind("text-xl text-primary font-bold")}>Daily Discover</Card.Title>
                        <Card.Divider />
                        <View style={tailwind("flex-1  w-full justify-center items-center my-3")}>
                          {this.handleRenderProductContainer()}
                        </View>
                      </Card>
                    </View>
                    :
                    <View />
                }

                {/* Product List */}

              </View>
            </ScrollView>
            <View style={{ position: "absolute", bottom: 15, right: 0, left: 0, elevation: 10 }}>
              {/* Bottom Tab - My Purchase History */}
              {this.handleRenderBottomTabNavigationContainer()}
            </View>

          </View>
          :
          // Online Store Not Access
          this.handleRenderOnlineStoreNotAccessContainer()
    )
  }

  // Render Credit & Points
  handleRenderCreditsPointsContainer() {
    return (
      <View style={tailwind("w-full flex-row justify-between")}>
        <View style={{ elevation: 20, width: "50%" }}>
          {/* Credits */}
          <Card containerStyle={tailwind("bg-white border rounded-lg justify-center items-center opacity-100")}>
            <Text style={tailwind("text-xl font-bold text-primary")}>{`${this.state.credits} Credits`}</Text>
          </Card>
        </View>

        <View style={{ elevation: 20, width: "50%" }}>
          {/* Points */}
          <Card containerStyle={tailwind("bg-white border rounded-lg justify-center items-center opacity-100")}>
            {/* <Text style={tailwind("text-xl font-bold text-primary")}>{`${this.state.points} Points`}</Text> */}
            <Label
            text={`${this.state.points} Points`}
            numberOfLines={1}
            style={tailwind("text-xl font-bold text-primary")}
            ellipsizeMode={"tail"}
          />
          </Card>
        </View>

      </View>
    )
  }

  handleRenderCategoriesContainer() {
    return (
      <Card containerStyle={tailwind("border rounded-lg justify-center")}>
        {/* Categories Header */}
        <View style={tailwind("flex-row justify-between mb-3")}>
          <View>
            <Label
              text={`Categories`}
              style={tailwind("text-primary text-xl font-bold")}
            />
          </View>
          <View style={tailwind("justify-center")}>
            <TouchableOpacity
              onPress={() => { this.props.navigation.navigate("EComSearchAndCategoryScreen") }}
            >
              <Label text={`See More >`} style={tailwind("text-primary text-xl font-bold")} />
            </TouchableOpacity>
          </View>
        </View>
        <Card.Divider />
        {/* Categories Data */}
        <View>
          <FlatList
            data={this.state.categoriesList}
            renderItem={this.handleRenderCategoriesItem}
            extraData={this.state.flatListRentalTrigger}
            keyExtractor={(item, index) => `${index}`}
            numColumns={3}
            columnWrapperStyle={{ justifyContent: 'center' }}
            scrollEnabled={false}
            initialNumToRender={5}
          />
        </View>

      </Card>
    )
  }

  // Render Categories Data Item List
  handleRenderCategoriesItem = ({ item, index }) => {
    return (
      <TouchableOpacity
        onPress={() => {
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
            width: (SCREEN_WIDTH / 4) * 0.5, //50, //(SCREEN_WIDTH - ((Metrics.smallPadding*2)*4)) / 4,
            height: (SCREEN_WIDTH / 4) * 0.5 //50, //(SCREEN_WIDTH - ((Metrics.smallPadding*2)*4)) / 4
          }}
        />
        <View style={tailwind("my-1")}>
          <Label
            text={`${item.description}`}
            numberOfLines={1}
            style={tailwind("text-lg text-primaryBlue")}
            ellipsizeMode={"tail"}
          />
        </View>
      </TouchableOpacity>
    )

  }

  handleRenderProductContainer() {
    return (
      <View>
        <FlatList
          data={this.state.productList}
          renderItem={this.handleRenderProductItem}
          extraData={this.state.flatListRentalTrigger}
          numColumns={2}
          keyExtractor={(item, index) => `${index}`}
        // onEndReachedThreshold={0.4}
        // onEndReached={()=>{
        //   alert("here")
        // }}
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
          alignItems: 'center',
        },
        (index % 2) ?
          { marginLeft: Metrics.regularMargin, borderLeftWidth: 0 } :
          { borderRightWidth: 0 }
        ]}
      >
        <View style={{
          width: (SCREEN_WIDTH * 0.4),
          height: (SCREEN_WIDTH * 0.5)
        }}>
          {/* Image */}
          <Image
            source={item.images[0]}
            style={{
              resizeMode: 'contain',
              width: "100%",
              height: "100%"
            }}
          />
        </View>
        <View style={tailwind("my-3")}>
          {/* Product Desc */}
          <Label
            text={`${item.product_name}`}
            numberOfLines={2}
            ellipsizeMode={"tail"}
            style={tailwind("text-lg text-primary font-bold")}
          />
        </View>

        <View>
          {/* Product Price */}
          <Label
            text={`${item.currency_symbol} ${parseFloat(item.discount_amt) > 0 ?
              item.discounted_price :
              item.default_selling_price}`}
            numberOfLines={1}
            ellipsizeMode={"tail"}
            style={tailwind("text-lg text-primaryBlue font-bold")}
          />
        </View>
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

  handleRenderBottomTabNavigationContainer() {
    return (
      <View style={tailwind("self-center w-full")}>
        {/* <Button
          containerStyle={tailwind("mx-5")}
          buttonStyle={tailwind("rounded-lg bg-buttoncolor")}
          icon={
            <Icon
              name="history"
              type="font-awesome"
              color="white"
              containerStyle={tailwind("p-2")}
            />
          }
          title="My Purchase"
          titleStyle={tailwind("text-xl p-2")}
          onPress={() => { this.props.navigation.navigate("EComPurchaseHistoryScreen") }}
        /> */}
        <TouchableOpacity
          onPress={() => { this.props.navigation.navigate("EComPurchaseHistoryScreen") }}
        >
          <Card containerStyle={tailwind("bg-primary border-primary rounded-lg")}>
            <View style={tailwind("flex-row justify-center items-center")}>
              <View style={tailwind("pr-1")}>
                <Icon
                  name="history"
                  type="font-awesome"
                  color="white"
                />
              </View>
              <View style={tailwind("pl-1")}>
                <Text style={tailwind("text-white text-xl font-bold text-center")}>
                  My Purchase
                </Text>
              </View>
            </View>
          </Card>
        </TouchableOpacity>
      </View>
    )
  }

  // Scroll View onEndReach Function
  isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }) => {
    const paddingToBottom = Metrics.mainContainerMargin;
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