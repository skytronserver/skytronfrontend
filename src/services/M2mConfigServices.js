import { getAxiosInstance } from "./axiosInstance";

const testM2MApiConfig = (data) => {
  const http = getAxiosInstance();

  return http.post("/api/esim-provider/m2m-config/test/", data);
};

const saveM2MApiConfig = (data) => {
  const http = getAxiosInstance();

  return http.post("/api/esim-provider/m2m-config/", data);
};

const getM2mIpScan = (provider_id, days) => {
  const http = getAxiosInstance();
  return http.get(`/api/m2m/ip-scan/?provider_id=${provider_id}&days=${days}`);
};

const M2mConfigServices = {
  testM2MApiConfig,
  saveM2MApiConfig,
  getM2mIpScan,
};

export default M2mConfigServices;