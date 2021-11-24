/** REACT NATIVE **/
import React from 'react';
import {
  Alert,
  Dimensions,
  Image,
  PixelRatio,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';

import {getColor, tailwind} from '../../../../tailwind';
import {Card, Button, Text} from 'react-native-elements';

/** PROJECT FILES **/
import {
  Colors,
  Fonts,
  Images,
  Metrics,
  ApplicationStyles,
  AppsButton,
  Divider,
  Label,
  LoadingIndicator,
  Barcode,
  I18n,
  AppConfig,
} from '../../../Services/LibLinking';
import CouponController from '../Actions/CouponControllers';
import CouponContainer from '../Styles/CouponStyles';

/** NPM LIBRARIES **/
import NetInfo from '@react-native-community/netinfo';
import {NavigationActions} from 'react-navigation';
import moment from 'moment';

// Get Font Scale from device
const pixelRatio = PixelRatio.get();

export default class CouponTNCView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      screenWidth: Dimensions.get('window').width,
      screenHeight: Dimensions.get('window').height,

      balance_usage: '',

      // Fetch data from server indicator
      fetch_data: false,

      // FlatList
      datalist: [],
      description: '',
      flatListRentalTrigger: false,

      // Refresh page control
      refreshing: false,

      // Coupon Redemption
      showCouponBarcodeModal: false,
      coupon_detail: {
        barcode: '',
        value: '',
        discount_by: '',
        member_limit_count: '',
        total_used_count: '',
        valid_from: '',
        valid_to: '',
        time_from: '',
        time_to: '',
        min_qty: '',
        min_amt: '',
        min_receipt_amt: '',
        remark: '',
        limit_sid_list: '',
        dept_desc: '',
        brand_desc: '',
        vendor_desc: '',
        worldDateTime: '',
        member_limit_mobile_day_start: '',
        member_limit_mobile_day_end: '',
        member_limit_profile_info: '',
        registered_validation: '',
        member_limit_profile_info_validation: '',
        member_profile_info_require_item: '',
        register_coupon: '',
        register_coupon_valid_from: '',
        register_coupon_valid_to: '',
      },
      redeemStatus: true,
    };

    this.couponController = new CouponController();
  }

  /****************************************************************/
  /************************ HEADER ********************************/
  /****************************************************************/

  // Navigation Tab
  static navigationOptions = ({navigation, navigationOptions}) => {
    const params = navigation.state.params || {};
    return {
      title: ' Term and Condition ',
      // headerLeft: (
      //   <TouchableOpacity style={{paddingLeft: 5}} onPress={() => navigation.navigate('CouponScreen')}>
      //     <Image
      //       style={{width: Metrics.icons.regular, height: Metrics.icons.regular, tintColor: Colors.secondary}}
      //       source={Images.arrowLeft}
      //     />
      //   </TouchableOpacity>
      // ),
      headerLeft: (
        <View>
          <TouchableOpacity
            style={tailwind('bg-white rounded-lg opacity-100 p-2 mx-3 mt-3')}
            onPress={() => navigation.navigate('CouponScreen')}>
            <Image
              style={{
                width: Metrics.icons.regular,
                height: Metrics.icons.regular,
                tintColor: 'black',
              }}
              source={Images.arrowLeft}
            />
          </TouchableOpacity>
        </View>
      ),
      // headerRight: (
      //   <View
      //     style={{
      //       width: Metrics.icons.regular,
      //       height: Metrics.icons.regular,
      //       paddingRight: 5,
      //     }}></View>
      // ),
    };
  };

  /****************************************************************/
  /*********************** COMPONENT  *****************************/
  /****************************************************************/

  componentDidMount() {
    var coupon_detail = this.props.navigation.getParam('coupon_detail');
    this.setState({
      coupon_detail: coupon_detail,
      redeemStatus:
        (coupon_detail.total_used_count < coupon_detail.member_limit_count ||
          coupon_detail.member_limit_count == 0) &&
        `${coupon_detail.valid_from} ${coupon_detail.time_from}` <
          coupon_detail.worldDateTime &&
        `${coupon_detail.valid_to} ${coupon_detail.time_to}` >
          coupon_detail.worldDateTime &&
        coupon_detail.registered_validation &&
        coupon_detail.member_limit_profile_info_validation,
    });

    this.handleLoadSkuDescription(coupon_detail);
    this.getBalanceUsage(
      coupon_detail.member_limit_count,
      coupon_detail.total_used_count,
    );
  }

  componentWillUnmount() {
    const navigateAction = NavigationActions.navigate({
      routeName: 'CouponScreen',
      params: {coupon_update: true},
    });
    this.props.navigation.dispatch(navigateAction);
  }

  handleRefresh = () => {
    this.handleFetchDataIndicator(true);
    this.handleLoadSkuDescription(this.state.coupon_detail);
  };

  handleFetchDataIndicator(status) {
    this.setState({
      fetch_data: status,
    });
  }

  networkConnectValidation() {
    let result = new Promise((resolve, reject) => {
      NetInfo.isConnected.fetch().done((isConnected) => {
        if (isConnected) {
          resolve({result: 1, data: isConnected});
        } else {
          resolve({
            result: 0,
            data: {
              title: I18n.t('network_error_title'),
              msg: I18n.t('network_error_msg'),
            },
          });
        }
      });
    });
    return result;
  }

  /****************************************************************/
  /******************** FUNCTIONALITY *****************************/
  /****************************************************************/

  handleCouponBarcodeModalVisibleOnChanged(status) {
    this.setState({
      showCouponBarcodeModal: status,
    });
  }

  async handleLoadSkuDescription(coupon_detail) {
    var network = await this.networkConnectValidation();
    if (network.result == 1) {
      this.handleFetchDataIndicator(true);
      var datalist = [];
      Object.keys(coupon_detail.limit_sid_list).map((value, index) => {
        datalist.push({
          key: value.toString(),
          sku_id: coupon_detail.limit_sid_list[value],
        });
      });

      var sku_desc_list = this.couponController.GetSkuDescription(datalist);
      sku_desc_list.then((res) => {
        if (res.result == 1) {
          this.setState({
            datalist: res.data,
            description: res.desc.join(', '),
            check_connection: true,
          });
        }
        this.handleFetchDataIndicator(false);
      });
    } else {
      this.handleFetchDataIndicator(false);
      this.setState({
        check_connection: false,
      });
    }
  }

  getBalanceUsage(limit, usage) {
    var balance = limit - usage;
    this.setState({
      balance_usage: balance,
    });
  }

  /****************************************************************/
  /******************** SCREEN RENDERING **************************/
  /****************************************************************/

  handleRenderCouponImage(coupon_primary_color, coupon_secondary_color) {
    // Coupon Valid Date
    var valid_from =
      this.state.coupon_detail.valid_from &&
      !this.state.coupon_detail.register_coupon
        ? `FROM ${this.state.coupon_detail.valid_from} ${this.state.coupon_detail.time_from}`
        : this.state.coupon_detail.register_coupon
        ? `FROM ${this.state.coupon_detail.register_coupon_valid_from}`
        : ``;
    var valid_to =
      this.state.coupon_detail.valid_to &&
      !this.state.coupon_detail.register_coupon
        ? `${this.state.coupon_detail.valid_to} ${this.state.coupon_detail.time_to}`
        : this.state.coupon_detail.register_coupon
        ? this.state.coupon_detail.register_coupon_valid_to
        : ``;
    var coupon_valid_date = `VALID ${valid_from} TILL ${valid_to}`;

    return (
      <View
        style={{
          height: Metrics.couponHeight,
          borderRadius: 10,
          // borderWidth:1,
          width: '100%',
          padding:
            pixelRatio > 1.5 ? Metrics.basePadding : Metrics.smallPadding,
          backgroundColor: coupon_secondary_color,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 7,
          },
          shadowOpacity: 0.43,
          shadowRadius: 9.51,

          elevation: 15,
        }}>
        {/* Coupon Left Part */}
        <View style={tailwind('flex-1 w-full ')}>
          {/* Coupon Title */}
          <View>
            <Label
              text={`COUPON`}
              style={tailwind('text-primary text-2xl font-bold')}
            />
          </View>

          {/* Coupon Valid Date */}
          <View style={tailwind('mt-1')}>
            <Label
              text={coupon_valid_date}
              style={tailwind('text-secondary text-xs font-bold')}
            />
          </View>

          {/* Divider */}
          <View style={tailwind('mt-3 w-1/2')}>
            <Divider
              lineWidth={5}
              // lineColor={coupon_primary_color}
              lineColor={getColor('secondary')}
            />
          </View>

          {/* Coupon Code & Coupon Un-redeem Messages */}
          {/* <View style={{flex: 1, justifyContent: 'space-evenly'}}>
            <Label type="normal_bold" style={{color: coupon_primary_color, fontSize: Fonts.size.large}}>{`${this.state.coupon_detail.barcode.replace(this.state.coupon_detail.barcode.substring(2,14), "************")}`}</Label>
            {
              (this.state.coupon_detail.member_limit_count)
              ?
              <View>
                <Label
                  text={(this.state.coupon_detail.total_used_count == this.state.coupon_detail.member_limit_count)?`- Coupon have reached the limited usage.`:''}
                  type="normal" 
                  style={{color: coupon_primary_color, fontSize: Fonts.size.small}}
                />
              </View>
              :
              <View/>
            }
            {
              (this.state.coupon_detail.valid_from > this.state.coupon_detail.worldDateTime)
              ?
              <View><Label type="normal" style={{color: coupon_primary_color, fontSize: Fonts.size.small}}>{`- Coupon able to use start from ${this.state.coupon_detail.valid_from}`}</Label></View>
              :
              <View/>
            }
            {
              (this.state.coupon_detail.valid_to < this.state.coupon_detail.worldDateTime)
              ?
              <View><Label type="normal" style={{color: coupon_primary_color, fontSize: Fonts.size.small}}>{`- Coupon expired at ${this.state.coupon_detail.valid_to}`}</Label></View>
              :
              <View/>
            }
          </View> */}
        </View>
        {/* END of Coupon Left Part */}

        {/* Coupon Bottom Part */}
        {/* Discount banner with divider */}
        <View style={tailwind('')}>
          <Divider
            lineColor={getColor('primary')}
            lineWidth={2}
            text={'Discount'}
            textColor={getColor('primary')}
            textBold={true}
            // textColor={coupon_primary_color}
          />
        </View>

        {/* Coupon Value */}
        <View style={tailwind('flex-row justify-center items-center p-3')}>
          <Label
            text={
              this.state.coupon_detail.discount_by == 'amt'
                ? `${AppConfig.prefix_currency}`
                : ''
            }
            style={tailwind('text-primary text-3xl font-bold')}
          />
          <Label
            text={`${this.state.coupon_detail.value}${
              this.state.coupon_detail.discount_by == 'per' ? '%' : ''
            }`}
            style={tailwind('text-primary text-3xl font-bold')}
          />
        </View>
        {/* END of Coupon Bottom Part */}

        {/* Coupon Company Logo Background */}
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
              height: Metrics.couponHeight,
              resizeMode: 'contain',
              opacity: 0.2,
            }}
          />
        </View>
      </View>
    );
  }

  handleRenderCouponDetails() {
    return (
      <View style={{padding: Metrics.basePadding}}>
        {/* Tittle */}
        <View style={{marginBottom: Metrics.baseMargin}}>
          <Text style={tailwind('text-primary text-2xl font-bold')}>
            {this.state.coupon_detail.barcode
              ? this.state.coupon_detail.barcode.replace(
                  this.state.coupon_detail.barcode.substring(2, 14),
                  '************',
                )
              : ``}
          </Text>
        </View>

        {/* Redeem Status */}
        {this.handleRenderRedeemStatus()}

        {/* Terms & Conditions */}
        {this.handleRenderTNC()}
      </View>
    );
  }

  handleRenderRedeemStatus() {
    return (
      <View style={tailwind('mt-3')}>
        <Text
          style={tailwind(
            'text-primary text-xl font-bold',
          )}>{`Redeem Status`}</Text>
        {this.state.redeemStatus == true ? (
          this.handleRenderRedeemStatusText(
            true,
            `Coupon is ready to be redeem.`,
          )
        ) : (
          <View>
            {/* Error - Reached Limit Usage */}
            {this.state.coupon_detail.member_limit_count &&
            this.state.coupon_detail.total_used_count ==
              this.state.coupon_detail.member_limit_count ? (
              this.handleRenderRedeemStatusText(
                false,
                `Coupon have reached the limited usage.`,
              )
            ) : (
              <View />
            )}
            {/* Error - Validation Date */}
            {`${this.state.coupon_detail.valid_from} ${this.state.coupon_detail.time_from}` >
            this.state.coupon_detail.worldDateTime ? (
              this.handleRenderRedeemStatusText(
                false,
                `Coupon able to use start from ${this.state.coupon_detail.valid_from} ${this.state.coupon_detail.time_from}.`,
              )
            ) : (
              <View />
            )}
            {/* Error - Expired Date */}
            {`${this.state.coupon_detail.valid_to} ${this.state.coupon_detail.time_to}` <
            this.state.coupon_detail.worldDateTime ? (
              this.handleRenderRedeemStatusText(
                false,
                `Coupon expired at ${this.state.coupon_detail.valid_to} ${this.state.coupon_detail.time_to}.`,
              )
            ) : (
              <View />
            )}
            {/* Error - Registered Validation Failed */}
            {!this.state.coupon_detail.registered_validation ? (
              this.handleRenderRedeemStatusText(
                false,
                `Coupon only available once registered in Mobile App since Day ${this.state.coupon_detail.member_limit_mobile_day_start} to ${this.state.coupon_detail.member_limit_mobile_day_end}.`,
              )
            ) : (
              <View />
            )}
            {/* Error - Limit Profile Info Validation Failed */}
            {!this.state.coupon_detail.member_limit_profile_info_validation ? (
              this.handleRenderRedeemStatusText(
                false,
                `Coupon require to complete member profile info (${this.state.coupon_detail.member_profile_info_require_item.toString()}).`,
              )
            ) : (
              <View />
            )}
          </View>
        )}
      </View>
    );
  }

  handleRenderRedeemStatusText(status, text) {
    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          margin: Metrics.baseMargin,
          marginLeft: 0,
        }}>
        <Image
          source={status ? Images.round_tick : Images.round_cancel}
          style={{
            height: Metrics.icons.small,
            width: Metrics.icons.small,
            marginRight: Metrics.smallMargin,
            tintColor: status ? Colors.check_box_green : Colors.check_box_red,
          }}
        />
        <View>
          <Text>{`${text}`}</Text>
        </View>
      </View>
    );
  }

  handleRenderTNC() {
    // Coupon Valid Date
    var valid_from =
      this.state.coupon_detail.valid_from &&
      !this.state.coupon_detail.register_coupon
        ? `${this.state.coupon_detail.valid_from} ${this.state.coupon_detail.time_from}`
        : this.state.coupon_detail.register_coupon
        ? this.state.coupon_detail.register_coupon_valid_from
        : ``;
    var valid_to =
      this.state.coupon_detail.valid_to &&
      !this.state.coupon_detail.register_coupon
        ? `${this.state.coupon_detail.valid_to} ${this.state.coupon_detail.time_to}`
        : this.state.coupon_detail.register_coupon
        ? this.state.coupon_detail.register_coupon_valid_to
        : ``;

    return (
      <View style={tailwind('mt-3')}>
        <Text style={tailwind('text-primary text-xl font-bold')}>
          {`Terms and Conditions:`}
        </Text>

        {/* Condition in Valid Department Used */}
        {this.state.coupon_detail.dept_desc ? (
          this.handleRenderTNCText(
            `This coupon can only be used in ${this.state.coupon_detail.dept_desc} department.`,
          )
        ) : (
          <View />
        )}

        {/* Condition in Valid Brand Items */}
        {this.state.coupon_detail.brand_desc ? (
          this.handleRenderTNCText(
            `This coupon can only be used for ${this.state.coupon_detail.brand_desc} brand items.`,
          )
        ) : (
          <View />
        )}

        {/* Condition in Valid Vender*/}
        {this.state.coupon_detail.vendor_desc ? (
          this.handleRenderTNCText(
            `This coupon is only valid at ${this.state.coupon_detail.vendor_desc} vendor.`,
          )
        ) : (
          <View />
        )}

        {/* Condition in Valid Products */}
        {this.state.coupon_detail.limit_sid_list.length > 0 ? (
          <View>
            {this.state.check_connection
              ? this.handleRenderTNCText(
                  `This coupon is only valid for ${this.state.description.toString()} product/s.`,
                )
              : this.handleRenderTNCText(
                  `Please connect to internet to get the specific product valid for the coupon redemption.`,
                )}
          </View>
        ) : (
          <View />
        )}

        {/* Validation Date Condition */}
        {this.handleRenderTNCText(
          `This coupon is valid starting from ${valid_from} until ${valid_to}.`,
        )}

        {/* Minimum Purchase Quantity */}
        {this.state.coupon_detail.min_qty ? (
          this.handleRenderTNCText(
            `Minimum purchase quantity: ${this.state.coupon_detail.min_qty}`,
          )
        ) : (
          <View />
        )}

        {/* Minimum Purchase Amount */}
        {this.state.coupon_detail.min_amt ? (
          this.handleRenderTNCText(
            `Minimum purchase amount: ${AppConfig.prefix_currency} ${this.state.coupon_detail.min_amt}`,
          )
        ) : (
          <View />
        )}

        {/* Minimum Spend in Receipt Amount */}
        {this.state.coupon_detail.min_receipt_amt ? (
          this.handleRenderTNCText(
            `Spend ${AppConfig.prefix_currency} ${this.state.coupon_detail.min_receipt_amt} and above in a single receipt to make you eligible for the coupon redemption.`,
          )
        ) : (
          <View />
        )}

        {/* Notice */}
        {this.handleRenderTNCText(
          `This coupon is unexchangeable for cash or any products.`,
        )}

        {/* Remarks */}
        {this.state.coupon_detail.remark ? (
          this.handleRenderTNCText(`${this.state.coupon_detail.remark}`)
        ) : (
          <View />
        )}

        {/* Balance Usage */}
        {this.state.coupon_detail.member_limit_count
          ? this.handleRenderTNCText(
              `Balance usage: ${this.state.balance_usage}`,
            )
          : this.handleRenderTNCText(`This coupon has unlimited usage.`)}
      </View>
    );
  }

  handleRenderTNCText(text) {
    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          margin: Metrics.baseMargin,
          marginLeft: 0,
        }}>
        <Image
          source={Images.black_dot}
          style={{
            height: Metrics.icons.tiny - 5,
            width: Metrics.icons.tiny - 5,
            marginRight: Metrics.smallMargin,
            marginTop: 3,
          }}
        />
        <Text>{`${text}`}</Text>
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
    // Local variable
    const coupon_primary_color = this.state.redeemStatus
      ? Colors.primary
      : Colors.inactive_primary;
    const coupon_secondary_color = this.state.redeemStatus
      ? Colors.secondary
      : Colors.inactive_secondary;

    return (
      /**Start Safe Area**/
      <SafeAreaView
        style={[
          ApplicationStyles.screen.safeAreaContainer,
          tailwind('bg-gray-200'),
        ]}
        forceInset={{vertical: 'never'}}>
        <View style={tailwind('mt-16')}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={this.state.fetch_data}
                onRefresh={this.handleRefresh}
              />
            }>
            {/* Display Coupon Image */}
            <View style={tailwind('m-3')}>
              {this.handleRenderCouponImage(
                coupon_primary_color,
                coupon_secondary_color,
              )}
            </View>

            {/* Display Coupon Details */}
            {this.handleRenderCouponDetails()}

            {/* Redeem Button Container */}
            <View
              style={{
                margin: 15,
                padding: 5,
              }}>
              <Button
                style={{
                  shadowColor: '#000',
                  shadowOffset: {
                    width: 0,
                    height: 12,
                  },
                  shadowOpacity: 0.58,
                  shadowRadius: 16.0,

                  elevation: 24,
                }}
                disabled={!this.state.redeemStatus}
                buttonStyle={tailwind('rounded-lg bg-primary')}
                title="REDEEM"
                titleStyle={tailwind('text-xl')}
                onPress={() => {
                  this.handleCouponBarcodeModalVisibleOnChanged(true);
                }}
              />
            </View>
          </ScrollView>
        </View>

        {/* Coupon Barcode Popover Modal */}
        <Barcode
          isVisible={this.state.showCouponBarcodeModal}
          onClose={(value) => {
            this.handleCouponBarcodeModalVisibleOnChanged(value);
          }}
          barcode={this.state.coupon_detail.barcode}
          isBarcodeTextVisible={false}
        />

        {/* Loading Animation */}
        {this.handleRenderLoadingIndicator()}
      </SafeAreaView>
    );
  }
}
