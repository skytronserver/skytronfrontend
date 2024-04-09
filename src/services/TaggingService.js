import http from "./http-common";

const tagDeviceToVehicle = (data) => {
  return http.post("/api/tag/TagDevice2Vehicle/",data,{
    headers: {
      'Content-type': 'multipart/form-data',
    }
    });
};
const tagAwaitingOwnerApproval = () => {
  return http.get(`/api/tag/TagAwaitingOwnerApproval/`);
};
const tagSendOwnerOtp = (data) => {
  return http.post("/api/tag/TagSendOwnerOtp/", data);
};
const tagVerifyOwnerOtp = (data) => {
  return http.post(`/api/tag/TagVerifyOwnerOtp/`, data);
};
const tagVerifyDealerOtp = (data) => {
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
