/** REACT NATIVE **/
import React from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  Modal,
  RefreshControl,
  Text, TouchableOpacity,
  View,
} from 'react-native';

/** PROJECT FILES **/
import { 
  Colors, Fonts, Images, Metrics, ApplicationStyles,
  LoadingIndicator, Divider, Label,
  I18n,
  AppConfig,
} from '../../../Services/LibLinking';
import PromotionContainer from '../Styles/PromotionStyles';
import PromotionProductController from '../Actions/PromotionProductControllers';

/** NPM LIBRARIES **/
import NetInfo from "@react-native-community/netinfo";
import { SafeAreaView } from 'react-navigation';
import Animated from 'react-native-reanimated';
import ImageViewer from 'react-native-image-zoom-viewer';

const prefix_currency = AppConfig.prefix_currency;
const DEFAULT_IMAGE_HEIGHT = Dimensions.get('window').height*(1/3);

export default class PromotionProductView extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      screenWidth: Dimensions.get('window').width,
      screenHeight: Dimensions.get('window').height,

      // Product Detail
      promo_detail: '',
      prod_detail: '',

      // Fetch data from server indiacator
      fetch_data: false,
      check_connection: false,

      // flatlist
      datalist: [
        // {
        //   key: '1',
        //   branch_id: 1,
        //   branch_desc: "HQ",
        //   selling_price: '',
        // },
        // {
        //   key: '2',
        //   branch_id: 47,
        //   branch_desc: "DEV",
        //   selling_price: '',
        // },
      ],
      flatListRentalTrigger: false,

      // Image Viewer 
      imageViewerVisible: false,
      images_datalist: [],
      images_index: 0,
    }

    // Create promotion controller object
    this.promoProductController = new PromotionProductController();

    // Animated
    this.scrollY = new Animated.Value(0);
    this.imageHeight = Animated.interpolate(this.scrollY, {
      inputRange: [0, DEFAULT_IMAGE_HEIGHT],
      outputRange: [DEFAULT_IMAGE_HEIGHT, 100],
      extrapolate: Animated.Extrapolate.CLAMP
    });
  }

  /**Navigation Bottom Tab**/
  static navigationOptions = ({navigation, navigationOptions}) => {
    const params = navigation.state.params || {};
    return {
      title: 'Product Detail',
    };
  };
  /**End Navigation Bottom Tab**/
  
  componentDidMount(){
    var promo_detail = this.props.navigation.getParam("promo_detail");
    var prod_detail = this.props.navigation.getParam("prod_detail");
    // Setup image for image viewer
    var images_datalist = [];
    if(prod_detail.prodImg){
      images_datalist.push({
        url: `${AppConfig.api_url}/${prod_detail.prodImg}`,
        image_id: 0,
      });
    }
    this.setState({
      promo_detail,
      prod_detail,
      images_datalist
    });

    // var member_type = [];
    // Object.keys(prod_detail.member_type).map((value, index)=>{
    //   member_type.push({
    //     member_desc: prod_detail.member_type[value].toString(),
    //   });
    // });

    /**
     * Get selling price based on branch
     */
    this.handleLoadPriceListByBranch(promo_detail, prod_detail);
  }

  numberThousandSeparator(input) {
    var result = input.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return result;
  }

  convertToCurrencyFormat(amount){
    return this.numberThousandSeparator(parseFloat(amount).toFixed(2));
  }

  memberPrice(selling_price){
    if(this.state.prod_detail.member_discount_pct > 0) {
      // return (selling_price - this.convertToCurrencyFormat(selling_price * (this.state.prod_detail.member_discount_pct/100)))
      var dis_amount = this.convertToCurrencyFormat(selling_price * (this.state.prod_detail.member_discount_pct/100));  
      var after_dis_amount = this.convertToCurrencyFormat(selling_price - dis_amount);
      
      return (`${after_dis_amount} (SAVE ${prefix_currency}${dis_amount})`)
    } 
    else if(this.state.prod_detail.member_discount_amt > 0) {
      // return (selling_price - this.state.prod_detail.member_discount_amt)
      dis_amount = this.convertToCurrencyFormat(this.state.prod_detail.member_discount_amt);
      after_dis_amount = this.convertToCurrencyFormat(selling_price - dis_amount);

      return (`${after_dis_amount} (SAVE ${prefix_currency}${dis_amount})`);
    }
    else if(this.state.prod_detail.member_fixed_price > 0) {
      // return (this.state.prod_detail.member_fixed_price)
      dis_amount = "Promo Price";
      after_dis_amount = this.convertToCurrencyFormat(this.state.prod_detail.member_fixed_price);

      return (`${after_dis_amount} (${dis_amount})`);
    }
    else {
      // return (selling_price)
      return (this.convertToCurrencyFormat(selling_price));
    }
  }

  nonMemberPrice(selling_price){
    if(this.state.prod_detail.non_member_discount_pct > 0) {
      // return (selling_price - this.convertToCurrencyFormat(selling_price * (this.state.prod_detail.non_member_discount_pct/100)))
      var dis_amount = this.convertToCurrencyFormat(selling_price * (this.state.prod_detail.non_member_discount_pct/100));  
      var after_dis_amount = this.convertToCurrencyFormat(selling_price - dis_amount);

      return (`${after_dis_amount} (SAVE ${prefix_currency}${dis_amount})`);
    } 
    else if(this.state.prod_detail.non_member_discount_amt > 0) {
      // return (selling_price - this.state.prod_detail.non_member_discount_amt)
      dis_amount = this.convertToCurrencyFormat(this.state.prod_detail.non_member_discount_amt);
      after_dis_amount = this.convertToCurrencyFormat(selling_price - dis_amount);

      return (`${after_dis_amount} (SAVE ${prefix_currency}${dis_amount})`);
    }
    else if(this.state.prod_detail.non_member_fixed_price > 0) {
      // return (this.state.prod_detail.non_member_fixed_price)
      dis_amount = "Promo Price";
      after_dis_amount = this.convertToCurrencyFormat(this.state.prod_detail.non_member_fixed_price);

      return (`${after_dis_amount} (${dis_amount})`);
    }
    else {
      // return (selling_price)
      return (this.convertToCurrencyFormat(selling_price));
    }
  }

  handleFlatListRenderItem = ({item, index}) => {
    return (
      // Price from different branch
      <View style={[PromotionContainer.branchPriceContainer]}>
        
        {/* Branch Header Details */}
        <View style={{marginVertical: Metrics.smallMargin}}>
          
          {/* Icon & Branch Desc */}
          <View style={{marginBottom: Metrics.smallMargin, flexDirection: 'row'}}>
            {/* Icon */}
            <Image 
              source={Images.store}
              style={{
                height: Metrics.icons.small, 
                width: Metrics.icons.small, 
                marginRight: Metrics.smallMargin, 
                tintColor: Colors.text_color_1
              }}
            />
            {/* Branch Desc */}
            <Text style={{
              fontSize: Fonts.size.regular, 
              fontWeight: 'bold', 
              paddingBottom: Metrics.smallPadding,
              flex: 1,
            }}>
              {item.branch_desc}
            </Text>
          </View> 
          
          {/* <Text style={{
            // fontSize: Fonts.size.large, 
            // color: Colors.discount_con_label
          }}>
            {`Original Price: ${prefix_currency} ${this.convertToCurrencyFormat(item.selling_price)}`}
          </Text> */}
        </View>
        
        {/* Member & Non Member Pricing */}
        <View style={{width: '100%'}}>
          
          {/* Member Pricing Container */}
          {
            (this.state.prod_detail.member_discount_pct || this.state.prod_detail.member_discount_amt || this.state.prod_detail.member_fixed_price)
            ?
            <View style={{marginVertical: Metrics.smallMargin}}>
              {/* Member Label */}
              <Text style={{marginBottom: Metrics.smallMargin, fontWeight: '500'}}>Member</Text>

              {/* Member Price */}
              <View style={{flexDirection: 'row', alignItems: 'baseline', marginBottom: Metrics.smallMargin}}>
                
                {/* Original Price */}
                <Text style={{
                  fontSize: Fonts.size.medium, 
                  textDecorationLine: 'line-through', 
                  marginRight: Metrics.smallMargin
                }}>
                  {`${prefix_currency} ${this.convertToCurrencyFormat(item.selling_price)}`}
                </Text>
                
                {/* Discount Price  */}
                <Text style={{
                  fontSize: Fonts.size.large, 
                  fontWeight: 'bold',
                  color: Colors.text_negative
                }}>
                  {/* {`${prefix_currency} ${this.convertToCurrencyFormat(this.memberPrice(item.selling_price))}`} */}
                  {`${prefix_currency} ${this.memberPrice(item.selling_price)}`}
                </Text>
              
              </View>

            </View>
            :
            <View />
          }
          
          
          {/* Non Member Pricing Container */}
          {
            (this.state.prod_detail.non_member_discount_pct || this.state.prod_detail.non_member_discount_amt || this.state.prod_detail.non_member_fixed_price)
            ?
            <View style={{marginVertical: Metrics.smallMargin}}>
              {/* Non Member Label */}
              <Text style={{marginBottom: Metrics.smallMargin, fontWeight: '500'}}>Non-Member</Text>
              
              {/* Non Member Price */}
              <View style={{flexDirection: 'row', alignItems: 'baseline', marginBottom: Metrics.smallMargin}}>
                
                {/* Original Price */}
                <Text style={{
                  fontSize: Fonts.size.medium, 
                  textDecorationLine: 'line-through', 
                  marginRight: Metrics.smallMargin
                }}>
                  {`${prefix_currency} ${this.convertToCurrencyFormat(item.selling_price)}`}
                </Text>
                
                {/* Discount Price  */}
                <Text style={{
                  fontSize: Fonts.size.large, 
                  fontWeight: 'bold',
                  color: Colors.text_negative
                }}>
                  {/* {`${prefix_currency} ${this.convertToCurrencyFormat(this.nonMemberPrice(item.selling_price))}`} */}
                  {`${prefix_currency} ${this.nonMemberPrice(item.selling_price)}`}
                </Text>
              
              </View>
            </View>
            :
            <View />
          }
          
        
        </View>
      
      </View>  
    )
  }

  async handleLoadPriceListByBranch(promo_detail, prod_detail){
    this.handleFetchDataIndicator(true);
    var network = await this.networkConnectValidation();
    if(network.result == 1){
      var datalist = [];
      // var test = Object.keys(promo_detail.promo_branch_id).map((value, index)=>{
      //   datalist.push({
      //     key: value.toString(),
      //     branch_id: value,
      //     // branch_desc: branch_desc,
      //     branch_desc: await this.promoProductController.getBranchDesc(value),
      //     // branch_desc: promo_detail.promo_branch_id[value]
      //   });
      // })

      for(key in promo_detail.promo_branch_id){
        datalist.push({
          key: key.toString(),
          branch_id: key,
          branch_desc: await this.promoProductController.getBranchDesc(key),
        });
      }

      var sp_list = this.promoProductController.getSellingPriceByBranch(datalist, prod_detail.sku_item_id);
      sp_list.then((res)=>{
        if(res.result == 1){
          this.setState({
            datalist: res.data,
            check_connection: true,
          });
        }
        this.handleFetchDataIndicator(false);
      })
    } else {
      this.handleFetchDataIndicator(false);  
      this.setState({
        check_connection: false,
      })
    }
  }

  networkConnectValidation(){
    let result = new Promise((resolve, reject) => {
      NetInfo.isConnected.fetch().done((isConnected) => { 
        if(isConnected) {
          resolve({result: 1, data: isConnected})
        } else {
          resolve({result: 0, data: {title: I18n.t("network_error_title"), msg: I18n.t("network_error_msg")}});
        }
      });
    })
    return result;
  }

  // handle refresh page
  fetchData = async() => {
    this.handleLoadPriceListByBranch(this.state.promo_detail, this.state.prod_detail);
  }

  handleRefresh = () => {
    this.fetchData().then(() => {
      this.setState({refreshing: false});
    });
  }

  handleFetchDataIndicator(status){
    this.setState({
      fetch_data: status
    })
  }

  handleImageViewerOnOff(status, image_id){
    var index = this.state.images_datalist.findIndex(data=>data.image_id==image_id);
    this.setState({
      imageViewerVisible: status,
      images_index: index!=-1?index:0
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

    return (
    /**Start Safe Area**/
    <SafeAreaView style={[ApplicationStyles.screen.safeAreaContainer, {backgroundColor: Colors.body}]} forceInset={{vertical:'never'}} >
          
      <View style={{flex: 1, justifyContent: 'flex-start', backgroundColor: Colors.primary}}>
        
        {/* Display Product Image */}
        <TouchableOpacity onPress={() => { (this.state.images_datalist.length > 0)?this.handleImageViewerOnOff(true, 0):"" }}>
          <Animated.Image 
            source={{uri: `${AppConfig.api_url}/${this.state.prod_detail.prodImg}`}}
            resizeMode= 'contain'
            style={{
              width: '100%', 
              height: this.imageHeight, //Dimensions.get('window').height*(1/3) , 
              marginBottom: Metrics.baseMargin,
            }}
          />
        </TouchableOpacity>
        

        <Animated.ScrollView 
          style={{
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            backgroundColor: Colors.body,
          }}
          bounces={true}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={this.handleRefresh}
            />
          }
          onScroll={
            Animated.event([
              {
                nativeEvent: { contentOffset: { y: this.scrollY } }
              }
            ])
          }
        >

          {/* Display Product Details */}
          <View style={{
            flex: 1, 
            padding: Metrics.basePadding, 
            backgroundColor: Colors.body,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          }}>

            {/* Title */}
            {/* <View style={[PromotionContainer.branchPriceContainer, {backgroundColor: Colors.primary}]}>
              <View style={{marginBottom: Metrics.baseMargin}}>
                <Text style={{fontSize: Fonts.size.h4, fontWeight: 'bold', color: Colors.secondary}}>{this.state.prod_detail.prodName}</Text>
                <Text style={{fontSize: Fonts.size.large, color: Colors.secondary}}>Price in HQ: {`${prefix_currency} ${this.convertToCurrencyFormat(this.state.prod_detail.price)}`}</Text>
                <Text style={{fontSize: Fonts.size.large, fontWeight: '500', color: Colors.secondary}}>Promotion valid for {(this.state.prod_detail.member_type == '') ? `All Member Types.` : this.state.prod_detail.member_type.toString() }</Text>
              </View>
            </View> */}
            
            {/* Title Information - Prod Desc, Promotion Valid Members, Promotion Valid Date*/}
            <View style={{ marginBottom: Metrics.baseMargin}}>
                
              {/* Prod Desc */}
              <Text style={{fontSize: Fonts.size.h6, fontWeight: 'bold', marginBottom: Metrics.baseMargin}}>{this.state.prod_detail.prodName}</Text>
              
              {/* Prod Price in HQ */}
              {/* <Text style={{fontSize: Fonts.size.large, color: Colors.secondary}}>Price in HQ: {`${prefix_currency} ${this.convertToCurrencyFormat(this.state.prod_detail.price)}`}</Text> */}
              
              {/* Validation Date */}
              <View style={{marginBottom: Metrics.baseMargin, flexDirection: 'row'}}>
                <Image 
                  source={Images.calendar}
                  style={{
                    height: Metrics.icons.tiny, 
                    width: Metrics.icons.tiny, 
                    marginRight: Metrics.smallMargin, 
                    tintColor: Colors.text_color_1
                  }}
                />
                <Text style={{color: Colors.text_color_1}}>Valid from {this.state.promo_detail.date_from} until {this.state.promo_detail.date_to}</Text>
              </View> 

              {/* Validation Member */}
              <View style={{marginVertical: Metrics.baseMargin, padding: Metrics.smallPadding, borderWidth: 1, borderColor: Colors.borderLight}}>
                <Text style={{color: Colors.text_color_1, marginBottom: Metrics.smallMargin}}>Eligible of Member Type:</Text> 
                {
                  (this.state.prod_detail.member_type == "")
                  ?
                  <View style={{marginBottom: Metrics.smallMargin, flexDirection: 'row'}}>
                    <Image 
                      source={Images.check_box_checked}
                      style={{
                        height: Metrics.icons.tiny, 
                        width: Metrics.icons.tiny, 
                        marginRight: Metrics.smallMargin, 
                        tintColor: Colors.check_box_green
                      }}
                    />
                    <Text style={{color: Colors.text_color_1, fontWeight: '500'}}>{`All Member Types`}</Text>
                  </View> 
                  :
                  <View style={{marginBottom: Metrics.smallMargin}}>
                    <FlatList
                      data={this.state.prod_detail.member_type}
                      renderItem={({item, index}) =>{
                        return(
                          <View style={{marginBottom: Metrics.smallMargin, flexDirection: 'row'}}>
                            <Image 
                              source={Images.check_box_checked}
                              style={{
                                height: Metrics.icons.tiny, 
                                width: Metrics.icons.tiny, 
                                marginRight: Metrics.smallMargin, 
                                tintColor: Colors.check_box_green
                              }}
                            />
                            <Text style={{color: Colors.text_color_1, fontWeight: '500'}}>{`${item}`}</Text>
                          </View> 
                        )
                      }}
                      key={portrait ? "h" : "v"}
                      keyExtractor={(item, index) => 'key'+index}
                    />
                  </View>
                }
              </View>
              
            </View>

            {/* Divider */}
            <View style={{marginTop: Metrics.smallMargin}}>
              <Divider text={"PROMO PRICE"} textBold={true}/>
            </View>

            {/* FlatList */}
            {/* <View style={{marginVertical: Metrics.baseMargin}}>
              <Text style={{fontSize: Fonts.size.input, fontWeight: 'bold'}}>Check out the price after the discount!</Text>
            </View> */}

            {/* Outlet Promo Pricing */}
            {
              (!this.state.fetch_data)
              ?
              <View>
              {
                (this.state.check_connection)
                ?
                <FlatList
                  data={this.state.datalist}
                  renderItem={this.handleFlatListRenderItem}
                  key={portrait ? "h" : "v"}
                  extraData={this.state.flatListRentalTrigger}
                  scrollEnabled={false}
                  // horizontal={true}
                />
                :
                <View style={[ApplicationStyles.screen.mainContainer,{justifyContent: 'center', marginTop: Metrics.baseMargin*5}]}>
                  <Label style={{fontSize: Fonts.size.medium}}>
                    Please retry by connecting your network to the internet.
                  </Label>
                  <Image
                    source={Images.refresh}
                    style={{
                      width: Metrics.icons.medium, 
                      height: Metrics.icons.medium, 
                      tintColor: Colors.text_color_2,
                    }}
                  />
                </View>
              }
              </View>
              :
              <View/>
            }
          </View>
        </Animated.ScrollView> 

        {/* Image Viewer */}
        <Modal visible={this.state.imageViewerVisible} transparent={true}>
          <View style={{width: '100%', alignItems: 'flex-end', backgroundColor: '#000000', paddingHorizontal: Metrics.basePadding, paddingTop: 30}}>
            <TouchableOpacity onPress={() => {this.handleImageViewerOnOff(false, 0);}}>
              <Image 
                source={Images.round_cancel}
                style={{width: Metrics.icons.medium, height: Metrics.icons.medium, tintColor: '#ffffff'}}
              />
            </TouchableOpacity>
          </View>
          <ImageViewer 
            imageUrls={this.state.images_datalist}
            saveToLocalByLongPress={false}
            index={this.state.images_index}
            enableSwipeDown={true}
            onCancel={()=>{this.handleImageViewerOnOff(false, 0);}} />
        </Modal>
      
        {/* Loading Animation */}
        {this.handleRenderLoadingIndicator()}

      </View>
    </SafeAreaView>
    )
  }
}