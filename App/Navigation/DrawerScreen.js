/** REACT NATIVE **/
import React, { Component } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  TouchableOpacity,
  View,
  Linking,
  Platform
} from 'react-native';
import PropTypes from 'prop-types';

/** PROJECT FILES **/
import {
  Colors, Fonts, Images, Metrics, ApplicationStyles,
  Label,
  I18n,
  AppConfig,
} from '../Services/LibLinking';
import styles from './DrawerScreenStyles';
import DrawerController from './DrawerController.js';
import ProfileImage from '../Modules/Member/Actions/profileImage_controller.js';
import LoginController from '../Modules/General/Login/Actions/login_controller';

/** NPM LIBRARIES **/
import moment from 'moment';
import { NavigationActions, DrawerActions } from 'react-navigation';

export default class DrawerScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      nric: '',
      name: '',
      email: '',
      card_no: '',
      imageSource: AppConfig.profile_image_default,
      img_exist: '',
    }

    // Create controller object
    this.drawerController = new DrawerController({
      navigation: this.props.navigation
    });
    this.loginController = new LoginController();
    this.profileImage = new ProfileImage();
  }

  navigateToScreen = (route, params = "") => () => {
    const navigateAction = NavigationActions.navigate({
      routeName: route,
      params: params,
    });
    this.props.navigation.dispatch(navigateAction);
    this.props.navigation.dispatch(DrawerActions.closeDrawer());
  }

  componentDidMount() {
    var nric = this.props.navigation.getParam("nric");
    this.setState({
      nric: nric
    });

    // handle profile information details
    this.handleMemberData(nric);
    this.handleLoadProfileImage(nric);


    // TEST
    // if (Platform.OS === 'android') {
    //   Linking.getInitialURL().then(url => {
    //     this.navigate(url);
    //   });
    // } else {
    //   Linking.addEventListener('url', this.handleOpenURL);
    // }
  }

  componentWillUnmount() {
    // Linking.removeEventListener('url', this.handleOpenURL);
  }

  // handleOpenURL = (event) => {
  //   this.navigate(event.url);
  // }

  // navigate = (url) => {
  //   const { navigate } = this.props.navigation;
  //   const route = url.replace(/.*?:\/\//g, '');
  //   const id = route.match(/\/([^\/]+)\/?$/)[1];
  //   const routeName = route.split('/')[0];

  //   // if (routeName === 'people') {
  //   //   navigate('People', { id, name: 'chris' })
  //   // };
  //   // alert(`id: ${id}, routeName: ${routeName}`)
  // }

  componentDidUpdate(prevProps) {
    // Login Update
    var loginUpdate = this.props.navigation.getParam('loginUpdate', false);
    if (loginUpdate && this.props.navigation != prevProps.navigation) {
      this.props.navigation.setParams({ loginUpdate: false });
      this.handleLoginUpdate();
    }

    // Upload Image Checker
    var uploadImageChecker = this.props.navigation.getParam("uploadImageChecker", false);
    if (uploadImageChecker == true) {
      var nric = this.state.nric;
      this.handleLoadProfileImage(nric);
      this.props.navigation.setParams({ uploadImageChecker: false })
    }
  }

  async handleLoginUpdate() {
    // var loginUpdate = this.props.navigation.getParam('loginUpdate', false);
    // if(loginUpdate){
    var nric = '';
    var login_user = await this.loginController.fetchCurrentLoginMember();
    if (login_user.result == 1 && login_user.data) {
      nric = login_user.data.nric;
    }
    this.props.navigation.setParams({ loginUpdate: false });
    this.handleSetNRIC(nric);
    // }
  }

  handleSetNRIC(nric) {
    this.setState({ nric });
    this.handleMemberData(nric);
    this.handleLoadProfileImage(nric);
  }

  handleMemberData(nric) {
    if (nric) {
      var result = this.drawerController.fetchMemberData(nric)
      result.then((res) => {
        if (res.result == 1) {
          if (res.data) {
            var name = res.data.name;
            var email = res.data.email;
            var card_no = res.data.card_no;
            this.setState({
              name: name,
              email: email,
              card_no: card_no
            })
          }
        } else {
          var res_mem_api = res.member_info_api;
          var err_msg = (res_mem_api.result == 1) ? `${res.data.msg}.` : `${res.data.msg}. ${err_mem_api.data}`;
          Alert.alert(
            '', err_msg
          )
        }
      })
    } else {
      this.setState({
        name: '',
        email: '',
        card_no: '',
      });
    }
  }

  handleLoadProfileImage(nric) {
    if (nric) {
      var profileImageData = this.profileImage.handleGetProfileImageFromFolder(nric);
      profileImageData.then((res) => {
        if (res.result == 1) {
          this.setState({
            imageSource: { uri: res.path_img },
            img_exist: res.img_exist,
          })
        } else {
          this.setState({
            imageSource: AppConfig.profile_image_default,
            img_exist: false,
          })
        }
      })
    } else {
      this.setState({
        imageSource: AppConfig.profile_image_default,
        img_exist: false,
      })
    }
  }

  handleLogout(nric) {
    Alert.alert(
      'Log out', 'Do you want to log out?',
      [
        { text: I18n.t("alert_cancel_text"), style: 'cancel' },
        { text: I18n.t("alert_confirm_text"), style: 'default', onPress: () => { this.processLogout(nric) } }
      ],

      { cancelable: false }
    )
  }

  processLogout(nric) {
    var nric = nric;
    var logout = this.drawerController.handleLogOutProcess(nric)
    logout.then((res) => {
      if (res.result == 1) {
        const navigateAction = NavigationActions.navigate({
          routeName: "DashboardScreen",
          params: { loginUpdate: true },
        });
        this.props.navigation.dispatch(navigateAction);
        this.props.navigation.dispatch(DrawerActions.closeDrawer());
      } else {
        // alert('Logout Failed');
        Alert.alert('', res.data);
      }
    })
  }

  render() {
    return (
      // <SafeAreaView
      // 	style={[ApplicationStyles.screen.safeAreaContainer, {backgroundColor: Colors.primary, borderColor: 'red', borderWidth: 1,}]}
      // 	forceInset={{ bottom: "never" }}
      // >
      <View style={[ApplicationStyles.screen.safeAreaContainer, {}]}>
        {/* Scroll View */}
        <ScrollView>

          {/* Header Content - Background Image, User Image, User Name, User Email and Membership Number */}
          <View style={{}}>

            {/* Background Image */}
            <Image
              source={Images.drawer_back_img}
              style={{
                height: Metrics.images.drawerBackground,
                width: '100%',
                resizeMode: 'cover',
              }} />

            {/* User Image, Name, Email and Membership Number (Position = 'absolute') */}
            <View
              style={{
                backgroundColor: Colors.opacityBlurBackground,
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
                padding: Metrics.basePadding,
                justifyContent: 'flex-end',
              }}>

              {/* User Image */}
              <Image
                source={this.state.imageSource}
                borderRadius={Metrics.images.drawerUserImg / 2}
                style={[{
                  resizeMode: 'cover',
                  backgroundColor: Colors.text_color_3,
                  width: Metrics.images.drawerUserImg,
                  height: Metrics.images.drawerUserImg,
                  marginBottom: Metrics.basePadding,
                }, (!this.state.img_exist) ? { tintColor: Colors.text_color_1 } : '']}
              />

              {/* User Name */}
              <Label
                style={{ color: Colors.text_color_3, fontWeight: 'bold' }}
                numberOfLines={1}
                ellipsizeMode='middle'
              >
                {this.state.name}
              </Label>

              {/* User Email */}
              <Label
                style={{ color: Colors.text_color_3, fontWeight: 'bold' }}
                numberOfLines={1}
                ellipsizeMode='middle'
              >
                {this.state.email}
              </Label>

              {/* User Membership Number */}
              <View style={{ flexDirection: 'row', width: '100%' }}>
                <Label
                  style={{ color: Colors.text_color_3, fontWeight: 'bold' }}
                  numberOfLines={1}
                  ellipsizeMode='middle'
                >
                  {this.state.card_no}
                </Label>
              </View>

            </View>

          </View>

          {/* Body Content */}

          {/* Home */}
          <View style={styles.rowBodyContainer}>
            <TouchableOpacity onPress={this.navigateToScreen("DashboardScreen", { key: moment(), nric: this.state.nric, loginUpdate: true })} style={{ flexDirection: 'row' }}>
              <Image style={{ height: Metrics.icons.small, width: Metrics.icons.small, tintColor: Colors.primary }} source={Images.dashboard} />
              <Label style={styles.rowBodyText} text={"Dashboard"} />
            </TouchableOpacity>
          </View>

          {/* Promotion */}
          {/* <View style={styles.rowBodyContainer}>
            <TouchableOpacity  onPress={this.navigateToScreen("PromotionScreen")} style={{flexDirection: 'row'}}>
            <Image style={{height: Metrics.icons.small, width: Metrics.icons.small}} source={Images.promo}/>
              <Label style={styles.rowBodyText} text={"Promotion"} />
            </TouchableOpacity>
          </View> */}

          {/* Voucher */}
          {/* <View style={styles.rowBodyContainer}> */}
          {/* <TouchableOpacity  onPress={this.navigateToScreen("VoucherScreen", {nric: this.state.nric, loginUpdate: true})} style={{flexDirection: 'row'}}/> */}
          {/* <Image style={{height: Metrics.icons.small, width: Metrics.icons.small}} source={Images.voucherIcon}/>
              <Label style={styles.rowBodyText} text={"Voucher"} />
            </TouchableOpacity> */}
          {/* </View> */}

          {/* EBrochure */}
          {/* <View style={styles.rowBodyContainer}>
            <TouchableOpacity  onPress={this.navigateToScreen("EBrochureScreen")} style={{flexDirection: 'row'}}>
              <Image style={{height: Metrics.icons.small, width: Metrics.icons.small}} source={Images.eBrochure}/>
              <Label style={styles.rowBodyText} text={"E - Brochure"} />
            </TouchableOpacity>
          </View> */}

          {/* Profile */}
          <View style={styles.rowBodyContainer}>
            <TouchableOpacity onPress={this.navigateToScreen("ProfileScreen", { nric: this.state.nric, loginUpdate: true })} style={{ flexDirection: 'row' }}>
              <Image style={{ height: Metrics.icons.small, width: Metrics.icons.small, tintColor: Colors.primary }} source={Images.person} />
              <Label style={styles.rowBodyText} text={"Profile Information"} />
            </TouchableOpacity>
          </View>

          {/* Outlet Location */}
          <View style={styles.rowBodyContainer}>
            <TouchableOpacity onPress={this.navigateToScreen("OutletListScreen", { loginUpdate: true })} style={{ flexDirection: 'row' }}>
              <Image style={{ height: Metrics.icons.small, width: Metrics.icons.small, tintColor: Colors.primary }} source={Images.location} />
              <Label style={styles.rowBodyText} text={"Outlet Location"} />
            </TouchableOpacity>
          </View>

          {/* Referral Program */}
          <View style={styles.rowBodyContainer}>
            <TouchableOpacity onPress={this.navigateToScreen("ReferralProgramScreen", { loginUpdate: true })} style={{ flexDirection: 'row' }}>
              <Image style={{ height: Metrics.icons.small, width: Metrics.icons.small, tintColor: Colors.primary }} source={Images.two_people} />
              <Label style={styles.rowBodyText} text={"Referral Program"} />
            </TouchableOpacity>
          </View>

          {/* Online Store */}
          <View style={styles.rowBodyContainer}>
            <TouchableOpacity onPress={this.navigateToScreen("EComLandingScreen", { loginUpdate: true })} style={{ flexDirection: 'row' }}>
              <Image style={{ height: Metrics.icons.small, width: Metrics.icons.small, tintColor: Colors.primary }} source={Images.store} />
              <Label style={styles.rowBodyText} text={"Online Store"} />
            </TouchableOpacity>
          </View>

          {/* Scan And Pay */}
          {/* <View style={styles.rowBodyContainer}>
            <TouchableOpacity onPress={this.navigateToScreen("SAPLandingScreen", { loginUpdate: true })} style={{ flexDirection: 'row' }}>
              <Image style={{ height: Metrics.icons.small, width: Metrics.icons.small, tintColor: Colors.primary }} source={Images.scanner} />
              <Label style={styles.rowBodyText} text={"Scan And Pay"} />
            </TouchableOpacity>
          </View> */}

          {/* DEMO */}
          <View style={styles.rowBodyContainer}>
            <TouchableOpacity onPress={this.navigateToScreen("SAPWebScreen", { loginUpdate: true })} style={{ flexDirection: 'row' }}>
              <Image style={{ height: Metrics.icons.small, width: Metrics.icons.small, tintColor: Colors.primary }} source={Images.scanner} />
              <Label style={styles.rowBodyText} text={"Scan And Pay [DEMO]"} />
            </TouchableOpacity>
          </View>

          {/* Logout */}
          {
            this.state.nric
              ?
              <View style={styles.rowLogoutContainer}>
                <TouchableOpacity onPress={() => this.handleLogout(this.state.nric)} >
                  <Label style={[styles.rowBodyText, { color: Colors.secondary, fontWeight: 'bold' }]} text={"Logout"} />
                </TouchableOpacity>
              </View>
              :
              <View />
          }

          {/* Version */}
          <View style={[{ width: '100%', alignItems: 'flex-end', paddingHorizontal: Metrics.smallPadding, }]}>
            <Label style={{ fontSize: Fonts.size.small }} text={`Version ${AppConfig.app_version}`} />
          </View>

          {/* End of Body Content */}

        </ScrollView>
        {/* Scroll View */}
      </View>
      // </SafeAreaView>
    );
  }
}

DrawerScreen.propTypes = {
  navigation: PropTypes.object
};