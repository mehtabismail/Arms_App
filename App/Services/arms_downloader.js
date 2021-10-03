/** REACT NATIVE **/
import React from 'react';
import { 
  CameraRoll,
  Platform,
} from 'react-native';

/** PROJECT FILES **/
import ServerCommunicator from './server_communicator';
import AppConfig from '../Config/AppConfig';

/** NPM LIBRARIES **/
import RNFetchBlob from "rn-fetch-blob";
import moment from 'moment';

export default class ARMSDownloader extends React.Component {
  constructor(){
    super();
  }

  // platform = ios
  handleFileDownload(fileStoragePath, fileURL){
    let result = new Promise((resolve, reject) => {
      RNFetchBlob
        .config({
          fileCache : true,
          // by adding this option, the temp files will have a file extension
          appendExt : 'png',
          path : fileStoragePath,
        })
        .fetch('GET', fileURL, {
          //some headers ..
        })
        .then((res) => {
          // the temp file path with file extension `png`
          console.log('The file saved to ', res.path())
          console.log('res: ', res)
          
          // Beware that when using a file path as Image source on Android,
          // you must prepend "file://"" before the file path
          // var path = {uri : Platform.OS === 'android' ? `file://${res.path()}` : res.path()}
          resolve({result: 1, data: res});
        })
        .catch((err) => {
          console.log('err: ', err)
          resolve({result: 0, data: err.toString()});
        })
    })
    return result;    
  }

  // platform = android
  handleFileCopy(fileStoragePath, fileURL, folderPath){
    let result = new Promise((resolve, reject) => {
      /**
       * Check folder exist
       */
      var folder_exist = this.handleFileExistChecking(folderPath);
      folder_exist.then((res) =>{
        if(res.result == 1){
          if(res.data){
            // Folder Exist, paste file
            RNFetchBlob.fs.cp(fileURL, fileStoragePath)
            .then((res) => { 
              console.log('res: ', res)
              resolve({result: 1, data: res});
            })
            .catch((err) => { 
              console.log('err: ', err)
              resolve({result: 0, data: err.toString()});
            })
          } else {
            // Folder not exist, create new folder.
            RNFetchBlob.fs.mkdir(folderPath)
            .then(() => { 
              // console.log('fileURL: ', fileURL)
              // paste file
              RNFetchBlob.fs.cp(fileURL, fileStoragePath)
              .then((res) => { 
                console.log('res: ', res)
                resolve({result: 1, data: res});
              })
              .catch((err) => { 
                console.log('err: ', err)
                resolve({result: 0, data: err.toString()});
              })
            })
            .catch((err) => { 
              alert(err.toString())
            })
          }
        } else {
          // Folder Checking Error
        }
      })
    })
    return result;    
  }


  handleFileExistChecking(path){
    let result = new Promise((resolve, reject) => {
      RNFetchBlob.fs.exists(path)
      .then((exist) => {
        resolve({result: 1, data: exist});
      })
      .catch((err) => {
        resolve({result: 0, data: err.toString()});
      })
    })
    return result
  }

  handleFileUnlink(path){
    let result = new Promise((resolve, reject) => {
      // remove file by specifying a path
      RNFetchBlob.fs.unlink(path)
      .then(() => {
        if(Platform.OS === "android"){
          RNFetchBlob.fs.scanFile([ {path: path} ])
            .then(() => {
              // alert("here")
              resolve({result: 1, data: "scanned."});
            })
            .catch((err) => {
              resolve({result: 0, data: err.toString()});
            });
        } else {
          resolve({result: 1, data: "scanned."});
        }
      })
      .catch((err) => {
        resolve({result: 0, data: err.toString()});
      })
    })
    return result
  }

  handleCreateFolder(path){
    let result = new Promise((resolve, reject) => {
      var fileExistCheckResult = this.handleFileExistChecking(path);
      fileExistCheckResult.then((res) => {
        if(res.result == 1){
          var fileExist = res.data;
          if(!fileExist){
            // remove file by specifying a path
            RNFetchBlob.fs.mkdir(path)
            .then(() => {
              resolve({result: 1, data: "Folder Created."});
            })
            .catch((err) => {
              resolve({result: 0, data: err.toString()});
              console.log(err);
            })
          } else {
            resolve({result: 1, data: "Folder Existed."});
          }
        } else {
          resolve(res);
        }
      })
    })
    return result
  }

