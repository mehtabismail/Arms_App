/** REACT NATIVE **/
import React from 'react';
import {
  Alert,
  Dimensions,
  Image,
  Linking,
  PixelRatio,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

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
import VoucherContainer from '../Styles/VoucherStyles';
import VoucherController from '../Actions/VoucherControllers';
import LoginController from '../../General/Login/Actions/login_controller';

/** NPM LIBRARIES **/
import {FlatList} from 'react-native-gesture-handler';
import {NavigationActions, DrawerActions} from 'react-navigation';
import moment from 'moment';
import {getColor, tailwind} from '../../../../tailwind';

const ads_banner_path = AppConfig.ads_banner_voucher_scn_path;
const ads_screen_id = AppConfig.ads_voucher_screen_id;

// Get Font Scale from device
const pixelRatio = PixelRatio.get();

export default class VoucherView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      screenWidth: Dimensions.get('window').width,
      screenHeight: Dimensions.get('window').height,

      // Fetch data from server indiacator
      fetch_data: false,
      firstLoad: true,

      nric: '',
      loginUpdate: true,

      // FlatList
      datalist: [],
      flatListRentalTrigger: false,

      // Voucher Redemption
      showVoucherBarcodeModal: false,
      selectedTermsCondition: '',
      selectedBarcode: '',

      // World Time
      worldDateTime: moment().format('YYYY-MM-DD HH:mm:ss'),
    };

    // Create controller object
    this.voucherController = new VoucherController();
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
      // title: ' Voucher ',
      headerTitle: (
        <View style={VoucherContainer.headerButtonContainer}>
          <TouchableOpacity
            style={{paddingVertical: Metrics.smallPadding}}
            onPress={() =>
              navigation.navigate('CouponScreen', {loginUpdate: true})
            }>
            <Label
              style={{
                paddingHorizontal: Metrics.basePadding,
                color: getColor('primary'),
                fontSize: Fonts.size.medium,
              }}>
              COUPON
            </Label>
          </TouchableOpacity>
          <View style={{alignItems: 'center'}}>
            <Divider
              lineColor={Colors.secondary}
              lineWidth={2}
              type={'vertical'}
            />
          </View>
          <TouchableOpacity
            style={{
              paddingVertical: Metrics.smallPadding,
              backgroundColor: getColor('btn-primary'),
            }}>
            <Label
              style={{
                paddingHorizontal: Metrics.basePadding,
                color: 'white',
                fontWeight: 'bold',
                fontSize: Fonts.size.medium,
              }}>
              VOUCHER
            </Label>
          </TouchableOpacity>
        </View>
      ),
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
    };
  };

  // Navigate Function To Open Drawer
  navigateToScreen = (navigation, params = '') => {
    const navigateAction = NavigationActions.navigate({
      routeName: 'DrawerStack',
      params: params,
    });

    navigation.dispatch(navigateAction);
    navigation.dispatch(DrawerActions.openDrawer());
  };

  /****************************************************************/
  /*********************** COMPONENT  *****************************/
  /****************************************************************/

  componentDidMount() {
    this.props.navigation.setParams({this: this.navigateToScreen});
  }

  componentWillUnmount() {}

  componentDidUpdate(prevProps) {
    // Login Update
    var loginUpdate = this.props.navigation.getParam('loginUpdate', false);
    if (loginUpdate && this.props.navigation != prevProps.navigation) {
      this.props.navigation.setParams({loginUpdate: false});
      this.handleLoginUpdate();
    }

    // Voucher Update
    var voucher_update = this.props.navigation.getParam(
      'voucher_update',
      false,
    );
    if (voucher_update && this.props.navigation != prevProps.navigation) {
      this.props.navigation.setParams({voucher_update: false});
      this.handleGetVoucherData();
    }
  }

  handleRefresh = () => {
    this.handleFetchDataIndicator(true);
    this.handleGetVoucherData();
  };

  handleFetchDataIndicator(status) {
    this.setState({
      fetch_data: status,
    });
  }

  // Get real time from World Time API
  async getWorldTimeData() {
    var worldTimeAPICommunicator = new WorldTimeAPICommunicator();
    var worldDateTimeData =
      await worldTimeAPICommunicator.GetRealWorldTimeDateTime();
    var worldDateTime = worldDateTimeData
      ? moment(worldDateTimeData).format('YYYY-MM-DD HH:mm:ss')
      : moment().format('YYYY-MM-DD HH:mm:ss');
    this.setState({worldDateTime});
    return worldDateTime;
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
    this.props.navigation.setParams({loginUpdate: false});
    this.handleSetNRIC(nric);
  }

  handleSetNRIC(nric) {
    this.setState({nric, firstLoad: false}, () => {
      this.handleFetchDataIndicator(true);
      this.handleGetVoucherData();
    });
  }

  async handleGetVoucherData() {
    var worldDateTime = await this.getWorldTimeData();
    if (this.state.nric) {
      this.handleFetchDataIndicator(true);
      var init_result = this.voucherController.initScreen(worldDateTime);
      init_result.then((res) => {
        if (res.result == 1) {
          // Make screen scroll to top
          if (this.scrollView) {
            this.scrollView.scrollTo({x: 0, y: 0});
          }

          // Assign the data to datalist
          var voucher_list = res.data && res.data.length > 0 ? res.data : [];
          this.setState({
            datalist: voucher_list,
            flatListRentalTrigger: !this.state.flatListRentalTrigger,
          });
        }
        this.handleFetchDataIndicator(false);
      });
    } else {
      this.handleFetchDataIndicator(false);
    }
  }

  handleNavigateToTermConditionScreen(item) {
    this.setState(
      {
        selectedTermsCondition: item.terms,
        selectedBarcode: item.voucher_barcode,
      },
      () => {
        this.props.navigation.navigate('VoucherTermConditionScreen', {
          voucher_detail: {
            terms: item.terms,
            barcode: item.voucher_barcode,
            voucher_value: item.voucher_value,
            valid_from: item.valid_from,
            valid_to: item.valid_to,
            active: item.active,
            cancelled: item.cancelled,
            voucher_used: item.voucher_used,
            used_time: item.used_time,
            worldDateTime: this.state.worldDateTime,
          },
        });
      },
    );
  }

  /****************************************************************/
  /******************** SCREEN RENDERING **************************/
  /****************************************************************/

  // Ads Banner
  handleRenderAdsBanner() {
    return (
      <View
        style={[
          ApplicationStyles.screen.headerContainer,
          {marginBottom: Metrics.smallMargin},
        ]}>
        <AdsBanner
          dataFolderPath={ads_banner_path}
          screenId={ads_screen_id}
          imgResizeMode={'stretch'}
          height={Metrics.headerContainerHeight}
          arrowSize={0}
          onPress={(data) => {
            var url = data.image.link;
            if (url && url != 'undefined') {
              url =
                url.substring(0, 8) == 'https://' ||
                url.substring(0, 7) == 'http://'
                  ? url
                  : `http://${url}`;
              Linking.openURL(url);
            } else {
              Alert.alert('', I18n.t('alert_banner_empty_weblink'));
            }
          }}
          onRefresh={this.state.fetch_data}
        />
      </View>
    );
  }

  // Access Login Screen
  handleRenderAccessLoginScreen() {
    return (
      <View
        style={{
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,

          elevation: 5,
        }}>
        <Card containerStyle={tailwind('bg-white rounded-lg opacity-100')}>
          <View style={tailwind('w-full items-center mb-5')}>
            <Text style={tailwind('text-secondary text-base font-medium')}>
              Come and join us to get your discounted vouchers and many more
              great deals.
            </Text>
          </View>
          <View style={tailwind('self-center w-full mt-5')}>
            <Button
              buttonStyle={tailwind('rounded-lg bg-primary')}
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
    );
  }

  // Render voucher list
  handleRenderVoucherList() {
    return this.state.fetch_data ? (
      <View />
    ) : (
      <View>
        {this.state.datalist.length > 0 ? (
          <ScrollView
            style={{paddingBottom: 50}}
            ref={(ref) => (this.scrollView = ref)}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={this.state.fetch_data}
                onRefresh={this.handleRefresh}
              />
            }>
            <View style={tailwind('pb-12')}>
              {/* Voucher Header */}
              <View style={[VoucherContainer.headerContainer]}>
                <View>
                  <Text style={tailwind('text-primary text-2xl font-bold')}>
                    COLLECT NOW, SHOP NOW
                  </Text>
                </View>
                <View style={tailwind('')}>
                  <Text style={tailwind('text-secondary text-lg self-center')}>
                    FOR THE BETTER PRICE !!!
                  </Text>
                </View>
              </View>

              {/* FlatList */}
              <View style={tailwind('w-full pb-12')}>
                <FlatList
                  data={this.state.datalist}
                  renderItem={this.handleFlatListRenderItem}
                  extraData={this.state.flatListRentalTrigger}
                />
              </View>
            </View>
          </ScrollView>
        ) : (
          // Empty Data Screen
          this.handleRenderEmptyDataScreen()
        )}
      </View>
    );
  }

  // Empty list Screen
  handleRenderEmptyDataScreen() {
    return (
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
          Oops! No voucher have been issued yet.
        </Label>
      </View>
    );
  }

  // Voucher item
  handleFlatListRenderItem = ({item, index}) => {
    const redeem_status =
      item.active &&
      !item.cancelled &&
      !item.voucher_used &&
      item.valid_from < this.state.worldDateTime &&
      item.valid_to > this.state.worldDateTime;
    const voucher_primary_color = redeem_status
      ? Colors.primary
      : Colors.inactive_primary;
    const voucher_secondary_color = redeem_status
      ? Colors.secondary
      : Colors.inactive_secondary;

    return (
      <FadeInAnimation index={index}>
        <TouchableOpacity
          style={{
            marginVertical: Metrics.doubleBaseMargin,
            marginHorizontal: Metrics.baseMargin,
            backgroundColor: voucher_secondary_color,
            borderRadius: 20,
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 7,
            },
            shadowOpacity: 0.43,
            shadowRadius: 9.51,

            elevation: 15,
          }}
          onPress={() => {
            this.handleNavigateToTermConditionScreen(item);
          }}>
          <View
            style={{
              height: Metrics.voucherHeight,
              width: '100%',
              padding:
                pixelRatio > 1.5 ? Metrics.basePadding : Metrics.smallPadding,
              flexDirection: 'row',
            }}>
            {/* Voucher Left Part */}
            {this.handleRenderVoucherLeftPart(
              item,
              voucher_primary_color,
              voucher_secondary_color,
            )}

            {/* Voucher Right Part */}
            {this.handleRenderVoucherRightPart(
              item,
              voucher_primary_color,
              voucher_secondary_color,
            )}
            {this.handlerRenderVoucherValueBackground(voucher_primary_color)}

            {/* Voucher Company Logo Background */}
            {this.handlerRenderVoucherBackgroundCompanyLogo()}
          </View>
        </TouchableOpacity>
      </FadeInAnimation>
    );
  };

  handleRenderVoucherLeftPart(
    item,
    voucher_primary_color,
    voucher_secondary_color,
  ) {
    return (
      <View style={{width: '65%', flex: 1}}>
        {/* Voucher Title */}
        <View>
          <Label
            text={`VOUCHER`}
            style={tailwind('text-primary text-2xl font-bold')}
            // type={'normal_bold'}
            // style={{color: getColor('primary'), fontSize: Fonts.size.h4}}
          />
        </View>

        {/* Voucher Valid Date */}
        <View>
          <Label
            text={`VALID ${
              item.valid_from ? `FROM ${item.valid_from}` : ``
            } TILL ${item.valid_to ? item.valid_to : ``}`}
            type={'normal'}
            style={{color: voucher_primary_color, fontSize: Fonts.size.small}}
          />
        </View>

        {/* Divider */}
        <View style={{marginVertical: Metrics.baseMargin, width: '20%'}}>
          <Divider lineWidth={5} lineColor={voucher_primary_color} />
        </View>

        {/* Voucher Code & Voucher Un-redeem Messages */}
        <View style={{flex: 1, justifyContent: 'space-evenly'}}>
          <Label
            type="normal_bold"
            style={{
              color: getColor('primary'),
              fontSize: Fonts.size.large,
            }}>{`${item.voucher_barcode}`}</Label>
          {!item.active ? (
            <View>
              <Label
                type="normal"
                style={{
                  color: voucher_primary_color,
                  fontSize: Fonts.size.small,
                }}>{`- Voucher isn't active yet.`}</Label>
            </View>
          ) : (
            <View />
          )}
          {item.cancelled ? (
            <View>
              <Label
                type="normal"
                style={{
                  color: voucher_primary_color,
                  fontSize: Fonts.size.small,
                }}>{`- Voucher has been cancelled`}</Label>
            </View>
          ) : (
            <View />
          )}
          {item.voucher_used ? (
            <View>
              <Label
                type="normal"
                style={{
                  color: voucher_primary_color,
                  fontSize: Fonts.size.small,
                }}>{`- Voucher used at ${item.used_time}`}</Label>
            </View>
          ) : (
            <View />
          )}
          {item.valid_from > this.state.worldDateTime ? (
            <View>
              <Label
                type="normal"
                style={{
                  color: voucher_primary_color,
                  fontSize: Fonts.size.small,
                }}>{`- Voucher able to use start from ${item.valid_from}`}</Label>
            </View>
          ) : (
            <View />
          )}
          {item.valid_to < this.state.worldDateTime ? (
            <View>
              <Label
                type="normal"
                style={{
                  color: voucher_primary_color,
                  fontSize: Fonts.size.small,
                }}>{`- Voucher expired at ${item.valid_to}`}</Label>
            </View>
          ) : (
            <View />
          )}
        </View>
      </View>
    );
  }

  handleRenderVoucherRightPart(
    item,
    voucher_primary_color,
    voucher_secondary_color,
  ) {
    return (
      <View
        style={{
          width: '35%',
          alignItems: 'flex-end',
          justifyContent: 'flex-end',
        }}>
        <View>
          <Label
            text={`${AppConfig.prefix_currency}`}
            type={'normal_bold'}
            style={{
              color: voucher_secondary_color,
              fontSize: Fonts.size.h6,
              alignSelf: 'flex-start',
            }}
          />

          <Label
            text={`${
              item.voucher_value.toString().length == 1
                ? ` ${item.voucher_value}`
                : item.voucher_value
            }`}
            type="normal_bold"
            style={{
              color: voucher_secondary_color,
              fontSize:
                item.voucher_value.toString().length > 2
                  ? item.voucher_value.toString().length > 4
                    ? Fonts.size.h1 - 10 //Character more than 4
                    : Fonts.size.h1 + 10 //Character 3 and 4
                  : Fonts.size.h1 + 30, //Character 1 and 2
            }}
          />
        </View>
      </View>
    );
  }

  handlerRenderVoucherValueBackground(voucher_primary_color) {
    return (
      //Voucher Value Background
      <View
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          zIndex: -1,
          width: '45%',
          height: 0,
          borderLeftWidth: Metrics.voucherHeight / 4,
          borderLeftColor: 'transparent',
          borderBottomWidth: Metrics.voucherHeight,
          // borderBottomColor: voucher_primary_color,
          borderBottomColor: getColor('primary'),
          borderTopRightRadius: 20,
          borderBottomRightRadius: 20,
        }}
      />
    );
  }

  handlerRenderVoucherBackgroundCompanyLogo() {
    return (
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          zIndex: -2,
          alignItems: 'center',
          justifyContent: 'center',
          padding: Metrics.basePadding,
        }}>
        <Image
          source={Images.company_logo}
          style={{
            width: '100%',
            height: Metrics.voucherHeight,
            resizeMode: 'contain',
            opacity: 0.2,
          }}
        />
      </View>
    );
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
    return (
      /**Start Safe Area**/
      <SafeAreaView
        style={tailwind('bg-gray-200 h-full w-full')}
        forceInset={{vertical: 'never'}}>
        <View style={tailwind('flex-1')}>
          {/* Ads Banner */}
          <View>
          <View style={tailwind('mt-20 mx-3')}>{this.handleRenderAdsBanner()}</View></View>
          <View style={tailwind('flex-1')}>
            {/* Screen on loading, hide default state data */}
            {this.state.firstLoad ? (
              <View />
            ) : !this.state.nric ? (
              // Access Login Screen
              this.handleRenderAccessLoginScreen()
            ) : (
              // Voucher Display
              <View style={{width: '100%'}}>
                {this.handleRenderVoucherList()}
              </View>
            )}

            {/* Loading Animation */}
            {this.handleRenderLoadingIndicator()}
          </View>
        </View>
      </SafeAreaView>
    );
  }
}
