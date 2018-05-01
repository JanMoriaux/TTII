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

//libs
var moment = require("moment-timezone");

//functions
import {
  convertUtcToCetTimeString,
  convertUtcToCetDateString
} from "../functions/dates";

type Props = {};

type State = {};

class LatestScreen extends Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {};
    if (this.props.device) {
      this._updateLatestValues();
    }
  }

  render() {
    let isFetchingLatest = false;
    let isUpdatingLatest = false;

    for (let prop in this.props.isFetchingLatest) {
      if (this.props.isFetchingLatest[prop]) isFetchingLatest = true;
    }
    for (let prop in this.props.isUpdatingLatest) {
      if (this.props.isUpdatingLatest[prop]) isUpdatingLatest = true;
    }

    let renderContent =
      !isFetchingLatest &&
      !isUpdatingLatest &&
      this.props.latest["temp"].length > 0 &&
      this.props.latest["hum"].length > 0 &&
      this.props.latest["soilcap"].length > 0 &&
      this.props.latest["air"].length > 0 &&
      this.props.latest["light"].length > 0;

    let renderError =
      !isFetchingLatest &&
      !isUpdatingLatest &&
      (this.props.latest["temp"].length === 0 &&
        this.props.latest["hum"].length === 0 &&
        this.props.latest["soilcap"].length === 0 &&
        this.props.latest["air"].length === 0 &&
        this.props.latest["light"].length === 0);

    let renderSpinner = isFetchingLatest || isUpdatingLatest;

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

    let devDesc = device.name !== "" ? device.name : strings.NO_DESC;
    let devId = device._id;

    let lastRecordTime = moment.unix(0);
    if (this.props.latest) {
      for (let prop in this.props.latest) {
        if (
          this.props.latest[prop].length > 0 &&
          this.props.latest[prop][0].time
        ) {
          let time = this.props.latest[prop][0].time;
          if (moment(time).isAfter(lastRecordTime)) {
            lastRecordTime = moment(time);
          }
        }
      }
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
        onRefresh={() => this._updateLatestValues()}
      />
    );
  }

  _renderSensorValueCards() {
    let cards = [];

    for (let i = 0; i < sensorValueConstants.length; i++) {
      let constant = sensorValueConstants[i];
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
        time = strings.UNKNOWN;
        date = strings.UNKNOWN;
      }
      cards.push(
        <SensorValueCardItem
          key={i}
          sensorDesc={constant.sensorDesc}
          unit={constant.sensorUnit}
          value={value}
          lastItem={i === sensorValueConstants.length - 1}
          time={time}
          date={date}
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

  _updateLatestValues() {
    for (let constant of sensorValueConstants) {
      this.props.fetchLatest(this.props.device._id, constant.recordField);
    }
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
    isUpdatingLatest: state.DataReducer.isUpdatingLatest,
  };
};

const mapDispatchToProps = dispatch => {
  return bindActionCreators({ fetchLatest }, dispatch);
};
export default connect(mapStateToProps, mapDispatchToProps)(LatestScreen);
