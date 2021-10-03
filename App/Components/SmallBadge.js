import React, { Component } from "react";
import PropTypes from "prop-types";
import { View } from "react-native";
import { Label, Colors, Metrics, Fonts } from "../Services/LibLinking";

export default class SmallBadge extends Component {
  static propTypes = {
    data: PropTypes.string,
    positionTop: PropTypes.number,
    positionRight: PropTypes.number
  };

  render() {
    return (
      this.props.data 
      ?
      <View style={{
        position: 'absolute',
        top: this.props.positionTop ? this.props.positionTop : 0, 
        right: this.props.positionRight ? this.props.positionRight : 7,
        backgroundColor: Colors.text_negative,
        borderRadius: 50
      }}>
        <Label 
          text={`${this.props.data ? this.props.data : '' }`}
          style={{
            color: '#FFFFFF',
            fontSize: Fonts.size.small,
            // padding: Metrics.smallPadding,
            paddingHorizontal: Metrics.smallPadding,
            textAlign: 'center',
          }}
        />
      </View>
      :
      <View/>
    );
  }
}
