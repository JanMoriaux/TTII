//@flow
//components
import React, { Component } from "react";

//redux and redux-persist
import { Provider, connect } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { Store, Persistor } from "./store/store";

//containers
import LoadingScreen from "./containers/LoadingScreen";
import Navigator from "./containers/Navigator";
import { Root } from "native-base";
import { MenuProvider } from "react-native-popup-menu";

//actions
import { fetchDevices } from "./actions/deviceActions";

type Props = {};
type State = {};

import { YellowBox } from "react-native";

YellowBox.ignoreWarnings([
  "Warning: componentWillMount is deprecated",
  "Warning: componentWillReceiveProps is deprecated",
  "Warning: componentWillUpdate is deprecated"
]);

export default class App extends Component {
  render() {
    //Persistor.purge();
    return (
      <Provider store={Store}>
        <PersistGate loading={<LoadingScreen />} persistor={Persistor}>
          <Root>
            <MenuProvider>
              <Navigator />
            </MenuProvider>
          </Root>
        </PersistGate>
      </Provider>
    );
  }

  _onBeforeLift = () => {
    setTimeout(function() {}, 3 * 1000);
  };
}
