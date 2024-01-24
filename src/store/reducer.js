import { combineReducers } from 'redux';

// reducer import
import customizationReducer from './customizationReducer';
import dataReducer from '../reducers/dataReducer';
import loginReducer from '../reducers/loginReducer';
import userDataReducer from '../reducers/userDataReducer';
// ==============================|| COMBINE REDUCER ||============================== //

const reducer = combineReducers({
  customization: customizationReducer,
  userData:dataReducer,
  login:loginReducer,
  users:userDataReducer
});

export default reducer;
