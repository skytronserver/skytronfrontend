import http from "./http-common";

const deviceAddOtp = (deviceOtpData) => {
  return http.post(
    "/api/devicemodel/devicemodelManufacturerOtpVerify/",
    deviceOtpData
  );
};
const AdminDeviceSendOtp = (deviceId) => {
  return http.post("/api/devicemodel/devicemodelSendStateAdminOtp/", deviceId);
};
const AdminDeviceVerifyOtp = (deviceOtp) => {
  return http.post(
    "/api/devicemodel/devicemodleVerifyStateAdminOtp/",
    deviceOtp
  );
};
const AdminCOPDeviceSendOtp = (deviceId) => {
  return http.post("/api/devicemodel/COPSendStateAdminOtp/", deviceId);
};
const AdminCOPDeviceVerifyOtp = (deviceOtp) => {
  return http.post(
    "/api/devicemodel/COPVerifyStateAdminOtp/",
    deviceOtp
  );
};
const sendCopOTP=(data)=>{
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
