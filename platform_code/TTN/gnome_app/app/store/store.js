//@flow
import { createStore, applyMiddleware } from "redux";
import { AsyncStorage } from "react-native";

//redux-persist
import { persistStore } from "redux-persist";

//middleware
import thunk from "redux-thunk";
import { createLogger } from "redux-logger";

//rootreducer
import RootReducer from "../reducers/RootReducer";

const middleware = [thunk /*createLogger()*/];
export const Store = createStore(RootReducer, applyMiddleware(...middleware));
export const Persistor = persistStore(Store);
