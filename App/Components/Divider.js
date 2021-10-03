import React, { Component } from "react";
import PropTypes from "prop-types";
import { View, Text } from "react-native";
import styles from "./Styles/DividerStyles";
import { Colors } from "../Themes";

export default class Divider extends Component {
  static propTypes = {
    type: PropTypes.string,
    lineColor: PropTypes.string,
    lineWidth: PropTypes.number,
    text: PropTypes.string,
    textColor: PropTypes.string,
    textBold: PropTypes.bool,
    opacity: PropTypes.number,
  };

  getDividerTypeStyle(){
    if(this.props.type=="vertical"){
      return styles.dividerVertical
    } else {
      return styles.dividerHorizontal
    }
  }

  getDividerColorStyle(){
    if(this.props.type=="vertical"){
      return {borderRightColor:this.props.lineColor?this.props.lineColor:Colors.text_color_1}
    } else {
      return {borderBottomColor:this.props.lineColor?this.props.lineColor:Colors.text_color_1}
    }
  }

  getDividerWidthStyle(){
    if(this.props.type=="vertical"){
      return {borderRightWidth:this.props.lineWidth?this.props.lineWidth:1}
    } else {
      return {borderBottomWidth:this.props.lineWidth?this.props.lineWidth:1}
    }
  }

  render() {
    return (
      // <View 
      //   style={
      //     (this.props.type=="vertical")
      //     ?
      //     styles.dividerVertical
      //     :
      //     styles.dividerHorizontal
      //   }
      // />
      
      (this.props.text)
      ?
      <View style={styles.dividerContainer}>
        <View 
          style={[
            this.getDividerTypeStyle(),
            this.getDividerColorStyle(),
            this.getDividerWidthStyle(),
            {
              opacity: this.props.opacity?this.props.opacity:1
            }
          ]}
        />
        <Text 
          style={[
            styles.textContainer,{
              color:this.props.textColor?this.props.textColor:Colors.text_color_1,
              fontWeight:this.props.textBold?'bold':'normal',
            }
          ]}
        >
          {this.props.text}
        </Text>
        <View 
          style={[
            this.getDividerTypeStyle(),
            this.getDividerColorStyle(),
            this.getDividerWidthStyle(),
            {
              opacity: this.props.opacity?this.props.opacity:1
            }
          ]}
        />
      </View>
      :
      <View 
        style={[
          this.getDividerTypeStyle(),
          this.getDividerColorStyle(),
          this.getDividerWidthStyle(),
          {
            opacity: this.props.opacity?this.props.opacity:1
          }
        ]}
      />
      
    );
  }
}
