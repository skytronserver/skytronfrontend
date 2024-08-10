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
const tagApprovedOwnerApproval = () => {
  const http = getAxiosInstance();
  return http.get(`/api/tag/TagAwaitingActivateTag/`);
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
  return http.post('/api/tag/upload_receiptPDF/',data);
}
const downloadTagReceipt=(data)=>{
  const http=getAxiosInstance();
  return http.post('/api/tag/download_receiptPDF/',data);
}
const vahanVerificationApi=(data)=>{
  const http=getAxiosInstance();
  return http.post('/api/tag/GetVahanAPIInfo/',data);
}
const activateTag=(data)=>{
  const http=getAxiosInstance();
  return http.post('/api/tag/ActivateTag/',data);
}
const getTagAwaitingOwnerApprovalFinal=(data)=>{
  const http=getAxiosInstance();
  return http.get('/api/tag/TagAwaitingOwnerApprovalFinal/',{
    params:{
      device_id:data.device_id
    }
    }
    );
}
const sendTagSendOwnerOtpFinal=(data)=>{
  const http=getAxiosInstance();
  return http.post('/api/tag/TagSendOwnerOtpFinal/',data);
}
const verifyTagVerifyOwnerOtpFinal=(data)=>{
  const http=getAxiosInstance();
  return http.post('/api/tag/TagVerifyOwnerOtpFinal/',data);
}
const getTagStatus=(data)=>{
  const http=getAxiosInstance();
  return http.post('/api/tag/tag_status/',data);
}
const TaggingService = {
    tagDeviceToVehicle,
    tagAwaitingOwnerApproval,
    tagSendOwnerOtp,
    tagVerifyOwnerOtp,
    tagVerifyDealerOtp,
    uploadTagReceipt,
    downloadTagReceipt,
    vahanVerificationApi,
    tagApprovedOwnerApproval,
    activateTag,
    getTagAwaitingOwnerApprovalFinal,
    sendTagSendOwnerOtpFinal,
    verifyTagVerifyOwnerOtpFinal,
    getTagStatus
};

export default TaggingService;
