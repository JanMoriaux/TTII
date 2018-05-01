//@flow
import * as types from "../actions/types";

const initialState = {
  apiKey: null,
  isAuthenticating: false
};

const UserReducer = (state = initialState, action) => {
  switch (action.type) {
    case types.REQUEST_AUTH:
      return Object.assign({}, state, {
        isAuthenticating: true,
        apiKey: null
      });
    case types.AUTH_SUCCESS:
      return Object.assign({}, state, {
        isAuthenticating: false,
        apiKey: action.data
      });
    case types.AUTH_FAILED:
      return Object.assign({}, state, {
        isAuthenticating: false,
        apiKey: null
      });
    case types.LOGOUT: {
      return Object.assign({}, state, {
        apiKey: null
      });
    }
    default:
      return state;
  }
};

export default UserReducer;
