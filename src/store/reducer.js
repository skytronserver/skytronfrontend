import { combineReducers } from 'redux';

// reducer import
import customizationReducer from './customizationReducer';
import dataReducer from '../reducers/dataReducer';
import loginReducer from '../reducers/loginReducer';
import userDataReducer from '../reducers/userDataReducer';
import deviceModelReducer from '../reducers/deviceModelReducer'
import stockReducer from "../reducers/stockReducer"
// ==============================|| COMBINE REDUCER ||============================== //

const reducer = combineReducers({
  customization: customizationReducer,
  userData:dataReducer,
  login:loginReducer,
  users:userDataReducer,
  deviceModel:deviceModelReducer,
  stock:stockReducer
});

export default reducer;
