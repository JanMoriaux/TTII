import * as strings from "../constants/strings";

//wrapper for adding a timeout option to the promise returned by fetch()
export function fetchWrapper(ms, promise) {
  return new Promise(function(resolve, reject) {
    setTimeout(function() {
      reject(new Error(strings.SERVER_TIMEOUT));
    }, ms);
    promise.then(resolve, reject);
  });
}