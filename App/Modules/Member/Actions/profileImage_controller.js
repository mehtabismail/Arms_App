/** REACT NATIVE **/
import React from "react";

/** PROJECT FILES **/
import { 
  AppConfig,
  ARMSDownloader
} from '../../../Services/LibLinking';
import MemberModal from '../Modals/member_modal';

/** NPM LIBRARIES **/
import moment from 'moment';


export default class ProfileImage extends React.Component  {
  constructor(props){
    super(props);

    // Create Member Modal Object
    this.memberModal = new MemberModal();

    // Create arms downloader Modal Object
    this.armsDownloader = new ARMSDownloader();
  }

  handleImageUpload(nric, source) {
    let result = new Promise((resolve, reject) => {
      var uri = source;
      var image_name = `${nric}-profile_image_${moment()}.png`;
      
      var uploadAPI = this.memberModal.UploadMemberProfileImageViaAPI(uri, image_name);
      uploadAPI.then((res) => {
        if(res.result == 1){
          var fileURL = `${AppConfig.api_url}/${res.image_url}`;
          resolve(this.memberModal.CheckProfileImage(nric, fileURL));
        } else {
          resolve({result: 0})
        }
      })
      // this.memberModal.TestUpload(uri, image_name);
    })
    return result
  }

  handleGetProfileImageFromFolder(nric) {
    let result = new Promise((resolve, reject) => {
      var path = `${AppConfig.folder_path_prefix}${AppConfig.profile_image_local}/${nric}`;
      var check = this.armsDownloader.handleFileExistChecking(path);
      check.then((res) => {
        if(res.result == 1) {
          var list = this.armsDownloader.handleFilesListing(path);
          list.then((res) => {
            if(res.result == 1){
              if(res.data){
                var path_img = `${AppConfig.folder_path_prefix}/${AppConfig.profile_image_local}/${nric}/${res.data[0]}`;
                var img_exist = true;
                resolve({ result: 1, path_img, img_exist })
              } else {
                resolve({ result: 0 });
              }
            } else {
              resolve(res);
            }
          })
        } else {
          resolve(res);
        }
      })
    })
    return result;    
  }

  // handleImageUploadIos(nric, source) {
  //   let result = new Promise((resolve, reject) => {
  //     var fileStoragePath = `${AppConfig.profile_image_local}/${nric}/profile_image_${moment()}.png`;
  //     var fileURL = source;
  //     var result = this.armsDownloader.handleFileDownload(fileStoragePath, fileURL)
  //     result.then((res) => {
  //       if(res.result == 1) {
  //         resolve({result: 1})
  //       } else {
  //         resolve(res)
  //       }
  //     })
  //   })
  //   return result
  // }

  // handleImageUploadAndroid(nric, source) {
  //   let result = new Promise((resolve, reject) => {
  //     var fileStoragePath = `${AppConfig.profile_image_local}/${nric}/profile_image_${moment()}.png`; 
  //     var folderPath = `${AppConfig.profile_image_local}/${nric}`;  
  //     var fileURL = source;
  //     var result = this.armsDownloader.handleFileCopy(fileStoragePath, fileURL, folderPath)
  //     result.then((res) => {
  //       if(res.result == 1) {
  //         resolve({result: 1})
  //       } else {
  //         resolve(res)
  //       }
  //     })
  //   })
  //   return result
  // }
  
}