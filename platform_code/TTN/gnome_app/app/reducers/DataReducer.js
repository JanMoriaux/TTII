//@flow
import * as types from "../actions/types";

const initialState = {
  latest: null,
  history: null,
  isFetchingHistory: false,
  isFetchingLatest: false,
  isUpdatingHistory: false,
  isUpdatingLatest: false,
  from: "1w"
};

const DataReducer = (state = initialState, action) => {
  let updatingHistory = state.history !== null;
  let updatingLatest = state.latest !== null;
  let newState;

  switch (action.type) {
    case types.REQUEST_LATEST:
      newState = updatingLatest
        ? { isUpdatingLatest: true }
        : { isFetchingLatest: true };
      return Object.assign({}, state, newState);
    case types.RECEIVE_LATEST:
      return Object.assign({}, state, {
        isFetchingLatest: false,
        isUpdatingLatest: false,
        latest: action.data
      });
    case types.REQUEST_HISTORY:
      newState = updatingHistory
        ? { isUpdatingHistory: true }
        : { isFetchingHistory: true };
      return Object.assign({}, state, newState);
    case types.RECEIVE_HISTORY: {
      return Object.assign({}, state, {
        isFetchingHistory: false,
        isUpdatingHistory: false,
        history: action.data,
        from: action.from
      });
    }
    case types.FETCH_DATA_FAILED: {
      return Object.assign({}, state, {
        isFetchingHistory: false,
        isFetchingLatest: false,
        isUpdatingHistory: false,
        isUpdatingLatest: false
      });
    }
    case types.SET_DEVICE: {
      return Object.assign({}, state, {
        latest: null,
        history: null
      });
    }
    default:
      return state;
  }
};

export default DataReducer;
