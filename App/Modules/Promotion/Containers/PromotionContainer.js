/** REACT NATIVE **/
import React from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  Linking,
  RefreshControl,
  SafeAreaView, ScrollView,
  Text, TouchableOpacity,
  View,
} from 'react-native';

/** PROJECT FILES **/
import { 
  ApplicationStyles, Colors, Metrics, Fonts, Images,
  AdsBanner, Divider, LoadingIndicator, Label, FadeInAnimation, SpringAnimation,
  I18n,
  AppConfig,
} from '../../../Services/LibLinking';
import PromotionContainer from '../Styles/PromotionStyles';
import PromotionContainerController from '../Actions/PromotionContainerControllers';
import LoginController from '../../General/Login/Actions/login_controller';

/** NPM LIBRARIES **/
import { NavigationActions, DrawerActions } from 'react-navigation';

const ads_banner_path = AppConfig.ads_banner_promo_scn_path;
const ads_screen_id = AppConfig.ads_promo_screen_id;

export default class PromotionView extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      screenWidth: Dimensions.get('window').width,
      screenHeight: Dimensions.get('window').height,

      // Fetch data from server indiacator
      fetch_data: false,
      check: false,

      // flatList
      datalist: [],
      flatListRentalTrigger: false,

      // Refresh page control
      refreshing: false,

      // User data
      nric: '',

    }

    // Create controller object
    this.promoController = new PromotionContainerController();
    this.loginController = new LoginController();
  }

  /**Navigation Bottom Tab**/
  static navigationOptions = ({navigation, navigationOptions}) => {
    const params = navigation.state.params || {};
    var navigateToScreen = params.this;

    return {
      title: 'Promotion',
      headerLeft: (
        <TouchableOpacity style={{paddingLeft: 10}} onPress={() => navigateToScreen(navigation, {loginUpdate: true})}>
          <Image
            style={{width: Metrics.icons.medium, height: Metrics.icons.medium, tintColor: Colors.secondary}} 
            source={Images.menu}/>
        </TouchableOpacity>
      ),
      headerRight: (
        <View style={{width: Metrics.icons.medium, height: Metrics.icons.medium, paddingRight: 10}}></View>
      ),
    };
  };
  /**End Navigation Bottom Tab**/

  // navigate to pass params
  navigateToScreen = (navigation, params = "") => {
    const navigateAction = NavigationActions.navigate({
      routeName: "DrawerStack",
      params: params,
    });
    
    navigation.dispatch(navigateAction);
    navigation.dispatch(DrawerActions.openDrawer());
  }

  componentDidMount() {
    // Init Screen
    this.handleGetPromotionData();

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
  }

  async handleLoginUpdate(){
    // var loginUpdate = this.props.navigation.getParam('loginUpdate', false);
    // if(loginUpdate){
      var nric = '';
      var login_user = await this.loginController.fetchCurrentLoginMember();
      if(login_user.result == 1 && login_user.data){
        nric = login_user.data.nric;
      }
      this.props.navigation.setParams({loginUpdate: false});
      if(this.scrollView){
        this.scrollView.scrollTo({x: 0, y: 0});
      }
      this.handleSetNRIC(nric);
    // }
  }

  handleSetNRIC(nric){
    this.setState({nric});
    this.handleGetPromotionData();
  }

  handleGetPromotionData(){
    this.handleFetchDataIndicator(true);
    var init_result = this.promoController.initScreen();
    init_result.then((res) => {
      if(res.result == 1){
        var promo_list = res.data;
        this.setState({
          check: res.check,
          datalist: promo_list,
          flatListRentalTrigger: !this.state.flatListRentalTrigger,
        })
      } else {
        // Disabled to alert message to prevent user see API return message.
        // Alert.alert(
        //   res.data.title,
        //   res.data.msg
        // )
      }
      this.handleFetchDataIndicator(false);
    })
  }

  handleFlatListRenderItem = ({item, index}) => {
    return (
    <FadeInAnimation index = { index }>
      <TouchableOpacity 
        onPress={() => {
          this.props.navigation.navigate('PromotionProductScreen', {
            promo_title_data: {
              promo_key: item.promo_key,
              title: item.title,
              date_from: item.date_from,
              date_to: item.date_to,
              time_from: item.time_from,
              time_to: item.time_to,
              promo_branch_id: item.promo_branch_id,
            }
          })
        }}
        style={[
          PromotionContainer.shadow, {
            marginVertical: Metrics.doubleBaseMargin, 
            marginHorizontal: Metrics.baseMargin,
            marginBottom: Metrics.basePadding,
          } 
        ]}>
          <View style={PromotionContainer.container}>
            
            {/* Promotion Banner */}
            <Image 
              source={{uri:`${AppConfig.api_url}/${item.banner_vertical_1}`}} 
              resizeMode='stretch'
              style={{
                width: '100%', 
                height: Metrics.images.promoImg, 
                justifyContent: 'center', 
                borderTopLeftRadius: Metrics.containerRadius, 
                borderTopRightRadius: Metrics.containerRadius,
              }}
            /> 
            
            {/* Promotion Date Validable */}
            <View style={[PromotionContainer.dateHeaderContainer, {}]}>
              <Text style={{color: Colors.text_color_2, fontSize: Fonts.size.small}}>{`Valid ${item.date_from ? `from ${item.date_from}` : ""} till ${item.date_to ? item.date_to : ""}`}</Text>
            </View>
            
            {/* Straight Line */}
            <View style={{width: '95%', alignSelf: 'center'}}> 
              <Divider lineColor={Colors.border_line}/>
            </View>
            
            {/* Promotion Title Container */}
            <View style={[PromotionContainer.flatlistHeaderContainer, {}]}>
              {/* Promotion Title */}
              <Text 
                style={{
                  fontSize: Fonts.size.h6, 
                  fontWeight: 'bold', 
                  color: Colors.text_color_1
                }}
              >
                {`${item.title}`}
              </Text>
              {/* Arrow Icon */}
              <Image 
                source={Images.arrowRight}
                style={{height: Metrics.icons.small, width: Metrics.icons.small, alignSelf: 'center'}}/>
            </View>
        
        </View>
      </TouchableOpacity>
    </FadeInAnimation>
		)
  }

  // handle refresh page
  fetchData = async() => {
    this.handleGetPromotionData();
  }

  handleRefresh = () => {
    this.setState({refreshing: true});
    this.fetchData().then(() => {
      this.setState({refreshing: false});
    });
  }

  handleFetchDataIndicator(status){
    this.setState({
      fetch_data: status
    })
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
    /** Local variable config **/
    var portrait = this.state.screenWidth < this.state.screenHeight
    /** End local variable config **/
    return (
      /**Start Safe Area**/
      <SafeAreaView style={ApplicationStyles.screen.safeAreaContainer} forceInset={{vertical:'never'}} >
        
        {/* Ads Banner */}
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
                url = (url.substring(0,8)=="https://" || url.substring(0,7)=="http://") ? url:`http://${url}`;
                Linking.openURL(url);
              } else {
                Alert.alert("", I18n.t("alert_banner_empty_weblink"));
              }
            }}
            onRefresh={this.state.fetch_data}
          />
        </View>
        
        {/* Promotion Display */}
        {
          (!this.state.fetch_data)
          ?
          <View>
            {
              (this.state.datalist.length>0)
              ?
              <ScrollView 
                ref={(ref) => this.scrollView = ref}
                showsVerticalScrollIndicator={false}
                refreshControl={
                  <RefreshControl
                    refreshing={this.state.refreshing}
                    onRefresh={this.handleRefresh}
                  />
                }> 
                <View style={{paddingVertical: Metrics.smallPadding, marginBottom: 150}}>
                  
                  {/* Promotion Header */}
                  <View style={PromotionContainer.headerContainer}>
                    <Text style={[Fonts.style.h5, {fontWeight: 'bold', color: Colors.primary}]}>SPECIAL PROMOTION</Text>
                  </View>
                  
                  {/* Promotion List */}
                  <FlatList
                    data={this.state.datalist}
                    renderItem={this.handleFlatListRenderItem}
                    key={portrait ? "h" : "v"}
                    extraData={this.state.flatListRentalTrigger}
                    // horizontal={true}
                  />

                </View>
              </ScrollView>
              :
              <View>
                {
                  (this.state.check)
                  ?
                  <View/>
                  :
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
                    <Label style={{color: Colors.primary}}>Oops! No promotion have been issued yet.</Label>
                  </View>
                }
              </View>
            }
          </View>
          :
          <View/>
        }
        
        {/* Loading Animation */}
        {this.handleRenderLoadingIndicator()}

      </SafeAreaView>
    )
  }
}