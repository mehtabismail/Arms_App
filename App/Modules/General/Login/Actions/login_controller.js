/** REACT NATIVE **/
import React from "react";

/** PROJECT FILES **/
import MemberModal from "../../../Member/Modals/member_modal.js";

/** NPM LIBRARIES **/

export default class LoginController extends React.Component  {
  constructor(props){
    super(props);
    
    // this.navigation = props.navigation

    // Create Login Modal Object
    this.memberModal = new MemberModal();
  }

  /* Screen Initiate */
  initScreen(){
    let result = new Promise((resolve,reject) => {
      resolve(this.fetchCurrentLoginMember());
    })
    return result;
  }

  /**
   * Fetch Current Login Member Data
   */
  fetchCurrentLoginMember(){
    let result = new Promise((resolve,reject) => {
      resolve(this.memberModal.FetchLoginMemberNRIC_SessionToken());
    })
    return result;
  }

  /* fetch Login Data */
  fetchLoginData(nric, password) {
    let result = new Promise((resolve, reject) => {
      
      /** Send nric / card no and password to server for verification **/
      var loginData = this.memberModal.MemberLoginViaAPI(nric, password)
      loginData.then((res) => {
        if(res.result == 1){
          var session_token = res.session_token;
          var nric = res.nric;
          
          /** Update member session token to database **/
          var session = this.memberModal.UpdateMemberSessionTokenData(nric, session_token);
          session.then((res) => {
            if(res.result == 1) {
              /** Update member PN Token to server **/
              // var updatePNToken = this.memberModal.UploadPNTokenToServer(nric);
              
              /** Update member login status in database **/
              var loginStatus = this.memberModal.UpdateLoginStatus(nric);
              loginStatus.then((res) => {
                if(res.result == 1) {
                  var login_status = res.data.login_status;
                  resolve({result: 1, data: {nric: nric, login_status: login_status}});
                } else {
                  resolve(res);
                }
              })
            } else {
              resolve(res);
            }
          })
        } else {
          resolve(res);
        }
      })
    })
    return result
  }

  /* forget password */
  handleForgetPassword(nric, email) {
    let result = new Promise((resolve, reject) => {
      var dataCheck = this.memberModal.ForgetMemberPasswordViaAPI(nric, email)
      dataCheck.then((res) => {
        if(res.result == 1){
          resolve(res);
        } else {
          resolve({result: 0, data: {title: "", msg: res.error_msg}});
        }
      }) 
    })
    return result
  }

  /* Register new member */
  handleMemberRegistration(email, password) {
    let result = new Promise((resolve, reject) => {
      var dataCheck = this.memberModal.MemberRegistrationViaAPI(email, password)
      dataCheck.then((res) => {
        if(res.result == 1){
          resolve(res);
        } else {
          resolve({result: 0, data: {title: "", msg: res.error_msg}});
        }
      }) 
    })
    return result
  }

  /* Existing member Data */
  FetchExistingMemberData(nric){
    let result = new Promise((resolve, reject) => {
      var dataCheck = this.memberModal.FetchExistingMemberDataViaAPI(nric)
      dataCheck.then((res) => {
        if(res.result == 1){
          resolve(res);
        } else {
          resolve({result: 0, data: {title: "", msg: res.error_msg}});
        }
      }) 
    })
    return result
  }

  /* Request OTP Code */
  HandleRequestOTPCode(nric, phone_no){
    let result = new Promise((resolve, reject) => {
      var dataCheck = this.memberModal.RequestOTPCodeViaAPI(nric, phone_no)
      dataCheck.then((res) => {
        if(res.result == 1){
          resolve(res);
        } else {
          resolve({result: 0, data: {title: "", msg: res.error_msg}});
        }
      }) 
    })
    return result    
  }

  FetchExistingMemberDataWithOTP(nric, phone_no, email, otp_code){
    let result = new Promise((resolve, reject) => {
      var dataCheck = this.memberModal.FetchExistingMemberDataWithOTPViaAPI(nric, phone_no, email, otp_code)
      dataCheck.then((res) => {
        if(res.result == 1){
          resolve(res);
        } else {
          resolve(res);
        }
      }) 
    })
    return result
  }
}
