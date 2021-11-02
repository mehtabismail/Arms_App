import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {
  Image,
  Text,
  View,
  ScrollView,
  StyleSheet,
  Animated,
  PanResponder,
  TouchableHighlight,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import RNFetchBlob from 'rn-fetch-blob';
import AppConfig from '../Config/AppConfig';
import NetInfo from "@react-native-community/netinfo";
import ServerCommunicator from '../Services/server_communicator';
import moment from 'moment';

const { api_url } = AppConfig;
// const reactNativePackage = require('react-native/package.json');
// const splitVersion = reactNativePackage.version.split('.');
// const majorVersion = +splitVersion[0];
// const minorVersion = +splitVersion[1];

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#222',
  },
  layoutIndicator: {
    height: 15,
    position: 'absolute',
    bottom: 5,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: 'transparent',
  },
  indicator: {
    margin: 3,
    opacity: 0.9
  },
  indicatorSelected: {
    opacity: 1,
  },
  containerImage : {
    flex: 1,
    width: Dimensions.get('window').width,
  },
  overlay: {
    opacity: 0.5,
    backgroundColor: 'black',
  },
  layoutText: {
    position: 'absolute',
    paddingHorizontal: 15,
    bottom: 30,
    left: 0,
    right: 0,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    flexDirection: 'column',
    backgroundColor: 'transparent',
  },
  textTitle: {
    fontWeight: 'bold',
    fontSize: 15, 
    color: 'white',
  },
  textCaption: {
    fontWeight: '400',
    fontSize: 12, 
    color: 'white',
  }
});

export default class AdsBanner extends Component {
  constructor(props) {
    super(props);

    this.state = {
      position: 0,
      height: Dimensions.get('window').width * (4 / 9),
      width: Dimensions.get('window').width,
      scrolling: false,
      dataSource: [],
      imgInterval: null,
    };
  }

  _onRef(ref) {
    this._ref = ref;
    if (ref && this.state.position !== this._getPosition()) {
      this._move(this._getPosition());
    }
  }

  _move(index) {
    // To prevent TypeError: Cannot read property 'scrollTo' of null.
    if(this._ref){
      const isUpdating = index !== this._getPosition();
      const x = this.state.width * index;
      this._ref.scrollTo({x, y: 0, animated: true});
      this.setState({position: index});
      if (isUpdating && this.props.onPositionChanged) {
        this.props.onPositionChanged(index);
      }
    }
  }

  _getPosition() {
    if (typeof this.props.position === 'number') {
      return this.props.position;
    }
    return this.state.position;
  }

  _next() {
    // const pos = this.state.position === this.props.dataSource.length-1 ? 0 : this.state.position + 1;
    const pos = this.state.position === this.state.dataSource.length-1 ? 0 : this.state.position + 1;
    this._move(pos);
    this.setState({position: pos});
  }

  _prev() {
    // const pos = this.state.position === 0 ? this.props.dataSource.length-1 : this.state.position - 1;
    const pos = this.state.position === 0 ? this.state.dataSource.length-1 : this.state.position - 1;
    this._move(pos);
    this.setState({position: pos});
  }

  async _getDataSouceFromFolderPath(path){
    var network = await this.networkConnectValidation();
    if(network.result == 1){
      var serverCommunicator = new ServerCommunicator();
      var formData = new FormData();
      formData.append('a','get_member_ads_banner_list');
      
      var data = [];
      var banner_data = await serverCommunicator.PostData(formData);
      if(banner_data.result == 1){
        var banner_list = banner_data.banner_list;
        var banner_index = banner_list.findIndex((data) => data.banner_name == this.props.screenId);
        if(banner_index != -1){
          // Check banner_info data = false || {data}
          var banner_info = banner_list[banner_index].banner_info;
          if(banner_info){
            Object.keys(banner_info.banner_list).map((value, index) => {
              data.push({ 
                url: `${api_url}/${banner_info.banner_list[value].path}?t=${moment()}`,
                link: `${banner_info.banner_list[value].link}`
              })
            });
            this.setState({
              dataSource: data,
              // imgInterval only run when data is more than 1
              imgInterval: data.length > 1 ? setInterval(() => {
                this.setState({
                  position: this.state.position === data.length-1 ? 0 : this.state.position + 1
                },()=>{
                  this._move(this.state.position);
                });
              }, 5000) : null
            });
          }
        }
      }
      this.props.getDataSource?this.props.getDataSource(data):'';
    } else {
      RNFetchBlob.fs.ls(path)
      // files will an array contains filenames
      .then((files) => {
          console.log(files);
          var data = [];
          if(files.length > 0){
            // Assign folder's files to data source
            for (let i = 0; i < files.length; i++) {
              // Ignore the file ".DS_Store", to prevent the slideshow show empty / black picture.
              if(files[i] != ".DS_Store"){
                data.push({url: `${AppConfig.folder_path_prefix}${path}/${files[i]}`});
              }
            }
            this.setState({
              dataSource: data,
              // imgInterval only run when data is more than 1
              imgInterval: data.length > 1 ? setInterval(() => {
                this.setState({
                  position: this.state.position === data.length + 1 ? 0 : this.state.position + 1
                },()=>{
                  this._move(this.state.position);
                });
              }, 5000) : null
            });
          }
          this.props.getDataSource?this.props.getDataSource(data):'';
      })
    }
    
  }

