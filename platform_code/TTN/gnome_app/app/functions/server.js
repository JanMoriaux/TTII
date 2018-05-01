import { Store } from "../store/store";

export function getBaseUrl() {
  const ServerReducer = Store.getState().ServerReducer;
  const address = ServerReducer.address;
  const port = ServerReducer.port;
  const URL = `http://${address}:${port}`;
  return URL;
}
