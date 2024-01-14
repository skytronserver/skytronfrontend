import { combineReducers } from 'redux';

// reducer import
import customizationReducer from './customizationReducer';
import dataReducer from '../reducers/dataReducer';
import loginReducer from '../reducers/loginReducer';
// ==============================|| COMBINE REDUCER ||============================== //

const reducer = combineReducers({
  customization: customizationReducer,
  userData:dataReducer,
  login:loginReducer
});

export default reducer;
