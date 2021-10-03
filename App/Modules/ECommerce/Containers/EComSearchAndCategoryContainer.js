/** REACT NATIVE **/
import React from 'react';
import {
  Alert, Animated,
  Dimensions,
  FlatList,
  Image,
  Keyboard,
  Linking,
  Modal,
  Platform,
  ScrollView,
  TextInput, TouchableOpacity,
  View,
} from 'react-native';

/** PROJECT FILES **/
import { 
  Colors, Fonts, Images, Metrics, ApplicationStyles,
  LoadingIndicator, Label, AppsButton,
} from '../../../Services/LibLinking';
import styles from '../Styles/e_com_search_and_category_styles';
import LoginController from '../../General/Login/Actions/login_controller';
import EComSearchAndCategoryController from '../Actions/EComSearchAndCategoryControllers';

/** NPM LIBRARIES **/
import { NavigationActions, DrawerActions, SafeAreaView } from 'react-navigation';

const SCREEN_WIDTH = Dimensions.get("screen").width;
const SCREEN_HEIGHT = Dimensions.get("screen").height;

/**
 * TODO:
 * -
 */

export default class EComSearchAndCategoryView extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      screenWidth: Dimensions.get('window').width,
      screenHeight: Dimensions.get('window').height,

      // Fetch data from server indicator
      fetch_data: false,
      fetch_data_text: 'Fetching data...',
      firstLoad: true,

      // Category List
      selected_cat_level2_index: 0,
      selected_cat_level2_id: 0,
      category_list: [
        // {cat_desc: "Book Shop"},
        // {cat_desc: "Book Shop"},
        // {cat_desc: "Book Shop"},
        // {cat_desc: "Book Shop"},
        // {cat_desc: "Book Shop"},
      ],
      sub_category_list: [],
      flatListRentalTrigger: false,

      // Search Query
      search_query: '',

    }

    // Create controller object
    this.loginController = new LoginController();
    this.eComSearchAndCategoryController = new EComSearchAndCategoryController();
  }

  /****************************************************************/
  /************************ HEADER ********************************/
  /****************************************************************/

  // Navigation Tab
  static navigationOptions = ({navigation, navigationOptions}) => {
    const params = navigation.state.params || {};
    var navigateToScreen = params.this;

    return {
      title: 'Search & Category',
      // headerLeft: (
      //   <TouchableOpacity style={{paddingLeft: 10}} onPress={() => navigateToScreen(navigation, {loginUpdate: true})}>
      //     <Image
      //       style={{width: Metrics.icons.medium, height: Metrics.icons.medium, tintColor: Colors.secondary}} 
      //       source={Images.menu}/>
      //   </TouchableOpacity>
      // ),
      headerRight: (
        <View style={{width: Metrics.icons.medium, height: Metrics.icons.medium, paddingRight: 10}}></View>
      ),
    }
  }

  /****************************************************************/
  /*********************** COMPONENT  *****************************/
  /****************************************************************/

  componentDidMount(){
    // this.props.navigation.setParams({this: this.navigateToScreen});
    this.handleSetNRIC();
  }

  componentWillUnmount(){
  }

  componentDidUpdate(prevProps){
    // Login Update
    var loginUpdate = this.props.navigation.getParam('loginUpdate', false);
    if(loginUpdate && this.props.navigation != prevProps.navigation){
      this.props.navigation.setParams({loginUpdate: false});
      this.handleLoginUpdate();
    }
  }

  handleFetchDataIndicator(status, text=""){
    this.setState({
      fetch_data: status,
      fetch_data_text: text ? text : 'Fetching data...'
    })
  }

  /****************************************************************/
  /******************** FUNCTIONALITY *****************************/
  /****************************************************************/

  async handleLoginUpdate(){
    var nric = '';
    var login_user = await this.loginController.fetchCurrentLoginMember();
    if(login_user.result == 1 && login_user.data){
      nric = login_user.data.nric;
    }
    this.props.navigation.setParams({loginUpdate: false});
    this.handleSetNRIC(nric);
  }

  handleSetNRIC(nric){
    this.setState({nric, firstLoad: false}, ()=>{
      this.handleGetAllCategory();
    });
  }

  handleGetAllCategory(){
    this.handleFetchDataIndicator(true, "Fetching category...");
    var cat_result = this.eComSearchAndCategoryController.getAllCategoryData();
    cat_result.then((res) => {
      if(res.result == 1){
        this.setState({
          category_list: res.data.cat_lvl2_list,
          sub_category_list: res.data.cat_lvl3_list,
          selected_cat_level2_id: res.data.cat_lvl2_list[0].category_id ? res.data.cat_lvl2_list[0].category_id : 0,
          flatListRentalTrigger: !this.state.flatListRentalTrigger
        });
      } else {
        Alert.alert("Error Category", res.data.msg);
      }
      this.handleFetchDataIndicator(false);
      this.searchInput.focus();
    })
  }

  /****************************************************************/
  /******************** SCREEN RENDERING **************************/
  /****************************************************************/

  // Loading Indicator
  handleRenderLoadingIndicator(){
    return(
      <LoadingIndicator 
        visible={this.state.fetch_data}
        size={"large"} 
        text={`${this.state.fetch_data_text}`}
      />
    )
  }

  // Access Login Screen
  handleRenderAccessLoginScreen(){
    return(
      <View style={[ApplicationStyles.screen.testContainer,  {alignSelf: 'center'}]}>
        <View style={{width: '100%', justifyContent: 'center', padding: Metrics.basePadding}}>
          <Label style={{marginBottom: Metrics.baseMargin*6}}>Come and join us to get many more great deals.</Label>
          <AppsButton 
            onPress={() => {this.props.navigation.navigate("LandingScreen", {prev_screen: this.props.navigation.state.routeName})}}
            backgroundColor={Colors.primary}
            text={"LOGIN / REGISTER"}
            fontSize={20}
          />
        </View>
      </View>
    )
  }

  // Render Search Bar & Category List
  handleRenderSearchAndCategoryContainer(){
    return(
      this.state.fetch_data
      ?
      <View/>
      :
      <View style={{flex: 1}}>

        {/* Search Bar */}
        {this.handleRenderSearchBarContainer()}
        
        {/* Category List */}
        <View style={{flex: 1}}>
          <Label 
            text={`Categories`}
            style={{
              color: Colors.primary,
              fontSize: Fonts.size.h5,
              fontWeight: 'bold',
              paddingHorizontal: Metrics.smallPadding,
              paddingVertical: Metrics.smallPadding,
            }}
          />

          {/* Category Level 2 (left), Level 3 (right) */}
          {
            this.state.category_list.length > 0
            ?
            
            <View style={{ 
              flexDirection: 'row', 
              // height: '100%', 
              flex: 1,
              // paddingBottom: Metrics.smallPadding,
              // borderWidth: 1, borderColor: 'blue' 
            }}>
              {/* <Label text="test" style={{...ApplicationStyles.screen.test}} /> */}
              {/* Level 2 - Left */}
              {this.handleRenderCategoryContainer()}
  
              {/* Level 3 - Right */}
              {this.handleRenderSubCategoryContainer()}
  
            </View>
            :
            <View/>
          }
          
        </View>

      </View>
    )
  }

  handleRenderSearchBarContainer(){
    return(
      <View style={{
        backgroundColor: Colors.body,
        paddingHorizontal: Metrics.smallPadding,
        paddingVertical: Metrics.basePadding,
        marginVertical: Metrics.smallMargin,
        borderTopWidth: 1, borderBottomWidth: 1, borderColor: Colors.border_line,
        flexDirection: 'row'
      }}>
        {/* Icon */}
        <Image
          source={Images.search}
          style={{
            width: Metrics.icons.medium,
            height: Metrics.icons.medium,
            tintColor: Colors.primary
          }}
        />

        {/* Search Text Input */}
        <TextInput 
          ref={(input)=>this.searchInput = input}
          placeholder={`Search Product Here`}
          value={`${this.state.search_query}`}
          onChangeText={(value)=>{
            this.setState({
              search_query: value
            });
          }}
          onSubmitEditing={(value)=>{
            // this.eComSearchAndCategoryController.searchProductByKeyword(value.nativeEvent.text);
            this.props.navigation.navigate("EComProductListScreen", {
              search_type: "keyword",
              search_data: {
                description: value.nativeEvent.text
              }
            });
          }}
          style={{
            fontSize: Fonts.size.h6,
            color: Colors.primary,
            marginLeft: Metrics.smallMargin,
            flex: 1,
          }}
        />
      </View>
    )
  }

  handleRenderCategoryContainer(){
    return(
      <View>
        <ScrollView>
          <FlatList 
            data={this.state.category_list}
            renderItem={this.handleRenderCategoryItemContainer}
            extraData={this.state.flatListRentalTrigger}
            keyExtractor={(item, index)=>`${index}`}
            scrollEnabled={false}
          />
        </ScrollView>
      </View>
    )
  }

  handleRenderCategoryItemContainer = ({item, index}) =>{
    return(
      <TouchableOpacity 
        activeOpacity={0.9}
        onPress={()=>{
          this.setState({
            selected_cat_level2_index: index,
            selected_cat_level2_id: item.category_id,
            flatListRentalTrigger: !this.state.flatListRentalTrigger
          })
        }}
        style={{
          backgroundColor: this.state.selected_cat_level2_index == index ? Colors.body : "#D9D2D2",
          // borderTopWidth: 1, borderBottomWidth: 1, borderColor: Colors.border_line,
          flex: 1, 
          justifyContent: 'center', alignItems: 'center',
          paddingVertical: Metrics.smallPadding,
          paddingHorizontal: Metrics.smallPadding,
          width: SCREEN_WIDTH*0.25,
          minHeight: SCREEN_WIDTH*0.25,
        }}
      >
        {/* Category Icon */}
        <Image 
          source={item.icon}
          style={{
            width: (SCREEN_WIDTH*0.25)*0.5, //(SCREEN_WIDTH / 4)*0.5,
            height: (SCREEN_WIDTH*0.25)*0.5,
            marginBottom: Metrics.smallMargin
          }}
        />

        {/* Category Desc */}
        <Label 
          text={`${item.description}`}
          style={{
            color: this.state.selected_cat_level2_index == index ? Colors.primary : "#000000",
            fontSize: Fonts.size.medium,
            textAlign: 'center'
          }}
        />

        {/* > Icon */}
        {/* <Label 
          text={`>`}
          style={{
            color: Colors.primary,
            fontSize: Fonts.size.h5
          }}
        /> */}
        

      </TouchableOpacity>
    )
  }

  handleRenderSubCategoryContainer(){
    return(
      <ScrollView style={{
        width: SCREEN_WIDTH*0.75,
        backgroundColor: Colors.body
      }}>

        {/* Level 2 Category Title */}
        {
          this.state.category_list.length > 0
          ?
          <Label
            text={`${this.state.category_list[this.state.selected_cat_level2_index].description}`}
            style={{
              color: Colors.primary,
              fontSize: Fonts.size.regular,
              fontWeight: 'bold',
              marginVertical: Metrics.smallMargin,
              marginHorizontal: Metrics.smallMargin,
            }}
          />
          :
          <View/>
        }

        {/* Level 3 Category List */}
        <View style={{ flexWrap: "wrap", flexDirection: 'row' }}>
          {this.handleRenderSubCategoryItemContainer(
            this.state.sub_category_list.filter(
              (value, index)=>value.parent_category_id == this.state.selected_cat_level2_id
            )
          )}
        </View>

      </ScrollView>
    )
  }

  handleRenderSubCategoryItemContainer(sub_category_list){
    var data = [];
    for (let index = 0; index < sub_category_list.length; index++) {
      var item = sub_category_list[index];
      data.push(
        <TouchableOpacity
          key={`${index}`} 
          activeOpacity={0.9}
          onPress={()=>{
            this.props.navigation.navigate("EComProductListScreen", {
              search_type: "category",
              search_data: {
                category_id: sub_category_list[index].category_id,
                description: sub_category_list[index].description,
                level: sub_category_list[index].level
              }
            });
          }}
          style={{
            backgroundColor: "#D9D2D2",
            borderWidth: 1, borderColor: Colors.border_line,
            justifyContent: 'center', alignItems: 'center',
            paddingVertical: Metrics.smallPadding,
            paddingHorizontal: Metrics.smallPadding,
            margin: Metrics.smallMargin,
            width: ((SCREEN_WIDTH*0.75)/2)-Metrics.smallMargin*2,  //SCREEN_WIDTH*0.25,
            minHeight: ((SCREEN_WIDTH*0.75)/2)-Metrics.smallMargin*2,
          }}
        >

          {/* Category Icon */}
          <Image 
            source={item.icon}
            style={{
              width: (((SCREEN_WIDTH*0.75)/2)-Metrics.smallMargin*2)*0.5, //(SCREEN_WIDTH*0.25)*0.5, //(SCREEN_WIDTH / 4)*0.5,
              height: (((SCREEN_WIDTH*0.75)/2)-Metrics.smallMargin*2)*0.5,
              marginBottom: Metrics.smallMargin
            }}
          />
          
          {/* Category Desc */}
          <Label 
            text={`${item.description}`}
            style={{
              color: "#000000",
              fontSize: Fonts.size.medium,
              textAlign: 'center'
            }}
          />

        </TouchableOpacity>
      )
    }
    return data;
  }

  render() {
    return (
      /**Start Safe Area**/
      <SafeAreaView style={ApplicationStyles.screen.safeAreaContainer} forceInset={{vertical:'never'}} >
        
        {/* Screen on loading, hide default state data */}
        {
          this.state.firstLoad
          ?
            <View/>
          :
            // Search Bar & Category List
            this.handleRenderSearchAndCategoryContainer()
        }
        
        {/* Loading Animation */}
        {this.handleRenderLoadingIndicator()}

      </SafeAreaView>
    )
  }
}