import { getAxiosInstance } from './axiosInstance'; 
const copUpload = (data) => {
  const http = getAxiosInstance(); 
    return http.post("/api/kyc_upload/",data);
  };
const getUsers=()=>{
  const http = getAxiosInstance(); 
    return http.get("/users")
}
const DummyServices = {
    copUpload,
    getUsers
  };
  
  export default DummyServices;