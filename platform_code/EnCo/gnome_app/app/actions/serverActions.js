//@flow
import * as types from "./types";

/************ Synchronous Actions ***************/

export const setConfiguration = config => {
  return {
    type: types.SET_SERVER_CONFIG,
    data: config
  };
};
