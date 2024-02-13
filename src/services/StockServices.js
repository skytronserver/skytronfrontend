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

const StockServices = {
    getBulkStocks,
    stockFilter,
    stockAssignToRetailer,
    createStock,
    createBulkStock,
};

export default StockServices;
