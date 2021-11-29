/** REACT NATIVE **/
import React from 'react';
import {
  Alert, Animated,
  Dimensions,
  FlatList,
  Image,
  PixelRatio,
  RefreshControl,
  ScrollView,
  Text, TouchableOpacity,
  View,
} from 'react-native';

/** PROJECT FILES **/
import { 
  ApplicationStyles, Colors, Metrics, Fonts, Images,
  AppsButton, Divider, LoadingIndicator, Label, FadeInAnimation, SpringAnimation, Rating,
  I18n,
  AppConfig, 
  WorldTimeAPICommunicator
} from '../../../Services/LibLinking';
import PackageRedeemHistoryContainer from '../Styles/PackageRedeemHistoryStyles';
import PackageRedeemHistoryController from '../Actions/PackageRedeemHistoryControllers';
import LoginController from '../../General/Login/Actions/login_controller';

/** NPM LIBRARIES */
import { NavigationActions, DrawerActions, SafeAreaView } from 'react-navigation';
import Carousel from 'react-native-snap-carousel';
import moment from 'moment';


// Get Font Scale from device
const pixelRatio = PixelRatio.get();

// Get Server URL
const {api_url} = AppConfig;

// Get world real time
async function getWorldRealTime(){
  let worldTime = new WorldTimeAPICommunicator();
  let worldDateTime = await worldTime.GetRealWorldTimeDateTime();
  return worldDateTime
}
let ratingDuration = moment(getWorldRealTime()).subtract(7, 'days').format("YYYY-MM-DD");

