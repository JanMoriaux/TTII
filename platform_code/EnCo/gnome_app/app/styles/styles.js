import React from "react";
import { StyleSheet, Platform } from "react-native";

import colors from "./colors";

const BIG = 18;
const NORMAL = 16;
const SMALL = 12;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  label: {
    color: colors.LABEL_COLOR,
    fontSize: NORMAL
  },
  value: {
    fontSize: NORMAL,
    color: colors.VALUE_COLOR,
    ...Platform.select({
      ios: {
        fontFamily: "Courier New"
      },
      android: {
        fontFamily: "monospace"
      }
    })
  },
  primaryActionButton: {
    backgroundColor: colors.PRIMARY_COLOR
  },
  primaryActionButtonDisabled: {},
  primaryButtonText: {
    color: colors.TITLE_COLOR
  },
  smallButtonText: {
    fontSize: 12,
    color: colors.SECONDARY_COLOR
  },
  refreshIcon: {
    color: colors.PRIMARY_COLOR,
    fontSize: 25
  },

  scrollViewCenter: {
    flexGrow: 1,
    justifyContent: "center"
  },
  //Actionbar
  actionbar: {
    backgroundColor: colors.PRIMARY_COLOR
  },
  title: {
    color: colors.TITLE_COLOR
  },

  //SensorValueCard
  sensorValueText: {
    fontSize: 30,
    color: colors.VALUE_COLOR,
    ...Platform.select({
      ios: {
        fontFamily: "Courier New"
      },
      android: {
        fontFamily: "monospace"
      }
    })
  },
  sensorUnitText: {
    fontSize: 20,
    color: colors.LABEL_COLOR
  },
  sensorValueRow: {
    justifyContent: "flex-end"
  },
  //Cards
  header1: {
    fontSize: BIG,
    color: colors.SECONDARY_COLOR
  },
  header2: {
    fontSize: NORMAL,
    color: colors.SECONDARY_COLOR
  },
  subHeaderRow: {
    marginBottom: 10
  },
  cardView: {
    padding: 10
  },
  lastItem: {
    marginBottom: 20
  },
  cardForm: {
    paddingLeft: 15,
    paddingRight: 15,
    marginBottom: 20
  },
  //graph
  zoomButton: {
    borderColor: colors.PRIMARY_COLOR,
    flex: 1,
    marginHorizontal: 5,
    justifyContent: "center"
  },
  zoomButtonDisabled: {
    flex: 1,
    marginHorizontal: 5,
    justifyContent: "center"
  },
  zoomButtonText: {
    textAlign: "center",
    color: colors.PRIMARY_COLOR
  },
  zoomButtonTextDisabled: {
    textAlign: "center"
  },
  //Grid
  labelColumn: {
    marginRight: 10
  },
  gridValueRow: {
    justifyContent: "flex-start",
    marginBottom: 5
  },
  gridLabelRow: {
    //marginBottom: 3
  },
  //Tabs
  tabStyle: {
    backgroundColor: colors.PRIMARY_COLOR
  },
  tabActiveStyle: {
    backgroundColor: colors.VALUE_COLOR
  },
  tabTextStyle: {
    color: colors.TITLE_COLOR
  },
  tabActiveTextStyle: {
    color: colors.TITLE_COLOR,
    fontWeight: "bold"
  },
  //misc
  error: {
    color: "red"
  },
  //loadingScreen
  loadingContainer: {
    backgroundColor: colors.PRIMARY_COLOR
  },
  loadingContent: {
    flex: 1,
    justifyContent: "center"
  },
  loadingTitle: {
    fontSize: 30,
    color: colors.TITLE_COLOR,
    ...Platform.select({
      ios: {
        fontFamily: "Courier New"
      },
      android: {
        fontFamily: "monospace"
      }
    }),
    alignSelf: "center"
  },
  //popupmenu
  popupMenuIcon: {
    fontSize: 30,
    color: colors.TITLE_COLOR
  },
  popupMenuText: {
    fontSize: 16,
    color: colors.SECONDARY_COLOR,
    marginBottom: 5
  },
  divider: {
    marginVertical: 5,
    marginHorizontal: 2,
    borderBottomWidth: 1,
    borderColor: "#ccc"
  }
});

export default styles;
