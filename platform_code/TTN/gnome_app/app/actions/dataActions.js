//@flow
import * as types from "./types";
import { fetchWrapper } from "../functions/fetch";
import { sendError } from "./messageActions";
import { Store } from "../store/store";
import { getBaseUrl } from "../functions/server";

const TIMEOUT = 10000;

/************ Synchronous Actions ***************/

export const requestHistory = () => {
  return {
    type: types.REQUEST_HISTORY
  };
};

export const requestLatest = () => {
  return {
    type: types.REQUEST_LATEST
  };
};

export const receiveHistory = (data, from) => {
  return {
    type: types.RECEIVE_HISTORY,
    data: data,
    from: from
  };
};

export const receiveLatest = data => {
  return {
    type: types.RECEIVE_LATEST,
    data: data
  };
};

//customer list fetch failed
export const fetchDataFailed = () => {
  return {
    type: types.FETCH_DATA_FAILED
  };
};

/************ Asynchronous Actions ***************/

export const fetchHistory = (devId, from) => {
  const apiKey = Store.getState().UserReducer.apiKey;
  const baseURL = getBaseUrl();
  const URL = `${baseURL}/data/${devId}?apiKey=${apiKey}&from=${from}`;
  console.log(URL);

  return function(dispatch) {
    dispatch(requestHistory());
    return fetchWrapper(TIMEOUT, fetch(URL))
      .then(response => response.json())
      .then(json => {
        if (json.error) {
          throw json.error;
        } else {
          if (json.length === 0) json = null;
          dispatch(receiveHistory(json, from));
        }
      })
      .catch(error => {
        //console.warn(error.toString());
        dispatch(fetchDataFailed());
        dispatch(sendError(error.toString()));
      });
  };
};

export const fetchLatest = devId => {
  const apiKey = Store.getState().UserReducer.apiKey;
  const baseURL = getBaseUrl();
  const URL = `${baseURL}/data/${devId}/latest?apiKey=${apiKey}`;
  console.log(URL);

  return function(dispatch) {
    dispatch(requestLatest());
    return fetchWrapper(TIMEOUT, fetch(URL))
      .then(response => response.json())
      .then(json => {
        if (json.error) {
          throw json.error;
        } else {
          if (json.length === 0) json = null;
          dispatch(receiveLatest(json));
        }
      })
      .catch(error => {
        //console.warn(error.toString());
        dispatch(fetchDataFailed());
        dispatch(sendError(error.toString()));
      });
  };
};
