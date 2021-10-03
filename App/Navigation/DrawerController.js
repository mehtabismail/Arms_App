/** REACT NATIVE **/
import React from "react";

/** PROJECT FILES **/
import MemberModal from '../Modules/Member/Modals/member_modal.js';

/** NPM LIBRARIES **/

export default class MemberController extends React.Component  {
  constructor(props){
    super(props);
    
    this.navigation = props.navigation

    // Create Member Modal Object
    this.memberModal = new MemberModal();
    
  }

  // fetch member data
  fetchMemberData(nric) {
    let result = new Promise((resolve, reject) => {
      var memberInfo = this.memberModal.FetchMemberInfoViaAPI()
      memberInfo.then(async (res) => {
        /**
         * This method is to prevent when device is offline, user still can retrieve data from local db. 
         * Return Data Sample,
         * FetchMemberInfo return result + FetchMemberInfoViaAPI,
         * {result: 1, data: {name, email, card_no}, member_info_api: {result:1, data{}}}
         */
        var member_info = await this.getDrawerMemberInfoFromDB(nric);
        member_info.member_info_api = res;
        resolve(member_info);
      })
    })
    return result
  }

  getDrawerMemberInfoFromDB(nric){
    let result = new Promise((resolve, reject) => {
      var data = this.memberModal.FetchMemberInfo(nric)
      data.then((res) => {
        if(res.result == 1) {
          if(res.data){
            var name = res.data.name;
            var email = res.data.email;
            var card_no = res.data.card_no;
            resolve({result: 1, data: {name, email, card_no}});
          } else {
            resolve({result: 1, data: ""});
          }
        } else {
          resolve(res);
        }
      })
    });
    return result;
  }

  //   handle log out process
  handleLogOutProcess(nric) {
    let result = new Promise((resolve, reject) => {
      /**
       * Logout user from server
       */
      var logout_api = this.memberModal.MemberLogoutViaAPI();
      logout_api.then((res) =>{
        if(res.result == 1){
          var process = this.memberModal.MemberLogout(nric);
          process.then((res) => {
            resolve(res);
          })
        } else {
          resolve({result: 0, data: res.error_msg});
        }
      })
    })
    return result  
  }
}