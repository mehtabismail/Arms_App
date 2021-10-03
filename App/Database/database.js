import React, { Component } from 'react';
import SQLiteStorage from 'react-native-sqlite-storage';
import AppConfig from '../Config/AppConfig';

export default class Database extends Component {
  constructor(props){
    super(props);
    this.db = "";
    this.open();
  }

  open() {
    this.db = SQLiteStorage.openDatabase({ name: AppConfig.db_name, createFromLocation: `~${AppConfig.db_name}` },
      () => {
        // alert(`DB Open`);
      },
      (err) => {
        alert(`DB Open: ${JSON.stringify(err)}`);
      });
  }

  close() {
    if (this.db) {
      this.db.close();
      // alert("SQLiteStorage closed");
    } else {
      alert("SQLiteStorage not open");
    }
  }

  /** Functions of indicate open database status **/
  successCB(msg) {
    console.log(msg);
    // alert(msg);
  }

  errorCB(name, err) {
    console.log("SQLiteStorage " + name);
    alert(`${name}: ${JSON.stringify(err) || err}`);
    // alert(`${name}: ${err}`);
  }
  /** END of Functions of indicate open database status **/
}