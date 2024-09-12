const initialState = {
  sosAdmin: [],
  dtoList: [],
  noticeList: [],
  error: null,
};
const listReducer = (state = initialState, action) => {
  switch (action.type) {
    case "GET_ALL_SOS_ADMIN":
      return {
        ...state,
        sosAdmin: action.payload,
      };
    case "GET_ALL_DTO_USER":
      return {
        ...state,
        dtoList: action.payload,
      };
    case "GET_ALL_NOTICE_DATA":
      return {
        ...state,
        noticeList: action.payload,
      };
    default:
      return state;
  }
};
export default listReducer;
