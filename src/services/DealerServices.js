import { getAxiosInstance } from './axiosInstance';  
const dealerUser=(userData)=>{
  const http = getAxiosInstance(); 
    return http.post(`/api/dealer/create_dealer/`,userData,{
        headers: {
          'Content-type': 'multipart/form-data',
        }
      })
}
const dealerList = (id) => {
  const http = getAxiosInstance(); 
  return http.post("/api/dealer/filter_dealer/",id);
};
const assignDeviceToDealer = (data) => {
  const http = getAxiosInstance(); 
  return http.post("/api/devicestock/StockAssignToRetailer/", data);
};
const DealerServices = {
    dealerUser,dealerList,assignDeviceToDealer
  };
  
  export default DealerServices;