import React, { Component } from "react";

//components
import { Card, CardItem, Text, Body, Button } from "native-base";

//constants
import * as strings from "../constants/strings";

//styles
import styles from "../styles/styles";

const SomethingWrongCard = ({ title, message, onRetry }) => {
  return (
    <Card>
      <CardItem header>
        <Text>{title}</Text>
      </CardItem>
      <CardItem>
        <Text>{message}</Text>
      </CardItem>
      <CardItem bordered>
        <Body>
          <Button
            full
            style={styles.primaryActionButton}
            onPress={() => onRetry()}
          >
            <Text style={styles.primaryButtonText}>{strings.RETRY}</Text>
          </Button>
        </Body>
      </CardItem>
    </Card>
  );
};

export default SomethingWrongCard;