  /**
   * Network Checking
   */
  networkConnectValidation(){
    let result = new Promise((resolve, reject) => {
      NetInfo.isConnected.fetch().done((isConnected) => { 
        if(isConnected) {
          resolve({result: 1});
        } else {
          resolve({result: 0});
        }
      });
    })
    return result;
  }

  componentDidUpdate(prevProps) {
    if (prevProps.position !== this.props.position) {
      this._move(this.props.position);
    }

    // Get latest ads banner
    if (prevProps.onRefresh !== this.props.onRefresh) {
      if(this.props.onRefresh){
        // Clear imgInterval if there is not null
        if(this.state.imgInterval){
          clearInterval(this.state.imgInterval);
        }

        this.setState({
          dataSource: [],
          imgInterval: null,
        }, () => {
          // Get datasource from folder path
          if(this.props.dataFolderPath){
            this._getDataSouceFromFolderPath(this.props.dataFolderPath);
          } else {
            this.setState({dataSource: this.props.dataSource});
          }
        })
      }
    }
  }

  componentDidMount() {
    const width = this.state.width;

    // Get datasource from folder path
    if(this.props.dataFolderPath){
      this._getDataSouceFromFolderPath(this.props.dataFolderPath);
    } else {
      this.setState({dataSource: this.props.dataSource});
    }

    let release = (e, gestureState) => {
      const width = this.state.width;
      const relativeDistance = gestureState.dx / width;
      const vx = gestureState.vx;
      let change = 0;

      if (relativeDistance < -0.5 || (relativeDistance < 0 && vx <= 0.5)) {
        change = 1;
      } else if (relativeDistance > 0.5 || (relativeDistance > 0 && vx >= 0.5)) {
        change = -1;
      }
      const position = this._getPosition();
      if (position === 0 && change === -1) {
        change = 0;
      } else if (position + change >= this.state.dataSource.length) {
        change = (this.state.dataSource.length) - (position + change);
      }
      this._move(position + change);
      return true;
    };

    this._panResponder = PanResponder.create({
      onPanResponderRelease: release
    });

    this._interval = setInterval(() => {
      const newWidth = Dimensions.get('window').width;
      if (newWidth !== this.state.width) {
        this.setState({width: newWidth});
      }
    }, 16);
  }

  componentWillUnmount() {
    clearInterval(this._interval);
    
    // Clear imgInterval if there is not null
    if(this.state.imgInterval){
      clearInterval(this.state.imgInterval);
    }
  }

  onScrollEvent = (e) => {
    // Change the indicator on android when swiping
    let contentOffset = e.nativeEvent.contentOffset;
    let viewSize = e.nativeEvent.layoutMeasurement;
    let pageNum = Math.floor(contentOffset.x / viewSize.width);
    this.setState({position: pageNum});
  }

