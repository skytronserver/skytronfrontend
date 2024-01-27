// src/reducers/dataReducer.js
import {
  FETCH_DATA,
  ADD_DATA,
  UPDATE_DATA,
  DELETE_DATA,
  GET_DATA,
} from "../actions/commonDataActions";

const initialState = {
  dataList: [],
  singleData: {},
};

const manufacturerReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_DATA:
      return {
        ...state,
        dataList: action.payload,
      };
    case GET_DATA:
      return {
        ...state,
        singleData: action.payload,
      };
    case ADD_DATA:
      return {
        ...state,
        dataList: [...state.data, action.payload],
      };
    case UPDATE_DATA:
      return {
        ...state,
        dataList: state.data.map((item) =>
          item.id === action.payload.id ? action.payload : item
        ),
      };
    case DELETE_DATA:
      return {
        ...state,
        dataList: state.data.filter((item) => item.id !== action.payload),
      };
    default:
      return state;
  }
};

export default manufacturerReducer;
