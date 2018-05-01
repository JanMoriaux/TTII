//redux & redux-persist
import { combineReducers } from "redux";
import { persistReducer } from "redux-persist";
import { AsyncStorage } from "react-native";
import autoMergeLevel2 from "redux-persist/lib/stateReconciler/autoMergeLevel2";

//reducers
import DeviceReducer from "./DeviceReducer";
import DataReducer from "./DataReducer";
import UserReducer from "./UserReducer";
import ServerReducer from "./ServerReducer";
import MessageReducer from "./MessageReducer";

const rootPersistConfig = {
  key: "root",
  storage: AsyncStorage,
  stateReconciler: autoMergeLevel2,
  blacklist: ["DeviceReducer", "DataReducer", "MessageReducer", "UserReducer"]
};

const devicePersistConfig = {
  key: "DeviceReducer",
  storage: AsyncStorage,
  stateReconciler: autoMergeLevel2,
  whitelist: ["devices"]
};

const dataPersistConfig = {
  key: "DataReducer",
  storage: AsyncStorage,
  stateReconciler: autoMergeLevel2,
  whitelist: ["latest", "history", "from"]
};

const userPersistConfig = {
  key: "UserReducer",
  storage: AsyncStorage,
  stateReconciler: autoMergeLevel2,
  whitelist: ["apiKey"]
};

const serverPersistConfig = {
  key: "ServerReducer",
  storage: AsyncStorage,
  stateReconciler: autoMergeLevel2,
  whitelist: ["address", "port"]
};

const RootReducer = combineReducers({
  DeviceReducer: persistReducer(devicePersistConfig, DeviceReducer),
  DataReducer: persistReducer(dataPersistConfig, DataReducer),
  UserReducer: persistReducer(userPersistConfig, UserReducer),
  ServerReducer: persistReducer(serverPersistConfig, ServerReducer),
  MessageReducer: MessageReducer
});

export default persistReducer(rootPersistConfig, RootReducer);
