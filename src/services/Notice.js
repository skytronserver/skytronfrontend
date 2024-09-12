import { getAxiosInstance } from "./axiosInstance";
const create = (data) => {
  const http = getAxiosInstance();
  return http.post("/api/notice/create/", data, {
    headers: {
      "Content-type": "multipart/form-data",
    },
  });
};
const update = (data) => {
  const http = getAxiosInstance();
  return http.post("/api/notice/update/", data, {
    headers: {
      "Content-type": "multipart/form-data",
    },
  });
};
const list = () => {
  const http = getAxiosInstance();
  return http.post("/api/notice/list/");
};
const filter = (data) => {
  const http = getAxiosInstance();
  return http.post("/api/notice/filter/", data);
};
const remove = (data) => {
  const http = getAxiosInstance();
  return http.post("/api/notice/delete/", data);
};
const Notice = {
  create,
  update,
  list,
  filter,
  remove,
};

export default Notice;
