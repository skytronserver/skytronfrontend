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
const uploadTagReceipt=(data)=>{
  const http=getAxiosInstance();
  return http.post('/api/tag/upload_receiptPDF/',data,{
    headers: {
      "Content-type": "multipart/form-data",
    },
  });
}
const downloadTagReceipt=(data)=>{
  const http=getAxiosInstance();
  return http.post('/api/tag/download_receiptPDF/',data);
}
const TaggingService = {
    tagDeviceToVehicle,
    tagAwaitingOwnerApproval,
    tagSendOwnerOtp,
    tagVerifyOwnerOtp,
    tagVerifyDealerOtp,
    uploadTagReceipt,
    downloadTagReceipt
};

export default TaggingService;
