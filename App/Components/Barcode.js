import React, {Component} from 'react';
import {Metrics, Images} from '../Themes';
import BarcodeContainer from './Styles/BarcodeStyles';
import {PropTypes} from 'prop-types';
import Barcode from 'react-native-barcode-builder';
import {
  Text,
  View,  
  Image,
  Modal,
  TouchableOpacity,
} from 'react-native';

export default class BarcodeModal extends React.Component {
  static propTypes = {
    isVisible: PropTypes.bool,
    onClose: PropTypes.func,
    barcode: PropTypes.string,
    isBarcodeTextVisible: PropTypes.bool,
  };

  render() {
    return (
      <View>
        <Modal
          visible = {this.props.isVisible}
          transparent = {true}
          animationType = 'slide'
          presentationStyle = 'overFullScreen'
        >
          {/* Modal Container */}
          <View 
            style={BarcodeContainer.modalContainer}>
            
            {/* Modal View Container */}
            <View style={[BarcodeContainer.modalViewContainer]}>
              
              {/* Close Modal Button */}
              <View style={{justifyContent: 'space-between', flexDirection: 'row'}}>
                <View></View>
                <View style={{justifyContent: 'flex-end'}}>
                  <TouchableOpacity onPress={() => {this.props.onClose(false);}}>
                    <Image 
                      source={Images.round_cancel}
                      style={{width: Metrics.icons.medium, height: Metrics.icons.medium}}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Barcode Container */}
              <View style={{justifyContent: 'center', alignItems: 'center', marginTop: Metrics.baseMargin}}>
                <Barcode 
                  value={this.props.barcode} 
                  format="CODE128" 
                  text={(this.props.isBarcodeTextVisible)?(this.props.barcode):""}
                  width={1.5} 
                  background={'transparent'}
                />
              </View>

              {/* Text Container */}
              <View style={{alignItems: 'center', justifyContent: 'flex-end', marginTop: Metrics.doubleBaseMargin}}>
                <Text>Scan Your Code Here</Text>
              </View>

            </View>

          </View>
        </Modal>
      </View>
    );
  }
}
