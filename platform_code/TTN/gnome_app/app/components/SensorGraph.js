import React, { Component } from "react";

import { View, Button, Text, CardItem, Spinner } from "native-base";

import {
  VictoryChart,
  VictoryZoomContainer,
  VictoryLine,
  VictoryAxis,
  VictoryTheme,
  VictoryScatter
} from "victory-native";
import { Grid, Col, Row } from "react-native-easy-grid";

//redux
import { bindActionCreators } from "redux";
import { connect } from "react-redux";

import moment from "moment";

//dim
import { Dimensions } from "react-native";

//style
import colors from "../styles/colors";
import styles from "../styles/styles";

//constants
import * as strings from "../constants/strings";

//actions
import { fetchHistory } from "../actions/dataActions";

//functions
import { convertToCetString } from "../functions/dates";

//constants
import sensorValueConstants from "../constants/sensorValueConstants";

type Props = {
  type: String
};

type State = {
  windowWidth: number
};

class SensorGraph extends Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      windowWidth: Dimensions.get("window").width
    };
  }

  render() {
    return this._renderChart();
  }

  onLayout(e) {
    const { width, height } = Dimensions.get("window");
    this.setState({
      windowWidth: width
    });
  }

  _renderSpinner() {
    return (
      <View style={{ width: this.state.windowWidth, height: 300 }}>
        <View style={styles.container}>
          <Spinner color={colors.PRIMARY_COLOR} />
        </View>
      </View>
    );
  }

  _renderChart() {
    //determine sensor constants, like name of the sensor, unittype, scaling factor of values
    //min and max expected values of the sensor
    let sensorConstants = sensorValueConstants.find(
      c => c.recordField === this.props.type
    );
    let { sensorDesc, sensorUnit, domain, factor } = sensorConstants;
    sensorUnit =
      sensorUnit !== ""
        ? factor !== 1 ? `(x ${factor} ${sensorUnit})` : `(${sensorUnit})`
        : factor !== 1 ? `(x ${factor})` : ``;

    //get the correct data for the graph, depending on sensor type
    const data = this.props.history.map(d => {
      return {
        time: new Date(convertToCetString(d.time)),
        data: d.data[this.props.type] / factor
      };
    });

    //scatter dot size depends on time scaling
    let size =
      this.props.from === "1d" ? 1 : this.props.from === "1w" ? 0.5 : 0.2;

    return (
      <View onLayout={e => this.onLayout(e)}>
        <CardItem>
          <Text style={styles.header1}>Historical data</Text>
        </CardItem>
        {this.props.isUpdatingHistory ? (
          this._renderSpinner()
        ) : (
          <View style={[styles.container, { marginLeft: 20 }]}>
            <VictoryChart
              //width={this.state.windowWidth}
              width={this.state.windowWidth}
              height={300}
              scale={{ x: "time" }}
              containerComponent={
                <VictoryZoomContainer
                  zoomDimension="x"
                  zoomDomain={this.props.zoomDomain}
                  //onZoomDomainChange={this.handleZoom.bind(this)}
                  allowZoom={false}
                  allowPan={false}
                />
              }
              theme={VictoryTheme.material}
              ref="chart"
              domain={domain}
              onLayout={e => this.onLayoutChart(e)}
            >
              <VictoryAxis
                label={`${sensorDesc} ${sensorUnit}`}
                style={{
                  axis: { stroke: colors.TERNARY_COLOR },
                  axisLabel: {
                    fontSize: 12,
                    stroke: colors.PRIMARY_COLOR,
                    padding: 25,
                    strokeWidth: 0.25
                  },
                  ticks: { stroke: colors.SECONDARY_COLOR },
                  tickLabels: {
                    fontSize: 10,
                    fill: colors.SECONDARY_COLOR,
                    fontWeight: "bold",
                    padding: 2
                  },
                  grid: { stroke: colors.SECONDARY_COLOR, strokeWidth: 0.25 }
                }}
                domain={domain}
                dependentAxis
              />
              <VictoryAxis
                label="Time"
                style={{
                  axis: { stroke: colors.TERNARY_COLOR },
                  axisLabel: {
                    fontSize: 12,
                    stroke: colors.PRIMARY_COLOR,
                    padding: 20,
                    fontWeight: "normal",
                    strokeWidth: 0.25
                  },
                  ticks: { stroke: colors.SECONDARY_COLOR },
                  tickLabels: {
                    fontSize: 10,
                    fill: colors.SECONDARY_COLOR,
                    fontWeight: "bold",
                    padding: 2
                  }
                }}
              />
              {/* <VictoryLine
                style={{
                  data: { stroke: colors.VALUE_COLOR, strokeWidth: 1 }
                }}
                data={data}
                x="time"
                y="data"
              /> */}
              <VictoryScatter
                style={{ data: { fill: colors.PRIMARY_COLOR } }}
                size={size}
                data={data}
                x="time"
                y="data"
                ref="scatter"
              />
            </VictoryChart>
          </View>
        )}
        <CardItem bordered style={styles.lastItem}>
          <Grid>
            <Col>
              <Row>
                <Button
                  small
                  bordered
                  disabled={this.props.from === "1d"}
                  style={
                    this.props.from === "1d"
                      ? styles.zoomButtonDisabled
                      : styles.zoomButton
                  }
                  onPress={() =>
                    this.props.fetchHistory(this.props.devId, "1d")
                  }
                >
                  <Text
                    style={
                      this.props.from === "1d"
                        ? styles.zoomButtonTextDisabled
                        : styles.zoomButtonText
                    }
                  >
                    {strings.DAY}
                  </Text>
                </Button>
              </Row>
            </Col>
            <Col>
              <Row>
                <Button
                  small
                  bordered
                  disabled={this.props.from === "1w"}
                  style={
                    this.props.from === "1w"
                      ? styles.zoomButtonDisabled
                      : styles.zoomButton
                  }
                  onPress={() =>
                    this.props.fetchHistory(this.props.devId, "1w")
                  }
                >
                  <Text
                    style={
                      this.props.from === "1w"
                        ? styles.zoomButtonTextDisabled
                        : styles.zoomButtonText
                    }
                  >
                    {strings.WEEK}
                  </Text>
                </Button>
              </Row>
            </Col>
            <Col>
              <Row>
                <Button
                  small
                  bordered
                  disabled={this.props.from === "1m"}
                  style={
                    this.props.from === "1m"
                      ? styles.zoomButtonDisabled
                      : styles.zoomButton
                  }
                  onPress={() =>
                    this.props.fetchHistory(this.props.devId, "1m")
                  }
                >
                  <Text
                    style={
                      this.props.from === "1m"
                        ? styles.zoomButtonTextDisabled
                        : styles.zoomButtonText
                    }
                  >
                    {strings.MONTH}
                  </Text>
                </Button>
              </Row>
            </Col>
          </Grid>
        </CardItem>
      </View>
    );
  }
}

const mapStateToProps = state => {
  let from = state.DataReducer.from;
  let zoomDomain;
  switch (from) {
    case "1d":
      zoomDomain = { x: [moment().subtract(1, "d"), moment()] };
      break;
    case "1w":
      zoomDomain = { x: [moment().subtract(1, "w"), moment()] };
      break;
    case "1m":
      zoomDomain = { x: [moment().subtract(1, "M"), moment()] };
      break;
    default:
      zoomDomain = { x: [moment().subtract(1, "w"), moment()] };
      break;
  }

  return {
    devId: state.DeviceReducer.devId,
    history: state.DataReducer.history,
    isUpdatingHistory: state.DataReducer.isUpdatingHistory,
    from: from,
    zoomDomain: zoomDomain
  };
};

const mapDispatchToProps = dispatch => {
  return bindActionCreators({ fetchHistory }, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(SensorGraph);
