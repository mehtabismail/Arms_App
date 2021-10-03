/** REACT NATIVE **/
import React from 'react';
import {
  Alert, Animated,
  Dimensions,
  FlatList,
  Image,
  Linking,
  Modal,
  Platform,
  ScrollView,
  Text, TextInput, TouchableOpacity,
  View,
} from 'react-native';

/** PROJECT FILES **/
import {
  Colors, Fonts, Images, Metrics, ApplicationStyles,
  LoadingIndicator, Label, SpringAnimation, HorizontalScrollAnimation, DiscountLabel, SmallBadge, AppsButton, Divider
} from '../../../Services/LibLinking';
import LoginController from '../../General/Login/Actions/login_controller';
import MemberController from '../../Member/Actions/member_controller';
import POSController from '../../General/POS/Actions/POSControllers';

/** NPM LIBRARIES **/
import { NavigationActions, DrawerActions, SafeAreaView } from 'react-navigation';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { WebView } from 'react-native-webview';
import moment from 'moment';

const SCREEN_WIDTH = Dimensions.get("screen").width;
const SCREEN_HEIGHT = Dimensions.get("screen").height;

export default class ScanAndPayWeb extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      screenWidth: Dimensions.get('window').width,
      screenHeight: Dimensions.get('window').height,

      // Member
      nric: '',
      card_no: '',
      member_type: '',

      // Fetch data from server indicator
      isFetchData: false,
      textFetchData: 'Fetching data...',
      firstLoad: true,

      // Scan & Pay Module Check
      isSAPAccessible: false,

      // Order Data
      order: {
        id: 0,
        local_id: '',
        transaction_id: '',
        receipt_no: '',
        receipt_ref_no: '',
        branch_id: '',
        member_card_no: '',
        counter_id: '',
        cashier_id: '',
        cashier_name: '',
        status: 'paid',
        sub_total_amount: 0,
        discount_amount: 0,
        rounding: 0,
        total_amount: 0,
        cash_received: 0,
        change: 0,
        payment: [],
        transaction_date: '',
        start_time: '',
        end_time: '',
        created_date: '',
        order_item: [
          // {
          //   local_id: '123',
          //   transaction_id: '123',
          //   branch_id: '47',
          //   sku_item_id: '12345',
          //   product_name: 'Testing 123456',
          //   product_image: '',
          //   default_price: 1.0,
          //   selling_price: 1.0,
          //   quantity: 1,
          //   manual_discount_amount: 0,
          //   created_date: "",
          // }
        ],
        pos_settings: {
          receipt_header: "", //"ARMS SOFTWARE INTERNATIONAL SDN BHD\r\n\r\n58-2 Jalan Bayu Mutiara 1,\r\nTaman Bayu Mutiara,\r\n14000 Bukit Mertajam, \r\nPenang Malaysia.",
          receipt_footer: "", //"Thank You, Welcome again\r\nTerima Kasih\r\n欢迎光临\r\n歡迎光臨",
          ewallet_type: {
            // boost: "0",
            // paydibs_boost: "0",
            // paydibs_grabpay: "0",
            // paydibs_mbb: "0",
            // paydibs_mcash: "0",
            // paydibs_tng: "0"
          },
          use_running_no_as_receipt_no: 0,
          hour_start: 0,
          minute_start: 0
        }
      },

      // Camera
      focusPointX: 0.5,
      focusPointY: 0.5,

      // Branch Selection
      isScanBranch: false,
      scanBranchID: '',
      scanBranchCount: 0,

      // Scan & Search
      isScanProduct: false,
      scanProduct: '',
      scanProductCount: 0,

      // Payment Modal
      isPaymentModalDisplayed: false,
      selectedPaymentOption: 0,
      paymentOptions: [
        { id: "kiosk_counter", name: "Kiosk / Counter" },
        { id: "online_payment", name: "Online Payment" }
      ],

      // Kiosk or Counter Checkout
      isKioskCounterCheckout: false,
      checkoutQR: '12345',

    }

    // Create controller object
    this.loginController = new LoginController();
    this.memberController = new MemberController();
    this.posController = new POSController();
    this.webView = null;

  }

  /****************************************************************/
  /************************ HEADER ********************************/
  /****************************************************************/

  // Navigation Tab
  static navigationOptions = ({ navigation, navigationOptions }) => {
    const params = navigation.state.params || {};
    const navigateToScreen = params.this;
    const navigateToHome = params.navigateToHome;

    return {
      title: 'Scan & Pay',
      headerLeft: (
        <TouchableOpacity style={{ paddingLeft: 10 }} onPress={() => navigateToScreen(navigation, { loginUpdate: true })}>
          <Image
            style={{ width: Metrics.icons.medium, height: Metrics.icons.medium, tintColor: Colors.secondary }}
            source={Images.menu} />
        </TouchableOpacity>
      ),
      headerRight: (
        <TouchableOpacity
          style={{ paddingRight: 10 }}
          onPress={() => {
            navigateToHome(navigation, { key: moment(), nric: params.nric, loginUpdate: true })
          }}
        >
          <Label text='Close' style={{ color: Colors.secondary }} />
        </TouchableOpacity >
      ),
    }
  }

  // Navigate Function To Open Drawer
  navigateToScreen = (navigation, params = "") => {
    const navigateAction = NavigationActions.navigate({
      routeName: "DrawerStack",
      params: params,
    });

    navigation.dispatch(navigateAction);
    navigation.dispatch(DrawerActions.openDrawer());
  }

  navigateToHome = (navigation, params = "") => {
    const navigateAction = NavigationActions.back({
      params: params,
    });

    navigation.dispatch(navigateAction);
  }

  /****************************************************************/
  /*********************** COMPONENT  *****************************/
  /****************************************************************/

  componentDidMount() {
    this.props.navigation.setParams({ this: this.navigateToScreen, navigateToHome: this.navigateToHome });

    // Execute Login Update
    const { navigation } = this.props;
    this.focusListener = navigation.addListener('didFocus', () => {
      this.handleLoginUpdate();
    });
  }

  componentWillUnmount() {
    this.focusListener.remove();
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
      isFetchData: status,
      textFetchData: text ? text : 'Fetching data...'
    })
  }

  thousandSeparator(input) {
    var result = input.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    return result
  }

  /****************************************************************/
  /******************** FUNCTIONALITY *****************************/
  /****************************************************************/

  async handleLoginUpdate() {
    var nric = '', card_no = '', member_type = '';
    var login_user = await this.loginController.fetchCurrentLoginMember();
    if (login_user.result == 1 && login_user.data) {
      nric = login_user.data.nric;
      card_no = login_user.data.card_no;
      member_type = login_user.data.member_type;
    }
    this.props.navigation.setParams({ loginUpdate: false, nric });
    this.handleSetNRIC(nric, card_no, member_type);
  }

  handleSetNRIC(nric, card_no, member_type) {
    this.setState({ nric, card_no, member_type, firstLoad: false }, () => {
      this.handleInitScanAndPay();
    });
  }

  handleInitScanAndPay() {
    // Refresh webview
    if (this.webView) {
      this.webView.reload()
    }
  }

  /****************************************************************/
  /******************** SCREEN RENDERING **************************/
  /****************************************************************/

  // Loading Indicator
  handleRenderLoadingIndicator() {
    return (
      <LoadingIndicator
        visible={this.state.isFetchData}
        size={"large"}
        text={`${this.state.textFetchData}`}
      />
    )
  }

  // Render Landing Screen
  handleRenderLandingScreen() {
    return (
      this.state.isFetchData
        ?
        <View />
        :
        <View style={{ flex: 1 }}>
          <WebView
            ref={(ref) => { this.webView = ref }}
            source={{ uri: `https://snp-qc.arms.com.my/init?member_no=${this.state.card_no}` }}
            // source={{ uri: `https://snp.arms.com.my/init?member_no=${this.state.card_no}` }}
            originWhitelist={['*']}
            javaScriptEnabled={true}
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
            geolocationEnabled={true}
          />
        </View>
    )
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
            // Landing Screen
            this.handleRenderLandingScreen()
        }

        {/* Loading Animation */}
        {this.handleRenderLoadingIndicator()}

      </SafeAreaView>
    )
  }
}