  render() {
    const width = this.state.width;
    const height = this.props.height || this.state.height;
    const position = this._getPosition();
    const imgResizeMode = this.props.imgResizeMode ? {resizeMode: this.props.imgResizeMode} : '';
    let opac = new Animated.Value(position);
    return (
      <View>
        {
          (this.state.dataSource.length>0)
          ?
          <View style={[
            this.props.containerStyle,
            { height: height }
          ]}>
          
            {/* SECTION IMAGE */}
            <ScrollView
              ref={ref => this._onRef(ref)}
              decelerationRate={0.99}
              horizontal={true}
              pagingEnabled={true}
              showsHorizontalScrollIndicator={false}
              scrollEnabled={this.props.scrollEnabled}
              onScrollEndDrag={this.onScrollEvent}
              onMomentumScrollEnd={this.onScrollEvent}
              scrollEventThrottle={16}
              
              {...this._panResponder.panHandlers}
              style={[
                styles.container, 
                { height: height}
              ]}>
              {this.state.dataSource.map((image, index) => {
                const imageObject = typeof image.url === 'string' ? {uri: image.url} : image.url;
                const textComponent = (
                  <View style={styles.layoutText}>
                    {image.title === undefined ? null : <Text style={styles.textTitle}>{image.title}</Text>}
                    {image.caption === undefined ? null : <Text style={styles.textCaption}>{image.caption}</Text>}
                  </View>
                );
                const imageComponent = (
                  <View key={index}>
                    <Image
                      key={imageObject}
                      source={imageObject}
                      style={[{height, width}, imgResizeMode]}/>
                    {textComponent}
                  </View>
                );
                const imageComponentWithOverlay = (
                  <View key={index} style={styles.containerImage}>
                    <View style={styles.overlay}>
                      <Image
                        key={imageObject}
                        source={imageObject}
                        style={[{height, width}, imgResizeMode]}/>
                    </View>
                    {textComponent}
                  </View>
                );
                if (this.props.onPress) {
                  return (
                    <TouchableOpacity
                      key={index}
                      style={{height, width}}
                      onPress={() => this.props.onPress({image, index})}
                      delayPressIn={200}>
                      {this.props.overlay ? imageComponentWithOverlay : imageComponent}
                    </TouchableOpacity>
                  );
                } else {
                  return this.props.overlay ? imageComponentWithOverlay : imageComponent 
                }
              })}
            </ScrollView>
            {/* END SECTION IMAGE */}
            
            {/* SECTION INDICATOR */}
            <View style={[
                styles.layoutIndicator, 
              ]}>
              {this.state.dataSource.map((image, index) => {  
                let opacity = opac.interpolate({
                  inputRange: [index - 1, index, index + 1], // each dot will need to have an opacity of 1 when position is equal to their index (i)
                  outputRange: [0.3, 1, 0.3], // when position is not i, the opacity of the dot will animate to 0.3
                  extrapolate: 'clamp' // this will prevent the opacity of the dots from going outside of the outputRange (i.e. opacity will not be less than 0.3)
                });
                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() => { return this._move(index); }}>
                    <Animated.View
                      key={index}
                      style={[
                        setIndicatorSize(this.props.indicatorSize), 
                        setIndicatorColor(this.props.indicatorColor), 
                        { opacity, margin: 4}
                      ]}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
            {/* END SECTION INDICATOR */}
            
            {/* SECTION ARROW LEFT */}
            <View 
              style={[
                layoutArrow(this.props.height, this.props.arrowSize), 
                { left: 10 },
              ]}>
              <TouchableOpacity
                onPress={() => this._prev()}>
                {
                  this.props.arrowRight == undefined ? 
                  <View 
                    style={[
                      iconArrow(this.props.arrowSize), 
                      iconArrowLeft(this.props.arrowSize),
                    ]}/>
                  : 
                  this.props.arrowLeft
                }
              </TouchableOpacity>
            </View>
            {/* END SECTION ARROW LEFT */}
            
            {/* SECTION ARROW RIGHT */}
            <View 
              style={[
                layoutArrow(this.props.height, this.props.arrowSize), 
                { right: 10 },
              ]}>
              <TouchableOpacity
                onPress={() => this._next()}>
                {
                  this.props.arrowRight == undefined ? 
                  <View 
                    style={[
                      iconArrow(this.props.arrowSize), 
                      iconArrowRight(this.props.arrowSize),
                    ]}/>
                  : 
                  this.props.arrowRight
                }
              </TouchableOpacity>
            </View>
            {/* END SECTION ARROW RIGHT */}
          
          </View>
          :
          <View/>
        }
      </View>
    );
  }
}

AdsBanner.defaultProps = {
  height: 200,
  indicatorSize: 8,
  indicatorColor: '#CCCCCC',
  indicatorSelectedColor: '#FFFFFF',
  scrollEnabled: true,
  arrowSize: 16,
}

AdsBanner.propTypes = {
	dataSource: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.string,
    caption: PropTypes.string,
    url: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  // })).isRequired,
  })), 
  dataFolderPath: PropTypes.string,
  screenId: PropTypes.string,
	indicatorSize: PropTypes.number,
	indicatorColor: PropTypes.string,
	indicatorSelectedColor: PropTypes.string,
	height: PropTypes.number,
	position: PropTypes.number,
  scrollEnabled: PropTypes.bool,
  containerStyle: PropTypes.object,
  overlay: PropTypes.bool,
	arrowSize: PropTypes.number,
  arrowLeft: PropTypes.object,
  arrowRight: PropTypes.object,
	onPress: PropTypes.func,
  onPositionChanged: PropTypes.func,
  imgResizeMode: PropTypes.string,
  getDataSource: PropTypes.func,
  onRefresh: PropTypes.bool,
};

const setIndicatorSize = function (size) {
  return {
    width: size,
    height: size,
    borderRadius: size / 2,
  };
}

const setIndicatorColor = function (color) {
  return {
    backgroundColor: color,
  };
}

const layoutArrow = function (imageHeight, iconHeight) {
  return {
    position: 'absolute',
    backgroundColor: 'transparent',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    top: (imageHeight-iconHeight)/2,
    bottom: (imageHeight-iconHeight)/2,
  };
}

const iconArrow = function (iconHeight) {
  return {
    width: 0,
    height: 0,
    margin: 5,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderTopWidth: iconHeight/2,
    borderBottomWidth: iconHeight/2,
  };
}

const iconArrowRight = function (iconHeight) {
  return {
    borderRightWidth: 0,
    borderLeftWidth: iconHeight*75/100,
    borderRightColor: 'transparent',
    borderLeftColor: 'white',
  };
}

const iconArrowLeft = function (iconHeight) {
  return {
    borderRightWidth: iconHeight*75/100,
    borderLeftWidth: 0,
    borderRightColor: 'white',
    borderLeftColor: 'transparent',
  };
}
