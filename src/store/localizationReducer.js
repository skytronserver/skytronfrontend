import { SET_LANGUAGE } from './actions';

const initialState = {
  language: localStorage.getItem('i18nextLng') || 'en'
};

const localizationReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_LANGUAGE:
      return {
        ...state,
        language: action.payload
      };
    default:
      return state;
  }
};

export default localizationReducer; 