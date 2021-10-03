/** REACT NATIVE **/
import React from 'react';

/** PROJECT FILES **/
import { 
  I18n,
  AppConfig,
} from '../../../Services/LibLinking';
import NoticeBoard from "../Modals/notice_board";

/** NPM LIBRARIES **/
import NetInfo from "@react-native-community/netinfo";

export default class NoticeBoardController extends React.Component {
  constructor(props){
    super(props);

    this.navigation = (props)?props.navigation:'';

    // Create cycle count object
    this.noticeBoard = new NoticeBoard();
  }

  /** Screen Initiate **/
  initScreen(){
    let result = new Promise((resolve, reject) => {
      resolve(this.handleGetNoticeBoardData());
    })
    return result
  }
  /** END of Screen Initiate **/

  /**
   * Handle Get Notice Board Data
   * - If Network Available, 
   *    1) Fetch latest notice board data from server via API.
   *    2) Fetch notice board data from db.
   * - If Network Not Availble,
   *    1) Fetch notice board data from db.
   */
  handleGetNoticeBoardData(){
    let result = new Promise((resolve, reject) => {
      /**
       * 1) Check Network 
       * 1.1) Network Available, get notice board list from server
       * 1.2) Network Not Available, get notice board list from local
       */
      var network_return = this.networkConnectValidation();
      network_return.then(async(res) =>{
        if(res.result == 1){
          // Get notice board data list from server based on last update
          var last_update_data = await this.noticeBoard.FetchNoticeBoardLastUpdate();
          var last_update = "";
          if(last_update_data.result == 1){
            if(last_update_data.data){
              last_update = last_update_data.data.last_update?last_update_data.data.last_update:'';
            }
          }

          var fetch_nb_result = this.noticeBoard.FetchNoticeBoardViaAPI(last_update);
          fetch_nb_result.then((res) =>{
            if(res.result == 1){
              var nb_list = this.getNoticeBoardData();
              nb_list.then((res) => {
                resolve({ result: 1, data: res.data, check: true });
              })
            } else {
              resolve(res);
            }
          })
        } else {
          resolve(this.getNoticeBoardData());
        }
      })
    });
    return result;
  }

  /**
   * Data format that cater react-native-image-zoom-viewer
   * Sample,
   *  [
   *    key: '1',
        url: 'https://www.youtube.com/embed/pc7QmORXSa4',
        nb_id: 1,
        item_type: 'video',
        last_update: '2019-08-23 12:00:00',
        nb_server_id: 1,
        sequence: 1,
        video_site: 'youtube',
        item_url: 'https://www.youtube.com/embed/pc7QmORXSa4',
        video_link: pc7QmORXSa4,
        image_click_link: 'https://www.google.com',
        props: {
          url: '',
          source: 'https://www.youtube.com/embed/pc7QmORXSa4')
        }
      ]
    */
  getNoticeBoardData(){
    let result = new Promise((resolve, reject) => {
      var nb_return = this.noticeBoard.FetchNoticeBoardList();
      nb_return.then((res) => {
        if(res.result == 1){
          if(res.data){
            var data = [];
            for (let i = 0; i < res.data.length; i++) {
              var host_url = (res.data[i].item_type == "image") ? `${AppConfig.api_url}/` : '';
              var url = `${host_url}${res.data[i].item_url}`;
              res.data[i].key = res.data[i].nb_id.toString();
              res.data[i].url = url;
              res.data[i].props = { source: { uri: url } };
            }
          }
        }
        resolve(res);
      })
    });
    return result;
  }

  networkConnectValidation(){
    let result = new Promise((resolve, reject) => {
      NetInfo.isConnected.fetch().done((isConnected) => { 
        if(isConnected) {
          resolve({result: 1, data: isConnected})
        } else {
          resolve({result: 0, data: {title: I18n.t("network_error_title"), msg: I18n.t("network_error_msg")}});
        }
      });
    })
    return result;
  }
}
