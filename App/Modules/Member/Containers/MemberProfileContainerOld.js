import React, {Component} from 'react';
import {ApplicationStyles, Colors, Metrics, Fonts, Images} from '../../../Themes';
import ProfileContainer from '../Styles/MemberProfileStyles.js';
import Divider from '../../../Components/Divider.js';
import ImagePicker from "react-native-image-picker";
import {
  Alert,
  View,
  Text,  
  Image,
  ScrollView,
  Dimensions,
  FlatList,
  TouchableOpacity} from 'react-native';
import {SafeAreaView, NavigationActions, DrawerActions} from 'react-navigation';
import MemberController from '../Actions/member_controller.js';
import ProfileImage from '../Actions/profileImage_controller.js';
import AppConfig from '../../../Config/AppConfig';
import ARMSDownloader from '../../../Services/arms_downloader';

const options = {
  title: 'Select a photo',
  takePhotoButtonTitle: 'Take a photo',
  chooseFromLibraryButtonTitle: 'Choose from gallery',
  quality: 1,
};

export default class SettingView extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      screenWidth: Dimensions.get('window').width,
      screenHeight: Dimensions.get('window').height,
      
      nric: '',
      imageSource: AppConfig.profile_image_default,
      img_exist: false,
      checker: false,

      // FlatList
      datalist: [],
      flatListRentalTrigger: false, 
    }

    //Create Member Controller Object
    this.memberController = new MemberController({
      navigation: this.props.navigation
    });

    this.profileImage = new ProfileImage();
    this.armsDownloader = new ARMSDownloader();
  }

  /**Navigation Bottom Tab**/
  static navigationOptions = ({navigation, navigationOptions}) => {
    const params = navigation.state.params || {};

    var navigateToScreen = params.this
    var uploadImageChecker = params.checker
    return {
        title: 'Profile',
        headerLeft: (
          <TouchableOpacity style={{paddingLeft: 10}} onPress={() => navigateToScreen(navigation, {uploadImageChecker})}>
            <Image
              style={{width: Metrics.icons.medium, height: Metrics.icons.medium,}} 
              source={Images.menu}/>
          </TouchableOpacity>
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

  componentWillMount() {
    var nric = this.props.navigation.getParam('nric');
    this.setState({
      nric: nric,
    })

    this.props.navigation.setParams({this: this.navigateToScreen})
    this.uploadImageChecker(false)

    // handle profile information details
    this.handleMemberProfileInfo(nric);
    this.handleLoadProfileImage(nric);

  }

  uploadImageChecker(checker) {
    this.props.navigation.setParams({checker: checker})
  }

  handleLoadProfileImage(nric) {
    var profileImageData = this.profileImage.handleGetProfileImageFromFolder(nric);
    profileImageData.then((res)=>{
      if(res.result ==1){
        this.setState({
          imageSource: {uri: res.path_img},
          img_exist: res.img_exist,
        })
      }
    })
  }

  // handle choosing profile image 
  handleProfileImage() {
    ImagePicker.showImagePicker(options, (response) => {
      console.log('Response = ', response);
    
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      }  else {
        var nric = this.state.nric;
        var source = { uri: response.uri };
        this.handleUploadProfileImage(nric, response.uri)
        this.setState({
          imageSource: source,
        })
      }
    });
  }

  // handle upload profile image
  handleUploadProfileImage(nric, source) {
    var path = `${AppConfig.profile_image_local}/${nric}`;
    var checkPath = this.armsDownloader.handleFileExistChecking(path)
    checkPath.then((res) => {
      if(res.result == 1) {
        if(res.data) {
          var del = this.armsDownloader.handleFileUnlink(path)
          del.then((res) => {
            if(res.result == 1) {
              this.processImageUpload(nric, source);  
            } else {
              Alert.alert(
                'Change Failed', 'Current image cannot be deleted. Please try again later.',
                [ {text: 'OK', style: 'cancel'}, ],
                { cancelable: false }
              )
            }
          })
        } else {
          this.processImageUpload(nric, source);
        }
      }
    })
  }

  processImageUpload(nric, source){
    var upload = this.profileImage.handleImageUpload(nric, source)
    upload.then((res) => {
      if(res.result == 1) {
        Alert.alert(
          'Upload Success', 'You have change your profile image.',
          [ {text: 'OK', style: 'cancel'}, ],
          { cancelable: false }
        )
        this.setState({
          checker: true,
          img_exist: true,
        }, () => {
          this.uploadImageChecker(this.state.checker)
        })
      } else {
        Alert.alert(
          'Upload Failed', 'Please try again later.',
          [ {text: 'OK', style: 'cancel'}, ],
          { cancelable: false }
        )
      }
    })  
  }

  // Fetch Member Profile Info
  handleMemberProfileInfo(nric) {
    var result = this.memberController.fetchMemberDataProfile(nric)
    result.then((res) => {
      if(res.result == 1) {
        var profile_details_list = res.data.headerList;
        this.setState({
          datalist: profile_details_list,
          flatListRentalTrigger: !this.state.flatListRentalTrigger
        })
      } else {
        alert('No Data Found');
      }
    })
  }

  handleFlatListRenderItem = ({item, index}) => {
    return (
      <View>
        {/* Details Container */}
        <View style={{flex: 1, padding: Metrics.basePadding, justifyContent: 'space-between'}}>
          <View style={{justifyContent: 'flex-start'}}>
            <Text style={{color: Colors.text_color_1, fontSize: Fonts.size.regular }}>{`${item.data}:`}</Text>
          </View>
          <View style={{justifyContent: 'flex-end'}}>
          <Text style={{color: Colors.text_color_2, fontSize: Fonts.size.regular }}>{`${item.details}`}</Text>
          </View>
        </View>

        {/* Border Line */}
        <View style={{width: '95%', alignSelf: 'center'}}> 
          <Divider lineColor={Colors.border_line}/>
        </View>
      </View>

    ) 
  }

  render() {
    /** Local variable config **/
    var portrait = this.state.screenWidth < this.state.screenHeight
    // /** End local variable config **/ 
    return (
      /**Start Safe Area**/
      <SafeAreaView style={ApplicationStyles.screen.safeAreaContainer} forceInset={{bottom:'never'}}>

      <ScrollView showsVerticalScrollIndicator={false} > 
        <View style={[ProfileContainer.mainContainer,{marginBottom:100,}]}>

          {/* Profile Image */}
          <View>
            <TouchableOpacity style={[ProfileContainer.imageContainer, {}]} onPress={this.handleProfileImage.bind(this)}>
              <Image 
                source={this.state.imageSource}
                style={{resizeMode: 'stretch', width: '100%', height: '100%', borderColor: Colors.borderLight, borderWidth: 1}}
              />
            </TouchableOpacity>
            {
              (!this.state.img_exist)
              
              ?

              <View style={{width: '100%', margin: Metrics.smallMargin, justifyContent: 'center'}}>
                <Text style={{color: '#5DADE2', alignSelf: 'center'}}>Click on image to upload profile image</Text>
              </View>

              :

              <View style={{margin: Metrics.baseMargin, justifyContent: 'center'}}>
                <Text style={{color: '#5DADE2', alignSelf: 'center'}}>Click on image to change profile image</Text>
              </View>

            }
            
          </View>

          {/* Main Profile Details Container */}
          <View style={[ProfileContainer.detailContainer, {}]}>
            <FlatList 
              data={this.state.datalist}
              renderItem={this.handleFlatListRenderItem}
              key={portrait ? "h" : "v"}
              extraData={this.state.flatListRentalTrigger}
              // horizontal={true}
            />
          </View>

        </View>
      </ScrollView>
      </SafeAreaView>
    )
  }
}