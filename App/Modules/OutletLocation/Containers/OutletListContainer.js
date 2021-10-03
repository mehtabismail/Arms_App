/** REACT NATIVE **/
import React from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  Platform,
  SafeAreaView, ScrollView, StyleSheet,
  Text, TouchableOpacity,
  View,  
} from 'react-native';

/** PROJECT FILES **/
import { 
  Colors, Fonts, Images, Metrics, ApplicationStyles,
  LoadingIndicator, Label, SpringAnimation, ExpandCollapseAnimation,
  AppConfig
} from '../../../Services/LibLinking';
import LoginController from '../../General/Login/Actions/login_controller';
import OutletListContainer from '../Styles/OutletListStyles';
import OutletLocation from '../Actions/OutletLocationControllers';

/** NPM LIBRARIES **/
import MapView from 'react-native-maps';
import { NavigationActions, DrawerActions } from 'react-navigation';
import Carousel from 'react-native-snap-carousel';

// Screen Size
const SCREEN_HEIGHT = Dimensions.get("window").height;
const SCREEN_WIDTH = Dimensions.get("window").width;

// Branches Card Slide Width and Card Width Default Value
const SLIDE_WIDTH = SCREEN_WIDTH;
const CARD_HEIGHT = (SCREEN_HEIGHT > 700) ? SCREEN_HEIGHT*0.35 : SCREEN_HEIGHT*0.4;
const CARD_WIDTH =  SCREEN_WIDTH * 0.8;

// MapView Latitude and Longitude Delta Default Value
const LATITUDE_DELTA = 0.022;
const LONGITUDE_DELTA = LATITUDE_DELTA + (SCREEN_WIDTH / SCREEN_HEIGHT)

export default class OutletListView extends React.Component {
  constructor(props){
    super(props);
    this.state = {

      // Fetch data from server indicator
      fetch_data: false,
      check: '',
      result: false,

      // flatList
      datalist: [
        {
          latitude: 0,
          longitude: 0,
        }
      ],
      flatListRentalTrigger: false,
    }

    // Create controller object
    this.loginController = new LoginController();
    this.outletLocation = new OutletLocation();

    // Animation
    this.index = 0;
    this.animation = new Animated.Value(0);
  }

  /****************************************************************/
  /************************ HEADER ********************************/
  /****************************************************************/

  // Navigation Tab
  static navigationOptions = ({navigation, navigationOptions}) => {
    const params = navigation.state.params || {};
    var navigateToScreen = params.this;

    return {
      title: 'Outlet Location',
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
    this.createAnimationListener();
  }

  componentWillUnmount() {
  }

  componentDidUpdate(prevProps){
    // Login Update
    var loginUpdate = this.props.navigation.getParam('loginUpdate', false);
    if(loginUpdate && this.props.navigation != prevProps.navigation){
      this.props.navigation.setParams({loginUpdate: false});
      this.handleGetOutletLocation();
    }
  }

  handleFetchDataIndicator(status){
    this.setState({
      fetch_data: status
    })
  }

  /****************************************************************/
  /******************** FUNCTIONALITY *****************************/
  /****************************************************************/

  handleGetOutletLocation(){
    this.handleFetchDataIndicator(true);
    var result = this.outletLocation.initScreen();
    result.then((res) => {
      if(res.result == 1) {
        if(res.data){
          var branch_location = res.data;
          this.setState({
            datalist: branch_location
          })
          this.handleFetchDataIndicator(false);
        }
      } else {
        this.setState({
          check: res.check,
          result: true,
        })
        this.handleFetchDataIndicator(false);
      }
    })
  }

  createAnimationListener(){
    // We should detect when scrolling has stopped then animate
    // We should just debounce the event listener here
    this.animation.addListener(({ value }) => {
      // Use scroll contentOffSet to indicate card index
      let index = (Platform.OS === 'ios')?(Math.floor(value / CARD_WIDTH + 0.3)):(Math.floor(value / CARD_WIDTH + 0.5)); // animate 30% away from landing on the next item
      if (index >= this.state.datalist.length) {
        index = this.state.datalist.length - 1;
      }
      if (index <= 0) { 
        index = 0;
      }

      // Set timeout to delay map animation change
      clearTimeout(this.regionTimeout);
      this.regionTimeout = setTimeout(() => {
        if (this.index !== index) {
          this.index = index;
          this.map.animateToRegion({
            latitude: Number(this.state.datalist[index].latitude),
            longitude: Number(this.state.datalist[index].longitude),
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA,
          }, 350);
        }
      }, 10);
    });
  }

  getInitialRegion(){
    return {
      latitude: Number(this.state.datalist[0].latitude),
      longitude: Number(this.state.datalist[0].longitude),
      latitudeDelta: LATITUDE_DELTA, //0.04864195044303443,
      longitudeDelta: LONGITUDE_DELTA, //0.040142817690068,
    };
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
        text={"Fetching data..."}
      />
    )
  }