  handleRetrieveAdsBannerViaAPI(){
    const {
      ads_dashboard_screen_id,
      ads_login_screen_id,
      ads_promo_screen_id,
      ads_promo_prod_screen_id,
      ads_voucher_screen_id,
      ads_banner_dashboard_scn_path,
      ads_banner_login_scn_path,
      ads_banner_promo_scn_path,
      ads_banner_promo_product_scn_path,
      ads_banner_voucher_scn_path,
    } = AppConfig;

    const local_screens = [
      {id: ads_dashboard_screen_id, path: ads_banner_dashboard_scn_path},
      {id: ads_login_screen_id, path: ads_banner_login_scn_path},
      {id: ads_promo_screen_id, path: ads_banner_promo_scn_path},
      {id: ads_promo_prod_screen_id, path: ads_banner_promo_product_scn_path},
      {id: ads_voucher_screen_id, path: ads_banner_voucher_scn_path}
    ];



    var serverCommunicator = new ServerCommunicator();
    var formData = new FormData();
    formData.append('a','get_member_ads_banner_list');

    // Send to data to server communicator
    var post_return = serverCommunicator.PostData(formData);
    post_return.then(async (res) =>{
      if(res.result == 1){
        var banner_list = res.banner_list;
        if(banner_list){
          for (let i = 0; i < banner_list.length; i++) {
            var banner_list_item = banner_list[i];
            /** Matching screen id with banner_name **/
            var fdr_index = local_screens.findIndex((data)=> data.id == banner_list_item.banner_name);
            if(fdr_index != -1){
              
              /** STEP 1: Delete Folder **/
              var del_return = await this.handleFileUnlink(local_screens[fdr_index].path);
              if(del_return){
                
                /** STEP 2: Create Folder **/
                var create_folder_result = await this.handleCreateFolder(local_screens[fdr_index].path);
                if(create_folder_result){
                  
                  /** STEP 3: Insert Ads Banner Pictures Into Folder **/
                  var banner_info = banner_list_item.banner_info;
                  if(banner_info){
                    var banner_image_list = banner_info.banner_list;
                    Object.keys(banner_image_list).map((value, index) => {
                      var img_path = `${local_screens[fdr_index].path}/${index}_${moment()}.png`;
                      var download_path = `${AppConfig.api_url}/${banner_image_list[value].path}?t=${moment()}`;
                      this.handleFileDownload(img_path, download_path);
                    });
                  }

                } // End of condition create_folder_return

              } // End of condition del_return
            
            } // End of condition fdr_index != -1
          } // End of For Loop
        } // End of condition banner_list
      }
    });
  }

  async handleDownloadCompanyLogo(){
    const { api_url, company_logo_url } = AppConfig;
    const download_path = `${api_url}/${company_logo_url}`;
    const local_path = `${RNFetchBlob.fs.dirs.DocumentDir}/logo/logo.png`;

    /** STEP 1: Delete Folder **/
    var del_return = await this.handleFileUnlink(local_path);
    if(del_return){
      this.handleFileDownload(local_path, download_path);
    } // End of condition del_return
  }

  async handlePhotoSaveToCamera(path){
    /**
     * Step 1: Save image to App's cache folder. If path is from local folder, skip save in cache folder.
     * Step 2: Save image to Gallery from cache folder.
     */
    // Step 1
    var saveToCache = "";
    if(path.substring(0,8)=="https://" || path.substring(0,7)=="http://"){
      var cachePath = `${RNFetchBlob.fs.dirs.CacheDir}/ebrochure/${moment()}.png`;
      saveToCache = await this.handleFileDownload(cachePath, path);
    } else {
      cachePath = path;
      saveToCache.result = 1;
    }

    // Step 2
    if(saveToCache.result == 1){
      var saveToGallery = CameraRoll.saveToCameraRoll(cachePath);
      saveToGallery.then((res) =>{
        alert(res);
      }).catch((err)=>{
        alert(err);
      })
    }
  }

  handleFilesListing(path){
    let result = new Promise((resolve, reject) => {
      RNFetchBlob.fs.ls(path)
      // files will an array contains filenames
      .then((files) => {
          // console.log(files);
          var data = [];
          if(files.length > 0){
            // Assign folder's files to data source
            for (let i = 0; i < files.length; i++) {
              // Ignore the file ".DS_Store", to prevent the slideshow show empty / black picture.
              if(files[i] != ".DS_Store"){
                data.push(files[i]);
              }
            }
            resolve({ result: 1, data: data });
          } else {
            resolve({ result: 1, data: "" });
          }
      })
      .catch((err) =>{
        resolve({ result: 0, data: err });
      })
    })
    return result
  }
  
  render(){
    return null;
  }
}