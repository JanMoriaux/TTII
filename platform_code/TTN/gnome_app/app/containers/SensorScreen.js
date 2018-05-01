//@flow
import React, { Component } from "react";

//components
import { View, Container, Content, Text, Spinner } from "native-base";
import TabContent from "../components/TabContent";
import SensorValueCardItem from "../components/SensorValueCardItem";
import SensorGraph from "../components/SensorGraph";
import SomethingWrongCard from "../components/SomethingWrongCard";

//actions
import { fetchLatest, fetchHistory } from "../actions/dataActions";

//redux
import { bindActionCreators } from "redux";
import { connect } from "react-redux";

//constants
import * as strings from "../constants/strings";
import sensorValueConstants from "../constants/sensorValueConstants";

//style
import colors from "../styles/colors";
import styles from "../styles/styles";

//functions
import moment from "moment";
import { convertUtcToCetShortDateString } from "../functions/dates";

type Props = {
  type: String
};

type State = {};

class SensorScreen extends Component<Props, State> {
  constructor(props) {
    super(props);
    if (this.props.device) {
      this.props.fetchLatest(this.props.device._id);
      this.props.fetchHistory(this.props.device._id, this.props.from);
    }
  }

  render() {
    let renderSpinner =
      this.props.isFetchingLatest ||
      this.props.isFetchingHistory ||
      this.props.isUpdatingLatest;

    let renderContent =
      !this.props.isFetchingLatest &&
      !this.props.isFetchingHistory &&
      !this.props.isUpdatingLatest &&
      this.props.latest !== null &&
      this.props.latest.length === 1 &&
      this.props.history !== null &&
      this.props.history.length !== 0;

    let renderError =
      !this.props.isFetchingLatest &&
      !this.props.isFetchingHistory &&
      !this.props.isUpdatingLatest &&
      (this.props.latest === null ||
        this.props.latest.length !== 1 ||
        this.props.history === null ||
        this.props.history.length === 0);

    return (
      <Container>
        <Content padder contentContainerStyle={styles.scrollViewCenter}>
          {renderSpinner && this._renderSpinner()}
          {renderContent && this._renderContent()}
          {renderError && this._renderError()}
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

    let title;

    switch (this.props.type) {
      case "temp":
        title = strings.TEMPERATURE_TITLE;
        break;
      case "hum":
        title = strings.HUMIDITY_TITLE;
        break;
      case "soilcap":
        title = strings.SOILCAP_TITLE;
        break;
      case "light":
        title = strings.LIGHT_TITLE;
        break;
      case "air":
        title = strings.AIR_TITLE;
        break;
    }

    let content = this._renderTabContent();

    return (
      <TabContent
        title={title}
        devDesc={devDesc}
        devId={devId}
        lastRecordTime={lastRecordTime}
        content={content}
        detail
        onRefresh={() => {
          this.props.fetchLatest(this.props.device._id);
          this.props.fetchHistory(this.props.device._id, this.props.from);
        }}
      />
    );
  }

  _renderTabContent() {
    return (
      <View>
        {this._renderLatestValueCard()}
        {this._renderHistoryGraph()}
      </View>
    );
  }

  _renderLatestValueCard() {
    let constant = sensorValueConstants.find(
      c => c.recordField === this.props.type
    );
    let fieldName = constant.recordField;
    let value;
    if (this.props.latest && this.props.latest.length > 0)
      value = this.props.latest[0].data[fieldName];
    else {
      value = strings.UNKNOWN;
    }
    return (
      <SensorValueCardItem
        key={1}
        sensorDesc={constant.sensorDesc}
        unit={constant.sensorUnit}
        value={value}
        detail
      />
    );
  }

  _renderHistoryGraph() {
    return <SensorGraph type={this.props.type} />;
  }

  _renderSpinner() {
    return <Spinner color={colors.PRIMARY_COLOR} />;
  }

  _renderError() {
    return (
      <SomethingWrongCard
        title={strings.SOMETHING_WRONG}
        message={strings.NO_DATA_FETCHED}
        onRetry={() => {
          this.props.fetchLatest();
          this.props.fetchHistory();
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
    history: state.DataReducer.history,
    isFetchingLatest: state.DataReducer.isFetchingLatest,
    isFetchingHistory: state.DataReducer.isFetchingHistory,
    isUpdatingLatest: state.DataReducer.isUpdatingLatest,
    from: state.DataReducer.from
  };
};

const mapDispatchToProps = dispatch => {
  return bindActionCreators({ fetchLatest, fetchHistory }, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(SensorScreen);
