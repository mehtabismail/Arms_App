/** REACT NATIVE **/
import React from 'react';

/** PROJECT FILES **/
import { 
  I18n,
  AppConfig,
} from '../../../Services/LibLinking';
import ReferralProgram from '../Modals/referral_program_modal';

/** NPM LIBRARIES **/
import NetInfo from "@react-native-community/netinfo";

export default class ReferralProgramController extends React.Component {
  constructor(props){
    super(props);

    // Create object
    this.referralProgram = new ReferralProgram();
  }

  // Screen Initiate
  initScreen(nric){
    let result = new Promise((resolve, reject) => {
      resolve(this.referralProgram.FetchReferralData(nric));
    });
    return result;
  }

  submitReferrerCodeToServer(refer_by_referral_code, nric){
    let result = new Promise((resolve, reject) => {
      var network_check = this.networkConnectValidation();
      network_check.then((res) => {
        if(res.result == 1){
          // Network available
          resolve(this.referralProgram.SubmitReferByReferralCodeToServerViaAPI(refer_by_referral_code, nric));
        } else {
          // No network
          resolve(res);
        }
      });
    });
    return result;
  }

  // Network check
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
