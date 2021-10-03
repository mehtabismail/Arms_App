import React, {Component} from 'react';
import {ApplicationStyles, Colors, Metrics, Fonts} from '../Themes'
import PromotionContainer from '../Modules/Promotion/Containers/PromotionContainer';
import {TouchableOpacity,
        Text,
        TextInput, 
        View,  
        Image,
        SafeAreaView,
        ScrollView,
        Dimensions,
        FlatList
      } from 'react-native';


export default class PromotionView extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      screenWidth: Dimensions.get('window').width,
      screenHeight: Dimensions.get('window').height,
      datalist: [
        {key: "1", prod_name: "Test1", prod_img: "", prod_dis: "20%"},
        {key: "2", prod_name: "Test2", prod_img: "", prod_dis: "20%"},
        {key: "3", prod_name: "Test3", prod_img: "", prod_dis: "20%"},
      ],
      flatListRentalTrigger: false,
    }
  }

  /**Navigation Bottom Tab**/
  static navigationOptions = ({navigation, navigationOptions}) => {
    const params = navigation.state.params || {};
    return {
        title: 'Promotion',
    };
  };
  /**End Navigation Bottom Tab**/

  componentWillMount() {
    // this.setState({
    //   flatListRentalTrigger: !this.state.flatListRentalTrigger,
    // })
  }

  handleFlatListRenderItem = ({item, index}) => {
    return (
          // Product Image Container
          <View style={PromotionContainer.productContainer}>
            {/* Product Discount Container */}
            <View style={[PromotionContainer.discountContainer, {}]}>
            <Text style={{justifyContent: 'flex-end'}}>{`${item.prod_dis}`}</Text>
            </View>

            <Text>{`${item.prod_name} ${index}`}</Text>
          </View>
		)
  }

  render() {
    /** Local variable config **/
    var portrait = this.state.screenWidth < this.state.screenHeight
    /** End local variable config **/

      return (
        /**Start Safe Area**/
        <SafeAreaView style={ApplicationStyles.screen.safeAreaContainer}>
          <View style={[ApplicationStyles.screen.headerContainer, {marginBottom: Metrics.smallMargin}]} >
           <Image source={{uri:'http://www.cloverinfosoft.com/wp-content/uploads/2016/03/Mobile-Apps-banner-ps.jpg'}}
                  style= {{width: '100%', height: '100%'}}
           />
         </View>

         <ScrollView showsVerticalScrollIndicator={false}> 
          <View>
          
          {/* Special For You */}
          <TouchableOpacity style={[PromotionContainer.shadow, {marginVertical: Metrics.doubleBaseMargin, marginHorizontal: Metrics.baseMargin}]}>
            <View style={PromotionContainer.container}>

              {/* headerContainer */}
              <View style={[PromotionContainer.headerContainer, {}]}>
                <Text style={{justifyContent: 'flex-start'}}>SPECIAL FOR YOU</Text>
                <Image 
                  source={require('../../../Assets/Images/arrow_right.png')}
                  style={{justifyContent: 'flex-end', height: 20, width: 20}}/>
              </View>

                 {/*  */}
              <FlatList
                data={this.state.datalist}
                renderItem={this.handleFlatListRenderItem}
                key={portrait ? "h" : "v"}
                extraData={this.state.flatListRentalTrigger}
                horizontal={true}
              />
            </View>
          </TouchableOpacity>

          {/* Hot Deals */}
          <TouchableOpacity style={[PromotionContainer.shadow, {marginVertical: Metrics.doubleBaseMargin, marginHorizontal: Metrics.baseMargin}]}>
            <View style={PromotionContainer.container}>

              {/* headerContainer */}
              <View style={[PromotionContainer.headerContainer, {}]}>
                <Text style={{justifyContent: 'flex-start'}}>HOT DEALS</Text>
                <Image 
                  source={require('../../../Assets/Images/arrow_right.png')}
                  style={{justifyContent: 'flex-end', height: 20, width: 20}}/>
              </View>

                 {/*  */}
              <FlatList
                data={this.state.datalist}
                renderItem={this.handleFlatListRenderItem}
                key={portrait ? "h" : "v"}
                extraData={this.state.flatListRentalTrigger}
                horizontal={true}
              />
            </View>
          </TouchableOpacity>

          {/* Whats Inside */}
          <TouchableOpacity style={[PromotionContainer.shadow, {marginVertical: Metrics.doubleBaseMargin, marginHorizontal: Metrics.baseMargin}]}>
            <View style={PromotionContainer.container}>

              {/* headerContainer */}
              <View style={[PromotionContainer.headerContainer, {}]}>
                <Text style={{justifyContent: 'flex-start'}}>WHAT'S INSIDE</Text>
                <Image 
                  source={require('../../../Assets/Images/arrow_right.png')}
                  style={{justifyContent: 'flex-end', height: 20, width: 20}}/>
              </View>

                 {/*  */}
              <FlatList
                data={this.state.datalist}
                renderItem={this.handleFlatListRenderItem}
                key={portrait ? "h" : "v"}
                extraData={this.state.flatListRentalTrigger}
                horizontal={true}
              />
            </View>
          </TouchableOpacity>

         
          </View>
         </ScrollView>
        </SafeAreaView>
      )
  }
}