import React, { Component } from "react";
import {
  Animated,
  Image,
  Dimensions,
  StyleSheet,
  Text,
  TouchableHighlight,
  View 
} from 'react-native';
import { Images, ApplicationStyles, Metrics, Label } from '../Services/LibLinking';
import styles from "./Styles/ExpandCollapseAnimationStyles";

export default class ExpandCollapseAnimation extends Component {
  constructor(props){
    super(props);
    this.icons = {     
      'up' : Images.dropup,
      'down' : Images.dropdown
    };

    this.state = {
      title: props.title,
      expanded: false,
      animation: new Animated.Value(50),
      containerWidth: props.containerWidth ? props.containerWidth : Dimensions.get('window').width * 0.8
    };
  }

  toggle(){
    let initialValue = this.state.expanded? this.state.maxHeight + this.state.minHeight : this.state.minHeight,
        finalValue = this.state.expanded? this.state.minHeight : this.state.maxHeight + this.state.minHeight;
        
    this.setState({
      expanded: !this.state.expanded
    });

    this.state.animation.setValue(initialValue);
    Animated.spring(
      this.state.animation,
      {
        toValue: finalValue
      }
    ).start();
  }

  _setMaxHeight(event){
    this.setState({
      maxHeight: event.nativeEvent.layout.height
    });
  }

  _setMinHeight(event){
    this.setState({
      minHeight: event.nativeEvent.layout.height
    });
  }

  render(){
    let icon = this.icons['down'];
    if(this.state.expanded){
      icon = this.icons['up'];
    }
    return ( 
      <Animated.View 
        style={[
          styles.container, {
            height: this.state.animation,
            width: this.state.containerWidth,
          }
        ]}
      >
        <View style={styles.titleContainer} onLayout={this._setMinHeight.bind(this)}>
          <Label style={styles.title} numberOfLines={1}>{this.state.title}</Label>
          <TouchableHighlight 
            style={styles.button} 
            onPress={this.toggle.bind(this)}
            underlayColor={"#f1f1f1"}
          >
            <Image
              style={styles.buttonImage}
              source={icon}
            />
          </TouchableHighlight>
        </View>
        
        <View style={[styles.body, {}]} onLayout={this._setMaxHeight.bind(this)}>
          {this.props.children}
        </View>
      </Animated.View>
    );
  }
}