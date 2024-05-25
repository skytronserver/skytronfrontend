import { getAxiosInstance } from './axiosInstance'; 
const getAll = () => {
  const http = getAxiosInstance();
  return http.get("/api/list_manufacturers/");
};
const getSingle = (id) => {
  const http = getAxiosInstance();
  return http.get(`/api/manufacturer_details/${id}`);
};
const createOne = (data) => {
  const http = getAxiosInstance();
  return http.post("/api/create_manufacturer/", data);
};
const updateOne = (id, updatedData) => {
  const http = getAxiosInstance();
  return http.put(`/api/update_manufacturer/${id}`, updatedData);
};
const deleteOne = (id) => {
  const http = getAxiosInstance();
  return http.delete(`/api/delete_manufacturer/${id}`);
};
const findManufacturer=(data)=>{
  const http=getAxiosInstance();
  return http.post('/api/manufacturer/filter_manufacturers/',data);
}
const ManufacturerServices = {
  getAll,
  getSingle,
  createOne,
  updateOne,
  deleteOne,
  findManufacturer,
};

export default ManufacturerServices;
