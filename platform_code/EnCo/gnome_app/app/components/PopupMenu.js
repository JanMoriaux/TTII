//https://github.com/GeekyAnts/NativeBase/issues/814
import React from "react";
import {
  View,
  TouchableOpacity,
  UIManager,
  findNodeHandle
} from "react-native";
import { Icon, Button } from "native-base";

//styles
import styles from "../styles/styles";
import colors from "../styles/colors";

//constants
import * as strings from "../constants/strings";

const ICON_SIZE = 30;

class PopupMenu extends React.Component {
  handleMenuPress = () => {
    const { actions, onPress } = this.props;

    UIManager.showPopupMenu(
      findNodeHandle(this.refs.menu),
      actions,
      this.handleShowPopupError,
      onPress
    );
  };

  render() {
    return (
      <View>
        <Button transparent onPress={this.handleMenuPress}>
          <Icon name="menu" style={styles.popupMenuIcon} ref="menu" />
        </Button>
      </View>
    );
  }
}

export default PopupMenu;
