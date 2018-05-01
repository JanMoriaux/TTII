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
import {
  convertUtcToCetShortDateString,
  convertUtcToCetTimeString,
  convertUtcToCetDateString
} from "../functions/dates";

type Props = {
  type: String
};

type State = {};

class SensorScreen extends Component<Props, State> {
  constructor(props) {
    super(props);
    if (this.props.device) {
      this._updateValues();
    }
  }

  render() {
    let isFetchingLatest = this.props.isFetchingLatest[`${this.props.type}`];
    let isFetchingHistory = this.props.isFetchingHistory[`${this.props.type}`];
    let isUpdatingLatest = this.props.isUpdatingLatest[`${this.props.type}`];

    let renderSpinner =
      isFetchingLatest || isUpdatingLatest || isFetchingHistory;

    let renderContent =
      !isFetchingLatest &&
      !isUpdatingLatest &&
      !isFetchingHistory &&
      this.props.latest[`${this.props.type}`].length > 0;

    let renderError =
      !isFetchingLatest &&
      !isFetchingHistory &&
      !isUpdatingLatest &&
      (this.props.latest[`${this.props.type}`].length === 0 ||
        this.props.history[`${this.props.type}`].length === 0);

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

    let devDesc = device.name !== "" ? device.name : strings.NO_DESC;
    let devId = device._id;

    let lastRecordTime;
    if (
      this.props.latest[`${this.props.type}`] &&
      this.props.latest[`${this.props.type}`].length > 0
    ) {
      lastRecordTime = this.props.latest[`${this.props.type}`][0].time;
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
          this._updateValues();
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
    let date;
    let time;
    if (
      this.props.latest[`${fieldName}`] &&
      this.props.latest[`${fieldName}`].length > 0
    ) {
      value = this.props.latest[`${fieldName}`][0].value;
      value = value % 1 !== 0 ? value.toFixed(2) : value;
      let recordTime = moment(this.props.latest[`${fieldName}`][0].time);
      time = convertUtcToCetTimeString(recordTime);
      date = convertUtcToCetDateString(recordTime);
    } else {
      value = strings.UNKNOWN;
    }
    return (
      <SensorValueCardItem
        key={1}
        sensorDesc={constant.sensorDesc}
        unit={constant.sensorUnit}
        value={value}
        detail
        time={time}
        date={date}
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
          this._updateValues();
        }}
      />
    );
  }

  _updateValues() {
    this._updateLatest();
    this._updateHistory();
  }

  _updateLatest() {
    this.props.fetchLatest(this.props.device._id, this.props.type);
  }

  _updateHistory() {
    this.props.fetchHistory(
      this.props.device._id,
      this.props.from,
      this.props.type
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
