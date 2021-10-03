import React, { Component } from "react";
import { Animated, TouchableOpacity } from 'react-native';
import PropTypes from "prop-types";
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { Metrics, Colors } from "../Themes";

const AnimatedIcon = Animated.createAnimatedComponent(FontAwesome5);

export default class Rating extends Component {
  constructor(props){
    super(props);
    this.state = {
      ratingValue: 0,
    }

    this.springValueArr = [];
    for (let index = 0; index < this.props.totalStar; index++) {
      this.springValueArr.push(new Animated.Value(1))
    }
  }

  static defaultProps = {
    icon: "star",
    colorRated: Colors.tertiary,
    colorUnrated: Colors.primary,
    size: Metrics.icons.large,
    disabled: false,
  }

  static propTypes = {
    icon: PropTypes.string,
    ratingValue: PropTypes.number,
    totalStar: PropTypes.number,
    onPress: PropTypes.func,
    colorRated: PropTypes.string,
    colorUnrated: PropTypes.string,
    size: PropTypes.number,
    disabled: PropTypes.bool
  };

  //TODO: Need to find repleacement for componentWillReceiveProps()
  UNSAFE_componentWillReceiveProps(){
    this.setState({
      ratingValue: this.props.ratingValue,
    });
  }

  handleGenerateStarList(totalStar){
    var starList = [];
    for (let i = 0; i < totalStar; i++) {
      var starId = i + 1;
      starList.push({starId});
    }
    return starList;
  }

  runAnimateSpring(index) {
    this.springValueArr[index].setValue(0.3);
    Animated.spring(
      this.springValueArr[index],
      {
        toValue: 1,
        friction: 1
      }
    ).start();
  }

  render() {
    const starList = this.handleGenerateStarList(this.props.totalStar);
    return(
      starList.map((value, index)=>{
        var solid = this.props.ratingValue >= value.starId ? true : false;
        var color = solid ? this.props.colorRated : this.props.colorUnrated;
        return(
          <TouchableOpacity 
            key={`${index}`} 
            disabled={this.props.disabled}
            onPress={()=>{
              this.props.onPress(value.starId);
              this.setState({ratingValue: value.starId});
              this.runAnimateSpring(index);
            }}
            activeOpacity={1}
          >
            <AnimatedIcon 
              name={this.props.icon}
              size={this.props.size}
              color={color}
              solid={solid}
              style={{transform: [{scale: this.springValueArr[index]}]}}
            />
          </TouchableOpacity>
        )
      })
    )
  }
}