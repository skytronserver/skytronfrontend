import { getAxiosInstance } from './axiosInstance'; 
const createRetailer=(userData)=>{
  const http = getAxiosInstance();
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