export default class RedeemHistoryView extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      screenWidth: Dimensions.get('window').width,
      screenHeight: Dimensions.get('window').height,

      // First Load
      firstLoad: true,

      // Fetch data from server indiacator
      fetch_data: false,

      // Member info
      nric: '',
      loginUpdate: true,
      
      // FlatList
      datalist: [],
      flatListRentalTrigger: false,

      // Refresh page control
      refreshing: false,

      // Screen
      screenSource: '', //'rate_us' or 'redeem_history'
      package_item_data: '',
      package_guid: '',
      package_item_guid: '',

      // Agent
      agentList: [],

      // rating button checking list
      firstServiceRatingList: {},
    }
    
    // Create controller object
    this.prhController = new PackageRedeemHistoryController();
    this.loginController = new LoginController();

    // Flatlist -> ScrollView
    this.scrollView = [];
  }

  /**Navigation Bottom Tab**/
  static navigationOptions = ({navigation, navigationOptions}) => {
    const params = navigation.state.params || {};
    var goBackScreen = params.screenSource == "redeem_history" ? 'PackageItemScreen' : 'PackageScreen';
    var screenParams = params.screenSource == "redeem_history" ? {} : {loginUpdate: true};
    var title = params.screenSource == "redeem_history" ? 'Redeem History' : 'Rate Us';

    return {
      // Title: - If user reach this screen from package's item then show title 'Redeem History'.
      //        - If user reach this screen from push notification then show title 'Rate Us'.
      title, 
      headerLeft: (
        <TouchableOpacity style={{paddingLeft: 5}} onPress={() => navigation.navigate(goBackScreen, screenParams)}>
          <Image
            style={{width: Metrics.icons.regular, height: Metrics.icons.regular, tintColor: Colors.secondary}} 
            source={Images.arrowLeft}
          />
        </TouchableOpacity>
      ),
    };
  };
  /**End Navigation Bottom Tab**/

  componentDidMount() { 
    this.props.navigation.setParams({this: this.navigateToScreen});
  }

  componentWillUnmount() {
  }

  componentDidUpdate(){
    this.handleLoginUpdate();
  }

  async handleLoginUpdate(){
    var loginUpdate = this.props.navigation.getParam('loginUpdate', false);
    if(loginUpdate){
      var nric = '';
      var login_user = await this.loginController.fetchCurrentLoginMember();
      if(login_user.result == 1 && login_user.data){
        nric = login_user.data.nric;
      }
      this.props.navigation.setParams({loginUpdate: false});
      this.handleSetNRIC(nric);
    }
  }

  async handleSetNRIC(nric){
    this.setState({nric, firstLoad: false});
    this.handleGetRedeemHistoryData();
  }

  handleGetRedeemHistoryData(){
    var screenSource = this.props.navigation.getParam('screenSource', 'rate_us');
    var package_item_data = this.props.navigation.getParam('package_item_data', null);
    var package_guid = package_item_data ? package_item_data.package_guid : '';
    var package_item_guid = package_item_data ? package_item_data.package_item_guid : '';
    this.setState({package_guid, package_item_guid});

    if(this.state.nric && screenSource){
      this.handleFetchDataIndicator(true);
      var init_result = this.prhController.initScreen(screenSource, package_guid, package_item_guid);
      init_result.then((res) => {
        if(res.result == 1){
          /**
           * Assign the data to datalist
           */
          var datalist = res.data;
          var firstServiceRatingList = {};
          for (let i = 0; i < datalist.length; i++) {
            firstServiceRatingList[datalist[i].pk_rh_guid] = datalist[i].service_rating;
          }
          if(datalist.length > 0){
            this.setState({
              datalist,
              flatListRentalTrigger: !this.state.flatListRentalTrigger,
              firstServiceRatingList: firstServiceRatingList,
            })
          } 
        } else {
          Alert.alert(
            res.data.title,
            res.data.msg
          )
        }
        this.handleFetchDataIndicator(false);
      })  
    }
  }

  handleRenderSalesAgent(agentList, dataListIndex, submitRatingBtnDisabled){
    if(agentList && agentList.length > 0){
      return(
        agentList.map((value, index)=>{
          return(
            // {/* Sales Agent Rating */}
            <View style={[PackageRedeemHistoryContainer.flatListContainerRow, {}]} key={index}>
              <Label style={[PackageRedeemHistoryContainer.flatListContainerTitleFont, {textAlign: 'center', paddingHorizontal: Metrics.basePadding}]}>{`What do you think about ${value.name}'s service?`}</Label>
              <Image 
                source={value.photo_url?{uri: `${api_url}/${value.photo_url}`}:Images.person}
                style={{
                  borderColor: Colors.primary, 
                  borderRadius: 50, 
                  borderWidth: 1,
                  height: Metrics.images.xLarge, 
                  width: Metrics.images.xLarge,
                  resizeMode: 'cover',
                }}
              />
              <Label style={[PackageRedeemHistoryContainer.flatListContainerHelpFont]}>{`Tap to rate`}</Label>
              {/* Rating Star */}
              <View style={PackageRedeemHistoryContainer.flatListContainerStars}>
                <Rating 
                  icon={"star"}
                  ratingValue={value.rate} 
                  disabled={submitRatingBtnDisabled}
                  totalStar={5} 
                  size={Metrics.icons.medium} 
                  onPress={(value)=>{
                    var datalist = this.state.datalist;
                    datalist[dataListIndex].sa_info[index].rate = value;
                    this.setState({
                      datalist: datalist,
                      flatListRentalTrigger: !this.state.flatListRentalTrigger
                    });
                  }}
                />
              </View>
            </View>
          )
        })
      )
    }
  }
  
  handleFlatListRenderItem = ({item, index}) => {
    let submitRatingBtnDisabled = (item.redeem_date < ratingDuration) || (this.state.firstServiceRatingList[item.pk_rh_guid] != 0);
    let messageBelowSubmitButton = (submitRatingBtnDisabled&&item.service_rating==0) ? 'Rating period has been expired.': (this.state.firstServiceRatingList[item.pk_rh_guid]==0)?`Please submit your rating within 7 days of current item's redeem date.`:`Thanks for rating us!`;
    return (
      <FadeInAnimation index = { index }>
        <ScrollView 
          ref={(ref) => this.scrollView[index] = ref}
          showsVerticalScrollIndicator={false}
        >
          <View  
            style={[
              PackageRedeemHistoryContainer.shadow, {
                margin: Metrics.baseMargin,
                borderRadius: Metrics.containerRadius,
                marginBottom: 100,
              }
            ]}
          >
            {/* Package Item Details */}
            <View style={[PackageRedeemHistoryContainer.flatListContainerRow, {}]}>
              <Label style={[Fonts.style.h4, {fontWeight: 'bold', color: Colors.primary, textAlign: 'center'}]}>{`${item.package_item_title}`}</Label>
              <Label style={[Fonts.style.normal, {textAlign: 'center'}]}>{`Package: ${item.package_title}`}</Label>
              <Label style={[Fonts.style.normal, {textAlign: 'center'}]}>{`Redeemed at ${item.branch_code} ${item.redeem_date}`}</Label>
            </View>

            {/* Package Item Rating */}
            <View style={[PackageRedeemHistoryContainer.flatListContainerRow, {}]}>
              <Label style={[PackageRedeemHistoryContainer.flatListContainerTitleFont, {textAlign: 'center'}]}>{`We'd love to hear from you! How was your experience with ${item.package_item_title}?`}</Label>
              <Label style={[PackageRedeemHistoryContainer.flatListContainerHelpFont]}>{`Tap to rate`}</Label>
              {/* Rating Star */}
              <View style={PackageRedeemHistoryContainer.flatListContainerStars}>
                <Rating 
                  icon={"star"}
                  ratingValue={item.service_rating} 
                  disabled={submitRatingBtnDisabled}
                  totalStar={5} 
                  size={Metrics.icons.medium} 
                  onPress={(value)=>{
                    var datalist = this.state.datalist;
                    datalist[index].service_rating = value;
                    this.setState({
                      datalist,
                      flatListRentalTrigger: !this.state.flatListRentalTrigger
                    });
                  }}
                />
              </View>
            </View>

            {/* Divider */}
            <View style={[PackageRedeemHistoryContainer.flatListContainerRow, {flexDirection: 'row', width: '90%', alignSelf: 'center'}]}>
              <Divider lineColor={Colors.primary} lineWidth={1}/>
            </View>

            {/* Served By */}
            {
              (item.sa_info && item.sa_info.length > 0)
              ?
              <View style={[PackageRedeemHistoryContainer.flatListContainerRow, {}]}>
                <Label style={[PackageRedeemHistoryContainer.flatListContainerTitleFont, {fontSize: Fonts.size.h6}]}>{`How did we do?`}</Label>
                {/* <Label style={[PackageRedeemHistoryContainer.flatListContainerHelpFont]}>{`Are you happy with our staff service?`}</Label> */}
              </View>
              : 
              <View/>
            }

            {/* Sales Agent Rating */}
            {this.handleRenderSalesAgent(item.sa_info, index, submitRatingBtnDisabled)}

            {/* Submit Button */}
            <View style={[PackageRedeemHistoryContainer.flatListContainerRow, {width: '90%', alignSelf: 'center'}]}>
              <AppsButton 
                text={"SUBMIT RATING"} 
                disabled={submitRatingBtnDisabled} 
                backgroundColor={Colors.primary} 
                fontSize={20} 
                onPress={()=>{
                  this.handleRatingSubmit(item.pk_rh_guid, item.service_rating, item.sa_info);
                }}
              />
              <Label style={[PackageRedeemHistoryContainer.flatListContainerHelpFont, {marginTop: Metrics.smallMargin, textAlign: 'center'}]}>
                {`${messageBelowSubmitButton}`}
              </Label>
            </View>
            
          </View>
        </ScrollView>
      </FadeInAnimation>
		)
  }

  handleRatingSubmit(redeem_guid, service_rating, sa_info){
    var return_data = this.prhController.submitRatingData(redeem_guid, service_rating, sa_info);
    return_data.then((res) => {
      if(res.result == 1){
        Alert.alert(
          "",
          "Thanks for rating us!"
        )
        var firstServiceRatingList = this.state.firstServiceRatingList;
        firstServiceRatingList[redeem_guid] = service_rating;
        this.setState({firstServiceRatingList});
      } else {
        Alert.alert(
          res.data.title,
          res.data.msg
        )
      }
    })
  }

  fetchData = async() => {
    this.handleGetRedeemHistoryData();
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

  handleRenderLoginContainer(){
    return(
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
    )
  }

  handleRenderEmptyData(){
    return(
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
        <Label style={{color: Colors.primary}}>Oops! No redeem history have been issued yet.</Label>
      </View>
    )
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
        style={[ApplicationStyles.screen.safeAreaContainer, {height: '100%'}]} 
        forceInset={{vertical:'never'}} >
        {
          (this.state.firstLoad)
          
          ?
          
            <View/>
          
          :
          
            (!this.state.nric)

            ?

            this.handleRenderLoginContainer()

            :

            <View>
              {/* Redeem History Display */}
              {
                (!this.state.fetch_data)
                ?
                <View>
                  {
                    (this.state.datalist.length>0)
                    ?
                    // <ScrollView 
                    //   ref={(ref) => this.scrollView = ref}
                    //   showsVerticalScrollIndicator={false}
                    //   refreshControl={
                    //     <RefreshControl
                    //       refreshing={this.state.refreshing}
                    //       onRefresh={this.handleRefresh}
                    //     />
                    //   }> 
                      <View style={{
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        height: '100%',
                      }}> 

                        {/* Redeem History Header */}
                        <View style={ApplicationStyles.screen.titleStatusContainer}>
                          <View style={{alignSelf: 'center',flexDirection: 'row', marginBottom: Metrics.smallMargin}}>
                            <Text style={ApplicationStyles.screen.titleStatusText}>
                              Total Redemption: {this.state.datalist.length}
                            </Text>
                          </View>
                          <Label style={[Fonts.style.description, {color: Colors.primary}]}>{`Swipe Left and Right to explore more items`}</Label>
                        </View>

                        {/* FlatList */}
                        {/* <View style={{ width: '100%', height: '90%', ...ApplicationStyles.screen.test }}> */}
                          <Carousel 
                            ref={(ref)=>{this.carousel = ref}}
                            data={this.state.datalist}
                            renderItem={this.handleFlatListRenderItem}
                            extraData={this.state.flatListRentalTrigger}
                            itemWidth={Dimensions.get("screen").width * 0.85}
                            sliderWidth={Dimensions.get("screen").width}
                            onSnapToItem={(index)=>{
                              this.scrollView[index].scrollTo({x:0})
                              this.carousel.snapToItem(index);
                            }}
                            inactiveSlideOpacity={1}
                          />

                        {/* </View> */}
                      </View>
                    // </ScrollView>
                    :
                    this.handleRenderEmptyData()
                  }
                </View>
                :
                <View>
                  {/* Skeleton Screen */}
                  <View style={{padding: Metrics.basePadding, alignItems: 'center'}}>

                    {/* EMPTY package availability */}
                    <View style={{height: 50, width: '75%', backgroundColor: '#E8E8E8'}} />
                            
                    {/* EMPTY Package List */}
                    <View style={{
                      margin: Metrics.baseMargin,
                      borderRadius: Metrics.containerRadius,
                      backgroundColor: Colors.body,
                      height: 300, 
                      width: '100%', 
                      marginVertical: Metrics.doubleBaseMargin,
                      paddingVertical: Metrics.basePadding,
                      alignItems: 'center',
                    }}>
                      <View style={{height: 30, width: '70%', backgroundColor: '#E8E8E8', marginVertical: Metrics.smallPadding, marginHorizontal: Metrics.basePadding}} />
                      <View style={{height: 15, width: '45%', backgroundColor: '#E8E8E8', marginVertical: Metrics.smallPadding, marginHorizontal: Metrics.basePadding}} />
                      <View style={{height: 15, width: '45%', backgroundColor: '#E8E8E8', marginVertical: Metrics.smallPadding, marginHorizontal: Metrics.basePadding}} />
                      <View style={{height: 40, backgroundColor: '#E8E8E8', margin: Metrics.basePadding, borderRadius: 20, position: 'absolute', bottom: 0, right: 0, left: 0}} />
                    </View>

                  </View>
                </View>
              }
            </View>
        }

        {/* Loading Animation */}
        {this.handleRenderLoadingIndicator()}
      
      </SafeAreaView>
    )
  }
}