/** REACT NATIVE **/
import React from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  Linking,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';

import {Card, Button, Text} from 'react-native-elements';
import {tailwind} from '../../../../tailwind';

/** PROJECT FILES **/
import {
  ApplicationStyles,
  Colors,
  Metrics,
  Fonts,
  Images,
  AdsBanner,
  AppsButton,
  Divider,
  LoadingIndicator,
  Label,
  FadeInAnimation,
  SpringAnimation,
  I18n,
  AppConfig,
  WorldTimeAPICommunicator,
} from '../../../Services/LibLinking';
import PackageContainer from '../Styles/PackageStyles';
import PackageContainerController from '../Actions/PackageControllers';
import LoginController from '../../General/Login/Actions/login_controller';

/** NPM LIBRARIES **/
import {NavigationActions, DrawerActions} from 'react-navigation';
import Icon from 'react-native-vector-icons/FontAwesome5';
import * as Progress from 'react-native-progress';

export default class PackageView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      screenWidth: Dimensions.get('window').width,
      screenHeight: Dimensions.get('window').height,

      // Fetch data from server indiacator
      fetch_data: false,
      check: false,

      // FlatList
      datalist: [],
      flatListRentalTrigger: false,

      // Refresh page control
      refreshing: false,

      // User data
      nric: '',
    };

    // Create controller object
    this.packageController = new PackageContainerController();
    this.loginController = new LoginController();
  }

  /**Navigation Bottom Tab**/
  static navigationOptions = ({navigation, navigationOptions}) => {
    const params = navigation.state.params || {};
    var navigateToScreen = params.this;

    return {
      title: 'Package',
      headerLeft: (
        <TouchableOpacity
          style={tailwind('bg-white rounded-lg opacity-100 p-2 ml-3 mt-3')}
          onPress={() => navigateToScreen(navigation, {loginUpdate: true})}>
          <Image
            style={{
              width: Metrics.icons.medium,
              height: Metrics.icons.medium,
              tintColor: 'black',
            }}
            source={Images.menu}
          />
        </TouchableOpacity>
      ),
      headerRight: (
        <TouchableOpacity
          style={tailwind('bg-white rounded-lg opacity-100 p-2 mr-3 mt-3')}
          onPress={() =>
            navigation.navigate('AllPackageRedeemHistoryScreen', {
              screenSource: 'rate_us',
              loginUpdate: true,
            })
          }>
          <Icon name={'star-half-alt'} size={30} color="black" style={{}} />
        </TouchableOpacity>
      ),
    };
  };
  /**End Navigation Bottom Tab**/

  // navigate to pass params
  navigateToScreen = (navigation, params = '') => {
    const navigateAction = NavigationActions.navigate({
      routeName: 'DrawerStack',
      params: params,
    });

    navigation.dispatch(navigateAction);
    navigation.dispatch(DrawerActions.openDrawer());
  };

  componentDidMount() {
    // Init Screen
    // this.handleGetPackageData();
    this.handleLoginUpdate();

    this.props.navigation.setParams({this: this.navigateToScreen});
  }

  componentWillUnmount() {}

  componentDidUpdate(prevProps) {
    // this.handleLoginUpdate();
    // Handle Login Update Process, compare prev props with current Props is to prevent infinite loop and hit the update max limit.
    var loginUpdate = this.props.navigation.getParam('loginUpdate', false);
    if (loginUpdate && prevProps.navigation != this.props.navigation) {
      this.props.navigation.setParams({loginUpdate: false});
      this.handleLoginUpdate();
    }
  }

  async handleLoginUpdate() {
    var nric = '';
    var login_user = await this.loginController.fetchCurrentLoginMember();
    if (login_user.result == 1 && login_user.data) {
      nric = login_user.data.nric;
    }
    if (this.scrollView) {
      this.scrollView.scrollTo({x: 0, y: 0});
    }
    this.handleSetNRIC(nric);
  }

  async handleSetNRIC(nric) {
    this.setState({nric, check: true});
    this.handleGetPackageData();
  }

  handleGetPackageData() {
    this.handleFetchDataIndicator(true);
    var init_result = this.packageController.initScreen();
    init_result.then((res) => {
      if (res.result == 1) {
        var package_list = res.data;
        this.setState({
          datalist: package_list,
          flatListRentalTrigger: !this.state.flatListRentalTrigger,
        });
      } else {
        // Disabled to alert message to prevent user see API return message.
        // Alert.alert(
        //   res.data.title,
        //   res.data.msg
        // )
      }
      this.handleFetchDataIndicator(false);
    });
  }

  handleFlatListRenderItem = ({item, index}) => {
    return (
      <FadeInAnimation index={index}>
        <TouchableOpacity
          style={{
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,

            elevation: 5,
          }}
          onPress={() => {
            this.props.navigation.navigate('PackageItemScreen', {
              package_item_data: {
                package_guid: item.pk_guid,
                package_title: item.package_title,
                used_entry: item.used_entry,
                remaining_entry: item.remaining_entry,
              },
            });
          }}>
          <Card containerStyle={tailwind('bg-white rounded-lg opacity-100')}>
            {/* package image */}
            <View style={{}}>
              {item.promo_photo_url ? (
                <Image
                  source={{uri: `${item.promo_photo_url}`}}
                  resizeMode={'stretch'}
                  style={PackageContainer.packageImageStyle}
                />
              ) : (
                <View />
              )}
            </View>

            {/* package details */}
            <View>
              {/* package name */}
              <View style={tailwind('mb-2 py-1')}>
                <Label style={tailwind('text-primary text-lg font-bold')}>
                  {item.package_title}
                </Label>
                <Label style={tailwind('text-secondary text-base my-1')}>
                  {`Purchased ${item.purchase_qty} quantity in ${item.pos_branch_code} ${item.purchase_date}`}
                </Label>
              </View>

              {/* package credit status */}
              <View
                style={[
                  {
                    width: '100%',
                    height: 150,
                    flexDirection: 'row',
                  },
                ]}>
                {/* package progress chart */}
                <View
                  style={[
                    {
                      width: '50%',
                      alignItems: 'center',
                      justifyContent: 'center',
                      paddingVertical: 5,
                    },
                  ]}>
                  <Progress.Circle
                    size={140}
                    progress={item.used_entry / item.earn_entry}
                    // progress={0.4}
                    showsText={true}
                    formatText={() => {
                      return 'Credit';
                    }}
                    textStyle={{color: Colors.text_color_1}}
                    strokeCap={'round'}
                    color={Colors.primary}
                    unfilledColor={Colors.background}
                    borderWidth={0}
                    thickness={10}
                  />
                </View>

                {/* package status */}
                <View style={tailwind('w-1/2')}>
                  <View
                    style={{
                      alignItems: 'center',
                      height: '50%',
                      flexDirection: 'row',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    <Label style={PackageContainer.labelNameStyle}>
                      {`Used: `}
                    </Label>
                    <Label
                      style={[
                        item.used_entry.toString().length < 4
                          ? PackageContainer.labelDataStyle1
                          : PackageContainer.labelDataStyle2,
                      ]}>
                      {`${item.used_entry}`}
                    </Label>
                  </View>

                  <View
                    style={{
                      alignItems: 'center',
                      height: '50%',
                      flexDirection: 'row',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    <Label style={PackageContainer.labelNameStyle}>
                      {`Remaining: `}
                    </Label>
                    <Label
                      style={[
                        item.remaining_entry.toString().length < 4
                          ? PackageContainer.labelDataStyle1
                          : PackageContainer.labelDataStyle2,
                      ]}>
                      {`${item.remaining_entry}`}
                    </Label>
                  </View>
                </View>
              </View>

              {/* package info */}
              <View style={tailwind('mt-2 py-1')}>
                <Label style={{fontSize: Fonts.size.medium}}>
                  {`Last Update: ${item.last_update}`}
                </Label>
                <Label style={{fontSize: Fonts.size.medium}}>
                  {`Receipt Ref No.: ${item.pos_receipt_ref_no}`}
                </Label>
                <Label style={{fontSize: Fonts.size.medium}}>
                  {`Package Doc No.: ${item.doc_no}`}
                </Label>
              </View>
            </View>
          </Card>
        </TouchableOpacity>
      </FadeInAnimation>
    );
  };

  fetchData = async () => {
    this.handleGetPackageData();
  };

  handleRefresh = () => {
    this.setState({refreshing: true});
    this.fetchData().then(() => {
      this.setState({refreshing: false});
    });
  };

  handleFetchDataIndicator(status) {
    this.setState({
      fetch_data: status,
    });
  }

  // Loading Indicator
  handleRenderLoadingIndicator() {
    return (
      <LoadingIndicator
        visible={this.state.fetch_data}
        size={'large'}
        text={'Fetching data...'}
      />
    );
  }

  render() {
    /** Local variable config **/
    var portrait = this.state.screenWidth < this.state.screenHeight;
    /** End local variable config **/

    return (
      /**Start Safe Area**/
      <SafeAreaView
        style={ApplicationStyles.screen.safeAreaContainer}
        forceInset={{vertical: 'never'}}>
        {!this.state.nric ? (
          <View style={tailwind('mt-20')}>
            {this.state.check ? (
              <View>
                <Card
                  containerStyle={tailwind('bg-white rounded-lg opacity-100')}>
                  <View style={tailwind('w-full items-center mb-5')}>
                    <Text
                      style={tailwind('text-secondary text-base font-medium')}>
                      Come and join us to get your discounted vouchers and many
                      more great deals.
                    </Text>
                  </View>
                  <View style={tailwind('self-center w-full mt-5')}>
                    <Button
                      buttonStyle={tailwind('rounded-lg bg-btn-primary')}
                      title="LOGIN / REGISTER"
                      titleStyle={tailwind('text-xl')}
                      onPress={() => {
                        this.props.navigation.navigate('LandingScreen', {
                          prev_screen: this.props.navigation.state.routeName,
                        });
                      }}
                    />
                  </View>
                </Card>
              </View>
            ) : (
              <View />
            )}
          </View>
        ) : (
          <View style={tailwind('flex-1 h-full w-full')}>
            {/* Package Display */}
            {!this.state.fetch_data ? (
              <View style={tailwind('mt-20')}>
                {this.state.datalist.length > 0 ? (
                  <View>
                    {/* package availability */}
                    <View style={tailwind('justify-center items-center pb-3')}>
                      <Text style={tailwind('text-2xl text-primary font-bold')}>
                        Available Packages: {this.state.datalist.length}
                      </Text>
                    </View>
                    <ScrollView
                      ref={(ref) => (this.scrollView = ref)}
                      showsVerticalScrollIndicator={false}
                      refreshControl={
                        <RefreshControl
                          refreshing={this.state.refreshing}
                          onRefresh={this.handleRefresh}
                        />
                      }>
                      {/* Package List */}
                      <View style={tailwind('mb-52')}>
                        <FlatList
                          data={this.state.datalist}
                          renderItem={this.handleFlatListRenderItem}
                          key={portrait ? 'h' : 'v'}
                          extraData={this.state.flatListRentalTrigger}
                          // horizontal={true}
                        />
                      </View>
                    </ScrollView>
                  </View>
                ) : (
                  <View
                    style={[
                      ApplicationStyles.screen.mainContainer,
                      {
                        justifyContent: 'center',
                        flex: 0,
                        height: '100%',
                        paddingBottom: 250,
                      },
                    ]}>
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
                    <Label style={{color: Colors.primary}}>
                      Oops! No package have been issued yet.
                    </Label>
                  </View>
                )}
              </View>
            ) : (
              <View>
                {/* Skeleton Screen */}
                <View
                  style={{padding: Metrics.basePadding, alignItems: 'center'}}>
                  {/* EMPTY package availability */}
                  <View
                    style={{
                      height: 50,
                      width: '75%',
                      backgroundColor: '#E8E8E8',
                    }}
                  />

                  {/* EMPTY Package List */}
                  <View
                    style={{
                      margin: Metrics.baseMargin,
                      borderRadius: Metrics.containerRadius,
                      backgroundColor: Colors.body,
                      height: 300,
                      width: '100%',
                      marginVertical: Metrics.doubleBaseMargin,
                    }}>
                    <View
                      style={{
                        height: 100,
                        backgroundColor: '#E8E8E8',
                        marginBottom: Metrics.smallPadding,
                        borderTopLeftRadius: Metrics.containerRadius,
                        borderTopRightRadius: Metrics.containerRadius,
                      }}
                    />
                    <View
                      style={{
                        height: 30,
                        width: '70%',
                        backgroundColor: '#E8E8E8',
                        marginVertical: Metrics.smallPadding,
                        marginHorizontal: Metrics.basePadding,
                      }}
                    />
                    <View
                      style={{
                        height: 15,
                        width: '45%',
                        backgroundColor: '#E8E8E8',
                        marginVertical: Metrics.smallPadding,
                        marginHorizontal: Metrics.basePadding,
                      }}
                    />
                  </View>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Loading Animation */}
        {this.handleRenderLoadingIndicator()}
      </SafeAreaView>
    );
  }
}
