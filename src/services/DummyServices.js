import { getAxiosInstance } from './axiosInstance'; 
const getAll = () => {
  const http = getAxiosInstance(); 
    return http.get("/posts");
  };
const getUsers=()=>{
  const http = getAxiosInstance(); 
    return http.get("/users")
}
const DummyServices = {
    getAll,
    getUsers
  };
  
  export default DummyServices;