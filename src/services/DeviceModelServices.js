import { getAxiosInstance } from './axiosInstance';
const getAllModels = () => {
  const http = getAxiosInstance(); 
  return http.get("/api/devicemodel/devicemodelList/");
};
const getFilterModels=(data)=>{
  const http=getAxiosInstance();
  return http.post('/api/devicemodel/devicemodelFilter/',data)
}
const getAdminAwaitingModels = () => {
  const http = getAxiosInstance(); 
  return http.get("/api/devicemodel/devicemodelAwaitingStateApproval/");
};
const getAdminAwaitingCOPModels = () => {
  const http = getAxiosInstance(); 
  return http.get("/api/devicemodel/COPAwaitingStateApproval/");
};
const getModel = (id) => {
  const http = getAxiosInstance(); 
  return http.post(`api/devicemodel/devicemodelDetails/`,id);
};
const createModel = (data) => {
  const http = getAxiosInstance(); 
  return http.post("/api/devicemodel/devicemodelCreate/", data,{
    headers: {
      'Content-type': 'multipart/form-data',
    }
  });
};
const copUpload=(data)=>{
  const http = getAxiosInstance(); 
  return http.post("/api/devicemodel/COPUpload/",data,{
    headers: {
      'Content-type': 'multipart/form-data',
    }
  })
}
const updateModel = (id, updatedData) => {
  const http = getAxiosInstance(); 
  return http.put(`/api/update_device_model/${id}`, updatedData);
};
const deleteModel = (id) => {
  const http = getAxiosInstance(); 
  return http.delete(`/api/delete_device_model/${id}`);
};
const getDeviceList=(data)=>{  
  const http = getAxiosInstance();         // show device
  return http.post("/api/devicestock/deviceStockFilter/",data)            
}
const DeviceModelServices = {
getAllModels,
getAdminAwaitingModels,
getAdminAwaitingCOPModels,
getModel,
createModel,
updateModel,
copUpload,
deleteModel,
getDeviceList,
getFilterModels
};

export default DeviceModelServices;
