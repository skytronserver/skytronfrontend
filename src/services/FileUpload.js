import http from './http-file';

const copUpload = (data) => {
    return http.post("/api/kyc_upload/",data);
  };
const getUsers=()=>{
    return http.get("/users")
}
const DummyServices = {
    copUpload,
    getUsers
  };
  
  export default DummyServices;