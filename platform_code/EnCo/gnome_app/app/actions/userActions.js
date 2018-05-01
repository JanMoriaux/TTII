//@flow
import * as types from "./types";
import { fetchWrapper } from "../functions/fetch";
import { sendError, sendMessage } from "./messageActions";
import * as strings from "../constants/strings";
import { getBaseUrl } from "../functions/server";

const TIMEOUT = 10000;

/************ Synchronous Actions ***************/

export const requestAuth = () => {
  return {
    type: types.REQUEST_AUTH
  };
};

export const authSuccess = apiKey => {
  return {
    type: types.AUTH_SUCCESS,
    data: apiKey
  };
};

export const authFailed = error => {
  return {
    type: types.AUTH_FAILED,
    data: error
  };
};

export const logout = () => {
  return {
    type: types.LOGOUT
  };
};

/************ Asynchronous Actions ***************/

export const authenticate = (username, password, navigation) => {
  let creds = { username: username, password: password };
  const baseURL = getBaseUrl();
  const URL = `${baseURL}/users/login`;

  return function(dispatch) {
    dispatch(requestAuth());
    return fetchWrapper(
      TIMEOUT,
      fetch(URL, {
        method: "POST",
        body: JSON.stringify(creds),
        headers: new Headers({
          "Content-Type": "application/json"
        })
      })
    )
      .then(response => response.json())
      .then(json => {
        if (json.error) throw json.error;
        else {
          dispatch(authSuccess(json.apiKey));
          dispatch(sendMessage(strings.AUTH_SUCCEEDED));
          navigation.navigate("MainFlow");
        }
      })
      .catch(error => {
        //console.warn(error.toString());
        dispatch(authFailed(error.toString()));
        dispatch(sendError(error.toString()));
      });
  };
};
