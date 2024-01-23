// userDataActions.js
export const FETCH_USER_DATA_SUCCESS = 'FETCH_USER_DATA_SUCCESS';
export const ADD_USER = 'ADD_USER';
export const UPDATE_USER = 'UPDATE_USER';
export const DELETE_USER = 'DELETE_USER';

export const fetchUserDataSuccess = (data) => ({
  type: FETCH_USER_DATA_SUCCESS,
  payload: data,
});

export const addUser = (newData) => ({
  type: ADD_USER,
  payload: newData,
});

export const updateUser = (updatedData) => ({
  type: UPDATE_USER,
  payload: updatedData,
});

export const deleteUser = (id) => ({
  type: DELETE_USER,
  payload: id,
});
