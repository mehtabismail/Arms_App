/** REACT NATIVE **/
import React from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  Text, TouchableOpacity,
  View,
} from 'react-native';

/** PROJECT FILES **/
import { 
  ApplicationStyles, Colors, Metrics, Fonts, Images,
  ARMSTextInput, AppsButton, LoadingIndicator, Label, Divider,
  I18n,
  AppConfig, 
  ARMSDownloader
} from '../../../Services/LibLinking';
import ProfileContainer from '../Styles/MemberProfileStyles.js';
import MemberController from '../Actions/member_controller.js';
import ProfileImage from '../Actions/profileImage_controller.js';
import LoginController from '../../General/Login/Actions/login_controller.js';
import ServerController from '../../General/ServerConfig/Actions/server_controller.js';

/** NPM LIBRARIES **/
import ImagePicker from "react-native-image-picker";
import Picker from 'react-native-picker';
import DatePicker from 'react-native-datepicker';
import Animated from 'react-native-reanimated';
import moment from 'moment';
import NetInfo from "@react-native-community/netinfo";
import * as Progress from 'react-native-progress';
import {SafeAreaView, NavigationActions, DrawerActions} from 'react-navigation';

// image picker
const options = {
  title: 'Select a photo',
  takePhotoButtonTitle: 'Take a photo',
  chooseFromLibraryButtonTitle: 'Choose from gallery',
  quality: 1,
  noData: true, // IMPORTANT TO MAKE IT FASTER
  // storageOptions: {
  //   cameraRoll: false,
  // },
};

const DEFAULT_IMAGE_HEIGHT = (Platform.OS === "ios")?Dimensions.get('window').height*0.3:Dimensions.get('window').height*0.4

