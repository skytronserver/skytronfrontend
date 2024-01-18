// src/reducers/dataReducer.js
import {
    FETCH_DATA_SUCCESS,
    ADD_DATA,
    UPDATE_DATA,
    DELETE_DATA,
    FETCH_USER_DATA
  } from '../actions/dataActions';
  
  const initialState = {
    data: [],
    userData:[]
  };
  
  const dataReducer = (state = initialState, action) => {
    switch (action.type) {
      case FETCH_DATA_SUCCESS:
        return {
          ...state,
          data: action.payload,
        };
      case FETCH_USER_DATA:
        return {
          ...state,
          userData:action.payload
        };
      case ADD_DATA:
        return {
          ...state,
          data: [...state.data, action.payload],
        };
      case UPDATE_DATA:
        return {
          ...state,
          data: state.data.map((item) =>
            item.id === action.payload.id ? action.payload : item
          ),
        };
      case DELETE_DATA:
        return {
          ...state,
          data: state.data.filter((item) => item.id !== action.payload),
        };
      default:
        return state;
    }
  };
  
  export default dataReducer;
  