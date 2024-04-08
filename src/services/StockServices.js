import http from "./http-common";
const getBulkStocks = () => {
  return http.get("/api/devicestock/deviceStockBulkSample/",{
    responseType: 'arraybuffer',
  });
};
const stockFilter = (data) => {
  return http.post("/api/devicestock/deviceStockFilter/",data);
};
const stockAssignToRetailer = (data) => {
  return http.post("/api/devicestock/StockAssignToRetailer/",data);
};
const createStock = (data) => {
  return http.post("api/devicestock/deviceStockCreate/", data);
};
const createBulkStock=(data)=>{
  return http.post("/api/devicestock/deviceStockCreateBulk/",data,{
    headers: {
      'Content-type': 'multipart/form-data',
    }
  })
}
const getAvailableDeviceList=()=>{
  return http.get("/api/sell/SellListAvailableDeviceStock/");
}
const markAsDefective=(id)=>{
  const device={
    device_id:id
  }
  return http.patch("/api/sell/mark_device_defective/",device);
}
const returnToManufacturer=(id)=>{
  const device={
    device_id:id
  }
  return http.patch("/api/sell/return_to_manufacturer/",device);
}
const StockServices = {
    getBulkStocks,
    stockFilter,
    stockAssignToRetailer,
    createStock,
    createBulkStock,
    getAvailableDeviceList,
    markAsDefective,
    returnToManufacturer
};

export default StockServices;
