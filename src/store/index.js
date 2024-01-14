import { createStore,applyMiddleware,compose } from "redux";
import reducer from "./reducer";
import thunk from 'redux-thunk'
// ==============================|| REDUX - MAIN STORE ||============================== //
const middleware = [thunk];

const composeEnhancers =
  (typeof window !== 'undefined' &&
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) ||
  compose;

const store = createStore(
  reducer,
  composeEnhancers(applyMiddleware(...middleware))
);
const persister = "Free";

export { store, persister };
