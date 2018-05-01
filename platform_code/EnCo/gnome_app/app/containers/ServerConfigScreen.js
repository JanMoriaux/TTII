//@flow
import React, { Component } from "react";

//components
import { Alert, BackHandler } from "react-native";
import {
  Container,
  Header,
  Left,
  Right,
  Body,
  Title,
  Content,
  Item,
  Input,
  Label,
  Button,
  Text,
  View,
  Card,
  CardItem,
  Icon,
  Spinner
} from "native-base";
import {
  Menu,
  MenuProvider,
  MenuOptions,
  MenuOption,
  MenuTrigger
} from "react-native-popup-menu";
import { Grid, Col, Row } from "react-native-easy-grid";

//styles
import styles from "../styles/styles";
import colors from "../styles/colors";

//resources
import * as strings from "../constants/strings";

//redux
import { bindActionCreators } from "redux";
import { connect } from "react-redux";

//actions
import { setConfiguration } from "../actions/serverActions";
import { logout } from "../actions/userActions";

//functions
import { showErrorToast, showInfoToast } from "../functions/toast";
import { fetchWrapper } from "../functions/fetch";

type Props = {};

type State = {
  address: String,
  port: String,
  isTesting: boolean
};

class ServerConfigScreen extends Component<Props, State> {
  constructor(props) {
    super(props);

    const { params } = this.props.navigation.state;
    this.previousRouteName = params ? params.previousState.routeName : null;

    this.state = {
      address: "",
      port: "",
      isTesting: false
    };
  }

