// src/reducers/dataReducer.js
import {
  GET_BULK_STOCK,
  STOCK_FILTER,
  STOCK_ASSIGN_TO_RETAILER,
  CREATE_STOCK,
  CREATE_BULK_STOCK,
} from "../actions/stockActions";

const initialState = {
  stockList: [],
  stock: {},
};

const stockReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_BULK_STOCK:
      return {
        ...state,
        data: action.payload,
      };
    case CREATE_STOCK:
      return {
        ...state,
        data: [...state.stockList, action.payload],
      };
    case STOCK_FILTER:
      return state;
    case STOCK_ASSIGN_TO_RETAILER:
      return state;
    case CREATE_BULK_STOCK:
      return state;
    default:
      return state;
  }
};

export default stockReducer;
