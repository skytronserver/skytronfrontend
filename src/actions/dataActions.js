// src/actions/dataActions.js
export const FETCH_DATA_SUCCESS = 'FETCH_DATA_SUCCESS';
export const ADD_DATA = 'ADD_DATA';
export const UPDATE_DATA = 'UPDATE_DATA';
export const DELETE_DATA = 'DELETE_DATA';
export const FETCH_USER_DATA="FETCH_USER_DATA";

export const fetchDataSuccess = (data) => ({
  type: FETCH_DATA_SUCCESS,
  payload: data,
});

export const fetchUserData = (data) => ({
  type: FETCH_USER_DATA,
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
