// commonDataActions.js
export const FETCH_DATA = "FETCH_DATA";
export const ADD_DATA = "ADD_DATA";
export const UPDATE_DATA = "UPDATE_DATA";
export const DELETE_DATA = "DELETE_DATA";
export const GET_DATA = "GET_DATA";
export const GET_AWAITING_VEHICLE_TAG = "GET_AWAITING_VEHICLE_TAG";
export const GET_LIVE_VEHICLE = "GET_LIVE_VEHICLE";
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
