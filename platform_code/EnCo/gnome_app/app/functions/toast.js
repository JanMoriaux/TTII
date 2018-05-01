import Toast from "react-native-root-toast";
import { Store } from "../store/store";
import { removeMessage, removeError } from "../actions/messageActions";
import * as colors from "../styles/colors";

export const showInfoToast = message => {
  Toast.show(message, {
    duration: Toast.durations.LONG,
    position: Toast.positions.BOTTOM,
    shadow: true,
    animation: true,
    hideOnPress: true,
    delay: 0,
    backGroundColor: colors.PRIMARY_COLOR,
    shadowColor: colors.SECONDARY_COLOR,
    textColor: colors.TITLE_COLOR,
    onHide: () => {
      Store.dispatch(removeMessage());
    }
  });
};

export const showErrorToast = error => {
  Toast.show(error.toString(), {
    duration: Toast.durations.LONG,
    position: Toast.positions.BOTTOM,
    shadow: true,
    animation: true,
    hideOnPress: true,
    delay: 0,
    backgroundColor: "red",
    textColor: colors.TITLE_COLOR,
    onHide: () => {
      Store.dispatch(removeError());
    }
  });
};
