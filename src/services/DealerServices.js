import http from './http-common';

const dealerUser=(userData)=>{
    return http.post(`api/dealer/create_dealer/`,userData,{
        headers: {
          'Content-type': 'multipart/form-data',
        }
      })
}

const DealerServices = {
    dealerUser
  };
  
  export default DealerServices;