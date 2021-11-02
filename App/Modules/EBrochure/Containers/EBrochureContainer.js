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
  SafeAreaView, ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';

/** PROJECT FILES **/
import {
  Colors, Fonts, Images, Metrics, ApplicationStyles,
  LoadingIndicator, Label, SpringAnimation, HorizontalScrollAnimation,
} from '../../../Services/LibLinking';
import styles from '../Styles/notice_board_styles';
import NoticeBoardController from '../Actions/notice_board_controller';

/** NPM LIBRARIES **/
import { WebView } from 'react-native-webview';
import ImageViewer from 'react-native-image-zoom-viewer';
import Video from 'react-native-video';
import { NavigationActions, DrawerActions } from 'react-navigation';
import { tailwind } from '../../../../tailwind';

export default class NoticeBoardView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      screenWidth: Dimensions.get('window').width,
      screenHeight: Dimensions.get('window').height,

      // Fetch data from server indicator
      fetch_data: false,
      firstLoad: true,

      // Image Viewer 
      imageViewerVisible: false,
      images_datalist: [],
      images_index: 0,

      // Video Viewer
      videoLoading: false,

      // flatList
      datalist: [
        // {
        //   key: '1',
        //   url: '',
        //   props: {
        //     url: '',
        //     source: require("../../../Assets/EBrochure/e_brochure_sales_live.jpg")
        //   }
        // },
      ],
      flatListRentalTrigger: false,

    }

    // Create controller object
    this.noticeBoardController = new NoticeBoardController();
  }

  /****************************************************************/
  /************************ HEADER ********************************/
  /****************************************************************/

  // Navigation Tab
  static navigationOptions = ({ navigation, navigationOptions }) => {
    const params = navigation.state.params || {};
    var navigateToScreen = params.this;

    return {
      title: 'Notice Board',
      headerLeft: (
        <TouchableOpacity style={tailwind("bg-white rounded-lg opacity-100 p-2 ml-3 mt-3")}
          onPress={() => navigateToScreen(navigation, { loginUpdate: true })}>
          <Image
            style={{ width: Metrics.icons.medium, height: Metrics.icons.medium, tintColor: "black" }}
            source={Images.menu} />
        </TouchableOpacity>
      ),
      headerRight: (
        <View style={{ width: Metrics.icons.medium, height: Metrics.icons.medium, paddingRight: 10 }}></View>
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

  /****************************************************************/
  /*********************** COMPONENT  *****************************/
  /****************************************************************/

  componentDidMount() {
    this.props.navigation.setParams({ this: this.navigateToScreen });
  }

  componentWillUnmount() {
  }

  componentDidUpdate(prevProps) {
    /**
     * Login Update
     * - This screen is special case, 
     * login update is use to refresh notice board data instead of update user login.
     */
    var loginUpdate = this.props.navigation.getParam('loginUpdate', false);
    if (loginUpdate && this.props.navigation != prevProps.navigation) {
      this.props.navigation.setParams({ loginUpdate: false });
      this.handleGetNoticeBoardData();
    }
  }

  handleFetchDataIndicator(status) {
    this.setState({
      fetch_data: status
    })
  }

  /****************************************************************/
  /******************** FUNCTIONALITY *****************************/
  /****************************************************************/

  handleGetNoticeBoardData() {
    this.handleFetchDataIndicator(true);
    var nb_result = this.noticeBoardController.handleGetNoticeBoardData();
    nb_result.then((res) => {
      if (res.result == 1) {
        if (res.data) {
          /**
           * Assign the data to datalist
           */
          var nb_list = res.data;
          // Create Image Viewer List
          var images_datalist = [];
          for (let i = 0; i < nb_list.length; i++) {
            if (nb_list[i].item_type == "image") {
              images_datalist.push({
                url: nb_list[i].url,
                nb_server_id: nb_list[i].nb_server_id,
                image_click_link: nb_list[i].image_click_link,
              })
            }
          }
          this.setState({
            firstLoad: false,
            images_datalist,
            datalist: nb_list,
            flatListRentalTrigger: !this.state.flatListRentalTrigger,
          })
        }
      } else {
        Alert.alert("Error", "Sorry that currently we are not able to communicate with server.")
      }
      this.handleFetchDataIndicator(false);
    });
  }

  handleImageViewerOnOff(status, nb_server_id) {
    var index = this.state.images_datalist.findIndex(data => data.nb_server_id == nb_server_id);
    this.setState({
      imageViewerVisible: status,
      images_index: index != -1 ? index : 0
    })
  }

  handleImageViewerOnClick(index) {
    var images_datalist = this.state.images_datalist;
    var url = images_datalist[index].image_click_link;
    if (url && url != "undefined") {
      url = (url.substring(0, 8) == "https://" || url.substring(0, 7) == "http://") ? url : `http://${url}`;
      Linking.openURL(url);
    } else {
      // alert("Image No Related Link.");
      Alert.alert("Click link error", "Image No Related Link.");
    }
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
        text={"Fetching data..."}
      />
    )
  }

  // Render Notice Board List
  handleRenderNoticeBoardList() {
    return (
      this.state.fetch_data
        ?
        <View />
        :
        <View style={tailwind("flex-1 mt-16")}>
          {
            (this.state.datalist.length > 0)
              ?
              <HorizontalScrollAnimation
                data={this.state.datalist}
                renderItem={this.handleFlatListRenderItem}
                extraData={this.state.flatListRentalTrigger}
                cardCustomStyle={{
                  padding: Metrics.basePadding,
                }}
              />
              :
              this.handleRenderEmptyDataScreen()
          }
        </View>
    )
  }

  // Render Notice Board Item
  handleFlatListRenderItem = (item, index) => {
    return (
      // FlatList Item Container - Image OR Video
      (item.item_type == "image")
        ?
        // Picture Container
        this.handleNoticeBoardItemPictureContainer(item)
        :
        // Video Container - Youtube Format OR Non Youtube Format
        this.handleNoticeBoardItemVideoContainer(item)
    )
  }

  // Empty list screen
  handleRenderEmptyDataScreen() {
    return (
      <View style={[ApplicationStyles.screen.mainContainer, { justifyContent: 'center', flex: 0, height: '100%', paddingBottom: 150 }]}>
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
        <Label style={{ color: Colors.primary }}>Oops! No noticement available yet.</Label>
      </View>
    )
  }

  // Render Notice Board Item Picture Container
  handleNoticeBoardItemPictureContainer(item) {
    return (
      <TouchableOpacity
        onPress={() => { this.handleImageViewerOnOff(true, item.nb_server_id); }}
        style={[styles.FlatListItemContainer, { height: Dimensions.get("window").height * 0.4, justifyContent: 'center'}]}
      >
        {/* Picture Container */}
        {/* <View style={{justifyContent: 'center'}}> */}
        <Image
          {...item.props}
          // source={item.props.source} 
          // source={item.url}
          // resizeMode= 'contain'
          style={{
            width: '100%',
            height: Dimensions.get("window").height * 0.6,
            alignSelf: 'center',
            resizeMode: 'contain',
            // borderTopLeftRadius: Metrics.containerRadius, 
            // borderTopRightRadius: Metrics.containerRadius,
            // borderColor: Colors.borderLight,
            // borderWidth: 1,
          }}
        />
        {/* </View> */}

      </TouchableOpacity>
    )
  }

  // Render Notice Board Item Video Container
  handleNoticeBoardItemVideoContainer(item) {
    return (
      item.video_site == "youtube"
        ?
        // Youtube Video Format
        <View style={[styles.FlatListItemContainer, { height: Dimensions.get("window").height * 0.4 }]}>
          <WebView
            source={{ uri: `https://www.youtube.com/embed/${item.video_link}` }}
            originWhitelist={['*']}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            allowsFullscreenVideo={true}
            onLoadProgress={({ nativeEvent }) => {
              // this.loadingProgress = nativeEvent.progress;
              this.setState({
                videoLoading: nativeEvent.progress == 1 ? false : true
              })
            }}
          />

          {/* Video Loading Indicator */}
          <LoadingIndicator
            visible={this.state.videoLoading}
            size={"large"}
            text={"Loading video..."}
          />
        </View>
        :
        // Non Youtube Video Format
        <View style={[styles.FlatListItemContainer, { height: Dimensions.get("window").height * 0.6 }]}>
          <Video
            {...item.props}
            source={{ uri: item.item_url }}   // Can be a URL or a local file.
            // ref={(ref) => {
            //   this.player = ref
            // }}                                      // Store reference
            // onBuffer={this.onBuffer}                // Callback when remote video is buffering
            // onError={this.videoError}               // Callback when video cannot be loaded
            controls={true}
            paused={true}
            playInBackground={false}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
            }}
          />
        </View>
    )
  }

  // Render Image Viewer
  handleRenderImageViewer() {
    return (
      <Modal visible={this.state.imageViewerVisible} transparent={true}>
        <View style={{ width: '100%', alignItems: 'flex-end', backgroundColor: '#000000', paddingHorizontal: Metrics.basePadding, paddingTop: 30 }}>
          <TouchableOpacity onPress={() => { this.handleImageViewerOnOff(false, 0); }}>
            <Image
              source={Images.round_cancel}
              style={{ width: Metrics.icons.medium, height: Metrics.icons.medium, tintColor: '#ffffff' }}
            />
          </TouchableOpacity>
        </View>
        <ImageViewer
          imageUrls={this.state.images_datalist}
          saveToLocalByLongPress={false}
          // onSave={()=>{
          //   var armsDownloader = new ARMSDownloader();
          //   var test = armsDownloader.handlePhotoSaveToCamera(Images.face);
          //   test.then((res)=>{
          //     // alert(JSON.stringify(res))
          //   })
          // }}
          index={this.state.images_index}
          enableSwipeDown={true}
          onCancel={() => { this.handleImageViewerOnOff(false, 0); }}
          onClick={(close, currentShowIndex) => { this.handleImageViewerOnClick(currentShowIndex); }}
        />
      </Modal>
    )
  }

  render() {
    return (
      /**Start Safe Area**/
      <SafeAreaView style={ApplicationStyles.screen.safeAreaContainer} forceInset={{ vertical: 'never' }} >
        <View style={tailwind("flex-1 bg-gray-200")}>
            {/* Screen on loading, hide default state data */}
            {
              this.state.firstLoad
                ?
                <View />
                :
                // Notice Board List
                this.handleRenderNoticeBoardList()
            }

            {/* Image Viewer */}
            {this.handleRenderImageViewer()}

            {/* Loading Animation */}
            {this.handleRenderLoadingIndicator()}
        </View>
      </SafeAreaView>
    )
  }
}