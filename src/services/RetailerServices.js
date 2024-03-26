import http from './http-common';

const createRetailer=(userData)=>{
    return http.post(`api/create_retailer/`,userData,{
        headers: {
          'Content-type': 'multipart/form-data',
        }
      })
}

const RetailerServices = {
    createRetailer
  };
  
  export default RetailerServices;