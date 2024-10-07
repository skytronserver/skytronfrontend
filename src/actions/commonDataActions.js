// commonDataActions.js
export const FETCH_DATA = "FETCH_DATA";
export const ADD_DATA = "ADD_DATA";
export const UPDATE_DATA = "UPDATE_DATA";
export const DELETE_DATA = "DELETE_DATA";
export const GET_DATA = "GET_DATA";
export const GET_AWAITING_VEHICLE_TAG = "GET_AWAITING_VEHICLE_TAG";
export const GET_LIVE_VEHICLE = "GET_LIVE_VEHICLE";
export const GET_ALL_SOS_CALL="GET_ALL_SOS_CALL";
export const fetchData = (data) => ({
  type: FETCH_DATA,
  payload: data,
});
export const getData = (data) => ({
  type: GET_DATA,
  payload: data,
});
export const addData = (newData) => ({
  type: ADD_DATA,
  payload: newData,
});

export const updateData = (updatedData) => ({
  type: UPDATE_DATA,
  payload: updatedData,
});

export const deleteData = (id) => ({
  type: DELETE_DATA,
  payload: id,
});

export const fetchTaggedAwaitingOwner = (data) => ({
  type: GET_AWAITING_VEHICLE_TAG,
  payload: data,
});
export const fetchLiveVehicle = (data) => ({
  type: GET_LIVE_VEHICLE,
  payload: data,
});
export const getAllSOSCall=(data)=>({
  type:GET_ALL_SOS_CALL,
  payload:data,
});
export const dealerList=(data)=>({
  type:"GET_ALL_DEALER",
  payload:data
});
export const SOSUsers=(data)=>({
  type:"GET_ALL_SOS_USER",
  payload:data
})
export const SOSAdminList=(data)=>({
  type:"GET_ALL_SOS_ADMIN",
  payload:data
})
export const allNoticeList=(data)=>({
  type:"GET_ALL_NOTICE_DATA",
  payload:data
})
export const DTOUserList=(data)=>({
  type:"GET_ALL_DTO_USER",
  payload:data
})

