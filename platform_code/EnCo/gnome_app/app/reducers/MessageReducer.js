//@flow
import * as types from "../actions/types";

const initialState = {
  message: null,
  error: null
};

const MessageReducer = (state: {} = initialState, action: {}) => {
  switch (action.type) {
    case types.SEND_MESSAGE:
      return Object.assign({}, state, {
        message: action.data
      });
    case types.SEND_ERROR:
      return Object.assign({}, state, {
        error: action.data
      });
    case types.REMOVE_MESSAGE:
      return Object.assign({}, state, {
        message: null
      });
    case types.REMOVE_ERROR:
      return Object.assign({}, state, {
        error: null
      });
    default:
      return state;
  }
};

export default MessageReducer;