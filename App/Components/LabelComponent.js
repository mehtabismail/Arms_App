import React, { Component } from "react";
import PropTypes from "prop-types";
import { Text } from "react-native";
import styles from "./Styles/LabelComponentStyles";

export default class Label extends Component {
  static propTypes = {
    onPress: PropTypes.func,
    text: PropTypes.string,
    children: PropTypes.string,
    type: PropTypes.string,
  };

  

  getText() {
    return this.props.text || this.props.children || "";
  }

  getTypeStyle(){
    /**
     * NOTE: type = enum(title,normal,normal_bold)
     */
    var type = this.props.type
    switch (type) {
      case 'title':
        return styles.title

      case 'normal':
        return styles.normal

      case 'normal_bold':
        return styles.normal_bold

      case 'description':
        return styles.description

      case 'description_bold':
        return styles.description_bold
    
      default:
        return styles.normal
    }
  }

  render() {
    return (
      <Text
        {...this.props}
        style={[this.getTypeStyle(),this.props.style]}
        onPress={this.props.onPress}
      >
        {this.getText()}
      </Text>
    );
  }
}
