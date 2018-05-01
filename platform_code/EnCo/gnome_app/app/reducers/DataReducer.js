//@flow
import * as types from "../actions/types";

const initialState = {
  latest: {
    temp: [],
    hum: [],
    soilcap: [],
    light: [],
    air: []
  },
  history: {
    temp: [],
    hum: [],
    soilcap: [],
    light: [],
    air: []
  },
  isFetchingHistory: {
    temp: false,
    hum: false,
    soilcap: false,
    light: false,
    air: false
  },
  isFetchingLatest: {
    temp: false,
    hum: false,
    soilcap: false,
    light: false,
    air: false
  },
  isUpdatingHistory: {
    temp: false,
    hum: false,
    soilcap: false,
    light: false,
    air: false
  },
  isUpdatingLatest: {
    temp: false,
    hum: false,
    soilcap: false,
    light: false,
    air: false
  },
  from: "1w"
};

const DataReducer = (state = initialState, action) => {
  let updatingHistory;
  let updatingLatest;
  if (action.sensor) {
    updatingHistory = state.history[`${action.sensor}`].length > 0;
    updatingLatest = state.latest[`${action.sensor}`].length > 0;
  }
  let newState;
  let fetchState;

  switch (action.type) {
    case types.REQUEST_LATEST:
      if (updatingLatest) {
        fetchState = Object.assign({}, state.isUpdatingLatest);
        fetchState[`${action.sensor}`] = true;
      } else {
        fetchState = Object.assign({}, state.isFetchingLatest);
        fetchState[`${action.sensor}`] = true;
      }
      newState = updatingLatest
        ? { isUpdatingLatest: fetchState }
        : { isFetchingLatest: fetchState };
      return Object.assign({}, state, newState);
    case types.RECEIVE_LATEST:
      let sensor = action.sensor;
      let latest = Object.assign({}, state.latest);
      latest[`${sensor}`] = action.data;
      fetchState;
      if (updatingLatest) {
        fetchState = Object.assign({}, state.isUpdatingLatest);
        fetchState[`${action.sensor}`] = false;
      } else {
        fetchState = Object.assign({}, state.isFetchingLatest);
        fetchState[`${action.sensor}`] = false;
      }
      newState = updatingLatest
        ? { isUpdatingLatest: fetchState, latest: latest }
        : { isFetchingLatest: fetchState, latest: latest };
      return Object.assign({}, state, newState);
    case types.REQUEST_HISTORY:
      if (updatingHistory) {
        fetchState = Object.assign({}, state.isUpdatingHistory);
        fetchState[`${action.sensor}`] = true;
      } else {
        fetchState = Object.assign({}, state.isFetchingHistory);
        fetchState[`${action.sensor}`] = true;
      }
      newState = updatingHistory
        ? { isUpdatingHistory: fetchState }
        : { isFetchingHistory: fetchState };
      return Object.assign({}, state, newState);
    case types.RECEIVE_HISTORY: {
      let sensor = action.sensor;
      let history = Object.assign({}, state.history);
      history[`${sensor}`] = action.data;
      if (updatingHistory) {
        fetchState = Object.assign({}, state.isUpdatingHistory);
        fetchState[`${action.sensor}`] = false;
      } else {
        fetchState = Object.assign({}, state.isFetchingHistory);
        fetchState[`${action.sensor}`] = false;
      }
      newState = updatingHistory
        ? { isUpdatingHistory: fetchState, history: history, from: action.from }
        : {
            isFetchingHistory: fetchState,
            history: history,
            from: action.from
          };
      return Object.assign({}, state, newState);
    }
    case types.FETCH_DATA_FAILED: {
      return Object.assign({}, state, {
        isFetchingHistory: Object.assign({}, initialState.isFetchingHistory),
        isUpdatingHistory: Object.assign({}, initialState.isUpdatingHistory),
        isFetchingLatest: Object.assign({}, initialState.isFetchingLatest),
        isUpdatingLatest: Object.assign({}, initialState.isUpdatingLatest),
        latest: Object.assign({}, initialState.latest),
        history: Object.assign({}, initialState.history)
      });
    }
    case types.SET_DEVICE: {
      return Object.assign({}, state, initialState);
    }
    default:
      return state;
  }
};

export default DataReducer;
