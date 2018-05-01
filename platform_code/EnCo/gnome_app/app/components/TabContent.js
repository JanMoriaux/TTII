import React, { Component } from "react";

//components
import {
  Card,
  CardItem,
  Text,
  View,
  Right,
  Button,
  Icon,
  Body
} from "native-base";
import { Grid, Col, Row } from "react-native-easy-grid";

//constants
import * as strings from "../constants/strings";

//styles
import styles from "../styles/styles";

//functions
import {
  convertUtcToCetTimeString,
  convertUtcToCetDateString
} from "../functions/dates";

const TabContent = ({
  title,
  devDesc,
  devId,
  lastRecordTime,
  content,
  detail,
  onRefresh
}) => {
  if (devDesc === null || devDesc === "") devDesc = strings.NO_DESC;

  if (devId === null || devId === "") devId = strings.UNKNOWN;

  let date;
  let time;

  if (lastRecordTime === null || lastRecordTime === "")
    date = time = strings.UNKNOWN;
  else {
    date = convertUtcToCetDateString(lastRecordTime);
    time = convertUtcToCetTimeString(lastRecordTime);
  }

  return (
    <Card>
      <CardItem header>
        <Grid>
          <Col size={85}>
            <Row style={styles.gridLabelRow}>
              <Text
                style={[styles.header1, { fontWeight: "normal" }]}
              >{`${title}`}</Text>
            </Row>
            <Row style={styles.gridLabelRow}>
              <Text
                style={[styles.header1, { fontWeight: "bold" }]}
              >{`${devDesc} (${devId})`}</Text>
            </Row>
          </Col>
          <Col size={15}>
            <Row style={styles.gridValueRow}>
              <Button iconLeft transparent onPress={onRefresh}>
                <Icon name="refresh" style={styles.refreshIcon} />
              </Button>
            </Row>
          </Col>
        </Grid>
      </CardItem>
      <CardItem />
      <CardItem bordered={!detail}>
        <Grid>
          <Row style={styles.subHeaderRow}>
            <Text style={styles.header1}>{strings.LATEST_RECORD_SUBTITLE}</Text>
          </Row>
          {!detail && (
            <View>
              <Row style={styles.gridLabelRow}>
                <Text style={styles.label}>{strings.DATE_LABEL}</Text>
              </Row>
              <Row style={styles.gridValueRow}>
                <Text style={styles.value}>{date}</Text>
              </Row>
              <Row style={styles.gridLabelRow}>
                <Text style={styles.label}>{strings.TIME_LABEL}</Text>
              </Row>
              <Row style={styles.gridValueRow}>
                <Text style={styles.value}>{time}</Text>
              </Row>
            </View>
          )}
        </Grid>
      </CardItem>
      {content}
    </Card>
  );
};

export default TabContent;
