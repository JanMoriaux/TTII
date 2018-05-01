//@flow
import React, { Component } from "react";

//components
import { View, Container, Content, Spinner } from "native-base";
import TabContent from "../components/TabContent";
import SensorValueCardItem from "../components/SensorValueCardItem";
import SomethingWrongCard from "../components/SomethingWrongCard";

//actions
import { fetchLatest } from "../actions/dataActions";

//redux
import { bindActionCreators } from "redux";
import { connect } from "react-redux";

//constants
import * as strings from "../constants/strings";
import sensorValueConstants from "../constants/sensorValueConstants";

//style
import colors from "../styles/colors";
import styles from "../styles/styles";

type Props = {};

type State = {};

class LatestScreen extends Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {};
    if (this.props.device) {
      this.props.fetchLatest(this.props.device._id);
    }
  }

  render() {
    let renderContent =
      !this.props.isFetchingLatest &&
      !this.props.isUpdatingLatest &&
      this.props.latest !== null;

    let renderError =
      !this.props.isFetchingLatest &&
      !this.props.isUpdatingLatest &&
      this.props.latest === null;
      
    let renderSpinner =
      this.props.isFetchingLatest || this.props.isUpdatingLatest;

    return (
      <Container>
        <Content padder contentContainerStyle={styles.scrollViewCenter}>
          {renderSpinner && this._renderSpinner()}
          {renderContent && this._renderContent()}
          {renderError && this._renderErrorCard()}
        </Content>
      </Container>
    );
  }

  _renderContent() {
    let device = this.props.device;
    let latest = this.props.latest;

    let devDesc =
      device.description !== "" ? device.description : strings.NO_DESC;
    let devId = device._id;

    let lastRecordTime;
    if (this.props.latest && this.props.latest.length > 0) {
      lastRecordTime = this.props.latest[0].time;
    } else {
      lastRecordTime = strings.UNKNOWN;
    }

    let title = strings.LATEST_RECORD_TITLE;

    let content = this._renderSensorValueCards();

    return (
      <TabContent
        title={title}
        devDesc={devDesc}
        devId={devId}
        lastRecordTime={lastRecordTime}
        content={content}
        onRefresh={() => this.props.fetchLatest(this.props.device._id)}
      />
    );
  }

  _renderSensorValueCards() {
    let cards = [];

    for (let i = 0; i < sensorValueConstants.length; i++) {
      let constant = sensorValueConstants[i];
      let fieldName = constant.recordField;
      let value;
      if (
        this.props.latest &&
        this.props.latest.length > 0 &&
        this.props.latest[0].data
      ) {
        value = this.props.latest[0].data[fieldName];
      } else {
        value = strings.UNKNOWN;
      }
      cards.push(
        <SensorValueCardItem
          key={i}
          sensorDesc={constant.sensorDesc}
          unit={constant.sensorUnit}
          value={value}
          lastItem={i === sensorValueConstants.length - 1}
        />
      );
    }
    return <View>{cards}</View>;
  }

  _renderSpinner() {
    return <Spinner color={colors.PRIMARY_COLOR} />;
  }

  _renderErrorCard() {
    return (
      <SomethingWrongCard
        title={strings.SOMETHING_WRONG}
        message={strings.NO_DATA_FETCHED}
        onRetry={() => {
          this.props.fetchLatest();
        }}
      />
    );
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
    latest: state.DataReducer.latest,
    isFetchingLatest: state.DataReducer.isFetchingLatest,
    isUpdatingLatest: state.DataReducer.isUpdatingLatest
  };
};

const mapDispatchToProps = dispatch => {
  return bindActionCreators({ fetchLatest }, dispatch);
};
export default connect(mapStateToProps, mapDispatchToProps)(LatestScreen);
