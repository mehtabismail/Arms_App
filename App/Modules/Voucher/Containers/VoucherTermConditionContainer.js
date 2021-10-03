/** REACT NATIVE **/
import React from 'react';
import {
  Alert,
  Dimensions,
  Image,
  PixelRatio,
  SafeAreaView, ScrollView,
  Text, TouchableOpacity,
  View,
} from 'react-native';

/** PROJECT FILES **/
import { 
  ApplicationStyles, Colors, Metrics, Fonts, Images,
  AppsButton, Barcode, Divider, Label,
  AppConfig 
} from '../../../Services/LibLinking';
import VoucherContainer from '../Styles/VoucherStyles';
import VoucherController from '../Actions/VoucherControllers';

/** NPM LIBRARIES **/
import { NavigationActions } from 'react-navigation';

const {width, height} = Dimensions.get("screen");

// Get Font Scale from device
const pixelRatio = PixelRatio.get();

export default class VoucherTNCView extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      screenWidth: Dimensions.get('window').width,
      screenHeight: Dimensions.get('window').height,

      // Fetch data from server indiacator
      fetch_data: false,
      
      // FlatList
      datalist: [],
      flatListRentalTrigger: false,

      // Voucher Redemption 
      showVoucherBarcodeModal: false,
      voucher_detail: {
        terms: '', 
        barcode: '',
        voucher_value: '',
        valid_from: '',
        valid_to: '',
        active: '',
        cancelled: '',
        voucher_used: '',
        used_time: '',
        worldDateTime: ''
      },
      redeemStatus: true,
    }

    this.voucherController = new VoucherController();
  }

  /**Navigation Bottom Tab**/
  static navigationOptions = ({navigation, navigationOptions}) => {
    const params = navigation.state.params || {};
    return {
      title: ' Term and Condition ',
      headerLeft: (
        <TouchableOpacity style={{paddingLeft: 5}} onPress={() => navigation.navigate('VoucherScreen')}>
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

  componentDidMount(){
    var voucher_detail = this.props.navigation.getParam('voucher_detail');
    this.setState({
      voucher_detail: voucher_detail,
      redeemStatus: (voucher_detail.active && !voucher_detail.cancelled && !voucher_detail.voucher_used && voucher_detail.valid_from < voucher_detail.worldDateTime && voucher_detail.valid_to > voucher_detail.worldDateTime),
    });
  };

  componentWillUnmount(){
    const navigateAction = NavigationActions.navigate({
      routeName: 'VoucherScreen',
      params: {voucher_update: true}
    });
    this.props.navigation.dispatch(navigateAction);
  }

  handleVoucherBarcodeModalVisibleOnChanged(status, terms, barcode){
    this.setState({
      showVoucherBarcodeModal: status,
    })
  }

  render() {
    /** Local variable config **/
    var portrait = this.state.screenWidth < this.state.screenHeight;
    const voucher_primary_color = this.state.redeemStatus ? Colors.primary : Colors.inactive_primary;
    const voucher_secondary_color = this.state.redeemStatus ? Colors.secondary : Colors.inactive_secondary;
    const valid_from = this.state.voucher_detail.valid_from ? `FROM ${this.state.voucher_detail.valid_from}` : '';
    const valid_to = this.state.voucher_detail.valid_to ? this.state.voucher_detail.valid_to : '';
    const valid_value = this.state.voucher_detail.voucher_value.toString().length==1 ? ` ${this.state.voucher_detail.voucher_value}` : this.state.voucher_detail.voucher_value;
    /** End local variable config **/

    return(
      /**Start Safe Area**/
      <SafeAreaView style={[ApplicationStyles.screen.safeAreaContainer, {backgroundColor: Colors.body}]} forceInset={{vertical:'never'}} >
        <ScrollView>
        {/* Display Voucher Image */}
        <View 
          style={{
            height: Metrics.voucherHeight, 
            width: '100%', 
            padding: (pixelRatio>1.5)?Metrics.basePadding:Metrics.smallPadding,
            flexDirection: 'row',
            backgroundColor: voucher_secondary_color
          }}
        >
          
          {/* Voucher Left Part */}
          <View style={{width: '65%', flex: 1}}>
            {/* Voucher Title */}
            <View>
              <Label text={`VOUCHER`} type="normal_bold" style={{color: voucher_primary_color, fontSize: Fonts.size.h4}} />
            </View>

            {/* Voucher Valid Date */}
            <View>
              <Label
                text={`VALID ${valid_from} TILL ${valid_to}`} 
                type="normal" 
                style={{color: voucher_primary_color, fontSize: Fonts.size.small}} 
              />
            </View>

            {/* Divider */}
            <View style={{marginVertical: Metrics.baseMargin, width: '20%'}}>
              <Divider lineWidth={5} lineColor={voucher_primary_color}/>
            </View>

            {/* Voucher Code & Voucher Un-redeem Messages */}
            <View style={{flex: 1, justifyContent: 'space-evenly'}}>
              <Label type="normal_bold" style={{color: voucher_primary_color, fontSize: Fonts.size.large}}>{`${this.state.voucher_detail.barcode}`}</Label>
              {
                (!this.state.voucher_detail.active)
                ?
                <View><Label type="normal" style={{color: voucher_primary_color, fontSize: Fonts.size.small}}>{`- Voucher isn't active yet.`}</Label></View>
                :
                <View/>
              }
              {
                (this.state.voucher_detail.cancelled)
                ?
                <View><Label type="normal" style={{color: voucher_primary_color, fontSize: Fonts.size.small}}>{`- Voucher has been cancelled`}</Label></View>
                :
                <View/>
              }
              {
                (this.state.voucher_detail.voucher_used)
                ?
                <View><Label type="normal" style={{color: voucher_primary_color, fontSize: Fonts.size.small}}>{`- Voucher used at ${this.state.voucher_detail.used_time}`}</Label></View>
                :
                <View/>
              }
              {
                (this.state.voucher_detail.valid_from > this.state.voucher_detail.worldDateTime)
                ?
                <View><Label type="normal" style={{color: voucher_primary_color, fontSize: Fonts.size.small}}>{`- Voucher able to use start from ${this.state.voucher_detail.valid_from}`}</Label></View>
                :
                <View/>
              }
              {
                (this.state.voucher_detail.valid_to < this.state.voucher_detail.worldDateTime)
                ?
                <View><Label type="normal" style={{color: voucher_primary_color, fontSize: Fonts.size.small}}>{`- Voucher expired at ${this.state.voucher_detail.valid_to}`}</Label></View>
                :
                <View/>
              }
            </View>
          </View>
          {/* END of Voucher Left Part */}
          
          {/* Voucher Right Part */}
            {/* Voucher Value */}
            <View style={{width: '35%', alignItems: 'flex-end', justifyContent: 'flex-end'}}>
              <View>
                <Label text={`${AppConfig.prefix_currency}`} type="normal_bold" style={{color: voucher_secondary_color, fontSize: Fonts.size.h6, alignSelf: 'flex-start'}} />
                <Label 
                  text={`${valid_value}`}
                  type="normal_bold" 
                  style={{
                    color: voucher_secondary_color,
                    fontSize: (this.state.voucher_detail.voucher_value.toString().length>2)?
                                (this.state.voucher_detail.voucher_value.toString().length>4)?
                                  Fonts.size.h1-10: //Character more than 4
                                  Fonts.size.h1+10: //Character 3 and 4
                                Fonts.size.h1+30 //Character 1 and 2
                  }} />
              </View>
            </View>
            
            {/* Voucher Value Background */}
            <View style={{
              position: 'absolute', 
              right: 0, 
              top: 0, 
              bottom: 0, 
              zIndex: -1, 
              width: '45%', 
              height: 0, 
              borderLeftWidth: (Metrics.voucherHeight)/4, 
              borderLeftColor: 'transparent', 
              borderBottomWidth: Metrics.voucherHeight, 
              borderBottomColor: voucher_primary_color
            }}/>
          {/* END of Voucher Right Part */}
          
          {/* Voucher Company Logo Background */}
          <View style={{
            position: 'absolute', 
            left: 0, 
            right: 0,
            top: 0, 
            bottom: 0,
            zIndex: -2, 
            alignItems: 'center',
            justifyContent: 'center',
            padding: Metrics.basePadding
          }}>
            <Image source={Images.company_logo} style={{width: '100%', height: Metrics.voucherHeight, resizeMode: 'contain', opacity: 0.2}} />
          </View>
        </View>

        {/* Display Voucher Details */}
        <View style={{flex: 1, padding: Metrics.basePadding}}>

          {/* Tittle */}
          <View style={{marginBottom: Metrics.baseMargin}}>
            <Text style={{fontSize: Fonts.size.h4, fontWeight: 'bold'}}>{this.state.voucher_detail.barcode}</Text>
          </View>
          
          {/* Eligible Voucher Date */}
          <View style={{marginVertical: Metrics.baseMargin, padding: Metrics.smallPadding, borderWidth: 1, borderColor: Colors.borderLight}}>
            <Text style={{color: Colors.text_color_1, marginBottom: Metrics.smallMargin}}>Eligible Voucher Date:</Text> 
            {/* Validation Date */}
            <View style={{marginBottom: Metrics.smallMargin, flexDirection: 'row'}}>
              <Image 
                source={Images.calendar}
                style={{
                  height: Metrics.icons.tiny, 
                  width: Metrics.icons.tiny, 
                  marginRight: Metrics.smallMargin, 
                  tintColor: Colors.text_color_1
                }}
              />
              <Text style={{color: Colors.text_color_1, fontWeight: '500', flex: 1}}>Valid from {this.state.voucher_detail.valid_from} till {this.state.voucher_detail.valid_to}</Text>
            </View>
          </View> 
              
          {/* Redeem Status */}
          <View style={{ marginVertical: Metrics.baseMargin*2}}>
            <Text style={{fontSize: Fonts.size.h6, fontWeight: 'bold'}}>Redeem Status</Text> 
            {
              (this.state.redeemStatus == true)
              ?
              <View style={{flexDirection: 'row', alignItems: 'center', margin: Metrics.baseMargin, marginLeft: 0}}>
                <Image 
                  source={Images.round_tick}
                  style={{
                    height: Metrics.icons.small, 
                    width: Metrics.icons.small, 
                    marginRight: Metrics.smallMargin, 
                    tintColor: Colors.check_box_green
                  }}
                />
                <Text style={{}}>{`Voucher is ready to be reedem.`}</Text>
              </View>
              :
              <View style={{flexDirection: 'row', alignItems: 'center', margin: Metrics.baseMargin, marginLeft: 0}}>
                <Image 
                  source={Images.round_cancel}
                  style={{
                    height: Metrics.icons.small, 
                    width: Metrics.icons.small, 
                    marginRight: Metrics.smallMargin, 
                    tintColor: Colors.check_box_red,
                    alignSelf: 'flex-start'
                  }}
                />
                <View style={{flexDirection: 'column'}}>
                  {
                    (!this.state.voucher_detail.active)
                    ?
                    <View><Text>{`Voucher isn't active yet.`}</Text></View>
                    :
                    <View/>
                  }
                  {
                    (this.state.voucher_detail.cancelled)
                    ?
                    <View><Text>{`Voucher has been cancelled.`}</Text></View>
                    :
                    <View/>
                  }
                  {
                    (this.state.voucher_detail.voucher_used)
                    ?
                    <View><Text>{`Voucher used at ${this.state.voucher_detail.used_time}.`}</Text></View>
                    :
                    <View/>
                  }
                  {
                    (this.state.voucher_detail.valid_from > this.state.voucher_detail.worldDateTime)
                    ?
                    <View><Text>{`Voucher able to use start from ${this.state.voucher_detail.valid_from}.`}</Text></View>
                    :
                    <View/>
                  }
                  {
                    (this.state.voucher_detail.valid_to < this.state.voucher_detail.worldDateTime)
                    ?
                    <View><Text>{`Voucher expired at ${this.state.voucher_detail.valid_to}.`}</Text></View>
                    :
                    <View/>
                  }
                </View>
              </View>
            }
          </View>
      
        </View>
        </ScrollView>
        
        {/* Redeem Button Container */}
        <View style={{margin: Metrics.baseMargin}}>
          <AppsButton 
            disabled={!this.state.redeemStatus}
            onPress={() => {this.handleVoucherBarcodeModalVisibleOnChanged(true, this.state.voucher_detail.barcode)}}
            backgroundColor={Colors.primary}
            text={"REDEEM"}
            fontSize={20}
          />
        </View>
        
        {/* Voucher Barcode Popover Modal */}
        <Barcode
          isVisible={this.state.showVoucherBarcodeModal}
          onClose={(value) => {this.handleVoucherBarcodeModalVisibleOnChanged(value)}}
          barcode={this.state.voucher_detail.barcode}
          isBarcodeTextVisible={true}
        />
      </SafeAreaView>
    )
  }
}
