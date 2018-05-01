//@flow
import React, { Component } from "react";

//components
import {
  Container,
  Header,
  Left,
  Right,
  Body,
  Title,
  Content,
  Icon,
  Item,
  Input,
  Label,
  Button,
  Text,
  Thumbnail,
  View,
  Spinner,
  Card,
  CardItem
} from "native-base";
import {
  Menu,
  MenuProvider,
  MenuOptions,
  MenuOption,
  MenuTrigger
} from "react-native-popup-menu";

//styles
import styles from "../styles/styles";
import colors from "../styles/colors";

//resources
import * as strings from "../constants/strings";

//redux
import { bindActionCreators } from "redux";
import { connect } from "react-redux";

//actions
import { authenticate } from "../actions/userActions";

//functions
import { showErrorToast, showInfoToast } from "../functions/toast";

type Props = {};

type State = {
  username: String,
  password: String
};

class LoginScreen extends Component<Props, State> {
  constructor(props) {
    super(props);
    //check for server config: navigate to cnfg screen when absent
    if (!this.props.port || !this.props.address) {
      this.props.navigation.navigate("ServerConfig");
    } else if (this.props.apiKey) {
      //check for apiKey and navigate to Choose device screen if present
      this.props.navigation.navigate("MainFlow");
    }
    this.state = {
      username: "",
      password: ""
    };
  }

  render() {
    return (
      <Container>
        <Header style={styles.actionbar}>
          <Body>
            <Title style={styles.title}>{strings.LOGIN_TITLE}</Title>
          </Body>
          <Right>{this._renderMenu()}</Right>
        </Header>
        <Content padder contentContainerStyle={styles.scrollViewCenter}>
          {this._renderForm()}
        </Content>
      </Container>
    );
  }

  componentDidMount() {}

  componentDidUpdate() {
    if (this.props.error !== null) {
      showErrorToast(this.props.error);
    }
    if (this.props.message !== null) {
      showInfoToast(this.props.message);
    }
  }

  _renderForm() {
    let renderSpinner = this.props.isAuthenticating;

    return (
      <Card>
        <CardItem header>
          <Text style={styles.header1}>{strings.LOGIN_HEADER}</Text>
        </CardItem>
        <View>
          {renderSpinner ? (
            this._renderSpinner()
          ) : (
            <View style={styles.cardForm}>
              <Item floatingLabel last>
                <Label>{strings.USERNAME}</Label>
                <Input
                  onChangeText={value => this.setState({ username: value })}
                  value={this.state.username}
                />
              </Item>
              <Item floatingLabel last>
                <Label>{strings.PASSWORD}</Label>
                <Input
                  onChangeText={value => this.setState({ password: value })}
                  value={this.state.password}
                  secureTextEntry={true}
                />
              </Item>
            </View>
          )}
          <CardItem>
            <Body>
              <Button
                full
                onPress={() => this._onLoginButtonPress()}
                disabled={
                  this.state.username === "" || this.state.password === ""
                }
                style={
                  this.state.username !== "" && this.state.password !== ""
                    ? styles.primaryActionButton
                    : styles.primaryActionButtonDisabled
                }
              >
                <Text style={styles.primaryButtonText}>
                  {strings.LOGIN_TITLE}
                </Text>
              </Button>
            </Body>
          </CardItem>
        </View>
      </Card>
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
          <MenuOption onSelect={() => this._onServerConfigButtonPress()}>
            <Text style={styles.popupMenuText}>{strings.SERVER_SETTINGS}</Text>
          </MenuOption>
        </MenuOptions>
      </Menu>
    );
  }

  _onLoginButtonPress() {
    this.props.authenticate(
      this.state.username,
      this.state.password,
      this.props.navigation
    );
    this.setState({ username: "", password: "" });
  }

  _onServerConfigButtonPress() {
    this.props.navigation.navigate("ServerConfig", {
      previousState: this.props.navigation.state
    });
  }
}

const mapStateToProps = state => {
  return {
    error: state.MessageReducer.error,
    message: state.MessageReducer.message,
    isAuthenticating: state.UserReducer.isAuthenticating,
    apiKey: state.UserReducer.apiKey,
    address: state.ServerReducer.address,
    port: state.ServerReducer.port
  };
};

const mapDispatchToProps = dispatch => {
  return bindActionCreators({ authenticate }, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(LoginScreen);