  // Render MapView Branches Point
  handleRenderMapViewBranchesPoint(){
    const interpolations = this.state.datalist.map((i, index) => {
      const inputRange = [
        (index - 1) * CARD_WIDTH,
        index * CARD_WIDTH,
        ((index + 1) * CARD_WIDTH),
      ];
      const scale = this.animation.interpolate({
        inputRange,
        outputRange: [1, 2.5, 1],
        extrapolate: "clamp",
      });
      const opacity = this.animation.interpolate({
        inputRange,
        outputRange: [0.35, 1, 0.35],
        extrapolate: "clamp",
      });
      return { scale, opacity };
    });

    return(
      <MapView
        ref={map => this.map = map}  
        initialRegion={this.getInitialRegion()}
        style={[OutletListContainer.map]}
      >
        {
          this.state.datalist.map((value, index) => {
            const scaleStyle = {
              transform: [
                {
                  scale: interpolations[index].scale,
                },
              ],
            };
            const opacityStyle = {
              opacity: interpolations[index].opacity,
            };

            return (
              <MapView.Marker 
                key={index} 
                coordinate={{
                  latitude: Number((this.state.datalist[index].latitude == "")?(0):(this.state.datalist[index].latitude)),  
                  longitude: Number((this.state.datalist[index].longitude == "")?(0):(this.state.datalist[index].longitude))
                }}
                title={this.state.datalist[index].code}
                description={this.state.datalist[index].description}
              >
                <Animated.View style={[OutletListContainer.markerWrap, opacityStyle]}>
                  <Animated.View style={[OutletListContainer.ring, scaleStyle]} />
                  <View style={OutletListContainer.marker} />
                </Animated.View>
              </MapView.Marker>
            );
          })
        }
      </MapView>
    )
  }

