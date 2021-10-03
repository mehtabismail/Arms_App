/** REACT NATIVE **/
import React from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  RefreshControl,
  SafeAreaView, ScrollView,
  Text, TouchableOpacity,
  View,  
} from 'react-native';

/** PROJECT FILES **/
import { 
  Colors, Fonts, Images, Metrics, ApplicationStyles,
  LoadingIndicator, Label, SpringAnimation, HorizontalScrollAnimation,
  AppConfig
} from '../../../Services/LibLinking';
import LoginController from '../../General/Login/Actions/login_controller';
import OutletListContainer from '../Styles/OutletListStyles';
import OutletLocation from '../Actions/OutletLocationControllers';

/** NPM LIBRARIES **/
import MapView from 'react-native-maps';
import { NavigationActions, DrawerActions } from 'react-navigation';

export default class OutletListView extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      screenWidth: Dimensions.get('window').width,
      screenHeight: Dimensions.get('window').height,

      // Fetch data from server indicator
      fetch_data: false,
      check: '',
      result: false,

      // Refresh page control
      refreshing: false,

      // flatList
      datalist: [],
      flatListRentalTrigger: false,
    }

    // Create controller object
    this.loginController = new LoginController();
    this.outletLocation = new OutletLocation();
  }

  /**Navigation Bottom Tab**/
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
    this.props.navigation.setParams({this: this.navigateToScreen});
    this.handleLoginUpdate();
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
    var nric = '';
    var login_user = await this.loginController.fetchCurrentLoginMember();
    if(login_user.result == 1 && login_user.data){
      nric = login_user.data.nric;
    }
    this.props.navigation.setParams({loginUpdate: false});
    this.handleSetNRIC(nric);
  }

  handleSetNRIC(nric){
    this.setState({nric});
    this.handleGetOutletLocation();
  }

  handleGetOutletLocation(){
    this.handleFetchDataIndicator(true);
    var result = this.outletLocation.initScreen();
    result.then((res) => {
      if(res.result == 1) {
        if(res.data){
          /**
           * Make screen scroll to top
           */
          if(this.scrollView){
            this.scrollView.scrollTo({x: 0, y: 0});
          }

          /**
           * Assign the data to datalist
           */
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

  handleFlatListRenderItem = ({item, index}) => {
    return (
      <View style={{width: Dimensions.get("window").width}}>
        {/* Header */}
        <View style={OutletListContainer.header}>
          <Text style={{color: Colors.secondary, fontSize: Fonts.size.medium, fontWeight: 'bold'}}>{item.description}</Text>
        </View>

        {/* body */}
        <View style={[OutletListContainer.body, {margin: Metrics.doubleBaseMargin}]}>
          {
            (item.outlet_photo_url)
            ?
            <Image 
              source={{uri:`${AppConfig.api_url}/${item.outlet_photo_url}`}}
              // resizeMode={'contain'}
              style={{width: '100%', height: 170, resizeMode: 'stretch'}}
            />
            :
            <View/>
          }
          <View style={[{paddingTop: Metrics.basePadding, width: '100%'}]}>
            <View>
              <Text style={{fontWeight: 'bold'}}>Address:</Text>
              <Text style={{marginBottom: Metrics.smallMargin, paddingLeft: Metrics.basePadding}}> 
                {item.address}
              </Text>
            </View>
            <View>
              <Text style={{fontWeight: 'bold'}}>Contact:</Text>
              <Text style={{marginBottom: Metrics.smallMargin, paddingLeft: Metrics.basePadding}}>
                {item.phone_1}
              </Text>
              {
                (item.phone_2)
                ?
                <Text style={{marginTop: 0, marginBottom: Metrics.smallMargin, paddingLeft: Metrics.basePadding}}>
                  {item.phone_2}
                </Text>
                :
                <View/>
              }
              {
                (item.phone_3)
                ?
                <Text style={{marginTop: 0, marginBottom: Metrics.smallMargin, paddingLeft: Metrics.basePadding}}>
                  {item.phone_3}
                </Text>
                :
                <View/>
              }
            </View>
            <View>
              <Text style={{fontWeight: 'bold'}}>Operation Time:</Text>
              <Text style={{marginBottom: Metrics.baseMargin, paddingLeft: Metrics.basePadding}}>
                {item.operation_time}
              </Text>
            </View>
            
          </View>

          {
            (item.latitude && item.longitude)
            ?
            <View style={[OutletListContainer.mapContainer]}>
              <MapView
                style={[OutletListContainer.map]}
                showsUserLocation={true}
                followUserLocation={true}
                region={{ 
                  latitude: Number(item.latitude),  
                  longitude: Number(item.longitude), 
                  latitudeDelta: 0.015,
                  longitudeDelta: 0.0121,
                }}
              >
                <MapView.Marker
                  coordinate={{
                    latitude: Number(item.latitude),  
                    longitude: Number(item.longitude), 
                  }}
                  title={item.code}
                  description={item.description}
                />
                
              </MapView>
            </View>
            :
            <View/>
          }

        </View>
      </View>
    )
  }

  handleFetchDataIndicator(status){
    this.setState({
      fetch_data: status
    })
  }

  // handle refresh page
  fetchData = async() => {
    this.handleGetOutletLocation();
  }

  handleRefresh = () => {
    this.setState({refreshing: true});
    this.fetchData().then(() => {
      this.setState({refreshing: false});
    });
  }

  render() {
    /** Local variable config **/
    var portrait = this.state.screenWidth < this.state.screenHeight
    /** End local variable config **/

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
              <ScrollView 
                horizontal={true} 
                pagingEnabled={true} 
                showsHorizontalScrollIndicator={false}
                refreshControl={<RefreshControl
                    refreshing={this.state.refreshing}
                    onRefresh={this.handleRefresh}
                  />
                }>
                <View style={[ApplicationStyles.screen.mainContainer, {}]}>
                  <FlatList
                    data={this.state.datalist}
                    renderItem={this.handleFlatListRenderItem}
                    key={portrait ? "h" : "v"}
                    extraData={this.state.flatListRentalTrigger}
                    horizontal={true}
                  />
                </View>  
              </ScrollView>  
              :
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
            }
          </View>
          :
          <View/>
        }  

        {/* Loading Animation */}
        {
          (this.state.fetch_data)
          ?
          <View style={{
            position: 'absolute',
            top: '25%',
            bottom: '25%',
            left: '25%',
            right: '25%',
          }}>
            <LoadingIndicator size={"large"} text={"Fetching data..."}/>
          </View>
          :
          <View />
        } 

      </SafeAreaView>
    )
  }
}
