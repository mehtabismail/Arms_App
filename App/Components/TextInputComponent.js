import React, { Component } from "react";
import PropTypes from "prop-types";
import { TextInput as Input, View, Image, Text } from "react-native";
import styles from "./Styles/TextInputComponentStyles";
import { Metrics, Colors } from "../Themes/";

export default class ARMSTextInput extends Component {
  static propTypes = {
    inputRef: PropTypes.func,
    underlineColorAndroid: PropTypes.string,
    helperText: PropTypes.string,
    textFontSize: PropTypes.number,
    textAlign: PropTypes.string,
    borderColor: PropTypes.string,
    textColor: PropTypes.string,
    leftImageColor: PropTypes.string,
    rightImageColor: PropTypes.string,
  };

  render() {
    const { props } = this;
    return (
      <View style={styles.container}>
        
        {/* Attributes TextInput */}
        <View 
          style={[styles.textInputContainer,
            props.borderColor?{borderColor:props.borderColor}:''
          ]}>
          
          {/* Left Icon */}
          {
            (props.inlineLeftImage)
            ?
            <View style={[styles.leftIconContainer,
              this.props.editable==false?{backgroundColor: Colors.editable_disabled}:'',
            ]}>
              <Image
                style={[{
                  width: Metrics.icons.medium,
                  height: Metrics.icons.medium,
                }, props.leftImageColor?{tintColor:props.leftImageColor}:''
                ]}
                source={props.inlineLeftImage}
              />
            </View>
            :
            <View />
          }
          
          {/* Input Field */}
          <Input
            {...props}
            ref={input => props.inputRef && props.inputRef(input)}
            style={[styles.inputContainer,
              props.textColor?{color:props.textColor}:'',
              props.textFontSize?{fontSize:props.textFontSize}:'',
              props.textAlign?{textAlign:props.textAlign}:'',
              this.props.editable==false?{backgroundColor: Colors.editable_disabled}:'',
            ]}
            underlineColorAndroid={this.props.underlineColorAndroid?this.props.underlineColorAndroid:'transparent'}
          />

          {/* Right Icon */}
          {
            (props.inlineRightImage)
            ?
            <View style={styles.rightIconContainer}>
              <Image
                style={[
                  {
                    width: Metrics.icons.small,
                    height: Metrics.icons.small
                  }, 
                  props.rightImageColor?{tintColor:props.rightImageColor}:'',
                  this.props.editable==false?{backgroundColor: Colors.editable_disabled}:'',
                ]}
                source={props.inlineRightImage}
              />
            </View>
            :
            <View />
          }
          
        </View>

        {/* Attribute Helper Text - Below Text Input */}
        {
          this.props.helperText
          ?
          <View style={styles.helperTextContainer}>
            <Text style={[styles.helperText, props.helperTextColor?{color:props.helperTextColor}:'']}>
              {[props.helperText]}
              
            </Text>
          </View>
          :
          <View/>
        }
      </View>
    );
  }
}
