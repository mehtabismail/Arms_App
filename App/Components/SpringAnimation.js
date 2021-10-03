import { Animated } from 'react-native';
import React, { Component } from "react";

export default class SpringAnimation extends Component {

  constructor(props) {
    super(props);

    this.state = {
      springValue: new Animated.Value(0.3)
    }
  }

  componentDidMount() {
    Animated.spring(this.state.springValue, {
      toValue: 1,
      friction: 1,
      useNativeDriver: true,
    }).start();
  }

  render() {
    return (
      <Animated.View style={{ transform: [{scale: this.state.springValue}] }}>
        { this.props.children }
      </Animated.View>
    );
  }
}