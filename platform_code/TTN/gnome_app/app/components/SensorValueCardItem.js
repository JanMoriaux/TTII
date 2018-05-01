import React, { Component } from "react";

//components
import { Card, CardItem, Text, View, H3 } from "native-base";
import { Grid, Col, Row } from "react-native-easy-grid";

//constants
import * as strings from "../constants/strings";

//styles
import styles from "../styles/styles";

const SensorValueCardItem = ({ sensorDesc, value, unit, detail, lastItem }) => {
  return (
    <CardItem bordered style={lastItem ? styles.lastItem : {}}>
      <Grid>
        {!detail && (
          <Row style={styles.subHeaderRow}>
            <Text style={styles.header1}>{sensorDesc}</Text>
          </Row>
        )}
        <Row style={styles.sensorValueRow}>
          <Text>
            <Text style={styles.sensorValueText}>{value}</Text>
            {unit.length > 0 && <Text>{"\t\t"}</Text>}
            <Text style={styles.sensorUnitText}>{unit}</Text>
          </Text>
        </Row>
      </Grid>
    </CardItem>
  );
};

export default SensorValueCardItem;
