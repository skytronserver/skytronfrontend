import http from './http-common';

const dealerUser=(userData)=>{
    return http.post(`/api/dealer/create_dealer/`,userData,{
        headers: {
          'Content-type': 'multipart/form-data',
        }
      })
}
const dealerList = (id) => {
  return http.post("/api/dealer/filter_dealer/",id);
};
const assignDeviceToDealer = (data) => {
  return http.post("/api/devicestock/StockAssignToRetailer/", data);
};
const DealerServices = {
    dealerUser,dealerList,assignDeviceToDealer
  };
  
  export default DealerServices;