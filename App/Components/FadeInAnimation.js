import { Animated } from 'react-native';
import React, { Component } from "react";

export default class FadeInAnimation extends Component {

  constructor(props) {
    super(props);

    this.state = {
      scaleValue: new Animated.Value(0)
    }
  }

  componentDidMount() {
    Animated.timing(this.state.scaleValue, {
      toValue: 1,
      duration : 600,
      delay: this.props.index * 350
    }).start();
  }

  render() {
    return (
      <Animated.View style={{ opacity: this.state.scaleValue }}>
        { this.props.children }
      </Animated.View>
    );
  }
}