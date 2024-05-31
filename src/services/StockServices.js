import { getAxiosInstance } from './axiosInstance'; 
const getBulkStocks = () => {
  const http = getAxiosInstance();
  return http.get("/api/devicestock/deviceStockBulkSample/", {
    responseType: "arraybuffer",
  });
};
const stockFilter = (data) => {
  const http = getAxiosInstance();
  return http.post("/api/devicestock/deviceStockFilter/", data);
};
const stockAssignToRetailer = (data) => {
  const http = getAxiosInstance();
  return http.post("/api/devicestock/StockAssignToRetailer/", data);
};
const createStock = (data) => {
  const http = getAxiosInstance();
  return http.post("api/devicestock/deviceStockCreate/", data);
};
const createBulkStock = (data) => {
  const http = getAxiosInstance();
  return http.post("/api/devicestock/deviceStockCreateBulk/", data, {
    headers: {
      "Content-type": "multipart/form-data",
    },
  });
};
const getAvailableDeviceList = (data) => {
  const http = getAxiosInstance();
  return http.get("/api/sell/SellListAvailableDeviceStock/",data);
};
const getProviderList = () => {
  const http = getAxiosInstance();
  return http.get("/api/devicestock/esim_provider_list/");
};
const devicePatch = (id,action)=>{
  const http = getAxiosInstance();
  const device = {
    device_id: id,
  };
  switch (action){
    case 'defective' : return http.patch("/api/sell/mark_device_defective/", device);
    case 'return':return http.patch("/api/sell/return_to_manufacturer/", device);
    case 'fitment': return http.patch("/api/sell/SellFitDevice/", device);
    case 'configSMS':return http.patch("/api/sell/configure_sms_gateway/", device);
    case 'configSOS':return http.patch("/api/sell/configure_sos_gateway/", device);
    case 'configIP':return http.patch("/api/sell/configure_ip_port/", device);
    case 'eSimActivated':return http.patch("/api/sell/confirm_esim_activation/", device);
    case 'eSimActivate': return http.patch("/api/sell/activate_esim_request/", device);
    default : return http.get("/api/sell/SellListAvailableDeviceStock/",device);
  }
}
const markAsDefective = (id) => {
  const http = getAxiosInstance();
  const device = {
    device_id: id,
  };
  return http.patch("/api/sell/mark_device_defective/", device);
};
const returnToManufacturer = (id) => {
  const http = getAxiosInstance();
  const device = {
    device_id: id,
  };
  return http.patch("/api/sell/return_to_manufacturer/", device);
};

const sellFitDevice = (id) => {
  const http = getAxiosInstance();
  const device = {
    device_id: id,
  };
  return http.patch("/api/sell/SellFitDevice/", device);
};
const configureSMSGateway = (id) => {
  const http = getAxiosInstance();
  const device = {
    device_id: id,
  };
  return http.patch("/api/sell/configure_sms_gateway/", device);
};

const configureSOSGateway = (id) => {
  const http = getAxiosInstance();
  const device = {
    device_id: id,
  };
  return http.patch("/api/sell/configure_sos_gateway/", device);
};

const configureIPPort = (id) => {
  const http = getAxiosInstance();
  const device = {
    device_id: id,
  };
  return http.patch("/api/sell/configure_ip_port/", device);
};
const configureESimAct = (id) => {
  const http = getAxiosInstance();
  const device = {
    device_id: id,
  };
  return http.patch("/api/sell/confirm_esim_activation/", device);
};
const activateEsimReq = (id) => {
  const http = getAxiosInstance();
  const device = {
    device_id: id,
  };
  return http.patch("/api/sell/activate_esim_request/", device);
};
const StockServices = {
  getBulkStocks,
  stockFilter,
  stockAssignToRetailer,
  createStock,
  createBulkStock,
  getAvailableDeviceList,
  markAsDefective,
  returnToManufacturer,
  sellFitDevice,
  configureSMSGateway,
  configureSOSGateway,
  configureIPPort,
  configureESimAct,
  activateEsimReq,
  devicePatch,
  getProviderList
};

export default StockServices;
