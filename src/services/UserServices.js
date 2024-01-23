import http from './http-common';

const getAll = () => {
    return http.get("/posts");
  };
const getUsers=()=>{
    return http.get("/users")
}
const getRegisteredUsers=()=>{
    return http.get("/api/get_list/")
}
const UserServices = {
    getAll,
    getUsers,
    getRegisteredUsers
  };
  
  export default UserServices;