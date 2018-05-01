//@flow
import React, { Component } from "react";

//components
import { Container, Content, Text, Spinner } from "native-base";

//redux
import { bindActionCreators } from "redux";
import { connect } from "react-redux";

//styles
import colors from "../styles/colors";
import styles from "../styles/styles";

//constants
import * as strings from "../constants/strings";

type Props = {};

type State = {};

class LoadingScreen extends Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <Container style={styles.loadingContainer}>
        <Content
          style={styles.loadingContainer}
          contentContainerStyle={[
            styles.loadingContent,
            styles.loadingContainer
          ]}
        >
          <Text style={styles.loadingTitle}>{strings.APP_TITLE}</Text>
          <Spinner
            color={colors.TITLE_COLOR}
            style={{ alignSelf: "center" }}
            large
          />
        </Content>
      </Container>
    );
  }

  componentDidMount() {
    if (this.props.navigation) {
      const { navigate } = this.props.navigation;
      setTimeout(() => {
        navigate("App");
      }, 3000);
    }
  }
}

const mapStateToProps = state => {
  return {};
};

const mapDispatchToProps = dispatch => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(LoadingScreen);
