import {
    FETCH_VEHICLE_CATEGORY,
    FETCH_STATE_LIST
  } from '../actions/settingAction';

  const initialState = {
    vehicleCategoryList:[],
    stateList:[],
  };
  
  const settingReducer = (state = initialState, action) => {
    switch (action.type) {
      case FETCH_VEHICLE_CATEGORY:
        return {
            ...state,
            vehicleCategoryList:action.payload,
        }
     case FETCH_STATE_LIST:
        return {
            ...state,
            stateList:action.payload,
        }
      default:
        return state;
    }
  };
  
  export default settingReducer;
  