export default class SettingView extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      screenWidth: Dimensions.get('window').width,
      screenHeight: Dimensions.get('window').height,

      // Update data from server indiacator
      fetch_data: false,

      nric: '',
      name: '',
      email: '',
      card_no: '',
      imageSource: '',
      img_exist: '',
      checker: false,

      // contact list
      phone_3: '',
      address: '',
      postcode: '',
      city: '',
      state: '',
      checkInput: '',
      state_data: '',

      // personal list
      gender: '',
      dob: '',

      // FlatList
      // emaillist: [],
      contactlist: [],
      personallist: [],
      membershiplist: [],
      flatListRentalTrigger: false,
      flatListDataEdit_contact: false,
      flatListDataEdit_personal: false, 
    }

    //Create Controller Object
    this.memberController = new MemberController({
      navigation: this.props.navigation
    });
    this.profileImage = new ProfileImage();
    this.armsDownloader = new ARMSDownloader();
    this.loginController = new LoginController();
    this.serverController = new ServerController();

    // Animated
    this.scrollY = new Animated.Value(0);
    this.imageHeight = Animated.interpolate(this.scrollY, {
      inputRange: [0, DEFAULT_IMAGE_HEIGHT],
      outputRange: [DEFAULT_IMAGE_HEIGHT, 125],
      extrapolate: Animated.Extrapolate.CLAMP
    });
  }

  /**Navigation Bottom Tab**/
  static navigationOptions = ({navigation, navigationOptions}) => {
    const params = navigation.state.params || {};

    var navigateToScreen = params.this;
    var uploadImageChecker = params.checker;
    return {
      title: 'My Profile',
      headerLeft: (
        <TouchableOpacity style={{paddingLeft: 10}} onPress={() => navigateToScreen(navigation, {uploadImageChecker, loginUpdate: true})}>
          <Image
            style={{width: Metrics.icons.medium, height: Metrics.icons.medium, tintColor: Colors.secondary}} 
            source={Images.menu}/>
        </TouchableOpacity>
      ),
      headerRight: (
        <View style={{width: Metrics.icons.medium, height: Metrics.icons.medium, paddingRight: 10}}></View>
      ),
    };
  };
  /**End Navigation Bottom Tab**/

  // navigate to pass params
  navigateToScreen = (navigation, params = "") => {
    const navigateAction = NavigationActions.navigate({
      routeName: "DrawerStack",
      params: params
    });
    
    navigation.dispatch(navigateAction);
    navigation.dispatch(DrawerActions.openDrawer());
  }

  componentDidMount() {
    var nric = this.props.navigation.getParam('nric');
    this.handleSetNRIC(nric);
    this.handleGetState();
  }

  componentDidUpdate(){
    this.handleLoginUpdate();
  }

  async handleLoginUpdate(){
    var loginUpdate = this.props.navigation.getParam('loginUpdate', false);
    if(loginUpdate){
      this.props.navigation.setParams({loginUpdate: false});
      var nric = '';
      var login_user = await this.loginController.fetchCurrentLoginMember();
      if(login_user.result == 1 && login_user.data){
        nric = login_user.data.nric;
      }
      
      this.handleSetNRIC(nric);
    }
  }

  handleSetNRIC(nric){
    this.setState({
      nric,
      flatListDataEdit_contact: false,
      flatListDataEdit_personal: false, 
    });
    this.props.navigation.setParams({this: this.navigateToScreen});
    this.uploadImageChecker(false);

    // handle profile information details
    this.handleMemberProfileInfo(nric);
    this.handleLoadProfileImage(nric);
  }

  /**Start Profile Image Upload Process**/
  uploadImageChecker(checker) {
    this.props.navigation.setParams({checker: checker})
  }

  handleLoadProfileImage(nric) {
    if(nric){
      this.handleFetchDataIndicator(true);
      var profileImageData = this.profileImage.handleGetProfileImageFromFolder(nric);
      profileImageData.then((res)=>{
        if(res.result == 1){
          this.setState({
            imageSource: {uri: res.path_img},
            img_exist: res.img_exist,
          })
        } else {
          this.setState({
            imageSource: AppConfig.profile_image_default,
            img_exist: false,
          })
        }
        this.handleFetchDataIndicator(false);
      })
    } else {
      this.setState({
        imageSource: AppConfig.profile_image_default,
        img_exist: false,
      })
    }
  }

  async handleProfileImage() {
    var network = await this.networkConnectValidation();
    if(network.result == 1){
      ImagePicker.showImagePicker(options, (response) => {
        console.log('Response = ', response);
      
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.error) {
          console.log('ImagePicker Error: ', response.error);
        }  else {
          var nric = this.state.nric;
          this.processImageUpload(nric, response.uri);
        }
      })
    } else {
      Alert.alert(
        'Upload Failed', 'Please check your internet connection.',
        [ {text: 'OK', style: 'cancel'}, ],
        { cancelable: false }
      )
    }
  }

  processImageUpload(nric, source) {
    this.handleFetchDataIndicator(true);
    var upload = this.profileImage.handleImageUpload(nric, source)
    upload.then((res) => {
      if(res.result == 1) {
        Alert.alert(
          'Upload Success', 'You have change your profile image.',
          [ {text: 'OK', style: 'cancel'}, ],
          { cancelable: false }
        )
        this.setState({
          imageSource: {uri: source},
          checker: true,
          img_exist: true,
        }, () => {
          this.handleFetchDataIndicator(false);
          this.uploadImageChecker(this.state.checker);          
        })
      } else {
        this.handleFetchDataIndicator(false);
        Alert.alert(
          'Upload Failed', 'Please try again later.',
          [ {text: 'OK', style: 'cancel'}, ],
          { cancelable: false }
        )
      }  
    })
  }
  /**End Profile Image Upload Process**/

  /**Start Process Member Profile Info**/
  handleMemberProfileInfo(nric) {
    if(nric){
      var result = this.memberController.fetchMemberDataProfile(nric)
      result.then((res) => {
        // alert(JSON.stringify(res.lenght))
        if(res.result == 1) {
          var name = res.data.name;
          var card_no = res.data.card_no;
          var email = res.data.email;
          var contact_info = res.data.contactInfo;
          var personal_info = res.data.personalInfo;
          var membership_info = res.data.membershipInfo;
          this.setState({
            name: name,
            card_no: card_no,
            email: email,
            // emaillist: email,
            contactlist: contact_info,
            personallist: personal_info,
            membershiplist: membership_info,
            flatListRentalTrigger: !this.state.flatListRentalTrigger
          })
        } else {
          alert('No Data Found');
        }
      })
    } else {
      this.setState({
        name: '',
        card_no: '',
        email: '',
        // emaillist: '',
        contactlist: [],
        personallist: [],
        membershiplist: [],
        flatListRentalTrigger: !this.state.flatListRentalTrigger
      })
    }
  }

  handleUpdateContact(postcode, address, city, state, phone_3) {
    this.handleFetchDataIndicator(true);
    if(this.state.checkInput) {
      var nric = this.state.nric;
      var update = this.memberController.updateContactList(nric, postcode, address, city, state, phone_3)
      update.then((res) => {
        if(res.result == 1) {
          alert('Contact List Updated');
          this.setState({
            flatListDataEdit_contact: false
          }, () => {
            this.handleMemberProfileInfo(nric);
            this.handleFetchDataIndicator(false);
          })
        } else {
          this.handleFetchDataIndicator(false);
          Alert.alert(
            res.data.title, res.data.msg,
            [ {text: 'OK', style: 'cancel'}, ],
            { cancelable: false }
          );      
        }
      })
    } else {
      alert('Please insert the correct phone number.')
      this.handleFetchDataIndicator(false);
    }
  }

  handleUpdatePersonal(name, gender, dob) {
    this.handleFetchDataIndicator(true);
    var nric = this.state.nric;
    var update = this.memberController.updatePersonalList(nric, name, gender, dob)
    update.then((res) => {
      if(res.result == 1) {
        alert('Personal List Updated');
        this.setState({
          flatListDataEdit_personal: false
        }, () => {
          this.handleMemberProfileInfo(nric);
          this.handleFetchDataIndicator(false);
        }) 
      } else {  
        this.handleFetchDataIndicator(false); 
        Alert.alert(
          res.data.title, res.data.msg,
          [ {text: 'OK', style: 'cancel'}, ],
          { cancelable: false }
        );    
      }
    })
  }

  handleEditContactList(){
    var contactList = this.state.contactlist;
    this.setState({
      flatListDataEdit_contact: true,
      phone_3: contactList[contactList.findIndex((current_arr)=>current_arr.key=="phone")].details,
      address: contactList[contactList.findIndex((current_arr)=>current_arr.key=="address")].details,
      postcode: contactList[contactList.findIndex((current_arr)=>current_arr.key=="postcode")].details,
      city: contactList[contactList.findIndex((current_arr)=>current_arr.key=="city")].details,
      state: contactList[contactList.findIndex((current_arr)=>current_arr.key=="state")].details,
    })
  }

  handleEditPersonalList(){
    var personalList = this.state.personallist;
    this.setState({
      flatListDataEdit_personal: true,
      name: personalList[personalList.findIndex((current_arr)=>current_arr.key=="name")].details,
      // nric: personalList[personalList.findIndex((current_arr)=>current_arr.key=="nric")].details,
      // card_no: personalList[personalList.findIndex((current_arr)=>current_arr.key=="card_no")].details,
      gender: personalList[personalList.findIndex((current_arr)=>current_arr.key=="gender")].details,
      dob: personalList[personalList.findIndex((current_arr)=>current_arr.key=="dob")].details,
    })
  }

  handleGetState(){    
    var state_data = this.serverController.FetchServerConfigStateData();
    state_data.then((res) => {
      if(res.result == 1){
        var config_type = res.config_type;
        this.setState({
          state_data: config_type
        })
      } 
    })
  }

  handleSelectState(){
    let data = JSON.parse(this.state.state_data);
    Picker.init({
      pickerTitleText: "Select State",
      pickerData: data,
      selectedValue: [this.state.state],
      onPickerConfirm: data => {
        var state =  data[0];
        this.setState({
          state: state,
        })
      },
      onPickerCancel: data => {
      },
      onPickerSelect: data => {
      }
    });
    Picker.show();
  }

  handleSelectGender(){   
    let data = ["Male", "Female"];

    Picker.init({
      pickerTitleText: "Select Gender",
      pickerData: data,
      selectedValue: [this.handleDisplayGender(this.state.gender)],
      onPickerConfirm: data => {
        var gender =  data[0];
        if(gender == "Male") {
          this.setState({
            gender: 'M',})
        } else {
          this.setState({
            gender: 'F',})
        }
      },
      onPickerCancel: data => {
      },
      onPickerSelect: data => {
      }
    });
    Picker.show();
  }

  handleDisplayGender(gender){
    return (gender == "M") ? "Male" : "Female";
  }

  onChangedPhoneNo(phone_3){ 
    var num = phone_3;
    if(num.match(/\D/g)){
      this.setState({
        checkInput: false
      }); 
    } else if(num.match(/\d/g) || num == ''){
      this.setState({
        checkInput: true
      });
    }
    // this.setState({
    //   checkInput: false
    // })
    // var newText = ''; 
    // var numbers = '0123456789'; 
    // if(phone_3.length < 1){ 
    //   this.setState({ 
    //     phone_3: '' 
    //   }); 
    // }; 

    // for (var i=0; i < phone_3.length; i++) { 
    //   if(numbers.indexOf(phone_3[i]) > -1 ) { 
    //     newText = newText + phone_3[i]; 
    //   } 
    //   this.setState({ 
    //     phone_3: newText 
    //   }); 
    // };
  }

  /**End Process Member Profile Info**/

  handleFlatListRenderItem = ({item, index}) => {
    return (
      <View>
        {/* Details Container */}
        <View style={{flex: 1, padding: Metrics.regularPadding, justifyContent: 'space-between'}}>
          <View style={{justifyContent: 'flex-start'}}>
            <Text style={{color: Colors.text_color_1, fontSize: Fonts.size.medium }}>{`${item.data}:`}</Text>
          </View>
          <View style={{justifyContent: 'flex-end'}}>
            <Text style={{color: Colors.text_color_1, fontWeight: 'bold', fontSize: Fonts.size.medium }}>{`${(item.data=="GENDER")?this.handleDisplayGender(item.details):item.details}`}</Text>
          </View>
        </View>
      </View>
    ) 
  }

  handleFetchDataIndicator(status){
    this.setState({
      fetch_data: status
    })
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

  // Loading Indicator
  handleRenderLoadingIndicator(){
    return(
      <LoadingIndicator 
        visible={this.state.fetch_data}
        size={"large"} 
        text={"Update data..."}
      />
    )
  }

  render() {
    /** Local variable config **/
    var portrait = this.state.screenWidth < this.state.screenHeight
    /** End local variable config **/ 
    // alert(JSON.stringify(this.state.state_data))
    return (
      /**Start Safe Area**/
      <SafeAreaView style={ApplicationStyles.screen.safeAreaContainer} forceInset={{vertical:'never'}} >
        {
          (!this.state.nric)
          ?
          // User Not Login Display Mode
          <View style={[ApplicationStyles.screen.testContainer,  {alignSelf: 'center'}]}>
            <View style={{width: '100%', justifyContent: 'center', padding: Metrics.basePadding}}>
              <Label style={{marginBottom: Metrics.baseMargin*6}}>Come and join us to get your discount vouchers and many more great deals.</Label>
              <AppsButton 
                onPress={() => {this.props.navigation.navigate("LandingScreen", {prev_screen: this.props.navigation.state.routeName})}}
                backgroundColor={Colors.primary}
                text={"LOGIN / REGISTER"}
                fontSize={20}
              />
            </View>
          </View>
          :
          // User Login Display Mode
          <View style={[{backgroundColor: Colors.primary}]}>
           {/* Profile Image and Member Data Info */}
            <Animated.View style={[{width: '100%', height: this.imageHeight, backgroundColor: Colors.primary, justifyContent: 'center'}]}>
              
              {/* Profile Image */}
              {
                (!this.state.fetch_data)
                ?
                <View style={[{justifyContent: 'center', paddingTop: Metrics.basePadding}]}>
                  <TouchableOpacity style={[ProfileContainer.imageContainer, {}]} onPress={this.handleProfileImage.bind(this)}>
                    <View style={[{
                      width: Metrics.images.profileImg, 
                      height: Metrics.images.profileImg, 
                    }]}>
                      <Image
                        source={this.state.imageSource}
                        style={[{
                          resizeMode: 'cover', 
                          backgroundColor: Colors.text_color_3,
                          width: Metrics.images.profileImg, 
                          height: Metrics.images.profileImg, 
                          borderRadius: Metrics.images.profileImg/2,
                        }, (!this.state.img_exist)?{tintColor: Colors.text_color_1}:'']}
                      />
                      <View style={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: Colors.secondary,
                        width: Metrics.icons.medium, 
                        height: Metrics.icons.medium, 
                        borderRadius: Metrics.icons.medium/2,
                        /** Shadow Effect Settings **/
                        shadowColor: '#000',
                        shadowOffset: {width: 0, height: 5},
                        shadowOpacity: 0.58,
                        shadowRadius: 5,
                        elevation: 24
                      }}>
                        <Image
                          source={Images.edit}
                          style={[{
                            tintColor: Colors.primary,
                            backgroundColor: Colors.secondary,
                            resizeMode: 'cover', 
                            width: Metrics.icons.small, 
                            height: Metrics.icons.small, 
                            borderRadius: Metrics.icons.small/2,
                          }]}
                        />
                      </View>
                    </View>
                  </TouchableOpacity>
                </View>
                :
                <View style={[ProfileContainer.imageContainer, {}]}>
                  <Progress.CircleSnail 
                    size={Metrics.images.profileImg} 
                    animating={this.state.fetch_data}
                    hidesWhenStopped={true}
                    color={Colors.secondary}
                    thickness={5}
                  />
                </View>
              }

              {/* Member Data */}
              <View style={[{flex: 1, paddingVertical: Metrics.basePadding, alignItems: 'center'}]}>
                <Label style={{color: Colors.secondary, fontWeight: 'bold'}}>{this.state.name}</Label>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Image 
                    source={Images.email}
                    style={{
                      tintColor: Colors.secondary,
                      width: Metrics.icons.small, 
                      height: Metrics.icons.small, 
                      marginRight: Metrics.smallPadding 
                    }}
                  />
                  <Label style={{color: Colors.secondary, fontWeight: 'bold'}}>{this.state.email}</Label>
                </View>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Image 
                    source={Images.card_membership}
                    style={{
                      tintColor: Colors.secondary,
                      width: Metrics.icons.small, 
                      height: Metrics.icons.small,
                      marginRight: Metrics.smallPadding 
                    }}
                  />
                  <Label style={{color: Colors.secondary, fontWeight: 'bold'}}>{this.state.card_no}</Label>
                </View>
              </View>
              
            </Animated.View>

            <Animated.ScrollView 
              style={{
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                backgroundColor: Colors.background,
              }}
              bounces={true}
              scrollEventThrottle={16}
              onScroll={
                Animated.event([{nativeEvent: { contentOffset: { y: this.scrollY }}}])
              } 
              showsVerticalScrollIndicator={false} 
            > 
              <View style={[ProfileContainer.mainContainer]}>
                
                {/* Password Container */}
                <View style={[ProfileContainer.memberInfoContainer, {}]}>                  
                  {/* Password Header */}
                  <View style={{flexDirection: 'row', justifyContent: 'space-between', padding: Metrics.smallPadding}}>
                    <View style={{width: '10%'}}>
                      <Image 
                        source={Images.lock}
                        style={{width: Metrics.icons.small, height: Metrics.icons.small, tintColor: Colors.text_color_1,}}
                      />
                    </View> 
                    <View style={{width: '80%'}}>
                      <Text style={{fontWeight: 'bold', color: Colors.text_color_1}}>PASSWORD</Text>
                    </View>
                    <View style={{width: '10%'}}>
                      <TouchableOpacity onPress={() => this.props.navigation.navigate("EmailPasswordScreen",{edit: 2})}> 
                        <Text style={{color: Colors.text_color_1}}>Edit</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Border Line */}
                  <View style={{width: '95%', alignSelf: 'center'}}> 
                    <Divider lineColor={Colors.border_line}/>
                  </View>

                  {/* Password Body */}
                  <View style={{paddingHorizontal: Metrics.doubleBaseMargin}}>
                    <View style={{flex: 1, padding: Metrics.regularPadding, justifyContent: 'space-between'}}>
                      <Text style={{color: Colors.text_color_1, fontSize: Fonts.size.medium, fontWeight: 'bold', }}>******</Text>
                    </View>
                  </View>

                </View>
                
                {/* Personal Info Container */}
                <View style={[ProfileContainer.memberInfoContainer, {}]}>
                  {/* Personal Info Header */}
                  <View style={{flexDirection: 'row', justifyContent: 'space-between', padding: Metrics.smallPadding}}>
                    <View style={{width: '10%'}}>
                      <Image 
                        source={Images.person}
                        style={{width: Metrics.icons.small, height: Metrics.icons.small, tintColor: Colors.text_color_1,}}
                      />
                    </View> 
                    <View style={{width: '80%'}}>
                      <Text style={{fontWeight: 'bold', color: Colors.text_color_1}}>PERSONAL INFORMATION</Text>
                    </View>
                    <View style={{width: '10%'}}>
                      <TouchableOpacity onPress={() => {this.handleEditPersonalList()}}>
                        <Text style={{color: Colors.text_color_1}}>Edit</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Border Line */}
                  <View style={{width: '95%', alignSelf: 'center'}}> 
                    <Divider lineColor={Colors.border_line}/>
                  </View>

                  {/* Personal Info Body Display & Edit Mode */}
                  {
                    (!this.state.flatListDataEdit_personal)
                    ?
                    // Personal Info Body Display Mode
                    <View style={{paddingHorizontal: Metrics.doubleBaseMargin}}>
                      <FlatList  
                        data={this.state.personallist}
                        renderItem={this.handleFlatListRenderItem}
                        key={portrait ? "h" : "v"}
                        extraData={this.state.flatListRentalTrigger}
                      />
                    </View>
                    :
                    // Personal Info Body Edit Mode
                    <View style={{paddingHorizontal: Metrics.doubleBaseMargin}}>
                      <View>
                        {/* Details Container */}
                        <View style={{flex: 1, padding: Metrics.smallPadding, justifyContent: 'space-between'}}>
                          <View style={{justifyContent: 'flex-start'}}>
                            <Text style={{color: Colors.text_color_1, fontSize: Fonts.size.medium }}>NAME:</Text>
                          </View>
                          <View style={{justifyContent: 'flex-end'}}>
                            <ARMSTextInput
                              placeholder={"Name"}
                              autoCapitalize={'words'}
                              onChangeText={(value) => this.setState({name: value})}
                              onSubmitEditing={() => {}}
                              value={this.state.name}
                            />
                          </View>
                        </View>

                        {/* <View style={{flex: 1, padding: Metrics.smallPadding, justifyContent: 'space-between'}}>
                          <View style={{justifyContent: 'flex-start'}}>
                            <Text style={{color: Colors.text_color_1, fontSize: Fonts.size.medium }}>NRIC:</Text>
                          </View>
                          <View style={{justifyContent: 'flex-end'}}>
                            <Text style={{color: Colors.text_color_2, fontSize: Fonts.size.medium }}>{this.state.nric}</Text>
                            <ARMSTextInput
                              placeholder={"NRIC"}
                              onChangeText={(value) => this.setState({nric: value})}
                              onSubmitEditing={() => {}}
                              value={this.state.nric}
                            />
                          </View>
                        </View> */}

                        {/* <View style={{flex: 1, padding: Metrics.smallPadding, justifyContent: 'space-between'}}>
                          <View style={{justifyContent: 'flex-start'}}>
                            <Text style={{color: Colors.text_color_1, fontSize: Fonts.size.medium }}>CARD NO:</Text>
                          </View>
                          <View style={{justifyContent: 'flex-end'}}>
                            <Text style={{fontSize: Fonts.size.input}}>{this.state.card_no}</Text>
                          </View>
                        </View> */}

                        <View style={{flex: 1, padding: Metrics.smallPadding, justifyContent: 'space-between'}}>
                          <View style={{justifyContent: 'flex-start'}}>
                            <Text style={{color: Colors.text_color_1, fontSize: Fonts.size.medium }}>GENDER:</Text>
                          </View>
                          <View style={{justifyContent: 'flex-end'}}>
                            <TouchableOpacity 
                              onPress={() => {this.handleSelectGender()}}
                              style={{
                                flex: 1,
                                justifyContent: 'space-between',
                                borderColor: Colors.primary,
                                borderWidth: 1,
                                borderRadius: Metrics.textInputRadius,
                                flexDirection: "row",
                                fontFamily: Fonts.type.base,
                                fontSize: 20,
                                padding: Metrics.basePadding,
                                flex: 9,
                              }}
                            >
                              <Text style={{fontSize: Fonts.size.input}}>{this.handleDisplayGender(this.state.gender)}</Text>
                              <Image 
                                source={Images.dropdown}
                                style={{height: Metrics.icons.medium, width: Metrics.icons.medium}}  
                              />
                            </TouchableOpacity>
                          </View>
                        </View>

                        <View style={{flex: 1, padding: Metrics.smallPadding, justifyContent: 'space-between'}}>
                          <View style={{justifyContent: 'flex-start'}}>
                            <Text style={{color: Colors.text_color_1, fontSize: Fonts.size.medium }}>DATE OF BIRTH:</Text>
                          </View>
                          <View style={{justifyContent: 'flex-end'}}>
                            <DatePicker
                              style={{width: '100%',}}
                              date={this.state.dob}
                              mode="date"
                              androidMode={'spinner'}
                              placeholder="Select Date of Birth"
                              format="YYYY-MM-DD"
                              minDate="1900-01-01"
                              maxDate={moment().subtract(12, 'years').format("YYYY-MM-DD")}
                              confirmBtnText="Confirm"
                              cancelBtnText="Cancel"
                              customStyles={{
                                dateIcon: {
                                  position: 'absolute',
                                  right: 4,
                                },
                                dateInput: {
                                  borderColor: Colors.body,
                                  borderRadius: Metrics.textInputRadius,
                                  alignItems: 'flex-start',
                                },
                                dateText: {
                                  fontFamily: Fonts.type.base,
                                  fontSize: 20,
                                  paddingVertical: 5, //Metrics.basePadding*2,
                                  paddingLeft: Metrics.basePadding,
                                },
                                dateTouchBody:{
                                  borderColor: Colors.primary,
                                  borderWidth: 1,
                                  borderRadius: Metrics.textInputRadius,
                                  paddingVertical: Metrics.basePadding*2,
                                }
                              }}
                              onDateChange={(date) => {this.setState({dob: date})}}
                              // onDateChange={(date, maxDate) => {this.onChangeDOB(date, maxDate)}}
                            />
                            <Text style={{fontSize: Fonts.size.small, marginVertical: Metrics.smallMargin}}>
                              *Member must be at least 12 years old.
                            </Text>
                          </View>
                        </View>
                      </View>
                      
                      {/* Button Container */}
                      <View style={{flexDirection: 'row', justifyContent: 'space-around'}}>
                        
                        {/* Confirm Button - Personal Data */}
                        <TouchableOpacity
                          onPress={() => {this.handleUpdatePersonal(this.state.name, this.state.gender, this.state.dob)}}
                          style={{padding: Metrics.basePadding}}
                        >
                          <Text style={{textAlign: 'center', fontWeight: 'bold', color: 'green'}}>CONFIRM</Text>
                        </TouchableOpacity>
                        
                        {/* Cancel Button - Personal Data */}
                        <TouchableOpacity
                          onPress={() => {this.setState({flatListDataEdit_personal: false})}}
                          style={{padding: Metrics.basePadding}}
                        >
                          <Text style={{textAlign: 'center', fontWeight: 'bold', color: 'red'}}>CANCEL</Text>
                        </TouchableOpacity>
                      </View>

                    </View>
                  }
                </View>

                {/* Contact Container */}
                <View style={[ProfileContainer.memberInfoContainer, {}]}>
                  {/* Contact Header */}
                  <View style={{flexDirection: 'row', justifyContent: 'space-between', padding: Metrics.smallPadding}}>
                    <View style={{width: '10%'}}>
                      <Image 
                        source={Images.phone}
                        style={{width: Metrics.icons.small, height: Metrics.icons.small, tintColor: Colors.text_color_1,}}
                      />
                    </View> 
                    <View style={{width: '80%'}}>
                      <Text style={{fontWeight: 'bold', color: Colors.text_color_1}}>CONTACT INFORMATION</Text>
                    </View>
                    <View style={{width: '10%'}}>
                      <TouchableOpacity onPress={() => {this.handleEditContactList();}}>
                        <Text style={{color: Colors.text_color_1}}>Edit</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Border Line */}
                  <View style={{width: '95%', alignSelf: 'center'}}> 
                    <Divider lineColor={Colors.border_line}/>
                  </View>
                  
                  {/* Contact Body Display & Edit Mode */}
                  {
                    (!this.state.flatListDataEdit_contact)
                    ?
                    // Contact Body Display Mode
                    <View style={{paddingHorizontal: Metrics.doubleBaseMargin}}>
                      <FlatList  
                        data={this.state.contactlist}
                        renderItem={this.handleFlatListRenderItem}
                        key={portrait ? "h" : "v"}
                        extraData={this.state.flatListRentalTrigger}
                      />
                    </View>
                    :
                    // Contact Body Edit Mode
                    <View style={{paddingHorizontal: Metrics.doubleBaseMargin}}>
                      <View>
                        {/* Details Container */}
                        <View style={{flex: 1, padding: Metrics.smallPadding, justifyContent: 'space-between'}}>
                          <View style={{justifyContent: 'flex-start'}}>
                            <Text style={{color: Colors.text_color_1, fontSize: Fonts.size.medium }}>PHONE NO:</Text>
                          </View>
                          <View style={{justifyContent: 'flex-end'}}>
                            <ARMSTextInput
                              placeholder={"Phone no"}
                              keyboardType={"phone-pad"}
                              onChangeText={(value) => this.setState({phone_3: value})}
                              // onSubmitEditing={() => {this.addressInput.focus();}}
                              onEndEditing={() => {this.onChangedPhoneNo(this.state.phone_3)}}
                              value={this.state.phone_3}
                            />
                          </View>
                          {
                            (this.state.phone_3.match(/\D/g))
                            ?
                            <View style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
                              <Image 
                                source={Images.info} 
                                style={{
                                  tintColor: Colors.text_negative, 
                                  width: Metrics.icons.tiny, 
                                  height: Metrics.icons.tiny,
                                  marginRight: Metrics.smallPadding,
                                  marginVertical: Metrics.smallMargin
                                }}
                              />
                              <Text style={{color: Colors.text_negative, marginVertical: Metrics.smallMargin}}>
                              Please do not insert any symbols.
                              </Text>
                            </View>
                            :
                            <View/>
                          }
                        </View>

                        <View style={{flex: 1, padding: Metrics.smallPadding, justifyContent: 'space-between'}}>
                          <View style={{justifyContent: 'flex-start'}}>
                            <Text style={{color: Colors.text_color_1, fontSize: Fonts.size.medium }}>ADDRESS:</Text>
                          </View>
                          <View style={{justifyContent: 'flex-end'}}>
                            <ARMSTextInput
                              placeholder={"Address"}
                              autoCapitalize={'words'}
                              inputRef={(input)=>{this.addressInput = input;}}
                              onChangeText={(value) => this.setState({address: value})}
                              onSubmitEditing={() => {this.postcodeInput.focus();}}
                              value={this.state.address}
                            />
                          </View>
                        </View>

                        <View style={{flex: 1, padding: Metrics.smallPadding, justifyContent: 'space-between'}}>
                          <View style={{justifyContent: 'flex-start'}}>
                            <Text style={{color: Colors.text_color_1, fontSize: Fonts.size.medium }}>POSTCODE:</Text>
                          </View>
                          <View style={{justifyContent: 'flex-end'}}>
                            <ARMSTextInput
                              placeholder={"Postcode"}
                              inputRef={(input)=>{this.postcodeInput = input;}}
                              onChangeText={(value) => this.setState({postcode: value})}
                              onSubmitEditing={() => {this.cityInput.focus();}}
                              value={this.state.postcode}
                            />
                          </View>
                        </View>

                        <View style={{flex: 1, padding: Metrics.smallPadding, justifyContent: 'space-between'}}>
                          <View style={{justifyContent: 'flex-start'}}>
                            <Text style={{color: Colors.text_color_1, fontSize: Fonts.size.medium }}>CITY:</Text>
                          </View>
                          <View style={{justifyContent: 'flex-end'}}>
                            <ARMSTextInput
                              placeholder={"City"}
                              autoCapitalize={'words'}
                              inputRef={(input)=>{this.cityInput = input;}}
                              onChangeText={(value) => this.setState({city: value})}
                              // onSubmitEditing={() => {this.stateInput.focus();}}
                              value={this.state.city}
                            />
                          </View>
                        </View>

                        <View style={{flex: 1, padding: Metrics.smallPadding, justifyContent: 'space-between'}}>
                          <View style={{justifyContent: 'flex-start'}}>
                            <Text style={{color: Colors.text_color_1, fontSize: Fonts.size.medium }}>STATE:</Text>
                          </View>
                          <View style={{justifyContent: 'flex-end'}}>
                            <TouchableOpacity 
                              onPress={() => {this.handleSelectState()}}
                              style={{
                                flex: 1,
                                justifyContent: 'space-between',
                                borderColor: Colors.primary,
                                borderWidth: 1,
                                borderRadius: Metrics.textInputRadius,
                                flexDirection: "row",
                                fontFamily: Fonts.type.base,
                                fontSize: 20,
                                padding: Metrics.basePadding,
                                flex: 9,
                              }}
                            >
                              <Text style={{fontSize: Fonts.size.input}}>{this.state.state}</Text>
                              <Image 
                                source={Images.dropdown}
                                style={{height: Metrics.icons.medium, width: Metrics.icons.medium}}  
                              />
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>

                      {/* Button Container */}
                      <View style={{flexDirection: 'row', justifyContent: 'space-around'}}>

                        {/* Confirm Button - Contact Data */}
                        <TouchableOpacity
                          onPress={() => {this.handleUpdateContact(this.state.postcode, this.state.address, this.state.city, this.state.state, this.state.phone_3,)}}
                          style={{padding: Metrics.basePadding}}
                        >
                          <Text style={{textAlign: 'center', fontWeight: 'bold', color: 'green'}}>CONFIRM</Text>
                        </TouchableOpacity>

                        {/* Cancel Button - Contact Data */}
                        <TouchableOpacity
                          onPress={() => {this.setState({flatListDataEdit_contact: false})}}
                          style={{padding: Metrics.basePadding}}
                        >
                          <Text style={{textAlign: 'center', fontWeight: 'bold', color: 'red'}}>CANCEL</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  }
                </View>

                {/* Membership Container */}
                <View style={[ProfileContainer.memberInfoContainer, {}]}>
                  {/* Membership Header */}
                  <View style={{flexDirection: 'row', justifyContent: 'space-between', padding: Metrics.smallPadding}}>
                    <View style={{width: '10%'}}>
                      <Image 
                        source={Images.card_membership}
                        style={{width: Metrics.icons.small, height: Metrics.icons.small, tintColor: Colors.text_color_1,}}
                      />
                    </View> 
                    <View style={{width: '80%'}}>
                      <Text style={{fontWeight: 'bold', color: Colors.text_color_1}}>MEMBERSHIP INFORMATION</Text>
                    </View>
                    <View style={{width: '10%'}}>
                    </View>
                  </View>

                  {/* Border Line */}
                  <View style={{width: '95%', alignSelf: 'center'}}> 
                    <Divider lineColor={Colors.border_line}/>
                  </View>

                  {/* Membership Body */}
                  <View style={{paddingHorizontal: Metrics.doubleBaseMargin}}>
                    <FlatList  
                      data={this.state.membershiplist}
                      renderItem={this.handleFlatListRenderItem}
                      key={portrait ? "h" : "v"}
                      extraData={this.state.flatListRentalTrigger}
                    />
                  </View>
                </View>

              </View>

            </Animated.ScrollView> 
          </View>
        }

        {/* Loading Animation */}
        {this.handleRenderLoadingIndicator()}

      </SafeAreaView>
    )
  }
}