  // Render Branches Card List
  handleRenderBranchesCardList(){
    return(
      <View style={[OutletListContainer.scrollView]}>
        <Carousel
          ref={(ref)=>{this.carousel = ref}}
          data={this.state.datalist}
          renderItem={this.handleFlatListRenderItem}
          extraData={this.state.flatListRentalTrigger}
          scrollEventThrottle={1}
          itemWidth={CARD_WIDTH}
          sliderWidth={SLIDE_WIDTH}
          snapToInterval={CARD_WIDTH}
          onSnapToItem={(index)=>{
            this.carousel.snapToItem(index);
          }}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: this.animation } } }],
            { useNativeDriver: true }
          )}
          inactiveSlideOpacity={1}
          slideStyle={{
            alignSelf: 'flex-end'
          }}
        />
      </View>
    )
  }

  // Render Branch Item Details In Card
  handleFlatListRenderItem = ({item, index}) => {
    return (
    <ExpandCollapseAnimation 
      key={index} 
      title={item.description} 
      containerWidth={CARD_WIDTH}
    >
      <View style={[OutletListContainer.card, {height: CARD_HEIGHT}]} key={index}>
        <ScrollView>
          {
            item.outlet_photo_url
            ?
            <View style={{marginBottom: Metrics.baseMargin}}>
              <Image
                source={{uri:`${AppConfig.api_url}/${item.outlet_photo_url}`}}
                style={OutletListContainer.cardImage, {height: CARD_HEIGHT * 0.4}}
                resizeMode={"cover"}
              />
            </View>
            :
            <View/>
          }
          <View style={OutletListContainer.textContent}>
            {/* Address */}
            {this.handleRenderBranchDetailsItem("Address:", item.address)}

            {/* Phone No */}
            {this.handleRenderPhoneNoList("Phone No:", index)}

            {/* Operation Time */}
            {this.handleRenderBranchDetailsItem("Operation time:", item.operation_time)}
          </View>
        </ScrollView>
      </View>
    </ExpandCollapseAnimation>
    )
  }

  handleRenderBranchDetailsItem(title, data){
    return(
      <View style={{marginVertical: Metrics.smallMargin}}>
        <Label 
          text={`${title}`}
          style={OutletListContainer.cardTitle}
        />
        <Label 
          text={`${data}`}
          style={OutletListContainer.cardDescription}
        />
      </View>
    )
  }

  // handleRenderPhoneNoList(index){
  //   var phone_no = [];

  //   if(this.state.datalist[index].phone_1){
  //     phone_no.push(this.state.datalist[index].phone_1)
  //   }
  //   if(this.state.datalist[index].phone_2){
  //     phone_no.push(this.state.datalist[index].phone_2)
  //   }
  //   if(this.state.datalist[index].phone_3){
  //     phone_no.push(this.state.datalist[index].phone_3)
  //   }

  //   return phone_no.join(", ");
  // }

  // Render Branch Phone Number List
  handleRenderPhoneNoList(title, index){
    return(
      <View style={{marginVertical: Metrics.smallMargin}}>
        <Label 
          text={`${title}`}
          style={OutletListContainer.cardTitle}
        />

        {
          !this.state.datalist[index].phone_1 && !this.state.datalist[index].phone_2 && !this.state.datalist[index].phone_3
          ?
          this.handleRenderPhoneNo("Don't Have Phone Number.")
          :
          <View>
            {this.handleRenderPhoneNo(this.state.datalist[index].phone_1)}
            {this.handleRenderPhoneNo(this.state.datalist[index].phone_2)}
            {this.handleRenderPhoneNo(this.state.datalist[index].phone_3)}
          </View>
        }
      </View>
    )
  }

  // Render Each of Phone Number Data
  handleRenderPhoneNo(data){
    return(
      data
      ?
      <Label 
        text={`-> ${data}`}
        style={OutletListContainer.cardDescription}
      />
      :
      <View/>
    )
  }

  // Empty list screen
  handleRenderEmptyDataScreen(){
    return(
      <View style={[ApplicationStyles.screen.mainContainer, {justifyContent: 'center', flex: 0, height: '100%', paddingBottom: 150}]}>
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
        {
          (this.state.check == 1)
          ?
          <Label style={{color: Colors.primary}}>Oops! No branch location set up yet.</Label>
          :
          <Label style={{color: Colors.primary}}>Oops! No network connection.</Label>
        }
      </View>
    )
  }

  render() {
    return (
      /**Start Safe Area**/
      <SafeAreaView style={ApplicationStyles.screen.safeAreaContainer} forceInset={{vertical:'never'}} > 
      
        {
          (!this.state.fetch_data)
          ?
          <View>
            {
              (!this.state.result)
              ?
              <View>
                
                {/* MapView Branches Point */}
                {this.handleRenderMapViewBranchesPoint()}
                
                {/* Branches Card List */}
                {this.handleRenderBranchesCardList()}
                
              </View>
              :
              this.handleRenderEmptyDataScreen()
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
