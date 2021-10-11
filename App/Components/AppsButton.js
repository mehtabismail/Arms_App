import React, { Component } from "react";
import PropTypes from "prop-types";
import { Animated, Image, View, TouchableOpacity, Text } from "react-native";
import styles from "./Styles/AppsButtonStyles";
import { Fonts, Metrics, Colors, ApplicationStyles } from "../Themes";

export default class AppsButton extends Component {
  static propTypes = {
    disabled: PropTypes.bool,
    onPress: PropTypes.func,
    text: PropTypes.string,
    children: PropTypes.string,
    navigator: PropTypes.object,
    backgroundColor: PropTypes.string,
    height: PropTypes.number,
    // source: PropTypes.string,
  };

  getText() {
    return this.props.text || this.props.children || "";
  }

  render() {
    return (
      <Animated.View
        style={[
          styles.button,{ ...this.props.style,
            alignSelf:"center",
            // height: this.props.height ? this.props.height : Metrics.button,
          
            width: this.props.width ? this.props.width : "95%",borderRadius:15,
            backgroundColor: this.props.backgroundColor ? this.props.backgroundColor : Colors.button_background,
            // backgroundColor:"#586bca"
          },
          this.props.disabled
            ? { backgroundColor: Colors.button_background_disabled }
            : ''
        ]}
      >
        <TouchableOpacity
          disabled={this.props.disabled}
          onPress={this.props.onPress}
          style={{
            width: "100%", 
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          {/* <View style={styles.contentContain}> */}
            
            {
              (this.props.source)
              ?
              <Image
                style={styles.iconContainer}
                source={this.props.source}
              />
              :
              <View/>
            }
            <Text
              style={[
                styles.buttonText,
                {
                  fontSize: this.props.fontSize
                    ? this.props.fontSize
                    : Fonts.size.h4,

                  color: this.props.color
                    ? this.props.color
                    : Colors.body
                }
              ]}
            >
              {this.getText()}
            </Text>
          {/* </View> */}
        </TouchableOpacity>
      </Animated.View>
    );
  }
}