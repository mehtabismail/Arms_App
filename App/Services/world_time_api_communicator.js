

/** REACT NATIVE **/
import React from 'react';

/** PROJECT FILES **/

/** NPM LIBRARIES **/
import moment from 'moment';

let worldDateTime = '';

export default class WorldTimeAPICommunicator extends React.Component {
  constructor(){
    super();
    this.state = {
      test: '',
      test2: false,
    }

    this.GetRealWorldTimeDateTime();
    // this.test123 = '';
  }

  /**
   * Sample of data,
   * {
   *  "week_number": 38,
   *  "utc_offset": "+08:00",
   *  "utc_datetime": "2019-09-17T03:28:55.918356+00:00",
   *  "unixtime": 1568690935,
   *  "timezone": "Asia/Kuala_Lumpur",
   *  "raw_offset": 28800,
   *  "dst_until": null,
   *  "dst_offset": 0,
   *  "dst_from": null,
   *  "dst": false,
   *  "day_of_year": 260,
   *  "day_of_week": 2,
   *  "datetime": "2019-09-17T11:28:55.918356+08:00",
   *  "client_ip": "124.82.122.105",
   *  "abbreviation": "+08"
   * }
   */

  GetWorldTimeData(){  
    let result = new Promise((resolve, reject) => {
      fetch(`http://worldtimeapi.org/api/ip`, {
        method: 'GET',
      })
      .then((response) => response.json())
      .then((responseJson) => {
        resolve({result: 1, data: responseJson});
      })
      .catch((error) => {
        resolve({result: 0, error_msg: error.toString()});
      });
    })
    return result;
  }

  /**
   * Get real time from World Time API
   */
  async GetRealWorldTimeDateTime(){
    var worldDateTime = "";
    var worldTimeData = await this.GetWorldTimeData();
    if(worldTimeData.result == 1){
      worldDateTime = moment(worldTimeData.data.datetime).format('YYYY-MM-DD HH:mm:ss');
    }
    return worldDateTime;
  }

  render(){
    return null;
  }
}