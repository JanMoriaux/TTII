//@flow
import * as types from "../actions/types";

const initialState = {
  address: null,
  port: null
};

const ServerReducer = (state: {} = initialState, action: {}) => {
  switch (action.type) {
    case types.SET_SERVER_CONFIG:
      return Object.assign({}, state, {
        address: action.data.address,
        port: action.data.port
      });

    default:
      return state;
  }
};

export default ServerReducer;