  render() {
    let showBackButton = this.previousRouteName !== null;

    return (
      <Container>
        <Header style={styles.actionbar}>
          {showBackButton && (
            <Left>
              <Button
                transparent
                onPress={() =>
                  this.props.navigation.navigate(this.previousRouteName)
                }
              >
                <Icon name="arrow-back" style={styles.title} />
              </Button>
            </Left>
          )}
          <Body>
            <Title style={styles.title}>{strings.SERVER_TITLE}</Title>
          </Body>
          <Right>{this.props.apiKey && this._renderMenu()}</Right>
        </Header>
        <Content padder contentContainerStyle={styles.scrollViewCenter}>
          <Card>
            {this._renderConfig()}
            {this._renderForm()}
          </Card>
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

  componentDidMount() {
    BackHandler.addEventListener(
      "hardwareBackPress",
      this._onBackButtonPressAndroid
    );
  }

  componentWillUnmount() {
    BackHandler.removeEventListener(
      "hardwareBackPress",
      this._onBackButtonPressAndroid
    );
  }

  _onBackButtonPressAndroid = () => {
    if (this.previousRouteName) {
      this.props.navigation.navigate(this.previousRouteName);
      return true;
    } else {
      return false;
    }
  };

  _renderConfig() {
    let address =
      this.props.address !== null ? this.props.address : strings.NOT_SET;
    let port = this.props.port !== null ? this.props.port : strings.NOT_SET;

    return (
      <View>
        <CardItem header>
          <Text style={styles.header1}>{strings.CURRENT_CONFIG}</Text>
        </CardItem>
        <CardItem bordered>
          <Grid>
            <Row style={styles.gridLabelRow}>
              <Text style={styles.label}>{strings.ADDRESS_LABEL}</Text>
            </Row>
            <Row style={styles.gridValueRow}>
              <Text style={styles.value}>{address}</Text>
            </Row>
            <Row style={styles.gridLabelRow}>
              <Text style={styles.label}>{strings.PORT_LABEL}</Text>
            </Row>
            <Row style={styles.gridValueRow}>
              <Text style={styles.value}>{port}</Text>
            </Row>
          </Grid>
        </CardItem>
      </View>
    );
  }

  _renderForm() {
    let disabled = this.state.address === "" || this.state.port === "";
    let isTesting = this.state.isTesting;
    let canCancel = this.previousRouteName !== null;

    return (
      <View>
        <CardItem header>
          <Text style={styles.header1}>{strings.SERVER_HEADER}</Text>
        </CardItem>
        <View>
          <View style={styles.cardForm}>
            <Item floatingLabel last>
              <Label>{strings.ADDRESS}</Label>
              <Input
                onChangeText={value => this.setState({ address: value })}
                value={this.state.address}
              />
            </Item>
            <Item floatingLabel last>
              <Label>{strings.PORT}</Label>
              <Input
                onChangeText={value => this.setState({ port: value })}
                value={this.state.port}
              />
            </Item>
          </View>
          <CardItem>
            <Body>
              <Button
                full
                onPress={() => this._showConfigAlert()}
                disabled={disabled}
                style={
                  disabled
                    ? styles.primaryActionButtonDisabled
                    : styles.primaryActionButton
                }
              >
                <Text style={styles.primaryButtonText}>
                  {strings.UPDATE_CONFIG}
                </Text>
              </Button>
            </Body>
          </CardItem>
          <CardItem footer>
            <Grid>
              <Col>
                {canCancel && (
                  <Button
                    transparent
                    full
                    small
                    onPress={() => {
                      this.props.navigation.navigate(this.previousRouteName);
                    }}
                  >
                    <Text style={styles.smallButtonText}>{strings.CANCEL}</Text>
                  </Button>
                )}
              </Col>
              <Col>
                {!disabled && (
                  <Button
                    transparent
                    full
                    small
                    onPress={() => {
                      isTesting ? console.log() : this._onTestButtonPress();
                    }}
                  >
                    {isTesting ? (
                      <Spinner color={colors.PRIMARY_COLOR} />
                    ) : (
                      <Text style={styles.smallButtonText}>
                        {strings.TEST_CONNECTION}
                      </Text>
                    )}
                  </Button>
                )}
              </Col>
            </Grid>
          </CardItem>
        </View>
      </View>
    );
  }

  _renderSpinner() {
    return <Spinner color={colors.PRIMARY_COLOR} />;
  }

  _renderMenu() {
    return (
      <Menu>
        <MenuTrigger>
          <Icon name="menu" style={styles.popupMenuIcon} />
        </MenuTrigger>
        <MenuOptions>
          <MenuOption onSelect={() => this._showLogoutAlert()}>
            <Text style={styles.popupMenuText}>{strings.LOGOUT}</Text>
          </MenuOption>
        </MenuOptions>
      </Menu>
    );
  }

  _showConfigAlert() {
    let message = `${this.state.address}:${this.state.port}`;

    Alert.alert(
      strings.ALERT_TITLE,
      message,
      [
        { text: strings.CANCEL, onPress: () => {}, style: "cancel" },
        { text: strings.OK, onPress: () => this._onAlertConfirmation() }
      ],
      { cancelable: false }
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

  _onTestButtonPress() {
    let url = `http://${this.state.address}:${this.state.port}/test`;
    this.setState({ isTesting: true });

    return fetchWrapper(10000, fetch(url))
      .then(response => {
        this.setState({ isTesting: false });
        if (response.status === 200) {
          showInfoToast(strings.CONNECTION_SUCCESSFUL);
        } else {
          showErrorToast(strings.CONNECTION_ERROR);
        }
      })
      .catch(error => {
        this.setState({ isTesting: false });
        console.log(error);
        showErrorToast(strings.NETWORK_ERROR);
      });
  }

  _onAlertConfirmation() {
    let config = { address: this.state.address, port: this.state.port };
    this.props.setConfiguration(config);
    this.setState({ address: "", port: "" });
    this.props.navigation.navigate(
      this.previousRouteName ? this.previousRouteName : "Login"
    );
  }
}

const mapStateToProps = state => {
  return {
    error: state.MessageReducer.error,
    message: state.MessageReducer.message,
    address: state.ServerReducer.address,
    port: state.ServerReducer.port,
    apiKey: state.UserReducer.apiKey
  };
};

const mapDispatchToProps = dispatch => {
  return bindActionCreators({ setConfiguration, logout }, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(ServerConfigScreen);
