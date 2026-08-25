import { getAxiosInstance } from "./axiosInstance";

const testM2MApiConfig = (data) => {
  const http = getAxiosInstance();

  return http.post("/api/esim-provider/m2m-config/test/", data);
};

const saveM2MApiConfig = (data) => {
  const http = getAxiosInstance();

  return http.post("/api/esim-provider/m2m-config/", data);
};

const M2mConfigServices = {
  testM2MApiConfig,
  saveM2MApiConfig,
};

export default M2mConfigServices;