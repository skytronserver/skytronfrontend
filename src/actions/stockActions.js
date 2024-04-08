// deviceModelActions.js
export const GET_BULK_STOCK = 'GET_BULK_STOCK';
export const STOCK_FILTER = 'STOCK_FILTER';
export const STOCK_ASSIGN_TO_RETAILER = 'STOCK_ASSIGN_TO_RETAILER';
export const CREATE_STOCK = 'CREATE_STOCK';
export const CREATE_BULK_STOCK = 'CREATE_BULK_STOCK';
export const GET_DEVICE_LIST_AVAILABLE='GET_DEVICE_LIST_AVAILABLE';
export const getBulkStocksAction = (data) => ({
  type: GET_BULK_STOCK,
  payload: data,
});
export const stockFilterAction = (data) => ({
  type: STOCK_FILTER,
  payload: data,
});
export const stockAssignToRetailerAction = (data) => ({
    type: STOCK_ASSIGN_TO_RETAILER,
    payload: data,
  });
export const createStockAction = (data) => ({
    type: CREATE_STOCK,
    payload: data,
  });
export const createBulkStockAction = (newData) => ({
  type: CREATE_BULK_STOCK,
  payload: newData,
});
export const getDeviceListAvailable=(data)=>({
  type:GET_DEVICE_LIST_AVAILABLE,
  payload:data
})



