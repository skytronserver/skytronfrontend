// userReducer.js
import { SET_USER, SET_LOADING, SET_ERROR, VERIFY_OTP } from '../store/constant';

// Hydrate permissions from storage so they survive page refreshes
const storedPermissions = (() => {
  try {
    const raw = sessionStorage.getItem('userPermissions') || localStorage.getItem('userPermissions');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
})();

const initialState = {
  user: {
    isAuthenticated: false,
    token: null,
    email: null,
    otpToken: null,
  },
  cookiesData: null,
  permissions: storedPermissions, // { [module_code]: { view, create, update, delete, filter, menu, data_scope } }
  loading: false,
  error: {
    message: null,
    code: null,
  },
};

const loginReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_USER:
      return {
        ...state,
        user: action.payload,
      };
    case VERIFY_OTP: {
      return {
        ...state,
        user: action.payload,
      };
    }
    case 'LOGOUT_USER': {
      return {
        ...state,
        user: action.payload,
        permissions: null,
      };
    }
    case SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case 'SET_LOGIN_INFO':
      return {
        ...state,
        cookiesData: action.payload,
      };
    case 'SET_PERMISSIONS':
      return {
        ...state,
        permissions: action.payload,
      };
    case SET_ERROR:
      return {
        ...state,
        error: action.payload,
      };
    default:
      return state;
  }
};

export default loginReducer;
