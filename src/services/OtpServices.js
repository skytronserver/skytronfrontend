import { getAxiosInstance } from './axiosInstance'; 
const deviceAddOtp = (deviceOtpData) => {
  const http = getAxiosInstance();
  return http.post(
    "/api/devicemodel/devicemodelManufacturerOtpVerify/",
    deviceOtpData
  );
};
const AdminDeviceSendOtp = (deviceId) => {
  const http = getAxiosInstance();
  return http.post("/api/devicemodel/devicemodelSendStateAdminOtp/", deviceId);
};
const AdminDeviceVerifyOtp = (deviceOtp) => {
  const http = getAxiosInstance();
  return http.post(
    "/api/devicemodel/devicemodleVerifyStateAdminOtp/",
    deviceOtp
  );
};
const AdminCOPDeviceSendOtp = (deviceId) => {
  const http = getAxiosInstance();
  return http.post("/api/devicemodel/COPSendStateAdminOtp/", deviceId);
};
const AdminCOPDeviceVerifyOtp = (deviceOtp) => {
  const http = getAxiosInstance();
  return http.post(
    "/api/devicemodel/COPVerifyStateAdminOtp/",
    deviceOtp
  );
};
const sendCopOTP=(data)=>{
  const http = getAxiosInstance();
  return http.post("/api/devicemodel/COPManufacturerOtpVerify/",data);
}
const OtpServices = {
  deviceAddOtp,
  AdminDeviceSendOtp,
  AdminDeviceVerifyOtp,
  AdminCOPDeviceSendOtp,
  AdminCOPDeviceVerifyOtp,
  sendCopOTP
};

export default OtpServices;
