import React, { Component } from "react";
import { View, StatusBar } from "react-native";
import AppNavigation from "../../Navigation/AppNavigation";

export default class RootContainer extends Component {
  componentDidMount() {
    // if redux persist is not active fire startup action
    if (!ReduxPersist.active) {
      this.props.startup();
    }
  }

  render() {
    return (
      <AppNavigation />
    );
  }
}

// wraps dispatch to create nicer functions to call within our component
// const mapDispatchToProps = dispatch => ({
//   startup: () => dispatch(StartupActions.startup())
// });

// export default connect(
//   null,
//   mapDispatchToProps
// )(RootContainer);
