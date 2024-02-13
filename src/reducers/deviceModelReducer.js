// src/reducers/dataReducer.js
import {
    FETCH_DEVICE_MODEL,
    FETCH_COP_DEVICE_MODEL,
    ADD_DEVICE_MODEL,
    UPDATE_DEVICE_MODEL,
    DELETE_DEVICE_MODEL,
    GET_DEVICE_MODEL,
    GET_COP_DEVICE_MODEL,
  } from "../actions/deviceModelActions";
  
  const initialState = {
    deviceModelList: [],
    deviceCOPModelList:[],
    deviceModel: {},
  };
  
  const deviceModelReducer = (state = initialState, action) => {
    switch (action.type) {
      case FETCH_DEVICE_MODEL:
        return {
          ...state,
          deviceModelList: action.payload,
        };
        case FETCH_COP_DEVICE_MODEL:
          return {
            ...state,
            deviceCOPModelList: action.payload,
          };
      case GET_DEVICE_MODEL:
        return {
          ...state,
          deviceModel: action.payload,
        };
        case GET_COP_DEVICE_MODEL:
          return {
            ...state,
            deviceModel: state.deviceCOPModelList.find((item)=>item.id===parseInt(action.payload)),
          };
      case ADD_DEVICE_MODEL:
        return {
          ...state,
          deviceModelList: [...state.data, action.payload],
        };
      case UPDATE_DEVICE_MODEL:
        return {
          ...state,
          deviceModelList: state.data.map((item) =>
            item.id === action.payload.id ? action.payload : item
          ),
        };
      case DELETE_DEVICE_MODEL:
        return {
          ...state,
          deviceModelList: state.data.filter((item) => item.id !== action.payload),
        };
      default:
        return state;
    }
  };
  
  export default deviceModelReducer;
  