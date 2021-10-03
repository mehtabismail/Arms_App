/** REACT NATIVE **/
import React from "react";

/** PROJECT FILES **/
import { 
  I18n,
} from '../../../Services/LibLinking';
import MemberModal from '../Modals/member_modal.js';

/** NPM LIBRARIES **/
import NetInfo from "@react-native-community/netinfo";

export default class MemberController extends React.Component  {
  constructor(props){
    super(props);

    // Create Member Modal Object
    this.memberModal = new MemberModal();
  }

  // Fetch member Points
  fetchMemberPointData(nric) {
    let result = new Promise ((resolve, reject) => {
      resolve(this.memberModal.FetchMemberPoints(nric))
    })
    return result
  }

  // Fetch Member Points History from DB test
  fetchMemberPointsHistoryfromDB(nric) {
    let result = new Promise((resolve, reject) => {
      var openPoint = 0;
      var historyList = [];
      var pointHistory = this.memberModal.FetchMemberPointHistory(nric)
      pointHistory.then((res) => {
        if(res.result == 1) {
          // Add key into the res.data
          for (let i = 0; i < res.data.length; i++) { 
            res.data[i].key = i.toString();

            if (i > 29) {
              var point = parseFloat(res.data[i].points)
              openPoint = openPoint + point;    
            } else {
              historyList.push(res.data[i]);
            };
          }
        }
        resolve({result:1 , data: {historyList, openPoint}})
      })
    })
    return result
  }

  // Fetch member points History Data
  fetchMemberPointHistoryData(nric) {
    let result = new Promise ((resolve, reject) => {
      /**
       * 1) Check Network 
       * 1.1) Network Available, get promotion list from server
       * 1.2) Network Not Available, get promotion list from local
       */
      var network_return = this.networkConnectValidation();
      network_return.then((res) =>{
        if(res.result == 1){
          //History update from server
          var history = this.memberModal.FetchMemberPointHistoryViaAPI(nric)
          history.then((res) => {
            if(res.result == 1) { 
              if(res.data) {
                resolve(this.fetchMemberPointsHistoryfromDB(nric))
              } else {
                resolve(res)
              }
            } else {
              resolve(res)
            }
          }) 
        } else {
          resolve(this.fetchMemberPointsHistoryfromDB(nric))
        }
      }) 
    })
    return result
  }

  // Fetch Member Data
  fetchMemberDataProfile(nric) {
    // var email = [
    //   {key: 'email', data: "EMAIL"}, 
    // ]
    
    var contactInfo = [
      {key: 'phone', data: "PHONE NO"},
      {key: 'address', data: "ADDRESS"},
      {key: 'postcode', data: "POSTCODE"},
      {key: 'city', data: "CITY"},
      {key: 'state', data: "STATE"},
    ]
    
    var personalInfo = [ 
      {key: 'name', data: "NAME"},
      // {key: 'nric', data: "NRIC"},
      // {key: 'card_no', data: "CARD NO"},
      {key: 'gender', data: "GENDER"},
      {key: 'dob', data: "DATE OF BIRTH"}, 
    ]

    var membershipInfo = [
      {key: 'card_no', data: "CARD NO"},
      {key: 'points', data: "POINTS"},
      {key: 'issue_date', data: "ISSUE DATE"},
      {key: 'next_expiry_date', data: "NEXT EXPIRY DATE"},
      {key: 'member_type_desc', data: "MEMBER TYPE"}, 
    ]  

    let result = new Promise((resolve, reject) => {
      var profile = this.memberModal.FetchMemberInfo(nric)
      profile.then((res) => {
        if(res.result == 1) {
          var name = res.data.name;
          var email = res.data.email;
          var card_no = res.data.card_no;
          var member_data = res.data;
          Object.keys(member_data).map((value, index)=>{    

            // var emailIndex = email.findIndex((data) => data.key == value)
            // if(emailIndex != -1){
            //   email[emailIndex].details = member_data[value];
            // }

            var contactIndex = contactInfo.findIndex((data) => data.key == value)
            if(contactIndex != -1){
              contactInfo[contactIndex].details = member_data[value];
            }

            var personalIndex = personalInfo.findIndex((data) => data.key == value)
            if(personalIndex != -1){
              personalInfo[personalIndex].details = member_data[value];
            }

            var membershipIndex = membershipInfo.findIndex((data) => data.key == value)
            if(membershipIndex != -1){
              membershipInfo[membershipIndex].details = member_data[value];
            }

          })
        } 
        resolve({result: 1, data: { email, contactInfo, personalInfo, membershipInfo, name, card_no }})
      })
    }) 
    return result
  }

  // network validate
  networkConnectValidation() {
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

  // handle update contact list
  updateContactList(nric, postcode = "", address = "", city = "", state = "", phone_3 = "") {
    let result = new Promise((resolve, reject) => {
      var contact_list = {
        nric,
        postcode, 
        address, 
        city, 
        state, 
        phone_3
      };
      var updateContact = this.memberModal.UpdateMemberContactInformation(contact_list)
      updateContact.then((res) => {
        if(res.result == 1){
          var updateProfile = this.memberModal.UpdateMemberContactInfoViaAPI(postcode, address, city, state, phone_3)
          updateProfile.then((res) => {
            if(res.result == 1){
              resolve(res)
            } else {
              resolve({result: 0, data: {title: "", msg: res.error_msg}});
            }
          })
        } else {
          resolve(res)
        }
      })
    })
    return result;
  }

  // handle update personal list
  updatePersonalList(nric, name = "", gender = "", dob = ""){
    let result = new Promise((resolve, reject) => {
      var personal_list = {
        nric,
        name,
        gender,
        dob,
      };
      var updatePersonal = this.memberModal.UpdateMemberPersonalInformation(personal_list)
      updatePersonal.then((res) => {
        if(res.result == 1){
          var updateProfile = this.memberModal.UpdateMemberPersonalInfoViaAPI(name, gender, dob)
          updateProfile.then((res) => {
            if(res.result == 1){
              resolve(res)
            } else {
              resolve({result: 0, data: {title: "", msg: res.error_msg}});
            }
          })
        } else {
          resolve(res)
        }
      })
    })
    return result;
  }

  // password validate before changing email or password
  currentPasswordValidation(password) {
    let result = new Promise((resolve, reject) => {
      var validate = this.memberModal.ValidateMemberPasswordViaAPI(password)
      validate.then((res) => {
        if(res.result == 1){
          resolve(res)
        } else {
          resolve({result: 0, data: {title: "", msg: res.error_msg}});
        }
      })
    })
    return result;
  }

  // password validate before changing email or password
  changePassword(old_pass, new_pass) {
    let result = new Promise((resolve, reject) => {
      var change = this.memberModal.ChangeMemberPasswordViaAPI(old_pass, new_pass)
      change.then((res) => {
        if(res.result == 1){
          resolve(res)
        } else {
          resolve({result: 0, data: {title: "", msg: res.error_msg}});
        }
      })
    })
    return result;
  }

  /***********************************************/
  /************** E-Commerce USED ****************/
  /***********************************************/

  getMemberShippingAddress() {
    let result = new Promise((resolve, reject) => {
      resolve(this.memberModal.FetchMemberShippingAddress());
    })
    return result;
  }

  getMemberPointAndCredit() {
    let result = new Promise((resolve, reject) => {
      resolve(this.memberModal.FetchMemberPointAndCredit());
    })
    return result;
  }

}
