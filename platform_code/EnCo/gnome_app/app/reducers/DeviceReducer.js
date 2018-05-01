//@flow
import * as types from "../actions/types";

const initialState = {
  devices: null,
  isFetching: false,
  devId: null
};

const DeviceReducer = (state: {} = initialState, action: {}) => {
  switch (action.type) {
    case types.REQUEST_DEVICES:
      return Object.assign({}, state, {
        isFetching: true
      });
    case types.RECEIVE_DEVICES:
      return Object.assign({}, state, {
        isFetching: false,
        devices: action.data
      });
    case types.SET_DEVICE:
      return Object.assign({}, state, {
        devId: action.data
      });
    case types.FETCH_DEVICES_FAILED: {
      return Object.assign({}, state, {
        isFetching: false
      });
    }
    default:
      return state;
  }
};

export default DeviceReducer;
