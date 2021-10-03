/** REACT NATIVE **/
import React from 'react';
import {
  Alert,
  Dimensions,
  Image, ImageBackground,
  Linking,
  PixelRatio,
  RefreshControl,
  SafeAreaView, ScrollView,
  Text, TouchableOpacity,
  View,
} from 'react-native';

/** PROJECT FILES **/
import { 
  ApplicationStyles, Colors, Metrics, Fonts, Images,
  AdsBanner, AppsButton, Divider, LoadingIndicator, Label, FadeInAnimation, SpringAnimation,
  I18n,
  AppConfig, 
  WorldTimeAPICommunicator 
} from '../../../Services/LibLinking';
import CouponContainer from '../Styles/CouponStyles';
import CouponController from '../Actions/CouponControllers';
import LoginController from '../../General/Login/Actions/login_controller';

/** NPM LIBRARIES */
import { NavigationActions, DrawerActions } from 'react-navigation';
import { FlatList } from 'react-native-gesture-handler';
import moment from 'moment';

const ads_banner_path = AppConfig.ads_banner_voucher_scn_path;
const ads_screen_id = AppConfig.ads_voucher_screen_id;

// Get Font Scale from device
const pixelRatio = PixelRatio.get();

export default class CouponView extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      screenWidth: Dimensions.get('window').width,
      screenHeight: Dimensions.get('window').height,

      // Fetch data from server indiacator
      fetch_data: false,
      firstLoad: true,

      nric: '',
      loginUpdate: true,

      // Member data
      member_data: {
        mobile_registered_time: '',
        address: '', 
        postcode: '', 
        state: '', 
        phone: '', 
        gender: '', 
        dob: ''
      },
      
      // FlatList
      datalist: [],
      flatListRentalTrigger: false,

      // Coupon Redemption 
      selectedBarcode: '',

      // World Time
      worldDateTime: moment().format('YYYY-MM-DD HH:mm:ss'),
    }
    
    // Create controller object
    this.couponController = new CouponController();
    this.loginController = new LoginController();
  }

  /****************************************************************/
  /************************ HEADER ********************************/
  /****************************************************************/

  // Navigation Tab
  static navigationOptions = ({navigation, navigationOptions}) => {
    const params = navigation.state.params || {};
    var navigateToScreen = params.this;

    return {
      // title: 'Coupon',
      headerTitle: (
        <View style={CouponContainer.headerButtonContainer}>
          <TouchableOpacity style={{paddingVertical: Metrics.smallPadding, backgroundColor: Colors.secondary}}>
            <Label 
              style={{
                paddingHorizontal: Metrics.basePadding, 
                color: Colors.primary, 
                fontWeight: '600', 
                fontSize: Fonts.size.medium
              }}>
              COUPON
            </Label>
          </TouchableOpacity>
          <View style={{alignItems: 'center'}}>
            <Divider lineColor={Colors.secondary} lineWidth={2} type={'vertical'}/>
          </View>
          <TouchableOpacity style={{paddingVertical: Metrics.smallPadding}} onPress={() => navigation.navigate('VoucherScreen', {loginUpdate: true})}>
            <Label 
              style={{
                paddingHorizontal: Metrics.basePadding, 
                color: Colors.secondary, 
                fontSize: Fonts.size.medium
              }}>
              VOUCHER
            </Label>
          </TouchableOpacity>
        </View>
      ),
      headerLeft: (
        <TouchableOpacity style={{paddingLeft: 10}} onPress={() => navigateToScreen(navigation, {loginUpdate: true})}>
          <Image
            style={{width: Metrics.icons.medium, height: Metrics.icons.medium, tintColor: Colors.secondary}} 
            source={Images.menu}/>
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
    this.props.navigation.setParams({this: this.navigateToScreen});
  }

  componentWillUnmount() {
  }

  componentDidUpdate(prevProps){
    // Login Update
    var loginUpdate = this.props.navigation.getParam('loginUpdate', false);
    if(loginUpdate && this.props.navigation != prevProps.navigation){
      this.props.navigation.setParams({loginUpdate: false});
      this.handleLoginUpdate();
    }

    // Coupon Update
    var coupon_update = this.props.navigation.getParam("coupon_update", false);
    if(coupon_update && this.props.navigation != prevProps.navigation){
      this.props.navigation.setParams({coupon_update: false});
      this.handleGetCouponData();
    }
  }

  handleRefresh = () => {
    this.handleFetchDataIndicator(true);
    this.handleGetCouponData();
  }

  handleFetchDataIndicator(status){
    this.setState({
      fetch_data: status
    })
  }

  // Get real time from World Time API
  async getWorldTimeData(){
    var worldTimeAPICommunicator = new WorldTimeAPICommunicator();
    var worldDateTime = await worldTimeAPICommunicator.GetRealWorldTimeDateTime();
    this.setState({
      worldDateTime: worldDateTime?moment(worldDateTime).format('YYYY-MM-DD HH:mm:ss'):moment().format('YYYY-MM-DD HH:mm:ss')
    });
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
      this.getWorldTimeData();
      this.handleGetCouponData();
    });
  }

  handleGetCouponData(){
    if(this.state.nric){
      this.handleFetchDataIndicator(true);
      var init_result = this.couponController.initScreen();
      init_result.then((res) => {
        if(res.result == 1){
          // Make screen scroll to top
          if(this.scrollView){
            this.scrollView.scrollTo({x: 0, y: 0});
          }

          // Assign the data to datalist
          var coupon_list = res.data && res.data.length > 0 ? res.data : [];
          this.setState({
            datalist: coupon_list,
            member_data: res.member_data,
            flatListRentalTrigger: !this.state.flatListRentalTrigger,
          })
        } else {
          Alert.alert(
            res.data.title,
            res.data.msg
          )
        }
        this.handleFetchDataIndicator(false);
      })
    } else {
      this.handleFetchDataIndicator(false);
    }
  }

  handleNavigateToTermConditionScreen(item, registered_validation, member_limit_profile_info_validation, member_profile_info_require_item, register_coupon, register_coupon_valid_from, register_coupon_valid_to){
    this.setState({
      selectedBarcode: item.full_coupon_code
    }, () => {
      this.props.navigation.navigate('CouponTermConditionScreen', {
        coupon_detail: {
          barcode: item.full_coupon_code, 
          value: item.value, 
          discount_by: item.discount_by, 
          member_limit_count: item.member_limit_count, 
          total_used_count: item.total_used_count, 
          valid_from: item.valid_from, 
          valid_to: item.valid_to, 
          time_from: item.time_from, 
          time_to: item.time_to, 
          min_qty: item.min_qty, 
          min_amt: item.min_amt, 
          min_receipt_amt: item.min_receipt_amt, 
          remark: item.remark, 
          limit_sid_list: item.limit_sid_list, 
          dept_desc: item.dept_desc, 
          brand_desc: item.brand_desc, 
          vendor_desc: item.vendor_desc,
          worldDateTime: this.state.worldDateTime,
          member_limit_mobile_day_start: item.member_limit_mobile_day_start,
          member_limit_mobile_day_end: item.member_limit_mobile_day_end,
          member_limit_profile_info: item.member_limit_profile_info,
          registered_validation,
          member_limit_profile_info_validation,
          member_profile_info_require_item,
          register_coupon,
          register_coupon_valid_from,
          register_coupon_valid_to
        }
      })
    })
  }
  
  /****************************************************************/
  /******************** SCREEN RENDERING **************************/
  /****************************************************************/

  // Ads Banner
  handleRenderAdsBanner(){
    return(
      <View style={[ApplicationStyles.screen.headerContainer, {marginBottom: Metrics.smallMargin}]} >
        <AdsBanner 
          dataFolderPath={ads_banner_path}
          screenId={ads_screen_id}
          imgResizeMode={'stretch'}
          height={Metrics.headerContainerHeight}
          arrowSize={0}
          onPress={(data)=>{
            var url = data.image.link;
            if(url && url != "undefined"){
              url = (url.substring(0,8)=="https://" || url.substring(0,7)=="http://")?url:`http://${url}`;
              Linking.openURL(url);
            } else {
              Alert.alert("", I18n.t("alert_banner_empty_weblink"));
            }
          }}
          onRefresh={this.state.fetch_data}
        />
      </View>
    )
  }

  // Access Login Screen
  handleRenderAccessLoginScreen(){
    return(
      <View style={[ApplicationStyles.screen.testContainer,  {alignSelf: 'center'}]}>
        <View style={{width: '100%', justifyContent: 'center', padding: Metrics.basePadding}}>
          <Label style={{marginBottom: Metrics.baseMargin*6}}>Come and join us to get your discount coupons and many more great deals.</Label>
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

  // Render Coupon List
  handleRenderCouponList(){
    return(
      this.state.fetch_data
      ?
      <View/>
      :
      <View>
      {
        (this.state.datalist.length>0)
        ?
        <ScrollView 
          ref={(ref) => this.scrollView = ref}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={this.state.fetch_data}
              onRefresh={this.handleRefresh}
            />
          }> 
          <View style={[ApplicationStyles.screen.mainContainer,{marginBottom: 100}]}> 

            {/* Coupon Header */}
            <View style={[CouponContainer.headerContainer]}>
              <Text style={[Fonts.style.h5, {fontWeight: 'bold', color: Colors.primary}]}>GRAB THIS OFFER, REDEEM NOW</Text>
              <Text style={{color: Colors.primary}}>WHILE IT LAST !!!</Text>
            </View>

            {/* Coupon */}
            <View style={{ width: '100%' }}>
              <FlatList 
                data={this.state.datalist}
                renderItem={this.handleFlatListRenderItem}
                extraData={this.state.flatListRentalTrigger}
              />
            </View>


          </View>
        </ScrollView>
        :
        // Empty Data Screen
        this.handleRenderEmptyDataScreen()
      }
      </View>
    )
  }

  // Empty list Screen
  handleRenderEmptyDataScreen(){
    return(
      <View style={[ApplicationStyles.screen.mainContainer, {justifyContent: 'center', flex: 0, height: '100%', paddingBottom: 250}]}>
        <SpringAnimation>
          <Image
            source={Images.shock}
            resizeMode={'contain'}
            style={{
              // tintColor: 'transparent',
              width: Metrics.images.xxLarge,
              height: Metrics.images.xxLarge,
              marginBottom: Metrics.doubleBaseMargin,
            }}
          />
        </SpringAnimation>
        <Label> . . . . . </Label>
        <Label style={{color: Colors.primary}}>Oops! No coupon have been issued yet.</Label>
      </View>
    )
  }

  // Coupon item
  handleFlatListRenderItem = ({item, index}) => {
    // Condition for member limit profile info validation
    const member_profile_info_require_item = [];
    var member_limit_profile_info_validation = true;
    if(item.member_limit_profile_info.length != 0){
      for(key in item.member_limit_profile_info){
        var key_local = key == "phone_3" ? "phone" : key;
        if(item.member_limit_profile_info[key] == 1 && !this.state.member_data[key_local]){
          member_limit_profile_info_validation = false;
        }
        member_profile_info_require_item.push(key_local.charAt(0).toUpperCase() + key_local.slice(1));
      }
    }

    // Register Coupon Valid Date Condition
    var register_coupon = item.member_limit_mobile_day_start != 0 && item.member_limit_mobile_day_end != 0;
    var register_coupon_valid_from = moment(this.state.member_data.mobile_registered_time).add(item.member_limit_mobile_day_start-1, 'days').format("YYYY-MM-DD");
    var register_coupon_valid_to = moment(this.state.member_data.mobile_registered_time).add(item.member_limit_mobile_day_end-1, 'days').format("YYYY-MM-DD");

    // Coupon Redeem Status Condition Verification
    const registered_days = moment(this.state.worldDateTime).diff(moment(this.state.member_data.mobile_registered_time), 'days')+1;
    const registered_validation = (registered_days >= item.member_limit_mobile_day_start && registered_days <= item.member_limit_mobile_day_end) || (item.member_limit_mobile_day_start == 0 && item.member_limit_mobile_day_end == 0);
    const member_limit_validation = (item.total_used_count < item.member_limit_count || item.member_limit_count == 0);
    // const coupon_date_validation = (item.valid_from < this.state.worldDateTime && item.valid_to > this.state.worldDateTime);
    var valid_from = `${item.valid_from} ${item.time_from}`;
    var valid_to = `${item.valid_to} ${item.time_to}`;
    const coupon_date_validation = (this.state.worldDateTime >= valid_from && this.state.worldDateTime <= valid_to);
    
    const redeem_status = registered_validation && member_limit_validation && coupon_date_validation && member_limit_profile_info_validation;
    const coupon_primary_color = redeem_status ? Colors.primary : Colors.inactive_primary;
    const coupon_secondary_color = redeem_status ? Colors.secondary: Colors.inactive_secondary;
    
    return (
    /* coupon Display Container */
    <FadeInAnimation index = { index }>
      <TouchableOpacity  
        onPress={() => {
          this.handleNavigateToTermConditionScreen(
            item, 
            registered_validation, 
            member_limit_profile_info_validation, 
            member_profile_info_require_item,
            register_coupon,
            register_coupon_valid_from,
            register_coupon_valid_to
          );
        }}
        style={[
          CouponContainer.shadow, {
            marginVertical: Metrics.doubleBaseMargin, 
            marginHorizontal: Metrics.baseMargin, 
            backgroundColor: coupon_secondary_color
          }
        ]}
      >
        <View style={{
          height: Metrics.couponHeight, 
          width: '100%', 
          padding: (pixelRatio>1.5)?Metrics.basePadding:Metrics.smallPadding,
        }}>
          
          {/***********************/}
          {/*** COUPON TOP PART ***/}
          {/***********************/}
          {this.handleRenderCouponTopPart(item, registered_validation, member_limit_profile_info_validation, coupon_primary_color, register_coupon, register_coupon_valid_from, register_coupon_valid_to)}
          
          {/**********************/}
          {/* COUPON BOTTOM PART */}
          {/**********************/}

          {/* Discount banner with divider */}
          {this.handleRenderDiscountBannerDivider(coupon_primary_color)}

          {/* Coupon Value */}
          {this.handlerRenderCouponValue(item, coupon_primary_color)}
          
          {/* Coupon Company Logo Background */}
          {this.handleRenderCouponBackgroundCompanyLogo(coupon_primary_color)}
        </View>

      </TouchableOpacity>
    </FadeInAnimation>
		)
  }

  handleRenderCouponTopPart(item, registered_validation, member_limit_profile_info_validation, coupon_primary_color, register_coupon, register_coupon_valid_from, register_coupon_valid_to){
    // Coupon Valid Date
    var valid_from = (item.valid_from && !register_coupon) ? `FROM ${item.valid_from} ${item.time_from}` : register_coupon ? `FROM ${register_coupon_valid_from}` : ``;
    var valid_to = (item.valid_to && !register_coupon) ? `${item.valid_to} ${item.time_to}` : register_coupon ? register_coupon_valid_to : ``;
    var coupon_valid_date = `VALID ${valid_from} TILL ${valid_to}`;
    
    return(
      <View style={{width: '100%', flex: 1}}>
        {/* Coupon Title */}
        <View>
          <Label
            text={`COUPON`}
            type="normal_bold" 
            style={{color: coupon_primary_color, fontSize: Fonts.size.h4}}
          />
        </View>

        {/* Coupon Valid Date */}
        <View>
          <Label
            text={coupon_valid_date}
            type="normal" 
            style={{color: coupon_primary_color, fontSize: Fonts.size.small}}
          />
        </View>

        {/* Divider */}
        <View style={{marginVertical: Metrics.baseMargin, width: '20%'}}>
          <Divider lineWidth={5} lineColor={coupon_primary_color}/>
        </View>

        {/* Coupon Code & Coupon Un-redeem Messages */}
        <View style={{flex: 1, justifyContent: 'space-evenly'}}>
          {/* Coupon Code */}
          <Label
            text={
              item.full_coupon_code ?
              `${item.full_coupon_code.replace(item.full_coupon_code.substring(2,14), "************")}` :
              ``
            }
            type="normal_bold" 
            style={{color: coupon_primary_color, fontSize: Fonts.size.large}}
          />

          {/* Condition in limit usage */}
          {
            (item.member_limit_count)
            ?
            this.handleRenderRedeemConditionText((item.total_used_count == item.member_limit_count)?`- Coupon have reached the limited usage.`:'', "normal", coupon_primary_color)
            :
            <View/>
          }

          {/* Condition in valid date */}
          {
            (`${item.valid_from} ${item.time_from}` > this.state.worldDateTime)
            ?
            this.handleRenderRedeemConditionText(`- Coupon able to use start from ${item.valid_from} ${item.time_from}`, "normal", coupon_primary_color)
            :
            <View/>
          }

          {/* Condition in expired date */}
          {
            (`${item.valid_to} ${item.time_to}` < this.state.worldDateTime)
            ?
            this.handleRenderRedeemConditionText(`- Coupon expired at ${item.valid_to} ${item.time_to}`, "normal", coupon_primary_color)
            :
            <View/>
          }

          {/* Condition in member registered and profile info */}
          {
            (!registered_validation || !member_limit_profile_info_validation)
            ?
            this.handleRenderRedeemConditionText(`- Please complete the requirements and redeem it before expired.`, "normal_bold", Colors.text_negative)
            :
            <View/>
          }
        </View>
      </View>
    )
  }

  handleRenderRedeemConditionText(text, text_type, text_color){
    return(
      <View>
        <Label
          text={`${text}`}
          type={`${text_type}`}
          style={{color: text_color, fontSize: Fonts.size.small}}
        />
      </View>
    )
  }

  handleRenderDiscountBannerDivider(coupon_primary_color){
    return(
      <View style={{marginVertical: Metrics.baseMargin}}>
        <Divider 
          lineColor={coupon_primary_color}
          text={"Discount"}
          textBold={true}
          textColor={coupon_primary_color}
        />
      </View>
    )
  }

  handlerRenderCouponValue(item, coupon_primary_color){
    return(
      <View 
        style={{
          flexDirection: 'row', 
          alignItems: 'center', justifyContent: 'center', 
          borderBottomWidth: 1, borderColor: coupon_primary_color, 
          paddingBottom: Metrics.basePadding
        }}>
        <Label
          text={(item.discount_by == 'amt')?`${AppConfig.prefix_currency}`:''}
          type="normal_bold" 
          style={{color: coupon_primary_color, fontSize: Fonts.size.h1}}
        />
        <Label
          text={`${item.value}${(item.discount_by == 'per')?'%':''}`}
          type="normal_bold" 
          style={{color: coupon_primary_color, fontSize: Fonts.size.h1}}
        />
      </View>
    )
  }

  handleRenderCouponBackgroundCompanyLogo(){
    return(
      <View style={{
        position: 'absolute', 
        left: 0, right: 0, top: 0, bottom: 0,
        zIndex: -2, 
        alignItems: 'center', justifyContent: 'center',
        padding: Metrics.basePadding
      }}>
        <Image 
          source={Images.company_logo} 
          style={{width: '100%', height: Metrics.couponHeight, resizeMode: 'contain', opacity: 0.2}} 
        />
      </View>
    )
  }

  // Loading Indicator
  handleRenderLoadingIndicator(){
    return(
      <LoadingIndicator 
        visible={this.state.fetch_data}
        size={"large"} 
        text={"Fetching data..."}
      />
    )
  }

  render() {
    return (
      /**Start Safe Area**/
      <SafeAreaView style={ApplicationStyles.screen.safeAreaContainer} forceInset={{vertical:'never'}}>
        
        {/* Ads Banner */}
        {this.handleRenderAdsBanner()}
        
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
            // Coupon Display
            this.handleRenderCouponList()
        }

        {/* Loading Animation */}
        {this.handleRenderLoadingIndicator()}
      
      </SafeAreaView>
    )
  }
}