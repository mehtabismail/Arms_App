/** REACT NATIVE **/
import React from 'react';
import {
  Alert,
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
  AppsButton, LoadingIndicator, Label, FadeInAnimation, SpringAnimation,
} from '../../../Services/LibLinking';
import DashboardContainer from '../../General/Dashboard/Styles/DashboardContainerStyles';
import MemberController from '../Actions/member_controller.js';
import LoginController from '../../General/Login/Actions/login_controller';

/** NPM LIBRARIES **/
import { NavigationActions } from 'react-navigation';

export default class MemberHistoryView extends React.Component {
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
      nric: '',
      points: '',
      openPoint: 0,

      // Refresh page control
      refreshing: false,

    }

    //Create Controller Object
    this.memberController = new MemberController({
      navigation: this.props.navigation
    });
    this.loginController = new LoginController();
  }

  /**Navigation Bottom Tab**/
  static navigationOptions = ({navigation, navigationOptions}) => {
    const params = navigation.state.params || {};
    return {
      title: 'History',
      headerLeft: (
        <TouchableOpacity style={{paddingLeft: 5}} onPress={() => navigation.navigate('DashboardScreen')}>
          <Image
            style={{width: Metrics.icons.regular, height: Metrics.icons.regular, tintColor: Colors.secondary}} 
            source={Images.arrowLeft}
          />
        </TouchableOpacity>
      ),
      headerRight: (
        <View style={{width: Metrics.icons.regular, height: Metrics.icons.regular, paddingRight: 5}}></View>
      ),
    };
  };
  /**End Navigation Bottom Tab**/

  componentDidMount() {
    // var nric = this.props.navigation.getParam('nric');
    // this.handleSetNRIC(nric);
    this.props.navigation.setParams({'loginUpdate': true});
    this.handleLoginUpdate();
  }

  componentWillUnmount(){
    const navigateAction = NavigationActions.navigate({ 
      routeName: 'DashboardScreen',
      params: {loginUpdate: true}
    });
    this.props.navigation.dispatch(navigateAction);
  }

  componentDidUpdate(){
    this.handleLoginUpdate();
  }

  async handleLoginUpdate(){
    var loginUpdate = this.props.navigation.getParam('loginUpdate', false);
    if(loginUpdate){
      this.props.navigation.setParams({'loginUpdate': false});
      var nric = '';
      var login_user = await this.loginController.fetchCurrentLoginMember();
      if(login_user.result == 1 && login_user.data){
        nric = login_user.data.nric;
      }
      this.handleSetNRIC(nric);
    }
  }
  
  handleSetNRIC(nric){
    this.setState({nric, check: true});
    this.handleFetchMemberHistoryAndPointsData(nric);
  }

  handleFetchMemberHistoryAndPointsData(nric){
    if(nric && !this.state.fetch_data){
      this.handleFetchDataIndicator(true);
      this.handleMemberPoints(nric);
      this.handleHistoryData(nric);
    }
  }
  
  // Fetch Member Points
  handleMemberPoints (nric) {
    var result = this.memberController.fetchMemberPointData(nric)
    result.then((res) => {
      if(res.result == 1) {
        var points = res.data.points;
        this.setState({
          points: points,
        })
      } else {
        alert('No Data Found') ;
      }
    })  
  }

  // Fetch History Data
  handleHistoryData (nric) {
    var result = this.memberController.fetchMemberPointHistoryData(nric);
    result.then((res) => {
      // alert(JSON.stringify(res))
      if(res.result == 1) {
        var openPoint = res.data.openPoint;
        var history_points_list = res.data.historyList;
        this.setState({
          openPoint: openPoint,
          datalist: history_points_list,
          flatListRentalTrigger: !this.state.flatListRentalTrigger
        })
      } else {
        alert('No Data Found');
      }
      this.handleFetchDataIndicator(false);
    })
  }

  handlePointsColor = (p) => {
    if(p > 0) {
      return true;    
    } else {
      return false;
    }
  }

  handleFlatListRenderItem = ({item, index}) => {
    return (
    // History Container
    <FadeInAnimation index = { index }>
      <View style={[DashboardContainer.historyContainer, {}]}>

        <View style={{width: '80%'}}>
          {/* Branch Description */}
          <View style={{marginVertical: Metrics.baseMargin}}>
            <Text style={{color: Colors.text_color_1, fontSize: Fonts.size.h5, fontWeight: 'bold'}}>{item.branch_desc}</Text>
          </View>
          {/* Remarks */}
          <View style={{marginVertical: Metrics.smallMargin}}>
            <Text style={{color: Colors.text_color_1, fontSize: Fonts.size.regular}}>{item.remark}</Text>
          </View>
          {/* Type and Date */}
          <View style={{marginVertical: Metrics.smallMargin}}>
            <Text style={{color: Colors.text_color_2}}>{item.type} . {item.date}</Text>
          </View>
        </View>

        <View style={{width: '20%'}}>
          {/* Points */}
          <View>
            <Text style={[{color: (this.handlePointsColor(item.points)) ? Colors.text_positive : Colors.text_negative}, {fontSize: Fonts.size.input}]}>{item.points}</Text>
          </View>
        </View>
        
      </View>
    </FadeInAnimation>
		)
  }

  // handle refresh page
  fetchData = async() => {
    var nric = this.state.nric;
    this.handleFetchMemberHistoryAndPointsData(nric);
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
    // console.log(this.props.navigation)
      return (
        /**Start Safe Area**/
        <SafeAreaView style={ApplicationStyles.screen.safeAreaContainer} forceInset={{vertical:'never'}} >

          <ScrollView refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={this.handleRefresh}
            />
          }>
          {
            (!this.state.nric)
            ?
            <View>
              {
                (this.state.check)
                ?
                <View style={[ApplicationStyles.screen.testContainer,  {alignSelf: 'center'}]}>
                  <View style={{width: '100%', justifyContent: 'center', padding: Metrics.basePadding}}>
                    <Label style={{marginBottom: Metrics.baseMargin*6}}>Come and join us to get your discount vouchers and many more great deals.</Label>
                    <AppsButton 
                      onPress={() => {this.props.navigation.navigate("LandingScreen", {prev_screen: this.props.navigation.state.routeName})}}
                      backgroundColor={Colors.primary}
                      text={"LOGIN / REGISTER"}
                      fontSize={20}
                    />
                  </View>
                </View>
                :
                <View/>
              }
            </View>
            :
            <View>
            {/* History Points */}
            <View style={[ApplicationStyles.screen.titleStatusContainer, {}]}>
              {/* Total Points */}
              <View style={{alignSelf: 'center',flexDirection: 'row'}}>
                <Text style={[ApplicationStyles.screen.titleStatusText]}>
                  Total Points: {this.state.points} 
                </Text>
              </View>
            </View>
            
            {
              (!this.state.fetch_data)
              ?
              <View>
                {
                  (this.state.openPoint)
                  ?
                  // Opening Points
                  <View style={[DashboardContainer.historyContainer, {}]}>
                    {/* Total Points */}
                    <View style={{alignSelf: 'center',flexDirection: 'row'}}>
                      <Text style={[Fonts.style.h4, {fontWeight: '500'}]}>
                        Opening Points: {this.state.openPoint} 
                      </Text>
                    </View>
                  </View>
                  :
                  <View/>
                }
              
                {/* checking flatlist content */}
                {
                  (this.state.datalist) 
                  ?
                  <ScrollView showsVerticalScrollIndicator={false}> 
                    <View>
                      {/*  */}
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
                    <Label style={{color: Colors.primary}}>Oops! No point history yet.</Label>
                  </View>
                }
              </View>
              :
              <View/>
              } 
            </View>
          }
          </ScrollView>

          {/* Loading Animation */}
          {this.handleRenderLoadingIndicator()}

        </SafeAreaView>
      )
  }
}