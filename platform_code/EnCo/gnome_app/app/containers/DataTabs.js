//@flow
import React, { Component } from "react";
import { Alert } from "react-native";

//components
import {
  Container,
  Text,
  Header,
  Tabs,
  Tab,
  ScrollableTab,
  Left,
  Right,
  Body,
  Icon,
  Title,
  Button,
  View
} from "native-base";
import {
  Menu,
  MenuProvider,
  MenuOptions,
  MenuOption,
  MenuTrigger
} from "react-native-popup-menu";

//tab screens
import LatestScreen from "./LatestScreen";
import SensorScreen from "./SensorScreen";

//redux
import { bindActionCreators } from "redux";
import { connect } from "react-redux";

//constants
import * as strings from "../constants/strings";

//style
import colors from "../styles/colors";
import styles from "../styles/styles";

//functions
import { showErrorToast, showInfoToast } from "../functions/toast";

//actions
import { logout } from "../actions/userActions";

type Props = {};

type State = {
  title: String
};

class DataTabs extends Component<Props, State> {
  constructor(props) {
    super(props);

    this._checkLoginState();

    let devDesc;
    if (!this.props.device) {
      this.props.navigation.navigate("ChooseDevice");
      devDesc = strings.NO_DESC;
    } else {
      devDesc =
        this.props.device.name !== ""
          ? this.props.device.name
          : strings.NO_DESC;
    }

    this.state = {
      title: `${devDesc}`
    };
  }

  render() {
    return this._renderTabs();
  }

  componentDidUpdate() {
    if (this.props.error !== null) {
      showErrorToast(this.props.error);
    }
    if (this.props.message !== null) {
      showInfoToast(this.props.message);
    }
  }

  _renderTabs() {
    return (
      <Container>
        <Header hasTabs style={styles.actionbar}>
          <Left>
            <Button transparent onPress={() => this.props.navigation.goBack()}>
              <Icon name="arrow-back" style={styles.title} />
            </Button>
          </Left>
          <Body>
            <Title style={styles.title}>{this.state.title}</Title>
          </Body>
          <Right>{this._renderMenu()}</Right>
        </Header>
        <Tabs renderTabBar={() => <ScrollableTab />}>
          <Tab
            heading="Latest"
            tabStyle={styles.tabStyle}
            textStyle={styles.tabTextStyle}
            activeTabStyle={styles.tabActiveStyle}
            activeTextStyle={styles.tabActiveTextStyle}
          >
            <LatestScreen />
          </Tab>
          <Tab
            heading="Temperature"
            tabStyle={styles.tabStyle}
            textStyle={styles.tabTextStyle}
            activeTabStyle={styles.tabActiveStyle}
            activeTextStyle={styles.tabActiveTextStyle}
          >
            <SensorScreen type="temp" />
          </Tab>
          <Tab
            heading="Air Humidity"
            tabStyle={styles.tabStyle}
            textStyle={styles.tabTextStyle}
            activeTabStyle={styles.tabActiveStyle}
            activeTextStyle={styles.tabActiveTextStyle}
          >
            <SensorScreen type="hum" />
          </Tab>
          <Tab
            heading="Soil Humidity"
            tabStyle={styles.tabStyle}
            textStyle={styles.tabTextStyle}
            activeTabStyle={styles.tabActiveStyle}
            activeTextStyle={styles.tabActiveTextStyle}
          >
            <SensorScreen type="soilcap" />
          </Tab>
          <Tab
            heading="Light Intensity"
            tabStyle={styles.tabStyle}
            textStyle={styles.tabTextStyle}
            activeTabStyle={styles.tabActiveStyle}
            activeTextStyle={styles.tabActiveTextStyle}
          >
            <SensorScreen type="light" />
          </Tab>
          <Tab
            heading="Air Pollution"
            tabStyle={styles.tabStyle}
            textStyle={styles.tabTextStyle}
            activeTabStyle={styles.tabActiveStyle}
            activeTextStyle={styles.tabActiveTextStyle}
          >
            <SensorScreen type="air" />
          </Tab>
        </Tabs>
      </Container>
    );
  }

  _renderMenu() {
    return (
      <Menu>
        <MenuTrigger>
          <Icon name="menu" style={styles.popupMenuIcon} />
        </MenuTrigger>
        <MenuOptions>
          <MenuOption onSelect={() => this._onServerConfigButtonPress()}>
            <Text style={styles.popupMenuText}>{strings.SERVER_SETTINGS}</Text>
          </MenuOption>
          <View style={styles.divider} />
          <MenuOption onSelect={() => this._showLogoutAlert()}>
            <Text style={styles.popupMenuText}>{strings.LOGOUT}</Text>
          </MenuOption>
        </MenuOptions>
      </Menu>
    );
  }

  _showLogoutAlert() {
    Alert.alert(
      strings.LOGOUT,
      strings.LOGOUT_SURE,
      [
        { text: "Cancel", onPress: () => {}, style: "cancel" },
        { text: "OK", onPress: () => this._logout() }
      ],
      { cancelable: false }
    );
  }

  _logout() {
    this.props.logout();
    this.props.navigation.navigate("Login");
  }

  _onServerConfigButtonPress() {
    this.props.navigation.navigate("ServerConfig", {
      previousState: this.props.navigation.state
    });
  }

  _checkLoginState() {
    if (!this.props.apiKey) this.props.navigation.navigate("Login");
  }
}

const mapStateToProps = state => {
  let devId = state.DeviceReducer.devId;
  let device = null;
  if (devId) {
    device = state.DeviceReducer.devices.find(d => d._id === devId);
  }

  return {
    device: device,
    error: state.MessageReducer.error,
    message: state.MessageReducer.message,
    apiKey: state.UserReducer.apiKey
  };
};

const mapDispatchToProps = dispatch => {
  return bindActionCreators({ logout }, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(DataTabs);
