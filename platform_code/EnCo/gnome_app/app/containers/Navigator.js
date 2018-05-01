//navigation
import {
  StackNavigator,
  SwitchNavigator,
  TabNavigator
} from "react-navigation";

//screens
import LoadingScreen from "./LoadingScreen";
import LoginScreen from "./LoginScreen";
import ChooseDeviceScreen from "./ChooseDeviceScreen";
import Server from "../containers/ServerConfigScreen";
import DataTabs from "./DataTabs";

//redux store
import { Store } from "../store/store";
import ServerConfigScreen from "../containers/ServerConfigScreen";

const deviceStack = StackNavigator(
  {
    ChooseDevice: {
      screen: ChooseDeviceScreen
    },
    DataTabs: {
      screen: DataTabs
    }
  },
  {
    initialRouteName: "ChooseDevice",
    headerMode: "none"
  }
);

const mainStack = SwitchNavigator(
  {
    Login: {
      screen: LoginScreen
    },
    MainFlow: {
      screen: deviceStack
    },
    ServerConfig: {
      screen: ServerConfigScreen
    }
  },
  {
    initialRouteName: "Login",
    headerMode: "none"
  }
);

const Navigator = SwitchNavigator(
  {
    Loading: {
      screen: LoadingScreen
    },
    App: {
      screen: mainStack
    }
  },
  {
    initialRouteName: "Loading",
    headerMode: "none"
  }
);

export default Navigator;
