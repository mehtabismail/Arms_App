/** REACT NATIVE **/
import React from 'react';
import {
  Dimensions,
  Image,
  TouchableOpacity,
  View,
} from 'react-native';

/** PROJECT FILES **/
import { 
  Colors, Fonts, Images, Metrics, ApplicationStyles,
  AppsButton, LoadingIndicator, AdsBanner, Label,
  AppConfig,
} from '../../../../Services/LibLinking';
import LoginController from '../../Login/Actions/login_controller';

/** NPM LIBRARIES **/
import moment from 'moment';
import { NavigationActions, DrawerActions } from 'react-navigation';
import Geolocation from 'react-native-geolocation-service';
import MapView from 'react-native-maps'; 
import Pusher from 'pusher-js/react-native';

export default class LocTrackerView extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      screenWidth: Dimensions.get('window').width,
      screenHeight: Dimensions.get('window').height,

      nric: '',
      card_no: '123',
      points: '',
      last_update: '',
      key_timestamp: moment(),

      // Fetch data from server indiacator
      fetch_data: false,

      // Refresh page control
      refreshing: false,
      // page: 1,
      // seed: 1,
      // loading: false,
      // data: [],
      // error: null,

      // Map
      latitude: 0,
      longitude: 0,
    }

    this.loginController = new LoginController();
  }

  /**Navigation Header**/
  static navigationOptions = ({navigation, navigationOptions}) => {
    const params = navigation.state.params || {};
    var navigateToScreen = params.this;

    return {
      title: 'Location Tracker',
      headerLeft: (
        <TouchableOpacity style={{paddingLeft: 10}} onPress={() => navigateToScreen(navigation, {loginUpdate: true})}>
          <Image
            style={{width: Metrics.icons.medium, height: Metrics.icons.medium, tintColor: Colors.secondary}} 
            source={Images.menu}/>
        </TouchableOpacity>
      ),
    };
  };
  /**End Navigation Header**/

  // navigate to pass params
  navigateToScreen = (navigation, params = "") => {
    const navigateAction = NavigationActions.navigate({
      routeName: "DrawerStack",
      params: params,
    });
    
    navigation.dispatch(navigateAction);
    navigation.dispatch(DrawerActions.openDrawer());
  }

  componentWillMount() {
    /* Initiate Screen */
    var initScreen = this.loginController.initScreen()
    initScreen.then((res)=>{
      if(res.result == 1){
        if(res.data) {
          var nric = res.data.nric;
          this.handleSetNRIC(nric);
        }
      } else {
      }
    })

    // var nric = this.props.navigation.getParam('nric', '');
    this.props.navigation.setParams({this: this.navigateToScreen});
  }

  componentWillUnmount() {
  }

  componentDidMount(){
    // if (hasLocationPermission) {
      // Geolocation.getCurrentPosition(
      //   (position) => {
      //       console.log(position);
      //   },
      //   (error) => {
      //       // See error code charts below.
      //       console.log(error.code, error.message);
      //   },
      //   { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      // );
    // }

    var pusher = new Pusher('bcad3eb916df60e3c4f8', {
      authEndpoint: `http://localhost:3000/pusher/auth`,
      cluster: 'ap1',
      useTLS: true,
    });
    
    Geolocation.watchPosition(
      (position) => {
        console.log(position);
        // alert(JSON.stringify(position));
        // this.setState({
        //   latitude: position.coords.latitude,
        //   longitude: position.coords.longitude
        // })

        channel = pusher.subscribe('private-loc-share');
        channel.bind('pusher:subscription_succeeded', () => {
          channel.trigger('client-loc-iphonex', {
            position
          });
        });
      },
      (error) => {
          // See error code charts below.
          console.log(error.code, error.message);
          alert(JSON.stringify(error.code + " " + error.message));
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
        
    var channel = pusher.subscribe('private-os-poll');
    channel.bind('pusher:subscription_succeeded', () => {
      channel.trigger('client-os-vote', {
        points: 1,
        os: 'MacOS'
      });
    })

    // var channel_loc = pusher.subscribe('private-loc-share');
    // channel_loc.bind('client-loc-iphonex', (position) => {
    //   alert(JSON.stringify(position))
    //   this.setState({
    //     latitude: position.position.coords.latitude,
    //     longitude: position.position.coords.longitude
    //   })
    // });
  }

  componentDidUpdate(){
    this.handleLoginUpdate();
  }

  async handleLoginUpdate(){
    var loginUpdate = this.props.navigation.getParam('loginUpdate', false);
    if(loginUpdate){
      var nric = '';
      var login_user = await this.loginController.fetchCurrentLoginMember();
      if(login_user.result == 1 && login_user.data){
        nric = login_user.data.nric;
      }
      this.props.navigation.setParams({loginUpdate: false});
      this.handleSetNRIC(nric);
    }
  }
  
  handleSetNRIC(nric){
    this.setState({nric});
    this.props.navigation.setParams({nric});
  }

  handleFetchDataIndicator(status){
    this.setState({
      fetch_data: status
    })
  }

  render(){
    return (
      <View style={{
        // resizeMode: 'contain',
        // height: Dimensions.get("screen").height,
        // width: '100%',
        justifyContent: 'flex-end',
        alignItems: 'center',
      }}>
        <MapView
          style={{
            height: Dimensions.get("screen").height,
            width: '100%',
            justifyContent: 'flex-end',
            alignItems: 'center',
          }}
          showsUserLocation={true}
          followUserLocation={true}
          region={{
            latitude: parseFloat(this.state.latitude), 
            longitude: parseFloat(this.state.longitude),
            latitudeDelta: 0.015,
            longitudeDelta: 0.0121,
          }}
        >
          <MapView.Marker
            coordinate={{
              latitude: parseFloat(this.state.latitude), 
              longitude: parseFloat(this.state.longitude),
            }}
            // title={item.title}
            // description={item.description}
          />          
        </MapView>
      </View>
    )
  }
}