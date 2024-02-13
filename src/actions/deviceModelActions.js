// deviceModelActions.js
export const FETCH_DEVICE_MODEL = 'FETCH_DEVICE_MODEL';
export const FETCH_COP_DEVICE_MODEL = 'FETCH_COP_DEVICE_MODEL';
export const ADD_DEVICE_MODEL = 'ADD_DEVICE_MODEL';
export const UPDATE_DEVICE_MODEL = 'UPDATE_DEVICE_MODEL';
export const DELETE_DEVICE_MODEL = 'DELETE_DEVICE_MODEL';
export const GET_DEVICE_MODEL='GET_DEVICE_MODEL';
export const GET_COP_DEVICE_MODEL='GET_COP_DEVICE_MODEL';

export const fetchDeviceModels = (data) => ({
  type: FETCH_DEVICE_MODEL,
  payload: data,
});
export const fetchCOPDeviceModels = (data) => ({
  type: FETCH_COP_DEVICE_MODEL,
  payload: data,
});
export const getDeviceModel = (data) => ({
    type: GET_DEVICE_MODEL,
    payload: data,
  });
export const getCOPDeviceModel = (data) => ({
    type: GET_COP_DEVICE_MODEL,
    payload: data,
  });
export const addDeviceModel = (newData) => ({
  type: ADD_DEVICE_MODEL,
  payload: newData,
});

export const updateDeviceModel = (updatedData) => ({
  type: UPDATE_DEVICE_MODEL,
  payload: updatedData,
});

export const deleteDeviceModel = (id) => ({
  type: DELETE_DEVICE_MODEL,
  payload: id,
});
