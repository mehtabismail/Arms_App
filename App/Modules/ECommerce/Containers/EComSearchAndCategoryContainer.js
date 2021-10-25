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

import { FlatListSlider } from 'react-native-flatlist-slider';
import { SliderBox } from "react-native-image-slider-box";

/** TAILWIND CSS **/
import { tailwind } from '../../../../tailwind';

/** REACT NATIVE ELEMENTS **/
import { Card, Button, Text, Icon, Input } from 'react-native-elements';


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
  constructor(props) {
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
  static navigationOptions = ({ navigation, navigationOptions }) => {
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
        <View style={{ width: Metrics.icons.medium, height: Metrics.icons.medium, paddingRight: 10 }}></View>
      ),
    }
  }

  /****************************************************************/
  /*********************** COMPONENT  *****************************/
  /****************************************************************/

  componentDidMount() {
    // this.props.navigation.setParams({this: this.navigateToScreen});
    this.handleSetNRIC();
  }

  componentWillUnmount() {
  }

  componentDidUpdate(prevProps) {
    // Login Update
    var loginUpdate = this.props.navigation.getParam('loginUpdate', false);
    if (loginUpdate && this.props.navigation != prevProps.navigation) {
      this.props.navigation.setParams({ loginUpdate: false });
      this.handleLoginUpdate();
    }
  }

  handleFetchDataIndicator(status, text = "") {
    this.setState({
      fetch_data: status,
      fetch_data_text: text ? text : 'Fetching data...'
    })
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
    this.props.navigation.setParams({ loginUpdate: false });
    this.handleSetNRIC(nric);
  }

  handleSetNRIC(nric) {
    this.setState({ nric, firstLoad: false }, () => {
      this.handleGetAllCategory();
    });
  }

  handleGetAllCategory() {
    this.handleFetchDataIndicator(true, "Fetching category...");
    var cat_result = this.eComSearchAndCategoryController.getAllCategoryData();
    cat_result.then((res) => {
      if (res.result == 1) {
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
  handleRenderLoadingIndicator() {
    return (
      <LoadingIndicator
        visible={this.state.fetch_data}
        size={"large"}
        text={`${this.state.fetch_data_text}`}
      />
    )
  }

  // Access Login Screen
  handleRenderAccessLoginScreen() {
    return (
      <View style={[ApplicationStyles.screen.testContainer, { alignSelf: 'center' }]}>
        <View style={{ width: '100%', justifyContent: 'center', padding: Metrics.basePadding }}>
          <Label style={{ marginBottom: Metrics.baseMargin * 6 }}>Come and join us to get many more great deals.</Label>
          <AppsButton
            onPress={() => { this.props.navigation.navigate("LandingScreen", { prev_screen: this.props.navigation.state.routeName }) }}
            backgroundColor={Colors.primary}
            text={"LOGIN / REGISTER"}
            fontSize={20}
          />
        </View>
      </View>
    )
  }

  // Render Search Bar & Category List
  handleRenderSearchAndCategoryContainer() {
    return (
      this.state.fetch_data
        ?
        <View />
        :
        <View style={tailwind("flex-1 bg-light")}>

          <View style={{ height: "18%" }}>
            {/* Search Bar */}
            {this.handleRenderSearchBarContainer()}
          </View>

          {/* Category List */}
          <ScrollView>
            <View style={{ height: "82%" }}>
              <Label
                text={`Categories`}
                style={tailwind("text-primary text-xl mx-5 font-bold")}
              />

              {/* Category Level 2 (left), Level 3 (right) */}
              {
                this.state.category_list.length > 0
                  ?

                  <View style={{
                    flexDirection: 'column',
                    flex: 1,
                  }}>
                    {/* <Label text="test" style={{...ApplicationStyles.screen.test}} /> */}
                    {/* Level 2 - Left */}
                    {this.handleRenderCategoryContainer()}

                    {/* Level 3 - Right */}
                    {this.handleRenderSubCategoryContainer()}

                  </View>
                  :
                  <View />
              }

            </View>
          </ScrollView>

        </View>
    )
  }

  handleRenderSearchBarContainer() {
    return (
      <View style={tailwind("h-full justify-center items-center")}>
        {/* Search Text Input */}
        <Input
          ref={(input) => this.searchInput = input}
          placeholder='Search Product Here'
          value={`${this.state.search_query}`}
          leftIcon={
            <Icon
              name='search'
              type='font-awesome'
              size={25}
              color="#586bca"
            />
          }
          onChangeText={(value) => {
            this.setState({
              search_query: value
            });
          }}
          onSubmitEditing={(value) => {
            // this.eComSearchAndCategoryController.searchProductByKeyword(value.nativeEvent.text);
            this.props.navigation.navigate("EComProductListScreen", {
              search_type: "keyword",
              search_data: {
                description: value.nativeEvent.text
              }
            });
          }}
          containerStyle={{
            marginTop: 16,
            width: '98%',
          }}
          inputContainerStyle={tailwind("border-2 border-t bg-white opacity-100 w-full rounded-lg")}
          inputStyle={tailwind("text-primaryBlue")}
          leftIconContainerStyle={tailwind("p-2")}
        />
      </View>
    )
  }

  handleRenderCategoryContainer() {
    return (
      <View>
        <FlatList
          data={this.state.category_list}
          renderItem={this.handleRenderCategoryItemContainer}
          extraData={this.state.flatListRentalTrigger}
          keyExtractor={(item, index) => `${index}`}
          horizontal={true}
          scrollEnabled={true}
          disableIntervalMomentum={true}
          pagingEnabled={true}
          showsHorizontalScrollIndicator={false}
        />
      </View>
    )
  }

  handleRenderCategoryItemContainer = ({ item, index }) => {
    return (
      <TouchableOpacity
        onPress={() => {
          this.setState({
            selected_cat_level2_index: index,
            selected_cat_level2_id: item.category_id,
            flatListRentalTrigger: !this.state.flatListRentalTrigger
          })
        }}
      >
        <Card
          containerStyle={tailwind("rounded-lg opacity-100 my-3")}
          activeOpacity={1}

          style={{
            backgroundColor: this.state.selected_cat_level2_index == index ? Colors.body : "#D9D2D2",
            // borderTopWidth: 1, borderBottomWidth: 1, borderColor: Colors.border_line,
            flex: 1,
            justifyContent: 'center', alignItems: 'center',
            paddingVertical: Metrics.smallPadding,
            paddingHorizontal: Metrics.smallPadding,
            width: SCREEN_WIDTH * 0.25,
            minHeight: SCREEN_WIDTH * 0.25,
          }}
        >
          {/* Category Icon */}

          <Image
            source={item.icon}
            style={{
              width: SCREEN_WIDTH * 0.25, //(SCREEN_WIDTH / 4)*0.5,
              height: (SCREEN_WIDTH * 0.25),
              marginBottom: Metrics.smallMargin
            }}
          />
          <Card.Divider />
          {/* Category Desc */}
          <Label
            text={`${item.description}`}
            style={tailwind("text-primaryBlue text-lg font-normal")}
          />
        </Card>
      </TouchableOpacity>
    )
  }

  handleRenderSubCategoryContainer() {
    return (
      <View
        style={tailwind("w-full bg-light")}
      >

        {/* Level 2 Category Title */}
        {
          this.state.category_list.length > 0
            ?
            <Label
              text={`${this.state.category_list[this.state.selected_cat_level2_index].description}`}
              style={tailwind("text-primary text-xl font-bold mt-3 mx-5")}
            />
            :
            <View />
        }

        {/* Level 3 Category List */}
        <View style={tailwind("justify-center items-center w-full flex-col")}>
          {this.handleRenderSubCategoryItemContainer(
            this.state.sub_category_list.filter(
              (value, index) => value.parent_category_id == this.state.selected_cat_level2_id
            )
          )}
        </View>

      </View>
    )
  }

  handleRenderSubCategoryItemContainer(sub_category_list) {
    var data = [];
    for (let index = 0; index < sub_category_list.length; index++) {
      var item = sub_category_list[index];
      data.push(
        <TouchableOpacity
        style={tailwind("w-full")}
          onPress={() => {
            this.props.navigation.navigate("EComProductListScreen", {
              search_type: "category",
              search_data: {
                category_id: sub_category_list[index].category_id,
                description: sub_category_list[index].description,
                level: sub_category_list[index].level
              }
            });
          }}
        >
          <Card
            key={`${index}`}
            activeOpacity={0.9}
            containerStyle={tailwind("items-start rounded-lg opacity-100 my-3")}
          >
            <View style={tailwind("flex-row justify-center items-center")}>
              <View>
                {/* Category Icon */}
                <Image
                  source={item.icon}
                  style={{
                    width: (((SCREEN_WIDTH * 0.75) / 2) - Metrics.smallMargin * 2) * 0.5, //(SCREEN_WIDTH*0.25)*0.5, //(SCREEN_WIDTH / 4)*0.5,
                    height: (((SCREEN_WIDTH * 0.75) / 2) - Metrics.smallMargin * 2) * 0.5,
                    marginBottom: Metrics.smallMargin
                  }}
                />
              </View>

              <View style={tailwind("ml-10")}>

                {/* Category Desc */}
                <Label
                  text={`${item.description}`}
                  // style={{
                  //   color: "#000000",
                  //   fontSize: Fonts.size.medium,
                  //   textAlign: 'center'
                  // }}
                  style={tailwind("text-primary text-lg font-bold self-center")}
                />
              </View>
            </View>
          </Card>
        </TouchableOpacity>

      )
    }
    return data;
  }

  render() {
    return (
      /**Start Safe Area**/
      <SafeAreaView style={ApplicationStyles.screen.safeAreaContainer} forceInset={{ vertical: 'never' }} >

        {/* Screen on loading, hide default state data */}
        {
          this.state.firstLoad
            ?
            <View />
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