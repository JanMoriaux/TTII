//@flow
import * as types from "./types";
//import { URL } from "../constants/server";
import { fetchWrapper } from "../functions/fetch";
import { sendError } from "./messageActions";
import { Store } from "../store/store";
import { getBaseUrl } from "../functions/server";

const TIMEOUT = 10000;

/************ Synchronous Actions ***************/
export const requestDevices = () => {
  return {
    type: types.REQUEST_DEVICES
  };
};

export const receiveDevices = devices => {
  return {
    type: types.RECEIVE_DEVICES,
    data: devices
  };
};

export const setDevice = devId => {
  return {
    type: types.SET_DEVICE,
    data: devId
  };
};

export const fetchDevicesFailed = () => {
  return {
    type: types.FETCH_DEVICES_FAILED
  };
};

/************ Asynchronous Actions ***************/

export const fetchDevices = () => {
  const apiKey = Store.getState().UserReducer.apiKey;
  const baseURL = getBaseUrl();
  const URL = `${baseURL}/devices?apiKey=${apiKey}`;
  console.log(URL);

  return function(dispatch) {
    dispatch(requestDevices());
    return fetchWrapper(TIMEOUT, fetch(URL))
      .then(response => response.json())
      .then(json => {
        if (json.error) throw json.error;
        else dispatch(receiveDevices(json));
      })
      .catch(error => {
        //console.warn(error.toString());
        dispatch(fetchDevicesFailed());
        dispatch(sendError(error.toString()));
      });
  };
};
