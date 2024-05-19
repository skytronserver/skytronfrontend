import { getAxiosInstance } from './axiosInstance'; 
const tagDeviceToVehicle = (data) => {
  const http = getAxiosInstance();
  return http.post("/api/tag/TagDevice2Vehicle/",data,{
    headers: {
      'Content-type': 'multipart/form-data',
    }
    });
};
const tagAwaitingOwnerApproval = () => {
  const http = getAxiosInstance();
  return http.get(`/api/tag/TagAwaitingOwnerApproval/`);
};
const tagSendOwnerOtp = (data) => {
  const http = getAxiosInstance();
  return http.post("/api/tag/TagSendOwnerOtp/", data);
};
const tagVerifyOwnerOtp = (data) => {
  const http = getAxiosInstance();
  return http.post(`/api/tag/TagVerifyOwnerOtp/`, data);
};
const tagVerifyDealerOtp = (data) => {
  const http = getAxiosInstance();
  return http.post(`/api/tag/TagVerifyDealerOtp/`,data);
};
const TaggingService = {
    tagDeviceToVehicle,
    tagAwaitingOwnerApproval,
    tagSendOwnerOtp,
    tagVerifyOwnerOtp,
    tagVerifyDealerOtp,
};

export default TaggingService;
