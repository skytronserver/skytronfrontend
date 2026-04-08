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
  return http.post('/api/manufacturer/filter_manufacturers/?all_user=true',data);
}

const updateManufacturer = (data) => {
  const http = getAxiosInstance();
  return http.post('/api/manufacturer/update_manufacturer/', data);
}
const filterTechOnboardManufacturers = (data) => {
  const http = getAxiosInstance();
  return http.post('/api/manufacturer/filter_TechOnboardmanufacturers/', data);
}

const approveTechOnboarding = (data) => {
  const http = getAxiosInstance();
  return http.post('/api/manufacturer/approve_tech_onboarding/', data);
}

const ManufacturerServices = {
  getAll,
  getSingle,
  createOne,
  updateOne,
  deleteOne,
  findManufacturer,
  updateManufacturer,
  filterTechOnboardManufacturers,
  approveTechOnboarding,
};

export default ManufacturerServices;
