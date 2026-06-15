import {
    FETCH_VEHICLE_CATEGORY,
    FETCH_VEHICLE_CATEGORY_CODE,
    FETCH_STATE_LIST,
    FETCH_DISTRICT_LIST,
    FETCH_FIRMWARE_LIST,
    FETCH_HP_FREQUENCY_LIST,
    FETCH_OTA_LIST,
    FETCH_IP_SETTING_LIST,
    FETCH_PERMIT_CONDITION_LIST,
    FETCH_PERMIT_MASTER_LIST
  } from '../actions/settingAction';

  const initialState = {
    vehicleCategoryList:[],
    vehicleCategoryCodeList:[],
    stateList:[],
    districtList:[],
    firmwareList:[],
    frequencyList:[],
    otaList:[],
    ipSettingList:[],
    permitConditionList:[],
    permitMasterList:[],
  };
  
  const settingReducer = (state = initialState, action) => {
    switch (action.type) {
      case FETCH_VEHICLE_CATEGORY:
        return {
            ...state,
            vehicleCategoryList:action.payload,
        }
      case FETCH_VEHICLE_CATEGORY_CODE:
        return {
            ...state,
            vehicleCategoryCodeList:action.payload,
        }
     case FETCH_STATE_LIST:
        return {
            ...state,
            stateList:action.payload,
        }
      case FETCH_DISTRICT_LIST:
        return {
          ...state,
          districtList:action.payload,
        }
        case FETCH_FIRMWARE_LIST:
        return {
            ...state,
            firmwareList:action.payload,
        }
      case FETCH_HP_FREQUENCY_LIST:
        return {
          ...state,
          frequencyList:action.payload,
        }
      case FETCH_OTA_LIST:
        return {
          ...state,
          otaList:action.payload,
        }
      case FETCH_IP_SETTING_LIST:
        return {
          ...state,
          ipSettingList:action.payload
        }
      case FETCH_PERMIT_CONDITION_LIST:
        return {
          ...state,
          permitConditionList:action.payload,
        }
      case FETCH_PERMIT_MASTER_LIST:
        return {
          ...state,
          permitMasterList:action.payload,
        }
      default:
        return state;
    }
  };
  
  export default settingReducer;
  