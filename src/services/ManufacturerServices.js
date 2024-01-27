import http from "./http-common";

const getAll = () => {
  return http.get("/api/list_manufacturers/");
};
const getSingle = (id) => {
  return http.get(`/api/manufacturer_details/${id}`);
};
const createOne = (data) => {
  return http.post("/api/create_manufacturer/", data);
};
const updateOne = (id, updatedData) => {
  return http.put(`/api/update_manufacturer/${id}`, updatedData);
};
const deleteOne = (id) => {
  return http.delete(`/api/delete_manufacturer/${id}`);
};
const ManufacturerServices = {
  getAll,
  getSingle,
  createOne,
  updateOne,
  deleteOne,
};

export default ManufacturerServices;
