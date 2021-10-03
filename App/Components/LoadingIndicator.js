import React, { Component } from "react";
import PropTypes from "prop-types";
import { ActivityIndicator, View, Text } from "react-native";
import styles from "./Styles/LoadingIndicatorStyles";
import { Fonts, Colors } from "../Themes/";

export default class LoadingIndicator extends Component {
  static propTypes = {
    text: PropTypes.string,
    visible: PropTypes.bool,
  };

  getText() {
    return this.props.text || this.props.children || "";
  }

  render() {
    return (
      this.props.visible
      ?
      <View style={{
        position: 'absolute',
        top: '25%',
        bottom: '25%',
        left: '25%',
        right: '25%',
      }}>
        <View style={styles.backgroundContainer}>
          <ActivityIndicator {...this.props} />
          <Text style={styles.textContainer}>{this.getText()}</Text>
        </View>
      </View>
      :
      <View/>
    );
  }
}