/**
 * Start Unused upload image by platform code
 */

  // if(Platform.OS == "ios") {
  //   var upload = this.profileImage.handleImageUploadIos(nric, source)
  //   upload.then((res) => {
  //     if(res.result == 1) {
  //       Alert.alert(
  //         'Upload Success', 'You have change your profile image.',
  //         [ {text: 'OK', style: 'cancel'}, ],
  //         { cancelable: false }
  //       )
  //       this.setState({
  //         checker: true,
  //         img_exist: true,
  //       }, () => {
  //         this.uploadImageChecker(this.state.checker)
  //       })
  //     } else {
  //       Alert.alert(
  //         'Upload Failed', 'Please try again later.',
  //         [ {text: 'OK', style: 'cancel'}, ],
  //         { cancelable: false }
  //       )
  //     }  
  //   })
  // } else if(Platform.OS == "android") {
  //   var upload = this.profileImage.handleImageUploadAndroid(nric, source)
  //   upload.then((res) => {
  //     if(res.result == 1) {
  //       Alert.alert(
  //         'Upload Success', 'You have change your profile image.',
  //         [ {text: 'OK', style: 'cancel'}, ],
  //         { cancelable: false }
  //       )
  //       this.setState({
  //         checker: true,
  //         img_exist: true,
  //       }, () => {
  //         this.uploadImageChecker(this.state.checker)
  //       })
  //     } else {
  //       Alert.alert(
  //         'Upload Failed', 'Please try again later.',
  //         [ {text: 'OK', style: 'cancel'}, ],
  //         { cancelable: false }
  //       )
  //     }  
  //   }) 
  // }

  // onChangeDOB(date, maxDate){
  //   this.setState({
  //     dob: date,
  //   });

  //   var maxDate = date.getFullYear();
  //   var date = date.getFullYear();
  //   if(maxDate - date == 12) {
  //     this.setState({
  //       checkDate: true
  //     })
  //   } else {
  //     this.setState({
  //       checkDate: false
  //     })
  //   }
  // }

  {/* Email container */}
  {/* <View style={[ProfileContainer.memberInfoContainer, {}]}> */}
    {/* Email Header */}
    {/* <View style={{flexDirection: 'row', justifyContent: 'space-between', padding: Metrics.smallPadding}}>
      <View style={{width: '10%'}}>
        <Image 
          source={Images.email}
          style={{width: Metrics.icons.small, height: Metrics.icons.small, tintColor: Colors.primary,}}
        />
      </View> 
      <View style={{width: '80%'}}>
        <Text style={{fontWeight: 'bold', color: Colors.primary}}>EMAIL</Text>
      </View>
      <View style={{width: '10%'}}>
        <TouchableOpacity onPress={() => this.props.navigation.navigate("EmailPasswordScreen",{edit: 1})}>
          <Text style={{color: Colors.primary}}>Edit</Text>
        </TouchableOpacity>
      </View>
    </View> */}

    {/* Border Line */}
    {/* <View style={{width: '95%', alignSelf: 'center'}}> 
      <Divider lineColor={Colors.border_line}/>
    </View> */}

    {/* Email Body */}
    {/* <View style={{paddingHorizontal: Metrics.doubleBaseMargin,}}>
      <FlatList  
        data={this.state.emaillist}
        renderItem={this.handleFlatListRenderItem}
        key={portrait ? "h" : "v"}
        extraData={this.state.flatListRentalTrigger}
      />
    </View>
  </View> */}

/**
 * End Unused upload image by platform code
 */