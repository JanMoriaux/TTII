//@flow
import * as types from "./types";
import { fetchWrapper } from "../functions/fetch";
import { sendError } from "./messageActions";
import { Store } from "../store/store";
import { getBaseUrl } from "../functions/server";

const TIMEOUT = 10000;

/************ Synchronous Actions ***************/

export const requestHistory = (sensor) => {
  return {
    type: types.REQUEST_HISTORY,
    sensor: sensor
  };
};

export const requestLatest = (sensor) => {
  return {
    type: types.REQUEST_LATEST,
    sensor: sensor
  };
};

export const receiveHistory = (data, from, sensor) => {
  return {
    type: types.RECEIVE_HISTORY,
    data: data,
    from: from,
    sensor: sensor
  };
};

export const receiveLatest = (data, sensor) => {
  return {
    type: types.RECEIVE_LATEST,
    data: data,
    sensor: sensor
  };
};

//customer list fetch failed
export const fetchDataFailed = () => {
  return {
    type: types.FETCH_DATA_FAILED
  };
};

/************ Asynchronous Actions ***************/

export const fetchHistory = (devId, from, sensor) => {
  const apiKey = Store.getState().UserReducer.apiKey;
  const baseURL = getBaseUrl();
  const URL = `${baseURL}/data/${devId}/${sensor}?apiKey=${apiKey}&from=${from}`;
  console.log(URL);

  return function(dispatch) {
    dispatch(requestHistory(sensor));
    return fetchWrapper(TIMEOUT, fetch(URL))
      .then(response => response.json())
      .then(json => {
        if (json.error) {
          throw json.error;
        } else {
          if (json.length === 0) json = null;
          dispatch(receiveHistory(json, from, sensor));
        }
      })
      .catch(error => {
        //console.warn(error.toString());
        dispatch(fetchDataFailed());
        dispatch(sendError(error.toString()));
      });
  };
};

export const fetchLatest = (devId, sensor) => {
  const apiKey = Store.getState().UserReducer.apiKey;
  const baseURL = getBaseUrl();
  const URL = `${baseURL}/data/${devId}/${sensor}/latest?apiKey=${apiKey}`;

  return function(dispatch) {
    dispatch(requestLatest(sensor));
    return fetchWrapper(TIMEOUT, fetch(URL))
      .then(response => response.json())
      .then(json => {
        if (json.error) {
          throw json.error;
        } else {
          if (json.length === 0) json = null;
          dispatch(receiveLatest(json, sensor));
        }
      })
      .catch(error => {
        //console.warn(error.toString());
        dispatch(fetchDataFailed());
        dispatch(sendError(error.toString()));
      });
  };
};
