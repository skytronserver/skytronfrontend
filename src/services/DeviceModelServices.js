import http from "./http-common";
const getAllModels = () => {
  return http.get("/api/devicemodel/devicemodelList/");
};
const getAdminAwaitingModels = () => {
  return http.get("/api/devicemodel/devicemodelAwaitingStateApproval/");
};
const getAdminAwaitingCOPModels = () => {
  return http.get("/api/devicemodel/COPAwaitingStateApproval/");
};
const getModel = (id) => {
  return http.post(`api/devicemodel/devicemodelDetails/`,id);
};
const createModel = (data) => {
  return http.post("/api/create_device_model/", data);
};
const copUpload=(data)=>{
  return http.post("/api/devicemodel/COPUpload/",data,{
    headers: {
      'Content-type': 'multipart/form-data',
    }
  })
}
const updateModel = (id, updatedData) => {
  return http.put(`/api/update_device_model/${id}`, updatedData);
};
const deleteModel = (id) => {
  return http.delete(`/api/delete_device_model/${id}`);
};
const getDeviceList=()=>{          // show device
  return http.post("/api/devicestock/deviceStockFilter/")            
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
getDeviceList
};

export default DeviceModelServices;
