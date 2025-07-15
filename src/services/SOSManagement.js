import { getAxiosInstance } from "./axiosInstance";
const createEmTeam = (data) => {
  const http = getAxiosInstance();
  return http.post("/api/EM/create_EMteam/", data);
};
const activateEmTeam = (data) => {
  const http = getAxiosInstance();
  return http.post("/api/EM/activate_EMteam/", data);
};
const removeEmTeam = (data) => {
  const http = getAxiosInstance();
  return http.post("/api/EM/remove_EMteam/", data);
};
const viewEmTeam = (data) => {
  const http = getAxiosInstance();
  return http.post("/api/EM/get_EMteam/", data);
};
const listEmTeam = () => {
  const http = getAxiosInstance();
  return http.post("/api/EM/list_EMteam/");
};
const editEmTeam = (data) => {
  const http = getAxiosInstance();
  return http.post("/api/EM/edit_EMteam/", data);
}
const SOSManagement = {
  createEmTeam,
  activateEmTeam,
  removeEmTeam,
  viewEmTeam,
  listEmTeam,
  editEmTeam,
};

export default SOSManagement;
