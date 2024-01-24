// src/reducers/dataReducer.js
import {
  FETCH_USER_DATA_SUCCESS,
  ADD_USER,
  UPDATE_USER,
  DELETE_USER,
  FETCH_SINGLE_USER
} from "../actions/userDataActions";

const initialState = {
  registeredUser: [],
  singleUser:{},
};

const userDataReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_USER_DATA_SUCCESS:
      return {
        ...state,
        registeredUser: action.payload,
      };
    case FETCH_SINGLE_USER:
        return {
            ...state,
            singleUser:action.payload
        }
    case ADD_USER:
      return {
        ...state,
        registeredUser: [...state.data, action.payload],
      };
    case UPDATE_USER:
      return {
        ...state,
        registeredUser: state.data.map((item) =>
          item.id === action.payload.id ? action.payload : item
        ),
      };
    case DELETE_USER:
      return {
        ...state,
        registeredUser: state.data.filter((item) => item.id !== action.payload),
      };
    default:
      return state;
  }
};

export default userDataReducer;
