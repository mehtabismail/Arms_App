import { 
  Animated, 
  Dimensions, 
  FlatList, 
  View } from 'react-native';
import styles from "./Styles/HorizontalScrollAnimationStyles";
import React, { Component } from "react";
import PropTypes from "prop-types";

//We declare this here because the device width will be used for scrollView again
const SCREEN_WIDTH = Dimensions.get("window").width;
const { width } = Dimensions.get('window');
const xOffset = new Animated.Value(0);

const transitionAnimation = index => {
  return {
    transform: [
      { perspective: 800 },
      {
        scale: xOffset.interpolate({
          inputRange: [
            (index - 1) * SCREEN_WIDTH,
            index * SCREEN_WIDTH,
            (index + 1) * SCREEN_WIDTH
          ],
          outputRange: [0.25, 1, 0.25]
        })
      },
      {
        rotateX: xOffset.interpolate({
          inputRange: [
            (index - 1) * SCREEN_WIDTH,
            index * SCREEN_WIDTH,
            (index + 1) * SCREEN_WIDTH
          ],
          outputRange: ["45deg", "0deg", "45deg"]
        })
      },
      {
        rotateY: xOffset.interpolate({
          inputRange: [
            (index - 1) * SCREEN_WIDTH,
            index * SCREEN_WIDTH,
            (index + 1) * SCREEN_WIDTH
          ],
          outputRange: ["-45deg", "0deg", "45deg"]
        })
      }
    ]
  };
};

export default class HorizontalScrollAnimation extends Component {
  static propTypes = {
    renderItem: PropTypes.func,
    scrollPageCustomStyle: PropTypes.object,
    cardCustomStyle: PropTypes.object,
  };

  handleFlatListRenderItem = ({item, index}) => {
    return (
      <View style={[styles.scrollPage, this.props.scrollPageCustomStyle]}>
        {/* we are going to write animation function and pass it to here */}
        <Animated.View style={[transitionAnimation(index), this.props.cardCustomStyle]}>
          {this.props.renderItem(item, index)}
        </Animated.View>
      </View>
    )
  }

  render() {
    // position will be a value between 0 and photos.length - 1 assuming you don't scroll pass the ends of the ScrollView
    let position = Animated.divide(xOffset, width);
    return (      
      <View>
        <Animated.FlatList 
          data={this.props.data}
          renderItem={this.handleFlatListRenderItem}
          extraData={this.props.extraData}

          scrollEventThrottle={16}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: xOffset } } }],
            { useNativeDriver: true }
          )}
          horizontal={true}
          pagingEnabled={true}
          showsHorizontalScrollIndicator={false}
        />

        <View style={{ flexDirection: 'row', alignSelf: 'center' }}>
          {this.props.data.map((item, index) => {
            let opacity = position.interpolate({
              inputRange: [index - 1, index, index + 1], // each dot will need to have an opacity of 1 when position is equal to their index (i)
              outputRange: [0.3, 1, 0.3], // when position is not i, the opacity of the dot will animate to 0.3
              extrapolate: 'clamp' // this will prevent the opacity of the dots from going outside of the outputRange (i.e. opacity will not be less than 0.3)
            });
            return (
              <Animated.View
                key={index}
                style={{ opacity, height: 10, width: 10, backgroundColor: '#595959', margin: 8, borderRadius: 5 }}
              />
            );
          })}
        </View>
      </View>
    );
  }
}


/**
 * Start Unused Codes
 */

//Screen component
// const Screen = props => {

// export default class HorizontalScrollAnimation extends Component {
//   render() {
//     return (
//       <View style={styles.scrollPage}>
//         {/* we are going to write animation function and pass it to here */}
//         <Animated.View style={[styles.screen, transitionAnimation(this.props.index)]}>
//           {/* <Text style={styles.text}>{props.text}</Text> */}
//           { this.props.children }
//         </Animated.View>
//       </View>
//     );
//   };
// }

// <Animated.ScrollView
//   scrollEventThrottle={16}
//   onScroll={Animated.event(
//     [{ nativeEvent: { contentOffset: { x: xOffset } } }],
//     { useNativeDriver: true }
//   )}
//   horizontal={true}
//   pagingEnabled={true}
//   style={styles.scrollView}
// >
//   {/* <Screen index={this.props.children} /> */}
  
// </Animated.ScrollView>

 /**
  * End Unused Codes
  */