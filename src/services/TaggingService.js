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
  return http.post('/api/tag/download_receiptPDF/',data,{
    responseType: "arraybuffer",
  });
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
const getOwnerList=(data)=>{
  const http=getAxiosInstance();
  return http.post('/api/tag/tag_ownerlist/',data)
}
const untagDevice=(tagId)=>{
  const http=getAxiosInstance();
  return http.post('/api/tag/untag/',tagId);
}
const retagDevice=(tagId)=>{
  const http=getAxiosInstance();
  return http.post('/api/tag/retag/',tagId);
}
const updateTempRegistration = (data) => {
  const http = getAxiosInstance();
  return http.post('/api/tag/update-temp-registration/', data, {
    headers: {
      'Content-type': 'multipart/form-data',
    },
  });
}
const cancelTagDevice=(deviceId)=>{
  const http=getAxiosInstance();
  return http.post('/api/tag/cancelTagDevice2Vehicle/',deviceId)
}
const tagResendDealerOtp = (data) => {
  const http = getAxiosInstance();
  return http.post("/api/tag/TagResendDealerOtp/", data);
};
const tagResendOwnerOtp = (data) => {
  const http = getAxiosInstance();
  return http.post("/api/tag/TagResendOwnerOtp/", data);
};
const tagResendOwnerOtpFinal = (data) => {
  const http = getAxiosInstance();
  return http.post("/api/tag/TagResendOwnerOtpFinal/", data);
};
const gettaggedDeviceList=(data)=>{
  const http=getAxiosInstance();
  return http.post('/api/tag/StateAdmin_view_all_tagging/')
}
const sendActivationCommand = (data) => {
  const http = getAxiosInstance();
  return http.post('/api/device/send-activation-command/', data);
}
const checkActivationStatus = (params) => {
  const http = getAxiosInstance();
  return http.get('/api/device/activation-status/', { params });
}
const getPendingActivations = (params) => {
  const http = getAxiosInstance();
  return http.get('/api/device/pending-activations/', { params });
}
const getCertificateList = (params) => {
  const http = getAxiosInstance();
  return http.get('/api/device-tagging/certificate-list/', { params });
}

const TaggingService = {
    tagDeviceToVehicle,
    tagAwaitingOwnerApproval,
    tagSendOwnerOtp,
    tagVerifyOwnerOtp,
    tagVerifyDealerOtp,
    tagResendDealerOtp,
    tagResendOwnerOtp,
    tagResendOwnerOtpFinal,
    uploadTagReceipt,
    downloadTagReceipt,
    vahanVerificationApi,
    tagApprovedOwnerApproval,
    activateTag,
    getTagAwaitingOwnerApprovalFinal,
    sendTagSendOwnerOtpFinal,
    verifyTagVerifyOwnerOtpFinal,
    getTagStatus,
    getOwnerList,
    untagDevice,
    retagDevice,
    updateTempRegistration,
    cancelTagDevice,
    gettaggedDeviceList,
    sendActivationCommand,
    checkActivationStatus,
    getPendingActivations,
    getCertificateList
};

export default TaggingService;
