import React, { Component } from "react";
import PropTypes from "prop-types";
import { View } from "react-native";
import { Label, Colors, Metrics, Fonts } from "../Services/LibLinking";

export default class DiscountLabel extends Component {
  static propTypes = {
    data: PropTypes.string,
  };

  render() {
    return (
      <View style={{position: 'absolute', top: 0, right: 0, marginRight: Metrics.smallPadding}}>
        <View 
          style={{
            backgroundColor: Colors.discount_con_background, 
            paddingVertical: Metrics.basePadding - 5, 
            paddingHorizontal: Metrics.smallPadding,
          }}>
          <Label 
            style={{
              color : Colors.discount_con_label, 
              fontWeight: 'bold', 
              fontSize: Fonts.size.input,
              textAlign: 'center'
            }} 
            text={`${this.props.data}`}
          />
        </View>
    
        {/* Bottom Flag Effect */}
        <View style={{
          borderBottomWidth: 40,
          borderBottomColor: 'transparent',
          borderLeftWidth: 40,
          borderLeftColor: Colors.discount_con_background,
          borderRightWidth: 40,
          borderRightColor: Colors.discount_con_background,
        }}/>
      </View>
    );
  }
}
