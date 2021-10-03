/** REACT NATIVE **/
import React from "react";

/** PROJECT FILES **/
import { 
  I18n,
} from '../../../../Services/LibLinking';
import ServerConfig from '../Modals/server_config';

/** NPM LIBRARIES **/
import NetInfo from "@react-native-community/netinfo";
import moment from 'moment';

export default class ServerController extends React.Component  {
  constructor(props){
    super(props);

    // Create Member Modal Object
    this.serverConfig = new ServerConfig();
  }

  FetchServerConfigStateData() {
    let result = new Promise ((resolve, reject) => {
      var fetch_data = this.serverConfig.FetchServerConfigData();
      fetch_data.then((res) => {
        if(res.result == 1){
          var config_type = res.data;
          for(let i = 0; i < config_type.length; i++){
            if(config_type[i].config_type == 'membership_state_settings'){
              var data = config_type[i].data.toString();
            }
          }
          resolve({result: 1, config_type: data});
        } else {
          resolve(res);
        }
      })
    })
    return result
  }

  GetServerConfigLastUpdate() {
    let result = new Promise ((resolve, reject) => {
      var fetch_data = this.serverConfig.FetchServerConfigData();
      fetch_data.then((res) => {
        if(res.result == 1){
          var config_list = res.data;
          var last_update = config_list.length > 0 ? moment(config_list[0].last_update).format("YYYY-MM-DD") : moment().subtract(1, 'days').format("YYYY-MM-DD");
          var current_date = moment().format("YYYY-MM-DD");
          if(last_update < current_date){
            this.serverConfig.FetchServerConfigViaAPI().then((res) => {
              resolve(res);
            });
          }
        } else {
          // Return Error
          resolve(res);
        }
      })
    })
    return result
  }

  GetMarketPlaceURL(){
    let result = new Promise ((resolve, reject) => {
      var fetch_return = this.serverConfig.FetchMarketPlaceURL();
      fetch_return.then((res)=>{
        if(res.result == 1){
          resolve(res.data);
        } else {
          resolve("");
        }
      });
    });
    return result;
  }

  GetMarketPlaceAccessToken(){
    let result = new Promise ((resolve, reject) => {
      var fetch_return = this.serverConfig.FetchMarketPlaceAccessToken();
      fetch_return.then((res)=>{
        if(res.result == 1){
          resolve(res.data);
        } else {
          resolve("");
        }
      });
    });
    return result;
  }

  /**
   * item = enum "code", "symbol", "name", "country", "rounding"
   */
  GetCurrencyData(item){
    let result = new Promise ((resolve, reject) => {
      // resolve(this.serverConfig.FetchMarketPlaceURL());
      var fetch_return = this.serverConfig.FetchCurrencyData();
      fetch_return.then((res)=>{
        if(res.result == 1){
          switch (item) {
            case "code":
              resolve(res.data.code);
              break;
            
            case "symbol":
              resolve(res.data.symbol);
              break;
            
            case "name":
              resolve(res.data.name);
              break;

            case "country":
              resolve(res.data.country);
              break;

            case "rounding":
              resolve(res.data.rounding);
              break;
          
            default:
              resolve("");
              break;
          }
        } else {
          resolve("");
        }
      });
    });
    return result;
  }
}