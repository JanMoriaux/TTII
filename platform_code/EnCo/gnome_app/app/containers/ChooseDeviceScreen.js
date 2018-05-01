//@flow
import React, { Component } from "react";
import { Platform, Alert } from "react-native";
import { Col, Row, Grid } from "react-native-easy-grid";

//components
import {
  Container,
  Content,
  Text,
  Header,
  Left,
  Body,
  Title,
  Button,
  Form,
  Thumbnail,
  Picker,
  Card,
  CardItem,
  View,
  Icon,
  Right,
  Spinner,
  Item
} from "native-base";
import SomethingWrongCard from "../components/SomethingWrongCard";
import {
  Menu,
  MenuProvider,
  MenuOptions,
  MenuOption,
  MenuTrigger
} from "react-native-popup-menu";

//redux
import { bindActionCreators } from "redux";
import { connect } from "react-redux";

//actions
import { fetchDevices, setDevice } from "../actions/deviceActions";
import { logout } from "../actions/userActions";

//functions
import { showErrorToast, showInfoToast } from "../functions/toast";
import { toStringWithDecimals } from "../functions/number";

//constants
import * as strings from "../constants/strings";

//style
import colors from "../styles/colors";
import styles from "../styles/styles";

type Props = {};

type State = {
  devId: string
};

class ChooseDeviceScreen extends Component<Props, State> {
  constructor(props) {
    super(props);
    this._checkLoginState();
    this.props.fetchDevices();
    this.state = {
      devId: ""
    };
  }

  render() {
    let renderSpinner = this.props.isFetching;
    let renderForm =
      !this.props.isFetching &&
      this.props.devices !== null &&
      this.props.devices.length > 0;
    let renderError = !this.props.isFetching && this.props.devices === null;

    return (
      <Container>
        <Header style={styles.actionbar}>
          <Body>
            <Title style={styles.title}>{strings.CHOOSE_DEVICE}</Title>
          </Body>
          <Right>{this._renderMenu()}</Right>
        </Header>
        <Content padder contentContainerStyle={styles.scrollViewCenter}>
          {renderSpinner && this._renderSpinner()}
          {renderForm && this._renderForm()}
          {renderError && this._renderError()}
        </Content>
      </Container>
    );
  }

  componentDidUpdate() {
    if (this.props.error !== null) {
      showErrorToast(this.props.error);
    }
    if (this.props.message !== null) {
      showInfoToast(this.props.message);
    }
  }

  _renderForm() {
    return (
      <Card>
        <CardItem header>
          <Text style={styles.header1}>{strings.CHOOSE_DEVICE_FROM_LIST}</Text>
        </CardItem>
        <View style={styles.cardView}>{this._renderPicker()}</View>
        <CardItem bordered />
        {this.state.devId !== "" && this._renderDeviceInfo()}
      </Card>
    );
  }

  _renderPicker = Platform.select({
    android: () => {
      return (
        <Picker
          selectedValue={this.state.devId}
          onValueChange={value => this._onPickerValueChange(value)}
        >
          <Item label={strings.CHOOSE} value="" key="" />
          {this.props.devices.map((device, key) => (
            <Item
              label={`${device._id} (${device.name})`}
              value={device._id}
              key={device._id}
            />
          ))}
        </Picker>
      );
    },
    ios: () => {
      return (
        <Picker
          placeholder={strings.CHOOSE}
          selectedValue={this.state.devId}
          onValueChange={this._onPickerValueChange}
        >
          {this.props.events.map((device, key) => (
            <Item
              label={`${device._id} (${device.name})`}
              value={device._id}
              key={device._id}
            />
          ))}
        </Picker>
      );
    }
  });

  _renderDeviceInfo() {
    let device = this.props.devices.find(d => d._id === this.state.devId);
    //fields to display
    let id = device._id;
    let lastLocation = device.lastLocation;
    let lat = lastLocation ? lastLocation.latitude.toFixed(4) : strings.UNKNOWN;
    let long = lastLocation
      ? lastLocation.longitude.toFixed(4)
      : strings.UNKNOWN;
    let deviceType = device.deviceType;
    let networkType = device.networkType;
    let tags = device.tags ? device.tags.join() : strings.NONE;

    return (
      <View>
        <CardItem header>
          <Text style={styles.header1}>
            {device.name !== "" ? device.name : strings.NO_DESC}
          </Text>
        </CardItem>
        <CardItem>
          <Grid>
            <Row style={styles.gridLabelRow}>
              <Text style={styles.label}>{strings.ID_LABEL}</Text>
            </Row>
            <Row style={styles.gridValueRow}>
              <Text style={styles.value}>{device._id}</Text>
            </Row>
            <Row style={styles.gridLabelRow}>
              <Text style={styles.label}>{strings.LATITUDE_LABEL}</Text>
            </Row>
            <Row style={styles.gridValueRow}>
              <Text style={styles.value}>{lat}</Text>
            </Row>
            <Row style={styles.gridLabelRow}>
              <Text style={styles.label}>{strings.LONGITUDE_LABEL}</Text>
            </Row>
            <Row style={styles.gridValueRow}>
              <Text style={styles.value}>{long}</Text>
            </Row>
            <Row style={styles.gridLabelRow}>
              <Text style={styles.label}>{strings.DEVICETYPE_LABEL}</Text>
            </Row>
            <Row style={styles.gridValueRow}>
              <Text style={styles.value}>{deviceType}</Text>
            </Row>
            <Row style={styles.gridLabelRow}>
              <Text style={styles.label}>{strings.NETWORKTYPE_LABEL}</Text>
            </Row>
            <Row style={styles.gridValueRow}>
              <Text style={styles.value}>{networkType}</Text>
            </Row>
            <Row style={styles.gridLabelRow}>
              <Text style={styles.label}>{strings.TAGS_LABEL}</Text>
            </Row>
            <Row style={styles.gridValueRow}>
              <Text style={styles.value}>{tags}</Text>
            </Row>
          </Grid>
        </CardItem>
        <CardItem bordered>
          <Body>
            <Button
              full
              style={styles.primaryActionButton}
              onPress={() => this._onPickDeviceButtonPress()}
            >
              <Text style={styles.primaryButtonText}>{strings.VIEW_DATA}</Text>
            </Button>
          </Body>
        </CardItem>
      </View>
    );
  }

  _renderSpinner() {
    return <Spinner color={colors.PRIMARY_COLOR} />;
  }

  _renderError() {
    return (
      <SomethingWrongCard
        title={strings.SOMETHING_WRONG}
        message={strings.NO_DEVICES_FETCHED}
        onRetry={() => this.props.fetchDevices()}
      />
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

  _onPickerValueChange(value) {
    this.setState({
      devId: value
    });
  }

  _onPickDeviceButtonPress() {
    this.props.setDevice(this.state.devId);
    this.props.navigation.navigate("DataTabs");
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
  return {
    message: state.MessageReducer.message,
    error: state.MessageReducer.error,
    devices: state.DeviceReducer.devices,
    devId: state.DeviceReducer.devId,
    isFetching: state.DeviceReducer.isFetching,
    apiKey: state.UserReducer.apiKey
  };
};

const mapDispatchToProps = dispatch => {
  return bindActionCreators({ fetchDevices, setDevice, logout }, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(ChooseDeviceScreen);
