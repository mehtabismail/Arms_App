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
  LoadingIndicator, Label, AppsButton
} from '../../../Services/LibLinking';
import POSController from '../../General/POS/Actions/POSControllers';

/** NPM LIBRARIES **/
import { NavigationActions, DrawerActions, SafeAreaView } from 'react-navigation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from "moment";
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import ViewShot from "react-native-view-shot";
import RNImageToPdf from 'react-native-image-to-pdf';
import Share from 'react-native-share';
import RNFetchBlob from 'rn-fetch-blob'
import { tailwind } from '../../../../tailwind';

const SCREEN_WIDTH = Dimensions.get("screen").width;
const SCREEN_HEIGHT = Dimensions.get("screen").height;

export default class SAPReceiptView extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      // Member
      nric: '',
      card_no: '',

      // Fetch data from server indicator
      isFetchData: false,
      textFetchData: 'Fetching data...',
      firstLoad: true,

      companyDetails: {
        name: "ABC DEMO Sdn. Bhd.",
        gst_register_no: "000029389484",
        address_1: "58-2, Jalan Bayu Mutiara 1, ",
        address_2: "Taman Bayu Mutiara,",
        postcode: "14000",
        city: "Bukit Mertajam",
        state: "Penang",
        country: "Malaysia"
      },

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
            boost: "0",
            paydibs_boost: "0",
            paydibs_grabpay: "0",
            paydibs_mbb: "0",
            paydibs_mcash: "0",
            paydibs_tng: "0"
          },
          use_running_no_as_receipt_no: 0,
          hour_start: 0,
          minute_start: 0
        }
      },

      // Payment Method Label
      payment_method_label: {
        cash: "Cash",
        credit_card: "Credit Card",
        e_wallet: "E-Wallet",
        discount: "Discount"
      },

    }

    // Create controller object
    this.posController = new POSController();
  }

  /****************************************************************/
  /************************ HEADER ********************************/
  /****************************************************************/

  // Navigation Tab
  static navigationOptions = ({navigation, navigationOptions}) => {
    const params = navigation.state.params || {};
    var navigateToScreen = params.this;

    return {
      title: 'Receipt',
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

  /****************************************************************/
  /*********************** COMPONENT  *****************************/
  /****************************************************************/

  componentDidMount() {
    var local_id = this.props.navigation.getParam("local_id", '');
    this.handleRetrieveOrder(local_id);
  }

  componentWillUnmount() {
  }

  componentDidUpdate(prevProps){
    // Login Update
    // var loginUpdate = this.props.navigation.getParam('loginUpdate', false);
    // if(loginUpdate && this.props.navigation != prevProps.navigation){
    //   this.props.navigation.setParams({loginUpdate: false});
    //   this.handleLoginUpdate();
    // }
  }

  handleFetchDataIndicator(status, text=""){
    this.setState({
      isFetchData: status,
      textFetchData: text ? text : 'Fetching data...'
    })
  }

  thousandSeparator(input){
    var result = input.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    return result
  }

  /****************************************************************/
  /******************** FUNCTIONALITY *****************************/
  /****************************************************************/

  async handleRetrieveOrder(local_id){
    this.handleFetchDataIndicator(true, "Fetching order...");
    var order_result = this.posController.getOrder(local_id);
    order_result.then((res) => {
      console.log("getOrder: ", JSON.stringify(res));
      if(res.result == 1){
        
        // Calculate Savings
        res.data.total_savings = res.data.order_item.reduce((total, currentValue, index, arr) => {
          return total + (currentValue.quantity * currentValue.discount_amount );
        }, 0);

        // Calculate Amount W/O Tax
        var total_amount = parseFloat(res.data.total_amount);
        var tax_rate = parseFloat("0.06");
        res.data.tax_amount = total_amount * tax_rate;
        res.data.total_amount_wo_tax = total_amount - res.data.tax_amount;
        
        this.setState({ order: res.data, firstLoad: false });
        
        // Only payment method is cash display change amount pop up dialog.
        if(res.data.change){
          Alert.alert("Change", `RM ${res.data.change.toFixed(2)}`);
        }
      } else {
        Alert.alert("Error", res.data.msg);
      }
      this.handleFetchDataIndicator(false);
    });
  }

  handleGeneratePDF(type){
    this.refs.viewShot.capture().then(async (uri) => {
      try {
        console.log("uri: ", uri);
        this.handleFetchDataIndicator(true, "Generating...");
        const options = {
          imagePaths: [uri.includes("file://") ? uri.split('file://').pop() : uri],
          // imagePaths: [uri],
          name: `${moment().utc(true).unix()}_${this.state.order.receipt_no}`,
          quality: .9, // optional compression paramter
        };
        const pdf = await RNImageToPdf.createPDFbyImages(options);
        this.handleFetchDataIndicator(false);
        console.log("pdf: ", pdf);

        // if(type == "share_to_whatsapp"){
        //   this.handleShareToWhatsApp(pdf);
        // } else {
        //   this.handleSaveAsPDF(pdf);
        // }
        this.handleSaveAsPDF(pdf);

        this.setState({ isSavingPDF: false });
        console.log(pdf.filePath);
      } catch(e) {
        this.setState({ isSavingPDF: false });
        Alert.alert("Error", "Download Failed.");
        console.log(e);
        this.handleFetchDataIndicator(false);
      }
    });
  }

  // handleShareToWhatsApp(pdf){
  //   Share.shareSingle({
  //     title: "E Receipt",
  //     message: "123",
  //     url: pdf.filePath,
  //     type: 'application/pdf',
  //     social: Share.Social.WHATSAPP,
  //     whatsAppNumber: "60164140301",  // country code + phone number
  //     // filename: 'test'
  //   })
  //     .then((res) => { 
  //       console.log(res);
  //       alert("Completed");
        
  //       // Remove file from device's storage
  //       this.handleRemovePDF(pdf.filePath);
  //     })
  //     .catch((err) => { 
  //       err && console.log(err);

  //       // Remove file from device's storage
  //       this.handleRemovePDF(pdf.filePath);
  //     });
  // }

  handleSaveAsPDF(pdf){
    Share.open({
      title: "Receipt",
      url: pdf.filePath,
    })
      .then((res) => { 
        console.log(res);
        Alert.alert("Completed");

        // Remove file from device's storage
        this.handleRemovePDF(pdf.filePath);
      })
      .catch((err) => { 
        err && console.log(err);

        // Remove file from device's storage
        this.handleRemovePDF(pdf.filePath);
      });
  }

  async handleRemovePDF(filePath){
    // Remove file from device's storage
    await RNFetchBlob.fs.unlink(filePath);
  }

  /****************************************************************/
  /******************** SCREEN RENDERING **************************/
  /****************************************************************/

  // Loading Indicator
  handleRenderLoadingIndicator(){
    return(
      <LoadingIndicator 
        visible={this.state.isFetchData}
        size={"large"}
        text={`${this.state.textFetchData}`}
      />
    )
  }

  // Render Landing Screen
  handleRenderLandingScreen(){
    return(
      this.state.isFetchData
      ?
      <View/>
      :
      // Landing Screen
      <View style={{flex: 1}}>
        <ScrollView
          ref={(ref)=>{this.receiptScrollView = ref;}}
        >
          {/* Receipt Container */}
          {this.handleRenderReceiptContainer()}
        </ScrollView>

        {/* Action Buttons */}
        <View style={{
          backgroundColor: "#fff",
          paddingHorizontal: Metrics.smallPadding,
          paddingVertical: Metrics.basePadding,
          borderTopWidth: 1, borderBottomWidth: 1, 
          borderColor: Colors.border,
          marginTop: Metrics.basePadding,
        }}>

          {/* Send WhatsApp Button */}
          {/* <View style={{marginHorizontal: Metrics.baseMargin, marginVertical: Metrics.smallMargin}}>
            <AppsButton 
              onPress={() => {
                var isSavingPDF = this.state.isSavingPDF;
                this.setState({ isSavingPDF: true }, ()=>{
                  if(!isSavingPDF){
                    this.handleGeneratePDF("share_to_whatsapp");
                  }
                });
              }}
              backgroundColor={Colors.primary}
              text={"SHARE TO WHATSAPP"}
              fontSize={20}
              disabled={this.state.btnWADisabled}
            />
          </View> */}

          {/* Upload Sales */}
          {/* <View style={{marginHorizontal: Metrics.baseMargin, marginVertical: Metrics.baseMargin}}>
            <AppsButton 
              onPress={() => {this.handleUploadSales();}}
              backgroundColor={Colors.primary}
              text={"UPLOAD SALES"}
              fontSize={20}
              disabled={this.state.btnWADisabled}
            />
          </View> */}

          {/* Save Receipt Button */}
          <View style={{marginHorizontal: Metrics.baseMargin, marginVertical: Metrics.smallMargin}}>
            <AppsButton 
              onPress={() => {
                var isSavingPDF = this.state.isSavingPDF;
                this.setState({ isSavingPDF: true }, ()=>{
                  if(!isSavingPDF){
                    this.handleGeneratePDF("download_pdf");
                  }
                });
              }}
              backgroundColor={tailwind('bg-btn-primary')}
              text={"DOWNLOAD PDF"}
              fontSize={20}
              disabled={this.state.btnPrintDisabled}
            />
          </View>
          
        </View>
      </View>
    )
  }

  handleRenderHeaderTextItem(data){
    if(data){
      return(
        <Label 
          text={`${data}`}
          style={{fontSize: Fonts.size.input, color: "#000", textAlign: "center", paddingHorizontal: Metrics.basePadding, marginVertical: 1}}
        />
      )
    }
    
  }

  // Label & Data
  handleRenderGeneralInfoItem(label, data=""){
    if(label){
      return(
        <View style={{flexDirection: 'row', marginVertical: 1}}>
          <Label 
            text={`${label}`}
            style={{fontSize: Fonts.size.h6, color: "#000", textAlign: "left", width: 100}}
          />
          <Label 
            text={`:`}
            style={{fontSize: Fonts.size.h6, color: "#000", textAlign: "left", marginHorizontal: Metrics.smallPadding}}
          />
          <Label 
            text={`${data}`}
            style={{fontSize: Fonts.size.h6, color: "#000", textAlign: "left", flex: 1}}
          />
        </View>
      )
    }
  }

  // Label & Data
  handleRenderExtraInfoItem(label, data=""){
    if(label){
      return(
        <View style={{flexDirection: 'row', marginVertical: 1}}>
          <Label 
            text={`${label}`}
            style={{fontSize: Fonts.size.input, color: "#000", textAlign: "left"}}
          />
          <Label 
            text={`:`}
            style={{fontSize: Fonts.size.input, color: "#000", textAlign: "left", marginHorizontal: Metrics.smallPadding}}
          />
          <Label 
            text={`${data}`}
            style={{fontSize: Fonts.size.input, color: "#000", textAlign: "left", flex: 1}}
          />
        </View>
      )
    }
  }

  handleRenderReceiptContainer(){
    return(
      // <ViewShot ref="viewShot" options={{ format: "png", quality: 0.9, result: "base64", snapshotContentContainer: false }}>
      <ViewShot ref="viewShot" options={{width: 576, format: "png", quality: 0.9, result: "tmpfile" }}>
        <View 
          style={{
            backgroundColor: "#fff",
            marginTop: Metrics.smallMargin,
            paddingHorizontal: Metrics.smallPadding,
            paddingVertical: Metrics.basePadding,
            marginHorizontal: Metrics.smallMargin,
            // borderTopWidth: 1, borderBottomWidth: 1, 
            // borderColor: Colors.border
          }}
          onLayout={(event) => { this.setState({receiptLength: event.nativeEvent.layout.height + 200}) }}
        >

          {/* Company Image */}
          {/* <Image
            source={Images.arms_logo_horizontal}
            style={{width: '60%', height: 40, alignSelf: 'center', resizeMode: 'contain', backgroundColor: '#fff'}}
          /> */}

          {/* Receipt Header (FROM SERVER) */}
          <Label 
            text={`${this.state.order.pos_settings.receipt_header}`}
            style={{fontSize: Fonts.size.input, color: "#000", textAlign: "center", paddingHorizontal: Metrics.basePadding, marginVertical: Metrics.smallMargin/2}}
          />

          {/* Company Name */}
          {/* <Label 
            text={`${this.state.companyDetails.name.toUpperCase()}`}
            style={{fontSize: Fonts.size.h6, color: "#000", textAlign: "center", paddingHorizontal: Metrics.basePadding, marginVertical: Metrics.smallMargin/2}}
          /> */}

          {/* Address 1 */}
          {/* {this.handleRenderHeaderTextItem(this.state.companyDetails.address_1)} */}

          {/* Address 2 */}
          {/* {this.handleRenderHeaderTextItem(this.state.companyDetails.address_2)} */}

          {/* Postcode & City */}
          {/* {this.handleRenderHeaderTextItem(`${this.state.companyDetails.postcode} ${this.state.companyDetails.city}`)} */}

          {/* State & Country */}
          {/* {this.handleRenderHeaderTextItem(`${this.state.companyDetails.state} ${this.state.companyDetails.country}.`)} */}

          {/* GST Register No */}
          {this.handleRenderHeaderTextItem(this.state.companyDetails.gst_register_no ? `GST Reg: ${this.state.companyDetails.gst_register_no}` : '')}

          {/* Receipt Title */}
          {this.handleRenderHeaderTextItem(`Tax Invoice`)}

          <View style={{marginVertical: Metrics.baseMargin}} />

          {/* Receipt No */}
          {this.handleRenderGeneralInfoItem("Receipt No", `${this.state.order.receipt_no}`)}
          
          {/* DateTime */}
          {this.handleRenderGeneralInfoItem("Date", moment(this.state.order.created_date).format("DD MMM YYYY"))}
          
          {/* Counter */}
          {/* {this.handleRenderGeneralInfoItem("Counter", this.state.login_info.counter_id ? this.state.login_info.counter_id : '101')} */}
          {this.handleRenderGeneralInfoItem("Counter", this.state.order.counter_id)}

          {/* Cashier */}
          {this.handleRenderGeneralInfoItem("Cashier", this.state.order.cashier_name)}


          <Label 
            text={`-------------------------------------------------------------------------------------------------------`}
            style={{fontSize: Fonts.size.input, color: "#000", textAlign: "left", marginVertical: Metrics.smallMargin/2}}
            ellipsizeMode={"clip"}
            numberOfLines={1}
          />

          {/* Order List */}
          {
            this.state.order.order_item.map((item, index) => {
              var discountText = item.discount_percent ? `(Disc: ${item.discount_percent.toFixed(2)}%)` : '';
              return(
                <View key={`${index}`}>
                  {/* Row 1 */}
                  <View style={{flexDirection: 'row', marginVertical: 1.5}}>
                    <Label 
                      text={`${item.sku_item_code}`}
                      numberOfLines={1}
                      ellipsizeMode={'tail'}
                      style={{fontSize: Fonts.size.input, color: "#000", textAlign: "left", flex: 2, marginHorizontal: Metrics.smallMargin/2}}
                    />

                    <Label 
                      text={`${item.product_name}`}
                      numberOfLines={1}
                      ellipsizeMode={'tail'}
                      style={{fontSize: Fonts.size.input, color: "#000", textAlign: "left", flex: 3, marginHorizontal: Metrics.smallMargin/2}}
                    />

                    <Label 
                      text={`${(item.quantity*item.selling_price).toFixed(2)}`}
                      numberOfLines={1}
                      ellipsizeMode={'tail'}
                      style={{fontSize: Fonts.size.input, color: "#000", textAlign: "right", flex: 1, marginHorizontal: Metrics.smallMargin/2}}
                    />
                  </View>
                  {/* Row 2 */}
                  <View style={{flexDirection: 'row', marginVertical: 1.5}}>
                    <Label 
                      text={`${parseFloat(item.selling_price).toFixed(2)} x ${item.quantity}`}
                      numberOfLines={1}
                      ellipsizeMode={'tail'}
                      style={{fontSize: Fonts.size.input, color: "#000", textAlign: "left", flex: 2, marginHorizontal: Metrics.smallMargin/2}}
                    />

                    <Label 
                      text={`${discountText}`}
                      numberOfLines={1}
                      ellipsizeMode={'tail'}
                      style={{fontSize: Fonts.size.input, color: "#000", textAlign: "left", flex: 3, marginHorizontal: Metrics.smallMargin/2}}
                    />

                    {/* <Label 
                      text={`${(item.quantity*item.selling_price).toFixed(2)}`}
                      style={{fontSize: Fonts.size.input, color: "#000", textAlign: "right", flex: 1, marginHorizontal: Metrics.smallMargin/2}}
                    /> */}
                  </View>
                </View>
              )
            })
          }

          <Label 
            text={`-------------------------------------------------------------------------------------------------------`}
            style={{fontSize: Fonts.size.input, color: "#000", textAlign: "left", marginVertical: Metrics.smallMargin/2}}
            ellipsizeMode={"clip"}
            numberOfLines={1}
          />

          {/* No of Items & Total Incl. GST */}
          <View style={{flexDirection: 'row', marginVertical: 1}}>
            {/* No of Items */}
            {/* <Label 
              text={`No of Items: ${this.state.order.order_item.length}`}
              style={{fontSize: Fonts.size.input, color: "#000", textAlign: "left", flex: 1, marginHorizontal: Metrics.smallMargin/2}}
            /> */}

            {/* Total Incl. GST Label */}
            <Label 
              text={`Total Incl. GST:RM`}
              style={{fontSize: Fonts.size.input, color: "#000", textAlign: "right", flex: 1, marginHorizontal: Metrics.smallMargin/2}}
            />

            {/* Total Incl. GST Data */}
            <Label 
              text={`${this.thousandSeparator(parseFloat(this.state.order.total_amount).toFixed(2))}`}
              style={{fontSize: Fonts.size.input, color: "#000", textAlign: "right", width: 100, marginHorizontal: Metrics.smallMargin/2}}
            />
          </View>

          {/* Payment Method with Amount */}
          {
            this.state.order.payment.map((item, index) => {
              return(
                <View key={`${index}`} style={{flexDirection: 'row', marginVertical: 1}}>
                  <Label 
                    text={`${this.state.payment_method_label[item.payment_type]}:RM`}
                    style={{fontSize: Fonts.size.input, color: "#000", textAlign: "right", flex: 1, marginHorizontal: Metrics.smallMargin/2}}
                  />
                  

                  <Label 
                    text={`${this.thousandSeparator(parseFloat(item.amount).toFixed(2))}`}
                    style={{fontSize: Fonts.size.input, color: "#000", textAlign: "right", width: 100, marginHorizontal: Metrics.smallMargin/2}}
                  />
                </View>
              );
            })
          }

          {/* Change */}
          <View style={{flexDirection: 'row', marginVertical: 1}}>
            <Label 
              text={`Change:RM`}
              style={{fontSize: Fonts.size.input, color: "#000", textAlign: "right", flex: 1, marginHorizontal: Metrics.smallMargin/2}}
            />

            <Label 
              text={`${this.thousandSeparator(parseFloat(this.state.order.change).toFixed(2))}`}
              style={{fontSize: Fonts.size.input, color: "#000", textAlign: "right", width: 100, marginHorizontal: Metrics.smallMargin/2}}
            />
          </View>

          {/* No of Items */}
          {this.handleRenderExtraInfoItem("No of Items", `${this.state.order.order_item.length}`)}

          {/* Extra Info */}
          {this.handleRenderExtraInfoItem("Savings", `RM ${this.thousandSeparator(parseFloat(this.state.order.total_savings).toFixed(2))}`)}

          <View style={{marginVertical: Metrics.baseMargin}} />

          {/* GST Section */}
          <View>
            <Label 
              text={`*****************  GST Summary  ******************`}
              style={{fontSize: Fonts.size.input, color: "#000", textAlign: "left", marginVertical: 1}}
              ellipsizeMode={"clip"}
              numberOfLines={1}
            />

            {/* GST Header */}
            <View style={{flexDirection: 'row'}}>
              <Label 
                text={`GST Code`}
                style={{fontSize: Fonts.size.input, color: "#000", textAlign: "left", flex: 1, marginHorizontal: Metrics.smallMargin/2}}
              />
              <Label 
                text={`Amount(RM)`}
                style={{fontSize: Fonts.size.input, color: "#000", textAlign: "right", width: 130, marginHorizontal: Metrics.smallMargin/2}}
              />
              <Label 
                text={`Tax(RM)`}
                style={{fontSize: Fonts.size.input, color: "#000", textAlign: "right", width: 130, marginHorizontal: Metrics.smallMargin/2}}
              />
            </View>

            {/* GST Data */}
            <View style={{flexDirection: 'row'}}>
              <Label 
                text={`S @6%`}
                style={{fontSize: Fonts.size.input, color: "#000", textAlign: "left", flex: 1, marginHorizontal: Metrics.smallMargin/2}}
              />
              <Label 
                text={`${this.thousandSeparator(parseFloat(this.state.order.total_amount_wo_tax).toFixed(2))}`}
                style={{fontSize: Fonts.size.input, color: "#000", textAlign: "right", width: 130, marginHorizontal: Metrics.smallMargin/2}}
              />
              <Label 
                text={`${this.thousandSeparator(parseFloat(this.state.order.tax_amount).toFixed(2))}`}
                style={{fontSize: Fonts.size.input, color: "#000", textAlign: "right", width: 130, marginHorizontal: Metrics.smallMargin/2}}
              />
            </View>

            <Label 
              text={`****************************************************************`}
              style={{fontSize: Fonts.size.input, color: "#000", textAlign: "left", marginVertical: 1}}
              ellipsizeMode={"clip"}
              numberOfLines={1}
            />
          </View>

          {/* Footer */}
          <Label 
            text={`Printed on ${moment().format("DD MMM YYYY HH:mm:ss")}`}
            style={{fontSize: Fonts.size.input, color: "#000", textAlign: "center", marginVertical: 1, marginTop: Metrics.baseMargin}}
          />
          <Label 
            text={`${this.state.order.pos_settings.receipt_footer}`}
            style={{fontSize: Fonts.size.input, color: "#000", textAlign: "center", marginVertical: 1, marginTop: Metrics.baseMargin}}
          />
          {/* <Label 
            text={`THANK YOU FOR YOUR PATRONAGE.`}
            style={{fontSize: Fonts.size.input, color: "#000", textAlign: "center", marginVertical: 1, marginTop: Metrics.baseMargin}}
          /> */}
          {/* <Label 
            text={`GOODS SOLD ARE NOT`}
            style={{fontSize: Fonts.size.input, color: "#000", textAlign: "center", marginVertical: 1}}
          /> */}
          {/* <Label 
            text={`RETURNABLE & REFUNDABLE`}
            style={{fontSize: Fonts.size.input, color: "#000", textAlign: "center", marginVertical: 1}}
          /> */}

        </View>
      </ViewShot>
    )
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
            // Landing Screen
            this.handleRenderLandingScreen()
        }

        {/* Loading Animation */}
        {this.handleRenderLoadingIndicator()}

      </SafeAreaView>
    )
  }
}