/** REACT NATIVE **/
import React from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  RefreshControl,
  SafeAreaView, ScrollView, TouchableOpacity,
  View,
} from 'react-native';

import { Card, Button, Icon, Text } from 'react-native-elements'

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
import { tailwind } from '../../../../tailwind';


export default class MemberHistoryView extends React.Component {
  constructor(props) {
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
  static navigationOptions = ({ navigation, navigationOptions }) => {
    const params = navigation.state.params || {};
    return {
      title: 'History',
      headerLeft: (
        <View>
          <TouchableOpacity style={tailwind("bg-white rounded-lg opacity-100 p-2 ml-3 mt-3")} onPress={() => navigation.navigate('DashboardScreen')}>
            <Image
              style={{ width: Metrics.icons.regular, height: Metrics.icons.regular, tintColor: "black" }}
              source={Images.arrowLeft}
            />
          </TouchableOpacity>
        </View>

      ),
      headerRight: (
        <View style={{ width: Metrics.icons.regular, height: Metrics.icons.regular, paddingRight: 5 }}></View>
      ),
    };
  };
  /**End Navigation Bottom Tab**/

  componentDidMount() {
    // var nric = this.props.navigation.getParam('nric');
    // this.handleSetNRIC(nric);
    this.props.navigation.setParams({ 'loginUpdate': true });
    this.handleLoginUpdate();
  }

  componentWillUnmount() {
    const navigateAction = NavigationActions.navigate({
      routeName: 'DashboardScreen',
      params: { loginUpdate: true }
    });
    this.props.navigation.dispatch(navigateAction);
  }

  componentDidUpdate() {
    this.handleLoginUpdate();
  }

  async handleLoginUpdate() {
    var loginUpdate = this.props.navigation.getParam('loginUpdate', false);
    if (loginUpdate) {
      this.props.navigation.setParams({ 'loginUpdate': false });
      var nric = '';
      var login_user = await this.loginController.fetchCurrentLoginMember();
      if (login_user.result == 1 && login_user.data) {
        nric = login_user.data.nric;
      }
      this.handleSetNRIC(nric);
    }
  }

  handleSetNRIC(nric) {
    this.setState({ nric, check: true });
    this.handleFetchMemberHistoryAndPointsData(nric);
  }

  handleFetchMemberHistoryAndPointsData(nric) {
    if (nric && !this.state.fetch_data) {
      this.handleFetchDataIndicator(true);
      this.handleMemberPoints(nric);
      this.handleHistoryData(nric);
    }
  }

  // Fetch Member Points
  handleMemberPoints(nric) {
    var result = this.memberController.fetchMemberPointData(nric)
    result.then((res) => {
      if (res.result == 1) {
        var points = res.data.points;
        this.setState({
          points: points,
        })
      } else {
        alert('No Data Found');
      }
    })
  }

  // Fetch History Data
  handleHistoryData(nric) {
    var result = this.memberController.fetchMemberPointHistoryData(nric);
    result.then((res) => {
      // alert(JSON.stringify(res))
      if (res.result == 1) {
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
    if (p > 0) {
      return true;
    } else {
      return false;
    }
  }

  handleFlatListRenderItem = ({ item, index }) => {
    return (
      // History Container
      <FadeInAnimation index={index}>
        <View style={[DashboardContainer.historyContainer, ]}>
            <View style={tailwind('w-4/5')}>
              {/* Branch Description */}
              <View style={tailwind("px-2 pt-2")}>
                <Text style={tailwind("text-primary text-lg font-bold")}>{item.branch_desc}</Text>
              </View>
              {/* Remarks */}
              <View style={tailwind("px-2 ")}>
                <Text style={tailwind("text-secondary text-lg font-normal")}>{item.remark}</Text>
              </View>
              {/* Type and Date */}
              <View style={tailwind("px-2 pb-2")}>
                <Text style={{ color: Colors.text_color_2 }}>{item.type} . {item.date}</Text>
              </View>
            </View>

            <View style={tailwind('w-1/5 justify-center items-center')}>
              {/* Points */}
              <View >
                <Text style={[{ textAlign: "center", color: (this.handlePointsColor(item.points)) ? Colors.text_positive : Colors.text_negative }, { fontSize: Fonts.size.input }]}>{item.points}</Text>
              </View>
            </View>
          </View>
      </FadeInAnimation>
    )
  }

  // handle refresh page
  fetchData = async () => {
    var nric = this.state.nric;
    this.handleFetchMemberHistoryAndPointsData(nric);
  }

  handleRefresh = () => {
    this.setState({ refreshing: true });
    this.fetchData().then(() => {
      this.setState({ refreshing: false });
    });
  }

  handleFetchDataIndicator(status) {
    this.setState({
      fetch_data: status
    })
  }

  // Loading Indicator
  handleRenderLoadingIndicator() {
    return (
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
      <SafeAreaView style={ApplicationStyles.screen.safeAreaContainer} forceInset={{ vertical: 'never' }} >
        <View style={tailwind('mt-20')}>
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
                      <View style={{ elevation: 24 }}>
                        <Card containerStyle={tailwind("bg-white rounded-lg opacity-100")}>
                          <View style={tailwind("w-full items-center mb-5")}>
                            <Text style={tailwind("text-secondary text-base font-medium")}>Come and join us to get your discounted vouchers
                              and many more great deals.
                            </Text>
                          </View>
                          <View style={tailwind("self-center w-full mt-5")}>
                            <Button
                              buttonStyle={tailwind("rounded-lg bg-btn-primary")}
                              title="LOGIN / REGISTER"
                              titleStyle={tailwind("text-xl")}
                              onPress={
                                () => { this.props.navigation.navigate("LandingScreen", { prev_screen: this.props.navigation.state.routeName }) }
                              }
                            />

                          </View>
                        </Card>
                      </View>
                      :
                      <View />
                  }
                </View>
                :
                <View style={tailwind('')}>
                  {/* History Points */}
                  {/* Total Points */}
                  <View style={tailwind('justify-center items-center')}>
                    <Text style={tailwind('justify-center items-center text-primary text-2xl font-bold p-3')}>
                      Total Points: {this.state.points}
                    </Text>
                  </View>

                  {
                    (!this.state.fetch_data)
                      ?
                      <View>
                        {
                          (this.state.openPoint)
                            ?
                            // Opening Points
                            <View style={tailwind('justify-center items-center')}>
                              <Text style={tailwind('justify-center items-center text-primary text-2xl font-bold p-3')}>
                                Opening Points: {this.state.openPoint}
                              </Text>
                            </View>
                            :
                            <View />
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
                                />
                              </View>
                            </ScrollView>
                            :
                            <View style={[ApplicationStyles.screen.mainContainer, { justifyContent: 'center', flex: 0, height: '100%', paddingBottom: 250 }]}>
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
                              <Label style={{ color: Colors.primary }}>Oops! No point history yet.</Label>
                            </View>
                        }
                      </View>
                      :
                      <View />
                  }
                </View>
            }
          </ScrollView>

          {/* Loading Animation */}
          {this.handleRenderLoadingIndicator()}
        </View>
      </SafeAreaView>
    )
  }
}