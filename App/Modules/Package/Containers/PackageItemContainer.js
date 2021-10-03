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
  AppsButton, AdsBanner, Divider, LoadingIndicator, FadeInAnimation,
  I18n,
  AppConfig,
  Label,
} from '../../../Services/LibLinking';
import PackageContainer from '../Styles/PackageStyles';
import PackageItemController from '../Actions/PackageItemControllers';

/** NPM LIBRARIES **/
import { SafeAreaView } from 'react-navigation';
import Carousel from 'react-native-snap-carousel';

export default class PackageItemView extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      screenWidth: Dimensions.get('window').width,
      screenHeight: Dimensions.get('window').height,

      // package Title Data
      package_item_data: '',
      
      // flatlist
      datalist: [],
      flatListRentalTrigger: false,

      // Refresh page control
      refreshing: false,

      // Fetch data from server indiacator
      fetch_data: false,
    }

    // Create package controller object
    this.packageItemController = new PackageItemController();

    // Flatlist -> ScrollView
    this.scrollView = [];
  }

  /**Navigation Bottom Tab**/
  static navigationOptions = ({navigation, navigationOptions}) => {
    const params = navigation.state.params || {};
    const title = params.package_item_data.package_title;

    return {
      title: `${title}`,
      headerLeft: (
        <TouchableOpacity style={{paddingLeft: 5}} onPress={() => navigation.navigate('PackageScreen')}>
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
    var package_item_data = this.props.navigation.getParam("package_item_data");
    this.setState({ package_item_data: package_item_data });
    
    // Init Screen
    this.handleInitScreen(package_item_data);
  }

  componentWillUnmount() {
  }

  handleInitScreen(package_item_data) {
    this.handleFetchDataIndicator(true);
    var init_result = this.packageItemController.initScreen(package_item_data.package_guid);
    init_result.then((res) => {
      if(res.result == 1){
        var package_items = res.data;
        this.setState({
          datalist: package_items,
          flatListRentalTrigger: !this.state.flatListRentalTrigger,
        })
      } else {
        Alert.alert(
          res.data.title,
          res.data.msg
        )
      }
      this.handleFetchDataIndicator(false);
    })
  }

  handleFlatListRenderItem = ({item, index}) => {
    return (
    <FadeInAnimation index = { index }>
      <ScrollView 
        ref={(ref) => this.scrollView[index] = ref}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* Package item List */}
        <View style={[PackageContainer.mainContainer, {marginBottom: 100}]}> 

          {/* package item image */}
          <View>
            {/* <Image
              source={Images.armsHQ}
              resizeMode={'stretch'}
              style={PackageContainer.packageImageStyle}
            /> */}
            <View style={[PackageContainer.packageImageStyle, {backgroundColor: Colors.primary}]} />
            <View style={[PackageContainer.packageImageLabelContainer, {}]}>
              <Label style={{alignSelf: 'center', color: Colors.secondary, fontWeight: 'bold', fontSize: Fonts.size.h3, textAlign: 'center'}}>
                {`${item.pk_item_title}`}
              </Label>
            </View>
          </View>

          <View style={{padding: Metrics.basePadding}}>
            {/* package item desc */}
            <View style={{paddingVertical: Metrics.doubleBaseMargin}}>
              <Label style={{fontSize: Fonts.size.h6}}>
                {`${item.pk_item_desc}`}
              </Label>
            </View>

            {/* Divider */}
            <Divider lineWidth={1} lineColor={"#707070"} opacity={0.37}/>

            {/* remark */}
            <View style={{paddingVertical: Metrics.basePadding}}>
              <Label style={PackageContainer.labelNameStyle}>
                Remark
              </Label>
              <Label style={PackageContainer.packageItemInfoStyle}>
                {`${item.remark}`}
              </Label>
            </View>

            {/* package item entry */}
            <View style={{paddingBottom: Metrics.basePadding}}>
              <Label style={PackageContainer.labelNameStyle}>
                Credit
              </Label>
              {/* entry need */}
              <Label style={PackageContainer.packageItemInfoStyle}>
                {`Credit Needed: ${item.entry_need}`}
              </Label>
              {/* entry used */}
              <Label style={PackageContainer.packageItemInfoStyle}>
                {`Used: ${this.state.package_item_data.used_entry}`}
              </Label>
              {/* entry remaining */}
              <Label style={PackageContainer.packageItemInfoStyle}>
                {`Remaining: ${this.state.package_item_data.remaining_entry}`}
              </Label>
            </View>

            {/* package item redeem */}
            <View style={{paddingBottom: Metrics.basePadding}}>
              <Label style={PackageContainer.labelNameStyle}>
                Redeem
              </Label>
              {/* max redeem */}
              <Label style={PackageContainer.packageItemInfoStyle}>
                {(item.max_redeem == 0)?`Maximum Redeem: Unlimited`:`Maximum Redeem: ${item.max_redeem}`}
              </Label>
              {/* entry used */}
              <Label style={PackageContainer.packageItemInfoStyle}>
                {`Redeemed: ${item.used_count}`}
              </Label>
              {/* remaining entry */}
              <Label style={PackageContainer.packageItemInfoStyle}>
                {(item.max_redeem == 0)?`Remaining Redemption: - `:`Remaining Redemption: ${item.max_redeem-item.used_count}`}
              </Label>
            </View>
            
            {/* notation */}
            <View style={{marginBottom: Metrics.baseMargin}}>
              {
                (item.max_redeem-item.used_count == 0 && item.max_redeem > 0)
                ?
                <Label style={{color: Colors.text_negative}}>
                  *This treatment is fully redeemed
                </Label>
                :
                <View/>
              }
            </View>

            {/* Redeem History Button Container */}
            <View style={{margin: Metrics.baseMargin}}>
              <AppsButton 
                // disabled={!this.state.redeemStatus}
                onPress={() => {this.handleRedeemHistoryButtonOnPress(this.state.package_item_data, item.pk_item_guid)}}
                backgroundColor={Colors.primary}
                text={"REDEEM HISTORY"}
                fontSize={20}
              />
            </View>
          </View>

        </View>
      </ScrollView>
    </FadeInAnimation>
		)
  }

  handleRedeemHistoryButtonOnPress(package_item_data, package_item_guid){
    package_item_data.package_item_guid = package_item_guid;
    this.props.navigation.navigate("PackageRedeemHistoryScreen", {package_item_data, screenSource: 'redeem_history', loginUpdate: true});
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

          {/* package item availability */}
          {
            (!this.state.fetch_data)
            ?
            <View style={ApplicationStyles.screen.titleStatusContainer}>
              <View style={{alignSelf: 'center',flexDirection: 'row', marginBottom: Metrics.smallMargin}}>
                <Text style={ApplicationStyles.screen.titleStatusText}>
                  Total Package's Item: {this.state.datalist.length}
                </Text>
              </View>
              <Label style={[Fonts.style.description, {color: Colors.primary}]}>Swipe Left and Right to explore items</Label>
            </View>
            :
            <View/>
          }

          {/* FlatList */}
          <Carousel
            ref={(ref)=>{this.carousel = ref}}
            data={this.state.datalist}
            renderItem={this.handleFlatListRenderItem}
            key={portrait ? "h" : "v"}
            extraData={this.state.flatListRentalTrigger}
            itemWidth={Dimensions.get("window").width*0.85}
            sliderWidth={Dimensions.get("window").width}
            onSnapToItem={(index)=>{
              this.scrollView[index].scrollTo({x:0})
              this.carousel.snapToItem(index);
            }}
            inactiveSlideOpacity={1}
          />

          {/* Loading Animation */}
          {this.handleRenderLoadingIndicator()}

        </SafeAreaView>
      )
  }
}