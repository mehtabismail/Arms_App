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
  Text, TextInput, TouchableOpacity,
  View,
} from 'react-native';

/** PROJECT FILES **/
import { 
  Colors, Fonts, Images, Metrics, ApplicationStyles,
  LoadingIndicator, Label, SmallBadge, AppsButton, Divider
} from '../../../Services/LibLinking';
import LoginController from '../../General/Login/Actions/login_controller';
import MemberController from '../../Member/Actions/member_controller';
import POSController from '../../General/POS/Actions/POSControllers';

/** NPM LIBRARIES **/
import { NavigationActions, DrawerActions, SafeAreaView } from 'react-navigation';
// import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from "moment";
// import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

const SCREEN_WIDTH = Dimensions.get("screen").width;
const SCREEN_HEIGHT = Dimensions.get("screen").height;

export default class SAPOrderListView extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      screenWidth: Dimensions.get('window').width,
      screenHeight: Dimensions.get('window').height,

      // Member
      nric: '',
      card_no: '',

      // Fetch data from server indicator
      isFetchData: false,
      textFetchData: 'Fetching data...',
      firstLoad: true,

      // Order Data
      order: {
        id: 0,
        local_id: '',
        transaction_id: '',
        receipt_no: '',
        receipt_ref_no: '',
        branch_id: '',
        counter_id: '',
        cashier_id: '',
        cashier_name: '',
        status: 'paid',
        sub_total_amount: 0,
        discount_amount: 0,
        rounding: 0,
        total_amount: 0,
        cash_received: 0,
        change: 0,
        payment: [],
        transaction_date: '',
        start_time: '',
        end_time: '',
        created_date: '',
        order_item: [
          // {
          //   local_id: '123',
          //   transaction_id: '123',
          //   branch_id: '47',
          //   sku_item_id: '12345',
          //   product_name: 'Testing 123456',
          //   product_image: '',
          //   default_price: 1.0,
          //   selling_price: 1.0,
          //   quantity: 1,
          //   manual_discount_amount: 0,
          //   created_date: "",
          // }
        ]
      },

      statusLabel: {
        paid: "Paid",
      }
    }

    // Create controller object
    this.loginController = new LoginController();
    this.memberController = new MemberController();
    this.posController = new POSController();

  }

  /****************************************************************/
  /************************ HEADER ********************************/
  /****************************************************************/

  // Navigation Tab
  static navigationOptions = ({navigation, navigationOptions}) => {
    const params = navigation.state.params || {};
    var navigateToScreen = params.this;

    return {
      title: 'Transactions',
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
    this.handleLoginUpdate();
  }

  componentWillUnmount() {
  }

  componentDidUpdate(prevProps){
    // Login Update
    // var loginUpdate = this.props.navigation.getParam('loginUpdate', false);
    // if(loginUpdate && this.props.navigation != prevProps.navigation){
    //   this.props.navigation.setParams({loginUpdate: false});
    //   this.handleLoginUpdate();
    // }
  }

  handleFetchDataIndicator(status, text=""){
    this.setState({
      isFetchData: status,
      textFetchData: text ? text : 'Fetching data...'
    })
  }

  thousandSeparator(input){
    var result = input.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    return result
  }

  /****************************************************************/
  /******************** FUNCTIONALITY *****************************/
  /****************************************************************/

  async handleLoginUpdate(){
    var nric = '';
    var card_no = '';
    var login_user = await this.loginController.fetchCurrentLoginMember();
    if(login_user.result == 1 && login_user.data){
      nric = login_user.data.nric;
      card_no =  login_user.data.card_no;
    }
    this.props.navigation.setParams({loginUpdate: false});
    this.handleSetNRIC(nric, card_no);
  }

  handleSetNRIC(nric, card_no){
    this.setState({nric, card_no, firstLoad: false}, ()=>{
      this.handleGetAllOrder();
    });
  }

  handleGetAllOrder(){
    this.handleFetchDataIndicator(true, "Loading...");
    
    var orderResponse = this.posController.getAllOrderByMemberCardNo(this.state.card_no);
    orderResponse.then((res)=>{
      if(res.result == 1){
        this.setState({
          order: res.data
        });
      } else {
        Alert.alert("Error", res.data.msg);
      }
      this.handleFetchDataIndicator(false);
    });
    
  }

  /****************************************************************/
  /******************** SCREEN RENDERING **************************/
  /****************************************************************/

  // Loading Indicator
  handleRenderLoadingIndicator(){
    return(
      <LoadingIndicator 
        visible={this.state.isFetchData}
        size={"large"}
        text={`${this.state.textFetchData}`}
      />
    )
  }

  // Render Landing Screen
  handleRenderLandingScreen(){
    return(
      this.state.isFetchData
      ?
      <View/>
      :
      // Landing Screen
      <View style={{flex: 1}}>
        {
          this.state.order.length > 0
          ?
            <ScrollView>
              {
                this.state.order.map((item, index)=>{
                  return(
                    <TouchableOpacity 
                      key={`${index}`} style={{backgroundColor: Colors.body, borderTopWidth: index == 0 ? 0 : 0.5}}
                      onPress={()=>{this.props.navigation.navigate("SAPReceiptScreen", {local_id: item.local_id});}}
                    >
                      <View style={{flexDirection:  'row', paddingHorizontal: Metrics.basePadding, paddingVertical: Metrics.smallPadding}}>
                        
                        {/* Left */}
                        <View style={{flex: 1, marginLeft: Metrics.smallMargin}}>
                          <Label text={`${moment(item.transaction_date).format("DD MMMM YYYY")}`} style={{fontSize: Fonts.size.h6, color: Colors.primary, fontWeight: 'bold'}} />
                          <Label text={`${item.receipt_no}`} style={{fontSize: Fonts.size.input, color: Colors.primary}} />
                          <Label text={`${item.status}`} style={{fontSize: Fonts.size.large, color: Colors.primary}} />
                        </View>

                        {/* Right */}
                        <View style={{width: '30%', justifyContent: 'center'}}>
                          <Label text={`RM ${this.thousandSeparator(parseFloat(item.total_amount).toFixed(2))}`} style={{fontSize: Fonts.size.h6, color: Colors.primary, textAlign: 'right'}} />
                        </View>
                      </View>
                    </TouchableOpacity>
                  )
                })
              }
            </ScrollView>
          :
            <View/>
        }
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
            // Landing Screen
            this.handleRenderLandingScreen()
        }

        {/* Loading Animation */}
        {this.handleRenderLoadingIndicator()}

      </SafeAreaView>
    )
  }
}