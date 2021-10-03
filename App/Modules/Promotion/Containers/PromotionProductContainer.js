/** REACT NATIVE **/
import React from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Image, ImageBackground,
  Linking,
  RefreshControl,
  ScrollView,
  Text, TouchableOpacity,
  View,
} from 'react-native';

/** PROJECT FILES **/
import { 
  ApplicationStyles, Colors, Metrics, Fonts, Images,
  AdsBanner, LoadingIndicator, FadeInAnimation,
  I18n,
  AppConfig,
} from '../../../Services/LibLinking';
import PromotionContainer from '../Styles/PromotionStyles';
import PromotionProductController from '../Actions/PromotionProductControllers';

/** NPM LIBRARIES **/
import { SafeAreaView } from 'react-navigation';

const ads_banner_path = AppConfig.ads_banner_promo_product_scn_path;
const ads_screen_id = AppConfig.ads_promo_prod_screen_id;
const prefix_currency = AppConfig.prefix_currency;

export default class PromotionProductView extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      screenWidth: Dimensions.get('window').width,
      screenHeight: Dimensions.get('window').height,

      // Promotion Title Data
      promo_title_data: '',
      
      // flatlist
      datalistPromo: [],
      datalistSpecial: [],
      flatListRentalTrigger: false,

      // Refresh page control
      refreshing: false,

      // Fetch data from server indiacator
      fetch_data: false,
    }

    // Create promotion controller object
    this.promoProductController = new PromotionProductController();
  }

  /**Navigation Bottom Tab**/
  static navigationOptions = ({navigation, navigationOptions}) => {
    const params = navigation.state.params || {};
    return {
      title: 'Promotion Product',
      headerLeft: (
        <TouchableOpacity style={{paddingLeft: 5}} onPress={() => navigation.navigate('PromotionScreen')}>
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
    var promo_title_data = this.props.navigation.getParam("promo_title_data");
    this.setState({promo_title_data: promo_title_data});
    
    // Init Screen
    var init_result = this.promoProductController.initScreen(promo_title_data.promo_key);
    init_result.then((res) => {
      if(res.result == 1){
        var promo_list_items = res.data.promo_list;
        var special_list_items = res.data.special_list;
        this.setState({
          datalistPromo: promo_list_items,
          datalistSpecial: special_list_items,
          flatListRentalTrigger: !this.state.flatListRentalTrigger,
        })
      } else {
        Alert.alert(
          res.data.title,
          res.data.msg
        )
      }
    })
  }

  componentWillUnmount() {
  }

  numberThousandSeparator(input) {
    var result = input.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return result;
  }

  convertToCurrencyFormat(amount){
    return this.numberThousandSeparator(parseFloat(amount).toFixed(2));
  }

  handleFlatListRenderSpecialItem = ({item, index}) => {
    return (
    <FadeInAnimation index = { index }>
      <View style={PromotionContainer.specialForYouContainer}>
        <TouchableOpacity onPress={() => {
          this.props.navigation.navigate('ProductDetailScreen',{
            promo_detail: this.state.promo_title_data,
            prod_detail: {
              sku_item_id: item.sku_item_id,
              prodImg: item.promo_photo_url, 
              prodName: item.sku_desc, 
              price: item.selling_price,
              member_discount_pct: item.member_discount_percent,
              member_discount_amt: item.member_discount_amount,
              member_fixed_price: item.member_fixed_price,
              non_member_discount_pct: item.non_member_discount_percent,
              non_member_discount_amt: item.non_member_discount_amount,
              non_member_fixed_price: item.non_member_fixed_price,
              member_type: JSON.parse(item.allowed_dis_member_type_desc),
            }
          })
        }}>
          {/* headerContainer */}
          <View style={[PromotionContainer.flatlistHeaderContainer, {}]}>
            <Text style={{justifyContent: 'flex-start', fontWeight: 'bold'}}>More Info</Text>
            <Image 
              source={Images.arrowRight}
              style={{justifyContent: 'flex-end', height: Metrics.icons.small, width: Metrics.icons.small}}/>
          </View>

          {/* Product Container */}
          <View style={{flexDirection: 'row', flex: 1, margin: Metrics.baseMargin}}>
            
            {/* Product Image & Product Discount Percent Container */}
            <View style={[PromotionContainer.productContainer, {borderWidth: 1, borderColor: Colors.borderLight}]}>
              
              {/* Product Image */}
              <ImageBackground 
                source={{uri: `${AppConfig.api_url}/${item.promo_photo_url}`}} 
                resizeMode= 'contain' 
                style={{height: Metrics.images.prodImg, width: '100%', }} />

              {/* Product Discount Percent Container */}
              {
                (item.display_perc)
                ?
                <View style={{position: 'absolute', top: 0, right: 0, marginRight: Metrics.smallPadding}}>
                  <View 
                    style={{
                      backgroundColor: Colors.discount_con_background, 
                      paddingVertical: Metrics.basePadding - 5, 
                      paddingHorizontal: Metrics.smallPadding - 5,
                    }}>
                    <Text style={PromotionContainer.textStyleSpecial}>{`${item.member_discount_percent}%`}</Text>
                  </View>
              
                  {/* Bottom Flag Effect */}
                  <View style={PromotionContainer.flagBottomSpecial}></View>
                </View>
                :
                <View />
              }
            </View>

            {/* Product Details */}
            <View style={PromotionContainer.descriptionContainer}>
              
              {/* Product Description */}
              <View style={PromotionContainer.descriptionRowContainer}>
                <Text ellipsizeMode={'middle'} numberOfLines={2}>{item.sku_desc}</Text>
              </View>

              {/* Product Original Price */}
              <View style={PromotionContainer.descriptionRowContainer}>
                <Text>{`Original Price: `}</Text>
                <Text style={{...Fonts.style.normal, fontWeight: 'bold'}}>{`${prefix_currency} ${this.convertToCurrencyFormat(item.selling_price)}`}</Text>
              </View>
              
              {/* Product amount discount */}
              {
                (item.display_amt)
                ?
                // Discount Amount
                <View style={PromotionContainer.descriptionRowContainer}>
                  <Text>{`Discount Amount: `}</Text>
                  <Text style={{...Fonts.style.normal, fontWeight: 'bold'}}>{`${prefix_currency} ${this.convertToCurrencyFormat(item.member_discount_amount)}`}</Text>
                </View>
                :
                <View />
              }

              {/* Product Fixed Price */}
              {
                (item.display_fixed_price)
                ?
                <View style={PromotionContainer.descriptionRowContainer}>
                  <Text>{`Promo Price: `}</Text>
                  <Text style={{...Fonts.style.normal, fontWeight: 'bold'}}>{`${prefix_currency} ${this.convertToCurrencyFormat(item.member_fixed_price)}`}</Text>
                </View>
                :
                <View />
              }
            </View>

          </View>
        </TouchableOpacity>
      </View>
    </FadeInAnimation>
		)
  }

  handleFlatListRenderItem = ({item, index}) => {
    return (
    <FadeInAnimation index = { index }>
      <View>
        <TouchableOpacity onPress={() => {
          this.props.navigation.navigate('ProductDetailScreen',{
            promo_detail: this.state.promo_title_data,
            prod_detail: {
              sku_item_id: item.sku_item_id,
              prodImg: item.promo_photo_url, 
              prodName: item.sku_desc, 
              price: item.selling_price,
              member_discount_pct: item.member_discount_percent,
              member_discount_amt: item.member_discount_amount,
              member_fixed_price: item.member_fixed_price,
              non_member_discount_pct: item.non_member_discount_percent,
              non_member_discount_amt: item.non_member_discount_amount,
              non_member_fixed_price: item.non_member_fixed_price,
              member_type: JSON.parse(item.allowed_dis_member_type_desc),
            }
          })
        }}>
          {/* headerContainer */}
          <View style={[PromotionContainer.flatlistHeaderContainer, {}]}>
            <Text style={{justifyContent: 'flex-start', fontWeight: 'bold'}}>More Info</Text>
            <Image 
              source={Images.arrowRight}
              style={{justifyContent: 'flex-end', height: Metrics.icons.small, width: Metrics.icons.small}}/>
          </View>

          {/* Product Container */}
          <View style={{flexDirection: 'row', flex: 1, margin: Metrics.baseMargin}}>
            
            {/* Product Image & Product Discount Percent Container */}
            <View style={[PromotionContainer.productContainer, {borderWidth: 1, borderColor: Colors.borderLight}]}>
              
              {/* Product Image */}
              <ImageBackground 
                source={{uri: `${AppConfig.api_url}/${item.promo_photo_url}`}} 
                resizeMode= 'contain' 
                style={{height: Metrics.images.prodImg, width: '100%', }} />

              {/* Product Discount Percent Container */}
              {
                (item.display_perc)
                ?
                <View style={{position: 'absolute', top: 0, right: 0, marginRight: Metrics.smallPadding}}>
                  <View 
                    style={{
                      backgroundColor: Colors.discount_con_background, 
                      paddingVertical: Metrics.basePadding - 5, 
                      paddingHorizontal: Metrics.smallPadding,
                    }}>
                    <Text style={PromotionContainer.textStyle}>{`${item.member_discount_percent}%`}</Text>
                  </View>
              
                  {/* Bottom Flag Effect */}
                  <View style={PromotionContainer.flagBottom}></View>
                </View>
                :
                <View />
              }
            </View>

            {/* Product Details */}
            <View style={PromotionContainer.descriptionContainer}>
              
              {/* Product Description */}
              <View style={PromotionContainer.descriptionRowContainer}>
                <Text ellipsizeMode={'middle'} numberOfLines={2}>{item.sku_desc}</Text>
              </View>

              {/* Product Original Price */}
              <View style={PromotionContainer.descriptionRowContainer}>
                <Text>{`Original Price: `}</Text>
                <Text style={{...Fonts.style.normal, fontWeight: 'bold'}}>{`${prefix_currency} ${this.convertToCurrencyFormat(item.selling_price)}`}</Text>
              </View>
              
              {/* Product amount discount */}
              {
                (item.display_amt)
                ?
                // Discount Amount
                <View style={PromotionContainer.descriptionRowContainer}>
                  <Text>{`Discount Amount: `}</Text>
                  <Text style={{...Fonts.style.normal, fontWeight: 'bold'}}>{`${prefix_currency} ${this.convertToCurrencyFormat(item.member_discount_amount)}`}</Text>
                </View>
                :
                <View />
              }

              {/* Product Fixed Price */}
              {
                (item.display_fixed_price)
                ?
                <View style={PromotionContainer.descriptionRowContainer}>
                  <Text>{`Promo Price: `}</Text>
                  <Text style={{...Fonts.style.normal, fontWeight: 'bold'}}>{`${prefix_currency} ${this.convertToCurrencyFormat(item.member_fixed_price)}`}</Text>
                </View>
                :
                <View />
              }
            </View>

          </View>
        </TouchableOpacity>
      </View>
    </FadeInAnimation>
		)
  }

  // handle refresh page
  fetchData = async() => {
    this.handleFlatListRenderItem;
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
        <SafeAreaView 
          style={ApplicationStyles.screen.safeAreaContainer}
          forceInset={{vertical:'never'}} >
          
          {/* Slideshow Ads Banner */}
          <View style={[ApplicationStyles.screen.headerContainer, {}]} >
            <AdsBanner 
              dataFolderPath={ads_banner_path}
              screenId={ads_screen_id}
              imgResizeMode={'stretch'}
              height={Metrics.headerContainerHeight}
              arrowSize={0}
              onPress={(data)=>{
                var url = data.image.link;
                if(url && url != "undefined"){
                  url = (url.substring(0,8)=="https://" || url.substring(0,7)=="http://")?url:`http://${url}`;
                  Linking.openURL(url);
                } else {
                  Alert.alert("", I18n.t("alert_banner_empty_weblink"));
                }
              }}
              onRefresh={this.state.fetch_data}
            />
          </View>

          <ScrollView 
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={this.state.refreshing}
                onRefresh={this.handleRefresh}
              />
            }> 

            {/* Special For You Title */}
            {
              (this.state.datalistSpecial.length > 0)
              ?
              <View>
                <View style={[PromotionContainer.headerContainer, {backgroundColor: Colors.primary, width: '100%', marginLeft: 0, paddingHorizontal: Metrics.basePadding}]}>
                  <Text style={[Fonts.style.h5, {color: Colors.secondary, fontWeight: 'bold'}]}>Special For You</Text>
                </View>

                {/* Flatlist */}
                <ScrollView horizontal={true} pagingEnabled={true} showsHorizontalScrollIndicator={false}>
                  <FlatList
                    data={this.state.datalistSpecial}
                    renderItem={this.handleFlatListRenderSpecialItem}
                    key={portrait ? "h" : "v"}
                    extraData={this.state.flatListRentalTrigger}
                    horizontal={true}
                  />
                </ScrollView>
              </View>
              :
              <View/>
            }

            <View style={[PromotionContainer.container, {}]}>
              {/* Promotion Title */}
              <View style={[PromotionContainer.headerContainer, {backgroundColor: Colors.primary, width: '100%', marginLeft: 0, paddingHorizontal: Metrics.basePadding}]}>
                <Text style={[Fonts.style.h5, {color: Colors.secondary, fontWeight: 'bold'}]}>{this.state.promo_title_data.title}</Text>
              </View>

              {/* FlatList */}
              <View style={[PromotionContainer.shadow, {marginVertical: Metrics.doubleBaseMargin, marginHorizontal: Metrics.baseMargin}]}>
                <FlatList
                  data={this.state.datalistPromo}
                  renderItem={this.handleFlatListRenderItem}
                  key={portrait ? "h" : "v"}
                  extraData={this.state.flatListRentalTrigger}
                  ItemSeparatorComponent={()=>{return <View style={{borderBottomWidth: 1, borderColor: Colors.borderLight}}/>}}
                  // horizontal={true}
                />
              </View>

            </View>
          </ScrollView>

          {/* Loading Animation */}
          {this.handleRenderLoadingIndicator()}

        </SafeAreaView>
      )
  }
}