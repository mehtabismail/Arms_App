/** REACT NATIVE **/
import React from 'react';
import {
  Image,
  Modal,
  Text, TouchableOpacity,
  View,
} from 'react-native';
import { PropTypes } from 'prop-types';

/** PROJECT FILES **/
import { 
  Colors, Fonts, Images, Metrics, ApplicationStyles,
  AppsButton, Divider,
} from '../../../../Services/LibLinking';
import VoucherContainer from '../Styles/VoucherStyles';

/** NPM LIBRARIES **/
import Barcode from 'react-native-barcode-builder';

export default class VoucherBarcodeModalView extends React.Component {
  // constructor(){
  //   super();
  //   this.state = {
  //     onSecondary: false,
  //   }
  // }
  
  static propTypes = {
    isVisible: PropTypes.bool,
    onClose: PropTypes.func,
    terms: PropTypes.string,
    barcode: PropTypes.string,
  };

  state = {
    onSecondary: false,
  }

  handleSecondModalVisibleOnChange(status){
    this.setState({
      onSecondary: status
    }, () => {
      if(!status){
        this.props.onClose(status);
      }
      
    })
  }

  render() {
    return (
      <View>
        
        {/* Primary Modal */}
        <Modal
          visible = {this.props.isVisible}
          transparent = {true}
          // onBackDropPress = {onBackDropPress}
          animationType = 'slide'
          presentationStyle = 'overFullScreen'
        >
            {/* Secondary Modal */}
            <Modal
              visible = {this.state.onSecondary}
              transparent = {true}
              // onBackDropPress = {onBackDropPress}
              animationType = 'slide'
              presentationStyle = 'overFullScreen'
            >
              {/* Modal Container */}
              <View 
                style={VoucherContainer.modalContainer}>
                
                {/* Modal View Container */}
                <View style={VoucherContainer.modalViewContainer}>

                  {/* Close Modal Button */}
                  <View style={{justifyContent: 'space-between', flexDirection: 'row'}}>
                    <View></View>
                    <View style={{justifyContent: 'flex-end'}}>
                      <TouchableOpacity onPress={() => {this.handleSecondModalVisibleOnChange(false);}}>
                        <Image 
                          source={Images.round_cancel}
                          style={{width: Metrics.icons.medium, height: Metrics.icons.medium}}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Barcode Container */}
                  <View style={{justifyContent: 'center', alignItems: 'center'}}>
                    <Barcode 
                      value={this.props.barcode} 
                      format="CODE128" 
                      text={this.props.barcode}
                      width={2} 
                    />
                  </View>

                  {/* Text Container */}
                  <View style={{alignItems: 'center', justifyContent: 'flex-end', marginTop: Metrics.doubleBaseMargin}}>
                    <Text>Scan Your Code Here</Text>
                  </View>

                </View>

              </View>
            </Modal>

          {/* ...Primary Modal */}

          {/* Modal Container */}
          <View style={VoucherContainer.modalContainer}>

              {/* Close Modal Button */}
              <View style={{justifyContent: 'space-between', flexDirection: 'row'}}>
                <View style={{justifyContent: 'flex-start'}}>
                  <TouchableOpacity 
                    onPress={() => {this.props.onClose(false);}}>
                      <Image 
                        source={Images.round_cancel}
                        style={{width: Metrics.icons.regular, height: Metrics.icons.regular, tintColor: Colors.white}}
                      />
                  </TouchableOpacity>
                </View>
                <View></View>
              </View>

              {/* Modal View Container */}
              <View style={VoucherContainer.modalViewContainer}>
                {/* Header Text */}
                <View style={VoucherContainer.headerContainer}>
                  <Text style={{fontSize: Fonts.size.medium, color: Colors.text_color_1, }}>COLLECT NOW, SHOP NOW</Text>
                  <Text style={{fontSize: Fonts.size.small, color: Colors.text_color_1, }}>FOR THE BETTER PRICE !!!</Text>
                </View>

                {/* Border Line */}
                <View style={{width: '95%', alignSelf: 'center'}}> 
                  <Divider lineColor={'#D3D3D3'}/>
                </View>

                {/* Term and Condition Container */}
                <View style={{backgroundColor: Colors.body}}>
                  
                  {/* Term and Condition Header Container */}
                  <View 
                    style={{
                      justifyContent: 'center', 
                      alignItems: 'flex-start', 
                      padding: Metrics.basePadding,
                    }}>
                    <Text style={Fonts.style.h5}>Term and Condition : </Text>
                  </View>
                  
                  {/* Term and Condition List Container */}
                  <View 
                    style={{
                      justifyContent: 'center', 
                      padding: Metrics.basePadding, 
                      paddingTop: 0,
                      marginBottom: Metrics.baseMargin,
                    }}>
                    <Text>{this.props.terms}</Text>
                  </View>
                  
                  {/* Redeem Button Container */}
                  <AppsButton 
                    onPress={() => {this.handleSecondModalVisibleOnChange(true)}}
                    backgroundColor={Colors.primary}
                    text={"REDEEM"}
                    fontSize={20}
                  />
                </View>

              </View>
          
          </View>
        </Modal>
      </View>
    );
  }
}
