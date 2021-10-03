/** REACT NATIVE **/
import React from 'react';
import {
  Text, 
  View
} from 'react-native';

/** PROJECT FILES **/

/** NPM LIBRARIES **/

export default class App extends React.Component {
  constructor() {
    super();
    this.state= {
      ready: false,
      where: {lat: null, lng: null},
      error: null,
    }
  }

  componentDidMount(){
    let geoOptions = {
      enableHighAccuracy: true,
      timeOut: 20000,
      maximumAge: 60 * 60 * 24
    };

    this.setState({
      ready: false,
      error: null,
    })
    navigator.geolocation.getCurrentPosition(this.geoSuccess, this.geoFailure, geoOptions);
  }

  geoSuccess = (position) => {
    console.log(position);
    this.setState({
      ready: true,
      where: {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      }
    })
  }

  geoFailure = (err) => {
    this.setState({
      error: err.message
    });
  }

  render() {
    return (
      <View>
        {!this.state.ready && (<Text>Using Geolocation React Native</Text>)}
        {this.state.error && (<Text>{this.state.error}</Text>)}
        {this.state.ready && 
          (<Text>{
            `Latitude: ${this.state.where.lat}
            Longitude: ${this.state.where.lng}`}
          </Text>)}
      </View>
    )
  }
}