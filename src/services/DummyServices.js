import http from './http-common';

const getAll = () => {
    return http.get("/posts");
  };
const getUsers=()=>{
    return http.get("/users")
}
const DummyServices = {
    getAll,
    getUsers
  };
  
  export default DummyServices;